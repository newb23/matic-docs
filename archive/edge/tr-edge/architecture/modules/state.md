---
id: state
title: Durum
description: Polygon Edge'in durum modülüne ilişkin açıklama.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - state
  - trie
---

**Durum** modülünün nasıl çalıştığını gerçekten anlamak için, bazı temel Ethereum kavramlarını anlamalısınız.<br />

**[Ethereum'da durum rehberini](https://ethereum.github.io/execution-specs/autoapi/ethereum/frontier/state/index.html)** okumanızı tavsiye ederiz.

## Genel Bakış {#overview}

Artık temel Ethereum kavramlarına aşina olduğumuza göre, bir sonraki genel bakış kolay olacaktır.

**Global durum ağacının** mevcut tüm Ethereum hesaplarına sahip olduğundan bahsetmiştik. <br />
Bu hesaplar, Merkle ağacının yapraklarıdır. Her yaprak, **Hesap Durumu** bilgisini kodlamıştır.

Bu, Polygon Edge'in belirli bir zaman dilimi için belirli bir Merkle ağacını almasını sağlar. <br />
Örneğin, 10. bloktaki durumun hash'ini alabiliriz.

Merkle ağacı, herhangi bir zaman diliminde ***Anlık Görüntü*** olarak adlandırılır.

**Durum ağacı** için veya **depolama ağacı** için ***Anlık Görüntüler*** alabiliriz; bunlar temelde aynıdır. <br />
Tek fark, yaprakların neyi temsil ettiğidir:

* Depolama ağacı söz konusu olduğunda, yapraklar, orada işlem yapamayacağımız veya içinde ne olduğunu bilemeyeceğimiz rastgele bir durum içerir
* Durum ağacı söz konusu olduğunda, yapraklar hesapları temsil eder

````go title="state/state.go
type State interface {
    // Gets a snapshot for a specific hash
	NewSnapshotAt(types.Hash) (Snapshot, error)

	// Gets the latest snapshot
	NewSnapshot() Snapshot

	// Gets the codeHash
	GetCode(hash types.Hash) ([]byte, bool)
}
````

 **Anlık Görüntü** arabirimi şu şekilde tanımlanır:

````go title="state/state.go
type Snapshot interface {
    // Gets a specific value for a leaf
	Get(k []byte) ([]byte, bool)

	// Commits new information
	Commit(objs []*Object) (Snapshot, []byte)
}
````

Taahhüt edilebilecek bilgiler, *Nesne yapısı* tarafından tanımlanır:

````go title="state/state.go
// Object is the serialization of the radix object
type Object struct {
	Address  types.Address
	CodeHash types.Hash
	Balance  *big.Int
	Root     types.Hash
	Nonce    uint64
	Deleted  bool

	DirtyCode bool
	Code      []byte

	Storage []*StorageObject
}
````

Merkle ağacının uygulaması *state/immutable-trie* klasöründedir. <br/>
*state/immutable-trie/state.go* dosyası, **Durum** arabirimini uygular.

*state/immutable-trie/trie.go* temel Merkle ağacı nesnesidir. Merkle ağacının, mümkün olduğunca çok bellek
kullanan optimize edilmiş bir sürümünü temsil eder.

## Yürütücü {#executor}

*state/executor.go*, Polygon Edge'in bir bloğun mevcut durumu nasıl değiştirdiğine karar vermesi için gereken tüm bilgileri
içerir. *ProcessBlock*'un uygulanması burada yer almaktadır.

*apply* yöntemi, gerçek durum geçişini yapar. Yürütücü EVM'yi çağırır.

````go title="state/executor.go"
func (t *Transition) apply(msg *types.Transaction) ([]byte, uint64, bool, error) {
	// check if there is enough gas in the pool
	if err := t.subGasPool(msg.Gas); err != nil {
		return nil, 0, false, err
	}

	txn := t.state
	s := txn.Snapshot()

	gas, err := t.preCheck(msg)
	if err != nil {
		return nil, 0, false, err
	}
	if gas > msg.Gas {
		return nil, 0, false, errorVMOutOfGas
	}

	gasPrice := new(big.Int).SetBytes(msg.GetGasPrice())
	value := new(big.Int).SetBytes(msg.Value)

	// Set the specific transaction fields in the context
	t.ctx.GasPrice = types.BytesToHash(msg.GetGasPrice())
	t.ctx.Origin = msg.From

	var subErr error
	var gasLeft uint64
	var returnValue []byte

	if msg.IsContractCreation() {
		_, gasLeft, subErr = t.Create2(msg.From, msg.Input, value, gas)
	} else {
		txn.IncrNonce(msg.From)
		returnValue, gasLeft, subErr = t.Call2(msg.From, *msg.To, msg.Input, value, gas)
	}

	if subErr != nil {
		if subErr == runtime.ErrNotEnoughFunds {
			txn.RevertToSnapshot(s)
			return nil, 0, false, subErr
		}
	}

	gasUsed := msg.Gas - gasLeft
	refund := gasUsed / 2
	if refund > txn.GetRefund() {
		refund = txn.GetRefund()
	}

	gasLeft += refund
	gasUsed -= refund

	// refund the sender
	remaining := new(big.Int).Mul(new(big.Int).SetUint64(gasLeft), gasPrice)
	txn.AddBalance(msg.From, remaining)

	// pay the coinbase
	coinbaseFee := new(big.Int).Mul(new(big.Int).SetUint64(gasUsed), gasPrice)
	txn.AddBalance(t.ctx.Coinbase, coinbaseFee)

	// return gas to the pool
	t.addGasPool(gasLeft)

	return returnValue, gasUsed, subErr != nil, nil
}
````

## Çalışma süresi {#runtime}

Bir durum geçişi yürütüldüğünde, durum geçişini yürüten ana modül EVM'dir
(state/runtime/evm içinde bulunur).

**Gönderme tablosu**, **opcode** ve talimat arasında bir eşleşme yapar.

````go title="state/runtime/evm/dispatch_table.go"
func init() {
	// unsigned arithmetic operations
	register(STOP, handler{opStop, 0, 0})
	register(ADD, handler{opAdd, 2, 3})
	register(SUB, handler{opSub, 2, 3})
	register(MUL, handler{opMul, 2, 5})
	register(DIV, handler{opDiv, 2, 5})
	register(SDIV, handler{opSDiv, 2, 5})
	register(MOD, handler{opMod, 2, 5})
	register(SMOD, handler{opSMod, 2, 5})
	register(EXP, handler{opExp, 2, 10})

	...

	// jumps
	register(JUMP, handler{opJump, 1, 8})
	register(JUMPI, handler{opJumpi, 2, 10})
	register(JUMPDEST, handler{opJumpDest, 0, 1})
}
````

EVM'yi güçlendiren temel mantık *Çalıştır* döngüsüdür. <br />

EVM için ana giriş noktasıdır. Bir döngü gerçekleştirir ve mevcut işlem kodunu denetler, talimatı alır,
yürütülüp yürütülemeyeceğini kontrol eder, gaz tüketir ve başarısız olana ya da durana kadar komutu yürütür.

````go title="state/runtime/evm/state.go"

// Run executes the virtual machine
func (c *state) Run() ([]byte, error) {
	var vmerr error

	codeSize := len(c.code)

	for !c.stop {
		if c.ip >= codeSize {
			c.halt()
			break
		}

		op := OpCode(c.code[c.ip])

		inst := dispatchTable[op]

		if inst.inst == nil {
			c.exit(errOpCodeNotFound)
			break
		}

		// check if the depth of the stack is enough for the instruction
		if c.sp < inst.stack {
			c.exit(errStackUnderflow)
			break
		}

		// consume the gas of the instruction
		if !c.consumeGas(inst.gas) {
			c.exit(errOutOfGas)
			break
		}

		// execute the instruction
		inst.inst(c)

		// check if stack size exceeds the max size
		if c.sp > stackSize {
			c.exit(errStackOverflow)
			break
		}

		c.ip++
	}

	if err := c.err; err != nil {
		vmerr = err
	}

	return c.ret, vmerr
}
````

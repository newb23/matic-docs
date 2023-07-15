---
id: state
title: State
description: Penjelasan modul state dari Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - state
  - trie
---

Untuk benar-benar memahami cara kerja **State** (Kondisi), Anda harus memahami beberapa konsep dasar Ethereum.<br />

Kami sangat menganjurkan membaca **[Panduan State di Ethereum](https://ethereum.github.io/execution-specs/autoapi/ethereum/frontier/state/index.html)**.

## Ikhtisar {#overview}

Setelah memahami konsep Ethereum, ikhtisar selanjutnya akan mudah.

Kami menyebutkan bahwa **World state trie** memiliki semua akun Ethereum yang ada. <br />
Akun ini merupakan daun dari Trie (pohon) Merkle. Masing-masing daun memiliki informasi **Kondisi Akun** yang dikodekan.

Ini memungkinkan Polygon Edge mendapat trie Merkle spesifik pada suatu waktu tertentu. <br />
Misalnya, kita bisa mendapat hash dari kondisi pada blok 10.

Trie Merkle, pada titik waktu apa pun, disebut ***Snapshot*** (Kondisi).

Kita bisa memiliki ***Snapshot*** untuk **state trie** atau **trie penyimpanan** - pada dasarnya semua sama. <br />
Satu-satunya perbedaan adalah pada yang diwakili daun:

* Dalam kasus pohon penyimpanan, daun memuat kondisi manasuka yang tidak dapat diproses atau diketahui isinya
* Dalam kasus pohon kondisi, daun mewakili akun

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

Antarmuka **Snapshot** ditetapkan sebagai berikut:

````go title="state/state.go
type Snapshot interface {
    // Gets a specific value for a leaf
	Get(k []byte) ([]byte, bool)

	// Commits new information
	Commit(objs []*Object) (Snapshot, []byte)
}
````

Informasi yang dapat dikomitmenkan akan ditetapkan oleh *Object struct*:

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

Penerapan pohon Merkle berada pada folder *state/immutable-trie*. <br/>
*state/immutable-trie/state.go* menerapkan antarmuka **State**.

*state/immutable-trie/trie.go* adalah objek pohon Merkle utama. Ini merepresentasikan versi pohon Merkle yang dioptimalkan,
yang menggunakan kembali sebanyak mungkin memori.

## Executor {#executor}

*state/executor.go* mencakup semua informasi yang dibutuhkan oleh Polygon Edge untuk memutuskan cara blok mengubah
kondisi saat ini. Penerapan *ProcessBlock* berada di sini.

Metode *apply* (terapkan) melakukan transisi kondisi aktual. Executor memanggil EVM.

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

## Runtime {#runtime}

Saat suatu transisi kondisi dieksekusi, modul utama yang mengeksekusi transisi kondisi adalah EVM (berada di
state/runtime/evm).

**dispatch table** melakukan pencocokan antara **opcode** dan instruksi.

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

Logika inti yang menyokong EVM adalah loop *Run*. <br />

Ini adalah titik masuk utama untuk EVM. Ini melakukan loop dan memeriksa opcode saat ini, mengambil instruksi, memeriksa
apakah dapat dieksekusi, menggunakan gas, dan mengeksekusi instruksi hingga gagal atau berhenti.

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

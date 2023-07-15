---
id: state
title: State
description: Paliwanag para sa state module ng Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - state
  - trie
---

Para talagang maunawaan kung paano gumagana ang **State**, dapat mong maunawaan ang ilang mga basehang konsepto ng Ethereum.<br />

Lubos naming inirerekomenda ang pagbabasa sa **[State sa Ethereum guide](https://ethereum.github.io/execution-specs/autoapi/ethereum/frontier/state/index.html)**.

## Pangkalahatang-ideya {#overview}

Ngayong pamilyar na tayo sa mga basehang konsepto ng Ethereum, ang susunod na pangkalahatang-ideya ay madali na.

Binanggit namin na ang **World state trie** ay mayroon ng lahat ng umiiral na mga Ethereum account. <br />
Ang mga account na ito ay ang mga pahina ng Merkle trie. Ang bawat pahina ay may naka-encode ng impormasyon ng **Account State**.

Pinapagana nito ang Polygon Edge na makakuha ng isang espesipikong Merkle trie, para sa isang espesikong punto ng panahon.<br />
Halimbawa, maaari naming makuha ang hash ng state sa block 10.

Ang Merkle trie, sa anumang punto ng panahon, ay tinatawag na isang ***Snapshot***.

Maaari kaming magkaroon ng mga ***Snapshot*** para sa **state trie**, o para sa **storage trie** - halos parehas lang sila. <br />
Ang pagkakaiba lamang ay kung ano ang kinakatawan ng mga pahina:

* Sa kaso ng storage trie, ang mga pahina ay naglalaman ng isang arbitrary state, na hindi namin maaaring iproseso o malaman kung ano ang naroroon
* Sa kaso ng state trie, ang mga pahina ay kumakatawan sa mga account

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

Ang **Snapshot** interface ay tinukoy bilang sumusunod:

````go title="state/state.go
type Snapshot interface {
    // Gets a specific value for a leaf
	Get(k []byte) ([]byte, bool)

	// Commits new information
	Commit(objs []*Object) (Snapshot, []byte)
}
````

Ang impormasyong maaaring magawa ay tinukoy ng *Object struct*:

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

Ang implementasyon para sa Merkle trie ay nasa *state/immutable-trie* na folder. <br/>
Ang *state/immutable-trie/state.go* ay nagpapatupad ng **State** interface.

Ang *state/immutable-trie/trie.go* ay ang pangunahing Merkle trie object. Ito ay kumakatawan sa isang optimized na bersyon ng Merkle trie,
na muling gumagamit ng maraming memory hangga't maaari.

## Executor {#executor}

Ang *state/executor.go* ay naglalaman ng lahat ng impormasyong kinakailangan para makapagpasya ang Polygon Edge kung paano binabago ng block ang kasalukuyang
state. Ang implementasyon ng *ProcessBlock* ay matatagpuan dito.

Ang paraan ng *pag-apply* ang gumagawa ng aktuwal na state transition. Ang executor ay tumatawag sa EVM.

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

Kapag naisagawa ang isang state transition, ang pangunahing module na nagsasagawa ng state transition ay ang EVM (nasa
state/runtime/evm).

Ang **dispatch table** ay gumagawa ng pagtugma sa pagitan ng **opcode** at ng instruction.

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

Ang core logic na nagpapagana sa EVM ay ang *Run* loop. <br />

Ito ang pangunahing entry point para sa EVM. Gumagawa ito ng loop at sinusuri ang kasalukuyang opcode, kinukuha ang instruction, sinusuri
kung maaari itong isagawa, kinukunsumo ang gas at isinasagawa ang instruction hanggang sa ito ay pumalya o huminto.

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

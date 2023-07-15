---
id: state
title: State
description: คำอธิบายเกี่ยวกับโมดูล state ของ Polygon Edge
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - state
  - trie
---

เพื่อทำความเข้าใจอย่างถ่องแท้เกี่ยวกับการทำงานของ **State** คุณต้องเข้าใจแนวคิดหลักบางประการของ Ethereum <br />

เราขอแนะนำให้คุณอ่านบทความ **[State ในคู่มือของ Ethereum](https://ethereum.github.io/execution-specs/autoapi/ethereum/frontier/state/index.html)**

## ภาพรวม {#overview}

ตอนนี้ เมื่อเรามีความเข้าใจเกี่ยวกับแนวคิดหลักของ Ethereum แล้ว คุณก็จะเข้าใจภาพรวมต่อไปได้ง่ายกว่า

เราได้กล่าวว่า **World State Trie** มีบัญชี Ethereum ทั้งหมดที่มีอยู่ <br />บัญชีเหล่านี้เป็นโหนดของ Merkle trieโดยแต่ละโหนดนั้นประกอบด้วยข้อมูล**สถานะบัญชี**ที่มีการเข้ารหัส

ซึ่งทำให้ Polygon Edge สามารถรับ Merkle trie เฉพาะสำหรับช่วงเวลาใดเวลาหนึ่งโดยเฉพาะได้ <br />ตัวอย่างเช่น เราสามารถรับแฮชของสถานะที่บล็อก 10

ในทุกช่วงเวลา เราเรียก Merkle trie ว่า ***Snapshot***

เราสามารถใช้ ***Snapshot*** กับ **state trie** หรือกับ **storage trie** ก็ได้ ซึ่งโดยทั่วไปแล้ว ถือว่าเหมือนกัน <br />ความแตกต่างเพียงอย่างเดียวคือสิ่งที่โหนดต่างๆ แสดงถึง :

* ในกรณีของ storage trie โหนดต่างๆ จะประกอบด้วยสถานะแบบกำหนดเอง โดยเราไม่สามารถประมวลผลหรือรู้ว่ามีข้อมูลใดอยู่
* ในกรณีของ state trie โหนดต่างๆ แสดงถึงบัญชี

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

อินเทอร์เฟซ **Snapshot** ได้รับการนิยามไว้ดังต่อไปนี้:

````go title="state/state.go
type Snapshot interface {
    // Gets a specific value for a leaf
	Get(k []byte) ([]byte, bool)

	// Commits new information
	Commit(objs []*Object) (Snapshot, []byte)
}
````

*Object struct* เป็นตัวนิยามข้อมูลซึ่งสามารถกำหนดไว้ได้:

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

การนำ Merkle trie ไปใช้อยู่ในโฟลเดอร์ *state/immutable-trie*<br/>*state/immutable-trie/state.go* จะนำอินเทอร์เฟซ **State** ไปใช้

*state/immutable-trie/trie.go* เป็นอ็อบเจ็กต์หลักของ Merkle trieซึ่งเป็นเวอร์ชันฉบับแก้ไขของ Merkle trieซึ่งใช้หน่วยความจำซ้ำมากที่สุดเท่าที่เป็นไปได้

## Executor {#executor}

*state/executor.go* จะรวมข้อมูลทั้งหมดซึ่ง Polygon Edge ต้องใช้เพื่อตัดสินวิธีการซึ่งบล็อกใช้ในการเปลี่ยน
สถานะปัจจุบันการนำไปใช้ของ *ProcessBlock* อยู่ที่นี่

เมธอด *apply* จะทำการเปลี่ยนสถานะจริงexecutor จะเรียก EVM

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

เมื่อมีการดำเนินการเปลี่ยนสถานะ โมดูลหลักซึ่งดำเนินการเปลี่ยนสถานะ คือ EVM (อยู่ใน
state/runtime/evm)

 **dispatch table** ดำเนินการจับคู่ระหว่าง **opcode** กับคำสั่ง

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

ลอจิกหลักที่ EVM ใช้ คือลูป *Run* <br />

นี่คือจุดเริ่มต้นหลักสำหรับ EVMซึ่งสร้างลูปและตรวจสอบ opcode ปัจจุบัน นำคำสั่งมาใช้ ตรวจสอบว่าสามารถดำเนินการได้หรือไม่ ใช้แก๊ส และดำเนินการตามคำสั่งจนกว่าจะล้มเหลวหรือสิ้นสุด

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

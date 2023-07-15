---
id: state
title: Состояние
description: Объяснение к модулю состояния Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - state
  - trie
---

Чтобы действительно понять, как работает **Состояние**, вам нужно понять базовые концепции Ethereum.<br />

Мы настоятельно рекомендуем прочитать раздел **[Состояние в руководстве по Ethereum](https://ethereum.github.io/execution-specs/autoapi/ethereum/frontier/state/index.html)**.

## Обзор {#overview}

Теперь, когда мы ознакомились с базовыми концепциями Ethereum, вы легко должны понять следующий обзор.

Мы упомянули, что в **Мировом дереве Меркла для системы состояний** находятся все существующие аккаунты Ethereum. <br />Эти аккаунты являются листьями дерева Меркла. Каждый лист имеет закодированную информацию **о состоянии аккаунта**.

Это позволяет Polygon Edge получить определенное дерево Меркла для определенного момента времени. <br />Например, мы можем получить хеш состояния на блоке 10.

Дерево Меркла в любой момент времени называется ***Снимок***.

Мы можем иметь ***снимки*** для **дерева состояний** или для **дерева хранения** — они в основном одинаковы. <br />Единственное отличие заключается в том, что представляют собой листья:

* У дерева хранения листья содержат произвольное состояние, которое мы не можем обработать или узнать, что там находится.
* У дерева состояний листья представляют собой аккаунты

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

Интерфейс **Снимка** определяется следующим образом:

````go title="state/state.go
type Snapshot interface {
    // Gets a specific value for a leaf
	Get(k []byte) ([]byte, bool)

	// Commits new information
	Commit(objs []*Object) (Snapshot, []byte)
}
````

Информация, которая может быть зафиксирована, определяется *Структурой объекта*:

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

Реализация для дерева Меркла находится в папке *state/immutable-trie*. <br/>*state/immutable-trie/state.go* реализует Интерфейс **состояния**.

*state/immutable-trie/trie.go* — основной объект дерева Меркла. Он представляет собой оптимизированную версию дерева Меркла, которая повторно использует как можно больше памяти.

## Исполнитель {#executor}

*state/executor.go* включает всю информацию, необходимую Polygon Edge для решения того, как блок меняет текущее состояние. Реализация *ProcessBlock* находится здесь.

Метод *apply* выполняет фактический переход состояний. Исполнитель вызывает EVM.

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

## Время выполнения {#runtime}

При выполнении перехода состояний основной модуль, выполняющий переход состояний, — это EVM (он расположен в state/runtime/evm).

**Таблица диспетчеризации** выполняет проверку соответствия между **opcode** и инструкцией.

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

Основу логики, которая обеспечивает работу EVM, составляет цикл *Run*. <br />

Это основной пункт входа для EVM. Он выполняет цикл и проверяет текущий opcode, извлекает инструкцию, проверяет, может ли она быть выполнена, потребляет газ и выполняет инструкцию до тех пор, пока не произойдет сбой или остановка.

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

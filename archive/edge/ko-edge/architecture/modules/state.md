---
id: state
title: 상태
description: Polygon 엣지의 상태 모듈에 대한 설명.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - state
  - trie
---

**상태** 작동 방식을 제대로 이해하려면 일부 기본적인 이더리움 개념을 이해해야 합니다.<br />

**[이더리움 가이드의 '상태'](https://ethereum.github.io/execution-specs/autoapi/ethereum/frontier/state/index.html)**를 확인하시기 바랍니다.

## 개요 {#overview}

기본적인 이더리움 개념을 숙지했다면 아래 개요를 쉽게 이해하실 수 있습니다.

존재하는 모든 이더리움 계정은 **월드 상태 트리**에 있다고 설명했습니다.<br />
이 계정들은 Merkle 트리의 리프입니다. 각 리프는 인코딩된 **계정 상태** 정보를 포함합니다.

이를 통해 Polygon 엣지는 특정 시점의 특정 Merkle 트리를 가져올 수 있습니다.<br />
예를 들어, 블록 10에서 상태 해시를 가져올 수 있습니다.

이 시점의 Merkle 트리를 ***스냅샷***이라고 부릅니다.

**상태 트리** 또는 **스토리지 트리**의 ***스냅샷***이 있을 수 있으며, 이들은 기본적으로 동일합니다. <br />
유일한 차이점은 리프가 의미하는 것입니다.

* 스토리지 트리의 경우, 리프에 임의의 상태가 포함되어 있으나 이를 처리하거나 그 안에 무엇이 있는지 알 수 없습니다.
* 상태 트리의 경우, 리프는 계정을 나타냅니다.

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

**스냅샷** 인터페이스는 다음과 같이 정의됩니다.

````go title="state/state.go
type Snapshot interface {
    // Gets a specific value for a leaf
	Get(k []byte) ([]byte, bool)

	// Commits new information
	Commit(objs []*Object) (Snapshot, []byte)
}
````

커밋할 수 있는 정보는 *객체 구조체*에 의해 정의됩니다.

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

Merkle 트리의 구현은 *state/immutable-trie* 폴더에서 확인할 수 있습니다.<br/>
*state/immutable-trie/state.go*는 **상태** 인터페이스를 구현합니다.

*state/immutable-trie/trie.go*는 주요 Merkle 트리 객체로서, 가능한 한 많은 메모리를 재사용하는
Merkle 트리의 최적화된 버전을 나타냅니다.

## 실행자 {#executor}

*state/executor.go*에는 Polygon 엣지가 블록의 현재 상태를 변경하는 방법을 정하는 데 필요한 모든 정보가 포함되어 있습니다. *ProcessBlock*의 구현은 여기에서 확인할 수 있습니다.

*적용* 메서드는 실제 상태 전환을 수행합니다. 실행자는 EVM을 호출합니다.

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

## 런타임 {#runtime}

상태 전환이 실행될 때, 상태 전환을 실행하는 메인 모듈은 EBM입니다(state/runtime/evm에 위치).

**디스패치 테이블**은 **명령 코드**와 명령 간의 매칭을 수행합니다.

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

EBM을 구동하는 핵심 논리는 *실행* 루프로, <br />

EVM의 주요 진입점입니다. 루프 작업을 수행하고 현재의 명령 코드를 확인하며 명령을 가져와
실행 가능 여부를 점검하며, 가스를 소비하고 실패하거나 정지할 때까지 명령을 실행합니다.

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

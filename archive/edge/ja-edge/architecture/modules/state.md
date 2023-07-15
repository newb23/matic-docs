---
id: state
title: ステート
description: Polygon Edgeのステートモジュールについて説明します。
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - state
  - trie
---

**ステート**がどのように機能するかを理解するには、Ethereumの基本的な概念を理解する必要があります。<br />

**[Ethereumガイドのステート](https://ethereum.github.io/execution-specs/autoapi/ethereum/frontier/state/index.html)**を読まれることを強く推奨します。

## 概要 {#overview}

Ethereumの基本的な概念を理解した今、次の概要は簡単に理解することができるかと思います。

**ワールドステートトライ**は、存在するEthereumアカウントすべてを持つということを説明しました。<br />
これらのアカウントは、Merkleトライの残りの部分です。それぞれがエンコードされた**アカウントステート**情報を持っています。

これにより、Polygon Edgeは、特定のタイミングの特定のMerkleトライを取得することができます。<br />
たとえば、ブロック10でのステートのハッシュを取得することができます。

Merkleトライは、どの時点でも***スナップショット***と呼ばれています。

**ステートトライ**、または**ストレージトライ**について、***スナップショット***をもつことができます - これらは基本的に同じです。<br />唯一の違いは、残りが表すものです：

* ストレージトライの場合、残りの部分は任意のステートを含み、そこにあるものを処理または知ることはできません。
* ステートトライの場合、残りの部分はアカウントを表します

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

**スナップショット**インターフェースは、次のように定義されています：

````go title="state/state.go
type Snapshot interface {
    // Gets a specific value for a leaf
	Get(k []byte) ([]byte, bool)

	// Commits new information
	Commit(objs []*Object) (Snapshot, []byte)
}
````

コミットできる情報は*オブジェクト構造体*によって定義されます：

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

<br/>Merkleトライの実装は*state/immutable-trie*フォルダにあります。*state/immutable-trie/state.go*は**ステート**インターフェースを実装します。

*state/immutable-trie/trie.go*はメインのmerkleトライオブジェクトです。Merkleトライの最適化バージョンを表しできるだけ多くのメモリを再利用します。

## Executor {#executor}

*state/executor.go*はPolygon Edgeがブロックが現在の状態をどのように変更するかを決定するのに必要な情報をすべてふくみあ含みます。*ProcessBlock*の実装はこちらにあります。

*適用*メソッドは実際の状態遷移を行います。ExecutorはEVMを呼び出します。

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

## ランタイム {#runtime}

状態の遷移が実行されると、状態の遷移を実行するメインモジュールはEVMになります（state/runtime/evmに配置）。

**ディスパッチテーブル**は**オペコード**と命令間で一致します。

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

EVMに電力を供給するコアロジックは*実行*ループです。<br />

これは、EVMのメインエントリポイントです。ループを行い、現在のオペコードをチェックし、命令を取り込み、実行可能かどうかをチェックし、ガスを消費し、それが失敗するか停止するまで命令を実行します。

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

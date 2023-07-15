---
id: state
title: Estado
description: Explicação para o módulo Estado do Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - state
  - trie
---

Para compreender verdadeiramente como funciona o módulo **Estado**, é necessário compreender alguns conceitos Ethereum básicos.<br />

Recomendamos vivamente a leitura do **[Guia do Estado no Ethereum](https://ethereum.github.io/execution-specs/autoapi/ethereum/frontier/state/index.html)**.

## Visão geral {#overview}

Agora que nos familiarizamos com conceitos Ethereum básicos, deve ser fácil compreender a próxima visão geral.

Mencionámos que a **World state trie** tem todas as contas Ethereum que existem. <br />
Estas contas são as folhas da árvore Merkle. Cada folha tem informação codificada sobre o **Estado da Conta**.

Isto permite que o Polygon Edge obtenha uma árvore Merkle específica para um momento específico. <br />
Por exemplo, podemos obter o hash do estado no bloco 10.

A árvore Merkle é denominada, em qualquer momento, ***Snapshot***.

Podemos ter ***Snapshots*** para a **árvore de estado** ou para a **árvore de armazenamento** - elas são basicamente o mesmo. <br />
A única diferença reside no que as folhas representam:

* No caso da árvore de armazenamento, as folhas contêm um estado arbitrário, que não podemos processar nem saber o que inclui
* No caso da árvore de estado, as folhas representam contas

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

A interface **Snapshot** é definida como tal:

````go title="state/state.go
type Snapshot interface {
    // Gets a specific value for a leaf
	Get(k []byte) ([]byte, bool)

	// Commits new information
	Commit(objs []*Object) (Snapshot, []byte)
}
````

As informações que podem ser cometidas são definidas pelo *Object struct*:

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

A implementação da árvore Merkle encontra-se na pasta *state/immutable-trie*. <br/>
*state/immutable-trie/state.go* implementa a interface **Estado**.

*state/immutable-trie/trie.go* é o principal objeto da árvore Merkle. Representa uma versão otimizada da árvore Merkle,
que reutiliza a maior quantidade de memória possível.

## Executor {#executor}

*state/executor.go*inclui todas informações necessárias para que o Polygon Edge decida de que forma um bloco altera
o estado atual. A implementação do *ProcessBlock* está aqui localizada.

O método *apply* faz a transição do estado real. O executor chama o EVM.

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

Quando uma transição de estado é executada, o módulo principal que executa a transição de estado é o EVM (localizado em
state/runtime/evm).

A **dispatch table** efetua uma correspondência entre o **opcode** e a instrução.

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

A lógica principal que alimenta o EVM é o loop *Run*. <br />

Trata-se do principal ponto de entrada para o EVM. Faz um loop e verifica o opcode atual, obtém a instrução, verifica
se ela pode ser executada, consome gás e executa a instrução até que ela falhe ou pare.

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

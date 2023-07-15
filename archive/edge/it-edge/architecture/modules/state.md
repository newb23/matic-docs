---
id: state
title: Stato
description: Spiegazione per il modulo di stato di Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - state
  - trie
---

Per capire veramente come funziona lo **Stato** devi capire alcuni concetti di base di Ethereum.<br />

Ti consigliamo vivamente di leggere **[Lo Stato nella guida di Ethereum](https://ethereum.github.io/execution-specs/autoapi/ethereum/frontier/state/index.html)**.

## Panoramica {#overview}

Ora che abbiamo preso dimestichezza con i concetti di base di Ethereum, la prossima panoramica dovrebbe risultare semplice.

Abbiamo detto che il **trie di stato mondiale** ha tutti gli account Ethereum esistenti. <br />
Questi account sono le foglie del Merkle trie. Ogni foglia ha codificato informazioni di **Stato dell'account**.

Questo consente a Polygon Edge di ottenere un specifico Merkle trie, per un momento specifico. <br />
Ad esempio, possiamo ottenere l'hash dello stato al blocco 10.

Il Merkle trie, in qualsiasi momento, viene chiamato ***Snapshot***.

Possiamo avere degli ***Snapshot*** per il **trie di stato**, o per il **trie di archiviazione** - sostanzialmente sono gli stessi. <br />
L'unica differenza sta in quello che le foglie rappresentano:

* Nel caso del trie di archiviazione, le foglie contengono uno stato arbitrario, che non possiamo elaborare o sapere cosa c'è dentro.
* Nel caso del trie di stato, le foglie rappresentano gli account

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

L'interfaccia **Snapshot** viene definita come:

````go title="state/state.go
type Snapshot interface {
    // Gets a specific value for a leaf
	Get(k []byte) ([]byte, bool)

	// Commits new information
	Commit(objs []*Object) (Snapshot, []byte)
}
````

Le informazioni che possono essere impegnate vengono definite dalla *Struttura dell'oggetto*:

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

L'implementazione per il Merkle trie è nella cartella *trie di stato/immutabile*. <br/>
*state/immutable-trie/state.go* implementa l'interfaccia dello **Stato** .

*state/immutable-trie/trie.go* è il principale oggetto del Merkle trie. Rappresenta una versione ottimizzata del Merkle trie, che riutilizza quanta più memoria possibile.

## Esecutore {#executor}

*state/executor.go* include tutte le informazioni necessarie affinché Polygon Edge decida come un blocco possa cambiare lo stato
corrente. L'implementazione del *ProcessBlock* si trova qui.

Il metodo *apply* esegue la transizione dello stato corrente. L'esecutore chiama l'EVM.

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

Quando viene eseguita una transizione di stato, il modulo principale che esegue tale transizione è l'EVM (situato in state/runtime/evm).

La **tabella di spedizione** fa una corrispondenza tra il**codice operativo** e l'istruzione.

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

La logica di base che alimenta l'EVM è il ciclo di  *Esecuzione*. <br />

Questo è il punto di ingresso principale per l'EVM. Fa un ciclo e controlla il codice operativo corrente, prende l'istruzione, controlla se può essere eseguita, consuma gas ed esegue l'istruzione finché non fallisce o si arresta.

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

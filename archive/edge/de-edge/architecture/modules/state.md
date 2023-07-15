---
id: state
title: State
description: Erläuterung für das Zustandsmodul von Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - state
  - trie
---

Um wirklich zu verstehen, wie **State** funktioniert, sollten Sie einige grundlegende Ethereum-Konzepte verstehen.<br />

Wir empfehlen, den **[Leitfaden zu State in Ethereum](https://ethereum.github.io/execution-specs/autoapi/ethereum/frontier/state/index.html)** zu lesen.

## Übersicht {#overview}

Nachdem wir uns nun mit den grundlegenden Ethereum-Konzepten vertraut gemacht haben, sollte der nächste Überblick einfach sein.

Wir haben erwähnt, dass der **World State Trie** alle Ethereum-Konten hat, die es <br />gibt. Diese Konten sind die Blätter des Merkle Tries (Datenstruktur). Jedes Blatt enthält kodierte **Informationen zum Kontostatus**.

So kann der Polygon Edge einen bestimmten Merkle Trie für einen bestimmten Zeitpunkt erhalten. <br />
Wir können zum Beispiel den Hash des State in Block 10 erhalten.

Der Merkle Trie wird zu jedem Zeitpunkt als ***Snapshot*** bezeichnet.

Wir können ***Snapshots*** für die **State-Trie** (Kerndatenbank) oder für die **Storage-Trie** (Datenstruktur zum Speichern) haben – sie sind im Grunde das Gleiche. <br />
Der einzige Unterschied besteht darin, was die Blätter darstellen:

* Im Fall des Storage-Tries enthalten die Blätter einen beliebigen Zustand, den wir nicht verarbeiten können und von dem wir nicht wissen, was er enthält
* Im Fall des State-Tries stehen die Blätter für Konten

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

Die Schnittstelle **Snapshot** ist als solche definiert:

````go title="state/state.go
type Snapshot interface {
    // Gets a specific value for a leaf
	Get(k []byte) ([]byte, bool)

	// Commits new information
	Commit(objs []*Object) (Snapshot, []byte)
}
````

Die Informationen, die übertragen werden können, werden in der *Objekt-Struktur* definiert:

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

Die Implementierung für den Merkle-Trie befindet sich im *Ordner State/Immutable-Trie*. <br/>
*state/immutable-trie/state.go* implementiert die **State** Schnittstelle.

*state/immutable-trie/trie.go* ist das wichtigste Merkle-Trie-Objekt. Es stellt eine optimierte Version des Merkle-Tries dar,
die so viel Speicher wie möglich wiederverwendet.

## Executor {#executor}

*state/executor.go* enthält alle Informationen, die Polygon Edge braucht, um zu entscheiden, wie ein Block den aktuellen Zustand
verändert. Die Implementierung von *ProcessBlock* befindet sich hier.

Die *Apply* Methode führt den eigentlichen Zustandsübergang durch. Der Executor ruft die EVM (Ethereum Virtual Machine) auf.

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

## Laufzeit {#runtime}

Wenn ein Zustandsübergang ausgeführt wird, ist das Hauptmodul, das den Zustandsübergang ausführt, die EVM (befindet sich in
state/runtime/evm).

Die **Dispatch-Tabelle** führt einen Abgleich zwischen dem **Opcode** und der Anweisung durch.

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

Die Hauptlogik, die die EVM antreibt, ist die *Run*-Schleife. <br />

Dies ist der Haupteinstiegspunkt für die EVM. Er macht eine Schleife und prüft den aktuellen Opcode, holt die Anweisung, prüft,
ob sie ausgeführt werden kann, verbraucht Gas und führt die Anweisung aus, bis sie entweder fehlschlägt oder stoppt.

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

---
id: state
title: État
description: Explication du module d'état de Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - state
  - trie
---

Pour vraiment comprendre comment fonctionne l'**État**, vous devez comprendre certains concepts de base d'Ethereum.<br />

Nous vous recommandons vivement de lire le **[guide d'État dans Éthereum](https://ethereum.github.io/execution-specs/autoapi/ethereum/frontier/state/index.html)**.

## Aperçu {#overview}

Maintenant que nous nous sommes familiarisés avec les concepts de base d'Ethereum, le prochain aperçu devrait être facile.

Nous avons mentionné que le **World state trie** comprend tous les comptes Ethereum qui existent. <br />
Ces comptes sont les feuilles du trie de Merkle. Chaque feuille contient des informations codées sur **l'État du Compte**.

Cela permet à Polygon Edge d'obtenir un trie de Merkle spécifique, pour un moment précis. <br />Par exemple, nous pouvons obtenir l'identifiant de l'état au bloc 10.

Le trie de Merkle, à tout moment, est appelé une ***Photographie***.

Nous pouvons avoir des ***photographies*** pour le **trie d'état** ou pour le **trie de stockage** - ils sont fondamentalement les mêmes. <br />
La seule différence est au niveau de ce que représentent les feuilles:

* Dans le cas du trie de stockage, les feuilles contiennent un état arbitraire, que nous ne pouvons pas traiter ou savoir ce qui se trouve à l'intérieur
* Dans le cas de l'état trie, les feuilles représentent des comptes

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

L'interface de la **Photographie** est définie comme suit:

````go title="state/state.go
type Snapshot interface {
    // Gets a specific value for a leaf
	Get(k []byte) ([]byte, bool)

	// Commits new information
	Commit(objs []*Object) (Snapshot, []byte)
}
````

Les informations pouvant être validées sont définies par la *structure de l'Objet*:

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

L'implémentation du trie de Merkle se trouve dans le dossier *state/immutable-trie*. <br/>
*state/immutable-trie/state.go* implémente l'interface **d'État**.

*state/immutable-trie/trie.go* est le principal objet du trie de Merkle. Il représente une version optimisée du trie de Merkle,
qui réutilise autant de mémoire que possible.

## Exécuteur {#executor}

*state/executor.go* inclut toutes les informations nécessaires pour que Polygon Edge décide comment un bloc modifie l'état actuel. L'implémentation de *ProcessBlock* se trouve ici.

La méthode *apply* effectue la transition de l'état actuel. L'exécuteur appelle l'EVM.

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

## Exécution {#runtime}

Lorsqu'une transition d'état est exécutée, le module principal qui exécute la transition d'état est l'EVM (situé dans state/runtime/evm).

La **table de répartition** fait une correspondance entre le **opcode** et l'instruction.

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

La logique de base qui alimente l'EVM est la boucle *Run*.<br />

C'est le point d'entrée principal de l'EVM. Il crée une boucle et vérifie l'opcode courant, récupère l'instruction, vérifie si elle peut être exécutée, consomme du gaz et exécute l'instruction jusqu'à ce qu'elle échoue ou s'arrête.

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

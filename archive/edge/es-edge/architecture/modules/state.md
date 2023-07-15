---
id: state
title: Estado
description: Explicación del módulo de estado de Polygon Edge
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - state
  - trie
---

Para entender realmente cómo funciona el **estado**, debes entender algunos conceptos básicos de Ethereum.<br />

Sobre todo, recomendamos leer el **[Estado en la guía de Ethereum](https://ethereum.github.io/execution-specs/autoapi/ethereum/frontier/state/index.html)**.

## Descripción general {#overview}

Ahora que nos hemos familiarizado con los conceptos básicos de Ethereum, la siguiente descripción general debería ser fácil de entender.

Mencionamos que el **árbol de estado mundial** tiene todas las cuentas de Ethereum que existen.<br />
Esas cuentas son las hojas del árbol de Merkle. Cada hoja ha codificado la información del **Estado de cuenta**.

Eso permite que Polygon Edge obtenga un árbol de Merkle específico, para un punto específico en el tiempo. <br />
Por ejemplo, podemos obtener el hash del estado en el bloque 10.

El árbol de Merkle en cualquier punto del tiempo se llama ***foto instantánea***.

Podemos tener ***fotos instantáneas*** para el **árbol de estado**, o para el **árbol de almacenamiento**; son básicamente lo mismo. <br />
La única diferencia está en lo que representan las hojas:

* En el caso del árbol de almacenamiento, las hojas contienen un estado arbitrario, que no podemos procesar ni saber qué hay ahí.
* En el caso del árbol de estado, las hojas representan cuentas.

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

La interfaz de **fotos instantáneas** se define como tal:

````go title="state/state.go
type Snapshot interface {
    // Gets a specific value for a leaf
	Get(k []byte) ([]byte, bool)

	// Commits new information
	Commit(objs []*Object) (Snapshot, []byte)
}
````

La información que se puede comprometer está definida por la *estructura del objeto*:

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

La implementación del árbol de Merkle está en la carpeta *state/immutable-trie*<br/>.
*state/immutable-trie/state.go* implementa la interfaz **Estado**.

*state/immutable-trie/trie.go* es el principal objeto del árbol de Merkle. Este representa una versión optimizada del árbol de Merkle,
que reutiliza la mayor cantidad de memoria posible.

## Ejecutor {#executor}

*state/executor.go* incluye toda información necesaria para que Polygon Edge decida cómo un bloque cambia el actual
estado. La implementación de *ProcessBlock* (Procesar bloque) se encuentra aquí.

El método de *aplicación* realiza la transición de estado real. El ejecutor llama a la máquina virtual de Ethereum (EVM).

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

## Tiempo de ejecución {#runtime}

Cuando un estado de transición se ejecuta, el módulo principal que ejecuta el estado de transición es la EVM (ubicado en
state/runtime/evm).

La **tabla de envío** busca una coincidencia entre el **código de operación** y la instrucción.

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

La lógica principal que impulsa la EVM es el ciclo *Ejecutar*. <br />

Ese es el punto de entrada principal para la EVM. Hace un bucle y revisa el código de operación actual, obtiene la instrucción, comprueba
si se puede ejecutar, consume gas y ejecuta la instrucción hasta que falle o se detenga.

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

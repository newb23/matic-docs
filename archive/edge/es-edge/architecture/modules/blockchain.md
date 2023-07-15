---
id: blockchain
title: Cadena de bloques
description: Explicación de los módulos de la cadena de bloques y estado de Polygon Edge
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - blockchain
  - state
---

## Descripción general {#overview}

Uno de los módulos principales de Polygon Edge es **cadena de bloques** y otro es **estado**. <br />

**Cadena de bloques** es el motor que se encarga de la reorganización de los bloques. Eso significa que se ocupa de toda la lógica que opera cuando se incluye un bloque nuevo en la cadena de bloques.

**Estado** representa el objeto de la *transición del estado*. Se ocupa de cómo cambia el estado cuando se incluye un bloque nuevo. <br />Entre otras cosas, **Estado** se encarga de:
* Ejecución de transacciones
* Ejecución de la máquina virtual de Ethereum (EVM)
* Cambio de los árboles de Merkle
* Y mucho más, que puedes encontrar en la sección correspondiente de **Estado**. 🙂

El punto clave es que estas dos partes están muy conectadas y cooperan estrechamente para que el cliente funcione. <br />Por ejemplo, cuando la **cadena de bloques** recibe un bloque nuevo (y no hay reorganización), llama a **Estado** para que haga la transición del estado.

**Cadena de bloques** también debe ocuparse de algunas partes relacionadas con el consenso (por ejemplo, *¿este ethHash es correcto?*, *¿esta prueba de trabajo (PoW) es correcta?*)<br />. En otras palabras, **es el núcleo principal de lógica a través del cual se incluyen todos los bloques**.

## *WriteBlocks* (Escribir bloques)

Una de las partes más importantes relacionadas con la capa de **cadena de bloques** es el método *WriteBlocks* (Escribir bloques):

````go title="blockchain/blockchain.go"
// WriteBlocks writes a batch of blocks
func (b *Blockchain) WriteBlocks(blocks []*types.Block) error {
	if len(blocks) == 0 {
		return fmt.Errorf("no headers found to insert")
	}

	parent, ok := b.readHeader(blocks[0].ParentHash())
	if !ok {
		return fmt.Errorf("parent of %s (%d) not found: %s", blocks[0].Hash().String(), blocks[0].Number(), blocks[0].ParentHash())
	}

	// validate chain
	for i := 0; i < len(blocks); i++ {
		block := blocks[i]

		if block.Number()-1 != parent.Number {
			return fmt.Errorf("number sequence not correct at %d, %d and %d", i, block.Number(), parent.Number)
		}
		if block.ParentHash() != parent.Hash {
			return fmt.Errorf("parent hash not correct")
		}
		if err := b.consensus.VerifyHeader(parent, block.Header, false, true); err != nil {
			return fmt.Errorf("failed to verify the header: %v", err)
		}

		// verify body data
		if hash := buildroot.CalculateUncleRoot(block.Uncles); hash != block.Header.Sha3Uncles {
			return fmt.Errorf("uncle root hash mismatch: have %s, want %s", hash, block.Header.Sha3Uncles)
		}
		
		if hash := buildroot.CalculateTransactionsRoot(block.Transactions); hash != block.Header.TxRoot {
			return fmt.Errorf("transaction root hash mismatch: have %s, want %s", hash, block.Header.TxRoot)
		}
		parent = block.Header
	}

	// Write chain
	for indx, block := range blocks {
		header := block.Header

		body := block.Body()
		if err := b.db.WriteBody(header.Hash, block.Body()); err != nil {
			return err
		}
		b.bodiesCache.Add(header.Hash, body)

		// Verify uncles. It requires to have the bodies on memory
		if err := b.VerifyUncles(block); err != nil {
			return err
		}
		// Process and validate the block
		if err := b.processBlock(blocks[indx]); err != nil {
			return err
		}

		// Write the header to the chain
		evnt := &Event{}
		if err := b.writeHeaderImpl(evnt, header); err != nil {
			return err
		}
		b.dispatchEvent(evnt)

		// Update the average gas price
		b.UpdateGasPriceAvg(new(big.Int).SetUint64(header.GasUsed))
	}

	return nil
}
````
El método *WriteBlocks* (Escribir bloques) es el punto de entrada para escribir bloques en la cadena de bloques. Como parámetro, se encuentra en una gama de bloques.<br />
En primer lugar, se validan los bloques. En segundo lugar, se escriben en la cadena.

La *transición del estado* en sí se hace llamando al método *processBlock*(procesar bloque), dentro de *WriteBlocks*.

Vale la pena mencionar que, como es el punto de entrada para escribir bloques en la cadena de bloques, otros módulos (como **Sealer** [Sellador]) utilizan este método.

## Suscripciones de Blockchain {#blockchain-subscriptions}

Es necesario que haya una forma de monitorear los cambios relacionados con la cadena de bloques. <br />
Para eso están las **suscripciones**.

Las suscripciones son una forma de aprovechar las publicaciones de eventos de las cadenas de bloques y recibir datos significativos inmediatamente.

````go title="blockchain/subscription.go"
type Subscription interface {
    // Returns a Blockchain Event channel
	GetEventCh() chan *Event
	
	// Returns the latest event (blocking)
	GetEvent() *Event
	
	// Closes the subscription
	Close()
}
````

Los **eventos de la cadena de bloques** contienen información sobre cualquier cambio realizado en la cadena real. Eso incluye las reorganizaciones, así como nuevos bloques:

````go title="blockchain/subscription.go"
type Event struct {
	// Old chain removed if there was a reorg
	OldChain []*types.Header

	// New part of the chain (or a fork)
	NewChain []*types.Header

	// Difficulty is the new difficulty created with this event
	Difficulty *big.Int

	// Type is the type of event
	Type EventType

	// Source is the source that generated the blocks for the event
	// right now it can be either the Sealer or the Syncer. TODO
	Source string
}
````

:::tip Repaso

¿Recuerdas cuando mencionamos el comando del ***monitoreo*** en los [comandos CLI](/docs/edge/get-started/cli-commands)?

Los eventos de la cadena de bloques son los eventos originales que ocurren en Polygon Edge y que, después, se mapean en un formato de mensaje de búfer de protocolo, para facilitar su transferencia.

:::
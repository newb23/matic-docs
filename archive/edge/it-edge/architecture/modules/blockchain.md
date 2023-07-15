---
id: blockchain
title: Blockchain
description: Spiegazione dei moduli blockchain e state di Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - blockchain
  - state
---

## Panoramica {#overview}

Alcuni dei moduli principali di Polygon Edge sono **Blockchain** e **State**.<br />

**Blockchain** è il motore che si occupa delle riorganizzazioni dei blocchi. Ciò significa che si occupa di tutta la logica che si verifica quando un nuovo blocco viene inserito nella blockchain.

**State** rappresenta l'oggetto *transizione di stato*. Si occupa di come cambia lo stato quando viene inserito un nuovo blocco. <br />Tra le altre cose, **State** si occupa di:
* Eseguire le transazioni
* Eseguire l'EVM
* Cambiare gli alberi di Merkle
* Molto altro che è discusso nella corrispondente sezione **State** 🙂

La chiave di lettura è che queste due parti sono molto collegate e lavorano insieme per il funzionamento del client. <br />Ad esempio, quando il livello **Blockchain** riceve un nuovo blocco (e non è avvenuta alcuna riorganizzazione), chiama lo **State** per eseguire una transizione di stato.

**La blockchain** deve anche occuparsi di alcune parti relative al consenso (es. *questo ethHash è corretto?*, *questa PoW è corretta?*)<br />. In una frase, **è il nucleo principale della logica attraverso cui vengono inclusi tutti i blocchi**.

## *WriteBlocks*

Una delle parti più importanti che riguardano il **Blockchain** layer è il metodo *WriteBlocks*:

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
Il metodo *WriteBlocks* è il punto di ingresso per scrivere blocchi nella blockchain. Come parametro, accetta un intervallo di blocchi.<br /> In primo luogo, i blocchi vengono convalidati. Dopo di che, vengono scritti nella catena.

La *transizione di stato* vera e propria viene eseguita richiamando il metodo *processBlock* all'interno di *WriteBlocks*.

Vale la pena ricordare che, essendo il punto di ingresso per la scrittura dei blocchi nella blockchain, altri moduli (come il **Sealer**) utilizzano questo metodo.

## Sottoscrizioni nella blockchain {#blockchain-subscriptions}

È necessario un modo per monitorare le modifiche relative alla blockchain. <br />È qui che entrano in gioco le **Sottoscrizioni**.

Le sottoscrizioni sono un modo per attingere ai flussi di eventi della blockchain e ricevere istantaneamente dati significativi.

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

Gli **Eventi Blockchain** contengono informazioni relative a qualsiasi modifica apportata alla catena attuale. Questo include le riorganizzazioni, nonché i nuovi blocchi:

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

:::tip Aggiornamento
Ricordi quando abbiamo menzionato il comando ***monitor*** nella sezione [Comandi CLI](/docs/edge/get-started/cli-commands)?

Gli eventi Blockchain sono gli eventi originali che si verificano in Polygon Edge e vengono successivamente mappati in un formato di messaggio Protocol Buffers per facilitarne il trasferimento.
:::
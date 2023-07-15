---
id: blockchain
title: Blockchain
description: Erläuterung für die Blockchain- und State Modules von Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - blockchain
  - state
---

## Übersicht {#overview}

Eines der Hauptmodule des Polygon Edge sind **Blockchain** und** State**.<br />

**Blockchain** ist das Powerhouse, das sich mit Block-Neuorganisationen beschäftigt. Dies bedeutet, dass es mit all der Logik handelt, die passiert, wenn ein neuer Block in der Blockchain enthalten ist.

**State** repräsentiert das *State transition* Objekt. Es behandelt, wie sich der Zustand ändert, wenn ein neuer Block enthalten ist.<br /> **State** behandelt unter anderem:
* Transaktionen ausführen
* Ausführen des EVM
* Merkleversuche ändern
* Viel mehr, was in dem entsprechenden **State** Abschnitt abgedeckt ist 🙂

Das Wichtigste ist, dass diese 2 Teile sehr miteinander verbunden sind, und sie arbeiten eng zusammen, damit der Client funktioniert.<br /> Wenn beispielsweise die **Blockchain** einen neuen Block erhält (und keine Reorganisation stattgefunden hat), ruft es den **State** dazu auf, eine State-Übertragung durchzuführen.

**Blockchain** behandelt auch einige Dinge im Zusammenhang mit Konsens (Bsp. *ist dieses ethHash korrekt?* i*st dieser PoW korrekt?)*.<br /> In einem Satz **ist es der Hauptkern von Logik, durch den alle Blöcke enthalten sind**.

## *WriteBlocks*

Eines der wichtigsten Teile im Zusammenhang mit der **Blockchain** Ebene ist die *WriteBlocks* Methode:

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
Die *WriteBlocks* Methode ist der Einstiegspunkt, um Blöcke in die Blockchain zu schreiben. Als Parameter nimmt es eine Reihe von Blöcken<br /> auf. Zunächst werden die Blöcke validiert. Danach werden sie in die Chain geschrieben.

Die tatsächliche *State-Transition* wird durchgeführt, indem die *processBlock* Methode innerhalb von *WriteBlocks* aufgerufen wird.

Es ist erwähnenswert, dass, weil es der Einstiegspunkt für das Schreiben von Blöcken auf die Blockchain ist, andere Module (wie der **Sealer**) diese Methode verwenden.

## Blockchain-Subscriptions {#blockchain-subscriptions}

Es muss eine Möglichkeit geben, blockchain-bezogene Änderungen zu überwachen.<br /> Hier kommen **Subscriptions** ins Spiel.

Subscriptions sind eine Möglichkeit, Blockchain-Event-Streams zu erschließen und sofort aussagekräftige Daten zu erhalten.

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

Die **Blockchain-Events** enthalten Informationen über alle Änderungen an der tatsächlichen Chain. Dazu gehören Reorganisationen, sowie neue Blöcke:

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

:::tip Refresher
Erinnern Sie sich, als wir den ***monitor*** in den [CLI Commands](/docs/edge/get-started/cli-commands) erwähnt haben?

Die Blockchain Events sind die ursprünglichen Ereignisse, die in Polygon Edge passieren, und sie werden später für eine einfache Übertragung einem Nachrichtenformat im Protokollspeicher zugeordnet.
:::
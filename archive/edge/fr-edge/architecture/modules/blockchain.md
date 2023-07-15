---
id: blockchain
title: Blockchain
description: Explication des modules de blockchain et d'état de Edge de Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - blockchain
  - state
---

## Aperçu {#overview}

L'un des principaux modules de Polygon Edge sont **Blockchain** et **État**.<br />

**Blockchain** est la centrale électrique qui s'occupe des réorganisations de bloc. Cela signifie qu'il traite de toute la logique qui se produit lorsqu'un nouveau bloc est inclus dans la blockchain.

**State** représente l'objet de *transition d'état*. Il traite de la façon dont l'état change lorsqu'un nouveau bloc est inclus. <br />**L'État** gère entre autres:
* Exécution des transactions
* Exécution de l'EVM
* Modification des essais de Merkle
* Beaucoup plus, qui est couvert dans la section **d'État** correspondante 🙂

La clé à retenir est que ces 2 parties sont très liées et qu'elles travaillent en étroite collaboration pour que le client fonctionne. <br />Par exemple, lorsque la couche de **Blockchain** reçoit un nouveau bloc (et qu'aucune réorganisation n'a eu lieu), elle appelle **l'État** pour effectuer une transition d'état.

**Blockchain** doit également gérer certaines parties relatives au consensus (par exemple, *est-ce que ethHash est correct?*, *est-ce que ce PoW est correct?*).<br /> En une phrase, **c'est le noyau principal de la logique à travers lequel tous les blocs sont inclus**.

## *WriteBlocks*

L'une des parties les plus importantes relatives à la couche de **Blockchain** est la méthode de *WriteBlocks*:

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
La méthode de *WriteBlocks* est le point d'entrée pour écrire des blocs dans blockchain. En tant que paramètre, cela prend un ensemble de blocs.<br /> Dans un premier temps, les blocs sont validés. Après cela, ils sont écrits dans la chaîne.

La *transition d'état* actuelle est effectuée en appelant la méthode *processBlock* dans *WriteBlocks*.

Il convient de mentionner que, comme c'est le point d'entrée pour écrire des blocs dans la blockchain, d'autres modules (tels que le **Sealer**) utilisent cette méthode.

## Abonnements sur Blockchain {#blockchain-subscriptions}

Il doit y avoir un moyen de surveiller les changements liés à la blockchain.<br /> C'est là que **Les Abonnements** entrent en jeu.

Les Abonnements sont un moyen d'exploiter les flux d'événements de la blockchain et de recevoir instantanément des données significatives.

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

Les **Événements de Blockchain** contiennent des informations sur les modifications apportées à la chaîne actuelle. Cela inclut les réorganisations, ainsi que les nouveaux blocs:

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

:::tip Mis à Jour

Vous souvenez vous que nous avons mentionné la commande ***monitor*** dans les [Commandes CLI](/docs/edge/get-started/cli-commands)?

Les Événements de la Blockchain sont les événements originaux qui se produisent dans un Edge de Polygon, et ils sont ensuite cartographiés à un format de message Protocole de Protections pour un transfert facile.

:::
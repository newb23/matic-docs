---
id: blockchain
title: Blok zinciri
description: Polygon Edge'in blok zinciri ve durum modüllerinin açıklaması.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - blockchain
  - state
---

## Genel Bakış {#overview}

Polygon Edge'in ana modüllerinden ikisi **Blok Zinciri** ve **Durum** modülleridir. <br />

**Blok Zinciri**, sistemin blokların yeniden yapılandırılması ile ilgilenen dinamosudur. Yani blok zincirine yeni bir blok eklendiğinde gerçekleşen tüm mantığı yönetir.

**Durum**, *durum geçişi* nesnesini temsil eder. Yeni bir blok eklendiğinde durumun nasıl değiştiği ile ilgilenir. <br /> Diğer özelliklerinin yanı sıra, **Durum** şu işlevleri yönetir:
* İşlemleri yürütme
* EVM'yi yürütme
* Merkle ağaçlarını değiştirme
* Çok daha fazlası, ilgili **Durum** bölümünde ele alınmaktadır. 🙂

İşin özünde; bu iki parça birbiriyle çok bağlantılıdır ve istemcinin işlemesi için yakın ilişki içinde çalışırlar. <br /> Örneğin, **Blok Zinciri** katmanı, yeni bir blok aldığında (ve yeniden yapılandırma gerçekleşmediyse) bir durum geçişi gerçekleştirmek için **Durum** çağrısı yapar.

**Blok Zinciri** konsensüs ile ilgili bazı bölümlerle de ilgilenir (ör. *bu ethHash doğru mu?*, *bu PoW doğru mu?*). <br /> Bir cümleyle anlatmak gerekirse, **tüm blokların dâhil olduğu mantığın ana çekirdeğidir**.

## *WriteBlocks*

**Blok Zinciri** katmanı ile ilgili en önemli bileşenlerden biri *WriteBlocks* yöntemidir:

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
*WriteBlocks* yöntemi blok zinciri içine blok yazmak için giriş noktasıdır. Parametre olarak bir blok aralığı alır.<br />
Öncelikle, bloklar doğrulanır. Ondan sonra, zincir üzerine yazılır.

Asıl *durum geçişi* *WriteBlocks* içindeki *processBlock* yöntemi çağırılarak gerçekleştirilir.

Blok zincirine blok yazmak için giriş noktası olduğundan, diğer modüllerin (**Mühürleyici** gibi) bu yöntemi kullandığı belirtilmelidir.

## Blok Zinciri Abonelikleri {#blockchain-subscriptions}

Blok zinciri ile ilgili değişiklikleri izlemek için bir yol bulunması gerekir. <br />
Burada **Abonelikler** devreye girer.

Abonelikler, blok zinciri olay akışları ile bağlantı kurmanın ve anında anlamlı veri elde etmenin bir yoludur.

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

**Blok Zinciri Olayları** asıl zincirde yapılan her türlü değişiklik hakkında bilgi içerir. Bu bilgi yeniden yapılandırmaları ve yeni blokları içerir:

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

:::tip Hatırlatma

[CLI Komutları](/docs/edge/get-started/cli-commands) içinde ***monitör*** komutundan bahsettiğimizi hatırlıyor musunuz?

Blok Zinciri Olayları, Polygon Edge içinde gerçekleşen asıl olaylardır ve bunlar daha sonra kolay aktarım için bir Protokol Arabelleği mesaj formatına eşlenirler.

:::
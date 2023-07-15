---
id: blockchain
title: Blockchain
description: Penjelasan modul blockchain dan kondisi Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - blockchain
  - state
---

## Ikhtisar {#overview}

Salah satu modul utama Polygon Edge adalah **Blockchain** dan **Kondisi**.<br />

**Blockchain** adalah pusat aktivitas yang menangani pengaturan ulang blok. Artinya, blockchain berkaitan dengan logika yang terjadi ketika blok baru disertakan ke blockchain.

**Kondisi** mewakili objek *transisi kondisi*. Ini menangani perubahan kondisi ketika ada blok baru disertakan. <br /> **Kondisi** menangani antara lain:
* Mengeksekusi transaksi
* Mengeksekusi EVM
* Mengubah trie Merkle
* Masih banyak lagi yang dicakup dalam bagian **Kondisi** yang terkait 🙂

Poin utamanya yakni 2 bagian ini sangat terkait dan bekerja sama agar klien dapat berfungsi. <br /> Misalnya, ketika lapisan **Blockchain** menerima blok baru (dan tidak terjadi pengaturan ulang), Blockchain memanggil **Kondisi** untuk melakukan transisi kondisi.

**Blockchain** juga harus menangani beberapa bagian yang berkaitan konsensus (mis. *apakah ethHash ini benar?*, *apakah PoW ini benar?*). <br /> Singkatnya, **ini adalah inti utama logika tempat semua blok dimasukkan**.

## *WriteBlock*

Salah satu bagian terpenting yang berkaitan dengan lapisan **Blockchain** adalah metode *WriteBlocks*:

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
Metode *WriteBlocks* adalah titik awal untuk menulis blok ke blockchain. Sebagai parameter, ini dibutuhkan dalam berbagai blok.<br />
Pertama, blok divalidasi. Setelah itu, blok ditulis ke rantai.

*Transisi kondisi* aktual dilakukan dengan memanggil metode *processBlock* di dalam *WriteBlocks*.

Hal ini perlu disebutkan, karena ini titik awal untuk menulis blok ke blockchain, modul lain (seperti **Sealer**) menggunakan metode ini.

## Langganan Blockchain {#blockchain-subscriptions}

Perlu ada cara untuk memantau perubahan terkait blockchain. <br />
Di sinilah peran **Langganan**.

Langagnan (Subscriptions) adalah cara memasukkan aliran peristiwa blockchain dan langsung menerima data yang berarti.

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

**Peristiwa Blockchain** berisi informasi mengenai perubahan yang dibuat ke rantai yang sebenarnya. Ini termasuk pengaturan ulang, serta blok baru:

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

:::tip Kilas Balik

Apakah Anda ingat ketika kami menyebutkan perintah ***monitor*** di [Perintah CLI](/docs/edge/get-started/cli-commands)?

Peristiwa Blockchain adalah peristiwa asli yang terjadi di Polygon Edge, kemudian peristiwa dipetakan ke format pesan Protokol Buffer untuk memudahkan transfer.

:::
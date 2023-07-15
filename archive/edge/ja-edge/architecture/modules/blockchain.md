---
id: blockchain
title: ブロックチェーン
description: ブロックチェーンとPolygon Edgeのステートモジュールに関する説明。
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - blockchain
  - state
---

## 概要 {#overview}

Polygon Edgeのメインモジュールの1つは**ブロックチェーン**と**ステート**です。<br />

**ブロックチェーン**はブロック再編に対応する原動力です。つまり新しいブロックがブロックチェーンに含まれる時に発生するすべてのロジックを扱うことを意味します。

**ステート**は*ステート移行*オブジェクトを表します。新しいブロックが含まれる時にステートがどのように変化するかを扱います。 <br /> 他のことと共に、**ステート**が扱うのは：
* トランザクションの実行
* EVMの実行
* Merkleトライの変更
* 他にも多数ありますが、これは次の**ステート**セクションでカバーされています 🙂

主な要点は、これら2つの部分にかなり関連しており、クライアントが機能するために緊密に連携するということです。 <br /> たとえば、**ブロックチェーン**レイヤーが新しいブロックを受信する（そして再編成が発生していない）場合、**ステート**を呼び出してステート移行を行います。

**ブロックチェーン**はまた、コンセンサス（例、*このethHashは正しいか？*、*このPoWは正しいか？*）関連の部分を扱う必要があります。 <br /> 1文にまとめると、**これはすべてのブロックが含まれるロジックのメインコアです**。

## *WriteBlocks*

**ブロックチェーン**レイヤーに関連する最も重要な部分の1つは *WriteBlocks*メソッドです：

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
*WriteBlocks*メソッドはブロックをブロックチェーンに書き込むエントリーポイントです。パラメータとして、これはブロックの範囲を含めます。<br />
まず、ブロックは検証されます。その後、これはチェーンに書き込まれます。

実際の*ステートの移行*は*processBlock*メソッドを*WriteBlock*内で呼び出すことで実行されます。

ここで触れるべきことは、これがブロックチェーンにブロックを記述する際のエントリーポイントになるために、他のモジュール（**シーラー**など）がこのメソッドを使用することです。

## ブロックチェーンのサブスクリプション {#blockchain-subscriptions}

ブロックチェーン関連の変更を監視する方法が必要となります。 <br />
これが**サブスクリプション**が必要になるところです。

サブスクリプションはブロックチェーンのイベントストリームをタップし、即座に有意義なデータを受け取る方法です。

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

**ブロックチェーンイベント**は実際のチェーンへの変更に関する情報を含んでいます。これには再編成や新しいブロックが含まれます：

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

:::tip 気分を変えて

***モニター***コマンドについて[CLIコマンド](/docs/edge/get-started/cli-commands)で述べた時を覚えていますか？

ブロックチェーンイベントはPolygon Edgeで起こる独自のイベントであり、その後は転送を簡単にするためにプロトコルバッファーメッセージ形式にマッピングされたものです。
:::
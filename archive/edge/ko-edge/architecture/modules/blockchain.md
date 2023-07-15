---
id: blockchain
title: 블록체인
description: Polygon 엣지의 블록체인 및 상태 모듈에 대해 설명합니다.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - blockchain
  - state
---

## 개요 {#overview}

Polygon 엣지의 주요 모듈은 **블록체인** 및 **상태** 모듈입니다. <br />

**블록체인**은 블록 재구성 문제를 다루는 동력원입니다. 즉, 블록체인에 새로운 블록이 포함될 때 발생하는 모든 논리를 다룹니다.

**상태**는 *상태 전환* 객체를 나타냅니다. 새로운 블록이 포함될 때 상태 변화를 다룹니다. <br /> 특히 **상태**는 다음을 처리합니다.
* 트랜잭션 실행
* EVM 실행
* Merkle 트리 변경
* 자세한 내용은 **상태** 섹션에 설명되어 있습니다. 🙂

핵심은 이 두 부분이 밀접하게 연결되어 있고 클라이언트가 작동할 수 있도록 긴밀히 협력한다는 것입니다. <br /> 예를 들어, **블록체인** 레이어에서 새로운 블록을 수신하면(재구성 발생하지 않음) 상태 전환을 수행하도록 **상태**를 호출합니다.

또한, **블록체인**은 합의와 관련된 일부 부분도 다루어야 합니다(예: *이 ethHash가 정확한가?*, *이 PoW가 정확한가?*). <br /> 요약하면, **블록체인은 모든 블록이 포함된 논리의 핵심입니다**.

## *WriteBlocks*

**블록체인** 레이어와 관련된 가장 중요한 부분 중 하나는 *WriteBlocks* 메서드입니다.

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
*WriteBlocks* 메서드는 블록체인에 블록을 작성하는 진입점입니다. 매개변수로서 이 메서드는 다양한 블록을 수용합니다.<br />
우선, 블록을 검증합니다. 그런 다음 체인에 작성합니다.

실제 *상태 전환*은 *WriteBlocks* 내 *processBlock* 메서드를 호출함으로써 수행됩니다.

블록체인에 블록을 작성하기 위한 진입점이므로 다른 모듈(예: **봉인**)도 이 메서드를 활용합니다.

## 블록체인 구독 {#blockchain-subscriptions}

블록체인 관련 변경 사항을 모니터링할 수 있는 방법이 필요하며, <br />
이를 위해 **구독**을 사용할 수 있습니다.

구독을 사용하면 블록체인 이벤트 스트림을 모니터링하고 유의미한 데이터를 즉시 수신할 수 있습니다.

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

**블록체인 이벤트**에는 실제 체인에 발생한 변경 사항과 관련된 정보가 포함되어 있습니다. 여기에는 재구성과 새로운 블록이 포함됩니다.

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

:::tip 복습

[CLI 명령어](/docs/edge/get-started/cli-commands)에서 ***monitor*** 명령어를 설명한 적이 있습니다.

블록체인 이벤트는 Polygon 엣지에서 발생하는 원래 이벤트로, 전송 용이성을 위해 나중에 프로토콜 버퍼 메시지 형식으로 매핑됩니다.

:::
---
id: blockchain
title: Blockchain
description: Giải thích về các mô-đun blockchain và trạng thái của Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - blockchain
  - state
---

## Tổng quan {#overview}

Một trong những mô-đun chính của Polygon Edge là **Blockchain** và **State**. <br />

**Blockchain** là công cụ xử lý các tổ chức lại khối. Điều này có nghĩa là nó xử lý tất cả các logic xảy ra khi một khối mới được đưa vào blockchain.

**State** biểu diễn đối tượng *chuyển tiếp trạng thái*. Nó xử lý cách trạng thái thay đổi khi một khối mới được đưa vào. <br />Trong số những thứ khác, **State** xử lý:
* Thực thi các giao dịch
* Thực thi EVM
* Thay đổi các Merkle Trie
* Thông tin chi tiết được đề cập trong phần **State** tương ứng 🙂

Điểm mấu chốt là 2 phần này kết nối và phối hợp chặt chẽ với nhau để máy khách hoạt động. <br />Ví dụ, khi lớp **Blockchain** nhận được một khối mới (và không có sự sắp xếp lại xảy ra), nó sẽ gọi **State** để thực hiện chuyển tiếp trạng thái.

**Blockchain** cũng phải xử lý một số phần liên quan đến sự đồng thuận (ví dụ: *ethHash này có đúng không?*, *PoW này có đúng không?*). <br />Tóm lại, blockchain **là cốt lõi chính của logic mà thông qua đó, tất cả các khối được kết hợp**.

## *WriteBlocks*

Một trong những phần quan trọng nhất liên quan đến lớp **Blockchain** là phương phức *WriteBlocks*:

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
Phương thức *WriteBlocks* là điểm vào để ghi các khối vào blockchain. Là một tham số, nó hiện diện trong một loạt các khối.<br /> Đầu tiên, các khối được xác thực. Sau đó, chúng được ghi vào chuỗi.

Quá trình *chuyển tiếp trạng thái* thực tế được thực hiện bằng cách gọi phương thức *processBlock* trong *WriteBlocks*.

Điều đáng nói là vì đây là điểm đầu vào để ghi các khối vào blockchain, các mô-đun khác (chẳng hạn như **Sealer**) sử dụng phương pháp này.

## Đăng ký Blockchain {#blockchain-subscriptions}

Cần phải có một cách để theo dõi các thay đổi liên quan đến blockchain. <br />Đây là lúc cần đến **Subscriptions**.

Đăng ký là một cách để khai thác các luồng sự kiện blockchain và ngay lập tức nhận được dữ liệu có ý nghĩa.

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

**Sự kiện Blockchain** chứa thông tin liên quan đến bất kỳ thay đổi nào được thực hiện trên chuỗi thực tế. Điều này bao gồm các tổ chức lại, cũng như các khối mới:

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

:::tip Ôn tập
Bạn có nhớ khi chúng tôi đề cập đến lệnh ***giám sát*** trong [Lệnh CLI](/docs/edge/get-started/cli-commands) không?

Sự kiện Blockchain là những sự kiện ban đầu xảy ra trong Polygon Edge và sau đó chúng được ánh xạ tới định dạng thông báo Bộ đệm giao thức để dễ dàng chuyển giao.
:::
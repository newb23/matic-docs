---
id: json-rpc
title: JSON RPC
description: Giải thích dành cho mô-đun JSON RPC của Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - json-rpc
  - endpoints
---

## Tổng quan {#overview}

Mô-đun **JSON RPC** triển khai lớp **API JSON RPC**, một chức năng mà các nhà phát triển dApp sử dụng để tương tác với blockchain.

Nó bao gồm hỗ trợ cho các **[điểm cuối json-rpc](https://eth.wiki/json-rpc/API)** tiêu chuẩn, cũng như điểm cuối websocket.

## Giao diện Blockchain {#blockchain-interface}

Polygon Edge sử dụng ***giao diện blockchain*** để xác định tất cả các phương thức mà mô-đun JSON RPC cần sử dụng, để cung cấp các điểm cuối của nó.

Giao diện blockchain được thực hiện bằng máy chủ **[Minimal](/docs/edge/architecture/modules/minimal)**. Đây là quá trình triển khai cơ sở được chuyển vào lớp JSON RPC.

````go title="jsonrpc/blockchain.go"
type blockchainInterface interface {
	// Header returns the current header of the chain (genesis if empty)
	Header() *types.Header

	// GetReceiptsByHash returns the receipts for a hash
	GetReceiptsByHash(hash types.Hash) ([]*types.Receipt, error)

	// Subscribe subscribes for chain head events
	SubscribeEvents() blockchain.Subscription

	// GetHeaderByNumber returns the header by number
	GetHeaderByNumber(block uint64) (*types.Header, bool)

	// GetAvgGasPrice returns the average gas price
	GetAvgGasPrice() *big.Int

	// AddTx adds a new transaction to the tx pool
	AddTx(tx *types.Transaction) error

	// State returns a reference to the state
	State() state.State

	// BeginTxn starts a transition object
	BeginTxn(parentRoot types.Hash, header *types.Header) (*state.Transition, error)

	// GetBlockByHash gets a block using the provided hash
	GetBlockByHash(hash types.Hash, full bool) (*types.Block, bool)

	// ApplyTxn applies a transaction object to the blockchain
	ApplyTxn(header *types.Header, txn *types.Transaction) ([]byte, bool, error)

	stateHelperInterface
}
````

## Điểm cuối ETH {#eth-endpoints}

Tất cả các điểm cuối JSON RPC tiêu chuẩn được thực hiện trong:

````bash
jsonrpc/eth_endpoint.go
````

## Trình quản lý bộ lọc {#filter-manager}

**Trình quản lý bộ lọc** là một dịch vụ chạy cùng với máy chủ JSON RPC.

Trình quản lý bộ lọc hỗ trợ việc lọc các khối trên blockchain.<br /> Cụ thể, chức năng này bao gồm cả **nhật ký** và bộ lọc cấp **khối**.

Trình quản lý bộ lọc chủ yếu dựa vào Sự kiện đăng ký, được đề cập trong phần [Blockchain](blockchain#blockchain-subscriptions)

````go title="jsonrpc/filter_manager.go"
type Filter struct {
	id string

	// block filter
	block *headElem

	// log cache
	logs []*Log

	// log filter
	logFilter *LogFilter

	// index of the filter in the timer array
	index int

	// next time to timeout
	timestamp time.Time

	// websocket connection
	ws wsConn
}


type FilterManager struct {
	logger hclog.Logger

	store   blockchainInterface
	closeCh chan struct{}

	subscription blockchain.Subscription

	filters map[string]*Filter
	lock    sync.Mutex

	updateCh chan struct{}
	timer    timeHeapImpl
	timeout  time.Duration

	blockStream *blockStream
}

````

Các sự kiện của Trình quản lý bộ lọc được gửi đi trong phương thức *Run*:

````go title="jsonrpc/filter_manager.go"
func (f *FilterManager) Run() {

	// watch for new events in the blockchain
	watchCh := make(chan *blockchain.Event)
	go func() {
		for {
			evnt := f.subscription.GetEvent()
			if evnt == nil {
				return
			}
			watchCh <- evnt
		}
	}()

	var timeoutCh <-chan time.Time
	for {
		// check for the next filter to be removed
		filter := f.nextTimeoutFilter()
		if filter == nil {
			timeoutCh = nil
		} else {
			timeoutCh = time.After(filter.timestamp.Sub(time.Now()))
		}

		select {
		case evnt := <-watchCh:
			// new blockchain event
			if err := f.dispatchEvent(evnt); err != nil {
				f.logger.Error("failed to dispatch event", "err", err)
			}

		case <-timeoutCh:
			// timeout for filter
			if !f.Uninstall(filter.id) {
				f.logger.Error("failed to uninstall filter", "id", filter.id)
			}

		case <-f.updateCh:
			// there is a new filter, reset the loop to start the timeout timer

		case <-f.closeCh:
			// stop the filter manager
			return
		}
	}
}
````

## 📜 Tài nguyên {#resources}
* **[Ethereum JSON-RPC](https://eth.wiki/json-rpc/API)**

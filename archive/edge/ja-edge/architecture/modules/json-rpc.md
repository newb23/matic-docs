---
id: json-rpc
title: JSON RPC
description: Polygon EdgeのJSON RPCモジュールについて説明します。
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - json-rpc
  - endpoints
---

## 概要 {#overview}

**JSON RPC**モジュールは**JSON RPC APIレイヤー**を実行しますが、これはdApp開発者がブロックチェーンとやり取りするために使用します。

これには標準の**[json-rpcエンドポイント](https://eth.wiki/json-rpc/API)**とwebsocketのエンドポイントが含まれます。

## ブロックチェーンインターフェース {#blockchain-interface}

Polygon Edgeは***ブロックチェーンインターフェース***を使用してJSON RPCモジュールが使用するのに必要なすべてのメソッドを定義することで、そのエンドポイントを提供します。

ブロックチェーンインターフェースは**[Minimal](/docs/edge/architecture/modules/minimal)**サーバーによって実装されます。これは基本の実装でありJSON RPCレイヤーに伝送されます。

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

## ETHエンドポイント {#eth-endpoints}

すべての標準JSON RPCエンドポイントは次に実装されます：

````bash
jsonrpc/eth_endpoint.go
````

## フィルタマネージャ {#filter-manager}

**フィルタマネージャ**はJSON RPCサーバーと並行して実行されるサービスです。

ブロックチェーン上にブロックをフィルタリングするサポートを提供します。<br />
具体的には、**ログ**と**ブロック**レベルフィルタの両方が含まれます。

フィルタマネージャはサブスクリプションイベントに大きく依存しており、これは[ブロックチェーン](blockchain#blockchain-subscriptions)セクションで述べられています。

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

フィルタマネージャイベントは*実行*メソッドで発生します：

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

## 📜 リソース {#resources}
* **[Ethereum JSON-RPC](https://eth.wiki/json-rpc/API)**

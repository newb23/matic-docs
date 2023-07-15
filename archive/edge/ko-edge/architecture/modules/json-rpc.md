---
id: json-rpc
title: JSON RPC
description: Polygon 엣지의 JSON RPC 모듈에 관한 설명.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - json-rpc
  - endpoints
---

## 개요 {#overview}

**JSON RPC** 모듈은 dApp 개발자가 블록체인과 상호작용하는 데 사용하는 **JSON RPC API 레이어**를
구현합니다.

여기에는 표준 **[json-rpc 엔드포인트](https://eth.wiki/json-rpc/API)**와 웹소켓 엔드포인트에 대한 지원이
포함됩니다.

## 블록체인 인터페이스 {#blockchain-interface}

Polygon 엣지는 엔드포인트를 전달하기 위해, ***블록체인 인터페이스***를 사용하여 JSON RPC 모듈이 사용해야 하는 모든 메서드를 정의합니다.

블록체인 인터페이스는 **[Minimal](/docs/edge/architecture/modules/minimal)** 서버에서 구현됩니다. JSON RPC 레이어로 전달되는
기본 구현입니다.

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

## ETH 엔드포인트 {#eth-endpoints}

모든 표준 JSON RPC 엔드포인트는 다음에서 구현됩니다.

````bash
jsonrpc/eth_endpoint.go
````

## 필터 관리자 {#filter-manager}

**필터 관리자**는 JSON RPC 서버와 함께 실행되는 서비스입니다.

블록체인에서 블록 필터링을 지원합니다.<br />
구체적으로 **로그**와 **블록** 수준 필터가 모두 포함되어 있습니다.

필터 관리자는 구독 이벤트에 크게 의존하며,
이는 [블록체인](blockchain#blockchain-subscriptions) 섹션에 설명되어 있습니다.

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

필터 관리자 이벤트는 *실행* 메서드에서 디스패치됩니다.

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

## 📜 리소스 {#resources}
* **[이더리움 JSON-RPC](https://eth.wiki/json-rpc/API)**

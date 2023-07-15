---
id: json-rpc
title: JSON RPC
description: Polygon Edge'in JSON RPC modülünün açıklaması.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - json-rpc
  - endpoints
---

## Genel Bakış {#overview}

**JSON RPC** modülü, dApp geliştiricilerin blok zinciri ile etkileşim kurmakta kullandığı **JSON RPC API katmanını**
uygular.

Standart **[json-rpc uç noktaların](https://eth.wiki/json-rpc/API)** yanında websocket uç noktaları için destek
içerir.

## Blok Zinciri Arabirimi {#blockchain-interface}

Polygon Edge, JSON RPC modülünün kullanması gereken tüm yöntemleri tanımlamak için ***blok zinciri*** arabirimini kullanarak
uç noktalarını sunar.

Blok zinciri arabirimi **[Minimal](/docs/edge/architecture/modules/minimal)** sunucusu tarafından uygulanır. Bu, JSON RPC katmanına geçirilen
temel uygulamadır.

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

## ETH Uç noktaları {#eth-endpoints}

Tüm standart JSON RPC uç noktaları şurada uygulanır:

````bash
jsonrpc/eth_endpoint.go
````

## Filtre Yöneticisi {#filter-manager}

**Filtre Yöneticisi**, JSON RPC sunucusunun yanında çalışan bir hizmettir.

Blok zinciri üzerinde blok filtreleme için destek sağlar.<br />
Özel olarak, bir **günlük** ve **blok** seviyesi filtre içerir.

Filtre Yöneticisi büyük ölçüde Abonelik Olayları'na dayanır; bu konuya
[Block Zinciri](blockchain#blockchain-subscriptions) bölümünde değinilmiştir

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

Filtre Yöneticisi *Run* yöntemi ile görevlendirilir:

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

## 📜 Kaynaklar {#resources}
* **[Ethereum JSON-RPC](https://eth.wiki/json-rpc/API)**

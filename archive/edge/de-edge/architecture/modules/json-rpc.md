---
id: json-rpc
title: JSON RPC
description: Erläuterung für das JSON-RPC-Modul von Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - json-rpc
  - endpoints
---

## Übersicht {#overview}

Das **JSON RPC** Modul implementiert die **JSON RPC API-Ebene**, was dApp Entwickler verwenden, um mit der Blockchain zu interagieren.

Es enthält Unterstützung für normale **[json-rpc Endpoints](https://eth.wiki/json-rpc/API)**, sowie für Websocket Endpoints.

## Blockchain-Schnittstelle {#blockchain-interface}

Das Polygon Edge verwendet die ***Blockchain Schnittstelle***, um alle Methoden zu definieren, die das JSON-RPC-Modul verwenden muss, um seine Endpoints bereitzustellen.

Die Blockchain-Schnittstelle wird vom **[Minimal](/docs/edge/architecture/modules/minimal)** Server implementiert. Es ist die Basisimplementierung die in die JSON-RPC-Ebene übergeben wird.

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

## ETH Endpoints {#eth-endpoints}

Alle Standard JSON-RPC-Endpoints sind implementiert in:

````bash
jsonrpc/eth_endpoint.go
````

## Filter-Manager {#filter-manager}

Der **Filter Manager** ist ein Service, der neben dem JSON-RPC-Server läuft.

Es bietet Unterstützung für das Filtern von Blöcken auf der <br />Blockchain. Insbesondere enthält er sowohl ein **Protokoll** als auch einen **Block** Level Filter.

Der Filter Manager stützt sich stark auf Subscription Events, die im [Blockchain](blockchain#blockchain-subscriptions) Abschnitt

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

Filter Manager Events in der *Run* Methode ausgeliefert werden:

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

## 📜 Ressourcen {#resources}
* **[Ethereum JSON-RPC](https://eth.wiki/json-rpc/API)**

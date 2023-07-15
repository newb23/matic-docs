---
id: json-rpc
title: JSON RPC
description: Spiegazione per il modulo JSON RPC di Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - json-rpc
  - endpoints
---

## Panoramica {#overview}

Il modulo **JSON RPC** implementa il **layer API JSON RPC**, una cosa che gli sviluppatori di dApp usano per interagire con la blockchain.

Include il supporto per **[gli endpoint standard json-rpc](https://eth.wiki/json-rpc/API)** e anche quello degli endpoint websocket.

## Interfaccia blockchain {#blockchain-interface}

Polygon Edge usa l'***interfaccia blockchain*** per definire tutti i metodi che il modulo JSON RPC deve utilizzare, per fornire i suoi endpoint.

L'interfaccia blockchain è implementata dal server **[Minimal](/docs/edge/architecture/modules/minimal)**. È l'implementazione base che è passata nel layer RPC JSON.

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

## Endpoint ETH {#eth-endpoints}

Tutti gli endpoint standard JSON RPC sono implementati in:



````bash
jsonrpc/eth_endpoint.go
````

## Gestione Filtro

 {#filter-manager}

La **Gestione del Filtro** è un servizio che viene eseguito insieme al server JSON RPC.

Fornisce il supporto per il filtraggio dei blocchi sulla blockchain. <br />In particolare, include sia un filtro a livello di **log** che **di blocco**.

La Gestione del Filtro si basa molto sugli eventi di sottoscrizione, menzionati
 nella sezione [Blockchain](blockchain#blockchain-subscriptions)

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

Gli eventi della Gestione del Filtro vengono distribuiti nel metodo *Esegui*:

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

## 📜 Risorse {#resources}
* **[Ethereum JSON-RPC](https://eth.wiki/json-rpc/API)**

---
id: json-rpc
title: JSON RPC
description: Explication pour le module JSON RPC de Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - json-rpc
  - endpoints
---

## Aperçu {#overview}

Le module **JSON RPC** implémente la **couche API JSON RPC**, ce truc que les développeurs d'App utilisent pour interagir avec blockchain.

Cela inclut la prise en charge des **[points de terminaison json-rpc](https://eth.wiki/json-rpc/API)** standard, ainsi que du websocket points de terminaison.

## Interface de Blockchain {#blockchain-interface}

Polygon Edge utilise ***l'interface de blockchain*** pour définir toutes les méthodes que le module JSON RPC doit utiliser, dans commander pour livrer les points de terminaison.

L'interface de blockchain est implémentée par le serveur **[Minimal](/docs/edge/architecture/modules/minimal)**. C'est la mise en oeuvre de base qui est passée dans la couche JSON RPC.

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

## Les Points de Terminaison ETH {#eth-endpoints}

Tous les points de terminaison JSON RPC standard sont implémentés dans:

````bash
jsonrpc/eth_endpoint.go
````

## Gestionnaire de Filtre {#filter-manager}

Le **Gestionnaire de Filtre** est un service qui s'exécute à côté du serveur JSON RPC.

Cela fournit un support pour filtrer les blocs sur la blockchain.<br /> Plus précisément, cela inclut à la fois un **journal** et un **bloc** de filtre de niveau.

Le Gestionnaire de Filtre s'appuie fortement sur les Événements d'Abonnement, mentionnés dans La section de [Blockchain](blockchain#blockchain-subscriptions)

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

Les événements du Gestionnaire de Filtre sont envoyés dans la méthode *Exécuter* :

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

## 📜 Ressources {#resources}
* **[Ethereum JSON-RPC](https://eth.wiki/json-rpc/API)**

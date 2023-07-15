---
id: json-rpc
title: RPC JSON
description: Explicación del módulo RPC JSON de Polygon Edge
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - json-rpc
  - endpoints
---

## Descripción general {#overview}

El módulo **RPC JSON** implementa la **capa de la API RPC JSON**, algo que los desarrolladores de aplicaciones descentralizadas (dApp) usan para interactuar con la
cadena de bloques.

Incluye soporte para las **[terminales RPC JSON](https://eth.wiki/json-rpc/API)** estándar, al igual que para
las terminales de los websockets.

## Interfaz de la cadena de bloques {#blockchain-interface}

Polygon Edge usa la ***interfaz de la cadena de bloques*** para definir todos los métodos que el módulo RPC JSON necesita utilizar
para entregar sus terminales.

La interfaz de la cadena de bloques es implementada por el servidor **[Minimal](/docs/edge/architecture/modules/minimal)**. Es la implementación base
que pasa a la capa RPC JSON.

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

## Terminales de ETH {#eth-endpoints}

Todas las terminales estándar de RPC JSON se implementan en:

````bash
jsonrpc/eth_endpoint.go
````

## Filter Manager {#filter-manager}

**Filter Manager** (Administrador de filtros) es un servicio que se ejecuta junto al servidor RPC JSON.

Da soporte para filtrar bloques en la cadena de bloques.<br />
Específicamente, incluye un filtro de niveles de los**registros** y de los **bloques**.

Filter Manager depende en gran medida de los eventos de suscripción, mencionados en
la sección [cadena de bloques](blockchain#blockchain-subscriptions).

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

Los eventos de Filter Manager se ejecutan desde el método *Run* (Ejecutar):

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

## 📜 Recursos {#resources}
* **[Ethereum RPC JSON](https://eth.wiki/json-rpc/API)**

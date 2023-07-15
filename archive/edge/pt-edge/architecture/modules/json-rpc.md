---
id: json-rpc
title: JSON RPC
description: Explicação para o módulo JSON RPC do Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - json-rpc
  - endpoints
---

## Visão geral {#overview}

O módulo **JSON RPC** implementa a **camada API JSON RPC**, algo que os programadores dApp usam para interagir com o
blockchain.

Ele inclui suporte para **[endpoints json-rpc](https://eth.wiki/json-rpc/API)** padrão, bem como endpoints de
websockets.

## Interface de blockchain {#blockchain-interface}

O Polygon Edge usa a ***interface de blockchain*** para definir todos os métodos que o módulo JSON RPC precisa usar,
para fornecer os seus endpoints.

A interface do blockchain é implantada pelo servidor **[Mínimo](/docs/edge/architecture/modules/minimal)**. É a implantação de base
que é transmitida para a camada JSON RPC.

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

## Endpoints ETH {#eth-endpoints}

Todos os endpoints de JSON RPC padrão são implantados em:

````bash
jsonrpc/eth_endpoint.go
````

## Gerenciador de filtros {#filter-manager}

O **Gerenciador de filtros** é um serviço que é executado com o servidor JSON RPC.

Ele permite filtrar blocos no blockchain.<br />
Especificamente, ele inclui um **log** e um filtro no nível dos **blocos**.

O Gerenciador de filtros se baseia fortemente em eventos de assinatura, mencionados
na seção [Blockchain](blockchain#blockchain-subscriptions)

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

Os eventos do Gerenciador de filtros são enviados no método *Execução*:

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
* **[Ethereum JSON-RPC](https://eth.wiki/json-rpc/API)**

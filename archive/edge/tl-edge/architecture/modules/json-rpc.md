---
id: json-rpc
title: JSON RPC
description: Paliwanag para sa JSON RPC module ng Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - json-rpc
  - endpoints
---

## Pangkalahatang-ideya {#overview}

Ipinapatupad ng **JSON RPC** module ang **layer ng JSON RPC API**, isang bagay na ginagamit ng mga dApp developer para makipag-interaksyon sa
blockchain.

Kasama rito ang suporta para sa mga standard na **[json-rpc endpoint](https://eth.wiki/json-rpc/API)**, at mga websocket
endpoint.

## Interface ng Blockchain {#blockchain-interface}

Ginagamit ng Polygon Edge ang ***interface ng blockchain*** para tukuyin ang lahat ng paraan na kinakailangang gamitin ng JSON RPC module, para
maihatid ang mga endpoint nito.

Ang interface ng blockchain ay ipinapatupad ng **[Minimal](/docs/edge/architecture/modules/minimal)** server. Ito ang base ng pagpapatupad
na ipinapasa sa layer ng JSON RPC.

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

## Mga ETH Endpoint {#eth-endpoints}

Ang lahat ng standard na JSON RPC endpoint ay ipinapatupad sa:

````bash
jsonrpc/eth_endpoint.go
````

## Filter Manager {#filter-manager}

Ang **Filter Manager** ay isang serbisyo na tumatakbo kasama ng JSON RPC server.

Nagbibigay ito ng suporta para sa pag-filter ng mga block sa blockchain.<br />
Sa partikular, may kasama itong **log** at isang **block** level filter.

Lubos na ginagamit ng Filter Manager ang mga Event ng Subscription, na nabanggit sa
seksyong [Blockchain](blockchain#blockchain-subscriptions)

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

Dini-dispatch ang mga event ng Filter Manager sa paraang *Run*:

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

## 📜 Mga Resource {#resources}
* **[Ethereum JSON-RPC](https://eth.wiki/json-rpc/API)**

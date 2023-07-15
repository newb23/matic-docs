---
id: json-rpc
title: JSON RPC
description: पॉलीगॉन एज के JSON RPC मॉड्यूल के लिए स्पष्टीकरण.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - json-rpc
  - endpoints
---

## ओवरव्यू {#overview}

**JSON RPC** मॉड्यूल **JSON RPC API लेयर** को लागू करता है, जो dapp डेवलपर्स ब्लॉकचेन के साथ इंटरैक्ट करने के लिए
करते हैं.

इसमें वेबसॉकेट एंडपॉइंट सहित मानक **[json-rpc एंडपॉइंट](https://eth.wiki/json-rpc/API)** के लिए सहायता भी शामिल
होती है.

## ब्लॉकचेन इंटरफ़ेस {#blockchain-interface}

पॉलीगॉन एज JSON RPC मॉड्यूल द्वारा इस्तेमाल किए जाने वाले सभी तरीकों को डिफ़ाइन करने के लिए ***ब्लॉकचेन इंटरफ़ेस*** का इस्तेमाल करता है,
ताकि इसके एंडपॉइंट को ऑर्डर किया जा सके.

ब्लॉकचेन इंटरफ़ेस **[मिनिमल](/docs/edge/architecture/modules/minimal)** सर्वर द्वारा लागू होता है. यह बेस इम्प्लीमेंटेशन होता है
जिसे JSON RPC लेयर में पास किया जाता है.

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

## ETH एंडपॉइंट्स {#eth-endpoints}

सभी मानक JSON RPC एंडपॉइंट को लागू किया जाता है:

````bash
jsonrpc/eth_endpoint.go
````

## फ़िल्टर मैनेजर में {#filter-manager}

**फिल्टर मैनेजर** वह सेवा है जो JSON RPC सर्वर के साथ रन होती है.

यह ब्लॉकचेन पर फ़िल्टरिंग ब्लॉक को सहायता प्रदान करता है.<br />
विशेष रूप से, इसमें दोनों **लॉग** और **ब्लॉक** लेवल के फिल्टर होते हैं.

फिल्टर मैनेजर सब्सक्रिप्शन इवेंट्स पर काफी हद तक निर्भर करता है
[जिसका उल्लेख ब्लॉकचेन](blockchain#blockchain-subscriptions) सेक्शन में किया गया है

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

फ़िल्टर मैनेजर इवेंट *रन* करने के तरीकों में भेजे जाते हैं:

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

## 📜 संसाधन {#resources}
* **[Ethereum JSON-RPC](https://eth.wiki/json-rpc/API)**

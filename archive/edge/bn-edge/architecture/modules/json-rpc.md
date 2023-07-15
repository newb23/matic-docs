---
id: json-rpc
title: JSON RPC
description: Polygon Edge-এর JSON RPC মডিউলের ব্যাখ্যা।
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - json-rpc
  - endpoints
---

## সংক্ষিপ্ত বিবরণ {#overview}

**JSON RPC** মডিউল **JSON RPC API লেয়ার** ইমপ্লিমেন্ট করে, যা dApp ডেভেলপাররা ব্লকচেইনের সাথে ইন্টারঅ্যাক্ট করতে
ব্যবহার করে।

এটি স্ট্যান্ডার্ড **[json-rPC এন্ডপয়েন্ট](https://eth.wiki/json-rpc/API)**, সেইসাথে ওয়েবসকেট এন্ডপয়েন্টও
সমর্থন করে।

## ব্লকচেইন ইন্টারফেস {#blockchain-interface}

Polygon Edge তার এন্ডপয়েন্ট ডেলিভার করতে, JSON RPC মডিউলের ব্যবহার করা সকল পদ্ধতি সংজ্ঞায়িত করতে ***ব্লকচেইন ইন্টারফেস***
ব্যবহার করে।

ব্লকচেইন ইন্টারফেস **[মিনিমাল](/docs/edge/architecture/modules/minimal)** সার্ভার দিয়ে ইমপ্লিমেন্ট করা হয়। এটি হচ্ছে ভিত্তি ইমপ্লিমেন্টেশন
যা JSON RPC লেয়ার পাস করা হয়।

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

## ETH এন্ডপয়েন্ট {#eth-endpoints}

সমস্ত স্ট্যান্ডার্ড JSON RPC এন্ডপয়েন্ট এতে প্রয়োগ করা হয়:

````bash
jsonrpc/eth_endpoint.go
````

## ফিল্টার ম্যানেজার {#filter-manager}

**ফিল্টার ম্যানেজার** একটি পরিষেবা যা JSON RPC সার্ভারের পাশাপাশি রান করে।

এটি ব্লকচেইনে ব্লক ফিল্টার করতে সহায়তা প্রদান করে।<br />
বিশেষ করে, এতে **লগ** এবং **ব্লক** লেভেল ফিল্টার উভয়ই অন্তর্ভুক্ত।

ফিল্টার ম্যানেজার সাবস্ক্রিপশন ইভেন্টে ব্যাপকভাবে নির্ভর করে, যা
[ব্লকচেইন](blockchain#blockchain-subscriptions) বিভাগে উল্লেখ করা হয়েছিল

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

ফিল্টার ম্যানেজার ইভেন্ট *রান* পদ্ধতিতে প্রেরিত করা হয়:

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

## 📜 রিসোর্স {#resources}
* **[Ethereum JSON-RPC](https://eth.wiki/json-rpc/API)**

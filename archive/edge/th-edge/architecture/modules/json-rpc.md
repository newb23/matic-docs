---
id: json-rpc
title: JSON RPC
description: คำอธิบายเกี่ยวกับโมดูล JSON RPC ของ Polygon Edge
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - json-rpc
  - endpoints
---

## ภาพรวม {#overview}

โมดูล **JSON RPC** ใช้ **เลเยอร์ JSON RPC API** ซึ่งเป็นสิ่งที่นักพัฒนา dApp ใช้ในการโต้ตอบกับบล็อกเชน

โมดูลดังกล่าวรองรับ **[json-rpc Endpoint](https://eth.wiki/json-rpc/API)** มาตรฐานและ websocketEndpoint

## อินเทอร์เฟซของบล็อกเชน {#blockchain-interface}

Polygon Edge ใช้***อินเทอร์เฟซของบล็อกเชน*** เพื่อกำหนดเมธอดทั้งหมดที่โมดูล JSON RPC จำเป็นต้องใช้เพื่อส่งมอบ Endpoint

เซิร์ฟเวอร์ **[Minimal](/docs/edge/architecture/modules/minimal)** จะนำอินเทอร์เฟซของบล็อกเชนมาใช้ซึ่งเป็นการนำไปใช้พื้นฐานที่ผ่านเข้าสู่เลเยอร์ JSON RPC

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

## ETH Endpoint {#eth-endpoints}

JSON RPC Endpoint มาตรฐานทั้งหมดจะได้รับการนำไปใช้ใน:

````bash
jsonrpc/eth_endpoint.go
````

## ตัวจัดการตัวกรอง {#filter-manager}

**ตัวจัดการตัวกรอง**เป็นบริการที่ทำงานควบคู่ไปกับเซิร์ฟเวอร์ JSON RPC

ซึ่งจะให้การรองรับการกรองบล็อกบนบล็อกเชน<br />ยิ่งไปกว่านั้น ยังรวมถึงตัวกรองมีทั้งตัวกรองระดับ **log** และ **block**

ตัวจัดการตัวกรองอาศัยอีเวนต์การสมัครติดตามที่กล่าวถึงในส่วน[บล็อกเชน](blockchain#blockchain-subscriptions)อย่างมาก

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

อีเวนต์ตัวจัดการตัวกรองจะได้รับการส่งในเมธอด *Run*:

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

## ทรัพยากร 📜 {#resources}
* **[Ethereum JSON-RPC](https://eth.wiki/json-rpc/API)**

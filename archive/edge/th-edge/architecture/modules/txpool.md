---
id: txpool
title: TxPool
description: คำอธิบายเกี่ยวกับโมดูล TxPool ของ Polygon Edge
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - TxPool
  - transaction
  - pool
---

## ภาพรวม {#overview}

โมดูล TxPool แสดงให้เห็นถึงการนำพูลธุรกรรมไปใช้ โดยมีการเพิ่มธุรกรรมจากส่วนต่างๆ ของระบบโมดูลนี้ยังประกอบด้วยคุณสมบัติบางอย่างที่มีประโยชน์ต่อตัวดำเนินการโหนด ซึ่งระบุไว้ด้านล่าง

## คำสั่งสำหรับตัวดำเนินการ {#operator-commands}

````go title="txpool/proto/operator.proto
service TxnPoolOperator {
    // Status returns the current status of the pool
    rpc Status(google.protobuf.Empty) returns (TxnPoolStatusResp);

    // AddTxn adds a local transaction to the pool
    rpc AddTxn(AddTxnReq) returns (google.protobuf.Empty);

    // Subscribe subscribes for new events in the txpool
    rpc Subscribe(google.protobuf.Empty) returns (stream TxPoolEvent);
}

````

ตัวดำเนินการโหนดสามารถค้นหา GRPC Endpoint เหล่านี้ได้ ตามรายละเอียดที่ปรากฏตามส่วน**[คำสั่ง CLI](/docs/edge/get-started/cli-commands#transaction-pool-commands)**

## การประมวลผลธุรกรรม {#processing-transactions}

````go title="txpool/txpool.go"
// AddTx adds a new transaction to the pool
func (t *TxPool) AddTx(tx *types.Transaction) error {
	if err := t.addImpl("addTxn", tx); err != nil {
		return err
	}

	// broadcast the transaction only if network is enabled
	// and we are not in dev mode
	if t.topic != nil && !t.dev {
		txn := &proto.Txn{
			Raw: &any.Any{
				Value: tx.MarshalRLP(),
			},
		}
		if err := t.topic.Publish(txn); err != nil {
			t.logger.Error("failed to topic txn", "err", err)
		}
	}

	if t.NotifyCh != nil {
		select {
		case t.NotifyCh <- struct{}{}:
		default:
		}
	}
	return nil
}

func (t *TxPool) addImpl(ctx string, txns ...*types.Transaction) error {
	if len(txns) == 0 {
		return nil
	}

	from := txns[0].From
	for _, txn := range txns {
		// Since this is a single point of inclusion for new transactions both
		// to the promoted queue and pending queue we use this point to calculate the hash
		txn.ComputeHash()

		err := t.validateTx(txn)
		if err != nil {
			return err
		}

		if txn.From == types.ZeroAddress {
			txn.From, err = t.signer.Sender(txn)
			if err != nil {
				return fmt.Errorf("invalid sender")
			}
			from = txn.From
		} else {
			// only if we are in dev mode we can accept
			// a transaction without validation
			if !t.dev {
				return fmt.Errorf("cannot accept non-encrypted txn")
			}
		}

		t.logger.Debug("add txn", "ctx", ctx, "hash", txn.Hash, "from", from)
	}

	txnsQueue, ok := t.queue[from]
	if !ok {
		stateRoot := t.store.Header().StateRoot

		// initialize the txn queue for the account
		txnsQueue = newTxQueue()
		txnsQueue.nextNonce = t.store.GetNonce(stateRoot, from)
		t.queue[from] = txnsQueue
	}
	for _, txn := range txns {
		txnsQueue.Add(txn)
	}

	for _, promoted := range txnsQueue.Promote() {
		t.sorted.Push(promoted)
	}
	return nil
}
````
***addImpl*** เป็นเมธอดที่ใช้กับโมดูล **TxPool** เป็นหลักโดยถือเป็นศูนย์กลางที่มีการเพิ่มธุรกรรมลงในระบบ โดยมีการเรียกใช้จากบริการ GRPC, JSON RPC Endpointและเมื่อไคลเอ็นต์ได้รับธุรกรรมผ่านโปรโตคอล **Gossip**

ธุรกรรมนั้นกลายเป็นอาร์กิวเมนต์ **ctx** ซึ่งกำหนดบริบทที่เป็นแหล่งที่มาของธุรกรรม (เช่น GRPC, JSON RPC เป็นต้น) <br />พารามิเตอร์อื่นคือรายการธุรกรรมซึ่งได้รับการเพิ่มลงในพูล

ประเด็นหลักที่ต้องจำไว้ในส่วนนี้ คือการตรวจสอบฟิลด์ **From** ในธุรกรรม:
* หากฟิลด์ **From** **ไม่ปรากฏข้อมูล** จะถือว่าเป็นธุรกรรมที่ยังไม่เข้ารหัส/ลงนามธุรกรรมประเภทเหล่านี้รับได้เฉพาะในโหมดการพัฒนา
* หากฟิลด์ **From** ** ปรากฏข้อมูล ** จะถือว่าเป็นธุรกรรมที่ลงนามแล้ว จึงมีการดำเนินการตรวจสอบความถูกต้องของลายเซ็นนั้น

หลังจากมีการดำเนินการตรวจสอบความถูกต้องนั้นแล้ว ถือว่าธุรกรรมมีผลสมบูรณ์

## โครงสร้างข้อมูล {#data-structures}

````go title="txpool/txpool.go"
// TxPool is a pool of transactions
type TxPool struct {
	logger hclog.Logger
	signer signer

	store      store
	idlePeriod time.Duration

	queue map[types.Address]*txQueue
	sorted *txPriceHeap

	// network stack
	network *network.Server
	topic   *network.Topic

	sealing  bool
	dev      bool
	NotifyCh chan struct{}

	proto.UnimplementedTxnPoolOperatorServer
}
````

ฟิลด์ต่างๆ ในอ็อบเจ็กต์ TxPool ซึ่งอาจทำให้เกิดความสับสนได้ คือ รายการ **queue** และ **sorted**
* **queue** - การนำรายการธุรกรรมบัญชีแบบเรียงลำดับไปใช้เป็นจำนวนมาก (โดยใช้ nonce)
* **sorted** - รายการธุรกรรมที่ปรับให้เผยแพร่ได้ในปัจจุบันทั้งหมดแบบเรียงลำดับ (ธุรกรรมทั้งหมดที่สามารถดำเนินการได้)โดยเรียงลำดับตามราคาแก๊ส

## การจัดการข้อผิดพลาดเกี่ยวกับขีดจำกัดค่าแก๊ส {#gas-limit-error-management}

เมื่อคุณส่งธุรกรรม TxPool จะสามารถประมวลผลธุรกรรมนั้นได้ 3 รูปแบบ

1. ธุรกรรมที่ค้างอยู่ทั้งหมดสามารถใส่ลงในบล็อกได้
2. ธุรกรรมที่ค้างอยู่อย่างน้อยหนึ่งรายการไม่สามารถใส่ลงในบล็อกได้
3. ธุรกรรมที่ค้างอยู่อย่างน้อยหนึ่งรายการจะไม่สามารถใส่ลงในบล็อกได้เลย

ในที่นี้ คำว่า **_ใส่ได้_** หมายถึง ธุรกรรมมีขีดจำกัดค่าแก๊ส (Gas Limit) ที่ต่ำกว่าค่าแก๊ส (Gas) ที่เหลืออยู่ใน TxPool

สถานการณ์แรกไม่ได้สร้างข้อผิดพลาดใด

### สถานการณ์ที่สอง {#second-scenario}

- กำหนดค่าแก๊สที่เหลืออยู่ใน TxPool เป็นขีดจำกัดค่าแก๊สของบล็อกล่าสุด เช่น **5000** หน่วย
- ประมวลผลธุรกรรมแรก และใช้ค่าแก๊สของ TxPool **3000** หน่วย
  - ตอนนี้ TxPool มีค่าแก๊สคงเหลือ **2000** หน่วย
- ส่งธุรกรรมที่สอง ซึ่งมีค่าเท่ากันกับธุรกรรมแรก กล่าวคือ ธุรกรรมทั้งสองต่างใช้ค่าแก๊ส 3000 หน่วย
- เนื่องจากค่าแก๊สที่เหลืออยู่ใน TxPool **ต่ำกว่า**ค่าแก๊สสำหรับธุรกรรม จึงไม่สามารถประมวลผลได้ในบล็อกปัจจุบัน
  - จึงมีการนำกลับไปไว้ในคิวธุรกรรมที่ค้างอยู่ เพื่อสามารถประมวลผลได้ในบล็อกถัดไป
- เขียนบล็อกแรก และเรียกบล็อกนั้นว่า **block #1**
- กำหนดค่าแก๊สที่เหลืออยู่ใน TxPool ให้กับบล็อกหลัก ซึ่งเป็นขีดจำกัดค่าแก๊สของ **block #1**
- คราวนี้ก็จะมาประมวลผลธุรกรรมซึ่งได้รับการนำกลับไปไว้ในคิวธุรกรรมที่ค้างอยู่ของ TxPool และเขียนลงในบล็อก
  - ขณะนี้ ค่าแก๊สที่เหลืออยู่ใน TxPool คือ **2000** หน่วย
- เขียนบล็อกที่สอง
- ...

![สถานการณ์ที่เกิดข้อผิดพลาดของ TxPool แบบที่ 1](/img/edge/txpool-error-1.png)

### สถานการณ์ที่สาม {#third-scenario}
- กำหนดค่าแก๊สที่เหลืออยู่ใน TxPool เป็นขีดจำกัดค่าแก๊สของบล็อกล่าสุด เช่น **5000** หน่วย
- ประมวลผลธุรกรรมแรก และใช้ค่าแก๊สของ TxPool **3000** หน่วย
    - ตอนนี้ TxPool มีค่าแก๊สคงเหลือ **2000** หน่วย
- ส่งธุรกรรมที่สอง ซึ่งมีการกำหนดค่าแก๊สไว้ที่ **6000** หน่วย
- เนื่องจากขีดจำกัดค่าแก๊สต่อบล็อก**ต่ำกว่า**ค่าแก๊สสำหรับธุรกรรม จึงมีการปฏิเสธธุรกรรมนั้น
    - ซึ่งไม่สามารถใส่ลงในบล็อกได้เลย
- เขียนบล็อกแรก
- ...


![สถานการณ์ที่เกิดข้อผิดพลาดของ TxPool แบบที่ 2](/img/edge/txpool-error-2.png)

> สถานการณ์นี้เกิดขึ้นเมื่อคุณได้รับข้อความแสดงข้อผิดพลาดต่อไปนี้:
> ```shell
> 2021-11-04T15:41:07.665+0100 [ERROR] polygon.consensus.dev: failed to write transaction: transaction's gas limit exceeds block gas limit
> ```

## เป้าหมายค่าแก๊สต่อบล็อก {#block-gas-target}

อาจมีสถานการณ์ต่างๆ ที่โหนดต้องการคงขีดจำกัดค่าแก๊สต่อบล็อกให้ต่ำกว่าหรืออยู่ที่ค่าเป้าหมายที่เจาะจงในเชนที่ใช้งานอยู่

ตัวดำเนินการโหนดสามารถกำหนดขีดจำกัดค่าแก๊สเป้าหมายได้ในโหนดใดโหนดหนึ่ง ซึ่งจะพยายามนำขีดจำกัดนี้มาใช้กับบล็อกที่สร้างขึ้นมาใหม่
หากโหนดอื่นๆ ส่วนใหญ่ก็มีการกำหนดขีดจำกัดค่าแก๊สเป้าหมายที่คล้ายกัน (หรือเท่ากัน) ไว้แล้ว ขีดจำกัดค่าแก๊สต่อบล็อกจะอยู่ใกล้เคียงกับ
เป้าหมายค่าแก๊สต่อบล็อกเสมอ ซึ่งจะค่อยๆ เข้าใกล้ค่าดังกล่าว (สูงสุดที่ `1/1024 * parent block gas limit`) เมื่อมีการสร้างบล็อกใหม่ๆ

### สถานการณ์ตัวอย่าง {#example-scenario}

* ตัวดำเนินการโหนดจะกำหนดขีดจำกัดค่าแก๊สต่อบล็อกสำหรับโหนดหนึ่งเป็น `5000`
* ส่วนโหนดอื่นๆ มีการกำหนดค่า `5000` เช่นเดียวกัน นอกเหนือจากโหนดเดี่ยว ซึ่งกำหนดค่าเป็น `7000`
* เมื่อบรรดาโหนดซึ่งกำหนดเป้าหมายค่าแก๊สเป็น `5000` กลายเป็นผู้เสนอ พวกเขาจะตรวจสอบว่าขีดจำกัดค่าแก๊สถึงค่าเป้าหมายหรือยัง
* หากขีดจำกัดค่าแก๊สยังไม่ได้เท่ากับเป้าหมาย (สูงกว่า / ต่ำกว่าเป้าหมาย) โหนดผู้เสนอจะกำหนดเป้าหมายค่าแก๊สต่อบล็อกเป็นค่าสูงที่สุด (1/1024 * ขีดจำกัดค่าแก๊สหลัก) ในคำสั่งของเป้าหมาย
   1. ตัวอย่าง `parentGasLimit = 4500` และ `blockGasTarget = 5000`ผู้เสนอจะคำนวณขีดจำกัดค่าแก๊สสำหรับบล็อกใหม่เป็น `4504.39453125` (`4500/1024 + 4500`)
   2. ตัวอย่าง `parentGasLimit = 5500` และ `blockGasTarget = 5000`ผู้เสนอจะคำนวณขีดจำกัดค่าแก๊สสำหรับบล็อกใหม่เป็น `5494.62890625` (`5500 - 5500/1024`)
* ซึ่งจะทำให้มั่นใจว่าขีดจำกัดค่าแก๊สต่อบล็อกของเชนจะคงอยู่ที่ค่าเป้าหมาย เนื่องจากผู้เสนอรายเดี่ยวซึ่งได้กำหนดค่าเป้าหมายเป็น `7000` ไม่สามารถเพิ่มขีดจำกัดได้มากนัก และส่วนใหญ่ของโหนดซึ่งกำหนดค่าไว้เป็น `5000` จะพยายามคงค่าไว้ที่เท่านั้นเสมอ
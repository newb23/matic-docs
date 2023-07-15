---
id: txpool
title: TxPool
description: Giải thích về mô-đun TxPool của Polygon Edge.
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

## Tổng quan {#overview}

Mô-đun TxPool đại diện cho quá trình triển khai nhóm giao dịch, nơi các giao dịch được thêm vào từ các phần khác nhau của
 hệ thống. Mô-đun cũng cung cấp một số tính năng hữu ích dành cho trình vận hành nút, sẽ được giải thích thêm được bên dưới.

## Lệnh của trình vận hành {#operator-commands}

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

Trình vận hành nút có thể truy vấn các điểm điểm cuối của GRPC như mô tả trong phần **[Lệnh CLI](/docs/edge/get-started/cli-commands#transaction-pool-commands)**.

## Xử lý Giao dịch {#processing-transactions}

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
Phương pháp ***addImpl*** là nền tảng của mô-đun **TxPool**. Đây là trung tâm nơi các giao dịch được thêm vào hệ hệ thống, được gọi triển khai từ dịch vụ GRPC, điểm cuối JSON RPC, và bất kỳ khi nào máy khách nhận được giao dịch qua giao thức **gossip**.

Mô-đun nhận giao dịch như một đối số **ctx**, chỉ biểu thị cơ sở mà từ đó các giao dịch được thêm vào (GRPC, JSON RPC...)<br />.
 Tham số khác là danh sách các giao dịch sẽ được thêm vào nhóm.


Điều quan trọng cần lưu ý ở đây là kiểm tra trường **Đến từ** trong giao dịch:

* Nếu trường **Đến từ** bị **bỏ trống**, giao dịch sẽ bị coi là chưa được mã hóa/chưa được ký.
 Những giao dịch như vậy sẽ chỉ
 được chấp nhận ở chế độ phát triển
* Nếu trường **Đến từ** **không trống**, giao dịch sẽ được coi là đã ký và quá trình xác minh chữ ký sẽ diễn ra

Sau khi hoàn thành các bước xác thực này, giao dịch sẽ được coi là hợp lệ.

## Cấu trúc dữ liệu {#data-structures}

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

Một số trường trong đối tượng TxPool có thể dễ gây nhầm lẫn là danh sách **queue** và **sorted**.

* **queue** - Thực hiện hàng loạt theo danh sách giao dịch tài khoản được sắp xếp (theo nonce)

* **sorted** - Danh sách được sắp xếp gồm tất cả giao dịch hiện được ưu đãi (tất cả giao dịch có thể thực thi).
 Sắp xếp theo giá gas

## Quản lý lỗi giới hạn gas {#gas-limit-error-management}

Mỗi khi bạn nộp một giao dịch, sẽ có ba cách để TxPool xử lý giao dịch đó.


1. Tất cả giao dịch đang chờ xử lý có thể phù hợp để đưa vào khối

2. Một hoặc nhiều giao dịch đang chờ xử lý sẽ không phù hợp để đưa vào khối
3. Một hoặc nhiều giao dịch đang chờ xử lý sẽ không bao giờ phù hợp để đưa vào khối

Tại đây, từ **_phù hợp_** có nghĩa là giới hạn gas của giao dịch thấp hơn lượng gas còn lại trong TxPool.


Trường hợp đầu tiên sẽ không phát sinh lỗi.

### Trường hợp thứ hai {#second-scenario}

- Lượng gas còn lại của TxPool được đặt theo giới hạn gas của khối cuối cùng, ví dụ là **5000**

- Giao dịch đầu tiên được xử lý và tiêu thụ **3000** gas của TxPool

  - Lượng gas còn lại của TxPool hiện giờ là **2000**
- Giao giao dịch thứ hai, tương tự như giao dịch đầu tiên - cũng tiêu thụ 3000 đơn vị gas - được đặt lệnh
- Vì lượng gas còn lại của TxPool **thấp** hơn lượng gas giao dịch cần, giao dịch sẽ không thể xử lý được khối
  - Giao dịch sẽ được đưa trở lại danh sách giao dịch chờ xử lý và được xử lý trong khối tiếp theo
- Khối đầu tiên sẽ được hạch toán, hãy tạm gọi là **khối #1**
- Lượng gas còn lại của TxPool được đặt theo khối chính - giới hạn gas **của khối #1**

- Giao dịch được đưa trở lại danh sách giao dịch chờ xử lý của TxPool giờ sẽ được xử lý và hạch toán vào khối

  - Lượng gas còn của TxPool giờ là **2000**
- Khối thứ hai sẽ được hạch toán
- ...

![Trường hợp lỗi #1 của TxPool](/img/edge/txpool-error-1.png)

### Trường hợp thứ ba {#third-scenario}
- Lượng gas còn lại của TxPool được đặt theo giới hạn gas của khối cuối cùng, ví dụ là **5000**

- Giao dịch đầu tiên được xử lý và tiêu thụ **3000** gas của TxPool

    - Lượng gas còn lại của TxPool hiện giờ là **2000**
- Giao dịch thứ hai, với trường gas được đặt là **6000**, được đặt lệnh
- Vì giới hạn gas của khối **thấp hơn** lượng gas giao dịch nên giao dịch sẽ bị loại bỏ
    - Giao dịch này sẽ không bao giờ phù hợp với khối
- Khối đầu tiên sẽ được hạch toán
- ...


![Trường hợp lỗi #2 của TxPool](/img/edge/txpool-error-2.png)

> Điều này sẽ xảy ra bất cứ khi nào bạn gặp lỗi sau:
> ```shell
> 2021-11-04T15:41:07.665+0100 [ERROR] polygon.consensus.dev: failed to write transaction: transaction's gas limit exceeds block gas limit
> ```

## Mục tiêu gas khối
 {#block-gas-target}

Sẽ có trường hợp các nút muốn giữ giới hạn gas khối thấp hơn hoặc nằm ở một mức mục tiêu nhất định trên một chuỗi đang chạy.

Trình vận hành nút có thể đặt mục tiêu giới hạn gas lên một nút cụ thể, nút này sẽ cố gắng áp dụng giới hạn trên cho các khối mới được tạo.
 Nếu phần lớn các nút khác cũng có giới hạn gas tương tự (hoặc y hệt) thì giới hạn gas khối sẽ luôn ở quanh mục tiêu gas khối đó và dần tịnh tiến về mục tiêu (tối đa `1/1024 * parent block gas limit`) khi các khối mới được tạo ra.

### Trường hợp ví dụ {#example-scenario}

* Trình vận hành nút sẽ đặt giới hạn gas khối cho nút đơn lẻ là `5000`
* Các nút khác cũng được định cấu hình là `5000`, ngoại trừ nút đơn lẻ được định cấu hình là `7000`
* Khi các nút có mục tiêu gas là `5000` trở thành người đề xuất, các nút này sẽ kiểm tra xem giới hạn gas đã đạt mức mục tiêu chưa
* Nếu giới hạn gas không nằm ở mức mục tiêu (cao hơn/thấp hơn), nút người đề xuất sẽ đặt mục tiêu gas của khối lên tối đa (1/1024 * giới hạn gas chính) về hướng mức mục tiêu
   1. Ví dụ: `parentGasLimit = 4500` và `blockGasTarget = 5000`, người đề xuất sẽ tính giới hạn gas cho khối mới là `4504.39453125` ( `4500/1024 + 4500`)
   2. Ví dụ: `parentGasLimit = 5500` và `blockGasTarget = 5000`, người đề xuất sẽ tính giới hạn gas cho khối mới là `5494.62890625` ( `5500 - 5500/1024`)
* Điều này đảm bảo rằng giới hạn gas khối trong chuỗi sẽ được giữ ở mục tiêu, bởi một người đề xuất có mục tiêu được định cấu hình thành `7000` sẽ không thể tăng giới hạn quá nhiều và phần lớn
 các nút đã đặt thành  `5000`sẽ luôn cố gắng giữ giới hạn ở đó
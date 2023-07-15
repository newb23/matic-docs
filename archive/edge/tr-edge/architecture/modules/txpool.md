---
id: txpool
title: TxPool
description: Polygon Edge'in TxPool modülüne ilişkin açıklama.
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

## Genel Bakış {#overview}

TxPool modülü, işlemlerin sistemin farklı bölümlerinden eklendiği işlem havuzu uygulamasını
temsil eder. Modül ayrıca, aşağıda ele alınan düğüm operatörleri için birkaç yararlı özellik sunar.

## Operatör Komutları {#operator-commands}

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

Düğüm operatörleri, **[CLI Komutları](/docs/edge/get-started/cli-commands#transaction-pool-commands)** bölümünde açıklandığı üzere bu GRPC uç noktalarında sorgu yapabilir.

## İşlemlerin İşlenmesi {#processing-transactions}

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
***addImpl*** yöntemi, **TxPool** modülünün olmazsa olmazıdır. Burası işlemlerin sisteme eklendiği merkezdir; bu ekleme işlemi GRPC hizmeti, JSON RPC uç noktalarından çağrılarak
ve istemci **gossip** protokolü işlem aldığında gerçekleşir.

Sadece işlemlerin eklendiği bağlamı (GRPC, JSON RPC...) ifade eden bir **ctx** argümanını alır. <br />
Diğer parametre ise havuza eklenecek işlemlerin listesidir.

Burada not edilmesi gereken en önemli şey, işlem içindeki **From** alanının kontrolüdür:
* **From** alanı **boşsa**, şifrelenmemiş/imzalanmamış bir işlem olarak kabul edilir. Bu tür işlemler yalnızca
geliştirme modunda kabul edilir
* **From** alanı **boş değilse**, bu, imzalanmış bir işlem olduğu anlamına gelir ve bu nedenle imza doğrulaması gerçekleşir

Tüm bu doğrulamalardan sonra, yapılan işlemler geçerli olarak kabul edilir.

## Veri yapıları {#data-structures}

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

TxPool nesnesi içinde karışıklığa neden olabilecek alanlar **kuyruk** ve **sıralı** listelerdir.
* **kuyruk** - Sıralı bir hesap hareketleri listesinin yığın uygulaması (nonce ile)
* **sıralı** - Geçerli tüm desteklenen işlemler için sıralı liste (tüm yürütülebilir işlemler). Gaz fiyatına göre sıralanmış

## Gaz limiti hata yönetimi {#gas-limit-error-management}

Bir işlem gönderdiğinizde, TxPool tarafından işlenmesinin üç yolu vardır.

1. Tüm bekleyen işlemler bir blok içine sığabilir
2. Bir veya daha fazla bekleyen işlem bir blok içine sığamaz
3. Bir veya daha fazla bekleyen işlem asla bir blok içine sığmayacaktır

Burada, **_sığmak_** kelimesi, işlemin TxPool içindeki kalan gaz miktarından daha düşük bir gaz limitine sahip olduğu anlamına gelir.

İlk senaryo herhangi bir hata üretmez.

### İkinci senaryo {#second-scenario}

- TxPool'da kalan gaz, son blokun gaz limitine ayarlanır; diyelim ki **5000**
- İlk işlem işlenir ve TxPool'dan **3000** gaz tüketir
  - TxPool'un kalan gazı artık **2000**'dir
- İlk işlem ile aynı olan ikinci bir işlem gönderilir; her ikisi de 3000 birim gaz tüketir
- TxPool'un kalan gazı işlem gazından **daha düşük** olduğu için işlem mevcut blokta
işlenemez
  - Bir sonraki blokta işlenebilmesi için bekleyen işlem kuyruğuna geri konur
- İlk blok yazılır; buna **blok #1** diyelim
- Kalan TxPool gazı ana bloka ayarlanır - **blok #1**'in gaz limiti
- TxPool bekleyen işlem kuyruğuna geri konan işlem artık işlenir ve bloka yazılır
  - TxPool'un kalan gazı artık **2000**'dir
- İkinci blok yazılır
- ...

![TxPool Hata senaryosu #1](/img/edge/txpool-error-1.png)

### Üçüncü senaryo {#third-scenario}
- TxPool'da kalan gaz, son blokun gaz limitine ayarlanır; diyelim ki **5000**
- İlk işlem işlenir ve TxPool'dan **3000** gaz tüketir
    - TxPool'un kalan gazı artık **2000**'dir
- Gaz alanı **6000**'e ayarlanmış ikinci bir işlem gönderilir
- Blok gaz limiti, işlem gazından **daha düşük** olduğu için bu işlem iptal edilir
    - Bir blok içine asla sığamayacaktır
- İlk blok yazılır
- ...


![TxPool Hata senaryosu #2](/img/edge/txpool-error-2.png)

> Bu, aşağıdaki hatayı aldığınızda gerçekleşir:
> ```shell
> 2021-11-04T15:41:07.665+0100 [ERROR] polygon.consensus.dev: failed to write transaction: transaction's gas limit exceeds block gas limit
> ```

## Blok Gaz Hedefi {#block-gas-target}

Düğümlerin çalışan bir zincirde blok gaz limitini aşağıda veya belirli bir hedefte tutmak istediği durumlar vardır.

Düğüm operatörü, bu limiti yeni oluşturulan bloklara uygulamaya çalışacak olan belirli bir düğümde hedef gaz limitini ayarlayabilir.
Diğer düğümlerin çoğunluğunun da benzer (veya aynı) bir hedef gaz limiti kümesi varsa, o zaman blok gaz limiti her zaman
o blok gaz hedefinin etrafında gezinecek ve yeni bloklar oluşturuldukça yavaş yavaş (en fazla `1/1024 * parent block gas limit`) ona doğru ilerleyecektir.

### Örnek senaryo {#example-scenario}

* Düğüm operatörü, tek bir düğüm için blok gaz limitini `5000` olarak ayarlar
* `7000` olarak yapılandırılan tek bir düğüm dışında diğer düğümler de `5000` olacak şekilde yapılandırılmıştır
* Gaz hedefi `5000` olarak ayarlanmış düğümler teklif sahibi olduklarında gaz limitinin zaten hedefte olup olmadığını denetleyeceklerdir
* Gaz limiti hedefte değilse (daha büyük/düşük ise), teklif sahibi düğüm, blok gaz hedefini hedef doğrultusunda en fazla (1/1024 * ana gaz limiti) olarak ayarlar
   1. Ör: `parentGasLimit = 4500` ve `blockGasTarget = 5000`; teklif sahibi blok için gaz limitini `4504.39453125` (`4500/1024 + 4500`) olarak hesaplayacaktır
   2. Ör: `parentGasLimit = 5500` ve `blockGasTarget = 5000`; teklif sahibi blok için gaz limitini `5494.62890625` (`5500 - 5500/1024`) olarak hesaplayacaktır
* Bu, zincir içindeki gaz limitinin hedefte tutulmasını sağlar çünkü hedefi `7000` olarak yapılandıran tek teklif sahibi limiti çok fazla artıramayacak ve
düğümlerin çoğunluğu `5000` olarak ayarladıkları için her zaman hedefi o noktada tutmaya çalışacaktır
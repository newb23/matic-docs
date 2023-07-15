---
id: txpool
title: TxPool
description: Penjelasan modul TxPool di Polygon Edge.
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

## Ikhtisar {#overview}

Modul TxPool mewakili implementasi kumpulan transaksi tempat transaksi ditambahkan dari berbagai bagian
sistem. Modul ini juga mengekspos beberapa fitur yang berguna bagi operator node yang tercakup di bawah ini.

## Perintah Operator {#operator-commands}

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

Operator node dapat melakukan kueri titik akhir GRPC ini, seperti yang dijelaskan di bagian **[Perintah CLI](/docs/edge/get-started/cli-commands#transaction-pool-commands)**.

## Memproses Transaksi {#processing-transactions}

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
Metode ***addImpl*** adalah metode yang paling banyak digunakan dalam modul **TxPool**.
Ini adalah tempat utama untuk menambahkan transaksi dalam sistem ini yang dipanggil dari layanan GRPC, titik akhir JSON RPC,
dan setiap kali klien menerima transaksi melalui protokol **gosip**.

Ini menyertakan **ctx** sebagai argumen yang hanya menunjukkan konteks dari mana transaksi ditambahkan (GRPC, JSON RPC...). <br />
Parameter lainnya adalah daftar transaksi yang akan ditambahkan ke dalam kumpulan tersebut.

Hal utama yang perlu diperhatikan di sini yaitu memeriksa bidang **From** dalam transaksi:
* Jika bidang **From** **kosong**, maka transaksi ini dianggap sebagai transaksi yang tidak dienkripsi/tidak ditandatangani. Transaksi semacam ini hanya
diterima dalam mode pengembangan
* Jika bidang **From** **tidak kosong**, artinya transaksi tersebut adalah transaksi yang ditandatangani, sehingga verifikasi tanda tangan akan terjadi

Setelah semua validasi tersebut, transaksi akan dianggap valid.

## Struktur data {#data-structures}

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

Bidang dalam objek TxPool yang dapat menyebabkan kebingungan adalah **queue** dan daftar **sorted**.
* **queue** - Implementasi susunan daftar transaksi akun yang diurutkan (berdasarkan nonce)
* **sorted** - Daftar yang diurutkan untuk semua transaksi yang dipromosikan saat ini (semua transaksi yang dapat dieksekusi). Diurutkan berdasarkan harga gas

## Manajemen error batas gas {#gas-limit-error-management}

Setiap kali mengirim sebuah transaksi, ada tiga cara yang dapat diproses oleh TxPool.

1. Semua transaksi yang menunggu dapat dimuat dalam sebuah blok
2. Satu atau beberapa transaksi yang menunggu tidak dapat dimuat dalam sebuah blok
3. Satu atau beberapa transaksi yang menunggu tidak akan dimuat dalam sebuah blok

Di sini, kata **_muat_** berarti bahwa transaksi memiliki batas gas yang lebih rendah dari gas yang tersisa di TxPool.

Skenario pertama tidak menghasilkan error apa pun.

### Skenario kedua {#second-scenario}

- Gas yang tersisa dalam TxPool diatur ke batas gas blok terakhir, misalnya **5000**
- Transaksi pertama diproses dan memerlukan gas **3000** dalam TxPool
  - Gas yang tersisa dalam TxPool sekarang **2000**
- Transaksi kedua, yang sama seperti transaksi pertama - keduanya mengonsumsi 3000 unit gas, akan dikirimkan
- Karena gas TxPool yang tersisa **lebih rendah** dari gas transaksi, transaksi itu tidak dapat diproses dalam blok
saat ini
  - Transaksi itu akan dikembalikan ke antrean transaksi yang menunggu sehingga dapat diproses dalam blok berikutnya
- Blok pertama sudah ditulis, kita namai saja **blok #1**
- Gas yang tersisa pada TxPool diatur ke blok induk - batas gas **blok #1**
- Transaksi yang dikembalikan ke antrean transaksi yang menunggu dalam TxPool sekarang diproses dan ditulis dalam blok
  - Gas yang tersisa dalam TxPool menjadi **2000**
- Blok kedua sudah ditulis
- ...

![Skenario error TxPool #1](/img/edge/txpool-error-1.png)

### Skenario ketiga {#third-scenario}
- Gas yang tersisa dalam TxPool diatur ke batas gas dari blok terakhir, misalnya **5000**
- Transaksi pertama diproses dan memerlukan gas **3000** dalam TxPool
    - Gas yang tersisa dalam TxPool sekarang **2000**
- Transaksi kedua dengan bidang gas yang diatur ke **6000** sudah dikirimkan
- Karena batas gas blok tersebut **lebih rendah** dari gas transaksi, maka transaksi ini diabaikan
    - Transaksi tersebut tidak akan muat dalam sebuah blok
- Blok pertama sudah ditulis
- ...


![Skenario error TxPool #2](/img/edge/txpool-error-2.png)

> Ini terjadi setiap kali Anda mendapatkan error berikut:
> ```shell
> 2021-11-04T15:41:07.665+0100 [ERROR] polygon.consensus.dev: failed to write transaction: transaction's gas limit exceeds block gas limit
> ```

## Target Gas Blok {#block-gas-target}

Ada situasi ketika node ingin menjaga batas gas blok tetap rendah atau berada pada target tertentu di rantai yang beroperasi.

Operator node dapat mengatur batas gas target pada node tertentu yang akan mencoba menerapkan batas ini pada blok yang baru dibuat.
Jika mayoritas node lainnya juga memiliki batas gas target yang serupa (atau sama), maka batas gas blok tersebut akan selalu berada
di sekitar target gas blok tersebut dan perlahan-lahan bergerak mencapai target (maksimal `1/1024 * parent block gas limit`) saat blok baru dibuat.

### Skenario contoh {#example-scenario}

* Operator node mengatur batas gas blok untuk node tunggal menjadi `5000`
* Node lainnya dikonfigurasi sebagai `5000` juga, terlepas dari node tunggal yang dikonfigurasi menjadi `7000`
* Ketika node yang target gasnya diatur ke `5000` menjadi pengusul, node tersebut akan memeriksa apakah batas gas sudah berada dalam target
* Jika batas gas tidak berada pada target (lebih besar/lebih rendah), node pengusul akan mengatur target gas blok sebagian besar (1/1024 * batas gas induk) ke arah target
   1. Contoh: `parentGasLimit = 4500` dan `blockGasTarget = 5000`, pengusul akan menghitung batas gas untuk blok baru yaitu `4504.39453125` (`4500/1024 + 4500`)
   2. Contoh: `parentGasLimit = 5500` dan `blockGasTarget = 5000`, pengusul akan menghitung batas gas untuk blok baru yaitu `5494.62890625` (`5500 - 5500/1024`)
* Ini akan memastikan bahwa batas gas blok dalam rantai akan dijaga agar tetap berada pada target, karena pengusul tunggal yang targetnya dikonfigurasi ke `7000` tidak dapat meningkatkan batas secara signifikan, dan sebagian besar
node yang telah diatur ke `5000` akan selalu berusaha menjaga agar tetap berada di batas itu
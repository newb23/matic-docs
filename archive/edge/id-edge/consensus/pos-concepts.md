---
id: pos-concepts
title: Proof of Stake
description: "Penjelasan dan instruksi mengenai Proof of Stake."
keywords:
  - docs
  - polygon
  - edge
  - PoS
  - stake
---

## Ikhtisar {#overview}

Bagian ini untuk memberikan gambaran yang lebih baik tentang beberapa konsep yang saat ini ada dalam implementasi
Proof of Stake (PoS) Polygon Edge.

Implementasi Proof of Stake (PoS) di Polygon Edge merupakan alternatif implemantasi PoA IBFT yang ada
yang memberikan kemampuan kepada operator node untuk memilih di antara kedua implementasi itu ketika memulai rantai.

## Fitur PoS {#pos-features}

Logika inti di balik implementasi Proof of Stake terletak di dalam
**[yang membuat Kontrak Cerdas ](https://github.com/0xPolygon/staking-contracts/blob/main/contracts/Staking.sol)**.

Kontrak ini sudah disebarkan kapan pun mekanisme PoS rantai Polygon Edge diinisialisasi dan tersedia di alamat
`0x0000000000000000000000000000000000001001`dari blok `0`.

### Epoch {#epochs}

Epoch adalah konsep yang diperkenalkan dengan penambahan PoS ke Polygon Edge.

Epoch dianggap sebagai kerangka waktu khusus (dalam blok) ketika set validator tertentu dapat menghasilkan blok.
Panjangnya dapat diubah, node operator dapat mengatur panjang epoch selama pembuatan genesis.

Pada akhir setiap epoch, sebuah _blok epoch_ dibuat dan setelah peristiwa itu, epoch baru dimulai. Untuk mempelajari lebih lanjut
blok epoch, lihat bagian [Blok Epoch](/docs/edge/consensus/pos-concepts#epoch-blocks).

Set Validator diperbarui pada akhir setiap epoch. Node melakukan kueri set validator dari Kontrak Cerdas Staking
selama pembuatan blok epoch dan menyimpan data yang diperoleh ke penyimpanan lokal. Kueri ini dan menyimpan siklus
diulang pada akhir setiap epoch.

Pada dasarnya, itu memastikan bahwa Kontrak Cerdas Staking memiliki kontrol penuh atas alamat di set validator dan
meninggalkan node hanya dengan 1 tanggung jawab - untuk melakukan kueri kontrak satu kali selama epoch guna mengambil informasi set
validator terbaru. Ini mengurangi tanggung jawab masing-masing node untuk menangani set validator.

### Staking {#staking}

Alamat dapat melakukan stake dana di Kontrak Cerdas Staking dengan menerapkan metode `stake` dan menentukan nilai
jumlah stake dalam transaksi:

````js
const StakingContractFactory = await ethers.getContractFactory("Staking");
let stakingContract = await StakingContractFactory.attach(STAKING_CONTRACT_ADDRESS)
as
Staking;
stakingContract = stakingContract.connect(account);

const tx = await stakingContract.stake({value: STAKE_AMOUNT})
````

Dengan melakukan staking dana di Kontrak Cerdas Staking, alamat dapat memasuki set validator, sehingga dapat turut serta dalam
proses produksi blok.

:::info Ambang batas staking

Saat ini, ambang batas minimum untuk memasuki set validator adalah staking `1 ETH`

:::

### Unstaking {#unstaking}

Alamat yang telah melakukan stake dana hanya dapat **melakukan unstake pada semua dana yang dilakukan stake sekaligus**.

Unstaking dapat diajukan dengan memanggil metode `unstake` di Kontrak Cerdas Staking:

````js
const StakingContractFactory = await ethers.getContractFactory("Staking");
let stakingContract = await StakingContractFactory.attach(STAKING_CONTRACT_ADDRESS)
as
Staking;
stakingContract = stakingContract.connect(account);

const tx = await stakingContract.unstake()
````

Setelah melakukan unstaking dana, alamat dihapus dari set validator di Kontrak Cerdas Staking dan tidak akan
dianggap sebagai validator selama epoch berikutnya.

## Blok Epoch {#epoch-blocks}

**Blok Epoch** adalah konsep yang diperkenalkan dalam implementasi PoS IBFT di Polygon Edge.

Pada dasarnya, blok epoch adalah blok khusus yang berisi **tidak ada transaksi** dan hanya terjadi di **akhir epoch**.
Misalnya, jika **ukuran epoch** diatur ke `50`blok, blok epoch akan dianggap sebagai blok `50``100``150`dan seterusnya.

Itu digunakan untuk melakukan logika tambahan yang seharusnya tidak terjadi selama produksi blok reguler.

Yang paling penting, itu adalah indikasi node yang informasi **set validator terbarunya perlu diambil**
dari Kontrak Cerdas Staking.

Setelah memperbarui set validator di blok epoch, set validator (berubah atau tidak berubah)
digunakan untuk blok `epochSize - 1` berikutnya, sampai diperbarui lagi dengan menarik informasi terbaru dari
Kontrak Cerdas Staking.

Panjang Epoch (dalam blok) dapat dimodifikasi ketika menghasilkan file genesis, dengan menggunakan bendera khusus `--epoch-size`:

```bash
polygon-edge genesis --epoch-size 50 ...
```

Ukuran default epoch adalah `100000` blok di Polygon Edge.

## Kontrak prapenyebaran {#contract-pre-deployment}

Polygon Edge melakukan _prapenyebaran_
[Kontrak Cerdas Staking](https://github.com/0xPolygon/staking-contracts/blob/main/contracts/Staking.sol) selama **pembuatan genesis** ke alamat `0x0000000000000000000000000000000000001001`.

Hal itu dilakukan tanpa EVM aktif, dengan memodifikasi kondisi blockchain dari Kontrak Cerdas secara langsung, menggunakan nilai konfigurasi
yang diberikan ke perintah genesis.

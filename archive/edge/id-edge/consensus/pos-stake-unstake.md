---
id: pos-stake-unstake
title: Mengatur dan menggunakan Proof of Stake (PoS)
description: "Stake, unstake, dan instruksi lain terkait staking."
keywords:
  - docs
  - polygon
  - edge
  - stake
  - unstake
  - validator
  - epoch
---

## Ikhtisar {#overview}

Panduan ini menjelaskan perincian cara mengatur jaringan Proof of Stake dengan Polygon Edge, cara melakukan stake dana pada node
untuk menjadi validator dan cara melakukan unstake dana.

Ini **sangat didorong** untuk membaca dan pergi [Pengaturan Lokal](/docs/edge/get-started/set-up-ibft-locally)
/[Pengaturan Cloud](/docs/edge/get-started/set-up-ibft-on-the-cloud) sebelum melanjutkan
panduan PoS ini. Bagian ini menguraikan langkah yang diperlukan untuk memulai klaster Proof of Authority (PoA) dengan
Polygon Edge.

Saat ini, tidak ada batasan jumlah validator yang dapat melakukan stake dana pada Kontrak Cerdas Staking.

## Kontrak Cerdas Staking {#staking-smart-contract}

Repo untuk Kontrak Cerdas Staking berada [di sini](https://github.com/0xPolygon/staking-contracts).

Ini berisi skrip pengujian yang diperlukan, file ABI, dan yang paling penting adalah Kontrak Cerdas Staking itu sendiri.

## Mengatur klaster node N {#setting-up-an-n-node-cluster}

Mengatur jaringan dengan Polygon Edge tercakup dalam bagian
[Pengaturan Lokal](/docs/edge/get-started/set-up-ibft-locally)
/[Pengaturan Cloud](/docs/edge/get-started/set-up-ibft-on-the-cloud).

**Satu-satunya perbedaan** mengatur klaster PoS dan PoA yakni dalam hal pembuatan genesis.

**Ketika menghasilkan file genesis untuk klaster PoS, perlu bendera tambahan `--pos`**:

```bash
polygon-edge genesis --pos ...
```

## Mengatur panjang epoch {#setting-the-length-of-an-epoch}

Epoch dibahas secara terperinci di bagian [Blok Epoch](/docs/edge/consensus/pos-concepts#epoch-blocks).

Untuk mengatur ukuran epoch bagi klaster (dalam blok) ketika menghasilkan file genesis, bendera tambahan
`--epoch-size` ditentukan:

```bash
polygon-edge genesis --epoch-size 50
```

Nilai yang ditentukan di file genesis yakni ukuran epoch harus berupa `50` blok.

Nilai default untuk ukuran epoch (dalam blok) adalah `100000`.

:::info Mengurangi panjang epoch

Seperti yang diuraikan di bagian [Blok Epoch](/docs/edge/consensus/pos-concepts#epoch-blocks),
blok epoch digunakan untuk memperbarui set validator node.

Panjang epoch default di blok (`100000`) mungkin butuh waktu lama untuk pembaruan set validator. Mengingat bahwa blok
baru ditambahkan memakan waktu ~2d, mungkin akan perlu waktu ~55,5j untuk perubahan set validator.

Mengatur nilai yang lebih rendah untuk panjang epoch memastikan bahwa set validator lebih sering diperbarui.

:::

## Menggunakan skrip Kontrak Cerdas Staking {#using-the-staking-smart-contract-scripts}

### Prasyarat {#prerequisites}

Repo Kontrak Cerdas Staking adalah proyek Hardhat yang membutuhkan NPM.

Untuk menginisialisasinya dengan benar, di direktori utama jalankan:

```bash
npm install
````

### Mengatur skrip pembantu yang disediakan {#setting-up-the-provided-helper-scripts}

Skrip untuk berinteraksi dengan Kontrak Cerdas Staking yang disebarkan terletak di
[repo Kontrak Smart Staking](https://github.com/0xPolygon/staking-contracts).

Buat file `.env` dengan parameter berikut di lokasi repo Kontrak Cerdas:

```bash
JSONRPC_URL=http://localhost:10002
PRIVATE_KEYS=0x0454f3ec51e7d6971fc345998bb2ba483a8d9d30d46ad890434e6f88ecb97544
STAKING_CONTRACT_ADDRESS=0x0000000000000000000000000000000000001001
BLS_PUBLIC_KEY=0xa..
```

Di mana prameternya adalah:

* **JSONRPC_URL** - titik akhir JSON-RPC untuk node yang sedang berjalan
* **PRIVATE_KEYS** - kunci privat dari alamat staker.
* **STAKING_CONTRACT_ADDRESS** - alamat kontrak cerdas staking (
default `0x0000000000000000000000000000000000001001`)
* **BLS_PUBLIC_KEY** - kunci publik BLS dari staker. Hanya diperlukan jika jaringan beroperasi dengan BLS

### Dana staking {#staking-funds}

:::info Alamat staking

Kontrak Cerdas Staking sebelum disebarkan di
alamat `0x0000000000000000000000000000000000001001`.

Interaksi apa pun dengan mekanisme staking melalui kontrak Cerdas Staking di alamat yang ditentukan.

Untuk mempelajari lebih lanjut tentang Kontrak Cerdas Staking, kunjungi bagian
the **[Staking Smart Contract](/docs/edge/consensus/pos-concepts#contract-pre-deployment)**.  

:::

Untuk menjadi bagian dari set validator, alamat perlu melakukan stake jumlah dana tertentu di atas ambang.

Saat ini, ambang batas default untuk menjadi bagian dari set validator adalah `1 ETH`.

Staking dapat dimulai dengan memanggil metode `stake` dari Kontrak Cerdas Staking dan menentukan nilai `>= 1 ETH`.

Setelah file `.env` yang disebutkan di
[bagian sebelumnya](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts) telah disiapkan dan
rantai telah dimulai di mode PoS, staking dapat dilakukan dengan perintah berikut di repo Kontrak Cerdas Staking:

```bash
npm run stake
```

Skrip Hardhat `stake` melakukan stake jumlah default `1 ETH` yang dapat diubah dengan memodifikasi file `scripts/stake.ts`.


Jika dana yang dilakukan stake adalah `>= 1 ETH`, set validator di Kontrak Cerdas Staking diperbarui, dan alamat
akan menjadi bagian dari set validator dimulai dari epoch berikutnya.

:::info Mendaftarkan kunci BLS

Jika jaringan berjalan dalam mode BLS, agar node menjadi validator, perlu mendaftarkan kunci publik BLS setelah staking

Ini dapat dilakukan dengan perintah berikut:

```bash
npm run register-blskey
```
:::

### Unstaking dana {#unstaking-funds}

Alamat yang memiliki stake dapat **hanya melakukan unstake semua dana** secara sekaligus.

Setelah file `.env` yang disebutkan di
[bagian sebelumnya](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts)
telah diatur dan rantai telah dimulai di mode PoS, unstaking dapat dilakukan dengan perintah berikut di
Repo Kontrak Cerdas Staking:

```bash
npm run unstake
```

### Mengambil daftar staker {#fetching-the-list-of-stakers}

Semua alamat yang melakukan stake dana disimpan ke Kontrak Cerdas Staking.

Setelah file `.env` yang disebutkan di
[bagian sebelumnya](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts)
telah diatur dan rantai telah dimulai di mode PoS, pengambilan daftar validator dapat dilakukan dengan
perintah berikut di repo Kontrak Cerdas Staking:

```bash
npm run info
```

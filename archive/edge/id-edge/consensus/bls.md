---
id: bls
title: BLS
description: "Penjelasan dan instruksi mengenai mode BLS."
keywords:
  - docs
  - polygon
  - edge
  - bls
---

## Ikhtisar {#overview}

BLS juga dikenal sebagai Boneh–Lynn–Shacham (BLS)—is skema tanda tangan kriptografi yang memungkinkan pengguna untuk memverifikasi bahwa seorang penandatangan otentik. Ini adalah skema tanda tangan yang dapat memperbesar beberapa tanda. Dalam Polygon Edge, BLS digunakan secara default untuk menyediakan keamanan lebih baik dalam mode konsensus IBFT. BLS dapat menggabungkan tanda tangan ke dalam array byte tunggal dan mengurangi ukuran header blok. Setiap rantai dapat memilih apakah akan menggunakan BLS atau tidak. Kunci ECDSA digunakan tanpa peduli apakah mode BLS diaktifkan atau tidak.

## Presentasi video {#video-presentation}

[![bls - video](https://img.youtube.com/vi/HbUmZpALlqo/0.jpg)](https://www.youtube.com/watch?v=HbUmZpALlqo)

## Bagaimana mengatur rantai baru menggunakan BLS {#how-to-setup-a-new-chain-using-bls}

Lihat bagian [Pengaturan Lokal](/docs/edge/get-started/set-up-ibft-locally)/[Pengaturan Cloud](/docs/edge/get-started/set-up-ibft-on-the-cloud) untuk instruksi pengaturan terperinci.

## Cara migrasi dari rantai PoA ECDSA yang ada ke rantai PoA BLS {#how-to-migrate-from-an-existing-ecdsa-poa-chain-to-bls-poa-chain}

Bagian ini menjelaskan cara penggunaan mode di rantai PoA yang ada.
Langkah berikut diperlukan untuk mengaktifkan BLS di rantai PoA.

1. Hentikan semua node
2. Buat kunci BLS untuk validator
3. Tambah pengaturan fork ke genesis.json
4. Mulai ulang semua node

### 1. Hentikan semua node {#1-stop-all-nodes}

Akhiri semua proses validator dengan menekan Ctrl + c (Control + c). Ingatlah tinggi blok terbaru (nomor urut tertinggi dalam log komitmen blok).

### 2. Buat kunci BLS {#2-generate-the-bls-key}

`secrets init` dengan `--bls` menghasilkan kunci BLS. Untuk mempertahankan kunci ECDSA dan Jaringan serta menambah kunci BLS baru, `--ecdsa` dan `--network` perlu dinonaktifkan.

```bash
polygon-edge secrets init --bls --ecdsa=false --network=false

[SECRETS INIT]
Public key (address) = 0x...
BLS Public key       = 0x...
Node ID              = 16...
```

### 3. Tambah pengaturan fork {#3-add-fork-setting}

Perintah `ibft switch` menambah pengaturan fork yang mengaktifkan BLS di rantai yang ada, menjadi .`genesis.json`.

Untuk jaringan PoA, validator perlu diberikan dalam perintah. Sedengkan untuk perintah `genesis`, bendera `--ibft-validators-prefix-path` atau `--ibft-validator` dapat digunakan untuk menentukan validator.

Tentukan tinggi dari mana rantai mulai menggunakan BLS dengan bendera `--from`.

```bash
polygon-edge ibft switch --chain ./genesis.json --type PoA --ibft-validator-type bls --ibft-validators-prefix-path test-chain- --from 100
```

### 4. Mulai ulang semua node {#4-restart-all-nodes}

Mulai ulang semua node dengan perintah `server`. Setelah blok di `from` yang ditentukan pada langkah sebelumnya sudah dibuat, rantai mengaktifkan BLS dan menunjukkan log seperti di bawah ini:

```bash
2022-09-02T11:45:24.535+0300 [INFO]  polygon.ibft: IBFT validation type switched: old=ecdsa new=bls
```

Juga log menunjukkan mode verifikasi mana yang digunakan untuk menghasilkan setiap blok setelah blok dibuat.

```
2022-09-02T11:45:28.728+0300 [INFO]  polygon.ibft: block committed: number=101 hash=0x5f33aa8cea4e849807ca5e350cb79f603a0d69a39f792e782f48d3ea57ac46ca validation_type=bls validators=3 committed=3
```

## Cara migrasi dari rantai PoS Polygon ECDSA ke rantai PoS Polygon BLS {#how-to-migrate-from-an-existing-ecdsa-pos-chain-to-a-bls-pos-chain}

Bagian ini menjelaskan cara penggunaan mode BLS di rantai PoS Polygon yang ada.
Langkah berikut diperlukan untuk mengaktifkan BLS dalam rantai PoS Polygon.

1. Hentikan semua node
2. Buat kunci BLS untuk validator
3. Tambah pengaturan fork ke genesis.json
4. Panggil kontrak staking untuk mendaftarkan Kunci Publik BLS
5. Mulai ulang semua node

### 1. Hentikan semua node {#1-stop-all-nodes-1}

Akhiri semua proses validator dengan menekan Ctrl + c (Control + c). Ingatlah tinggi blok terbaru (nomor urut tertinggi dalam log komitmen blok).

### 2. Buat kunci BLS {#2-generate-the-bls-key-1}

`secrets init` dengan bendera `--bls` menghasilkan kunci BLS. Untuk mempertahankan kunci ECDSA dan Jaringan yang ada serta menambah kunci BLS baru, `--ecdsa` dan `--network` perlu dinonaktifkan.

```bash
polygon-edge secrets init --bls --ecdsa=false --network=false

[SECRETS INIT]
Public key (address) = 0x...
BLS Public key       = 0x...
Node ID              = 16...
```

### 3. Tambah pengaturan fork {#3-add-fork-setting-1}

Perintah `ibft switch` menambahkan pengaturan fork yang mengaktifkan BLS dari tengah rantai ke `genesis.json`.

Tentukan tinggi dari mana rantai mulai menggunakan mode BLS dengan bendera `from` dan tinggi tempat kontrak diperbarui dengan bendera `development`.

```bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --ibft-validator-type bls --deployment 50 --from 200
```

### 4. Daftarkan Kunci Publik dalam kontrak staking {#4-register-bls-public-key-in-staking-contract}

Setelah fork ditambahkan dan validator dimulai ulang, setiap validator perlu memanggil `registerBLSPublicKey` dalam kontrak staking untuk mendaftarkan Kunci Publik BLS. Ini harus dilakukan setelah tinggi yang ditentukan di `--deployment` sebelum tinggi yang ditentukan di `--from`.

Skrip untuk mendaftarkan Kunci Publik BLS didefinisikan di [repo Kontrak Cerdas Staking](https://github.com/0xPolygon/staking-contracts).

Set `BLS_PUBLIC_KEY` untuk didaftarkan ke file `.env`. Lihat [pos-stake-unstake](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts) untuk perincian lebih lanjut tentang parameter lainnya.

```env
JSONRPC_URL=http://localhost:10002
STAKING_CONTRACT_ADDRESS=0x0000000000000000000000000000000000001001
PRIVATE_KEYS=0x...
BLS_PUBLIC_KEY=0x...
```

Perintah berikut mendaftarkan Kunci Publik BLS yang diberikan di `.env` ke kontrak.

```bash
npm run register-blskey
```

:::warning Validator perlu mendaftarkan Kunci Publik BLS secara manual

Dalam mode BLS, validator harus memiliki alamat dan kunci publik BLS. Lapisan konsensus mengabaikan validator yang belum mendaftarkan kunci publik BLS di kontrak ketika konsensus mengambil info validator dari kontrak.

:::

### 5. Mulai ulang semua node {#5-restart-all-nodes}

Mulai ulang semua node dengan `server` perintah. Rantai mengaktifkan BLS setelah blok di `from` yang ditentukan pada langkah sebelumnya sudah dibuat.

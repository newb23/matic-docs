---
id: definitions
title: Definisi Umum
description: Definisi Umum untuk istilah yang digunakan dalam chainBridge
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---


## Relayer {#relayer}
Chainbridge adalah jembatan jenis relayer. Peran relayer adalah memberi suara untuk eksekusi dari suatu permintaan (misalnya, berapa jumlah token untuk dibakar/dirilis).
Relayer memantau kejadian dari setiap rantai dan memberi suara untuk proposal di dalam kontrak Bridge rantai tujuan saat menerima kejadian `Deposit` dari rantai. Relayer memanggil suatu metode dalam kontrak Bridge untuk mengeksekusi proposal setelah jumlah suara yang dibutuhkan telah dikirim. Jembatan mendelegasikan eksekusi ke kontrak Handler.


## Jenis kontrak {#types-of-contracts}
Di ChainBridge, ada tiga jenis kontrak pada setiap rantai yang disebut Bridge/Handler/Target.

| **Jenis** | **Deskripsi** |
|----------|-------------------------------------------------------------------------------------------------------------------------------|
| Kontrak jembatan | Kontrak Bridge (Jembatan) yang mengelola permintaan, suara, eksekusi perlu disebar pada setiap rantai. Pengguna akan memanggil `deposit` di Bridge untuk memulai transfer dan Bridge mendelegasikan kontrak terkait kepada Handler. Setelah kontrak Handler berhasil memanggil kontrak Target, kontrak Bridge mengirim kejadian `Deposit` untuk memberi tahu relayer. |
| Kontrak Handler | Kontrak ini berinteraksi dengan kontrak Target untuk mengeksekusi setoran atau proposal. Ini memvalidasi permintaan pengguna, memanggil kontrak Target, dan membantu beberapa pengaturan untuk kontrak Target. Ada beberapa kontrak Handler tertentu untuk memanggil setiap kontrak Target yang memiliki antarmuka berbeda. Panggilan tidak langsung oleh kontrak Handler membuat jembatan mengaktifkan transfer semua jenis aset atau data. Saat ini, ada tiga jenis kontrak Handler yang diterapkan oleh ChainBridge: ERC20Handler, ERC721Handler, dan GenericHandler. |
| Kontrak Target | Kontrak yang mengelola aset untuk ditukar atau pesan yang ditransfer antara rantai. Interaksi antara kontrak ini akan dibuat dari setiap sisi jembatan. |

<div style={{textAlign: 'center'}}>

![Arsitektur ChainBridge](/img/edge/chainbridge/architecture.svg)
*Arsitektur ChainBridge*

</div>

<div style={{textAlign: 'center'}}>

![Alur kerja transfer token ERC20](/img/edge/chainbridge/erc20-workflow.svg)
*mis. Alur kerja transfer token ERC20*

</div>

## Jenis akun {#types-of-accounts}

Pastikan akun memiliki token asli dalam jumlah mencukupi untuk membuat transaksi sebelum memulai. Di Polygon Edge, Anda dapat menetapkan saldo prapenambangan ke akun saat membuat blok genesis.

| **Jenis** | **Deskripsi** |
|----------|-------------------------------------------------------------------------------------------------------------------------------|
| Admin | Akun ini akan diberi peran admin secara default. |
| Pengguna | Akun pengirim/penerima yang mengirim/menerima aset. Akun pengirim membayar biaya gas saat menyetujui transfer token dan memanggil setoran di kontrak Bridge untuk memulai transfer. |

:::info Peran admin

Tindakan tertentu hanya dapat dilakukan oleh akun dengan peran admin. Secara default, penyebar kontrak Bridge memiliki peran admin, Di bawah ini, Anda akan menemukan cara memberi peran admin ke akun lain atau menghapusnya.

### Menambah peran admin {#add-admin-role}

Menambahkan admin

```bash
# Grant admin role
$ cb-sol-cli admin add-admin \
  --url [JSON_RPC_URL] \
  --privateKey [PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --admin "[NEW_ACCOUNT_ADDRESS]"
```
### Mencabut peran admin {#revoke-admin-role}

Menghapus admin

```bash
# Revoke admin role
$ cb-sol-cli admin remove-admin \
  --url [JSON_RPC_URL] \
  --privateKey [PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --admin "[NEW_ACCOUNT_ADDRESS]"
```

## Operasi yang diizinkan oleh akun `admin` adalah sebagai berikut. {#account-are-as-below}

### Mengatur Sumber Daya {#set-resource}

Daftarkan ID sumber daya dengan alamat kontrak untuk handler.

```bash
# Register new resource
$ cb-sol-cli bridge register-resource \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --resourceId "[RESOURCE_ID]" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[TARGET_CONTRACT_ADDRESS]"
```

### Membuat kontrak yang dapat dibakar (burn)/dibuat (mint) {#make-contract-burnable-mintable}

Mengatur kontrak token agar dapat dibuat/dibakar di handler.

```bash
# Let contract burnable/mintable
$ cb-sol-cli bridge set-burn \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[TARGET_CONTRACT_ADDRESS]"
```

### Membatalkan proposal {#cancel-proposal}

Membatalkan proposal untuk eksekusi

```bash
# Cancel ongoing proposal
$ cb-sol-cli bridge cancel-proposal \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --resourceId "[RESOURCE_ID]" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --chainId "[CHAIN_ID_OF_SOURCE_CHAIN]" \
  --depositNonce "[NONCE]"
```

### Menjeda/Menghentikan Jeda {#pause-unpause}

Menjeda sementara untuk penyetoran, pembuatan proposal, pemberian suara, dan eksekusi setoran.

```bash
# Pause
$ cb-sol-cli admin pause \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]"

# Unpause
$ cb-sol-cli admin unpause \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]"
```

### Mengubah Biaya {#change-fee}

Mengubah biaya yang akan dibayar kepada Kontrak Bridge

```bash
# Change fee for execution
$ cb-sol-cli admin set-fee \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --fee [FEE_IN_WEI]
```

### Menambah/Menghapus relayer {#add-remove-a-relayer}

Menambah akun sebagai relayer baru atau menghapus akun dari relayer

```bash
# Add relayer
$ cb-sol-cli admin add-relayer \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --relayer "[NEW_RELAYER_ADDRESS]"

# Remove relayer
$ cb-sol-cli admin remove-relayer \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --relayer "[RELAYER_ADDRESS]"
```

### Mengubah ambang batas relayer {#change-relayer-threshold}

Mengubah jumlah suara yang dibutuhkan untuk eksekusi proposal

```bash
# Remove relayer
$ cb-sol-cli admin set-threshold \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --threshold [THRESHOLD]
```
:::

## ID Rantai {#chain-id}

Chainbridge `chainId` adalah nilai suka-suka yang digunakan pada jembatan untuk membedakan antara jaringan blockchain, dan harus dalam rentang uint8. Supaya tidak bingung dengan ID rantai jaringan, keduanya bukan hal yang sama. Nilai ini harus unik, tetapi tidak harus sama dengan ID jaringan tersebut.

Dalam contoh ini, kita mengatur `99` pada `chainId`, karena ID rantai dari testnet Mumbai adalah `80001`, yang tidak dapat direpresentasikan dengan uint8.

## ID Sumber Daya {#resource-id}

ID sumber daya adalah nilai 32-byte unik dalam lingkungan lintas rantai yang diasosiasikan dengan aset (sumber daya) tertentu yang ditransfer antar jaringan.

ID sumber bersifat suka-suka, tetapi sebagai kaidah, biasanya byte terakhir mengandung ID rantai dari rantai sumber daya (jaringan asal aset ini).

## URL JSON-RPC untuk Polygon PoS {#json-rpc-url-for-polygon-pos}

Untuk panduan ini, kita akan menggunakan https://rpc-mumbai.matic.today, URL JSON-RPC publik yang disediakan oleh Polygon, yang dapat memiliki lalu lintas atau batas kecepatan. Ini akan digunakan hanya untuk menghubungkan dengan tesnet Polygon Mumbai. Kami menyarankan Anda untuk mendapatkan URL JSON-RPC melalui layanan eksternal seperti Infura karena menyebar kontrak akan mengirim banyak kueri/permintaan kepada JSON-RPC.

## Cara memproses transfer token {#ways-of-processing-the-transfer-of-tokens}
Ketika mentransfer token ERC20 antara beberapa rantai, token itu akan diproses pada dua mode:

### Mode lock/release (kunci/rilis) {#lock-release-mode}
<b>Rantai sumber: </b>Token yang Anda kirim akan terkunci di dalam Kontrak Handler.  <br/>
<b>Rantai tujuan:</b> Jumlah token yang sama seperti yang Anda kirim di rantai sumber akan terbuka dan ditransfer dari kontrak Handler kepada akun penerima di rantai tujuan.

### Mode burn/mint (bakar/cetak) {#burn-mint-mode}
<b>Rantai sumber:</b> Token yang Anda kirim akan dibakar.   <br/>
<b>Rantai tujuan:</b> Jumlah token yang sama yang Anda kirim dan bakar di rantai sumber akan dicetak/dibuat di rantai tujuan dan dikirim ke akun penerima.

Anda dapat menggunakan berbagai meode pada setiap rantai. Ini berarti Anda dapat mengunci token pada rantai utama sembari mencetak token di subrantai untuk transfer. Misalnya, mungkin masuk akal untuk mengunci/melepas token jika pasokan total atau jadwal cetak dikendalikan. Token akan dicetak/dibakar jika kontrak di subrantai harus mengikuti pasokan di rantai utama.

Mode default adalah mode lock/release (kunci/rilis). Jika ingin membuat Token dapat dicetak/dibakar, Anda harus memanggil metode `adminSetBurnable`. Jika ingin mencetak token pada eksekusi, Anda harus memberi peran `minter` kepada kontrak Handler ERC20.



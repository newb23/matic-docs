---
id: query-operator-info
title: Informasi operator kueri
description: "Cara melakukan kueri terhadap informasi operator."
keywords:
  - docs
  - polygon
  - edge
  - node
  - query
  - operator
---

## Prasyarat {#prerequisites}

Panduan ini mengasumsikan Anda telah melakukan [Penyiapan Lokal](/docs/edge/get-started/set-up-ibft-locally) atau [panduan tentang cara menyiapkan klaster IBFT di cloud](/docs/edge/get-started/set-up-ibft-on-the-cloud).

Node yang berfungsi dibutuhkan untuk melakukan kueri terhadap informasi operator apa pun.

Dengan Polygon Edge, operator node memiliki kontrol dan memahami apa yang dilakukan oleh node yang dioperasikan.<br />
Setiap saat, operator dapat menggunakan lapisan node, yang dibuat berdasarkan gRPC, dan mendapat informasi bermakna - tanpa harus melakukan penyisiran log.

:::note

Jika node tidak berjalan pada `127.0.0.1:8545`, Anda harus menambah bendera `--grpc-address <address:port>` ke perintah yang terdaftar di dalam dokumen ini.

:::

## Informasi peer {#peer-information}

### Daftar peer {#peers-list}

Untuk mendapat daftar lengkap peer yang tersambung (termasuk node berjalan), jalankan perintah berikut:
````bash
polygon-edge peers list
````

Ini akan memberi daftar alamat libp2p dari peer yang saat ini merupakan klien yang beroperasi.

### Status peer {#peer-status}

Untuk status peer tertentu, jalankan:
````bash
polygon-edge peers status --peer-id <address>
````
Dengan parameter *address* yang merupakan alamat libp2p dari peer itu.

## Info IBFT {#ibft-info}

Umumnya, operator mungkin ingin tahu tentang kondisi node pengoperasian dalam konsensus IBFT.

Untungnya, Polygon Edge menyediakan cara mudah untuk menemukan informasi ini.

### Snapshot {#snapshots}

Menjalankan perintah berikut akan memberi snapshot terbaru.
````bash
polygon-edge ibft snapshot
````
Untuk melakukan kueri snapshot pada tinggi spesifik (nomor blok), operator dapat menjalankan:
````bash
polygon-edge ibft snapshot --num <block-number>
````

### Kandidat {#candidates}

Untuk mendapat info terbaru tentang kandidat, operator dapat menjalankan:
````bash
polygon-edge ibft candidates
````
Perintah ini melakukan kueri pada set terbaru kandidat yang diusulkan, juga kandidat = yang belum disertakan

### Status {#status}

Perintah berikut memberi kunci validaor saat ini dari klien yang menjalankan IBFT:
````bash
polygon-edge ibft status
````

## Kumpulan transaksi {#transaction-pool}

Untuk menemukan nomor transaksi saat ini di kumpulan transaksi, operator dapat menjalankan:
````bash
polygon-edge txpool status
````

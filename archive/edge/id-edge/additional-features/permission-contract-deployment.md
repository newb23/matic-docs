---
id: permission-contract-deployment
title: Izin penyebaran kontrak cerdas
description: Cara menambah izin penyebaran kontrak cerdas.
keywords:
  - docs
  - polygon
  - edge
  - smart contract
  - permission
  - deployment
---

## Ikhtisar {#overview}

Panduan ini menguraikan cara membuat daftar putih alamat yang dapat menyebar kontrak cerdas.
Terkadang, operator jaringan ingin mencegah pengguna menyebar kontrak cerdas yang tidak berkaitan dengan tujuan jaringan. Operator jaringan dapat:

1. Membuat daftar putih alamat untuk penyebaran Kontrak Cerdas
2. Menghapus alamat dari daftar putih untuk penyebaran Kontrak Cerdas

## Presentasi video {#video-presentation}

[![video contract deployment - video](https://img.youtube.com/vi/yPOkINpf7hg/0.jpg)](https://www.youtube.com/watch?v=yPOkINpf7hg)

## Bagaimana cara menggunakannya? {#how-to-use-it}


Anda dapat menemukan semua perintah CLI yang berkaitan dengan daftar putih penyebaran di halaman [Perintah CLI](/docs/edge/get-started/cli-commands#whitelist-commands).

* `whitelist show`: Menampilkan informasi daftar putih
* `whitelist deployment --add`:  Menambah alamat baru ke daftar putih penyebaran kontrak
* `whitelist deployment --remove`:  Menghapus alamat baru dari daftar putih penyebaran kontrak

#### Menampilkan semua alamat di daftar putih penyebaran {#show-all-addresses-in-the-deployment-whitelist}

Ada 2 cara untuk menemukan alamat dari daftar putih penyebaran.
1. Perhatikan `genesis.json` tempat daftar putih tersimpan
2. Menjalankan `whitelist show` akan mencetak informasi dari semua daftar putih yang didukung oleh Polygon Edge

```bash

./polygon-edge whitelist show

[WHITELISTS]

Contract deployment whitelist : [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d],


```

#### Menambah alamat ke daftar putih penyebaran {#add-an-address-to-the-deployment-whitelist}

Untuk menambah alamat baru ke daftar putih penyebaran, jalankan perintah CLI `whitelist deployment --add [ADDRESS]`. Tidak ada batasan jumlah alamat yang ada di dalam daftar putih. Hanya alamat yang ada di dalam daftar putih penyebaran kontrak yang dapat menyebarkan kontrak. Jika daftar putih kosong, alamat apa pun dapat melakukan penyebaran

```bash

./polygon-edge whitelist deployment --add 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d --add 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF


[CONTRACT DEPLOYMENT WHITELIST]

Added addresses: [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],
Contract deployment whitelist : [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],



```

#### Hapus alamat dari daftar putih penyebaran {#remove-an-address-from-the-deployment-whitelist}

Untuk menghapus alamat dari daftar putih penyebaran, jalankan perintah CLI `whitelist deployment --remove [ADDRESS]`. Hanya alamat yang ada di dalam daftar putih penyebaran kontrak yang dapat menyebarkan kontrak. Jika daftar putih kosong, alamat apa pun dapat melakukan penyebaran

```bash

./polygon-edge whitelist deployment --remove 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d --remove 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF


[CONTRACT DEPLOYMENT WHITELIST]

Removed addresses: [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],
Contract deployment whitelist : [],



```

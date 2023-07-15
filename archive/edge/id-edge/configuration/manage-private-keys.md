---
id: manage-private-keys
title: Mengelola kunci privat
description: "Cara mengelola kunci privat dan berbagai jenis kunci yang ada."
keywords:
  - docs
  - polygon
  - edge
  - private
  - key
  - keystore
---

## Ikhtisar {#overview}

Polygon Edge memiliki dua jenis kunci privat yang secara langsung mengelola:

* **Kunci privat yang digunakan untuk mekanisme konsensus**
* **Kunci privat untuk jaringan oleh libp2p**
* **(Opsional) Kunci Privat BLS digunakan untuk mekanisme konsensus yang mengagregasikan tanda tangan validator**

Saat ini, Polygon Edge tidak menawarkan dukungan pengelolaan akun secara langsung.

Berdasarkan struktur direktori yang diuraikan dalam [Panduan Pencadangan & Pemulihan](/docs/edge/working-with-node/backup-restore),
Polygon Edge menyimpan file kunci pada dua direktori berbeda - **consensus** dan **keystore**.

## Format kunci {#key-format}

Kunci privat disimpan dalam **format Base64** sederhana, sehingga dapat dibaca manusia dan portabel.

```bash
# Example private key
0802122068a1bdb1c8af5333e58fe586bc0e9fc7aff882da82affb678aef5d9a2b9100c0
```

:::info Jenis Kunci

Semua kunci privat yang dibuat dan digunakan di dalam Polygon Edge bergantung pada kurva [secp256k1](https://en.bitcoin.it/wiki/Secp256k1).

Karena kurvanya tidak standar, kurva itu tidak dapat dikodekan dan disimpan dalam format PEM standar apa pun.
Mengimpor kunci yang tidak sesuai dengan kunci ini tidak didukung.

:::
## Kunci Privat Konsensus {#consensus-private-key}

File kunci privat yang disebut sebagai *kunci privat konsensus* juga dirujuk sebagai **kunci perivat validator**.
Kunci privat ini digunakan saat node bertindak sebagai validator di dalam jaringan dan perlu menandatangani data baru.

File kunci privat berada di `consensus/validator.key` dan mematuhi [format kunci](/docs/edge/configuration/manage-private-keys#key-format) tersebut.

:::warning

Kunci privat validator bersifat unik untuk setiap node validator. Kunci yang sama <b>tidak</b> dibagikan di semua validator, karena ini dapat mengganggu keamanan rantai Anda.

:::

## Kunci Privat Jaringan {#networking-private-key}

File kunci privat tersebut untuk jaringan digunakan oleh libp2p untuk membuat PeerID terkait dan memungkinkan node berpartisipasi dalam jaringan.

Ini terletak di `keystore/libp2p.key` dan mematuhi [format kunci](/docs/edge/configuration/manage-private-keys#key-format) tersebut.

## Kunci Rahasia BLS {#bls-secret-key}

File kunci rahasia BLS digunakan untuk mengumpulkan segel yang ditetapkan di dalam lapisan konsensus, Ukuran segel yang ditetapkan itu dikumpulkan oleh BLS dan kurang dari rangkaian tanda tangan ECDSA yang ditetapkan.

Fitur BLS bersifat opsional dan memungkinkan untuk memilih apakah akan menggunakan BLS atau tidak. Lihat [BLS](/docs/edge/consensus/bls) untuk detail selengkapnya.

## Impor / Ekspor {#import-export}

Saat disimpan dalam format Base64 sederhana di disk, file kunci dapat dicadangkan atau diimpor dengan mudah.

:::caution Mengubah file kunci

Segala jenis perubahan yang dilakukan pada file kunci di jaringan yang sudah disiapkan/berjalan dapat menyebabkan gangguan serius pada jaringan/konsensus,
karena konsensus dan mekanisme penemuan peer menyimpan data yang didapat dari kunci ini di penyimpanan node tertentu dan bergantung pada data untuk
memulai koneksi dan melakukan logika konsensus

:::
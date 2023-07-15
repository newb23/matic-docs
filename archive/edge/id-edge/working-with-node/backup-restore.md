---
id: backup-restore
title: Instans node pencadangan/pemulihan
description: "Cara mencadangkan dan memulihkan instans node Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - instance
  - restore
  - directory
  - node
---

## Ikhtisar {#overview}

Panduan ini memberi perincian tentang cara mencadangkan dan memulihkan instans node Polygon Edge.
Ini mencakup folder dasar dan isinya, juga file mana yang penting untuk melakukan pencadangan dan pemulihan yang berhasil.

## Folder dasar {#base-folders}

Polygon Edge memanfaatkan LevelDB sebagai mesin penyimpanan.
Saat memulai node Polygon Edge, subfolder berikut dibuat di direktori kerja yang ditetapkan:
* **blockchain** - Menyimpan data blockchain
* **trie** - Menyimpan pohon Merkle (data kondisi dunia)
* **keystore** - Menyimpan kunci privat untuk klien. Ini termasuk kunci privat libp2p dan kunci privat sealing/validator
* **consensus** - Menyimpan segala informasi konsensus yang mungkin dibutuhkan klien saat bekerja. Untuk saat ini, konsensus menyimpan *kunci validator privat* dari node

Folder-folder ini tidak boleh diubah supaya instans Polygon Edge dapat berjalan dengan lancar.

## Buat cadangan node aktif dan pulihkan untuk node baru {#create-backup-from-a-running-node-and-restore-for-new-node}

Bagian ini memandu pembuatan data arsip blockchain dalam node aktif dan memulihkannya di instans lain.

### Cadangan {#backup}

Perintah `backup` mengambil blok dari node aktif dengan gRPC dan membuat file arsip. Jika `--from` dan `--to` tidak ditentukan di dalam perintah, perintah akan mengambil blok dari awal hingga akhir.

```bash
$ polygon-edge backup --grpc-address 127.0.0.1:9632 --out backup.dat [--from 0x0] [--to 0x100]
```

### Pemulihan {#restore}

Server mengimpor blok dari arsip di awal saat memulai dengan bendera `--restore`. Pastikan ada kunci untuk setiap node baru. Untuk mencari tahu selengkapnya tentang mengimpor atau membuat kunci, kunjungi [bagian Pengelola Rahasia](/docs/edge/configuration/secret-managers/set-up-aws-ssm).

```bash
$ polygon-edge server --restore archive.dat
```

## Pencadangan/Pemulihan Seluruh Data {#back-up-restore-whole-data}

Bagian ini memandu pencadangan data termasuk data kondisi dan kunci serta memulihkan ke instans baru.

### Langkah 1: Hentikan klien yang berjalan {#step-1-stop-the-running-client}

Karena Polygon Edge menggunakan **LevelDB** untuk penyimpanan data, node harus dihentikan selama durasi pencadangan,
karena **LevelDB** tidak mengizinkan akses bersamaan ke file database.

Selain itu, Polygon Edge juga melakukan pembersihan data saat menutup.

Langkah pertama melibatkan penghentian klien yang berjalan (baik melalui manajer layanan maupun mekanisme lain yang mengirim sinyal SIGINT ke proses itu),
agar dapat memicu 2 kejadian sekaligus mematikan dengan mulus:
* Menjalankan pembersihan data pada disk
* Melepas kunci file DB oleh LevelDB

### Langkah 2: Mencadangkan direktori {#step-2-backup-the-directory}

Setelah klien tidak lagi berjalan, direktori data dapat dicadangkan ke media lain.
Ingatlah bahwa file dengan ekstensi `.key` memuat kunci privat yang dapat digunakan untuk meniru node saat ini
dan tidak boleh dibagikan kepada pihak ketiga/tidak dikenal.

:::info

Cadangkan dan pulihkan file `genesis` yang dibuat secara manual, sehingga node yang dipulihkan akan beroperasi penuh.

:::

## Pemulihan {#restore-1}

### Langkah 1: Hentikan klien yang berjalan {#step-1-stop-the-running-client-1}

Jika instans apa pun dari Polygon Edge berjalan, ini harus dihentikan supaya langkah 2 berhasil.

### Langkah 2: Salin direktori data yang dicadangkan ke folder yang diinginkan {#step-2-copy-the-backed-up-data-directory-to-the-desired-folder}

Setelah klien tidak berjalan, direktori data yang sebelumnya dicadangkan dapat disalin ke folder yang diinginkan.
Selain itu, pulihkan file `genesis` yang disalin sebelumnya.

### Langkah 3: Jalankan klien Polygon Edge sembari menentukan direktori data yang benar {#step-3-run-the-polygon-edge-client-while-specifying-the-correct-data-directory}

Supaya Polygon Edge dapat menggunakan direktor data yang dipulihkan, saat menjalankan, pengguna harus menentukan jalur ke
direktori. data. Silakan baca bagian [Perintah CLI](/docs/edge/get-started/cli-commands) untuk informasi tentang bendera `data-dir`.

---
id: syncer
title: Syncer
description: Penjelasan modul syncer di Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - synchronization
---

## Ikhtisar {#overview}

Modul ini berisi logika untuk protokol sinkronisasi. Modul ini untuk menyinkronkan node baru dengan jaringan yang sedang berjalan atau memvalidasi/memasukkan blok baru bagi node yang tidak turut serta dalam konsensus (non-validator).

Polygon Edge menggunakan **libp2p** sebagai lapisan jaringan dan juga menjalankan **gRPC**.

Pada dasarnya, ada 2 jenis sinkronisasi di Polygon Edge:
* Sinkronisasi Massal - menyinkronkan berbagai blok secara bersamaan
* Sinkronisasi Watch - menyinkronkan per blok

### Sinkronisasi Massal {#bulk-sync}

Langkah-langkah untuk Sinkronisasi Massal cukup mudah untuk mengakomodasi tujuan Sinkronisasi Massal - menyinkronkan blok sebanyak mungkin (tersedia) dari peer lain untuk mengejar secepat mungkin.

Ini adalah aliran proses dari Sinkronisasi Massal:

1. ** Tentukan apakah node perlu Sinkronisasi Massal ** - Pada langkah ini, node memeriksa peta peer untuk melihat apakah ada yang memiliki nomor blok lebih besar daripada yang dimiliki node secara lokal
2. ** Cari peer terbaik (menggunakan peta peer sinkronisasi) ** - Pada langkah ini, node menemukan peer terbaik untuk disinkronkan berdasarkan kriteria yang disebutkan pada contoh di atas.
3. ** Buka aliran sinkronisasi massal ** - Pada langkah ini, node membuka aliran gRPC ke peer terbaik untuk menyinkronkan blok sinkronisasi massal dari nomor blok umum
4. ** Peer terbaik menutup aliran saat melakukan pengiriman massal ** - Pada langkah ini, peer terbaik yang disinkronkan dengan node akan menutup aliran setelah mengirim semua blok tersedia yang dimilikinya
5. ** Saat melakukan sinkronisasi massal, periksa apakah node adalah validator ** - Pada langkah ini, aliran ditutup oleh peer terbaik dan node perlu memeriksa apakah itu merupakan validator setelah sinkronisasi massal.
  * Jika benar, node melompat keluar dari kondisi sinkronisasi dan mulai turut serta dalam konsensus
  * Jika bukan, node terus melakukan ** Sinkronisasi Watch **

### Sinkronisasi Watch {#watch-sync}

:::info

Langkah Sinkronisasi Watch hanya dijalankan jika node tersebut bukan validator, tetapi node non-validator biasa di jaringan yang hanya mendengarkan blok yang datang.

:::

Perilaku Sinkronisasi Watch cukup mudah, node sudah disinkronkan dengan jaringan lainnya dan hanya perlu mengurai blok baru yang masuk.

Ini adalah alur proses Sinkronisasi Watch:

1. ** Tambah blok baru ketika status peer diperbarui ** - Pada langkah ini, node mendengarkan peristiwa blok baru. Ketika memiliki blok baru, node akan menjalankan panggilan fungsi gRPC, mendapatkan blok, dan memperbarui kondisi lokal.
2. ** Periksa apakah node adalah validator setelah menyinkronkan blok terbaru **
   * Jika benar, node melompat keluar dari kondisi sinkronisasi
   * Jika bukan, node terus mendengarkan peristiwa blok baru

## Laporan kinerja {#perfomance-report}

:::info

Kinerja diukur di mesin lokal dengan menyinkronkan ** jutaan blok **

:::

| Nama | Hasil |
|----------------------|----------------|
| Menyinkronkan 1J blok | ~ 25 menit |
| Mentransfer 1J blok | ~ 1 menit |
| Jumlah panggilan GRPC | 2 |
| Cakupan tes | ~ 93% |
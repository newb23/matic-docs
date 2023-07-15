---
id: overview
title: Ikhtisar Arsitektur
sidebar_label: Overview
description: Pengantar arsitektur Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - modular
  - layer
  - libp2p
  - extensible
---

Kami mulai dengan ide membuat perangkat lunak yang *modular*.

Ini hampir semua bagian Polygon Edge. Di bawah ini, Anda akan menemukan gambaran singkat
arsitektur yang dibangun dan lapisannya.

## Lapisan Polygon Edge {#polygon-edge-layering}

![Arsitektur Polygon Edge](/img/edge/Architecture.jpg)

## Libp2p {#libp2p}

Ini semua dimulai pada lapisan jaringan dasar yang memanfaatkan **libp2p**. Kami memutuskan untuk menggunakan teknologi ini, karena
cocok dengan filosofi desain Polygon Edge. Libp2p adalah:

- Modular
- Dapat diperluas
- Cepat

Yang paling penting, ini menyediakan dasar yang bagus untuk fitur lebih canggih yang akan kita bahas nanti.


## Sinkronisasi & Konsensus {#synchronization-consensus}
Pemisahan protokol sinkronisasi dan konsensus memungkinkan modularitas dan implementasi sinkronisasi **kustom** dan mekanisme konsensus - tergantung bagaimana klien dijalankan.

Polygon Edge dirancang untuk menawarkan algoritma konsensus yang dapat dibuat plugin.

Daftar algoritme konsensus yang didukung saat ini:

* IBFT PoA
* IBFT PoS

## Blockchain {#blockchain}
Lapisan Blockchain adalah lapisan pusat yang mengoordinasikan segala sesuatu dalam sistem Polygon Edge. Hal ini dibahas secara mendalam dalam bagian *Modul* terkait.

## Kondisi {#state}
Lapisan dalam kondisi berisi logika transisi kondisi. Ini berkaitan dengan bagaimana perubahan kondisi ketika blok baru disertakan. Hal ini dibahas secara mendalam dalam bagian *Modul* terkait.

## JSON RPC {#json-rpc}
Lapisan JSON RPC adalah lapisan API yang digunakan pengembang dApp untuk berinteraksi dengan blockchain. Hal ini dibahas secara mendalam dalam bagian *Modul* terkait.

## TxPool {#txpool}
Lapisan TxPool mewakili kumpulan transaksi dan terkait erat dengan modul lain dalam sistem, karena transaksi dapat ditambahkan dari beberapa titik masuk.

## grpc {#grpc}
gRPC, atau Google Remote Procedure Call, adalah kerangka RPC sumber terbuka yang kuat yang dibuat oleh Google untuk membangun API yang dapat dibaca dan cepat. Lapisan GRPC sangat penting untuk interaksi operator. Melalui lapisan itu, operator node dapat berinteraksi dengan klien dan memberikan UX yang bagus.

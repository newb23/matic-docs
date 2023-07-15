---
id: overview
title: Ikhtisar
description: Ikhtisar ChainBridge
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

## Apa itu ChainBridge? {#what-is-chainbridge}

ChainBridge adalah jembatan blockchain modular multiarah yang mendukung rantai yang kompatibel dengan EVM dan Substrat, yang dibuat oleh ChainSafe. Jembatan ini memungkinkan pengguna mentransfer semua jenis aset atau pesan antara dua rantai berbeda.

Untuk mencari tahu lebih banyak tentang ChainBrige, silakan baca [dokumen resmi](https://chainbridge.chainsafe.io/) yang disediakan oleh pengembangnya.

Panduan ini untuk membantu integrasi Chainbridge ke Polygon Edge. Panduan ini membahas penyiapan jembatan antara Polygon PoS yang berjalan (testnet Mumbai) dan jaringan Polygon Edge lokal.

## Persyaratan {#requirements}

Dalam panduan ini, Anda akan menjaankan node Polygon Edge, relayer ChainBridge (lebih lanjut tentang hal ini [di sini](/docs/edge/additional-features/chainbridge/definitions)), dan alat cb-sol-cli yang merupakan alat CLI untuk menyebarkan kontrak secara lokal, mendaftarkan sumber daya, dan mengubah pengaturan jembatan (Anda dapat membacanya [di sini](https://chainbridge.chainsafe.io/cli-options/#cli-options) juga). Lingkungan berikut diperlukan sebelum memulai penyiapan:

* Baca: >= 1.17
* Node.js >= 16.13.0
* Git


Selain itu, Anda perlu mengklona repositori berikut bersama versinya untuk menjalankan beberapa aplikasi.

* [Polygon Edge](https://github.com/0xPolygon/polygon-edge): di cabang `develop`
* [ChainBridge](https://github.com/ChainSafe/ChainBridge): v1.1.5
* [Alat Penyebaran ChainBridge](https://github.com/ChainSafe/chainbridge-deploy): `f2aa093` di cabang `main`


Anda perlu menyiapkan jaringan Polygon Edge sebelum melanjutkan ke bagian selanjutnya. Silakan baca [Penyiapan Lokal](/docs/edge/get-started/set-up-ibft-locally) atau [Penyiapan Cloud](/docs/edge/get-started/set-up-ibft-on-the-cloud) untuk informasi selengkapnya.
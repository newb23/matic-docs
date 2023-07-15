---
id: overview
title: Ikhtisar
description: "Pengantar pengujian Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - performance
  - tests
  - loadbot
---
:::caution
Perlu diperhatikan bahwa kami `loadbot`yang digunakan untuk melakukan tes ini, sekarang sudah selesai.
:::

| Tipe | Nilai | Tautan ke pengujian |
| ---- | ----- | ------------ |
| Transfer Reguler | 1428 tps | [4 Juli 2022](test-history/test-2022-07-04.md#results-of-eoa-to-eoa-transfers) |
| Transfer ERC-20 | 1111 tps | [4 Juli 2022](test-history/test-2022-07-04.md#results-of-erc20-token-transfers) |
| Pencetakan NFT | 714 tps | [4 Juli 2022](test-history/test-2022-07-04.md#results-of-erc721-token-minting) |

---

Sasaran kita adalah membuat dan merawat perangkat lunak klien blockchain yang berkinerja tinggi, kaya fitur, dan mudah disiapkan.
Semua pengujian dilakukan menggunakan Polygon Edge Loadbot.
Semua laporan kinerja yang Anda akan temukan pada bagian ini telah diberi tanggal yang tepat, lingkungannya digambarkan dengan jelas, dan metode pengujian diuraikan dengan jelas.

Sasaran pengujian kinerja ini adalah menunjukkan kinerja jaringan blockchain Polygon Edge di dunia nyata.
Siapa pun bisa mendapat hasil serupa seperti yang dicantumkan di sini, pada lingkungan yang sama, menggunakan loadbot kami.

Semua pengujian kinerja dilakukan di platform AWS pada rantai yang terdiri dari node instans EC2.
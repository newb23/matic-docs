---
id: overview
title: Polygon Edge
sidebar_label: What is Edge
description: "Pengantar Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - network
  - modular

---

Polygon Edge adalah kerangka kerja modular dan dapat diperluas untuk membangun jaringan blockchain, rantai sisi, dan solusi penskalaan umum yang kompatibel dengan Ethereum.

Penggunaan utamanya yaitu melakukan bootstrap pada jaringan blockchain baru sembari menyediakan kompatibilitas penuh dengan kontrak dan cerdas Ethereum. Polygon Edge menggunakan mekanisme konsensus IBFT (Istanbul Byzantine Fault Tolerant), yang didukung dalam dua jenis yakni [PoA (proof of authority)](/docs/edge/consensus/poa) dan [PoS (proof of stake)](/docs/edge/consensus/pos-stake-unstake).

Polygon Edge juga mendukung komunikasi dengan berbagai jaringan blockchain, memungkinkan transfer token [ERC-20](https://ethereum.org/en/developers/docs/standards/tokens/erc-20) dan [ERC-721](https://ethereum.org/en/developers/docs/standards/tokens/erc-721), dengan memanfaatkan [solusi jembatan tersentralisasi](/docs/edge/additional-features/chainbridge/overview).

Dompet standar industri dapat digunakan untuk berinteraksi dengan Polygon Edge melalui titik akhir [JSON-RPC](/docs/edge/working-with-node/query-json-rpc) dan operator node dapat melakukan berbagai tindakan pada node melalui protokol [gRPC](/docs/edge/working-with-node/query-operator-info).

Untuk mengetaui lebih banyak tentang Polygon, kunjungi [situs resminya](https://polygon.technology).

**[Repositori GitHub](https://github.com/0xPolygon/polygon-edge)**

:::caution

Ini masih dalam pengembangan sehingga perubahan arsitektur dapat terjadi di masa depan. Kode ini belum diaudit,
tetapi hubungi tim Polygon jika Anda ingin menggunakannya dalam produksi.

:::



Untuk mulai menjalankan jaringan `polygon-edge` secara lokal, baca: [Instalasi](/docs/edge/get-started/installation) dan [Penyiapan Lokal](/docs/edge/get-started/set-up-ibft-locally).

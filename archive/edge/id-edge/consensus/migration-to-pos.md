---
id: migration-to-pos
title: Migrasi dari PoA ke PoS
description: "Cara migrasi dari mode PoA ke mode PoS IBFT, dan sebaliknya."
keywords:
  - docs
  - polygon
  - edge
  - migrate
  - PoA
  - PoS
---

## Ikhtisar {#overview}

Bagian ini memandu tentang migrasi mode PoA ke PoS IBFT, dan sebaliknya, untuk klaster aktif - tanpa perlu mengatur ulang blockchain.

## Cara migrasi ke PoS {#how-to-migrate-to-pos}

Anda harus menghentikan semua node, menambah konfigurasi fork ke genesis.json dengan perintah `ibft switch`, dan memulai ulang node.

````bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --deployment 100 --from 200
````
:::caution Beralih ketika menggunakan ECDSA
Ketika menggunakan ECDSA, `--ibft-validator-type`bendera harus ditambahkan ke dalam switch, menyebutkan bahwa ECDSA digunakan. Jika tidak termasuk, Edge akan secara otomatis beralih ke BLS.

````bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --ibft-validator-type ecdsa --deployment 100 --from 200
````
:::Untuk beralih ke PoS, Anda harus menentukan ketinggian 2 blok: `deployment`dan `from``deployment`adalah tinggi untuk menyebarkan kontrak staking `from`dan merupakan puncak awal PoS. Kontrak staking akan disebarkan di alamat `deployment` di `0x0000000000000000000000000000000000001001`, seperti kasus kontrak sebelum disebarkan.

Lihat [Proof of Stake](/docs/edge/consensus/pos-concepts) untuk perincian lebih lanjut tentang kontrak Staking.

:::warning Validator perlu melakukan stake secara manual

Setiap validator perlu melakukan stake kontrak setelah kontrak disebarkan di `deployment` dan sebelum `from` untuk menjadi validator di awal PoS. Setiap validator akan memperbarui set validator yang diatur oleh set kontrak staking di awal PoS.

Untuk mencari tahu lebih lanjut tentang Staking, kunjungi **[Set up dan menggunakan Proof of Stake](/docs/edge/consensus/pos-stake-unstake)**.
:::

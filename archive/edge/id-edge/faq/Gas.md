---
id: gas
title: FAQ Gas
description: "FAQ Gas untuk Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - FAQ
  - validators

---

## Bagaimana cara menerapkan harga gas minimum? {#how-to-enforce-a-minimum-gas-price}
Anda dapat menggunakan bendera `--price-limit` yang disediakan di perintah server. Ini akan menerapkan node untuk hanya menerima transaksi yang memiliki gas yang lebih tinggi atau sama dengan batas harga yang ditentukan. Guna memastikan hal ini diterapkan di jaringan ini, Anda harus memastikan semua node memiliki batas harga yang sama.


## Dapatkah Anda memiliki transaksi dengan biaya gas 0? {#can-you-have-transactions-with-0-gas-fees}
Ya, bisa. Batas harga default yang diberlakukan oleh node adalah `0`, artinya node akan menerima transaksi yang memiliki harga gas yang ditetapkan ke `0`.

## Bagaimana mengatur total pasokan token gas (asli)? {#how-to-set-the-gas-native-token-total-supply}

Anda dapat mengatur saldo yang telah ditambang ke akun (alamat) dengan menggunakan `--premine flag`. Harap diperhatikan bahwa ini konfigurasi dari file genesis dan tidak dapat diubah.

Contoh cara menggunakan `--premine flag`:

`--premine=0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000`

Ini mengatur saldo yang telah ditambang dari 1000 ETH ke 0x3956E90e632AebBF34DEB49b71c28A83Bc029862 (nilai argumen dalam wei).

jumlah token gas yang ditambang akan menjadi total pasokan. Tidak ada jumlah mata uang asli lainnya (token gas) yang dapat dibuat.

## Apakah Edge mendukung ERC-20 sebagai token gas? {#does-edge-support-erc-20-as-a-gas-token}

Edge tidak mendukung token ERC-20 sebagai token gas. Hanya mata uang Edge asli yang didukung untuk gas.

## Bagaimana untuk meningkatkan batas gas? {#how-to-increase-the-gas-limit}

Ada dua pilihan untuk meningkatkan batas gas dalam Polygon Edge:
1. Wiping rantai dan meningkatkan `block-gas-limit`nilai uint64 maksimum dalam file genesis
2. Gunakan `--block-gas-target`bendera dengan nilai yang tinggi untuk meningkatkan batas gas dari semua node. Ini membutuhkan reboot node. [Penjelasan](/docs/edge/architecture/modules/txpool/#block-gas-target) yang terinci
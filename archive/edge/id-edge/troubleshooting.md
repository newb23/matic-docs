---
id: troubleshooting
title: Penyelesaian masalah
description: "Bagian penyelesaian masalah untuk Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - troubleshooting

---

# Penyelesaian masalah {#troubleshooting}

## Error `method=eth_call err="invalid signature"` {#error}

Ketika menggunakan dompet untuk membuat transaksi Polygon Edge, pastikan pengaturan jaringan lokal dompet:

1. `chainID` adalah yang benar. `chainID` default untuk Edge adalah `100`, tetapi ini dapat dikustomisasi menggunakan bendera genesis `--chain-id`.

````bash
genesis [--chain-id CHAIN_ID]
````
2. Di "URL RPC", pastikan bidang menggunakan port RPC JSON dari node yang dihubungi.


## Cara mendapatkan URL Websocket {#how-to-get-a-websocket-url}

Ketika Anda menjalankan Polygon Edge secara default, itu mengekspos titik akhir WebSocket berdasarkan lokasi rantai.
Skema URL `wss://` digunakan untuk tautan HTTPS dan `ws://` untuk HTTP.

URL WebSocket Localhost:
````bash
ws://<JSON-RPC URL>:<PORT>/ws
````
Perlu diperhatikan bahwa nomor port tergantung pada port JSON-RPC yang dipilih untuk node tersebut.

URL WebSocket Edgenet:
````bash
wss://rpc-edgenet.polygon.technology/ws
````

## Error `insufficient funds` ketika mencoba menyebar kontrak {#error-when-trying-to-deploy-a-contract}

Jika mendapatkan error ini, pastikan Anda memiliki dana yang cukup pada alamat yang diinginkan dan alamat yang digunakan sudah benar.<br/>
Untuk menentukan saldo pratambang, Anda dapat menggunakan bendera genesis `genesis [--premine ADDRESS:VALUE]` sambil menghasilkan file genesis.
Contoh penggunaan bendera ini:
````bash
genesis --premine 0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000
````
Pratambang 1000000000000000000000 WEI ini ke 0x3956E90e632AEbBF34DEB49b71c28A83Bc029862.


## Token ERC20 tidak dirilis ketika menggunakan Chainbridge {#erc20-tokens-not-released-while-using-chainbridge}

Jika Anda ingin mentransfer token ERC20 antara Polygon POS dan jaringan Edge lokal, token ERC20 didepositkan, dan proposal dieksekusi di relayer, tetapi token tidak dirilis di jaringan Edge, pastikan Handler ERC20 di Polygon Edge memiliki token yang cukup untuk dirilis. <br/>
Kontrak Handler di rantai tujuan harus memiliki token yang cukup untuk dilepas untuk mode lock-release. Jika tidak memiliki token ERC20 apa pun di Handler ERC20 dari jaringan Edge lokal, cetak token baru dan transfer ke Handler ERC20.

## `Incorrect fee supplied`error ketika menggunakan Chainbridge {#error-when-using-chainbridge}

Anda mungkin mendapatkan error ini ketika mencoba mentransfer token ERC20 antara rantai POS Polygon Mumbai dan pengaturan Polygon Edge Polygon lokal. Error ini muncul ketika Anda mengatur biaya ketika menyebarkan menggunakan `--fee` bendera, tetapi Anda tidak mengatur nilai yang sama di transaksi setor. Anda dapat menggunakan perintah di bawah untuk mengubah biaya:
````bash
 $ cb-sol-cli admin set-fee --bridge <BRIDGE_ADDRESS> --fee 0 --url <JSON_RPC_URL> --privateKey <PRIVATE_KEY>
 ````
Anda dapat menemukan informasi lebih lanjut tentang bendera ini [di sini](https://github.com/ChainSafe/chainbridge-deploy/blob/main/cb-sol-cli/docs/deploy.md).






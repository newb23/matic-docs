---
id: query-json-rpc
title: Titik Akhir Kueri JSON RPC
description: "Melakukan kueri data dan memulai rantai dengan akun pratambang."
keywords:
  - docs
  - polygon
  - edge
  - query
  - premine
  - node
---

## Ikhtisar {#overview}

Lapisan JSON-RPC dari Polygon Edge menyediakan fungsionalitas agar pengembang dapat berinteraksi secara mudah dengan blockchain
melalui permintaan HTTP.

Contoh ini mencakup penggunaan peralatan seperti **curl** untuk informasi kueri, serta memulai rantai dengan akun pratambang
dan mengirim transaksi.

## Langkah 1: Buat file genesis dengan akun pratambang {#step-1-create-a-genesis-file-with-a-premined-account}

Untuk menghasilkan file genesis, jalankan perintah berikut:
````bash
polygon-edge genesis --premine 0x1010101010101010101010101010101010101010
````

Bendera **premine** mengatur alamat yang harus disertakan dengan saldo awal dalam file **genesis**.<br />
Dalam kasus ini, alamat `0x1010101010101010101010101010101010101010` akan memiliki **saldo default** awal
`0xD3C21BCECCEDA1000000`(1 juta token mata uang asli).

Jika kita ingin menentukan saldo alamat dan saldo dengan `:`, seperti:
````bash
polygon-edge genesis --premine 0x1010101010101010101010101010101010101010:0x123123
````

Saldonya dapat berupa nilai `hex` atau `uint256`.

:::warning Hanya akun pratambang yang memiliki kunci privat!

Jika Anda membuat akun pratambang dan tidak memiliki kunci privat untuk mengakses akun tersebut, saldo pratambang tidak dapat digunakan

:::

## Langkah 2: Mulai Polygon Edge dalam mode pengembang {#step-2-start-the-polygon-edge-in-dev-mode}

Untuk memulai Polygon Edge dalam mode pengembang yang dijelaskan di bagian [Perintah CLI](/docs/edge/get-started/cli-commands),
jalankan berikut:
````bash
polygon-edge server --chain genesis.json --dev --log-level debug
````

## Langkah 3: Melakukan kueri saldo akun {#step-3-query-the-account-balance}

Sekarang klien telah aktif dan berjalan dalam mode pengembang. Dengan menggunakan file genesis yang dihasilkan dalam **langkah 1**, kita dapat menggunakan alat seperti
**curl** untuk melakukan kueri saldo akun:
````bash
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x1010101010101010101010101010101010101010", "latest"],"id":1}' localhost:8545
````

Perintah akan memberikan keluaran berikut:
````bash
{
  "id":1,
  "result":"0x100000000000000000000000000"
}
````

## Langkah 4: Kirim transaksi transfer {#step-4-send-a-transfer-transaction}

Karena kita telah mengonfirmasi akun yang ditetapkan sebagai pratambang sudah memiliki saldo yang benar, kita dapat mentransfer beberapa ether:

````js
var Web3 = require("web3");

const web3 = new Web3("<provider's websocket jsonrpc address>"); //example: ws://localhost:10002/ws
web3.eth.accounts
  .signTransaction(
    {
      to: "<recipient address>",
      value: web3.utils.toWei("<value in ETH>"),
      gas: 21000,
    },
    "<private key from premined account>"
  )
  .then((signedTxData) => {
    web3.eth
      .sendSignedTransaction(signedTxData.rawTransaction)
      .on("receipt", console.log);
  });

````

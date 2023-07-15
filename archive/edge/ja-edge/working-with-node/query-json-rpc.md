---
id: query-json-rpc
title: JSON RPCエンドポイントのクエリ
description: "前払いアカウントでデータをクエリし、チェーンを起動します。"
keywords:
  - docs
  - polygon
  - edge
  - query
  - premine
  - node
---

## 概要 {#overview}

Polygon EdgeのJSON RPCレイヤーは開発者にHTTPリクエストを通じてブロックチェーンと簡単にやり取りする機能を提供します。

この例は情報のクエリに**curl**などのツールを使用することや前払いアカウントでチェーンを起動し、トランザクションを送信することをカバーします。

## ステップ1：前払いアカウントでジェネシスファイルを作成 {#step-1-create-a-genesis-file-with-a-premined-account}

ジェネシスファイルを作成するには、次のコマンドを実行します：
````bash
polygon-edge genesis --premine 0x1010101010101010101010101010101010101010
````

**premine**フラグは**ジェネシス**ファイルの当初残高に含まれるアドレスを設定します<br />
この場合、アドレス`0x1010101010101010101010101010101010101010`は当初の**デフォルト残高**は
`0xD3C21BCECCEDA1000000`となります（100万個のネイティブ通貨トークン）。

残高を指定したかった場合は、`:`を使用して残高とアドレスをこのように分けられます：
````bash
polygon-edge genesis --premine 0x1010101010101010101010101010101010101010:0x123123
````

残高は`hex`または`uint256`値のいずれかになります。

:::warning 秘密鍵を持つのは前払いアカウントのみです！

アカウントに前払いし、これらにアクセスするための秘密鍵を持たない場合、前払い残高は使用できなくなります

:::

## ステップ2：Polygon Edgeの開発モードでの起動 {#step-2-start-the-polygon-edge-in-dev-mode}

[CLIコマンド](/docs/edge/get-started/cli-commands)セクションで説明している、Polygon Edgeを開発モードで起動するには、次を実行します：
````bash
polygon-edge server --chain genesis.json --dev --log-level debug
````

## ステップ3：アカウント残高のクエリ {#step-3-query-the-account-balance}

クライアントが**ステップ1**で作成したジェネシスファイルを使用して開発モードで起動、実行したら、**curl**などのツールを使用してアカウント残高をクエリすることができます：
````bash
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x1010101010101010101010101010101010101010", "latest"],"id":1}' localhost:8545
````

コマンドは次の出力を返すはずです：
````bash
{
  "id":1,
  "result":"0x100000000000000000000000000"
}
````

## ステップ4：転送トランザクションの送信 {#step-4-send-a-transfer-transaction}

前払い用に設定したアカウントに正しい残高があることを確認したら、Etherを転送できます：

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

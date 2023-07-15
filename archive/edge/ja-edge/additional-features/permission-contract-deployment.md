---
id: permission-contract-deployment
title: スマートコントラクトデプロイメント許可
description: スマートコントラクトデプロイメント許可を追加する方法。
keywords:
  - docs
  - polygon
  - edge
  - smart contract
  - permission
  - deployment
---

## 概要 {#overview}

このガイドでは、スマートコントラクトをデプロイできるアドレスをホワイトリストにする方法について詳しく説明します。ネットワークオペレータは、ユーザがネットワークの目的と無関係なスマートコントラクトをデプロイしないようにしたい場合があります。ネットワークオペレータは次のことが可能です：

1. スマートコントラクトデプロイメント用のアドレスをホワイトリストする
2. スマートコントラクトデプロイメントのためのホワイトリストからアドレスを削除する

## ビデオプレゼンテーション {#video-presentation}

[![許可契約の展開 - ビデオ](https://img.youtube.com/vi/yPOkINpf7hg/0.jpg)](https://www.youtube.com/watch?v=yPOkINpf7hg)

## 使用方法 {#how-to-use-it}


デプロイメントホワイトリストに関連するすべてのCLIコマンドは、[CLIコマンド](/docs/edge/get-started/cli-commands#whitelist-commands)ページにあります。

* `whitelist show`： ホワイトリスト情報を表示する
* `whitelist deployment --add`： コントラクトデプロイメントホワイトリストに新しいアドレスを追加する
* `whitelist deployment --remove`：コントラクトデプロイメントホワイトリストから新しいアドレスを削除する

#### デプロイメントホワイトリストのすべてのアドレスを表示する {#show-all-addresses-in-the-deployment-whitelist}

デプロイメントホワイトリストでアドレスを検索するには、2つの方法があります。
1. ホワイトリストが保存されている`genesis.json`を確認します
2. ますPolygon Edgeでサポートされているすべてのホワイトリストの情報を出力する`whitelist show`を実行します

```bash

./polygon-edge whitelist show

[WHITELISTS]

Contract deployment whitelist : [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d],


```

#### デプロイメントホワイトリストにアドレスを追加する {#add-an-address-to-the-deployment-whitelist}

デプロイメントホワイトリストに新しいアドレスを追加するには、`whitelist deployment --add [ADDRESS]`CLIコマンドを実行します。ホワイトリストに存在するアドレスの数に制限はありません。コントラクトデプロイメントホワイトリストに存在するアドレスだけがコントラクトをデプロイできます。ホワイトリストが空の場合、すべてのアドレスがデプロイメントを実行できます

```bash

./polygon-edge whitelist deployment --add 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d --add 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF


[CONTRACT DEPLOYMENT WHITELIST]

Added addresses: [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],
Contract deployment whitelist : [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],



```

#### デプロイメントホワイトリストからアドレスを削除する {#remove-an-address-from-the-deployment-whitelist}

デプロイメントホワイトリストからアドレスを削除するには、`whitelist deployment --remove [ADDRESS]`CLIコマンドを実行します。コントラクトデプロイメントホワイトリストに存在するアドレスだけがコントラクトをデプロイできます。ホワイトリストが空の場合、すべてのアドレスがデプロイメントを実行できます

```bash

./polygon-edge whitelist deployment --remove 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d --remove 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF


[CONTRACT DEPLOYMENT WHITELIST]

Removed addresses: [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],
Contract deployment whitelist : [],



```

---
id: pos-stake-unstake
title: プルーフ・オブ・ステーク（PoS）の設定と使用
description: "ステーク、アンステーク、その他のステーキング関連の手順。"
keywords:
  - docs
  - polygon
  - edge
  - stake
  - unstake
  - validator
  - epoch
---

## 概要 {#overview}

このガイドでは、Polygon Edgeでプルーフ・オブ・ステーク（PoS）ネットワークを設定する方法、ノードがバリデータになるためにファンドをステークする方法、ファンドをアンステークする方法の詳細を説明します。

読み取り、通過することをお**勧め**します。[ローカル設定](/docs/edge/get-started/set-up-ibft-locally)
および[クラウド設定](/docs/edge/get-started/set-up-ibft-on-the-cloud)のセクションを、このPoSガイドに進む前によく読んで理解してください。これらのセクションはPolygon Edgeでプルーフ・オブ・オーソリティ―（PoA）クラスターを起動するために必要なステップを示します。

現在、ステーキングスマートコントラクト上にファンドをステークできるバリデータの数に制限はありません。

## ステーキングスマートコントラクト {#staking-smart-contract}

ステーキングスマートコントラクトのレポジトリは[ここ](https://github.com/0xPolygon/staking-contracts)にあります。

ここには必要なテストスクリプト、ABIファイル、そして最も重要なステーキングスマートコントラクト自体があります。

## Nノードクラスターの設定 {#setting-up-an-n-node-cluster}

Polygon Edgeでネットワークを設定する方法は
[ローカル設定](/docs/edge/get-started/set-up-ibft-locally)
と[クラウド設定](/docs/edge/get-started/set-up-ibft-on-the-cloud)セクションでカバーされています。

PoSとPoAクラスタの設定における**唯一の違い**はジェネシス生成の部分です。

**PoSクラスタのためにジェネシスファイルを生成する時、追加フラグが必要です`--pos`**：

```bash
polygon-edge genesis --pos ...
```

## エポックの長さの設定 {#setting-the-length-of-an-epoch}

エポックは[エポックブロック](/docs/edge/consensus/pos-concepts#epoch-blocks)セクションで詳細にカバーしています。

クラスター（ブロック）のエポックのサイズを設定するには、ジェネシスファイルの生成時に、追加フラグを指定します`--epoch-size`：

```bash
polygon-edge genesis --epoch-size 50
```

この値はジェネシスファイルにエポックサイズは`50`ブロックであるべきと指定します。

エポック（ブロック）のサイズのデフォルト値は`100000`です。

:::info エポックの長さを引き下げる

[エポックブロック](/docs/edge/consensus/pos-concepts#epoch-blocks)セクションで示したように、エポックブロックはノード用にバリデータセットを更新するために使用されます。

ブロック単位の（`100000`）エポックの長さのデフォルトは、バリデータセットの更新までに時間がかかる可能性があります。新しいブロックが追加されるのに～2秒かかることを考慮すると、バリデータセットが変更されるのに～55.5時間かかる可能性があります。

エポックの長さにより低い値を設定すると、バリデータセットが確実により頻繁に更新されます。
:::

## ステーキングスマートコントラクトスクリプトの使用 {#using-the-staking-smart-contract-scripts}

### 前提条件 {#prerequisites}

ステーキングスマートコントラクトのレポジトリはHardhatプロジェクトであり、これはNPMを必要とします。

これを正しく初期化するために、以下をメインディレクトリ内で実行します：

```bash
npm install
````

### 提供されたヘルパースクリプトを設定する {#setting-up-the-provided-helper-scripts}

デプロイされたステーキングスマートコントラクトとのやり取り用のスクリプトは[ステーキングスマートコントラクトのレポジトリ](https://github.com/0xPolygon/staking-contracts)にあります。

スマートコントラクトのレポジトリの場所に次のパラメータを持つ`.env`ファイルを作成します：

```bash
JSONRPC_URL=http://localhost:10002
PRIVATE_KEYS=0x0454f3ec51e7d6971fc345998bb2ba483a8d9d30d46ad890434e6f88ecb97544
STAKING_CONTRACT_ADDRESS=0x0000000000000000000000000000000000001001
BLS_PUBLIC_KEY=0xa..
```

パラメータは次のとおりです：

* **JSONRPC_URL** - ノードを実行するJSON-RPCエンドポイント
* **PRIVATE_KEYS** - ステーカーアドレスの秘密鍵
* **STAKING_CONTRACT_ADDRESS** - ステーキングスマートコントラクトのアドレス（
デフォルト`0x0000000000000000000000000000000000001001`）
* **BLS_PUBLIC_KEY** - ステーカーのBLS公開鍵。ネットワークがBLSで実行している場合にのみ必要

### ステーキングファンド {#staking-funds}

:::info ステーキングアドレス

ステーキングスマートコントラクトはアドレス`0x0000000000000000000000000000000000001001`にプリデプロイされます。

ステーキングメカニズムとのあらゆる種類のやり取りは指定されたアドレスにあるステーキングスマートコントラクトを通じて行われます。

ステーキングスマートコントラクトの詳細については、以下を参照してください
**[ステーキングスマートコントラクト](/docs/edge/consensus/pos-concepts#contract-pre-deployment)**セクション。

:::

バリデータセットの一部になるためには、アドレスはしきい値を上回る額のファンドをステークする必要があります。

現在、バリデータセットの一部になるためのデフォルトのしきい値は`1 ETH`です。

ステーキングはステーキングスマートコントラクトの`stake`メソッドを呼び出し、`>= 1 ETH`値を指定することで開始できます。

`.env`ファイル（[前セクション](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts)で触れられたもの）を設定し、チェーンをPoSモードで起動した後、ステーキングはスターキングスマートコントラクトのレポジトリ内で次のコマンドで実行することができます：

```bash
npm run stake
```

`stake`Hardhatスクリプトは`1 ETH`のデフォルト額をステークしますが、これは`scripts/stake.ts`ファイルを修正することで変更できます。

ステークされているファンドが`>= 1 ETH`である場合、ステーキングスマートコントラクト上のバリデータセットは更新され、アドレスは次のエポックの開始時からバリデータセットの一部となります。

:::info BLS鍵の登録

ネットワークがBLSモードで実行されている場合、ノードがバリデータになるためには、ステーキング後にそのBLS公開鍵を登録する必要があります。

これは、次のコマンドで実行することができます：

```bash
npm run register-blskey
```
:::

### ファンドのアンステーク {#unstaking-funds}

ステークを持つアドレスは、**すべてのファンドを**同時にアンステークできます。

`.env`ファイル（[前セクション](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts)で触れられたもの）を設定し、チェーンをPoSモードで起動した後、アンステーキングはステーキングスマートコントラクトのレポジトリの次のコマンドで実行することができます：

```bash
npm run unstake
```

### ステーカーのリストの取得 {#fetching-the-list-of-stakers}

ファンドをステークするすべてのアドレスはステーキングスマートコントラクトに保存されます。

`.env`ファイル（[前セクション](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts)で触れられたもの）を設定し、チェーンをPoSモードで起動した後、バリデータのリストはステーキングスマートコントラクトのレポジトリ内で次のコマンドで取得できます。

```bash
npm run info
```

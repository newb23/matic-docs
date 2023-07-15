---
id: bls
title: BLS
description: "BLSモードに関する説明とインストラクション。"
keywords:
  - docs
  - polygon
  - edge
  - bls
---

## 概要 {#overview}

BLSは、Boneh–Lynn–Shacham（BLS）とも呼ばれ、ユーザーが署名者であることを確認できる暗号署名スキームです。複数の署名を集約できる署名スキームです。Polygon Edgeでは、IBFTコンセンサスモードでセキュリティを向上させるためにBLSがデフォルトで使用されています。BLSは署名をシングルバイトの配列に集約し、ブロックヘッダーサイズを削減できます。チェーンごとにBLSを使用するかどうかを選択できます。ECDSA鍵はBLSモードが有効であるかどうかにかかわらず使用されます。

## ビデオプレゼンテーション {#video-presentation}

[![bls - ビデオ](https://img.youtube.com/vi/HbUmZpALlqo/0.jpg)](https://www.youtube.com/watch?v=HbUmZpALlqo)

## BLSを使用して新しいチェーンを設定する方法 {#how-to-setup-a-new-chain-using-bls}

設定手順の詳細については[ローカル設定](/docs/edge/get-started/set-up-ibft-locally)と[クラウド設定](/docs/edge/get-started/set-up-ibft-on-the-cloud)を参照してください。

## 既存のECDSA PoAチェーンからBLS PoAチェーンに移行する方法 {#how-to-migrate-from-an-existing-ecdsa-poa-chain-to-bls-poa-chain}

このセクションでは既存のPoAチェーンでBLSモードを使用する方法を説明します。次のステップはPoAチェーンでBLSを有効にするために必要です。

1. すべてのノードを停止する
2. バリデータ用のBLS鍵を生成する
3. genesis.jsonにフォーク設定を追加する
4. すべてのノードを再起動する

### 1. すべてのノードの停止 {#1-stop-all-nodes}

バリデータのすべてのプロセスをCtrl + c（コントロール + c）を押すことで終了します。最新のブロックの高さ（ブロックコミットログで最も高いシーケンス番号）を覚えておいてください。

### 2. BLS鍵の生成 {#2-generate-the-bls-key}

`secrets init`と`--bls`でBLS鍵を生成します。既存のECDSAとネットワーク鍵を維持し、新しいBLS鍵を追加するには、`--ecdsa`と`--network`を無効にする必要があります。

```bash
polygon-edge secrets init --bls --ecdsa=false --network=false

[SECRETS INIT]
Public key (address) = 0x...
BLS Public key       = 0x...
Node ID              = 16...
```

### 3. フォーク設定の追加 {#3-add-fork-setting}

`ibft switch`コマンドがフォーク設定を`genesis.json`に追加し、それにより、既存のチェーン内でBLSを有効にすることができます。

PoAネットワークでは、バリデータはコマンドに与えられる必要があります。`genesis`コマンドの方法と同様に、`--ibft-validators-prefix-path`または`--ibft-validator`フラグを使用してバリデータを指定できます。

チェーンがBLSと`--from`フラグの使用を開始している高さを指定します。

```bash
polygon-edge ibft switch --chain ./genesis.json --type PoA --ibft-validator-type bls --ibft-validators-prefix-path test-chain- --from 100
```

### ４. すべてのノードの再起動 {#4-restart-all-nodes}

`server`コマンドですべてのノードを再起動します。以前のステップで指定された`from`のブロックが作成された後、チェーンはBLSを有効にし、次のようにログを表示します：

```bash
2022-09-02T11:45:24.535+0300 [INFO]  polygon.ibft: IBFT validation type switched: old=ecdsa new=bls
```

また、ログはブロックが作成された後、ブロックごとに作成にどの検証モードが使用されたかを表示します。

```
2022-09-02T11:45:28.728+0300 [INFO]  polygon.ibft: block committed: number=101 hash=0x5f33aa8cea4e849807ca5e350cb79f603a0d69a39f792e782f48d3ea57ac46ca validation_type=bls validators=3 committed=3
```

## 既存のECDSA PoSチェーンからBLS PoSチェーンに移行する方法 {#how-to-migrate-from-an-existing-ecdsa-pos-chain-to-a-bls-pos-chain}

このセクションでは既存のPoSチェーンでBLSモードを使用する方法を説明します。次のステップはPoSチェーンでBLSを有効化するために必要です。

1. すべてのノードを停止する
2. バリデータ用のBLS鍵を生成する
3. genesis.jsonにフォーク設定を追加する
4. ステーキングコントラクトを呼び出し、BLS公開鍵を登録する
5. すべてのノードを再起動する

### 1. すべてのノードの停止 {#1-stop-all-nodes-1}

バリデータのすべてのプロセスをCtrl + c（コントロール + c）を押すことで終了します。最新のブロックの高さ（ブロックコミットログで最も高いシーケンス番号）を覚えておいてください。

### 2. BLS鍵の生成 {#2-generate-the-bls-key-1}

`secrets init`と`--bls`フラグでBLS鍵を生成します。既存のECDSAとネットワーク鍵を維持し、新しいBLS鍵を追加するには、`--ecdsa`と`--network`を無効にする必要があります。

```bash
polygon-edge secrets init --bls --ecdsa=false --network=false

[SECRETS INIT]
Public key (address) = 0x...
BLS Public key       = 0x...
Node ID              = 16...
```

### 3. フォーク設定の追加 {#3-add-fork-setting-1}

`ibft switch`コマンドがフォーク設定を`genesis.json`に追加し、それにより、既存のチェーン内からBLSを有効にすることができます。

チェーンがBLSモードの使用をスタートする高さを`from`フラグで、コントラクトが更新される高さを`development`フラグを使用して指定します。

```bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --ibft-validator-type bls --deployment 50 --from 200
```

### 4. ステーキングコントラクトのBLS公開鍵の登録 {#4-register-bls-public-key-in-staking-contract}

フォークが追加され、バリデータが再起動された後、各バリデータはステーキングコントラクトの`registerBLSPublicKey`を呼び出し、BLS公開鍵を登録する必要があります。これは`--deployment`で指定された高さの後、`--from`で指定された高さの前に行わなくてはなりません。

BLS公開鍵を登録するスクリプトは[Staking SmartContract repo](https://github.com/0xPolygon/staking-contracts)に定義されています。

`BLS_PUBLIC_KEY`を`.env`ファイルに登録するよう設定します。他のパラメータの詳細については[pos-stake-unstake](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts)を参照してください。

```env
JSONRPC_URL=http://localhost:10002
STAKING_CONTRACT_ADDRESS=0x0000000000000000000000000000000000001001
PRIVATE_KEYS=0x...
BLS_PUBLIC_KEY=0x...
```

次のコマンドで`.env`でコントラクトに与えられたBLS公開鍵を登録します。

```bash
npm run register-blskey
```

:::warning バリデータはBLS公開鍵を手動で登録する必要があります。

BLSモードでは、バリデータは独自のアドレスとBLS公開鍵を所有している必要があります。コンセンサスレイヤーはコンセンサスがコントラクトからバリデータ情報を取得する時にコントラクト内にBLS公開鍵を登録していないバリデータを無視します。
:::

### 5. すべてのノードの再起動 {#5-restart-all-nodes}

`server`コマンドですべてのノードを再起動します。チェーンは以前のステップで指定された`from`でブロックが作成された後にBLSを有効にします。

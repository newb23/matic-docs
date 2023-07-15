---
id: poa
title: プルーフ・オブ・オーソリティ（PoA）
description: "プルーフ・オブ・オーソリティ（PoA）に関する説明とインストラクション。"
keywords:
  - docs
  - polygon
  - edge
  - PoA
  - autorithy
---

## 概要 {#overview}

IBFT PoAはPolygon Edgeのデフォルトのコンセンサスメカニズムです。PoAでは、バリデータはブロックを作成し、ブロックチェーンにシリーズで追加する責任を持ちます。

すべてのバリデータが動的バリデータセットを構成し、そこでは投票方式を用いることでバリデータをセットに追加または削除することができます。つまり、バリデータが投票を通じてバリデータセットに追加／削除されることは、バリデータノードの過半数（51％）が特定のバリデータをセットに追加／削除するよう投票することで可能になります。この方法では、悪意のあるバリデータを認識、ネットワークから除外する一方、新しい信頼できるバリデータがネットワークに追加することができます。

すべてのバリデータは順番に次のブロック（ラウンドロビン）を提案し、ブロックをブロックチェーンに検証／挿入する場合、圧倒的多数（2/3を超える）のバリデータがそのブロックを承認しなくてはなりません。

バリデータ以外に、ブロックの作成には参加しないが、ブロックの検証プロセスに参加するノンバリデータが存在します。

## バリデータをバリデータセットに追加する {#adding-a-validator-to-the-validator-set}

このガイドでは、4つのバリデータノードを持つアクティブIBFTネットワークに新しいバリデータノードを追加する方法を説明します。ネットワークを設定するのに役立ちたい場合は、[ローカル](/edge/get-started/set-up-ibft-locally.md)設定 / [クラウド](/edge/get-started/set-up-ibft-on-the-cloud.md)設定セクションを参照してください。

### ステップ1：IBFTのデータフォルダの初期化と新しいノード用バリデータ鍵の生成 {#step-1-initialize-data-folders-for-ibft-and-generate-validator-keys-for-the-new-node}

新しいノードでIBFTを起動し実行するために、まずデータフォルダを初期化し、鍵を生成する必要があります：

````bash
polygon-edge secrets init --data-dir test-chain-5
````

このコマンドはバリデータの鍵（アドレス）とノードIDを表示します。次のステップではバリデータの鍵（アドレス）が必要です。

### ステップ2：他のバリデータノードからの新しい候補の提案 {#step-2-propose-a-new-candidate-from-other-validator-nodes}

新しいノードがバリデータになるには、バリデータの少なくとも51％がそれを提案する必要があります。

既存のバリデータノードからgrpcアドレス：127.0.0.1:10000で新しいバリデータ（`0x8B15464F8233F718c8605B16eBADA6fc09181fC2`）を提案する方法の例：

````bash
polygon-edge ibft propose --grpc-address 127.0.0.1:10000 --addr 0x8B15464F8233F718c8605B16eBADA6fc09181fC2 --bls 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --vote auth
````

IBFTコマンドの構造は[CLIコマンド](/docs/edge/get-started/cli-commands)セクションでカバーされています。

:::info BLS公開鍵

BLS公開鍵はネットワークがBLSで実行されている場合のみ必要です。BLSモードで実行されていないネットワークに`--bls`は必要ありません。
:::

### ステップ3：クライアントノードの実行 {#step-3-run-the-client-node}

この例ではすべてのノードが同じマシン上にあるネットワークを実行しようとしているため、ポートコンフリクトを回避するよう注意する必要があります。

````bash
polygon-edge server --data-dir ./test-chain-5 --chain genesis.json --grpc-address :50000 --libp2p :50001 --jsonrpc :50002 --seal
````

すべてのブロックを取得した後、コンソール内で新しいノードが検証に参加していることに気付くでしょう。

````bash
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=4004
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=5 votes=0
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft: proposer calculated: proposer=0x8B15464F8233F718c8605B16eBADA6fc09181fC2 block=4004
````

:::info ノンバリデータをバリデータに昇格する

当然ノンバリデータは投票プロセスによってバリデータになることができますが、投票プロセス後にバリデータセットに含まれることに成功するためには、ノードを`--seal`フラグとともに再起動する必要があります。

:::

## バリデータをバリデータセットから削除する {#removing-a-validator-from-the-validator-set}

この操作はかなり簡単です。バリデータノードをバリデータセットから削除するには、このコマンドが過半数のバリデータノードに実行される必要があります。

````bash
polygon-edge ibft propose --grpc-address 127.0.0.1:10000 --addr 0x8B15464F8233F718c8605B16eBADA6fc09181fC2 --bls 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --vote drop
````

:::info BLS公開鍵

BLS公開鍵はネットワークがBLSで実行されている場合のみ必要です。BLSモードで実行されていないネットワークに`--bls`は必要ありません。
:::

コマンド実行後、バリデータの数が減少したことを確認しましょう（このログの例では4から3）。

````bash
2021-12-15T19:20:51.014+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=2399 round=1
2021-12-15T19:20:51.014+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=4 votes=2
2021-12-15T19:20:51.015+0100 [INFO]  polygon.consensus.ibft.acceptState: we are the proposer: block=2399
2021-12-15T19:20:51.015+0100 [INFO]  polygon.consensus.ibft: picked out txns from pool: num=0 remaining=0
2021-12-15T19:20:51.015+0100 [INFO]  polygon.consensus.ibft: build block: number=2399 txns=0
2021-12-15T19:20:53.002+0100 [INFO]  polygon.consensus.ibft: state change: new=ValidateState
2021-12-15T19:20:53.009+0100 [INFO]  polygon.consensus.ibft: state change: new=CommitState
2021-12-15T19:20:53.009+0100 [INFO]  polygon.blockchain: write block: num=2399 parent=0x768b3bdf26cdc770525e0be549b1fddb3e389429e2d302cb52af1722f85f798c
2021-12-15T19:20:53.011+0100 [INFO]  polygon.blockchain: new block: number=2399 hash=0x6538286881d32dc7722dd9f64b71ec85693ee9576e8a2613987c4d0ab9d83590 txns=0 generation_time_in_sec=2
2021-12-15T19:20:53.011+0100 [INFO]  polygon.blockchain: new head: hash=0x6538286881d32dc7722dd9f64b71ec85693ee9576e8a2613987c4d0ab9d83590 number=2399
2021-12-15T19:20:53.011+0100 [INFO]  polygon.consensus.ibft: block committed: sequence=2399 hash=0x6538286881d32dc7722dd9f64b71ec85693ee9576e8a2613987c4d0ab9d83590 validators=4 rounds=1 committed=3
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft: state change: new=AcceptState
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=2400 round=1
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=3 votes=0
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft: proposer calculated: proposer=0xea21efC826F4f3Cb5cFc0f986A4d69C095c2838b block=2400
````

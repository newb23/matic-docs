---
id: migration-to-pos
title: PoAからPoSへの移行
description: "PoAからPoS IBFTモードに移行する、またはその逆のための方法です。"
keywords:
  - docs
  - polygon
  - edge
  - migrate
  - PoA
  - PoS
---

## 概要 {#overview}

このセクションでは、ブロックチェーンをリセットする必要なく、クラスター実行のためのPoAからPoS IBFTモードへの移行、およびその逆を説明します。

## PoSへ移行する方法 {#how-to-migrate-to-pos}

すべてのノードを停止し、`ibft switch`コマンドでgenesis.jsonにフォーク設定を追加し、ノードを再起動する必要があります。

````bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --deployment 100 --from 200
````
:::caution ECDSAを使用している場合の切り替え
ECDSAを使用する場合、ECDSAを使用していることを言及して、`--ibft-validator-type`フラグをスイッチに追加する必要があります。含まれていない場合、Edgeは自動的にBLSに切り替えます。

````bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --ibft-validator-type ecdsa --deployment 100 --from 200
````
:::PoSに切り替えるには、2つのブロック高さを指定する必要があります`deployment`。そして、`from``deployment`.は`from`ステーキングコントラクトを展開するための高さであり、PoSの開始の高さです。ステーキングコントラクトはアドレス`0x0000000000000000000000000000000000001001`で`deployment`でデプロイされますが、これは事前にデプロイされたコントラクトの場合と同様です。

ステーキングコントラクトの詳細については、[プルーフ・オブ・ステーク](/docs/edge/consensus/pos-concepts)を確認してください。

:::warning バリデータは手動でステークする必要があります

PoSの開始時にバリデータになるためには、各バリデータはコントラクトが`deployment`でデプロイされた後、`from`の前にステークすることが必要です。各バリデータによる自身のバリデータセットの更新は、PoSの開始時のステーキングコントラクトのセットによって設定されます。

ステーキングについての詳細については、「ステーキングの**[設定」を参照してプルーフ・オブ・ステークを使用してください。](/docs/edge/consensus/pos-stake-unstake)**
:::

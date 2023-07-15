---
id: query-operator-info
title: オペレータ情報をクエリする
description: "オペレータ情報をクエリする方法"
keywords:
  - docs
  - polygon
  - edge
  - node
  - query
  - operator
---

## 前提条件 {#prerequisites}

このガイドでは、すでに[ローカル設定](/docs/edge/get-started/set-up-ibft-locally)または[クラウドにIBFTクラスタを設定する方法のガイド](/docs/edge/get-started/set-up-ibft-on-the-cloud)を読まれたことを前提にしています。

どのような種類のオペレータ情報でもクエリするために機能しているノードが必要です。

Polygon Edgeで、ノードオペレータは制御され、それらが動作しているノードが何を実施しているかについて知らされます。<br />
いつでも、gRPC上に構築されたノード情報レイヤーを使用し、重要な情報を得ることができます。ログの精査は不要です。

:::note

ノードが`127.0.0.1:8545`で実行されていない場合は、このドキュメントにリストされているコマンドにフラグ`--grpc-address <address:port>`を追加してください。

:::

## ピア情報 {#peer-information}

### ピアリスト {#peers-list}

接続されたピアの完全なリスト（実行中のノード自体を含む）を取得するには、次のコマンドを実行します：
````bash
polygon-edge peers list
````

これにより、実行中のクライアントの現在のピアであるlibp2pアドレスのリストが返されます。

### ピアステータス {#peer-status}

特定のピアのステータスについては、次を実行してください：
````bash
polygon-edge peers status --peer-id <address>
````
*アドレス*パラメータはピアのlibp2pアドレスです。

## IBFT情報 {#ibft-info}

多くの場合において、オペレータは、IBFTコンセンサスで操作中のノードの状態について知りたいと思うかもしれません。

幸いなことに、Polygon Edgeはこの情報を見つける簡単な方法を提供しています。

### スナップショット {#snapshots}

次のコマンドを実行すると、最新のスナップショットが返されます。
````bash
polygon-edge ibft snapshot
````
特定の高さ（ブロック番号）でスナップショットをクエリするには、オペレータは次を実行します：
````bash
polygon-edge ibft snapshot --num <block-number>
````

### 候補者 {#candidates}

候補者の最新情報を得るには、オペレータは次を実行できます：
````bash
polygon-edge ibft candidates
````
このコマンドは提案された候補者の現在のセット、およびまだ含まれてない候補者をクエリします。

### ステータス {#status}

次のコマンドは実行中のIBFTクライアントの現在のバリデータ鍵を返します：
````bash
polygon-edge ibft status
````

## トランザクションプール {#transaction-pool}

トランザクションプールで現在のトランザクション数を見つけるには、オペレータは次を実行します：
````bash
polygon-edge txpool status
````

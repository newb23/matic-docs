---
id: networking
title: ネットワーク
description: Polygon Edgeのネットワークモジュールについて説明します。
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - networking
  - libp2p
  - GRPC
---

## 概要 {#overview}

ノードは、役立つ情報を取引するために、ネットワーク上の他のノードと通信する必要があります。<br />
このタスクを達成するために、Polygon Edgeは実際のテストを経た**libp2p**フレームワークを活用します。

**libp2p**を使用するという選択は、主に次の点に焦点を当てています：
* **スピード** - libp2pでは、（GETHおよび他のクライアントで使用されている）devp2pを超える大幅なパフォーマンス改善が行われています
* **拡張性** - システムの他の機能にとって素晴らしい基盤となります
* **モジュール性** - libp2pはPolygon Edgeと同様、本質的にモジュール式です。これにより、特にPolygon Edgeの一部をスワップ可能にする必要がある場合、より高い柔軟性を提供します。

## GRPC {#grpc}

**libp2p**に加えて、Polygon Edgeは**GRPC**プロトコルを使用します。<br />
技術的に、Polygon Edgeは、いくつかのGRPCプロトコルを使用します。後ほど説明します。

GRPCレイヤーは、すべてのリクエスト／返信プロトコルを抽象化し、Polygon Edgeが機能するために必要なストリーミングプロトコルを簡素化します。

GRPCは、**プロトコルバッファ**を使用して*サービス*及び*メッセージ構成*を定義します。<br />
このサービスと構成は、*.proto*ファイルで定義され、それはコンパイルされ、言語に依存していません。

先ほどは、Polygon EdgeがいくつかのGRPCプロトコルを活用していることを述べました。<br />
これは、ノードオペレータの全体的なUXを高めるために実行され、GETHやParityなどのクライアントとラグが頻繁に発生します。

ノードオペレータは、探している情報を見つけるためにログを精査する代わりに、GRPCサービスを呼び出すことで、システムで何が起こっているのかをより良く把握します。

### ノードオペレータのためのGRPC {#grpc-for-node-operators}

次のセクションは、[CLIコマンド](/docs/edge/get-started/cli-commands)セクションで簡潔に説明された内容であるため、馴染みがあるかもしれません。

**ノードオペレータ**が使用するためのGRPCサービスは、次のように定義されます：
````go title="minimal/proto/system.proto"
service System {
    // GetInfo returns info about the client
    rpc GetStatus(google.protobuf.Empty) returns (ServerStatus);

    // PeersAdd adds a new peer
    rpc PeersAdd(PeersAddRequest) returns (google.protobuf.Empty);

    // PeersList returns the list of peers
    rpc PeersList(google.protobuf.Empty) returns (PeersListResponse);

    // PeersInfo returns the info of a peer
    rpc PeersStatus(PeersStatusRequest) returns (Peer);

    // Subscribe subscribes to blockchain events
    rpc Subscribe(google.protobuf.Empty) returns (stream BlockchainEvent);
}
````
:::tip

CLIコマンドはこれらのサービスメソッドの実行を実際に呼び出します。

これらのメソッドは***minimal/system_service.go***で実行されます。

:::

### 他のノードのためのGRPC {#grpc-for-other-nodes}

Polygon Edgeは、ネットワーク上の他のノードで使用されるいくつかのサービスメソッドも実行します。<br />
言及したサービスは**[プロトコル](docs/edge/architecture/modules/consensus)**セクションで説明されています。

## 📜リソース {#resources}
* **[プロトコルバッファ](https://developers.google.com/protocol-buffers)**
* **[libp2p](https://libp2p.io/)**
* **[GRPC](https://grpc.io/)**

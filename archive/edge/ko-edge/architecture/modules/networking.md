---
id: networking
title: 네트워킹
description: Polygon 엣지의 네트워킹 모듈 설명.
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

## 개요 {#overview}

노드는 유용한 정보를 교환하기 위해 네트워크의 다른 노드와 통신해야 합니다.<br />
이 작업을 위해 Polygon 엣지는 테스트를 거친 **libp2p** 프레임워크를 활용합니다.

**libp2p**를 선택한 것은 주로 다음 사항에 중점을 두었기 때문입니다.
* **속도** - libp2p는 devp2p(GETH 및 다른 클라이언트에서 사용됨)에 비해 상당한 성능 개선이 이루어졌습니다.
* **확장 가능성** - 시스템의 다른 기능을 위한 훌륭한 기반 역할을 합니다.
* **모듈성** - libp2p는 Polygon 엣지처럼 기본적으로 모듈성을 가지며, 특히 Polygon 엣지에 스왑 가능성이 필요한 부분이 있을 경우 더 큰 유연성을 제공합니다.

## GRPC {#grpc}

Polygon 엣지는 **libp2p** 외에도 **GRPC** 프로토콜을 사용합니다. <br />
기술적으로 Polygon 엣지는 여러 GRPC 프로토콜을 사용합니다. 이에 관해서는 나중에 다루겠습니다.

GRPC 레이어를 통해 모든 요청/응답 프로토콜을 추상화하고 Polygon 엣지가 작동하는 데 필요한 스트리밍 프로토콜을 단순화할 수 있습니다.

GRPC는 **프로토콜 버퍼**를 활용해 *서비스*와 *메시지 구조*를 정의합니다.<br />
서비스 및 구조는 언어에 구애받지 않는 컴파일된 *.proto* 파일에 정의됩니다.

앞서 Polygon 엣지가 몇몇 GRPC 프로토콜을 활용한다는 사실을 언급했습니다.<br />
GETH 및 Parity와 같은 클라이언트에서 종종 지연되는 문제가 있어, 노드 연산자의 전체 UX를 향상시키기 위한 목적이었습니다.

노드 연산자는 원하는 정보를 찾기 위해 로그를 가려내는 대신 GRPC 서비스를 호출하여 시스템에서 발생하는 상황을 더 잘 파악할 수 있습니다.

### 노드 연산자를 위한 GRPC {#grpc-for-node-operators}

다음 섹션은 [CLI 명령어](/docs/edge/get-started/cli-commands) 섹션에서 간략하게 다루었기 때문에 좀 더 익숙할 것입니다.

**노드 연산자**에서 사용할 GRPC 서비스도 유사한 방식으로 정의됩니다.
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

실제로 CLI 명령어는 이러한 서비스 메서드 구현을 호출합니다.

메서드는 ***minimal/system_service.go***에서 구현됩니다.

:::

### 다른 노드를 위한 GRPC {#grpc-for-other-nodes}

Polygon 엣지 역시 네트워크의 다른 노드가 사용하는 몇몇 서비스 메서드를 구현합니다.<br />
이러한 서비스는 **[프로토콜](docs/edge/architecture/modules/consensus)** 섹션에서 설명합니다.

## 📜 리소스 {#resources}
* **[프로토콜 버퍼](https://developers.google.com/protocol-buffers)**
* **[libp2p](https://libp2p.io/)**
* **[gRPC](https://grpc.io/)**

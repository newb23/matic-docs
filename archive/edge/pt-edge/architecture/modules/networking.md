---
id: networking
title: Networking
description: Explicação para o módulo networking do Polygon Edge.
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

## Visão geral {#overview}

Um nó tem de comunicar com outros nós da rede para trocar informação útil.<br />
Para cumprir esta tarefa, o Polygon Edge aproveita o framework **libp2p**, já com provas dadas.

A escolha do **libp2p** foca-se principalmente em:
* **Velocidade** - o libp2p tem um desempenho significativamente superior ao do devp2p (usado no GETH e outros clientes)
* **Extensibilidade** - é uma ótima base para outras funcionalidades do sistema
* **Modularidade** - o libp2p é modular por natureza, à semelhança do Polygon Edge. Isto dá maior flexibilidade, especialmente quando partes do Polygon Edge precisam de ser trocáveis

## GRPC {#grpc}

Além do **libp2p**, o Polygon Edge usa o protocolo **GRPC**. <br />
Tecnicamente, o Polygon Edge usa vários protocolos GRPC, que serão abordados mais tarde.

A camada GRPC ajuda a abstrair todos os protocolos de solicitação/resposta e simplifica os protocolos de streaming necessários para o funcionamento do Polygon Edge.

O GRPC conta com **Buffers de Protocolo** para definir *serviços* e *estruturas de mensagens*. <br />
Os serviços e estruturas são definidos em ficheiros *.proto*, que são compilados e são independentes da linguagem.

Mencionámos anteriormente que o Polygon Edge aproveita vários protocolos GRPC.<br />
Fá-lo para impulsionar a UX global para o operador de nós, acabando muitas vezes por provocar um atraso com clientes como a GETH e a Parity.

O operador de nós tem uma melhor visão geral do que se passa no sistema chamando o serviço GRPC, em vez de pesquisar logs para encontrar a informação que procura.

### GRPC para operadores de nós {#grpc-for-node-operators}

A secção seguinte pode parecer familiar, pois foi brevemente abordada na secção sobre [Comandos CLI](/docs/edge/get-started/cli-commands).

O serviço GRPC concebido para ser utilizado pelos **operadores de nós** é definido assim:
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

Na verdade, os comandos CLI chamam as implementações destes métodos de serviço.

Estes métodos são implementados em ***minimal/system_service.go***.

:::

### GRPC para outros nós {#grpc-for-other-nodes}

O Polygon Edge também implementa diversos métodos de serviço que são usados por outros nós da rede. <br />
O serviço mencionado está descrito na secção **[Protocolo](docs/edge/architecture/modules/consensus)**.

## 📜 Recursos {#resources}
* **[Buffers de protocolo](https://developers.google.com/protocol-buffers)**
* **[libp2p](https://libp2p.io/)**
* **[gRPC](https://grpc.io/)**

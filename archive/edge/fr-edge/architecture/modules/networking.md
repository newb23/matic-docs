---
id: networking
title: Mise en réseau
description: Explication du module de mise en réseau de l'Edge de Polygon.
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

## Aperçu {#overview}

Un nœud doit communiquer avec d'autres nœuds du réseau, afin d'échanger des informations utiles.<br />
Pour accomplir cette tâche, l'Edge de Polygon s'appuie sur la structure **libp2p** testé au combat.

Le choix d'aller avec **libp2p** est principalement axé sur les critères suivants :
* **Vitesse** - libp2p dispose d'une amélioration significative de performance par rapport à devp2p (utilisé dans GETH et d'autres clients)
* **Extensibilité** - il sert de base idéale pour d'autres fonctionnalités du système
* **Modularité** - libp2p est modulaire par nature, tout comme l'Edge de Polygon. Cela accorde une plus grande flexibilité, en particulier lorsque des parties de Polygon Edge doivent être interchangeables

## GRPC {#grpc}

En plus de **libp2p**, l'Edge de Polygon utilise le **protocole** GRPC. <br />
Techniquement, l'Edge de Polygon utilise plusieurs protocoles GRPC, qui seront abordés plus tard.

La couche GRPC permet d'abstraire tous les protocoles de demande/réponse et simplifie les protocoles de diffusion nécessaires au fonctionnement de Polygon Edge.

GRPC s'appuie sur **Protocol Buffers** pour définir les *services* et les *structures de message*. <br />
Les services et les structures sont définis dans des fichiers *.proto*, qui sont compilés et indépendants de la langue.

Nous venoms de mentionner que Polygon Edge exploite plusieurs protocoles GRPC.<br />
Cela a été fait pour booster l'UX globale de l'opérateur du nœud, ce qui est souvent en retard avec des clients comme GETH et Parity.

L'opérateur du nœud a une meilleure vue d'ensemble de ce qui se passe avec le système en appelant le service GRPC, au lieu de parcourir les registres pour trouver les informations qu'ils recherchent.

### GRPC pour les Opérateurs de Nœud {#grpc-for-node-operators}

La section suivante peut sembler familière, car elle a été brièvement abordée dans la section [Commandes CLI](/docs/edge/get-started/cli-commands).

Le service GRPC destiné à être utilisé par les **opérateurs de nœuds** est défini ainsi :
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

Les commandes CLI appellent en fait les implémentations de ces méthodes de service.

Ces méthodes sont implémentées dans ***minimal/system_service.go***.

:::

### GRPC pour les Autres Nœuds {#grpc-for-other-nodes}

Polygon Edge implémente également plusieurs méthodes de service utilisées par d'autres nœuds du réseau. <br />
Le service mentionné est décrit dans la section **[Protocole](docs/edge/architecture/modules/consensus)**.

## 📜 Ressources {#resources}
* **[Protocol Buffers](https://developers.google.com/protocol-buffers)**
* **[libp2p](https://libp2p.io/)**
* **[gRPC](https://grpc.io/)**

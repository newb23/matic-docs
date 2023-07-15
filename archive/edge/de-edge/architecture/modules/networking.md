---
id: networking
title: Vernetzung
description: Erläuterung für das Vernetzungsmodul von Polygon Edge.
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

## Übersicht {#overview}

Ein Knotenpunkt muss mit anderen Knotenpunkten im Netzwerk kommunizieren, um nützliche Informationen <br />auszutauschen.
Um diese Aufgabe zu erfüllen, nutzt der Polygon Edge das bewährte **libp2p**-Framework.

Die Entscheidung für **libp2p** fällt in erster Linie aus folgenden Gründen:
* **Geschwindigkeit**- libp2p bietet eine deutliche Leistungsverbesserung gegenüber devp2p (verwendet in GETH und anderen Clients)
* **Erweiterungsfähigkeit** – es dient als hervorragende Grundlage für andere Funktionen des Systems
* **Modularität** – libp2p ist von Natur aus modular, genau wie Polygon Edge. Dies bietet mehr Flexibilität, vor allem wenn Teile des Polygon Edge austauschbar sein müssen

## GRPC {#grpc}

Zusätzlich zu **libp2p** verwendet Polygon Edge das **GRPC**-Protokoll. <br />
Technisch gesehen verwendet Polygon Edge mehrere GRPC-Protokolle. Darauf werden wir später noch eingehen.

Die GRPC-Schicht hilft bei der Abstraktion aller Anfrage/Antwort-Protokolle und vereinfacht die Streaming-Protokolle, die für das Funktionieren des Polygon Edge erforderlich sind.

GRPC stützt sich auf **Protokollpuffer** zur Definition von *Services* und *Nachrichtenstrukturen*. <br />
Die Dienste und Strukturen sind in.*proto-*Dateien definiert, die kompiliert werden und sprachunabhängig sind.

Wir haben bereits erwähnt, dass Polygon Edge mehrere GRPC-Protokolle nutzt.<br />
Damit soll die Benutzerfreundlichkeit für den Betreiber des Knotens verbessert werden, was bei Clients wie GETH und Parität oft der Fall ist.

Der Knotenbetreiber hat einen besseren Überblick über die Vorgänge im System, wenn er den GRPC-Service aufruft, anstatt die Protokolle zu durchsuchen, um die gesuchten Informationen zu finden.

### GRPC für Knotenbetreiber {#grpc-for-node-operators}

Der folgende Abschnitt kommt Ihnen vielleicht bekannt vor, weil er bereits im Abschnitt [CLI-Befehle](/docs/edge/get-started/cli-commands) kurz behandelt wurde.

Der GRPC-Service, der von **Knotenbetreibern** genutzt werden soll, ist wie folgt definiert:
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

Die CLI-Befehle rufen die Implementierungen dieser Servicemethoden auf.

Diese Methoden werden in ***minimal/system_service.go***. implementiert.

:::

### GRPC für andere Knoten {#grpc-for-other-nodes}

Polygon Edge implementiert auch mehrere Service-Methoden, die von anderen Knotenpunkten im Netzwerk genutzt werden. <br />
Der genannte Service wird im Abschnitt **[Protokoll](docs/edge/architecture/modules/consensus)** beschrieben.

## 📜 Ressourcen {#resources}
* **[Protokollpuffer](https://developers.google.com/protocol-buffers)**
* **[libp2p](https://libp2p.io/)**
* **[gRPC](https://grpc.io/)**

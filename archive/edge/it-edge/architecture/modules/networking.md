---
id: networking
title: Rete
description: Spiegazione per il modulo di rete di Polygon Edge.
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

## Panoramica {#overview}

Un nodo deve comunicare con altri nodi sulla rete per scambiare informazioni utili.<br />
Per realizzare questo compito, il Polygon Edge sfrutta il framework **libp2p** testato sul campo.

La scelta di utilizzare **libp2p** si focalizza principalmente su:
* La **velocità** - libp2p ha un significativo miglioramento delle prestazioni su devp2p (utilizzato in GETH e altri client)
* **Extensibility** - serve come un ottimo fondamento per altre caratteristiche del sistema
* **Modularity** - libp2p è modulare di natura, proprio come Polygon Edge. Questo offre una maggiore flessibilità, soprattutto quando parti di Polygon Edge devono essere scambiabili

## GRPC {#grpc}

Oltre a **libp2p**, Polygon Edge usa il protocollo **GRPC** . <br />Tecnicamente, Polygon Edge utilizza diversi protocolli GRPC, che saranno trattati in seguito.

Il layer di GRPC aiuta a rendere astratti tutti i protocolli di richiesta/risposta e semplifica i protocolli di streaming necessari per il funzionamento di Polygon Edge.

GRPC si basa sui **Protocol Buffer** per definire i *servizi* e le *strutture dei messaggi*. <br />
I servizi e le strutture sono definiti nei file *.proto* ,  che sono compilati e indipendenti dal linguaggio.

In precedenza, abbiamo detto che Polygon Edge sfrutta diversi protocolli GRPC.<br />
Questo è stato fatto per potenziare l'esperienza utente complessiva per l'operatore del nodo, cosa che spesso è in ritardo rispetto a client come GETH e Parity.

L'operatore del nodo ha una panoramica migliore di quanto sta accadendo con il sistema chiamando il servizio GRPC, invece di passare al setaccio i log per trovare le informazioni che sta cercando.

### GRPC per gli operatori del nodo {#grpc-for-node-operators}

La seguente sezione potrebbe sembrare familiare perché è stata trattata brevemente nella sezione [Comandi CLI](/docs/edge/get-started/cli-commands).

Il servizio GRPC destinato ad essere utilizzato dagli **operatori del nodo** viene definito in questo modo:
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
I comandi CLI chiamano effettivamente le implementazioni di questi metodi di servizio.

Questi metodi vengono implementati in ***minimal/system_service.go***.

:::

### GRPC per altri nodi {#grpc-for-other-nodes}

Polygon Edge implementa anche diversi metodi di servizio utilizzati da altri nodi sulla rete. <br />
Il servizio citato viene descritto nella sezione **[Protocollo](docs/edge/architecture/modules/consensus)**.

## 📜 Risorse {#resources}
* **[I buffer di protocollo](https://developers.google.com/protocol-buffers)**
* **[libp2p](https://libp2p.io/)**
* **[gRPC](https://grpc.io/)**

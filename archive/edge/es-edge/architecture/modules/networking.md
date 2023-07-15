---
id: networking
title: Interconexión
description: Explicación del módulo de interconexión de Polygon Edge.
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

## Descripción general {#overview}

Un nodo tiene que comunicarse con otros nodos de la red para intercambiar información útil.<br />
Para realizar esa tarea, Polygon Edge usa el marco **libp2p** probado en situaciones difíciles.

La decisión de usar**libp2p** se centra principalmente en:
* **Velocidad**: libp2p tiene una mejora significativa de desempeño sobre devp2p (utilizado en GETH y otros clientes)
* **Posibilidad de ampliación**: sirve como una base excelente para otras características del sistema
* **Modularidad**: libp2p es modular por naturaleza, al igual que Polygon Edge. Eso ofrece mayor flexibilidad, especialmente porque las partes del Polygon Edge deben ser intercambiables.

## GRPC {#grpc}

Además de **libp2p**, Polygon Edge utiliza el protocolo **GRPC** <br />
Técnicamente, Polygon Edge utiliza varios protocolos GRPC, que serán explicados más adelante.

La capa GRPC ayuda a resumir todos los protocolos de solicitud o respuesta y a simplificar los protocolos de transmisión necesarios para que Polygon Edge funcione.

GRPC depende de los **búfers de protocolo ** para definir *los servicios* y las *estructuras de los mensajes*. <br />
Los servicios y las estructuras se definen en los archivos *.proto*, que son compilados y son agnósticos con respecto al idioma.

Ya mencionamos que Polygon Edge usa varios protocolos GRPC.<br />
Eso se hizo para impulsar la expriencia general del usuario para el operador de nodos, algo que muchas veces se queda atrás con clientes como GETH y Parity.

El operador del nodo dispone de una mejor visión general de lo que ocurre en el sistema llamando al servicio GRPC, en lugar de rebuscar en los registros para encontrar la información que busca.

### GRPC para operadores de nodos {#grpc-for-node-operators}

Puede que la siguiente sección parezca conocida porque fue tratada brevemente en la sección de [Comandos CLI](/docs/edge/get-started/cli-commands).

El servicio GRPC que está destinado a ser utilizado por los **operadores de nodos** se define de la manera siguiente:
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

Los comandos CLI realmente llaman a las implementaciones de estos métodos de servicio.

Esos métodos están implementados en ***minimal/system_service.go***.

:::

### GRPC para otros nodos {#grpc-for-other-nodes}

Polygon Edge también implementa varios métodos de servicio que son utilizados por otros nodos de la red. <br />
El servicio mencionado se describe en la sección **[de protocolo](docs/edge/architecture/modules/consensus)**.

## 📜 Recursos {#resources}
* **[Búferes de protocolo](https://developers.google.com/protocol-buffers)**
* **[libp2p](https://libp2p.io/)**
* **[GRPC](https://grpc.io/)**

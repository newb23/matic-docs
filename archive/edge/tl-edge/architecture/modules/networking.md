---
id: networking
title: Networking
description: Paliwanag para sa networking module ng Polygon Edge.
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

## Pangkalahatang-ideya {#overview}

Ang isang node ay kailangang makipag-ugnayan sa iba pang mga node sa network, upang makipagpalitan ng kapaki-pakinabang na impormasyon.<br />
Para magawa ito, pinapakinabangan ng Polygon Edge ang subok nang **libp2p** framework.

Ang pagpili para gamitin ang **libp2p** ay pangunahing nakapokus sa:
* **Bilis** - ang libp2p ay may higit na pagsulong sa performance kaysa sa devp2p (na ginagamit sa GETH at iba pang mga client)
* **Extensibility** - nagsisilbi itong isang mahusay na pundasyon para sa iba pang mga feature ng system
* **Modularity** - ang libp2p ay likas na modular, tulad ng Polygon Edge. Nagbibigay ito ng mas higit na flexibility, lalo na kapag ang mga bahagi ng Polygon Edge ay kailangang pagpalit-palitin

## GRPC {#grpc}

Dagdag pa sa **libp2p**, ginagamit ng Polygon Edge ang **GRPC** na protokol.<br /> Sa teknikal, ginagamit ng Polygon Edge ang ilang mga GRPC na protokol, na tatalakayin sa susunod.

Ang GRPC layer ay tumutulong para makuha ang lahat ng mga kahilingan/reply na protokol at pinapasimple ang mga kinakailangang streaming na protokol para gumana ang Polygon Edge.

Umaasa ang GRPC sa mga **Protokol na Buffer** para tukuyin ang *mga serbisyo* at mga *istraktura ng mensahe*. <br />
Ang mga serbisyo at mga istruktura ay tinukoy sa mga *.proto* files, na pinagsama-sama at language-agnostic.

Sa una, nabanggit naming pinapakinabangan ng Polygon Edge ang ilang mga GRPC na protokol.<br />
Ginawa ito para palakasin ang pangkalahatang UX para sa node operator, isang bagay na kadalasan nang nagpapabagal sa mga client tulad ng GETH at Parity.

Ang node operator ay may mas mahusay na pangkalahatang-ideya kung ano ang nangyayari sa system sa pamamagitan ng pagtawag sa GRPC service, sa halip na suriin ang mga log para hanapin ang impormasyong hinahanap nila.

### GRPC para sa mga Node Operator {#grpc-for-node-operators}

Ang susunod na seksyon ay malamang na pamilyar dahil ito ay panandaliang tinalakay sa mga [CLI Commands](/docs/edge/get-started/cli-commands) na seksyon.

Ang GRPC service na inilaan para gamitin ng mga **node operator** ay tinukoy bilang:
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

Ang totoo, ang mga CLI command ang tumatawag sa mga implementasyon ng mga pamamaraan ng serbisyong ito.

Ang mga pamamaraang ito ay ipinatutupad sa ***minimal/system_service.go***.

:::

### GRPC para sa Iba Pang Node {#grpc-for-other-nodes}

Ipinapatupad din ng Polygon Edge ang ilang mga pamamaraan ng serbisyo na ginagamit ng ibang mga node sa network. <br />
Ang serbisyong nabanggit ay inilarawan sa **[Protokol](docs/edge/architecture/modules/consensus)** na seksyon.

## 📜 Mga Resource {#resources}
* **[Mga Protokol na Buffer](https://developers.google.com/protocol-buffers)**
* **[libp2p](https://libp2p.io/)**
* **[gRPC](https://grpc.io/)**

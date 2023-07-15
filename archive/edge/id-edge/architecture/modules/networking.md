---
id: networking
title: Jaringan
description: Penjelasan modul jaringan Polygon Edge.
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

## Ikhtisar {#overview}

Node harus berkomunikasi dengan node lain di jaringan untuk bertukar informasi bermanfaat.<br />
Untuk menyelesaikan tugas ini, Polygon Edge memanfaatkan kerangka kerja **libp2p** yang telah teruji.

Pilihan **libp2p** terutama berfokus pada:
* **Kecepatan** - libp2p memiliki peningkatan kinerja yang signifikan dibandingkan devp2p (yang digunakan pada GETH dan klien lain)
* **Ekstensibilitas** - ini berfungsi sebagai landasan bagus untuk fitur lain dari sistem
* **Modularitas** - libp2p secara alami bersifat modular, seperti Polygon Edge. Agar makin fleksibel, terutama ketika bagian-bagian Polygon Edge perlu dapat dipertukarkan

## GRPC {#grpc}

Selain **libp2p**, Polygon Edge menggunakan protokol **GRPC**. <br />
Secara teknis, Polygon Edge menggunakan beberapa protokol GRPC yang akan dibahas nanti.

Lapisan GRPC membantu memisahkan semua protokol permintaan/balasan dan menyederhanakan protokol streaming yang dibutuhkan oleh Polygon Edge supaya dapat berfungsi.

GRPC bergantung pada **Buffer Protokol** untuk menetapkan *layanan* dan *struktur pesan*. <br />
Layanan dan struktur ditetapkan pada file *.proto* yang dikompilasi dan bersifat language-agnostic.

Sebelumnya, kami menyebutkan bahwa Polygon Edge memanfaatkan beberapa protokol GRPC.<br />
Ini dilakukan guna mendorong UX keseluruhan untuk operator node, sesuatu yang sering kali tertinggal pada klien seperti GETH dan Parity.

Operator node memiliki pandangan umum yang lebih baik terhadap apa yang terjadi pada sistem dengan memanggil layanan GRPC, alih-alih menyaring log untuk menemukan informasi yang dicari.

### GRPC untuk Operator Node {#grpc-for-node-operators}

Bagian berikut ini mungkin tampak familier karena sudah dibahas secara singkat pada bagian [Perintah CLI](/docs/edge/get-started/cli-commands).

Layanan GRPC yang digunakan oleh **operator node** ditetapkan sebagai berikut:
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

Perintah CLI sebenarnya memanggil penerapan dari metode layanan ini.

Metode ini diterapkan pada ***minimal/system_service.go***.

:::

### GPRC untuk Node Lain {#grpc-for-other-nodes}

Polygon Edge juga menerapkan beberapa metode layanan yang digunnakan oleh node lain di jaringan. <br />
Layanan tersebut dijelaskan pada bagian **[Protokol](docs/edge/architecture/modules/consensus)**.

## 📜 Sumber daya {#resources}
* **[Buffer Protokol](https://developers.google.com/protocol-buffers)**
* **[libp2p](https://libp2p.io/)**
* **[gRPC](https://grpc.io/)**

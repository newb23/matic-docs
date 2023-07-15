---
id: networking
title: Ağ oluşturma
description: Polygon Edge'in ağ oluşturma modülüne ilişkin açıklama.
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

## Genel Bakış {#overview}

Bir düğüm, yararlı bilgi alışverişinde bulunmak için ağdaki diğer düğümlerle iletişim kurmalıdır.<br />
Polygon Edge, bu görevi gerçekleştirmek için güvenilirliği test edilip kanıtlanmış **libp2p** çerçevesinden yararlanır.

 **libp2p** çerçevesinin seçilme nedeni esas olarak aşağıdakilere dayanmaktadır:
* **Hız** - libp2p, devp2p'ye göre (GETH ve diğer istemcilerde kullanılır) önemli bir performans artışına sahiptir
* **Genişletilebilirlik**- sistemin diğer özellikleri için harika bir temel olarak hizmet eder
* **Modülerlik** - libp2p, niteliği itibariyle Polygon Edge gibi modüler bir yapıya sahiptir. Bu özellikle Polygon Edge'in parçalarının değiştirilebilmesi gerektiğinde daha fazla esneklik sağlar

## GRPC {#grpc}

 **libp2p** nin yanı sıra, Polygon Edge **GRPC** protokolünü de kullanır. <br />
Teknik olarak, Polygon Edge, birkaç GRPC protokolünü kullanır; bunlar daha sonra ele alınacaktır.

GRPC katmanı tüm istek/yanıt protokollerini özetlemeye yardımcı olur ve Polygon Edge'in çalışması için gereken akış protokollerini basitleştirir.

GRPC, *hizmetleri* ve *mesaj yapılarını * tanımlamak için **Protokol Arabellekleri**'ne güvenir. <br />
Hizmetler ve yapılar, derlenen ve dilden bağımsız olan *.proto* dosyalarında tanımlanır.

Daha önce, Polygon Edge'in birkaç GRPC protokolünden yararlandığından bahsetmiştik.<br />
Bu, genellikle GETH ve Parity gibi istemcilerle gecikme yaşayan düğüm operatörünün UX'ini geliştirmek için yapılmıştır.

Düğüm operatörü, aradığı bilgiyi bulmak için logları gözden geçirmek yerine GRPC hizmetini çağırarak sistemde neler olduğuna dair daha iyi bir genel bakışa sahip olur.

### Düğüm Operatörleri için GRPC {#grpc-for-node-operators}

Aşağıdaki bölüm, [CLI Komutları](/docs/edge/get-started/cli-commands) bölümünde kısaca ele alınmış olduğu için tanıdık gelebilir.

**Düğüm operatörleri** tarafından kullanılması amaçlanan GRPC hizmeti şu şekilde tanımlanır:
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

CLI komutları aslında bu hizmet yöntemlerinin uygulamalarını çağırır.

Bu yöntemler ***minimal/system_service.go*** içinde uygulanmaktadır.

:::

### Diğer Düğümler için GRPC {#grpc-for-other-nodes}

Polygon Edge, ağdaki diğer düğümler tarafından kullanılan çeşitli hizmet yöntemlerini de uygular. <br />
Bahsedilen hizmet **[Protokol](docs/edge/architecture/modules/consensus)** bölümünde açıklanmıştır.

## 📜 Kaynaklar {#resources}
* **[Protokol Arabellekleri](https://developers.google.com/protocol-buffers)**
* **[libp2p](https://libp2p.io/)**
* **[gRPC](https://grpc.io/)**

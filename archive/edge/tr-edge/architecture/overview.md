---
id: overview
title: Mimari Genel Görünümü
sidebar_label: Overview
description: Polygon Edge mimarisine giriş.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - modular
  - layer
  - libp2p
  - extensible
---

*Modüler* bir yazılım yapma fikriyle başladık.

Bu yaklaşım Polygon Edge'in hemen hemen tüm bileşenlerinde görülebilir. Aşağıda, oluşturulan mimarinin ve katmanlarının kısa bir
genel görünümünü bulacaksınız.

## Polygon Edge Katmanlama {#polygon-edge-layering}

![Polygon Edge Mimarisi](/img/edge/Architecture.jpg)

## Libp2p {#libp2p}

Her şey **libp2p** kullanan temel ağ oluşturma katmanı ile başlar. Bu teknoloji ile çalışmaya karar verdik, çünkü
Polygon Edge'in tasarım felsefelerine uymaktadır. Libp2p:

- Modülerdir
- Genişletilebilirdir
- Hızlıdır

En önemlisi, daha gelişmiş özellikler için harika bir temel sağlar; bunları ileride ele alacağız.


## Eşitleme ve Konsensüs {#synchronization-consensus}
Eşitleme ve konsensüs protokollerinin ayrılması, **istemcinin** nasıl çalıştırıldığına bağlı olarak modülerliğe ve özel eşitleme ve konsensüs mekanizmalarının uygulanmasına olanak tanır.

Polygon Edge, kullanıma hazır eklenebilir konsensüs algoritmaları sunmak için tasarlanmıştır.

Desteklenen konsensüs algoritmalarının güncel listesi:

* IBFT PoA
* IBFT PoS

## Blok zinciri {#blockchain}
Blok zinciri katmanı, Polygon Edge sistemi içindeki her şeyi koordine eden merkezi katmandır. İlgili *Modüller* bölümü içinde derinlemesine ele alınmaktadır.

## Durum {#state}
Durum iç katmanı, durum geçiş mantığını içerir. Yeni bir blok eklendiğinde durumun nasıl değiştiği ile ilgilenir. İlgili *Modüller* bölümü içinde derinlemesine ele alınmaktadır.

## JSON RPC {#json-rpc}
JSON RPC katmanı, dApp geliştiricilerinin blok zinciri ile etkileşim kurmak için kullandıkları API katmanıdır. İlgili *Modüller* bölümü içinde derinlemesine ele alınmaktadır.

## TxPool {#txpool}
TxPool katmanı işlem havuzunu temsil eder ve işlemler birden fazla giriş noktasından eklenebildiği için sistem içindeki diğer modüller ile yakından bağlantılıdır.

## grpc {#grpc}
gRPC veya Google Uzaktan İşlem Çağrısı, Google'ın başlangıçta ölçeklenebilir ve hızlı API'ler oluşturmak için yarattığı sağlam bir açık kaynaklı RPC çerçevesidir. GRPC katmanı operatör etkileşimleri için hayati önem taşır. Bu katman üzerinden düğüm operatörleri istemci ile kolayca etkileşim kurarak keyifli bir kullanıcı deneyimi elde edebilir.

---
id: overview
title: Pangkalahatang-ideya ng Arkitektura
sidebar_label: Overview
description: Introduksyon sa arkitektura ng Polygon Edge.
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

Sinimulan namin sa pamamagitan ng idea na gumawa ng software na *modular*.

Isa itong bagay na nasa halos lahat ng bahagi ng Polygon Edge. Sa ibaba, makikita mo ang maikling pangkalahatang-ideya ng
ginawang arkitektura at layering nito.

## Layering ng Polygon Edge {#polygon-edge-layering}

![Arkitektura ng Polygon Edge](/img/edge/Architecture.jpg)

## Libp2p {#libp2p}

Nagsisimula ang lahat ng ito sa layer ng base networking, na gumagamit ng **libp2p**. Nagpasya kaming piliin ang teknolohiyang ito dahil
akma ito sa mga pilosopiya ng pagdidisenyo ng Polygon Edge. Ang Libp2p ay:

- Modular
- Extensible
- Mabilis

Higit sa lahat, nagbibigay ito ng mahusay na pundasyon para sa mga mas advanced na feature, na tatalakayin natin sa susunod.


## Pag-synchronize at Consensus {#synchronization-consensus}
Ang pagiging hiwalay ng mga protokol ng pag-synchronize at consensus ay nagbibigay-daan sa modularity at implementasyon ng mga **custom** na mekanismo ng sync at consensus - depende kung paano pinapatakbo ang client.

Ang Polygon Edge ay idinisenyo na mag-alok ng mga off-the-shelf na pluggable na algorithm ng consensus.

Ang kasalukuyang listahan ng mga sinusuportahang algorithm ng consensus:

* IBFT PoA
* IBFT PoS

## Blockchain {#blockchain}
Ang layer na Blockchain ay ang central na layer na nagko-coordinate ng lahat sa system ng Polygon Edge. Tinatalakay ito nang detalyado sa kaugnay na seksyong mga *Module*.

## State {#state}
Ang panloob na layer ng State ay naglalaman ng state transition logic. Pinapangasiwaan nito kung paano nagbabago ang state kapag isinama ang isang bagong block. Tinatalakay ito nang detalyado sa kaugnay na seksyong mga *Module*.

## JSON RPC {#json-rpc}
Ang layer na JSON RPC ay isang API layer na ginagamit ng mga dApp developer para makipag-interaksyon sa blockchain. Tinatalakay ito nang detalyado sa kaugnay na seksyong mga *Module*.

## TxPool {#txpool}
Kinakatawan ng layer na TxPool ang pool ng transaksyon, at lubos na nauugnay ito sa iba pang module sa system, dahil ang mga transaksyon ay maaaring idagdag mula sa maraming entry point.

## gRPC {#grpc}
Ang gRPC, o Google Remote Procedure Call, ay isang matatag na open-source na RPC framework na una nang nilikha ng Google para magtayo ng scalable at mabilis na API. Mahalaga ang layer na GRPC para sa mga interaksyon ng operator. Sa pamamagitan nito, madaling nagagawa ng mga operator ng node na makipag-interaksyon sa client, na nagdudulot ng nae-enjoy na UX.

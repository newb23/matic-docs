---
id: overview
title: Übersicht über die Architektur
sidebar_label: Overview
description: Einführung in die Architektur von Polygon Edge.
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

Wir begannen mit der Erstellung einer *modularen* Software.

Dies ist etwas, was in fast allen Teilen des Polygon Edge vorhanden ist. Nachstehend eine Kurzübersicht über die integrierte Architektur und das Layering.

## Polygon Edge Layering {#polygon-edge-layering}

![Polygon Edge Architektur](/img/edge/Architecture.jpg)

## Libp2p {#libp2p}

Alles beginnt mit der grundlegenden Netzwerkschicht, die **libp2p** verwendet. Wir haben uns für diese Technologie entschieden, weil sie in die Designphilosophie von Polygon Edge passt. Libp2p ist:

- Modular
- Erweiterbar
- Schnell

Am wichtigsten ist, es bietet eine großartige Grundlage für mehr fortgeschrittene Funktionen, die wir später abdecken werden.


## Synchronisation & Konsens {#synchronization-consensus}
Die Trennung der Synchronisation und des Consensus Protokolls ermöglicht die Modularität und Implementierung von **benutzerdefinierten** Sync und Konsensmechanismen – je nachdem, wie der Client ausgeführt wird.

Polygon Edge ist so konzipiert, dass es standardmäßig einsteckbare Konsensalgorithmen bietet.

Die aktuelle Liste der unterstützten Konsens-Algorithmen:

* IBFT PoA
* IBFT PoS

## Blockchain {#blockchain}
Die Blockchain Layer ist die zentrale Ebene, die alles im Polygon Edge koordiniert. Es wird ausführlich im entsprechenden *Modul*abschnitt behandelt.

## State {#state}
Die Innenschicht State enthält die Statusübergangslogik.
Es geht darum, wie sich der Zustand ändert, wenn ein neuer Block aufgenommen wird. Es wird ausführlich im entsprechenden *Modul*abschnitt behandelt.

## JSON RPC {#json-rpc}
Die JSON RPC ist eine API-Ebene, die dApp Entwickler verwenden, um mit der Blockchain zu interagieren. Es wird ausführlich im entsprechenden *Modul*abschnitt behandelt.

## TxPool {#txpool}
Die TxPool Layer repräsentiert den Transaktionspool, und es ist eng mit anderen Modulen im System verknüpft, da Transaktionen von mehreren Einstiegspunkten hinzugefügt werden können.

## GRPC {#grpc}
gRPC oder Google Remote Procedure Call ist ein robustes gRPC, das ursprünglich erstellt wurde, um skalierbare und schnelle APIs zu erstellen. Die GRPC-Schicht ist für die Interaktion mit dem Operator unerlässlich. Durch sie können Knoten unkompliziert mit dem Client interagieren, was eine angenehme UX bietet.

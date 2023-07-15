---
id: overview
title: Panoramica sull'architettura
sidebar_label: Overview
description: Introduzione all'architettura di Polygon Edge.
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

Abbiamo iniziato con l'idea di creare un software *modulare*.

Questo aspetto è presente in quasi tutte le parti del Polygon Edge. Di seguito troverete una breve panoramica dell'architettura costruita e della sua stratificazione.

## Stratificazione di Polygon Edge  {#polygon-edge-layering}

![Architettura di Polygon Edge](/img/edge/Architecture.jpg)

## Libp2p {#libp2p}

Tutto inizia dal layer di networking di base che utilizza **libp2p**. Abbiamo deciso di utilizzare questa tecnologia perché sposa la filosofia di progettazione di Polygon Edge. Libp2p è:

- Modulare
- Estensibile
- Veloce

Soprattutto, fornisce un'ottima base per funzioni più avanzate, che tratteremo più avanti.


## Sincronizzazione e Consenso {#synchronization-consensus}
La separazione dei protocolli di sincronizzazione e consenso consente la modularità e l'implementazione di meccanismi di sincronizzazione e consenso **personalizzati**, a seconda di come viene eseguito il client.

Polygon Edge è stato progettato per offrire algoritmi di consenso collegabili in modo autonomo.

Elenco attuale degli algoritmi di consenso supportati:

* IBFT PoA
* IBFT PoS

## Blockchain {#blockchain}
Il layer Blockchain è il livello centrale che coordina tutto nel sistema Polygon Edge. Viene trattata in modo approfondito nella corrispondente sezione *Moduli*.

## Stato {#state}
Il layer interno di State contiene la logica di transizione di stato. Si occupa di come cambia lo stato quando viene inserito un nuovo blocco. Viene trattata in modo approfondito nella corrispondente sezione *Moduli*.

## JSON RPC {#json-rpc}
Il layer JSON RPC è un layer API che gli sviluppatori di dApp utilizzano per interagire con la blockchain. Viene trattata in modo approfondito nella corrispondente sezione *Moduli*.

## TxPool {#txpool}
Il layer TxPool rappresenta il pool di transazioni ed è strettamente collegato agli altri moduli del sistema, poiché le transazioni possono essere aggiunte da più punti di ingresso.

## grpc {#grpc}
gRPC o Google Remote Procedure Call, è un robusto framework open source che Google inizialmente ha creato per costruire API scalabili e veloci. Il layer GRPC è fondamentale per le interazioni dell'operatore. Attraverso di esso, gli operatori dei nodi possono interagire facilmente con il cliente, offrendo una piacevole Esperienza Utente.

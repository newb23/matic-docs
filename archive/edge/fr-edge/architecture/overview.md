---
id: overview
title: Présentation De L'Architecture
sidebar_label: Overview
description: Introduction à l'architecture de Polygon Edge.
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

Nous avons commencé avec l'idée de créer des logiciels *modulaires*.

C'est un élément qui est présent dans presque toutes les composantes de Polygon Edge. Vous trouverez ci-dessous un bref aperçu de l'architecture développée et de sa stratification.

## Stratification de Polygon Edge {#polygon-edge-layering}

![Architecture de Polygon Edge](/img/edge/Architecture.jpg)

## Libp2p {#libp2p}

Tout commence au niveau de la couche du réseau de base, qui utilise **libp2p**. Nous avons opté pour cette technologie parce qu'elle correspond à la philosophie de conception de Polygon Edge. Libp2p est:

- Modulaire
- Extensible
- Rapide

Plus important encore, ce système constitue une excellente base pour des fonctionnalités plus avancées, que nous aborderons plus en avant.


## Synchronisation et Consensus {#synchronization-consensus}
La séparation des protocoles de synchronisation et de consensus permet la modularité et la mise en œuvre de mécanismes de synchronisation et de consensus **personnalisés**, en fonction de la façon dont le client est exécuté.

Polygon Edge est conçu pour proposer des algorithmes de consensus prêts à l'emploi.

La liste actuelle des algorithmes de consensus supportés:

* IBFT PoA
* IBFT PoS

## Blockchain {#blockchain}
La couche de Blockchain est la couche centrale qui coordonne tout dans le système de Polygon Edge. Elle est abordée en profondeur dans la section *Modules* correspondante.

## État {#state}
La couche d'État interne contient la logique de transition d'état. Elle gère la façon dont l'état change lorsqu'un nouveau bloc est inclus. Elle est abordée en profondeur dans la section *Modules* correspondante.

## JSON RPC {#json-rpc}
La couche JSON RPC est une couche d'API que les développeurs de dApps utilisent pour interagir avec la blockchain. Elle est abordée en profondeur dans la section *Modules* correspondante.

## TxPool {#txpool}
La couche TxPool représente le pool de transactions, elle est étroitement liée aux autres modules du système car les transactions peuvent être introduites à partir de plusieurs points d'entrée.

## grpc {#grpc}
gRPC, ou Google Remote Procedure Call, est un cadre open-source robuste RPC créé initialement pour construire des API évolutives et rapides. La couche GRPC est essentielle pour les interactions avec les opérateurs. Grâce à cette dernière, les opérateurs de nœuds peuvent facilement interagir avec le client, offrant ainsi une expérience utilisateur agréable.

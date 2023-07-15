---
id: overview
title: Übersicht
description: ChainBridge Übersicht
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

## Was ist ChainBridge? {#what-is-chainbridge}

ChainBridge ist eine modulare, multidirektionale Blockchain Bridge, die EVM- und Substrat-kompatible Chains unterstützt und von ChainSafe entwickelt wurde. Sie ermöglicht es Benutzern, alle Arten von Assets oder Nachrichten zwischen zwei verschiedenen Chains zu übertragen.

Um mehr über ChainBridge zu erfahren, besuche bitte zuerst die [offizielle Dokumentation](https://chainbridge.chainsafe.io/), die von den Entwicklern bereitgestellt wird.

Dieser Leitfaden soll Ihnen bei der Integration von ChainBridge in Polygon Edge helfen. Er führt durch die Einrichtung einer Bridge zwischen einem laufenden Polygon PoS (Mumbai Testnet) und einem lokalen Polygon Edge-Netzwerk.

## Voraussetzungen {#requirements}

In diesem Leitfaden werden Polygon Edge-Knoten, ein ChainBridge-Relayer (mehr dazu [hier](/docs/edge/additional-features/chainbridge/definitions)) und das Tool cb-sol-cli, ein CLI-Tool zur Bereitstellung von lokalen Contracts ausgeführt, Ressourcen registriert und Einstellungen für die Bridge geändert ([das](https://chainbridge.chainsafe.io/cli-options/#cli-options) ist nachprüfbar). Vor der Einrichtung müssen die folgenden Voraussetzungen erfüllt sein:

* Go: >= 1.17
* Node.js >= 16.13.0
* Git


Außerdem müssen die folgenden Repositories mit den Versionen geklont werden, um bestimmte Anwendungen auszuführen.

* [Polygon Edge](https://github.com/0xPolygon/polygon-edge): auf dem `develop`Branch
* [ChainBridge](https://github.com/ChainSafe/ChainBridge): v1.1.5
* [ChainBridge Bereitstellungstools](https://github.com/ChainSafe/chainbridge-deploy): `f2aa093`auf B`main`ranch


Sie müssen ein Polygon-Edge-Netzwerk einrichten, bevor Sie mit dem nächsten Abschnitt fortfahren. Weitere Informationen finden Sie unter [Lokale Einrichtung](/docs/edge/get-started/set-up-ibft-locally) oder [Cloud Einrichtung](/docs/edge/get-started/set-up-ibft-on-the-cloud).
---
id: overview
title: Polygon Edge
sidebar_label: What is Edge
description: "Eine Einführung in Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - network
  - modular

---

Polygon Edge ist ein modulares und erweiterbares Framework zum Aufbau von Ethereum-kompatiblen Blockchain-Netzwerken, Sidechains und allgemeinen Skalierungslösungen.

Es dient in erster Linie dazu, ein neues Blockchain-Netzwerk zu erstellen, und bietet gleichzeitig volle Kompatibilität mit Ethereum Smart-Contracts und Transaktionen. Es verwendet den IBFT (Istanbul Byzantine Fault Tolerant) Konsensmechanismus, der in zwei Varianten als [PoA (Proof of Authority (Autoritätsnachweis](/docs/edge/consensus/poa))) und [PoS (Proof of Stake (Anspruchsnachweis))](/docs/edge/consensus/pos-stake-unstake) unterstützt wird.

Polygon Edge unterstützt auch die Kommunikation mit mehreren Blockchain-Netzwerken und ermöglicht die Übertragung von [ERC-20-](https://ethereum.org/en/developers/docs/standards/tokens/erc-20) und [ERC-721](https://ethereum.org/en/developers/docs/standards/tokens/erc-721)-Tokens, indem es die [zentralisierte Bridge-Lösung](/docs/edge/additional-features/chainbridge/overview) nutzt.

Standardmäßige Wallets können zur Interaktion mit Polygon Edge über die [JSON-RPC](/docs/edge/working-with-node/query-json-rpc)-Endpunkte verwendet werden. Bediener von Knotenpunkten können über das [gRPC](/docs/edge/working-with-node/query-operator-info)-Protokoll verschiedene Aktionen auf den Knotenpunkten durchführen.

Um mehr über Polygon zu erfahren, besuche die [offizielle Website](https://polygon.technology).

**[GitHub Repository](https://github.com/0xPolygon/polygon-edge)**

:::caution

Es handelt sich um ein Projekt, an dem noch gearbeitet wird. Es kann also sein, dass sich die Architektur in Zukunft ändert. Der Code wurde noch nicht geprüft.
Bitte kontaktiere das Polygon-Team, wenn du ihn in der Produktion verwenden möchtest.

:::



Um mit der lokalen Ausführung eines `polygon-edge` Netzwerks zu beginnen, lies bitte: [Installation](/docs/edge/get-started/installation) und [lokale Einrichtung](/docs/edge/get-started/set-up-ibft-locally).

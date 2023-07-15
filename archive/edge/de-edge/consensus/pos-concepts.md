---
id: pos-concepts
title: Proof of Stake
description: "Erläuterung und Anweisungen zu Proof of Stake."
keywords:
  - docs
  - polygon
  - edge
  - PoS
  - stake
---

## Übersicht {#overview}

Dieser Abschnitt soll einen besseren Überblick über einige Konzepte geben, die derzeit im Proof of Stake (PoS) enthalten sind Implementierung der Polygon Edge.

Die Implementierung von Polygon Edge Proof of Stake (PoS) soll eine Alternative zur bestehenden PoA IBFT Implementierung sein, geben Knotenbetreibern die Möglichkeit, leicht zwischen den beiden zu wählen, wenn eine Chain beginnt.

## PoS Funktionen {#pos-features}

Die Kernlogik hinter der Proof of Stake Implementierung befindet sich innerhalb der **[Staking Smart Contract](https://github.com/0xPolygon/staking-contracts/blob/main/contracts/Staking.sol)**.

Dieser Vertrag wird pre-deployed wenn eine Polygon Edge Chain des PoS Mechanismus initialisiert wird und auf der Adresse verfügbar ist`0x0000000000000000000000000000000000001001` aus Block `0`.

### Epochen {#epochs}

Epochen sind ein Konzept, das mit dem Zusatz PoS zur Polygon Edge eingeführt wurde.

Epochen gelten als ein spezieller Zeitrahmen (in Blöcken), in dem ein bestimmter Satz von Prüfern Blöcke erzeugen kann. Ihre Längen sind veränderbar, d.h. Knotenbetreiber können die Länge einer Epoche während der genesis konfigurieren.

Am Ende jeder Epoche wird ein _epoch_ erstellt, und nach diesem Ereignis beginnt eine neue Epoche. Um mehr über die epoch Blöcke findest du im Abschnitt[ Epoch Blöcke](/docs/edge/consensus/pos-concepts#epoch-blocks).

Die Prüfungssätze werden am Ende jeder Epoche aktualisiert. Die Knoten fragen den validator aus dem Staking Smart Contract während der Erstellung des epoch und speichert die erhaltenen Daten auf dem lokalen Speicher. Diese Abfrage und save cycle ist wiederholt am Ende jeder Epoche.

Im Wesentlichen stellt er sicher, dass der Staking Smart Contract die vollständige Kontrolle über die Adressen im validator hat und verlässt Knoten mit nur 1 Verantwortung - um den Vertrag während einer Epoche für den Abruf des neuesten Prüfers einmal abzufragen Informationen festlegen. Dies lindert die Verantwortung von einzelnen Knoten von der Betreuung von validator sets.

### Staking {#staking}

Adressen können Geld auf dem Staking Smart Contract einsetzen, indem du die `stake`Methode aufrufst und einen Wert für den staked Betrag in der Transaktion bestimmst:

````js
const StakingContractFactory = await ethers.getContractFactory("Staking");
let stakingContract = await StakingContractFactory.attach(STAKING_CONTRACT_ADDRESS)
as
Staking;
stakingContract = stakingContract.connect(account);

const tx = await stakingContract.stake({value: STAKE_AMOUNT})
````

Durch das Staking auf dem Staking Smart Contract können Adressen den validator eingeben und somit in der Lage sein, an den Prozess der Produktion des Blocks teilzunehmen.

:::info Schwelle zum Staking
`1 ETH`Derzeit ist die minimale Schwelle für die Eingabe in den validator
:::

### Unstaking {#unstaking}

Adressen, die über gestapelte Mittel verfügen, können nur **alle ihre gestapelten Mittel auf einmal auflösen**.

Unstaking kann durch den Aufruf der `unstake`Methode im Staking Smart Contract:

````js
const StakingContractFactory = await ethers.getContractFactory("Staking");
let stakingContract = await StakingContractFactory.attach(STAKING_CONTRACT_ADDRESS)
as
Staking;
stakingContract = stakingContract.connect(account);

const tx = await stakingContract.unstake()
````

Nach dem Unstaking ihrer Mittel werden Adressen aus dem Prüfer, der auf dem Staking Smart Contract festgelegt ist, entfernt und werden nicht als Prüfer in der nächsten Epoche betrachtet.

## Epoch Blöcke {#epoch-blocks}

**Epoch Blocks** sind ein Konzept, das in der PoS Implementierung von IBFT in Polygon Edge eingeführt wurde.

Im Wesentlichen sind epoch spezielle Blöcke, die **keine Transaktionen** enthalten und erst am **Ende einer Epoche** auftreten. Wenn die **epoch** beispielsweise `50`auf Blöcke gesetzt wird, werden epoch als Blöcke 10, `50`100 `100``150`und so weiter betrachtet.

Sie werden verwendet, um zusätzliche Logik auszuführen, die während der regulären Blockproduktion nicht auftreten sollte.

Am wichtigsten sind sie ein Hinweis für den Knoten, dass **er die neuesten Informationen zum validator abrufen muss** des Staking Smart Contract.

Nach Aktualisierung des validator im epoch wird der validator (entweder geändert oder unverändert) wird für die nachfolgenden  `epochSize - 1`Blöcke verwendet, bis es erneut aktualisiert wird, indem du die neuesten Informationen aus des Staking Smart Contract.

Epoch (in Blöcken) bei der Generierung der Genesis-Datei mit einem speziellen Flag änderbar `--epoch-size`sind:

```bash
polygon-edge genesis --epoch-size 50 ...
```

`100000`Die Standardgröße einer Epoche ist  Blöcke in der Polygon Edge.

## Contract Pre-Deployment {#contract-pre-deployment}

Die Polygon Edge _Pre-Deploys_ des [Staking Smart Contract](https://github.com/0xPolygon/staking-contracts/blob/main/contracts/Staking.sol). während der **genesis generation** an die Adresse `0x0000000000000000000000000000000000001001`.

Es tut dies ohne einen laufenden EVM, indem es die Blockchain des Smart Contract direkt mit dem übergebenen modifiziert Konfigurationswerte für den genesis Befehl .

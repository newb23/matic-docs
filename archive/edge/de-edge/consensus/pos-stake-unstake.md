---
id: pos-stake-unstake
title: Einrichtung und Verwendung von Proof of Stake (PoS)
description: "Stake, Unstake und andere staking-related Anweisungen."
keywords:
  - docs
  - polygon
  - edge
  - stake
  - unstake
  - validator
  - epoch
---

## Übersicht {#overview}

Dieser Leitfaden geht in Detail darüber, wie du ein Proof of Stake Netzwerk mit der Polygon Edge einrichtest, wie du Mittel für Knoten staken kannst um Prüfer zu werden und wie du Mittel freisetzen kannst.

Es wird **sehr** ermutigt, zu lesen und durchzugehen die [lokale Einrichtung](/docs/edge/get-started/set-up-ibft-locally) / [Cloud Setup](/docs/edge/get-started/set-up-ibft-on-the-cloud) Abschnitte, bevor du diesem PoS Guide folgst. Diese Abschnitte beschreiben die Schritte, die für den Start eines Proof of Authority (PoA) Clusters mit dem Polygon Edge notwendig sind.

Derzeit gibt es kein Limit für die Anzahl der Prüfer, die Mittel auf dem Staking Smart Contract einsetzen können.

## Staking Smart Contract {#staking-smart-contract}

Das Repo für den Staking Smart Contract befindet sich [hier](https://github.com/0xPolygon/staking-contracts).

Es enthält die notwendigen Prüfskripte, ABI Dateien und vor allem den Staking Smart Contract selbst.

## Einrichtung eines N node Clusters {#setting-up-an-n-node-cluster}

Die Einrichtung eines Netzwerks mit dem Polygon Edge ist abgedeckt die [lokale Einrichtung](/docs/edge/get-started/set-up-ibft-locally) / [Cloud Setup](/docs/edge/get-started/set-up-ibft-on-the-cloud) Abschnitte.

Der **einzige Unterschied** zwischen der Einrichtung eines PoS und PoA Clusters ist im genesis generation part.

**Wenn die Genesis-Datei für einen PoS Cluster erstellt wird, wird ein zusätzliches Flag benötigt`--pos`**:

```bash
polygon-edge genesis --pos ...
```

## Einstellung der Länge einer Epoche {#setting-the-length-of-an-epoch}

Epochen sind im Abschnitt [Epoch Blocks](/docs/edge/consensus/pos-concepts#epoch-blocks) ausführlich behandelt.

Um die Größe einer Epoche für einen Cluster (in Blöcken) festzulegen, ist ein zusätzliches Flag angegeben `--epoch-size`:

```bash
polygon-edge genesis --epoch-size 50
```

Dieser in der Genesis-Datei angegebene Wert, dass die epoch Größe  `50`Blöcke sein sollte.

Der Standardwert für die Größe einer Epoche (in Blöcken) ist `100000`.

:::info Senken der Epochenlänge
Wie im Abschnitt [Epoch Blocks](/docs/edge/consensus/pos-concepts#epoch-blocks) beschrieben, epoch Blöcke werden verwendet, um die validator sets für Knoten zu aktualisieren.

Die default epoch Länge in Blöcken (`100000`) kann eine lange Zeit für validator sein. Berücksichtigung dieser neuen Blöcke werden ~2s hinzugefügt, es würde ~55.5h für den Prüfer dauern, um möglicherweise zu ändern.

Wenn ein niedrigerer Wert für die Epochenlänge festgelegt wird, wird sichergestellt, dass der validator häufiger aktualisiert wird.
:::

## Verwendung der Staking Smart Contract Skripte {#using-the-staking-smart-contract-scripts}

### Voraussetzungen {#prerequisites}

Das Staking Smart Contract repo ist ein Hardhat Projekt, das NPM erfordert.

Um es richtig zu initialisieren, im Hauptverzeichnis ausführen:

```bash
npm install
````

### Einrichtung der bereitgestellten Helfer-Skripte {#setting-up-the-provided-helper-scripts}

Skripte für die Interaktion mit dem bereitgestellten Staking Smart Contract befinden sich auf dem [Staking Smart Contract](https://github.com/0xPolygon/staking-contracts).

Erstellen Sie eine  `.env`Datei mit den folgenden Parametern im Repo Smart Contracts location:

```bash
JSONRPC_URL=http://localhost:10002
PRIVATE_KEYS=0x0454f3ec51e7d6971fc345998bb2ba483a8d9d30d46ad890434e6f88ecb97544
STAKING_CONTRACT_ADDRESS=0x0000000000000000000000000000000000001001
BLS_PUBLIC_KEY=0xa..
```

Wo die Parameter sind:

* **JSONRPC_URL** - der JSONRPC_URL Endpunkt für den laufenden Knoten
* **PRIVATE_KEYS** - Private Keys der staker Adresse.
* **STAKING_CONTRACT_ADDRESS** - die Adresse des staking Smart Contract ( `0x0000000000000000000000000000000000001001`default)
* **BLS_PUBLIC_KEY** - BLS öffentlicher Key des staker. Nur erforderlich, wenn das Netzwerk mit BLS läuft

### Staking Fonds {#staking-funds}

:::info Staking Adresse
Der Staking Smart Contract ist im Voraus bereitgestellt Adresse `0x0000000000000000000000000000000000001001`.

Jede Art von Interaktion mit dem Staking wird über den Staking Smart Contract an der angegebenen Adresse durchgeführt.

Um mehr über den Staking Smart Contract zu erfahren, besuche bitte der **[Staking Smart Contract](/docs/edge/consensus/pos-concepts#contract-pre-deployment)** Abschnitt.
:::

Um Teil des validator zu werden, muss eine Adresse einen bestimmten Betrag an Mitteln über einer Schwelle einsetzen.

`1 ETH`Derzeit ist die Standardschwelle für die Aufnahme eines Teils des validator .

Staking kann initiiert werden, indem man die `stake`Methode des Staking Smart Contracts aufruft und einen Wert angibt.`>= 1 ETH`

Nach der in erwähnten  `.env`Datei der [vorherigen Abschnitt](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts) eingerichtet wurde und eine Chain wurde im PoS Modus gestartet, kann Staking mit dem folgenden Befehl im Staking Smart Contract durchgeführt werden:

```bash
npm run stake
```

Das `stake`Hardhat Skript setzt eine Standardmenge von `1 ETH`, die durch die Änderung `scripts/stake.ts`der Datei ein angepasst werden kann.

Wenn die Mittel staked `>= 1 ETH`sind, wird der im Staking Smart Contract festgelegte Prüfer aktualisiert und die Adresse wird Teil des validator sein, beginnend mit der nächsten Epoche.

:::info Registrierung der BLS Keys
Wenn das Netzwerk im BLS Modus läuft, um Prüfer zu werden, müssen sie nach dem Staking ihre öffentlichen BLS registrieren

Dies kann mit dem folgenden Befehl erfolgen:

```bash
npm run register-blskey
```
:::

### Unstaking Mittel {#unstaking-funds}

Adressen, die einen Einsatz haben, können **nur alle ihre Mittel** auf einmal auflösen.

Nach der in erwähnten  `.env`Datei im [vorherigen Abschnitt](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts) eingerichtet und eine Chain gestartet wurde, kann mit dem folgenden Befehl im PoS durchgeführt werden Staking Smart Contract repo:

```bash
npm run unstake
```

### Suche die Liste der Stakers {#fetching-the-list-of-stakers}

Alle Adressen, die Mittel einsetzen, werden im Staking Smart Contract gespeichert.

Nach der in erwähnten  `.env`Datei im [vorherigen Abschnitt](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts) wurde eingerichtet und eine Chain im PoS gestartet wurde, kann die Liste der validatoren mit dem folgenden Befehl in der Staking Smart Contract repo gemacht werden:

```bash
npm run info
```

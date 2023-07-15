---
id: bls
title: BLS
description: "Erläuterung und Anweisungen in Bezug auf den BLS"
keywords:
  - docs
  - polygon
  - edge
  - bls
---

## Übersicht {#overview}

BLS auch bekannt als Boneh–Lynn–Shacham (BLS) ist ein kryptographisches Signaturschema, das es einem Benutzer ermöglicht, zu überprüfen, ob ein Signer authentisch ist. Es ist ein signature das mehrere Signaturen aggregieren kann. In Polygon Edge wird BLS standardmäßig verwendet, um eine bessere Sicherheit im IBFT Consensus Modus zu bieten. BLS kann Signaturen in ein einziges Byte Array aggregieren und die Block-Header Größe reduzieren. Jede Chain kann wählen, ob BLS verwendet werden soll Der ECDSA Key wird unabhängig davon, ob der BLS Modus aktiviert ist oder nicht.

## Video-Präsentation {#video-presentation}

[![bls - video](https://img.youtube.com/vi/HbUmZpALlqo/0.jpg)](https://www.youtube.com/watch?v=HbUmZpALlqo)

## Wie man eine neue Kette mit BLS einrichtet {#how-to-setup-a-new-chain-using-bls}

Bezüglich einer umfassenden Einrichtung siehe [Lokale Einrichtung](/docs/edge/get-started/set-up-ibft-locally) / [Cloud Einrichtung](/docs/edge/get-started/set-up-ibft-on-the-cloud)

## Wie man aus einer bestehenden ECDSA PoA Chain zu BLS PoA Chain migriert {#how-to-migrate-from-an-existing-ecdsa-poa-chain-to-bls-poa-chain}

Dieser Abschnitt beschreibt, wie man den BLS Modus in einer vorhandenen PoA Chain verwendet. Die folgenden Schritte erforderlich sind, um BLS in einer PoA Chain zu aktivieren.

1. Stoppen Sie alle Knoten
2. BLS Schlüssel für Validatoren erzeugen
3. Eine Fork in genesis.json hinzufügen
4. Starten Sie alle Knoten neu

### 1. Stoppen Sie alle Knoten {#1-stop-all-nodes}

Beenden Sie alle Prozesse der Validatoren durch Drücken von Ctrl + c (Control + c). Bitte merken Sie sich die letzte Blockhöhe (die höchste Sequenznummer im Block-Committed-Log).

### 2. Generieren Sie den BLS Key {#2-generate-the-bls-key}

`secrets init`mit der g`--bls`eneriert einen BLS Key. `--ecdsa`Um den vorhandenen ECDSA und Network Key zu behalten und einen neuen BLS Key hinzuzufügen, müssen `--network`deaktiviert werden.

```bash
polygon-edge secrets init --bls --ecdsa=false --network=false

[SECRETS INIT]
Public key (address) = 0x...
BLS Public key       = 0x...
Node ID              = 16...
```

### 3. Fork Einstellung hinzufügen {#3-add-fork-setting}

`ibft switch`Befehl fügt eine Fork hinzu, die in der vorhandenen Chain BLS in... aktiviert`genesis.json`.

Bei PoA-Netzen müssen die Validatoren im Befehl angegeben werden. Wie bei der Art von `genesis`Befehl o`--ibft-validators-prefix-path``--ibft-validator`der können Flags verwendet werden, um den Prüfer anzugeben.

Legen Sie die Höhe fest, von der die Chain beginnt, BLS mit der `--from`Flag zu verwenden.

```bash
polygon-edge ibft switch --chain ./genesis.json --type PoA --ibft-validator-type bls --ibft-validators-prefix-path test-chain- --from 100
```

### 4. Starten Sie alle Knoten neu {#4-restart-all-nodes}

Starte Sie mit dem `server`Befehl alle Knoten neu. Nachdem der Block auf dem erstellt wurde, der im vorherigen Schritt `from`angegeben ist, aktiviert die Chain das BLS und zeigt Protokolle wie folgt an:

```bash
2022-09-02T11:45:24.535+0300 [INFO]  polygon.ibft: IBFT validation type switched: old=ecdsa new=bls
```

Außerdem zeigen die Protokolle, mit welchem Überprüfungsmodus jeder Block nach der Erstellung des Blocks generiert wird.

```
2022-09-02T11:45:28.728+0300 [INFO]  polygon.ibft: block committed: number=101 hash=0x5f33aa8cea4e849807ca5e350cb79f603a0d69a39f792e782f48d3ea57ac46ca validation_type=bls validators=3 committed=3
```

## Wie man aus einer bestehenden ECDSA PoA Chain zu BLS PoS Chain migriert {#how-to-migrate-from-an-existing-ecdsa-pos-chain-to-a-bls-pos-chain}

Dieser Abschnitt beschreibt, wie man den BLS Modus in einer vorhandenen PoS Chain verwendet. Die folgenden Schritte sind erforderlich, um BLS in einer PoS Chain zu aktivieren.

1. Stoppen Sie alle Knoten
2. BLS Schlüssel für Validatoren erzeugen
3. Eine Fork in genesis.json hinzufügen
4. Rufen Sie den Staking-Vertrag auf, um den öffentlichen BLS-Schlüssel zu registrieren.
5. Starten Sie alle Knoten neu

### 1. Stoppen Sie alle Knoten {#1-stop-all-nodes-1}

Beenden Sie alle Prozesse der Validatoren durch Drücken von Ctrl + c (Control + c). Bitte merken Sie sich die letzte Blockhöhe (die höchste Sequenznummer im Block-Committed-Log).

### 2. Generieren Sie den BLS Key {#2-generate-the-bls-key-1}

`secrets init`mit der `--bls`Flag generiert den BLS-Key. Um den vorhandenen ECDSA und Network Key zu behalten und einen neuen BLS Key hinzuzufügen, `--network`müssen `--ecdsa`deaktiviert werden.

```bash
polygon-edge secrets init --bls --ecdsa=false --network=false

[SECRETS INIT]
Public key (address) = 0x...
BLS Public key       = 0x...
Node ID              = 16...
```

### 3. Fork Einstellung hinzufügen {#3-add-fork-setting-1}

`ibft switch`Befehl fügt eine Fork-Einstellung hinzu, die in der Mitte der Chain BLS in aktiviert`genesis.json`.

Legen Sie die Höhe fest, von der aus die Chain den BLS-Modus mit der `from`Flag verwendet, und geben auch die Höhe an, in der der Vertrag mit der `development`Flag aktualisiert wird.

```bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --ibft-validator-type bls --deployment 50 --from 200
```

### 4. Registrieren Sie den öffentlichen Schlüssel des BLS im Staking {#4-register-bls-public-key-in-staking-contract}

Nachdem die Fork hinzugefügt ist und Validatoren neu gestartet werden, muss jeder Validator `registerBLSPublicKey`im Staking-Vertrag aufrufen, um den öffentlichen BLS registrieren. Dies muss nach der in angegebenen Höhe geschehen, und zwar `--deployment`vor der in 2 angegebenen Höhe`--from`.

Das Skript zum Registrieren von BLS Public Key ist im [Staking Smart Contract repo definiert](https://github.com/0xPolygon/staking-contracts).

`BLS_PUBLIC_KEY`einstellen, damit es in der `.env`-Datei registriert werden kann. Weitere Details zu anderen Parametern unter [pos-stake-unstake](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts).

```env
JSONRPC_URL=http://localhost:10002
STAKING_CONTRACT_ADDRESS=0x0000000000000000000000000000000000001001
PRIVATE_KEYS=0x...
BLS_PUBLIC_KEY=0x...
```

`.env`Der folgende Befehl registriert den öffentlichen BLS Key in 1 zum Vertrag.

```bash
npm run register-blskey
```

:::warning Prüfer müssen den Public BLS manuell registrieren
Im BLS-Modus müssen Prüfer ihre eigene Adresse und den öffentlichen Schlüssel des öffentlichen BLS haben. Die Konsensschicht ignoriert die Prüfer, die keinen öffentlichen BLS-Schlüssel im Vertrag registriert haben, wenn der Konsens die Prüferinformationen aus dem Vertrag abruft.

:::

### 4. Starten Sie alle Knoten neu {#5-restart-all-nodes}

Starte Sie mit dem `server`Befehl alle Knoten neu. Die Chain ermöglicht das BLS, nachdem der Block bei 1 erstellt wird, die im vorherigen Schritt `from`angegeben wurde.

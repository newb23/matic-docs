---
id: poa
title: Proof of Authority (PoA)
description: "Erläuterung und Anweisungen zu Beweis der Autorität."
keywords:
  - docs
  - polygon
  - edge
  - PoA
  - autorithy
---

## Übersicht {#overview}

Der IBFT PoA ist der Standard-Konsensmechanismus in der Polygon Edge In PoA sind Prüfer verantwortlich für die Erstellung der Blöcke und das Hinzufügen von Blöcken einer Serie.

Alle Prüfer bilden ein dynamisches Prüfer-Set, in dem Prüfer durch Verwendung eines Abstimmmechanismus hinzugefügt oder aus dem Satz entfernt werden können. Dies bedeutet, dass Prüfer in dem Prüfer-Set gewählt werden können, wenn die Mehrheit (51 %) der Prüferknoten dazu abstimmen einen bestimmten Prüfer zu/vom Set zu hinzufügen bzw. zu fallen. Auf diese Weise können bösartige Prüfer erkannt und aus dem Netzwerk entfernt werden, während neue vertrauenswürdige Prüfer dem Netzwerk hinzugefügt werden können.

Alle Prüfer werden in der Vorschläge des nächsten Blocks (Round-robin) und für den in die Blockchain zu validieren/eingefügten Block muss eine Supermehrheit (mehr als 2/3) der Prüfer den genannten Block genehmigen.

Neben Prüfern gibt es Nicht-Prüfer, die nicht an der block creation teilnehmen, aber am block validation Prozess.

## Hinzufügen eines Prüfers zum Prüfer-Set {#adding-a-validator-to-the-validator-set}

Dieser Leitfaden beschreibt, wie du einem aktiven IBFT mit 4 Prüferknoten einen neuen Prüferknoten zu einem aktiven IBFT Netzwerk hinzufügst. Wenn du Hilfe beim Einrichten des Netzwerks benötigst, sieh in den Sektionen [Local Setup](/edge/get-started/set-up-ibft-locally.md) / [Cloud Setup](/edge/get-started/set-up-ibft-on-the-cloud.md) auf.

### Schritt 1: Initialisiere Datenordner für IBFT und generiere validator keys für den neuen Knoten {#step-1-initialize-data-folders-for-ibft-and-generate-validator-keys-for-the-new-node}

Um mit IBFT auf dem neuen Knoten in Betrieb zu sein, musst du zuerst die Datenordner initialisieren und die Schlüssel generieren:

````bash
polygon-edge secrets init --data-dir test-chain-5
````

Dieser Befehl wird den validator Key (Adresse) und die Knoten-ID drucken. Für den nächsten Schritt benötigst du den Prüfschlüssel (Adresse).

### Schritt 2: Schlage einen neuen Kandidaten aus anderen Prüfknoten vor {#step-2-propose-a-new-candidate-from-other-validator-nodes}

Damit ein neuer Knoten ein Prüfer wird, müssen mindestens 51 % der Prüfer ihn vorschlagen.

Beispiel für die Vorschlagsfunktion eines neuen Prüfers (`0x8B15464F8233F718c8605B16eBADA6fc09181fC2`) aus dem vorhandenen Prüfknoten auf der grpc 127.0.0.1:100:

````bash
polygon-edge ibft propose --grpc-address 127.0.0.1:10000 --addr 0x8B15464F8233F718c8605B16eBADA6fc09181fC2 --bls 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --vote auth
````

Die Struktur der IBFT-Befehle ist im Abschnitt [CLI Befehle](/docs/edge/get-started/cli-commands) abgedeckt.

:::info Öffentlicher Schlüssel BLS
Der öffentliche BLS ist nur dann notwendig, wenn das Netzwerk mit dem BLS läuft, für das Netzwerk das nicht im BLS-`--bls`Modus läuft.
:::

### Schritt 3: Führe den Client-Knoten aus {#step-3-run-the-client-node}

Da in diesem Beispiel das Netzwerk ausführen wird, in dem alle Knoten auf dem gleichen Rechner sind, müssen wir darauf achten, um nodes zu vermeiden.

````bash
polygon-edge server --data-dir ./test-chain-5 --chain genesis.json --grpc-address :50000 --libp2p :50001 --jsonrpc :50002 --seal
````

Nach Abrufen aller Blöcke werden Sie in Ihrer Konsole feststellen, dass ein neuer Knoten an der Validierung beteiligt ist

````bash
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=4004
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=5 votes=0
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft: proposer calculated: proposer=0x8B15464F8233F718c8605B16eBADA6fc09181fC2 block=4004
````

:::info Förderung eines non-validator für einen Prüfer
Natürlich kann ein Nicht-Prüfer durch den Abstimmungsprozess ein Prüfer werden, aber damit er nach dem Abstimmungsprozess erfolgreich in den validator-set aufgenommen wird, muss der Knoten mit der Flag neu `--seal`gestartet werden.
:::

## Entfernen eines Prüfers aus dem Prüfer-Set {#removing-a-validator-from-the-validator-set}

Diese Operation ist ziemlich einfach. Um einen Prüferknoten aus dem Prüfer-Set zu entfernen, muss dieser Befehl für die Mehrheit der Prüferknoten ausgeführt werden.

````bash
polygon-edge ibft propose --grpc-address 127.0.0.1:10000 --addr 0x8B15464F8233F718c8605B16eBADA6fc09181fC2 --bls 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --vote drop
````

:::info Öffentlicher Schlüssel BLS
Der öffentliche BLS ist nur dann notwendig, wenn das Netzwerk mit dem BLS läuft, für das Netzwerk das nicht im BLS-`--bls`Modus läuft.
:::

Nachdem die Befehle ausgeführt werden, beachte bitte, dass die Anzahl der Prüfer gesunken ist (in diesem log von 4 auf

````bash
2021-12-15T19:20:51.014+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=2399 round=1
2021-12-15T19:20:51.014+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=4 votes=2
2021-12-15T19:20:51.015+0100 [INFO]  polygon.consensus.ibft.acceptState: we are the proposer: block=2399
2021-12-15T19:20:51.015+0100 [INFO]  polygon.consensus.ibft: picked out txns from pool: num=0 remaining=0
2021-12-15T19:20:51.015+0100 [INFO]  polygon.consensus.ibft: build block: number=2399 txns=0
2021-12-15T19:20:53.002+0100 [INFO]  polygon.consensus.ibft: state change: new=ValidateState
2021-12-15T19:20:53.009+0100 [INFO]  polygon.consensus.ibft: state change: new=CommitState
2021-12-15T19:20:53.009+0100 [INFO]  polygon.blockchain: write block: num=2399 parent=0x768b3bdf26cdc770525e0be549b1fddb3e389429e2d302cb52af1722f85f798c
2021-12-15T19:20:53.011+0100 [INFO]  polygon.blockchain: new block: number=2399 hash=0x6538286881d32dc7722dd9f64b71ec85693ee9576e8a2613987c4d0ab9d83590 txns=0 generation_time_in_sec=2
2021-12-15T19:20:53.011+0100 [INFO]  polygon.blockchain: new head: hash=0x6538286881d32dc7722dd9f64b71ec85693ee9576e8a2613987c4d0ab9d83590 number=2399
2021-12-15T19:20:53.011+0100 [INFO]  polygon.consensus.ibft: block committed: sequence=2399 hash=0x6538286881d32dc7722dd9f64b71ec85693ee9576e8a2613987c4d0ab9d83590 validators=4 rounds=1 committed=3
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft: state change: new=AcceptState
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=2400 round=1
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=3 votes=0
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft: proposer calculated: proposer=0xea21efC826F4f3Cb5cFc0f986A4d69C095c2838b block=2400
````

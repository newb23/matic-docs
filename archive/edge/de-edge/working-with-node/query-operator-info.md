---
id: query-operator-info
title: Operator-Informationen abfragen
description: "Wie man Operator-Informationen abfragt."
keywords:
  - docs
  - polygon
  - edge
  - node
  - query
  - operator
---

## Voraussetzungen {#prerequisites}

Dieser Leitfaden setzt voraus, dass du den Leitfaden [Lokale Einrichtung](/docs/edge/get-started/set-up-ibft-locally) oder den [Leitfaden zum Einrichten eines IBFT-Clusters in der Cloud](/docs/edge/get-started/set-up-ibft-on-the-cloud) befolgt hast.

Ein funktionierender Knotenpunkt ist Voraussetzung für die Abfrage jeglicher Art von Operator-Informationen.

Mit dem Polygon Edge haben die Node-Operators die Kontrolle und sind darüber informiert, was der Knoten, den sie bedienen, gerade tut.<br />
Sie können jederzeit die auf gRPC aufbauende Knoteninformationsschicht nutzen und aussagekräftige Informationen abrufen - ohne die Protokolle zu durchforsten.

:::note

Wenn dein Knoten nicht auf `127.0.0.1:8545` läuft, solltest du ein Flag `--grpc-address <address:port>` zu den in diesem Dokument aufgeführten Befehlen hinzufügen.

:::

## Peer-Informationen {#peer-information}

### Peer-Liste {#peers-list}

Um eine vollständige Liste der verbundenen Peers zu erhalten (einschließlich des laufenden Knotens selbst), führe folgenden Befehl aus:
````bash
polygon-edge peers list
````

Dies gibt eine Liste der libp2p-Adressen zurück, die derzeit Peers des laufenden Clients sind.

### Peer-Status {#peer-status}

Um den Status eines bestimmten Peers zu erfahren, führe Folgendes aus:
````bash
polygon-edge peers status --peer-id <address>
````
Der *address*-Parameter ist die libp2p-Adresse des Peers.

## IBFT-Info {#ibft-info}

Es kommt häufig vor, dass ein Operator über den Zustand des Betriebsknotens im IBFT-Konsens Bescheid wissen möchte.

Zum Glück bietet Polygon Edge eine einfache Möglichkeit, diese Informationen zu finden.

### Snapshots {#snapshots}

Wenn du den folgenden Befehl ausführst, erhältst du den aktuellsten Snapshot.
````bash
polygon-edge ibft snapshot
````
Um den Snapshot auf einer bestimmten Höhe (Blocknummer) abzufragen, kann der Operator Folgendes ausführen:
````bash
polygon-edge ibft snapshot --num <block-number>
````

### Kandidaten {#candidates}

Um die neuesten Informationen über die Kandidaten zu erhalten, kann der Operator Folgendes ausführen:
````bash
polygon-edge ibft candidates
````
Dieser Befehl fragt die aktuelle Menge der vorgeschlagenen Kandidaten ab, sowie die Kandidaten, die noch nicht aufgenommen wurden

### Status {#status}

Der folgende Befehl gibt den aktuellen Validierungsschlüssel des laufenden IBFT-Clients zurück:
````bash
polygon-edge ibft status
````

## Transaktionspool {#transaction-pool}

Um die aktuelle Anzahl der Transaktionen im Transaktionspool zu ermitteln, kann der Operator Folgendes ausführen:
````bash
polygon-edge txpool status
````

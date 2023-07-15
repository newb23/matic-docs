---
id: syncer
title: Syncer
description: Erläuterung für das Syncermodul von Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - synchronization
---

## Übersicht {#overview}

Dieses Modul enthält die Logik für das Synchronisationsprotokoll. Es wird verwendet, um einen neuen Knoten mit dem laufenden Netzwerk zu synchronisieren oder neue Blöcke für die Knoten zu validieren, die nicht am Konsens teilnehmen (non-validators).

Der Polygon Edge verwendet **libp2p** als Netzwerkebene und läuft darüber hinaus mit **gRPC**.

Es gibt im Wesentlichen 2 sync in Polygon Edge:
* Bulk Sync – synchronisieren eine große Reihe von Blöcken gleichzeitig
* Watch Sync – Sync auf einer per-block-Basis synchronisieren

### Bulk Sync {#bulk-sync}

Die Schritte für die Massensynchronisierung sind ziemlich einfach, um dem Ziel der Massensynchronisierung gerecht zu werden – so viele Blöcke wie möglich (verfügbar) vom anderen Peer zu synchronisieren, um schnellstmöglich aufzuschließen.

Der Ablauf Massensynchronisierung:

1. ** Feststellen, ob der Knoten Massensynchronisierung durchführen muss ** – In diesem Schritt überprüft der Knoten die Peer um zu sehen, ob es jemand gibt, der eine größere Blocknummer hat als das, was der Knoten lokal hat
2. ** Suche nach dem besten Peer (unter Verwendung der Sync-Peer-Map) ** – In diesem Schritt findet der Knoten den besten Peer für die Synchronisierung auf der Grundlage der im obigen Beispiel genannten Kriterien.
3. ** Öffnen eines Bulk-Sync-Streams ** – In diesem Schritt öffnet der Knoten einen gRPC-Stream für den besten Peer, um Blöcke aus der gemeinsamen Blocknummer zu synchronisieren
4. ** Der beste Peer schließt den Stream, wenn er alle Blöcke gesendet hat ** – In diesem Schritt schließt der beste Peer, mit dem der Knoten synchronisiert, den Stream, sobald er alle verfügbaren Blöcke gesendet hat.
5. ** Nach der Massensynchronisierung prüfen, ob der Knoten ein Validierer ist ** – In diesem Schritt wird der Stream vom besten Peer geschlossen, und der Knoten muss prüfen, ob er nach der Massensynchronisierung ein Validierer ist.
  * Wenn das der Fall ist, verlassen sie den Synchronisationszustand und beginnen, sich am Konsens zu beteiligen.
  * Ist das nicht der Fall, beobachten sie weiterhin die ** Synchronisierung **

### Watch Sync {#watch-sync}

:::info
Der Schritt für Watch Syncing wird nur ausgeführt, wenn der Knoten kein Validator ist, sondern ein normaler Nicht-Validator-Knoten im Netzwerk, der nur auf ankommende Blöcke wartet.
:::

Das Verhalten von Watch Sync ist ziemlich einfach, der Knoten ist bereits mit dem Rest des Netzwerks synchronisiert und muss nur neue Blöcke analysieren, die hereinkommen.

So funktioniert die Synchronisierung:

1. ** Hinzufügen eines neuen Blocks, wenn der Status eines Peers aktualisiert wird ** – In diesem Schritt warten die Knoten auf die neuen Block-Ereignisse. Wenn ein neuer Block vorliegt, wird ein gRPC-Funktionsaufruf ausgeführt, der Block abgerufen und der lokale Status aktualisiert.
2. ** Prüfen, ob der Knoten ein Validator ist, nachdem der letzte Block synchronisiert wurde **
   * Falls ja, den Sync State verlassen
   * Wenn es nicht so ist, weiter auf neue Blockevents warten

## Leistungsbericht {#perfomance-report}

:::info
Leistung wurde auf einer lokalen Maschine durch die Syncing von ** Millionen Blöcke ** gemessen.
:::

| Name | Ergebnis |
|----------------------|----------------|
| Syncing von 1M Blöcken | ~ 25 min |
| Transfer von 1M Blöcke | ~ 1 min |
| Anzahl der GRPC-Aufrufe | 2 |
| Testabdeckung | ~ 93 % |
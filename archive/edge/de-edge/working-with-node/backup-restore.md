---
id: backup-restore
title: Backup/Wiederherstellung der Knoteninstanz
description: "Wie du eine Polygon Edge-Knoteninstanz sicherst und wiederherstellst."
keywords:
  - docs
  - polygon
  - edge
  - instance
  - restore
  - directory
  - node
---

## Übersicht {#overview}

In diesem Leitfaden wird detailliert beschrieben, wie du eine Polygon Edge-Knoteninstanz sicherst und wiederherstellst.
Darin geht es um die Basisordner und ihre Inhalte sowie um die Dateien, die für eine erfolgreiche Sicherung und Wiederherstellung wichtig sind.

## Basisordner {#base-folders}

Polygon Edge nutzt LevelDB als Speicher-Engine.
Wenn du einen Polygon Edge-Knoten startest, werden die folgenden Unterordner im angegebenen Arbeitsverzeichnis erstellt:
* **blockchain** - speichert die Blockchain-Daten
* **trie** - speichert die Merkle-Tries (Weltzustandsdaten)
* **keystore** - speichert Private Keys für den Client. Dazu gehören der Private Key für libp2p und der des Sealers/Prüfers
* **consensus** - speichert alle Konsensinformationen, die der Client während der Arbeit benötigt. Er speichert zunächst den *Private Key des Prüfers* des Knotens

Es ist wichtig, dass diese Ordner erhalten bleiben, damit die Polygon Edge-Instanz reibungslos funktioniert.

## Backup von einem laufenden Knoten erstellen und für einen neuen Knoten wiederherstellen {#create-backup-from-a-running-node-and-restore-for-new-node}

Dieser Leitfaden führt dich durch die Erstellung von Archivdaten der Blockchain in einem laufenden Knoten und deren Wiederherstellung in einer anderen Instanz.

### Backup {#backup}

`backup` Befehl ruft Blöcke von einem laufenden Knotenpunkt per gRPC ab und erstellt eine Archivdatei. Wenn `--from` und `--to` im Befehl nicht angegeben werden, ruft dieser Befehl Blöcke von der ersten bis zur letzten Version ab.

```bash
$ polygon-edge backup --grpc-address 127.0.0.1:9632 --out backup.dat [--from 0x0] [--to 0x100]
```

### Wiederherstellen {#restore}

Ein Server importiert Blöcke aus einem Archiv am Anfang, wenn er mit dem `--restore`-Flag startet. Bitte vergewissere dich, dass es einen Key für den neuen Knoten gibt. Wenn du mehr über den Import oder die Erstellung von Keys erfahren möchtest, besuche den [Abschnitt Secret Managers](/docs/edge/configuration/secret-managers/set-up-aws-ssm).

```bash
$ polygon-edge server --restore archive.dat
```

## Sichern/Wiederherstellen ganzer Daten {#back-up-restore-whole-data}

Dieser Leitfaden führt dich durch die Datensicherung einschließlich der Statusdaten und des Keys und die Wiederherstellung in der neuen Instanz.

### Schritt 1: Beende den laufenden Client {#step-1-stop-the-running-client}

Da Polygon Edge **LevelDB** für die Datenspeicherung verwendet, muss der Knoten für die Dauer des Backups angehalten werden,
da **LevelDB** keinen gleichzeitigen Zugriff auf seine Datenbankdateien zulässt.

Außerdem führt Polygon Edge beim Schließen eine „Datenspülung“ (Data Flushing) durch.

Der erste Schritt besteht darin, den laufenden Client anzuhalten (entweder über einen Dienstmanager oder einen anderen Mechanismus, der ein SIGINT-Signal an den Prozess sendet),
damit er 2 Events auslösen kann, während er ordnungsgemäß heruntergefahren wird:
* Datenflush auf die Festplatte durchführen
* Freigabe der DB-Dateien durch LevelDB

### Schritt 2: Sichere das Verzeichnis {#step-2-backup-the-directory}

Da der Client nun nicht mehr ausgeführt wird, kann das Datenverzeichnis auf einem anderen Datenträger gesichert werden.
Denk daran, dass die Dateien mit der Erweiterung `.key` die Private Key-Daten enthalten, die dazu verwendet werden können, sich als der aktuelle Knoten auszugeben.
Diese Daten sollten niemals an Dritte weitergegeben werden.

:::info

Bitte sichere die generierte `genesis` Datei und stelle sie manuell wieder her, damit der wiederhergestellte Knoten voll funktionsfähig ist.

:::

## Wiederherstellen {#restore-1}

### Schritt 1: Beende den laufenden Client {#step-1-stop-the-running-client-1}

Wenn eine Instanz von Polygon Edge ausgeführt wird, muss sie gestoppt werden, damit Schritt 2 erfolgreich durchgeführt werden kann.

### Schritt 2: Kopiere das Verzeichnis der gesicherten Daten in den gewünschten Ordner {#step-2-copy-the-backed-up-data-directory-to-the-desired-folder}

Sobald der Client nicht mehr ausgeführt wird, kann das Datenverzeichnis, das zuvor gesichert wurde, in den gewünschten Ordner kopiert werden.
Stelle außerdem die zuvor kopierte `genesis` Datei wieder her.

### Schritt 3: Führe den Polygon Edge Client aus und gib dabei das richtige Datenverzeichnis an {#step-3-run-the-polygon-edge-client-while-specifying-the-correct-data-directory}

Damit Polygon Edge das wiederhergestellte Datenverzeichnis verwenden kann, muss der Benutzer beim Start den Pfad zum
Datenverzeichnis angeben. Informationen zum `data-dir`-Flag findest du im Abschnitt [CLI-Befehle](/docs/edge/get-started/cli-commands).

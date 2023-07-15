---
id: validator-hosting
title: Prüfer-Hosting
description: "Hosting-Anforderungen für Polygon Edge"
keywords:
- docs
- polygon
- edge
- hosting
- cloud
- setup
- validator
---

Im Folgenden findest du Vorschläge, wie du einen Prüfknoten in einem Polygon Edge-Netzwerk richtig hosten kannst. Bitte achte auf alle unten aufgeführten Punkte, um sicherzustellen,
dass dein Prüfer richtig konfiguriert ist, damit er sicher, stabil und leistungsfähig ist.

## Wissensbasis {#knowledge-base}

Bevor du versuchst, den Prüfknoten auszuführen, lies bitte dieses Dokument gründlich durch.   
Weitere Dokumente, die hilfreich sein könnten, sind:

- [Installation](get-started/installation)
- [Cloud-Einrichtung](get-started/set-up-ibft-on-the-cloud)
- [CLI-Befehle](get-started/cli-commands)
- [Server-Konfigurationsdatei](configuration/sample-config)
- [Private Schlüssel](configuration/manage-private-keys)
- [Prometheus-Metriken](configuration/prometheus-metrics)
- [Secret Managers](/docs/category/secret-managers)
- [Backup/Wiederherstellung](working-with-node/backup-restore)

## Mindest-Systemanforderungen {#minimum-system-requirements}

| Art | Wert | Beeinflusst von |
|------|------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|
| CPU | 2 Kerne | <ul><li>Anzahl der JSON-RPC-Abfragen</li><li>Größe des Blockchain-Zustands</li><li>Blockgaslimit</li><li>Blockzeit</li></ul> |
| RAM | 2 GB | <ul><li>Anzahl der JSON-RPC-Abfragen</li><li>Größe des Blockchain-Zustands</li><li>Blockgaslimit</li></ul> |
| Festplatte | <ul><li>10 GB Root-Partition</li><li>30 GB Root-Partition mit LVM für die Festplattenerweiterung</li></ul> | <ul><li>Größe des Blockchain-Zustands</li></ul> |


## Service-Konfiguration {#service-configuration}

`polygon-edge` Binärdatei muss bei bestehender Netzwerkverbindung automatisch als Systemdienst ausgeführt werden und über Start-, Stopp- und Neustart-
Funktionen verfügen. Wir empfehlen, einen Service Manager wie `systemd.` zu verwenden

Beispiel `systemd` Systemkonfigurationsdatei:
```
[Unit]
Description=Polygon Edge Server
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=10
User=ubuntu
ExecStart=/usr/local/bin/polygon-edge server --config /home/ubuntu/polygon/config.yaml

[Install]
WantedBy=multi-user.target
```

### Binärdatei {#binary}

In der Produktion sollten `polygon-edge` Binärdateien nur aus vorgefertigten GitHub-Version-Binärdateien bereitgestellt werden - nicht durch manuelles Kompilieren.
:::info

Wenn du den `develop` GitHub-Branch manuell kompilierst, kann es sein, dass du Änderungen an deiner    Umgebung vornimmst.
Aus diesem Grund wird empfohlen, die Polygon Edge-Binärdateien ausschließlich aus den Releases einzusetzen, da sie Informationen über
Änderungen und deren Behebung enthalten.

:::

Unter [Installation](/docs/edge/get-started/installation) findest du einen vollständigen Überblick über die Installationsmethode.

### Datenspeicherung {#data-storage}

Der `data/` Ordner, der den gesamten Blockchain-Zustand enthält, sollte auf einer dedizierten Festplatte/einem Volume gemountet werden, um
automatische Festplatten-Backups, Volume-Erweiterungen und optional das Mounten der Festplatte/des Volumes in einer anderen Instanz im Falle eines Ausfalls zu ermöglichen.


### Protokolldateien {#log-files}

Die Protokolldateien müssen täglich rotiert werden (mit einem Tool wie `logrotate`).
:::warning

Wenn die Konfiguration ohne Protokollrotation erfolgt, können die Protokolldateien den gesamten verfügbaren Speicherplatz belegen, was die Betriebszeit des Prüfers beeinträchtigen kann.

:::

Beispiel `logrotate` Konfiguration:
```
/home/ubuntu/polygon/logs/node.log
{
        rotate 7
        daily
        missingok
        notifempty
        compress
        prerotate
                /usr/bin/systemctl stop polygon-edge.service
        endscript
        postrotate
                /usr/bin/systemctl start polygon-edge.service
        endscript
}
```


Im Abschnitt [Protokollierung](#logging) findest du unten Empfehlungen zur Protokollspeicherung.

### Zusätzliche Abhängigkeiten {#additional-dependencies}

`polygon-edge` ist statisch kompiliert und benötigt keine zusätzlichen Abhängigkeiten vom Host-Betriebssystem.

## Wartung {#maintenance}

Im Folgenden findest du die besten Methoden, um einen laufenden Prüfknoten eines Polygon Edge-Netzwerks zu warten.

### Backup {#backup}

Es gibt zwei Arten von Sicherungsverfahren, die für Polygon Edge-Knoten empfohlen werden.

Wenn möglich, solltest du beide verwenden, wobei das Polygon Edge-Backup immer verfügbar sein sollte.

* ***Volume-Backup***:    
  Tägliches inkrementelles Backup des `data/` Volumes des Polygon Edge-Knotens oder der kompletten VM, wenn möglich.


* ***Polygon Edge-Backup***:    
  Es wird ein täglicher CRON-Auftrag empfohlen, der regelmäßige Backups von Polygon Edge durchführt und die `.dat` Dateien an einen externen Speicherort oder in einen sicheren Cloud-Objektspeicher verschiebt.

Das Polygon Edge-Backup sollte sich idealerweise nicht mit dem oben beschriebenen Volume Backup überschneiden.

Unter [Backup/Wiederherstellung der Knoteninstanz](working-with-node/backup-restore) findest du Anweisungen, wie du Backups von Polygon Edge durchführst.

### Protokollierung {#logging}

Die Protokolle, die von den Polygon Edge-Knoten ausgegeben werden, sollten:
- an einen externen Datenspeicher mit Indizierungs- und Suchfunktionen gesendet werden
- eine Aufbewahrungsfrist für Protokolle von 30 Tagen haben

Wenn du zum ersten Mal einen Polygon Edge Prüfer einrichtest, empfehlen wir dir, den Knoten
mit der Option `--log-level=DEBUG` zu starten, damit du eventuell auftretende Probleme schnell beheben kannst.

:::info

Die Option `--log-level=DEBUG` sorgt dafür, dass das Protokoll des Knotens so ausführlich wie möglich ist.   
Debug-Protokolle erhöhen die Größe der Protokolldatei erheblich, was bei der Einrichtung einer
Protokollrotationslösung berücksichtigt werden muss.

:::
### OS Sicherheits-Patches {#os-security-patches}

Administratoren müssen sicherstellen, dass das Betriebssystem der Prüferinstanz mindestens einmal im Monat mit den neuesten Patches aktualisiert wird.

## Metriken {#metrics}

### Systemmetriken {#system-metrics}

Administratoren müssen eine Art Systemmetrik-Monitor einrichten (z. B. Telegraf + InfluxDB + Grafana oder eine SaaS-Lösung eines Drittanbieters).

Metriken, die überwacht und für die Alarmbenachrichtigungen eingerichtet werden müssen:

| Metrik Name | Alarmschwelle |
|-----------------------|-------------------------------|
| CPU-Nutzung (%) | > 90 % für mehr als 5 Minuten |
| RAM-Nutzung (%) | > 90 % für mehr als 5 Minuten |
| Nutzung der Root-Disk | > 90 % |
| Datenträgernutzung | > 90 % |

### Prüfer-Metriken {#validator-metrics}

Administratoren müssen die Sammlung von Metriken über die Prometheus API von Polygon Edge einrichten,
um die Leistung der Blockchain überwachen zu können.

Unter [Prometheus-Metriken](configuration/prometheus-metrics) erfährst du, welche Metriken veröffentlicht werden und wie du die Erfassung von Prometheus-Metriken einrichtest.


Den folgenden Metriken muss besondere Aufmerksamkeit gewidmet werden:
- ***Blockproduktionszeit*** - wenn die Blockproduktionszeit höher als normal ist, liegt möglicherweise ein Problem mit dem Netzwerk vor.
- ***Anzahl der Konsensrunden*** - wenn es mehr als eine Runde gibt, gibt es möglicherweise ein Problem mit dem Prüfer im Netzwerk.
- ***Anzahl der Peers*** - wenn die Anzahl der Peers sinkt, gibt es ein Verbindungsproblem im Netzwerk.

## Sicherheit {#security}

Im Folgenden findest du die besten Methoden zur Sicherung eines laufenden Prüfknotens eines Polygon Edge-Netzwerks.

### API-Services {#api-services}

- ***JSON-RPC*** -
Der einzige API-Service, der der Öffentlichkeit zugänglich gemacht werden muss (über Load Balancer oder direkt).   
Diese API sollte auf allen Schnittstellen oder auf einer bestimmten IP-Adresse ausgeführt werden (Beispiel: `--json-rpc 0.0.0.0:8545` oder `--json-prc 192.168.1.1:8545`).
:::info
Da es sich um eine öffentlich zugängliche API handelt, wird empfohlen, ihr einen Load Balancer/Reverse Proxy vorzuschalten, um Sicherheit und Ratenbegrenzung zu gewährleisten.
:::


- ***LibP2P*** -
Dies ist die Netzwerk-API, die von den Knoten für die Peer-Kommunikation verwendet wird. Sie muss auf allen Schnittstellen oder auf einer bestimmten IP-Adresse ausgeführt werden
(`--libp2p 0.0.0.0:1478` oder `--libp2p 192.168.1.1:1478`). Diese API sollte zwar nicht öffentlich zugänglich sein,
aber sie sollte von allen anderen Knoten erreichbar sein.
:::info

Wenn sie auf localhost (`--libp2p 127.0.0.1:1478`) ausgeführt wird, können andere Knoten keine Verbindung herstellen.

:::


- ***GRPC*** -
Diese API wird nur zum Ausführen von Bediener-Befehlen verwendet und für nichts anderes. Als solches sollte sie ausschließlich auf localhost ausgeführt werden (`--grpc-address 127.0.0.1:9632`).

### Polygon Edge-Geheimnisse {#polygon-edge-secrets}

Die Polygon Edge-Geheimnisse (`ibft` und `libp2p` Keys) sollten nicht in einem lokalen Dateisystem gespeichert werden.  
Stattdessen sollte ein unterstützter [Secret Manager](configuration/secret-managers/set-up-aws-ssm) verwendet werden.
   Das Speichern von Geheimnissen im lokalen Dateisystem sollte nur in Nicht-Produktionsumgebungen verwendet werden.

## Update {#update}

Im Folgenden wird das gewünschte Aktualisierungsverfahren für Prüfknoten als Schritt-für-Schritt-Anleitung beschrieben.

### Update-Verfahren {#update-procedure}

- Lade die neueste Polygon Edge-Binärdatei aus den offiziellen GitHub [Releases](https://github.com/0xPolygon/polygon-edge/releases) herunter
- Beende den Polygon Edge-Service (Beispiel: `sudo systemctl stop polygon-edge.service`)
- Ersetze die vorhandene `polygon-edge` Binärdatei durch die heruntergeladene (Beispiel: `sudo mv polygon-edge /usr/local/bin/`)
- Überprüfe, ob die richtige `polygon-edge` Version vorhanden ist, indem du `polygon-edge version` ausführst - sie sollte der Release-Version entsprechen
- Prüfe in der Versions-Dokumentation, ob vor dem Start des `polygon-edge` Services Schritte zur Rückwärtskompatibilität unternommen werden müssen
- Starte `polygon-edge` Service (Beispiel: `sudo systemctl start polygon-edge.service`)
- Überprüfe schließlich die `polygon-edge` Protokollausgabe und stelle sicher, dass alles ohne `[ERROR]` Protokolle funktioniert

:::warning

Wenn es eine neue Version (Release) gibt, muss dieser Aktualisierungsvorgang auf allen Knoten durchgeführt werden,
da die aktuell laufende Binärdatei nicht mit der neuen Version kompatibel ist.

Das bedeutet, dass die Chain für eine kurze Zeit angehalten werden muss (bis die `polygon-edge` Binärdateien ersetzt und der Service neu gestartet wurde),
plane also entsprechend.

Du kannst Tools wie **[Ansible](https://www.ansible.com/)** oder ein eigenes Skript verwenden, um die Aktualisierung effizient durchzuführen
und die Ausfallzeit der Chain zu minimieren.

:::

## Startverfahren {#startup-procedure}

Im Folgenden ist der gewünschte Ablauf des Startvorgangs für den Polygon Edge-Prüfer dargestellt.

- Lies dir die Dokumente durch, die im Abschnitt [Wissensbasis](#knowledge-base) aufgeführt sind.
- Wende die neuesten Betriebssystem-Patches auf dem Prüfknoten an.
- Lade die neueste `polygon-edge` Binärdatei aus den offiziellen GitHub [Releases](https://github.com/0xPolygon/polygon-edge/releases) herunter und platziere sie in der lokalen Instanz `PATH`.
- Initialisiere einen der unterstützten [Secret Manager](/docs/category/secret-managers) mit dem `polygon-edge secrets generate` CLI-Befehl.
- Erstelle und speichere Geheimnisse mit dem `polygon-edge secrets init`[CLI-Befehl](/docs/edge/get-started/cli-commands#secrets-init-flags).
- Beachte die `NodeID` und `Public key (address)`-Werte.
- Erstelle eine `genesis.json`-Datei wie unter [Cloud-Einrichtung](get-started/set-up-ibft-on-the-cloud#step-3-generate-the-genesis-file-with-the-4-nodes-as-validators) beschrieben mit `polygon-edge genesis` [CLI-Befehl](/docs/edge/get-started/cli-commands#genesis-flags).
- Erstelle die Standardkonfigurationsdatei mit dem `polygon-edge server export` [CLI-Befehl](/docs/edge/configuration/sample-config).
- Bearbeite die `default-config.yaml` Datei, um sie an die lokale Umgebung des Prüfknotens anzupassen (Dateipfade usw.).
- Erstelle einen Polygon Edge-Service (`systemd` oder ähnlich), dessen `polygon-edge` Binärdatei den Server von einer `default-config.yaml` Datei aus ausführen wird.
- Starte den Polygon Edge-Server, indem du den Service startest (Beispiel: `systemctl start polygon-edge`).
- Überprüfe die `polygon-edge` Protokollausgabe und stelle sicher, dass die Blöcke generiert werden und dass keine `[ERROR]` Protokolle vorhanden sind.
- Überprüfe die Funktion der Chain durch den Aufruf einer JSON-RPC-Methode wie [`eth_chainId`](/docs/edge/api/json-rpc-eth#eth_chainid).

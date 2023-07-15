---
id: set-up-gcp-secrets-manager
title: Einrichtung des GCP Secrets Managers
description: "Einrichtung von GCP Secrets Manager für Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - gcp
  - secrets
  - manager
---

## Übersicht {#overview}

Derzeit ist der Polygon Edge damit beschäftigt, 2 wichtige Laufzeitgeheimnisse zu bewahren:
* Der vom Knoten benutzte **Validator Private Key**, wenn der Knoten ein Validator ist
* Der **Networking Private Key** verwendet von libp2p, für die Teilnahme und die Kommunikation mit anderen Peers

Für weitere Informationen siehe Leitfaden zur [Verwaltung von Private Keys](/docs/edge/configuration/manage-private-keys)

Die Module des Polygon Edge **sollten nicht wissen müssen, wie Geheimhaltung funktioniert**. Letztlich sollte sich ein Modul nicht kümmern, wenn ein Geheimnis auf einem fernen Server oder lokal auf der Festplatte des Knoten gespeichert wird.

Alles, was ein Modul über Geheimhaltung wissen muss, ist, **das Geheimnis zu verwenden**, **zu wissen, welche Geheimnisse beizubehalten oder zu speichern sind**. Die feineren Implementierungsdetails dieser Operationen werden zu `SecretsManager`delegiert, was natürlich eine Abstraktion ist.

Der Knotenbetreiber, der den Polygon Edge startet, kann jetzt angeben, welche Secrets Manager sie verwenden möchten, da der richtige Secrets Manager instantiiert wird, behandeln die Module die Geheimnisse über die erwähnte Schnittstelle ohne sich zu kümmern, ob die Geheimnisse auf einer Festplatte oder auf einem Server gespeichert werden.

Dieser Artikel beschreibt die notwendigen Schritte, um den Polygon Edge mit dem [GCP Secret Manager](https://cloud.google.com/secret-manager) in Betrieb zu nehmen.

:::info Vorherige Anleitungen
Es wird **dringend empfohlen**, ehe Sie diesen Artikel durchgehen, Artikel auf [**Local Setup**](/docs/edge/get-started/set-up-ibft-locally), sowie [**Cloud Setup**](/docs/edge/get-started/set-up-ibft-on-the-cloud) zu lesen.
:::


## Voraussetzungen {#prerequisites}
### GCP-Rechnungskonto {#gcp-billing-account}
Um den GCP Secrets Manager nutzen zu können, muss der Benutzer das [Rechnungskonto](https://console.cloud.google.com/) im GCP-Portal aktiviert haben.
Neue Google-Konten auf der GCP-Plattform werden mit einigen Geldern ausgestattet, um den Start zu erleichtern, sozusagen als kostenlose Probe.
Mehr Informationen [unter GCP Doks](https://cloud.google.com/free)

### Secrets Manager API {#secrets-manager-api}
Der Benutzer muss die GCP Secrets Manager API aktivieren, bevor er sie nutzen kann.
Dies kann über [das Secrets Manager API Portal](https://console.cloud.google.com/apis/library/secretmanager.googleapis.com) erfolgen.
Weitere Informationen: [Konfigurieren von Secret Manger](https://cloud.google.com/secret-manager/docs/configuring-secret-manager)

### GCP Anmeldeinformationen {#gcp-credentials}
Der Benutzer muss schließlich neue Anmeldedaten erstellen, die für die Authentifizierung verwendet werden.
Gehen Sie dazu anhand der Anweisungen, die [hier](https://cloud.google.com/secret-manager/docs/reference/libraries) veröffentlicht wurden, vor   
Die erzeugte json-Datei mit den Anmeldeinformationen sollte an jeden Knoten, der den GCP Secrets Manager nutzen muss, übertragen werden.

Erforderliche Informationen, ehe Sie fortfahren:
* **Projekt ID** (die auf der GCP-Plattform angegebene Projekt-ID)
* **Speicherort der Anmeldedatei** (der Pfad zur json-Datei, die die Anmeldedaten enthält)

## Schritt 1 - Generieren der Secrets Manager Konfiguration {#step-1-generate-the-secrets-manager-configuration}

Damit der Polygon Edge nahtlos mit dem GCP SM kommunizieren kann, muss er eine bereits erstellte Konfigurationsdatei parsen, die alle
notwendigen Informationen für die geheime Speicherung auf dem GCP SM enthält.

Um die Konfiguration zu generieren, führe den folgenden Befehl aus:

```bash
polygon-edge secrets generate --type gcp-ssm --dir <PATH> --name <NODE_NAME> --extra project-id=<PROJECT_ID>,gcp-ssm-cred=<GCP_CREDS_FILE>
```

Vorhandene Parameter:
* `PATH`ist der Pfad, in den die Konfigurationsdatei exportiert werden sollte. Standard`./secretsManagerConfig.json`
* `NODE_NAME` ist der Name des aktuellen Knotens, für den die GCP SM-Konfiguration eingerichtet werden soll. Es kann ein beliebiger Wert sein. Standard`polygon-edge-node`
* `PROJECT_ID` ist die Projekt-ID, die der Benutzer bei der Einrichtung des Kontos und der Aktivierung der Secrets Manager API in der GCP-Konsole definiert hat.
* `GCP_CREDS_FILE` ist der Pfad zu der json-Datei mit den Anmeldeinformationen, die den Lese- und Schreibzugriff auf den Secrets Manager ermöglichen.

:::caution Knoten-Namen
Vorsicht bei der Angabe von Knoten-Namen.

Der Polygon Edge verwendet den angegebenen Knotennamen, um die Geheimnisse zu verfolgen, die er generiert, und die er auf dem GCP SM verwendet. Wenn Sie einen bestehenden Knotennamen angeben, kann das dazu führen, dass das secret nicht an den GCP SM geschrieben wird.

Secrets werden auf dem folgenden Basispfad `projects/PROJECT_ID/NODE_NAME`gespeichert:
:::

## Schritt 2 - Initialisieren der Geheimschlüssel mit der Konfiguration {#step-2-initialize-secret-keys-using-the-configuration}

Nun, da die Konfigurationsdatei vorhanden ist, können wir die erforderlichen Geheimschlüssel mit der Konfiguration initialisieren Datei eingerichtet in Schritt 1, mit der:`--config`

```bash
polygon-edge secrets init --config <PATH>
```

Der `PATH`Parameter ist der Ort des zuvor generierten Secrets Manager Parameters aus Schritt 1.

## Schritt 3 - Genesis-Datei erzeugen {#step-3-generate-the-genesis-file}

Die Genesis-Datei sollte in einer ähnlichen Weise wie die [**Lokale Einrichtung**](/docs/edge/get-started/set-up-ibft-locally) und die Anleitungen für die [**Cloud Einrichtungen**](/docs/edge/get-started/set-up-ibft-on-the-cloud) erzeugt werden, aber mit geringfügigen Änderungen.

Da GCP SM anstelle des lokalen Dateisystems verwendet wird, sollten Prüfer-Adressen über die `--ibft-validator`Flagge hinzugefügt werden:
```bash
polygon-edge genesis --ibft-validator <VALIDATOR_ADDRESS> ...
```

## Schritt 4 - Starten des Polygon Edge Clients {#step-4-start-the-polygon-edge-client}

Nun, da die Schlüssel eingerichtet sind und die Genesis-Datei generiert wird, würde der letzte Schritt zu diesem Prozess Polygon Edge mit dem `server`Befehl sein.

Der `server`Befehl wird in der gleichen Weise wie in den zuvor genannten Anleitungen eingesetzt, mit einem kleinen Zusatz – der `--secrets-config`Flagge:
```bash
polygon-edge server --secrets-config <PATH> ...
```

Der `PATH`Param ist der Ort des zuvor generierten Secrets Manager Param aus Schritt 1.
---
id: set-up-hashicorp-vault
title: Einrichtung von Hashicorp Vault
description: "Hashicorp Vault für Polygon Edge einrichten."
keywords:
  - docs
  - polygon
  - edge
  - hashicorp
  - vault
  - secrets
  - manager
---

## Übersicht {#overview}

Derzeit ist der Polygon Edge damit beschäftigt, 2 wichtige Laufzeitgeheimnisse zu bewahren:
* Der vom Knoten benutzte **Validator Private Key**, wenn der Knoten ein Validator ist
* Der **Networking Private Key** verwendet von libp2p, für die Teilnahme und die Kommunikation mit anderen Peers

:::warning

Der Private Key der Prüfer ist für jeden Prüferknoten einmalig. Der gleiche Key darf <b>nicht</b> für alle Validatoren verwendet werden, da dies die Sicherheit ihrer Chain gefährden könnte.

:::

Für weitere Informationen siehe [Leitfaden zur Verwaltung von Private Keys](/docs/edge/configuration/manage-private-keys)

Die Module des Polygon Edge **sollten nicht wissen müssen, wie Geheimhaltung funktioniert**. Letztlich sollte sich ein Modul nicht kümmern, wenn ein Geheimnis auf einem fernen Server oder lokal auf der Festplatte des Knoten gespeichert wird.

Alles, was ein Modul über Geheimhaltung wissen muss, ist, **das Geheimnis zu verwenden**, **zu wissen, welche Geheimnisse beizubehalten oder zu speichern sind**. Die feineren Implementierungsdetails dieser Operationen werden zu `SecretsManager`delegiert, was natürlich eine Abstraktion ist.

Der Knotenbetreiber, der den Polygon Edge startet, kann jetzt angeben, welche Secrets Manager sie verwenden möchten, da der richtige Secrets Manager instantiiert wird, behandeln die Module die Geheimnisse über die erwähnte Schnittstelle ohne sich zu kümmern, ob die Geheimnisse auf einer Festplatte oder auf einem Server gespeichert werden.

Dieser Artikel beschreibt die notwendigen Schritte, um den Polygon Edge mit dem [Hashicorp Vault](https://www.vaultproject.io/) Server in Betrieb zu nehmen.

:::info Vorherige Anleitungen
Es wird **dringend empfohlen**, ehe Sie diesen Artikel durchgehen, Artikel auf [**Local Setup**](/docs/edge/get-started/set-up-ibft-locally), sowie [**Cloud Setup**](/docs/edge/get-started/set-up-ibft-on-the-cloud) zu lesen.
:::


## Voraussetzungen {#prerequisites}

Dieser Artikel geht davon aus, dass bereits eine funktionierende Instanz des Hashicorp Vault Servers **eingerichtet ist**.

Außerdem muss der Hashicorp Vault Server, der für den Polygon Edge verwendet wird, über **aktivierten KV-Speicher** verfügen.

Erforderliche Informationen, ehe Sie fortfahren:
* **Die Server-URL** (die API-URL des Hashicorp Vault-Servers)
* **Token** (Zugriffstoken, der für den Zugriff auf die KV-Speicher-Engine verwendet wird)

## Schritt 1 - Generieren Sie die secrets Manager Konfiguration {#step-1-generate-the-secrets-manager-configuration}

Damit der Polygon Edge nahtlos mit dem Vault-Server kommunizieren kann, muss er eine bereits erstellte Konfigurationsdatei parsen, die alle
notwendigen Informationen für die Speicherung von Geheimnissen im Vault enthält.

Um die Konfiguration zu generieren, führen Sie den folgenden Befehl aus:

```bash
polygon-edge secrets generate --dir <PATH> --token <TOKEN> --server-url <SERVER_URL> --name <NODE_NAME>
```

Vorhandene Parameter:
* `PATH`ist der Pfad, in den die Konfigurationsdatei exportiert werden sollte. Standard`./secretsManagerConfig.json`
* `TOKEN` ist das Zugangs-Token, das im Abschnitt [Voraussetzungen](/docs/edge/configuration/secret-managers/set-up-hashicorp-vault#prerequisites) erwähnt wird
* `SERVER_URL` ist die API-URL für den Vault-Server, die auch im Abschnitt [Voraussetzungen](/docs/edge/configuration/secret-managers/set-up-hashicorp-vault#prerequisites) erwähnt wird
* `NODE_NAME` ist der Name des aktuellen Knotens, für den die Vault-Konfiguration eingerichtet werden soll. Es kann ein beliebiger Wert sein. Standard`polygon-edge-node`

:::caution Knoten-Namen
Vorsicht bei der Angabe von Knoten-Namen.

Polygon Edge verwendet den angegebenen Knotennamen, um die Geheimnisse zu verfolgen, die er erzeugt und auf der Vault-Instanz verwendet. Die Angabe eines bestehenden Knotennamens kann dazu führen, dass Daten auf dem Vault-Server überschrieben werden.

Secrets werden auf dem folgenden Basispfad `secrets/node_name`gespeichert:
:::

## Schritt 2 - Initialisieren der Geheimschlüssel mit der Konfiguration {#step-2-initialize-secret-keys-using-the-configuration}

Nun, da die Konfigurationsdatei vorhanden ist, können wir die erforderlichen Geheimschlüssel mit der Konfiguration initialisieren Datei eingerichtet in Schritt 1, mit der:`--config`

```bash
polygon-edge secrets init --config <PATH>
```

Der `PATH`Parameter ist der Ort des zuvor generierten Secrets Manager Parameters aus Schritt 1.

## Schritt 3 - Genesis-Datei erzeugen {#step-3-generate-the-genesis-file}

Die Genesis-Datei sollte in einer ähnlichen Weise wie die [**Lokale Einrichtung**](/docs/edge/get-started/set-up-ibft-locally) und die Anleitungen für die [**Cloud Einrichtung**](/docs/edge/get-started/set-up-ibft-on-the-cloud) erzeugt werden, aber mit geringfügigen Änderungen.

Da Hashicorp Vault anstelle des lokalen Dateisystems verwendet wird, sollten Prüfer-Adressen über die `--ibft-validator`Flagge hinzugefügt werden:
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
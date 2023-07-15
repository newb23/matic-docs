---
id: set-up-aws-ssm
title: Richte AWS SSM (Systems Manager) ein
description: "Richte AWS SSM (Systems Manager) für Polygon Edge ein."
keywords:
  - docs
  - polygon
  - edge
  - aws
  - ssm
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

Dieser Artikel beschreibt die notwendigen Schritte, um Polygon Edge mit dem [AWS Systems Manager Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html) in Betrieb zu nehmen.

:::info Bisherige Anleitungen
Es wird **dringend empfohlen**, ehe Sie diesen Artikel durchgehen, Artikel auf [**Local Setup**](/docs/edge/get-started/set-up-ibft-locally), sowie [**Cloud Setup**](/docs/edge/get-started/set-up-ibft-on-the-cloud) zu lesen.
:::


## Voraussetzungen {#prerequisites}
### IAM Richtlinie {#iam-policy}
Der Benutzer muss eine IAM-Richtlinie erstellen, die Lese- und Schreibvorgänge für den AWS Systems Manager Parameter Store zulässt. Nachdem die IAM-Richtlinie erfolgreich erstellt wurde, muss der Benutzer sie an die EC2-Instanz anhängen, auf der der Polygon Edge-Server läuft. Die IAM-Richtlinie sollte etwa so aussehen:
```json
{
  "Version": "2012-10-17",
  "Statement" : [
    {
      "Effect" : "Allow",
      "Action" : [
        "ssm:PutParameter",
        "ssm:DeleteParameter",
        "ssm:GetParameter"
      ],
      "Resource" : [
        "arn:aws:ssm:<aws_region>:<aws_account_id>:parameter<ssm-parameter-path>*"
      ]
    }
  ]
}
```
Weitere Informationen zu AWS SSM IAM Rollen unter[AWS Docs](https://docs.aws.amazon.com/systems-manager/latest/userguide/setup-instance-profile.html).

Erforderliche Informationen ehe Sie fortfahren:
* **Region** (die Region, in der sich Systems Manager und Knoten befinden)
* **Parameterpfad** (beliebiger Pfad, in dem das Geheimnis platziert wird, zum Beispiel`/polygon-edge/nodes`)

## Schritt 1 - Generiere die Secrets Manager Konfiguration {#step-1-generate-the-secrets-manager-configuration}

Damit der Polygon Edge nahtlos mit dem AWS SSM kommunizieren kann, muss er eine bereits generierte config Datei analysieren, die alle notwendigen Informationen für die geheime Speicherung auf AWS SSM enthält.

Um die Konfiguration zu generieren, führen Sie den folgenden Befehl aus:

```bash
polygon-edge secrets generate --type aws-ssm --dir <PATH> --name <NODE_NAME> --extra region=<REGION>,ssm-parameter-path=<SSM_PARAM_PATH>
```

Vorhandene Parameter:
* `PATH`ist der Pfad, in den die Konfigurationsdatei exportiert werden sollte. Standard`./secretsManagerConfig.json`
* `NODE_NAME`ist der Name des aktuellen Knotens, für den die AWS SSM Konfiguration eingerichtet wird. Es kann ein beliebiger Wert sein. Standard`polygon-edge-node`
* `REGION`ist die Region, in der sich der AWS SSM befindet. Dies muss die gleiche Region sein wie der Knoten mit AWS SSM.
* `SSM_PARAM_PATH`ist der Name des Pfads, in dem das Geheimnis gespeichert wird. Zum Beispiel, wenn u`--name node1``ssm-parameter-path=/polygon-edge/nodes`nd werden angegeben, wird das Geheimnis als`/polygon-edge/nodes/node1/<secret_name>` gespeichert

:::caution Knoten-Namen
Vorsicht bei der Angabe von Knoten-Namen.

Der Polygon Edge verwendet den angegebenen Knotennamen, um die Geheimnisse zu verfolgen, die er generiert, und die er auf dem AWS SSM verwendet. Die Angabe eines vorhandenen Knotennamens kann dazu führen, dass das Geheimnis nicht in AWS SSM geschrieben werden kann.

Secrets werden auf dem folgenden Basispfad `SSM_PARAM_PATH/NODE_NAME`gespeichert:
:::

## Schritt 2 - Initialisieren der Geheimschlüssel mit der Konfiguration {#step-2-initialize-secret-keys-using-the-configuration}

Nun, da die Konfigurationsdatei vorhanden ist, können wir die erforderlichen Geheimschlüssel mit der Konfiguration initialisieren Datei eingerichtet in Schritt 1, mit der:`--config`

```bash
polygon-edge secrets init --config <PATH>
```

Der `PATH`Param ist der Ort des zuvor generierten Secrets Manager Param aus Schritt 1.

:::info IAM-Richtlinie
Dieser Schritt schlägt fehl, wenn die IAM-Richtlinie, die Lese-/Schreibvorgänge zulässt, nicht korrekt konfiguriert und/oder nicht mit der EC2-Instanz verbunden ist, die diesen Befehl ausführt.
:::

## Schritt 3 - Genesis-Datei erzeugen {#step-3-generate-the-genesis-file}

Die Genesis-Datei sollte in einer ähnlichen Weise wie die [**Lokale Einrichtung**](/docs/edge/get-started/set-up-ibft-locally) und die Anleitungen für die [**Cloud-Einrichtung**](/docs/edge/get-started/set-up-ibft-on-the-cloud) erzeugt werden, aber mit geringfügigen Änderungen.

Da AWS SSM anstelle des lokalen Dateisystems verwendet wird, sollten Validator Adressen über die `--ibft-validator`Flag hinzugefügt werden:
```bash
polygon-edge genesis --ibft-validator <VALIDATOR_ADDRESS> ...
```

## Schritt 4 - Starte den Polygon Edge Client {#step-4-start-the-polygon-edge-client}

Nun, da die Schlüssel eingerichtet sind und die Genesis-Datei generiert wird, würde der letzte Schritt zu diesem Prozess Polygon Edge mit dem `server`Befehl sein.

Der `server`Befehl wird in der gleichen Weise wie in den zuvor genannten Anleitungen eingesetzt, mit einem kleinen Zusatz – der `--secrets-config`Flagge:
```bash
polygon-edge server --secrets-config <PATH> ...
```

Der `PATH`Param ist der Ort des zuvor generierten Secrets Manager Param aus Schritt 1.
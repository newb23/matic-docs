---
id: manage-private-keys
title: Private Keys verwalten
description: "Wie man Private Keys verwaltet und welche Arten von Keys es gibt."
keywords:
  - docs
  - polygon
  - edge
  - private
  - key
  - keystore
---

## Übersicht {#overview}

Der Polygon Edge hat zwei Arten von private Keys, die direkt verwaltet werden:

* **Private Key, der für den Konsensmechanismus verwendet wird**
* **Private Key für die Vernetzung von libp2p**
* **(Optional) BLS Private Key, der für den Konsensmechanismus verwendet wird, um die Signaturen der Prüfer zusammenzufassen**

Derzeit bietet der Polygon Edge keine Unterstützung für die direkte Kontoführung.

Basierend auf der im [Leitfaden Backup & Restore](/docs/edge/working-with-node/backup-restore) beschriebenen Verzeichnisstruktur speichert der Polygon Edge
die erwähnten Schlüsseldateien in zwei verschiedenen Verzeichnissen – **Konsens** und **Keystore**.

## Key-Format {#key-format}

Die Private Keys werden im einfachen **Base64-Format** gespeichert, damit sie für Menschen lesbar und übertragbar sind.

```bash
# Example private key
0802122068a1bdb1c8af5333e58fe586bc0e9fc7aff882da82affb678aef5d9a2b9100c0
```

:::info Schlüsseltyp

Alle Private Key-Dateien, die innerhalb von Polygon Edge erzeugt und verwendet werden, basieren auf ECDSA mit der Kurve [secp256k1](https://en.bitcoin.it/wiki/Secp256k1).

Da die Kurve nicht standardisiert ist, kann sie nicht in einem standardisierten PEM-Format kodiert und gespeichert werden.
Der Import von Keys, die nicht mit diesem Key-Typ übereinstimmen, wird nicht unterstützt.

:::
## Konsens Private Key {#consensus-private-key}

Die Private Key-Datei, die als *Konsens Private Key* bezeichnet wird, wird auch als **Validator Private Key** bezeichnet.
Dieser Private Key wird verwendet, wenn der Knoten als Validator im Netzwerk fungiert und neue Daten signieren muss.

Die Private Key-Datei befindet sich in `consensus/validator.key`und entspricht dem erwähnten [Key-Format.](/docs/edge/configuration/manage-private-keys#key-format)

:::warning

Der Private Key der Prüfer ist für jeden Prüferknoten einmalig. Der gleiche Key darf <b>nicht</b> für alle Validatoren verwendet werden, da dies die Sicherheit Ihrer Chain gefährden könnte.

:::

## Private Key vernetzen {#networking-private-key}

Die für die Vernetzung erwähnte Private Key-Datei wird von libp2p verwendet, um die entsprechende PeerID zu generieren und dem Knoten die Teilnahme am Netzwerk zu ermöglichen.

Sie befindet sich in `keystore/libp2p.key`und hält sich an das erwähnte K[ey-Format.](/docs/edge/configuration/manage-private-keys#key-format)

## BLS Secret Key {#bls-secret-key}

Die geheime BLS Key-Datei wird verwendet, um die zugesagten Siegel in der Konsensschicht zusammenzufassen. Die Größe der aggregierten BLS-Siegel ist geringer als die der seriellen ECDSA-Signaturen.

Die BLS-Funktion ist optional und Sie können wählen, ob Sie BLS verwenden möchten oder nicht. Mehr Details unter [BLS](/docs/edge/consensus/bls).

## Import / Export {#import-export}

Da die Key-Dateien im einfachen Base64-Format auf der Festplatte gespeichert werden, können sie leicht gesichert oder importiert werden.

:::caution Ändern der Key-Dateien

Jede Änderung der Key-Dateien in einem bereits eingerichteten/laufenden Netzwerk kann zu ernsthaften Netzwerk-/Konsensstörungen führen,
da die Konsens- und Peer-Discovery-Mechanismen die von diesen Keys abgeleiteten Daten in einem knotenspezifischen Speicher ablegen und sich auf diese Daten verlassen,
um Verbindungen zu initiieren und die Konsenslogik auszuführen

:::
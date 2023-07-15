---
id: validators
title: Prüfer FAQ
description: "FAQ für Polygon Edge Prüfer"
keywords:
  - docs
  - polygon
  - edge
  - FAQ
  - validators

---

## Wie füge ich einen Prüfer hinzu/entferne ihn? {#how-to-add-remove-a-validator}

### PoA {#poa}
Das Hinzufügen/Entfernen von Prüfern wird per Abstimmung durchgeführt. [Hier](/docs/edge/consensus/poa) findest du einen vollständigen Leitfaden dazu.

### PoS {#pos}
[Hier](/docs/edge/consensus/pos-stake-unstake) findest du einen Leitfaden zum Staken von Geldern, damit ein Knoten zum Prüfer werden kann, und wie du das Staken aufheben (den Prüfer entfernen) kannst.

Bitte beachte:
- Mit dem Genesis-Flag `--max-validator-count` kannst du eine maximale Anzahl von Stakern festlegen, die dem Prüfer-Set beitreten können.
- Mit dem Genesis-Flag `--min-validator-count ` kannst du die Mindestanzahl der Staker festlegen, die benötigt werden, um dem Prüfer-Set beizutreten (standardmäßig `1`).
- Wenn die maximale Anzahl an Prüfern erreicht ist, kannst du keinen weiteren Prüfer hinzufügen, bis du einen bestehenden Prüfer aus dem Set entfernst (egal, ob der Stake-Betrag des neuen Prüfers höher ist). Wenn du einen Prüfer entfernst, kann die Anzahl der verbleibenden Prüfer nicht kleiner als `--min-validator-count` sein.
- Um Prüfer zu werden, gibt es eine Standardschwelle von `1` Währungseinheit des nativen Netzwerks (Gas).



## Wie viel Speicherplatz wird für einen Prüfer empfohlen? {#how-much-disk-space-is-recommended-for-a-validator}

Wir empfehlen, mit 100 GB als konservativ geschätzter Startbahn zu beginnen und sicherzustellen, dass es möglich ist, den Speicherplatz anschließend zu skalieren.


## Gibt es eine Begrenzung für die Anzahl der Prüfer? {#is-there-a-limit-to-the-number-of-validators}

Hinsichtlich technischer Einschränkungen gibt es bei Polygon Edge keine explizite Obergrenze für die Anzahl der Knoten, die du in einem Netzwerk einrichten kannst. Du kannst Verbindungsobergrenzen (Anzahl der eingehenden/ausgehenden Verbindungen) für jeden Knoten festlegen.

Hinsichtlich praktischer Einschränkungen ist die Leistung bei einem 100-Knoten-Cluster geringer als bei einem 10-Knoten-Cluster. Wenn du die Anzahl der Knoten in deinem Cluster erhöhst, steigt die Komplexität der Kommunikation und der Netzwerk-Overhead im Allgemeinen. Das hängt davon ab, welche Art von Netzwerk du betreibst und welche Art von Netzwerktopologie du hast.

## Wie wechsele ich von PoA zu PoS? {#how-to-switch-from-poa-to-pos}

PoA ist der Standard-Konsensmechanismus. Wenn du einen neuen Cluster auf PoS umstellen willst, musst du bei der Erstellung der Genesis-Datei den Flag `--pos` hinzufügen. Wenn ein Cluster ausgeführt wird, kannst du [hier](/docs/edge/consensus/migration-to-pos) nachlesen, wie du die Umstellung vornehmen kannst. Alle Informationen, die du über unsere Konsensmechanismen und deren Einrichtung brauchst, findest du in unserem [Abschnitt zum Konsens](/docs/edge/consensus/poa).

## Wie aktualisiere ich meine Knoten, wenn es einen Breaking Change gibt? {#how-do-i-update-my-nodes-when-there-s-a-breaking-change}

Einen ausführlichen Leitfaden zu diesem Verfahren findest du [hier](/docs/edge/validator-hosting#update).

## Ist der Mindest-Stake-Betrag für PoS Edge konfigurierbar? {#is-the-minimum-staking-amount-configurable-for-pos-edge}

Der Mindest-Stake-Betrag beträgt standardmäßig `1 ETH` und ist nicht konfigurierbar.

## Warum geben die JSON-RPC-Befehle `eth_getBlockByNumber` und `eth_getBlockByHash` nicht die Adresse des Miners zurück? {#not-return-the-miner-s-address}

Der derzeit in Polygon Edge verwendete Konsens ist IBFT 2.0, der wiederum auf dem Abstimmungsmechanismus aufbaut, der im Clique PoA erklärt wird: [ethereum/EIPs#225](https://github.com/ethereum/EIPs/issues/225).

Wenn du dir das EIP-225 (Clique PoA) ansiehst, ist das der relevante Teil, der erklärt, wofür `miner` (auch bekannt als `beneficiary`) verwendet wird:

<blockquote>
Wir setzen die ethash-Headerfelder wie folgt um:
<ul>
<li><b>beneficiary / miner: </b> Adresse, mit der du die Änderung der Liste der Zeichnungsberechtigten vorschlägst.</li>
<ul>
<li>Sollte normalerweise mit Nullen ausgefüllt werden und nur während der Abstimmung geändert werden.</li>
<li>Beliebige Werte sind dennoch erlaubt (auch sinnlose wie die Abwahl von Nichtunterzeichnern), um zusätzliche Komplexität bei der Implementierung von Abstimmungsmechanismen zu vermeiden.</li>
<li> Muss bei Checkpoint-Blöcken (d. h. Epochenübergängen) mit Nullen ausgefüllt werden. </li>
</ul>

</ul>

</blockquote>

Das `miner`-Feld wird also für den Vorschlag einer Abstimmung für eine bestimmte Adresse verwendet. Es dient nicht dazu, den Antragsteller des Blöcke anzuzeigen.

Die Informationen über den Antragsteller des Blöcke können durch die Rückgewinnung des Pubkeys aus dem Siegelfeld des RLP-codierten Istanbul-Extra-Datenfelds im Block-Header ermittelt werden.

## Welche Teile und Werte von Genesis können sicher geändert werden? {#which-parts-and-values-of-genesis-can-safely-be-modified}

:::caution

Bitte stelle sicher, eine manuelle Kopie der vorhandenen genesis.json-Datei zu erstellen, bevor du sie bearbeiten möchtest. Außerdem muss die gesamte Chain gestoppt werden, bevor du die genesis.json-Datei bearbeitest. Sobald die Genesis-Datei geändert wurde, muss die neuere Version davon auf allen non-validator und non-validator verteilt werden.

:::

**Nur der bootnodes Abschnitt der genesis-Datei kann sicher geändert werden**, wo du bootknoten aus der Liste hinzufügen oder entfernen kannst.
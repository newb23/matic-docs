---
id: overview
title: Übersicht
description: "Einführung in den Polygon Edge Test."
keywords:
  - docs
  - polygon
  - edge
  - performance
  - tests
  - loadbot
---
:::caution
Bitte beachte, dass unsere , `loadbot`die für die Durchführung dieser Tests verwendet wurde, jetzt abgeschrieben wird.
:::

| Art | Wert | Link zum Test |
| ---- | ----- | ------------ |
| Regelmäßige Transfers | 1428 tps | [4. Juli 2022](test-history/test-2022-07-04.md#results-of-eoa-to-eoa-transfers) |
| ERC-20-Transfers | 1111 tps | [4. Juli 2022](test-history/test-2022-07-04.md#results-of-erc20-token-transfers) |
| NFT-Minting | 714 tps | [4. Juli 2022](test-history/test-2022-07-04.md#results-of-erc721-token-minting) |

---

Unser Ziel ist es, eine hochperformante, funktionsreiche und einfach einzurichtende und zu wartende Blockchain-Client-Software zu entwickeln.
Alle Tests wurden mit dem Polygon Edge Loadbot durchgeführt.
Jeder Leistungsbericht, den du in diesem Abschnitt findest, ist ordnungsgemäß datiert, die Umgebung klar beschrieben und die Prüfmethode deutlich erklärt.

Das Ziel dieser Leistungstests ist es, die reale Leistung des Polygon Edge Blockchain-Netzwerks zu zeigen.
Alle sollten in der Lage sein, mit unserem Loadbot in der gleichen Umgebung die gleichen Ergebnisse zu erzielen wie hier gezeigt.

Alle Leistungstests wurden auf der AWS-Plattform auf einer Kette (Chain) bestehend aus EC2-Instanzknoten durchgeführt.
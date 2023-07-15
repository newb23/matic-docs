---
id: tokens
title: Token FAQ
description: "FAQ für Polygon Edge Prüfer"
keywords:
  - docs
  - polygon
  - edge
  - FAQ
  - tokens
---

## Unterstützt Polygon Edge EIP-1559? {#does-polygon-edge-support-eip-1559}
Im Moment unterstützt Polygon Edge keine EIP-1559.

## Wie setze das currency(token) Symbol ein? {#how-to-set-the-currency-token-symbol}

Das Token-Symbol ist nur eine Benutzeroberfläche, sodass nicht irgendwo im Netzwerk konfiguriert oder hardcodiert werden kann. Aber du kannst es ändern, wenn du Netzwerk zu einer Wallet wie Metamask, zum Beispiel

## Was passiert mit Transaktionen, wenn eine Chain eingehört? {#what-happens-to-transactions-when-a-chain-halts}

Alle Transaktionen, die nicht verarbeitet wurden, befinden sich in der TxPool (anfrage oder beworbene Warteschlange). Wenn die Chain einstellt (alle Blockproduktion stoppt), werden diese Transaktionen niemals in Blöcke übergehen.<br/> Dies ist nicht nur der Fall, wenn die Chain angehört. Wenn die Knoten gestoppt oder neu gestartet werden, werden alle Transaktionen entfernt, die noch nicht ausgeführt wurden und noch in TxPool sind, still entfernt.<br/> Das gleiche wird bei Transaktionen passieren, wenn eine thing eingeführt wird, da es erforderlich ist, damit die Knoten neu gestartet werden.

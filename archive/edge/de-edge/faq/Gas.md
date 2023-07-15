---
id: gas
title: Gas FAQ
description: "Gas FAQ für Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - FAQ
  - validators

---

## Wie kann ich einen minimalen Gaspreis durchsetzen? {#how-to-enforce-a-minimum-gas-price}
Du kannst die `--price-limit`Flag verwenden, die auf dem Server bereitgestellt wird. Dies wird deinen Knoten dazu zwingen, nur Transaktionen zu akzeptieren, die das Gas höher oder gleich dem von dir festgelegten Preislimit haben. Um sicherzustellen, dass es im gesamten Netzwerk durchgesetzt wird, musst du sicherstellen, dass alle Knoten das gleiche Preislimit haben.


## Können Sie Transaktionen mit 0 Gasgebühren haben? {#can-you-have-transactions-with-0-gas-fees}
Ja, das können Sie. Die default Preisgrenze, die Knoten durchsetzen, ist `0`, d.h. die Knoten akzeptieren Transaktionen mit einem Gaspreis auf`0` .

## Wie stelle ich die gas(native) Token Total Supply ein? {#how-to-set-the-gas-native-token-total-supply}

Du kannst einen vorgegebene Saldo auf die Konten (Adressen) einstellen, indem du die `--premine flag`verwendest. Bitte beachte, dass dies eine Konfiguration aus der genesis Datei ist und sie kann später nicht geändert werden.

Beispiel für die Verwendung von `--premine flag`:

`--premine=0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000`

Dies stellt eine vorgegebene Balance von 1000 ETH auf 0x3956E90e632AEbBF34DEB49b71c28A83Bc029862 dar (der Betrag aus dem Argument ist in wei).

Die vorausschauende Menge des gas token wird die Gesamtversorgung sein. Kein anderer Betrag der of the native Währung (Gas Token) kann später angezeigt werden.

## Unterstützt Edge ERC-20 als Gas-Token? {#does-edge-support-erc-20-as-a-gas-token}

Edge unterstützt ERC-20 Token nicht als Gas-Token. Nur die native Edge Währung wird für Gas unterstützt.

## Wie erhöht man die gas {#how-to-increase-the-gas-limit}

Es gibt zwei Möglichkeiten, die gas in Polygon Edge zu erhöhen:
1. Wische die Chain und erhöht den maximalen uint64-Wert in der `block-gas-limit`Genesis-Datei.
2. Benutze die `--block-gas-target`Flagge mit einem hohen Wert, um die gas aller Knoten zu erhöhen. Dies erfordert den Neustart von Knoten. Detaillierte Erklärung [hier](/docs/edge/architecture/modules/txpool/#block-gas-target).
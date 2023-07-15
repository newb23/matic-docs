---
id: troubleshooting
title: Fehlerbehebung
description: "Fehlerbehebung für Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - troubleshooting

---

# Fehlerbehebung {#troubleshooting}

## `method=eth_call err="invalid signature"`Fehler {#error}

Wenn Sie ein Wallet verwenden, um eine Transaktion mit Polygon Edge durchzuführen, stelle sicher, dass im lokalen Netzwerk Ihrer Wallets

1. Das  `chainID`ist das richtige. Der Standard  `chainID`für Edge ist `100`, aber es kann mit dem genesis Flag angepasst `--chain-id`werden.

````bash
genesis [--chain-id CHAIN_ID]
````
2. Stelle sicher, dass auf der “RPC-URL” das Feld den JSON RPC Port des Knoten, mit dem du dich verbindest, verwendet.


## Wie man eine WebSocket URL erhält {#how-to-get-a-websocket-url}


Wenn du den Polygon Edge ausführst, erzeugt er standardmäßig eine WebSocket, die auf dem Standort der Chain basiert.
Das URL-Schema `wss://` wird für HTTPS-Links und `ws://` für HTTP verwendet.

Localhost WebSocket URL:
````bash
ws://<JSON-RPC URL>:<PORT>/ws
````
Bitte beachte, dass die Portnummer von dem gewählten JSON-RPC-Port für den Knoten abhängt.

Edgenet WebSocket URL:
````bash
wss://rpc-edgenet.polygon.technology/ws
````

## `insufficient funds`Fehler beim Versuch, einen Vertrag bereitzustellen {#error-when-trying-to-deploy-a-contract}

Wenn du diesen Fehler erhältst, stelle sicher, dass du genügend Geld auf der gewünschten Adresse hast, und die verwendete Adresse die richtige <br/>ist. Um das premined Gleichgewicht einzustellen, kannst du das genesis  `genesis [--premine ADDRESS:VALUE]`beim Erzeugen der genesis Datei verwenden. Beispiel für die Verwendung dieser Flag:
````bash
genesis --premine 0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000
````
Dies premines 1000000000000000000000 WEI auf 0x3956E90e632AEbBF34DEB49b71c28A83Bc029862


## ERC20 Token nicht veröffentlicht bei der Verwendung von Chainbridge {#erc20-tokens-not-released-while-using-chainbridge}

Wenn du versuchst, ERC20 Token zwischen Polygon POS und einem lokalen Edge Netzwerk zu transferieren und deine ERC20 Token hinterlegt sind, wird auch der Vorschlag bei ausgeführt, die Token aber nicht in deinem Edge-Netzwerk veröffentlicht, stelle sicher, dass der ERC20 Handler in der Polygon Edge Kette genügend Token zur Veröffentlichung <br/>hat. Der Handler-Vertrag in der destination muss genügend Token haben, um für den lock-release freizugeben. Wenn du im ERC20 Handler deines lokalen Edge Netzwerks keine ERC20 Token hast, mint bitte neue Token aus und transferiere sie an den ERC20 Handler.

## `Incorrect fee supplied`Fehler bei der Verwendung von Chainbridge {#error-when-using-chainbridge}

Möglicherweise erhält man diesen Fehler, wenn man versucht, ERC20 Token zwischen der Mumbai Polygon POS Kette und einem lokalen Polygon Edge Setup zu übertragen. Dieser Fehler wird angezeigt, wenn Sie die Gebühr auf die Bereitstellung mit `--fee` Flag, aber Sie setzen nicht den gleichen Wert in der Einzahlungstransaktion ein. Du kannst den folgenden Befehl verwenden, um die Gebühr zu ändern:
````bash
 $ cb-sol-cli admin set-fee --bridge <BRIDGE_ADDRESS> --fee 0 --url <JSON_RPC_URL> --privateKey <PRIVATE_KEY>
 ````
Mehr Informationen zu dieser Flagge findest du [hier](https://github.com/ChainSafe/chainbridge-deploy/blob/main/cb-sol-cli/docs/deploy.md).






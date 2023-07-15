---
id: query-json-rpc
title: Abfrage JSON RPC Endpunkte
description: "Daten abfragen und die Chain mit einem premined Konto starten."
keywords:
  - docs
  - polygon
  - edge
  - query
  - premine
  - node
---

## Übersicht {#overview}

Die JSON-RPC-Ebene des Polygon Edge bietet Entwicklern die Funktionalität des einfachen Interagieren mit der Blockchain, durch HTTP Requests.

Dieses Beispiel umfasst die Verwendung von Tools wie **curl** zum Abfragen von Informationen sowie das Starten der Chain mit einem premined Konto, und Senden einer Transaktion.

## Schritt 1: Erstelle eine genesis Datei mit einem premined Konto {#step-1-create-a-genesis-file-with-a-premined-account}

Um eine genesis Datei zu generieren, führe den folgenden Befehl aus:
````bash
polygon-edge genesis --premine 0x1010101010101010101010101010101010101010
````

Das **premine** Flag setzt die Adresse, die mit einem Startguthaben in der **genesis** Datei enthalten sein <br />sollte. In diesem Fall `0x1010101010101010101010101010101010101010`wird die Adresse  einen starting **Standardbalance** von`0xD3C21BCECCEDA1000000`haben (1 Million native currency

`:`Wenn wir eine Balance spezifizieren wollten, können wir die Balance und Adresse mit einem trennen, wie:
````bash
polygon-edge genesis --premine 0x1010101010101010101010101010101010101010:0x123123
````

`hex``uint256`Das Guthaben kann entweder ein  oder  Wert sein.

:::warning Nur premine Konten, für die du einen privaten Schlüssel hast!
Wenn du premine Konten und keinen privaten Schlüssel hast, um auf sie zuzugreifen, wirst du premined Guthaben nicht verwenden können
:::

## Schritt 2: Starten Sie das Polygon Edge im dev Modus {#step-2-start-the-polygon-edge-in-dev-mode}

Um den Polygon Edge Entwicklungsmodus zu starten, der im [CLI Commands](/docs/edge/get-started/cli-commands) Abschnitt erklärt wird, Führe das folgende aus:
````bash
polygon-edge server --chain genesis.json --dev --log-level debug
````

## Schritt 3: Abfrage des Kontostands {#step-3-query-the-account-balance}

Nun, da der Client up ist und im dev Modus läuft, mit der genesis Datei generiert in **Schritt 1**, können wir ein Tool wie **curl** zum Abfragen des Kontostands verwenden:
````bash
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x1010101010101010101010101010101010101010", "latest"],"id":1}' localhost:8545
````

Der Befehl sollte die folgende Ausgabe zurückgeben:
````bash
{
  "id":1,
  "result":"0x100000000000000000000000000"
}
````

## Schritt 4: Senden einer Transfertransaktion {#step-4-send-a-transfer-transaction}

Nun, da wir das Konto bestätigt haben, das wir als premined eingerichtet haben und das richtige Guthaben hat, können wir einige Ether transferieren:

````js
var Web3 = require("web3");

const web3 = new Web3("<provider's websocket jsonrpc address>"); //example: ws://localhost:10002/ws
web3.eth.accounts
  .signTransaction(
    {
      to: "<recipient address>",
      value: web3.utils.toWei("<value in ETH>"),
      gas: 21000,
    },
    "<private key from premined account>"
  )
  .then((signedTxData) => {
    web3.eth
      .sendSignedTransaction(signedTxData.rawTransaction)
      .on("receipt", console.log);
  });

````

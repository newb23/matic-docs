---
id: query-json-rpc
title: Richiesta endpoint JSON RPC
description: "Richiedere i dati e avviare la catena con un account preminato."
keywords:
  - docs
  - polygon
  - edge
  - query
  - premine
  - node
---

## Panoramica {#overview}

Il layer JSON-RPC di Polygon Edge fornisce agli sviluppatori la funzionalità di interagire facilmente con la blockchain, tramite richieste HTTP.

Questo esempio riguarda l'uso di strumenti come "**curl**" per richiedere le informazioni, nonché avviare la catena con un account preminato e inviare una transazione.

## Passo 1: Creare un file genesis con un account preminato {#step-1-create-a-genesis-file-with-a-premined-account}

Per generare un file genesis, eseguire il seguente comando:
````bash
polygon-edge genesis --premine 0x1010101010101010101010101010101010101010
````

La bandiera **premina** imposta l'indirizzo che dovrebbe essere incluso con un saldo iniziale nel file **genesis**<br />. In questo caso, l'indirizzo `0x1010101010101010101010101010101010101010` avrà un saldo iniziale **predefinito** di`0xD3C21BCECCEDA1000000` (1 milione di gettoni di valuta nativa).

Se si volesse specificare un saldo, si possono separare il saldo e l'indirizzo con un `:`, come:
````bash
polygon-edge genesis --premine 0x1010101010101010101010101010101010101010:0x123123
````

Il saldo può essere un valore  `hex`o `uint256`.

:::warning Preminare solo account per i quali si dispone di una chiave privata!

Se si preminano account e non si dispone di una chiave privata per accedervi, il saldo preminato non sarà utilizzabile.
:::

## Passo 2: avviare Polygon Edge in modalità dev {#step-2-start-the-polygon-edge-in-dev-mode}

Per avviare Polygon Edge in modalità dev, come spiegato nella sezione [CLI Commands](/docs/edge/get-started/cli-commands), eseguire quanto segue:
````bash
polygon-edge server --chain genesis.json --dev --log-level debug
````

## Passo 3: richiedere il saldo dell'account {#step-3-query-the-account-balance}

Ora che il client è attivo e funzionante in modalità dev, usando il file genesis generato nel **Passo 1**, possiamo usare uno strumento come **curl** per richiedere il saldo dell'account:
````bash
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x1010101010101010101010101010101010101010", "latest"],"id":1}' localhost:8545
````

Il comando dovrebbe produrre il seguente risultato:
````bash
{
  "id":1,
  "result":"0x100000000000000000000000000"
}
````

## Passo 4: inviare una transazione di trasferimento {#step-4-send-a-transfer-transaction}

Ora che abbiamo confermato che l'account che abbiamo impostato come preminato ha il saldo corretto, possiamo trasferire un po' di ether:

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

---
id: query-json-rpc
title: Terminales de consulta llamadas a procedimiento remoto (RPC) JSON
description: "Consulta los datos e inicia la cadena con una cuenta preminada."
keywords:
  - docs
  - polygon
  - edge
  - query
  - premine
  - node
---

## Descripción general {#overview}

La capa de RPC JSON de Polygon Edge les ofrece a los desarrolladores la funcionalidad de interactuar fácilmente con la cadena de bloques,
mediante solicitudes HTTP.

Este ejemplo abarca el uso de herramientas como **curl** para consultar información, al igual que para iniciar la cadena con una cuenta preminada
y enviar una transacción.

## Paso 1: Crea un archivo de génesis con una cuenta preminada. {#step-1-create-a-genesis-file-with-a-premined-account}

Para generar un archivo de genesis, ejecuta el siguiente comando:
````bash
polygon-edge genesis --premine 0x1010101010101010101010101010101010101010
````

La indicación de **preminar** establece la dirección que se debe incluir con saldo inicial en el archivo de **genesis.**<br />
En ese caso, la dirección `0x1010101010101010101010101010101010101010` tendrá un **saldo inicial por defecto** de `0xD3C21BCECCEDA1000000`
(1 millón de tokens de moneda nativa).

Si quisiéramos especificar un saldo, podemos separar el saldo y la dirección con `:`, así:
````bash
polygon-edge genesis --premine 0x1010101010101010101010101010101010101010:0x123123
````

El saldo puede ser un valor `hex` o `uint256`.

:::warning ¡Solo premina cuentas de las cuales tienes una clave privada!

Si preminas cuentas de las que no tienes clave privada de acceso, el saldo preminado no será utilizable.

:::

## Paso 2: Inicia Polygon Edge en modo desarrollador. {#step-2-start-the-polygon-edge-in-dev-mode}

Para iniciar Polygon Edge en modo de desarrollador, lo cual se explica en la sección de [Comandos CLI](/docs/edge/get-started/cli-commands),
ejecuta lo siguiente:
````bash
polygon-edge server --chain genesis.json --dev --log-level debug
````

## Paso 3: Consulta el saldo de la cuenta. {#step-3-query-the-account-balance}

Ahora que el cliente está activado y ejecutándose en modo desarrollador, con el archivo de génesis generado en el **paso 1**, podemos usar una herramienta como
**curl** para consultar el saldo de la cuenta:
````bash
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x1010101010101010101010101010101010101010", "latest"],"id":1}' localhost:8545
````

El comando debería arrojar el siguiente resultado:
````bash
{
  "id":1,
  "result":"0x100000000000000000000000000"
}
````

## Paso 4: Envía una transacción de transferencia. {#step-4-send-a-transfer-transaction}

Ahora que confirmamos que la cuenta que configuramos como preminada tiene el saldo correcto, podemos transferir algunos ethers:

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

---
id: query-json-rpc
title: Endpoints de JSON RPC de consulta
description: "Faça uma consulta de dados e inicie a chain com uma conta pré-minerada."
keywords:
  - docs
  - polygon
  - edge
  - query
  - premine
  - node
---

## Visão geral {#overview}

A camada JSON-RPC do Polygon Edge fornece aos programadores a funcionalidade de interagir facilmente com o blockchain,
através de solicitações HTTP.

Este exemplo cobre o uso de ferramentas como **curl** para informações de consulta, bem como a inicialização da chain com uma conta pré-minerada,
e envio de uma transação.

## Etapa 1: crie um ficheiro de génese com uma conta pré-minerada {#step-1-create-a-genesis-file-with-a-premined-account}

Para gerar um ficheiro de génese, execute o comando a seguir:
````bash
polygon-edge genesis --premine 0x1010101010101010101010101010101010101010
````

O sinalizador de **pré-mineração** define o endereço que deve ser incluído com um saldo inicial no ficheiro de **génese**.<br />
Neste caso, o endereço  `0x1010101010101010101010101010101010101010` terá um **saldo padrão** inicial de
`0xD3C21BCECCEDA1000000`(1 milhão de tokens de moeda nativa).

Se quiséssemos especificar saldo, poderíamos separar o saldo e o endereço com um `:`, como este:
````bash
polygon-edge genesis --premine 0x1010101010101010101010101010101010101010:0x123123
````

O saldo pode ser um valor `hex` ou `uint256`.

:::warning Apenas contas pré-mineração para as quais tem chave privada!

Se tiver pré-mineração de contas e não tiver uma chave privada para acessá-las, o saldo pré-minerado não será utilizável

:::

## Etapa 2: inicie o Polygon Edge no modo dev {#step-2-start-the-polygon-edge-in-dev-mode}

Para iniciar o Polygon Edge no modo de programação, que é explicado na seção [Comandos de CLI](/docs/edge/get-started/cli-commands),
execute o seguinte:
````bash
polygon-edge server --chain genesis.json --dev --log-level debug
````

## Etapa 3: consulte o saldo da conta {#step-3-query-the-account-balance}

Agora que o cliente está pronto e em execução no modo dev, usando o ficheiro de génese gerado na **etapa 1**, podemos usar uma ferramenta como
**curl** para consultar o saldo da conta:
````bash
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x1010101010101010101010101010101010101010", "latest"],"id":1}' localhost:8545
````

O comando deve retornar o seguinte resultado:
````bash
{
  "id":1,
  "result":"0x100000000000000000000000000"
}
````

## Etapa 4: Envie uma transação de transferência {#step-4-send-a-transfer-transaction}

Agora que confirmamos que a conta que configuramos como pré-minerada tem o saldo correto, podemos transferir alguma quantidade de Ether:

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

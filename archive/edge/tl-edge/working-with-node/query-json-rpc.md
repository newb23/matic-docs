---
id: query-json-rpc
title: I-query ang mga endpoint ng JSON RPC
description: "I-query ang data at simulan ang chain sa pamamagitan ng na-premine na account."
keywords:
  - docs
  - polygon
  - edge
  - query
  - premine
  - node
---

## Pangkalahatang-ideya {#overview}

Ang layer ng JSON-RPC ng Polygon Edge ay nagbibigay sa mga developer ng kakayahang makipag-interaksyon sa blockchain nang walang kahirap-hirap,
sa pamamagitan ng mga request sa HTTP.

Saklaw sa halimbawang ito ang paggamit ng mga tool tulad ng **curl** para mag-query ng impormasyon at simulan ang chain sa pamamagitan ng na-premine na account,
at magpadala ng transaksyon.

## Hakbang 1: Gumawa ng genesis file sa pamamagitan ng na-premine na account {#step-1-create-a-genesis-file-with-a-premined-account}

Para gumawa ng genesis file, patakbuhin ang sumusunod na command:
````bash
polygon-edge genesis --premine 0x1010101010101010101010101010101010101010
````

Itinatakda ng **premine** flag ang address na dapat idagdag kasama ng panimulang balanse sa **genesis** file.<br />
Sa kasong ito, ang address na `0x1010101010101010101010101010101010101010` ay magkakaroon ng panimulang **default na balanse** na
`0xD3C21BCECCEDA1000000`(1 milyong katutubong currency token).

Kung gusto nating tumukoy ng balanse, maaari nating paghiwalayin ang balanse at address sa pamamagitan ng `:`, gaya nito:
````bash
polygon-edge genesis --premine 0x1010101010101010101010101010101010101010:0x123123
````

Ang balanse ay maaaring maging value na `hex` o `uint256`.

:::warning Para lang sa mga premine na account na mayroon kang pribadong key!

Kung mayroon kang mga premine na account at wala kang pribadong key para i-access ang mga ito, hindi magagamit ang iyong na-premine na balanse

:::

## Hakbang 2: Simulan ang Polygon Edge sa dev mode {#step-2-start-the-polygon-edge-in-dev-mode}

Para simulan ang Polygon Edge sa development mode, na ipinapaliwanag sa seksyong [Mga CLI Command](/docs/edge/get-started/cli-commands),
patakbuhin ang sumusunod:
````bash
polygon-edge server --chain genesis.json --dev --log-level debug
````

## Hakbang 3: I-query ang balanse ng account {#step-3-query-the-account-balance}

Ngayong tumatakbo na ang client sa dev mode, gamit ang genesis file na binuo sa **hakbang 1**, maaari tayong gumamit ng tool gaya ng
**curl** para i-query ang balanse ng account:
````bash
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x1010101010101010101010101010101010101010", "latest"],"id":1}' localhost:8545
````

Dapat ibalik ng command ang sumusunod na output:
````bash
{
  "id":1,
  "result":"0x100000000000000000000000000"
}
````

## Hakbang 4: Magpadala ng paglipat na transaksyon {#step-4-send-a-transfer-transaction}

Ngayon na nakumpirma na natin na may tamang balanse ang account na na-set up natin bilang na-premine, maaari tayong maglipat ng ilang ether:

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

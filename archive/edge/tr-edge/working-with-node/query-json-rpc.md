---
id: query-json-rpc
title: JSON RPC uç noktalarına sorgu gönderme
description: "Veriyi sorgulayın ve zinciri önceden mine edilmiş (premined) bir hesap ile başlatın."
keywords:
  - docs
  - polygon
  - edge
  - query
  - premine
  - node
---

## Genel Bakış {#overview}

Polygon Edge'in JSON-RPC katmanı, geliştiricilere blok zinciri ile kolayca HTTP talepleri yoluyla etkileşim kurabilme
işlevselliği sağlar.

Bu örnek, bilgiyi sorgulamak için **curl** gibi araçları kullanmayı ve zinciri önceden mine edilmiş bir hesap ile başlatma ile
işlem göndermeyi kapsar.

## Adım 1: Önceden mine edilmiş bir hesap ile bir genesis dosyası oluşturma {#step-1-create-a-genesis-file-with-a-premined-account}

Bir genesis dosyası oluşturmak için aşağıdaki komutu çalıştırın:
````bash
polygon-edge genesis --premine 0x1010101010101010101010101010101010101010
````

**Premine** bayrağı, **genesis** dosyası içinde bir başlangıç bakiyesi ile dâhil edilmesi gereken adresi ayarlar.<br />
Bu durumda, `0x1010101010101010101010101010101010101010` adresi başlangıçta **varsayılan bakiye** olarak
`0xD3C21BCECCEDA1000000` içerecektir (1 milyon yerel para birimi belirteçi).

Bir bakiye belirtmek istersek, bakiye ile adresi bir `:` kullanarak şu şekilde ayırabiliriz:
````bash
polygon-edge genesis --premine 0x1010101010101010101010101010101010101010:0x123123
````

Bakiye bir `hex` veya `uint256` değeri olabilir.

:::warning Yalnızca özel anahtarına sahip olduğunuz hesapları önceden mine edin!

Hesapları önceden mine ediyorsanız ve bunlara erişmek için gerekli özel anahtarınız yoksa, kullanılamayacak bir bakiyeyi önceden mine etmiş olursunuz

:::

## Adım 2: Polygon Edge'i dev modunda başlatın {#step-2-start-the-polygon-edge-in-dev-mode}

Polygon Edge'i, [CLI Komutları](/docs/edge/get-started/cli-commands) bölümünde açıklanan geliştirici modunda başlatabilmek için,
aşağıdakileri çalıştırın:
````bash
polygon-edge server --chain genesis.json --dev --log-level debug
````

## Adım 3: Hesap bakiyesini sorgulayın {#step-3-query-the-account-balance}

Artık istemci çalışıyor ve dev modunda olduğuna göre, **adım 1**'de oluşturulan genesis dosyasını kullanarak
**curl** gibi bir araç ile hesap bakiyesini sorgulayabiliriz:
````bash
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x1010101010101010101010101010101010101010", "latest"],"id":1}' localhost:8545
````

Bu komut aşağıdaki çıktıyı geri döndürmelidir:
````bash
{
  "id":1,
  "result":"0x100000000000000000000000000"
}
````

## Adım 4: Bir aktarım işlemi gönderin {#step-4-send-a-transfer-transaction}

Artık önceden mine edilmiş olarak kurduğumuz hesabın doğru bakiyeye sahip olduğunu onayladığımıza göre, bir miktar ether aktarabiliriz:

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

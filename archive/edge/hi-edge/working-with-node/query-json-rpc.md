---
id: query-json-rpc
title: क्वेरी JSON RPC एंडपॉइंट
description: "डेटा क्वेरी करें और एक premined अकाउंट के साथ चेन शुरू करें."
keywords:
  - docs
  - polygon
  - edge
  - query
  - premine
  - node
---

## ओवरव्यू {#overview}

पॉलीगॉन एज की JSON-RPC लेयर डेवलपर्स को ब्लॉकचेन के साथ आसानी से बातचीत करने की फ़ंक्शनैलिटी प्रदान करती है
HTTP अनुरोधों के माध्यम से.

इस उदाहरण में टूल्स जैसे **कर्ल** का इस्तेमाल करके जानकारी की पूछताछ करने के साथ-साथ एक premined अकाउंट के साथ चेन शुरू करना शामिल है,
और एक ट्रांज़ैक्शन भेजता है.

## स्टेप 1: एक premined अकाउंट के साथ एक जेनेसिस फ़ाइल बनाएँ {#step-1-create-a-genesis-file-with-a-premined-account}

एक जेनेसिस फ़ाइल जनरेट करने के लिए, निम्नलिखित कमांड को रन करें:
````bash
polygon-edge genesis --premine 0x1010101010101010101010101010101010101010
````

**premine** फ्लैग उस पते को सेट करता है जिसे **जेनेसिस फ़ाइल** में शुरूआती बैलेंस के साथ शामिल किया जाना चाहिए.<br />
इस मामले में, `0x1010101010101010101010101010101010101010` पते में शुरू करने के लिए `0xD3C21BCECCEDA1000000`का **डिफ़ॉल्ट बैलेंस ** होगा
(10 लाख नेटिव करेंसी टोकन).

अगर हम बैलेंस को निर्दिष्ट करना चाहते हैं, तो हम बैलेंस और पते को एक `:` के साथ अलग कर सकते हैं, जैसे :
````bash
polygon-edge genesis --premine 0x1010101010101010101010101010101010101010:0x123123
````

बैलेंस या तो एक `hex` या एक `uint256` वैल्यू में हो सकता है.

:::warning केवल वे premine अकाउंट जिनके लिए आपके पास निजी की है!
अगर आपके पास ऐसे premine अकाउंट हैं जिनकी निजी की आपके पास नहीं है, तो आप उनके बैलेंस का इस्तेमाल नहीं कर सकते

:::

## स्टेप 2: पॉलीगॉन एज को dev मोड में शुरू करें {#step-2-start-the-polygon-edge-in-dev-mode}

पॉलीगॉन एज को विकास मोड में शुरू करने के लिए, जिसे [CLI कमांड](/docs/edge/get-started/cli-commands) सेक्शन में समझाया गया है,
इनको रन करें:
````bash
polygon-edge server --chain genesis.json --dev --log-level debug
````

## स्टेप 3: अकाउंट के बैलेंस संबंधी क्वेरी {#step-3-query-the-account-balance}

अब जबकि क्लाइंट dev मोड में रन कर रहा है,** स्टेप 1** में जनरेट की गई जेनेसिस फ़ाइल का इस्तेमाल करते हुए हम इस्तेमाल कर सकते हैं टूल जैसे
**कर्ल**, अकाउंट के बैलेंस संबंधी क्वेरी:
````bash
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x1010101010101010101010101010101010101010", "latest"],"id":1}' localhost:8545
````

कमांड को निम्नलिखित आउटपुट रिटर्न करना चाहिए:
````bash
{
  "id":1,
  "result":"0x100000000000000000000000000"
}
````

## स्टेप 4: ट्रांसफ़र की ट्रांज़ैक्शन भेजें {#step-4-send-a-transfer-transaction}

अब जब हमने पुष्टि कर ली है कि हमने premined के रूप में सेट किए गए अकाउंट में सही बैलेंस है, तो हम कुछ ईथर ट्रांसफ़र कर सकते हैं:

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

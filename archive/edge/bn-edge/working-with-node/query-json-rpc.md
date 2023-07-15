---
id: query-json-rpc
title: প্রশ্ন JSON RPC এন্ডপয়েন্ট
description: "Query ডেটা এবং একটি premined অ্যাকাউন্ট সঙ্গে চেইন শুরু করুন।"
keywords:
  - docs
  - polygon
  - edge
  - query
  - premine
  - node
---

## সংক্ষিপ্ত বিবরণ {#overview}

Polygon Edge JSON-RPC স্তর ডেভেলপারদের ব্লকচেইনে সহজেই ইন্টারঅ্যাক্ট করার কার্যকারিতা provides ে প্রদান করে, HTTP অনুরোধ মাধ্যমে।

এই উদাহরণ তথ্য প্রশ্নের জন্য **curl** মত সরঞ্জাম ব্যবহার করে কভার করে, পাশাপাশি একটি premined অ্যাকাউন্ট সঙ্গে চেইন শুরু করে, এবং একটি লেনদেন পাঠান।

## ধাপ 1: একটি premined অ্যাকাউন্ট সঙ্গে একটি জেনেসিস ফাইল তৈরি করুন {#step-1-create-a-genesis-file-with-a-premined-account}

একটি জেনেসিস ফাইল তৈরি করতে, নিম্নলিখিত কমান্ড চালান:
````bash
polygon-edge genesis --premine 0x1010101010101010101010101010101010101010
````

**premine** পতাকা সেই ঠিকানা সেট করে যা জেনে**সিস** <br />ফাইলের একটি প্রারম্ভিক ভারসাম্য সঙ্গে অন্তর্ভুক্ত করা উচিত এই ক্ষেত্রে, ঠিকানা `0x1010101010101010101010101010101010101010`একটি প্রারম্**ভিক ডিফল্ট ভারসাম্য** থাকবে`0xD3C21BCECCEDA1000000` (1 মিলিয়ন নেটিভ মুদ্রা টোকেন)।

যদি আমরা একটি ভারসাম্য নির্দিষ্ট করতে চেয়েছি, আমরা ভারসাম্য এবং ঠিকানা একটি সঙ্গে পৃথক করতে পারে`:`ন, যেমন:
````bash
polygon-edge genesis --premine 0x1010101010101010101010101010101010101010:0x123123
````

ভারসাম্য একটি বা মান `hex``uint256`হতে পারে।

:::warning শুধুমাত্র আপনার জন্য একটি প্রাইভেট কী অ্যাকাউন্ট premine করুন!
আপনি অ্যাকাউন্ট premine এবং তাদের অ্যাক্সেস করার জন্য একটি প্রাইভেট কী নেই তবে আপনি premined ভারসাম্য ব্যবহারযোগ্য হবে না
:::

## ধাপ 2: dev মোডে Polygon Edge শুরু করুন {#step-2-start-the-polygon-edge-in-dev-mode}

উন্নয়ন মোডে Polygon Edge শুরু করতে, যা [CLI কমান্ড](/docs/edge/get-started/cli-commands) সেকশনে ব্যাখ্যা করা হয়, নিম্নলিখিত
````bash
polygon-edge server --chain genesis.json --dev --log-level debug
````

## ধাপ 3: অ্যাকাউন্ট ভারসাম্য {#step-3-query-the-account-balance}

এখন যে ক্লায়েন্ট ধাপ **1**-এ তৈরি জেনেসিস ফাইল ব্যবহার করে dev মোডে আপ এবং চলমান হয়, আমরা একটি টুল মত ব্যবহার করতে অ্যাকাউন্ট ভারসাম্য প্রশ্নের জন্য কার্**ল:**
````bash
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x1010101010101010101010101010101010101010", "latest"],"id":1}' localhost:8545
````

কমান্ড নিম্নলিখিত আউটপুট
````bash
{
  "id":1,
  "result":"0x100000000000000000000000000"
}
````

## ধাপ 4: একটি স্থানান্তর লেনদেন {#step-4-send-a-transfer-transaction}

এখন যে আমরা premined হিসাবে সেট আপ অ্যাকাউন্ট সঠিক ভারসাম্য

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

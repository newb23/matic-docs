---
id: troubleshooting
title: সমস্যার সমাধান
description: "Polygon Edge-এর জন্য সমস্যা সমাধান বিভাগ"
keywords:
  - docs
  - polygon
  - edge
  - troubleshooting

---

# সমস্যার সমাধান {#troubleshooting}

## `method=eth_call err="invalid signature"`ত্রুটি {#error}

আপনি Polygon Edge সঙ্গে একটি লেনদেন করতে একটি মানিব্যাগ ব্যবহার করা হয়, দয়া করে আপনার মানিব্যাগ স্থানীয় নেটওয়ার্ক সেটআপ

1. `chainID`ডান এক। `chainID`Edge জন্য ডিফল্ট , `100`কিন্তু এটি জেনেসিস পতাকা ব্যবহার করে কাস্টমাইজ করা যেতে পারে`--chain-id`।

````bash
genesis [--chain-id CHAIN_ID]
````
2. নিশ্চিত করুন, "RPC URL" এ, ক্ষেত্র আপনি নোড আপনি সংযুক্ত করা হয় JSON RPC পোর্ট


## একটি WebSocket URL {#how-to-get-a-websocket-url}

ডিফল্টভাবে, যখন আপনি Polygon Edge রান করেন, তখন এটি চেইন লোকেশন এর উপর ভিত্তি করে একটি WebSocket URL তৈরি করে। URL স্কিম HTTPS লিঙ্কের জন্য এবং HTTP `ws://`এর জন্য ব্যবহার করা `wss://`হয়।

Localhost WebSocket URL:
````bash
ws://<JSON-RPC URL>:<PORT>/ws
````
অনুগ্রহ করে মনে রাখবেন যে পোর্ট নম্বর নোডের জন্য নির্বাচিত JSON-RPC পোর্টের উপর নির্ভর করে।

Edgenet WebSocket URL:
````bash
wss://rpc-edgenet.polygon.technology/ws
````

## `insufficient funds`একটি চুক্তি {#error-when-trying-to-deploy-a-contract}

আপনি এই ত্রুটি পেতে, দয়া করে নিশ্চিত করুন যে আপনি পছন্দসই ঠিকানা যথেষ্ট তহবিল আছে, এবং ঠিকানা ব্যবহৃত সঠিক <br/>এক। premined ভারসাম্য সেট করতে, আপনি জেনেসিস ফাইল তৈরি করার `genesis [--premine ADDRESS:VALUE]`সময় জেনেসিস পতাকা এই পতাকা
````bash
genesis --premine 0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000
````
এই 1000 WEI 0x3956E90e632AEbBF34DEB49b71c28A83Bc029862।


## CHainbridge ব্যবহার করার সময় ERC20 টোকেন রিলিজ করা হয় না {#erc20-tokens-not-released-while-using-chainbridge}

আপনি Polygon PoS এবং একটি স্থানীয় Edge নেটওয়ার্ক মধ্যে ERC20 টোকেন স্থানান্তর করার চেষ্টা করেন, এবং আপনার ERC20 টোকেন আমানত করা হয়, এছাড়াও প্রস্তাব relayer মৃত্যুদন্ড করা হয়, কিন্তু আপনার Edge নেটওয়ার্ক টোকেন মুক্তি করা হয় না, দয়া করে নিশ্চিত করুন Polygon Edge চেইন ERC20 হ্যান্ডলার মুক্তি <br/>যথেষ্ট টোকেন গন্তব্য চেইন হ্যান্ডলার চুক্তি lock-release মোড জন্য মুক্তি জন্য যথেষ্ট টোকেন থাকতে হবে। আপনার স্থানীয় Edge নেটওয়ার্ক ERC20 হ্যান্ডলার মধ্যে কোন ERC20 টোকেন না থাকে, তাহলে নতুন টোকেন mint এবং ERC20 হ্যান্ডলার

## `Incorrect fee supplied`Chainbridge ব্যবহার করার সময়  {#error-when-using-chainbridge}

মুম্বাই Polygon PoS চেইন এবং একটি স্থানীয় Polygon Edge সেটআপের মধ্যে ERC20 টোকেন স্থানান্তর করার চেষ্টা করার সময় আপনি এই ত্রুটি পেতে পারে। আপনি পতাকা ব্যবহার করে স্থা`--fee`পনা ফি সেট করার সময় এই ত্রুটি প্রদর্শিত হয়, কিন্তু আপনি আমানত লেনদেন আপনি ফি পরিবর্তন করতে নীচের কমান্ড
````bash
 $ cb-sol-cli admin set-fee --bridge <BRIDGE_ADDRESS> --fee 0 --url <JSON_RPC_URL> --privateKey <PRIVATE_KEY>
 ````
আপনি [এখানে](https://github.com/ChainSafe/chainbridge-deploy/blob/main/cb-sol-cli/docs/deploy.md) এই ফ্ল্যাগ সম্পর্কে আরও তথ্য পাবেন।






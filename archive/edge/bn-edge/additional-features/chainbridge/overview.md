---
id: overview
title: সংক্ষিপ্ত বিবরণ
description: ChainBridge ওভারভিউ
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

## ChainBridge কী? {#what-is-chainbridge}

ChainBridge একটি মডুলার, মাল্টি-ডিরেকশনাল ব্লকচেইন ব্রিজ যা EVM ও Substrate সমর্থিত চেইন সমর্থন করে এবং ChainSafe দ্বারা নির্মিত। এটি ব্যবহারকারীদের দুটি ভিন্ন চেইনের মধ্যে সকল প্রকারের এসেট বা মেসেজ ট্রান্সফারের সুবিধা প্রদান করে।

ChainBridge সম্পর্কে আরও জানতে, দয়া করে প্রথমে এটির ডেভেলাপারদের প্রদত্ত [অফিসিয়াল ডকুমেন্টগুলো](https://chainbridge.chainsafe.io/) দেখুন।

এই নির্দেশিকাটি Polygon Edge-এ Chainbridge ইন্টিগ্রেট করতে সহায়তা প্রদানের উদ্দেশ্যে নির্মাণ করা হয়েছে। এটি একটি চলমান Polygon PoS (মুম্বাই টেস্টনেট) এবং একটি স্থানীয় Polygon Edge নেটওয়ার্কের মধ্যে একটি ব্রিজ সেটআপ করার প্রক্রিয়াটিকে বর্ণনা করে।

## আবশ্যকতা {#requirements}

এই নির্দেশিকায়, আপনি Polygon Edge নোড, একটি ChainBridge রিলেয়ার ([এখানে](/docs/edge/additional-features/chainbridge/definitions) আরো জানতে পারবেন) এবং cb-sol-cli টুল রান করবেন। cb-sol-cli টুল হচ্ছে স্থানীয়ভাবে চুক্তি ডিপ্লয় করার, রিসোর্স নিবন্ধ করার এবং ব্রিজের সেটিংস পরিবর্তন করার একটি CLI টুল ([এটিও](https://chainbridge.chainsafe.io/cli-options/#cli-options) দেখতে পারেন)। সেটআপ শুরু করার আগে নিম্নলিখিত এনভায়রনমেন্টগুলো প্রয়োজন:

* Go: >= 1.17
* Node.js >= 16.13.0
* Git


তাছাড়া, কিছু অ্যাপ্লিকেশন চালানোর জন্য আপনাকে নিম্নলিখিত রিপোজিটরিগুলো সংস্করণ সহ ক্লোন করতে হবে।

* [Polygon Edge](https://github.com/0xPolygon/polygon-edge): `develop` ব্রাঞ্চে
* [ChainBridge](https://github.com/ChainSafe/ChainBridge): v1.1.5
* [ChainBridge ডিপ্লয় টুল](https://github.com/ChainSafe/chainbridge-deploy): `f2aa093` `main` ব্রাঞ্চে


পরবর্তী বিভাগে এগিয়ে যাওয়ার আগে আপনাকে একটি Polygon Edge নেটওয়ার্ক সেটআপ করতে হবে। আরো বিস্তারিত জানার জন্য, অনুগ্রহ করে [স্থানীয় সেটআপ](/docs/edge/get-started/set-up-ibft-locally) বা [ক্লাউড সেটআপ](/docs/edge/get-started/set-up-ibft-on-the-cloud) দেখুন
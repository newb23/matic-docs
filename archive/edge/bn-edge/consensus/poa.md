---
id: poa
title: প্রুফ অব অথোরিটি (PoA)
description: "প্রুফ অব অথোরিটি সম্পর্কিত ব্যাখ্যা এবং নির্দেশাবলী।"
keywords:
  - docs
  - polygon
  - edge
  - PoA
  - autorithy
---

## সংক্ষিপ্ত বিবরণ {#overview}

IBFT PoA হচ্ছে Polygon Edge-এর ডিফল্ট কনসেনসাস প্রক্রিয়া। PoA-তে, যাচাইকারীরা ব্লক তৈরি করা এবং সেগুলোকে একটি সিরিজ আকারে ব্লকচেইনে  যোগ করার দায়িত্ব পালন করে থাকেন।

সব যাচাইকারী মিলে একটি ডাইনামিক যাচাইকারীর-সেট তৈরি করে, যেখানে একটি ভোটিং প্রক্রিয়া ব্যবহারের মাধ্যমে সেট থেকে যাচাইকারীদের যোগ করা বা বাদ দেওয়া যেতে পারে। এর মানে হচ্ছে যাচাইকারীদের যাচাইকারী-সেট থেকে ভোট দিয়ে সেটের ভিতরে নেয়া/বাইরে বের করে দেওয়া যেতে পারে যদি যাচাইকারী নোডের সংখ্যাগরিষ্ঠরা (51%) একজন নির্দিষ্ট যাচাইকারীকে সেটে/সেট থেকে যোগ/বাদ দিতে ভোট দেয়। এভাবে, অসৎ যাচাইকারীদের সনাক্ত করা যায় এবং নেটওয়ার্ক থেকে সরানো যায়, একই সাথে নতুন বিশ্বাসযোগ্য যাচাইকারীদের নেটওয়ার্কে যুক্ত করা যায়।

সমস্ত যাচাইকারী পরবর্তী ব্লক (রাউন্ড-রবিন পদ্ধতিতে) প্রস্তাব করার সুযোগ পায় এবং ব্লকচেইনে ব্লকটিকে যাচাই/ইনসার্ট করতে যাচাইকারীদের একটি একটি বিশাল অংশকে (2/3-এর বেশি) সেই ব্লকটিকে অনুমোদন করতে হয়।

এছাড়াও, যাচাইকারীদের পাশাপাশি ব্লক তৈরিতে অংশগ্রহণ না করা অ-যাচাইকারীরাও ব্লক যাচাই প্রক্রিয়ায় অংশগ্রহণ করতে পারে।

## যাচাইকারীর সেটে একজন যাচাইকারী যোগ করা {#adding-a-validator-to-the-validator-set}

কিভাবে 4 যাচাইকারী নোড সহ সক্রিয় IBFT নেটওয়ার্কে নতুন একটি যাচাইকারী নোড যোগ করতে হয় তা এই নির্দেশিকায় বর্ণনা করা হয়েছে। যদি আপনার জন্য হবে তাহলে [লোকাল সেটআপ](/edge/get-started/set-up-ibft-locally.md) / [ক্লাউড সেটআপ](/edge/get-started/set-up-ibft-on-the-cloud.md) বিভাগে নেটওয়ার্ক সেট আপ করতে সাহায্য করুন।

### ধাপ 1: IBFT-এর জন্য ডেটা ফোল্ডার চালু করুন এবং নতুন নোডের জন্য ভ্যালিডেটর কী​ তৈরি করুন {#step-1-initialize-data-folders-for-ibft-and-generate-validator-keys-for-the-new-node}

নতুন নোডে IBFT দিয়ে সুন্দরভাবে কাজ চালিয়ে যেতে হলে, প্রথমে আপনাকে ডেটা ফোল্ডারগুলি চালু করতে হবে এবং কী তৈরি করতে হবে:

````bash
polygon-edge secrets init --data-dir test-chain-5
````

এই কমান্ডটি যাচাইকারীর কী (ঠিকানা) এবং নোড আইডি প্রিন্ট করবে। পরবর্তী ধাপের জন্য আপনার যাচাইকারীর কী (অ্যাড্রেস) প্রয়োজন হবে।

### ধাপ 2: অন্য যাচাইকারী নোড থেকে নতুন ক্যান্ডিডেট প্রস্তাব করুন {#step-2-propose-a-new-candidate-from-other-validator-nodes}

নতুন নোডকে যাচাইকারী হিসেবে গণ্য করার জন্য অন্তত 51% যাচাইকারীকে তার জন্য প্রস্তাব করতে হবে।

বর্তমান যাচাইকারী নোড থেকে grpc ঠিকানা: 127.0.0.1:10000 এ নতুন যাচাইকারী (`0x8B15464F8233F718c8605B16eBADA6fc09181fC2`) প্রস্তাব করার উদাহরণ:

````bash
polygon-edge ibft propose --grpc-address 127.0.0.1:10000 --addr 0x8B15464F8233F718c8605B16eBADA6fc09181fC2 --bls 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --vote auth
````

IBFT কমান্ডগুলির গঠন [CLI কমান্ড](/docs/edge/get-started/cli-commands) বিভাগে বর্ণনা করা হয়েছে।

:::info BLS পাবলিক কী

BLS পাবলিক কী শুধুমাত্র BLS দিয়ে চালিত নেটওয়ার্কে প্রয়োজন হয়, BLS মোডে না চলা নেটওয়ার্কে `--bls`-এর প্রয়োজন নেই।

:::

### ধাপ 3: ক্লায়েন্ট নোড রান করুন {#step-3-run-the-client-node}

যেহেতু এই উদাহরণে আমরা এমন নেটওয়ার্ক চালানোর চেষ্টা করছি যেখানে সমস্ত নোড একই মেশিনে রয়েছে, তাই পোর্ট কনফ্লিক্ট এড়াতে আমাদের সতর্ক থাকতে হবে।

````bash
polygon-edge server --data-dir ./test-chain-5 --chain genesis.json --grpc-address :50000 --libp2p :50001 --jsonrpc :50002 --seal
````

সব ব্লক ফেচ করার পর, আপনার কনসোলে দেখতে পাবেন যে একটি নতুন নোড যাচাই প্রক্রিয়ায় অংশগ্রহণ করছে

````bash
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=4004
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=5 votes=0
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft: proposer calculated: proposer=0x8B15464F8233F718c8605B16eBADA6fc09181fC2 block=4004
````

:::info একজন অ-যাচাইকারীকে যাচাইকারী হিসেবে প্রস্তাব করা

স্বাভাবিকভাবে, একজন অ-যাচাইকারী ভোটিং প্রক্রিয়ার মাধ্যমে যাচাইকারী হতে পারেন, কিন্তু ভোটিং প্রক্রিয়ার পর সফলভাবে যাচাইকারীর-সেটে যোগ হতে নোডটিকে `--seal`ফ্ল্যাগ সহ রিস্টার্ট করতে হবে।

:::

## যাচাইকারীর-সেট থেকে একজন যাচাইকারীকে অপসারণ করা {#removing-a-validator-from-the-validator-set}

এই কাজটি খুবই সহজ। যাচাইকারীর-সেট থেকে একটি যাচাইকারী নোড অপসারণ করতে অধিকাংশ যাচাইকারী নোডে এই কমান্ডটিকে সম্পাদন করতে হবে।

````bash
polygon-edge ibft propose --grpc-address 127.0.0.1:10000 --addr 0x8B15464F8233F718c8605B16eBADA6fc09181fC2 --bls 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --vote drop
````

:::info BLS পাবলিক কী

BLS পাবলিক কী শুধুমাত্র BLS দিয়ে চালিত নেটওয়ার্কে প্রয়োজন হয়, BLS মোডে না চলা নেটওয়ার্কে `--bls`-এর প্রয়োজন নেই।

:::

কমান্ডগুলো সম্পাদন করার পরে লক্ষ্য করে থাকবেন যে যাচাইকারীর সংখ্যা কমে গিয়েছে (এই লগ উদাহরণের ক্ষেত্রে 4 থেকে 3 হয়েছে)

````bash
2021-12-15T19:20:51.014+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=2399 round=1
2021-12-15T19:20:51.014+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=4 votes=2
2021-12-15T19:20:51.015+0100 [INFO]  polygon.consensus.ibft.acceptState: we are the proposer: block=2399
2021-12-15T19:20:51.015+0100 [INFO]  polygon.consensus.ibft: picked out txns from pool: num=0 remaining=0
2021-12-15T19:20:51.015+0100 [INFO]  polygon.consensus.ibft: build block: number=2399 txns=0
2021-12-15T19:20:53.002+0100 [INFO]  polygon.consensus.ibft: state change: new=ValidateState
2021-12-15T19:20:53.009+0100 [INFO]  polygon.consensus.ibft: state change: new=CommitState
2021-12-15T19:20:53.009+0100 [INFO]  polygon.blockchain: write block: num=2399 parent=0x768b3bdf26cdc770525e0be549b1fddb3e389429e2d302cb52af1722f85f798c
2021-12-15T19:20:53.011+0100 [INFO]  polygon.blockchain: new block: number=2399 hash=0x6538286881d32dc7722dd9f64b71ec85693ee9576e8a2613987c4d0ab9d83590 txns=0 generation_time_in_sec=2
2021-12-15T19:20:53.011+0100 [INFO]  polygon.blockchain: new head: hash=0x6538286881d32dc7722dd9f64b71ec85693ee9576e8a2613987c4d0ab9d83590 number=2399
2021-12-15T19:20:53.011+0100 [INFO]  polygon.consensus.ibft: block committed: sequence=2399 hash=0x6538286881d32dc7722dd9f64b71ec85693ee9576e8a2613987c4d0ab9d83590 validators=4 rounds=1 committed=3
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft: state change: new=AcceptState
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=2400 round=1
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=3 votes=0
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft: proposer calculated: proposer=0xea21efC826F4f3Cb5cFc0f986A4d69C095c2838b block=2400
````

---
id: bls
title: BLS
description: "BLS মোড সম্পর্কিত ব্যাখ্যা এবং নির্দেশাবলী।"
keywords:
  - docs
  - polygon
  - edge
  - bls
---

## সংক্ষিপ্ত বিবরণ {#overview}

BLS (BLS) নামেও পরিচিত BLS হল একটি ক্রিপ্টোগ্রাফিক স্বাক্ষর স্কিম যা একটি ব্যবহারকারী তা যাচাই করতে পারবেন যে একটি signer সত্যি signer । এটি একটি স্বাক্ষর স্কিম যা একাধিক স্বাক্ষর aggregate  aggregate  করতে পারে। Polygon Edge-এ IBFT কনসেনসাস মোডে আরো ভালো নিরাপত্তা প্রদান করতে ডিফল্টরূপে BLS ব্যবহার করা হয়। BLS একাধিক স্বাক্ষরকে একটি একক বাইট অ্যারেতে একত্রিত করতে পারে এবং ফলশ্রুতিতে ব্লকের হেডার সাইজ ছোট করতে পারে। প্রতিটি চেইন BLS ব্যবহার করবে না কি করবে না তা নির্ণয় করতে পারে। BLS মোড সক্রিয় থাকা বা না থাকা নির্বিশেষে ECDSA কী ব্যবহার করা হয়।

## ভিডিও প্রেজেন্টেশন {#video-presentation}

[![bls - ভিডিও](https://img.youtube.com/vi/HbUmZpALlqo/0.jpg)](https://www.youtube.com/watch?v=HbUmZpALlqo)

## BLS ব্যবহার করে একটি নতুন চেইন কীভাবে সেটআপ করবেন {#how-to-setup-a-new-chain-using-bls}

আরো বিস্তারিতভাবে সেটআপের নির্দেশাবলী পেতে [লোকাল সেটআপ](/docs/edge/get-started/set-up-ibft-locally)/ [ক্লাউড সেটআপ](/docs/edge/get-started/set-up-ibft-on-the-cloud) বিভাগসমূহ পড়ুন।

## একটি বিদ্যমান ECDSA PoA চেইন থেকে BLS PoA চেইনে কীভাবে মাইগ্রেট করবেন {#how-to-migrate-from-an-existing-ecdsa-poa-chain-to-bls-poa-chain}

একটি বিদ্যমান PoA চেইনে BLS মোড কীভাবে ব্যবহার করবেন তা এই বিভাগে বর্ণনা করা হয়েছে।
একটি PoA চেইনে BLS এনাবেল করতে নিম্নলিখিত পদক্ষেপগুলো আবশ্যকীয়।

1. সকল নোড বন্ধ করুন
2. যাচাইকারীদের জন্য BLS কী তৈরি করুন
3. genesis.json এ একটি ফর্ক সেটিং যোগ করুন
4. সকল নোড পুনরায় চালু করুন

### 1. সকল নোড বন্ধ করুন {#1-stop-all-nodes}

Ctrl + c (Control + C) চেপে যাচাইকারীদের সমস্ত প্রক্রিয়া বন্ধ করুন। অনুগ্রহ করে সর্বশেষ ব্লক উচ্চতা (ব্লক কমিটেড লগের সর্বোচ্চ ক্রম নম্বর) মনে রাখুন।

### 2. BLS কী তৈরি করুন {#2-generate-the-bls-key}

`secrets init` এর সাথে `--bls` দিয়ে একটি BLS কী তৈরি হয়। বিদ্যমান ECDSA ও নেটওয়ার্ক কী রাখতে এবং একটি নতুন BLS কী যোগ করতে, `--ecdsa` এবং `--network` নিষ্ক্রিয় করতে হবে।

```bash
polygon-edge secrets init --bls --ecdsa=false --network=false

[SECRETS INIT]
Public key (address) = 0x...
BLS Public key       = 0x...
Node ID              = 16...
```

### 3. ফর্ক সেটিং যোগ করুন {#3-add-fork-setting}

`ibft switch` কমান্ড একটি ফর্ক সেটিং যোগ করে, যা `genesis.json`-এর মধ্যে বিদ্যমান চেইনে BLS সক্রিয় করে।

PoA নেটওয়ার্কের জন্য, যাচাইকারীদের কমান্ড দেওয়ার প্রয়োজন হবে। `genesis` কমান্ড অনুযায়ী, যাচাইকারীকে নির্দিষ্ট করতে `--ibft-validators-prefix-path` বা `--ibft-validator` ফ্ল্যাগ ব্যবহার করা যেতে পারে।

চেইন কোন উচ্চতা থেকে BLS ব্যবহার করা শুরু করেছে তা `--from` ফ্ল্যাগ দিয়ে নির্দিষ্ট করুন।

```bash
polygon-edge ibft switch --chain ./genesis.json --type PoA --ibft-validator-type bls --ibft-validators-prefix-path test-chain- --from 100
```

### 4. সকল নোড পুনরায় চালু করুন {#4-restart-all-nodes}

`server` কমান্ড দ্বারা সকল নোড পুনরায় চালু করুন। পূর্ববর্তী ধাপে উল্লেখিত `from`-এ ব্লক তৈরি করার পরে, চেইনটি BLS সক্রিয় করে এবং নিম্নোক্তভাবে লগ প্রদর্শন করে:

```bash
2022-09-02T11:45:24.535+0300 [INFO]  polygon.ibft: IBFT validation type switched: old=ecdsa new=bls
```

এছাড়াও, ব্লক তৈরির পর কোন যাচাইকরণ মোড ব্যবহার করে প্রতিটি ব্লক তৈরি করা হয়েছে তা লগে দেখা যায়।

```
2022-09-02T11:45:28.728+0300 [INFO]  polygon.ibft: block committed: number=101 hash=0x5f33aa8cea4e849807ca5e350cb79f603a0d69a39f792e782f48d3ea57ac46ca validation_type=bls validators=3 committed=3
```

## একটি বিদ্যমান ECDSA PoS চেইন থেকে একটি BLS PoS চেইনে কীভাবে মাইগ্রেট করবেন {#how-to-migrate-from-an-existing-ecdsa-pos-chain-to-a-bls-pos-chain}

একটি বিদ্যমান PoS চেইনে BLS মোড কীভাবে ব্যবহার করবেন তা এই বিভাগে বর্ণনা করা হয়েছে।
PoS চেইনে BLS সক্রিয় করতে নিম্নলিখিত পদক্ষেপগুলো আবশ্যকীয়।

1. সকল নোড বন্ধ করুন
2. যাচাইকারীদের জন্য BLS কী তৈরি করুন
3. genesis.json এ একটি ফর্ক সেটিং যোগ করুন
4. BLS পাবলিক কী নিবন্ধন করতে স্টেকিং চুক্তি কল করুন
5. সকল নোড পুনরায় চালু করুন

### 1. সকল নোড বন্ধ করুন {#1-stop-all-nodes-1}

Ctrl + c (Control + C) চেপে যাচাইকারীদের সমস্ত প্রক্রিয়া বন্ধ করুন। অনুগ্রহ করে সর্বশেষ ব্লক উচ্চতা (ব্লক কমিটেড লগের সর্বোচ্চ ক্রম নম্বর) মনে রাখুন।

### 2. BLS কী তৈরি করুন {#2-generate-the-bls-key-1}

`secrets init`-এর সাথে `--bls` ফ্ল্যাগ দিয়ে BLS কী তৈরি করে। বিদ্যমান ECDSA ও নেটওয়ার্ক কী রাখতে এবং একটি নতুন BLS কী যোগ করতে, `--ecdsa` এবং `--network` নিষ্ক্রিয় করতে হবে।

```bash
polygon-edge secrets init --bls --ecdsa=false --network=false

[SECRETS INIT]
Public key (address) = 0x...
BLS Public key       = 0x...
Node ID              = 16...
```

### 3. ফর্ক সেটিং যোগ করুন {#3-add-fork-setting-1}

`ibft switch` কমান্ড একটি ফর্ক সেটিং যোগ করে, যা `genesis.json`-এ চেইনের মধ্যখান থেকে BLS-কে সক্রিয় করে।

চেইনটি কোন উচ্চতা থেকে BLS মোড ব্যবহার করা শুরু করে `from` ফ্ল্যাগ দিয়ে নির্দিষ্ট করুন এবং `development` ফ্ল্যাগ দিয়ে চুক্তিটি আপডেট করা উচ্চতা নির্দিষ্ট করুন।

```bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --ibft-validator-type bls --deployment 50 --from 200
```

### 4. স্টেকিং চুক্তিতে BLS পাবলিক কী নিবন্ধন করুন {#4-register-bls-public-key-in-staking-contract}

ফর্ক যোগ এবং যাচাইকারীদের পুনরায় চালু করার পরে, BLS পাবলিক কী নিবন্ধন করতে প্রতিটি যাচাইকারীকে স্টেকিং চুক্তিতে `registerBLSPublicKey` কল করতে হবে। এটি অবশ্যই `--from`-এ উচ্চতা নির্দিষ্ট করার আগে `--deployment`-এ উচ্চতা নির্দিষ্ট করে তারপর করতে হবে।

BLS পাবলিক কী নিবন্ধন করার স্ক্রিপ্টটি [স্টেকিং স্মার্ট চুক্তি রেপোতে](https://github.com/0xPolygon/staking-contracts) সংজ্ঞায়িত করা হয়েছে।

`BLS_PUBLIC_KEY`-কে `.env` ফাইলে নিবন্ধন করার জন্য সেট করুন। অন্যান্য প্যারামিটার সম্পর্কে আরও বিস্তারিত জানতে [pos-stake-unstake](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts) পড়ুন।

```env
JSONRPC_URL=http://localhost:10002
STAKING_CONTRACT_ADDRESS=0x0000000000000000000000000000000000001001
PRIVATE_KEYS=0x...
BLS_PUBLIC_KEY=0x...
```

নিম্নলিখিত কমান্ড `.env`-তে প্রদত্ত BLS পাবলিক কী'কে চুক্তিতে নিবন্ধন করে।

```bash
npm run register-blskey
```

:::warning যাচাইকারীদের BLS পাবলিক কী ম্যানুয়ালি নিবন্ধন করতে হবে

BLS মোডে, যাচাইকারীদের অবশ্যই নিজস্ব অ্যাড্রেস এবং BLS পাবলিক কী থাকতে হবে। কনসেনসাস যখন চুক্তি থেকে যাচাইকারীর তথ্য নিয়ে আসে, তখন কনসেনসাস BLS পাবলিক কী নিবন্ধন না করা যাচাইকারীদের উপেক্ষা করে।
:::

### 5. সকল নোড পুনরায় চালু করুন {#5-restart-all-nodes}

`server` কমান্ড দ্বারা সকল নোড পুনরায় চালু করুন। পূর্ববর্তী ধাপে উল্লেখিত `from`-এ ব্লক তৈরি হওয়ার পরে চেইনটি BLS-কে সক্রিয় করে।

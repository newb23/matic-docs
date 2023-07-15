---
id: migration-to-pos
title: PoA থেকে PoS-এ মাইগ্রেশন
description: "PoA থেকে PoS IBFT এবং PoS IBFT থেকে PoA-তে মাইগ্রেট করার পদ্ধতি।"
keywords:
  - docs
  - polygon
  - edge
  - migrate
  - PoA
  - PoS
---

## সংক্ষিপ্ত বিবরণ {#overview}

এই বিভাগে আপনি ব্লকচেইন রিসেট করা ছাড়াই একটি চলমান ক্লাস্টারে PoA থেকে PoS IBFT এবং PoS IBFT থেকে PoA-তে মাইগ্রেট করার বিষয়ে নির্দেশনা পাবেন।

## PoS-এ কীভাবে মাইগ্রেট করতে হয় {#how-to-migrate-to-pos}

আপনাকে সকল নোড বন্ধ করতে হবে, `ibft switch` কমান্ড দ্বারা genesis.json এর মধ্যে ফর্ক কনফিগারেশন যোগ করতে হবে এবং নোডটি পুনরায় শুরু করতে হবে।

````bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --deployment 100 --from 200
````
:::caution ECDSA ব্যবহার করার সময় স্যুইচিং করা
ECDSA, ব্যবহার করার সময়, `--ibft-validator-type`ফ্ল্যাগ সুইচটিতে যোগ করা আবশ্যক, যেখানে ECDSA ব্যবহার করা হ. । যদি অন্তর্ভুক্ত না থাকলে, এজ স্বয়ংক্রিয়ভাবে BLS এ স্যুইচ করবে।

````bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --ibft-validator-type ecdsa --deployment 100 --from 200
````
:::PoS-এ স্যুইচ করতে, আপনাকে 2 ব্লক উচ্চতা নির্দিষ্ট করতে হবে: `deployment`এবং `from``deployment`। To া To া `from`To । স্টেকিং চুক্তিটি প্রি-ডিপ্লয়েড চুক্তির মত `deployment`-এর `0x0000000000000000000000000000000000001001` ঠিকানায় ডিপ্লয় করা হবে।

স্টেকিং চুক্তি সম্পর্কে আরও বিস্তারিত জানতে, অনুগ্রহ করে [প্রুফ অফ স্টেক](/docs/edge/consensus/pos-concepts) দেখুন।

:::warning যাচাইকারীদের নিজে স্টেক করতে হবে

প্রতিটি যাচাইকারীকে PoS-এর শুরুতে যাচাইকারী হতে চুক্তি `deployment`-এ ডিপ্লয় হবার পর এবং `from`-এ ডিপ্লয় হবার আগে স্টেক করতে হবে। প্রতিটি যাচাইকারী PoS-এর শুরুতে স্ট্যাকিং চুক্তি সেট দ্বারা নিজস্ব যাচাইকারী সেট আপডেট করবে।

স্টেকিং সম্পর্কে আরও জানতে, অনুগ্রহ করে **[সেটআপ করুন এবং প্রুফ অফ স্টেক ব্যবহার করুন](/docs/edge/consensus/pos-stake-unstake)** ভিজিট করুন।

:::

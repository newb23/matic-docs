---
id: overview
title: Polygon Edge
sidebar_label: What is Edge
description: "Polygon Edge-এর পরিচিতি।"
keywords:
  - docs
  - polygon
  - edge
  - network
  - modular

---

Polygon Edge Ethereum-সামঞ্জস্যপূর্ণ ব্লকচেইন নেটওয়ার্ক, সাইডচেইন এবং সাধারণ স্কেলিং সমাধান তৈরির জন্য একটি মডুলার এবং এক্সটেনসিবল ফ্রেমওয়ার্ক।

এর প্রাথমিক ব্যবহার হল, Ethereum স্মার্ট কন্ট্র্যাক্ট এবং লেনদেনের সাথে সম্পূর্ণ সামঞ্জস্য প্রদান করে একটি নতুন ব্লকচেইন নেটওয়ার্ক বুটস্ট্র্যাপ করা। এটি IBFT (ইস্তাম্বুল বাইজেন্টাইন ফল্ট Tolerant) Consensus প্রক্রিয়া ব্যবহার করে, যা [PoA (প্রুফ অব অথরিটি)](/docs/edge/consensus/poa) এবং [PoS (প্রুফ অব স্টেক)](/docs/edge/consensus/pos-stake-unstake) হিসাবে দুই প্রকারে সাপোর্টেড।

Polygon Edge অন্য একাধিক ব্লকচেইনের সাথে যোগাযোগ এনাবল করে, [ERC-20](https://ethereum.org/en/developers/docs/standards/tokens/erc-20) এবং [ERC-721](https://ethereum.org/en/developers/docs/standards/tokens/erc-721) টোকেন ট্রান্সফার এনাবেল করে, একটি [সেন্ট্রালাইজড ব্রিজ সলিউশিন](/docs/edge/additional-features/chainbridge/overview) ব্যবহার করে।

ইন্ডাস্ট্রি স্ট্যান্ডার্ড ওয়ালেটগুলো [JSON-RPC](/docs/edge/working-with-node/query-json-rpc) এন্ডপয়েন্টগুলির মাধ্যমে Polygon Edge-এর সাথে যোগাযোগ করতে ব্যবহার করা যেতে পারে এবং নোড অপারেটররা [gRPC](/docs/edge/working-with-node/query-operator-info) প্রোটোকলের মাধ্যমে নোডগুলোতে বিভিন্ন ক্রিয়া সম্পাদন করতে পারে।

Polygon সম্পর্কে আরো জানতে [অফিসিয়াল ওয়েবসাইট](https://polygon.technology) ভিজিট করুন।

**[GitHub রিপোজিটরি](https://github.com/0xPolygon/polygon-edge)**

:::caution

এর উপরে এখনও কাজ চলছে তাই ভবিষ্যতে আর্কিটেকচারাল পরিবর্তন ঘটতে পারে। কোড এখনও অডিট করা হয়নি তাই আপনি এটা প্রোডাকশনে ব্যবহার করতে চাইলে Polygon টিমের সাথে যোগাযোগ করুন।

:::



একটি `polygon-edge`লোকাল নেটওয়ার্ক চালানো শুরু করতে, অনুগ্রহ করে পড়ুনঃ [ইন্সটলেশন](/docs/edge/get-started/installation) এবং [লোকাল সেটআপ](/docs/edge/get-started/set-up-ibft-locally)।

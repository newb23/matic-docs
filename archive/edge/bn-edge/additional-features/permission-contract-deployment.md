---
id: permission-contract-deployment
title: অনুমতি স্মার্ট চুক্তি ডিপ্লয়মেন্ট
description: কীভাবে অনুমতি স্মার্ট চুক্তি ডিপ্লয়মেন্ট যোগ করবেন।
keywords:
  - docs
  - polygon
  - edge
  - smart contract
  - permission
  - deployment
---

## সংক্ষিপ্ত বিবরণ {#overview}

এই নির্দেশিকায় কিভাবে স্মার্ট চুক্তিতে ডিপ্লয় করা যায় এমন ঠিকানা হোয়াইটলিস্ট করা যা সে বিষয়ে বিস্তারিত আলোচনা করেছে।
কখনো কখনো নেটওয়ার্ক অপারেটররা ব্যবহারকারীদের নেটওয়ার্কের উদ্দেশ্যের সাথে সম্পর্ক নেই এমন স্মার্ট চুক্তি ডিপ্লয় করা থেকে বিরত রাখতে চান। নেটওয়ার্ক অপারেটররা যা করতে পারেন:

1. স্মার্ট চুক্তি ডিপ্লয়মেন্টের জন্য ঠিকানা হোয়াইটলিস্ট করতে পারেন
2. স্মার্ট চুক্তি ডিপ্লয়মেন্টের জন্য হোয়াইটলিস্ট থেকে ঠিকানা অপসারণ করতে পারেন

## ভিডিও প্রেজেন্টেশন {#video-presentation}

[![অনুমতি চুক্তি ডিপ্লয়মেন্ট - ভিডিও](https://img.youtube.com/vi/yPOkINpf7hg/0.jpg)](https://www.youtube.com/watch?v=yPOkINpf7hg)

## কীভাবে এটি ব্যবহার করবেন? {#how-to-use-it}


আপনি [CLI কমান্ড](/docs/edge/get-started/cli-commands#whitelist-commands) পৃষ্ঠাতে ডিপ্লয়মেন্ট হোয়াইটলিস্ট করা সম্পর্কিত সকল cli কমান্ড খুঁজে পেতে পারেন।

* `whitelist show`: হোয়াইটলিস্ট তথ্য দেখায়
* `whitelist deployment --add`:  চুক্তি ডিপ্লয়মেন্ট হোয়াইটলিস্টে একটি নতুন ঠিকানা যোগ করে
* `whitelist deployment --remove`:  চুক্তি ডিপ্লয়মেন্ট হোয়াইটলিস্ট থেকে একটি নতুন ঠিকানা অপসারণ করে

#### ডিপ্লয়মেন্ট হোয়াইটলিস্টে থাকা সমস্ত ঠিকানা দেখান {#show-all-addresses-in-the-deployment-whitelist}

ডিপ্লয়মেন্ট হোয়াইটলিস্ট থেকে ঠিকানা খুঁজে পাওয়ার 2টি পদ্ধতি রয়েছে।
1. `genesis.json` দেখতে পারেন, এখানে হোয়াইটলিস্ট সংরক্ষণ করা হয়
2. `whitelist show` এক্সিকিউট করতে পারেন, এটি Polygon Edge দ্বারা সমর্থিত সকল হোয়াইটলিস্টের তথ্য প্রিন্ট করে

```bash

./polygon-edge whitelist show

[WHITELISTS]

Contract deployment whitelist : [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d],


```

#### ডিপ্লয়মেন্ট হোয়াইটলিস্টে একটি ঠিকানা যোগ করুন {#add-an-address-to-the-deployment-whitelist}

ডিপ্লয়মেন্ট হোয়াইটলিস্টে একটি নতুন ঠিকানা যোগ করতে `whitelist deployment --add [ADDRESS]` CLI কমান্ড এক্সিকিউট করুন। হোয়াইটলিস্টে থাকা ঠিকানার সংখ্যায় কোনো সীমা নেই। শুধুমাত্র যেসব ঠিকানা কন্ট্রাক্ট ডিপ্লয়মেন্ট হোয়াইটলিস্টে আছে, সেগুলো চুক্তি ডিপ্লয় করতে পারে। হোয়াইটলিস্ট খালি থাকলে যেকোনো ঠিকানা ডিপ্লয়মেন্ট করতে পারবে

```bash

./polygon-edge whitelist deployment --add 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d --add 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF


[CONTRACT DEPLOYMENT WHITELIST]

Added addresses: [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],
Contract deployment whitelist : [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],



```

#### ডিপ্লয়মেন্ট হোয়াইটলিস্ট থেকে একটি ঠিকানা অপসারণ করুন {#remove-an-address-from-the-deployment-whitelist}

ডিপ্লয়মেন্ট হোয়াইটলিস্ট থেকে একটি ঠিকানা অপসারণ করতে `whitelist deployment --remove [ADDRESS]` CLI কমান্ড এক্সিকিউট করুন। শুধুমাত্র যেসব ঠিকানা কন্ট্রাক্ট ডিপ্লয়মেন্ট হোয়াইটলিস্টে আছে, সেগুলো চুক্তি ডিপ্লয় করতে পারে। হোয়াইটলিস্ট খালি থাকলে যেকোনো ঠিকানা ডিপ্লয়মেন্ট করতে পারবে

```bash

./polygon-edge whitelist deployment --remove 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d --remove 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF


[CONTRACT DEPLOYMENT WHITELIST]

Removed addresses: [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],
Contract deployment whitelist : [],



```

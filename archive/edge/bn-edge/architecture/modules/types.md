---
id: types
title: Types
description: Polygon Edge-এ Types মডিউলটির ব্যাখ্যা।
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - types
  - marshaling
---

## সংক্ষিপ্ত বিবরণ {#overview}

**Types** মডিউলটি বিভিন্ন প্রকারের কোর অবজেক্ট ইমপ্লিমেন্ট করে, যেমন:

* **Address**
* **Hash**
* **Header**
* অনেকগুলো হেল্পার ফাংশন

## RLP Encoding / Decoding {#rlp-encoding-decoding}

অন্যান্য ক্লায়েন্ট, যেমন GETH এর মত, Polygon Edge এনকোডিং-এর জন্য রিফ্লেকশন ব্যবহার করেনা। <br />রিফ্লেকশন ব্যবহার পছন্দনীয় না কারণ তা পার্ফরমেন্স
হ্রাস করে এবং স্কেলিং কঠিন করে।

**Types** মডিউলটি FastRLP প্যাকেজে ব্যবহার করে, RLP marshaling এবং unmarshalling এর জন্য একটি সহজে ব্যবহারযোগ্য ইন্টারফেস প্রদান করে।

Marshaling *MarshalRLPWith* এবং *MarshalRLPTO* পদ্ধতির মাধ্যমে করা হয়ে থাকে। অনুরূপ পদ্ধতিগুলো আছে
unmarshalling-এর জন্য।

এই পদ্ধতিগুলো ম্যানুয়ালি ব্যবহার করার কারণে, Polygon Edge-এর রিফ্লেকশন ব্যবহার করতে হয়না। *rlp_marshal.go* এ, আপনি Marshaling-এর পদ্ধতিগুলো খুঁজে পেতে পারেন:

* **Bodies**
* **Blocks**
* **Headers**
* **Receipts**
* **Logs**
* **Transactions**
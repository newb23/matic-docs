---
id: prometheus-metrics
title: Prometheus মেট্রিক্স
description: "Polygon Edge-এর জন্য Prometheus মেট্রিক্স কীভাবে সক্ষম করবেন।"
keywords:
  - docs
  - polygon
  - edge
  - metrics
  - prometheus
---

## সংক্ষিপ্ত বিবরণ {#overview}

Polygon Edge Prometheus মেট্রিক্স রিপোর্ট এবং পরিবেশন করতে পারে, যা Prometheus সংগ্রাহক(গণ) দ্বারা ব্যবহার করা যেতে পারে।

Prometheus মেট্রিক্স ডিফল্টরূপে নিষ্ক্রিয় করা থাকে। কনফিগ ফাইলে `--prometheus` ফ্ল্যাগ বা `Telemetry.prometheus` ক্ষেত্র ব্যবহার করে শ্রোতা ঠিকানা নির্দিষ্ট করার মাধ্যমে এটি সক্রিয় করা যাবে।
মেট্রিক্স নির্দিষ্ট ঠিকানায় `/metrics`-এর অধীনে পরিবেশন করা হবে।

## উপলভ্য মেট্রিক্স {#available-metrics}

নিম্নলিখিত মেট্রিক্স পাওয়া যাচ্ছে:

| **নাম** | **ধরন** | **বিবরণ** |
|-----------------------------------------------|---------------|-------------------------------------------------|
| txpool_pending_transactions | গেজ | TxPool-এ পেন্ডিং থাকা লেনদেনের সংখ্যা |
| consensus_validators | গেজ | যাচাইকারীর সংখ্যা |
| consensus_rounds | গেজ | রাউন্ডের সংখ্যা |
| consensus_num_txs | গেজ | সর্বশেষ ব্লকে লেনদেনের সংখ্যা |
| consensus_block_interval | গেজ | এই ব্লক এবং শেষ ব্লকের মধ্যকার সময়ের পার্থক্য সেকেন্ডে |
| network_peers | গেজ | সংযুক্ত পিয়ারের সংখ্যা |
| network_outbound_connections_count | গেজ | আউটবাউন্ড সংযোগের সংখ্যা |
| network_inbound_connections_count | গেজ | ইনবাউন্ড সংযোগের সংখ্যা |
| network_pending_outbound_connections_count | গেজ | পেন্ডিং আউটবাউন্ড সংযোগের সংখ্যা |
| network_pending_inbound_connections_count | গেজ | পেন্ডিং ইনবাউন্ড সংযোগের সংখ্যা |
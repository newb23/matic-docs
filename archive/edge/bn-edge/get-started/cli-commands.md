---
id: cli-commands
title: CLI কমান্ড
description: "Polygon Edge-এর CLI কমান্ড এবং কমান্ড ফ্ল্যাগের তালিকা।"
keywords:
  - docs
  - polygon
  - edge
  - cli
  - commands
  - flags
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


এই বিভাগে Polygon Edge-এ্রর বর্তমান কমান্ড, কমান্ড ফ্ল্যাগ এবং কিভাবে তাদের ব্যবহার করা হয় তার বিস্তারিত বর্ণনা করা হয়েছিল।

:::tip JSON আউটপুট সমর্থন

কিছু কমান্ডে `--json` ফ্ল্যাগটি সমর্থিত। এই ফ্ল্যাগ JSON ফরম্যাটে আউটপুট প্রিন্ট করতে কমান্ডকে নির্দেশনা প্রদান করে

:::

## স্টার্টআপ কমান্ড {#startup-commands}

| **কমান্ড** | **বিবরণ** |
|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| সার্ভার | সকল মডিউলকে একসাথে বুটস্ট্র্যাপ করার ব্লকচেইন ক্লায়েন্ট চালু করার ডিফল্ট কমান্ড |
| জেনেসিস | একটি *genesis.json* ফাইল তৈরি করে, যা ক্লায়েন্ট শুরু করার আগে একটি পূর্বনির্ধারিত চেইন স্টেট সেট করতে ব্যবহার করা হয়। জেনেসিস ফাইলের গঠন নিচে বর্ণনা করা হয়েছে |
| জেনেসিস প্রি-ডিপ্লয় | নতুন নেটওয়ার্কের জন্য একটি স্মার্ট চুক্তি প্রি-ডিপ্লয় করে |

### সার্ভার ফ্ল্যাগ {#server-flags}


| **সকল সার্ভার ফ্ল্যাগ** |
|---------------------------------------|---------------------------------------------|
| [data-dir](/docs/edge/get-started/cli-commands#data-dir) | [jsonrpc](/docs/edge/get-started/cli-commands#jsonrpc) |
| [json-rpc-block-range-limit](/docs/edge/get-started/cli-commands#json-rpc-block-range-limit) | [json-rpc-batch-request-limit](/docs/edge/get-started/cli-commands#json-rpc-batch-request-limit) |
| [grpc](/docs/edge/get-started/cli-commands#grpc) | [libp2p](/docs/edge/get-started/cli-commands#libp2p) |
| [prometheus](/docs/edge/get-started/cli-commands#prometheus) | [block-gas-target](/docs/edge/get-started/cli-commands#block-gas-target) |
| [max-peers](/docs/edge/get-started/cli-commands#max-peers) | [max-inbound-peers](/docs/edge/get-started/cli-commands#max-inbound-peers) |
| [max-outbound-peers](/docs/edge/get-started/cli-commands#max-outbound-peers) | [max-enqueued](/docs/edge/get-started/cli-commands#max-enqueued) |
| [log-level](/docs/edge/get-started/cli-commands#log-level) | [log-to](/docs/edge/get-started/cli-commands#log-to) |
| [চেইন](/docs/edge/get-started/cli-commands#chain) | [যোগদান](/docs/edge/get-started/cli-commands#join) |
| [nat](/docs/edge/get-started/cli-commands#nat) | [dns](/docs/edge/get-started/cli-commands#dns) |
| [price-limit](/docs/edge/get-started/cli-commands#price-limit) | [max-slots](/docs/edge/get-started/cli-commands#max-slots) |
| [কনফিগ](/docs/edge/get-started/cli-commands#config) | [secrets-config](/docs/edge/get-started/cli-commands#secrets-config) |
| [dev](/docs/edge/get-started/cli-commands#dev) | [dev-interval](/docs/edge/get-started/cli-commands#dev-interval) |
| [no-discover](/docs/edge/get-started/cli-commands#no-discover) | [পুনরুদ্ধার](/docs/edge/get-started/cli-commands#restore) |
| [block-time](/docs/edge/get-started/cli-commands#block-time) | [access-control-allow-origins](/docs/edge/get-started/cli-commands#access-control-allow-origins) |


#### <h4></h4><i>data-dir</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--data-dir DATA_DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    server --data-dir ./example-dir

</TabItem>
</Tabs>

Polygon Edge ক্লায়েন্ট ডেটা সংরক্ষণ করার জন্য ব্যবহৃত ডাটা ডিরেক্টরি নির্দিষ্ট করতে ব্যবহৃত হয়। ডিফল্ট: `./test-chain`।

---


#### <h4></h4><i>jsonrpc</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--jsonrpc JSONRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    server --jsonrpc 127.0.0.1:10000

</TabItem>
</Tabs>

JSON-RPC পরিষেবা `address:port`-এর জন্য ঠিকানা এবং পোর্ট সেট করে।   
শুধুমাত্র একটি পোর্ট `:10001`-এ সংজ্ঞায়িত করা হয়, তাহলে এটি সমস্ত `0.0.0.0:10001` ইন্টারফেসে বাইন্ড করবে।   
যদি বাদ দেওয়া হয়, তবে পরিষেবাটি ডিফল্ট মান `address:port` দিয়ে বাইন্ড করবে।   
ডিফল্ট ঠিকানা: `0.0.0.0:8545`।

---

#### <h4></h4><i>json-rpc-block-range-limit</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--json-rpc-block-range-limit BLOCK_RANGE]

</TabItem>
  <TabItem value="example" label="Example">

    server --json-rpc-block-range-limit 1500

</TabItem>
</Tabs>

json-rpc অনুরোধ সম্পাদন করার সময় সর্বাধিক ব্লক পরিসীমা বিবেচনা করা হবে যা fromBlock/toBlock মান (e.g. eth_getLogs) অন্তর্ভুক্ত করে। ডিফল্ট:`1000`।

---

#### <h4></h4><i>json-rpc-batch-request-limit</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--json-rpc-batch-request-limit MAX_LENGTH]

</TabItem>
  <TabItem value="example" label="Example">

    server --json-rpc-batch-request-limit 50

</TabItem>
</Tabs>

json-rpc ব্যাচ অনুরোধ পরিচালনা করার সময় সর্বোচ্চ দৈর্ঘ্য বিবেচনা করা হবে। ডিফল্ট: `20`।

---

#### <h4></h4><i>grpc</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    server --grpc-address 127.0.0.1:10001

</TabItem>
</Tabs>

gRPC পরিষেবাটির জন্য ঠিকানা এবং পোর্ট `address:port` সেট করে। ডিফল্ট ঠিকানা: `127.0.0.1:9632`।

---

#### <h4></h4><i>libp2p</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--libp2p LIBP2P_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    server --libp2p 127.0.0.1:10002

</TabItem>
</Tabs>

libp2p পরিষেবাটির জন্য ঠিকানা এবং পোর্ট `address:port` সেট করে। ডিফল্ট ঠিকানা: `127.0.0.1:1478`।

---

#### <h4></h4><i>prometheus</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--prometheus PROMETHEUS_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    server --prometheus 127.0.0.1:10004

</TabItem>
</Tabs>

Prometheus সার্ভার `address:port` এর জন্য ঠিকানা এবং পোর্ট সেট করে।   
যদি শুধুমাত্র একটি পোর্ট `:5001` এ সংজ্ঞায়িত করা হয়, তাহলে সার্ভিসটি সব `0.0.0.0:5001` ইন্টারফেসকে বাইন্ড করবে।   
যদি বাদ দেওয়া হয়, তবে পরিষেবাটি চালু হবে না।

---

#### <h4></h4><i>block-gas-target</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--block-gas-target BLOCK_GAS_TARGET]

</TabItem>
  <TabItem value="example" label="Example">

    server --block-gas-target 10000000

</TabItem>
</Tabs>

চেইনের জন্য টার্গেট ব্লক গ্যাস সীমা সেট করে। ডিফল্ট (প্রয়োগ করা হয় না): `0`।

ব্লক গ্যাস টার্গেটের উপর একটি আরো বিস্তারিত ব্যাখ্যা [TxPool বিভাগে](/docs/edge/architecture/modules/txpool#block-gas-target) পাওয়া যেতে পারে।

---

#### <h4></h4><i>max-peers</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--max-peers PEER_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    server --max-peers 40

</TabItem>
</Tabs>

ক্লায়েন্টের সর্বোচ্চ পিয়ারের সংখ্যা সেট করে। ডিফল্ট: `40`।

পিয়ার সীমা `max-inbound/outbound-peers` বা `max-peers` ফ্ল্যাগ ব্যবহার করে নির্দিষ্ট করা উচিত।

---

#### <h4></h4><i>max-inbound-peers</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--max-inbound-peers PEER_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    server --max-inbound-peers 32

</TabItem>
</Tabs>

ক্লায়েন্টের সর্বোচ্চ ইনবাউন্ড পিয়ারের সংখ্যা সেট করে। যদি `max-peers` সেট করা হয়, তাহলে নিম্নলিখিত সূত্র ব্যবহার করে সর্বোচ্চ-ইনবাউন্ড-পিয়ার সীমা গণনা করা হয়।

`max-inbound-peer = InboundRatio * max-peers` হচ্ছে `0.8` যেখানে `InboundRatio`।

---

#### <h4></h4><i>max-outbound-peers</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--max-outbound-peers PEER_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    server --max-outbound-peers 8

</TabItem>
</Tabs>

ক্লায়েন্টের সর্বোচ্চ আউটবাউন্ড পিয়ারের সংখ্যা সেট করে। যদি `max-peers` সেট করা হয়, তাহলে নিম্নলিখিত সূত্র ব্যবহার করে সর্বোচ্চ-আউটবাউন্ড-পিয়ার গণনা করা হয়।

`max-outbound-peer = OutboundRatio * max-peers` হচ্ছে `0.2` যেখানে `OutboundRatio`।

---

#### <h4></h4><i>max-enqueued</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--max-enqueued ENQUEUED_TRANSACTIONS]

</TabItem>
  <TabItem value="example" label="Example">

    server --max-enqueued 210

</TabItem>
</Tabs>

প্রতি অ্যাকাউন্টে এনকিউ করা লেনদেনের সর্বোচ্চ সংখ্যা সেট করে। ডিফল্ট:`128`।

---

#### <h4></h4><i>log-level</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--log-level LOG_LEVEL]

</TabItem>
  <TabItem value="example" label="Example">

    server --log-level DEBUG

</TabItem>
</Tabs>

কনসোল আউটপুটের জন্য লগের লেভেল সেট করে। ডিফল্ট: `INFO`।

---

#### <h4></h4><i>log-to</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--log-to LOG_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    server --log-to node.log

</TabItem>
</Tabs>

সার্ভার কমান্ড থেকে সমস্ত লগ আউটপুট ধারণকারী লগ ফাইলের নামকে সংজ্ঞায়িত করে।
ডিফল্টরূপে, সমস্ত সার্ভার লগ কনসোলে (stdout) আউটপুট করা হবে,
তবে যদি ফ্ল্যাগ সেট করা হয়, তাহলে সার্ভার কমান্ড চালানোর সময় কনসোলে কোন আউটপুট হবে না।

---

#### <h4></h4><i>চেইন</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    server --chain /home/ubuntu/genesis.json

</TabItem>
</Tabs>

চেইন শুরু করার জন্য ব্যবহৃত জেনেসিস ফাইল নির্দিষ্ট করে। ডিফল্ট: `./genesis.json`।

---

#### <h4></h4><i>যোগদান</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--join JOIN_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    server --join /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

পিয়ারের ঠিকানা নির্দিষ্ট করে যা যোগ করা উচিত।

---

#### <h4></h4><i>nat</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--nat NAT_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    server --nat 192.0.2.1

</TabItem>
</Tabs>

পোর্ট ছাড়া বহিরাগত আইপি ঠিকানা সেট করে, কারণ এটি পিয়ার্স দ্বারা দেখা যেতে পারে।

---

#### <h4></h4><i>dns</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--dns DNS_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    server --dns dns4/example.io

</TabItem>
</Tabs>

হোস্ট DNS ঠিকানা সেট করে। এটি একটি বহিরাগত DNS বিজ্ঞাপন করার জন্য ব্যবহার করা যেতে পারে। `dns`,`dns4`,`dns6` সমর্থন করে।

---

#### <h4></h4><i>price-limit</i>


<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--price-limit PRICE_LIMIT]

</TabItem>
  <TabItem value="example" label="Example">

    server --price-limit 10000

</TabItem>
</Tabs>

পুলের মধ্যে স্বীকৃতির জন্য প্রয়োগ করার জন্য ন্যূনতম গ্যাসের মূল্যের সীমা সেট করে।  ডিফল্ট: `1`।

---

#### <h4></h4><i>max-slots</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--max-slots MAX_SLOTS]

</TabItem>
  <TabItem value="example" label="Example">

    server --max-slots 1024

</TabItem>
</Tabs>

পুলের মধ্যে সর্বোচ্চ স্লট সেট করে। ডিফল্ট: `4096`।

---

#### <h4></h4><i>কনফিগ</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--config CLI_CONFIG_PATH]

</TabItem>
  <TabItem value="example" label="Example">

    server --config ./myConfig.json

</TabItem>
</Tabs>

CLI কনফিগের পাথ নির্দিষ্ট করে। `.json` সমর্থন করে।

---

#### <h4></h4><i>secrets-config</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--secrets-config SECRETS_CONFIG]

</TabItem>
  <TabItem value="example" label="Example">

    server --secrets-config ./secretsManagerConfig.json

</TabItem>
</Tabs>

SecretsManager কনফিগ ফাইলের পাথ সেট করে। Hashicorp Vault, AWS SSM এবং GCP সিক্রেট ম্যানেজারের জন্য ব্যবহৃত হয়। যদি বাদ দেওয়া হয়, তাহলে স্থানীয় FS সিক্রেট ম্যানেজার ব্যবহার করা হয়।

---

#### <h4></h4><i>dev</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--dev DEV_MODE]

</TabItem>
  <TabItem value="example" label="Example">

    server --dev

</TabItem>
</Tabs>

ক্লায়েন্ট dev মোডে সেট করে। ডিফল্ট: `false`। dev মোডে, ডিফল্টরূপে পিয়ারের আবিষ্কার নিষ্ক্রিয় করা হয়।

---

#### <h4></h4><i>dev-interval</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--dev-interval DEV_INTERVAL]

</TabItem>
  <TabItem value="example" label="Example">

    server --dev-interval 20

</TabItem>
</Tabs>

সেকেন্ডে ক্লায়েন্টের dev নোটিফিকেশনের ইন্টারভেল সেট করে। ডিফল্ট: `0`।

---

#### <h4></h4><i>no-discover</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--no-discover NO_DISCOVER]

</TabItem>
  <TabItem value="example" label="Example">

    server --no-discover

</TabItem>
</Tabs>

অন্যান্য পিয়ার্স আবিষ্কার করতে ক্লায়েন্টকে বাধা দেয়। ডিফল্ট: `false`।

---

#### <h4></h4><i>পুনরুদ্ধার</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--restore RESTORE]

</TabItem>
  <TabItem value="example" label="Example">

    server --restore backup.dat

</TabItem>
</Tabs>

নির্দিষ্ট আর্কাইভ ফাইল থেকে ব্লক পুনরুদ্ধার করুন

---

#### <h4></h4><i>block-time</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--block-time BLOCK_TIME]

</TabItem>
  <TabItem value="example" label="Example">

    server --block-time 1000

</TabItem>
</Tabs>

সেকেন্ডে ব্লক উত্পাদনের সময় সেট করে। ডিফল্ট: `2`

---

#### <h4></h4><i>access-control-allow-origins</i>
<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--access-control-allow-origins ACCESS_CONTROL_ALLOW_ORIGINS]

</TabItem>
  <TabItem value="example" label="Example">

    server --access-control-allow-origins "https://edge-docs.polygon.technology"

</TabItem>
</Tabs>

JSON-RPC অনুরোধ থেকে প্রতিক্রিয়া শেয়ার করতে অনুমোদিত ডোমেন সেট করে।   
একাধিক ডোমেন অনুমোদন করতে একাধিক `--access-control-allow-origins "https://example1.com" --access-control-allow-origins "https://example2.com"` ফ্ল্যাগ যোগ করুন।   
যদি বাদ দেওয়া Access-Control-Allow-Origins হেডার `*` এ সেট করা হলে সমস্ত ডোমেন অনুমোদন করা হবে।

---

### জেনেসিস ফ্ল্যাগ {#genesis-flags}
| **সকল জেনেসিস ফ্ল্যাগ** |
|---------------------------------------|---------------------------------------------|
| [dir](/docs/edge/get-started/cli-commands#dir) | [নাম](/docs/edge/get-started/cli-commands#name) |
| [pos](/docs/edge/get-started/cli-commands#pos) | [epoch-size](/docs/edge/get-started/cli-commands#epoch-size) |
| [premine](/docs/edge/get-started/cli-commands#premine) | [chainid](/docs/edge/get-started/cli-commands#chainid) |
| [ibft-validator-type](/docs/edge/get-started/cli-commands#ibft-validator-type) | [ibft-validators-prefix-path](/docs/edge/get-started/cli-commands#ibft-validators-prefix-path) |
| [ibft-validator](/docs/edge/get-started/cli-commands#ibft-validator) | [block-gas-limit](/docs/edge/get-started/cli-commands#block-gas-limit) |
| [কনসেনসাস](/docs/edge/get-started/cli-commands#consensus) | [bootnode](/docs/edge/get-started/cli-commands#bootnode) |
| [max-validator-count](/docs/edge/get-started/cli-commands#max-validator-count) | [min-validator-count](/docs/edge/get-started/cli-commands#min-validator-count) |


#### <h4></h4><i>dir</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--dir DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --dir ./genesis.json

</TabItem>
</Tabs>

Polygon Edge জেনেসিস ডেটার জন্য ডিরেক্টরি সেট করে। ডিফল্ট: `./genesis.json`।

---

#### <h4></h4><i>নাম</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--name NAME]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --name test-chain

</TabItem>
</Tabs>

চেইনের নাম সেট করে। ডিফল্ট: `polygon-edge`।

---

#### <h4></h4><i>pos</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--pos IS_POS]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --pos

</TabItem>
</Tabs>

ফ্ল্যাগ সেট করে যা প্রুফ অফ স্ট্যাক IBFT ব্যবহার করতে হবে বলে ইঙ্গিত করে।
যদি ফ্ল্যাগ প্রদান করা না হয় বা `false` হয়, তাহলে ডিফল্ট প্রুফ অফ অথোরিটিতে ফিরে যায়।

---

#### <h4></h4><i>epoch-size</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--epoch-size EPOCH_SIZE]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --epoch-size 50

</TabItem>
</Tabs>

চেইনের জন্য epoch আকার সেট করে। ডিফল্ট `100000`।

---

#### <h4></h4><i>premine</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--premine ADDRESS:VALUE]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --premine 0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000

</TabItem>
</Tabs>

`address:amount` ফরম্যাটে আগে থেকে মাইন করা অ্যাকাউন্ট এবং ব্যলেন্স সেট করে।
পরিমাণটি দশমিক বা হেক্সে প্রকাশ করা হবে।
ডিফল্ট প্রি-মাইন ব্যালেন্স: `0xD3C21BCECCEDA1000000`(1 মিলিয়ন নেটিভ মুদ্রার টোকেন)।

---

#### <h4></h4><i>chainid</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--chain-id CHAIN_ID]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --chain-id 200

</TabItem>
</Tabs>

চেইনের আইডি সেট করে। ডিফল্ট: `100`।

---

#### <h4></h4><i>ibft-validator-type</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--ibft-validator-type IBFT_VALIDATOR_TYPE]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --ibft-validator-type ecdsa

</TabItem>
</Tabs>

ব্লক হেডারের বৈধতা মোড নির্দিষ্ট করে। সম্ভাব্য মান: `[ecdsa, bls]`। ডিফল্ট: `bls`।

---

#### <h4></h4><i>ibft-validators-prefix-path</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--ibft-validators-prefix-path IBFT_VALIDATORS_PREFIX_PATH]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --ibft-validators-prefix-path test-chain-

</TabItem>
</Tabs>

যাচাইকারী ফোল্ডার ডিরেক্টরির আগে থেকে নির্ধারিত পাথ। `ibft-validator` ফ্ল্যাগ বাদ দেওয়া হলে উপস্থিত থাকতে হবে।

---

#### <h4></h4><i>ibft-validator</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--ibft-validator IBFT_VALIDATOR_LIST]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --ibft-validator 0xC12bB5d97A35c6919aC77C709d55F6aa60436900

</TabItem>
</Tabs>

IBFT যাচাইকারী হিসাবে ঠিকানা পাস করে। `ibft-validators-prefix-path` ফ্ল্যাগ বাদ দেওয়া হলে উপস্থিত থাকতে হবে।
1. যদি নেটওয়ার্ক ECDSA দিয়ে চলমান হয়, তাহলে ফরম্যাটটি হবে `--ibft-validator [ADDRESS]`।
2. যদি নেটওয়ার্ক BLS দিয়ে চলমান হয়, তাহলে ফরম্যাটটি হবে `--ibft-validator [ADDRESS]:[BLS_PUBLIC_KEY]`।

---

#### <h4></h4><i>block-gas-limit</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--block-gas-limit BLOCK_GAS_LIMIT]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --block-gas-limit 5000000

</TabItem>
</Tabs>

একটি ব্লকে সমস্ত অপারেশন দ্বারা ব্যবহৃত সর্বোচ্চ পরিমাণ গ্যাস দেখুন। ডিফল্ট: `5242880`।

---

#### <h4></h4><i>কনসেনসাস</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--consensus CONSENSUS_PROTOCOL]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --consensus ibft

</TabItem>
</Tabs>

কনসেনসাস প্রোটোকল সেট করে। ডিফল্ট: `pow`।

---

#### <h4></h4><i>bootnode</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--bootnode BOOTNODE_URL]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --bootnode /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

p2p ডিসকভারি বুটস্ট্র্যাপের জন্য Multiaddr URL। এই ফ্ল্যাগটি একাধিক বার ব্যবহার করা যেতে পারে।
একটি আইপি ঠিকানার পরিবর্তে, bootnode DNS ঠিকানা প্রদান করা যেতে পারে।

---

#### <h4></h4><i>max-validator-count</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--max-validator-count MAX_VALIDATOR_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --max-validator-count 42

</TabItem>
</Tabs>

একটি PoS কনসেনসাসের যাচাইকারীর সেটে যোগ করতে সক্ষম সর্বোচ্চ স্ট্যাকারের সংখ্যা।
এই সংখ্যা MAX_SAFE_INTEGER (2^53 - 2) মান অতিক্রম করতে পারবে না।

---

#### <h4></h4><i>min-validator-count</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--min-validator-count MIN_VALIDATOR_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --min-validator-count 4

</TabItem>
</Tabs>

একটি PoS কনসেনসাসের যাচাইকারী সেটে যোগ করতে সক্ষম সর্বনিম্ন স্ট্যাকারের সংখ্যা।
এই সংখ্যা max-validator-count মান অতিক্রম করতে পারবে না।
1-এ ডিফল্ট হবে।

---

### জেনেসিস প্রি-ডিপ্লয় ফ্ল্যাগ {#genesis-predeploy-flags}

<h4><i>artifacts-path</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis predeploy [--artifacts-path PATH_TO_ARTIFACTS]

</TabItem>
  <TabItem value="example" label="Example">

    genesis predeploy --artifacts-path ./ArtifactsData.json

</TabItem>
</Tabs>

চুক্তি artifacts JSON পথ সেট করে যাতে `abi`, `bytecode` এবং `deployedBytecode` থাকে।

---

<h4><i>চেইন</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis predeploy [--chain PATH_TO_GENESIS]

</TabItem>
  <TabItem value="example" label="Example">

    genesis predeploy --chain ./genesis.json

</TabItem>
</Tabs>

`genesis.json` ফাইলের পাথ সেট করে যা আপডেট করা উচিত। ডিফল্ট `./genesis.json`।

---

<h4><i>constructor-args</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis predeploy [--constructor-args CONSTRUCTOR_ARGUMENT]

</TabItem>
  <TabItem value="example" label="Example">

    genesis predeploy --constructor-args 123

</TabItem>
</Tabs>

যদি থাকে তবে স্মার্ট চুক্তি কনস্ট্রাক্টর আর্গুমেন্ট সেট করে। এই আর্গুমেন্ট কীরকম দেখতে উচিত তার উপর একটি বিস্তারিত নির্দেশিকার জন্য, [প্রিডিপ্লয়মেন্ট নিবন্ধটি](/docs/edge/additional-features/predeployment) দেখুন।

---

<h4><i>predeploy-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis predeploy [--predeploy-address PREDEPLOY_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    genesis predeploy --predeploy-address 0x5555

</TabItem>
</Tabs>

এতে প্রিডিপ্লয়ের ঠিকানা সেট করে। ডিফল্ট `0x0000000000000000000000000000000000001100`।

---


## অপারেটর কমান্ড {#operator-commands}

### পিয়ার কমান্ড {#peer-commands}

| **কমান্ড** | **বিবরণ** |
|------------------------|-------------------------------------------------------------------------------------|
| পিয়ার যোগ | পিয়ারদের libp2p ঠিকানা ব্যবহার করে একটি নতুন পিয়ার যোগ করে |
| পিয়ারের তালিকা | ক্লায়েন্ট libp2p দ্বারা সংযুক্ত থাকা সকল পিয়ারে তালিকা করে |
| পিয়ারের স্ট্যাটাস | libp2p ঠিকানা ব্যবহার করে পিয়ার তালিকা থেকে একটি নির্দিষ্ট পিয়ারের স্ট্যাটাস ফেরত পাঠায় |

<h3>পিয়াররা ফ্ল্যাগ যোগ করেন</h3>

<h4><i>addr</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers add --addr PEER_ADDRESS

</TabItem>
  <TabItem value="example" label="Example">

    peers add --addr /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

পিয়ারের libp2p ঠিকানা multiaddr ফরম্যাটে আছে।

---

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers add [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    peers add --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API-এর ঠিকানা। ডিফল্ট: `127.0.0.1:9632`।

<h3>পিয়ারের তালিকার ফ্ল্যাগ</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers list [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    peers list --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API-এর ঠিকানা। ডিফল্ট: `127.0.0.1:9632`।

<h3>পিয়ার স্ট্যাটাসের ফ্ল্যাগ</h3>

<h4><i>peer-id</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers status --peer-id PEER_ID

</TabItem>
  <TabItem value="example" label="Example">

    peers status --peer-id 16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

p2p নেটওয়ার্কের মধ্যে একটি নির্দিষ্ট পিয়ারের Libp2p নোড আইডি।

---

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    peers status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API-এর ঠিকানা। ডিফল্ট: `127.0.0.1:9632`।

### IBFT কমান্ড {#ibft-commands}

| **কমান্ড** | **বিবরণ** |
|------------------------|-------------------------------------------------------------------------------------|
| ibft স্ন্যাপশট | IBFT স্ন্যাপশট ফেরত পাঠায় |
| ibft ক্যান্ডিডেট | এই কমান্ডটি প্রস্তাবিত ক্যান্ডিডেটের পাশাপাশি এখনও অন্তর্ভুক্ত না হওয়া ক্যান্ডিডেটদের বর্তমান সেটকে কুয়েরি করে থাকে |
| ibft প্রস্তাব | যাচাইকারীর সেট থেকে একটি নতুন ক্যান্ডিডেট যোগ/অপসারণের প্রস্তাব করে |
| ibft স্ট্যাটাস | IBFT ক্লায়েন্টের সামগ্রিক স্ট্যাটাস ফেরত পাঠায় |
| ibft সুইচ | IBFT টাইপ সুইচ করতে genesis.json ফাইলে ফর্ক কনফিগারেশন যোগ করুন |
| ibft কোরাম | ব্লক নাম্বার নির্দিষ্ট করে, যার মধ্যে সবচেয়ে উপযুক্ত কোরাম সাইজ পদ্ধতি ব্যবহৃত হবে কনসেনসাসে পৌঁছানোর জন্য |


<h3>ibft স্ন্যাপশট ফ্ল্যাগ</h3>

<h4><i>সংখ্যা</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft snapshot [--number BLOCK_NUMBER]

</TabItem>
  <TabItem value="example" label="Example">

    ibft snapshot --number 100

</TabItem>
</Tabs>

স্ন্যাপশটের জন্য ব্লকের উচ্চতা (সংখ্যা)

---

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft snapshot [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    ibft snapshot --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API-এর ঠিকানা। ডিফল্ট: `127.0.0.1:9632`।

<h3>ibft ক্যান্ডিডেটদের ফ্ল্যাগ</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft candidates [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    ibft candidates --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API-এর ঠিকানা। ডিফল্ট: `127.0.0.1:9632`।

<h3>ibft প্রস্তাবের ফ্ল্যাগ</h3>

<h4><i>ভোট</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft propose --vote VOTE

</TabItem>
  <TabItem value="example" label="Example">

    ibft propose --vote auth

</TabItem>
</Tabs>

যাচাইকারীর সেটে একটি পরিবর্তনের প্রস্তাব করে। সম্ভাব্য মান: `[auth, drop]`।

---

<h4><i>addr</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft propose --addr ETH_ADDRESS

</TabItem>
  <TabItem value="example" label="Example">

    ibft propose --addr 0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7

</TabItem>
</Tabs>

যে অ্যাকাউন্টের ঠিকানার জন্য ভোট করা হবে।

---

<h4><i>bls</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft propose --bls BLS_PUBLIC_KEY

</TabItem>
  <TabItem value="example" label="Example">

    ibft propose --bls 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf

</TabItem>
</Tabs>

যে অ্যাকাউন্টের BLS পাবলিক কী'র জন্য ভোট করা হবে, শুধুমাত্র BLS মোডে প্রয়োজনীয়।

---

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft candidates [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    ibft candidates --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API-এর ঠিকানা। ডিফল্ট: `127.0.0.1:9632`।

<h3>ibft স্ট্যাটাসের ফ্ল্যাগ</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    ibft status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API-এর ঠিকানা। ডিফল্ট: `127.0.0.1:9632`।

<h3>ibft সুইচ ফ্ল্যাগ</h3>

<h4><i>চেইন</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --chain genesis.json

</TabItem>
</Tabs>

আপডেট করার জন্য জেনেসিস ফাইল নির্দিষ্ট করে। ডিফল্ট: `./genesis.json`।

---

<h4><i>প্রকার</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--type TYPE]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --type PoS

</TabItem>
</Tabs>

সুইচ করার জন্য IBFT টাইপ নির্দিষ্ট করে। সম্ভাব্য মান: `[PoA, PoS]`।

---

<h4><i>ডিপ্লয়মেন্ট</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--deployment DEPLOYMENT]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --deployment 100

</TabItem>
</Tabs>

চুক্তি ডিপ্লয়মেন্টের উচ্চতা নির্দিষ্ট করে। শুধুমাত্র PoS-এ পাওয়া যাচ্ছে।

---

<h4><i>প্রেরক</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--from FROM]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --from 200

</TabItem>
</Tabs>

---

<h4><i>ibft-validator-type</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

     ibft switch [--ibft-validator-type IBFT_VALIDATOR_TYPE]

</TabItem>
  <TabItem value="example" label="Example">

     ibft switch --ibft-validator-type ecdsa

</TabItem>
</Tabs>

ব্লক হেডারের বৈধতা মোড নির্দিষ্ট করে। সম্ভাব্য মান: `[ecdsa, bls]`। ডিফল্ট: `bls`।

---

<h4><i>ibft-validators-prefix-path</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

     ibft switch [--ibft-validators-prefix-path IBFT_VALIDATORS_PREFIX_PATH]

</TabItem>
  <TabItem value="example" label="Example">

     ibft switch --ibft-validators-prefix-path test-chain-

</TabItem>
</Tabs>

নতুন যাচাইকারীদের ডিরেক্টরি জন্য পথ প্রিফিক্স করে। `ibft-validator` ফ্ল্যাগ বাদ দেওয়া হলে উপস্থিত থাকতে হবে। শুধুমাত্র IBFT মোড PoA হলেই পাওয়া যায় (`--pos` ফ্ল্যাগ বাদ দেওয়া হয়)।

---

<h4><i>ibft-validator</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

     ibft switch [--ibft-validator IBFT_VALIDATOR_LIST]

</TabItem>
  <TabItem value="example" label="Example">

     ibft switch --ibft-validator 0xC12bB5d97A35c6919aC77C709d55F6aa60436900

</TabItem>
</Tabs>

ঠিকানাগুলোতে পাস সেট করে কারণ ফর্কের পরে IBFT যাচাইকারী ব্যবহৃত হয়। `ibft-validators-prefix-path` ফ্ল্যাগ বাদ দেওয়া হলে উপস্থিত থাকতে হবে। শুধুমাত্র PoA মোডে পাওয়া যাচ্ছে।
1. যদি নেটওয়ার্ক ECDSA দিয়ে চলমান হয়, তাহলে ফরম্যাটটি হবে `--ibft-validator [ADDRESS]`।
2. যদি নেটওয়ার্ক BLS দিয়ে চলমান হয়, তাহলে ফরম্যাটটি হবে `--ibft-validator [ADDRESS][BLS_PUBLIC_KEY]`।

---

<h4><i>max-validator-count</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--max-validator-count MAX_VALIDATOR_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --max-validator-count 42

</TabItem>
</Tabs>

একটি PoS কনসেনসাসের যাচাইকারীর সেটে যোগ করতে সক্ষম সর্বোচ্চ স্ট্যাকারের সংখ্যা।
এই সংখ্যা MAX_SAFE_INTEGER (2^53 - 2) মান অতিক্রম করতে পারবে না।

---

<h4><i>min-validator-count</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--min-validator-count MIN_VALIDATOR_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --min-validator-count 4

</TabItem>
</Tabs>

একটি PoS কনসেনসাসের যাচাইকারী সেটে যোগ করতে সক্ষম সর্বনিম্ন স্ট্যাকারের সংখ্যা।
এই সংখ্যা max-validator-count মান অতিক্রম করতে পারবে না।
1-এ ডিফল্ট হবে।

ফর্কের শুরুর উচ্চতা নির্দিষ্ট করে।

---

<h3>ibft কোরাম পতাকা</h3>

<h4><i>প্রেরক</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft quorum [--from your_quorum_switch_block_num]

</TabItem>
  <TabItem value="example" label="Example">

    ibft quorum --from 350

</TabItem>
</Tabs>

কোরাম গণনা থেকে QuorumOptimal এ সুইচ করার উচ্চতা, যা `(2/3 * N)` সূত্র ব্যবহার করে, এখানে `N` হচ্ছে যাচাইকারী নোডের সংখ্যা। অনুগ্রহ করে মনে রাখবেন যে এটি পূর্ববর্তী সংস্করণ সমর্থন করে না, অর্থাৎ শুধুমাত্র একটি নির্দিষ্ট ব্লক উচ্চতা পর্যন্ত একটি কোরাম লিগেসি গণনা ব্যবহার করা চেইনেই এটি সমর্থন করে।

---

<h4><i>চেইন</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft quorum [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    ibft quorum --chain genesis.json

</TabItem>
</Tabs>

আপডেট করার জন্য জেনেসিস ফাইল নির্দিষ্ট করে। ডিফল্ট: `./genesis.json`।

### লেনদেন পুলের কমান্ড {#transaction-pool-commands}

| **কমান্ড** | **বিবরণ** |
|------------------------|--------------------------------------------------------------------------------------|
| txpool স্ট্যাটাস | পুলে লেনদেনের সংখ্যা ফেরত পাঠায় |
| txpool সাবস্ক্রাইব | লেনদেনের পুলে ইভেন্টগুলির জন্য সাবস্ক্রাইব করে |

<h3>txpool স্ট্যাটাসের পতাকা</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    txpool status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API-এর ঠিকানা। ডিফল্ট: `127.0.0.1:9632`।

<h3>txpool সাবস্ক্রাইব ফ্ল্যাগ</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API-এর ঠিকানা। ডিফল্ট: `127.0.0.1:9632`।

---

<h4><i>প্রোমোট</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--promoted LISTEN_PROMOTED]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --promoted

</TabItem>
</Tabs>

TxPool-এ প্রোমোট করা tx ইভেন্টের জন্য সাবস্ক্রাইব করে।

---

<h4><i>ড্রপ</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--dropped LISTEN_DROPPED]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --dropped

</TabItem>
</Tabs>

TxPool-এ ড্রপ করা tx ইভেন্টগুলোর জন্য সাবস্ক্রাইব করে।

---

<h4><i>ডিমোট</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--demoted LISTEN_DEMOTED]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --demoted

</TabItem>
</Tabs>

TxPool-এ ডিমোট করা tx ইভেন্টগুলোর জন্য সাবস্ক্রাইব করে।

---

<h4><i>যোগ</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--added LISTEN_ADDED]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --added

</TabItem>
</Tabs>

TxPool-এ যোগ করা tx ইভেন্টগুলোর জন্য সাবস্ক্রাইব করে।

---

<h4><i>এনকিউ</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--enqueued LISTEN_ENQUEUED]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --enqueued

</TabItem>
</Tabs>

অ্যাকাউন্ট কিউতে এনকিউ করা tx ইভেন্টগুলোর জন্য সাবস্ক্রাইব করে।

---

### ব্লকচেইন কমান্ড {#blockchain-commands}

| **কমান্ড** | **বিবরণ** |
|------------------------|-------------------------------------------------------------------------------------|
| স্ট্যাটাস | ক্লায়েন্টের স্ট্যাটাস ফেরত পাঠায়। বিস্তারিত প্রতিক্রিয়া নিচে পাবেন |
| মনিটর | একটি blockchain ইভেন্ট স্ট্রিমে সাবস্ক্রাইব করে। বিস্তারিত প্রতিক্রিয়া নিচে পাবেন |
| সংস্করণ | ক্লায়েন্টের বর্তমান সংস্করণ ফেরত পাঠায় |

<h3>স্ট্যাটাসের ফ্ল্যাগ</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API-এর ঠিকানা। ডিফল্ট: `127.0.0.1:9632`।

<h3>মনিটর ফ্ল্যাগ</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    monitor [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    monitor --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API-এর ঠিকানা। ডিফল্ট: `127.0.0.1:9632`।

---
<h3>সংস্করণ কমান্ড</h3>


<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    version

</TabItem>
</Tabs>

রিলিজ সংস্করণ, git branch, commit hash এবং বিল্ড টাইম প্রদর্শন করে।

## সিক্রেট কমান্ড {#secrets-commands}

| **কমান্ড** | **বিবরণ** |
|-------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| সিক্রেট init | সংশ্লিষ্ট সিক্রেট ম্যানেজারে প্রাইভেট কী চালু করে |
| সিক্রেট তৈরি | একটি সিক্রেট ম্যানেজার কনফিগারেশন ফাইল তৈরি করে যা Polygon Edge দ্বারা পার্স করা যেতে পারে |
| সিক্রেট আউটপুট | রেফারেন্স জন্য BLS পাবলিক কী ঠিকানা, যাচাইকারী পাবলিক কী ঠিকানা এবং নোড আইডি প্রিন্ট করে |

### সিক্রেট init ফ্ল্যাগ {#secrets-init-flags}

<h4><i>কনফিগ</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets init [--config SECRETS_CONFIG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets init --config ./secretsManagerConfig.json

</TabItem>
</Tabs>

SecretsManager কনফিগ ফাইলের পাথ সেট করে। Hashicorp ভল্টের জন্য ব্যবহৃত হয়। যদি বাদ দেওয়া হয়, তাহলে স্থানীয় FS সিক্রেট ম্যানেজার ব্যবহার করা হয়।

---

<h4><i>data-dir</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets init [--data-dir DATA_DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    secrets init --data-dir ./example-dir

</TabItem>
</Tabs>

স্থানীয় FS ব্যবহার করা হলে Polygon Edge তথ্যের জন্য ডিরেক্টরি সেট করে।

---

<h4><i>ecdsa</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets init [--ecdsa FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets init --ecdsa=false

</TabItem>
</Tabs>

একটি ECDSA কী তৈরি করতে হবে কিনা তা নির্দেশ করার জন্য ফ্ল্যাগ সেট করে। ডিফল্ট: `true`।

---

<h4><i>নেটওয়ার্ক</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets init [--network FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets init --network=false

</TabItem>
</Tabs>

একটি Libp2p নেটওয়ার্ক কী তৈরি করতে হবে কিনা তা নির্দেশ করে ফ্ল্যাগ সেট করে। ডিফল্ট: `true`।

---

<h4><i>bls</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets init [--bls FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets init --bls

</TabItem>
</Tabs>

একটি BLS কী তৈরি করতে হবে কিনা তা নির্দেশ করে ফ্ল্যাগ সেট করে। ডিফল্ট: `true`।

### সিক্রেট তৈরির ফ্ল্যাগ {#secrets-generate-flags}

<h4><i>dir</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--dir DATA_DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --dir ./example-dir

</TabItem>
</Tabs>

সিক্রেট ম্যানেজার কনফিগারেশন ফাইলের ডিরেক্টরি সেট করে। ডিফল্ট: `./secretsManagerConfig.json`

---

<h4><i>প্রকার</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--type TYPE]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --type hashicorp-vault

</TabItem>
</Tabs>

সিক্রেট ম্যানেজারের ধরন নির্দিষ্ট করে [`hashicorp-vault`]। ডিফল্ট: `hashicorp-vault`

---

<h4><i>টোকেন</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--token TOKEN]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --token s.zNrXa9zF9mgrdnClM7PZ19cu

</TabItem>
</Tabs>

সার্ভিসের জন্য অ্যাক্সেস টোকেন নির্দিষ্ট করে

---

<h4><i>server-url</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--server-url SERVER_URL]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --server-url http://127.0.0.1:8200

</TabItem>
</Tabs>

সার্ভিসের জন্য সার্ভার URL নির্দিষ্ট করে

---

<h4><i>নাম</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--name NODE_NAME]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --name node-1

</TabItem>
</Tabs>

সার্ভিসে-থাকা রেকর্ড কিপিংয়ের জন্য নোডের নাম নির্দিষ্ট করে। ডিফল্ট: `polygon-edge-node`

---

<h4><i>namespace</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--namespace NAMESPACE]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --namespace my-namespace

</TabItem>
</Tabs>

Hashicorp ভল্ট সিক্রেট ম্যানেজারের জন্য ব্যবহৃত namespace নির্দিষ্ট করে। ডিফল্ট: `admin`

### সিক্রেট আউটপুট ফ্ল্যাগ {#secrets-output-flags}

<h4><i>bls</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--bls FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --bls

</TabItem>
</Tabs>

শুধুমাত্র BLS পাবলিক কী আউটপুট করতে হবে কিনা তা নির্দেশ করে ফ্ল্যাগ সেট করে। ডিফল্ট: `true`

---

<h4><i>কনফিগ</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--config SECRETS_CONFIG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --config ./secretsManagerConfig.json

</TabItem>
</Tabs>

SecretsManager কনফিগ ফাইলের পাথ সেট করে। যদি বাদ দেওয়া হয়, তাহলে স্থানীয় FS সিক্রেট ম্যানেজার ব্যবহার করা হয়।

---

<h4><i>data-dir</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--data-dir DATA_DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --data-dir ./example-dir

</TabItem>
</Tabs>

স্থানীয় FS ব্যবহার করা হলে Polygon Edge তথ্যের জন্য ডিরেক্টরি সেট করে।

---

<h4><i>node-id</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--node-id FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --node-id

</TabItem>
</Tabs>

শুধুমাত্র নেটওয়ার্ক নোড আইডি আউটপুট করতে হবে কিনা তা নির্দেশ করে ফ্ল্যাগ সেট করে। ডিফল্ট: `true`

---

<h4><i>যাচাইকারী</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--validator FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --validator

</TabItem>
</Tabs>

শুধুমাত্র যাচাইকারী ঠিকানা আউটপুট করতে হবে কিনা তা নির্দেশ করে ফ্ল্যাগ সেট করে। ডিফল্ট: `true`

---

## প্রতিক্রিয়া {#responses}

### স্টাটাসের প্রতিক্রিয়া {#status-response}

প্রতিক্রিয়া অবজেক্টটি প্রোটোকল বাফার ব্যবহার করে সংজ্ঞায়িত করা হয়।
````go title="minimal/proto/system.proto"
message ServerStatus {
    int64 network = 1;

    string genesis = 2;

    Block current = 3;

    string p2pAddr = 4;

    message Block {
        int64 number = 1;
        string hash = 2;
    }
}
````

### প্রতিক্রিয়া মনিটর করুন {#monitor-response}
````go title="minimal/proto/system.proto"
message BlockchainEvent {
    // The "repeated" keyword indicates an array
    repeated Header added = 1;
    repeated Header removed = 2;

    message Header {
        int64 number = 1;
        string hash = 2;
    }
}
````

## ইউটিলিটি {#utilities}

### কমান্ড হোয়াইটলিস্ট করুন {#whitelist-commands}

| **কমান্ড** | **বিবরণ** |
|------------------------|-------------------------------------------------------------------------------------|
| হোয়াইটলিস্ট দেখান | হোয়াইলিস্টের তথ্য প্রদর্শন করে |
| হোয়াইটলিস্ট ডিপ্লয়মেন্ট | স্মার্ট চুক্তি ডিপ্লয়মেন্ট হোয়াইটলিস্ট আপডেট করে |

<h3> হোয়াইটলিস্ট দেখান </h3>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist show

</TabItem>
</Tabs>

হোয়াইটলিস্টের তথ্য প্রদর্শন করে।

---

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist show [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist show --chain genesis.json

</TabItem>
</Tabs>

আপডেট করার জন্য জেনেসিস ফাইল নির্দিষ্ট করে। ডিফল্ট: `./genesis.json`।

---

<h3> হোয়াইটলিস্ট ডিপ্লয়মেন্ট </h3>

<h4><i>চেইন</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist deployment [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist deployment --chain genesis.json

</TabItem>
</Tabs>

আপডেট করার জন্য জেনেসিস ফাইল নির্দিষ্ট করে। ডিফল্ট: `./genesis.json`।

---

<h4><i>যোগ</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist deployment [--add ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist deployment --add 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d

</TabItem>
</Tabs>

চুক্তি ডিপ্লয়মেন্ট হোয়াইটলিস্টে একটি নতুন ঠিকানা যোগ করে। শুধুমাত্র চুক্তি ডিপ্লয়মেন্ট হোয়াইটলিস্টে থাকা ঠিকানাগুলো চুক্তি ডিপ্লয় করতে পারে। যদি খালি থাক, তাহলে যেকোনো ঠিকানা চুক্তি ডিপ্লয়মেন্ট এক্সিকিউট করতে পারে

---

<h4><i>অপসারণ</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist deployment [--remove ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist deployment --remove 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d

</TabItem>
</Tabs>

চুক্তি ডিপ্লয়মেন্ট হোয়াইটলিস্ট থেকে একটি ঠিকানা অপসারণ করে। শুধুমাত্র চুক্তি ডিপ্লয়মেন্ট হোয়াইটলিস্টে থাকা ঠিকানাগুলো চুক্তি ডিপ্লয় করতে পারে। যদি খালি থাক, তাহলে যেকোনো ঠিকানা চুক্তি ডিপ্লয়মেন্ট এক্সিকিউট করতে পারে

---

### ব্যাকআপ ফ্ল্যাগ {#backup-flags}

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    backup [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    backup --grpc-address 127.0.0.1:9632

</TabItem>
</Tabs>

gRPC API-এর ঠিকানা। ডিফল্ট: `127.0.0.1:9632`।

---

<h4><i>আউট</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    backup [--out OUT]

</TabItem>
  <TabItem value="example" label="Example">

    backup --out backup.dat

</TabItem>
</Tabs>

সংরক্ষণ করতে হবে এমন আর্কাইভের ফাইলের পাথ।

---

<h4><i>প্রেরক</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    from [--from FROM]

</TabItem>
  <TabItem value="example" label="Example">

    backup --from 0x0

</TabItem>
</Tabs>

আর্কাইভে ব্লকের শুরু উচ্চতা। ডিফল্ট: 0।

---

<h4><i>প্রাপক</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    to [--to TO]

</TabItem>
  <TabItem value="example" label="Example">

    backup --to 0x2710

</TabItem>
</Tabs>

আর্কাইভে ব্লকের শেষ উচ্চতা।

---

## জেনেসিস টেমপ্লেট {#genesis-template}
জেনেসিস ফাইল ব্লকচেইনের প্রাথমিক অবস্থা সেট করতে ব্যবহার করা উচিত (যেমন, কিছু অ্যাকাউন্টের একটি প্রারম্ভিক ব্যালেন্স থাকবে কিনা)।

নিম্নলিখিত *./genesis.json* ফাইল তৈরি হয়:
````json
{
    "name": "example",
    "genesis": {
        "nonce": "0x0000000000000000",
        "gasLimit": "0x0000000000001388",
        "difficulty": "0x0000000000000001",
        "mixHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "coinbase": "0x0000000000000000000000000000000000000000",
        "parentHash": "0x0000000000000000000000000000000000000000000000000000000000000000"
    },
    "params": {
        "forks": {},
        "chainID": 100,
        "engine": {
            "pow": {}
        }
    },
    "bootnodes": []
}
````

### তথ্য ডিরেক্টরি {#data-directory}

*data-dir* ফ্ল্যাগ এক্সিকিউট করার সময়, একটি **test-chain** ফোল্ডার তৈরি হয়।
ফোল্ডারের স্ট্রাকচারটিতে নিম্নলিখিত সাব-ফোল্ডার রয়েছে:
* **ব্লকচেইন** - ব্লকচেইন অবজেক্টের LevelDB সংরক্ষণ করে
* **ট্রি** - Merkle ট্রি'র জন্য LevelDB সংরক্ষণ করে
* **keystore** - ক্লায়েন্টের জন্য প্রাইভেট কী সংরক্ষণ করে। এতে libp2p প্রাইভেট কী এবং সিলিং/যাচাইকারী প্রাইভেট কী অন্তর্ভুক্ত রয়েছে
* **কনসেনসাস** - কাজের সময় ক্লায়েন্টের প্রয়োজন হতে পারে এমন সকল কনসেনসাস তথ্য সংরক্ষণ করে

## রিসোর্স {#resources}
* **[প্রোটোকল বাফার](https://developers.google.com/protocol-buffers)**

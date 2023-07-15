---
id: set-up-ibft-on-the-cloud
title: ক্লাউড সেটআপ
description: "ধাপে ধাপে ক্লাউড সেটআপ গাইড"
keywords:
  - docs
  - polygon
  - edge
  - cloud
  - setup
  - genesis
---

:::info এই গাইড মেইননেট বা testnet সেটআপ জন্য

নীচের গাইড আপনাকে আপনার testnet বা মেইননেট একটি উত্পাদন সেটআপ জন্য একটি ক্লাউড প্রদানকারী একটি Polygon এজ নেটওয়ার্ক সেট আপ করার জন্য কিভাবে আপনাকে নির্দেশ করবে।

আপনি একটি উত্পাদন মত সেটআপ করার আগে দ্রুত `polygon-edge`পরীক্ষা করার জন্য স্থানীয়ভাবে একটি Polygon এজ নেটওয়ার্ক সেটআপ করতে চান, দয়া করে **[লোকাল সেটআপ](/docs/edge/get-started/set-up-ibft-locally)**
:::

## প্রয়োজনীয়তা {#requirements}

Polygon [Edge](/docs/edge/get-started/installation) ইনস্টল করার জন্য ইনস্টলেশন পড়ুন।

### VM সংযোগ স্থাপন করা {#setting-up-the-vm-connectivity}

ক্লাউড প্রদানকারী আপনার পছন্দ উপর নির্ভর করে, আপনি একটি ফায়ারওয়াল ব্যবহার করে VMs মধ্যে সংযোগ এবং নিয়ম সেট আপ করতে পারেন, নিরাপত্তা গ্রুপ, বা অ্যাক্সেস নিয়ন্ত্রণ তালিকা

অন্যান্য VMs উন্মুক্ত করা প্রয়োজন যে একমাত্র অংশ হিসাবে `polygon-edge`libp2p সার্ভার ডিফল্ট `1478`libp2p পোর্ট VMs মধ্যে সমস্ত যোগাযোগ যথেষ্ট

## সংক্ষিপ্ত বিবরণ {#overview}

![ক্লাউড সেটআপ](/img/edge/ibft-setup/cloud.svg)

এই গাইডে আমাদের লক্ষ্য হল [IBFT এর consensus](https://github.com/ethereum/EIPs/issues/650) প্রোটোকল এর সাথে কাজ করে একটি কার্যক্ষম `polygon-edge`ব্লকচেইন নেটওয়ার্ক স্থাপন করা। ব্লকচেইন নেটওয়ার্কের মধ্যে 4টি নোড রয়েছে যার মধ্যে সবগুলোই ভ্যালিডেটর নোড, এবং তাই তারা ব্লক প্রপোজ করা এবং অন্যান্য প্রোপোজার থেকে যে ব্লক নেয়া হয়েছে তা যাচাই করা, উভয়ের ক্ষেত্রেই যোগ্য হবে। 4 নোড প্রতিটি তাদের নিজস্ব VM এ চালানো হবে, কারণ এই গাইড ধারণা আপনাকে একটি সম্পূর্ণরূপে কার্যকরী Polygon এজ নেটওয়ার্ক প্রদান করা যখন একটি বিশ্বাসযোগ্য নেটওয়ার্ক সেটআপ নিশ্চিত করার জন্য যাচাইকারী কী প্রাইভেট করা হয়।

এটি অর্জন করার জন্য, আমরা আপনাকে 4টি সহজ স্টেপের মাধ্যমে গাইড করব:

0. উপরে প্রয়োজনীয়তা তালিকা **দেখুন**
1. ভ্যালিডেটরের প্রতিটি জন্য প্রাইভেট কী তৈরি করুন এবং ডেটা ডিরেক্টরি
2. বুটনোড ভাগ করা ইন করা জন্য সংযোগ স্ট্রিং তৈরি করুন`genesis.json`
3. `genesis.json`আপনার স্থানীয় মেশিনে তৈরি করুন এবং এটি নোড প্রতিটি
4. সমস্ত নোড শুরু করুন

:::info ভ্যালিডেটরের সংখ্যা

একটি ক্লাস্টারে নোডের সংখ্যার কোন ন্যূনতম মান নেই, অর্থাৎ শুধুমাত্র 1টি ভ্যালিডেটর নোড দিয়ে ক্লাস্টার সম্ভব। মনে রাখবেন যে _একটি একক_ নোড ক্লাস্টারের কোন **ক্র্যাশ সহনশীলতা** নেই **এবং কোন BFT গ্যারান্টি** নেই।

একটি BFT গ্যারান্টি অর্জনের জন্য নোডের ন্যূনতম প্রস্তাবিত সংখ্যা 4 - যেহেতু একটি 4 নোড ক্লাস্টারে 1টি নোডের ব্যর্থতা সহনীয়, বাকি 3টি স্বাভাবিকভাবেই কাজ করবে।

:::

## ধাপ 1: ডেটা ফোল্ডার শুরু করুন এবং ভ্যালিডেটর কী তৈরি করুন {#step-1-initialize-data-folders-and-generate-validator-keys}

Polygon Edge এর সাথে আপ এবং চলমান করার জন্য, আপনাকে প্রতিটি নোডে ডেটা ফোল্ডার শুরু করতে হবে:


````bash
node-1> polygon-edge secrets init --data-dir data-dir
````

````bash
node-2> polygon-edge secrets init --data-dir data-dir
````

````bash
node-3> polygon-edge secrets init --data-dir data-dir
````

````bash
node-4> polygon-edge secrets init --data-dir data-dir
````

এই কমান্ডগুলোর প্রতিটি ভ্যালিডেটর কী, bls পাবলিক কী এবং [নোড আইডি প্রিন্ট](https://docs.libp2p.io/concepts/peer-id/) করবে। পরবর্তী স্টেপের জন্য আপনার প্রথম নোডের নোড আইডি প্রয়োজন হবে।

### সিক্রেট আউটপুট করা {#outputting-secrets}
যদি প্রয়োজন হয় তবে সিক্রেট আউটপুট আবার পুনরুদ্ধার করা যাবে।

```bash
polygon-edge secrets output --data-dir test-chain-4
```

:::warning আপনার ডেটা ডিরেক্টরি নিজের জন্য রাখুন!

ব্লকচেইন স্টেট ধরে রাখার জন্য ডিরেক্টরি শুরু করার পাশাপাশি উপরে তৈরি ডেটা ডিরেক্টরি তৈরি করা হবে, এছাড়াও আপনার ভ্যালিডেটরের প্রাইভেট কী তৈরি করবে। **এই কীটি একটি গোপন হিসাবে রাখা উচিত, কারণ এটি চুরি করা এটি আপনাকে নেটওয়ার্কে ভ্যালিডেটর হিসাবে অনুকরণ করতে সক্ষম কাউকে রেন্ডার করবে!**
:::

## স্টেপ 2: বুটনোডের জন্য multiaddr কানেকশন স্ট্রিং প্রস্তুত করুন {#step-2-prepare-the-multiaddr-connection-string-for-the-bootnode}

একটি নোডের সফলভাবে সংযোগ স্থাপন করার জন্য, তাকে অবশ্যই জানতে হবে যে কোন `bootnode`সার্ভারের সাথে সংযোগ করতে হবে নেটওয়ার্কের অবশিষ্ট সকল নোডের তথ্য পেতে।  `bootnode`কে কখনও কখনও p2p জার্গনে  `rendezvous`সার্ভারও বলা হয়।

`bootnode`একটি Polygon Edge নোডের একটি বিশেষ উদাহরণ নয়। প্রতিটি Polygon এজ নোড একটি এবং `bootnode`হিসাবে পরিবেশন করতে পারে প্রতিটি Polygon Edge নোডের বুটনোডের একটি সেট নির্দিষ্ট করতে হবে যা কীভাবে সাথে সংযোগ করতে হবে সে সম্পর্কে তথ্য প্রদান করতে হবে নেটওয়ার্কের অবশিষ্ট সকল নোডের সাথে।

বুটনোড নির্দিষ্ট করে সংযোগ স্ট্রিং তৈরি করার জন্য, আমাদের মানিয়ে চলতে হবে [multiaddr ফর্ম্যাট এর সাথে](https://docs.libp2p.io/concepts/addressing/)ঃ
```
/ip4/<ip_address>/tcp/<port>/p2p/<node_id>
```

এই গাইডে আমরা প্রথম এবং দ্বিতীয় নোডকে অন্য সকল নোডের জন্য বুটনোড হিসেবে ব্যবহার করব। এই পরিস্থিতিতে যা ঘটবে তা হল  বা  এর সাথে যে নোডগুল সংযোগ করে তারা একে অপরের সাথে পারস্পরিকভাবে সংযোজিত বুটনোড দি`node 2`য়ে `node 1`কীভাবে সংযোগ করবে তার তথ্য পাবে।

:::info একটি নোড শুরু করতে আপনাকে অন্তত একটি বুটনোড নির্দিষ্ট করতে হবে

অন্তত একটি বুটনোড প্রয়োজনীয়, যাতে নেটওয়ার্কের অন্যান্য নো**ডগ**ুলো একে অপরকে আবিষ্কার করতে পারে। অতিরিক্ত বুটনোডের পরামর্শ দেওয়া হয়, কারণ বিদ্যুৎ চলে যাওয়ার ক্ষেত্রে তারা নেটওয়ার্ককে সহনশীলতা প্রদান করে। এই গাইডে আমরা দুটি নোডের তালিকা দিব, কিন্তু এটি যেকোনো সময়ে পরিবর্তন করা যাবে, এবং এতে  ফাইলের বৈধতার উপর কোন প্রভাব পড়ে `genesis.json`না।
:::

multiaddr সংযোগ `<ip_address>`স্ট্রিংয়ের প্রথম অংশ হিসাবে এটি , এখানে আপনাকে আপনার সেটআপের উপর নির্ভর করে অন্যান্য নোডের দ্বারা রিচেবল হিসাবে আইপি ঠিকানা প্রবেশ করতে হবে, এটি একটি প্রাইভেট বা একটি পাবলিক আইপি ঠিকানা হতে পারে, না`127.0.0.1`।

`<port>`আমরা ব্যবহার `1478`করব, কারণ এটি ডিফল্ট libp2p পোর্ট

এবং অবশেষে, আমাদের  প্রয়োজন `<node_id>`যা আমরা পূর্বে রান করা কমান্ডের আউটপুট থেকে পাবো  `polygon-edge secrets init --data-dir data-dir`(যা এর জন্য কী জেনারেট করতে এবং ডাটা ডিরেক্টরি তৈরি করতে ব্যবহৃত হয়েছি`node 1`লও)

অ্যাসেম্বলির পর,  এর সাথে multiaddr কানেকশন স্ট্রিং `node 1`যা আমরা বুটনোড হিসেবে ব্যবহার করব, তা দেখতে কিছুটা এরকম হবে (শুধুমাত্র `<node_id>`যেটি শেষে আছে, সেটি দেখতে কিছুটা আলাদা হবে):
```
/ip4/<public_or_private_ip>/tcp/1478/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW
```
একইভাবে, আমরা দ্বিতীয় বুটনোডের জন্য multiaddr তৈরি করি
```
/ip4/<public_or_private_ip>/tcp/1478/p2p/16Uiu2HAmS9Nq4QAaEiogE4ieJFUYsoH28magT7wSvJPpfUGBj3Hq
```
:::info ips এর পরিবর্তে DNS হোস্টনেম

Polygon Edge নোড কনফিগারেশনের জন্য DNS হোস্টনেমের ব্যবহার সাপোর্ট করে। এটি ক্লাউড ভিত্তিক ডিপ্লয়মেন্টের জন্য অনেক সহায়ক বৈশিষ্ট্য, কারণ নোডের আইপি বিভিন্ন কারনে পরিবর্তিত হতে পারে।

DNS হোস্টনেম ব্যবহার করার সময় কানেকশন স্ট্রিংয়ের জন্য multiaddr ফর্ম্যাটটি নিম্নলিখিতঃ`/dns4/sample.hostname.com/tcp/<port>/p2p/nodeid`

:::

## স্টেপ 3: 4টি নোডকে ভ্যালিডেটর হিসানে নিয়ে জেনেসিস ফাইল তৈরি করুন {#step-3-generate-the-genesis-file-with-the-4-nodes-as-validators}

এই পদক্ষেপটি আপনার স্থানীয় মেশিনে চালানো যেতে পারে, কিন্তু আপনাকে 4 ভ্যালিডেটরের প্রতিটি জন্য পাবলিক ভ্যালিডেটর কী দরকার।

ভ্যালিডেটর তাদের `secrets init`কমান্ডে আউটপুট নীচের প্রদর্শিত হিসাবে নিরাপদে ভাগ `Public key (address)`করতে পারে, যাতে আপনি তাদের পাবলিক কী দ্বারা চিহ্নিত প্রাথমিক ভ্যালিডেটর in সেই ভ্যালিডেটরের সাথে genesis.json নিরাপদে তৈরি করতে পারেন:

```
[SECRETS INIT]
Public key (address) = 0xC12bB5d97A35c6919aC77C709d55F6aa60436900
BLS Public key       = 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf
Node ID              = 16Uiu2HAmVZnsqvTwuzC9Jd4iycpdnHdyVZJZTpVC8QuRSKmZdUrf
```

আপনি ভ্যালিডেটরের পাবলিক কী সব 4 পেয়েছি তা দেওয়া, আপনি জেনারেট করতে নিম্নলিখিত কমান্ডটি চালাতে পারেন`genesis.json`

````bash
polygon-edge genesis --consensus ibft --ibft-validator 0xC12bB5d97A35c6919aC77C709d55F6aa60436900:0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --ibft-validator <2nd validator IBFT public key>:<2nd validator BLS public key> --ibft-validator <3rd validator IBFT public key>:<3rd validator BLS public key> --ibft-validator <4th validator IBFT public key>:<4th validator BLS public key> --bootnode=<first_bootnode_multiaddr_connection_string_from_step_2> --bootnode <second_bootnode_multiaddr_connection_string_from_step_2> --bootnode <optionally_more_bootnodes>
````

এই কমান্ডটি যা করে:

* ভ্যালিডেটরের পাবলিক কী সেট করে `--ibft-validator`যা জেনেসিস ব্লকে প্রাথমিক ভ্যালিডেটরের মধ্যে অন্তর্ভুক্ত করা উচিত। অনেক প্রাথমিক ভ্যালিডেটর হতে পারে।
*  বুটনোডের অ্যাড্রেস সেট করে `--bootnode`যা নোডগুলোকে একে অপরকে খুঁজে পেতে সাহায্য করবে। আমরা স্টেপ **2**-এ উল্লিখিত হিসাবে multiaddr স্ট্রিং`node 1`টি ব্যবহার করব, যদিও আপনি উপরে প্রদর্শিত হিসাবে আপনি চান হিসাবে অনেক বুটনোড যোগ করতে পারেন।

:::info ECDSA তে সুইচ করুন

BLS ব্লক হেডারদের জন্য ডিফল্ট ভ্যালিডেশন মোড। আপনি যদি আপনার চেইনটিকে ECDSA মোডে রান করাতে চান তবে আপনি  ফ্ল্যাগটি ব্যবহার করতে পারে`—ibft-validator-type`ন, এই  আর্গুমেন্ট `ecdsa`সহ:

```
genesis --ibft-validator-type ecdsa
```
:::

:::info অ্যাকাউন্টের প্রিমাইনিং ব্যালেন্স

আপনি হয়তোবা কিছু "প্রিমাইন্ড" ব্যালেন্স সহ অ্যাড্রেস আপনার ব্লকচেইন নেটওয়ার্কে সেট আপ করতে চাইবেন।

এটি অর্জন করতে, আপনি একটি নির্দিষ্ট ব্যালেন্সের সাথে শুরু করতে চান এমন সবগুলো অ্যাড্রেসকে যতবার ইচ্ছা  ফ্ল্যা`--premine`গে পাস করুন ব্লকচেইনে।

উদাহরণস্বরূপ, আমরা যদি আমাদের জেনেসিস ব্লকের অ্যাড্রেসে  1000 ETH `0x3956E90e632AEbBF34DEB49b71c28A83Bc029862`প্রিমাইন করতে চাই, তবে আমাদের নিম্নলিখিত আর্গুমেন্ট সরবরাহ করতে হবে:

```
--premine=0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000
```

**মনে রাখবেন, প্রিমাইন করা পরিমাণ ETH এ নয়, WEI তে থাকবে।**

:::

:::info ব্লক গ্যাস সীমা সেট করুন

প্রতিটি ব্লকের জন্য ডিফল্ট গ্যাস সীমা হলো`5242880`। এই মানটি জেনেসিস ফাইলে লেখা হয়, কিন্তু আপনি চাইতে পারেন এটি বৃদ্ধি / হ্রাস করতে।

সেটি করতে, আপনি নীচের হিসাবে পছন্দসই মানের ফ্ল্যা`--block-gas-limit`গ  ব্যবহার করতে পারেন:

```shell
--block-gas-limit 1000000000
```

:::

:::info সিস্টেম ফাইল ডেস্ক্রিপ্টর সীমা সেট করুন

ডিফল্ট ফাইল ডেস্ক্রিপ্টর সীমা (সর্বাধিক সংখ্যক ওপেন ফাইল) কিছু অপারেটিং সিস্টেমে বেশ ছোট। নোডগুলোর থেকে যদি উচ্চ থ্রুপুটের আশা করা হয়, তবে আপনি অপারেটিং সিস্টেমে এই সীমা বৃদ্ধি করার কথা বিবেচনা করতে পারেন।

উবুন্টু ডিস্ট্রোর জন্য পদ্ধতিটি নিম্নরূপ (আপনি যদি উবুন্টু / ডেবিয়ান ডিস্ট্র ব্যবহার না করেন, তবে আপনার OS এর জন্য অফিসিয়াল নিয়মাবলী দেখুন):
- বর্তমান OS সীমা চেক করুন (ওপেন ফাইল)
```shell title="ulimit -a"
ubuntu@ubuntu:~$ ulimit -a
core file size          (blocks, -c) 0
data seg size           (kbytes, -d) unlimited
scheduling priority             (-e) 0
file size               (blocks, -f) unlimited
pending signals                 (-i) 15391
max locked memory       (kbytes, -l) 65536
max memory size         (kbytes, -m) unlimited
open files                      (-n) 1024
pipe size            (512 bytes, -p) 8
POSIX message queues     (bytes, -q) 819200
real-time priority              (-r) 0
stack size              (kbytes, -s) 8192
cpu time               (seconds, -t) unlimited
max user processes              (-u) 15391
virtual memory          (kbytes, -v) unlimited
file locks                      (-x) unlimited
```

- ওপেন ফাইল সীমা বৃদ্ধি করুন
	- Localy - শুধুমাত্র বর্তমান সেশনকে প্রভাবিত করে:
	```shell
	ulimit -u 65535
	```
	- Globaly বা প্রতি ব্যবহারকারীর জন্য (/etc/security/limits.conf এর শেষে সীমা যোগ করুন):
	```shell
	sudo vi /etc/security/limits.conf  # we use vi, but you can use your favorite text editor
	```
	```shell title="/etc/security/limits.conf"
	# /etc/security/limits.conf
	#
	#Each line describes a limit for a user in the form:
	#
	#<domain>        <type>  <item>  <value>
	#
	#Where:
	#<domain> can be:
	#        - a user name
	#        - a group name, with @group syntax
	#        - the wildcard *, for default entry
	#        - the wildcard %, can be also used with %group syntax,
	#                 for maxlogin limit
	#        - NOTE: group and wildcard limits are not applied to root.
	#          To apply a limit to the root user, <domain> must be
	#          the literal username root.
	#
	#<type> can have the two values:
	#        - "soft" for enforcing the soft limits
	#        - "hard" for enforcing hard limits
	#
	#<item> can be one of the following:
	#        - core - limits the core file size (KB)
	#        - data - max data size (KB)
	#        - fsize - maximum filesize (KB)
	#        - memlock - max locked-in-memory address space (KB)
	#        - nofile - max number of open file descriptors
	#        - rss - max resident set size (KB)
	#        - stack - max stack size (KB)
	#        - cpu - max CPU time (MIN)
	#        - nproc - max number of processes
	#        - as - address space limit (KB)
	#        - maxlogins - max number of logins for this user

	#        - maxsyslogins - max number of logins on the system
	#        - priority - the priority to run user process with
	#        - locks - max number of file locks the user can hold
	#        - sigpending - max number of pending signals
	#        - msgqueue - max memory used by POSIX message queues (bytes)
	#        - nice - max nice priority allowed to raise to values: [-20, 19]
	#        - rtprio - max realtime priority
	#        - chroot - change root to directory (Debian-specific)
	#
	#<domain>      <type>  <item>         <value>
	#

	#*               soft    core            0
	#root            hard    core            100000
	#*               hard    rss             10000
	#@student        hard    nproc           20
	#@faculty        soft    nproc           20
	#@faculty        hard    nproc           50
	#ftp             hard    nproc           0
	#ftp             -       chroot          /ftp
	#@student        -       maxlogins       4

	*               soft    nofile          65535
	*               hard    nofile          65535

	# End of file
	```
ঐচ্ছিকভাবে, অতিরিক্ত প্যারামিটার মডিফাই করুন, ফাইলটি সংরক্ষণ করুন এবং সিস্টেমটি পুনরায় চালু করুন। পুনরায় চালু করার পরে ফাইল ডেস্ক্রিপ্টর সীমা আবার চেক করুন। আপনি limits.conf ফাইলে যে মান নির্ধারণ করেছিলেন, তাই হওয়া উচিৎ।
:::

এটি নির্দিষ্ট করার পরে:
1. ভ্যালিডেটর সেট হিসাবে জেনেসিস ব্লকে ভ্যালিডেটরের পাবলিক কী অন্তর্ভুক্ত করা হবে
2. বুটনোড multiaddr সংযোগ strings
3. জেনেসিস ব্লকে প্রিমিয়াম অ্যাকাউন্ট এবং ব্যালেন্স অন্তর্ভুক্ত করা হবে

এবং এটি তৈরি করা`genesis.json`, আপনাকে নেটওয়ার্কে সমস্ত VMs এ এটি কপি করতে হবে। আপনার সেটআপের উপর নির্ভর করে আপনি হতে পারেন এটি কপি / পেস্ট করুন, এটি নোড অপারেটরের কাছে প্রেরণ করুন, বা এটি কেবল SCP/FTP / SCP/FTP ওভার।

জেনেসিস ফাইলের গঠন নিয়ে [CLI Commands](/docs/edge/get-started/cli-commands) সেকশনে ব্যাখ্যা করা হয়েছে।

## স্টেপ 4: সকল ক্লায়েন্ট রান করুন {#step-4-run-all-the-clients}

:::note ক্লাউড প্রদানকারীর নেটওয়ার্কিং

বেশিরভাগ ক্লাউড প্রোভাইডার আপনার VM এ একটি সরাসরি নেটওয়ার্ক ইন্টারফেস হিসাবে আইপি ঠিকানা (বিশেষত পাবলিক বেশী) প্রকাশ করে না, বরং একটি অদৃশ্য don't প্রক্সি সেটআপ করুন।


এই ক্ষেত্রে নোডগুলিকে একে অপরকে সংযোগ করতে অনুমতি দেওয়ার জন্য আপনাকে সমস্ত ইন্টারফেসে বাঁধতে  `0.0.0.0`IP ঠিকানা শোনার জন্য প্রয়োজন হবে, কিন্তু আপনাকে এখনও আইপি ঠিকানা বা DNS ঠিকানা নির্দিষ্ট করতে হবে যা অন্যান্য নোডগুলি আপনার ইনস্ট্যান্সের সাথে সংযোগ করতে ব্যবহার করতে পারে। এটি যথাক্রমে আপনার বহিরাগত আইপি বা DNS ঠিকানা নির্দিষ্ট করতে পারেন যেখানে  `--nat`বা  আর্`--dns`গুমেন্ট ব্যবহার করে হয় অর্জন করা হয়।

#### উদাহরণ {#example}

আপনি যা শুনতে `192.0.2.1`চান তা সংশ্লিষ্ট আইপি ঠিকানা হল , কিন্তু এটি আপনার কোনও নেটওয়ার্ক ইন্টারফেসের সাথে সরাসরি আবদ্ধ নয়।

আপনি নিম্নলিখিত প্যারামিটারগুলি পাস করতে নোডগুলি সংযোগ করতে অনুমতি দিতে:

`polygon-edge ... --libp2p 0.0.0.0:10001 --nat 192.0.2.1`

Or, আপনি যদি একটি DNS `dns/example.io`ঠিকানা নির্দিষ্ট করতে চান তবে নিম্নলিখিত প্যারামিটার পাস করুন:

`polygon-edge ... --libp2p 0.0.0.0:10001 --dns dns/example.io`

এটি আপনার নোড সমস্ত ইন্টারফেসে শুনতে পাবে, কিন্তু এটি নিশ্চিত করা যে ক্লায়েন্ট নির্দিষ্ট বা `--dns`ঠিকানা মাধ্যমে এটি সংযোগ `--nat`করছে।

:::

চতুর্থ ক্লায়েন্ট রান **করতে**:


````bash
node-1> polygon-edge server --data-dir ./data-dir --chain genesis.json  --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

দ্বিতীয় ক্লায়েন্ট রান **করতে**:

````bash
node-2> polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

তৃতীয় ক্লায়েন্ট রান **করতে**:

````bash
node-3> polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

চতুর্থ ক্লায়েন্ট রান **করতে**:

````bash
node-4> polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

পূর্ববর্তী কমান্ডগুলো রান করার পরে, আপনি একটি 4 নোডের Polygon Edge নেটওয়ার্ক সেট আপ করেছেন, যা ব্লক সিল করতে এবং ফিরে আসতে সক্ষম নোড ফেইলিওর থেকে।

:::info কনফিগ ফাইল ব্যবহার করে ক্লায়েন্ট শুরু করুন

সমস্ত কনফিগারেশন প্যারামিটার CLI আর্গুমেন্ট হিসাবে নির্দিষ্ট করার পরিবর্তে, ক্লায়েন্টটি নিম্নলিখিত কমান্ড সম্পাদন করে একটি কনফিগ ফাইল ব্যবহার করে শুরু করা যাবে:

````bash
polygon-edge server --config <config_file_path>
````
উদাহরণ:

````bash
polygon-edge server --config ./test/config-node1.json
````
বর্তমানে, আমরা শুধুমাত্র `json`ভিত্তিক কনফিগারেশন ফাইল সমর্থন করি, নমুনা কনফি**[গ](/docs/edge/configuration/sample-config)** ফাইল এখানে পাওয়া যাবে

:::

:::info একটি নন-ভ্যালিডেটর নোড রান করার স্টেপসমূহ

একটি নন-ভ্যালিডেটর সর্বদা ভ্যালিডেটর নোডের থেকে পাওয়া সর্বশেষ ব্লক সিঙ্ক করবে, আপনি নিম্নলিখিত কমান্ডটি রান করে একটি নন-ভ্যালিডেটর নোড শুরু করতে পারেন।

````bash
polygon-edge server --data-dir <directory_path> --chain <genesis_filename>  --libp2p <IPAddress:PortNo> --nat <public_or_private_ip>
````
উদাহরণস্বরূপ, আপনি নিম্নলিখিত কমান্ডটি সম্পাদন করে পঞ্**চম নন**-ভ্যালিডেটর ক্লায়েন্ট যোগ করতে পারেন:

````bash
polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat<public_or_private_ip>
````
:::

:::info মূল্য সীমা নির্দিষ্ট করুন
একটি Polygon Edge নোড আসন্ন লেনদেনের জন্য একটি নির্ধারিত **প্রাইস লিমিট** দিয়ে শুরু করা যাবে।

মূল্য সীমা জন্য ইউনিট হল `wei`।

একটি মূল্য সীমা সেট করার অর্থ হল, বর্তমান নোডের দ্বারা যেসব লেনদেন প্রক্রিয়া করা হবে তার জন্য গ্যাস মূল্য **বেশি হবে** সেট মূল্য সীমা থেকে, অন্যথায় এটি একটি ব্লকে অন্তর্ভুক্ত করা হবে না।

নোডের সংখ্যাগরিষ্ঠতা একটি নির্দিষ্ট মূল্য সীমাকে সম্মান করলে নেটওয়ার্কে লেনদেন একটি নির্দিষ্ট মূল্যের থ্রেশহোল্ডের নিচে হতে পারে না এরকম একটি নিয়ম তৈরি হয়।

প্রাইস লিমিটের `0`জন্য ডিফল্ট মান হল , যার অর্থ এটি ডিফল্টরূপে কখনোই প্রয়োগ করা হয় না।

 ফ্ল্যাগ `--price-limit`ব্যবহার করার উদাহরণ:
````bash
polygon-edge server --price-limit 100000 ...
````

এটি মনে রাখা ভালো **যে শুধুমাত্র নন-লোকাল লেনদেনগুলিতে প্রাইস লিমিট প্রয়োগ করা হয়**, যার অর্থ হল যে নোডে স্থানীয়ভাবে যোগ করা লেনদেনগুলিতে প্রাইস লিমিট প্রযোজ্য নয়।
:::

:::info WebSocket URL
ডিফল্টভাবে, যখন আপনি Polygon Edge রান করেন, তখন এটি চেইন লোকেশন এর উপর ভিত্তি করে একটি WebSocket URL তৈরি করে। URL স্কিম HTTPS লিঙ্কের জন্য এবং HTTP `ws://`এর জন্য ব্যবহার করা `wss://`হয়।

Localhost WebSocket URL:
````bash
ws://localhost:10002/ws
````
অনুগ্রহ করে মনে রাখবেন যে পোর্ট নম্বর নোডের জন্য নির্বাচিত JSON-RPC পোর্টের উপর নির্ভর করে।

Edgenet WebSocket URL:
````bash
wss://rpc-edgenet.polygon.technology/ws
````
:::

---
id: blockscout
title: BlockScout
description: Polygon Edge-এর সাথে কাজ করার জন্য একটি BlockScout ইনস্ট্যান্স কীভাবে সেট আপ করবেন।
keywords:
  - docs
  - polygon
  - edge
  - blockscout
  - deploy
  - setup
  - instance
---

## সংক্ষিপ্ত বিবরণ {#overview}
Polygon-Edge-এর সাথে কাজ করার জন্য BlockScout ইনস্ট্যান্স কীভাবে কম্পাইল ও ডিপ্লয় করতে হয় তা বিস্তারিতভাবে এই নির্দেশিকাটিতে বর্ণনা করা হয়েছে। BlockScout-এর নিজস্ব [ডকুমেন্টেশন](https://docs.blockscout.com/for-developers/manual-deployment) আছে, কিন্তু এই নির্দেশিকাটিতে BlockScout ইনস্ট্যান্স কিভাবে সেটআপ করতে হয় সে সম্পর্কে সহজ কিন্তু ধাপে-ধাপে বিস্তারিতভাবে বর্ণনা করা হয়েছে।

## এনভায়রনমেন্ট {#environment}
* অপারেটিং সিস্টেম: Ubuntu Server 20.04 LTS সুডো পারমিশন সহ [ডাউনলোড লিঙ্ক](https://releases.ubuntu.com/20.04/)
* সার্ভার হার্ডওয়্যার: 8CPU / 16GB RAM / 50GB HDD (LVM)
* ডাটাবেস সার্ভার: 2 CPU / 4GB RAM / 100GB SSD / PostgreSQL 13.4 সহ ডেডিকেটেড সার্ভার

### DB সার্ভার {#db-server}
এই নির্দেশিকা অনুসরণ করার প্রয়োজনীয়তা হচ্ছে একটি ডাটাবেস সার্ভার, ডাটাবেস এবং DB ব্যবহারকারী কনফিগার করা থাকতে হবে। PostgreSQL সার্ভার কীভাবে ডিপ্লয় এবং কনফিগার করতে হবে সে সম্পর্কে এই নির্দেশিকাটিতে বিস্তারিতভাবে বর্ণনা করা হবে না।
এ কাজ কিভাবে করতে হয়, তার জন্য অনেক গাইড আছে, উদাহরণস্বরূপ, [DigitalOcean Guide](https://www.digitalocean.com/community/tutorials/how-to-install-postgresql-on-ubuntu-20-04-quickstart)

:::info সতর্কবার্তা
এই গাইডটি আপনাকে একটি ইন্সট্যান্সে কীভাবে BlockScout স্থাপন করা এবং চালাতে হয়, তা নিয়ে সাহায্য করে, যা মোটেই একটি আদর্শ সেটাপ নয়।    প্রোডাকশনের জন্য, আপনার সম্ভবত আর্কিটেকচারে রিভার্স্‌ প্রক্সি, লোড ব্যালেন্সার, স্কেলেবিলিটি অপশন ইত্যাদি নিয়ে আসা উচিৎ।
:::

# BlackScout ডিপ্লয়মেন্ট প্রক্রিয়া {#blockscout-deployment-procedure}

## পার্ট 1 - ডিপেন্ডেন্সি ইনস্টল করুন  {#part-1-install-dependencies}
আমরা শুরু করার আগে, BlockScout যেসমস্ত বাইনারির উপর নির্ভরশীল, সেসব ইন্সটল করা আছে কি না তা নিশ্চিত করতে হবে।

### সিস্টেম আপডেট এবং আপগ্রেড করুন {#update-upgrade-system}
```bash
sudo apt -y update && sudo apt -y upgrade
```

### erlang repos যোগ করুন {#add-erlang-repos}
```bash
# go to your home dir
cd ~
# download deb
wget https://packages.erlang-solutions.com/erlang-solutions_2.0_all.deb
# download key
wget https://packages.erlang-solutions.com/ubuntu/erlang_solutions.asc
# install repo
sudo dpkg -i erlang-solutions_2.0_all.deb
# install key
sudo apt-key add erlang_solutions.asc
# remove deb
rm erlang-solutions_2.0_all.deb
# remove key
rm erlang_solutions.asc
```

### NodeJS repo যোগ করুন {#add-nodejs-repo}
```bash
sudo curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
```

### Rust ইনস্টল করুন {#install-rust}
```bash
sudo curl https://sh.rustup.rs -sSf | sh -s -- -y
```

### Erlang এর প্রয়োজনীয় সংস্করণ ইনস্টল করুন {#install-required-version-of-erlang}
```bash
sudo apt -y install esl-erlang=1:24.*
```

### Elixir এর প্রয়োজনীয় সংস্করণ ইনস্টল করুন {#install-required-version-of-elixir}
Elixir এর সংস্করণ অবশ্যই `1.13`হতে হবে।﻿ আমরা যদি অফিশিয়াল repo থেকে এই সংস্করণ ইন্সটল করার চেষ্টা করি, তাহলে `erlang` `Erlang/OTP 25`-এ আপডেট হয়ে যাবে, তবে আমরা সেটি চাই না।     
এই কারণবশত, আমাদের GitHub রিলিজেস পেইজ থেকে নির্দিষ্ট precompiled `elixir`সংস্করণটি ইনস্টল করতে হবে।

```bash
cd ~
mkdir /usr/local/elixir
wget https://github.com/elixir-lang/elixir/releases/download/v1.13.4/Precompiled.zip
sudo unzip -d /usr/local/elixir/ Precompiled.zip
rm Precompiled.zip
```

এখন আমাদেরকে`exlixir` সিস্টেম বাইনারি সঠিকভাবে ইন্সটল করতে হবে।
```bash
sudo ln -s /usr/local/elixir/bin/elixir /usr/local/bin/elixir
sudo ln -s /usr/local/elixir/bin/mix /usr/local/bin/mix
sudo ln -s /usr/local/elixir/bin/iex /usr/local/bin/iex
sudo ln -s /usr/local/elixir/bin/elixirc /usr/local/bin/elixirc
```

`elixir`এবং `erlang`সঠিকভাবে ইন্সটল করা কি না তা যাচাই করুন`elixir -v`। আউটপুটটি নিচের মত হওয়া উচিত:
```bash
Erlang/OTP 24 [erts-12.3.1] [source] [64-bit] [smp:8:8] [ds:8:8:10] [async-threads:1] [jit]

Elixir 1.13.4 (compiled with Erlang/OTP 22)
```

:::warning
`Erlang/OTP`-এর ভার্সন অবশ্যই `24` এবং `Elixir`-এর ভার্সন `1.13.*` হতে হবে।     যদি তা না হয়ে থাকে, তাহলে আপনি BlockScout চালানোর সময়ে এবং/অথবা কম্পাইল করার সময়ে সমস্যার সম্মুখীন হতে পারেন।

:::   
:::info

অফিশিয়াল ***[BlockScout-এর প্রয়োজনীয়তার পৃষ্ঠাটি](https://docs.blockscout.com/for-developers/information-and-settings/requirements)*** দেখুন

:::

### NodeJS ইনস্টল করুন {#install-nodejs}
```bash
sudo apt -y install nodejs
```

### Cargo ইনস্টল করুন {#install-cargo}
```bash
sudo apt -y install cargo
```

### অন্যান্য ডিপেন্ডেন্সি ইনস্টল করুন {#install-other-dependencies}
```bash
sudo apt -y install automake libtool inotify-tools gcc libgmp-dev make g++ git
```

### আপনি চাইলে আপনার DB কানেকশন দেখতে postgresql ক্লায়েন্ট ইন্সটল করতে পারেন {#optionally-install-postgresql-client-to-check-your-db-connection}
```bash
sudo apt install -y postgresql-client
```

## পার্ট 2 - এনভায়রনমেন্ট ভেরিয়েবল সেট করুন {#part-2-set-environment-variables}
BlockScout কম্পাইলেশন শুরু করার পূর্বে, আমাদের এনভায়রনমেন্ট ভ্যারিয়েবল সেট করতে হবে। এই নির্দেশিকাতে, আমরা শুধু কাজ করার মতো ন্যূনতম বিষয়গুলোই সেট করব।
ভেরিয়েবল সম্পূর্ণ তালিকা যা আপনি খুঁজে পেতে পারেন [এখানে](https://docs.blockscout.com/for-developers/information-and-settings/env-variables)

### ডাটাবেস সংযোগকে এনভায়রনমেন্ট ভ্যারিয়েবল হিসেবে সেট করুন {#set-database-connection-as-environment-variable}
```bash
# postgresql connection example:  DATABASE_URL=postgresql://blockscout:Passw0Rd@db.instance.local:5432/blockscout
export DATABASE_URL=postgresql://<db_user>:<db_pass>@<db_host>:<db_port>/<db_name> # db_name does not have to be existing database

# we set these env vars to test the db connection with psql
export PGPASSWORD=Passw0Rd
export PGUSER=blockscout
export PGHOST=db.instance.local
export PGDATABASE=postgres # on AWS RDS postgres database is always created
```

এখন প্রদত্ত প্যারামিটারের সাথে আপনার DB কানেকশন পরীক্ষা করুন। যেহেতু আপনি PG env vars প্রদান করেছেন, আপনি ডাটাবেসের সাথে সংযোগ করতে পারবেন শুধুমাত্র এগুলো রান করেঃ
```bash
psql
```

ডাটাবেসটি সঠিকভাবে কনফিগার করা হলে, আপনার এই psql promt-টি দেখতে পাওয়া উচিৎঃ
```bash
psql (12.9 (Ubuntu 12.9-0ubuntu0.20.04.1))
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, bits: 256, compression: off)
Type "help" for help.

blockscout=>
```

অন্যথায়, আপনি নিচের মত একটি ত্রুটি দেখতে পারেন:
```bash
psql: error: FATAL:  password authentication failed for user "blockscout"
FATAL:  password authentication failed for user "blockscout"
```
যদি এটি হয়ে থাকে, তাহলে [এসকল ডক](https://ubuntu.com/server/docs/databases-postgresql) আপনাকে সাহায্য করতে পারে।

:::info DB কানেকশন

পরবর্তী অংশে যাওয়ার আগে নিশ্চিত হয়ে নিন যে, আপনি DB কানেকশনের সাথে সম্পর্কিত সকল সমস্যার সমাধান করেছেন৷
আপনাকে BlockScout ব্যবহারকারীকে সুপার ইউজার সুবিধা প্রদান করতে হবে।

:::
```bash
postgres@ubuntu:~$ createuser --interactive
Enter name of role to add: blockscout
Shall the new role be a superuser? (y/n) y
```

## পার্ট 3 - BlockScout ক্লোন এবং কম্পাইল  {#part-3-clone-and-compile-blockscout}
অবশেষে আমরা BlockScout ইন্সটলেশনের কাজ শুরু করতে পারবো।

### BlockScout রেপো ক্লোন করুন {#clone-blockscout-repo}
```bash
cd ~
git clone https://github.com/Trapesys/blockscout
```

### প্রোডাকশন বিল্ড রক্ষা করতে গোপন কী বেস তৈরি করুন {#generate-secret-key-base-to-protect-production-build}
```bash
cd blockscout
mix deps.get
mix local.rebar --force
mix phx.gen.secret
```
সর্বশেষ লাইনে, আপনি কিছু এলোমেলো অক্ষরের একটি দীর্ঘ স্ট্রিং দেখতে পাবেন।     
পরবর্তী ধাপের পূর্বে, এটা আপনার `SECRET_KEY_BASE`এনভায়রনমেন্ট ভ্যারিয়েবল হিসাবে সেট হওয়া উচিৎ।      উদাহরণস্বরূপ:
```bash
export SECRET_KEY_BASE="912X3UlQ9p9yFEBD0JU+g27v43HLAYl38nQzJGvnQsir2pMlcGYtSeRY0sSdLkV/"
```

### প্রোডাকশন মোড সেট করুন {#set-production-mode}
```bash
export MIX_ENV=prod
```

### কম্পাইল করুন {#compile}
ক্লোন ডিরেক্টরিতে Cd করুন এবং কম্পাইল করা শুরু করুন

```bash
cd blockcout
mix local.hex --force
mix do deps.get, local.rebar --force, deps.compile, compile
```

:::info
আপনি যদি আগে ডিপ্লয় করে থাকেন, তাহলে পূর্বের বিল্ড থেকে স্ট্যাটিক অ্যাসেটসমূহ মুছে ফেলুন ***mix phx.digest.clean***
:::

### ডাটাবেস মাইগ্রেট করুন {#migrate-databases}
:::info

আপনি আপনার DB কানেকশনটি সঠিকভাবে সেটআপ করে না করে থাকলে এই অংশটি ফেইল করবে, কারণ হয়তো আপনি প্যারামিটার প্রদান করেননি
অথবা আপনি DATABASE_URL এনভায়রনমেন্ট ভ্যারিয়েবলে ভুল প্যারামিটার দিয়েছেন। ডাটাবেস ব্যবহারকারীর সুপারইউজার সুবিধা থাকতে হবে।
:::
```bash
mix do ecto.create, ecto.migrate
```

যদি আপনাকে প্রথমে ডাটাবেস ড্রপ করতে হয়, তাহলে রান করুন,
```bash
mix do ecto.drop, ecto.create, ecto.migrate
```

### npm dependencies ইনস্টল করুন এবং ফ্রন্টএন্ড অ্যাসেট কম্পাইল করুন {#install-npm-dependencies-and-compile-frontend-assets}
আপনাকে ডিরেক্টরিটিকে ফোল্ডার পরিবর্তন করতে হবে, যাতে ফ্রন্টএন্ড অ্যাসেট থাকে।

```bash
cd apps/block_scout_web/assets
sudo npm install
sudo node_modules/webpack/bin/webpack.js --mode production
```

:::info ধৈর্য ধরুন

এসব অ্যাসেট কম্পাইলেশনে কয়েক মিনিট সময় লাগতে পারে এবং এটি কোন আউটপুট প্রদর্শন করবে না।
এটা দেখে মনে হতে পারে যে প্রক্রিয়াটি থেমে আছে, কিন্তু ধৈর্য ধরুন। কম্পাইল প্রক্রিয়া শেষ হলে আউটপুট দেখতে কিছুটা এরকম হতে পারে: `webpack 5.69.1 compiled with 3 warnings in 104942 ms`

:::

### স্ট্যাটিক অ্যাসেট তৈরি করুন {#build-static-assets}
এই ধাপের জন্য আপনাকে আপনার BlockScout ক্লোন ফোল্ডারের রুটে ফিরতে হবে।
```bash
cd ~/blockscout
sudo mix phx.digest
```

### স্ব-স্বাক্ষরিত সার্টিফিকেট তৈরি করুন {#generate-self-signed-certificates}
:::info

আপনি যদি `https` ব্যবহার না করেন, তবে আপনি এই ধাপটি এড়িয়ে যেতে পারেন।

:::
```bash
cd apps/block_scout_web
mix phx.gen.cert blockscout blockscout.local
```

## পার্ট 4 - BlockScout সার্ভিস তৈরি এবং রান করুন {#part-4-create-and-run-blockscout-service}
এই অংশে আমাদের একটি সিস্টেম সার্ভিস সেট আপ করতে হবে কারণ আমরা চাই যে BlockScout ব্যাকগ্রাউন্ডে চলুক এবং সিস্টেম রিবুট করার পরে অব্যাহত থাকুক।

### সার্ভিস ফাইল তৈরি করুন {#create-service-file}
```bash
sudo touch /etc/systemd/system/explorer.service
```

### সার্ভিস ফাইল এডিট করুন {#edit-service-file}
এই ফাইলটি সম্পাদনা করতে এবং সার্ভিসটি কনফিগার করতে আপনার পছন্দের Linux টেক্সট এডিটর ব্যবহার করুন৷
```bash
sudo vi /etc/systemd/system/explorer.service
```
explorer.service ফাইলের বিষয়বস্তু দেখতে এরকম হবে:
```bash
[Unit]
Description=BlockScout Server
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=1
User=root
StandardOutput=syslog
StandardError=syslog
WorkingDirectory=/usr/local/blockscout
ExecStart=/usr/local/bin/mix phx.server
EnvironmentFile=/usr/local/blockscout/env_vars.env

[Install]
WantedBy=multi-user.target
```

### সিস্টেম বুটে সার্ভিস শুরু হওয়া এনেবল করুন। {#enable-starting-service-on-system-boot}
```bash
sudo systemctl daemon-reload
sudo systemctl enable explorer.service
```

### আপনার BlockScout ক্লোন ফোল্ডারটি system-wide স্থানে সরান {#move-your-blockscout-clone-folder-to-system-wide-location}
আপনি BlockScout রেপো থেকে যে ফোল্ডারটি ক্লোন করেছেন এবং সমস্ত অ্যাসেট কম্পাইল করেছেন তাতে BlockScout সার্ভিসের অ্যাক্সেস থাকতে হবে।
```bash
sudo mv ~/blockscout /usr/local
```

### env vars ফাইল তৈরি করুন যা BlockScout সার্ভিসের দ্বারা ব্যবহার করা হবে {#create-env-vars-file-which-will-be-used-by-blockscout-service}

```bash
sudo touch /usr/local/blockscout/env_vars.env
# use your favorite text editor
sudo vi /usr/local/blockscout/env_vars.env

# env_vars.env file should hold these values ( adjusted for your environment )
ETHEREUM_JSONRPC_HTTP_URL="localhost:8545"  # json-rpc API of the chain
ETHEREUM_JSONRPC_TRACE_URL="localhost:8545" # same as json-rpc API
DATABASE_URL='postgresql://blockscout:Passw0Rd@db.instance.local:5432/blockscout' # database connection from Step 2
SECRET_KEY_BASE="912X3UlQ9p9yFEBD0JU+g27v43HLAYl38nQzJGvnQsir2pMlcGYtSeRY0sSdLkV/" # secret key base
ETHEREUM_JSONRPC_WS_URL="ws://localhost:8545/ws" # websocket API of the chain
CHAIN_ID=93201 # chain id
HEART_COMMAND="systemctl restart explorer" # command used by blockscout to restart it self in case of failure
SUBNETWORK="Supertestnet PoA" # this will be in html title
LOGO="/images/polygon_edge_logo.svg" # logo location
LOGO_FOOTER="/images/polygon_edge_logo.svg" # footer logo location
COIN="EDGE" # coin
COIN_NAME="EDGE Coin" # name of the coin
INDEXER_DISABLE_BLOCK_REWARD_FETCHER="true" # disable block reward indexer as Polygon Edge doesn't support tracing
INDEXER_DISABLE_PENDING_TRANSACTIONS_FETCHER="true" # disable pending transactions indexer as Polygon Edge doesn't support tracing
INDEXER_DISABLE_INTERNAL_TRANSACTIONS_FETCHER="true" # disable internal transactions indexer as Polygon Edge doesn't support tracing
MIX_ENV="prod" # run in production mode
BLOCKSCOUT_PROTOCOL="http" # protocol to run blockscout web service on
PORT=4000 # port to run blockscout service on
DISABLE_EXCHANGE_RATES="true" # disable fetching of exchange rates
POOL_SIZE=200 # the number of database connections
POOL_SIZE_API=300 # the number of read-only database connections
ECTO_USE_SSL="false" # if protocol is set to http this should be false
HEART_BEAT_TIMEOUT=60 # run HEARTH_COMMAND if heartbeat missing for this amount of seconds
INDEXER_MEMORY_LIMIT="10Gb" # soft memory limit for indexer - depending on the size of the chain and the amount of RAM the server has
FETCH_REWARDS_WAY="manual" # disable trace_block query
INDEXER_EMPTY_BLOCKS_SANITIZER_BATCH_SIZE=1000 # sanitize empty block in this batch size
```
:::info
`SECRET_KEY_BASE` ব্যবহার করুন যা আপনি পার্ট 3-তে তৈরি করেছেন।
:::
ফাইলটি সংরক্ষণ করুন এবং প্রস্থান করুন।

### সর্বশেষে, BlockScout সার্ভিস চালু করুন {#finally-start-blockscout-service}
```bash
sudo systemctl start explorer.service
```

## পার্ট 5 - আপনার BlockScout ইনস্ট্যান্সের ফাংশনালিটি পরীক্ষা করুন {#part-5-test-out-the-functionality-of-your-blockscout-instance}
এখন শুধু BlockScout সার্ভিস চলছে কিনা যাচাই করা বাকি রয়েছে।
এটি দিয়ে সার্ভিস স্ট্যাটাস দেখুন:
```bash
sudo systemctl status explorer.service
```

সার্ভিস আউটপুট চেক করতে:
```bash
sudo journalctl -u explorer.service -f
```

নতুন কোন লিসেনিং পোর্ট আছে কিনা তা দেখতে পারেন এভাবেঃ
```bash
# if netstat is not installed
sudo apt install net-tools
sudo netstat -tulpn
```

আপনার লিসেনিং পোর্টের একটি তালিকা পাওয়া উচিৎ এবং তালিকায় এরকম কিছু থাকা উচিৎ:
```
tcp        0      0 0.0.0.0:5432            0.0.0.0:*               LISTEN      28142/postgres
tcp        0      0 0.0.0.0:4000            0.0.0.0:*               LISTEN      42148/beam.smp
```

BlockScout ওয়েব সার্ভিসটি env ফাইলে সংজ্ঞায়িত পোর্ট এবং প্রোটোকল চালায়। এই উদাহরণে এটি `4000`(http) এ রান করে।   
যদি সবকিছু ঠিক থাকে, তাহলে আপনাকে BlockScout ওয়েব পোর্টালটি অ্যাক্সেস করতে পারবেন এখানে `http://<host_ip>:4000`।

## বিবেচনাসমূহ {#considerations}
সেরা পারফরম্যান্সের জন্য, একটি ডেডিকেটেড/লোকাল `polygon-edge` ফুল আর্কাইভ নন-ভ্যালিডেটর নোড থাকা বাঞ্ছনীয়
যা শুধুমাত্র BlockScout প্রশ্নের জন্য ব্যবহৃত হবে    । এই নোডের API `json-rpc`সবার কাছে উন্মুক্ত করতে হবে না, কারণ BlockScout ব্যাকএন্ড থেকে সমস্ত প্রশ্ন করে।


## চূড়ান্ত ভাবনা {#final-thoughts}
আমরা এইমাত্র একটি একক BlockScout ইন্সট্যান্স স্থাপন করেছি, যা ভালভাবে কাজ করে, কিন্তু প্রোডাকশনের জন্য আপনার Nginx এর মত একটি রিভার্স্‌ প্রক্সির পিছনে এই ইন্সট্যান্সটি রাখার কথা বিবেচনা করা উচিত। আপনার ব্যবহারের উপর ভিত্তি করে আপনি ডাটাবেস এবং ইনস্ট্যান্স স্কেলেবিলিটির বিষয়ে ভাবতে পারেন।

আপনার অবশ্যই অফিসিয়াল [BlockScout ডকুমেন্টেশনটি](https://docs.blockscout.com/) দেখা উচিৎ কারণ সেখানে অনেক কাস্টমাইজেশন অপশন আছে।
---
id: blockscout
title: ब्लॉक स्काउट
description: पॉलीगॉन एज के साथ काम करने के लिए एक ब्लॉक स्काउट इंस्टैंस कैसे सेट किया जाए.
keywords:
  - docs
  - polygon
  - edge
  - blockscout
  - deploy
  - setup
  - instance
---

## ओवरव्यू {#overview}
यह गाइड, पॉलीगॉन-एज के साथ काम करने के लिए ब्लॉक स्काउट इंस्टैंस कम्पाइल और डिप्लॉय कैसे किया जाए उसका विवरण देता है. ब्लॉक स्काउट का अपना [डॉक्यूमेंटेशन](https://docs.blockscout.com/for-developers/manual-deployment) होता है, लेकिन यह गाइड, ब्लॉक स्काउट इंस्टैंस को कैसे सेटअप किया जाए उस पर सरल लेकिन विस्तृत स्टेप-बाय-स्टेप निर्देशों पर ध्यान केंद्रित करता है.

## वातावरण {#environment}
* ऑपरेटिंग सिस्टम: सूडो अनुमतियों के साथ Ubuntu सर्वर 20. 04 LTS [डाउनलोड लिंक](https://releases.ubuntu.com/20.04/)
* सर्वर हार्डवेयर : 8CPU / 16GB रैम / 50GB HDD (LVM)
* डेटाबेस सर्वर:  2 CPU / 4GB रैम / 100GB SSD / PostgreSQL 13.4

### DB सर्वर {#db-server}
इस गाइड को फॉलो करने के लिए एक डेटाबेस सर्वर रेडी, डेटाबेस और db यूज़र कॉन्फ़िगर होना चाहिए. यह गाइड, पोस्टग्रेएसक्यूएल सर्वर को डिप्लॉय और कॉन्फ़िगर कैसे किया जाए उसका विवरण नहीं देगा. इसे करने के लिए अब बहुत सारे गाइड हैं, उदाहरण के लिए [DigitalOcean गाइड](https://www.digitalocean.com/community/tutorials/how-to-install-postgresql-on-ubuntu-20-04-quickstart)

:::info डिस्क्लेमर
यह गाइड सिर्फ ब्लॉक स्काउट पाने और सिंगल इंस्टैंस पर रन करने में सहायता करने के लिए है जो आदर्श उत्पादन सेटअप नहीं है   . उत्पादन के लिए, आप शायद आर्किटेक्चर में रिवर्स प्रोक्सी, लोड बैलेंसर, स्केल करने की क्षमता, इत्यादि को पेश करना चाहते हैं.
:::

# ब्लॉक स्काउट डिप्लॉयमेंट प्रक्रिया {#blockscout-deployment-procedure}

## भाग 1 - निर्भरता इंस्टॉल करें {#part-1-install-dependencies}
शुरू करने से पहले हमें यह सुनिश्चित करने की जरूरत है कि हमने उन सभी बाइनरी को इंस्टॉल कर लिया है जिन पर ब्लॉक स्काउट निर्भर है.

### अपडेट और अपग्रेड सिस्टम {#update-upgrade-system}
```bash
sudo apt -y update && sudo apt -y upgrade
```

### एरलैंग रेपोस जोड़ें {#add-erlang-repos}
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

### NodeJS रेपो जोड़ें {#add-nodejs-repo}
```bash
sudo curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
```

### रस्ट इंस्टॉल करें {#install-rust}
```bash
sudo curl https://sh.rustup.rs -sSf | sh -s -- -y
```

### एरलैंग का आवश्यक वर्जन इंस्टॉल करें {#install-required-version-of-erlang}
```bash
sudo apt -y install esl-erlang=1:24.*
```

### एलिक्सिर का आवश्यक वर्जन इंस्टॉल करें {#install-required-version-of-elixir}
एलिक्सिर का वर्जन `1.13` होना चाहिए. अगर हम आधिकारिक रेपो से इस वर्जन को इंस्टॉल इंस्टॉल करने की कोशिश करते हैं, तो `erlang` में `Erlang/OTP 25` अपडेट हो जाएगा और हम ऐसा नहीं चाहते हैं.      इस वजह से, हमें गिटहब रिलीज पेज से विशिष्ट प्रीकम्पाइल्ड `elixir`वर्जन इंस्टॉल करने की जरूरत है.

```bash
cd ~
mkdir /usr/local/elixir
wget https://github.com/elixir-lang/elixir/releases/download/v1.13.4/Precompiled.zip
sudo unzip -d /usr/local/elixir/ Precompiled.zip
rm Precompiled.zip
```

अब हमें `exlixir`सिस्टम बायनरी को ठीक से सेट करने की जरूरत है.
```bash
sudo ln -s /usr/local/elixir/bin/elixir /usr/local/bin/elixir
sudo ln -s /usr/local/elixir/bin/mix /usr/local/bin/mix
sudo ln -s /usr/local/elixir/bin/iex /usr/local/bin/iex
sudo ln -s /usr/local/elixir/bin/elixirc /usr/local/bin/elixirc
```

`elixir -v`को रन करके जाँचें कि `erlang`और `elixir` ठीक से इंस्टॉल हुए हैं या नहीं. आउटपुट यही होना चाहिए:
```bash
Erlang/OTP 24 [erts-12.3.1] [source] [64-bit] [smp:8:8] [ds:8:8:10] [async-threads:1] [jit]

Elixir 1.13.4 (compiled with Erlang/OTP 22)
```

:::warning
`Erlang/OTP` वर्जन `24` होना चाहिए और `Elixir` वर्जन `1.13.*` होना चाहिए.     अगर ऐसा नहीं होता है, तो आपको ब्लॉक स्काउट को कम्पाइल और / या रन करने में समस्या होगी.
:::   
:::info
आधिकारिक ***[ब्लॉक स्काउट आवश्यकताएं पेज](https://docs.blockscout.com/for-developers/information-and-settings/requirements)*** जाँचें
:::

### NodeJS इंस्टॉल करें {#install-nodejs}
```bash
sudo apt -y install nodejs
```

### कार्गो इंस्टॉल करें {#install-cargo}
```bash
sudo apt -y install cargo
```

### अन्य निर्भरताएँ इंस्टॉल करें {#install-other-dependencies}
```bash
sudo apt -y install automake libtool inotify-tools gcc libgmp-dev make g++ git
```

### अपना db कनेक्शन जाँचने के लिए वैकल्पिक रूप से postgresql क्लाइंट इंस्टॉल करें {#optionally-install-postgresql-client-to-check-your-db-connection}
```bash
sudo apt install -y postgresql-client
```

## भाग 2 - वातावरण वेरिएबल्स सेट करें {#part-2-set-environment-variables}
ब्लॉक स्काउट कम्पाइलेशन शुरू करने से पहले हमें वातावरण वेरिएबल्स सेट करने होंगे. इस गाइड में हम इससे काम कराने के लिए केवल बुनियादी न्यूनतम सेट करेंगे. सेट किए जा सकने वाले वेरिएबल्स की पूरी सूची आपको [यहाँ](https://docs.blockscout.com/for-developers/information-and-settings/env-variables) मिल सकती है

### वातावरण वेरिएबल के रूप में डेटाबेस कनेक्शन सेट करें {#set-database-connection-as-environment-variable}
```bash
# postgresql connection example:  DATABASE_URL=postgresql://blockscout:Passw0Rd@db.instance.local:5432/blockscout
export DATABASE_URL=postgresql://<db_user>:<db_pass>@<db_host>:<db_port>/<db_name> # db_name does not have to be existing database

# we set these env vars to test the db connection with psql
export PGPASSWORD=Passw0Rd
export PGUSER=blockscout
export PGHOST=db.instance.local
export PGDATABASE=postgres # on AWS RDS postgres database is always created
```

अब दिए गए पैरामीटरों के साथ अपने DB कनेक्शन को टेस्ट करें. चूंकि आपने PG env vars प्रदान किया है, तो आपको सिर्फ निम्नलिखित को रन करके डेटाबेस से कनेक्ट होने में सक्षम होना चाहिए:
```bash
psql
```

अगर डेटाबेस को सही तरीके से कॉन्फ़िगर किया गया है, तो आपको एक psql प्रांप्ट दिखाई देना चाहिए:
```bash
psql (12.9 (Ubuntu 12.9-0ubuntu0.20.04.1))
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, bits: 256, compression: off)
Type "help" for help.

blockscout=>
```

अन्यथा, आपको इस तरह की त्रुटि दिखाई दे सकती है:
```bash
psql: error: FATAL:  password authentication failed for user "blockscout"
FATAL:  password authentication failed for user "blockscout"
```
अगर ऐसी बात है तो [ये डॉक्यूमेंट](https://ubuntu.com/server/docs/databases-postgresql) आपकी सहायता कर सकते हैं.

:::info DB कनेक्शन

अगले भाग की तरफ बढ़ने से पहले सुनिश्चित करें कि आपने सभी db कनेक्शन समस्याओं को सुलझा लिया है.
आपको ब्लॉक स्काउट यूज़र को सुपर यूज़र विशेषाधिकार प्रदान करने होंगे.

:::
```bash
postgres@ubuntu:~$ createuser --interactive
Enter name of role to add: blockscout
Shall the new role be a superuser? (y/n) y
```

## भाग 3 - ब्लॉक स्काउट को क्लोन और कम्पाइल करें {#part-3-clone-and-compile-blockscout}
अब हम आख़िरकार ब्लॉक स्काउट इंस्टॉलेशन शुरू करते हैं.

### ब्लॉक स्काउट रेपो क्लोन करें {#clone-blockscout-repo}
```bash
cd ~
git clone https://github.com/Trapesys/blockscout
```

### उत्पादन निर्माण को बचाने के लिए सीक्रेट की आधार तैयार करें {#generate-secret-key-base-to-protect-production-build}
```bash
cd blockscout
mix deps.get
mix local.rebar --force
mix phx.gen.secret
```
बहुत आखिरी लाइन में, आपको यादृच्छिक अक्षरों का एक लम्बा स्ट्रिंग दिखाई देना चाहिए.      अगले स्टेप से पहले इसे आपके `SECRET_KEY_BASE`वातावरण वेरिएबल के रूप में सेट किया जाना चाहिए.      उदाहरण के लिए:
```bash
export SECRET_KEY_BASE="912X3UlQ9p9yFEBD0JU+g27v43HLAYl38nQzJGvnQsir2pMlcGYtSeRY0sSdLkV/"
```

### उत्पादन मोड सेट करें {#set-production-mode}
```bash
export MIX_ENV=prod
```

### कम्पाइल करें {#compile}
क्लोन निर्देशिका में Cd करें और कम्पाइलिंग शुरू करें

```bash
cd blockcout
mix local.hex --force
mix do deps.get, local.rebar --force, deps.compile, compile
```

:::info
अगर आपने पिछली बार डिप्लॉय किया है, तो पिछले बिल्ड ***मिक्स phx.digest.clean*** से स्टेटिक एसेट्स को हटा दें.
:::

### डेटाबेस को माइग्रेट करें {#migrate-databases}
:::info
यह भाग विफल हो जाएगा यदि आपने अपने DB कनेक्शन को ठीक से सेट नहीं किया है, तो आपने प्रदान नहीं किया है, या आपने DATABASE_URL वातावरण वेरिएबल पर गलत पैरामीटर्स को परिभाषित किया है. डेटाबेस यूज़र के पास सुपरयूज़र विशेषाधिकार होना चाहिए.
:::
```bash
mix do ecto.create, ecto.migrate
```

अगर आपको पहले डेटाबेस को ड्रॉप करने की जरूरत है, तो रन करें
```bash
mix do ecto.drop, ecto.create, ecto.migrate
```

### npm निर्भरता इंस्टॉल करें और फ्रंटएंड एसेट्स को कम्पाइल करें {#install-npm-dependencies-and-compile-frontend-assets}
आपको डायरेक्टरी को फ़ोल्डर में बदलना होगा जिसमें फ्रंटएंड एसेट्स है.

```bash
cd apps/block_scout_web/assets
sudo npm install
sudo node_modules/webpack/bin/webpack.js --mode production
```

:::info धैर्य रखें
इन एसेट्स के कम्पाइलेशन में कुछ मिनट लग सकता है, और यह कोई आउटपुट नहीं दिखाएगा. ऐसा लग सकता है कि प्रक्रिया अटक गई है, लेकिन बस धैर्य रखें. कम्पाइल प्रक्रिया समाप्त होने पर इसका आउटपुट कुछ ऐसा होना चाहिए: `webpack 5.69.1 compiled with 3 warnings in 104942 ms`
:::

### स्टेटिक एसेट्स बनाएँ {#build-static-assets}
इस स्टेप के लिए आपको अपने ब्लॉक स्काउट क्लोन फ़ोल्डर के रुट में लौटना होगा.
```bash
cd ~/blockscout
sudo mix phx.digest
```

### स्व-हस्ताक्षरित प्रमाणपत्र बनाएँ {#generate-self-signed-certificates}
:::info
यदि आप `https` इस्तेमाल नहीं करेंगे तो आप यह स्टेप छोड़ सकते हैं.
:::
```bash
cd apps/block_scout_web
mix phx.gen.cert blockscout blockscout.local
```

## भाग 4 - ब्लॉक स्काउट सेवा बनाएँ और रन करें {#part-4-create-and-run-blockscout-service}
इस भाग में हमें सिस्टम सेवा सेट करनी होगी क्योंकि हम चाहते हैं कि ब्लॉक स्काउट, पृष्ठभूमि में रन करे और सिस्टम रीबूट के बाद कायम रहे.

### सेवा फ़ाइल बनाएँ {#create-service-file}
```bash
sudo touch /etc/systemd/system/explorer.service
```

### सेवा फ़ाइल एडिट करें {#edit-service-file}
इस फ़ाइल को एडिट करने और सेवा को कॉन्फ़िगर करने के लिए अपने पसंदीदा लिनक्स टेक्स्ट एडिटर का इस्तेमाल करें
```bash
sudo vi /etc/systemd/system/explorer.service
```
explorer.service फ़ाइल की सामग्री ऐसी दिखनी चाहिए:
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

### सिस्टम बूट पर शुरूआती सेवा चालू करें {#enable-starting-service-on-system-boot}
```bash
sudo systemctl daemon-reload
sudo systemctl enable explorer.service
```

### अपने ब्लॉक स्काउट क्लोन फ़ोल्डर को सिस्टम व्यापी स्थान में ले जाएँ {#move-your-blockscout-clone-folder-to-system-wide-location}
ब्लॉक स्काउट सेवा के पास उस फ़ोल्डर का एक्सेस होना चाहिए जिसे आपने ब्लॉक स्काउट रेपो से क्लोन किया है और सभी एसेट्स को कम्पाइल किया है.
```bash
sudo mv ~/blockscout /usr/local
```

### env vars फ़ाइल बनाएँ जिसका इस्तेमाल ब्लॉक स्काउट सेवा द्वारा किया जाएगा {#create-env-vars-file-which-will-be-used-by-blockscout-service}

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
`SECRET_KEY_BASE` का इस्तेमाल करें जिसे आपने भाग 3 में बनाया है.
:::फ़ाइल सहेजकर बाहर निकलें.

### अंत में, ब्लॉक सेवा शुरू करें {#finally-start-blockscout-service}
```bash
sudo systemctl start explorer.service
```

## भाग 5 - अपने ब्लॉक स्काउट इंस्टैंस की कार्यक्षमता टेस्ट करें {#part-5-test-out-the-functionality-of-your-blockscout-instance}
अब सिर्फ यह जाँचना बाकी है कि ब्लॉक स्काउट सेवा रन हो रही या नहीं. के साथ सेवा स्थिति जाँचें
```bash
sudo systemctl status explorer.service
```

सेवा आउटपुट जाँचने के लिए:
```bash
sudo journalctl -u explorer.service -f
```

आप जाँच सकते हैं कि कोई नया लिसनिंग पोर्ट है या नहीं:
```bash
# if netstat is not installed
sudo apt install net-tools
sudo netstat -tulpn
```

आपको लिसनिंग पोर्ट्स की सूची प्राप्त प्राप्त होनी चाहिए और सूची कुछ ऐसी होनी चाहिए:
```
tcp        0      0 0.0.0.0:5432            0.0.0.0:*               LISTEN      28142/postgres
tcp        0      0 0.0.0.0:4000            0.0.0.0:*               LISTEN      42148/beam.smp
```

ब्लॉक स्काउट वेब सेवा, env फ़ाइल में परिभाषित पोर्ट और प्रोटोकॉल रन करती है. इस उदाहरण में यह `4000`(http)    पर रन होता है. अगर सब कुछ ठीक है, तो आपको `http://<host_ip>:4000` के साथ ब्लॉक स्काउट वेब पोर्टल को एक्सेस करने में सक्षम होना चाहिए.

## विचार {#considerations}
सर्वश्रेष्ठ प्रदर्शन के लिए, एक समर्पित / स्थानीय`polygon-edge` पूरा आर्काइव नॉन-वैलिडेटर नोड प्राप्त करना बेहतर होता है जिसका इस्तेमाल विशेष रूप से ब्लॉक स्काउट प्रश्नों के लिए किया जाएगा.     इस नोड के `json-rpc`API को सार्वजनिक रूप से उजागर करने की जरूरत नहीं है क्योंकि ब्लॉक स्काउट, सभी प्रश्नों को बैकएंड से रन करता है.


## अंतिम विचार {#final-thoughts}
हमने अभी-अभी एक सिंगल ब्लॉक स्काउट इंस्टैंस डिप्लॉय किया है, जो ठीक काम करता है, लेकिन उत्पादन के लिए आपको इस इंस्टैंस को Nginx जैसे रिवर्स प्रॉक्सी के पीछे रखने पर विचार करना चाहिए. आपको अपने इस्तेमाल मामले के आधार पर, डेटाबेस और इंस्टैंस स्केल करने की क्षमता के बारे में भी सोचना चाहिए.

आपको आधिकारिक [ब्लॉक स्काउट डॉक्यूमेंटेशन ](https://docs.blockscout.com/)को जरूर जाँचना चाहिए क्योंकि इसमें बहुत सारे कस्टमाइजेशन  विकल्प होते हैं.
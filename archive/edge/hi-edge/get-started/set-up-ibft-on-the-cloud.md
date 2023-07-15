---
id: set-up-ibft-on-the-cloud
title: क्लाउड सेटअप
description: "स्टेप-बाय-स्टेप क्लाउड गाइड."
keywords:
  - docs
  - polygon
  - edge
  - cloud
  - setup
  - genesis
---

:::info यह गाइड मेननेट या टेस्टनेट सेटअप के लिए है

नीचे दी गई गाइड आपको जानने में मदद करेगी कि टेस्टनेट या मेननेट के उत्पादन सेटअप के लिए क्लाउड प्रोवाइडर पर पॉलीगॉन एज नेटवर्क कैसे सेट करें.

अगर आप प्रोडक्शन-लाइक सेटअप करने से पहले क्विक टेस्ट `polygon-edge` करने के लिए पॉलीगॉन एज नेटवर्क को स्थानीय रूप से सेट अप करना चाहते हैं, तो कृपया
**[स्थानीय सेटअप](/docs/edge/get-started/set-up-ibft-locally)**

:::

## आवश्यकताएँ देखें {#requirements}

पॉलीगॉन एज इंस्टॉल करने के लिए [इंस्टॉलेशन](/docs/edge/get-started/installation) देखें.

### VM कनेक्टिविटी सेट अप करें {#setting-up-the-vm-connectivity}

क्लाउड प्रोवाइडर की अपनी पसंद के आधार पर, आप फ़ायरवॉल, सुरक्षा समूहों, या एक्सेस कंट्रोल की सूचियों का इस्तेमाल कर सकते हैं
और VM के बीच कनेक्टिविटी और नियम सेट अप कर सकते हैं.

`polygon-edge` के एक भाग के रूप में libp2p सर्वर को अन्य VM के संपर्क में लाने की ज़रूरत है,
इसके लिए सिर्फ़ डिफ़ॉल्ट libp2p पोर्ट `1478` पर VM के बीच संचार की अनुमति देना काफ़ी है.

## ओवरव्यू {#overview}

![क्लाउड सेटअप](/img/edge/ibft-setup/cloud.svg)

इस गाइड में, हमारा लक्ष्य [IBFT सहमति प्रोटोकॉल](https://github.com/ethereum/EIPs/issues/650) के साथ `polygon-edge`काम करने वाला ब्लॉकचेन नेटवर्क स्थापित करना है. ब्लॉकचेन नेटवर्क में 4 नोड होते हैं जिनमें से सभी 4 को वैलिडेटर नोड कहा जाता है, और ब्लॉक का प्रस्ताव करने वाले और अन्य प्रस्तावों से आए ब्लॉक को वैलिडेट करने के लिए वे दोनों ही पात्र होते हैं.
सभी 4 नोड अपने VM पर रन करेंगे, क्योंकि इस गाइड का उद्देश्य आपको एक भरोसेमंद नेटवर्क सेटअप सुनिश्चित करने के लिए वैलिडेटर की को निजी रखते हुए पूरी तरह काम करने वाला पॉलीगॉन एज नेटवर्क देना है.

इसके लिए, हम 4 आसान स्टेप्स के माध्यम से आपको गाइड करेंगे:

0. ऊपर दी गई **आवश्यकताओं** की सूची देखें
1. सभी वैलिडेटर्स के लिए निजी की तैयार करें और डेटा डायरेक्टरी को शुरू करें
2. साझा किए गए `genesis.json` में रखने के लिए बूटनोड के लिए कनेक्शन स्ट्रिंग तैयार करें
3. अपनी स्थानीय मशीन पर `genesis.json` बनाएँ और इसे प्रत्येक नोड्स पर भेजें/ट्रांसफ़र करें
4. सभी नोड शुरू करें

:::info वैलिडेटर्स की संख्या

क्लस्टर में नोड की न्यूनतम संख्या निर्धारित नहीं है, जिसका अर्थ है सिर्फ़ 1 वैलिडेटर नोड वाला क्लस्टर भी हो सकता है.
ध्यान रहे कि _सिंगल_ नोड क्लस्टर के साथ, **कोई क्रैश टॉलरेंस** और **BFT गारंटी** नहीं है.

BFT गारंटी पाने के लिए नोड्स की न्यूनतम सुझाई गई संख्या 4 है - चूंकि 4 नोड क्लस्टर में,
होने पर काम चलाया जा सकता है, शेष 3 सामान्य रूप से काम करते हैं.

:::

## स्टेप 1: डेटा फ़ोल्डर को शुरू करें और वैलिडेटर की जनरेट करें {#step-1-initialize-data-folders-and-generate-validator-keys}

पॉलीगॉन एज शुरू करने और रन करने के लिए, आपको प्रत्येक नोड पर डेटा फ़ोल्डर्स शुरू करना होगा:


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

इनमें से प्रत्येक कमांड वैलिडेटर की, सार्वजनिक की और [नोड ID](https://docs.libp2p.io/concepts/peer-id/) को प्रिंट करेगा. अगले स्टेप के लिए आपको पहले नोड की नोड ID की जरूरत होगी.

### आउटपुटिंग सीक्रेट्स {#outputting-secrets}
अगर ज़रूरत हो तो सीक्रेट आउटपुट को दोबारा प्राप्त किया जा सकता है.

```bash
polygon-edge secrets output --data-dir test-chain-4
```

:::warning अपनी डेटा डायरेक्टरी अपने पास रखें!

ब्लॉकचैन स्टेट को बनाए रखने के लिए डायरेक्टरी को शुरू करने के अलावा, ऊपर जनरेट की गई डेटा डायरेक्टरी आपके वैलिडेटर की निजी की भी जनरेट करेगी. **इस की को सीक्रेट रखा जाना चाहिए, क्योंकि इसे चुराने से कोई व्यक्ति आपको नेटवर्क में वैलिडेटर के रूप में दिखा सकता है!**
:::

## स्टेप 2: बूटनोड के लिए multiaddr कनेक्शन स्ट्रिंग तैयार करें {#step-2-prepare-the-multiaddr-connection-string-for-the-bootnode}

कनेक्टिविटी को सफलतापूर्वक स्थापित करने के लिए, नोड के लिए, यह पता करना होगा कि किस `bootnode` सर्वर से कनेक्ट करना होगा
ताकि नेटवर्क पर शेष सभी नोड के बारे में जानकारी मिल जाए. `bootnode` को कभी-कभी p2p jargon में `rendezvous` सर्वर के रूप में भी जाना जाता है.

`bootnode` पॉलीगॉन एज नोड का एक विशेष उदाहरण नहीं है. हर पॉलीगॉन नोड एक `bootnode` के रूप में काम कर सकता है और
प्रत्येक पॉलीगॉन एज नोड में बूटनोड्स का एक ख़ास सेट होना चाहिए, जिससे नेटवर्क में सभी शेष नोड्स के साथ जुड़ने के तरीके के बारे में
जानकारी प्रदान करने के लिए संपर्क किया जाएगा.

अगर हमें बूटनोड निर्दिष्ट करने के लिए कनेक्शन स्ट्रिंग बनाना होगा, [तो हमें multiaddr फ़ॉर्मेट](https://docs.libp2p.io/concepts/addressing/) के अनुरूप होना होगा:
```
/ip4/<ip_address>/tcp/<port>/p2p/<node_id>
```

इस गाइड में, हम पहले और दूसरे नोड को अन्य सभी नोड के लिए बूटनोड के रूप में मानेंगे. इस परिदृश्य में क्या होगा कि नोड्स जो  कनेक्ट करते हैं `node 1``node 2`या  पारस्परिक रूप से संपर्क किए गए बूटनोड के माध्यम से एक दूसरे से कनेक्ट करने के तरीके के बारे में
जानकारी प्राप्त करेंगे.

:::info नोड शुरू करने के लिए आपको कम से कम एक बूटनोड निर्दिष्ट करने की ज़रूरत है

कम से कम **एक** बूटनोड की ज़रूरत होती है, इसलिए नेटवर्क में अन्य नोड एक दूसरे को खोज सकते हैं. अधिक बूटनोड्स का सुझाव दिया जाता है, क्योंकि
वे आउटेज के मामले में नेटवर्क को लचीलापन प्रदान करते हैं. इस गाइड में, हम दो नोड सूची देंगे, लेकिन `genesis.json` फ़ाइल की वैधता पर बिना किसा प्रभाव के, इसे फ्लाई पर बदला जा सकता है.

:::

चूंकि `<ip_address>` multiaddr कनेक्शन स्ट्रिंग का पहला भाग है, यहाँ आपको अन्य नोड्स द्वारा पहुँच योग्य IP पता दर्ज करने की ज़रूरत होगी, आपके सेटअप के आधार पर यह निजी या सार्वजनिक IP पता हो सकता है, `127.0.0.1`या नहीं.

`<port>` के लिए, हम `1478` का इस्तेमाल करेंगे, क्योंकि यह डिफ़ॉल्ट libp2p पोर्ट है.

और अंत में, हमें `<node_id>` की आवश्यकता है जिसे हम पहले से रन कर रहे `polygon-edge secrets init --data-dir data-dir`कमांड के आउटपुट से प्राप्त कर सकते हैं (जिसका इस्तेमाल `node 1` के लिए की और डेटा डायरेक्टरी जनरेट करने के लिए किया गया था)

असेंबली के बाद, `node 1` के लिए multiaddr कनेक्शन स्ट्रिंग जिसे हम बूटनोड के रूप में इस्तेमाल करेंगे, कुछ इस तरह दिखाई देगा (केवल `<node_id>`जो अंत में है वह अलग होना चाहिए):
```
/ip4/<public_or_private_ip>/tcp/1478/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW
```
इसी तरह हम दूसरे बूटनोड के लिए multiaddr को बनाते हैं जैसा कि ips पॉलीगॉन एज के बजाय
```
/ip4/<public_or_private_ip>/tcp/1478/p2p/16Uiu2HAmS9Nq4QAaEiogE4ieJFUYsoH28magT7wSvJPpfUGBj3Hq
```
:::info DNS होस्टनाम के नीचे दिखाया गया है,

जो नोड्स कॉन्फ़िगरेशन के लिए DNS होस्टनाम का इस्तेमाल करता है. क्लाउड आधारित डिप्लॉयमेंट के लिए, यह एक बहुत ही उपयोगी सुविधा है, क्योंकि विभिन्न कारणों से नोड का ip बदल सकता है.

DNS होस्टनाम का इस्तेमाल करते समय कनेक्शन स्ट्रिंग के लिए multiaddr फ़ॉर्मेट इस प्रकार है:
`/dns4/sample.hostname.com/tcp/<port>/p2p/nodeid`

:::

## स्टेप 3: 4 नोड के साथ जेनेसिस फ़ाइल तैयार करें {#step-3-generate-the-genesis-file-with-the-4-nodes-as-validators}

यह स्टेप आपकी स्थानीय मशीन पर रन किया जा सकता है, लेकिन आपको 4 वैलिडेटर्स में से प्रत्येक के लिए सार्वजनिक वैलिडेटर की की ज़रूरत होगी.

वैलिडेटर `Public key (address)` को सुरक्षित रूप से साझा कर सकते हैं जैसा कि आउटपुट में नीचे उनके `secrets init`कमांड में दिखाया गया है, ताकि
आप प्रारंभिक वैलिडेटर सेट में उन वैलिडेटर्स के साथ सुरक्षित रूप से Genesis.json जनरेट कर सकते हैं, जो उनकी सार्वजनिक की द्वारा पहचाने जाते हैं:

```
[SECRETS INIT]
Public key (address) = 0xC12bB5d97A35c6919aC77C709d55F6aa60436900
BLS Public key       = 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf
Node ID              = 16Uiu2HAmVZnsqvTwuzC9Jd4iycpdnHdyVZJZTpVC8QuRSKmZdUrf
```

दिखाया गया है कि आपने सभी 4 वैलिडेटर्स की सार्वजनिक की प्राप्त कर ली हैं, `genesis.json` जनरेट करने के लिए, आप निम्नलिखित कमांड रन कर सकते हैं

````bash
polygon-edge genesis --consensus ibft --ibft-validator 0xC12bB5d97A35c6919aC77C709d55F6aa60436900:0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --ibft-validator <2nd validator IBFT public key>:<2nd validator BLS public key> --ibft-validator <3rd validator IBFT public key>:<3rd validator BLS public key> --ibft-validator <4th validator IBFT public key>:<4th validator BLS public key> --bootnode=<first_bootnode_multiaddr_connection_string_from_step_2> --bootnode <second_bootnode_multiaddr_connection_string_from_step_2> --bootnode <optionally_more_bootnodes>
````

इस कमांड का क्या काम है:

* `--ibft-validator` वैलिडेटर की सार्वजनिक की सेट करता है जिसे जेनेसिस ब्लॉक में प्रारंभिक वैलिडेटर सेट में शामिल किया जाना चाहिए. कई प्रारंभिक वैलिडेटर हो सकते हैं.
* `--bootnode` बूटनोड का पता सेट करता है जो नोड्स को एक दूसरे को खोजने में सक्षम बनाता है. जैसा कि **स्टेप 2** में है, हम `node 1` के multiaddr स्ट्रिंग का इस्तेमाल करेंगे, हालाँकि जैसा कि ऊपर दिखाया गया है, आप जितने चाहें उतने बूटनोड्स जोड़ सकते हैं.

:::info ECDSA में स्विच करें

BlS ब्लॉक हेडर का डिफ़ॉल्ट वैलिडेशन मोड है. अगर आप चाहते हैं कि आपकी सीरीज़ ECDSA मोड में चले, तो आप आर्ग्युमेंट  के साथ `—ibft-validator-type`फ्लैग  का इस्तेमाल कर सकते हैं`ecdsa`:

```
genesis --ibft-validator-type ecdsa
```
:::

:::info Premining अकाउंट बैलेंस

आप शायद अपने ब्लॉकचैन नेटवर्क को कुछ पतों और "premined" बैलेंस के साथ सेट करना चाहेंगे.

इसे पाने के लिए, आप हर पते के रूप में जितने चाहें उतने  फ़्लै`--premine`ग पास करें, जिसे आप ब्लॉकचैन पर एक निश्चित बैलेंस के साथ
शुरू करना चाहते हैं.

उदाहरण के लिए, अगर हम अपने जेनेसिस ब्लॉक `0x3956E90e632AEbBF34DEB49b71c28A83Bc029862`में  के लिए 1000 ETH को premine करना चाहते हैं, तो हमें निम्नलिखित आर्ग्युमेंट देने होंगे:

```
--premine=0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000
```

**नोट करें कि premined रकम WEI में है, ETH में नहीं.**

:::

:::info ब्लॉक गैस लिमिट सेट करें

हर ब्लॉक के लिए डिफ़ॉल्ट गैस लिमिट  है`5242880`. यह वैल्यू जेनेसिस फ़ाइल में लिखी जाती है, पर आप इसे अपने अनुसार
बढ़ा/घटा सकते हैं.

ये करने के लिए, आप नीचे दी गई डिज़ायर्ड वैल्यू के `--block-gas-limit`बाद, फ्लैग  का इस्तेमाल कर सकते हैं :

```shell
--block-gas-limit 1000000000
```

:::

:::info सिस्टम फ़ाइल डिस्क्रिप्टर सीमा सेट करें

कुछ ऑपरेटिंग सिस्टम पर डिफ़ॉल्ट फ़ाइल डिस्क्रिप्टर सीमा ( अधिकतम खुली फ़ाइलें ) बहुत कम है.
अगर नोड्स के हाई थ्रूपुट होने की उम्मीद है, तो आप इस सीमा को OS स्तर पर बढ़ाने पर विचार कर सकते हैं.

Ubuntu डिस्ट्रो की प्रक्रिया इस प्रकार है (अगर आप Ubuntu/Debian डिस्ट्रो का इस्तेमाल नहीं कर रहे हैं, तो अपने OS के लिए आधिकारिक डॉक्स देखें) :
- मौजूदा os लिमिट चेक करें ( फ़ाइल खोलें )
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

- खुली फाइलों की लिमिट बढ़ाएँ
	- स्थानीय रूप से - सिर्फ़ मौजूदा सत्र को प्रभावित करता है:
	```shell
	ulimit -u 65535
	```
	- वैश्विक रूप से या प्रति यूज़र ( /etc/security/limits.conf फ़ाइल के अंत में लिमिट जोड़ें) :
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
वैकल्पिक रूप से, अतिरिक्त पैरामीटर को संशोधित करें, फ़ाइल को सहेजें और सिस्टम को फिर से शुरू करें. फिर से शुरू करने का बाद फ़ाइल डिस्क्रिप्टर लिमिट चेक करें.
इसे limits.conf फ़ाइल में बताई गई वैल्यू पर सेट किया जाना चाहिए.

:::

निर्दिष्ट करने के बाद:
1. वैलिडेटर की सार्वजनिक की जेनेसिस ब्लॉक में शामिल की जानी चाहिए क्योंकि वैलिडेटर
2. बूटनोड multiaddr कनेक्शन स्ट्रिंग्स सेट करता है
3. जेनेसिस ब्लॉक में शामिल किए जाने वाले Premined अकाउंट और बैलेंस

और `genesis.json` जनरेट करने के लिए, आपको इसे नेटवर्क के सभी VM में कॉपी करना चाहिए. अपने सेटअप के आधार पर आप
इसे कॉपी/पेस्ट कर सकते हैं, नोड ऑपरेटर को भेज सकते हैं या बस SCP/FTP पर भेज सकते हैं.

जेनेसिस फ़ाइल की संरचना [CLI कमांड्स](/docs/edge/get-started/cli-commands) सेक्शन में होती है.

## स्टेप 4: सभी क्लाइंट्स रन करें {#step-4-run-all-the-clients}

:::note क्लाउड प्रोवाइडर्स पर नेटवर्किंग

अधिकांश क्लाउड प्रोवाइडर आपके VM पर सीधे नेटवर्क इंटरफेस के रूप में IP पते (ख़ासकर सार्वजनिक) को साझा नहीं करते हैं बल्कि एक अदृश्य NAT प्रॉक्सी सेट करते हैं.


इस मामले में नोड्स को एक दूसरे से कनेक्ट करने की अनुमति देने के लिए, आपको सभी इंटरफेस पर बाइंड करने के लिए `0.0.0.0`IP पते की ज़रूरत होगी, लेकिन आपको अभी भी IP पते या DNS पता निर्दिष्ट करने की ज़रूरत होगी जो अन्य नोड्स आपके उदाहरणों से कनेक्ट करने के लिए इस्तेमाल कर सकते हैं. यह या तो `--nat` या `--dns` आर्ग्युमेंट का इस्तेमाल करके प्राप्त किया जाता है जहाँ आप क्रमशः अपना बाहरी IP या DNS पता निर्दिष्ट कर सकते हैं.


#### उदाहरण {#example}

संबंधित IP पता जिस पर आप ध्यान देना चाहते हैं वह `192.0.2.1`है, लेकिन यह सीधे आपके किसी भी नेटवर्क इंटरफेस से जुड़ा नहीं होता.

नोड्स को कनेक्ट करने की अनुमति देने के लिए, आपको निम्नलिखित पैरामीटर पास करने होंगे:

`polygon-edge ... --libp2p 0.0.0.0:10001 --nat 192.0.2.1`

या, अगर आप एक DNS पता `dns/example.io` निर्दिष्ट करना चाहते हैं, तो निम्नलिखित पैरामीटर पास करें:

`polygon-edge ... --libp2p 0.0.0.0:10001 --dns dns/example.io`

यह आपके नोड के सभी इंटरफेस पर ध्यान देगा, लेकिन इसके बारे में भी जानकारी देगा कि ग्राहक निर्दिष्ट `--nat` या `--dns` पते के माध्यम से इससे जुड़ रहे हैं.

:::

**पहला** क्लाइंट रन करने के लिए:


````bash
node-1> polygon-edge server --data-dir ./data-dir --chain genesis.json  --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

**दूसरा ** क्लाइंट रन करने के लिए:

````bash
node-2> polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

**तीसरा** क्लाइंट रन करने के लिए:

````bash
node-3> polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

**पहला** क्लाइंट रन करने के लिए:

````bash
node-4> polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

पिछली कमांड को चलाने के बाद, आपने एक 4 नोड पॉलीगॉन एज नेटवर्क सेट अप किया है, जो ब्लॉक को सील करने और
नोड विफलता से उबरने में सक्षम है.

:::info config फ़ाइल का इस्तेमाल करके क्लाइंट शुरू करें

CLI आर्ग्युमेंट के रूप में सभी कॉन्फ़िगरेशन पैरामीटर को निर्दिष्ट करने के बजाय, क्लाइंट को नीचे दी गई कमांड को एक्जीक्यूट करके एक फ़ाइल का इस्तेमाल किया जा सकता है:

````bash
polygon-edge server --config <config_file_path>
````
उदाहरण :

````bash
polygon-edge server --config ./test/config-node1.json
````
अभी हम सिर्फ़ `json` आधारित कॉन्फ़िगरेशन फ़ाइल की सहायता करते हैं, सैंपल कॉन्फ़िगरेशन फ़ाइल **[यहाँ](/docs/edge/configuration/sample-config)** मिल सकती है

:::

:::info नॉन-वैलिडेटर नोड रन करने के स्टेप

नॉन-वैलिडेटर हमेशा वैलिडेटर नोड से प्राप्त नए ब्लॉक को सिंक करेगा, आप नीचे दिए गए कमांड को रन करके एक नॉन-वैलिडेटर नोड शुरू कर सकते हैं.

````bash
polygon-edge server --data-dir <directory_path> --chain <genesis_filename>  --libp2p <IPAddress:PortNo> --nat <public_or_private_ip>
````
उदाहरण के लिए, आप नीचे दी गई कमांड को एक्जीक्यूट करके **पांचवां** नॉन-वैलिडेटर क्लाइंट पता कर सकते हैं :

````bash
polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat<public_or_private_ip>
````
:::

:::info प्राइस लिमिट निर्दिष्ट करें
आने वाले ट्रांज़ैक्शन के लिए, तय **प्राइस लिमिट**  के साथ एक पॉलीगॉन एज नोड शुरू किया जा सकता है.

प्राइस लिमिट के लिए यूनिट  है`wei`.

प्राइस लिमिट निर्धारित करने का अर्थ है कि मौजूदा नोड द्वारा संसाधित किए गए किसी भी ट्रांज़ैक्शन के लिए निर्धारित क़ीमत की सीमा से **अधिक**
गैस प्राइस की ज़रूरत होगी, नहीं तो इसे एक ब्लॉक में शामिल नहीं किया जाएगा.

अधिकांश नोड्स एक निश्चित क़ीमत की सीमा के नियम के तहत होते हैं, कि नेटवर्क में ट्रांज़ैक्शन एक निश्चित क़ीमत की
सीमा से कम नहीं हो सकता है.

 वैल्यू लिमिट की डिफ़ॉल्ट वैल्यू है, जिसका अर्थ है `0`कि यह डिफ़ॉल्ट रूप से लागू नहीं होता है.

 `--price-limit`फ्लैग के इस्तेमाल का उदाहरण:
````bash
polygon-edge server --price-limit 100000 ...
````

यह ध्यान देने लायक है कि प्राइस लिमिट **केवल गैर-स्थानीय ट्रांज़ैक्शन पर लागू होती है**, जिसका अर्थ है
कि प्राइस लिमिट नोड पर स्थानीय रूप से जोड़े गए ट्रांज़ैक्शन पर लागू नहीं होती है.

:::

:::info WebSocket URL

डिफ़ॉल्ट रूप से, जब आप पॉलीगॉन एज चलाते हैं, तो यह चेन लोकेशन के आधार पर एक WebSocket URL जेनरेट करता है.
URL स्कीम HTTPS  और HTTP के `ws://`लिए इस्तेमाल `wss://`होती हैं.

Localhost वेबसॉकेट का URL:
````bash
ws://localhost:10002/ws
````
नोट करें कि पोर्ट नंबर नोड के लिए चुने गए JSON-RPC पोर्ट पर निर्भर करता है.

Edgenet WebSocket URL:
````bash
wss://rpc-edgenet.polygon.technology/ws
````
:::

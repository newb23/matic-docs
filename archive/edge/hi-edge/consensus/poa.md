---
id: poa
title: अथॉरिटी का सबूत (PoA)
description: "प्रूफ ऑफ़ स्टेक की व्याख्या और निर्देश."
keywords:
  - docs
  - polygon
  - edge
  - PoA
  - autorithy
---

## ओवरव्यू {#overview}

IBFT PoA पॉलीगॉन एज में डिफ़ॉल्ट सहमति मैकेनिज्म है. PoA में, वैलिडेटर ब्लॉक बनाने और उन्हें श्रृंखला में ब्लॉकचेन में जोड़ने के लिए जिम्मेदार हैं.

सभी वैलिडेटर एक गतिशील वैलिडेटर समूह बनाता हैं, जहां वैलिडेटर को वोटिंग मैकेनिज्म की मदद से समूह में जोड़ा या हटा दिया जा सकता है. इसका मतलब यह है कि वैलिडेटर द्वारा वैलिडेटर-समूह से अंदर/बाहर मतदान किया जा सकता है, यदि वैलिडेटर नोड्स का बहुमत (51%) समूह में/से एक निश्चित वैलिडेटर को जोड़ने/छोड़ने के लिए वोट देता है. इस तरह, दुर्भावनापूर्ण वैलिडेटर को नेटवर्क से पहचाना और हटाया जा सकता है, जबकि नेटवर्क में नए विश्वसनीय वैलिडेटर जोड़े जा सकते हैं.

सभी वैलिडेटर बारी-बारी से अगले ब्लॉक (राउंड-रोबिन) का प्रस्ताव देते हैं और जिस ब्लॉक को ब्लॉकचेन में सत्यापित/प्रविष्ट कराया जाना होता है, उसे  वैलिडेटर की अधिसंख्यता (2/3 से अधिक) को उक्त ब्लॉक को मंजूरी देनी चाहिए.

वैलिडेटर के अलावा, नॉन-वैलिडेटर हैं जो ब्लॉक निर्माण में शामिल नहीं होंते हैं, लेकिन ब्लॉक वैलिडेशन प्रक्रिया में शामिल होते हैं.

## वैलिडेटर समूह में वैलिडेटर को जोड़ना {#adding-a-validator-to-the-validator-set}

गाइड 4 वैलिडेटर नोड के साथ एक नए वैलिडेटर नोड को IBFT नेटवर्क में जोड़ने का तरीका बताता है. अगर आपको नेटवर्क स्थापित करने में मदद की जरूरत है तो [स्थानीय सेटअप](/edge/get-started/set-up-ibft-locally.md) / [क्लाउड सेटअप](/edge/get-started/set-up-ibft-on-the-cloud.md) सेक्शन को संदर्भित करता है.

### स्टेप 1: IBFT के लिए डेटा फ़ोल्डर को इनिशियलाइज करें और नए नोड के लिए वैलिडेटर कीस/कुँजियों को उत्पन्न करें {#step-1-initialize-data-folders-for-ibft-and-generate-validator-keys-for-the-new-node}

नए नोड पर IBFT के साथ तैयार होने और संचालित होने के लिए, आपको डेटा फ़ोल्डर को इनिशियलाइज करने और कीज/कुँजियों को उत्पन्न करने की जरूरत है:

````bash
polygon-edge secrets init --data-dir test-chain-5
````

कमांड वैलिडेटर की/कुंजी (पता) और आईडी नोड आईडी को मुद्रित करेगा. अगले स्टेप के लिए आपको वैलिडेटर की/कुंजी (पते) की जरूरत होगी.

### स्टेप 2: दूसरे वैलिडेटर नोड से एक उम्मीदवार को प्रोपोज करें {#step-2-propose-a-new-candidate-from-other-validator-nodes}

एक नोड के वैलिडेटर बनने के लिए कम से कम 51% वैलिडेटर को उसका प्रस्ताव देना होगा .

grpc पता:127.0.0.1:10000 पर एक नए वैलिडेटर नोड को `0x8B15464F8233F718c8605B16eBADA6fc09181fC2`एक मौजूदा वैलिडेटर से प्रस्तावित करने का उदाहरण:

````bash
polygon-edge ibft propose --grpc-address 127.0.0.1:10000 --addr 0x8B15464F8233F718c8605B16eBADA6fc09181fC2 --bls 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --vote auth
````

IBFT कमांड की संरचना को [CLI कमांड](/docs/edge/get-started/cli-commands) सेक्शन में कवर किया गया है.

:::info BLS सार्वजानिक की/कुंजी
BLS की/मुख्य रूप से जरूरी है अगर नेटवर्क BLS के साथ भाग रहा है, क्योंकि BLS `--bls`मोड में नेटवर्क नहीं चल रहा है/
:::

### स्टेप 3: नोड रन क्लाइंट {#step-3-run-the-client-node}

चूंकि इस उदाहरण में हम नेटवर्क को रन करने का प्रयास कर रहे हैं जहां सभी नोड एक ही मशीन पर हैं, हमें पोर्ट परस्पर विरोधी से बचने के लिए ध्यान

````bash
polygon-edge server --data-dir ./test-chain-5 --chain genesis.json --grpc-address :50000 --libp2p :50001 --jsonrpc :50002 --seal
````

ब्लॉक को लाने के बाद, आप कंसोल के अंदर ध्यान देंगे कि एक नोड वैलिडेशन में भाग ले रहा है

````bash
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=4004
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=5 votes=0
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft: proposer calculated: proposer=0x8B15464F8233F718c8605B16eBADA6fc09181fC2 block=4004
````

:::info वैलिडेटर में एक non-validator को प्रोमोट करना
स्वाभाविक रूप से, एक non-validator प्रक्रिया द्वारा वैलिडेटर बन सकता है, लेकिन इसे वैलिडेटर सेट में सफलतापूर्वक शामिल किया जाना है, के लिए नोड को फ्लैग के साथ `--seal`शुरू करना होता है.
:::

## वैलिडेटर सेट से वैलिडेटर को हटाने {#removing-a-validator-from-the-validator-set}

ऑपरेशन काफी सरल है. वैलिडेटर नोड को हटाने के लिए कमांड को वैलिडेटर नोड के बहुमत के लिए किया जाना चाहिए.

````bash
polygon-edge ibft propose --grpc-address 127.0.0.1:10000 --addr 0x8B15464F8233F718c8605B16eBADA6fc09181fC2 --bls 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --vote drop
````

:::info BLS की/मुख्य
BLS की/मुख्य रूप से जरूरी है अगर नेटवर्क BLS के साथ भाग रहा है, क्योंकि BLS `--bls`मोड में नेटवर्क नहीं चल रहा है/
:::

कमांड के प्रदर्शन के बाद, अवलोकन करें कि वैलिडेटर की संख्या गिरा दी गई है (इस लॉग उदाहरण में लॉग उदाहरण में)

````bash
2021-12-15T19:20:51.014+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=2399 round=1
2021-12-15T19:20:51.014+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=4 votes=2
2021-12-15T19:20:51.015+0100 [INFO]  polygon.consensus.ibft.acceptState: we are the proposer: block=2399
2021-12-15T19:20:51.015+0100 [INFO]  polygon.consensus.ibft: picked out txns from pool: num=0 remaining=0
2021-12-15T19:20:51.015+0100 [INFO]  polygon.consensus.ibft: build block: number=2399 txns=0
2021-12-15T19:20:53.002+0100 [INFO]  polygon.consensus.ibft: state change: new=ValidateState
2021-12-15T19:20:53.009+0100 [INFO]  polygon.consensus.ibft: state change: new=CommitState
2021-12-15T19:20:53.009+0100 [INFO]  polygon.blockchain: write block: num=2399 parent=0x768b3bdf26cdc770525e0be549b1fddb3e389429e2d302cb52af1722f85f798c
2021-12-15T19:20:53.011+0100 [INFO]  polygon.blockchain: new block: number=2399 hash=0x6538286881d32dc7722dd9f64b71ec85693ee9576e8a2613987c4d0ab9d83590 txns=0 generation_time_in_sec=2
2021-12-15T19:20:53.011+0100 [INFO]  polygon.blockchain: new head: hash=0x6538286881d32dc7722dd9f64b71ec85693ee9576e8a2613987c4d0ab9d83590 number=2399
2021-12-15T19:20:53.011+0100 [INFO]  polygon.consensus.ibft: block committed: sequence=2399 hash=0x6538286881d32dc7722dd9f64b71ec85693ee9576e8a2613987c4d0ab9d83590 validators=4 rounds=1 committed=3
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft: state change: new=AcceptState
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=2400 round=1
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=3 votes=0
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft: proposer calculated: proposer=0xea21efC826F4f3Cb5cFc0f986A4d69C095c2838b block=2400
````

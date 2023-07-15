---
id: bls
title: BLS
description: "BLS मोड के बारे में स्पष्टीकरण और निर्देश."
keywords:
  - docs
  - polygon
  - edge
  - bls
---

## ओवरव्यू {#overview}

BLS को Boneh–Lynn–Shacham (BLS) के रूप में भी जाना जाता है, एक क्रिप्टोग्राफिक सिग्नेचर स्कीम है जो एक यूजर को यह सत्यापित करने की अनुमति देती है कि signer सत्यापित हो जाए. यह एक सिग्नेचर स्कीम है जो एकाधिक हस्ताक्षर को एकत्रित कर सकती है. पॉलीगॉन एज में, IBFT सहमति मोड में बेहतर सुरक्षा प्रदान करने के लिए, डिफॉल्ट द्वारा BLS को इस्तेमाल किया जाता है. BLS सिग्नेचर्स को एक सिंगल बाइट ऐरे में शामिल कर सकता है और ब्लॉक के हेडर के आकार को कम करता है. हर चेन चुन सकती है कि उसे BLS का इस्तेमाल करना है या नहीं. ECDSA की का इस्तेमाल किया जाता है, चाहे वह BLS मोड में सक्षम हो या न हो.

## वीडियो प्रेजेंटेशन {#video-presentation}

[![bls वीडियो](https://img.youtube.com/vi/HbUmZpALlqo/0.jpg)](https://www.youtube.com/watch?v=HbUmZpALlqo)

## कैसे BLS का इस्तेमाल करके एक नई चेन को सेटअप करें {#how-to-setup-a-new-chain-using-bls}

सेटअप के विस्तृत निर्देश पाने के लिए [स्थानीय सेटअप](/docs/edge/get-started/set-up-ibft-locally) / [क्लाउड सेटअप](/docs/edge/get-started/set-up-ibft-on-the-cloud) सेक्शन्स देखें.

## एक मौजूदा ECDSA PoA चेन को BLS PoA चेन में कैसे माइग्रेट करें {#how-to-migrate-from-an-existing-ecdsa-poa-chain-to-bls-poa-chain}

यह सेक्शन बताता है कि BLS मोड को, पहले से मौजूद PoA चेन में कैसे इस्तेमाल करें.
PoA चेन में BLS चालू करने के लिए निम्नलिखित स्टेप्स की आवश्यकता होती है.

1. सभी नोड्स को रोकें
2. वैलिडेटर्स के लिए BLS की जनरेट करें
3. genesis.json में एक फ़ोर्क सेटिंग जोड़ें
4. सभी नोड्स को फिर से शुरू करें

### 1. सभी नोड्स रोकें {#1-stop-all-nodes}

Ctrl + c (कंट्रोल + c) को दबा कर वैलिडेटर्स की सभी प्रक्रियाओं को टर्मिनेट करें. कृपया, ब्लॉक की नवीनतम ऊँचाई याद रखें (ब्लॉक के प्रतिबद्ध लॉग में जो क्रमांक संख्या सबसे अधिक है).

### 2. BLS की को जनरेट करें {#2-generate-the-bls-key}

`--bls` के साथ `secrets init` BLS की को जनरेट करता है. मौजूदा ECDSA और नेटवर्क की को रखने और एक नई BLS की जोड़ने के लिए, `--ecdsa` और `--network` को अक्षम करने की ज़रूरत होती है.

```bash
polygon-edge secrets init --bls --ecdsa=false --network=false

[SECRETS INIT]
Public key (address) = 0x...
BLS Public key       = 0x...
Node ID              = 16...
```

### 3. फ़ोर्क सेटिंग जोड़ें {#3-add-fork-setting}

`ibft switch` कमांड एक फ़ोर्क सेटिंग जोड़ता है, जो मौजूदा चेन में BLS को `genesis.json` में सक्षम बनाता है .

PA नेटवर्क के लिए, कमांड में वैलिडेटर्स दिए जाने चाहिए. जैसा कि `genesis` कमांड के साथ होता है, `--ibft-validators-prefix-path` या `--ibft-validator` फ्लैग का इस्तेमाल वैलिडेटर को निर्दिष्ट करने के लिए किया जा सकता है.

उस ऊँचाई को निर्दिष्ट करें जिससे चेन `--from` फ्लैग के साथ BLS का इस्तेमाल शुरू करती है.

```bash
polygon-edge ibft switch --chain ./genesis.json --type PoA --ibft-validator-type bls --ibft-validators-prefix-path test-chain- --from 100
```

### 4. सभी नोड फिर से शुरू करें {#4-restart-all-nodes}

`server` कमांड द्वारा सभी नोड्स को फिर से शुरू करें. पिछले स्टेप में  निर्दिष्ट `from` ब्लॉक का निर्माण होने के बाद, चेन BLS को सक्षम बनाता है और नीचे दिए गए रूप में लॉग दिखाता है:

```bash
2022-09-02T11:45:24.535+0300 [INFO]  polygon.ibft: IBFT validation type switched: old=ecdsa new=bls
```

साथ ही लॉग यह भी दिखाता है कि ब्लॉक बनने के बाद प्रत्येक ब्लॉक को जनरेट करने के लिए किस सत्यापन मोड का इस्तेमाल किया जाता है.

```
2022-09-02T11:45:28.728+0300 [INFO]  polygon.ibft: block committed: number=101 hash=0x5f33aa8cea4e849807ca5e350cb79f603a0d69a39f792e782f48d3ea57ac46ca validation_type=bls validators=3 committed=3
```

## एक मौजूदा ECDSA PoS चेन को BLS PoS चेन में कैसे माइग्रेट करें {#how-to-migrate-from-an-existing-ecdsa-pos-chain-to-a-bls-pos-chain}

यह सेक्शन बताता है कि मौजूदा PoS चेन में BLS मोड का इस्तेमाल कैसे किया जाए.
PoS चेन में BLS चालू करने के लिए निम्नलिखित स्टेप्स की आवश्यकता होती है.

1. सभी नोड्स को रोकें
2. वैलिडेटर्स के लिए BLS की जनरेट करें
3. genesis.json में एक फ़ोर्क सेटिंग जोड़ें
4. BLS पब्लिक की को रजिस्टर करने के लिए स्टैकिंग कॉन्ट्रैक्ट को कॉल करें
5. सभी नोड्स को दोबारा शुरू करें

### 1. सभी नोड्स रोकें {#1-stop-all-nodes-1}

Ctrl + c (कंट्रोल + c) को दबा कर वैलिडेटर्स की सभी प्रक्रियाओं को टर्मिनेट करें. कृपया, ब्लॉक की नवीनतम ऊँचाई याद रखें (ब्लॉक के प्रतिबद्ध लॉग में जो क्रमांक संख्या सबसे अधिक है).

### 2. BLS की को जनरेट करें {#2-generate-the-bls-key-1}

`secrets init`, `--bls` फ्लैग के साथ BLS की जनरेट करता है. मौजूदा ECDSA और नेटवर्क की को रखने के लिए और एक नई BLS की, जोड़ने के लिए, `--ecdsa` और `--network` को अक्षम करने की ज़रूरत होती है.

```bash
polygon-edge secrets init --bls --ecdsa=false --network=false

[SECRETS INIT]
Public key (address) = 0x...
BLS Public key       = 0x...
Node ID              = 16...
```

### 3. फ़ोर्क सेटिंग जोड़ें {#3-add-fork-setting-1}

`ibft switch` कमांड एक फ़ोर्क सेटिंग जोड़ता है, जो `genesis.json` में चेन के बीच में से BLS को सक्षम बनाता है .

उस ऊँचाई को निर्दिष्ट करें जिससे चेन `from` फ्लैग के साथ BLS मोड का इस्तेमाल शुरू करती है, और जिस ऊँचाई पर कॉन्ट्रैक्ट को `development`फ्लैग के साथ अपडेट किया जाता है.

```bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --ibft-validator-type bls --deployment 50 --from 200
```

### 4. स्टेकिंग कॉन्ट्रैक्ट में BLS की सार्वजनिक की रजिस्टर करें {#4-register-bls-public-key-in-staking-contract}

फ़ोर्क को जोड़ने और वैलिडेटर्स को फिर से शुरू करने के बाद, हर वैलिडेटर को BLS की सार्वजनिक की को रजिस्टर करने के लिए स्टेकिंग कॉन्ट्रैक्ट में `registerBLSPublicKey` को कॉल करना पड़ता है. इसे अवश्य ही `--deployment`में निर्दिष्ट ऊँचाई के बाद और  `--from`में निर्दिष्ट ऊँचाई के पहले किया जाना चाहिए.

BLS सार्वजनिक की को रजिस्टर करने की स्क्रिप्ट को [स्टेकिंग स्मार्ट कॉन्ट्रैक्ट रेपो](https://github.com/0xPolygon/staking-contracts) में परिभाषित किया गया है.

`.env` फ़ाइल में रजिस्टर होने के लिए `BLS_PUBLIC_KEY` को सेट करें. अन्य पैरामीटर्स के बारे में अधिक विवरण के लिए, [pos-stake-unstake](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts) का संदर्भ लें.

```env
JSONRPC_URL=http://localhost:10002
STAKING_CONTRACT_ADDRESS=0x0000000000000000000000000000000000001001
PRIVATE_KEYS=0x...
BLS_PUBLIC_KEY=0x...
```

निम्न कमांड, `.env` में दी गई BLS की सार्वजानिक की को कॉन्ट्रैक्ट में रजिस्टर्ड करता है.

```bash
npm run register-blskey
```

:::warning वैलिडेटर्स को BLS सार्वजनिक की को मैन्युअल रूप से रजिस्टर करने की ज़रूरत होती है

BLS मोड में, अवश्य ही वैलिडेटर्स का अपना पता और BLS की सार्वजनिक की होनी चाहिए. सहमति की लेयर उन वैलिडेटर्स को नज़रअंदाज करती है जिन्होंने कॉन्ट्रैक्ट में BLS की सार्वजनिक की को तब तक रजिस्टर नहीं कराया होता, जब सहमति कॉन्ट्रैक्ट से वैलिडेटर की जानकारी हासिल कर रही होती है.

:::

### 5. सभी नोड्स दोबारा शुरू करें {#5-restart-all-nodes}

`server` कमांड द्वारा सभी नोड्स को दोबारा शुरू करें. पिछली स्टेप में निर्दिष्ट `from` पर ब्लॉक बनाने के बाद चेन, BLS को सक्षम बनाती है.

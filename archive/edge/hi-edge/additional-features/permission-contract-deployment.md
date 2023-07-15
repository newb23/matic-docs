---
id: permission-contract-deployment
title: स्मार्ट कॉन्ट्रैक्ट डिप्लॉयमेंट में अनुमति
description: स्मार्ट कॉन्ट्रैक्ट डिप्लॉयमेंट में अनुमति कैसे जोडें.
keywords:
  - docs
  - polygon
  - edge
  - smart contract
  - permission
  - deployment
---

## ओवरव्यू {#overview}

यह गाइड एड्रेस को वाइटलिस्ट में करने के बारे में विस्तार से जानकारी प्रदान करती है ताकि स्मार्ट कॉन्ट्रैक्ट डिप्लॉय किया जा सके.
कभी-कभी नेटवर्क ऑपरेटर्स यूज़र को नेटवर्क के उद्देश्य के अनुरूप ना होने वाले स्मार्ट कॉन्ट्रैक्ट डिप्लॉय करने से रोकना चाहते हैं. नेटवर्क ऑपरेटर्स कर सकते हैं:

1. स्मार्ट कॉन्ट्रैक्ट डिप्लॉयमेंट के लिए वाइटलिस्ट पता
2. स्मार्ट कॉन्ट्रैक्ट डिप्लॉयमेंट के लिए वाइटलिस्ट से पता हटाएँ

## वीडियो प्रेजेंटेशन {#video-presentation}

[![कॉन्ट्रैक्ट डिप्लॉयमेंट की अनुमति - वीडियो](https://img.youtube.com/vi/yPOkINpf7hg/0.jpg)](https://www.youtube.com/watch?v=yPOkINpf7hg)

## इसका इस्तेमाल कैसे करें? {#how-to-use-it}


आप [CLI कमांड](/docs/edge/get-started/cli-commands#whitelist-commands) पेज में डिप्लॉयमेंट वाइटलिस्ट से जुड़े सभी cli कमांड ढूँढ सकते हैं.

* `whitelist show`: वाइटलिस्ट की जानकारी को प्रदर्शित करता है
* `whitelist deployment --add`:  कॉन्ट्रैक्ट डिप्लॉयमेंट वाइटलिस्ट में एक नया पता जोड़ता है
* `whitelist deployment --remove`:  कॉन्ट्रैक्ट डिप्लॉयमेंट वाइटलिस्ट से एक नया पता हटाता है

#### डिप्लॉयमेंट वाइटलिस्ट में सभी पते दिखाएँ {#show-all-addresses-in-the-deployment-whitelist}

डिप्लॉयमेंट वाइटलिस्ट में सभी पते खोजने के 2 तरीके हैं.
1. जहाँ वाइटलिस्ट को सेव किया गया है, `genesis.json` देखें
2. `whitelist show` एग्जीक्यूट करना, जो पॉलीगॉन एज द्वारा समर्थित सभी वाइटलिस्ट के लिए जानकारी को प्रिंट करता है

```bash

./polygon-edge whitelist show

[WHITELISTS]

Contract deployment whitelist : [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d],


```

#### डिप्लॉयमेंट वाइटलिस्ट में एक पता जोड़ें {#add-an-address-to-the-deployment-whitelist}

वाइटलिस्ट डिप्लॉयमेंट में एक नया पता जोड़ने के लिए, `whitelist deployment --add [ADDRESS]` CLI कमांड एक्जीक्यूट करें. वाइटलिस्ट में पतों की संख्या की सीमा नहीं है. सिर्फ़ कॉन्ट्रैक्ट डिप्लॉयमेंट वाइटलिस्ट में मौजूद पता ही कॉन्ट्रैक्ट डिप्लॉय कर सकता है. अगर वाइटलिस्ट खाली है, तो कोई भी पता डिप्लॉयमेंट कर सकता है

```bash

./polygon-edge whitelist deployment --add 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d --add 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF


[CONTRACT DEPLOYMENT WHITELIST]

Added addresses: [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],
Contract deployment whitelist : [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],



```

#### डिप्लॉयमेंट वाइटलिस्ट से पता हटाएँ {#remove-an-address-from-the-deployment-whitelist}

डिप्लॉयमेंट वाइटलिस्ट से एक पता हटाने के लिए `whitelist deployment --remove [ADDRESS]` CLI कमांड एग्जीक्यूट करें. सिर्फ़ कॉन्ट्रैक्ट डिप्लॉयमेंट वाइटलिस्ट में मौजूद पता ही कॉन्ट्रैक्ट डिप्लॉय कर सकता है. अगर वाइटलिस्ट खाली है, तो कोई भी पता डिप्लॉयमेंट कर सकता है

```bash

./polygon-edge whitelist deployment --remove 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d --remove 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF


[CONTRACT DEPLOYMENT WHITELIST]

Removed addresses: [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],
Contract deployment whitelist : [],



```

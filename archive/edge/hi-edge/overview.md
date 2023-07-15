---
id: overview
title: पॉलीगॉन एज
sidebar_label: What is Edge
description: "पॉलीगॉन एज का परिचय."
keywords:
  - docs
  - polygon
  - edge
  - network
  - modular

---

पॉलीगॉन एज एथेरेयम ब्लॉकचेन नेटवर्क, साइडचैनस, और स्केलिंग सॉल्यूशंस बिल्डिंग के लिए मॉडुलर और एक्स्टेंसिबल फ्रेमवर्क है.

इसका प्राथमिक उपयोग एथेरियम स्मार्ट अनुबंधों और लेनदेन के साथ पूर्ण संगतता प्रदान करते हुए एक नए ब्लॉकचेन नेटवर्क को बूटस्ट्रैप करना है. यह IBFT (इस्तांबुल बीजान्टिन दोष सहिष्णु) सर्वसम्मति मेकनिज़म का उपयोग करता है, जो [PoA (प्राधिकरण का प्रमाण)](/docs/edge/consensus/poa) और [PoS (हिस्सेदारी का प्रमाण)](/docs/edge/consensus/pos-stake-unstake) के रूप में दो स्वादों में समर्थित है.

पॉलीगॉन एज कई ब्लॉकचेन नेटवर्क के साथ संचार का भी समर्थन करता है, [केंद्रीकृत पुल समाधान](/docs/edge/additional-features/chainbridge/overview)का उपयोग करके [ईआरसी-20](https://ethereum.org/en/developers/docs/standards/tokens/erc-20) और [ERC-721](https://ethereum.org/en/developers/docs/standards/tokens/erc-721) टोकन दोनों के हस्तांतरण को सक्षम करता है.

उद्योग मानक वॉलेट का उपयोग [JSON-RPC](/docs/edge/working-with-node/query-json-rpc) एन्ड्पॉईंट के माध्यम से पॉलीगॉन एज के साथ इंटेरक्ट करने के लिए किया जा सकता है और नोड ऑपरेटर [gRPC](/docs/edge/working-with-node/query-operator-info) प्रोटोकॉल के माध्यम से नोड्स पर विभिन्न क्रियाएं कर सकते हैं.

पॉलीगाँन  के बारे में अधिक जानने के लिए, [ऑफिसियल वेबसाइट](https://polygon.technology)पर जाएँ.

**[गिटहब रिपोजिटरी](https://github.com/0xPolygon/polygon-edge)**

:::caution

यह प्रगति में एक काम है इसलिए भविष्य में वास्तुशिल्प परिवर्तन हो सकते हैं. कोड का ऑडिट नहीं किया गया है फिर भी, तो कृपया पॉलीगॉन टीम से संपर्क करें यदि आप इसे प्रोडक्शन में इस्तेमाल करना चाहेंगे.

:::



`polygon-edge`स्थानीय रूप से एक नेटवर्क चलाकर शुरू करने के लिए, कृपया पढ़ें: [इंस्टॉलेशन](/docs/edge/get-started/installation)और [स्थानीय सेटप](/docs/edge/get-started/set-up-ibft-locally).

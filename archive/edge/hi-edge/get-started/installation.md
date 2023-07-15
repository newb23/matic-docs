---
id: installation
title: इंस्टॉल करना
description: "पॉलीगॉन एज कैसे इंस्टॉल करें."
keywords:
  - docs
  - polygon
  - edge
  - install
  - installation
---

कृपया अपने लिए इंस्टॉल करने के सही तरीके देखें.

हम प्रि-बिल्ट रिलीज़ का इस्तेमाल करने और दिए गए चेकसम को सत्यापित करने का सुझाव देते हैं.

## प्रि-बिल्ट रिलीज़ {#pre-built-releases}

रिलीज़ की सूची के लिए [GitHub](https://github.com/0xPolygon/polygon-edge/releases) रिलीज़ पेज देखें.

पॉलीगॉन एज Darwin और Linux के लिए क्रॉस-कम्पाइल्ड किए गए AMD64/ARM64 बाइनरी के साथ आता है.

---

## डॉकर इमेज {#docker-image}

आधिकारिक डॉकर इमेज को [hub.docker.com रजिस्ट्री](https://hub.docker.com/r/0xpolygon/polygon-edge) के तहत होस्ट किया जाता है.

`docker pull 0xpolygon/polygon-edge:latest`

---

## सोर्स से बिल्डिंग {#building-from-source}

`go install`का इस्तेमाल करने से पहले सुनिश्चित करें कि Go `>=1.18` इंस्टाल है और ठीक से कॉन्फ़िगर किया गया है.

स्थिर शाखा नवीनतम रिलीज़ की शाखा है.

```shell
git clone https://github.com/0xPolygon/polygon-edge.git
cd polygon-edge/
go build -o polygon-edge main.go
sudo mv polygon-edge /usr/local/bin
```

---

## `go install` का इस्तेमाल करके

`go install`का इस्तेमाल करने से पहले सुनिश्चित करें कि Go `>=1.17` इंस्टाल है और ठीक से कॉन्फ़िगर किया गया है.

`go install github.com/0xPolygon/polygon-edge@release/<latest release>`

बाइनरी आपके `GOBIN`पर्यावरण वेरिएबल में उपलब्ध होगा, और नवीनतम रिलीज से होने वाले बदलावों को शामिल करेंगे. आप चेकआउट करने के लिए [गिटहब रिलिज कर](https://github.com/0xPolygon/polygon-edge/releases) सकते हैं कि जो एक latest. है.

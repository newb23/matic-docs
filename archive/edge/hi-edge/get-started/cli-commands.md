---
id: cli-commands
title: CLI कमांड्स
description: "पॉलीगॉन एज के लिए CLI कमांड्स और कमांड फ्लैग की सूची."
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


इस सेक्शन में, वर्तमान कमांड्स, पॉलीगॉन एज में कमांड फ्लैग और उसके इस्तेमाल करने का विवरण दिया गया है.

:::tip JSON का सपोर्ट आउटपुट

`--json` फ्लैग को कुछ कमांड्स पर सपोर्ट किया जाता है. यह फ्लैग JSON फॉर्मेट में आउटपुट को प्रिंट करने के लिए कमांड देता है

:::

## स्टार्टअप कमांड्स {#startup-commands}

| **कमांड** | **वर्णन** |
|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| सर्वर | वह डिफ़ॉल्ट कमांड जो सभी मॉड्यूल की एक साथ बूटस्ट्रेपिंग करके ब्लॉकचेन क्लाइंट को शुरू करता है |
| जेनेसिस | एक *genesis.json* फ़ाइल, जिसका इस्तेमाल क्लाइंट को शुरू करने से पहले एक पूर्वनिर्धारित चेन की स्थिति निर्धारित करने के लिए किया जाता है. जेनेसिस फ़ाइल की संरचना नीचे बताई गई है |
| जेनेसिस को डिप्लॉय करने से पहले | फ़्रेश नेटवर्क के लिए स्मार्ट कॉन्ट्रैक्ट को पहले डिप्लॉय करता है |

### सर्वर फ्लैग्स {#server-flags}


| **सभी सर्वर फ्लैग्स** |
|---------------------------------------|---------------------------------------------|
| [डेटा-डायरेक्टरी](/docs/edge/get-started/cli-commands#data-dir) | [jsonrpc](/docs/edge/get-started/cli-commands#jsonrpc) |
| [json-rpc-ब्लॉक-रेंज-लिमिट](/docs/edge/get-started/cli-commands#json-rpc-block-range-limit) | [json-rpc-बैच-रिक्वेस्ट-लिमिट](/docs/edge/get-started/cli-commands#json-rpc-batch-request-limit) |
| [grpc](/docs/edge/get-started/cli-commands#grpc) | [libp2p](/docs/edge/get-started/cli-commands#libp2p) |
| [प्रोमेथियस](/docs/edge/get-started/cli-commands#prometheus) | [ब्लॉक-गैस-टारगेट](/docs/edge/get-started/cli-commands#block-gas-target) |
| [मैक्स-पीअर्स](/docs/edge/get-started/cli-commands#max-peers) | [मैक्स-इनबाउंड-पीअर्स](/docs/edge/get-started/cli-commands#max-inbound-peers) |
| [मैक्स-आउटबाउंड-पीअर्स](/docs/edge/get-started/cli-commands#max-outbound-peers) | [मैक्स-एनक्यूड](/docs/edge/get-started/cli-commands#max-enqueued) |
| [लॉग-लेवल](/docs/edge/get-started/cli-commands#log-level) | [लॉग-टू](/docs/edge/get-started/cli-commands#log-to) |
| [चेन](/docs/edge/get-started/cli-commands#chain) | [जॉइन](/docs/edge/get-started/cli-commands#join) |
| [nat](/docs/edge/get-started/cli-commands#nat) | [dns](/docs/edge/get-started/cli-commands#dns) |
| [कीमत-सीमा](/docs/edge/get-started/cli-commands#price-limit) | [मैक्स-स्लॉट्स](/docs/edge/get-started/cli-commands#max-slots) |
| [कॉन्फ़िगरेशन](/docs/edge/get-started/cli-commands#config) | [सीक्रेट्स-कॉन्फ़िगरेशन](/docs/edge/get-started/cli-commands#secrets-config) |
| [dev](/docs/edge/get-started/cli-commands#dev) | [dev-इंटरवल](/docs/edge/get-started/cli-commands#dev-interval) |
| [नो-डिस्कवर](/docs/edge/get-started/cli-commands#no-discover) | [रिस्टोर](/docs/edge/get-started/cli-commands#restore) |
| [ब्लॉक-टाइम](/docs/edge/get-started/cli-commands#block-time) | [एक्सेस-कंट्रोल-अलाउ-ऑरिजिन्स](/docs/edge/get-started/cli-commands#access-control-allow-origins) |


#### <h4></h4><i>डेटा-डायरेक्टरी</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--data-dir DATA_DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    server --data-dir ./example-dir

</TabItem>
</Tabs>

पॉलीगॉन एज के क्लाइंट डेटा को संग्रहीत करने के लिए इस्तेमाल की जाने वाली डेटा डायरेक्टरी को निर्दिष्ट करने के लिए इस्तेमाल किया जाता है. डिफ़ॉल्ट: `./test-chain`.

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

JSON-RPC, सेवा के लिए पते और पोर्ट को सेट करता है `address:port`.   
अगर केवल पोर्ट को ही परिभाषित `:10001` किया गया है तो यह सभी इंटरफेस से जुड़ जाएगा `0.0.0.0:10001`   
अगर हटा दिया जाता है तो सेवा डिफ़ॉल्ट `address:port`   से जुड़ जाएगी .
डिफ़ॉल्ट पता: `0.0.0.0:8545`.

---

#### <h4></h4><i>json-rpc-ब्लॉक-रेंज-लिमिट</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--json-rpc-block-range-limit BLOCK_RANGE]

</TabItem>
  <TabItem value="example" label="Example">

    server --json-rpc-block-range-limit 1500

</TabItem>
</Tabs>

json-rpc अनुरोधों को एक्जीक्यूट करते समय ध्यान दी जाने वाली अधिकतम ब्लॉक की रेंज को सेट करता है जिसमें ब्लॉक/से ब्लॉक की वैल्यू शामिल होती है (जैसे eth_getLogs). डिफ़ॉल्ट:`1000`.

---

#### <h4></h4><i>json-rpc-बैच-रिक्वेस्ट-लिमिट</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--json-rpc-batch-request-limit MAX_LENGTH]

</TabItem>
  <TabItem value="example" label="Example">

    server --json-rpc-batch-request-limit 50

</TabItem>
</Tabs>

json-rpc बैच के अनुरोधों को संभालते समय ध्यान दी जाने वाली अधिकतम लंबाई को सेट करता है. डिफ़ॉल्ट: `20`.

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

gRPC सेवा `address:port`के लिए पते और पोर्ट को सेट करता है. डिफ़ॉल्ट पता: `127.0.0.1:9632`.

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

libp2p सेवा `address:port`के लिए पते और पोर्ट को सेट करता है . डिफ़ॉल्ट पता: `127.0.0.1:1478`.

---

#### <h4></h4><i>प्रोमेथियस</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--prometheus PROMETHEUS_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    server --prometheus 127.0.0.1:10004

</TabItem>
</Tabs>

प्रोमेथियस सर्वर के लिए पते और पोर्ट को सेट करता है `address:port`.   
अगर केवल पोर्ट को परिभाषित `:5001` किया गया है तो सेवा सभी इंटरफ़ेस से जुड़ जाएगी `0.0.0.0:5001`.   
अगर छोड़ दिया गया है, तो सेवा शुरू नहीं की जाएगी.

---

#### <h4></h4><i>ब्लॉक-गैस-टारगेट</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--block-gas-target BLOCK_GAS_TARGET]

</TabItem>
  <TabItem value="example" label="Example">

    server --block-gas-target 10000000

</TabItem>
</Tabs>

चेन के लिए टारगेट ब्लॉक की गैस सीमा को सेट करता है. डिफ़ॉल्ट (लागू नहीं किया गया है): `0`.

ब्लॉक गैस के टारगेट पर एक और विस्तृत स्पष्टीकरण [TxPool सेक्शन](/docs/edge/architecture/modules/txpool#block-gas-target) में मिल सकता है.

---

#### <h4></h4><i>मैक्स-पीअर्स</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--max-peers PEER_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    server --max-peers 40

</TabItem>
</Tabs>

क्लाइंट के पीअर की अधिकतम गिनती को सेट करता है. डिफ़ॉल्ट: `40`.

पीअर सीमा को या तो `max-peers` या `max-inbound/outbound-peers` फ्लैग का इस्तेमाल करके निर्दिष्ट किया जाना चाहिए.

---

#### <h4></h4><i>मैक्स-इनबाउंड-पीअर्स</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--max-inbound-peers PEER_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    server --max-inbound-peers 32

</TabItem>
</Tabs>

क्लाइंट की अधिकतम इनबाउंड पीअर की गिनती को सेट करता है. अगर `max-peers` को सेट किया गया है, तो मैक्स-इनबाउंड-पीअर की सीमा की गणना निम्नलिखित फॉर्मूले का इस्तेमाल करके की जाती है.

`max-inbound-peer = InboundRatio * max-peers`, जहाँ `InboundRatio` है `0.8`.

---

#### <h4></h4><i>मैक्स-आउटबाउंड-पीअर्स</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--max-outbound-peers PEER_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    server --max-outbound-peers 8

</TabItem>
</Tabs>

क्लाइंट की अधिकतम आउटबाउंड पीअर की गिनती को सेट करता है. अगर `max-peers` को सेट किया गया है, तो मैक्स-आउटबाउंड-पीअर की सीमा की गणना निम्नलिखित फॉर्मूले का इस्तेमाल करके की जाती है.

`max-outbound-peer = OutboundRatio * max-peers`, जहाँ `OutboundRatio` है `0.2`.

---

#### <h4></h4><i>मैक्स-एनक्यूड</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--max-enqueued ENQUEUED_TRANSACTIONS]

</TabItem>
  <TabItem value="example" label="Example">

    server --max-enqueued 210

</TabItem>
</Tabs>

हर अकाउंट लाइन में लगे ट्रांज़ैक्शन की अधिकतम संख्या को सेट करता है. डिफ़ॉल्ट:`128`.

---

#### <h4></h4><i>लॉग-लेवल</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--log-level LOG_LEVEL]

</TabItem>
  <TabItem value="example" label="Example">

    server --log-level DEBUG

</TabItem>
</Tabs>

कंसोल आउटपुट के लिए लॉग लेवल को सेट करता है. डिफ़ॉल्ट: `INFO`.

---

#### <h4></h4><i>लॉग-टू</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--log-to LOG_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    server --log-to node.log

</TabItem>
</Tabs>

लॉग फ़ाइल के नाम को निर्धारित करता है जो सर्वर कमांड से सभी लॉग आउटपुट को होल्ड करेगा.
बाय डिफ़ॉल्ट सभी सर्वर लॉग्स, कंसोल (stdout) को आउटपुट देंगे
लेकिन अगर फ्लैग सेट किया गया है, तो सर्वर कमांड चलाने पर कंसोल को कोई आउटपुट नहीं मिलेगा.

---

#### <h4></h4><i>चेन</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    server --chain /home/ubuntu/genesis.json

</TabItem>
</Tabs>

चेन शुरू करने के लिए इस्तेमाल की जाने वाली जेनेसिस फ़ाइल के बारे में खास तौर से बताता है. डिफ़ॉल्ट: `./genesis.json`.

---

#### <h4></h4><i>जॉइन</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--join JOIN_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    server --join /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

खास तौर से उस पीअर के पते को बताता है जिसे शामिल किया जाना चाहिए.

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

पोर्ट के बिना बाहरी आईपी पते को सेट करता है, ताकि इसे पीअर द्वारा देखा जा सके.

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

होस्ट DNS के पते को सेट करता है. इसका इस्तेमाल बाहरी DNS का विज्ञापन करने के लिए किया जा सकता है. `dns`,`dns4`,`dns6` को सपोर्ट करता है.

---

#### <h4></h4><i>प्राइस-लिमिट</i>


<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--price-limit PRICE_LIMIT]

</TabItem>
  <TabItem value="example" label="Example">

    server --price-limit 10000

</TabItem>
</Tabs>

पूल में स्वीकार किए जाने के लिए गैस की कीमत की न्यूनतम सीमा को सेट करता है. डिफ़ॉल्ट: `1`.

---

#### <h4></h4><i>मैक्स-स्लॉट्स</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--max-slots MAX_SLOTS]

</TabItem>
  <TabItem value="example" label="Example">

    server --max-slots 1024

</TabItem>
</Tabs>

पूल में अधिकतम स्लॉट्स को सेट करता है. डिफ़ॉल्ट: `4096`.

---

#### <h4></h4><i>कॉन्फ़िगरेशन</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--config CLI_CONFIG_PATH]

</TabItem>
  <TabItem value="example" label="Example">

    server --config ./myConfig.json

</TabItem>
</Tabs>

CLI के कॉन्फ़िगरेशन के लिए रास्ते को निर्दिष्ट करता है. `.json` को सपोर्ट करता है.

---

#### <h4></h4><i>सीक्रेट्स-कॉन्फ़िगरेशन</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--secrets-config SECRETS_CONFIG]

</TabItem>
  <TabItem value="example" label="Example">

    server --secrets-config ./secretsManagerConfig.json

</TabItem>
</Tabs>

SecretsManager कॉन्फ़िगरेशन फ़ाइल के लिए पाथ सेट करता है. Hashicorp वॉल्ट, AWS SSM और GCP सीक्रेट्स के मैनेजर के लिए इस्तेमाल किया जाता है. अगर हटा दिए गए हैं तो स्थानीय FS सीक्रेट्स के मैनेजर का इस्तेमाल किया जाता है.

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

क्लाइंट को dev मोड पर सेट करता है. `false`डिफ़ॉल्ट: देव मोड में, सहकर्मी की खोज को डिफ़ॉल्ट रूप से निष्क्रिय किया जाता है.

---

#### <h4></h4><i>dev-इंटरवल</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--dev-interval DEV_INTERVAL]

</TabItem>
  <TabItem value="example" label="Example">

    server --dev-interval 20

</TabItem>
</Tabs>

क्लाइंट के dev नोटिफ़िकेशन इंटरवल को सेकंड में सेट करता है. डिफ़ॉल्ट: `0`.

---

#### <h4></h4><i>नो-डिस्कवर</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--no-discover NO_DISCOVER]

</TabItem>
  <TabItem value="example" label="Example">

    server --no-discover

</TabItem>
</Tabs>

क्लाइंट को दूसरे पीअर्स की खोज करने से रोकता है. डिफ़ॉल्ट: `false`.

---

#### <h4></h4><i>रिस्टोर</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--restore RESTORE]

</TabItem>
  <TabItem value="example" label="Example">

    server --restore backup.dat

</TabItem>
</Tabs>

निर्दिष्ट आर्काइव फ़ाइल से ब्लॉक्स को रिस्टोर करें

---

#### <h4></h4><i>ब्लॉक-टाइम</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--block-time BLOCK_TIME]

</TabItem>
  <TabItem value="example" label="Example">

    server --block-time 1000

</TabItem>
</Tabs>

सेकंड में ब्लॉक के उत्पादन का समय सेट करता है. डिफ़ॉल्ट: `2`

---

#### <h4></h4><i>एक्सेस-कंट्रोल-अलाउ-ऑरिजिन्स</i>
<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--access-control-allow-origins ACCESS_CONTROL_ALLOW_ORIGINS]

</TabItem>
  <TabItem value="example" label="Example">

    server --access-control-allow-origins "https://edge-docs.polygon.technology"

</TabItem>
</Tabs>

JSON-RPC के अनुरोधों    को साझा करने में सक्षम होने के लिए अधिकृत डोमेन को सेट करता है.
मल्टिपल फ्लैग्स `--access-control-allow-origins "https://example1.com" --access-control-allow-origins "https://example2.com"` को मल्टिपल अधिकृत डोमेन में जोड़ें.   
अगर हटा दिया गया है, तो एक्सेस-कंट्रोल-अलाउ-ऑरिजिन्स को `*` में सेट कर दिया जाएगा और सभी डोमेन को अधिकृत कर दिया जाएगा.

---

### जेनेसिस फ्लैग्स {#genesis-flags}
| **सभी जेनेसिस फ्लैग्स** |
|---------------------------------------|---------------------------------------------|
| [डायरेक्टरी](/docs/edge/get-started/cli-commands#dir) | [नाम](/docs/edge/get-started/cli-commands#name) |
| [pos](/docs/edge/get-started/cli-commands#pos) | [युग-साइज़](/docs/edge/get-started/cli-commands#epoch-size) |
| [premine](/docs/edge/get-started/cli-commands#premine) | [chainid](/docs/edge/get-started/cli-commands#chainid) |
| [ibft-वैलिडेटर-प्रकार](/docs/edge/get-started/cli-commands#ibft-validator-type) | [ibft-वैलिडेटर-प्रीफिक्स-पाथ](/docs/edge/get-started/cli-commands#ibft-validators-prefix-path) |
| [ibft-वैलिडेटर](/docs/edge/get-started/cli-commands#ibft-validator) | [ब्लॉक-गैस-लिमिट](/docs/edge/get-started/cli-commands#block-gas-limit) |
| [सहमति](/docs/edge/get-started/cli-commands#consensus) | [बूटनोड](/docs/edge/get-started/cli-commands#bootnode) |
| [मैक्स-वैलिडेटर-काउंट](/docs/edge/get-started/cli-commands#max-validator-count) | [मिनिमम-वैलिडेटर-काउंट](/docs/edge/get-started/cli-commands#min-validator-count) |


#### <h4></h4><i>डायरेक्टरी</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--dir DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --dir ./genesis.json

</TabItem>
</Tabs>

पॉलीगॉन एज के जेनेसिस डेटा के लिए डायरेक्टरी सेट करता है. डिफ़ॉल्ट: `./genesis.json`.

---

#### <h4></h4><i>नाम</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--name NAME]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --name test-chain

</TabItem>
</Tabs>

चेन के लिए नाम सेट करता है. डिफ़ॉल्ट: `polygon-edge`.

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

फ्लैग सेट करता है जो दर्शाता है कि क्लाइंट को IBFT हिस्सेदारी के प्रूफ़ का इस्तेमाल करना चाहिए
अगर फ्लैग या `false` नहीं दिया गया है, तो प्राधिकरण के लिए डिफ़ॉल्ट प्रूफ़ देता है.

---

#### <h4></h4><i>युग-साइज़</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--epoch-size EPOCH_SIZE]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --epoch-size 50

</TabItem>
</Tabs>

चेन के लिए युग का साइज़ सेट करता है. डिफ़ॉल्ट `100000`.

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

premined अकाउंट को सेट करता है और फॉर्मेट को बैलेंस करता है `address:amount`.
रकम या तो दशमलव या तो हेक्स में हो सकती है.
डिफ़ॉल्ट premined बैलेंस: `0xD3C21BCECCEDA1000000`(10 लाख स्थानीय करेंसी के टोकन).

---

#### <h4></h4><i>चेनआईडी</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--chain-id CHAIN_ID]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --chain-id 200

</TabItem>
</Tabs>

चेन की आईडी सेट करता है. डिफ़ॉल्ट: `100`.

---

#### <h4></h4><i>ibft-वैलिडेटर-प्रकार</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--ibft-validator-type IBFT_VALIDATOR_TYPE]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --ibft-validator-type ecdsa

</TabItem>
</Tabs>

ब्लॉक हेडर के वैलिडेशन मोड को निर्दिष्ट करता है. संभावित वैल्यूज़: `[ecdsa, bls]`. डिफ़ॉल्ट: `bls`.

---

#### <h4></h4><i>ibft-वैलिडेटर-प्रीफिक्स-पाथ</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--ibft-validators-prefix-path IBFT_VALIDATORS_PREFIX_PATH]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --ibft-validators-prefix-path test-chain-

</TabItem>
</Tabs>

वैलिडेटर फ़ोल्डर डायरेक्टरी के लिए पहले से निर्धारित पाथ. अगर `ibft-validator` को हटाया जाता है, तो फ्लैग मौजूद होना चाहिए.

---

#### <h4></h4><i>ibft-वैलिडेटर</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--ibft-validator IBFT_VALIDATOR_LIST]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --ibft-validator 0xC12bB5d97A35c6919aC77C709d55F6aa60436900

</TabItem>
</Tabs>

पास हुए पतों को IBFT वैलिडेटर के रूप में सेट करता है. अगर `ibft-validators-prefix-path` को हटाया जाता है, तो फ्लैग मौजूद होना चाहिए.
1. अगर नेटवर्क ECDSA, के साथ रन कर रहा है, तो फॉर्मेट `--ibft-validator [ADDRESS]`है .
2. अगर नेटवर्क BLS के साथ रन कर रहा है, तो फॉर्मेट `--ibft-validator [ADDRESS]:[BLS_PUBLIC_KEY]`होता है  .

---

#### <h4></h4><i>ब्लॉक-गैस-लिमिट</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--block-gas-limit BLOCK_GAS_LIMIT]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --block-gas-limit 5000000

</TabItem>
</Tabs>

एक ब्लॉक में सभी कार्यों के लिए इस्तेमाल की जाने वाली गैस की अधिकतम मात्रा को संदर्भित करता है. डिफ़ॉल्ट: `5242880`.

---

#### <h4></h4><i>सहमति</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--consensus CONSENSUS_PROTOCOL]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --consensus ibft

</TabItem>
</Tabs>

प्रोटोकॉल की सहमति देता है. डिफ़ॉल्ट: `pow`.

---

#### <h4></h4><i>बूटनोड</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--bootnode BOOTNODE_URL]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --bootnode /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

p2p डिस्कवरी बूटस्ट्रैप के लिए Multiaddr URL . इस फ्लैग को कई बार इस्तेमाल किया जा सकता है.
आईपी पते की बजाय, बूटनोड के DNS का पता प्रदान किया जा सकता है.

---

#### <h4></h4><i>मैक्स-वैलिडेटर-काउंट</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--max-validator-count MAX_VALIDATOR_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --max-validator-count 42

</TabItem>
</Tabs>

PoS में सहमति के लिए, वैलिडेटर सेट में शामिल हो सकने वाले स्टेकर्स की अधिकतम संख्या.
यह संख्या MAX_SAFE_INTEGER (2^53-2) की वैल्यू से अधिक नहीं हो सकती है.

---

#### <h4></h4><i>मिनिमम-वैलिडेटर-काउंट</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--min-validator-count MIN_VALIDATOR_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --min-validator-count 4

</TabItem>
</Tabs>

PoS में सहमति के लिए, वैलिडेटर सेट में शामिल होने के लिए स्टेकर्स की न्यूनतम आवश्यक संख्या.
यह संख्या मैक्स-वैलिडेटर-काउंट की वैल्यू से अधिक नहीं हो सकती है.
1 के लिए डिफ़ॉल्ट.

---

### पहले से डिप्लॉय किए जाने वाले जेनेसिस फ्लैग्स {#genesis-predeploy-flags}

<h4><i>आर्टिफैक्ट-पाथ</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis predeploy [--artifacts-path PATH_TO_ARTIFACTS]

</TabItem>
  <TabItem value="example" label="Example">

    genesis predeploy --artifacts-path ./ArtifactsData.json

</TabItem>
</Tabs>

कॉन्ट्रैक्ट आर्टिफैक्ट JSON के लिए पाथ सेट करता है जिसमें `abi`, `bytecode` और `deployedBytecode`शामिल होते हैं.

---

<h4><i>चेन</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis predeploy [--chain PATH_TO_GENESIS]

</TabItem>
  <TabItem value="example" label="Example">

    genesis predeploy --chain ./genesis.json

</TabItem>
</Tabs>

`genesis.json` फ़ाइल के लिए पाथ सेट करता है जिसे अपडेट किया जाना चाहिए. डिफ़ॉल्ट `./genesis.json`.

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

 अगर कोई हो तो स्मार्ट कॉन्ट्रैक्ट के लिए कंस्ट्रक्टर आर्ग्युमेंट को सेट करता है. इन आर्ग्युमेंट को कैसा दिखना चाहिए, इस पर एक विस्तृत गाइड के लिए, कृपया [पहले से डिप्लॉय करने के बारे में लेख](/docs/edge/additional-features/predeployment) देखें.

---

<h4><i>पहले से डिप्लॉय किया गया एड्रेस</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis predeploy [--predeploy-address PREDEPLOY_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    genesis predeploy --predeploy-address 0x5555

</TabItem>
</Tabs>

पहले से डिप्लॉय करने के लिए पता सेट करता है. डिफ़ॉल्ट `0x0000000000000000000000000000000000001100`.

---


## ऑपरेटर कमांड्स {#operator-commands}

### पीअर कमांड्स {#peer-commands}

| **कमांड** | **वर्णन** |
|------------------------|-------------------------------------------------------------------------------------|
| पीअर्स का पता | उनके libp2p पते का इस्तेमाल करके एक नया पीअर जोड़ता है |
| पीअर्स की सूची | उन सभी पीअर्स की सूची बनाता है जिनसे क्लाइंट libp2p के माध्यम से जुड़ा हुआ है |
| पीअर्स स्टेटस | libp2p पते का इस्तेमाल करके पीअर्स की सूची से एक खास पीअर का स्टेटस रिटर्न करता है |

<h3>पीअर्स के पते के फ्लैग्स</h3>

<h4><i>पता</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers add --addr PEER_ADDRESS

</TabItem>
  <TabItem value="example" label="Example">

    peers add --addr /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

multiaddr फॉर्मेट में पीअर का libp2p पता.

---

<h4><i>grpc-पता</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers add [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    peers add --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API का पता. डिफ़ॉल्ट: `127.0.0.1:9632`.

<h3>पीअर्स की सूची के फ्लैग</h3>

<h4><i>grpc-पता</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers list [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    peers list --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API का पता. डिफ़ॉल्ट: `127.0.0.1:9632`.

<h3>पीअर्स के स्टेटस के फ्लैग</h3>

<h4><i>peer-id</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers status --peer-id PEER_ID

</TabItem>
  <TabItem value="example" label="Example">

    peers status --peer-id 16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

p2p नेटवर्क के भीतर एक खास पीअर के Libp2p नोड की आईडी है.

---

<h4><i>grpc-पता</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    peers status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API का पता. डिफ़ॉल्ट: `127.0.0.1:9632`.

### IBFT कमांड्स {#ibft-commands}

| **कमांड** | **वर्णन** |
|------------------------|-------------------------------------------------------------------------------------|
| ibft स्नैपशॉट | IBFT के स्नैपशॉट को रिटर्न करता है |
| ibft के उम्मीदवार | यह प्रस्तावित उम्मीदवारों के मौजूदा सेट और साथ ही उन उम्मीदवारों से पूछताछ करता है जिन्हें अभी तक शामिल नहीं किया गया है |
| ibft के प्रस्ताव | वैलिडेटर के सेट में एक नए उम्मीदवार को जोड़ने/हटाने का प्रस्ताव करता है |
| ibft स्टेटस | IBFT क्लाइंट के ओवरआल स्टेटस को रिटर्न करता है |
| ibft स्विच | genesis.json फ़ाइल में फ़ोर्क की कॉन्फ़िगरेशन जोड़ें ताकि IBFT के प्रकार को स्विच किया जा सके |
| ibft कोरम | ब्लॉक की संख्या को निर्दिष्ट करता है जिससे बाद सहमति तक पहुंचने के लिए ऑप्टीमल कोरम के आकार के तरीके को इस्तेमाल किया जाएगा |


<h3>ibft स्नैपशॉट के फ्लैग</h3>

<h4><i>नंबर</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft snapshot [--number BLOCK_NUMBER]

</TabItem>
  <TabItem value="example" label="Example">

    ibft snapshot --number 100

</TabItem>
</Tabs>

स्नैपशॉट के लिए ब्लॉक हाइट (संख्या में).

---

<h4><i>grpc-पता</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft snapshot [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    ibft snapshot --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API का पता. डिफ़ॉल्ट: `127.0.0.1:9632`.

<h3>ibft के उम्मीदवारों के फ्लैग्स</h3>

<h4><i>grpc-पता</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft candidates [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    ibft candidates --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API का पता. डिफ़ॉल्ट: `127.0.0.1:9632`.

<h3>ibft के प्रस्ताव के फ्लैग</h3>

<h4><i>वोट</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft propose --vote VOTE

</TabItem>
  <TabItem value="example" label="Example">

    ibft propose --vote auth

</TabItem>
</Tabs>

वैलिडेटर सेट में बदलाव को प्रस्तावित करता है. संभावित वैल्यूज़: `[auth, drop]`.

---

<h4><i>पता</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft propose --addr ETH_ADDRESS

</TabItem>
  <TabItem value="example" label="Example">

    ibft propose --addr 0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7

</TabItem>
</Tabs>

वोट किए जाने वाले अकाउंट का पता.

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

वोट किए जाने वाले अकाउंट की BLS की सार्वजनिक की जो केवल BLS मोड में आवश्यक है.

---

<h4><i>grpc-पता</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft candidates [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    ibft candidates --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API का पता. डिफ़ॉल्ट: `127.0.0.1:9632`.

<h3>ibft स्टेटस के फ्लैग</h3>

<h4><i>grpc-पता</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    ibft status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API का पता. डिफ़ॉल्ट: `127.0.0.1:9632`.

<h3>ibft स्विच के फ्लैग</h3>

<h4><i>चेन</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --chain genesis.json

</TabItem>
</Tabs>

जेनेसिस फ़ाइल को अपडेट करने के लिए निर्दिष्ट करता है. डिफ़ॉल्ट: `./genesis.json`.

---

<h4><i>प्रकार</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--type TYPE]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --type PoS

</TabItem>
</Tabs>

स्विच करने के लिए IBFT के प्रकार को निर्दिष्ट करता है. संभावित वैल्यूज़: `[PoA, PoS]`.

---

<h4><i>डिप्लॉयमेंट</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--deployment DEPLOYMENT]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --deployment 100

</TabItem>
</Tabs>

कॉन्ट्रैक्ट को डिप्लॉय करने की हाइट को निर्दिष्ट करता है. केवल PoS के साथ उपलब्ध है.

---

<h4><i>फ्रॉम</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--from FROM]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --from 200

</TabItem>
</Tabs>

---

<h4><i>ibft-वैलिडेटर-प्रकार</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

     ibft switch [--ibft-validator-type IBFT_VALIDATOR_TYPE]

</TabItem>
  <TabItem value="example" label="Example">

     ibft switch --ibft-validator-type ecdsa

</TabItem>
</Tabs>

ब्लॉक हेडर के वैलिडेशन मोड को निर्दिष्ट करता है. संभावित वैल्यूज़: `[ecdsa, bls]`. डिफ़ॉल्ट: `bls`.

---

<h4><i>ibft-वैलिडेटर-प्रीफिक्स-पाथ</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

     ibft switch [--ibft-validators-prefix-path IBFT_VALIDATORS_PREFIX_PATH]

</TabItem>
  <TabItem value="example" label="Example">

     ibft switch --ibft-validators-prefix-path test-chain-

</TabItem>
</Tabs>

नए वैलिडेटर्स की डायरेक्टरिज़ के लिए पाथ को पहले से निर्धारित करता है. अगर `ibft-validator` फ्लैग को हटा दिया जाता है, तो मौजूद होना चाहिए. तभी उपलब्ध होता है जब IBFT मोड PoA हो (`--pos` फ्लैग को हटा दिया जाता है).

---

<h4><i>ibft-वैलिडेटर</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

     ibft switch [--ibft-validator IBFT_VALIDATOR_LIST]

</TabItem>
  <TabItem value="example" label="Example">

     ibft switch --ibft-validator 0xC12bB5d97A35c6919aC77C709d55F6aa60436900

</TabItem>
</Tabs>

फोर्क के बाद इस्तेमाल किए जाने वाले IBFT वैलिडेटर्स के रूप में पतों में पास किए गए सेट्स. अगर `ibft-validators-prefix-path` फ्लैग को हटा दिया जाता है, तो मौजूद होना चाहिए. केवल PoA मोड में उपलब्ध है.
1. अगर नेटवर्क ECDSA, के साथ रन कर रहा है, तो फॉर्मेट `--ibft-validator [ADDRESS]`है .
2. अगर नेटवर्क BLS के साथ रन कर रहा है, तो फॉर्मेट `--ibft-validator [ADDRESS][BLS_PUBLIC_KEY]`होता है  .

---

<h4><i>मैक्स-वैलिडेटर-काउंट</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--max-validator-count MAX_VALIDATOR_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --max-validator-count 42

</TabItem>
</Tabs>

PoS में सहमति के लिए, वैलिडेटर सेट में शामिल हो सकने वाले स्टेकर्स की अधिकतम संख्या.
यह संख्या MAX_SAFE_INTEGER (2^53-2) की वैल्यू से अधिक नहीं हो सकती है.

---

<h4><i>मिनिमम-वैलिडेटर-काउंट</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--min-validator-count MIN_VALIDATOR_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --min-validator-count 4

</TabItem>
</Tabs>

PoS में सहमति के लिए, वैलिडेटर सेट में शामिल होने के लिए स्टेकर्स की न्यूनतम आवश्यक संख्या.
यह संख्या मैक्स-वैलिडेटर-काउंट की वैल्यू से अधिक नहीं हो सकती है.
1 के लिए डिफ़ॉल्ट.

फ़ोर्क की शुरूआती हाइट को निर्दिष्ट करता है.

---

<h3>ibft कोरम के फ्लैग</h3>

<h4><i>फ्रॉम</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft quorum [--from your_quorum_switch_block_num]

</TabItem>
  <TabItem value="example" label="Example">

    ibft quorum --from 350

</TabItem>
</Tabs>

कोरम की गणना को QuorumOptimal से स्विच करने की हाइट, जिसमें `N`वैलिडेटर नोड्स की संख्या होने के नाते `(2/3 * N)`, फ़ार्मूला इस्तेमाल होता है. कृपया ध्यान दें कि यह पीछे की कम्पेटिबिलिटी के लिए है, मतलब कि केवल उन चेन के लिए है जो ब्लॉक की एक निश्चित हाइट तक कोरम की पुरानी गणना का इस्तेमाल करती थी.

---

<h4><i>चेन</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft quorum [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    ibft quorum --chain genesis.json

</TabItem>
</Tabs>

जेनेसिस फ़ाइल को अपडेट करने के लिए निर्दिष्ट करता है. डिफ़ॉल्ट: `./genesis.json`.

### ट्रांज़ैक्शन पूल कमांड्स {#transaction-pool-commands}

| **कमांड** | **वर्णन** |
|------------------------|--------------------------------------------------------------------------------------|
| txpool का स्टेटस | पूल में ट्रांज़ैक्शन की संख्या को रिटर्न करता है |
| txpool की सदस्यता | ट्रांज़ैक्शन पूल में इवेंट्स के लिए सदस्यता लेता है |

<h3>txpool स्टेटस के फ्लैग</h3>

<h4><i>grpc-पता</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    txpool status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API का पता. डिफ़ॉल्ट: `127.0.0.1:9632`.

<h3>txpool की सदस्यता के फ्लैग</h3>

<h4><i>grpc-पता</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API का पता. डिफ़ॉल्ट: `127.0.0.1:9632`.

---

<h4><i>प्रमोटेड</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--promoted LISTEN_PROMOTED]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --promoted

</TabItem>
</Tabs>

TxPool में tx इवेंट्स को बढ़ावा देने के लिए सदस्यता लेता है.

---

<h4><i>ड्रॉप किए गए</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--dropped LISTEN_DROPPED]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --dropped

</TabItem>
</Tabs>

TxPool में ड्रॉप हुए tx इवेंट्स के लिए सदस्यता लेता है.

---

<h4><i>डिमोटेड</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--demoted LISTEN_DEMOTED]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --demoted

</TabItem>
</Tabs>

TxPool में tx इवेंट्स के लिए डिमोट की गई सदस्यता लेता है.

---

<h4><i>एड की गई</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--added LISTEN_ADDED]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --added

</TabItem>
</Tabs>

TxPool में tx इवेंट्स के लिए एड की गई सदस्यता लेता है.

---

<h4><i>एनक्यूड</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--enqueued LISTEN_ENQUEUED]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --enqueued

</TabItem>
</Tabs>

अकाउंट की एनक्यूड tx इवेंट्स के लिए सदस्यता लेता है.

---

### ब्लॉकचेन कमांड्स {#blockchain-commands}

| **कमांड** | **वर्णन** |
|------------------------|-------------------------------------------------------------------------------------|
| स्टेटस | क्लाइंट का स्टेटस रिटर्न करता है. विस्तृत प्रतिक्रिया नीचे पाई जा सकती है |
| मॉनिटर | ब्लॉकचेन के इवेंट स्ट्रीम में सदस्यता लेता है. विस्तृत प्रतिक्रिया नीचे देख सकते हैं |
| वर्जन | क्लाइंट के वर्तमान वर्जन को रिटर्न करता है |

<h3>स्टेटस के फ्लैग्स</h3>

<h4><i>grpc-पता</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API का पता. डिफ़ॉल्ट: `127.0.0.1:9632`.

<h3>मॉनिटर फ्लैग्स</h3>

<h4><i>grpc-पता</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    monitor [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    monitor --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API का पता. डिफ़ॉल्ट: `127.0.0.1:9632`.

---
<h3>संस्करण कमांड</h3>


<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    version

</TabItem>
</Tabs>

रिलीज संस्करण, git शाखा, हैश को प्रतिबद्ध करें और निर्माण समय को प्रदर्शित करें.

## सीक्रेट्स कमांड्स {#secrets-commands}

| **कमांड** | **वर्णन** |
|-------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| सीक्रेट्स शुरू करें | निजी कीज़ की संबंधित सीक्रेट्स मैनेजर से शुरूआत कराता है |
| सीक्रेट्स को जनरेट करें | एक सीक्रेट्स मैनेजर की कॉन्फ़िगरेशन फ़ाइल जनरेट करता है, जिसे पॉलीगॉन एज द्वारा पार्स किया जा सकता है |
| सीक्रेट्स आउटपुट | संदर्भ के लिए BLS और वैलिडेटर की सार्वजनिक की का पता, और नोड की आईडी प्रिंट करता है |

### सीक्रेट्स की शुरुआत होने के फ्लैग्स {#secrets-init-flags}

<h4><i>कॉन्फ़िगरेशन</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets init [--config SECRETS_CONFIG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets init --config ./secretsManagerConfig.json

</TabItem>
</Tabs>

SecretsManager कॉन्फ़िगरेशन फ़ाइल के लिए पाथ सेट करता है. Hashicorp Vault के लिए इस्तेमाल किया गया. अगर हटा दिए गए हैं तो स्थानीय FS सीक्रेट्स के मैनेजर का इस्तेमाल किया जाता है.

---

<h4><i>डेटा-डायरेक्टरी</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets init [--data-dir DATA_DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    secrets init --data-dir ./example-dir

</TabItem>
</Tabs>

अगर स्थानीय FS का इस्तेमाल किया जाता है तो पॉलीगॉन एज डेटा के लिए डायरेक्टरी सेट करता है.

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

फ्लैग के सेट ये दर्शाते हैं कि ECDSA की जनरेट करनी है या नहीं. डिफ़ॉल्ट: `true`.

---

<h4><i>नेटवर्क</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets init [--network FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets init --network=false

</TabItem>
</Tabs>

फ्लैग के सेट ये दर्शाते हैं कि Libp2p नेटवर्क की जनरेट करनी है या नहीं. डिफ़ॉल्ट: `true`.

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

फ्लैग के सेट ये दर्शाते हैं कि BLS की जनरेट करनी है या नहीं. डिफ़ॉल्ट: `true`.

### सीक्रेट्स जनरेट करने के फ्लैग  {#secrets-generate-flags}

<h4><i>डायरेक्टरी</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--dir DATA_DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --dir ./example-dir

</TabItem>
</Tabs>

सीक्रेट्स मैनेजर की कॉन्फ़िगरेशन फ़ाइल के लिए डिफ़ॉल्ट `./secretsManagerConfig.json` डायरेक्टरी सेट करता है:

---

<h4><i>प्रकार</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--type TYPE]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --type hashicorp-vault

</TabItem>
</Tabs>

सीक्रेट्स मैनेजर के प्रकार [`hashicorp-vault`]को निर्दिष्ट करता है . डिफ़ॉल्ट: `hashicorp-vault`

---

<h4><i>टोकन</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--token TOKEN]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --token s.zNrXa9zF9mgrdnClM7PZ19cu

</TabItem>
</Tabs>

सेवा के लिए एक्सेस टोकन को निर्दिष्ट करता है

---

<h4><i>सर्वर-url</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--server-url SERVER_URL]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --server-url http://127.0.0.1:8200

</TabItem>
</Tabs>

सेवा के लिए सर्वर URL को निर्दिष्ट करता है

---

<h4><i>नाम</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--name NODE_NAME]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --name node-1

</TabItem>
</Tabs>

ऑन सर्विस रिकॉर्ड रखने के लिए नोड का नाम निर्दिष्ट करता है. डिफ़ॉल्ट: `polygon-edge-node`

---

<h4><i>नेमस्पेस</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--namespace NAMESPACE]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --namespace my-namespace

</TabItem>
</Tabs>

Hashicorp वॉल्ट के सीक्रेट्स मैनेजर के लिए इस्तेमाल किए जाने वाले नेमस्पेस को निर्दिष्ट करता है. डिफ़ॉल्ट: `admin`

### सीक्रेट्स आउटपुट फ्लैग्स {#secrets-output-flags}

<h4><i>bls</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--bls FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --bls

</TabItem>
</Tabs>

फ्लैग के सेट ये दर्शाते हैं कि केवल BLS की सार्वजनिक की का आउटपुट देना है या नहीं. डिफ़ॉल्ट: `true`

---

<h4><i>कॉन्फ़िगरेशन</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--config SECRETS_CONFIG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --config ./secretsManagerConfig.json

</TabItem>
</Tabs>

SecretsManager कॉन्फ़िगरेशन फ़ाइल के लिए पाथ सेट करता है. अगर हटा दिए गए हैं तो स्थानीय FS सीक्रेट्स के मैनेजर का इस्तेमाल किया जाता है.

---

<h4><i>डेटा-डायरेक्टरी</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--data-dir DATA_DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --data-dir ./example-dir

</TabItem>
</Tabs>

अगर स्थानीय FS का इस्तेमाल किया जाता है तो पॉलीगॉन एज डेटा के लिए डायरेक्टरी सेट करता है.

---

<h4><i>नोड-आईडी</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--node-id FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --node-id

</TabItem>
</Tabs>

फ्लैग के सेट ये दर्शाते हैं कि केवल नेटवर्क नोड की आईडी का आउटपुट देना है या नहीं. डिफ़ॉल्ट: `true`

---

<h4><i>वैलिडेटर</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--validator FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --validator

</TabItem>
</Tabs>

फ्लैग के सेट ये दर्शाते हैं कि केवल वैलिडेटर के पते का आउटपुट देना है या नहीं. डिफ़ॉल्ट: `true`

---

## प्रतिक्रियाएँ {#responses}

### स्टेटस की प्रतिक्रिया {#status-response}

प्रोटोकॉल के बफ़र्स को इस्तेमाल करके प्रतिक्रिया के ऑब्जेक्ट को परिभाषित किया जाता है.
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

### मॉनिटर की प्रतिक्रिया {#monitor-response}
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

## उपयोगिताएँ {#utilities}

### वाइटलिस्ट की कमांड्स {#whitelist-commands}

| **कमांड** | **वर्णन** |
|------------------------|-------------------------------------------------------------------------------------|
| वाइटलिस्ट शो करें | वाइटलिस्ट की जानकारी को प्रदर्शित करता है |
| वाइटलिस्ट डिप्लॉयमेंट | स्मार्ट कॉन्ट्रैक्ट को डिप्लॉय करने की वाइटलिस्ट को अपडेट करता है |

<h3> वाइटलिस्ट शो करें </h3>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist show

</TabItem>
</Tabs>

वाइटलिस्ट की जानकारी को प्रदर्शित करता है.

---

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist show [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist show --chain genesis.json

</TabItem>
</Tabs>

जेनेसिस फ़ाइल को अपडेट करने के लिए निर्दिष्ट करता है. डिफ़ॉल्ट: `./genesis.json`.

---

<h3> वाइटलिस्ट का डिप्लॉयमेंट </h3>

<h4><i>चेन</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist deployment [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist deployment --chain genesis.json

</TabItem>
</Tabs>

जेनेसिस फ़ाइल को अपडेट करने के लिए निर्दिष्ट करता है. डिफ़ॉल्ट: `./genesis.json`.

---

<h4><i>पता</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist deployment [--add ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist deployment --add 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d

</TabItem>
</Tabs>

कॉन्ट्रैक्ट की डिप्लॉयमेंट वाइटलिस्ट में एक नया पता जोड़ता है. कॉन्ट्रैक्ट के डिप्लॉयमेंट की वाइटलिस्ट में केवल पते ही कॉन्ट्रैक्ट को डिप्लॉय कर सकते हैं. खाली होने पर कोई भी पता कॉन्ट्रैक्ट के डिप्लॉयमेंट को एग्ज़ीक्यूट कर सकता है

---

<h4><i>रिमूव</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist deployment [--remove ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist deployment --remove 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d

</TabItem>
</Tabs>

कॉन्ट्रैक्ट की डिप्लॉयमेंट वाइटलिस्ट से एक पते को हटा देता है. कॉन्ट्रैक्ट के डिप्लॉयमेंट की वाइटलिस्ट में केवल पते ही कॉन्ट्रैक्ट को डिप्लॉय कर सकते हैं. खाली होने पर कोई भी पता कॉन्ट्रैक्ट के डिप्लॉयमेंट को एग्ज़ीक्यूट कर सकता है

---

### बैकअप के फ्लैग्स {#backup-flags}

<h4><i>grpc-पता</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    backup [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    backup --grpc-address 127.0.0.1:9632

</TabItem>
</Tabs>

gRPC API का पता. डिफ़ॉल्ट: `127.0.0.1:9632`.

---

<h4><i>बाहर</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    backup [--out OUT]

</TabItem>
  <TabItem value="example" label="Example">

    backup --out backup.dat

</TabItem>
</Tabs>

आर्काइव फ़ाइल को सेव करने का पाथ.

---

<h4><i>फ्रॉम</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    from [--from FROM]

</TabItem>
  <TabItem value="example" label="Example">

    backup --from 0x0

</TabItem>
</Tabs>

आर्काइव में ब्लॉक्स की शुरूआती हाइट. डिफ़ॉल्ट: 0.

---

<h4><i>टू</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    to [--to TO]

</TabItem>
  <TabItem value="example" label="Example">

    backup --to 0x2710

</TabItem>
</Tabs>

आर्काइव में ब्लॉक्स के एंड की ऊँचाई.

---

## जेनेसिस टेम्पलेट {#genesis-template}
ब्लॉकचेन के शुरुआती स्टेट को सेट करने के लिए जेनेसिस फ़ाइल का इस्तेमाल किया जाना चाहिए (उदाहरण के लिए अगर कुछ खातों में शुरू करने के लिए बैलेंस होना चाहिए).

निम्नलिखित *./genesis.json* फ़ाइल को जनरेट किया गया है:
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

### डेटा डायरेक्टरी {#data-directory}

जब *डेटा-डायरेक्टरी* फ्लैग को एग्ज़ीक्यूट किया जाता है, एक **टेस्ट-चेन** फ़ोल्डर जनरेट होता है
फ़ोल्डर की संरचना में निम्नलिखित सब-फ़ोल्डर शामिल होते हैं:
* **ब्लॉकचेन** - ब्लॉकचेन ऑब्जेक्ट्स के लिए LevelDB को स्टोर करता है
* **trie** - Merkle कोशिश करने के लिए LevelDB को स्टोर करता है
* **कीस्टोर** - क्लाइंट के लिए निजी की को स्टोर करता है. इसमें libp2p की निजी की और सीलिंग / वैलिडेटर की निजी की भी शामिल होती है
* **सहमति** - सहमति की किसी भी जानकारी को स्टोर करता है जिसकी काम करते समय क्लाइंट को ज़रूरत हो सकती है

## संसाधन {#resources}
* **[प्रोटोकॉल बफ़र्स](https://developers.google.com/protocol-buffers)**

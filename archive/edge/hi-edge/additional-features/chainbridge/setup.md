---
id: setup
title: सेटअप
description: चेनब्रिज को कैसे सेटअप करें
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

## कॉन्ट्रैक्ट्स का डिप्लॉयमेंट {#contracts-deployment}

इस सेक्शन में, आप `cb-sol-cli` के साथ पॉलीगॉन PoS और पॉलीगॉन एज चेन के लिए ज़रूरी कॉन्ट्रैक्ट डिप्लॉय करेंगे.

```bash
# Setup for cb-sol-cli command
$ git clone https://github.com/ChainSafe/chainbridge-deploy.git
$ cd chainbridge-deploy/cb-sol-cli
$ make install
```

सबसे पहले, हम `cb-sol-cli deploy` कमांड द्वारा पॉलीगॉन PoS चेन में कॉन्ट्रैक्ट को डिप्लॉय करेंगे. `--all` फ्लैग कमांड को ब्रिज, ERC20 हैंडलर, ERC721 हैंडलर, जेनेरिक हैंडलर, ERC20 और ERC721 कॉन्ट्रैक्ट्स सहित सभी कॉन्ट्रैक्ट्स को डिप्लॉय करता है. इसके अलावा, यह डिफ़ॉल्ट रिलेयर अकाउंट पता और थ्रेशोल्ड सेट करेगा

```bash
# Deploy all required contracts into Polygon PoS chain
$ cb-sol-cli deploy --all --chainId 99 \
  --url https://rpc-mumbai.matic.today \
  --gasPrice [GAS_PRICE] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```


[यहाँ](/docs/edge/additional-features/chainbridge/definitions) पर चेनID और JSON-RPC URL के बारे में अधिक जानें

:::caution

`cb-sol-cli` में डिफ़ॉल्ट गैस की कीमत `20000000` (`0.02 Gwei`) है. ट्रांज़ैक्शन में उचित गैस की कीमत निर्धारित करने के लिए, कृपया `--gasPrice` आर्गुमेंट का इस्तेमाल करके वैल्यू निर्धारित करें.

```bash
$ cb-sol-cli deploy --all --chainId 99 \
  --url https://rpc-mumbai.matic.today \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1 \
  # Set gas price to 5 Gwei
  --gasPrice 5000000000
```

:::

:::caution

ब्रिज कॉन्ट्रैक्ट डिप्लॉय करने के लिए लगभग 0x3f97b8 (4167608) गैस लेता है. कृपया सुनिश्चित करें कि जो ब्लॉक जनरेट किए जा रहे हैं उनमें कॉन्ट्रैक्ट क्रिएशन ट्रांज़ैक्शन को शामिल करने के लिए पर्याप्त ब्लॉक गैस सीमा है. पॉलीगॉन एज में ब्लॉक गैस सीमा को बदलने के बारे में अधिक जानकारी के लिए, कृपया जाएँ
[स्थानीय सेटअप](/docs/edge/get-started/set-up-ibft-locally)

:::

एक बार कॉन्ट्रैक्ट्स के डिप्लॉय होने पर, आपको निम्नलिखित परिणाम मिलेंगे:

```bash
Deploying contracts...
✓ Bridge contract deployed
✓ ERC20Handler contract deployed
✓ ERC721Handler contract deployed
✓ GenericHandler contract deployed
✓ ERC20 contract deployed
WARNING: Multiple definitions for safeTransferFrom
✓ ERC721 contract deployed

================================================================
Url:        https://rpc-mumbai.matic.today
Deployer:   <ADMIN_ACCOUNT_ADDRESS>
Gas Limit:   8000000
Gas Price:   20000000
Deploy Cost: 0.00029065308

Options
=======
Chain Id:    <CHAIN_ID>
Threshold:   <RELAYER_THRESHOLD>
Relayers:    <RELAYER_ACCOUNT_ADDRESS>
Bridge Fee:  0
Expiry:      100

Contract Addresses
================================================================
Bridge:             <BRIDGE_CONTRACT_ADDRESS>
----------------------------------------------------------------
Erc20 Handler:      <ERC20_HANDLER_CONTRACT_ADDRESS>
----------------------------------------------------------------
Erc721 Handler:     <ERC721_HANDLER_CONTRACT_ADDRESS>
----------------------------------------------------------------
Generic Handler:    <GENERIC_HANDLER_CONTRACT_ADDRESS>
----------------------------------------------------------------
Erc20:              <ERC20_CONTRACT_ADDRESS>
----------------------------------------------------------------
Erc721:             <ERC721_CONTRACT_ADDRESS>
----------------------------------------------------------------
Centrifuge Asset:   Not Deployed
----------------------------------------------------------------
WETC:               Not Deployed
================================================================
```

अब हम पॉलीगॉन एज चेन में कॉन्ट्रैक्ट्स को डिप्लॉय कर सकते हैं.

```bash
# Deploy all required contracts into Polygon Edge chain
$ cb-sol-cli deploy --all --chainId 100 \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```

डिप्लॉय किए गए स्मार्ट कॉन्ट्रैक्ट एड्रेस के साथ टर्मिनल आउटपुट को सेव करें, क्योंकि हमें अगले स्टेप में उनकी ज़रूरत होगी.

## रिलेयर सेटअप {#relayer-setup}

इस सेक्शन में, आप 2 चेन के बीच डेटा का एक्सचेंज करने के लिए रिलेयर शुरू करेंगे.

सबसे पहले, हमें क्लोन करने और चेनब्रिज रिपॉज़िटरी बनाने की ज़रूरत है.

```bash
$ git clone https://github.com/ChainSafe/ChainBridge.git
$ cd chainBridge && make install
```

इसके बाद, आप JSON-RPC URL, रिलेयर पता और सभी चेन के कॉन्ट्रैक्ट्स के पता को सेट करें और `config.json` बनाएँ.

```json
{
  "chains": [
    {
      "name": "mumbai",
      "type": "ethereum",
      "id": "99",
      "endpoint": "https://rpc-mumbai.matic.today",
      "from": "<RELAYER_ACCOUNT_ADDRESS>",
      "opts": {
        "bridge": "<BRIDGE_CONTRACT_ADDRESS>",
        "erc20Handler": "<ERC20_HANDLER_CONTRACT_ADDRESS>",
        "erc721Handler": "<ERC721_HANDLER_CONTRACT_ADDRESS>",
        "genericHandler": "<GENERIC_HANDLER_CONTRACT_ADDRESS>",
        "minGasPrice": "1",
        "http": "true"
      }
    },
    {
      "name": "polygon-edge",
      "type": "ethereum",
      "id": "100",
      "endpoint": "http://localhost:10002",
      "from": "<RELAYER_ACCOUNT_ADDRESS>",
      "opts": {
        "bridge": "<BRIDGE_CONTRACT_ADDRESS>",
        "erc20Handler": "<ERC20_HANDLER_CONTRACT_ADDRESS>",
        "erc721Handler": "<ERC721_HANDLER_CONTRACT_ADDRESS>",
        "genericHandler": "<GENERIC_HANDLER_CONTRACT_ADDRESS>",
        "minGasPrice": "1",
        "http": "true"
      }
    }
  ]
}
```

रिलेयर शुरू करने के लिए, आपको रिलेयर अकाउंट एड्रेस के अनुरूप निजी की इम्पोर्ट करनी होगी. निजी की इंपोर्ट करने के लिए, आपको पासवर्ड डालना होगा. इंपोर्ट सफल होने के बाद, की `keys/<ADDRESS>.key` पर स्टोर हो जाएगी.

```bash
# Import private key and store to local with encryption
$ chainbridge accounts import --privateKey [RELAYER_ACCOUNT_PRIVATE_KEY]

INFO[11-19|07:09:01] Importing key...
Enter password to encrypt keystore file:
> [PASSWORD_TO_ENCRYPT_KEY]
INFO[11-19|07:09:05] private key imported                     address=<RELAYER_ACCOUNT_ADDRESS> file=.../keys/<RELAYER_ACCOUNT_ADDRESS>.key
```

फिर, आप रिलेयर शुरू कर सकते हैं. आपको वही पासवर्ड डालना होगा जो आपने शुरुआत में की को स्टोर करने के लिए चुना था.

```bash
# Start relayer
$ chainbridge --config config.json --latest

INFO[11-19|07:15:19] Starting ChainBridge...
Enter password for key ./keys/<RELAYER_ACCOUNT_ADDRESS>.key:
> [PASSWORD_TO_DECRYPT_KEY]
INFO[11-19|07:15:25] Connecting to ethereum chain...          chain=mumbai url=<JSON_RPC_URL>
Enter password for key ./keys/<RELAYER_ACCOUNT_ADDRESS>.key:
> [PASSWORD_TO_DECRYPT_KEY]
INFO[11-19|07:15:31] Connecting to ethereum chain...          chain=polygon-edge url=<JSON_RPC_URL>
```

एक रिलेयर शुरू होने के बाद, यह हर चेन पर नए ब्लॉक देखना शुरू कर देगा.

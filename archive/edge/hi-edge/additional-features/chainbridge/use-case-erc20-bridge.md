---
id: use-case-erc20-bridge
title: ERC20 ब्रिज - केस का इस्तेमाल करें
description: ERC20 कॉन्ट्रैक्ट ब्रिज के लिए उदाहरण
keywords:
  - docs
  - polygon
  - edge
  - Bridge
  - ERC20
---

इस सेक्शन का उद्देश्य आपको प्रैक्टिकल इस्तेमाल के मामले में, ERC20 ब्रिज का एक सेटअप फ़्लो देना है.

इस गाइड में, आप मुंबई पॉलीगॉन PoS टेस्टनेट और पॉलीगॉन एज स्थानीय चेन का इस्तेमाल करेंगे. कृपया सुनिश्चित करें कि आपके पास मुंबई के लिए JSON-RPC एंडपॉइंट हो और आपने स्थानीय वातावरण में पॉलीगॉन एज को सेट अप किया हो. अधिक विवरण के लिए [स्थानीय सेटअप](/docs/edge/get-started/set-up-ibft-locally) या [क्लाउड सेटअप](/docs/edge/get-started/set-up-ibft-on-the-cloud) का संदर्भ लें.

## परिदृश्य {#scenario}

यह परिदृश्य, ERC20 टोकन के लिए एक ब्रिज को सेटअप करता है जिसे पहले से ही सार्वजनिक चेन (पॉलीगॉन PoS) में पहले से ही डिप्लॉय किया गया है, ताकि एक आम मामले में यूज़र्स एक निजी चेन (पॉलीगॉन एज) में कम लागत में ट्रांसफ़र करना सक्षम कर सकें. ऐसे मामले में, टोकन की कुल आपूर्ति को सार्वजनिक चेन में निर्धारित किया जाता है और सिर्फ़ टोकन की रकम की उस मात्रा को जिसे सार्वजनिक चेन से निजी चेन में ट्रांसफ़र किया जा रहा है, उसे ही निजी चेन में मौजूद होना चाहिए. इसी वजह से, आपको सार्वजनिक चेन में लॉक/रिलीज़ मोड को और निजी चेन में बर्न/मिंट मोड को इस्तेमाल करना होगा.

जब टोकनों को सार्वजनिक चेन से निजी चेन में भेजा जाता है, तो टोकन सार्वजनिक चेन के ERC20 हैंडलर कॉन्ट्रैक्ट में लॉक हो जाएँगे और उतनी ही रकम के टोकन निजी चेन में मिंट हो जाएँगे. दूसरी ओर, निजी चेन से सार्वजनिक चेन में ट्रांसफ़र करने पर, निजी चेन के टोकन बर्न हो जाएँगे और उतनी ही रकम के टोकन ERC20 हैंडलर के कॉन्ट्रैक्ट से सार्वजनिक चेन में रिलीज़ कर दिए जाएँगे.

## कॉन्ट्रैक्ट {#contracts}

चेनब्रिज द्वारा तैयार कॉन्ट्रैक्ट के बजाय एक साधारण ERC20 कॉन्ट्रैक्ट के साथ समझाएँ. बर्न/मिंट मोड के लिए, ERC20 कॉन्ट्रैक्ट में अवश्य ही `mint` और `burnFrom` तरीकों के अलावा और भी तरीके होने चाहिए:

```sol
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract SampleToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(MINTER_ROLE, _msgSender());
        _setupRole(BURNER_ROLE, _msgSender());
    }

    function mint(address recipient, uint256 amount)
        external
        onlyRole(MINTER_ROLE)
    {
        _mint(recipient, amount);
    }

    function burnFrom(address owner, uint256 amount)
        external
        onlyRole(BURNER_ROLE)
    {
        _burn(owner, amount);
    }
}
```

सभी कोड और स्क्रिप्ट Github रेपो [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example) में हैं.

## स्टेप1: ब्रिज और ERC20 हैंडलर कॉन्ट्रैक्ट को डिप्लॉय करें {#step1-deploy-bridge-and-erc20-handler-contracts}

सबसे पहले, आप दोनों चेन में `cb-sol-cli` का इस्तेमाल करते हुए ब्रिज और ERC20हैंडलर कॉन्ट्रैक्ट को डिप्लॉय करेंगे.

```bash
# Deploy Bridge and ERC20 contracts in Polygon PoS chain
$ cb-sol-cli deploy --bridge --erc20Handler --chainId 99 \
  --url https://rpc-mumbai.matic.today \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```

```bash
# Deploy Bridge and ERC20 contracts in Polygon Edge chain
$ cb-sol-cli deploy --bridge --erc20Handler --chainId 100 \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```

आपको ब्रिज और ERC20हैंडलर कॉन्ट्रैक्ट का पता इस प्रकार मिलेंगे:

```bash
Deploying contracts...
✓ Bridge contract deployed
✓ ERC20Handler contract deployed

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
Erc721 Handler:     Not Deployed
----------------------------------------------------------------
Generic Handler:    Not Deployed
----------------------------------------------------------------
Erc20:              Not Deployed
----------------------------------------------------------------
Erc721:             Not Deployed
----------------------------------------------------------------
Centrifuge Asset:   Not Deployed
----------------------------------------------------------------
WETC:               Not Deployed
================================================================
```

## स्टेप2: अपने ERC20 कॉन्ट्रैक्ट को डिप्लॉय करें {#step2-deploy-your-erc20-contract}

आप अपने ERC20 कॉन्ट्रैक्ट को डिप्लॉय करेंगे. यह उदाहरण आपको हार्डहैट प्रोजेक्ट [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example) के साथ गाइड करता है.

```bash
$ git clone https://github.com/Trapesys/chainbridge-example.git
$ cd chainbridge-example
$ npm i
```

कृपया `.env` फ़ाइल बनाएँ और नीचे दी गई वैल्यू को सेट करें.

```.env
PRIVATE_KEYS=0x...
MUMBAI_JSONRPC_URL=https://rpc-mumbai.matic.today
EDGE_JSONRPC_URL=http://localhost:10002
```

इसके बाद, आप दोनों चेन में ERC20 कॉन्ट्रैक्ट को डिप्लॉय करेंगे.

```bash
$ npx hardhat deploy --contract erc20 --name <ERC20_TOKEN_NAME> --symbol <ERC20_TOKEN_SYMBOL> --network mumbai
```

```bash
$ npx hardhat deploy --contract erc20 --name <ERC20_TOKEN_NAME> --symbol <ERC20_TOKEN_SYMBOL> --network edge
```

डिप्लॉयमेंट सफल होने के बाद, आपको इस प्रकार कॉन्ट्रैक्ट का पता प्राप्त होगा:

```bash
ERC20 contract has been deployed
Address: <ERC20_CONTRACT_ADDRESS>
Name: <ERC20_TOKEN_NAME>
Symbol: <ERC20_TOKEN_SYMBOL>
```

## स्टेप3: ब्रिज में रिसोर्स आईडी रजिस्टर करें {#step3-register-resource-id-in-bridge}

सबसे पहले, आप एक रिसोर्स आईडी रजिस्टर करेंगे, जो रिसोर्स को एक क्रॉस-चेन वातावरण में जोड़ती है. आपको दोनों चेन में एक ही रिसोर्स आईडी को सेट करना होगा.

```bash
$ cb-sol-cli bridge register-resource \
  --url https://rpc-mumbai.matic.today \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  --resourceId "0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[ERC20_CONTRACT_ADDRESS]"
```

```bash
$ cb-sol-cli bridge register-resource \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --resourceId "0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[ERC20_CONTRACT_ADDRESS]"
```

## स्टेप4: एज के ERC20 ब्रिज में मिंट/बर्न मोड सेट करें {#step4-set-mint-burn-mode-in-erc20-bridge-of-the-edge}

ब्रिज, पॉलीगॉन एज में बर्न/मिंट मोड के रूप में काम करने की उम्मीद करता है. आप `cb-sol-cli` का इस्तेमाल करके बर्न/मिंट मोड सेट करेंगे .

```bash
$ cb-sol-cli bridge set-burn \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[ERC20_CONTRACT_ADDRESS]"
```

और आपको ERC20 हैंडलर कॉन्ट्रैक्ट को मिंट करने वाले और बर्न करने वाले की भूमिका प्रदान करने की ज़रूरत होगी.

```bash
$ npx hardhat grant --role mint --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --network edge
$ npx hardhat grant --role burn --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --network edge
```

## स्टेप5: टोकन मिंट करें {#step5-mint-token}

आप मुंबई चेन में ERC20 के नए टोकन मिंट करेंगे.

```bash
$ npx hardhat mint --type erc20 --contract [ERC20_CONTRACT_ADDRESS] --address [ACCOUNT_ADDRESS] --amount 100000000000000000000 --network mumbai # 100 Token
```

ट्रांज़ैक्शन सफल होने के बाद, अकाउंट में मिंट किए गए टोकन होंगे.

## स्टेप6: ERC20 ट्रांसफ़र शुरू करें {#step6-start-erc20-transfer}

यह स्टेप शुरू करने से पहले, कृपया सुनिश्चित करें कि आपने एक रिलेयर को शुरू किया है. अधिक विवरण के लिए कृपया [सेटअप](/docs/edge/additional-features/chainbridge/setup) देखें.

मुंबई से एज में टोकन ट्रांसफ़र के दौरान, मुंबई में ERC20 हैंडलर कॉन्ट्रैक्ट आपके अकाउंट से टोकन निकाल लेता है. ट्रांसफ़र करने से पहले आप अनुमोदन के लिए कॉल करेंगे.

```bash
$ npx hardhat approve --type erc20 --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --amount 10000000000000000000 --network mumbai # 10 Token
```

अंत में, आप `cb-sol-cli` को इस्तेमाल करके मुंबई से एज में टोकन ट्रांसफ़र करना शुरू करेंगे .

```bash
# Start transfer from Mumbai to Polygon Edge chain
$ cb-sol-cli erc20 deposit \
  --url https://rpc-mumbai.matic.today \
  --privateKey [PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  --amount 10 \
  # ChainID of Polygon Edge chain
  --dest 100 \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --recipient "[RECIPIENT_ADDRESS_IN_POLYGON_EDGE_CHAIN]" \
  --resourceId "0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00"
```

डिपॉज़िट ट्रांज़ैक्शन के सफल होने के बाद, रिलेयर को प्रस्ताव के लिए इवेंट और वोट मिलेगा. वोट्स की आवश्यक संख्या जमा हो जाने के बाद, यह पॉलीगॉन एज चेन में प्राप्तकर्ता अकाउंट में टोकन्स भेजने के लिए ट्रांज़ैक्शन को एग्जीक्यूट करता है.

```bash
INFO[11-19|08:15:58] Handling fungible deposit event          chain=mumbai dest=100 nonce=1
INFO[11-19|08:15:59] Attempting to resolve message            chain=polygon-edge type=FungibleTransfer src=99 dst=100 nonce=1 rId=000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00
INFO[11-19|08:15:59] Creating erc20 proposal                  chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Watching for finalization event          chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Submitted proposal vote                  chain=polygon-edge tx=0x67a97849951cdf0480e24a95f59adc65ae75da23d00b4ab22e917a2ad2fa940d src=99 depositNonce=1 gasPrice=1
INFO[11-19|08:16:24] Submitted proposal execution             chain=polygon-edge tx=0x63615a775a55fcb00676a40e3c9025eeefec94d0c32ee14548891b71f8d1aad1 src=99 dst=100 nonce=1 gasPrice=5
```

एक बार ट्रांज़ैक्शन का एग्जीक्यूशन सफल होने के बाद, आपको पॉलीगॉन एज चेन में टोकन मिल जाएँगे.

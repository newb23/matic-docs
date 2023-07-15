---
id: use-case-erc721-bridge
title: केस का इस्तेमाल करें - erc721 ब्रिज
description: erc721 कॉन्ट्रैक्ट ब्रिज करने के लिए उदाहरण
keywords:
  - docs
  - polygon
  - edge
  - Bridge
  - ERC721
---

इस सेक्शन का उद्देश्य आपको प्रैक्टिकल यूज़ केस के लिए, erc721 ब्रिज का एक सेटअप फ़्लो देना है.

इस गाइड में, आप मुंबई पॉलीगॉन PoS टेस्टनेट और पॉलीगॉन एज स्थानीय चेन का इस्तेमाल करेंगे. कृपया सुनिश्चित करें कि आपके पास मुंबई के लिए JSON-RPC एंडपॉइंट हो और आपने स्थानीय वातावरण में पॉलीगॉन एज को सेट अप किया हो. अधिक विवरण के लिए [स्थानीय सेटअप](/docs/edge/get-started/set-up-ibft-locally) या [क्लाउड सेटअप](/docs/edge/get-started/set-up-ibft-on-the-cloud) का संदर्भ लें.

## परिदृश्य {#scenario}

यह परिदृश्य ERC721 NFT के लिए एक ब्रिज सेटअप करने के लिए है जिसे पहले से ही पब्लिक चेन (पॉलीगॉन PoS) में डिप्लॉय किया गया है ताकि एक नियमित तौर पर यूज़र के लिए एक निजी चेन (Polygon Edge) में कम लागत वाले ट्रांसफ़र किए जा सकें. ऐसे मामले में, पब्लिक चेन में ओरिजनल मेटाडेटा को डिफ़ाइन किया गया है और सिर्फ़ पब्लिक चेन से ट्रांसफ़र किए गए NFT ही निजी चेन में हो सकते हैं. इसीलिए, आपको पब्लिक चेन में लॉक/रिलीज़ मोड का इस्तेमाल करना होगा और निजी चेन में बर्न/मिंट मोड.

NFT को पब्लिक चेन से निजी चेन में भेजने के बाद, NFT पब्लिक चेन में erc721 हैंडलर कॉन्ट्रैक्ट में लॉक हो जाएगी और वही NFT निजी चेन में भी मिंट हो जाएगी. दूसरी ओर, पब्लिक चेन से निजी चेन में ट्रांसफ़र करने पर, NFT को निजी चेन में बर्न जाएगा और वही NFT पब्लिक चेन में erc721 हैंडलर कॉन्ट्रैक्ट से रिलीज़ की जाएगी.

## कॉन्ट्रैक्ट {#contracts}

चेनब्रिज द्वारा तैयार कॉन्ट्रैक्ट के बजाय एक साधारण erc721 कॉन्ट्रैक्ट के साथ समझाएँ. बर्न/मिंट मोड के लिए, ERC721 में डिफ़ाइन तरीकों के अलावा, ERC721 कॉन्ट्रैक्ट `mint` और `burn` तरीकों में होना चाहिए:

```sol
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract SampleNFT is ERC721, ERC721Burnable, ERC721URIStorage, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    string public baseURI;

    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI
    ) ERC721(name, symbol) {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(MINTER_ROLE, _msgSender());
        _setupRole(BURNER_ROLE, _msgSender());

        _setBaseURI(baseURI);
    }

    function mint(
        address recipient,
        uint256 tokenID,
        string memory data
    ) public onlyRole(MINTER_ROLE) {
        _mint(recipient, tokenID);
        _setTokenURI(tokenID, data);
    }

    function burn(uint256 tokenID)
        public
        override(ERC721Burnable)
        onlyRole(BURNER_ROLE)
    {
        _burn(tokenID);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _burn(uint256 tokenId)
        internal
        virtual
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function _setBaseURI(string memory baseURI_) internal {
        baseURI = baseURI_;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }
}
```

सभी कोड और स्क्रिप्ट Github रेपो [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example) में हैं.

## स्टेप1: ब्रिज डिप्लॉय करें और erc721 हैंडलर कॉन्ट्रैक्ट {#step1-deploy-bridge-and-erc721-handler-contracts}

सबसे पहले, आप दोनों चेन में `cb-sol-cli` का इस्तेमाल करते हुए ब्रिज और erc721 हैंडलर कॉन्ट्रैक्ट को डिप्लॉय करेंगे.

```bash
# Deploy Bridge and ERC721 contracts in Polygon PoS chain
$ cb-sol-cli deploy --bridge --erc721Handler --chainId 99 \
  --url https://rpc-mumbai.matic.today \
  --gasPrice [GAS_PRICE] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```

```bash
# Deploy Bridge and ERC721 contracts in Polygon Edge chain
$ cb-sol-cli deploy --bridge --erc721Handler --chainId 100 \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```

आपको ब्रिज और erc721हैंडलर कॉन्ट्रैक्ट पता इस प्रकार से मिलेंगे:

```bash
Deploying contracts...
✓ Bridge contract deployed
✓ ERC721Handler contract deployed

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
Erc20 Handler:      Not Deployed
----------------------------------------------------------------
Erc721 Handler:     <ERC721_HANDLER_CONTRACT_ADDRESS>
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

## स्टेप2: अपने erc721 कॉन्ट्रैक्ट को डिप्लॉय करें {#step2-deploy-your-erc721-contract}

आप अपना erc721 कॉन्ट्रैक्ट डिप्लॉय करेंगे. यह उदाहरण आपको हार्डहैट प्रोजेक्ट [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example). के साथ गाइड करता है.

```bash
$ git clone https://github.com/Trapesys/chainbridge-example.git
$ cd chainbridge-example
$ npm i
```

`.env` फ़ाइल बनाएँ और नीचे दी गई वैल्यू सेट करें.

```.env
PRIVATE_KEYS=0x...
MUMBAI_JSONRPC_URL=https://rpc-mumbai.matic.today
EDGE_JSONRPC_URL=http://localhost:10002
```

इसके बाद, आप दोनों चेन में erc721 कॉन्ट्रैक्ट डिप्लॉय करेंगे.

```bash
$ npx hardhat deploy --contract erc721 --name <ERC721_TOKEN_NAME> --symbol <ERC721_TOKEN_SYMBOL> --uri <BASE_URI> --network mumbai
```

```bash
$ npx hardhat deploy --contract erc721 --name <ERC721_TOKEN_NAME> --symbol <ERC721_TOKEN_SYMBOL> --uri <BASE_URI> --network edge
```

डिप्लॉय सफल होने के बाद, आपको इस प्रकार कॉन्ट्रैक्ट पता प्राप्त होगा:

```bash
ERC721 contract has been deployed
Address: <ERC721_CONTRACT_ADDRESS>
Name: <ERC721_TOKEN_NAME>
Symbol: <ERC721_TOKEN_SYMBOL>
Base URI: <ERC721_BASE_URI>
```

## स्टेप3: ब्रिज में रिसोर्स ID रजिस्टर करें {#step3-register-resource-id-in-bridge}

सबसे पहले, आप एक रिसोर्स ID रजिस्टर करेंगे जो रिसोर्स को एक क्रॉस-चेन वातावरण में जोड़ती है.

```bash
$ cb-sol-cli bridge register-resource \
  --url https://rpc-mumbai.matic.today \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  # Set Resource ID for ERC721
  --resourceId "0x000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC721_HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[ERC721_CONTRACT_ADDRESS]"
```

```bash
$ cb-sol-cli bridge register-resource \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  # Set Resource ID for ERC721
  --resourceId "0x000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC721_HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[ERC721_CONTRACT_ADDRESS]"
```

## स्टेप4: एज के erc721 ब्रिज में मिंट/बर्न मोड सेट करें {#step4-set-mint-burn-mode-in-erc721-bridge-of-the-edge}

ब्रिज एज में बर्न/मिंट मोड के रूप में काम करने की उम्मीद करता है. आप बर्न/मिंट मोड सेट करेंगे.

```bash
$ cb-sol-cli bridge set-burn \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC721_HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[ERC721_CONTRACT_ADDRESS]"
```

और आपको erc721 हैंडलर कॉन्ट्रैक्ट में एक मिंटर और बर्नर की भूमिका प्रदान करने की ज़रूरत है.

```bash
$ npx hardhat grant --role mint --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --network edge
$ npx hardhat grant --role burn --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --network edge
```

## स्टेप5: NFT मिंट करें {#step5-mint-nft}

आप मुंबई चेन में नए erc721 NFT मिंट करेंगे.

```bash
$ npx hardhat mint --type erc721 --contract [ERC721_CONTRACT_ADDRESS] --address [ACCOUNT_ADDRESS] --id 0x50 --data hello.json --network mumbai
```

ट्रांज़ैक्शन सफल होने के बाद, अकाउंट में मिंट किए गए NFT होंगे.

## स्टेप6: ERC721 ट्रांसफ़र शुरू करें {#step6-start-erc721-transfer}

यह स्टेप शुरू करने से पहले, कृपया अपना रिलेयर शुरू करें. अधिक विवरण के लिए कृपया [सेटअप](/docs/edge/additional-features/chainbridge/setup) देखें.

मुंबई से एज में NFT ट्रांसफ़र के दौरान, मुंबई में ERC721 हैंडलर कॉन्ट्रैक्ट आपके अकाउंट से NFT को निकाल लेता है. ट्रांसफ़र करने से पहले आप अनुमोदन के लिए कॉल करेंगे.

```bash
$ npx hardhat approve --type erc721 --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --id 0x50 --network mumbai
```

अंत में, आप मुंबई से एज में NFT ट्रांसफ़र शुरू करेंगे.

```bash
# Start transfer from Mumbai to Polygon Edge chain
$ cb-sol-cli erc721 deposit \
  --url https://rpc-mumbai.matic.today \
  --privateKey [PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  --id 0x50 \
  # ChainID for Polygon Edge chain
  --dest 100 \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --recipient "[RECIPIENT_ADDRESS_IN_POLYGON_EDGE_CHAIN]" \
  --resourceId "0x000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501"
```

डिपॉज़िट ट्रांज़ैक्शन सफल होने के बाद, रिलेयर को इवेंट मिलेगा और प्रस्ताव के लिए वोट करेगा.
  आवश्यक वोट जमा किए जाने के बाद, यह पॉलीगॉन एज चेन में प्राप्तकर्ता के अकाउंट में NFT भेजने के लिए ट्रांज़ैक्शन को एग्जीक्यूट करता है.

```bash
INFO[11-19|09:07:50] Handling nonfungible deposit event       chain=mumbai
INFO[11-19|09:07:50] Attempting to resolve message            chain=polygon-edge type=NonFungibleTransfer src=99 dst=100 nonce=2 rId=000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501
INFO[11-19|09:07:50] Creating erc721 proposal                 chain=polygon-edge src=99 nonce=2
INFO[11-19|09:07:50] Watching for finalization event          chain=polygon-edge src=99 nonce=2
INFO[11-19|09:07:50] Submitted proposal vote                  chain=polygon-edge tx=0x58a22d84a08269ad2e8d52d8dc038621f1a21109d11c7b6e0d32d5bf21ea8505 src=99 depositNonce=2 gasPrice=1
INFO[11-19|09:08:15] Submitted proposal execution             chain=polygon-edge tx=0x57419844881a07531e31667c609421662d94d21d0709e64fb728138309267e68 src=99 dst=100 nonce=2 gasPrice=3
```

एक बार ट्रांज़ैक्शन का एग्जीक्यूशन सफल होने के बाद, आपको पॉलीगॉन एज चेन में NFT मिलेगा.

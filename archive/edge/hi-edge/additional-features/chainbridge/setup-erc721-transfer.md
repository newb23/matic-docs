---
id: setup-erc721-transfer
title: erc721 NFT ट्रांसफ़र
description: चेनब्रिज में erc721 ट्रांफर कैसे सेटअप करें
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

यह सेक्शन आपको ERC721 ब्रिज स्थापित करने और ब्लॉकचेन नेटवर्क के बीच NFTs भेजने के माध्यम से मार्गदर्शन करता है.

## स्टेप 1: संसाधन आईडी रजिस्टर करें {#step-1-register-resource-id}

आपको सबसे पहले ब्रिज कॉन्ट्रैक्ट में erc721 टोकन के लिए आईडी को दोनों चेन पर रजिस्टर करने होंगे.

```bash
# For Polygon PoS chain
$ cb-sol-cli bridge register-resource \
  --url https://rpc-mumbai.matic.today \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  # Set ResourceID for ERC721 Token
  --resourceId "0x000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC721_HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[ERC721_CONTRACT_ADDRESS]"

# For Polygon Edge chain
$ cb-sol-cli bridge register-resource \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  # Set ResourceID for ERC721 Token
  --resourceId "0x000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC721_HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[ERC721_CONTRACT_ADDRESS]"
```

## (वैकल्पिक): कान्ट्रैक्टस को मिन्टेबल/बर्नेबल बनाएं {#optional-make-contracts-mintable-burnable}

टोकन को मिन्टेबल/बर्नेबल बनाने के लिए, आपको निम्नलिखित कमांड्स को कॉल करने की आवश्यकता होगी:

```bash
# Let ERC721 contract burn on source chain or mint on destination chain
$ cb-sol-cli bridge set-burn \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC721_HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[ERC721_CONTRACT_ADDRESS]"

# Grant minter role to ERC721 Handler contract (Only if you want to mint)
$ cb-sol-cli erc721 add-minter \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --erc721Address "[ERC721_CONTRACT_ADDRESS]" \
  --minter "[ERC721_HANDLER_CONTRACT_ADDRESS]"
```

## स्टेप 2: ट्रांसफ़र NFT {#step-2-transfer-nft}

यदि आपको इसकी आवश्यकता है तो सबसे पहले, आप एक NFT का मिंट करेंगे.

```bash
# Mint NFT 0x50
$ cb-sol-cli erc721 mint \
  --url https://rpc-mumbai.matic.today \
  --privateKey [MINTER_ROLE_ACCOUNT] \
  --gasPrice [GAS_PRICE] \
  --erc721Address "[ERC721_CONTRACT_ADDRESS]" \
  --id 0x50
```

TNFT मालिक को जाँज ने केलिए, आप`cb-sol-cli erc721 owner`इस्तेमाल कर सकते हैं.

```bash
# Check the current owner of NFT
$ cb-sol-cli erc721 owner \
  --url https://rpc-mumbai.matic.today \
  --erc721Address "[ERC721_CONTRACT_ADDRESS]" \
  --id 0x50
```

फिर, आप ERC721 हैंडलर द्वारा NFT के ट्रांसफ़र को स्वीकृति देंगे

```bash
# Approve transfer of the NFT 0x50 by ERC721 Handler
$ cb-sol-cli erc721 approve \
  --url https://rpc-mumbai.matic.today \
  --privateKey [PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  --erc721Address "[ERC721_CONTRACT_ADDRESS]" \
  --recipient "[ERC721_HANDLER_CONTRACT_ADDRESS]" \
  --id 0x50
```

अंत में, आप ट्रांसफ़र शुरू कर देंगे

```bash
# Start transfer from Polygon PoS to Polygon Edge chain
$ cb-sol-cli erc721 deposit \
  --url https://rpc-mumbai.matic.today \
  --privateKey [PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --resourceId "0x000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501" \
  --id 0x50 \
  # ChainID of Polygon Edge chain
  --dest 100 \
  --recipient "[RECIPIENT_ADDRESS_IN_POLYGON_EDGE_CHAIN]"
```

रिलेयर इवेंट प्राप्त करेगा और प्रस्ताव के लिए वोट करेगा. वोटों की आवश्यक संख्या जमा करने के बाद, पॉलीगॉन एज श्रृंखला में प्राप्तकर्ता अकाउंट में NFT भेजने के लिए यह ट्रांज़ैक्शन निष्पादित करता है.

```bash
INFO[11-19|09:07:50] Handling nonfungible deposit event       chain=mumbai
INFO[11-19|09:07:50] Attempting to resolve message            chain=polygon-edge type=NonFungibleTransfer src=99 dst=100 nonce=2 rId=000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501
INFO[11-19|09:07:50] Creating erc721 proposal                 chain=polygon-edge src=99 nonce=2
INFO[11-19|09:07:50] Watching for finalization event          chain=polygon-edge src=99 nonce=2
INFO[11-19|09:07:50] Submitted proposal vote                  chain=polygon-edge tx=0x58a22d84a08269ad2e8d52d8dc038621f1a21109d11c7b6e0d32d5bf21ea8505 src=99 depositNonce=2 gasPrice=1
INFO[11-19|09:08:15] Submitted proposal execution             chain=polygon-edge tx=0x57419844881a07531e31667c609421662d94d21d0709e64fb728138309267e68 src=99 dst=100 nonce=2 gasPrice=3
```

एग्जीक्यूशन पूरा होने के बाद आप पॉलीगॉन एज नेटवर्क पर NFT के मालिक की जांच कर सकते हैं.

```bash
# Check the owner of NFT 0x50 in Polygon Edge chain
$ cb-sol-cli erc721 owner \
  --url http://localhost:10002 \
  --erc721Address "[ERC721_CONTRACT_ADDRESS]" \
  --id 0x50
```

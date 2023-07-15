---
id: setup-erc20-transfer
title: ERC20 टोकन ट्रांसफ़र
description: चेनब्रिज में ERC-20 ट्रांसफ़र को सेटअप कैसे करें
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

अब तक, हमने पॉलीगॉन पॉस पॉलीगॉन एज चेन के पॉलीगॉन पॉस और असेट्स/डाटा एक्सचेंज करने के लिए ब्रिज बनाया है. यह सेक्शन आपको ERC20 ब्रिज स्थापित करने और विभिन्न ब्लॉकचेन के बीच टोकन भेजने के लिए गाइड करेगा.

## स्टेप 1: संसाधन आईडी रजिस्टर करें {#step-1-register-resource-id}

सबसे पहले, आप एक संसाधन आईडी पंजीकृत करेंगे जो संसाधनों को एक क्रॉस-चेन वातावरण में संबद्ध करता है. एक संसाधन आईडी एक 32-बाइट मान है जो उस संसाधन के लिए अद्वितीय होना चाहिए जिसे हम इन ब्लॉकचेन के बीच स्थानांतरित कर रहे हैं. संसाधन आईडी मनमाना हैं, लेकिन उनके पास अंतिम बाइट में होम चेन की चेन आईडी हो सकती है, एक कन्वेंशन के रूप में (होम चेन उस नेटवर्क का जिक्र है जिस पर ये संसाधन उत्पन्न हुए हैं).

संसाधन आईडी को रजिस्टर करने के लिए, आप `cb-sol-cli bridge register-resource`कमांड का इस्तेमाल कर सकते हैं. आपको `admin`अकाउंट की निजी की देने की जरूरत होगी.

```bash
# For Polygon PoS chain
$ cb-sol-cli bridge register-resource \
  --url https://rpc-mumbai.matic.today \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  # Set Resource ID for ERC20
  --resourceId "0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[ERC20_CONTRACT_ADDRESS]"

# For Polygon Edge chain
$ cb-sol-cli bridge register-resource \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  # Set Resource ID for ERC20
  --resourceId "0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[ERC20_CONTRACT_ADDRESS]"
```

## (वैकल्पिक) कान्ट्रैक्टस को मिन्टेबल/बर्नेबल बनाएं {#optional-make-contracts-mintable-burnable}


```bash
# Let ERC20 contract burn on source chain and mint on destination chain
$ cb-sol-cli bridge set-burn \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[ERC20_CONTRACT_ADDRESS]"

# Grant minter role to ERC20 Handler contract
$ cb-sol-cli erc20 add-minter \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --minter "[ERC20_HANDLER_CONTRACT_ADDRESS]"
```

## स्टेप 2: ट्रांसफ़र erc20 टोकन {#step-2-transfer-erc20-token}

हम पॉलीगॉन पॉस चेन से पॉलीगॉन एज चेन को ERC20 टोकन भेजेंगे.

सबसे पहले, आपको  मिंटिंग करनेसे टोकेन्स मिलेंगे. `minter`भूमिका वाला अकाउंट नए टोकन को मिंट कर सकता है. ERC20 अनुबंध को लागू करने वाले अकाउंट में डिफ़ॉल्ट रूप से `minter`भूमिका होती है. `minter`भूमिका के सदस्यों के रूप में अन्य खातों को निर्दिष्ट करने के लिए, आपको `cb-sol-cli erc20 add-minter`कमांड चलाने की आवश्यकता है.

```bash
# Mint ERC20 tokens
$ cb-sol-cli erc20 mint \
  --url https://rpc-mumbai.matic.today \
  --privateKey [MINTER_ACCOUNT_PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --amount 1000
```

करंट बैलेंस चेक करने के लिए आप `cb-sol-cli erc20 balance`कमांड का इस्तेमाल कर सकते हैं.

```bash
# Check ERC20 token balance
$ cb-sol-cli erc20 balance \
  --url https://rpc-mumbai.matic.today \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --address "[ACCOUNT_ADDRESS]"

[erc20/balance] Account <ACCOUNT_ADDRESS> has a balance of 1000.0
```

इसके बाद, आपको ERC20 हैंडलर द्वारा अकाउंट से ERC20 टोकन ट्रांसफ़र को स्वीकृत करने की आवश्यकता है

```bash
# Approve transfer from the account by ERC20 Handler
$ cb-sol-cli erc20 approve \
  --url https://rpc-mumbai.matic.today \
  --privateKey [USER_ACCOUNT_ADDRESS] \
  --gasPrice [GAS_PRICE] \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --recipient "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --amount 500
```

पॉलीगॉन एज चेन में टोकन ट्रांसफर करने के लिए, आप `deposit`को कॉल करेंगे.

```bash
# Start transfer from Polygon PoS to Polygon Edge chain
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

डिपॉजिट ट्रांजैक्शन सफल होने के बाद, रिलेयर को इवेंट मिलेगा और प्रस्ताव के लिए वोट करेगा. वोटों की आवश्यक संख्या जमा करने के बाद, पॉलीगॉन एज चेन में प्राप्तकर्ता अकाउंट में टोकन्स भेजने के लिए यह ट्रांज़ैक्शन निष्पादित करता है.

```bash
INFO[11-19|08:15:58] Handling fungible deposit event          chain=mumbai dest=100 nonce=1
INFO[11-19|08:15:59] Attempting to resolve message            chain=polygon-edge type=FungibleTransfer src=99 dst=100 nonce=1 rId=000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00
INFO[11-19|08:15:59] Creating erc20 proposal                  chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Watching for finalization event          chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Submitted proposal vote                  chain=polygon-edge tx=0x67a97849951cdf0480e24a95f59adc65ae75da23d00b4ab22e917a2ad2fa940d src=99 depositNonce=1 gasPrice=1
INFO[11-19|08:16:24] Submitted proposal execution             chain=polygon-edge tx=0x63615a775a55fcb00676a40e3c9025eeefec94d0c32ee14548891b71f8d1aad1 src=99 dst=100 nonce=1 gasPrice=5
```

एक बार एग्जीक्यूशन ट्रांज़ैक्शन सफल हो जाने के बाद, आपको पॉलीगॉन एज चेन में टोकन प्राप्त होंगे.

```bash
# Check the ERC20 balance in Polygon Edge chain
$ cb-sol-cli erc20 balance \
  --url https://localhost:10002 \
  --privateKey [PRIVATE_KEY] \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --address "[ACCOUNT_ADDRESS]"

[erc20/balance] Account <RECIPIENT_ACCOUNT_ADDRESS> has a balance of 10.0
```

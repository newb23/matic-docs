---
id: setup-erc20-transfer
title: ERC20 টোকেন ট্রান্সফার
description: ChainBridge-এ ERC-20 ট্রান্সফার কিভাবে সেটআপ করবেন
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

এপর্যন্ত, আমরা Polygon PoS এবং Polygon Edge চেইনের মধ্যে অ্যাসেট/ডেটা বিনিময়ের জন্য একটি ব্রিজ স্থাপন করেছি। এই বিভাগটি আপনাকে একটি ERC20 ব্রিজ সেটআপ করতে এবং বিভিন্ন ব্লকচেইনের মধ্যে টোকেন পাঠাতে নির্দেশনা প্রদান করবে।

## স্টেপ 1: রিসোর্স আইডি নিবন্ধন করুন {#step-1-register-resource-id}

প্রথমত, আপনি একটি রিসোর্স আইডি নিবন্ধন করবেন যা একটি ক্রস-চেইন এনভায়রনমেন্টে সংস্থানগুলিকে সংযুক্ত করে। একটি রিসোর্স আইডি হল একটি 32-বাইটের ভ্যালু যা অবশ্যই এই ব্লকচেইনের মধ্যে স্থানান্তর করা অ্যাসেটের জন্য অনন্য হতে হবে। রিসোর্স আইডিগুলোর নির্দিষ্ট কোনো ক্রম নেই, তবে তাদের শেষ বাইটে প্রথা হিসেবে হোম চেইনের চেইন আইডি থাকতে পারে (হোম চেইন বলতে যে নেটওয়ার্ক থেকে এই রিসোর্সগুলি পাওয়া হয়েছে তাকে বুঝানো হয়েছে)।

রিসোর্স আইডি নিবন্ধন করতে, আপনি `cb-sol-cli bridge register-resource` কমান্ডটি ব্যবহার করতে পারেন। আপনাকে `admin` অ্যাকাউন্টের ব্যক্তিগত কী দিতে হবে।

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

## (ঐচ্ছিক) চুক্তিগুলি মিন্টযোগ্য/বার্নযোগ্য করুন {#optional-make-contracts-mintable-burnable}


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

## স্টেপ 2: ERC20 টোকেন ট্রান্সফার {#step-2-transfer-erc20-token}

আমরা Polygon PoS চেইন থেকে Polygon Edge চেইনে ERC20 টোকেন পাঠাব।

প্রথমত, মিন্ট করার মাধ্যমে আপনি টোকেন পাবেন। একটি`minter` রোল সহ অ্যাকাউন্ট নতুন টোকেন মিন্ট করতে পারে। ERC20 চুক্তি ডিপ্লয় করা অ্যাকাউন্টে ডিফল্টরূপে `minter` রোলটি থাকে। অন্যান্য অ্যাকাউন্টগুলোকে `minter` রোলের মেম্বার হিসেবে উল্লেখ করতে, আপনাকে `cb-sol-cli erc20 add-minter` কমান্ডটি রান করতে হবে।

```bash
# Mint ERC20 tokens
$ cb-sol-cli erc20 mint \
  --url https://rpc-mumbai.matic.today \
  --privateKey [MINTER_ACCOUNT_PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --amount 1000
```

বর্তমান ব্যালেন্স চেক করতে, আপনি `cb-sol-cli erc20 balance`কমান্ডটি ব্যবহার করতে পারেন।

```bash
# Check ERC20 token balance
$ cb-sol-cli erc20 balance \
  --url https://rpc-mumbai.matic.today \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --address "[ACCOUNT_ADDRESS]"

[erc20/balance] Account <ACCOUNT_ADDRESS> has a balance of 1000.0
```

পরবর্তী, আপনাকে ERC20 হ্যান্ডলার দ্বারা অ্যাকাউন্ট থেকে ERC20 টোকেন ট্রান্সফার অনুমোদন করতে হবে।

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

টোকেনগুলো Polygon Edge চেইনে স্থানান্তর করতে, আপনি `deposit`কল করবেন।

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

ডিপোজিট লেনদেন সফল হওয়ার পরে, রিলেয়ার ইভেন্টটি পাবে এবং প্রস্তাবের পক্ষে ভোট দেবে। প্রয়োজনীয় সংখ্যক ভোট পাওয়ার পরে এটি Polygon Edge চেইনে প্রাপকের অ্যাকাউন্টে টোকেন পাঠানোর জন্য একটি লেনদেন সম্পাদন করে।

```bash
INFO[11-19|08:15:58] Handling fungible deposit event          chain=mumbai dest=100 nonce=1
INFO[11-19|08:15:59] Attempting to resolve message            chain=polygon-edge type=FungibleTransfer src=99 dst=100 nonce=1 rId=000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00
INFO[11-19|08:15:59] Creating erc20 proposal                  chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Watching for finalization event          chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Submitted proposal vote                  chain=polygon-edge tx=0x67a97849951cdf0480e24a95f59adc65ae75da23d00b4ab22e917a2ad2fa940d src=99 depositNonce=1 gasPrice=1
INFO[11-19|08:16:24] Submitted proposal execution             chain=polygon-edge tx=0x63615a775a55fcb00676a40e3c9025eeefec94d0c32ee14548891b71f8d1aad1 src=99 dst=100 nonce=1 gasPrice=5
```

এক্সিকিউশন লেনদেন সফলভাবে সম্পন্ন হবার পর আপনি Polygon Edge চেইনে টোকেন পাবেন।

```bash
# Check the ERC20 balance in Polygon Edge chain
$ cb-sol-cli erc20 balance \
  --url https://localhost:10002 \
  --privateKey [PRIVATE_KEY] \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --address "[ACCOUNT_ADDRESS]"

[erc20/balance] Account <RECIPIENT_ACCOUNT_ADDRESS> has a balance of 10.0
```

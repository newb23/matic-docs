---
id: setup-erc721-transfer
title: ERC721 NFT ট্রান্সফার
description: ChainBridge-এ ERC-20 tranfer কিভাবে সেটআপ করতে হয়
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

এই বিভাগটি আপনাকে একটি ERC721 ব্রিজ সেটআপ করার এবং ব্লকচেইন নেটওয়ার্কগুলির মধ্যে NFT পাঠানোর নির্দেশনা প্রদান করবে।

## স্টেপ 1: রিসোর্স আইডি নিবন্ধন করুন {#step-1-register-resource-id}

আপনাকে প্রথমে উভয় চেইনের ব্রিজ চুক্তিতে ERC721 টোকেনের জন্য রিসোর্স আইডি নিবন্ধন করতে হবে।

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

## (ঐচ্ছিক) চুক্তিগুলি মিন্টেবল/বার্নেবল করুন {#optional-make-contracts-mintable-burnable}

টোকেনগুলো মিন্টেবল/বার্নেবল করে তৈরি করতে, আপনাকে নিম্নোক্ত কমান্ডগুলো কল করতে হবেঃ

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

## ধাপ 2: NFT ট্রান্সফার করুন {#step-2-transfer-nft}

প্রথমত, আপনার প্রয়োজন হলে আপনি একটি NFT মিন্ট করবেন।

```bash
# Mint NFT 0x50
$ cb-sol-cli erc721 mint \
  --url https://rpc-mumbai.matic.today \
  --privateKey [MINTER_ROLE_ACCOUNT] \
  --gasPrice [GAS_PRICE] \
  --erc721Address "[ERC721_CONTRACT_ADDRESS]" \
  --id 0x50
```

NFT-এর মালিক কে জানতে, আপনি `cb-sol-cli erc721 owner` ব্যবহার করতে পারেন

```bash
# Check the current owner of NFT
$ cb-sol-cli erc721 owner \
  --url https://rpc-mumbai.matic.today \
  --erc721Address "[ERC721_CONTRACT_ADDRESS]" \
  --id 0x50
```

তারপর, আপনি ERC721 হ্যান্ডলার দিয়ে NFT-এর ট্রান্সফার অনুমোদন করবেন

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

সর্বশেষে, আপনি ট্রান্সফার শুরু করবেন

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

রিলেয়ার ইভেন্টটি পাবেন এবং প্রস্তাবের জন্য ভোট দিবেন। প্রয়োজনীয় সংখ্যক ভোট পাওয়ার পরে এটি Polygon Edge চেইনে প্রাপকের অ্যাকাউন্টে NFT পাঠানোর জন্য একটি লেনদেন সম্পাদন করে।

```bash
INFO[11-19|09:07:50] Handling nonfungible deposit event       chain=mumbai
INFO[11-19|09:07:50] Attempting to resolve message            chain=polygon-edge type=NonFungibleTransfer src=99 dst=100 nonce=2 rId=000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501
INFO[11-19|09:07:50] Creating erc721 proposal                 chain=polygon-edge src=99 nonce=2
INFO[11-19|09:07:50] Watching for finalization event          chain=polygon-edge src=99 nonce=2
INFO[11-19|09:07:50] Submitted proposal vote                  chain=polygon-edge tx=0x58a22d84a08269ad2e8d52d8dc038621f1a21109d11c7b6e0d32d5bf21ea8505 src=99 depositNonce=2 gasPrice=1
INFO[11-19|09:08:15] Submitted proposal execution             chain=polygon-edge tx=0x57419844881a07531e31667c609421662d94d21d0709e64fb728138309267e68 src=99 dst=100 nonce=2 gasPrice=3
```

এক্সিকিউশন সম্পন্ন হওয়ার পর আপনি Polygon Edge নেটওয়ার্কে NFT এর মালিককে চেক করতে পারেন।

```bash
# Check the owner of NFT 0x50 in Polygon Edge chain
$ cb-sol-cli erc721 owner \
  --url http://localhost:10002 \
  --erc721Address "[ERC721_CONTRACT_ADDRESS]" \
  --id 0x50
```

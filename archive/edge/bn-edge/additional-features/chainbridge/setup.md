---
id: setup
title: সেটআপ
description: কিভাবে সেটআপ chainBridge করবেন
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

## চুক্তি ডিপ্লয় করা {#contracts-deployment}

এই বিভাগে আপনি `cb-sol-cli` দিয়ে Polygon PoS এবং Polygon Edge-এ প্রয়োজনীয় চুক্তিসমূহ ডিপ্লয় করবেন।

```bash
# Setup for cb-sol-cli command
$ git clone https://github.com/ChainSafe/chainbridge-deploy.git
$ cd chainbridge-deploy/cb-sol-cli
$ make install
```

প্রথমত, আমরা `cb-sol-cli deploy` কমান্ড দিয়ে Polygon PoS চেইনে চুক্তি ডিপ্লয় করব। `--all` ফ্ল্যাগ ব্রিজ, ERC20 হ্যান্ডলার, ERC721 হ্যান্ডলার, জেনেরিক হ্যান্ডলার, ERC20 এবং ERC721 চুক্তিসহ সকল চুক্তি ডিপ্লয় করার কমান্ড তৈরি করে। এছাড়াও, এটি ডিফল্ট রিলেয়ার অ্যাকাউন্ট ঠিকানা এবং থ্রেশহোল্ড সেট করবে

```bash
# Deploy all required contracts into Polygon PoS chain
$ cb-sol-cli deploy --all --chainId 99 \
  --url https://rpc-mumbai.matic.today \
  --gasPrice [GAS_PRICE] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```


chainID এবং JSON-RPC URL সম্পর্কে জানুন [এখানে](/docs/edge/additional-features/chainbridge/definitions)

:::caution

`cb-sol-cli`-এ গ্যাসের ডিফল্ট মূল্য হচ্ছে `20000000` (`0.02 Gwei`)। কোনো লেনদেনে গ্যাসের উপযুক্ত মূল্য সেট করতে, অনুগ্রহ করে `--gasPrice` আর্গুমেন্ট ব্যবহার করে মান সেট করুন।

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

ব্রিজ চুক্তি ডিপ্লয় করতে প্রায় 0x3f97b8 (4167608) গ্যাস খরচ করে। অনুগ্রহ করে নিশ্চিত করুন যে ব্লক তৈরি করা হচ্ছে তাতে চুক্তি তৈরির লেনদেন ধারণ করার জন্য পর্যাপ্ত ব্লক গ্যাস সীমা রয়েছে। Polygon Edge-এর ব্লক গ্যাস সীমা পরিবর্তন করা সম্পর্কে আরও জানতে, দয়া করে
[লোকাল সেটআপ](/docs/edge/get-started/set-up-ibft-locally) ভিজিট করুন

:::

চুক্তি ডিপ্লয় করা সম্পন্ন হলে আপনি নিম্নলিখিত ফলাফল পাবেন:

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

এখন আমরা Polygon Edge চেইনে চুক্তি ডিপ্লয় করতে পারব।

```bash
# Deploy all required contracts into Polygon Edge chain
$ cb-sol-cli deploy --all --chainId 100 \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```

টার্মিনালের আউটপুটগুলোর সঙ্গে ডিপ্লয় করা স্মার্ট চুক্তির ঠিকানাটিও সংরক্ষণ করুন, কারণ পরবর্তী ধাপে এইগুলো আমাদের প্রয়োজন হবে।

## রিলেয়ার সেটআপ {#relayer-setup}

এই বিভাগে, আপনি 2 চেইনের মধ্যে ডেটা বিনিময় করতে একটি রিলেয়ার চালু করবেন।

প্রথমত, আমাদের ChainBridge রিপোজিটরিটি ক্লোন এবং তৈরি করতে হবে।

```bash
$ git clone https://github.com/ChainSafe/ChainBridge.git
$ cd chainBridge && make install
```

তারপর, আপনাকে `config.json` তৈরি করতে হবে এবং প্রতিটি চেইনের জন্য JSON-RPC URL, রিলেয়ার ঠিকানা এবং চুক্তির ঠিকানা সেট করতে হবে।

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

একটি রিলেয়ার চালু করতে, আপনাকে রিলেয়ার অ্যাকাউন্ট ঠিকানার সাথে সংশ্লিষ্ট প্রাইভেট কী'টি ইম্পোর্ট করতে হবে। প্রাইভেট কী ইম্পোর্ট করার সময় আপনাকে পাসওয়ার্ড লিখতে হবে। ইম্পোর্ট সফল হলে কী'টি `keys/<ADDRESS>.key` এ সংরক্ষিত হবে।

```bash
# Import private key and store to local with encryption
$ chainbridge accounts import --privateKey [RELAYER_ACCOUNT_PRIVATE_KEY]

INFO[11-19|07:09:01] Importing key...
Enter password to encrypt keystore file:
> [PASSWORD_TO_ENCRYPT_KEY]
INFO[11-19|07:09:05] private key imported                     address=<RELAYER_ACCOUNT_ADDRESS> file=.../keys/<RELAYER_ACCOUNT_ADDRESS>.key
```

তারপরে, আপনি রিলেয়ার চালু করতে পারেন। আপনি শুরুতে কী সংরক্ষণ করতে যে পাসওয়ার্ড বেছে নিয়েছিলেন সেটিই আপনাকে আবার লিখতে হবে।

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

রিলেয়ার চালু হবার পর এটি প্রতিটি চেইনের নতুন ব্লক দেখা শুরু করবে।

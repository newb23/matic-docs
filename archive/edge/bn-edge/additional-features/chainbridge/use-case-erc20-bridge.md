---
id: use-case-erc20-bridge
title: ব্যবহারের ক্ষেত্র - ERC20 ব্রিজ
description: ERC20 চুক্তি ব্রিজ করার উদাহরণ
keywords:
  - docs
  - polygon
  - edge
  - Bridge
  - ERC20
---

এই বিভাগটির উদ্দেশ্য হচ্ছে আপনাকে ব্যবহারিক কাজের ক্ষেত্রে ERC20 ব্রিজ সেটআপ প্রক্রিয়া দেখানো।

এই নির্দেশিকায়, আপনি মুম্বাই Polygon PoS টেস্টনেট এবং Polygon Edge লোকাল চেইন ব্যবহার করবেন। অনুগ্রহ করে নিশ্চিত করুন যে আপনার মুম্বাইয়ের জন্য JSON-RPC এন্ডপয়েন্ট আছে এবং আপনি লোকাল এনভায়রনমেন্টে Polygon Edge সেটআপ করেছেন। আরও বিস্তারিত জানতে, অনুগ্রহ করে [লোকাল সেটআপ](/docs/edge/get-started/set-up-ibft-locally) বা [ক্লাউড সেটআপ](/docs/edge/get-started/set-up-ibft-on-the-cloud) দেখুন।

## দৃশ্যকল্প {#scenario}

ইতোমধ্যেই পাবলিক চেইনে (Polygon PoS) ডিপ্লয় করা কোনো ERC20 টোকেনের একটি ব্রিজ সেটআপ করার জন্য এই দৃশ্যটি দেওয়া হয়েছে যাতে পাবলিক থেকে প্রাইভেট চেইনে (Polygon Edge) কম খরচে ট্রান্সফার করা সম্ভব হয়। এই ক্ষেত্রে, টোকেনের মোট সাপ্লাই পাবলিক চেইনে বলা আছে এবং শুধুমাত্র পাবলিক চেইন থেকে প্রাইভেট চেইনে ট্রান্সফার করা টোকেনের পরিমাণই প্রাইভেট চেইনে উপস্থিত থাকবে। সেই কারণে, আপনাকে পাবলিক চেইনে লক/রিলিজ এবং প্রাইভেট চেইনে বার্ন/মিন্ট মোড ব্যবহার করতে হবে।

পাবলিক চেইন থেকে প্রাইভেট চেইনে টোকেন পাঠানোর সময়ে টোকেনগুলো পাবলিক চেইনের ERC20 হ্যান্ডলার চুক্তিতে লক হয়ে যাবে এবং একই পরিমাণ টোকেন প্রাইভেট চেইনে মিন্ট করা হবে। অন্যদিকে, প্রাইভেট চেইন থেকে পাবলিক চেইনে ট্রান্সফার করার ক্ষেত্রে, প্রাইভেট চেইনে যে পরিমাণ টোকেন বার্ন করা হবে তার সমপরিমাণ টোকেন ERC20 হ্যান্ডলার চুক্তি দিয়ে পাবলিক চেইনে ছাড়া হবে।

## চুক্তি {#contracts}

ChainBridge-এর তৈরি চুক্তির পরিবর্তে একটি সহজ ERC20 চুক্তি দিয়ে ব্যাখ্যা করা। বার্ন/মিন্ট মোডের জন্য, নিম্নলিখিত ERC20 পদ্ধতির পাশাপাশি ERC20 চুক্তিতে `mint` এবং `burnFrom` পদ্ধতিও থাকতে হবে:

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

সমস্ত কোড এবং স্ক্রিপ্ট Github Repo [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example)-এ আছে।

## ধাপ1: ব্রিজ এবং ERC20 হ্যান্ডলার চুক্তি ডিপ্লয় করুন {#step1-deploy-bridge-and-erc20-handler-contracts}

প্রথমত, আপনি উভয় চেইনে `cb-sol-cli` ব্যবহার করে ব্রিজ এবং ERC20Handler চুক্তি ডিপ্লয় করবেন।

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

আপনি নিচের মতো ব্রিজ এবং ERC20Handler চুক্তির ঠিকানা পাবেন:

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

## ধাপ2: আপনার ERC20 চুক্তি ডিপ্লয় করুন {#step2-deploy-your-erc20-contract}

আপনি আপনার ERC20 চুক্তি ডিপ্লয় করবেন। এই উদাহরণটি আপনাকে হার্ডহ্যাট প্রজেক্ট [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example)-এ দিক-নির্দেশনা প্রদান করবে।

```bash
$ git clone https://github.com/Trapesys/chainbridge-example.git
$ cd chainbridge-example
$ npm i
```

অনুগ্রহ করে `.env` ফাইল তৈরি করুন এবং নিম্নলিখিত মান সেট করুন।

```.env
PRIVATE_KEYS=0x...
MUMBAI_JSONRPC_URL=https://rpc-mumbai.matic.today
EDGE_JSONRPC_URL=http://localhost:10002
```

পরবর্তীতে আপনি উভয় চেইনে ERC20 চুক্তি ডিপ্লয় করবেন।

```bash
$ npx hardhat deploy --contract erc20 --name <ERC20_TOKEN_NAME> --symbol <ERC20_TOKEN_SYMBOL> --network mumbai
```

```bash
$ npx hardhat deploy --contract erc20 --name <ERC20_TOKEN_NAME> --symbol <ERC20_TOKEN_SYMBOL> --network edge
```

ডিপ্লয়মেন্ট সফল হওয়ার পরে, আপনি নিচের মতো একটি চুক্তির ঠিকানা পাবেন:

```bash
ERC20 contract has been deployed
Address: <ERC20_CONTRACT_ADDRESS>
Name: <ERC20_TOKEN_NAME>
Symbol: <ERC20_TOKEN_SYMBOL>
```

## ধাপ3: ব্রিজে রিসোর্স আইডি নিবন্ধন করুন {#step3-register-resource-id-in-bridge}

আপনি একটি রিসোর্স আইডি নিবন্ধন করবেন যা একটি ক্রস-চেইন এনভায়রনমেন্টে রিসোর্সগুলিকে সংযুক্ত করে। আপনাকে উভয় চেইনে একই রিসোর্স আইডি সেট করতে হবে।

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

## ধাপ4: Edge-এর ERC20 ব্রিজে মিন্ট/বার্ন মোড সেট করুন {#step4-set-mint-burn-mode-in-erc20-bridge-of-the-edge}

ব্রিজ Polygon Edge-এ বার্ন/মিন্ট মোড হিসাবে কাজ করার আশা রাখে। আপনি `cb-sol-cli` ব্যবহার করে বার্ন/মিন্ট মোড সেট করবেন।

```bash
$ cb-sol-cli bridge set-burn \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[ERC20_CONTRACT_ADDRESS]"
```

এবং আপনাকে ERC20 হ্যান্ডলার চুক্তিতে একটি মিন্টার এবং বার্নার রোল দিতে হবে।

```bash
$ npx hardhat grant --role mint --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --network edge
$ npx hardhat grant --role burn --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --network edge
```

## ধাপ5: টোকেন মিন্ট করুন {#step5-mint-token}

আপনি মুম্বাই চেইনে নতুন ERC20 টোকেন মিন্ট করবেন।

```bash
$ npx hardhat mint --type erc20 --contract [ERC20_CONTRACT_ADDRESS] --address [ACCOUNT_ADDRESS] --amount 100000000000000000000 --network mumbai # 100 Token
```

লেনদেনটি সফল হওয়ার পরে, অ্যাকাউন্টটিতে মিন্ট করা টোকেন চলে যাবে।

## ধাপ6: ERC20 ট্রান্সফার শুরু করুন {#step6-start-erc20-transfer}

এই ধাপ শুরু করার আগে, অনুগ্রহ করে নিশ্চিত করুন যে আপনি একটি রিলেয়ার চালু করেছেন। আরও বিস্তারিত জানতে, অনুগ্রহ করে [সেটআপ](/docs/edge/additional-features/chainbridge/setup) দেখুন।

মুম্বাই থেকে Edge-এ টোকেন ট্রান্সফার করার সময়, মুম্বাইয়ের ERC20 হ্যান্ডলার চুক্তি অ্যাকাউন্ট থেকে টোকেন উইথড্র করে। ট্রান্সফার করার আগে আপনি অনুমোদন কল করবেন।

```bash
$ npx hardhat approve --type erc20 --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --amount 10000000000000000000 --network mumbai # 10 Token
```

সবশেষে, আপনি `cb-sol-cli` ব্যবহার করে মুম্বাই থেকে Edge-এ টোকেন ট্রান্সফার করা শুরু করবেন।

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

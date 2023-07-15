---
id: use-case-erc721-bridge
title: ব্যবহারিক ক্ষেত্র - ERC721 ব্রিজ
description: ERC721 চুক্তি ব্রিজ করার উদাহরণ
keywords:
  - docs
  - polygon
  - edge
  - Bridge
  - ERC721
---

এই বিভাগটির উদ্দেশ্য হচ্ছে আপনাকে ব্যবহারিক কাজের ক্ষেত্রে ERC20 ব্রিজ সেটআপ প্রক্রিয়া দেখানো।

এই নির্দেশিকায়, আপনি মুম্বাই Polygon PoS টেস্টনেট এবং Polygon Edge লোকাল চেইন ব্যবহার করবেন। অনুগ্রহ করে নিশ্চিত করুন যে আপনার মুম্বাইয়ের জন্য JSON-RPC এন্ডপয়েন্ট আছে এবং আপনি লোকাল এনভায়রনমেন্টে Polygon Edge সেটআপ করেছেন। আরও বিস্তারিত জানতে, অনুগ্রহ করে [লোকাল সেটআপ](/docs/edge/get-started/set-up-ibft-locally) বা [ক্লাউড সেটআপ](/docs/edge/get-started/set-up-ibft-on-the-cloud) দেখুন।

## দৃশ্যকল্প {#scenario}

এই উদাহরণটিতে ব্যবহারকারীদের নিয়মিত ব্যবহারের ক্ষেত্রে প্রাইভেট চেইনে (Polygon Edge) স্বল্প-খরচের ট্রান্সফার সক্ষম করতে ইতোমধ্যেই পাবলিক চেইনে (Polygon PoS) ডিপ্লয় করা ERC721 NFT-এর জন্য ব্রিজ সেটআপের বিষয়টি দেখানো হয়েছে। এইসব ক্ষেত্রে, পাবলিক চেইন সংজ্ঞায়িত মূল মেটাডেটা এবং পাবলিক চেইনে ট্রান্সফারকৃত NFT-গুলোই শুধুমাত্র প্রাইভেট চেইনে থাকতে পারবে। সেই কারণে, আপনাকে পাবলিক চেইনে লক/রিলিজ এবং প্রাইভেট চেইনে বার্ন/মিন্ট মোড ব্যবহার করতে হবে।

পাবলিক চেইন থেকে প্রাইভেট চেইনে NFT পাঠানোর সময়ে NFT পাবলিক চেইনের ERC20 হ্যান্ডলার চুক্তিতে লক হয়ে যাবে এবং সেই একই NFT প্রাইভেট চেইনে মিন্ট করা হবে। অন্যদিকে, প্রাইভেট চেইন থেকে পাবলিক চেইনে ট্রান্সফার করার ক্ষেত্রে, প্রাইভেট চেইনে যে NFT বার্ন করা হবে সেই একই NFT ERC20 হ্যান্ডলার চুক্তি থেকে পাবলিক চেইনে ছাড়া হবে।

## চুক্তি {#contracts}

ChainBridge-এর তৈরি চুক্তির পরিবর্তে একটি সহজ ERC721 চুক্তি দিয়ে ব্যাখ্যা করা। বার্ন/মিন্ট মোডের জন্য, ERC721-এ সংজ্ঞায়িত নিচের পদ্ধতিগুলোর পাশাপাশি ERC721 চুক্তিতে অবশ্যই `mint` এবং `burn` থাকতে হবে:

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

সমস্ত কোড এবং স্ক্রিপ্ট Github রেপো [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example)-এ আছে।

## ধাপ 1: ব্রিজ এবং ERC721 হ্যান্ডলার চুক্তি ডিপ্লয় করুন {#step1-deploy-bridge-and-erc721-handler-contracts}

প্রথমত, আপনি উভয় চেইনে `cb-sol-cli` ব্যবহার করে ব্রিজ এবং ERC20Handler চুক্তি ডিপ্লয় করবেন।

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

আপনি নিচের মতো ব্রিজ এবং ERC721Handler চুক্তির ঠিকানা পাবেন:

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

## ধাপ 2: আপনার ERC721 চুক্তি ডিপ্লয় করুন {#step2-deploy-your-erc721-contract}

আপনি আপনার ERC721 চুক্তি ডিপ্লয় করবেন। এই উদাহরণটি আপনাকে হার্ডহ্যাট প্রজেক্ট [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example)-এ দিক-নির্দেশনা প্রদান করবে।

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

তারপর, আপনি উভয় চেইনে ERC20 চুক্তি ডিপ্লয় করবেন।

```bash
$ npx hardhat deploy --contract erc721 --name <ERC721_TOKEN_NAME> --symbol <ERC721_TOKEN_SYMBOL> --uri <BASE_URI> --network mumbai
```

```bash
$ npx hardhat deploy --contract erc721 --name <ERC721_TOKEN_NAME> --symbol <ERC721_TOKEN_SYMBOL> --uri <BASE_URI> --network edge
```

ডিপ্লয়মেন্ট সফল হওয়ার পরে, আপনি নিচের মতো একটি চুক্তির ঠিকানা পাবেন:

```bash
ERC721 contract has been deployed
Address: <ERC721_CONTRACT_ADDRESS>
Name: <ERC721_TOKEN_NAME>
Symbol: <ERC721_TOKEN_SYMBOL>
Base URI: <ERC721_BASE_URI>
```

## ধাপ3: ব্রিজে রিসোর্স আইডি নিবন্ধন করুন {#step3-register-resource-id-in-bridge}

আপনি একটি রিসোর্স আইডি নিবন্ধন করবেন যা একটি ক্রস-চেইন এনভায়রনমেন্টে রিসোর্সগুলিকে সংযুক্ত করে।

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

## ধাপ4: Edge-এর ERC721 ব্রিজে মিন্ট/বার্ন মোড সেট করুন {#step4-set-mint-burn-mode-in-erc721-bridge-of-the-edge}

ব্রিজ Edge-এ বার্ন/মিন্ট মোড হিসেবে কাজ করার প্রত্যাশা রাখে। আপনি বার্ন/মিন্ট মোড সেট করবেন।

```bash
$ cb-sol-cli bridge set-burn \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC721_HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[ERC721_CONTRACT_ADDRESS]"
```

তাছাড়া, আপনাকে ERC721 হ্যান্ডলার চুক্তিতে একটি মিন্টার এবং বার্নার ভূমিকা প্রদান করতে হবে।

```bash
$ npx hardhat grant --role mint --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --network edge
$ npx hardhat grant --role burn --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --network edge
```

## ধাপ 5: NFT মিন্ট করুন {#step5-mint-nft}

আপনি মুম্বাই চেইনে নতুন ERC721 NFT মিন্ট করবেন।

```bash
$ npx hardhat mint --type erc721 --contract [ERC721_CONTRACT_ADDRESS] --address [ACCOUNT_ADDRESS] --id 0x50 --data hello.json --network mumbai
```

লেনদেনটি সফল হওয়ার পরে, অ্যাকাউন্টটিতে মিন্ট করা NFT চলে যাবে।

## ধাপ6: ERC721 ট্রান্সফার শুরু করুন {#step6-start-erc721-transfer}

এই ধাপটি শুরু করার আগে, দয়া করে রিলেয়ার চালু করার বিষয়টি নিশ্চিত করুন। আরও বিস্তারিত জানতে, অনুগ্রহ করে [সেটআপ](/docs/edge/additional-features/chainbridge/setup) দেখুন।

মুম্বাই থেকে Edge-এ NFT ট্রান্সফার করার সময়, মুম্বাইয়ের ERC721 হ্যান্ডলার চুক্তি আপনার অ্যাকাউন্ট থেকে NFT উইথড্র করে। ট্রান্সফার করার আগে আপনি অনুমোদন কল করবেন।

```bash
$ npx hardhat approve --type erc721 --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --id 0x50 --network mumbai
```

সবশেষে, আপনি মুম্বাই থেকে Edge-এ NFT ট্রান্সফার করা শুরু করবেন।

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

ডিপোজিট লেনদেন সফল হওয়ার পরে, রিলেয়ার ইভেন্টটি পাবে এবং প্রস্তাবের পক্ষে ভোট দেবে।  
প্রয়োজনীয় সংখ্যক ভোট সাবমিট হবার পরে এটি Polygon Edge চেইনে প্রাপক অ্যাকাউন্টে NFT পাঠাতে একটি লেনদেন এক্সিকিউট করে।

```bash
INFO[11-19|09:07:50] Handling nonfungible deposit event       chain=mumbai
INFO[11-19|09:07:50] Attempting to resolve message            chain=polygon-edge type=NonFungibleTransfer src=99 dst=100 nonce=2 rId=000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501
INFO[11-19|09:07:50] Creating erc721 proposal                 chain=polygon-edge src=99 nonce=2
INFO[11-19|09:07:50] Watching for finalization event          chain=polygon-edge src=99 nonce=2
INFO[11-19|09:07:50] Submitted proposal vote                  chain=polygon-edge tx=0x58a22d84a08269ad2e8d52d8dc038621f1a21109d11c7b6e0d32d5bf21ea8505 src=99 depositNonce=2 gasPrice=1
INFO[11-19|09:08:15] Submitted proposal execution             chain=polygon-edge tx=0x57419844881a07531e31667c609421662d94d21d0709e64fb728138309267e68 src=99 dst=100 nonce=2 gasPrice=3
```

এক্সিকিউশন লেনদেন সফলভাবে সম্পন্ন হবার পর আপনি Polygon Edge চেইনে NFT পাবেন।

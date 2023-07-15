---
id: getting-started
title: Get Started with Polygon PoS
sidebar_label: Quick Start
description: "Build your next blockchain app on Polygon."
keywords:
  - docs
  - matic
  - polygon
  - build on polygon
  - blockchain
  - introduction
  - how to launch dapp
  - dapps
  - ethereum
image: https://wiki.polygon.technology/img/polygon-logo.png
---

This guide will introduce you to the Polygon PoS ecosystem. You'll find links to valuable resources and websites that will bring you up to speed on building, not only on Polygon but also on general blockchain application development.

:::tip Stay in the know

Keep up with the latest builder updates from the Polygon
team and the community by subscribing to the
[<ins>Polygon notification groups</ins>](https://polygon.technology/notifications/).

:::

## Building on Polygon

If you are an Ethereum developer, you are already a Polygon developer. Simply switch to the [Polygon RPC](https://polygon-rpc.com/) and get started. All the tools you are familiar with on the Ethereum blockchain are supported on Polygon by default, such as Truffle, Remix, and Web3js.

You can deploy decentralized applications to either Polygon Mumbai Testnet or the Mainnet. The Polygon Mumbai Testnet connects with the Ethereum Goërli Testnet, which acts as its ParentChain. You can find all the network-related details in the [network documentation](https://github.com/maticnetwork/matic-docs/blob/master/docs/operate/network.md).

### Wallets

To interact with the Polygon Network, you need to have an Ethereum-based wallet because Polygon runs on Ethereum Virtual Machine (EVM). You can choose to set up a [Metamask](https://github.com/maticnetwork/matic-docs/blob/master/docs/tools/wallets/metamask/overview.md) or [Arkane](https://github.com/maticnetwork/matic-docs/blob/master/docs/develop/wallets/arkane/intro_arkane.md) Wallet. More on wallet-related information and why you need one can be found in our [wallet documentation](https://docs.polygon.technology/docs/develop/wallets/getting-started).

### Smart Contracts

Polygon supports many services you can use to test, compile, debug, and deploy decentralized applications onto the Polygon Network. These include deployment using [thirdweb](https://github.com/maticnetwork/matic-docs/blob/master/docs/develop/thirdweb.md), [Alchemy](https://github.com/maticnetwork/matic-docs/blob/master/docs/develop/alchemy.md), [Chainstack](https://github.com/maticnetwork/matic-docs/blob/master/docs/develop/chainstack.md), [QuickNode](https://github.com/maticnetwork/matic-docs/blob/master/docs/develop/quicknode.md), [Remix](https://github.com/maticnetwork/matic-docs/blob/master/docs/develop/remix.md), [Truffle](https://github.com/maticnetwork/matic-docs/blob/master/docs/develop/truffle.md), [Hardhat](https://github.com/maticnetwork/matic-docs/blob/master/docs/develop/hardhat.md), and [Replit](https://github.com/maticnetwork/matic-docs/blob/master/docs/develop/replit.md).

### Connecting to Polygon

You can add Polygon to MetaMask or directly use Arkane, which allows you to connect to Polygon using [RPC](https://docs.polygon.technology/docs/tools/wallets/metamask/config-polygon-on-metamask/).

:::note Directory of publicly available PoS RPC endpoints

Check out a list of public endpoints for the Polygon PoS network at [Alchemy's Chain Connect resource](https://www.alchemy.com/chain-connect/chain/polygon-pos) and [Chainlist](https://chainlist.org/chain/137).

:::

In order to connect with the Polygon network to read blockchain information, we recommend using the Alchemy SDK.

```js
// Javascript
// Setup: npm install alchemy-sdk
const { Alchemy, Network } = require("alchemy-sdk");

const settings = {
  apiKey: "demo", // Can replace with your API Key from https://www.alchemy.com
  network: Network.MATIC_MAINNET, // Can replace with MATIC_MUMBAI
};

const alchemy = new Alchemy(settings);

async function main() {
  const latestBlock = await alchemy.core.getBlockNumber();
  console.log("The latest block number is", latestBlock);
}

main();
```

### Building a new dApp on Polygon?

Decentralized applications (dApps) act as the bridge between users and their data privacy on the blockchain. The increasing number of dApps validates their usefulness within the blockchain ecosystem, solving challenges like executing transactions between two participants without the need for central authority via smart contracts.

Suppose you have no prior experience building decentralized applications (dApps). In that case, the below-mentioned resources will give you a head start on the tools required to build, debug, and deploy dApps on the Polygon Network.

- [Full Stack dApp: Tutorial Series](https://kauri.io/full-stack-dapp-tutorial-series/5b8e401ee727370001c942e3/c)
- [Web3.js](https://www.dappuniversity.com/articles/web3-js-intro)
- [Ethers.js](https://docs.ethers.io/v5/)
- [thirdweb](https://portal.thirdweb.com)
- [Remix](https://docs.polygon.technology/docs/develop/remix/)
- [Truffle](https://docs.polygon.technology/docs/develop/truffle)
- [Metamask](https://docs.polygon.technology/docs/tools/wallets/metamask/overview)
- [Arkane](https://docs.polygon.technology/docs/develop/wallets/arkane/intro)
- [Develop a dApp using Fauna, Polygon and React](https://docs.polygon.technology/docs/develop/dapp-fauna-polygon-react)

### Already have a dApp?

If you already have a decentralized application (dApp) and are looking for a platform to help you scale efficiently, then you are at the right place because Polygon allows you to:

1. **Easily migrate from Ethereum Virtual Machine (EVM) based chain**: Polygon prides itself in being the ultimate Layer-2 scaling solution for Ethereum. You don't have to worry about the underlying architecture while moving or deploying your dApps to the Polygon Network as long as it is EVM-compatible.
2. **Use Polygon as a faster transaction layer**: Deploying your dApp to the Polygon Mainnet allows you to leverage Polygon as a faster transaction layer for your dApp. Additionally, you can get your tokens mapped by us. You can join our [technical discussions group](http://bit.ly/matic-technical-group) on Telegram to learn more.

## Side Note

If this is overwhelming, that’s alright! You can jump right into the action and start hacking. Here are some notes before you start diving into resources, repositories, and docs:

1. **Beware the cost of being on the bleeding edge**: Like typical niche programming, dApps and blockchain development moves very quickly. While researching, you may find complex code repositories, 404s on a documentation site, or even no documentation. Use that opportunity to reach out to us via any social media channel.
2. **The learning curve may be daunting, but the barrier to entry is low**: The community is very open and welcoming! Projects welcome pull requests from outsiders and resolve any blockers actively. We’re working on creating a better world and contribution in any form is appreciated. We’ll be grateful to onboard you into this amazing Web3 ecosystem.

:::info Stay Updated

Decentralized application development encourages network decentralization. Follow our social media handles for more insights and updates about the Polygon ecosystem. You can find the links to all the Polygon communities [here](https://polygon.technology/community/).

:::

## General Resources

:::caution Content disclaimer

Please view the third-party content disclaimer [<ins>here</ins>](https://github.com/maticnetwork/matic-docs/blob/master/CONTENT_DISCLAIMER.md).

:::

### Basics of Web3 Development

- [What is Ethereum?](https://blockgeeks.com/guides/ethereum/)
- [Mastering Ethereum](https://github.com/ethereumbook/ethereumbook)
- [Full-Stack dApp Tutorial Series](https://kauri.io/#collections/Full%20Stack%20dApp%20Tutorial%20Series/full-stack-dapp-tutorial-series-intro/)
- [Web3 Developer Stack](https://www.quicknode.com/guides/web3-sdks/the-web3-developer-stack)
- [Deploy a Smart Contract using REMIX](https://www.quicknode.com/guides/solidity/how-to-deploy-a-smart-contract-on-matic-polygon)
- [How to Create a Token (ERC20)?](https://www.quicknode.com/guides/solidity/how-to-create-and-deploy-an-erc20-token)
- [Integrating IPFS with Ethereum](https://www.quicknode.com/guides/web3-sdks/how-to-integrate-ipfs-with-ethereum)
- [Hello World Smart Contract](https://docs.alchemy.com/alchemy/tutorials/hello-world-smart-contract)
- [How to Create an NFT](https://docs.alchemy.com/alchemy/tutorials/how-to-create-an-nft)
- [Lens Protocol | How to Create a Decentralized Twitter](https://docs.alchemy.com/docs/how-to-create-a-decentralized-twitter-with-lens-protocol)
- [Truffle Tutorial](https://www.trufflesuite.com/tutorial)
- [Dapp University](https://www.youtube.com/channel/UCY0xL8V6NzzFcwzHCgB8orQ)

### Learn more about blockchain

- [Polygon's Architecture and Security](https://docs.polygon.technology/docs/home/architecture/security-models)
- [Integrating Webhooks](https://docs.alchemy.com/alchemy/enhanced-apis/notify-api/using-notify)
- [Archive Nodes with Debug namespace](https://www.quicknode.com/chains/matic?utm_source=polygon_docs&utm_campaign=ploygon_docs_contract_guide)

### External documentation

- [thirdweb's docs](https://portal.thirdweb.com)
- [Alchemy's Polygon Docs](https://docs.alchemy.com/reference/polygon-api-quickstart)
- [QuickNode's Polygon Docs](https://www.quicknode.com/docs/polygon?utm_source=polygon_docs&utm_campaign=ploygon_docs_contract_guide)
- [ConsenSys Academy Developer Course](https://consensys.net/academy/ondemand/)
- [Infura Docs](https://infura.io/docs)
- [Truffle Docs](https://trufflesuite.com/docs/)
- [Geth Docs](https://geth.ethereum.org/)
- [Remix Docs](https://remix.run/docs/en/v1)
- [OpenZeppelin Docs](https://docs.openzeppelin.com/)
- [Cloudflare Docs](https://developers.cloudflare.com/web3/polygon-gateway/)

### Useful tutorials

- [Alchemy University](http://university.alchemy.com)
- [CryptoZombies](https://cryptozombies.io/)
- [Ethernaut](https://ethernaut.openzeppelin.com/)
- [Capture the Ether](https://capturetheether.com/)
- [Road to Web 3](https://docs.alchemy.com/docs/welcome-to-the-road-to-web3)

### Additional resources

- [Video Tutorials Library](https://www.notion.so/Video-Tutorials-Library-f16cbb8c3d9d47d8bc809e06519f110c)
- [Polygon dApps](https://www.alchemy.com/ecosystem/polygon)
- [Writings by the Team](https://www.notion.so/Writings-by-the-Team-c979819406894abb964cb50ae197f376)
- [Matic Tools](https://www.notion.so/f5739c3ed3cc40e3ae71d5935a72143d)
- [FAQs](https://docs.polygon.technology/docs/faq/technical-faqs)

---
id: new-to-polygon
title: Welcome to Polygon
description: Build your next blockchain application on the Polygon network.
keywords:
  - docs
  - polygon
  - new to polygon
  - wiki
image: https://wiki.polygon.technology/img/polygon-logo.png
---

Polygon is a scaling solution for public blockchain networks. Polygon PoS chain supports all the existing Ethereum tooling along with faster and cheaper transactions.

## What is a Blockchain?

Blockchain is a shared, immutable ledger for recording transactions, tracking assets and building trust. Head over to [Blockchain Basics](blockchain-basics/basics-blockchain.md) section to read more.

## Types of Interaction on Polygon

- [Polygon PoS chain](/develop/getting-started.md)
- [Ethereum + Polygon with PoS bridge](/develop/ethereum-polygon/pos/getting-started.md)

## Query the Blockchain

Most blockchain interactions involve reading its state.

Alchemy offers a reference guide on how to make basic requests to the blockchain. Check out their guide on [how to query Polygon](https://docs.alchemy.com/reference/polygon-sdk-examples).

## Deploy Smart Contracts

- Deploy your Contracts on Polygon
  - [Using thirdweb](/develop/thirdweb.md)
  - [Using Alchemy](/develop/alchemy.md)
  - [Using QuickNode](/develop/quicknode.md)
  - [Using Chainstack](/develop/chainstack.md)
  - [Using Remix](/develop/remix.md)
  - [Using Truffle](/develop/truffle.md)
  - [Using Hardhat](/develop/hardhat.md)

:::note

Configure the Web3 RPC-URL to "https://rpc-mumbai.matic.today", everything else remains the same.

:::

## Validator and delegator roles

On the Polygon Network, you can be a validator or a delegator. See:

- [Who Is a Validator](/maintain/polygon-basics/who-is-validator.md)
- [Who Is a Delegator](/maintain/polygon-basics/who-is-delegator.md)

## Architecture

If your goal is to become a validator, it is essential that you understand the Polygon architecture.

See [Polygon Architecture](/pos/design/validator/architecture.md).

### Components

To have a granular understanding of the Polygon architecture, see core components:

- [Heimdall](/pos/design/heimdall/overview.md)
- [Bor](/pos/design/bor/overview.md)
- [Contracts](/pos/contracts/stakingmanager.md)

### Codebases

To have a granular understanding of the core components, check out their codebases:

- [Heimdall](https://github.com/maticnetwork/heimdall)
- [Bor](https://github.com/maticnetwork/bor)
- [Contracts](https://github.com/maticnetwork/contracts)

## How-Tos

### Node setup

If you want to run a full node on the Polygon Mainnet or Mumbai Testnet, you can follow the
[Run a Validator Node](/pos/operate/validator/run-validator.md) guide.

### Staking operations

- [Validator Staking Operations](/docs/pos/operate/validator/validator-staking-operations)
- [Delegate](/docs/maintain/delegate/delegate)

### External Resources

- [Your first dApp](https://www.youtube.com/watch?v=rzvk2kdjr2I)
- [Sidechains and Childchains](https://hackernoon.com/what-are-sidechains-and-childchains-7202cc9e5994)

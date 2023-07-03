---
id: polygon-architecture
title: Architecture Overview
sidebar_label: Overview
description: Introduction to the architecture of Polygon PoS blockchain.
keywords:
  - architecture
  - polygon
  - pos
  - wiki
  - research
image: https://wiki.polygon.technology/img/polygon-logo.png
---

import useBaseUrl from '@docusaurus/useBaseUrl';

The Polygon PoS Network has a three-layer architecture:

* **Ethereum layer** — a set of contracts on the Ethereum mainnet.
* **Heimdall layer** — a set of proof-of-stake Heimdall nodes running parallel to the Ethereum mainnet, monitoring the set of staking contracts deployed on the Ethereum mainnet and committing the Polygon Network checkpoints to the Ethereum mainnet. Heimdall is based on Tendermint.
* **Bor layer** — a set of block-producing Bor nodes shuffled by Heimdall nodes. Bor is based on Go Ethereum.

<img src={useBaseUrl("img/staking/architecture.png")} />

Currently, developers can use PoS for state transitions for which predicates have
been written, such as ERC20, ERC721, asset swaps, or other custom predicates.
they can use PoS.

To enable the PoS mechanism on our platform, a set of **staking** management contracts are deployed on
Ethereum, and a set of incentivized validators running **Heimdall** and **Bor** nodes. Ethereum is
the first basechain Polygon supports, but Polygon intends to offer support for additional basechains to
enable an interoperable decentralized Layer 2 blockchain platform based on community suggestions and consensus.

<img src={useBaseUrl("img/matic/Architecture.png")} />

## Staking Contracts

To enable the Proof of Stake (PoS) mechanism on Polygon, the system employs a set of [staking](/maintain/glossary.md#staking) management contracts on the Ethereum mainnet.

The staking contracts implement the following features:

* Anyone can stake MATIC tokens on the staking contracts on the Ethereum mainnet and join the system as a [validator](/docs/maintain/glossary#validator).
* Earn staking rewards for validating state transitions on the Polygon Network.
* Save [checkpoints](/docs/maintain/glossary#checkpoint-transaction) on the Ethereum mainnet.

The PoS mechanism also acts as a mitigation to the data unavailability problem for the Polygon sidechains.

## Heimdall

Heimdall is the proof of stake validation layer that handles the aggregation of blocks produced
by [Bor](/docs/maintain/glossary#bor) into a Merkle tree and publishes the Merkle root periodically to the
root chain. The periodic publishing of snapshots of Bor is called [checkpoints](/docs/maintain/glossary#checkpoint-transaction).

1. Validates all the blocks since the last checkpoint.
2. Creates a Merkle tree of the block hashes.
3. Publishes the Merkle root hash to the Ethereum mainnet.

Checkpoints are important for two reasons:

1. Providing finality on the root chain.
2. Providing proof of burn in withdrawal of assets.

An overview of the process:

* A subset of active validators from the pool is selected to act as [block producers](/docs/maintain/glossary#block-producer) for a [span](/docs/maintain/glossary#span). These block producers are responsible for creating blocks and broadcasting the created blocks on the network.
* A checkpoint includes the Merkle root hash of all blocks created during any given interval. All nodes validate the Merkle root hash and attach their signature to it.
* A selected [proposer](/docs/maintain/glossary#proposer) from the validator set is responsible for collecting all signatures for a particular checkpoint and committing the checkpoint on the Ethereum mainnet.
* The responsibility of creating blocks and proposing checkpoints is variably dependent on a validator’s stake ratio in the overall pool.

More details on Heimdall are available on the [Heimdall architecture](/docs/pos/design/heimdall/overview) guide.

## Bor

Bor is Polygon's block producer layer - the entity responsible for aggregating transactions into blocks.  Currently, it is a basic Geth implementation with custom changes done to the consensus algorithm.

Block producers are a subnet of the validators and are periodically shuffled via committee selection on [Heimdall](/docs/maintain/glossary#heimdall) in durations termed
as a `span` in Polygon. Blocks are produced at the **Bor** node, and the VM is EVM-compatible.
Blocks produced on Bor are also validated periodically by Heimdall nodes, and a checkpoint consisting of
the Merkle tree hash of a set of blocks on Bor is committed to Ethereum periodically.

More details are available on the [Bor architecture](/docs/pos/design/bor/overview) guide.

## Resources

* [Bor Architecture](https://wiki.polygon.technology/docs/pos/design/bor)
* [Heimdall Architecture](https://forum.polygon.technology/t/matic-system-overview-heimdall/8323)
* [Checkpoint Mechanism](https://forum.polygon.technology/t/checkpoint-mechanism-on-heimdall/7160)

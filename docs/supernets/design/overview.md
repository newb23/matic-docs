---
id: overview
title: Architecture Overview
sidebar_label: Overview
description: "Introduction to the architecture of Supernets."
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - modular
  - layer
  - libp2p
  - extensible
---

The diagram below illustrates the major coomponents of Supernets.

<div align="center">
  <img src="/img/supernets/supernets-overview.excalidraw.png" alt="Supernets architecture overview" width="850" />
</div>

## Components

The following table breaks down each of these components.

| Component | Description | Link |
| --- | --- | --- |
| libp2p | Provides the networking layer for Supernets and is designed for peer-to-peer network architectures. | [libp2p overview](/docs/supernets/design/libp2p.md) |
| Bridge | An in-built bridging mechanism enabled by PolyBFT that allows message passing between a Supernet and another Proof-of-Stake blockchain without mapping. | [bridge overview](/docs/supernets/design/bridge/overview.md) |
| Mempool | Enables multiple validators to aggregate their signatures to create a single, aggregated signature representing all validators in the pool. | [mempool overview](/docs/supernets/design/mempool.md) |
| Consensus | PolyBFT serves as the consensus mechanism of Polygon Supernets and consists of a consensus engine, IBFT 2.0, and a consensus protocol that includes the bridge, staking, and other utilities. | [PolyBFT overview](/docs/category/polybft-consensus) |
| Blockchain | Coordinates everything in the system, curates state transitions, and is responsible for state changes when a new block is added to the chain. | [blockchain overview](/docs/supernets/design/blockchain.md) |
| Runtime (EVM) | Uses the EVM as the runtime environment for executing smart contracts. | [runtime overview](/docs/supernets/design/runtime/overview.md) |
| TxPool | Represents the transaction pool, closely linked with other modules in the system. | [txpool overview](/docs/supernets/design/txpool.md) |
| JSON-RPC | Facilitates interaction between dApp developers and the blockchain, allowing developers to issue JSON-RPC requests to a Supernet node and receive responses. | [JSON-RPC overview](/docs/supernets/design/jsonrpc.md) |
| gRPC | Essential for operator interactions, allowing node operators to interact with the client easily and providing a seamless user experience. | [gRPC overview](/docs/supernets/design/grpc.md) |

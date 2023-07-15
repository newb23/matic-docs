---
id: security-models
title: Proof of Stake Security Model
sidebar_label: Security Model
description: "Learn about the PoS security model."
keywords:
  - docs
  - matic
  - polygon
  - security
  - implementation
image: https://wiki.polygon.technology/img/polygon-logo.png
---

## Overview

The Proof of Stake (PoS) model's security relies on the Heimdall and Bor layers, both constructed upon the Tendermint protocol. A checkpoint only commits to the root chain once a minimum of two-thirds of the validators provide their signatures.

The PoS mechanism operates through a collection of staking management contracts on Ethereum, supplemented by a group of incentivized validators running Heimdall and Bor nodes. This approach enables:

Participation as a Validator by staking MATIC tokens on the Ethereum smart contract.
Earning of staking rewards for validating state transitions on the Polygon network.
A fast finality layer periodically solidifies the state through checkpoints, enhancing state security. The EVM-compatible chain, with its high throughput and swift block time, optimizes scalability over an extensive degree of decentralization. Heimdall ensures a secure final state commit, passing through a large validator set to maintain high decentralization.

## For Developers

Deploying on the PoS security model is streamlined for dApp developers: simply deploy the smart contract on the Polygon PoS network. This ease of deployment is due to the account-based architecture, which is compatible with the EVM blockchain.

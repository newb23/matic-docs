---
id: bor-chain
title: What is BoR-Chain?
sidebar_label: Bor Chain
description: Introduction to Bor Chain
keywords:
  - docs
  - matic
  - polygon
  - bor chain
image: https://wiki.polygon.technology/img/polygon-logo.png
---

The Bor node, or the block producer implementation, is an EVM-compatible blockchain operator. Currently, it is a basic Geth implementation with custom changes done to the consensus algorithm. However, this will be built from the ground up to make it lightweight and focused.

Block producers are chosen from the validator set and are shuffled using historical Ethereum block hashes for the same purpose. However, we are exploring sources of randomness for this selection.

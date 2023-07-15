---
id: umb
title: Umbrella Network
sidebar_label: Umbrella Network
description: Umbrella Network is a decentralized oracle service that provides blockchain projects with secure, scalable, and customizable data solutions.
keywords:
  - oracle
  - umbrella
  - network
  - Layer 2
  - offchain
  - onchain
  - data
  - prices
image: https://wiki.polygon.technology/img/polygon-logo.png
---
import useBaseUrl from '@docusaurus/useBaseUrl';

:::caution Content disclaimer

Please view the third-party content disclaimer [<ins>here</ins>](https://github.com/maticnetwork/matic-docs/blob/master/CONTENT_DISCLAIMER.md).

:::

---

[<ins>Umbrella Network</ins>](https://umb.network/) is a decentralized oracle service that provides blockchain projects with secure, scalable, and customizable data solutions.

The service leverages a network of decentralized community validators to ensure the reliability of the oracle data.

## Solutions   

Umbrella Network provides three data consumption options: on-chain data, layer 2 data, and on-demand data.

### On-chain data

Retrieve data feeds directly on-chain. Projects can define parameters such as deviation triggers and heartbeat to manage the frequency and precision of the updates. This is the simplest and most straightforward approach for reading data.

### Layer-2 data

Read data feeds off-chain and verify them on-chain to ensure secure utilization within your dApp. Prices are regularly updated off-chain at a predefined frequency, and web3 apps fetch this data when needed and submit it on-chain. This approach is particularly advantageous when your project necessitates handling large volumes of data, as storing it entirely on-chain would be cost-prohibitive.

### On-demand data

On-demand data fetching planned for Q3 2023.

## Resources

### Technical documentation

The official technical documentation can be found [<ins>here</ins>](https://umbrella-network.readme.io/docs).

### Custom feeds

In case your project requires a custom feed, please contact the Umbrella team [<ins>here</ins>](https://www.umb.network/contact#form).

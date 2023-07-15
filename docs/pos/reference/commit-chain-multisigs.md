---
id: commit-chain-multisigs
title: PoS Mainnet Multisigs
sidebar_label: Multisigs
description: Information about active multisigs
keywords:
  - docs
  - polygon
  - matic
  - multisig
  - address
image: https://wiki.polygon.technology/img/polygon-logo.png
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

:::note Capabilities

The primary function of the multisigs is to enable contract upgrades in
the [current] early phases of development.

As the contracts secured by the multisigs become battle-tested,
Polygon will introduce the following optimizations and changes:

- move from multisigs to governance-controlled proxies;
- introduce timelocks;
- eventually remove all multisigs.

To be clear, the current multisigs cannot censor transactions like bridge transactions.

:::

| Multisig Address  | **5/9 multisig <br/>0xFa7D2a996aC6350f4b56C043112Da0366a59b74c**                                 |
|:--------------:|----------------------------------------|
| Purpose  | To upgrade POS and staking contracts on Ethereum* <br/>|
| Chain      | Ethereum                                 |
| Rights    |<ul> <li>Update staking contracts for staking optimisations, features and upgradations </li> <li>Be able to fix unexpected and unforeseen bugs on POS contracts</li></ul>|
| Signatories    |<ul><li> Quickswap </li> <li>Curve </li> <li>Polygon </li> <li>Horizon Games </li> <li>Cometh  </li></ul>|


| Multisig Address  | **5/8 multisig <br/> 0x355b8E02e7F5301E6fac9b7cAc1D6D9c86C0343f**                                 |
|:--------------:|----------------------------------------|
| Purpose  | To to be able to update "custom" childerc20s if required on Polygon Commitchain* <br/> |
| Chain      | Polygon Commitchain                                 |
| Rights    |<ul> <li>Ability to upgrade "custom child contracts" ( and not the fx portal created standard tokens mentioned below) </li> </ul>|
| Signatories    |<ul><li> Quickswap </li> <li>Curve </li> <li>Polygon </li>  <li>Horizon Games </li> <li>Cometh  </li></ul>|

| Multisig Address  | **Permissionless Mapping of standard ChildERC20 tokens (No Multisig Required) **                                 |
|:--------------:|----------------------------------------|
| Purpose  | Use FxPortal supports permissionless token mapping of standard ChildERC20 for any ERC20 token on Ethereum|
| Chain      | Permissionless                             |
| Rights    |Permissionless|
| Signatories    |Permissionless|

| Multisig Address  | 4/8 Multisig <br/> 0x424bDE99FCfB68c5a1218fd3215caFfD031f19C4 |
|:--------------:|----------------------------------------|
| Purpose  | <ul><li>To enable the mapping of "custom" child ERC20s with Mainnet contract. <li>60% of Dapps deployed on Polygon "want" custom child ERC20 token, which needs to be mapped with supervision.<li> Eventually this can go to Governance but this will vastly increase the time for Dapp teams who want custom ERC20.</li></li></li> <li> You can create standard child ERC20s yourselves using Fx portal, its permissionless, no mapping required</li></ul>|
| Chain      | Ethereum <br/>             |
| Rights    |Can only do mapping, doesn't have any access to Child token, no deposit/withdrawal rights whatsoever|
| Signatories    |<ul> <li>Polygon </li> </ul>|

<sub> *To be moved to governance. Exploring Aave's governance contracts and Compound’s time lock contracts</sub>

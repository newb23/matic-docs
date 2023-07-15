---
id: delegate
title: How to Delegate
description: Learn how to become a delegator on the Polygon Network.
keywords:
  - docs
  - matic
  - polygon
  - how to delegate
  - validator
  - stake
image: https://wiki.polygon.technology/img/polygon-logo.png
slug: delegate
---
import useBaseUrl from '@docusaurus/useBaseUrl';

# How to Delegate

This is a step-by-step guide to help you become a [delegator](/docs/maintain/glossary.md#delegator) on the Polygon Network.

The only prerequisite is to have your MATIC tokens and ETH on the Ethereum mainnet address.

## Access the dashboard

1. In your wallet (e.g. MetaMask), choose the Ethereum mainnet.

<div align="center">
<img align="center" src={useBaseUrl("/img/staking/choose-eth-mainnet.png")} width="300" />
</div>
<br />

2. Log in to [Polygon Staking](https://staking.polygon.technology/).
3. Once you log in, you will see some overall statistics along with the list of validators.

![img](/img/staking/home.png)

:::note

If you are a validator, use a different non-validating address to log in as delegator.

:::

## Delegate to a Validator

1. Click **Become a Delegator** or scroll down to a specific validator and click **Delegate**.

![img](/img/staking/home.png)

2. Provide the amount of MATIC to delegate.

<div align="center">
<img align="center" src={useBaseUrl("/img/staking/delegate.png")} width="500" />
</div>
<br />

3. Approve the delegation transaction and click **Delegate**.

<div align="center">
<img align="center" src={useBaseUrl("/img/staking/delegate2.png")} width="500" />
</div>
<br />

After the delegation transaction completes, you will see the **Delegation Completed** message.

<div align="center">
<img align="center" src={useBaseUrl("/img/staking/delegate3.png")} width="500" />
</div>
<br />

## View your delegations

To view your delegations, click [My Account](https://staking.polygon.technology/account).

![img](/img/staking/myAccount.png)

## Withdraw rewards

1. Click [My Account](https://staking.polygon.technology/account).

<div align="center">
<img align="center" src={useBaseUrl("/img/staking/click-my-account.png")} width="500" />
</div>
<br />

2. Under your delegated validator, click **Withdraw Reward**.

<div align="center">
<img align="center" src={useBaseUrl("/img/staking/withdraw-reward.png")} width="800" />
</div>
<br />

This will withdraw the MATIC token rewards to your Ethereum address.

## Restake rewards

1. Click [My Account](https://staking.polygon.technology/account).

<div align="center">
<img align="center" src={useBaseUrl("/img/staking/click-my-account.png")} width="500" />
</div>
<br />

2. Under your delegated validator, click **Restake Reward**.

<div align="center">
<img align="center" src={useBaseUrl("/img/staking/restake-rewards.png")} width="800" />
</div>
<br />

This will restake the MATIC token rewards to the validator and increase your delegation stake.

## Unbond from a Validator

1. Click [My Account](https://staking.polygon.technology/account).

<div align="center">
<img align="center" src={useBaseUrl("/img/staking/click-my-account.png")} width="500" />
</div>
<br />

2. Under your delegated validator, click **Unbond**.

<div align="center">
<img align="center" src={useBaseUrl("/img/staking/unbond-from-validator.png")} width="800" />
</div>
<br />

This will withdraw your rewards from the validator and your entire stake from the validator.

Your withdrawn rewards will show up immediately on your Ethereum account.

Your withdrawn stake funds will be locked for 80 [checkpoints](/docs/maintain/glossary.md#checkpoint-transaction).

<div align="center">
<img align="center" src={useBaseUrl("/img/staking/unbond.png")} width="500" />
</div>
<br />

:::note

The fund locking for the unbonding period is in place to ensure there is no malicious behaviour on the network.

:::

## Move stake from one node to another node

Moving stake from one node to another node is a single transaction. There are no delays or unbonding periods during this event.

1. Log in to the [My Account](https://wallet.polygon.technology/staking/my-account) on the Staking dashboard.
1. Click **Move Stake** under your delegated validator.
1. Select an external validator and click **Stake here**.

<div align="center">
<img align="center" src={useBaseUrl("/img/staking/move.png")} width="1500" />
</div>
<br />

4. Provide the stake amount and click **Move Stake**.

<div align="center">
<img align="center" src={useBaseUrl("/img/staking/move2.png")} width="400" />
</div>
<br />

This will move the stake. The dashboard will update after 12 block confirmations.

:::info

Moving stake is allowed between any nodes. The only exception is moving stake from one Foundation node to another Foundation node which is not allowed.

:::

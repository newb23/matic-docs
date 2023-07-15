---
id: who-is-validator
title: Who is a Validator
sidebar_label: Who is a Validator
description: "A participant in the network who runs Heimdall and Bor nodes."
keywords:
  - docs
  - matic
  - polygon
  - validator
  - Who is a Validator
image: https://wiki.polygon.technology/img/polygon-logo.png
---

Validator is a participant in the network who locks up MATIC tokens in the system and runs Heimdall validator and Bor block producer nodes in order to help run the network. Validators stake their MATIC tokens as collateral to work for the security of the network and in exchange for their service, earn rewards.

Rewards are distributed to all stakers proportional to their stake at every checkpoint with the exception being the proposer getting an additional bonus. User reward balance gets updated in the contract which is referred to while claiming rewards.

:::tip

Those who are interested in securing the network but are not running a full node can participate as [delegators](/docs/maintain/glossary.md#delegator).

:::

## Overview

Validators participate as block producers and verifiers. Once a [checkpoint](/docs/maintain/glossary.md#checkpoint-transaction) is validated by the participants, updates are made on the parent chain (the Ethereum mainnet) which releases the rewards for validators depending on their stake in network.

Polygon relies on a set of [validators](/docs/maintain/glossary.md#validator) to secure the network. The role of validators is to run a full node, [produce blocks](/docs/maintain/glossary.md#block-producer), validate and participate in consensus, and commit [checkpoints](/docs/maintain/glossary.md#checkpoint-transaction) on the Ethereum mainnet. To become a validator, one needs to [stake](/docs/maintain/glossary.md#staking) their MATIC tokens with staking management contracts residing on the Ethereum mainnet.

## Core components

[Heimdall](/docs/maintain/glossary.md#heimdall) reads the events emitted by the staking contracts to pick the validators for the current set with their updated stake ratio, which is used also by [Bor](/docs/maintain/glossary.md#bor) while producing blocks.

[Delegation](/docs/maintain/glossary.md#delegator) is also recorded in the staking contracts and any update in the validator power or node [signer address](/docs/maintain/glossary.md#signer-address) or unbonding requests comes into effect when the next checkpoint gets committed.


## End-to-end flow for a Polygon Validator

Validators set up their signing nodes, sync data and then stake their tokens on the Ethereum mainnet staking contracts to be allocated a slot in the current set. 

:::warning

At present, there are no open validator slots available on Polygon PoS. There is also a waitlist to become a validator. In the future, if slots become available, validators may apply to be considered and removed off of the waitlist.

:::

Block producers are chosen from the validator set where it is the responsibility of the selected validators to produce blocks for a given [span](/docs/maintain/glossary.md#span).

Nodes at Heimdall validate the blocks being produced, participate in consensus and commit checkpoints on the Ethereum mainnet at defined intervals.

The probability of validators to get selected as the block producer or checkpoint [proposer](/docs/maintain/glossary.md#proposer) is dependent on one’s stake ratio including delegations in the overall pool.

Validators receive rewards at every checkpoint as per their stake ratio, after deducting the proposer bonus which is disbursed to the checkpoint proposer.

One can opt out of the system at any time and can withdraw tokens once the unbonding period ends.

## Economics

See [Rewards](/docs/pos/design/validator/rewards).

## Setting up a Validator node

See [Validate](/docs/pos/operate/validator/validator-index).

## See Also

* [Validator Responsibilities](/docs/pos/operate/validator/validator-responsibilities)
* [Validate](/docs/pos/operate/validator/validator-index)
* [Validator FAQ](/docs/pos/operate/validator/faq/validator-faq)

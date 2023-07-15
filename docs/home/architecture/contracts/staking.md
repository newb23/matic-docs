---
id: staking
title: Staking on Polygon
description: Staking on Polygon
keywords:
  - docs
  - polygon
  - matic
  - staking
  - unstake
  - restake
image: https://wiki.polygon.technology/img/polygon-logo.png
---

# Staking on Polygon

For the Polygon Network, any participant can be qualified to become a network validator by running a full node. The primary incentive for running a full node for validators is to earn Rewards and Transaction fees. Validator participating in consensus for Polygon incentivise to participate as they receives block rewards and transaction fee.

As validator slots are limited for the network, the process to get selected as a validator is to participate in an on-chain auction which happens at regular intervals as defined [here](https://www.notion.so/maticnetwork/State-of-Staking-03e983ed9cc6470a9e8aee47d51f0d14#a55fbd158b7d4aa89648a4e3b68ac716).

## Stake

If the slot is open, then the auction is started to interested validators:

- Where they will bid more than the last bid made for the slot.
- The process of participating in auction is outlined here:
    - Auction is automatically started once the slot is opened.
    - To start participating in auction, call `startAuction()`
    - This will lock your assets in Stack Manager.
    - If another potential validator stakes more than your stake, then locked tokens will be returned back to you.
    - Again, stake more to win the auction.
- At the end of the auction period, the highest bidder wins and becomes a Validator on the Polygon network.

:::note

Please keep your full node running if you are participating in the auction.

:::

The process of becoming a validator after the highest bidder wins the slot is outlined below:

- Call `confirmAuction()` to confirm your participation.
- Bridge on Heimdall listens to this event and broadcasts to Heimdall.
- After consensus, validator is added to Heimdall but not activated.
- Validator starts validating only after `startEpoch` (defined [here](https://www.notion.so/maticnetwork/State-of-Staking-03e983ed9cc6470a9e8aee47d51f0d14#c1c3456813dd4b5caade4ed550f81187)).
- As soon as `startEpoch` reaches, the validator is added to `validator-set` and starts participating in the consensus mechanism.

:::info Recommended

To ensure security for validators stake, we recommend validators to provide different `signer` address from which verification of `checkPoint` sigs will be handled. This is to keep signing key separate from validator's wallet key so that funds are protected in case of a node hack.

:::

### UnStake

Unstaking allows validator to be out of the active pool of validators. In order to ensure **Good Participation**, their stake is locked for the next 21 days.

When validators want to exit from the network and stop validating blocks and submitting checkpoints, they can `unstake`. This action is immediate as of now. After this action, validator is considered out from the active set of validators.

### ReStake

Validators can also add more stake into their amount in order to earn more rewards and be competitive for their validator spot and maintain their position.

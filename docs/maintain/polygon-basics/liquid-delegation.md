---
id: liquid-delegation
title: Liquid Delegation
sidebar_label: Liquid Delegation
description: How Polygon uses liquid delegation to maintain the network.
keywords:
  - docs
  - polygon
  - matic
  - delegation
  - liquid delegation
slug: liquid-delegation
image: https://wiki.polygon.technology/img/polygon-logo.png
---

In a traditional Proof of Stake mechanism, the blockchain keeps track of a set of validators. Anyone can join this rank or right to validate transactions by sending a special type of transaction which stakes their coins(in Ethereum's case, ETH) and locks up into a deposit. Afterwards, the process of creating and agreeing to new blocks is done through a consensus algorithm by all active validators.

They lock up part of their stake for a certain amount of time (like a security deposit), and in return they get a chance proportional to that stake to select the next block.

Staking rewards are distributed as an incentive to the participants.

## Delegation

Staking may be expensive, raising the barrier to entry, which favours the rich getting richer. Everyone should take part in network security and receive tokens of appreciation. The only other option is to join a staking pool similar to a mining pool, where validators must be trusted. We believe that sticking to the protocol is the best course of action for new delegators. Since capital and rewards are open and protected by in-protocol mechanisms.

Delegators can take part in validation even though they don't host entire nodes. However, by staking with validators, they can increase the network's strength and gain rewards by paying a tiny commission charge (which varies depending on the validator) to the validator of their choice.

## Limitation of Traditional Delegator and Validator

Capital lockup cost for both validators and delegators is high due to Proof of Stake protocol design.

Still we can bring more liquidity view mechanism like validator NFT where any new party who wants to become a validator can buy validator NFT from a validator who wants to exit from system for some reason.

In case of delegators the amount locked is assumed to be in smaller chunks so we want that to be liquid so that participation is more active (i.e. if some delegator thinks that right now opportunities are great in DeFi but their capital is locked in staking pool even for withdrawal, they still need to wait for 21 days).

Also, locking up X ETH in a deposit is not free; it entails a sacrifice of optionality for the ETH holder. Right now, if you have 1000 ETH, you can do whatever you want with it. If you lock it up in a deposit, then it's stuck there for months in order to prevent attacks like [**nothing at stake**](https://github.com/ethereum/wiki/wiki/Proof-of-Stake-FAQ#what-is-the-nothing-at-stake-problem-and-how-can-it-be-fixed) and punish validators for their bad participation.

## In-Protocol vs Application Layer

Application-level staking liquidation has trust problem. Protocol-level staking liquidation is much more appreciated due to the fact that any new actor can trust it (which attracts more capital, even from smaller actors / delegators).

## Polygon's Solution for Delegation

While exploring delegation, we realised that delegation needs to be in-protocol in order to have more trust from delegators.

We were facing similar issue to validators capital liquidity and thought of making it a NFT which can be transfers and exploring on similar thoughts like how it can be made more liquid and sikka-chorus.one 's   [awesome design](https://blog.chorus.one/delegation-vouchers/) came to attention.

Thinking in terms of making is share of validator pool is great idea and since Polygon's staking is implemented on Ethereum smart contract it opens up a lot more options for us like making it ERC20 compatible so that it can be used in defi protocols.

As of now each validator has their own VMatic (i.e. for validator Ashish there will be AMatic token) because each validator has different performance (rewards and commission rate). Delegators can buy multiple validator share and hedge their risk towards poor performance of particular validator.

## Advantages

- Since our design follows ERC20 like interface in delegation implementation, DeFi applications can be easily built on top of it.
- Delegated tokens can be used in lending protocols.
- Delegators can hedge their risk via prediction markets like Auger.

Future scope:

- Currently ERC20 are not fungible with other validators ERC20 / Share tokens but in future we think many new DeFi applications can build upon it and make some markets for it or even some better products.
- With [chorus.one](http://chorus.one) initiated research, we are also exploring problems like validators shorting their own tokens and other problems (shorting problems can be avoided via things like validator locking their own stake for X months and other things like validator insurance (on-chain) which will bring more trust for delegators).
- Delegator voting rights in order to participate in governance decisions.
- While making delegation liquid, we also want to ensure network security. That's why, in some form, slash-able capital is locked in case of fraud activity.

Given above design available in-protocol, validators can always implement their own similar mechanisms and stake via a contract which won't be available in Polygon Staking UI.

## Future Goals

Things like interchain / cross-chain via Cosmos hub and Everett B-harvest design.

## Resources

- [Vitalik's pos design](https://medium.com/@VitalikButerin/a-proof-of-stake-design-philosophy-506585978d51)
- [Intro to Staking Derivatives](https://medium.com/lemniscap/an-intro-to-staking-derivatives-i-a43054efd51c)
- [Staking Pools](https://slideslive.com/38920085/ethereum-20-trustless-staking-pools)
- [Inflation in Proof of Stake](https://medium.com/figment-networks/mis-understanding-yield-and-inflation-in-proof-of-stake-networks-6fea7e7c0e41)

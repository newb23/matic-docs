---
id: supernet-manager-interface
title: SupernetManager
sidebar_label: SupernetManager
description: "Learn about the access control module and how to allowlist validators."
keywords:
  - docs
  - polygon
  - edge
  - consensus
  - interface
---

The `SupernetManager` contract is an abstract contract for managing Supernets. It serves as a base contract that should be implemented with custom desired functionality.

## Functions

### onInit()

```solidity
function onInit(uint256 id) external;
```

This function is called when a new childchain is registered. It allows the implementing contract to perform initialization logic when a new child chain is added to the Supernet.

#### Parameters:

`id`: The ID of the newly registered child chain.

### onStake()

```solidity
function onStake(address validator, uint256 amount) external;
```

This function is called when a validator stakes. It allows the implementing contract to perform additional logic when a validator stakes for a child chain in the supernet.

### Parameters:

- `validator`: The address of the validator who stakes.
- `amount`: The amount of stake being staked by the validator.

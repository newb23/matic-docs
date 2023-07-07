---
id: archive-node
title: How to Setup an Archive PoS Node
sidebar_label: Run an Archive Node
description: Using binaries or ansible to set up an archive node.
keywords:
  - erigon
  - archive
  - node
  - binary
  - polygon
  - docs
image: https://wiki.polygon.technology/img/polygon-wiki.png
---

import useBaseUrl from '@docusaurus/useBaseUrl';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## System Requirements

- 16-core CPU
- 64 GB RAM
- Basically io1 or above with at least 20k+ iops and RAID-0 based disk structure

## Configuration

<Tabs
defaultValue="binaries"
values={[
{ label: 'Binaries', value: 'binaries', },
{ label: 'Ansible', value: 'ansible', },
{ label: 'Erigon Client', value: 'erigon', },
]
}>

<!-- ===================================================================================================================== -->
<!-- ===================================================== BINARIES ====================================================== -->
<!-- ===================================================================================================================== -->

<TabItem value="binaries">

To setup the Archive Node, you need to follow the same process for deploying a [full node using binaries](full-node-deployment.md).

However, it requires a minor configuration change. You should include the following parameter in the `start.sh` file:

```makefile
--gcmode 'archive'
```

</TabItem>

<!-- ===================================================================================================================== -->
<!-- ===================================================== ANSIBLE ======================================================= -->
<!-- ===================================================================================================================== -->

<TabItem value="ansible">

To setup an archive node using Ansible, you need to follow the same process for deploying a [full node with Ansible](/operate/full-node-deployment.md).

However, it requires a minor configuration change. You should include the following parameter in the `start.sh` file:

```makefile
--gcmode 'archive'
```

</TabItem>

<!-- ===================================================================================================================== -->
<!-- ===================================================== ANSIBLE ======================================================= -->
<!-- ===================================================================================================================== -->

<TabItem value="erigon">

## System Requirements

- For an Archive node of Polygon Mainnet: 8TB
- For an Archive node of Mumbai Testnet: 1TB
- SSD or NVMe. Bear in mind that SSD performance deteriorates when close to capacity
- RAM: >= 32GB, 64-bit architecture
- Golang version >= 1.18, GCC 10+ 

:::note HDD not recommended

On HDDs, Erigon will always stay N blocks behind the chain tip, but will not fall behind. 

:::

## Install Erigon Client

Run the following commands to install Erigon:

```bash
git clone --recurse-submodules -j8 https://github.com/maticnetwork/erigon.git
cd erigon
git checkout v0.0.8
make erigon
```

This should create the binary at `./build/bin/erigon`

Use the tag `v0.0.8` on our forked repo to have a stable version. 

## Start Erigon Client

To start Erigon, run:

```bash
erigon --chain=mumbai
```

- Use `chain=mumbai` for Mumbai testnet
- Use `chain=bor-mainnet` for Polygon Mainnet

## Configure Erigon Client

- If you want to store Erigon files in a non-default location, use `-datadir`
    
    ```
    erigon --chain=mumbai --datadir=<your_data_dir>
    ```
    
- If you are not using local **heimdall**, use `-bor.heimdall=<your heimdall url>`. By default, it will try to connect to `localhost:1317`.
    
    ```makefile
    erigon --chain=mumbai --bor.heimdall=<your heimdall url> --datadir=<your_data_dir>
    ```
    
    - If you want to connect to Polygon Mumbai Testnet use: [https://heimdall-api-testnet.polygon.technology](https://heimdall-api-testnet.polygon.technology)
    
    - For Polygon Mainnet: [https://heimdall-api.polygon.technology](https://heimdall-api.polygon.technology)

**Note:** Remote heimdall is not recommended for production use, Only use it for testing purposes.

## Tips for Faster Sync

- Use the machine with high IOPS and RAM for the faster initial sync
- Memory optimized nodes are recommended for faster sync, For example, AWS EC2 `r5` or `r6` series instances.

</TabItem>
</Tabs>

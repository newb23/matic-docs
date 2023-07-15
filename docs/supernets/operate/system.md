---
id: supernets-requirements
title: System Requirements
sidebar_label: System Requirements
description: "System requirements to successfully run Supernets on a local or remote machine."
keywords:
  - docs
  - polygon
  - edge
  - install
  - installation
---

## Minimum Hardware Configuration

:::tip Hardware environment tips

While we do not favor any operating system, more secure and stable Linux server distributions (like CentOS) should be preferred over desktop operating systems (like Mac OS and Windows).

The minimum storage requirements will change over time as the network grows. It is recommended to use more than the minimum requirements to run a robust full node.

:::

This is the minimum hardware configuration required to set up a Supernet:

| Component | Minimum Requirement | Recommended |
| --------- | ------------------- | ----------- |
| Processor | 4-core CPU | 8-core CPU |
| Memory | 8 GB RAM | 16 GB RAM |
| Storage | 200 GB SSD | 1 TB SSD |
| Network | High-speed internet connection | Dedicated server with gigabit connection |

> Note that these minimum requirements are based on the x2iezn.2xlarge instance type used in the [performance tests](/docs/supernets/operate/performance.md), which demonstrated satisfactory performance. However, for better performance and higher transaction throughput, consider using more powerful hardware configurations, such as those equivalent to x2iezn.4xlarge or x2iezn.8xlarge instance types.

## Prerequisites

Before starting any of the tutorials, you should understand the basics of blockchain technology and be familiar with command-line interfaces. It would help if you also had the `polygon-edge` binary installed on your machine. Check out the [installation guide](/docs/supernets/operate/supernets-install) for more information if you haven't already.

Ensure you have the following system prerequisites:

| Prerequisite | Description |
| --- | --- |
| Golang (v1.15-1.19) | Install Go using CLI or package manager like [Snapcraft](https://snapcraft.io/go) for Linux, [Homebrew](https://formulae.brew.sh/formula/go) for Mac, or [Chocolatey](https://community.chocolatey.org/packages/golang) for Windows. Compatibility for other versions coming soon. |
| Docker | Required to run the geth instance. Follow [official Docker documentation](https://www.docker.com/) for installation instructions. |
| Internet connection | Stable internet connection required. |
| Network security | Ensure that network ports used by Polygon Edge are not blocked by firewalls or other security measures. |
| Operating system | Ensure that the latest security patches and updates are installed. |

:::caution Solidity v0.8.19 or earlier recommended

[<ins>Solidity v0.8.20</ins>](https://blog.soliditylang.org/2023/05/10/solidity-0.8.20-release-announcement/) introduces new features, including the implementation of `PUSH0` opcode, which is not yet supported in Supernets. If you decide to use v0.8.20, ensure that you set your EVM version to "Paris" in the framework you use to deploy your contracts. 

For now, we recommend using Solidity v0.8.19 or earlier.

:::

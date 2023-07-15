---
id: supernets-install
title: Installation
sidebar_label: Install Binaries
description: "Steps on how to install the Supernet binaries."
keywords:
  - docs
  - polygon
  - edge
  - install
  - installation
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DownloadButton from '@site/src/data/DownloadButton';

:::tip

We recommend using the pre-built releases and verifying the provided checksums for security.

The Docker image is also a convenient option for containerized deployment. Building from source provides greater flexibility, but requires a [suitable development environment](/docs/supernets/operate/system.md).

:::

<!-- ===================================================================================================================== -->
<!-- ===================================================================================================================== -->
<!-- ===================================================== GUIDE TABS ==================================================== -->
<!-- ===================================================================================================================== -->
<!-- ===================================================================================================================== -->

<Tabs
defaultValue="pre-built"
values={[
{ label: 'Pre-built releases', value: 'pre-built', },
{ label: 'Docker image', value: 'docker', },
{ label: 'Build from source', value: 'source', },
]
}>

<!-- ===================================================================================================================== -->
<!-- ================================================ PRE-BUILT RELEASE ================================================== -->
<!-- ===================================================================================================================== -->

<TabItem value="pre-built">

To access the pre-built releases, visit the [GitHub releases page](https://github.com/0xPolygon/polygon-edge/releases). The client provides cross-compiled AMD64/ARM64 binaries for Darwin and Linux.

:::info Latest release: 1.0.0

**The latest stable test release is [<ins>v1.0.0</ins>](https://github.com/0xPolygon/polygon-edge/releases/tag/v1.0.0).**

:::

</TabItem>

<!-- ===================================================================================================================== -->
<!-- ================================================ PRE-BUILT RELEASE ================================================== -->
<!-- ===================================================================================================================== -->

<TabItem value="docker">

To use Docker, you will need to have it installed on your system. If you haven't already installed Docker, you can follow the instructions on the
[official Docker website](https://www.docker.com/) for your operating system.

You can access the official Polygon Edge Docker images hosted under the [0xpolygon registry](https://hub.docker.com/r/0xpolygon/polygon-edge) using the following command:

  ```bash
  docker pull 0xpolygon/polygon-edge:latest
  ```

</TabItem>

<!-- ===================================================================================================================== -->
<!-- ====================================================== SOURCE ======================================================= -->
<!-- ===================================================================================================================== -->

<TabItem value="source">

> Before getting started, ensure you have [Go](https://go.dev/) installed on your system (version >= 1.15 and <= 1.19).
> Compatibility is being worked on for other versions and will be available in the near future.

> To install Go, run the following command in your CLI (we are using 1.18 in this example): `sudo apt-get install golang-1.18`.
> Or, use a package manager like [Snapcraft](https://snapcraft.io/go) for Linux, [Homebrew](https://formulae.brew.sh/formula/go) for Mac, and [Chocolatey](https://community.chocolatey.org/packages/golang) for Windows.

Use the following commands to clone the Polygon Edge repository and build from source:

  ```bash
  git clone https://github.com/0xPolygon/polygon-edge.git
  cd polygon-edge/
  go build -o polygon-edge .
  ```
</TabItem>
</Tabs>

---
id: run-validator
title: How to Run a Validator Node
sidebar_label: Run a Validator Node
description: Use the package to set up your validator node on the Polygon Network.
keywords:
  - docs
  - polygon wiki
  - polygon
  - binary
  - node
  - validator
  - sentry
---

import useBaseUrl from '@docusaurus/useBaseUrl';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

This guide will walk you through running a Polygon validator node from packages.

For system requirements,
follow the [Validator Node System Requirements](validator-node-system-requirements.md) guide.

:::tip Snapshots
Steps in this guide involve waiting for the **Heimdall** and **Bor** services to fully sync.
This process takes several days to complete. Alternatively, you can use a maintained snapshot, which will reduce the sync time to a few hours. For detailed instructions, see [<ins>Snapshot Instructions for Heimdall and Bor</ins>](/pos/reference/snapshot-instructions-heimdall-bor.md).

For snapshot download links, see [<ins>Polygon Chains Snapshots</ins>](https://snapshot.polygon.technology/).
:::

<details>
<summary>Port Configuration Details</summary>

Here are a few instructions on how to configure ports for Sentry and Validator nodes.

## For Sentry nodes
- **Port 22**: Opening this to the public is not a good idea as the default SSH port 22 is prone to attacks. It is better to secure it by allowing it only in a closed network (VPN).
- **Port 30303**: To be opened to the public for Bor p2p discovery.
- **Port 26656**: To be opened to the public for Heimdall/Tendermint p2p discovery.
- **Port 26660**: Prometheus port for Tendermint/Heimdall. Not required to be opened to the public. Only allow for the monitoring systems (Prometheus/Datadog).
- **Port 7071**: Metric port for Bor. Only needs to be opened for the Monitoring system.
- **Ports 8545, 8546, 1317**: Can be opened for Bor HTTP RPC, Bor WS RPC, and Heimdall API respectively; but only if really necessary.

## For Validator nodes
- **Port 22**: Opening this to the public is not a good idea as the default SSH port 22 is prone to attacks. It is better to secure it by allowing it only in a closed network (VPN).
- **Port 30303**: To be opened to only Sentry to which the validator is connected for Bor p2p discovery.
- **Port 26656**: To be opened to only Sentry to which the validator is connected for Heimdall/Tendermint p2p discovery.
- **Port 26660**: Prometheus port for Tendermint/Heimdall. Not required to be opened to the public. Only allow for the monitoring systems (Prometheus/Datadog).
- **Port 7071**: Metric port for Bor. Only needs to be opened for the monitoring system.

</details>

<Tabs
defaultValue="binaries"
values={[
{ label: 'Binaries', value: 'binaries', },
{ label: 'Ansible', value: 'ansible', },
{ label: 'Packages', value: 'package', },
]
}>

<!-- ===================================================================================================================== -->
<!-- ===================================================== BINARIES ====================================================== -->
<!-- ===================================================================================================================== -->

<TabItem value="binaries">

This guide will walk you through running a Polygon validator node from binaries.

For system requirements, follow the [Validator Node System Requirements](validator-node-system-requirements.md) guide.

:::caution

There is limited space for accepting new validators. New validators can only join the active set when an already active validator unbonds.

:::

## Prerequisites

* Two machines — one [sentry](/maintain/glossary.md#sentry) and one [validator](/maintain/glossary.md#validator).
* `build-essential` installed on both the sentry and the validator machines.

  To install:

  ```sh
  sudo apt-get install build-essential
  ```

* Go 1.19 installed on both the sentry and the validator machines.

  To install:

  ```sh
  wget https://raw.githubusercontent.com/maticnetwork/node-ansible/master/go-install.sh
  bash go-install.sh
  sudo ln -nfs ~/.go/bin/go /usr/bin/go
  ```

* RabbitMQ installed on both the sentry and the validator machines.

  Here are the commands to install RabbitMQ:

  ```sh
  sudo apt-get update
  sudo apt install build-essential
  sudo apt install erlang
  wget https://github.com/rabbitmq/rabbitmq-server/releases/download/v3.10.8/rabbitmq-server_3.10.8-1_all.deb
  sudo dpkg -i rabbitmq-server_3.10.8-1_all.deb

  ```
  :::tip

  Check more information about downloading and installing RabbitMQ [<ins>here</ins>](https://www.rabbitmq.com/download.html).

  :::


:::info
Please follow the steps on [<ins>bloXroute instructions</ins>](/maintain/validate/bloxroute.md) to connect your nodes to the bloXroute gateways.
:::

## Overview

To get to a running validator node, conduct the following in this **exact sequence of steps**:

:::caution

You will run into configuration issues if these steps are performed out of sequence.
It is important to keep in mind that a sentry node must always be set up before the validator node.

:::

1. Prepare two machines, one for the sentry node and one for the validator node.
2. Install the Heimdall and Bor binaries on the sentry and validator machines.
3. Set up the Heimdall and Bor service files on the sentry and validator machines.
4. Set up the Heimdall and Bor services on the sentry and validator machines.
5. Configure the sentry node.
6. Start the sentry node.
7. Configure the validator node.
8. Set the owner and signer keys.
9. Start the validator node.
10. Check node health with the community.

## Installing the Binaries

Install the binaries for both on the sentry and validator machines.

### Installing Heimdall

[Heimdall](/pos/design/heimdall/overview) is the Proof-of-Stake verifier layer
responsible for checkpointing the representation of blocks to the Ethereum mainnet.

The latest version, [Heimdall v0.3.4](https://github.com/maticnetwork/heimdall/releases/tag/v0.3.4), contains a few enhancements such as:
1. Restricting data size in state sync txs to:
    * **30Kb** when represented in **bytes**
    * **60Kb** when represented as **string**.
2. Increasing the **delay time** between the contract events of different validators to ensure that the mempool doesn't get filled very quickly in case of a burst of events which can hamper the progress of the chain.

The following example shows how the data size is restricted:

```
Data - "abcd1234"
Length in string format - 8
Hex Byte representation - [171 205 18 52]
Length in byte format - 4
```

Clone the [Heimdall repository](https://github.com/maticnetwork/heimdall/):

```sh
git clone https://github.com/maticnetwork/heimdall
```

Navigate to the correct [release version](https://github.com/maticnetwork/heimdall/releases):

```sh
git checkout RELEASE_TAG
```

where `RELEASE_TAG` is the tag of the release version that you install.

For instance:

```sh
git checkout v0.3.4
```

Once you are on the correct release, install Heimdall:

```sh
make install
source ~/.profile
```

Check the Heimdall installation:

```sh
heimdalld version --long
```

:::note

Before proceeding, Heimdall should be installed on both the sentry and validator machines.

:::

### Installing Bor

[Bor](/pos/design/bor) is the blockchain operator that acts as the block production layer, which syncs with Heimdall to select block producers and verifiers for each [span](/maintain/glossary.md#span) and [sprint](/maintain/glossary.md#sprint).

Clone the [Bor repository](https://github.com/maticnetwork/bor):

```sh
git clone https://github.com/maticnetwork/bor
```

Navigate to the correct [release version](https://github.com/maticnetwork/bor/releases):

```sh
git checkout RELEASE_TAG
```

where `RELEASE_TAG` is the tag of the release version that you install.

For instance:

```sh
git checkout v0.4.0
```

Install Bor:

```sh
make bor-all
```

Create symlinks:

```sh
sudo ln -nfs ~/bor/build/bin/bor /usr/bin/bor
sudo ln -nfs ~/bor/build/bin/bootnode /usr/bin/bootnode
```

Check the Bor installation:

```sh
bor version
```

:::note

Before proceeding, Bor should be installed on both the sentry and validator machines.

:::

## Setting Up Node Files

:::note

Node files need to be set up on both the sentry and validator machines.

:::

### Fetching the launch repository

Clone the [launch repository](https://github.com/maticnetwork/launch):

```sh
git clone https://github.com/maticnetwork/launch
```

### Setting up the launch directory

#### On the sentry machine

Create a `node` directory:

```sh
mkdir -p node
```

Copy the files and scripts from the `launch` directory to the `node` directory:

```sh
cp -rf launch/mainnet-v1/sentry/sentry ~/node
cp launch/mainnet-v1/service.sh ~/node
```

#### On the validator machine

Create a `node` directory:

```sh
mkdir -p node
```

Copy the files and scripts from the `launch` directory to the `node` directory:

```sh
cp -rf launch/mainnet-v1/sentry/validator ~/node
cp launch/mainnet-v1/service.sh ~/node
```

### Setting up the network directories

:::note

Run this section both on the sentry and validator machines.

:::

#### Setting up Heimdall

Change to the `node` directory:

```sh
cd ~/node/heimdall
```

Run the setup script:

```sh
bash setup.sh
```

#### Setting up Bor

Change to the `node` directory:

```sh
cd ~/node/bor
```

Run the setup script:

```sh
bash setup.sh
```

## Setting Up the Services

:::note

Run this section both on the sentry and validator machines.

:::

Navigate to the `node` directory:

```sh
cd ~/node
```

Run the setup script:

```sh
bash service.sh
```

Copy the service file to the system directory:

```sh
sudo cp *.service /etc/systemd/system/
```

## Configuring the Sentry Node

Start by logging in to the remote sentry machine.

### Configuring the Heimdall services

Open the Heimdall configuration file for editing:

```sh
vi ~/.heimdalld/config/config.toml
```

In `config.toml`, change the following parameters:

* `moniker` — any name. Example: `moniker = "my-sentry-node"`.
* `seeds` — the seed node addresses consisting of a node ID, an IP address, and a port.

  Use the following values:

  ```toml
  seeds="f4f605d60b8ffaaf15240564e58a81103510631c@159.203.9.164:26656,4fb1bc820088764a564d4f66bba1963d47d82329@44.232.55.71:26656,2eadba4be3ce47ac8db0a3538cb923b57b41c927@35.199.4.13:26656,3b23b20017a6f348d329c102ddc0088f0a10a444@35.221.13.28:26656,25f5f65a09c56e9f1d2d90618aa70cd358aa68da@35.230.116.151:26656"
  ```

* `pex` — set the value to `true` to enable the peer exchange. Example: `pex = true`.
* `private_peer_ids` — the node ID of Heimdall set up on the validator machine.

  To get the node ID of Heimdall on the validator machine:

  1. Log in to the validator machine.
  2. Run:
     ```sh
     heimdalld tendermint show-node-id
     ```

  Example: `private_peer_ids = "0ee1de0515f577700a6a4b6ad882eff1eb15f066"`.

* `prometheus` — set the value to `true` to enable the Prometheus metrics. Example: `prometheus = true`.
* `max_open_connections` — set the value to `100`. Example: `max_open_connections = 100`.

Save the changes in `config.toml`.

### Configuring the Bor Service

Open the Bor configuration file for editing:

```sh
`vi ~/node/bor/start.sh`
```

In `start.sh`, add the boot node addresses consisting of a node ID, an IP address, and a port
by adding the following line at the end of the file:

```config
--bootnodes "enode://0cb82b395094ee4a2915e9714894627de9ed8498fb881cec6db7c65e8b9a5bd7f2f25cc84e71e89d0947e51c76e85d0847de848c7782b13c0255247a6758178c@44.232.55.71:30303,enode://88116f4295f5a31538ae409e4d44ad40d22e44ee9342869e7d68bdec55b0f83c1530355ce8b41fbec0928a7d75a5745d528450d30aec92066ab6ba1ee351d710@159.203.9.164:30303,enode://3178257cd1e1ab8f95eeb7cc45e28b6047a0432b2f9412cff1db9bb31426eac30edeb81fedc30b7cd3059f0902b5350f75d1b376d2c632e1b375af0553813e6f@35.221.13.28:30303,enode://16d9a28eadbd247a09ff53b7b1f22231f6deaf10b86d4b23924023aea49bfdd51465b36d79d29be46a5497a96151a1a1ea448f8a8666266284e004306b2afb6e@35.199.4.13:30303,enode://ef271e1c28382daa6ac2d1006dd1924356cfd843dbe88a7397d53396e0741ca1a8da0a113913dee52d9071f0ad8d39e3ce87aa81ebc190776432ee7ddc9d9470@35.230.116.151:30303"
```

Save the changes in `start.sh`.

### Configuring a firewall

The sentry machine must have the following ports open to the world `0.0.0.0/0`:

* `26656`- Your Heimdall service will connect your node to other nodes Heimdall service.

* `30303`- Your Bor service will connect your node to other nodes Bor service.

* `22` - Open this port if your node is servicing validators. You will likely want to restrict what traffic can access this port as it is a sensitive port.

## Starting the Sentry Node

You will first start the Heimdall service. Once the Heimdall service syncs, you will start the Bor service.

:::note

As mentioned earlier, the Heimdall service takes several days to sync from scratch fully.

Alternatively, you can use a maintained snapshot, which will reduce the sync time to a few hours.
For detailed instructions, see [<ins>Snapshot Instructions for Heimdall and Bor</ins>](https://forum.polygon.technology/t/snapshot-instructions-for-heimdall-and-bor/9233).

For snapshot download links, see [Polygon Chains Snapshots](https://snapshot.polygon.technology/).

:::

### Starting the Heimdall service

Start the Heimdall service:

```sh
sudo service heimdalld start
```

Start the Heimdall rest-server:

```sh
sudo service heimdalld-rest-server start
```

Check the Heimdall service logs:

```sh
journalctl -u heimdalld.service -f
```

:::note

In the logs, you may see the following errors:

* `Stopping peer for error`
* `MConnection flush failed`
* `use of closed network connection`

These logs mean that one of the nodes on the network refused a connection to your node.
Wait for your node to crawl more nodes on the network; you do not need to do anything
to address these errors.

:::

Check the Heimdall rest-server logs:

```sh
journalctl -u heimdalld-rest-server.service -f
```

Check the sync status of Heimdall:

```sh
curl localhost:26657/status
```

In the output, the `catching_up` value is:

* `true` — the Heimdall service is syncing.
* `false` — the Heimdall service is fully synced.

Wait for the Heimdall service to sync fully.

### Starting the Bor service

Once the Heimdall service syncs, start the Bor service.

Start the Bor service:

```sh
sudo service bor start
```

Check the Bor service logs:

```sh
journalctl -u bor.service -f
```

## Configuring the Validator Node

:::note

To complete this section, you must have an RPC endpoint of your fully synced Ethereum mainnet
node ready.

:::

### Configuring the Heimdall service

Log in to the remote validator machine.

Open for editing `vi ~/.heimdalld/config/config.toml`.

In `config.toml`, change the following:

* `moniker` — any name. Example: `moniker = "my-validator-node"`.
* `pex` — set the value to `false` to disable the peer exchange. Example: `pex = false`.
* `private_peer_ids` — comment out the value to disable it. Example: `# private_peer_ids = ""`.

  To get the node ID of Heimdall on the sentry machine:

  1. Log in to the sentry machine.
  1. Run `heimdalld tendermint show-node-id`.

Example: `persistent_peers = "sentry_machineNodeID@sentry_instance_ip:26656"`

* `prometheus` — set the value to `true` to enable the Prometheus metrics. Example: `prometheus = true`.

Save the changes in `config.toml`.

Open for editing `vi ~/.heimdalld/config/heimdall-config.toml`.

In `heimdall-config.toml`, change the following:

* `eth_rpc_url` — an RPC endpoint for a fully synced Ethereum mainnet node,
  i.e Infura. `eth_rpc_url =<insert Infura or any full node RPC URL to Ethereum>`

Example: `eth_rpc_url = "https://nd-123-456-789.p2pify.com/60f2a23810ba11c827d3da642802412a"`

Save the changes in `heimdall-config.toml`.

### Configuring the Bor service

Open for editing `vi ~/.bor/data/bor/static-nodes.json`.

In `static-nodes.json`, change the following:

* `"<replace with enode://sentry_machine_enodeID@sentry_machine_ip:30303>"` — the node ID and
  IP address of Bor set up on the sentry machine.

  To get the node ID of Bor on the sentry machine:

  1. Log in to the sentry machine.
  2. Run `bootnode -nodekey ~/.bor/data/bor/nodekey -writeaddress`.

  Example: `"enode://a8024075291c0dd3467f5af51a05d531f9e518d6cd229336156eb6545581859e8997a80bc679fdb7a3bd7473744c57eeb3411719b973b2d6c69eff9056c0578f@188.166.216.25:30303"`.

Save the changes in `static-nodes.json`.

## Setting the Owner and Signer Key

On Polygon, it is recommended that you keep the owner and signer keys different.

* Signer — the address that signs the checkpoint transactions. The recommendation is to keep at least 1 ETH on the signer address.
* Owner — the address that does the staking transactions. The recommendation is to keep the MATIC tokens on the owner address.

### Generating a Heimdall private key

You must generate a Heimdall private key only on the validator machine. Do not generate a Heimdall
private key on the sentry machine.

To generate the private key, run:

```sh
heimdallcli generate-validatorkey ETHEREUM_PRIVATE_KEY
```

where

* ETHEREUM_PRIVATE_KEY — your Ethereum wallet’s private key.

This will generate `priv_validator_key.json`. Move the generated JSON file to the Heimdall configuration
directory:

```sh
mv ./priv_validator_key.json ~/.heimdalld/config
```

### Generating a Bor keystore file

You must generate a Bor keystore file only on the validator machine. Do not generate a Bor keystore file
on the sentry machine.

To generate the private key, run:

```sh
heimdallcli generate-keystore ETHEREUM_PRIVATE_KEY
```

where

* ETHEREUM_PRIVATE_KEY — your Ethereum wallet’s private key.

When prompted, set up a password to the keystore file.

This will generate a `UTC-<time>-<address>` keystore file.

Move the generated keystore file to the Bor configuration directory:

```sh
mv ./UTC-<time>-<address> ~/.bor/keystore/
```

### Add password.txt

Make sure to create a `password.txt` file then add the Bor keystore file password right in the
`~/.bor/password.txt` file.

### Add your Ethereum address

Open for editing `vi /etc/matic/metadata`.

In `metadata`, add your Ethereum address. Example: `VALIDATOR_ADDRESS=0xca67a8D767e45056DC92384b488E9Af654d78DE2`.

Save the changes in `metadata`.

## Starting the Validator Node

At this point, you must have:

* The Heimdall service on the sentry machine syncs and is running.
* The Bor service on the sentry machine running.
* The Heimdall service and the Bor service on the validator machine configured.
* Your owner and signer keys configured.

### Starting the Heimdall service

You will now start the Heimdall service on the validator machine. Once the Heimdall service syncs, you
will start the Bor service on the validator machine.

Start the Heimdall service:

```sh
sudo service heimdalld start
```

Start the Heimdall rest-server:

```sh
sudo service heimdalld-rest-server start
```

Start the Heimdall bridge:

```sh
sudo service heimdalld-bridge start
```

Check the Heimdall service logs:

```sh
journalctl -u heimdalld.service -f
```

Check the Heimdall rest-server logs:

```sh
journalctl -u heimdalld-rest-server.service -f
```

Check the Heimdall bridge logs:

```sh
journalctl -u heimdalld-bridge.service -f
```

Check the sync status of Heimdall:

```sh
curl localhost:26657/status
```

In the output, the `catching_up` value is:

* `true` — the Heimdall service is syncing.
* `false` — the Heimdall service is synced.

Wait for the Heimdall service to fully sync.

### Starting the Bor service

Once the Heimdall service on the validator machine syncs, start the Bor service on
the validator machine.

Start the Bor service:

```sh
sudo service bor start
```

Check the Bor service logs:

```sh
journalctl -u bor.service -f
```

### Seed nodes and bootnodes

- Heimdall seed nodes:

  ```bash
  moniker=<enter unique identifier>

  # Mainnet:
  seeds="2a53a15ffc70ad41b6876ecbe05c50a66af01e20@3.211.248.31:26656,6f829065789e5b156cbbf076f9d133b4d7725847@3.212.183.151:26656,7285a532bad665f051c0aadc31054e2e61ca2b3d@3.93.224.197:26656,0b431127d21c8970f1c353ab212be4f1ba86c3bf@184.73.124.158:26656,f4f605d60b8ffaaf15240564e58a81103510631c@159.203.9.164:26656,31b79cf4a628a4619e8e9ae95b72e4354c5a5d90@44.232.55.71:26656,a385dd467d11c4cdb0be8b51d7bfb0990f49abc3@35.199.4.13:26656,daad548c0a163faae1d8d58425f97207acf923fd@35.230.116.151:26656,81c76e82fcc3dc9a0a1554a3edaa09a632795ea8@35.221.13.28:26656"

  # Testnet:
  seeds="e72c0466a02ea43b2198bd3a9454b87a3ef0d77e@54.147.31.250:26656,b302d1ddb21102e794b524d05152a7834da05bd1@34.226.134.117:26656,9dfc12d9f39257cefc3d57a4d7302586e59a994e@18.213.200.99:26656"
  ```
- Bootnodes:

  ```bash
  # Mainnet:
  bootnode ["enode://0cb82b395094ee4a2915e9714894627de9ed8498fb881cec6db7c65e8b9a5bd7f2f25cc84e71e89d0947e51c76e85d0847de848c7782b13c0255247a6758178c@44.232.55.71:30303","enode://88116f4295f5a31538ae409e4d44ad40d22e44ee9342869e7d68bdec55b0f83c1530355ce8b41fbec0928a7d75a5745d528450d30aec92066ab6ba1ee351d710@159.203.9.164:30303","enode://4be7248c3a12c5f95d4ef5fff37f7c44ad1072fdb59701b2e5987c5f3846ef448ce7eabc941c5575b13db0fb016552c1fa5cca0dda1a8008cf6d63874c0f3eb7@3.93.224.197:30303","enode://32dd20eaf75513cf84ffc9940972ab17a62e88ea753b0780ea5eca9f40f9254064dacb99508337043d944c2a41b561a17deaad45c53ea0be02663e55e6a302b2@3.212.183.151:30303"]

  # Testnet:
  bootnodes ["enode://320553cda00dfc003f499a3ce9598029f364fbb3ed1222fdc20a94d97dcc4d8ba0cd0bfa996579dcc6d17a534741fb0a5da303a90579431259150de66b597251@54.147.31.250:30303","enode://f0f48a8781629f95ff02606081e6e43e4aebd503f3d07fc931fad7dd5ca1ba52bd849a6f6c3be0e375cf13c9ae04d859c4a9ae3546dc8ed4f10aa5dbb47d4998@34.226.134.117:30303"]
  ```


## Health Checks with the Community

Now that your sentry and validator nodes are in sync and running, head over to
[Discord](https://discord.com/invite/0xPolygon) and ask the community to health-check your nodes.

:::note

As validators, it’s mandatory to always have a check of the signer address. If the ETH balance reaches below 0.5 ETH then it should be refilled. Avoiding this will push out nodes from submitting checkpoint transactions.

:::

## Next Steps: Staking

Now that you have your sentry and validator nodes are health-checked, proceed to
the [Staking](/docs/pos/design/validator/core-components/staking.md) guide to start backing the network.

</TabItem>

<!-- ===================================================================================================================== -->
<!-- ===================================================== ANSIBLE ======================================================= -->
<!-- ===================================================================================================================== -->

<TabItem value="ansible">

This section guides you through starting and running the validator node through an Ansible playbook.

For the system requirements, see [Validator Node System Requirements](validator-node-system-requirements.md).

If you would like to start and run the validator node from binaries, see [Run a Validator Node from Binaries](run-validator-binaries.md).

:::caution

There is limited space for accepting new validators. New validators can only join the active set when an already active validator unbonds.

:::

## Prerequisites

* Three machines — one local machine on which you will run the Ansible playbook; two remote machines — one [sentry](/docs/maintain/glossary.md#sentry) and one [validator](/docs/maintain/glossary.md#validator).
* On the local machine, [Ansible](https://www.ansible.com/) installed.
* On the local machine, [Python 3.x](https://www.python.org/downloads/) installed.
* On the remote machines, make sure Go is *not* installed.
* On the remote machines, your local machine's SSH public key is on the remote machines to let Ansible connect to them.
* We have Bloxroute available as a relay network. If you need a gateway to be added as your Trusted Peer please contact **@validator-support-team** in [Polygon Discord](https://discord.com/invite/0xPolygon) > POS VALIDATORS | FULL NODE PROVIDERS | PARTNERS > bloxroute.

:::info

Please follow the steps on [<ins>bloXroute instructions</ins>](/maintain/validate/bloxroute.md) to connect your nodes to the bloXroute gateways.

:::

## Overview

:::caution

You must follow the **exact outlined sequence of actions**, otherwise you will run into issues.
For example, **a sentry node must always be set up before the validator node**.

:::

To get to a running validator node, do the following:

1. Have the three machines prepared.
1. Set up a sentry node through Ansible.
1. Set up a validator node through Ansible.
1. Configure the sentry node.
1. Start the sentry node.
1. Configure the validator node.
1. Set the owner and signer keys.
1. Start the validator node.
1. Check node health with the community.

## Set up the Sentry node

On your local machine, clone the [node-ansible repository](https://github.com/maticnetwork/node-ansible):

```sh
git clone https://github.com/maticnetwork/node-ansible
```

Change to the cloned repository:

```sh
cd node-ansible
```

Add the IP addresses of the remote machines that will become a sentry node and a validator node to the `inventory.yml` file.

```yml
all:
  hosts:
  children:
    sentry:
      hosts:
        xxx.xxx.xx.xx: # <----- Add IP for sentry node
        xxx.xxx.xx.xx: # <----- Add IP for second sentry node (optional)
    validator:
      hosts:
        xxx.xxx.xx.xx: # <----- Add IP for validator node
```

Example:

```yml
all:
  hosts:
  children:
    sentry:
      hosts:
        188.166.216.25:
    validator:
      hosts:
        134.209.100.175:
```

Check that the remote sentry machine is reachable. On the local machine, run:

```sh
$ ansible sentry -m ping
```

You should get this as output:

```sh
xxx.xxx.xx.xx | SUCCESS => {
    "ansible_facts": {
        "discovered_interpreter_python": "/usr/bin/python3"
    },
    "changed": false,
    "ping": "pong"
}
```

Do a test run of the sentry node setup:

```sh
ansible-playbook -l sentry playbooks/network.yml --extra-var="bor_version=v0.4.0 heimdall_version=v0.3.4  network_version=mainnet-v1 node_type=sentry/sentry heimdall_network=mainnet" --list-hosts
```

This will be the output:

```sh
playbook: playbooks/network.yml
  pattern: ['all']
  host (1):
    xx.xxx.x.xxx
```

Run the sentry node setup with sudo privileges:

```sh
ansible-playbook -l sentry playbooks/network.yml --extra-var="bor_version=v0.4.0 heimdall_version=v0.3.4  network_version=mainnet-v1 node_type=sentry/sentry heimdall_network=mainnet" --ask-become-pass
```

Once the setup is complete, you will see a message of completion on the terminal.

:::note

If you run into an issue and would like to start over, run:

```sh
ansible-playbook -l sentry playbooks/clean.yml
```

:::

## Set up the Validator node

At this point, you have the sentry node set up.

On your local machine, you also have the Ansible playbook set up to run the validator node setup.

Check that the remote validator machine is reachable. On the local machine, run `ansible validator -m ping`.

You should get this as output:

```sh
xxx.xxx.xx.xx | SUCCESS => {
    "ansible_facts": {
        "discovered_interpreter_python": "/usr/bin/python3"
    },
    "changed": false,
    "ping": "pong"
}
```

Do a test run of the validator node setup:

```sh
ansible-playbook -l validator playbooks/network.yml --extra-var="bor_version=v0.4.0 heimdall_version=v0.3.4 network_version=mainnet-v1 node_type=sentry/validator heimdall_network=mainnet" --list-hosts
```

You should get this as output:

```sh
playbook: playbooks/network.yml
  pattern: ['all']
  host (1):
    xx.xxx.x.xxx
```

Run the validator node setup with sudo privileges:

```sh
ansible-playbook -l validator playbooks/network.yml --extra-var="bor_version=v0.4.0 heimdall_version=v0.3.4  network_version=mainnet-v1 node_type=sentry/validator heimdall_network=mainnet" --ask-become-pass
```

Once the setup is complete, you will see a message of completion on the terminal.

:::note

If you run into an issue and would like to start over, run:

```sh
ansible-playbook -l validator playbooks/clean.yml
```

:::

## Configure the Sentry node

Log into the remote sentry machine.

### Configure the Heimdall Service

Open `config.toml` for editing `vi /var/lib/heimdall/config/config.toml`.

Change the following:

* `moniker` — any name. Example: `moniker = "my-full-node"`.
* `seeds` — the seed node addresses consisting of a node ID, an IP address, and a port.

  Should already have the following values:

  ```toml
  seeds="d3a8990f61bb3657da1664fe437d4993c4599a7e@3.211.248.31:26656,d3d7d397339c9126235dfab11bf925e269776f4f@3.212.183.151:26656,68254d33685fad151e45bfe1ed33d538ba6ec8cb@3.93.224.197:26656,d26c54ebbf274896f12977bb13d83ac1237a8226@184.73.124.158:26656,f4f605d60b8ffaaf15240564e58a81103510631c@159.203.9.164:26656,4fb1bc820088764a564d4f66bba1963d47d82329@44.232.55.71:26656,2eadba4be3ce47ac8db0a3538cb923b57b41c927@35.199.4.13:26656,25f5f65a09c56e9f1d2d90618aa70cd358aa68da@35.230.116.151:26656,3b23b20017a6f348d329c102ddc0088f0a10a444@35.221.13.28:26656"
  ```

* `pex` — set the value to `true` to enable the peer exchange. Example: `pex = true`.
* `private_peer_ids` — the node ID of Heimdall set up on the validator machine.

  To get the node ID of Heimdall on the validator machine:

  1. Log into the validator machine.
  1. Run `heimdalld tendermint show-node-id`.

  Example: `private_peer_ids = "0ee1de0515f577700a6a4b6ad882eff1eb15f066"`.

* `prometheus` — set the value to `true` to enable the Prometheus metrics. Example: `prometheus = true`.
* `max_open_connections` — set the value to `100`. Example: `max_open_connections = 100`.

Save the changes in `config.toml`.

### Configure the Bor Service

Open for editing `vi /var/lib/bor/config.toml`.

In `config.sh`, ensure the boot node addresses consisting of a node ID, an IP address, and a port by the bootnode paramater:

```config
bootnodes "enode://0cb82b395094ee4a2915e9714894627de9ed8498fb881cec6db7c65e8b9a5bd7f2f25cc84e71e89d0947e51c76e85d0847de848c7782b13c0255247a6758178c@44.232.55.71:30303,enode://88116f4295f5a31538ae409e4d44ad40d22e44ee9342869e7d68bdec55b0f83c1530355ce8b41fbec0928a7d75a5745d528450d30aec92066ab6ba1ee351d710@159.203.9.164:30303,enode://3178257cd1e1ab8f95eeb7cc45e28b6047a0432b2f9412cff1db9bb31426eac30edeb81fedc30b7cd3059f0902b5350f75d1b376d2c632e1b375af0553813e6f@35.221.13.28:30303,enode://16d9a28eadbd247a09ff53b7b1f22231f6deaf10b86d4b23924023aea49bfdd51465b36d79d29be46a5497a96151a1a1ea448f8a8666266284e004306b2afb6e@35.199.4.13:30303,enode://ef271e1c28382daa6ac2d1006dd1924356cfd843dbe88a7397d53396e0741ca1a8da0a113913dee52d9071f0ad8d39e3ce87aa81ebc190776432ee7ddc9d9470@35.230.116.151:30303"
```

Save the changes in `config.toml`.

Open for editing `vi /var/lib/bor/config.toml`.

In `config.toml`, ensure the `static-nodes` parameter has the following values:

* `"enode://validator_machine_enodeID@validator_machine_ip:30303"` — the node ID and IP address of Bor set up on the validator machine.

  To get the node ID of Bor on the validator machine:

  1. Log into the validator machine.
  1. Run `bor bootnode -node-key /var/lib/bor/data/bor/nodekey`, this command only works while bor is not running. If the ip address is `0.0.0.0` then replace it with external facing ip address

  Example: `"enode://410e359736bcd3a58181cf55d54d4e0bbd6db2939c5f548426be7d18b8fd755a0ceb730fe5cf7510c6fa6f0870e388277c5f4c717af66d53c440feedffb29b4b@134.209.100.175:30303"`.

Save the changes in `config.toml`.

### Configure firewall

The sentry machine must have the following ports open to the world `0.0.0.0/0`:

* `26656`- Your Heimdall service will connect your node to other nodes using the Heimdall service.

* `30303`- Your Bor service will connect your node to other nodes using the Bor service.

* `22`- Open this port if your node is servicing validators. You will likely want to restrict what traffic can access this port as it is a sensitive port.

:::note

However, if they use a VPN connection, they can allow incoming SSH connections only from the VPN IP address.

:::

## Start the sentry node

You will first start the Heimdall service. Once the Heimdall service syncs, you will start the Bor service.

:::note

The Heimdall service takes several days to fully sync from scratch.

Alternatively, you can use a maintained snapshot, which will reduce the sync time to a few hours. For detailed instructions, see [<ins>Snapshot Instructions for Heimdall and Bor</ins>](https://forum.polygon.technology/t/snapshot-instructions-for-heimdall-and-bor/9233).

For snapshot download links, see [Polygon Chains Snapshots](https://snapshot.polygon.technology/).

:::

### Start the Heimdall service

The latest version, [Heimdall v0.3.4](https://github.com/maticnetwork/heimdall/releases/tag/v0.3.4), contains a few enhancements such as:
1. Restricting data size in state sync txs to:
    * **30Kb** when represented in **bytes**
    * **60Kb** when represented as **string**.
2. Increasing the **delay time** between the contract events of different validators to ensure that the mempool doesn't get filled very quickly in case of a burst of events which can hamper the progress of the chain.

The following example shows how the data size is restricted:

```
Data - "abcd1234"
Length in string format - 8
Hex Byte representation - [171 205 18 52]
Length in byte format - 4
```

Start the Heimdall service:

```sh
sudo service heimdalld start
```

From v.0.3.0 the Heimdall rest-server is incorporated into Heimdall. Versions before v.0.3.0  will need to start the heimdall rest-server. Later versions can skip this action
Start the Heimdall rest-server:

```sh
sudo service heimdalld-rest-server start
```

Check the Heimdall service logs:

```sh
journalctl -u heimdalld.service -f
```

:::note

In the logs, you may see the following errors:

* `Stopping peer for error`
* `MConnection flush failed`
* `use of closed network connection`

These mean that one of the nodes on the network refused a connection to your node. You do not need to do anything with these errors. Wait for your node to crawl more nodes on the network.

:::

Check the Heimdall rest-server logs if your install is before v.0.3.0:

```sh
journalctl -u heimdalld-rest-server.service -f
```

Check the sync status of Heimdall:

```sh
curl localhost:26657/status
```

In the output, the `catching_up` value is:

* `true` — the Heimdall service is syncing.
* `false` — the Heimdall service is fully synced.

Wait for the Heimdall service to fully sync.

### Start the Bor Service

Once the Heimdall service is fully synced, start the Bor service.

Start the Bor service:

```sh
sudo service bor start
```

Check the Bor service logs:

```sh
journalctl -u bor.service -f
```

## Configure the validator node

:::note

To complete this section, you must have your own RPC endpoint of your own fully synced Ethereum mainnet node ready. The use of Infura and Alchemy is also sufficient and widely used among validators.

:::

### Configure the Heimdall Service

Log into the remote validator machine.

Open `config.toml` for editing `vi /var/lib/heimdall/config/config.toml`.

Change the following:

* `moniker` — any name. Example: `moniker = "my-validator-node"`.
* `pex` — set the value to `false` to disable the peer exchange. Example: `pex = false`.
* `private_peer_ids` — comment out the value to disable it. Example: `# private_peer_ids = ""`.


  To get the node ID of Heimdall on the sentry machine:

  1. Login to the sentry machine.
  1. Run `heimdalld tendermint show-node-id`.

  Example: `persistent_peers = "sentry_machineNodeID@sentry_instance_ip:26656"`

* `prometheus` — set the value to `true` to enable the Prometheus metrics. Example: `prometheus = true`.

Save the changes in `config.toml`.

Open for editing `vi /var/lib/heimdall/config/heimdall-config.toml`.

In `heimdall-config.toml`, change the following:

* `eth_rpc_url` — an RPC endpoint for a fully synced Ethereum mainnet node, i.e Infura. `eth_rpc_url =<insert Infura or any full node RPC URL to Ethereum>`

Example: `eth_rpc_url = "https://nd-123-456-789.p2pify.com/60f2a23810ba11c827d3da642802412a"`


Save the changes in `heimdall-config.toml`.

### Configure the Bor Service

Open for editing `vi /var/lib/bor/config.toml`.

In `config.toml`, ensure the trusted-nodes parameter has the following values:

* `"enode://sentry_machine_enodeID@sentry_machine_ip:30303"` — the node ID and IP address of Bor set up on the sentry machine.

  To get the node ID of Bor on the sentry machine:

  1. Log into the sentry machine.
  1. Run ```bor bootnode -node-key /var/lib/bor/data/bor/nodekey```, this command only works while Bor is not running. If the IP address is `0.0.0.0`, replace it with external facing IP address

  Example: `"enode://a8024075291c0dd3467f5af51a05d531f9e518d6cd229336156eb6545581859e8997a80bc679fdb7a3bd7473744c57eeb3411719b973b2d6c69eff9056c0578f@188.166.216.25:30303"`.

Save the changes in `config.toml` file.

## Set the owner and signer key

:::note

To complete this section, you must have already created two Ethereum wallets and have the private keys available as needed. One address will be used as the `Signer` and the other address as the `Owner`. Only the `Signer` address will be used in this section at the moment.

:::


On Polygon, you should keep the owner and signer keys different.

* Signer — the address that signs the [checkpoint transactions](../glossary#checkpoint-transaction). The recommendation is to keep at least 1 ETH on the signer address.
* Owner — the address that does the staking transactions. The recommendation is to keep the MATIC tokens on the owner address.

### Generate a Heimdall private key

You must generate a Heimdall private key only on the validator machine. **Do not generate a Heimdall private key on the sentry machine.**

To generate the private key, run:

```sh
heimdallcli generate-validatorkey ETHEREUM_PRIVATE_KEY
```

:::note

ETHEREUM_PRIVATE_KEY — your Ethereum wallet’s `Signer` private key

:::

This will generate `priv_validator_key.json`. Move the generated JSON file to the Heimdall configuration directory:

```sh
mv ./priv_validator_key.json /var/lib/heimdall/config/
```

### Generate a Bor keystore file

You must generate a Bor keystore file only on the validator machine. **Do not generate a Bor keystore file on the sentry machine.**

To generate the private key, run:

```sh
heimdallcli generate-keystore ETHEREUM_PRIVATE_KEY
```

:::note

ETHEREUM_PRIVATE_KEY — your Ethereum wallet’s `Signer` private key.

:::

When prompted, set up a password to the keystore file.

This will generate a `UTC-<time>-<address>` keystore file.

Move the generated keystore file to the Bor configuration directory:

```sh
mv ./UTC-<time>-<address> /var/lib/bor/data/keystore/
```

Ensure the `keystore` parameter in `/var/lib/bor/config.toml` matches the directory `/var/lib/bor/data/keystore/`

### Add `password.txt`

Make sure to create a `password.txt` file then add the Bor keystore file password right in the `/var/lib/bor/data/password.txt` file. Ensure that `password` parameter in `/var/lib/bor/config.toml` matches the location of the password file.

### Add your Ethereum address

Open for editing `vi /var/lib/bor/config.toml`.

In `[accounts]` section you should have paramater `password` already defined from previous step, now add your Ethereum address to `unlock` parameter and also ensure `allow-insecure-unlock` has a value of `true`.

Example: 

```sh
 [accounts]
    allow-insecure-unlock = true
    password = "/var/lib/bor/password.txt"
    unlock = ["0xca67a8D767e45056DC92384b488E9Af654d78DE2"]
```

Save the changes in `/var/lib/bor/config.toml`.

## Start the Validator node

At this point, you must have:

* The Heimdall service on the sentry machine fully synced and running.
* The Bor service on the sentry machine running.
* The Heimdall service and the Bor service on the validator machine configured.
* Your owner and signer keys configured.

### Start the Heimdall Service

You will now start the Heimdall service on the validator machine. Once the Heimdall service syncs, you will start the Bor service on the validator machine.

Start the Heimdall service:

```sh
sudo service heimdalld start
```

Start the Heimdall rest-server (Versions before v.0.3.0):

```sh
sudo service heimdalld-rest-server start
```

Start the Heimdall bridge (Versions before v.0.3.0):

```sh
sudo service heimdalld-bridge start
```

Check the Heimdall service logs:

```sh
journalctl -u heimdalld.service -f
```

Check the Heimdall rest-server logs (Versions before v.0.3.0):

```sh
journalctl -u heimdalld-rest-server.service -f
```

Check the Heimdall bridge logs (Versions before v.0.3.0):

```sh-
journalctl -u heimdalld-bridge.service -f
```

:::note

If your Heimdall version is after v.0.3.0 then the logs of heimdalld-rest-server and heimdalld-bridge are in the heimdalld service logs as these three were combined into one service from v.0.3.0.

:::


Check the sync status of Heimdall:

```sh
curl localhost:26657/status
```

In the output, the `catching_up` value is:

* `true` — the Heimdall service is syncing.
* `false` — the Heimdall service is fully synced.

Wait for the Heimdall service to fully sync.

### Start the Bor Service

Once the Heimdall service on the validator machine is fully synced, start the Bor service on the validator machine.

Start the Bor service:

```sh
sudo service bor start
```

Check the Bor service logs:

```sh
journalctl -u bor.service -f
```

### Seed nodes and bootnodes

- Heimdall seed nodes:

  ```bash
  moniker=<enter unique identifier>

  # Mainnet:
  seeds="2a53a15ffc70ad41b6876ecbe05c50a66af01e20@3.211.248.31:26656,6f829065789e5b156cbbf076f9d133b4d7725847@3.212.183.151:26656,7285a532bad665f051c0aadc31054e2e61ca2b3d@3.93.224.197:26656,0b431127d21c8970f1c353ab212be4f1ba86c3bf@184.73.124.158:26656,f4f605d60b8ffaaf15240564e58a81103510631c@159.203.9.164:26656,31b79cf4a628a4619e8e9ae95b72e4354c5a5d90@44.232.55.71:26656,a385dd467d11c4cdb0be8b51d7bfb0990f49abc3@35.199.4.13:26656,daad548c0a163faae1d8d58425f97207acf923fd@35.230.116.151:26656,81c76e82fcc3dc9a0a1554a3edaa09a632795ea8@35.221.13.28:26656"

  # Testnet:
  seeds="e72c0466a02ea43b2198bd3a9454b87a3ef0d77e@54.147.31.250:26656,b302d1ddb21102e794b524d05152a7834da05bd1@34.226.134.117:26656,9dfc12d9f39257cefc3d57a4d7302586e59a994e@18.213.200.99:26656"
  ```
- Bootnodes:

  ```bash
  # Mainnet:
  bootnode ["enode://0cb82b395094ee4a2915e9714894627de9ed8498fb881cec6db7c65e8b9a5bd7f2f25cc84e71e89d0947e51c76e85d0847de848c7782b13c0255247a6758178c@44.232.55.71:30303","enode://88116f4295f5a31538ae409e4d44ad40d22e44ee9342869e7d68bdec55b0f83c1530355ce8b41fbec0928a7d75a5745d528450d30aec92066ab6ba1ee351d710@159.203.9.164:30303","enode://4be7248c3a12c5f95d4ef5fff37f7c44ad1072fdb59701b2e5987c5f3846ef448ce7eabc941c5575b13db0fb016552c1fa5cca0dda1a8008cf6d63874c0f3eb7@3.93.224.197:30303","enode://32dd20eaf75513cf84ffc9940972ab17a62e88ea753b0780ea5eca9f40f9254064dacb99508337043d944c2a41b561a17deaad45c53ea0be02663e55e6a302b2@3.212.183.151:30303"]

  # Testnet:
  bootnodes ["enode://320553cda00dfc003f499a3ce9598029f364fbb3ed1222fdc20a94d97dcc4d8ba0cd0bfa996579dcc6d17a534741fb0a5da303a90579431259150de66b597251@54.147.31.250:30303","enode://f0f48a8781629f95ff02606081e6e43e4aebd503f3d07fc931fad7dd5ca1ba52bd849a6f6c3be0e375cf13c9ae04d859c4a9ae3546dc8ed4f10aa5dbb47d4998@34.226.134.117:30303"]
  ```

## Check node health with the community

Now that your Sentry and Validator nodes are synced and running, head over to [Discord](https://discord.com/invite/0xPolygon) and ask the community to health-check your nodes.

:::note

As validators, it’s mandatory to always have a check of the signer address. If the ETH balance reaches below 0.5 ETH then it should be refilled. Avoiding this will push out nodes from submitting checkpoint transactions.

:::

## Proceed to staking

Now that you have your Sentry and Validator nodes health-checked, proceed to [Staking](/docs/pos/design/validator/core-components/staking).

</TabItem>

<!-- ===================================================================================================================== -->
<!-- ===================================================== PACKAGES ====================================================== -->
<!-- ===================================================================================================================== -->

<TabItem value="package">

## Prerequisites

* Two machines — one [sentry](/maintain/glossary.md#sentry) and one [validator](/maintain/glossary.md#validator).

* Bash is installed on both the sentry and the validator machines.

* RabbitMQ installed on both the sentry and the validator machines.
  See [Downloading and Installing RabbitMQ](https://www.rabbitmq.com/download.html).

:::info

Please follow the steps on [<ins>bloXroute instructions</ins>](/maintain/validate/bloxroute.md) to connect your nodes to the bloXroute gateways.

:::

## Overview

To get to a running validator node, conduct the following in this **exact sequence of steps**:

:::caution

You will run into configuration issues if these steps are performed out of sequence.
It is important to keep in mind that a sentry node must always be set up before the validator node.

:::

1. Prepare two machines, one for the sentry node and one for the validator node.
2. Install the Heimdall and Bor binaries on the sentry and validator machines.
3. Set up the Heimdall and Bor service files on the sentry and validator machines.
4. Set up the Heimdall and Bor services on the sentry and validator machines.
5. Configure the sentry node.
6. Start the sentry node.
7. Configure the validator node.
8. Set the owner and signer keys.
9. Start the validator node.
10. Check node health with the community.

## Installing package

### Heimdall

- Install the default latest version of sentry for the Polygon Mainnet:

    ```shell
    curl -L https://raw.githubusercontent.com/maticnetwork/install/main/heimdall.sh | bash
    ```

    or install a specific version, node type (`sentry` or `validator`), and network (`mainnet` or `mumbai`). All release versions can be found on
    [Heimdall GitHub repository](https://github.com/maticnetwork/heimdall/releases).

    ```shell
    curl -L https://raw.githubusercontent.com/maticnetwork/install/main/heimdall.sh | bash -s -- <version> <network> <node_type>
    # Example:
    # curl -L https://raw.githubusercontent.com/maticnetwork/install/main/heimdall.sh | bash -s -- v0.3.4 mainnet sentry
    ```

### Bor

- Install the default latest version of sentry for Mainnet:

    ```shell
    curl -L https://raw.githubusercontent.com/maticnetwork/install/main/bor.sh | bash
    ```

    or install a specific version,  node type (`sentry` or `validator`), and network (`mainnet` or `mumbai`). All release versions could be found on
    [Bor Github repository](https://github.com/maticnetwork/bor/releases).

    ```shell
    curl -L https://raw.githubusercontent.com/maticnetwork/install/main/bor.sh | bash -s -- <version> <network> <node_type>

    # Example:
    # curl -L https://raw.githubusercontent.com/maticnetwork/install/main/bor.sh | bash -s -- v0.4.0 mainnet sentry
    ```

### Check installation

- Check Heimdall installation

    ```shell
    heimdalld version --long
    ```

- Check Bor installation

    ```shell
    bor version
    ```

:::note

Before proceeding, Bor should be installed on both the sentry and validator machines.

:::

## Configuration

In this section, we will go through steps to initialize and customize configurations nodes.

:::caution

Bor and Heimdall 0.3.0 uses standardized paths for configuration files and chain data. If you have existing
config files and chain data on your node, please skip this section and jump directly to **[Migration](#upgrade-from-02x-to-03x) section** to learn about migrating configs and data to standardized file locations.

:::

### Configure Heimdall

- Initialize Heimdall configs

```shell
# For mainnet
sudo -u heimdall heimdalld init --chain=mainnet --home /var/lib/heimdall

# For testnet
sudo -u heimdall heimdalld init --chain=mumbai --home /var/lib/heimdall
```

Open the Heimdall configuration file for editing:

```sh
vi /var/lib/heimdall/config/config.toml
```

In `config.toml`, change the following parameters:

* `moniker` — any name. Example: `moniker = "my-sentry-node"`.
* `seeds` — the seed node addresses consisting of a node ID, an IP address, and a port.

  Use the following values:

  ```toml
  seeds="f4f605d60b8ffaaf15240564e58a81103510631c@159.203.9.164:26656,4fb1bc820088764a564d4f66bba1963d47d82329@44.232.55.71:26656,2eadba4be3ce47ac8db0a3538cb923b57b41c927@35.199.4.13:26656,3b23b20017a6f348d329c102ddc0088f0a10a444@35.221.13.28:26656,25f5f65a09c56e9f1d2d90618aa70cd358aa68da@35.230.116.151:26656"
  ```

* `pex` — set the value to `true` to enable the peer exchange. Example: `pex = true`.
* `private_peer_ids` — the node ID of Heimdall set up on the validator machine.

  To get the node ID of Heimdall on the validator machine:

  1. Log in to the validator machine.
  2. Run:
     ```sh
     heimdalld tendermint show-node-id
     ```

  Example: `private_peer_ids = "0ee1de0515f577700a6a4b6ad882eff1eb15f066"`.

* `prometheus` — set the value to `true` to enable the Prometheus metrics. Example: `prometheus = true`.
* `max_open_connections` — set the value to `100`. Example: `max_open_connections = 100`.

Save the changes in `config.toml`.

### Configure Bor

In `/var/lib/bor/config.toml`, add the following:

```
[p2p]
    [p2p.discovery]
        static-nodes = ["<replace with enode://validator_machine_enodeID@validator_machine_ip:30303>"]
```

To get the node ID of Bor on the validator machine:

1. Log into the validator machine.
2. Run `bor bootnode -node-key /var/lib/bor/data/bor/nodekey -dry-run`.

Example output: `"enode://410e359736bcd3a58181cf55d54d4e0bbd6db2939c5f548426be7d18b8fd755a0ceb730fe5cf7510c6fa6f0870e388277c5f4c717af66d53c440feedffb29b4b@134.209.100.175:30303"`.

Example content of static node field in `/var/lib/bor/config.toml`:
```
[p2p]
    [p2p.discovery]
        static-nodes = ["enode://410e359736bcd3a58181cf55d54d4e0bbd6db2939c5f548426be7d18b8fd755a0ceb730fe5cf7510c6fa6f0870e388277c5f4c717af66d53c440feedffb29b4b@134.209.100.175:30303"]
```

Save the changes in `/var/lib/bor/config.toml`.

### Configuring a firewall

The sentry machine must have the following ports open to the world `0.0.0.0/0`:

* `26656`- Your Heimdall service will connect your node to other nodes Heimdall service.

* `30303`- Your Bor service will connect your node to other nodes Bor service.

* `22` - Open this port if your node is servicing validators. You will likely want to restrict what traffic can access this port as it is a sensitive port.

## Configure service files for Bor and Heimdall

After successfully installing Bor and Heimdall through [packages](#install-with-packages-recommended), their service file could be found under `/lib/systemd/system`, and Bor's config
file could be found under `/var/lib/bor/config.toml`.
You will need to check and modify these files accordingly.

    - In the service file, set `--chain` to `mainnet` or `mumbai` accordingly

  Save the changes in `/lib/systemd/system/heimdalld.service`.

- Make sure the chain is set correctly in `/var/lib/bor/config.toml` file. Open the file with following command `sudo vi /var/lib/bor/config.toml`

    - In the config file, set `chain` to `mainnet` or `mumbai` accordingly.

    - To enable Archive mode, you can optionally enable the following flags:

      ```
      gcmode "archive"

      [jsonrpc]
        [jsonrpc.ws]
          enabled = true
          port = 8546
          corsdomain = ["*"]
      ```

  Save the changes in `/var/lib/bor/config.toml`.


## Starting the Sentry Node

You will first start the Heimdall service. Once the Heimdall service syncs, you will start the Bor service.


### Reload service files

Reloading service files to make sure all changes to service files are loaded correctly.

```sh
sudo systemctl daemon-reload
```

### Starting the Heimdall service

Start the Heimdall services:

```sh
sudo service heimdalld start
```

Check the Heimdall service logs:

```sh
journalctl -u heimdalld.service -f
```

:::note

In the logs, you may see the following errors:

* `Stopping peer for error`
* `MConnection flush failed`
* `use of closed network connection`

These logs mean that one of the nodes on the network refused a connection to your node.
Wait for your node to crawl more nodes on the network; you do not need to do anything
to address these errors.

:::

Check the Heimdalld logs:

```sh
journalctl -u heimdalld.service -f
```

Check the sync status of Heimdall:

```sh
curl localhost:26657/status
```

In the output, the `catching_up` value is:

* `true` — the Heimdall service is syncing.
* `false` — the Heimdall service is fully synced.

Wait for the Heimdall service to sync fully.

### Starting the Bor service

Once the Heimdall service syncs, start the Bor service.

Start the Bor service:

```sh
sudo service bor start
```

Check the Bor service logs:

```sh
journalctl -u bor.service -f
```

## Installing packages on the Validator Node

Follow the same [installation steps](#installing-packages) on validator node.

## Configuring the Validator Node

:::note

To complete this section, you must have an RPC endpoint of your fully synced Ethereum mainnet
node ready.

:::

:::caution

Bor and Heimdall 0.3.0 uses standardized paths for configuration files and chain data. If you have existing
config files and chain data on your node, please jump directly to **[Migration](#upgrade-from-02x-to-03x-1) section** to learn about migrating configs and data to standardized file locations.

:::

### Configure Heimdall

Log in to the remote validator machine.

Initialize heimdall configs

```shell
# For mainnet
sudo -u heimdall heimdalld init --chain=mainnet --home /var/lib/heimdall

# For testnet
sudo -u heimdall heimdalld init --chain=mumbai --home /var/lib/heimdall
```

Open the Heimdall configuration file for editing:

```sh
vi /var/lib/heimdall/config/config.toml
```

In `config.toml`, change the following:

* `moniker` — any name. Example: `moniker = "my-validator-node"`.
* `pex` — set the value to `false` to disable the peer exchange. Example: `pex = false`.
* `private_peer_ids` — comment out the value to disable it. Example: `# private_peer_ids = ""`.

  To get the node ID of Heimdall on the sentry machine:

  1. Log in to the sentry machine.
  2. Run `heimdalld tendermint show-node-id`.

Example: `persistent_peers = "sentry_machineNodeID@sentry_instance_ip:26656"`

* `prometheus` — set the value to `true` to enable the Prometheus metrics. Example: `prometheus = true`.

Save the changes in `config.toml`.

Open for editing `vi /var/lib/heimdall/config/heimdall-config.toml`.

In `heimdall-config.toml`, change the following:

* `eth_rpc_url` — an RPC endpoint for a fully synced Ethereum mainnet node or testnet node,
  i.e Infura. `eth_rpc_url =<insert Infura or any full node RPC URL to Ethereum>`

Example: `eth_rpc_url = "https://nd-123-456-789.p2pify.com/60f2a23810ba11c827d3da642802412a"`

Save the changes in `heimdall-config.toml`.


### Configuring Bor


In `/var/lib/bor/config.toml`, add the following:

```
[p2p]
    [p2p.discovery]
        static-nodes = ["<replace with enode://validator_machine_enodeID@validator_machine_ip:30303>"]
```

To get the node ID of Bor on the sentry machine:

1. Log into the sentry machine.
2. Run `bor bootnode -node-key /var/lib/bor/data/bor/nodekey -dry-run`.

Example output: `"enode://410e359736bcd3a58181cf55d54d4e0bbd6db2939c5f548426be7d18b8fd755a0ceb730fe5cf7510c6fa6f0870e388277c5f4c717af66d53c440feedffb29b4b@134.209.100.175:30303"`.

Example content of static node field in `/var/lib/bor/config.toml`:
```
[p2p]
    [p2p.discovery]
        static-nodes = ["enode://410e359736bcd3a58181cf55d54d4e0bbd6db2939c5f548426be7d18b8fd755a0ceb730fe5cf7510c6fa6f0870e388277c5f4c717af66d53c440feedffb29b4b@134.209.100.175:30303"]
```

Save the changes in `/var/lib/bor/config.toml`.

## Setting the Owner and Signer Key

On Polygon, it is recommended that you keep the owner and signer keys different.

* Signer — the address that signs the
  [checkpoint transactions](/docs/maintain/glossary.md#checkpoint-transaction). The recommendation is to keep at least 1 ETH on the signer address.
* Owner — the address that does the staking transactions. The recommendation is to keep the MATIC
  tokens on the owner address.

### Generating a Heimdall private key

You must generate a Heimdall private key only on the validator machine. Do not generate a Heimdall
private key on the sentry machine.

To generate the private key, run:

```sh
heimdallcli generate-validatorkey ETHEREUM_PRIVATE_KEY
```

where

* ETHEREUM_PRIVATE_KEY — your Ethereum wallet address.

This will generate `priv_validator_key.json`. Move the generated JSON file to the Heimdall configuration
directory:

```sh
mv ./priv_validator_key.json /var/lib/heimdall/config
```

### Generating a Bor keystore file

You must generate a Bor keystore file only on the validator machine. Do not generate a Bor keystore file
on the sentry machine.

To generate the private key, run:

```sh
heimdallcli generate-keystore ETHEREUM_PRIVATE_KEY
```

where

* ETHEREUM_PRIVATE_KEY — your Ethereum private key.

When prompted, set up a password to the keystore file.

This will generate a `UTC-<time>-<address>` keystore file.

Move the generated keystore file to the Bor configuration directory:

```sh
mv ./UTC-<time>-<address> /var/lib/bor/keystore/
```

### Add password.txt

Make sure to create a `password.txt` file then add the Bor keystore file password right in the
`/var/lib/bor/password.txt` file.

### Add your Ethereum address

Open for editing `vi /etc/matic/metadata`.

In `metadata`, add your Ethereum address. Example: `VALIDATOR_ADDRESS=0xca67a8D767e45056DC92384b488E9Af654d78DE2`.

Save the changes in `metadata`.

## Configure service files for bor and heimdall

After successfully installing Bor and Heimdall through [packages](#install-with-packages-recommended), their service file could be found under `/lib/systemd/system`, and Bor's config
file could be found under `/var/lib/bor/config.toml`.
You will need to check and modify these files accordingly.

- Make sure the chain is set correctly in `/lib/systemd/system/heimdalld.service` file. Open the file with following command `sudo vi /lib/systemd/system/heimdalld.service`

    - In the service file, set `--chain` to `mainnet` or `mumbai` accordingly
    - Add `--bridge --all` to the heimdall command line for validator, example:
      ```
        ExecStart=/usr/local/bin/heimdalld start --home /var/lib/heimdall \
          --chain=mainnet \
          --bridge --all \
          --rest-server
      ```

  Save the changes in `/lib/systemd/system/heimdalld.service`.

- Make sure the chain is set correctly in `/var/lib/bor/config.toml` file. Open the file with following command `sudo vi /var/lib/bor/config.toml`

    - In the config file, set `chain` to `mainnet` or `mumbai` accordingly.

    - Enable validator flags, example:
      ```
      [miner]
        mine = true
        gaslimit = 20000000
        gasprice = "30000000000"
        etherbase = "VALIDATOR ADDRESS"

      [accounts]
        allow-insecure-unlock = true
        password = "/var/lib/bor/password.txt"
        unlock = ["VALIDATOR ADDRESS"]
      ```

  Save the changes in `/var/lib/bor/config.toml`.

## Starting the Validator Node

At this point, you must have:

* The Heimdall service on the sentry machine syncs and is running.
* The Bor service on the sentry machine running.
* The Heimdall service and the Bor service on the validator machine configured.
* Your owner and signer keys configured.

### Reload service files

Reloading service files to make sure all changes to service files are loaded correctly.

```
sudo systemctl daemon-reload
```

### Starting the Heimdall service

You will now start the Heimdall service on the validator machine. Once the Heimdall service syncs, you
will start the Bor service on the validator machine.

:::note

The Heimdall service takes several days to sync from scratch fully.

Alternatively, you can use a maintained snapshot, which will reduce the sync time to a few hours.
For detailed instructions, see [Snapshot Instructions for Heimdall and Bor](https://forum.matic.network/t/snapshot-instructions-for-heimdall-and-bor/2278).

For snapshot download links, see [Polygon Chains Snapshots](https://snapshot.polygon.technology/).

:::

Start the Heimdall services:

```sh
sudo service heimdalld start
```

Check the Heimdall service logs:

```sh
journalctl -u heimdalld.service -f
```

Check the sync status of Heimdall:

```sh
curl localhost:26657/status
```

In the output, the `catching_up` value is:

* `true` — the Heimdall service is syncing.
* `false` — the Heimdall service is synced.

Wait for the Heimdall service to fully sync.

### Starting the Bor service

Once the Heimdall service on the validator machine syncs, start the Bor service on
the validator machine.

Start the Bor service:

```sh
sudo service bor start
```

Check the Bor service logs:

```sh
journalctl -u bor.service -f
```
### Seed nodes and bootnodes

- Heimdall seed nodes:

  ```bash
  moniker=<enter unique identifier>

  # Mainnet:
  seeds="2a53a15ffc70ad41b6876ecbe05c50a66af01e20@3.211.248.31:26656,6f829065789e5b156cbbf076f9d133b4d7725847@3.212.183.151:26656,7285a532bad665f051c0aadc31054e2e61ca2b3d@3.93.224.197:26656,0b431127d21c8970f1c353ab212be4f1ba86c3bf@184.73.124.158:26656,f4f605d60b8ffaaf15240564e58a81103510631c@159.203.9.164:26656,31b79cf4a628a4619e8e9ae95b72e4354c5a5d90@44.232.55.71:26656,a385dd467d11c4cdb0be8b51d7bfb0990f49abc3@35.199.4.13:26656,daad548c0a163faae1d8d58425f97207acf923fd@35.230.116.151:26656,81c76e82fcc3dc9a0a1554a3edaa09a632795ea8@35.221.13.28:26656"

  # Testnet:
  seeds="e72c0466a02ea43b2198bd3a9454b87a3ef0d77e@54.147.31.250:26656,b302d1ddb21102e794b524d05152a7834da05bd1@34.226.134.117:26656,9dfc12d9f39257cefc3d57a4d7302586e59a994e@18.213.200.99:26656"
  ```
- Bootnodes:

  ```bash
  # Mainnet:
  bootnode ["enode://0cb82b395094ee4a2915e9714894627de9ed8498fb881cec6db7c65e8b9a5bd7f2f25cc84e71e89d0947e51c76e85d0847de848c7782b13c0255247a6758178c@44.232.55.71:30303","enode://88116f4295f5a31538ae409e4d44ad40d22e44ee9342869e7d68bdec55b0f83c1530355ce8b41fbec0928a7d75a5745d528450d30aec92066ab6ba1ee351d710@159.203.9.164:30303","enode://4be7248c3a12c5f95d4ef5fff37f7c44ad1072fdb59701b2e5987c5f3846ef448ce7eabc941c5575b13db0fb016552c1fa5cca0dda1a8008cf6d63874c0f3eb7@3.93.224.197:30303","enode://32dd20eaf75513cf84ffc9940972ab17a62e88ea753b0780ea5eca9f40f9254064dacb99508337043d944c2a41b561a17deaad45c53ea0be02663e55e6a302b2@3.212.183.151:30303"]

  # Testnet:
  bootnodes ["enode://320553cda00dfc003f499a3ce9598029f364fbb3ed1222fdc20a94d97dcc4d8ba0cd0bfa996579dcc6d17a534741fb0a5da303a90579431259150de66b597251@54.147.31.250:30303","enode://f0f48a8781629f95ff02606081e6e43e4aebd503f3d07fc931fad7dd5ca1ba52bd849a6f6c3be0e375cf13c9ae04d859c4a9ae3546dc8ed4f10aa5dbb47d4998@34.226.134.117:30303"]
  ```

## Health Checks with the Community

Now that your sentry and validator nodes are in sync and running, head over to
[Discord](https://discord.gg/polygon) and ask the community to health-check your nodes.

:::note

As validators, it’s mandatory to always have a check of the signer address. If the ETH balance reaches below 0.5 ETH then it should be refilled. Avoiding this will push out nodes from submitting checkpoint transactions.

:::

## Next Steps: Staking

Now that you have your sentry and validator nodes are health-checked, proceed to
the [Staking](/pos/design/validator/core-components/staking.md) guide to start backing the network.

</TabItem>
</Tabs>

---
id: run-validator-binaries
title: Run a Validator Node from Binaries
description: Use binaries to set up your validator node on the Polygon Network.
keywords:
  - docs
  - matic
  - polygon
  - binary
  - node
  - validator
  - sentry
image: https://matic.network/banners/matic-network-16x9.png 
---
import useBaseUrl from '@docusaurus/useBaseUrl';

This section guides you through starting and running the validator node from binaries.

For the system requirements, see [Validator Node System Requirements](https://docs.polygon.technology/docs/validate/validate/validator-node-system-requirements).

If you would like to start and run the validator node through Ansible, see [Run a Validator Node with Ansible](https://docs.polygon.technology/docs/validate/validate/run-validator-ansible).

:::note

Steps in this guide involve waiting for the Heimdall and Bor services to fully sync. This process takes several days to complete.

Alternatively, you can use a maintained snapshot, which will reduce the sync time to a few hours. For detailed instructions, see [Snapshot Instructions for Heimdall and Bor](https://forum.matic.network/t/snapshot-instructions-for-heimdall-and-bor/2278).

For snapshot download links, see [Polygon Chains Snapshots](https://snapshots.matic.today/).

There is limited space for accepting new validators. New validators can only join the active set when a currently active validator unbonds.

:::

## Prerequisites

* Two machines — one [sentry](/docs/validate/glossary#sentry) and one [validator](/docs/validate/glossary#validator).
* `build-essential` installed on both the sentry and the validator machines.

  To install:

  ```sh
  sudo apt-get install build-essential
  ```
  
* Go 1.17 installed on both the sentry and the validator machines.

  To install:

  ```sh
  wget https://gist.githubusercontent.com/ssandeep/a6c7197811c83c71e5fead841bab396c/raw/e38212982ab8cdfc11776fa1a3aaf92b69e1cb15/go-install.sh
  bash go-install.sh
  sudo ln -nfs ~/.go/bin/go /usr/bin/go
  ```

* RabbitMQ installed on both the sentry and the validator machines. See [Downloading and Installing RabbitMQ](https://www.rabbitmq.com/download.html).

## Overview

To get to a running validator node, do the following:

1. Have the two machines prepared.
1. Install the Heimdall and Bor binaries on the sentry and the validator machines.
1. Set up the Heimdall and Bor service files on the sentry and the validator machines.
1. Set up the Heimdall and Bor services on the sentry and the validator machines.
1. Configure the sentry node.
1. Start the sentry node.
1. Configure the validator node.
1. Set the owner and signer keys.
1. Start the validator node.
1. Check node health with the community.

:::note

You must follow the exact outlined sequence of actions, otherwise you will run into issues.

For example, a sentry node must always be set up before the validator node.

:::

## Install binaries

:::note

Run this section both on the sentry and the validator machines.

:::

### Install Heimdall

Clone the [Heimdall repository](https://github.com/maticnetwork/heimdall/):

```sh
git clone https://github.com/maticnetwork/heimdall
```

Check out the correct [release version](https://github.com/maticnetwork/heimdall/releases):

```sh
git checkout RELEASE_TAG
```

where

* RELEASE_TAG — the tag of the release version that you install.

Example:

```sh
git checkout v0.2.4
```

Install Heimdall:

```sh
make install
```

Check the installation:

```sh
heimdalld version --long
```

### Install Bor

Clone the [Bor repository](https://github.com/maticnetwork/bor):

```sh
git clone https://github.com/maticnetwork/bor
```

Check out the correct [release version](https://github.com/maticnetwork/bor/releases):

```sh
git checkout RELEASE_TAG
```

where

* RELEASE_TAG — the tag of the release version that you install.

Example:

```sh
git checkout v0.2.12
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

Check the installation:

```sh
bor version
```

## Set up node files

:::note

Run this section both on the sentry and the validator machines.

:::

### Fetch the launch repository

Clone the [launch repository](https://github.com/maticnetwork/launch):

```sh
git clone https://github.com/maticnetwork/launch
```

### Set up the launch directory

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

### Set up the network directories

:::note

Run this section both on the sentry and the validator machines.

:::

#### Set up Heimdall

Change to the `node` directory:

```sh
cd ~/node/heimdall
```

Run the setup script:

```sh
bash setup.sh
```

#### Set up Bor

Change to the `node` directory:

```sh
cd ~/node/bor
```

Run the setup script:

```sh
bash setup.sh
```

## Set up the services

:::note

Run this section both on the sentry and the validator machines.

:::

Change to the `node` directory:

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

## Configure the sentry node

Login to the remote sentry machine.

### Configure the Heimdall services

Open for editing `vi ~/.heimdalld/config/config.toml`.

In `config.toml`, change the following:

* `moniker` — any name. Example: `moniker = "my-sentry-node"`.
* `seeds` — the seed node addresses consisting of a node ID, an IP address, and a port.

  Use the following values:

  ```toml
  seeds="f4f605d60b8ffaaf15240564e58a81103510631c@159.203.9.164:26656,4fb1bc820088764a564d4f66bba1963d47d82329@44.232.55.71:26656,2eadba4be3ce47ac8db0a3538cb923b57b41c927@35.199.4.13:26656,3b23b20017a6f348d329c102ddc0088f0a10a444@35.221.13.28:26656,25f5f65a09c56e9f1d2d90618aa70cd358aa68da@35.230.116.151:26656"
  ```

* `pex` — set the value to `true` to enable the peer exchange. Example: `pex = true`.
* `private_peer_ids` — the node ID of Heimdall set up on the validator machine.

  To get the node ID of Heimdall on the validator machine:

  1. Login to the valdator machine.
  1. Run `heimdalld tendermint show-node-id`.

  Example: `private_peer_ids = "0ee1de0515f577700a6a4b6ad882eff1eb15f066"`.

* `prometheus` — set the value to `true` to enable the Prometheus metrics. Example: `prometheus = true`.
* `max_open_connections` — set the value to `100`. Example: `max_open_connections = 100`.

Save the changes in `config.toml`.

### Configure the Bor Service

Open for editing `vi ~/node/bor/start.sh`.

In `start.sh`, add the boot node addresses consisting of a node ID, an IP address, and a port by adding the following line at the end:

```config
--bootnodes "enode://0cb82b395094ee4a2915e9714894627de9ed8498fb881cec6db7c65e8b9a5bd7f2f25cc84e71e89d0947e51c76e85d0847de848c7782b13c0255247a6758178c@44.232.55.71:30303,enode://88116f4295f5a31538ae409e4d44ad40d22e44ee9342869e7d68bdec55b0f83c1530355ce8b41fbec0928a7d75a5745d528450d30aec92066ab6ba1ee351d710@159.203.9.164:30303,enode://3178257cd1e1ab8f95eeb7cc45e28b6047a0432b2f9412cff1db9bb31426eac30edeb81fedc30b7cd3059f0902b5350f75d1b376d2c632e1b375af0553813e6f@35.221.13.28:30303,enode://16d9a28eadbd247a09ff53b7b1f22231f6deaf10b86d4b23924023aea49bfdd51465b36d79d29be46a5497a96151a1a1ea448f8a8666266284e004306b2afb6e@35.199.4.13:30303,enode://ef271e1c28382daa6ac2d1006dd1924356cfd843dbe88a7397d53396e0741ca1a8da0a113913dee52d9071f0ad8d39e3ce87aa81ebc190776432ee7ddc9d9470@35.230.116.151:30303"
```

Save the changes in `start.sh`.

### Configure firewall

The sentry machine must have the following ports open to the world `0.0.0.0/0`:

* 26656- Your Heimdall service will connect your node to other nodes Heimdall service.

* 30303- Your Bor service will connect your node to other nodes Bor service.

* 22- For the validator to be able to ssh from wherever he/she is.

## Start the sentry node

You will first start the Heimdall service. Once the Heimdall service syncs, you will start the Bor service.

:::note

The Heimdall service takes several days to fully sync from scratch.

Alternatively, you can use a maintained snapshot, which will reduce the sync time to a few hours. For detailed instructions, see [Snapshot Instructions for Heimdall and Bor](https://forum.matic.network/t/snapshot-instructions-for-heimdall-and-bor/2278).

For snapshot download links, see [Polygon Chains Snapshots](https://snapshots.matic.today/).

:::

### Start the Heimdall service

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

These mean that one of the nodes on the network refused a connection to your node. You do not need to do anything with these errors. Wait for your node to crawl more nodes on the network.

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

Wait for the Heimdall service to fully sync.

### Start the Bor service

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

To complete this section, you must have an RPC endpoint of your fully synced Ethereum mainnet node ready.

:::

### Configure the Heimdall service

Login to the remote validator machine.

Open for editing `vi ~/.heimdalld/config/config.toml`.

In `config.toml`, change the following:

* `moniker` — any name. Example: `moniker = "my-validator-node"`.
* `pex` — set the value to `false` to disable the peer exchange. Example: `pex = false`.
* `private_peer_ids` — comment out the value to disable it. Example: `# private_peer_ids = ""`.

  To get the node ID of Heimdall on the sentry machine:

  1. Login to the sentry machine.
  1. Run `heimdalld tendermint show-node-id`.

Example: `persistent_peers = "sentry_machineNodeID@sentry_instance_ip:26656"`

* `prometheus` — set the value to `true` to enable the Prometheus metrics. Example: `prometheus = true`.

Save the changes in `config.toml`.

Open for editing `vi ~/.heimdalld/config/heimdall-config.toml`.

In `heimdall-config.toml`, change the following:

* `eth_rpc_url` — an RPC endpoint for a fully synced Ethereum mainnet node, i.e Infura. `eth_rpc_url =<insert Infura or any full node RPC URL to Ethereum>`

Example: `eth_rpc_url = "https://nd-123-456-789.p2pify.com/60f2a23810ba11c827d3da642802412a"`

Save the changes in `heimdall-config.toml`.

### Configure the Bor service

Open for editing `vi ~/.bor/data/bor/static-nodes.json`.

In `static-nodes.json`, change the following:

* `"<replace with enode://sentry_machine_enodeID@sentry_machine_ip:30303>"` — the node ID and IP address of Bor set up on the sentry machine.

  To get the node ID of Bor on the sentry machine:

  1. Login to the sentry machine.
  1. Run `bootnode -nodekey ~/.bor/data/bor/nodekey -writeaddress`.

  Example: `"enode://a8024075291c0dd3467f5af51a05d531f9e518d6cd229336156eb6545581859e8997a80bc679fdb7a3bd7473744c57eeb3411719b973b2d6c69eff9056c0578f@188.166.216.25:30303"`.

Save the changes in `static-nodes.json`.

## Set the owner and signer key

On Polygon, it is recommended that you keep the owner and signer keys different.

* Signer — the address that signs the [checkpoint transactions](/docs/validate/glossary#checkpoint-transaction). The recommendation is to keep at least 1 ETH on the signer address.
* Owner — the address that does the staking transactions. The recommendation is to keep the MATIC tokens on the owner address.

### Generate a Heimdall private key

You must generate a Heimdall private key only on the validator machine. Do not generate a Heimdall private key on the sentry machine.

To generate the private key, run:

```sh
heimdallcli generate-validatorkey ETHEREUM_PRIVATE_KEY
```

where

* ETHEREUM_PRIVATE_KEY — your Ethereum wallet address.

This will generate `priv_validator_key.json`. Move the generated JSON file to the Heimdall configuration directory:

```sh
mv ./priv_validator_key.json ~/.heimdalld/config
```

### Generate a Bor keystore file

You must generate a Bor keystore file only on the validator machine. Do not generate a Bor keystore file on the sentry machine.

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
mv ./UTC-<time>-<address> ~/.bor/keystore/
```

### Add password.txt

Make sure to create a `password.txt` file then add the Bor keystore file password right in the `~/.bor/password.txt` file.

### Add your Ethereum address

Open for editing `vi /etc/matic/metadata`.

In `metadata`, add your Ethereum address. Example: `VALIDATOR_ADDRESS=0xca67a8D767e45056DC92384b488E9Af654d78DE2`.

Save the changes in `metadata`.

## Start the validator node

At this point, you must have:

* The Heimdall service on the sentry machine fully synced and running.
* The Bor service on the sentry machine running.
* The Heimdall service and the Bor service on the validator machine configured.
* Your owner and signer keys configured.

### Start the Heimdall service

You will now start the Heimdall service on the validator machine. Once the Heimdall service syncs, you will start the Bor service on the validator machine.

:::note

The Heimdall service takes several days to fully sync from scratch.

Alternatively, you can use a maintained snapshot, which will reduce the sync time to a few hours. For detailed instructions, see [Snapshot Instructions for Heimdall and Bor](https://forum.matic.network/t/snapshot-instructions-for-heimdall-and-bor/2278).

For snapshot download links, see [Polygon Chains Snapshots](https://snapshots.matic.today/).

:::

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
* `false` — the Heimdall service is fully synced.

Wait for the Heimdall service to fully sync.

### Start the Bor service

Once the Heimdall service on the validator machine is fully synced, start the Bor service on the validator machine.

Start the Bor service:

```sh
sudo service bor start
```

Check the Bor service logs:

```sh
journalctl -u bor.service -f
```

## Check node health with the community

Now that your sentry and validator nodes are synced and running, head over to [Discord](https://discord.gg/4E2XMVC) and ask the community to health-check your nodes.

## Proceed to staking

Now that you have your sentry and validator nodes health-checked, proceed to [Staking](https://docs.polygon.technology/docs/validate/validator/core-components/staking).

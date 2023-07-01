---
id: full-node-deployment
title: How to Run a Full PoS Node
sidebar_label: Run a Full Node
description: "Learn how to deploy a full Polygon PoS node."
keywords:
  - docs
  - polygon
  - matic
  - node
  - full node setup
  - ansible
  - deploy
image: https://wiki.polygon.technology/img/polygon-wiki.png
---

import useBaseUrl from '@docusaurus/useBaseUrl';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

This deployment guide walks you through starting and running a full node through various methods. For the system requirements, see the [Minimum Technical Requirements](technical-requirements.md) guide.

:::tip Snapshots

Steps in these guide involve waiting for the Heimdall and Bor services to fully sync. This process takes several days to complete.

Please use snapshots for faster syncing without having to sync over the network. For detailed instructions, see [<ins>Snapshot Instructions for Heimdall and Bor</ins>](/operate/snapshot-instructions-heimdall-bor.md).

For snapshot download links, see the [<ins>Polygon Chains Snapshots</ins>](https://snapshots.polygon.technology/) page.

:::

<Tabs
defaultValue="binaries"
values={[
{ label: 'Binaries', value: 'binaries', },
{ label: 'Docker', value: 'docker', },
{ label: 'Ansible', value: 'ansible', },
{ label: 'Packages', value: 'package', },
{ label: 'Google Cloud', value: 'gcp', },
]
}>

<!-- ===================================================================================================================== -->
<!-- ===================================================== BINARIES ====================================================== -->
<!-- ===================================================================================================================== -->

<TabItem value="binaries">

## Overview

- Prepare the machine
- Install Heimdall and Bor binaries on the full node machine
- Set up Heimdall and Bor services on the full node machine
- Configure the full node machine
- Start the full node machine
- Check node health with the community

:::note

You have to follow the exact outlined sequence of actions, otherwise you will run into issues.

:::

### Install `build-essential`

This is **required** for your full node. In order to install, run the below command:

```bash
sudo apt-get update
sudo apt-get install build-essential
```

## Install Binaries

Polygon node consists of 2 layers: Heimdall and Bor. Heimdall is a tendermint fork that monitors contracts in parallel with the Ethereum network. Bor is basically a Geth fork that generates blocks shuffled by Heimdall nodes.

Both binaries must be installed and run in the correct order to function properly.

### Heimdall

Install the latest version of Heimdall and related services. Make sure you checkout to the correct [release version](https://github.com/maticnetwork/heimdall/releases). Note that the latest version, [Heimdall v0.3.4](https://github.com/maticnetwork/heimdall/releases/tag/v0.3.4), contains enhancements such as:
1. Restricting data size in state sync txs to:
    * **30Kb** when represented in **bytes**
    * **60Kb** when represented as **string**
2. Increasing the **delay time** between the contract events of different validators to ensure that the mempool doesn't get filled very quickly in case of a burst of events which can hamper the progress of the chain.

The following example shows how the data size is restricted:

```
Data - "abcd1234"
Length in string format - 8
Hex Byte representation - [171 205 18 52]
Length in byte format - 4
```

To install **Heimdall**, run the below commands:

```bash
curl -L https://raw.githubusercontent.com/maticnetwork/install/main/heimdall.sh | bash -s -- <heimdall_version> <network_type> <node_type>
```

**heimdall_version**: `valid v0.3+ release tag from https://github.com/maticnetwork/heimdall/releases`
**network_type**: `mainnet` and `mumbai`
**node_type**: `sentry`

That will install the `heimdalld` and `heimdallcli` binaries. Verify the installation by checking the Heimdall version on your machine:

```bash
heimdalld version --long
```

### Configure heimdall seeds (Mainnet)

```bash
sed -i 's|^seeds =.*|seeds = "2a53a15ffc70ad41b6876ecbe05c50a66af01e20@3.211.248.31:26656,6f829065789e5b156cbbf076f9d133b4d7725847@3.212.183.151:26656,7285a532bad665f051c0aadc31054e2e61ca2b3d@3.93.224.197:26656,0b431127d21c8970f1c353ab212be4f1ba86c3bf@184.73.124.158:26656,f4f605d60b8ffaaf15240564e58a81103510631c@159.203.9.164:26656,31b79cf4a628a4619e8e9ae95b72e4354c5a5d90@44.232.55.71:26656,a385dd467d11c4cdb0be8b51d7bfb0990f49abc3@35.199.4.13:26656,daad548c0a163faae1d8d58425f97207acf923fd@35.230.116.151:26656,81c76e82fcc3dc9a0a1554a3edaa09a632795ea8@35.221.13.28:26656"|g' /var/lib/heimdall/config/config.toml
chown heimdall /var/lib/heimdall
```

### Configure heimdall seeds (Mumbai)

```bash
sed -i 's|^seeds =.*|seeds = "e72c0466a02ea43b2198bd3a9454b87a3ef0d77e@54.147.31.250:26656,b302d1ddb21102e794b524d05152a7834da05bd1@34.226.134.117:26656,9dfc12d9f39257cefc3d57a4d7302586e59a994e@18.213.200.99:26656"|g' /var/lib/heimdall/config/config.toml
chown heimdall /var/lib/heimdall
```

### Bor install

Install the latest version of Bor, based on valid v0.3+ [released version](https://github.com/maticnetwork/bor/releases).

```bash
curl -L https://raw.githubusercontent.com/maticnetwork/install/main/bor.sh | bash -s -- <bor_version> <network_type> <node_type>
```

**bor_version**: `valid v0.3+ release tag from https://github.com/maticnetwork/bor/releases`
**network_type**: `mainnet` and `mumbai`
**node_type**: `sentry`

That will install the `bor` binary. Verify the installation by checking the Bor version on your machine:

```bash
bor version
```

### Configure bor seeds (mainnet)

```bash
sed -i 's|.*\[p2p.discovery\]|  \[p2p.discovery\] |g' /var/lib/bor/config.toml
sed -i 's|.*bootnodes =.*|    bootnodes = ["enode://0cb82b395094ee4a2915e9714894627de9ed8498fb881cec6db7c65e8b9a5bd7f2f25cc84e71e89d0947e51c76e85d0847de848c7782b13c0255247a6758178c@44.232.55.71:30303","enode://88116f4295f5a31538ae409e4d44ad40d22e44ee9342869e7d68bdec55b0f83c1530355ce8b41fbec0928a7d75a5745d528450d30aec92066ab6ba1ee351d710@159.203.9.164:30303","enode://4be7248c3a12c5f95d4ef5fff37f7c44ad1072fdb59701b2e5987c5f3846ef448ce7eabc941c5575b13db0fb016552c1fa5cca0dda1a8008cf6d63874c0f3eb7@3.93.224.197:30303","enode://32dd20eaf75513cf84ffc9940972ab17a62e88ea753b0780ea5eca9f40f9254064dacb99508337043d944c2a41b561a17deaad45c53ea0be02663e55e6a302b2@3.212.183.151:30303"]|g' /var/lib/bor/config.toml
chown bor /var/lib/bor
```

### Configure bor seeds (mumbai)

```bash
sed -i 's|.*\[p2p.discovery\]|  \[p2p.discovery\] |g' /var/lib/bor/config.toml
sed -i 's|.*bootnodes =.*|    bootnodes = ["enode://320553cda00dfc003f499a3ce9598029f364fbb3ed1222fdc20a94d97dcc4d8ba0cd0bfa996579dcc6d17a534741fb0a5da303a90579431259150de66b597251@54.147.31.250:30303","enode://f0f48a8781629f95ff02606081e6e43e4aebd503f3d07fc931fad7dd5ca1ba52bd849a6f6c3be0e375cf13c9ae04d859c4a9ae3546dc8ed4f10aa5dbb47d4998@34.226.134.117:30303"]|g' /var/lib/bor/config.toml
chown bor /var/lib/bor
```

### Update service config user permission

```bash
sed -i 's/User=heimdall/User=root/g' /lib/systemd/system/heimdalld.service
sed -i 's/User=bor/User=root/g' /lib/systemd/system/bor.service
```

## Start Services

Run the full Heimdall node with these commands on your Sentry Node:

```bash
sudo service heimdalld start
```

Now, you need to make sure that **Heimdall is synced** completely, and then only start Bor. If you start Bor without Heimdall syncing completely, you will run into issues frequently.

**To check if Heimdall is synced**
  1. On the remote machine/VM, run `curl localhost:26657/status`
  2. In the output, `catching_up` value should be `false`

Once Heimdall is synced, run the below command:

```bash
sudo service bor start
```

## Logs

Logs can be managed by the `journalctl` linux tool. Here is a tutorial for advanced usage: [How To Use Journalctl to View and Manipulate Systemd Logs](https://www.digitalocean.com/community/tutorials/how-to-use-journalctl-to-view-and-manipulate-systemd-logs).

**Check Heimdall node logs**

```bash
journalctl -u heimdalld.service -f
```

**Check Heimdall Rest-server logs**

```bash
journalctl -u heimdalld-rest-server.service -f
```

**Check Bor Rest-server logs**

```bash
journalctl -u bor.service -f
```

## Ports and Firewall Setup

Open ports 22, 26656 and 30303 to world (0.0.0.0/0) on sentry node firewall.

You can use VPN to restrict access for port 22 as per your requirement and security guidelines.

</TabItem>

<TabItem value ="docker">

The Polygon team distributes official Docker images which can be used to run nodes on the Polygon Mainnet. These instructions are for running a Full Node, but they can be adapted for running sentry nodes and validators as well.

## Prerequisites

The general configuration for running a Polygon full node is to have **at least** 4 CPUs/cores and 16 GB of RAM. For this walk through, we’re going to be using AWS and a `t3.2xlarge` instance type. The application can run on both x86 and ARM architectures.

These instructions are based on Docker, so it should be easy to follow along with almost any operating system, but we’re using Ubuntu.

In terms of space, for a full node you’ll probably need from **2.5 to 5 terabytes of SSD (or faster) storage**.

The peer exchange for a Polygon full node generally depends on port 30303 and 26656 being open. When you configure your firewall or security groups for AWS, make sure these ports are open along with whatever ports you need to access the machine.

TLDR:

- Use a machine with at least 4 cores and 16GB RAM
- Make sure you have from 2.5 TB to 5 TB of fast storage
- Use a public IP and open ports 30303 and 26656

## Initial Setup
At this point, you should have shell access with root privileges to a linux machine.

![img](/img/full-node-docker/term-access.png)

### Install Docker
Most likely your operating system won’t have Docker installed by default. Please follow the instructions for your particular distribution found here: https://docs.docker.com/engine/install/

We’re following the instructions for Ubuntu. The steps are included below, but please see the official instructions in case they’ve been updated.

``` bash
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg lsb-release
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

At this point you should have Docker installed. In order to verify, you should be able to run a command like this:

``` bash
sudo docker run hello-world
```

![img](/img/full-node-docker/hello-world.png)

In many cases, it’s inconvenient to run docker as `root` user so we’ll follow the post install steps [here](https://docs.docker.com/engine/install/linux-postinstall/) in order to interact with docker without needing to be `root`:

```bash
sudo groupadd docker
sudo usermod -aG docker $USER
```

Now you should be able to logout and log back in and run docker commands without `sudo`.

### Disk Setup
The exact steps required here are going to vary a lot based on your needs. Most likely you’ll have a root partition running your operating system on one device. You’ll probably want one or more devices for actually holding the blockchain data. For the rest of the walkthrough, we’re going to have that additional device mounted at `/mnt/data`.

In this example, we have a device with 4 TB of available space located at `/dev/nvme1n1`. We are going to mount that using the steps below:

```bash
sudo mkdir /mnt/data
sudo mount /dev/nvme1n1 /mnt/data
```

We use `df -h` to make sure the mount looks good.

![img](/img/full-node-docker/space.png)

If that all looks good, we might as well create the home directories on this mount for Bor and Heimdall.

```bash
sudo mkdir /mnt/data/bor
sudo mkdir /mnt/data/heimdall
```

Depending on your use case and operating system, you’ll likely want to create an entry in `/etc/fstab` in order to make sure your device is mounted when the system reboots.

In our case we're following some steps like this:

```bash
# Use blkid to get the UUID for the device that we're mounting
blkid

# Edit the fstab file  and add a line to mount your device
# UUID={your uuid}		/mnt/data	{your filesystem}	defaults	0	1
sudo emacs /etc/fstab

# use this to verify the fstab actually works
sudo findmnt --verify --verbose
```

At this point you should be able to reboot and confirm that the system loads your mount properly.

### Heimdall Setup

At this point, we have a host with docker running on it and we have ample mounted storage to run our Polygon node software. So let’s get Heimdall configured and running.

First let’s make sure we can run Heimdall with docker. Run the following command:

```bash
docker run -it 0xpolygon/heimdall:0.3.4 heimdallcli version
```

If this is the first time you’ve run Heimdall with docker, it should pull the required image automatically and output the version information.

![img](/img/full-node-docker/heimdall-version.png)

If you’d like to check the details of the Heimdall image or find a different tag, you can take a look at the repository on Docker Hub: https://hub.docker.com/repository/docker/0xpolygon/heimdall

At this point, let’s run the Heimdall `init` command to set up our home directory.

```bash
docker run -v /mnt/data/heimdall:/heimdall-home:rw --entrypoint /usr/bin/heimdalld -it 0xpolygon/heimdall:0.3.4 init --home=/heimdall-home
```

Let’s break this command down a bit in case anything goes wrong.

* We’re using `docker run` to run a command via docker.

* The switch `-v /mnt/data/heimdall:/heimdall-home:rw` is very important. It’s mounting the folder that we created earlier `/mnt/data/heimdall` from our host system to `/heimdall-home` within the container as a docker volume.

* The `rw` allows the command to write to this docker volume. For all intents and purposes, from within the docker container, the home directory for Heimdall will be `/heimdall-home`.

* The argument `--entrypoint /usr/bin/heimdalld` is overriding the default entry point for this container.

* The switch `-it` is used to run the command interactively.

* Finally we’re specifying which image we want to run with `0xpolygon/heimdall:0.3.4`.

* After that `init --home=/heimdall-home` are arguments being passed to the heimdalld executable. `init` is the command we want to run and `--home` is used to specify the location of the home directory.

After running the `init` command, your `/mnt/data/heimdall` directory should have some structure and look like this:

![img](/img/full-node-docker/heimdall-tree.png)

Now we need to make a few updates before starting Heimdall. First we’re going to edit the `config.toml` file.

```bash
# Open the config.toml and and make three edits
# moniker = "YOUR NODE NAME HERE"
# laddr = "tcp://0.0.0.0:26657"
# seeds = "LATEST LIST OF SEEDS"

sudo emacs /mnt/data/heimdall/config/config.toml
```

If you don’t have a list of seeds, you can find one [in this section](#seed-nodes-and-bootnodes). In our case, our file has these three lines:

```
# A custom human readable name for this node
moniker="examplenode01"

# TCP or UNIX socket address for the RPC server to listen on
laddr = "tcp://0.0.0.0:26657"

# Comma separated list of seed nodes to connect to
seeds="f4f605d60b8ffaaf15240564e58a81103510631c@159.203.9.164:26656,4fb1bc820088764a564d4f66bba1963d47d82329@44.232.55.71:26656,2eadba4be3ce47ac8db0a3538cb923b57b41c927@35.199.4.13:26656,3b23b20017a6f348d329c102ddc0088f0a10a444@35.221.13.28:26656,25f5f65a09c56e9f1d2d90618aa70cd358aa68da@35.230.116.151:26656"
```

:::caution

There are two `laddr` inside `config.toml` file. Make sure that you only change the `laddr` parameter under `[rpc]` section.

:::

Now that your `config.toml` file is all set, you’ll need to make two small changes to your `heimdall-config.toml` file. Use your favorite editor to update these two settings:

```
# RPC endpoint for ethereum chain
eth_rpc_url = "http://localhost:9545"

# RPC endpoint for bor chain
bor_rpc_url = "http://localhost:8545"
```

The `eth_rpc_url` should be updated to whatever URL you use for Ethereum Mainnet RPC. The `bor_rpc_url` in our case is going to be updated to `http://bor:8545`. After making the edits, our file has these lines:

```
# RPC endpoint for ethereum chain
eth_rpc_url = "https://eth-mainnet.g.alchemy.com/v2/ydmGjsREDACTED_DONT_USE9t7FSf"

# RPC endpoint for bor chain
bor_rpc_url = "http://bor:8545"
```

The default `init` command provides a `genesis.json` but that will not work with Polygon Mainnet or Mumbai. If you’re setting up a mainnet node, you can run this command to download the correct genesis file:

```bash
sudo curl -o /mnt/data/heimdall/config/genesis.json https://raw.githubusercontent.com/maticnetwork/heimdall/master/builder/files/genesis-mainnet-v1.json
```

If you want to verify that you have the right file, you can check against this hash:

```
# sha256sum genesis.json
498669113c72864002c101f65cd30b9d6b159ea2ed4de24169f1c6de5bcccf14  genesis.json
```

## Starting Heimdall
Before we start Heimdall, we’re going to create a docker network so that the containers can easily network with each other based on names. In order to create the network, run the following command:

```bash
docker network create polygon
```

Now we’re going to start Heimdall. Run the following command:

```bash
docker run -p 26657:26657 -p 26656:26656 -v /mnt/data/heimdall:/heimdall-home:rw --net polygon --name heimdall --entrypoint /usr/bin/heimdalld -d --restart unless-stopped  0xpolygon/heimdall:0.3.4 start --home=/heimdall-home
```

Many of the pieces of this command will look familiar. So let’s talk about what’s new.

* The `-p 26657:26657` and `-p 26656:26656` switches are port mappings. This will instruct docker to map the host port `26657` to the container port `26657` and the same for `26656`.

* The `--net polygon` switch is telling docker to run this container in the polygon network.

* `--name heimdall` is naming the container which is useful for debugging, but it’s all the name that will be used for other containers to connect to Heimdall.

* The `-d` argument tells docker to run this container in the background.

* The switch `--restart unless-stopped` tells docker to automatically restart the container unless it was stopped manually.

* Finally, `start` is being used to actually run the application instead of `init` which just set up the home directory.

At this point it’s helpful to check and see what’s going on. These two commands can be useful:

```bash
# ps will list the running docker processes. At this point you should see one container running
docker ps

# This command will print out the logs directly from the heimdall application
docker logs -ft heimdall
```

At this point, Heimdall should start syncing. When you look at the logs, you should see a log of information being spit out that looks like this:

```
2022-12-14T19:43:23.687640820Z INFO [2022-12-14|19:43:23.687] Executed block                               module=state height=26079 validTxs=0 invalidTxs=0
2022-12-14T19:43:23.721220869Z INFO [2022-12-14|19:43:23.721] Committed state                              module=state height=26079 txs=0 appHash=CAEC4C181C9F82D7F55C4BB8A7F564D69A41295A3B62DDAA45F2BB41333DC20F
2022-12-14T19:43:23.730533414Z INFO [2022-12-14|19:43:23.730] Executed block                               module=state height=26080 validTxs=0 invalidTxs=0
2022-12-14T19:43:23.756646938Z INFO [2022-12-14|19:43:23.756] Committed state                              module=state height=26080 txs=0 appHash=CAEC4C181C9F82D7F55C4BB8A7F564D69A41295A3B62DDAA45F2BB41333DC20F
2022-12-14T19:43:23.768129711Z INFO [2022-12-14|19:43:23.767] Executed block                               module=state height=26081 validTxs=0 invalidTxs=0
2022-12-14T19:43:23.794323918Z INFO [2022-12-14|19:43:23.794] Committed state                              module=state height=26081 txs=0 appHash=CAEC4C181C9F82D7F55C4BB8A7F564D69A41295A3B62DDAA45F2BB41333DC20F
2022-12-14T19:43:23.802989809Z INFO [2022-12-14|19:43:23.802] Executed block                               module=state height=26082 validTxs=0 invalidTxs=0
2022-12-14T19:43:23.830960386Z INFO [2022-12-14|19:43:23.830] Committed state                              module=state height=26082 txs=0 appHash=CAEC4C181C9F82D7F55C4BB8A7F564D69A41295A3B62DDAA45F2BB41333DC20F
2022-12-14T19:43:23.840941976Z INFO [2022-12-14|19:43:23.840] Executed block                               module=state height=26083 validTxs=0 invalidTxs=0
2022-12-14T19:43:23.866564767Z INFO [2022-12-14|19:43:23.866] Committed state                              module=state height=26083 txs=0 appHash=CAEC4C181C9F82D7F55C4BB8A7F564D69A41295A3B62DDAA45F2BB41333DC20F
2022-12-14T19:43:23.875395744Z INFO [2022-12-14|19:43:23.875] Executed block                               module=state height=26084 validTxs=0 invalidTxs=0
```

If you’re not seeing any information like this, your node might not be finding enough peers. The other useful command at this point is an RPC call to check the status of Heimdall syncing:

```bash
curl localhost:26657/status
```

This will return a response like:

```json
{
  "jsonrpc": "2.0",
  "id": "",
  "result": {
    "node_info": {
      "protocol_version": {
        "p2p": "7",
        "block": "10",
        "app": "0"
      },
      "id": "0698e2f205de0ffbe4ca215e19b2ee7275d2c334",
      "listen_addr": "tcp://0.0.0.0:26656",
      "network": "heimdall-137",
      "version": "0.32.7",
      "channels": "4020212223303800",
      "moniker": "examplenode01",
      "other": {
        "tx_index": "on",
        "rpc_address": "tcp://0.0.0.0:26657"
      }
    },
    "sync_info": {
      "latest_block_hash": "812700055F33B175CF90C870B740D01B0C5B5DCB8D22376D2954E1859AF30458",
      "latest_app_hash": "83A1568E85A1D942D37FE5415F3FB3CBD9DFD846A42CBC247DFD6ABB9CE7E606",
      "latest_block_height": "16130",
      "latest_block_time": "2020-05-31T17:06:31.350723885Z",
      "catching_up": true
    },
    "validator_info": {
      "address": "3C6058AF387BB74D574582C2BEEF377E7A4C0238",
      "pub_key": {
        "type": "tendermint/PubKeySecp256k1",
        "value": "BOIKA6z1q3l5iSJoaAiagWpwUw3taAhiEMyZ9ffxAMznas2GU1giD5YmtnrB6jzp4kkIqv4tOmuGYILSdy9+wYI="
      },
      "voting_power": "0"
    }
  }
}
```

In this initial setup phase, it’s important to pay attention to the `sync_info` field. If `catching_up` is true, it means that Heimdall is not fully synced. You can check the other properties within `sync_info` to get a sense how far behind Heimdall is.

## Starting Bor

At this point, you should have a node that’s successfully running Heimdall. You should be ready now to run Bor.

Before we get started with Bor, we need to run the Heimdall rest server. This command will start a REST API that Bor uses to retrieve information from Heimdall. The command to start server is:

```bash
docker run -p 1317:1317 -v /mnt/data/heimdall:/heimdall-home:rw --net polygon --name heimdallrest --entrypoint /usr/bin/heimdalld -d --restart unless-stopped 0xpolygon/heimdall:0.3.4 rest-server --home=/heimdall-home --node "tcp://heimdall:26657"
```

There are two pieces of this command that are different and worth noting. Rather than running the `start` command, we’re running the `rest-server` command. Also, we’re passing `~–node “tcp://heimdall:26657”~` which tells the rest server how to communicate with Heimdall.

If this command runs successfully, when you run `docker ps`, you should see two commands containers running now. Additionally, if you run this command you should see some basic output:

```bash
curl localhost:1317/bor/span/1
```

Bor will rely on this interface. So if you don’t see JSON output, there is something wrong!

Now let’s download the `genesis` file for Bor specifically:

```bash
sudo curl -o /mnt/data/bor/genesis.json 'https://raw.githubusercontent.com/maticnetwork/bor/master/builder/files/genesis-mainnet-v1.json'
```

Let’s verify the `sha256 sum` again for this file:

```
# sha256sum genesis.json
4bacbfbe72f0d966412bb2c19b093f34c0a1bd4bb8506629eba1c9ca8c69c778  genesis.json
```

Now we need to create a default config file for starting Bor.

```bash
docker run -it  0xpolygon/bor:0.4.0 dumpconfig | sudo tee /mnt/data/bor/config.toml
```

This command is going to generate a .toml file with default settings. We’re going to make a few changes to the file, so open it up with your favorite editor and make a few updates. Note: we’re only showing the lines that are changed.

For reference, you can see the details for the Bor image here: [https://hub.docker.com/repository/docker/0xpolygon/bor](https://hub.docker.com/repository/docker/0xpolygon/bor)

``` bash
# Similar to moniker, you might want to update this with a name of your own choosing
identity = "docker.example"

# Setting this to the location of a mount that we'll make
datadir = "/bor-home"

# We'll want to specify some boot nodes
[p2p]
  [pep.discovery]
    bootnodes = ["enode://0cb82b395094ee4a2915e9714894627de9ed8498fb881cec6db7c65e8b9a5bd7f2f25cc84e71e89d0947e51c76e85d0847de848c7782b13c0255247a6758178c@44.232.55.71:30303", "enode://88116f4295f5a31538ae409e4d44ad40d22e44ee9342869e7d68bdec55b0f83c1530355ce8b41fbec0928a7d75a5745d528450d30aec92066ab6ba1ee351d710@159.203.9.164:30303"]

# Because we're running inside docker, we'll likely need to change the way we connect to heimdall
[heimdall]
  url = "http://heimdallrest:1317"

# Assumming you want to access the RPC, you'll need to make a change here as well
[jsonrpc]
  [jsonrpc.http]
    enabled = true
    host = "0.0.0.0"
```

At this point, we should be ready to start Bor. We’re going to use this command:
``` bash
docker run -p 30303:30303 -p 8545:8545 -v /mnt/data/bor:/bor-home:rw --net polygon --name bor -d --restart unless-stopped  0xpolygon/bor:0.4.0 server --config /bor-home/config.toml
```

If everything went well, you should see lots of logs that look like this:

```bash
2022-12-14T19:53:51.989897291Z INFO [12-14|19:53:51.989] Fetching state updates from Heimdall     fromID=4 to=2020-05-30T23:47:46Z
2022-12-14T19:53:51.989925064Z INFO [12-14|19:53:51.989] Fetching state sync events               queryParams="from-id=4&to-time=1590882466&limit=50"
2022-12-14T19:53:51.997640841Z INFO [12-14|19:53:51.997] StateSyncData                            Gas=0       Block-number=12800 LastStateID=3 TotalRecords=0
2022-12-14T19:53:52.021990622Z INFO [12-14|19:53:52.021] Fetching state updates from Heimdall     fromID=4 to=2020-05-30T23:49:58Z
2022-12-14T19:53:52.022015930Z INFO [12-14|19:53:52.021] Fetching state sync events               queryParams="from-id=4&to-time=1590882598&limit=50"
2022-12-14T19:53:52.040660857Z INFO [12-14|19:53:52.040] StateSyncData                            Gas=0       Block-number=12864 LastStateID=3 TotalRecords=0
2022-12-14T19:53:52.064795784Z INFO [12-14|19:53:52.064] Fetching state updates from Heimdall     fromID=4 to=2020-05-30T23:52:10Z
2022-12-14T19:53:52.064828634Z INFO [12-14|19:53:52.064] Fetching state sync events               queryParams="from-id=4&to-time=1590882730&limit=50"
2022-12-14T19:53:52.085029612Z INFO [12-14|19:53:52.084] StateSyncData                            Gas=0       Block-number=12928 LastStateID=3 TotalRecords=0
2022-12-14T19:53:52.132067703Z INFO [12-14|19:53:52.131] ✅ Committing new span                    id=3                startBlock=13056 endBlock=19455 validatorBytes=f8b6d906822710940375b2fc7140977c9c76d45421564e354ed42277d9078227109442eefcda06ead475cde3731b8eb138e88cd0bac3d9018238a2945973918275c01f50555d44e92c9d9b353cadad54d905822710947fcd58c2d53d980b247f1612fdba93e9a76193e6d90482271094b702f1c9154ac9c08da247a8e30ee6f2f3373f41d90282271094b8bb158b93c94ed35c1970d610d1e2b34e26652cd90382271094f84c74dea96df0ec22e11e7c33996c73fcc2d822 producerBytes=f8b6d906822710940375b2fc7140977c9c76d45421564e354ed42277d9078227109442eefcda06ead475cde3731b8eb138e88cd0bac3d9018238a2945973918275c01f50555d44e92c9d9b353cadad54d905822710947fcd58c2d53d980b247f1612fdba93e9a76193e6d90482271094b702f1c9154ac9c08da247a8e30ee6f2f3373f41d90282271094b8bb158b93c94ed35c1970d610d1e2b34e26652cd90382271094f84c74dea96df0ec22e11e7c33996c73fcc2d822
2022-12-14T19:53:52.133545235Z INFO [12-14|19:53:52.133] Fetching state updates from Heimdall     fromID=4 to=2020-05-30T23:54:22Z
2022-12-14T19:53:52.133578948Z INFO [12-14|19:53:52.133] Fetching state sync events               queryParams="from-id=4&to-time=1590882862&limit=50"
2022-12-14T19:53:52.135049605Z INFO [12-14|19:53:52.134] StateSyncData                            Gas=0       Block-number=12992 LastStateID=3 TotalRecords=0
2022-12-14T19:53:52.152067646Z INFO [12-14|19:53:52.151] Fetching state updates from Heimdall     fromID=4 to=2020-05-30T23:56:34Z
2022-12-14T19:53:52.152198357Z INFO [12-14|19:53:52.151] Fetching state sync events               queryParams="from-id=4&to-time=1590882994&limit=50"
2022-12-14T19:53:52.176617455Z INFO [12-14|19:53:52.176] StateSyncData                            Gas=0       Block-number=13056 LastStateID=3 TotalRecords=0
2022-12-14T19:53:52.191060112Z INFO [12-14|19:53:52.190] Fetching state updates from Heimdall     fromID=4 to=2020-05-30T23:58:46Z
2022-12-14T19:53:52.191083740Z INFO [12-14|19:53:52.190] Fetching state sync events               queryParams="from-id=4&to-time=1590883126&limit=50"
2022-12-14T19:53:52.223836639Z INFO [12-14|19:53:52.223] StateSyncData                            Gas=0       Block-number=13120 LastStateID=3 TotalRecords=0
2022-12-14T19:53:52.236025906Z INFO [12-14|19:53:52.235] Fetching state updates from Heimdall     fromID=4 to=2020-05-31T00:00:58Z
2022-12-14T19:53:52.236053406Z INFO [12-14|19:53:52.235] Fetching state sync events               queryParams="from-id=4&to-time=1590883258&limit=50"
2022-12-14T19:53:52.269611566Z INFO [12-14|19:53:52.269] StateSyncData                            Gas=0       Block-number=13184 LastStateID=3 TotalRecords=0
2022-12-14T19:53:52.283199351Z INFO [12-14|19:53:52.283] Fetching state updates from Heimdall     fromID=4 to=2020-05-31T00:03:10Z
2022-12-14T19:53:52.283737573Z INFO [12-14|19:53:52.283] Fetching state sync events               queryParams="from-id=4&to-time=1590883390&limit=50"
2022-12-14T19:53:52.314141359Z INFO [12-14|19:53:52.314] StateSyncData                            Gas=0       Block-number=13248 LastStateID=3 TotalRecords=0
2022-12-14T19:53:52.325150782Z INFO [12-14|19:53:52.325] Fetching state updates from Heimdall     fromID=4 to=2020-05-31T00:05:22Z
2022-12-14T19:53:52.325171075Z INFO [12-14|19:53:52.325] Fetching state sync events               queryParams="from-id=4&to-time=1590883522&limit=50"
2022-12-14T19:53:52.354470271Z INFO [12-14|19:53:52.354] StateSyncData                            Gas=0       Block-number=13312 LastStateID=3 TotalRecords=0
2022-12-14T19:53:52.372354857Z INFO [12-14|19:53:52.372] Fetching state updates from Heimdall     fromID=4 to=2020-05-31T00:07:34Z
2022-12-14T19:53:52.372389214Z INFO [12-14|19:53:52.372] Fetching state sync events               queryParams="from-id=4&to-time=1590883654&limit=50"
2022-12-14T19:53:52.398246950Z INFO [12-14|19:53:52.398] StateSyncData                            Gas=0       Block-number=13376 LastStateID=3 TotalRecords=0
2022-12-14T19:53:52.413321099Z INFO [12-14|19:53:52.413] Fetching state updates from Heimdall     fromID=4 to=2020-05-31T00:09:46Z
2022-12-14T19:53:52.413345355Z INFO [12-14|19:53:52.413] Fetching state sync events               queryParams="from-id=4&to-time=1590883786&limit=50"
2022-12-14T19:53:52.437176855Z INFO [12-14|19:53:52.437] StateSyncData                            Gas=0       Block-number=13440 LastStateID=3 TotalRecords=0
2022-12-14T19:53:52.450356966Z INFO [12-14|19:53:52.450] Fetching state updates from Heimdall     fromID=4 to=2020-05-31T00:11:58Z
```

There are a few ways to check the sync state of Bor. The simplest is with `curl`:

```bash
curl 'localhost:8545/' \
--header 'Content-Type: application/json' \
-d '{
	"jsonrpc":"2.0",
	"method":"eth_syncing",
	"params":[],
	"id":1
}'
```

When you run this command, it will give you a result like:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "currentBlock": "0x2eebf",
    "healedBytecodeBytes": "0x0",
    "healedBytecodes": "0x0",
    "healedTrienodeBytes": "0x0",
    "healedTrienodes": "0x0",
    "healingBytecode": "0x0",
    "healingTrienodes": "0x0",
    "highestBlock": "0x1d4ee3e",
    "startingBlock": "0x0",
    "syncedAccountBytes": "0x0",
    "syncedAccounts": "0x0",
    "syncedBytecodeBytes": "0x0",
    "syncedBytecodes": "0x0",
    "syncedStorage": "0x0",
    "syncedStorageBytes": "0x0"
  }
}
```

This will indicate the `currentBlock` that’s been synced and also the `highestBlock` that we’re aware of. If the node is already synced, we should get `false`.

## Seed nodes and bootnodes

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

</TabItem>

<TabItem value="ansible">

An [Ansible playbook](https://docs.ansible.com/ansible/latest/user_guide/playbooks_intro.html) is used to
configure and manage a full node. See the [Minimum Technical Requirements](technical-requirements.md) guide for the system requirements.

## Prerequisites

- Install Ansible on your local machine with Python3.x. The setup will not work if you have Python2.x.
    - To install Ansible with Python 3.x, you can use pip. If you do not have pip on your machine,
      follow the steps outlined [here](https://pip.pypa.io/en/stable/). Run `pip3 install ansible` to install
      Ansible.
- Check the [Polygon PoS Ansible repository](https://github.com/maticnetwork/node-ansible#requirements) for
  requirements.
- You will also need to ensure that Go is **not installed** in your environment. You will run into issues if you attempt to set up your full node through Ansible with Go installed as Ansible requires specific packages of Go to be installed.
- You will also need to make sure that your VM / Machine does not have any previous setups for Polygon Validator or Heimdall or Bor. You will need to delete them as your setup will run into issues.

:::info Heimdall source enhancements

The latest Heimdall version, **[v0.3.4](https://github.com/maticnetwork/heimdall/releases/tag/v0.3.4)**, contains a few enhancements.
The delay time between the contract events of different validators **has been increased** to ensure that the mempool doesn't get filled
quickly in case of a burst of events that could hamper the chain's progress.

Additionally, the data size **has been restricted in state sync txs to 30Kb (when represented in bytes) and 60Kb (when defined as string)**.
For example:

```bash
Data - "abcd1234"
Length in string format - 8
Hex Byte representation - [171 205 18 52]
Length in byte format - 4
```
:::

## Full node setup

- Ensure you have access to the remote machine or VM on which the full node is being set up.
  > Refer to [https://github.com/maticnetwork/node-ansible#setup](https://github.com/maticnetwork/node-ansible#setup) for more details.
- Clone the [https://github.com/maticnetwork/node-ansible](https://github.com/maticnetwork/node-ansible) repository.
- Navigate into the node-ansible folder: `cd node-ansible`
- Edit the `inventory.yml` file and insert your IP(s) in the `sentry->hosts` section.
  > Refer to [https://github.com/maticnetwork/node-ansible#inventory](https://github.com/maticnetwork/node-ansible#inventory) for more details.
- Check if the remote machine is reachable by running: `ansible sentry -m ping`
- To test if the correct machine is configured, run the following command:

  ```bash
  # Mainnet:
  ansible-playbook playbooks/network.yml --extra-var="bor_version=v0.4.0 heimdall_version=v0.3.4 network=mainnet node_type=sentry" --list-hosts

  # Testnet:
  ansible-playbook playbooks/network.yml --extra-var="bor_version=v0.4.0 heimdall_version=v0.3.4 network=mumbai node_type=sentry" --list-hosts
  ```

  <img src={useBaseUrl("img/network/full-node-mumbai.png")} />

- Next, set up the full node with this command:

  ```bash
  # Mainnet:
  ansible-playbook playbooks/network.yml --extra-var="bor_version=v0.4.0 heimdall_version=v0.3.4 network=mainnet node_type=sentry"

  # Testnet:
  ansible-playbook playbooks/network.yml --extra-var="bor_version=v0.4.0 heimdall_version=v0.3.4 network=mumbai node_type=sentry"
  ```

- In case you run into any issues, delete and clean the whole setup using:
  ```
  ansible-playbook playbooks/clean.yml
  ```

- Once you initiate the Ansible playbook, log in to the remote machine.

- Please **ensure that the value of seeds and bootnodes mentioned below is the same value as mentioned in Heimdall and Bor `config.toml` files**. If not, change the values accordingly.

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

- To check if Heimdall is synced
    - On the remote machine/VM, run `curl localhost:26657/status`
    - In the output, `catching_up` value should be `false`

- Once Heimdall is synced, run
    - `sudo service bor start`

You have successfully set up a full node with Ansible.

:::note

If Bor presents an error of permission to data, run this command to make the Bor user the owner of the Bor files:

```bash
sudo chown bor /var/lib/bor
```

:::
## Logs

Logs can be managed by the `journalctl` linux tool. Here is a tutorial for advanced usage: [How To Use Journalctl to View and Manipulate Systemd Logs](https://www.digitalocean.com/community/tutorials/how-to-use-journalctl-to-view-and-manipulate-systemd-logs).

**Check Heimdall node logs**

```bash
journalctl -u heimdalld.service -f
```

**Check Bor Rest-server logs**

```bash
journalctl -u bor.service -f
```

## Ports and Firewall Setup

Open ports 22, 26656 and 30303 to world (0.0.0.0/0) on sentry node firewall.

You can use VPN to restrict access for port 22 as per your requirement and security guidelines.

</TabItem>
<TabItem value ="package">

## Overview

- Prepare the Full Node machine.
- Install Heimdall and Bor packages on the Full Node machine.
- Configure the Full node.
- Start the Full node.
- Check node health with the community.

:::note
You have to follow the exact outlined sequence of actions, otherwise you will run into issues.
:::

## Install packages

#### Prerequisites

- One machine is needed.
- Bash is installed on the machine.

#### Heimdall

- Install the default latest version of sentry for Mainnet:

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

#### Bor

- Install the default latest version of sentry for Mainnet:

    ```shell
    curl -L https://raw.githubusercontent.com/maticnetwork/install/main/bor.sh | bash
    ```

    or install a specific version, node type (`sentry` or `validator`), and network (`mainnet` or `mumbai`). All release versions could be found on
    [Bor Github repository](https://github.com/maticnetwork/bor/releases).

    ```shell
    curl -L https://raw.githubusercontent.com/maticnetwork/install/main/bor.sh | bash -s -- <version> <network> <node_type>

    # Example:
    # curl -L https://raw.githubusercontent.com/maticnetwork/install/main/bor.sh | bash -s -- v0.4.0
    
    
    mainnet sentry
    ```


## Configuration

In this section, we will go through steps to initialize and customize configurations nodes.

:::caution

Bor and Heimdall 0.3.0 use standardized paths for configuration files and chain data. If you have existing
config files and chain data on your node, please skip the [Configure Heimdall](#configure-heimdall) section below and jump directly to **[Migration](#upgrade-from-02x-to-03x) section** to learn about migrating configs and data to standardized file locations.

:::

### Configure Heimdall

- Initialize Heimdall configs

```shell
# For mainnet
sudo -u heimdall heimdalld init --chain=mainnet --home /var/lib/heimdall

# For testnet
sudo -u heimdall heimdalld init --chain=mumbai --home /var/lib/heimdall
```

- You will need to add a few details in the `config.toml` file. To open the `config.toml` file run the following command `vi /var/lib/heimdall/config/config.toml`

    - Now in the config file you will have to change `Moniker`

    ```shell
    moniker=<enter unique identifier> For example, moniker=my-sentry-node
    ```

    - Change the value of **Prometheus** to `true`
    - Set the `max_open_connections` value to `100`

    Make sure you keep the proper formatting when you make the changes above.

### Configure service files for bor and heimdall

After successfully installing Bor and Heimdall through [packages](#install-with-packages-recommended), their service file could be found under `/lib/systemd/system`, and Bor's config
file could be found under `/var/lib/bor/config.toml`.
You will need to check and modify these files accordingly.

- Make sure the chain is set correctly in `/lib/systemd/system/heimdalld.service` file. Open the file with following command `sudo vi /lib/systemd/system/heimdalld.service`

    - In the service file, set `--chain` to `mainnet` or `mumbai` accordingly

  Save the changes in `/lib/systemd/system/heimdalld.service`.

- Make sure the chain is set correctly in `/var/lib/bor/config.toml` file. Open the file with following command `sudo vi /var/lib/bor/config.toml`

    - In the config file, set `chain` to `mainnet` or `mumbai` accordingly.

    - To enable Archive mode you can optionally enable the following flags:

      ```
      gcmode "archive"

      [jsonrpc]
        [jsonrpc.ws]
          enabled = true
          port = 8546
          corsdomain = ["*"]
      ```

  Save the changes in `/var/lib/bor/config.toml`.


## Start services

Reloading service files to make sure all changes to service files are loaded correctly.

```shell
sudo systemctl daemon-reload
```

Start Heimdall, Heimdall rest server, and Heimdall bridge.

```shell
sudo service heimdalld start
```

You can also check Heimdall logs with command

```shell
journalctl -u heimdalld.service -f
```

Now you need to make sure that **Heimdall is synced** completely and only then Start Bor. If you start Bor without Heimdall syncing completely, you will run into issues frequently.

- To check if Heimdall is synced
    - On the remote machine/VM, run `curl localhost:26657/status`
    - In the output, `catching_up` value should be `false`

Now once Heimdall is synced, run

```shell
sudo service bor start
```

You can check Bor logs via command

```shell
journalctl -u bor.service -f
```

</TabItem>

<TabItem value="gcp">

In this document, we will describe how to deploy Polygon nodes into a Virtual Machine instance on the Google Cloud Platform (GCP).

Before we start, please check the minimum and recommended [hardware requirements](technical-requirements.md).

It is recommended to use any modern Debian or Linux Ubuntu OS with long-term support, i.e. Debian 11, Ubuntu 20.04. We'll focus on Ubuntu 20.04 in this guide.

## Deploy VM Instance

You may use any of the following ways to create an instance in Google Cloud:

1. Google Cloud CLI, local or [Cloud Shell](https://cloud.google.com/shell)
2. Web Console

We'll only cover the first case in this manual. Let's start with deployment using Google Cloud CLI.

1. Follow ["Before you begin" section](https://cloud.google.com/compute/docs/instances/create-start-instance#before-you-begin) to install and configure gcloud command-line tool.
Pay attention to default region and zone, choose ones closer to you or your customers. You may use [gcping.com](https://gcping.com) to measure latency to choose the closest location.

2. Adjust the following command variables using your favorite editor prior executing, when required
   * `POLYGON_NETWORK` - choose `mainnet` or `mumbai` testnet network to run
   * `POLYGON_NODETYPE` - choose `archive`,`fullnode` node type to run
   * `POLYGON_BOOTSTRAP_MODE` - choose bootstrap mode `snapshot` or `from_scratch`
   * `POLYGON_RPC_PORT` - choose JSON RPC bor node port to listen on, the default value is what used on VM instance creation and in firewall rules
   * `EXTRA_VAR` - choose Bor and Heimdall branches, use `network_version=mainnet-v1` with `mainnet` network and `network_version=testnet-v4` with `mumbai` network
   * `INSTANCE_NAME` - the name of a VM instance with Polygon we are going to create
   * `INSTANCE_TYPE` - GCP [machine type](https://cloud.google.com/compute/docs/machine-types), default value is recommended, You may change it later if required
   * `BOR_EXT_DISK_SIZE` - additional disk size in GB to use with Bor, default value with `fullnode` is recommended, You may expand it later if required. You'll need 8192GB+ with `archive` node though
   * `HEIMDALL_EXT_DISK_SIZE` - additional disk size in GB to use with Heimdall, default value is recommended
   * `DISK_TYPE` - GCP [disk type](https://cloud.google.com/compute/docs/disks#disk-types), SSD is highly recommended. You may need to increase the total SSD GB quota in the region you are spinning up the node.

3. Use the following command to create an instance with correct hardware and software requirements. In the example below, we deploy Polygon `mainnet` from `snapshot` in the `fullnode` mode:
   ```bash
      export POLYGON_NETWORK=mainnet
      export POLYGON_NODETYPE=fullnode
      export POLYGON_BOOTSTRAP_MODE=snapshot
      export POLYGON_RPC_PORT=8747
      export GCP_NETWORK_TAG=polygon
      export EXTRA_VAR=(bor_branch=v0.4.0 heimdall_branch=v0.3.4  network_version=mainnet-v1 node_type=sentry/sentry heimdall_network=${POLYGON_NETWORK})
      gcloud compute firewall-rules create "polygon-p2p" --allow=tcp:26656,tcp:30303,udp:30303 --description="polygon p2p" --target-tags=${GCP_NETWORK_TAG}
      gcloud compute firewall-rules create "polygon-rpc" --allow=tcp:${POLYGON_RPC_PORT} --description="polygon rpc" --target-tags=${GCP_NETWORK_TAG}
      export INSTANCE_NAME=polygon-0
      export INSTANCE_TYPE=e2-standard-8
      export BOR_EXT_DISK_SIZE=1024
      export HEIMDALL_EXT_DISK_SIZE=500
      export DISK_TYPE=pd-ssd
      gcloud compute instances create ${INSTANCE_NAME} \
      --image-project=ubuntu-os-cloud \
      --image-family=ubuntu-2004-lts \
      --boot-disk-size=20 \
      --boot-disk-type=${DISK_TYPE} \
      --machine-type=${INSTANCE_TYPE} \
      --create-disk=name=${INSTANCE_NAME}-bor,size=${BOR_EXT_DISK_SIZE},type=${DISK_TYPE},auto-delete=no \
      --create-disk=name=${INSTANCE_NAME}-heimdall,size=${HEIMDALL_EXT_DISK_SIZE},type=${DISK_TYPE},auto-delete=no \
      --tags=${GCP_NETWORK_TAG} \
      --metadata=user-data='
      #cloud-config

      bootcmd:
      - screen -dmS polygon su -l -c bash -c "curl -L https://raw.githubusercontent.com/maticnetwork/node-ansible/master/install-gcp.sh | bash -s -- -n '${POLYGON_NETWORK}' -m '${POLYGON_NODETYPE}' -s '${POLYGON_BOOTSTRAP_MODE}' -p '${POLYGON_RPC_PORT}' -e \"'${EXTRA_VAR}'\"; bash"'
   ```

The instance should be created and live in a couple of minutes.

## Login to VM

It will take a couple of minutes to install all the required software and a couple of hours to download a snapshot when chosen.

- You should see working `bor` and `heimdalld` processes filling up additional drives. You may run the following commands to check it.

   ```bash
   gcloud compute ssh ${INSTANCE_NAME}
   # inside the connected session
   sudo su -

   ps uax|egrep "bor|heimdalld"
   df -l -h
   ```

- You may use the following command to watch the installation progress, it's really handy in case of `snapshot` bootstrap:

   ```bash
   # inside the connected session
   screen -dr
   ```

   Use `Control+a d` key combination to disconnect from progress review.

- You may use the following commands to get Bor and Heimdall logs:

   ```bash
   # inside the connected session
   journalctl -fu bor
   journalctl -fu heimdalld
   ```

:::note

Blockchain data is saved onto additional drives which are kept by default on VM instance removal. You need to remove additional disks manually if you don't need this data anymore.

:::

At the end, you will get an instance as shown in the below diagram.

<img src={useBaseUrl("img/mainnet/polygon-instance.svg")} />

</TabItem>
</Tabs>

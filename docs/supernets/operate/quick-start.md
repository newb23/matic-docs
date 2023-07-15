---
id: supernets-quick-start
title: Quick Start
sidebar_label: Quick Start
description: "Spin up a new childchain instance with one-click."
keywords:
  - docs
  - polygon
  - edge
  - supernets
  - quick
  - deploy
  - cluster
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DownloadButton from '@site/src/data/DownloadButton';

Before proceeding, ensure that your system meets the necessary [system requirements](/docs/supernets/operate/system.md).

## Spawn a local Supernet in 2 minutes

To access the pre-built releases, visit the [GitHub releases page](https://github.com/0xPolygon/polygon-edge/releases). The client provides cross-compiled AMD64/ARM64 binaries for Darwin and Linux.

To run the Supernets test environment locally, run the following command from the project's root:

  ```bash
  ./scripts/cluster polybft
  ```

**That's it! You should have successfully been able to start a local Supernet just by running the script.**

> - Stop the network: "CTRL/Command C" or `./scripts/cluster polybft stop`.
> - Destroy the network: `./scripts/cluster polybft destroy`.

<details>
<summary>Deployment script details ↓</summary>

The script is available under the "scripts" directory of the client.
These are the optional configuration parameters you can pass to the script:

<details>
<summary>Flags ↓</summary>

| Flag | Description | Default Value |
|------|-------------|---------------|
| --block-gas-limit | Maximum gas allowed for a block. | 10000000 |
| --premine | Address and amount of tokens to premine in the genesis block. | 0x85da99c8a7c2c95964c8efd687e95e632fc533d6:1000000000000000000000 |
| --epoch-size | Number of blocks per epoch. | 10 |
| --data-dir | Directory to store chain data. | test-chain- |
| --num | Number of nodes in the network. | 4 |
| --bootnode | Bootstrap node address in multiaddress format. | /ip4/127.0.0.1/tcp/30301/p2p/... |
| --insecure | Disable TLS. | |
| --log-level | Logging level for validators. | INFO |
| --seal | Enable block sealing. | |
| --help | Print usage information. | |

</details>

After running the command, the test network will be initialized with PolyBFT consensus engine and the genesis file will be created. Then, the four validators will start running, and their log outputs will be displayed in the terminal.

By default, this will start a Supernets network with PolyBFT consensus engine, four validators, and premine of 1 billion tokens at address `0x85da99c8a7c2c95964c8efd687e95e632fc533d6`.

The nodes will continue to run until stopped manually. To stop the network, open a new session and use the following command, or, simply press "CTRL/Command C" in the CLI:

  ```bash
  ./scripts/cluster polybft stop
  ```

go
go
If you want to destroy the environment, use the following command:

  ```bash
  ./scripts/cluster polybft destroy
  ```

### Explanation of the deployment script

The deployment script is a wrapper script for starting a Supernets test network with PolyBFT consensus engine. It offers the following functionality:

- Initialize the network with either IBFT or PolyBFT consensus engine.
- Create the genesis file for the test network.
- Start the validators on four separate ports.
- Write the logs to separate log files for each validator.
- Stop and destroy the environment when no longer needed.
- The script also allows you to choose between running the environment from a local binary or a Docker container.

For reference, it is referenced below.

<details>
<summary>cluster</summary>

```sh
#!/usr/bin/env bash

function initIbftConsensus() {
  echo "Running with ibft consensus"
  ./polygon-edge secrets init --insecure --data-dir test-chain- --num 4

  node1_id=$(./polygon-edge secrets output --data-dir test-chain-1 | grep Node | head -n 1 | awk -F ' ' '{print $4}')
  node2_id=$(./polygon-edge secrets output --data-dir test-chain-2 | grep Node | head -n 1 | awk -F ' ' '{print $4}')

  genesis_params="--consensus ibft --ibft-validators-prefix-path test-chain- \
    --bootnode /ip4/127.0.0.1/tcp/30301/p2p/$node1_id \
    --bootnode /ip4/127.0.0.1/tcp/30302/p2p/$node2_id"
}

function initPolybftConsensus() {
  echo "Running with polybft consensus"
  genesis_params="--consensus polybft"

  address1=$(./polygon-edge polybft-secrets --insecure --data-dir test-chain-1 | grep Public | head -n 1 | awk -F ' ' '{print $5}')
  address2=$(./polygon-edge polybft-secrets --insecure --data-dir test-chain-2 | grep Public | head -n 1 | awk -F ' ' '{print $5}')
  address3=$(./polygon-edge polybft-secrets --insecure --data-dir test-chain-3 | grep Public | head -n 1 | awk -F ' ' '{print $5}')
  address4=$(./polygon-edge polybft-secrets --insecure --data-dir test-chain-4 | grep Public | head -n 1 | awk -F ' ' '{print $5}')
}

function createGenesis() {
  ./polygon-edge genesis $genesis_params \
    --block-gas-limit 10000000 \
    --premine 0x85da99c8a7c2c95964c8efd687e95e632fc533d6:1000000000000000000000 \
    --premine 0x0000000000000000000000000000000000000000 \
    --epoch-size 10 \
    --burn-contract 0:0x0000000000000000000000000000000000000000 \
    --reward-wallet 0xDEADBEEF:1000000
}

function initRootchain() {
  echo "Initializing rootchain"

  if [ "$1" == "write-logs" ]; then
    echo "Writing rootchain server logs to the file..."
    ./polygon-edge rootchain server 2>&1 | tee ./rootchain-server.log &
  else
    ./polygon-edge rootchain server >/dev/null &
  fi

  set +e
  t=1
  while [ $t -gt 0 ]; do
    nc -z 127.0.0.1 8545 </dev/null
    t=$?
    sleep 1
  done
  set -e

  ./polygon-edge polybft stake-manager-deploy \
    --jsonrpc http://127.0.0.1:8545 \
    --test

  stakeManagerAddr=$(cat genesis.json | jq -r '.params.engine.polybft.bridge.stakeManagerAddr')
  stakeToken=$(cat genesis.json | jq -r '.params.engine.polybft.bridge.stakeTokenAddr')

  ./polygon-edge rootchain deploy \
    --stake-manager ${stakeManagerAddr} \
    --test

  customSupernetManagerAddr=$(cat genesis.json | jq -r '.params.engine.polybft.bridge.customSupernetManagerAddr')
  supernetID=$(cat genesis.json | jq -r '.params.engine.polybft.supernetID')

  ./polygon-edge rootchain fund \
    --stake-token ${stakeToken} \
    --mint \
    --addresses ${address1},${address2},${address3},${address4} \
    --amounts 1000000000000000000000000,1000000000000000000000000,1000000000000000000000000,1000000000000000000000000

  ./polygon-edge polybft whitelist-validators \
    --addresses ${address1},${address2},${address3},${address4} \
    --supernet-manager ${customSupernetManagerAddr} \
    --private-key aa75e9a7d427efc732f8e4f1a5b7646adcc61fd5bae40f80d13c8419c9f43d6d \
    --jsonrpc http://127.0.0.1:8545

  counter=1
  while [ $counter -le 4 ]; do
    echo "Registering validator: ${counter}"

    ./polygon-edge polybft register-validator \
      --supernet-manager ${customSupernetManagerAddr} \
      --data-dir test-chain-${counter} \
      --jsonrpc http://127.0.0.1:8545

    ./polygon-edge polybft stake \
      --data-dir test-chain-${counter} \
      --amount 1000000000000000000000000 \
      --supernet-id ${supernetID} \
      --stake-manager ${stakeManagerAddr} \
      --stake-token ${stakeToken} \
      --jsonrpc http://127.0.0.1:8545

    ((counter++))
  done

  ./polygon-edge polybft supernet \
    --private-key aa75e9a7d427efc732f8e4f1a5b7646adcc61fd5bae40f80d13c8419c9f43d6d \
    --supernet-manager ${customSupernetManagerAddr} \
    --stake-manager ${stakeManagerAddr} \
    --finalize-genesis-set \
    --enable-staking \
    --jsonrpc http://127.0.0.1:8545
}

function startServerFromBinary() {
  if [ "$1" == "write-logs" ]; then
    echo "Writing validators logs to the files..."
    ./polygon-edge server --data-dir ./test-chain-1 --chain genesis.json \
      --grpc-address :10000 --libp2p :30301 --jsonrpc :10002 \
      --num-block-confirmations 2 --seal --log-level DEBUG 2>&1 | tee ./validator-1.log &
    ./polygon-edge server --data-dir ./test-chain-2 --chain genesis.json \
      --grpc-address :20000 --libp2p :30302 --jsonrpc :20002 \
      --num-block-confirmations 2 --seal --log-level DEBUG 2>&1 | tee ./validator-2.log &
    ./polygon-edge server --data-dir ./test-chain-3 --chain genesis.json \
      --grpc-address :30000 --libp2p :30303 --jsonrpc :30002 \
      --num-block-confirmations 2 --seal --log-level DEBUG 2>&1 | tee ./validator-3.log &
    ./polygon-edge server --data-dir ./test-chain-4 --chain genesis.json \
      --grpc-address :40000 --libp2p :30304 --jsonrpc :40002 \
      --num-block-confirmations 2 --seal --log-level DEBUG 2>&1 | tee ./validator-4.log &
    wait
  else
    ./polygon-edge server --data-dir ./test-chain-1 --chain genesis.json \
      --grpc-address :10000 --libp2p :30301 --jsonrpc :10002 \
      --num-block-confirmations 2 --seal --log-level DEBUG &
    ./polygon-edge server --data-dir ./test-chain-2 --chain genesis.json \
      --grpc-address :20000 --libp2p :30302 --jsonrpc :20002 \
      --num-block-confirmations 2 --seal --log-level DEBUG &
    ./polygon-edge server --data-dir ./test-chain-3 --chain genesis.json \
      --grpc-address :30000 --libp2p :30303 --jsonrpc :30002 \
      --num-block-confirmations 2 --seal --log-level DEBUG &
    ./polygon-edge server --data-dir ./test-chain-4 --chain genesis.json \
      --grpc-address :40000 --libp2p :30304 --jsonrpc :40002 \
      --num-block-confirmations 2 --seal --log-level DEBUG &
    wait
  fi
}

function startServerFromDockerCompose() {
  if [ "$1" != "polybft" ]
  then
    export EDGE_CONSENSUS="$1"
  fi

  docker-compose -f ./docker/local/docker-compose.yml up -d --build
}

function destroyDockerEnvironment() {
  docker-compose -f ./docker/local/docker-compose.yml down -v
}

function stopDockerEnvironment() {
  docker-compose -f ./docker/local/docker-compose.yml stop
}

set -e

# Reset test-dirs
rm -rf test-chain-*
rm -f genesis.json

# Build binary
go build -o polygon-edge .

# If --docker flag is set run docker environment otherwise run from binary
case "$2" in
"--docker")
  # cluster {consensus} --docker destroy
  if [ "$3" == "destroy" ]; then
    destroyDockerEnvironment
    echo "Docker $1 environment destroyed!"
    exit 0
  # cluster {consensus} --docker stop
  elif [ "$3" == "stop" ]; then
    stopDockerEnvironment
    echo "Docker $1 environment stoped!"
    exit 0
  fi

  # cluster {consensus} --docker
  echo "Running $1 docker environment..."
  startServerFromDockerCompose $1
  echo "Docker $1 environment deployed."
  exit 0
  ;;
# cluster {consensus}
*)
  echo "Running $1 environment from local binary..."
  # Initialize ibft or polybft consensus
  if [ "$1" == "ibft" ]; then
    # Initialize ibft consensus
    initIbftConsensus
    # Create genesis file and start the server from binary
    createGenesis
    startServerFromBinary $2
    exit 0
  elif [ "$1" == "polybft" ]; then
    # Initialize polybft consensus
    initPolybftConsensus
    # Create genesis file and start the server from binary
    createGenesis
    initRootchain $2
    startServerFromBinary $2
    exit 0
  else
    echo "Unsupported consensus mode. Supported modes are: ibft and polybft "
    exit 1
  fi
  ;;
esac
```

</details>
</details>

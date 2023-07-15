---
id: supernets-param-reference
title: Configuration Parameter Reference
sidebar_label: Configuration Parameter Reference
description: "Manpage for configurable parameters."
keywords:
  - docs
  - polygon
  - Supernets
  - flags
  - parameters
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Configuration parameters are crucial for setting up and operating a Supernet. You can configure these parameters using the genesis and server commands. Before running these commands, it is essential to generate keys using the polybft-secrets command.

For information on the available configuration flags and their descriptions for customizing the genesis configuration of a Supernet, refer to the categorized tabs below.

<Tabs
defaultValue="polybft"
values={[
{ label: 'PolyBFT', value: 'polybft', },
{ label: 'Genesis', value: 'genesis', },
{ label: 'Server', value: 'server', },
]
}>

<!-- ===================================================================================================================== -->
<!-- ==================================================== POLYBFT ======================================================== -->
<!-- ===================================================================================================================== -->

<TabItem value="polybft">

## PolyBFT Configuration Parameter Reference

| Parameter | Description                                                      | Default Value | Mandatory |
| :-------- | :--------------------------------------------------------------- | :------------ | :-------- |
| `--account`           | The flag indicating whether a new account is created              | TRUE          | NO        |
| `--config string`     | The path to the SecretsManager config file                        | ""            | NO        |
| `--data-dir string`   | The directory for the Polygon Edge data if the local FS is used   | ""            | YES       |
| `--insecure`          | The flag indicating whether the secrets stored locally are encrypted | FALSE      | NO        |
| `--network`           | The flag indicating whether a new Network key is created          | TRUE          | NO        |
| `--num int`           | The number of secrets to be created (only for local FS)           | 1             | NO        |
| `--output`            | The flag indicating whether to output existing secrets             | FALSE        | NO        |
| `--private`           | The flag indicating whether the private key is printed            | FALSE         | NO        |

:::info Mutually Exclusive Paramaters

- `--config` and `--data-dir`: These flags are mutually exclusive. Use either `--config` to specify the path to the SecretsManager config file or `--data-dir` to set the directory for the Polygon Edge data if the local FS is used.

- `--num` and `--config`: These flags are mutually exclusive. Set `--num` to define the number of secrets to be created (only for local FS) or use `--config` to provide the SecretsManager config file path.

:::

</TabItem>

<!-- ===================================================================================================================== -->
<!-- ==================================================== GENESIS ======================================================== -->
<!-- ===================================================================================================================== -->

<TabItem value="genesis">

## Genesis Configuration Parameter Reference

| Parameter | Description | Default Value | Mandatory | Example | Reconfigurable at Runtime |
| :-------- | :---------- | :------------ | :-------- | :------ | :----------------------- |
| `--block-gas-limit` | The maximum amount of gas used by all transactions in a block | 5242880 | NO | `genesis --block-gas-limit "10000000"` | NO |
| `--block-time` | The predefined period which determines block creation frequency | 2s | NO | `genesis --block-time "10s"` | NO |
| `--block-time-drift` | Configuration for block time drift value (in seconds). Defines the time slot in which a new block can be created | 10 | NO | `genesis --block-time-drift "20"` | NO |
| `--bootnode` | MultiAddr URL for p2p discovery bootstrap. This flag can be used multiple times. | N/A | NO | `genesis --bootnode "/ip4/127.0.0.1/tcp/30301/p2p/16Uiu2HAmBW3zAvTEHGj5DDygJ5AzuvaRdY5wtSLNmkvXfaQensBu"` | NO |
| `--bridge-allow-list-admin` | List of addresses to use as admin accounts in the bridge allow list. | []string{} | NO | `genesis --bridge-allow-list-admin "0x2f82ad5785F6f3Fd242e7EC7a03c2cDfBA6cC6D1"` | NO |
| `--bridge-allow-list-enabled` | List of addresses to enable by default in the bridge allow list. | []string{} | NO | `genesis --bridge-allow-list-enabled "0xbB39871E4e399b22428FdfA9E4e4Ca67842EA8Cd"` | NO |
| `--burn-contract` | The burn contract blocks and addresses (format: [block]:[address]) | []string{} | NO | `genesis --burn-contract "0:0x0000000000000000000000000000000000000000"` | NO |
| `--consensus` | The consensus protocol to be used | "polybft" | NO | `genesis --consensus polybft` | NO |
| `--dir` | Represents the file path for the genesis data | "./genesis.json" | NO | `genesis --dir "/data/genesis.json"` | NO |
| `--epoch-reward` | Reward size for block sealing | 1 | NO | `genesis --epoch-reward "10"` | NO |
| `--epoch-size` | The epoch size for the chain | 100000 | NO | `genesis --epoch-size "10"` | NO |
| `--name` | The name for the chain | "polygon-edge" | NO | `genesis --name "test-chain"` | NO |
| `--premine` | The premined accounts and balances | []string{} | NO | `genesis --premine 0x85da99c8a7c2c95964c8efd687e95e632fc533d6:1000000000000000000000` | NO |
| `--sprint-size` | The number of blocks included into a sprint | 5 | NO | `genesis --sprint-size "2"` | NO |
| `--trieroot` | Trie root from the corresponding triedb | "" | NO | `genesis --trieroot "0xabc123"` | NO |
| `--validators` | Initial validator addresses for the chain | []string{} | YES | `genesis --validators "0x9c106ada8a2a36a9de8d67b347c07156033882e0"` | NO |
| `--validators-path` | Root path containing polybft validators' secrets | "./" | NO | `genesis --validators-path "/data/validators"` | NO |
| `--validators-secret` | Validators secrets | []string{} | NO | `genesis --validators-secret "0x0101010101010101010101010101010101010101010101010101010101010101"` | NO |
| `--artifacts-path` | The path to the contract artifacts JSON | "" | YES | `genesis predeploy --artifacts-path "artifacts.json"` | NO |
| `--chain` | The genesis file to update | "./genesis.json" | NO | `genesis predeploy --chain "/data/genesis.json"` | NO |
| `--constructor-args` | The constructor arguments, if any | "" | NO | `genesis predeploy --constructor-args ""` | NO |
| `--predeploy-address` | The address to predeploy to. Must be >= 0x0000000000000000000000000000000000001100 | "0x0000000000000000000000000000000000001100" | YES | `genesis predeploy --predeploy-address "0x0000000000000000000000000000000000001111"` | NO |

:::info Mutually Exclusive Paramaters

- `--validators`: Validators defined by the user (format: `<P2P multi address>:<public ECDSA address>:<public BLS key>`). If this flag is set, the entire multi address must be specified. If not set, validators configuration will be read from `--validators-path`.
- `--validators-path`: Root path containing polybft validators' secrets. If `--validators` flag is not specified, validators' configuration will be read from this path.
- `--validators-prefix`: Folder prefix names for polybft validators' secrets. If `--validators` flag is set, this prefix will be used for folder names.

:::

</TabItem>

<!-- ===================================================================================================================== -->
<!-- ==================================================== SERVER ========================================================= -->
<!-- ===================================================================================================================== -->

<TabItem value="server">

## Server Configuration Parameter Reference

| Parameter | Description | Default Value | Mandatory | Example | Reconfigurable at Runtime |
| :-------- | :---------- | :------------ | :-------- | :------ | :----------------------- |
| `--grpc-address` string | The address of the GRPC interface. | "127.0.0.1:9632" | NO | Command: server Flag: --grpc-address “0.0.0.0:10000” | NO |
| `--jsonrpc` string | The address of the JSON-RPC interface. | "0.0.0.0:8545" | NO | Command: server Flag: --jsonrpc “0.0.0.0:10002” | NO |
| `--log-level` string | The log level for the console output. | “INFO” | NO | Command: server Flag: --log-level “DEBUG” | NO |
| `--chain` string | The genesis file used for starting the chain. The genesis file is generated by running the genesis CLI command. | "./genesis.json" | NO | Command: server Flag: --chain “genesis.json” | NO |
| `--config` string | The path to the CLI config. Supported extensions are: .json, .hcl, .yaml and .yml. If this flag is set, other flags will be overridden. If some value that will be overridden is not specified in a config file, default value for that parameter is used. | “” | NO | Command: server Flag: --config “config.json” | NO |
| `--data-dir` string | The data directory used for storing Polygon Edge client data. | “” | YES | Command: server Flag:--data-dir “./test-chain-1” | NO |
| `--libp2p` string | The address and port for the libp2p service. | “127.0.0.1:1478” | NO | Command: server Flag: --libp2p “0.0.0.0:30301” | NO |
| `--prometheus` string | The address and port for the prometheus instrumentation service (address:port). If only port is defined (:port) it will bind to 0.0.0.0:port. | “” | NO | Command: server Flag: --prometheus “0.0.0.0:5001” | NO |
| `--nat` string | The external IP address without port, as can be seen by peers. The string specidied can be in IPv4 dotted decimal ("192.0.2.1"), IPv6 ("2001:db8::68"), or IPv4-mapped IPv6 ("::ffff:192.0.2.1") form. | “” | NO | Command: server Flag:--nat "192.0.2.1" | NO |
| `--dns` string | The host DNS address which can be used by a remote peer for connection. | “” | NO | Command: server Flag: --dns "www.example.com" | NO |
| `--block-gas-target` string | The target block gas limit for the chain. If omitted, the value of the parent block is used which will be the value set by the `--block-gas-limit` flag of the genesis command. If this flag is set, the block fill take block gas limit of the parent block and increment it by small delta (parentGasLimit /1024). If the block gas target is reached that the value of it will be set as a gas limit for the current block. | 0x0 | NO | Command: server Flag: --block-gas-target “10000000” | YES, this parameter can be changed by stopping the node and then starting it again with the server command and specifying --block-gas-target flag providing the new value e.g. --block-gas-target “60000000” |
| `--secrets-config` string | The path to the SecretsManager config file. Used for Hashicorp Vault. If omitted, the local FS secrets manager is used. | “” | NO | Command: server Flag: --secret-config “hashicorp.json” | NO |
| `--restore` string | The path to the archive blockchain data to restore on initialization. | “” | NO | Command: server Flag: --restore | NO |
| `--seal` | The flag indicating that the client should seal blocks. | TRUE | NO | Command: server Flag: --seal | NO |
| `--no-discover` | Prevent the client from discovering other peers. | FALSE | NO | Command: server Flag: --no-discover | NO |
| `--max-peers` int | The client's max number of peers allowed. | 40 | NO | Command: server Flag: --max-peers “70” | NO |
| `--max-inbound-peers` int | The client's max number of inbound peers allowed. | 32 | NO | Command: server Flag:--max-inbound-peers “50” | NO |
| `--max-outbound-peers` int | The client's max number of outbound peers allowed. | 8 | NO | Command: server Flag: --max-outbound-peers “20” | NO |
| `--price-limit` uint | The minimum gas price limit to enforce for acceptance into the pool. | 0 | NO | Command: server Flag: --price-limit “1” | YES, this parameter can be changed by stopping the node and then starting it again with the server command and specifying --price-limit flag providing the new value e.g. --price-limit “5” |
| `--max-slots` uint | Maximum slots in the transaction pool. When the maximum capacity is reached, transaction is not stored in the pool. One transaction occupies txSize/32kB number of slots. If e.g. --max-slots is 5, and there are tx1 which has 2kB and tx2 which has 33kB, that means that 3 slots are occupied and there are 2 free slots left. This parameter refers to the enqueued and promoted transactions in the pool. | 4096 | NO | Command: server Flag: --max-slots “100000” | NO |
| `--max-enqueued` uint | Maximum number of enqueued transactions in the pool per account. | 128 | NO | Command: server Flag: --max-enqueued “200” | NO |
| `--access-control-allow-origins` stringArray | The CORS(cross origin resource sharing) header indicating whether any JSON-RPC response can be shared with the specified origin. | []string{"*"} | NO | Command: server Flag: --access-control-allow-origins “https://foo.example” | NO |
| `--json-rpc-batch-request-limit` uint | Max length to be considered when handling json-rpc batch requests, value of 0 disables it. | 20 | NO | Command: server Flag: --json-rpc-batch-request-limit | NO |
| `--json-rpc-block-range-limit` uint | Max block range to be considered when executing json-rpc requests that consider fromBlock/toBlock values (e.g. eth_getLogs), value of 0 disables it. | 1000 | NO | Command: server Flag: --json-rpc-block-range-limit “2000” | NO |
| `--log-to` string | Write all logs to the file at specified location instead of writing them to console. | “” | NO | Command: server Flag: --log-to “edge-log.log” | NO |
| `--relayer` | Start the state sync relayer service. | FALSE | NO | Command: server Flag: --relayer | NO |
| `--num-block-confirmations` uint | Minimal number of child blocks required for the parent block to be considered final. This parameter is used by the event Tracker when reading logs from the parent chain. | 64 | NO | Command: server Flag: --num-block-confirmations “2” | NO |

:::info Mutually Exclusive Paramaters

- `--max-inbound-peers`: The client's maximum number of inbound peers allowed. Default value is 32.
- `--max-outbound-peers`: The client's maximum number of outbound peers allowed. Default value is 8.

:::

</TabItem>
</Tabs>

---
id: supernets-spawn-test-chain
title: How to Generate New Account Secrets
sidebar_label: How to Spawn a New Childchain
description: "Learn how to deploy a local test Supernet."
keywords:
  - docs
  - polygon
  - edge
  - supernets
  - network
  - modular
---

In this section, we'll prepare initiate a new chain with PolyBFT consensus and prepare the initial Supernet nodes.

## 1. Generate Keys

To initialize PolyBFT consensus, we need to generate the necessary secrets for each node.

The `polygon-edge polybft-secrets` command is used to generate account secrets for validators. The command initializes private keys for the consensus client (validators + networking) to a Secrets Manager config file.

**Keep in mind that this command is intended for testing purposes only and should not be used in a production environment.**

<details>
<summary>Flags ↓</summary>

| Flag            | Description                                                                                               | Example                    |
|-----------------|-----------------------------------------------------------------------------------------------------------|----------------------------|
| `--account`     | Indicates whether a new account should be created (default true).                                         |                            |
| `--config`      | The path to the SecretsManager config file. If omitted, the local file system secrets manager is used.    | `--config /path/to/config` |
| `--data-dir`    | The directory for the Polygon Edge data if the local file system is used.                                 | `--data-dir test-chain-`   |
| `--insecure`    | Indicates whether the secrets stored on the local storage should be encrypted. Intended for testing purposes only. |                   |
| `--network`     | Indicates whether a new Network key should be created (default true).                                     |                            |
| `--num`         | Indicates how many secrets should be created, only for the local file system (default 1).                 | `--num 4`                  |
| `--output`      | Indicates whether to output existing secrets.                                                             | `--output`                 |
| `--private`     | Indicates whether the private key should be printed.                                                      | `--private`                |

**Global Flags:**

| Flag      | Description                                    | Example           |
|-----------|------------------------------------------------|-------------------|
| `--json`  | Get all outputs in JSON format (default false). | `--json`          |

</details>

  ```bash
  ./polygon-edge polybft-secrets --insecure --data-dir test-chain- --num 4
  ```

<details>
<summary>Output example ↓</summary>

```bash
[WARNING: INSECURE LOCAL SECRETS - SHOULD NOT BE RUN IN PRODUCTION]

[SECRETS GENERATED]
network-key, validator-key, validator-bls-key

[SECRETS INIT]
Public key (address) = 0x61324166B0202DB1E7502924326262274Fa4358F
BLS Public key       = 06d8d9e6af67c28e85ac400b72c2e635e83234f8a380865e050a206554049a222c4792120d84977a6ca669df56ff3a1cf1cfeccddb650e7aacff4ed6c1d4e37b055858209f80117b3c0a6e7a28e456d4caf2270f430f9df2ba37221f23e9bbd313c9ef488e1849cc5c40d18284d019dde5ed86770309b9c24b70ceff6167a6ca
Node ID              = 16Uiu2HAmMYyzK7c649Tnn6XdqFLP7fpPB2QWdck1Ee9vj5a7Nhg8

[WARNING: INSECURE LOCAL SECRETS - SHOULD NOT BE RUN IN PRODUCTION]

[SECRETS GENERATED]
network-key, validator-key, validator-bls-key

[SECRETS INIT]
Public key (address) = 0xFE5E166BA5EA50c04fCa00b07b59966E6C2E9570
BLS Public key       = 0601da8856a6d3d3bb0f3bcbb90ea7b8c0db8271b9203e6123c6804aa3fc5f810be33287968ca1af2be11839516850a6ffef2337d99e679b7531efbbea2e3bf727a053c0cbede71da3d5f489b6ad862ccd8bb0bfb7fa379e3395d3b1142594a73020e87d63c298a3a4eba0ace65727f8659bab6389b9448b72512db72bbe937f
Node ID              = 16Uiu2HAmLXVapjR2Yx3B1taCmHnckQ1ph2xrawBjW2kvSErps9CX

[WARNING: INSECURE LOCAL SECRETS - SHOULD NOT BE RUN IN PRODUCTION]

[SECRETS GENERATED]
network-key, validator-key, validator-bls-key

[SECRETS INIT]
Public key (address) = 0x9aBb8441A12d4FD8D505C3fc50cDdc45E0df2b1e
BLS Public key       = 17c26d9d91dddc3c1318b20a1ddb3322ea1f4e4415c27e9011d706e7407eed672837173d1909cbff6ccdfd110af3b18bdfea878e8120fdb5bae70dc7a044a2f40aa8f118b41704896f474f80fff52d9047fa8e4a464ac86f9d05a0220975d8440e20c6307d866137053cabd4baf6ba84bfa4a22f5f9297c1bfc2380c23535210
Node ID              = 16Uiu2HAmGskf5sZ514Ab4SHTPuw8RRBQudyrU211wn3P1knRz9Ed

[WARNING: INSECURE LOCAL SECRETS - SHOULD NOT BE RUN IN PRODUCTION]

[SECRETS GENERATED]
network-key, validator-key, validator-bls-key

[SECRETS INIT]
Public key (address) = 0xCaB5AAC79Bebe326e0c80d72b5662E73f5D8ea56
BLS Public key       = 1d7bb7d44a2f0ebeae2f4380f88188080de34635d78a36647f0704c7b70de7291e2e3b9a1ef699a078c6cd9bb816ea2917c2c2fc699c6248f1f7812a167caf7e15361ec16df56d194768d57c79897c681c96f4321651464f7b577d08083d8b67213a1e29dc8495d8389e6cbd85fdd738c402a1801198b57b302e0e00dfaf1247
Node ID              = 16Uiu2HAm42EFMhJPGcMRFHPaWWxBzoEsWRbGxJnBHMu4VFojg99U
```

</details>

### Understand the generated secrets

The generated secrets include the following information for each validator node:

- **ECDSA Private and Public Keys**: These keys are used to sign and verify transactions on the blockchain.
- **BLS Private and Public Keys**: These keys are used in the Byzantine fault-tolerant (BFT) consensus protocol to aggregate and verify signatures efficiently.
- **P2P Networking Node ID**: This is a unique identifier for each validator node in the network, allowing them to establish and maintain connections with other nodes.

> The secrets output can be retrieved again if needed by running the following command: `./polygon-edge polybft-secrets --data-dir test-chain-X/ --insecure`

## 2. Next Steps

As the next step, navigate to the [Configure a New Childchain](/docs/supernets/operate/deploy/genesis.md) deployment guide. This will enable you to generate a new genesis file and define the initial validator set, facilitating the setup and configuration of the childchain's initial state.

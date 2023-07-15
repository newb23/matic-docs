---
id: setup
title: Einrichtung
description: Wie man chainBridge einrichtet
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

## Bereitstellung von Verträgen {#contracts-deployment}

In diesem Abschnitt werden Sie die erforderlichen Verträge für die Polygon PoS- und Polygon Edge-ChainIn mit `cb-sol-cli`bereitstellen.

```bash
# Setup for cb-sol-cli command
$ git clone https://github.com/ChainSafe/chainbridge-deploy.git
$ cd chainbridge-deploy/cb-sol-cli
$ make install
```

Zunächst werden wir mit dem Befehl `cb-sol-cli deploy`Verträge in der Polygon PoS-Chain bereitstellen. M`--all`it Flagwerden alle Verträge bereitgestellt, einschließlich Bridge, ERC20 Handler, ERC721 Handler, Generic Handler, ERC20 und ERC721 Vertrag. Ferner werden die Standardadresse des Relayerkontos und der Schwellenwert festgelegt

```bash
# Deploy all required contracts into Polygon PoS chain
$ cb-sol-cli deploy --all --chainId 99 \
  --url https://rpc-mumbai.matic.today \
  --gasPrice [GAS_PRICE] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```


Mehr über chainID und JSON-RPC URL [hier](/docs/edge/additional-features/chainbridge/definitions) erfahren

:::caution

Der vorgegebene Gaspreis in i`cb-sol-cli`st ()`20000000`.`0.02 Gwei` `--gasPrice`Um den geeigneten Gaspreis in einer Transaktion einzurichten, setze den Wert mit dem Argument fest.

```bash
$ cb-sol-cli deploy --all --chainId 99 \
  --url https://rpc-mumbai.matic.today \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1 \
  # Set gas price to 5 Gwei
  --gasPrice 5000000000
```

:::

:::caution

Der Bridge-Vertrag kostet ungefähr 0x3f97b8 (4167608) Gas zur Bereitstellung Vergewissern, dass die erzeugten Blöcke über ein ausreichendes Blockgaslimit verfügen, damit die Transaktion zur Vertragserstellung durchgeführt werden kann. Um mehr über die Änderung des Blockgaslimits in Polygon Edge zu erfahren, siehe die [lokale Einrichtung](/docs/edge/get-started/set-up-ibft-locally)

:::

Sobald die Verträge bereitgestellt wurden, erhalten Sie das folgende Ergebnis:

```bash
Deploying contracts...
✓ Bridge contract deployed
✓ ERC20Handler contract deployed
✓ ERC721Handler contract deployed
✓ GenericHandler contract deployed
✓ ERC20 contract deployed
WARNING: Multiple definitions for safeTransferFrom
✓ ERC721 contract deployed

================================================================
Url:        https://rpc-mumbai.matic.today
Deployer:   <ADMIN_ACCOUNT_ADDRESS>
Gas Limit:   8000000
Gas Price:   20000000
Deploy Cost: 0.00029065308

Options
=======
Chain Id:    <CHAIN_ID>
Threshold:   <RELAYER_THRESHOLD>
Relayers:    <RELAYER_ACCOUNT_ADDRESS>
Bridge Fee:  0
Expiry:      100

Contract Addresses
================================================================
Bridge:             <BRIDGE_CONTRACT_ADDRESS>
----------------------------------------------------------------
Erc20 Handler:      <ERC20_HANDLER_CONTRACT_ADDRESS>
----------------------------------------------------------------
Erc721 Handler:     <ERC721_HANDLER_CONTRACT_ADDRESS>
----------------------------------------------------------------
Generic Handler:    <GENERIC_HANDLER_CONTRACT_ADDRESS>
----------------------------------------------------------------
Erc20:              <ERC20_CONTRACT_ADDRESS>
----------------------------------------------------------------
Erc721:             <ERC721_CONTRACT_ADDRESS>
----------------------------------------------------------------
Centrifuge Asset:   Not Deployed
----------------------------------------------------------------
WETC:               Not Deployed
================================================================
```

Jetzt können wir die Verträge in der Polygon Edge Chain bereitstellen.

```bash
# Deploy all required contracts into Polygon Edge chain
$ cb-sol-cli deploy --all --chainId 100 \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```

Speichern Sie die Terminalausgaben mit den Adressen der eingesetzten Smart Contracts, da wir sie für den nächsten Schritt benötigen.

## Relayer-Einrichtung {#relayer-setup}

In diesem Abschnitt werden Sie einen Relayer starten, um Daten zwischen 2 Chains auszutauschen.

Zunächst müssen wir das ChainBridge Repository klonen und bauen.

```bash
$ git clone https://github.com/ChainSafe/ChainBridge.git
$ cd chainBridge && make install
```

Als Nächstes müssen Sie `config.json`erstellen und die JSON-RPC URLs einstellen, die Relay-Adresse und Vertragsadresse für jede Chain festlegen.

```json
{
  "chains": [
    {
      "name": "mumbai",
      "type": "ethereum",
      "id": "99",
      "endpoint": "https://rpc-mumbai.matic.today",
      "from": "<RELAYER_ACCOUNT_ADDRESS>",
      "opts": {
        "bridge": "<BRIDGE_CONTRACT_ADDRESS>",
        "erc20Handler": "<ERC20_HANDLER_CONTRACT_ADDRESS>",
        "erc721Handler": "<ERC721_HANDLER_CONTRACT_ADDRESS>",
        "genericHandler": "<GENERIC_HANDLER_CONTRACT_ADDRESS>",
        "minGasPrice": "1",
        "http": "true"
      }
    },
    {
      "name": "polygon-edge",
      "type": "ethereum",
      "id": "100",
      "endpoint": "http://localhost:10002",
      "from": "<RELAYER_ACCOUNT_ADDRESS>",
      "opts": {
        "bridge": "<BRIDGE_CONTRACT_ADDRESS>",
        "erc20Handler": "<ERC20_HANDLER_CONTRACT_ADDRESS>",
        "erc721Handler": "<ERC721_HANDLER_CONTRACT_ADDRESS>",
        "genericHandler": "<GENERIC_HANDLER_CONTRACT_ADDRESS>",
        "minGasPrice": "1",
        "http": "true"
      }
    }
  ]
}
```

Um einen Relayer zu starten, müssen Sie den privaten Schlüssel importieren, der der Relayer-Kontoadresse entspricht. Sie müssen das Passwort eingeben, wenn Sie den privaten Schlüssel importieren. Sobald der Import erfolgreich war, wird der Schlüssel unter `keys/<ADDRESS>.key`gespeichert.

```bash
# Import private key and store to local with encryption
$ chainbridge accounts import --privateKey [RELAYER_ACCOUNT_PRIVATE_KEY]

INFO[11-19|07:09:01] Importing key...
Enter password to encrypt keystore file:
> [PASSWORD_TO_ENCRYPT_KEY]
INFO[11-19|07:09:05] private key imported                     address=<RELAYER_ACCOUNT_ADDRESS> file=.../keys/<RELAYER_ACCOUNT_ADDRESS>.key
```

Jetzt kann der Relayer gestartet werden. Sie müssen das gleiche Passwort eingeben, das Sie zu Beginn für die Speicherung des Schlüssels gewählt haben.

```bash
# Start relayer
$ chainbridge --config config.json --latest

INFO[11-19|07:15:19] Starting ChainBridge...
Enter password for key ./keys/<RELAYER_ACCOUNT_ADDRESS>.key:
> [PASSWORD_TO_DECRYPT_KEY]
INFO[11-19|07:15:25] Connecting to ethereum chain...          chain=mumbai url=<JSON_RPC_URL>
Enter password for key ./keys/<RELAYER_ACCOUNT_ADDRESS>.key:
> [PASSWORD_TO_DECRYPT_KEY]
INFO[11-19|07:15:31] Connecting to ethereum chain...          chain=polygon-edge url=<JSON_RPC_URL>
```

Mit dem Start des Relayer beginnt er mit der Beobachtung neuer Blöcke in jeder Chain.

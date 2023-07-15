---
id: setup
title: Configuration
description: Comment configurer ChainBridge
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

## Déploiement des contrats {#contracts-deployment}

Dans cette section, vous allez déployer les contrats requis sur la chaîne PoS de Polygon et Edge de Polygon avec `cb-sol-cli`.

```bash
# Setup for cb-sol-cli command
$ git clone https://github.com/ChainSafe/chainbridge-deploy.git
$ cd chainbridge-deploy/cb-sol-cli
$ make install
```

Tout d'abord, nous allons déployer des contrats sur la chaîne PoS de Polygon par `cb-sol-cli deploy` commande. `--all` l'option oblige la commande à déployer tous les contrats, y compris Bridge, le Gestionnaire de ERC20, le Gestionnaire de ERC721, le Gestionnaire Générique, le contrat de ERC20 et ERC721. De plus, il définira l'adresse du compte de relais par défaut et le niveau

```bash
# Deploy all required contracts into Polygon PoS chain
$ cb-sol-cli deploy --all --chainId 99 \
  --url https://rpc-mumbai.matic.today \
  --gasPrice [GAS_PRICE] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```


En savoir plus sur chainID et l'URL JSON-RPC [ici](/docs/edge/additional-features/chainbridge/definitions)

:::caution

Le prix du gaz par défaut dans `cb-sol-cli` est `20000000` (`0.02 Gwei`). Pour définir le prix du gaz approprié dans une transaction, veuillez définir la valeur en utilisant `--gasPrice` l'argument.

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

Le contrat de Bridge nécessite environ 0x3f97b8 (4167608) de gaz pour se déployer. Veuillez vous assurer que les blocs générés ont une limite de gaz de bloc suffisante pour contenir la transaction de création de contrat. Pour en savoir plus sur la modification de la limite de gaz de bloc dans Edge de Polygon, veuillez visiter la [Configuration Locale](/docs/edge/get-started/set-up-ibft-locally)

:::

Une fois que les contrats sont déployés, vous obtiendrez le résultat suivant:

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

Nous pouvons maintenant déployer les contrats sur la chaîne de Edge de Polygon.

```bash
# Deploy all required contracts into Polygon Edge chain
$ cb-sol-cli deploy --all --chainId 100 \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```

Enregistrez les sorties du terminal avec les adresses du contrat intelligent déployées car nous en aurons besoin pour la prochaine étape.

## Configuration du relais {#relayer-setup}

Dans cette section, vous allez démarrer un relais pour échanger des données entre 2 chaînes.

Tout d'abord, nous devons cloner et construire le référentiel de ChainBridge.

```bash
$ git clone https://github.com/ChainSafe/ChainBridge.git
$ cd chainBridge && make install
```

Ensuite, Vous devez créer `config.json` et définir les URL JSON-RPC, l'adresse du relais, et l'adresse des contrats pour chaque chaîne.

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

Pour démarrer un relais, vous devez importer la clé privée correspondant à l'adresse du compte de relais. Vous devrez saisir le mot de passe lorsque vous importerez la clé privée. Une fois que l'importation a été réussie, la clé sera stockée sous `keys/<ADDRESS>.key`.

```bash
# Import private key and store to local with encryption
$ chainbridge accounts import --privateKey [RELAYER_ACCOUNT_PRIVATE_KEY]

INFO[11-19|07:09:01] Importing key...
Enter password to encrypt keystore file:
> [PASSWORD_TO_ENCRYPT_KEY]
INFO[11-19|07:09:05] private key imported                     address=<RELAYER_ACCOUNT_ADDRESS> file=.../keys/<RELAYER_ACCOUNT_ADDRESS>.key
```

Ensuite, vous pouvez démarrer le relais. Vous devrez entrer le même mot de passe que vous avez choisi pour stocker la clé au début.

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

Une fois que le relais a commencé, il commencera à surveiller de nouveaux blocs sur chaque chaîne.

---
id: setup
title: Configurazione
description: Come configurare chainBridge
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

## Implementazione dei contratti {#contracts-deployment}

In questa sezione implementerai i contratti richiesti alla catena Polygon PoS e Polygon Edge con`cb-sol-cli` .

```bash
# Setup for cb-sol-cli command
$ git clone https://github.com/ChainSafe/chainbridge-deploy.git
$ cd chainbridge-deploy/cb-sol-cli
$ make install
```

In primo luogo, implementeremo i contratti alla catena Polygon PoS con il comando `cb-sol-cli deploy`. Il flag `--all`fa sì che il comando implementi tutti i contratti, compresi Bridge, ERC20 Handler, ERC721 Handler, Generic Handler, ERC20 e ERC721. Inoltre, imposterà l'indirizzo dell'account del relayer predefinito e la soglia

```bash
# Deploy all required contracts into Polygon PoS chain
$ cb-sol-cli deploy --all --chainId 99 \
  --url https://rpc-mumbai.matic.today \
  --gasPrice [GAS_PRICE] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```


Scopri di più su chainID e JSON-RPC URL [qui](/docs/edge/additional-features/chainbridge/definitions)

:::caution

Il prezzo del gas predefinito in `cb-sol-cli` è `20000000` (`0.02 Gwei`). Per impostare il corretto prezzo del gas in una transazione si prega di impostare il valore utilizzando l'argomento `--gasPrice`.

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

Il contratto Bridge richiede circa 0x3f97b8 (4167608) per essere implementato. Assicurati che i blocchi generati abbiano un limite di gas del blocco sufficiente a contenere la transazione per la creazione del contratto. Per ulteriori informazioni sulla modifica del limite del gas del blocco in Polygon Edge, visitare il [Setup locale](/docs/edge/get-started/set-up-ibft-locally)

:::

Una volta implementati i contratti, si otterrà il seguente risultato:

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

Ora possiamo implementare i contratti alla catena Polygon Edge.

```bash
# Deploy all required contracts into Polygon Edge chain
$ cb-sol-cli deploy --all --chainId 100 \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```

Salva gli output del terminale con gli indirizzi degli smart contract implementati, perché ci serviranno per il prossimo passo.

## Configurazione del relayer {#relayer-setup}

In questa sezione, avvieremo un relayer per lo scambio di dati tra 2 catene.

Per prima cosa, dobbiamo clonare e costruire il repository ChainBridge.

```bash
$ git clone https://github.com/ChainSafe/ChainBridge.git
$ cd chainBridge && make install
```

Poi devi creare `config.json`e impostare gli URL JSON-RPC, l'indirizzo relayer e l'indirizzo dei contratti per ogni catena.

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

Per avviare un relayer, è necessario importare la chiave privata corrispondente all'indirizzo dell'account del relayer. Dovrai inserire la password quando importi la chiave privata. Una volta che l'importazione è andata a buon fine, la chiave verrà memorizzata sotto `keys/<ADDRESS>.key`.

```bash
# Import private key and store to local with encryption
$ chainbridge accounts import --privateKey [RELAYER_ACCOUNT_PRIVATE_KEY]

INFO[11-19|07:09:01] Importing key...
Enter password to encrypt keystore file:
> [PASSWORD_TO_ENCRYPT_KEY]
INFO[11-19|07:09:05] private key imported                     address=<RELAYER_ACCOUNT_ADDRESS> file=.../keys/<RELAYER_ACCOUNT_ADDRESS>.key
```

A questo punto, è possibile avviare il relayer. Dovrai inserire la stessa password che hai scelto all'inizio per la memorizzazione della chiave.

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

Una volta avviato, il relayer inizierà a osservare i nuovi blocchi di ogni catena.

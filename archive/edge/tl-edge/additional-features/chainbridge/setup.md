---
id: setup
title: Pag-setup
description: Paano i-set up ang chainBridge
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

## Pag-deploy ng mga kontrata {#contracts-deployment}

Sa seksyong ito, ide-deploy mo ang mga kinakailangang kontrata sa Polygon POS at Polygon Edge chain gamit ang `cb-sol-cli`.

```bash
# Setup for cb-sol-cli command
$ git clone https://github.com/ChainSafe/chainbridge-deploy.git
$ cd chainbridge-deploy/cb-sol-cli
$ make install
```

Una, magde-deploy tayo ng mga kontrata sa Polygon PoS chain sa pamamagitan ng `cb-sol-cli deploy` na command. Sa pamamagitan ng `--all` flag, dine-deploy ng command ang lahat ng kontrata kabilang ang mga kontrata ng Bridge, ERC20 Handler, ERC721 Handler, Generic Handler, ERC20, at ERC721. Dagdag pa, itatakda nito ang default na relayer account address at ang threshold

```bash
# Deploy all required contracts into Polygon PoS chain
$ cb-sol-cli deploy --all --chainId 99 \
  --url https://rpc-mumbai.matic.today \
  --gasPrice [GAS_PRICE] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```


Alamin ang tungkol sa chainID at JSON-RPC URL [dito](/docs/edge/additional-features/chainbridge/definitions)

:::caution

Ang default na gas price sa `cb-sol-cli` ay `20000000` (`0.02 Gwei`). Para itakda ang naaangkop na gas price sa transaksyon, itakda ang value gamit ang `--gasPrice` argument.

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

Gumagamit ang kontrata ng Bridge ng humigit-kumulang 0x3f97b8 (4167608) gas para ma-deploy. Tiyakin na ang mga block na binubuo ay may sapat na limitasyon sa gas kada block para maisama ang transaksyon sa paggawa ng kontrata. Para matuto pa tungkol sa pagbabago ng limitasyon sa gas kada block sa Polygon Edge, pumunta sa
[Local na Pag-set Up](/docs/edge/get-started/set-up-ibft-locally)

:::

Kapag na-deploy na ang mga kontrata, makukuha mo ang sumusunod na resulta:

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

Maaari na natin ngayon i-deploy ang mga kontrata sa Polygon Edge chain.

```bash
# Deploy all required contracts into Polygon Edge chain
$ cb-sol-cli deploy --all --chainId 100 \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```

I-save ang mga terminal output kasama ang mga na-deploy na address ng smart contract dahil kakailanganin natin ang mga ito para sa susunod na hakbang.

## Pag-set up ng relayer {#relayer-setup}

Sa seksyong ito, magsisimula ka ng relayer para makapagpalitan ng data sa pagitan ng 2 chain.

Una, kailangan nating i-clone at gawin ang ChainBridge repository.

```bash
$ git clone https://github.com/ChainSafe/ChainBridge.git
$ cd chainBridge && make install
```

Susunod, kailangan mong gawin ang `config.json` at itakda ang mga JSON-RPC URL, address ng relayer, at address ng mga kontrata para sa bawat chain.

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

Para magsimula ng relayer, kailangan mong i-import ang pribadong key na nauugnay sa address ng relayer account. Kailangan mong i-input ang password kapag nag-import ka ng pribadong key. Kapag nagtagumpay ang pag-import, iso-store ang key sa ilalim ng `keys/<ADDRESS>.key`.

```bash
# Import private key and store to local with encryption
$ chainbridge accounts import --privateKey [RELAYER_ACCOUNT_PRIVATE_KEY]

INFO[11-19|07:09:01] Importing key...
Enter password to encrypt keystore file:
> [PASSWORD_TO_ENCRYPT_KEY]
INFO[11-19|07:09:05] private key imported                     address=<RELAYER_ACCOUNT_ADDRESS> file=.../keys/<RELAYER_ACCOUNT_ADDRESS>.key
```

Pagkatapos, masisimulan mo ang relayer. Kailangan mong i-input ang parehong password na pinili mo para sa pag-store ng key sa simula.

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

Kapag nag-umpisa na ang relayer, magsisimula itong magbantay ng mga bagong block sa bawat chain.

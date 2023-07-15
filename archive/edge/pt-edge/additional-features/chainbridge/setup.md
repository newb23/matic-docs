---
id: setup
title: Configuração
description: Como configurar o chainBridge
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

## Implantação de contratos {#contracts-deployment}

Nesta seção, vamos implantar os contratos necessários para a chain do Polygon PoS e do Polygon Edge com `cb-sol-cli`.

```bash
# Setup for cb-sol-cli command
$ git clone https://github.com/ChainSafe/chainbridge-deploy.git
$ cd chainbridge-deploy/cb-sol-cli
$ make install
```

Em primeiro lugar, vamos implantar contratos para chain Polygon PoS por `cb-sol-cli deploy`comando. O sinalizador `--all` faz com que o comando implante todos os contratos, incluindo Bridge, Handler ERC-20, Handler ERC-721, Generic Handler, ERC-20 e ERC-721. Além disso, ele irá definir o endereço de conta de relayer padrão e o limiar

```bash
# Deploy all required contracts into Polygon PoS chain
$ cb-sol-cli deploy --all --chainId 99 \
  --url https://rpc-mumbai.matic.today \
  --gasPrice [GAS_PRICE] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```


Saiba mais sobre o chainID e o URL JSON-RPC [aqui](/docs/edge/additional-features/chainbridge/definitions)

:::caution

O preço padrão do gás em `cb-sol-cli` é `20000000` (`0.02 Gwei`). Para definir o preço do gás numa transação, defina o valor usando o argumento `--gasPrice`.

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

O contrato Bridge consome aproximadamente gás 0x3f97b8 (4167608) para ser implantado. Certifique-se de que os blocos que estão sendo gerados tenham um limite de gás de bloqueio para conter a transação de criação de contratos. Para saber mais sobre o limite de gás de bloqueio no Polygon Edge, visite
a [Configuração Local](/docs/edge/get-started/set-up-ibft-locally)

:::

Depois que os contratos tiverem sido implantados, receberá o seguinte resultado:

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

Agora podemos implantar os contratos na chain Polygon Edge.

```bash
# Deploy all required contracts into Polygon Edge chain
$ cb-sol-cli deploy --all --chainId 100 \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```

Salve as saídas de terminal com os endereços de contrato inteligente, visto que iremos precisar deles para a etapa seguinte.

## Configuração do relayer {#relayer-setup}

Nesta secção, vamos iniciar um relayer para trocar dados entre 2 chains.

Primeiro, precisamos clonar e construir o repositório ChainBridge.

```bash
$ git clone https://github.com/ChainSafe/ChainBridge.git
$ cd chainBridge && make install
```

Em seguida, é necessário criar `config.json` e definir os URLs JSON-RPC, endereço de relayer e endereço de contratos para chain.

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

Para iniciar um relayer, é necessário importar a chave privada correspondente ao endereço de conta de relayer. Terá de inserir a senha quando importar a chave privada. Assim que a importação tiver sido bem-sucedida, a chave será armazenada em `keys/<ADDRESS>.key`.

```bash
# Import private key and store to local with encryption
$ chainbridge accounts import --privateKey [RELAYER_ACCOUNT_PRIVATE_KEY]

INFO[11-19|07:09:01] Importing key...
Enter password to encrypt keystore file:
> [PASSWORD_TO_ENCRYPT_KEY]
INFO[11-19|07:09:05] private key imported                     address=<RELAYER_ACCOUNT_ADDRESS> file=.../keys/<RELAYER_ACCOUNT_ADDRESS>.key
```

Em seguida, pode inciar o relayer. Terá de inserir a mesma senha que escolheu para armazenar a chave no início.

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

Assim que o relayer é iniciado, ele começa a observar novos blocos na chain.

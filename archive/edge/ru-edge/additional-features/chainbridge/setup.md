---
id: setup
title: Настройка
description: Как настроить chainBridge
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

## Развертывание контрактов {#contracts-deployment}

В этом разделе вы выполните развертывание требуемых контрактов для Polygon PoS и цепочки Polygon Edge с помощью `cb-sol-cli`.

```bash
# Setup for cb-sol-cli command
$ git clone https://github.com/ChainSafe/chainbridge-deploy.git
$ cd chainbridge-deploy/cb-sol-cli
$ make install
```

Вначале мы выполним развертывание контрактов в цепочке Polygon PoS с помощью команды `cb-sol-cli deploy`. Флаг `--all` указывает команде выполнить развертывание всех контрактов, включая Bridge, ERC20 Handler, ERC721 Handler, Generic Handler, ERC20 и ERC721. Кроме того, он задает адрес аккаунта ретранслятора по умолчанию и предельное значение

```bash
# Deploy all required contracts into Polygon PoS chain
$ cb-sol-cli deploy --all --chainId 99 \
  --url https://rpc-mumbai.matic.today \
  --gasPrice [GAS_PRICE] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```


Подробнее о chainID и JSON-RPC URL см. [здесь](/docs/edge/additional-features/chainbridge/definitions)

:::caution

Цена на газ по умолчанию в `cb-sol-cli` составляет `20000000` (`0.02 Gwei`). Чтобы задать правильную цену на газ в транзакции, задавайте значение с помощью аргумента `--gasPrice`.

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

Для развертывания контракта Bridge требуется приблизительно 0x3f97b8 (4167608) газа. Убедитесь, что в генерируемых блоках имеется достаточный лимит газа для транзакции создания контракта. Чтобы узнать больше об изменении лимита газа в блоке Polygon Edge, см.
раздел [Локальная настройка](/docs/edge/get-started/set-up-ibft-locally)

:::

После развертывания контрактов вы получите следующий результат:

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

Теперь мы можем развернуть контракты в цепочке Polygon Edge.

```bash
# Deploy all required contracts into Polygon Edge chain
$ cb-sol-cli deploy --all --chainId 100 \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```

Сохраните выводы терминала с развернутыми адресами смарт-контрактов, поскольку они понадобятся нам для следующего шага.

## Настройка ретранслятора {#relayer-setup}

В этом разделе вы запустите ретранслятор для обмена данными между 2 цепочками.

Вначале нам потребуется клонировать и построить репозиторий ChainBridge.

```bash
$ git clone https://github.com/ChainSafe/ChainBridge.git
$ cd chainBridge && make install
```

Затем вам потребуется создать `config.json` и настроить URL JSON-RPC, адрес ретранслятора и адрес контракта для каждой цепочки.

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

Чтобы запустить ретранслятор, вам нужно будет импортировать приватный ключ, соответствующий адресу аккаунта ретранслятора. Когда вы будете импортировать приватный ключ, вам нужно будет ввести пароль. После успешного импорта ключ будет сохранен в `keys/<ADDRESS>.key`.

```bash
# Import private key and store to local with encryption
$ chainbridge accounts import --privateKey [RELAYER_ACCOUNT_PRIVATE_KEY]

INFO[11-19|07:09:01] Importing key...
Enter password to encrypt keystore file:
> [PASSWORD_TO_ENCRYPT_KEY]
INFO[11-19|07:09:05] private key imported                     address=<RELAYER_ACCOUNT_ADDRESS> file=.../keys/<RELAYER_ACCOUNT_ADDRESS>.key
```

Затем вы сможете запустить ретранслятор. Вам нужно будет ввести тот же пароль, который вы выбрали вначале при сохранении ключа.

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

После запуска ретранслятора он начнет следить за новыми блоками в каждой цепочке.

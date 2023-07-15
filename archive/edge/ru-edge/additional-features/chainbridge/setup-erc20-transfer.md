---
id: setup-erc20-transfer
title: Трансфер токенов ERC20
description: Как настроить трансфер токенов ERC-20 в chainBridge
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

На данный момент мы настроили мост для обмена активами/данными между Polygon PoS и цепочкой Polygon Edge. Этот раздел поможет вам настроить мост ERC20 и отправлять токены между различными блокчейнами.

## Шаг 1: зарегистрируйте идентификатор ресурса {#step-1-register-resource-id}

Сначала зарегистрируйте идентификатор ресурса, используемый для ассоциации с ресурсами в среде из нескольких цепочек. Идентификатор ресурса — это 32-байтое значение, которое должно быть уникально для ресурса, который мы передаем между этими блокчейнами. Идентификаторы ресурса являются произвольными значениями, но они могут иметь идентификатор цепочки домашней цепочки в последнем байте в качестве соглашения (домашняя цепочка относится к сети, из которой эти ресурсы были получены).

Чтобы зарегистрировать идентификатор ресурса, можно использовать команду `cb-sol-cli bridge register-resource`. Вам нужно будет дать приватный ключ для аккаунта `admin`.

```bash
# For Polygon PoS chain
$ cb-sol-cli bridge register-resource \
  --url https://rpc-mumbai.matic.today \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  # Set Resource ID for ERC20
  --resourceId "0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[ERC20_CONTRACT_ADDRESS]"

# For Polygon Edge chain
$ cb-sol-cli bridge register-resource \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  # Set Resource ID for ERC20
  --resourceId "0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[ERC20_CONTRACT_ADDRESS]"
```

## (Необязательно) Сделайте контракты с возможностью произвольного минтинга/сжигания {#optional-make-contracts-mintable-burnable}


```bash
# Let ERC20 contract burn on source chain and mint on destination chain
$ cb-sol-cli bridge set-burn \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[ERC20_CONTRACT_ADDRESS]"

# Grant minter role to ERC20 Handler contract
$ cb-sol-cli erc20 add-minter \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --minter "[ERC20_HANDLER_CONTRACT_ADDRESS]"
```

## Шаг 2: осуществите трансфер токенов ERC20 {#step-2-transfer-erc20-token}

Мы отправим токены ERC20 из цепочки Polygon PoS в цепочку Polygon Edge.

Сначала вы получите токены посредством минтинга. Аккаунт с ролью `minter` может генерировать новые токены при помощи минтинга. Аккаунт, в котором был развернут контракт ERC20, имеет по умолчанию роль `minter`. Чтобы указать другие аккаунты в качестве участников роли `minter`, нужно запустить команду `cb-sol-cli erc20 add-minter`.

```bash
# Mint ERC20 tokens
$ cb-sol-cli erc20 mint \
  --url https://rpc-mumbai.matic.today \
  --privateKey [MINTER_ACCOUNT_PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --amount 1000
```

Чтобы проверить текущий остаток, можно использовать команду `cb-sol-cli erc20 balance`.

```bash
# Check ERC20 token balance
$ cb-sol-cli erc20 balance \
  --url https://rpc-mumbai.matic.today \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --address "[ACCOUNT_ADDRESS]"

[erc20/balance] Account <ACCOUNT_ADDRESS> has a balance of 1000.0
```

Затем нужно подтвердить трансфер токенов ERC20 с аккаунта при помощи ERC20 Handler

```bash
# Approve transfer from the account by ERC20 Handler
$ cb-sol-cli erc20 approve \
  --url https://rpc-mumbai.matic.today \
  --privateKey [USER_ACCOUNT_ADDRESS] \
  --gasPrice [GAS_PRICE] \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --recipient "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --amount 500
```

Чтобы осуществить трансфер токенов в цепочках Polygon Edge, нужно вызвать `deposit`.

```bash
# Start transfer from Polygon PoS to Polygon Edge chain
$ cb-sol-cli erc20 deposit \
  --url https://rpc-mumbai.matic.today \
  --privateKey [PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  --amount 10 \
  # ChainID of Polygon Edge chain
  --dest 100 \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --recipient "[RECIPIENT_ADDRESS_IN_POLYGON_EDGE_CHAIN]" \
  --resourceId "0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00"
```

После успешного выполнения транзакции депозита ретранслятор получит событие и проголосует за предложение. Он выполняет транзакцию отправки токенов на аккаунт получателя в цепочке Polygon Edge после отправки требуемого количества голосов.

```bash
INFO[11-19|08:15:58] Handling fungible deposit event          chain=mumbai dest=100 nonce=1
INFO[11-19|08:15:59] Attempting to resolve message            chain=polygon-edge type=FungibleTransfer src=99 dst=100 nonce=1 rId=000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00
INFO[11-19|08:15:59] Creating erc20 proposal                  chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Watching for finalization event          chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Submitted proposal vote                  chain=polygon-edge tx=0x67a97849951cdf0480e24a95f59adc65ae75da23d00b4ab22e917a2ad2fa940d src=99 depositNonce=1 gasPrice=1
INFO[11-19|08:16:24] Submitted proposal execution             chain=polygon-edge tx=0x63615a775a55fcb00676a40e3c9025eeefec94d0c32ee14548891b71f8d1aad1 src=99 dst=100 nonce=1 gasPrice=5
```

После успешного выполнения транзакции вы получите токены в цепочке Polygon Edge.

```bash
# Check the ERC20 balance in Polygon Edge chain
$ cb-sol-cli erc20 balance \
  --url https://localhost:10002 \
  --privateKey [PRIVATE_KEY] \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --address "[ACCOUNT_ADDRESS]"

[erc20/balance] Account <RECIPIENT_ACCOUNT_ADDRESS> has a balance of 10.0
```

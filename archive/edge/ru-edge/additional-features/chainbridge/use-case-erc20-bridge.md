---
id: use-case-erc20-bridge
title: Сценарий использования — мост ERC20
description: Пример контракта с мостом ERC20
keywords:
  - docs
  - polygon
  - edge
  - Bridge
  - ERC20
---

В этом разделе описывается процесс настройки моста ERC20 для практического сценария использования.

В этом руководстве вы будете использовать тестовую сеть Mumbai Polygon PoS и локальную цепочку Polygon Edge. Убедитесь, что у вас имеется конечная точка JSON-RPC для Mumbai и что вы настроили Polygon Edge в локальной среде. Подробнее см. в разделах [Локальная настройка](/docs/edge/get-started/set-up-ibft-locally) или [Облачная настройка](/docs/edge/get-started/set-up-ibft-on-the-cloud).

## Сценарий {#scenario}

Данный сценарий заключается в настройке моста для токена ERC20, развернутого в публичной цепочке (Polygon PoS), для недорогого трансфера в приватную цепочку (Polygon Edge) для пользователей в обычной ситуации. В этом случае общее количество токенов определено в публичной цепочке, а в приватной цепочке должно существовать только то количество токенов, которое передано из публичной цепочки в приватную цепочку. Поэтому вам потребуется использовать режим блокировки/освобождения в публичной цепочке и режим сжигания/минтинга в приватной цепочке.

При отправке токенов из публичной цепочки в приватную цепочку токен блокируется в контракте ERC20 Handler публичной цепочки, и выполняется минтинг того же количества токенов в приватной цепочке. При трансфере из приватной цепочке в публичную цепочку токен в приватной цепочке сжигается и такое же количество токенов освобождается контрактом ERC20 Handler в публичной цепочке.

## Контракты {#contracts}

Разъясним это на примере простого контракта ERC20, а не контракта ChainBridge. Для режима сжигания/минтинга контракт ERC20 должен иметь методы `mint` и `burnFrom` в дополнение к методам ERC20:

```sol
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract SampleToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(MINTER_ROLE, _msgSender());
        _setupRole(BURNER_ROLE, _msgSender());
    }

    function mint(address recipient, uint256 amount)
        external
        onlyRole(MINTER_ROLE)
    {
        _mint(recipient, amount);
    }

    function burnFrom(address owner, uint256 amount)
        external
        onlyRole(BURNER_ROLE)
    {
        _burn(owner, amount);
    }
}
```

Все коды и скрипты находятся в репозитории Github [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example).

## Шаг 1: развертывание контрактов Bridge и ERC20 Handler {#step1-deploy-bridge-and-erc20-handler-contracts}

Вначале вы развернете контракты Bridge и ERC20Handler с помощью `cb-sol-cli` в обеих цепочках.

```bash
# Deploy Bridge and ERC20 contracts in Polygon PoS chain
$ cb-sol-cli deploy --bridge --erc20Handler --chainId 99 \
  --url https://rpc-mumbai.matic.today \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```

```bash
# Deploy Bridge and ERC20 contracts in Polygon Edge chain
$ cb-sol-cli deploy --bridge --erc20Handler --chainId 100 \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```

Вы получите адреса контрактов Bridge и ERC20Handler следующим образом:

```bash
Deploying contracts...
✓ Bridge contract deployed
✓ ERC20Handler contract deployed

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
Erc721 Handler:     Not Deployed
----------------------------------------------------------------
Generic Handler:    Not Deployed
----------------------------------------------------------------
Erc20:              Not Deployed
----------------------------------------------------------------
Erc721:             Not Deployed
----------------------------------------------------------------
Centrifuge Asset:   Not Deployed
----------------------------------------------------------------
WETC:               Not Deployed
================================================================
```

## Шаг 2: развертывание контракта ERC20 {#step2-deploy-your-erc20-contract}

Вы выполните развертывание вашего контракта ERC20. Этот пример поможет вам с проектом hardhat [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example).

```bash
$ git clone https://github.com/Trapesys/chainbridge-example.git
$ cd chainbridge-example
$ npm i
```

Создайте файл `.env` и задайте следующие значения.

```.env
PRIVATE_KEYS=0x...
MUMBAI_JSONRPC_URL=https://rpc-mumbai.matic.today
EDGE_JSONRPC_URL=http://localhost:10002
```

Теперь вы развернете контракт ERC20 в обеих цепочках.

```bash
$ npx hardhat deploy --contract erc20 --name <ERC20_TOKEN_NAME> --symbol <ERC20_TOKEN_SYMBOL> --network mumbai
```

```bash
$ npx hardhat deploy --contract erc20 --name <ERC20_TOKEN_NAME> --symbol <ERC20_TOKEN_SYMBOL> --network edge
```

После успешного развертывания вы получите адрес контракта, который будет выглядеть вот так:

```bash
ERC20 contract has been deployed
Address: <ERC20_CONTRACT_ADDRESS>
Name: <ERC20_TOKEN_NAME>
Symbol: <ERC20_TOKEN_SYMBOL>
```

## Шаг 3: регистрация идентификатора ресурса в Bridge {#step3-register-resource-id-in-bridge}

Вы зарегистрируете идентификатор ресурса, используемый для ассоциации с ресурсом в среде нескольких цепочек. Необходимо задать один и тот же идентификатор ресурса в обеих цепочках.

```bash
$ cb-sol-cli bridge register-resource \
  --url https://rpc-mumbai.matic.today \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  --resourceId "0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[ERC20_CONTRACT_ADDRESS]"
```

```bash
$ cb-sol-cli bridge register-resource \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --resourceId "0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[ERC20_CONTRACT_ADDRESS]"
```

## Шаг 4: настройка режима минтинга/сжигания для моста ERC20 в Edge {#step4-set-mint-burn-mode-in-erc20-bridge-of-the-edge}

Ожидается, что мост (контракт Bridge) будет работать как режим сжигания/минтинга в Polygon Edge. Вы зададите режим сжигания/минтинга с помощью .`cb-sol-cli`

```bash
$ cb-sol-cli bridge set-burn \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[ERC20_CONTRACT_ADDRESS]"
```

Также вам нужно будет предоставить роли minter и burner контракту ERC20 Handler.

```bash
$ npx hardhat grant --role mint --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --network edge
$ npx hardhat grant --role burn --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --network edge
```

## Шаг 5: минтинг токена {#step5-mint-token}

Вы будете производить минтинг новых токенов ERC20 в цепочке Mumbai.

```bash
$ npx hardhat mint --type erc20 --contract [ERC20_CONTRACT_ADDRESS] --address [ACCOUNT_ADDRESS] --amount 100000000000000000000 --network mumbai # 100 Token
```

После успешного выполнения транзакции в аккунте появится выпущенный токен.

## Шаг 6: запуск трансфера ERC20 {#step6-start-erc20-transfer}

Прежде чем приступать к этому шагу, необходимо убедиться, что ретранслятор запущен. Подробнее см. в разделе [Настройка](/docs/edge/additional-features/chainbridge/setup).

При трансфере токенов из Mumbai в Edge контракт ERC20 Handler в Mumbai выводит токены с вашего аккаунта. До трансфера следует вызвать одобрение.

```bash
$ npx hardhat approve --type erc20 --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --amount 10000000000000000000 --network mumbai # 10 Token
```

Наконец, вы начнете трансфер токенов из Mumbai в Edge, используя `cb-sol-cli`.

```bash
# Start transfer from Mumbai to Polygon Edge chain
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

После успешного выполнения транзакции депозита ретранслятор получит событие и проголосует за предложение. Он выполняет транзакцию отправки токенов в аккаунт получателя в цепочке Polygon Edge после отправки требуемого количества голосов.

```bash
INFO[11-19|08:15:58] Handling fungible deposit event          chain=mumbai dest=100 nonce=1
INFO[11-19|08:15:59] Attempting to resolve message            chain=polygon-edge type=FungibleTransfer src=99 dst=100 nonce=1 rId=000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00
INFO[11-19|08:15:59] Creating erc20 proposal                  chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Watching for finalization event          chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Submitted proposal vote                  chain=polygon-edge tx=0x67a97849951cdf0480e24a95f59adc65ae75da23d00b4ab22e917a2ad2fa940d src=99 depositNonce=1 gasPrice=1
INFO[11-19|08:16:24] Submitted proposal execution             chain=polygon-edge tx=0x63615a775a55fcb00676a40e3c9025eeefec94d0c32ee14548891b71f8d1aad1 src=99 dst=100 nonce=1 gasPrice=5
```

После успешного выполнения транзакции вы получите токены в цепочке Polygon Edge.

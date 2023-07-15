---
id: use-case-erc721-bridge
title: Сценарий использования — ERC721 Bridge
description: Пример для контракта Bridge ERC721
keywords:
  - docs
  - polygon
  - edge
  - Bridge
  - ERC721
---

В этом разделе описывается процесс настройки Bridge ERC721 для практического сценария использования.

В этом руководстве вы будете использовать тестовую сеть Mumbai Polygon PoS и локальную цепочку Polygon Edge. Убедитесь, что у вас имеется конечная точка JSON-RPC для Mumbai и что вы настроили Polygon Edge в локальной среде. Подробнее см. в разделах [Локальная настройка](/docs/edge/get-started/set-up-ibft-locally) или [Облачная настройка](/docs/edge/get-started/set-up-ibft-on-the-cloud).

## Сценарий {#scenario}

Этот сценарий заключается в создании Bridge для NFT ERC721, который уже развернут в публичной цепочке (Polygon PoS), чтобы обеспечить недорогой трансфер в публичной цепочке (Polygon Edge) для пользователей в обычном случае. В таком случае оригинальные метаданные были определены в публичной цепочке, а в частной цепочке могут существовать только те NFT, которые были переданы из публичной цепочки. Поэтому вам потребуется использовать режим блокировки/освобождения в публичной цепочке и режим сжигания/минтинга в приватной цепочке.

При отправке токенов NFT из публичной цепочки в приватную цепочку NFT токен блокируется в контракте ERC721 Handler публичной цепочки и выполняется минтинг того же количества токенов NFT в приватной цепочке. При трансфере из приватной цепочки в публичную цепочку NFT токен в приватной цепочке сжигается и такое же количество токенов NFT освобождается контрактом ERC721 Handler в публичной цепочке.

## Контракты {#contracts}

Разъясним это на примере простого контракта ERC721, а не контракта ChainBridge. Для режима сжигания/минтинга контракт ERC721 должен иметь методы  `mint`и  `burn` в дополнение к методам, определенным в ERC721 следующим образом:

```sol
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract SampleNFT is ERC721, ERC721Burnable, ERC721URIStorage, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    string public baseURI;

    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI
    ) ERC721(name, symbol) {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(MINTER_ROLE, _msgSender());
        _setupRole(BURNER_ROLE, _msgSender());

        _setBaseURI(baseURI);
    }

    function mint(
        address recipient,
        uint256 tokenID,
        string memory data
    ) public onlyRole(MINTER_ROLE) {
        _mint(recipient, tokenID);
        _setTokenURI(tokenID, data);
    }

    function burn(uint256 tokenID)
        public
        override(ERC721Burnable)
        onlyRole(BURNER_ROLE)
    {
        _burn(tokenID);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _burn(uint256 tokenId)
        internal
        virtual
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function _setBaseURI(string memory baseURI_) internal {
        baseURI = baseURI_;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }
}
```

Все коды и скрипты находятся в репозитории Github [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example).

## Шаг 1: разверните контракты Bridge и ERC721 Handler {#step1-deploy-bridge-and-erc721-handler-contracts}

Вначале следует развернуть контракты Bridge и ERC721 Handler с помощью `cb-sol-cli` в обеих цепочках.

```bash
# Deploy Bridge and ERC721 contracts in Polygon PoS chain
$ cb-sol-cli deploy --bridge --erc721Handler --chainId 99 \
  --url https://rpc-mumbai.matic.today \
  --gasPrice [GAS_PRICE] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```

```bash
# Deploy Bridge and ERC721 contracts in Polygon Edge chain
$ cb-sol-cli deploy --bridge --erc721Handler --chainId 100 \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```

Вы получите адреса контрактов Bridge и ERC721 Handler следующим образом:

```bash
Deploying contracts...
✓ Bridge contract deployed
✓ ERC721Handler contract deployed

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
Erc20 Handler:      Not Deployed
----------------------------------------------------------------
Erc721 Handler:     <ERC721_HANDLER_CONTRACT_ADDRESS>
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

## Шаг 2: разверните ваш контракт ERC721 {#step2-deploy-your-erc721-contract}

Вам следует развернуть контракт RC721. Этот пример поможет вам с проектом hardhat [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example).

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

Затем следует развернуть контракт ERC721 в обеих цепочках.

```bash
$ npx hardhat deploy --contract erc721 --name <ERC721_TOKEN_NAME> --symbol <ERC721_TOKEN_SYMBOL> --uri <BASE_URI> --network mumbai
```

```bash
$ npx hardhat deploy --contract erc721 --name <ERC721_TOKEN_NAME> --symbol <ERC721_TOKEN_SYMBOL> --uri <BASE_URI> --network edge
```

После успешного развертывания вы получите адрес контракта, который будет выглядеть вот так:

```bash
ERC721 contract has been deployed
Address: <ERC721_CONTRACT_ADDRESS>
Name: <ERC721_TOKEN_NAME>
Symbol: <ERC721_TOKEN_SYMBOL>
Base URI: <ERC721_BASE_URI>
```

## Шаг 3: регистрация идентификатора ресурса в Bridge {#step3-register-resource-id-in-bridge}

Вам следует зарегистрировать идентификатор ресурса, используемый для ассоциации с ресурсами в среде из нескольких цепочек.

```bash
$ cb-sol-cli bridge register-resource \
  --url https://rpc-mumbai.matic.today \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  # Set Resource ID for ERC721
  --resourceId "0x000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC721_HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[ERC721_CONTRACT_ADDRESS]"
```

```bash
$ cb-sol-cli bridge register-resource \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  # Set Resource ID for ERC721
  --resourceId "0x000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC721_HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[ERC721_CONTRACT_ADDRESS]"
```

## Шаг 4: настройте режим минтинга/сжигания для моста ERC721 в Edge {#step4-set-mint-burn-mode-in-erc721-bridge-of-the-edge}

Мост должен работать в качестве режима сжигания/минтинга в Edge. Вам следует установить режим сжигания/минтинга.

```bash
$ cb-sol-cli bridge set-burn \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC721_HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[ERC721_CONTRACT_ADDRESS]"
```

А также вам следует предоставить роль того, кто осуществляет минтинг и сжигание, контракту ERC721 Handler.

```bash
$ npx hardhat grant --role mint --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --network edge
$ npx hardhat grant --role burn --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --network edge
```

## Шаг 5: осуществите минтинг NFT {#step5-mint-nft}

Вам следует осуществить минтинг новых ERC721 NFT в цепочке Mumbai.

```bash
$ npx hardhat mint --type erc721 --contract [ERC721_CONTRACT_ADDRESS] --address [ACCOUNT_ADDRESS] --id 0x50 --data hello.json --network mumbai
```

После успешного выполнения транзакции на аккунте появится выпущенный токен NFT.

## Шаг 6: запустите трансфер ERC721 {#step6-start-erc721-transfer}

Прежде чем осуществить этот шаг, убедитесь, что вы запустили ретранслятор. Подробнее см. в разделе [Настройка](/docs/edge/additional-features/chainbridge/setup).

При трансфере NFT из Mumbai в Edge контракт ERC721 Handler выводит NFT с вашего аккаунта. До трансфера следует вызвать одобрение.

```bash
$ npx hardhat approve --type erc721 --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --id 0x50 --network mumbai
```

Наконец, запустите трансфер NFT из Mumbai в адрес Edge.

```bash
# Start transfer from Mumbai to Polygon Edge chain
$ cb-sol-cli erc721 deposit \
  --url https://rpc-mumbai.matic.today \
  --privateKey [PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  --id 0x50 \
  # ChainID for Polygon Edge chain
  --dest 100 \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --recipient "[RECIPIENT_ADDRESS_IN_POLYGON_EDGE_CHAIN]" \
  --resourceId "0x000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501"
```

После успешного выполнения транзакции депозита ретранслятор получит событие и проголосует за предложение.   Он выполняет транзакцию по отправке NFT в адрес аккаунта получателя в цепочке Polygon Edge после подачи необходимого количества голосов.

```bash
INFO[11-19|09:07:50] Handling nonfungible deposit event       chain=mumbai
INFO[11-19|09:07:50] Attempting to resolve message            chain=polygon-edge type=NonFungibleTransfer src=99 dst=100 nonce=2 rId=000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501
INFO[11-19|09:07:50] Creating erc721 proposal                 chain=polygon-edge src=99 nonce=2
INFO[11-19|09:07:50] Watching for finalization event          chain=polygon-edge src=99 nonce=2
INFO[11-19|09:07:50] Submitted proposal vote                  chain=polygon-edge tx=0x58a22d84a08269ad2e8d52d8dc038621f1a21109d11c7b6e0d32d5bf21ea8505 src=99 depositNonce=2 gasPrice=1
INFO[11-19|09:08:15] Submitted proposal execution             chain=polygon-edge tx=0x57419844881a07531e31667c609421662d94d21d0709e64fb728138309267e68 src=99 dst=100 nonce=2 gasPrice=3
```

После успешного выполнения транзакции вы получите NFT в цепочке Polygon Edge.

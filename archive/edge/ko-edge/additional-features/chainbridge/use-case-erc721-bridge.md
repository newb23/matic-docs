---
id: use-case-erc721-bridge
title: 사용 사례 - ERC721 브리지
description: ERC721 계약 브리지의 예
keywords:
  - docs
  - polygon
  - edge
  - Bridge
  - ERC721
---

이 섹션의 목표는 실제 사용 사례를 위해 ERC20 브리지의 설정 흐름에 대해 안내하는 것입니다.

이 가이드에서는 Mumbai Polygon PoS 테스트넷 및 Polygon 엣지 로컬 체인을 사용합니다. Mumbai용 JSON-RPC 엔드포인트가 있는지 그리고 로컬 환경에서 Polygon 엣지를 설정했는지 확인하세요. 자세한 내용은 [로컬 설정](/docs/edge/get-started/set-up-ibft-locally) 또는 [클라우드 설정](/docs/edge/get-started/set-up-ibft-on-the-cloud)을 참조하세요.

## 시나리오 {#scenario}

이 시나리오는 일반적인 경우에 사용자가 프라이빗 체인(Polygon 엣지)에서 저비용으로 전송할 수 있도록 이미 퍼블릭 체인(Polygon PoS)에 배포된 ERC721 NFT용 브리지를 설정하는 시나리오입니다. 이 경우 원래의 메타데이터는 퍼블릭 체인에 정의되어 있고 퍼블릭 체인에서 이전된 NFT만 프라이빗 체인에 존재할 수 있습니다. 이러한 이유로 퍼블릭 체인에서는 잠금/해제 모드를 사용하고 프라이빗 체인에서는 소각/발행 모드를 사용해야 합니다.

퍼블릭 체인에서 프라이빗 체인으로 NFT를 전송하면, 퍼블릭 체인의 ERC721 핸들러 계약에서는 해당 토큰이 잠금 처리되고 프라이빗 체인에서는 동일한 금액의 토큰이 발행됩니다. 반면, 프라이빗 체인에서 퍼블릭 체인으로 이전이 발생하면, 프라이빗 체인의 NFT는 소각되고 퍼블릭 체인의 ERC20 핸들러 계약에서 동일한 금액의 NFT가 잠금 해제됩니다.

## 계약 {#contracts}

ChainBridge가 개발한 계약 대신 간단한 ERC721 계약을 사용하여 설명합니다. 소각/발행 모드의 경우, ERC721 계약에는 다음과 같이 ERC721에 정의된 메서드와 별도로 `mint` 및 `burn` 메서드가 있어야 합니다.

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

모든 코드와 스크립트는 Github 저장소([Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example))에서 찾을 수 있습니다.

## 1단계: 브리지 및 ERC721 핸들러 계약 배포 {#step1-deploy-bridge-and-erc721-handler-contracts}

먼저, 두 체인에서 `cb-sol-cli`를 사용하여 브리지 및 ERC20 핸들러 계약을 배포합니다.

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

다음과 같은 브리지 및 ERC721 핸들러 계약 주소를 얻게 됩니다.

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

## 2단계: ERC721 계약 배포 {#step2-deploy-your-erc721-contract}

ERC721 계약을 배포합니다. 이 예에서는 hardhat 프로젝트([Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example))를 사용해 설명합니다.

```bash
$ git clone https://github.com/Trapesys/chainbridge-example.git
$ cd chainbridge-example
$ npm i
```

`.env` 파일을 생성하고 다음 값을 설정하세요.

```.env
PRIVATE_KEYS=0x...
MUMBAI_JSONRPC_URL=https://rpc-mumbai.matic.today
EDGE_JSONRPC_URL=http://localhost:10002
```

그런 다음, 두 체인에 ERC721 계약을 배포합니다.

```bash
$ npx hardhat deploy --contract erc721 --name <ERC721_TOKEN_NAME> --symbol <ERC721_TOKEN_SYMBOL> --uri <BASE_URI> --network mumbai
```

```bash
$ npx hardhat deploy --contract erc721 --name <ERC721_TOKEN_NAME> --symbol <ERC721_TOKEN_SYMBOL> --uri <BASE_URI> --network edge
```

배포에 성공하면 다음과 같은 계약 주소를 얻게 됩니다.

```bash
ERC721 contract has been deployed
Address: <ERC721_CONTRACT_ADDRESS>
Name: <ERC721_TOKEN_NAME>
Symbol: <ERC721_TOKEN_SYMBOL>
Base URI: <ERC721_BASE_URI>
```

## 3단계: 브리지에 리소스 ID 등록 {#step3-register-resource-id-in-bridge}

크로스체인 환경의 리소스와 연결된 리소스 ID를 등록합니다.

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

## 4단계: 엣지의 ERC721 브리지에 발행/소각 모드 설정 {#step4-set-mint-burn-mode-in-erc721-bridge-of-the-edge}

브리지는 엣지에서 소각/발행 모드로 작동합니다. 소각/발행 모드를 설정합니다.

```bash
$ cb-sol-cli bridge set-burn \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC721_HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[ERC721_CONTRACT_ADDRESS]"
```

그리고 ERC721 핸들러 계약에 발행자 및 소각자 역할을 부여해야 합니다.

```bash
$ npx hardhat grant --role mint --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --network edge
$ npx hardhat grant --role burn --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --network edge
```

## 5단계: NFT 발행 {#step5-mint-nft}

Mumbai 체인 내에서 새로운 ERC721 NFT를 발행합니다.

```bash
$ npx hardhat mint --type erc721 --contract [ERC721_CONTRACT_ADDRESS] --address [ACCOUNT_ADDRESS] --id 0x50 --data hello.json --network mumbai
```

트랜잭션이 성공하면 해당 계정은 발행된 NFT를 보유하게 됩니다.

## 6단계: ERC721 이전 시작 {#step6-start-erc721-transfer}

이 단계를 시작하기 전에 릴레이어를 시작했는지 확인하시기 바랍니다. 자세한 내용은 [설정](/docs/edge/additional-features/chainbridge/setup)을 확인하세요.

Mumbai에서 엣지로 NFT를 이전하는 동안, Mumbai의 ERC721 핸들러 계약은 계정에서 NFT를 출금합니다. 이전 전에 승인을 호출합니다.

```bash
$ npx hardhat approve --type erc721 --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --id 0x50 --network mumbai
```

마지막으로, Mumbai에서 엣지로 NFT 이전을 시작합니다.

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

입금 트랜잭션에 성공하면 릴레이어가 이벤트를 가져와 해당 제안에 투표합니다.  
릴레이어는 필요한 수의 투표가 제출되면 Polygon 엣지 체인의 수신자 계정으로 NFT를 이전하는 트랜잭션을 실행합니다.

```bash
INFO[11-19|09:07:50] Handling nonfungible deposit event       chain=mumbai
INFO[11-19|09:07:50] Attempting to resolve message            chain=polygon-edge type=NonFungibleTransfer src=99 dst=100 nonce=2 rId=000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501
INFO[11-19|09:07:50] Creating erc721 proposal                 chain=polygon-edge src=99 nonce=2
INFO[11-19|09:07:50] Watching for finalization event          chain=polygon-edge src=99 nonce=2
INFO[11-19|09:07:50] Submitted proposal vote                  chain=polygon-edge tx=0x58a22d84a08269ad2e8d52d8dc038621f1a21109d11c7b6e0d32d5bf21ea8505 src=99 depositNonce=2 gasPrice=1
INFO[11-19|09:08:15] Submitted proposal execution             chain=polygon-edge tx=0x57419844881a07531e31667c609421662d94d21d0709e64fb728138309267e68 src=99 dst=100 nonce=2 gasPrice=3
```

실행 트랜잭션에 성공하면 Polygon 엣지 체인 내에서 NFT를 받게 됩니다.

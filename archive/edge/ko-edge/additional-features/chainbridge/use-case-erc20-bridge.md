---
id: use-case-erc20-bridge
title: 사용 사례 - ERC20 브리지
description: ERC20 계약 브리지의 예
keywords:
  - docs
  - polygon
  - edge
  - Bridge
  - ERC20
---

이 섹션의 목표는 실제 사용 사례를 위해 ERC20 브리지의 설정 흐름을 안내하는 것입니다.

이 가이드에서는 Mumbai Polygon PoS 테스트넷 및 Polygon 엣지 로컬 체인을 사용합니다. Mumbai용 JSON-RPC 엔드포인트가 있는지 그리고 로컬 환경에서 Polygon 엣지를 설정했는지 확인하세요. 자세한 내용은 [로컬 설정](/docs/edge/get-started/set-up-ibft-locally) 또는 [클라우드 설정](/docs/edge/get-started/set-up-ibft-on-the-cloud)을 참조하세요.

## 시나리오 {#scenario}

이 시나리오의 목표는 프라이빗 체인(Polygon 엣지)에서 일반 사례의 사용자가 저비용으로 이전할 수 있도록 이미 퍼블릭 체인(Polygon PoS)에 배포한 ERC20 토큰에 대해 브리지를 설정하는 것입니다. 이 경우, 총 토큰 공급량은 퍼블릭 체인에서 정의되었으며, 프라이빗 체인에는 퍼블릭 체인에서 프라이빗 체인으로 이전된 토큰 금액만 있어야 합니다. 이러한 이유 때문에 퍼블릭 체인에서는 잠금/해제 모드를 사용하고 프라이빗 체인에서는 소각/발행 모드를 사용해야 합니다.

퍼블릭 체인에서 프라이빗 체인으로 토큰을 보내면, 퍼블릭 체인의 ERC20 핸들러 계약에서는 해당 토큰이 잠기고 프라이빗 체인에서는 동일한 금액의 토큰이 발행됩니다. 반면, 프라이빗 체인에서 퍼블릭 체인으로 이전이 발생하면, 프라이빗 체인의 토큰은 소각되고 퍼블릭 체인의 ERC20 핸들러 계약에서는 동일한 금액의 토큰이 잠금 해제됩니다.

## 계약 {#contracts}

ChainBridge가 개발한 계약 대신 간단한 ERC20 계약을 사용하여 설명합니다. 소각/발행 모드의 경우, ERC20 계약에는 `mint` 및 `burnFrom` 메서드 그리고 ERC20을 위한 다음과 같은 메서드가 있어야 합니다.

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

모든 코드와 스크립트는 Github 저장소 [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example)에서 찾을 수 있습니다.

## 1단계: 브리지 및 ERC20 핸들러 계약 배포 {#step1-deploy-bridge-and-erc20-handler-contracts}

첫 번째로, 두 체인에서 `cb-sol-cli`를 사용하여 브리지 및 ERC20 핸들러 계약을 배포합니다.

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

다음과 같은 브리지 및 ERC20 핸들러 계약 주소를 얻게 됩니다.

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

## 2단계: ERC20 계약 배포 {#step2-deploy-your-erc20-contract}

ERC20 계약을 배포합니다. 이 예에서는 hardhat 프로젝트 [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example)를 사용해 설명합니다.

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

다음으로 두 체인에 ERC20 계약을 배포합니다.

```bash
$ npx hardhat deploy --contract erc20 --name <ERC20_TOKEN_NAME> --symbol <ERC20_TOKEN_SYMBOL> --network mumbai
```

```bash
$ npx hardhat deploy --contract erc20 --name <ERC20_TOKEN_NAME> --symbol <ERC20_TOKEN_SYMBOL> --network edge
```

배포에 성공하면 다음과 같은 계약 주소를 얻게 됩니다.

```bash
ERC20 contract has been deployed
Address: <ERC20_CONTRACT_ADDRESS>
Name: <ERC20_TOKEN_NAME>
Symbol: <ERC20_TOKEN_SYMBOL>
```

## 3단계: 브리지에 리소스 ID 등록 {#step3-register-resource-id-in-bridge}

크로스체인 환경의 리소스와 연관된 리소스 ID를 등록합니다. 두 체인에 동일한 리소스 ID를 설정해야 합니다.

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

## 4단계: 엣지의 ERC20 브리지에 발행/소각 모드 설정 {#step4-set-mint-burn-mode-in-erc20-bridge-of-the-edge}

Polygon 엣지에서는 브리지가 소각/발행 모드로 작동할 것으로 예상됩니다. `cb-sol-cli`를 사용하여 소각/발행 모드를 설정합니다.

```bash
$ cb-sol-cli bridge set-burn \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[ERC20_CONTRACT_ADDRESS]"
```

또한, ERC20 핸들러 계약에 발행자 및 소각자 역할을 부여해야 합니다.

```bash
$ npx hardhat grant --role mint --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --network edge
$ npx hardhat grant --role burn --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --network edge
```

## 5단계: 토큰 발행 {#step5-mint-token}

Mumbai 체인에서 새로운 ERC20 토큰을 발행할 것입니다.

```bash
$ npx hardhat mint --type erc20 --contract [ERC20_CONTRACT_ADDRESS] --address [ACCOUNT_ADDRESS] --amount 100000000000000000000 --network mumbai # 100 Token
```

트랜잭션이 성공하면 계정은 발행된 토큰을 보유하게 됩니다.

## 6단계: ERC20 이전 시작 {#step6-start-erc20-transfer}

이 단계를 시작하기 전에 릴레이어를 시작했는지 확인하세요. 자세한 내용은 [설정](/docs/edge/additional-features/chainbridge/setup)을 확인하세요.

Mumbai에서 엣지로의 토큰 이전 중에 Mumbai의 ERC20 핸들러 계약은 계정으로부터 토큰을 인출합니다. 이전 전에 승인을 호출합니다.

```bash
$ npx hardhat approve --type erc20 --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --amount 10000000000000000000 --network mumbai # 10 Token
```

마지막으로, `cb-sol-cli`를 사용하여 Mumbai에서 엣지로의 토큰 이전을 시작합니다.

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

입금 트랜잭션에 성공하면 릴레이어가 이벤트를 가져와 제안에 투표합니다. 릴레이어는 필요한 투표 수가 제출되면 Polygon 엣지 체인의 수신자 계정으로 토큰을 보내기 위한 트랜잭션을 실행합니다.

```bash
INFO[11-19|08:15:58] Handling fungible deposit event          chain=mumbai dest=100 nonce=1
INFO[11-19|08:15:59] Attempting to resolve message            chain=polygon-edge type=FungibleTransfer src=99 dst=100 nonce=1 rId=000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00
INFO[11-19|08:15:59] Creating erc20 proposal                  chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Watching for finalization event          chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Submitted proposal vote                  chain=polygon-edge tx=0x67a97849951cdf0480e24a95f59adc65ae75da23d00b4ab22e917a2ad2fa940d src=99 depositNonce=1 gasPrice=1
INFO[11-19|08:16:24] Submitted proposal execution             chain=polygon-edge tx=0x63615a775a55fcb00676a40e3c9025eeefec94d0c32ee14548891b71f8d1aad1 src=99 dst=100 nonce=1 gasPrice=5
```

실행 트랜잭션에 성공하면 Polygon 엣지 체인에서 토큰을 받게 됩니다.

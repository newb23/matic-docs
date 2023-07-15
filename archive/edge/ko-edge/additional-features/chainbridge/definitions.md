---
id: definitions
title: 일반적 정의
description: ChainBridge에서 사용되는 용어의 일반적 정의
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---


## 릴레이어 {#relayer}
Chainbridge는 릴레이어형 브리지입니다. 릴레이어의 역할은 요청 실행(예: 소각/잠금 해제할 토큰 수)에 투표하는 것입니다.
릴레이어는 모든 체인의 이벤트를 모니터링하고, 체인에서 `Deposit` 이벤트를 수신하는 경우 대상 체인 브리지 계약의 제안에 투표합니다. 필요한 수의 투표가 제출되면 릴레이어는 브리지 계약에서 메서드를 호출하여 제안을 실행합니다. 브리지는 핸들러 계약에 실행을 위임합니다.


## 계약 유형 {#types-of-contracts}
ChainBridge에서는 각 체인에 브리지, 핸들러, 대상이라는 세 가지 유형의 계약이 있습니다.

| **유형** | **설명** |
|----------|-------------------------------------------------------------------------------------------------------------------------------|
| 브리지 계약 | 요청, 투표, 실행을 관리하는 브리지 계약은 각 체인에 배포되어야 합니다. 사용자는 브리지에서 `deposit`을 호출하여 이전을 시작하고 브리지는 대상 계약에 해당하는 핸들러 계약에 프로세스를 위임합니다. 핸들러 계약이 대상 계약을 성공적으로 호출하면 브리지 계약은 `Deposit` 이벤트를 내보내 릴레이어에게 알립니다. |
| 핸들러 계약 | 이 계약은 대상 계약과 상호작용하여 입금 및 제안을 실행합니다. 사용자의 요청을 검증하고 대상 계약을 호출하며 대상 계약의 일부 설정을 지원합니다. 인터페이스가 다른 각각의 대상 계약을 호출하는 특정 핸들러 계약이 존재하며, 핸들러 계약의 간접 호출은 모든 종류의 자산이나 데이터을 이전할 수 있는 브리지를 만듭니다. 현재 ChainBridge에서 구현하는 핸들러 계약에는 ERC20 핸들러, ERC721 핸들러, 일반 핸들러의 세 가지 유형이 있습니다. |
| 대상 계약 | 교환되는 자산 또는 체인 간에 전송되는 메시지를 관리하는 계약입니다. 이 계약과의 상호작용은 브리지의 양쪽에서 이루어집니다. |

<div style={{textAlign: 'center'}}>

![ChainBridge 아키텍처](/img/edge/chainbridge/architecture.svg)
*ChainBridge 아키텍처*

</div>

<div style={{textAlign: 'center'}}>

![ERC20 토큰 이전 워크플로](/img/edge/chainbridge/erc20-workflow.svg)
*ERC20 토큰 이전 워크플로의 예*

</div>

## 계정 유형 {#types-of-accounts}

시작하기 전에, 계정에 트랜잭션을 생성하기에 충분한 기본 토큰이 있는지 확인하세요. Polygon 엣지에서는 제네시스 블록을 생성할 때 사전 채굴된 잔액을 계정에 할당할 수 있습니다.

| **유형** | **설명** |
|----------|-------------------------------------------------------------------------------------------------------------------------------|
| 관리자 | 이 계정에 기본적으로 관리자 역할이 부여됩니다. |
| 사용자 | 자산을 전송/수신하는 발신자/수신자 계정입니다. 토큰 이전을 승인하고 이전을 시작하기 위해 브리지 계약에서 입금을 호출할 때 발신자 계정은 가스 요금을 지불합니다. |

:::info 관리자 역할

특정 작업은 관리자 역할 계정에서만 수행할 수 있습니다. 기본적으로 브리지 계약의 배포자는 관리자 역할을 갖습니다. 다른 계정에 관리자 역할을 부여하거나 삭제하는 방법은 아래에서 확인할 수 있습니다.

### 관리자 역할 추가 {#add-admin-role}

관리자 추가

```bash
# Grant admin role
$ cb-sol-cli admin add-admin \
  --url [JSON_RPC_URL] \
  --privateKey [PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --admin "[NEW_ACCOUNT_ADDRESS]"
```
### 관리자 역할 취소 {#revoke-admin-role}

관리자 삭제

```bash
# Revoke admin role
$ cb-sol-cli admin remove-admin \
  --url [JSON_RPC_URL] \
  --privateKey [PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --admin "[NEW_ACCOUNT_ADDRESS]"
```

## `admin` 계정이 허용하는 작업은 다음과 같습니다. {#account-are-as-below}

### 리소스 설정 {#set-resource}

핸들러 계약 주소로 리소스 ID를 등록합니다.

```bash
# Register new resource
$ cb-sol-cli bridge register-resource \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --resourceId "[RESOURCE_ID]" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[TARGET_CONTRACT_ADDRESS]"
```

### 계약을 소각/발행 가능하도록 만들기 {#make-contract-burnable-mintable}

핸들러에서 토큰 계약을 발행/소각 가능하도록 설정합니다.

```bash
# Let contract burnable/mintable
$ cb-sol-cli bridge set-burn \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[TARGET_CONTRACT_ADDRESS]"
```

### 제안 취소 {#cancel-proposal}

실행할 제안을 취소합니다.

```bash
# Cancel ongoing proposal
$ cb-sol-cli bridge cancel-proposal \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --resourceId "[RESOURCE_ID]" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --chainId "[CHAIN_ID_OF_SOURCE_CHAIN]" \
  --depositNonce "[NONCE]"
```

### 일시 정지/일시 정지 해제 {#pause-unpause}

입금, 제안 생성, 투표, 입금 실행을 일시적으로 정지합니다.

```bash
# Pause
$ cb-sol-cli admin pause \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]"

# Unpause
$ cb-sol-cli admin unpause \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]"
```

### 요금 변경 {#change-fee}

브리지 계약에 지불되는 요금을 변경합니다.

```bash
# Change fee for execution
$ cb-sol-cli admin set-fee \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --fee [FEE_IN_WEI]
```

### 릴레이어 추가/삭제 {#add-remove-a-relayer}

계정을 새 릴레이어로 추가하거나 릴레이어에서 계정을 삭제합니다.

```bash
# Add relayer
$ cb-sol-cli admin add-relayer \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --relayer "[NEW_RELAYER_ADDRESS]"

# Remove relayer
$ cb-sol-cli admin remove-relayer \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --relayer "[RELAYER_ADDRESS]"
```

### 릴레이어 임계값 변경 {#change-relayer-threshold}

제안 실행에 필요한 투표 수를 변경합니다.

```bash
# Remove relayer
$ cb-sol-cli admin set-threshold \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --threshold [THRESHOLD]
```
:::

## 체인 ID {#chain-id}

ChainBridge `chainId`는 블록체인 네트워크를 구별하기 위해 브릿지에서 사용하는 임의의 값으로, uint8의 범위 안에 있어야 합니다. 혼등하지 않도록 언급하자면, 이는 네트워크의 체인 ID와 동일하지 않습니다. 고유한 값이어야 하지만 네트워크의 ID와 같을 필요는 없습니다.

이 사례에서는 Mumbai 테스트넷의 체인 ID가 `80001`이지만 uint8로 표현할 수 없으므로 `chainId`에 `99`를 설정했습니다.

## 리소스 ID {#resource-id}

리소스 ID는 네트워크 간에 전송되는 특정 자산(리소스)과 연결된, 크로스체인 환경 내의 고유한 32바이트 값입니다.

리소스 ID는 임의의 값이지만 보통은 규칙으로 마지막 바이트에 소스 체인(이 자산의 출처인 네트워크)의 체인 ID가 포함됩니다.

## Polygon PoS용 JSON-RPC URL {#json-rpc-url-for-polygon-pos}

이 가이드에서는 Polygon이 제공하는 공개 JSON-RPC URL(https://rpc-mumbai.matic.today)을 사용합니다(트래픽 제한 또는 속도 제한이 있을 수 있음). 이는 Polygon Mumbai 테스트넷과 연결하는 데에만 사용됩니다. 계약을 배포하는 경우 JSON-RPC에 많은 쿼리/요청을 보내기 때문에 Infura와 같은 외부 서비스에서 JSON-RPC URL을 얻는 것을 권장합니다.

## 토큰 이전 처리 방법 {#ways-of-processing-the-transfer-of-tokens}
체인 간에 ERC20 토큰을 이전할 때는 다음 두 가지 모드에서 처리할 수 있습니다.

### 잠금/해제 모드 {#lock-release-mode}
<b>소스 체인:</b> 전송하려는 토큰은 핸들러 계약에서 잠금 처리됩니다.<br/>
<b>대상 체인:</b> 소스 체인에서 전송한 금액 만큼의 토큰이 잠금 해제되고, 핸들러 계약에서 대상 체인의 수신자 계정으로 이전됩니다.

### 소각/발행 모드 {#burn-mint-mode}
<b>소스 체인:</b> 전송하려는 토큰은 소각됩니다.   <br/><b>대상 체인:</b> 소스 체인에서 전송 및 소각된 금액 만큼의 토큰이 대상 체인에서 발행되어 수신자 계정으로 이전됩니다.

체인마다 서로 다른 모드를 사용할 수 있습니다. 즉, 이전을 위해 서브체인에서 토큰을 발행하면서 메인 체인에서는 토큰을 잠금 처리할 수 있습니다. 예를 들어, 총 공급 일정이나 발행 일정이 통제되는 경우 토큰을 잠금/해제하는 것이 합리적일 수 있습니다. 서브체인의 계약이 메인 체인의 공급을 따라야 하는 경우 토큰이 발행/소각됩니다.

기본 모드는 잠금/해제 모드입니다. 토큰을 발행/소각 가능하도록 하려면 `adminSetBurnable` 메서드를 호출해야 합니다. 실행 즉시 토큰을 발행하려면 ERC20 핸들러 계약에 `minter` 역할을 부여해야 합니다.



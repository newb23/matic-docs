---
id: setup-erc20-transfer
title: ERC20 토큰 이전
description: ChainBridge에서 ERC-20 이전 설정 방법
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

지금까지 Polygon PoS와 Polygon 엣지 체인 간에 자산/데이터를 교환하기 위한 브리지를 설정했습니다. 이 섹션에서는 ERC20 브리지를 설정하고 서로 다른 블록체인 간에 토큰을 전송하는 방법을 설명합니다.

## 1단계: 리소스 ID 등록 {#step-1-register-resource-id}

첫째, 크로스체인 환경의 리소스와 연결된 리소스 ID를 등록합니다. 리소스 ID는 이러한 블록체인 간에 이전하는 리소스에 고유한 32바이트 값이어야 합니다. 리소스 ID는 임의의 값이지만 규칙을 통해 마지막 바이트에 홈 체인의 체인 ID를 포함할 수 있습니다(홈 체인은 리소스를 가져온 원래 네트워크를 가리킵니다).

리소스 ID를 등록하려면 `cb-sol-cli bridge register-resource` 명령어를 사용하면 됩니다. `admin` 계정의 비공개 키를 제공해야 합니다.

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

## (선택 사항) 계약을 발행/소각 가능하도록 만들기 {#optional-make-contracts-mintable-burnable}


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

## 2단계: ERC20 토큰 이전 {#step-2-transfer-erc20-token}

Polygon PoS 체인에서 Polygon 엣지 체인으로 ERC20 토큰을 전송합니다.

먼저 토큰을 발행하여 가져올 수 있습니다. `minter` 역할이 있는 계정은 새 토큰을 발행할 수 있습니다. ERC20 계약을 배포한 계정은 기본적으로 `minter` 역할이 있습니다. 다른 계정을 `minter` 역할의 구성원으로 지정하려면 `cb-sol-cli erc20 add-minter` 명령어를 실행해야 합니다.

```bash
# Mint ERC20 tokens
$ cb-sol-cli erc20 mint \
  --url https://rpc-mumbai.matic.today \
  --privateKey [MINTER_ACCOUNT_PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --amount 1000
```

현재 잔액을 확인하려면 `cb-sol-cli erc20 balance` 명령어를 사용하면 됩니다.

```bash
# Check ERC20 token balance
$ cb-sol-cli erc20 balance \
  --url https://rpc-mumbai.matic.today \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --address "[ACCOUNT_ADDRESS]"

[erc20/balance] Account <ACCOUNT_ADDRESS> has a balance of 1000.0
```

그런 다음, ERC20 핸들러로 계정의 ERC20 토큰 이전을 승인해야 합니다.

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

토큰을 Polygon 엣지 체인으로 이전하려면 `deposit`을 호출합니다.

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

입금 트랜잭션이 성공하면 릴레이어가 이벤트를 가져와 해당 제안에 투표합니다. 필요한 투표 수가 제출되면 Polygon 엣지 체인의 수신자 계정으로 토큰을 전송하기 위한 트랜잭션을 실행합니다.

```bash
INFO[11-19|08:15:58] Handling fungible deposit event          chain=mumbai dest=100 nonce=1
INFO[11-19|08:15:59] Attempting to resolve message            chain=polygon-edge type=FungibleTransfer src=99 dst=100 nonce=1 rId=000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00
INFO[11-19|08:15:59] Creating erc20 proposal                  chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Watching for finalization event          chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Submitted proposal vote                  chain=polygon-edge tx=0x67a97849951cdf0480e24a95f59adc65ae75da23d00b4ab22e917a2ad2fa940d src=99 depositNonce=1 gasPrice=1
INFO[11-19|08:16:24] Submitted proposal execution             chain=polygon-edge tx=0x63615a775a55fcb00676a40e3c9025eeefec94d0c32ee14548891b71f8d1aad1 src=99 dst=100 nonce=1 gasPrice=5
```

실행 트랜잭션이 성공하면 Polygon 엣지 체인 내에서 토큰을 받게 됩니다.

```bash
# Check the ERC20 balance in Polygon Edge chain
$ cb-sol-cli erc20 balance \
  --url https://localhost:10002 \
  --privateKey [PRIVATE_KEY] \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --address "[ACCOUNT_ADDRESS]"

[erc20/balance] Account <RECIPIENT_ACCOUNT_ADDRESS> has a balance of 10.0
```

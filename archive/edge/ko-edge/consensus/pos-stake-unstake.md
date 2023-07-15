---
id: pos-stake-unstake
title: 지분증명(PoS) 설정 및 사용
description: "스테이킹, 스테이킹 해제 및 기타 스테이킹 관련 지침입니다."
keywords:
  - docs
  - polygon
  - edge
  - stake
  - unstake
  - validator
  - epoch
---

## 개요 {#overview}

이 가이드에서는 Polygon 엣지로 지분증명 네트워크를 설정하는 방법, 노드를 검사기로 만들기 위해 자금을 스테이킹하는 방법, 자금 스테이킹을 해제하는 방법을 자세히 안내합니다.

읽거나 지나갈 수 있는 **것이 매우** 좋습니다. [로컬 설정](/docs/edge/get-started/set-up-ibft-locally)
/ [클라우드 설정](/docs/edge/get-started/set-up-ibft-on-the-cloud) 섹션을
확인하세요. 이 섹션에는 Polygon 엣지로 권위증명(PoA) 클러스터를 시작하는 데 필요한 단계를
설명합니다.

현재 스테이킹 스마트 계약에서 자금을 스테이킹할 수 있는 검사기 수에 제한은 없습니다.

## 스테이킹 스마트 계약 {#staking-smart-contract}

스테이킹 스마트 계약의 저장소는 [여기](https://github.com/0xPolygon/staking-contracts)에 있습니다.

이 저장소에는 필요한 테스트 스크립트와 ABI 파일은 물론 가장 중요한 스테이킹 스마트 계약 자체가 들어 있습니다.

## N 노드 클러스터 설정 {#setting-up-an-n-node-cluster}

Polygon 엣지로 네트워크를 설정하는 방법은
[로컬 설정](/docs/edge/get-started/set-up-ibft-locally)
/ [클라우드 설정](/docs/edge/get-started/set-up-ibft-on-the-cloud) 섹션에서 다룹니다.

PoS 및 PoA 클러스터 설정 간 **유일한 차이점**은 제네시스 생성 부분에 있습니다.

**PoS 클러스터에 대한 제네시스 파일을 생성할 때는 다음과 같이 `--pos`**라는 추가 플래그가 필요합니다.

```bash
polygon-edge genesis --pos ...
```

## 에포크 길이 설정 {#setting-the-length-of-an-epoch}

에포크에 대한 자세한 내용은 [에포크 블록](/docs/edge/consensus/pos-concepts#epoch-blocks) 섹션에 나와 있습니다.

클러스터의 에포크 크기를 블록 단위로 설정하려는 경우, 제네시스 파일을 생성할 때
다음과 같이 `--epoch-size`라는 추가 플래그를 지정합니다.

```bash
polygon-edge genesis --epoch-size 50
```

제네시스 파일에서 이 값은 에포크 크기를 `50`블록으로 지정하고 있습니다.

블록 단위의 에포크 크기 기본값은 `100000`입니다.

:::info 에포크 길이 줄이기

[에포크 블록](/docs/edge/consensus/pos-concepts#epoch-blocks) 섹션에 나와 있듯이
에포크 블록은 노드에 대한 검사기 세트를 업데이트하는 데 사용됩니다.

블록 단위의 기본 에포크 길이(`100000`)는 검사기 세트의 업데이트를 기다리기에 긴 시간일 수 있습니다. 새로운 블록 추가에
최대 2초가 걸린다고 생각하면 최대 55.5시간이 지나야 검사기 세트가 바뀔 수 있습니다.

에포크 길이 값을 더 낮게 설정하면 검사기 세트가 더욱 자주 업데이트되도록 할 수 있습니다.

:::

## 스테이킹 스마트 계약 스크립트 사용 {#using-the-staking-smart-contract-scripts}

### 기본 요건 {#prerequisites}

스테이킹 스마트 계약 저장소는 NPM이 필요한 Hardhat 프로젝트입니다.

정확하게 초기화하려면 메인 디렉터리에서 다음을 실행하세요.

```bash
npm install
````

### 제공된 도우미 스크립트 설정 {#setting-up-the-provided-helper-scripts}

배포된 스테이킹 스마트 계약과 상호작용하기 위한 스크립트는
[스테이킹 스마트 계약 저장소](https://github.com/0xPolygon/staking-contracts)에 있습니다.

스마트 계약 저장소 위치에서 다음과 같은 매개변수로 `.env` 파일을 생성하세요.

```bash
JSONRPC_URL=http://localhost:10002
PRIVATE_KEYS=0x0454f3ec51e7d6971fc345998bb2ba483a8d9d30d46ad890434e6f88ecb97544
STAKING_CONTRACT_ADDRESS=0x0000000000000000000000000000000000001001
BLS_PUBLIC_KEY=0xa..
```

여기서 매개변수는 다음을 의미합니다.

* **JSONRPC_URL** - 실행 노드를 위한 JSON-RPC 엔드포인트입니다.
* **PRIVATE_KEYS** - 스테이커 주소의 비공개 키입니다.
* **STAKING_CONTRACT_ADDRESS** - 스테이킹 스마트 계약의 주소입니다(
기본값 `0x0000000000000000000000000000000000001001`).
* **BLS_PUBLIC_KEY** - 스테이커의 BLS 공개 키입니다. 네트워크가 BLS로 실행되는 경우에만 필요합니다.

### 자금 스테이킹 {#staking-funds}

:::info 스테이킹 주소

스테이킹 스마트 계약은 주소
`0x0000000000000000000000000000000000001001`에 사전 배포됩니다.

스테이킹 메커니즘과의 모든 상호작용은 지정된 주소의 스테이킹 스마트 계약을 통해서 이루어집니다.

스테이킹 스마트 계약에 대한 보다 자세한 내용은
**[스테이킹 스마트 계약](/docs/edge/consensus/pos-concepts#contract-pre-deployment)** 섹션을 확인하세요.

:::

검사기 세트의 일부가 되기 위해서는 주소가 임계값을 초과하는 특정 금액의 자금을 스테이킹해야 합니다.

현재 검사기 세트의 일부가 되기 위한 기본 임계값은 `1 ETH`입니다.

스테이킹 스마트 계약의 `stake` 메서드를 호출하고 `>= 1 ETH` 값을 지정하여 스테이킹을 초기화할 수 있습니다.

`.env` 파일
([이전 섹션](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts)에서 설명)이 설정되고
PoS 모드에서 체인이 시작된 후에는 스테이킹 스마트 계약 저장소의 다음 명령어로 스테이킹을 수행할 수 있습니다.

```bash
npm run stake
```

`stake` Hardhat 스크립트는 기본 금액 `1 ETH`를 스테이킹하며, 이 금액은 `scripts/stake.ts`
파일을 수정하여 변경할 수 있습니다.

스테이킹되는 자금이 `>= 1 ETH`인 경우, 스테이킹 스마트 계약의 검사기 세트가 업데이트되고
다음 에포크부터 주소가 검사기 세트의 일부가 됩니다.

:::info BLS 키 등록

네트워크가 BLS 모드에서 실행되는 경우, 노드가 검사기가 되려면 스테이킹 후 해당 BLS 공개 키를 등록해야 합니다.

이 작업은 다음 명령어로 수행할 수 있습니다.

```bash
npm run register-blskey
```
:::

### 자금 스테이킹 해제 {#unstaking-funds}

지분이 있는 주소는 **자금 스테이킹을 해제할 때 모두** 한 번에 해제해야 합니다.

`.env` 파일
([이전 섹션](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts)에서 설명)이
설정되고 PoS 모드에서 체인이 시작된 후 스테이킹 스마트 계약 저장소의 다음 명령어로
스테이킹 해제를 수행할 수 있습니다.

```bash
npm run unstake
```

### 스테이커 목록 가져오기 {#fetching-the-list-of-stakers}

자금을 스테이킹하는 모든 주소는 스테이킹 스마트 계약에 저장됩니다.

`.env` 파일
([이전 섹션](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts)에서 설명)이
설정되고 PoS 모드에서 체인이 시작된 후 스테이킹 스마트 계약 저장소의 다음 명령어로
검사기 목록을 가져올 수 있습니다.

```bash
npm run info
```

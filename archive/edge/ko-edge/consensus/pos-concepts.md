---
id: pos-concepts
title: 지분증명
description: "지분증명에 관한 설명 및 지침입니다."
keywords:
  - docs
  - polygon
  - edge
  - PoS
  - stake
---

## 개요 {#overview}

이 섹션은 현재 Polygon 엣지의 지분증명(PoS) 구현에 반영된 몇 가지 개념에 대해
보다 명확한 개요를 제공하기 위해 작성되었습니다.

Polygon 엣지 지분증명(PoS) 구현은 기존의 PoA IBFT 구현에 대한 대안으로서,
노드 연산자는 체인을 시작할 때 이 두 가지 중에서 쉽게 선택할 수 있습니다.

## PoS 기능 {#pos-features}

지분증명 구현을 뒷받침하는 핵심 논리는
**[스테이킹 스마트 계약서](https://github.com/0xPolygon/staking-contracts/blob/main/contracts/Staking.sol)**.

이 계약은 Polygon 엣지 체인의 PoS 메커니즘이 초기화될 때마다 사전 배포되며 주소
`0x0000000000000000000000000000000000001001`(블록 `0`)에서 사용 가능합니다.

### 에포크 {#epochs}

에포크는 Polygon 엣지에 PoS가 추가되면서 적용되는 개념입니다.

에포크는 특정 검사기 세트가 블록을 생성할 수 있는 특별한 시간 프레임(블록 단위)으로 간주됩니다.
에포크 길이는 수정할 수 있습니다. 즉, 노드 연산자가 제네시스 생성 시 에포크 길이를 구성할 수 있습니다.

각 에포크 종료 시 _에포크 블록_이 생성되고, 이 이벤트 후에 새로운 에포크가 시작됩니다. 에포크 블록에 대한 보다 자세한 내용은
[에포크 블록](/docs/edge/consensus/pos-concepts#epoch-blocks) 섹션을 참조하세요.

검사기 세트는 각 에포크 종료 시 업데이트됩니다. 노드는 에포크 블록이 생성되는 동안 스테이킹 스마트 계약의 검사기 세트를 쿼리하고,
획득한 데이터를 로컬 스토리지에 저장합니다. 이러한 쿼리 및 저장 주기는
각 에포크 종료 시 반복됩니다.

결론적으로 이를 통해 스테이킹 스마트 계약은 검사기 세트의 주소를 완전히 제어할 수 있고
노드에게 단 하나의 역할만 남깁니다. 즉, 노드는 에포크 중에 최신 검사기 세트 정보를 가져오기 위해 계약을 한 번
쿼리하면 됩니다. 따라서 개별 노드가 검사기 세트를 처리해야 하는 책임이 줄어들게 됩니다.

### 스테이킹 {#staking}

주소는 `stake` 메서드를 호출하고 트랜잭션에서 스테이킹 금액 값을 지정하여 스테이킹 스마트 계약의 자금을
스테이킹할 수 있습니다.

````js
const StakingContractFactory = await ethers.getContractFactory("Staking");
let stakingContract = await StakingContractFactory.attach(STAKING_CONTRACT_ADDRESS)
as
Staking;
stakingContract = stakingContract.connect(account);

const tx = await stakingContract.stake({value: STAKE_AMOUNT})
````

주소는 스테이킹 스마트 계약의 자금을 스테이킹함으로써, 검사기 세트에 들어가
블록 생성 프로세스에 참여할 수 있습니다.

:::info 스테이킹 임계값

현재 검사기 세트에 들어가기 위해 필요한 최소 임계값은 `1 ETH`를 스테이킹하는 것입니다.

:::

### 스테이킹 해제 {#unstaking}

자금을 스테이킹한 주소는 **스테이킹한 자금의 스테이킹 해제를 모두 한 번에** 수행해야 합니다.

스테이킹 해제는 스테이킹 스마트 계약에서 `unstake` 메서드를 호출하면 됩니다.

````js
const StakingContractFactory = await ethers.getContractFactory("Staking");
let stakingContract = await StakingContractFactory.attach(STAKING_CONTRACT_ADDRESS)
as
Staking;
stakingContract = stakingContract.connect(account);

const tx = await stakingContract.unstake()
````

자금을 스테이킹 해제하면 주소가 스테이킹 스마트 계약의 검사기 세트에서 삭제되고
다음 에포크에서 검사기로 간주되지 않습니다.

## 에포크 블록 {#epoch-blocks}

**에포크 블록**은 Polygon 엣지에서 IBFT의 PoS 구현 시 적용되는 개념입니다.

기본적으로 에포크 블록은 **트랜잭션을 포함하지 않는** 특수한 블록이며 **에포크 종료 시**에만 발생합니다.
예를 들어, **에폭시 크기가** 블록으로 설정되어 `50`있다면, 에폭시 블록은 `50`블록 `100``150`등으로 간주됩니다.

에포크 블록은 일반적인 블록 생성에서 발생해서는 안 되는 추가 논리를 수행하는 데 사용됩니다.

가장 중요한 점은 에포크 블록을 통해 노드가 스테이킹 스마트 계약에서 **최신 검사기 세트** 정보를 가져와야
함을 알게 된다는 것입니다.

에포크 블록에서 검사기 세트가 업데이트되면 이 검사기 세트는(변경되었는지 여부와 상관없이)
스테이킹 스마트 계약에서 최신 정보를 가져와 다시 업데이트될 때까지 그 다음의 `epochSize - 1` 블록에 사용됩니다.
스테이킹 스마트 계약에 있습니다.

에포크 길이(블록 단위)는 제네시스 파일을 생성할 때 특별 플래그 `--epoch-size`를 사용하여 수정할 수 있습니다.

```bash
polygon-edge genesis --epoch-size 50 ...
```

Polygon 엣지에서 에포크의 기본 크기는 `100000`블록입니다.

## 계약 사전 배포 {#contract-pre-deployment}

Polygon 엣지가 _사전 배포_하는
[스테이킹 스마트 계약](https://github.com/0xPolygon/staking-contracts/blob/main/contracts/Staking.sol)은
**제네시스 생성** 중에 주소 `0x0000000000000000000000000000000000001001`로 사전 배포됩니다.

이러한 사전 배포는 EVM을 실행하지 않으며, 전달된 구성 값을 제네시스 명령어에 사용하여 스마트 계약의 블록체인 상태를
직접 수정하는 방식으로 진행됩니다.

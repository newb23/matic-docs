---
id: ether
title: Ether 입출금 가이드
sidebar_label: Ether
description: 폴리곤에서 다음 블록체인 앱을 설치합니다.
keywords:
  - docs
  - matic
image: https://matic.network/banners/matic-network-16x9.png
---

## 높은 수준의 작업흐름

이더 입금하기 -

- **RootChainManager**에서 depositEtherFor를 호출하고 이더 자산을 보냅니다.

이더 출금하기 -

1. 폴리곤 체인에서 토큰을 **_소각_**합니다.
2. **_RootChainManager_**에서 **_exit_** 함수를 호출하여 소각 트랜잭션의 증명을 제출하십시오. 이 호출은 소각 트랜잭션이 포함된 블록에 대한 **_체크포인트가 제출된 후_**에 만들 수 있습니다.

## 단계 세부정보
---

### 컨트랙트 인스턴스화하기
```js
const mainWeb3 = new Web3(mainProvider)
const maticWeb3 = new Web3(maticProvider)
const rootChainManagerContract = new mainWeb3.eth.Contract(rootChainManagerABI, rootChainManagerAddress)
const childTokenContract = new maticWeb3(childTokenABI, childTokenAddress)
```

### 입금하기
**_RootChainManager_** 컨트랙트의 **_depositEtherFor_** 함수를 호출합니다. 이 함수는 1개의 인수 user를 갖고 있습니다. **_user_** 는 폴리곤 체인에 입금을 받을 사용자의 주소입니다. 입금할 이더의 수량은 트랜잭션의 값으로써 보내져야 합니다.
```js
await rootChainManagerContract.methods
  .depositEtherFor(userAddress)
  .send({ from: userAddress, value: amount })
```

### 소각하기
Ether는 폴리곤 체인의 ERC20 토큰이므로 출금 과정은 ERC20 출금과 동일합니다. 하위 토큰 컨트랙트에서 **_withdraw_**함수를 호출하여 토큰을 소각할 수 있습니다. 이 함수는 소각할 토큰 수를 나타내는 **_amount_**라는 단일 인수를 취합니다. 이 소각에 대한 증명은 종료 단계에서 제출해야 합니다. 따라서 트랜잭션 해시를 저장합니다.
```js
const burnTx = await childTokenContract.methods
  .withdraw(amount)
  .send({ from: userAddress })
const burnTxHash = burnTx.transactionHash
```

### 종료하기
**_RootChainManager_** 컨트랙트의 exit 함수는 **_EtherPredicate_**에서 토큰을 잠금 해제하고 다시 받기 위해 호출되어야 합니다. 이 함수는 소각 트랜잭션을 증명하는 단일 바이트 인수를 사용합니다. 이 함수를 호출하기 전에 제출될 소각 트랜잭션을 포함하는 체크포인트를 기다리십시오. 다음 필드를 인코딩하는 RLP에 의해 증명이 생성됩니다 -

1. headerNumber - 소각 트랜잭션을 포함하는 체크포인트 헤더 블록 번호
2. blockProof – (하위체인의) 블록 헤더가 제출된 머클 루트의 잎이라는 증명
3. blockNumber - 하위 체인의 소각 트랜잭션을 포함하는 블록 번호
4. blockTime - 트랜잭션 블록 시간 소각하기
5. txRoot - 블록의 트랜잭션 루트
6. receiveRoot - 블록의 영수 루트
7. receipt - 소각 트랜잭션의 영수증
8. ReceiptProof - 소각 영수증의 머클 증명
9. branchMask - 머클 패트리샤 트리에서 수신 경로를 나타내는 32비트
10. receiveLogIndex - 영수증에서 읽을 로그 인덱스

증명을 수동으로 생성하는 것은 까다로울 수 있으므로 Polygon Edge를 사용하는 것이 좋습니다. 트랜잭션을 수동으로 보내려면, 옵션 개체에서 **_encodeAbi_**를 **_true_**로 전달하여 raw calldata를 얻을 수 있습니다.
```js
const exitCalldata = await maticPOSClient
  .exitERC20(burnTxHash, { from, encodeAbi: true })
```

**_RootChainManager_**로 calldata를 보냅니다.
```js
await mainWeb3.eth.sendTransaction({
  from: userAddress,
  to: rootChainManagerAddress,
  data: exitCalldata.data
})
```
---
id: poa
title: 권위증명(PoA)
description: "권위증명에 관한 설명 및 지침입니다."
keywords:
  - docs
  - polygon
  - edge
  - PoA
  - autorithy
---

## 개요 {#overview}

IBFT PoA는 Polygon 엣지의 기본 합의 메커니즘입니다. PoA에서 검사기는 블록을 생성하고 이 블록을 시리즈로 블록체인에 추가하는 역할을 담당합니다.

모든 검사기는 동적 검사기 세트를 구성하며, 투표 메커니즘을 사용하여 이 세트에 추가되거나 삭제될 수 있습니다. 즉, 검사기 노드의 과반수(51%)가 특정 검사기를 세트에 추가/삭제하기로 투표하면 검사기는 검사기 세트의 일원이 되거나 해당 자격을 상실할 수 있습니다. 이러한 방식으로 악의적인 검사기를 감지하여 네트워크에서 삭제하고, 신뢰할 수 있는 새 검사기를 네트워크에 추가할 수 있습니다.

모든 검사기는 차례대로 다음 블록을 제안하며(라운드-로빈), 블록을 검증해 블록체인에 삽입하려면 검사기의 초다수(2/3 초과)가 해당 블록을 승인해야 합니다.

검사기 외에도, 블록 생성에는 참여하지 않지만 블록 검증 프로세스에는 참여하는 비 검사기가 있습니다.

## 검사기 세트에 검사기 추가하기 {#adding-a-validator-to-the-validator-set}

이 가이드는 4개의 검사기 노드가 있는 활성 IBFT 네트워크에 새 검사기 노드를 추가하는 방법을 설명합니다.
네트워크를 설정하는 데 도움이 필요하면 [로컬 설치](/edge/get-started/set-up-ibft-locally.md) / [클라우드 설정](/edge/get-started/set-up-ibft-on-the-cloud.md) 섹션을 참조하십시오.

### 1단계: IBFT용 데이터 폴더를 초기화하고 새 노드의 검사기 키 생성하기 {#step-1-initialize-data-folders-for-ibft-and-generate-validator-keys-for-the-new-node}

새 노드에서 IBFT를 시작하고 실행하려면 먼저 데이터 폴더를 초기화하고 키를 생성해야 합니다.

````bash
polygon-edge secrets init --data-dir test-chain-5
````

이 명령어는 검사기 키(주소) 및 노드 ID를 출력합니다. 다음 단계에 이 검사기 키(주소)가 필요합니다.

### 2단계: 다른 검사기 노드에서 새 후보 제안하기 {#step-2-propose-a-new-candidate-from-other-validator-nodes}

새 노드가 검사기가 되려면 최소 51%의 검사기가 해당 노드를 제안해야 합니다.

grpc 주소(127.0.0.1:10000)의 기존 검사기 노드에서 새 검사기(`0x8B15464F8233F718c8605B16eBADA6fc09181fC2`)를 제안하는 방법의 예:

````bash
polygon-edge ibft propose --grpc-address 127.0.0.1:10000 --addr 0x8B15464F8233F718c8605B16eBADA6fc09181fC2 --bls 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --vote auth
````

IBFT 명령어의 구조는 [CLI 명령어](/docs/edge/get-started/cli-commands) 섹션에서 설명합니다.

:::info BLS 공개 키

BLS 공개 키는 네트워크가 BLS를 사용하여 실행되는 경우에만 필요합니다. BLS 모드에서 실행되지 않는 네트워크의 경우 `--bls`가 필요하지 않습니다.

:::

### 3단계: 클라이언트 노드 실행하기 {#step-3-run-the-client-node}

이 예에서는 모든 노드가 동일한 머신에 있는 네트워크의 실행을 시도하고 있기 때문에 주의를 기울여 포트 충돌을 방지해야 합니다.

````bash
polygon-edge server --data-dir ./test-chain-5 --chain genesis.json --grpc-address :50000 --libp2p :50001 --jsonrpc :50002 --seal
````

모든 블록을 가져온 후 콘솔 내부에서 새 노드가 검증에 참여하고 있음을 알 수 있습니다.

````bash
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=4004
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=5 votes=0
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft: proposer calculated: proposer=0x8B15464F8233F718c8605B16eBADA6fc09181fC2 block=4004
````

:::info 비 검사기를 검사기로 승격하기

당연히 비 검사기는 투표 프로세스를 통해 검사기가 될 수 있습니다. 그러나 투표 프로세스 후 검사기 세트에 성공적으로 포함되려면 `--seal` 플래그를 사용해 노드가 다시 시작되도록 해야 합니다.

:::

## 검사기 세트에서 검사기 삭제하기 {#removing-a-validator-from-the-validator-set}

이 작업은 상당히 간단합니다. 검사기 세트에서 검사기 노드를 삭제하려면 과반수의 검사기 노드에 다음 명령어를 실행해야 합니다.

````bash
polygon-edge ibft propose --grpc-address 127.0.0.1:10000 --addr 0x8B15464F8233F718c8605B16eBADA6fc09181fC2 --bls 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --vote drop
````

:::info BLS 공개 키

BLS 공개 키는 네트워크가 BLS를 사용하여 실행되는 경우에만 필요합니다. BLS 모드에서 실행되지 않는 네트워크의 경우 `--bls`가 필요하지 않습니다.

:::

명령어를 실행한 후 검사기의 수가 줄었는지 확인하세요(로그 예에서는 4에서 3으로 감소).

````bash
2021-12-15T19:20:51.014+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=2399 round=1
2021-12-15T19:20:51.014+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=4 votes=2
2021-12-15T19:20:51.015+0100 [INFO]  polygon.consensus.ibft.acceptState: we are the proposer: block=2399
2021-12-15T19:20:51.015+0100 [INFO]  polygon.consensus.ibft: picked out txns from pool: num=0 remaining=0
2021-12-15T19:20:51.015+0100 [INFO]  polygon.consensus.ibft: build block: number=2399 txns=0
2021-12-15T19:20:53.002+0100 [INFO]  polygon.consensus.ibft: state change: new=ValidateState
2021-12-15T19:20:53.009+0100 [INFO]  polygon.consensus.ibft: state change: new=CommitState
2021-12-15T19:20:53.009+0100 [INFO]  polygon.blockchain: write block: num=2399 parent=0x768b3bdf26cdc770525e0be549b1fddb3e389429e2d302cb52af1722f85f798c
2021-12-15T19:20:53.011+0100 [INFO]  polygon.blockchain: new block: number=2399 hash=0x6538286881d32dc7722dd9f64b71ec85693ee9576e8a2613987c4d0ab9d83590 txns=0 generation_time_in_sec=2
2021-12-15T19:20:53.011+0100 [INFO]  polygon.blockchain: new head: hash=0x6538286881d32dc7722dd9f64b71ec85693ee9576e8a2613987c4d0ab9d83590 number=2399
2021-12-15T19:20:53.011+0100 [INFO]  polygon.consensus.ibft: block committed: sequence=2399 hash=0x6538286881d32dc7722dd9f64b71ec85693ee9576e8a2613987c4d0ab9d83590 validators=4 rounds=1 committed=3
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft: state change: new=AcceptState
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=2400 round=1
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=3 votes=0
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft: proposer calculated: proposer=0xea21efC826F4f3Cb5cFc0f986A4d69C095c2838b block=2400
````

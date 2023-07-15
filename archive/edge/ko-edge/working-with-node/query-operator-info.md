---
id: query-operator-info
title: 연산자 정보 쿼리하기
description: "연산자 정보를 쿼리하는 방법."
keywords:
  - docs
  - polygon
  - edge
  - node
  - query
  - operator
---

## 기본 요건 {#prerequisites}

이 가이드에서는 사용자가 [로컬 설정](/docs/edge/get-started/set-up-ibft-locally) 또는 [클라우드에서 IBFT 클러스터를 설정하는 방법에 관한 가이드](/docs/edge/get-started/set-up-ibft-on-the-cloud)를 따랐다고 가정합니다.

어떤 종류의 연산자 정보를 쿼리하든 정상적으로 작동하는 노드가 필요합니다.

Polygon 엣지에서 노드 연산자는 연산 노드의 작업을 제어하고 이에 관한 정보를 얻습니다.<br />
언제든지 gRPC 기반의 노드 정보 레이어를 사용하고 의미 있는 정보를 얻을 수 있으므로 로그 전달이 필요하지 않습니다.

:::note

노드가 `127.0.0.1:8545`에서 실행되고 있지 않다면 이 문서에 나열된 명령어에 `--grpc-address <address:port>` 플래그를 추가해야 합니다.

:::

## 피어 정보 {#peer-information}

### 피어 목록 {#peers-list}

연결된 피어의 전체 목록(실행 중인 노드 자체 포함)을 가져오려면 다음 명령어를 실행하세요.
````bash
polygon-edge peers list
````

실행 중인 클라이언트의 현재 피어인 libp2p 주소 목록이 반환됩니다.

### 피어 상태 {#peer-status}

특정 피어의 상태를 확인하려면 다음을 실행하세요.
````bash
polygon-edge peers status --peer-id <address>
````
*주소* 매개변수가 해당 피어의 libp2p 주소가 됩니다.

## IBFT 정보 {#ibft-info}

연산자가 IBFT 합의의 연산 노드 상태에 관해 알아야 하는 경우가 많습니다.

Polygon 엣지에서 이 정보를 쉽게 확인할 수 있습니다.

### 스냅샷 {#snapshots}

다음 명령어를 실행하면 최근 스냅샷을 반환합니다.
````bash
polygon-edge ibft snapshot
````
특정 높이(블록 번호)의 스냅샷을 쿼리하려면 연산자가 다음을 실행하면 됩니다.
````bash
polygon-edge ibft snapshot --num <block-number>
````

### 후보 {#candidates}

후보에 관한 최신 정보를 얻으려면 연산자가 다음을 실행하면 됩니다.
````bash
polygon-edge ibft candidates
````
이 명령어는 아직 포함되지 않은 후보는 물론 제안된 후보의 현재 집합도 쿼리합니다.

### 상태 {#status}

다음 명령어는 실행 중인 IBFT 클라이언트의 현재 검사기 키를 반환합니다.
````bash
polygon-edge ibft status
````

## 트랜잭션 풀 {#transaction-pool}

트랜잭션 풀의 현재 트랜잭션 수를 확인하려면 연산자가 다음을 실행하면 됩니다.
````bash
polygon-edge txpool status
````

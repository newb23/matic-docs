---
id: migration-to-pos
title: PoA에서 PoS로 마이그레이션
description: "PoA에서 PoS IBFT 모드로 또는 그 반대로 마이그레이션하는 방법"
keywords:
  - docs
  - polygon
  - edge
  - migrate
  - PoA
  - PoS
---

## 개요 {#overview}

이 섹션에서는 실행 중인 클러스터에서 블록체인을 초기화하지 않고도 PoA에서 PoS IBFT 모드로 또는 그 반대로 마이그레이션하는 방법을 설명합니다.

## PoS로 마이그레이션하는 방법 {#how-to-migrate-to-pos}

모든 노드를 종료하고 `ibft switch` 명령어를 통해 genesis.json에 포크 구성을 추가하고 노드를 다시 시작해야 합니다.

````bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --deployment 100 --from 200
````
:::caution ECDSA를 사용하여 전환
ECDSA를 사용할 때 ECDSA를 사용한다는 것을 언급하면서 `--ibft-validator-type`플래그를 스위치에 추가해야 합니다. 포함되지 않은 경우 Ege는 자동으로 BLS로 전환할 수 있습니다.

````bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --ibft-validator-type ecdsa --deployment 100 --from 200
````
:::PoS로 전환하려면 2개의 블록 `deployment`높이를 지정해야 합니다. 스테이킹 계약을 배포할 수 있는 `from``deployment`높이이며 PoS의 시작의 `from`높이입니다. 스테이킹 계약은 사전 배포되는 계약과 마찬가지로 `deployment`에서 주소 `0x0000000000000000000000000000000000001001`에 배포됩니다.

스테이킹 계약에 관한 자세한 내용은 [지분증명](/docs/edge/consensus/pos-concepts)을 참조하세요.

:::warning 검사기는 수동으로 스테이킹해야 합니다

PoS 시작 시 검사기가 되려면 각 검사기는 계약이 `deployment`에 배포된 후 그리고 `from` 전에 스테이킹해야 합니다. 각 검사기는 PoS 시작 시 스테이킹 계약의 세트로 자체 검사기 세트를 업데이트합니다.

스테이킹에 대해 더 자세히 알아보기 위해서는 **[설정 을 방문하고 스테이크의 증거를 사용하십시오](/docs/edge/consensus/pos-stake-unstake)**.
:::

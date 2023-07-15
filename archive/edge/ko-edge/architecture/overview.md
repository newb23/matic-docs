---
id: overview
title: 아키텍처 개요
sidebar_label: Overview
description: Polygon 엣지의 아키텍처 소개
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - modular
  - layer
  - libp2p
  - extensible
---

Polygon은 *모듈식* 소프트웨어를 구축하려는 아이디어와 함께 시작했습니다.

이 아이디어는 Polygon 엣지의 거의 모든 부분에 반영되어 있습니다. Polygon 엣지에 구축된 아키텍처 및 레이어링에 대한 간략한 개요를 아래에서 확인할 수 있습니다.

## Polygon 엣지 레이어링 {#polygon-edge-layering}

![Polygon 엣지 아키텍처](/img/edge/Architecture.jpg)

## Libp2p {#libp2p}

**libp2p**를 활용하는 기본 네트워킹 레이어에서 모든 것이 시작됩니다. 이 기술을 선택한 이유는
Polygon 엣지의 설계 철학에 부합하기 때문입니다. Libp2p는

- 모듈식입니다.
- 확장 가능합니다.
- 빠릅니다.

무엇보다도 나중에 다룰 추가 고급 기능을 위한 탁월한 기반을 제공합니다.


## 동기화 및 합의 {#synchronization-consensus}
클라이언트가 실행되는 방식에 따라 동기화 및 합의 프로토콜을 분리하면 모듈성과 **사용자 정의** 동기화 및 합의 메커니즘 구현을 지원할 수 있습니다.

Polygon 엣지는 곧바로 활용 가능한 플러그형 합의 알고리즘을 제공하도록 설계되었습니다.

현재 지원되는 합의 알고리즘 목록:

* IBFT PoA
* IBFT PoS

## 블록체인 {#blockchain}
블록체인 레이어는 Polygon 엣지 시스템 내 모든 것을 조정하는 중심 레이어입니다. 해당 *모듈* 섹션에서 자세히 설명합니다.

## 상태 {#state}
상태 내부 레이어에는 상태 전환 논리가 포함되어 있습니다. 새로운 블록이 포함될 때 상태 변화를 다룹니다. 해당 *모듈* 섹션에서 자세히 설명합니다.

## JSON RPC {#json-rpc}
JSON RPC 레이어는 dApp 개발자가 블록체인과 상호작용하는 데 사용하는 API 레이어입니다. 해당 *모듈* 섹션에서 자세히 설명합니다.

## TxPool {#txpool}
TxPool 레이어는 트랜잭션 풀을 나타냅니다. 여러 진입점에서 트랜잭션을 추가할 수 있기 때문에 시스템 내 다른 모듈과 밀접하게 연결되어 있습니다.

## grpc {#grpc}
gRPC나 Google 원격 절차 Call은 Google이 처음에 확장 가능하고 빠른 API를 구축하기 위해 만든 강력한 오픈 소스 RPC 프레임워크입니다. GRPC 레이어는 연산자 상호작용에 매우 중요합니다. 이를 통해 노드 연산자는 클라이언트와 쉽게 상호작용하고 만족스러운 사용자 경험을 제공할 수 있습니다.

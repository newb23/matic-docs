---
id: overview
title: 개요
description: ChainBridge 개요
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

## ChainBridge란? {#what-is-chainbridge}

ChainSafe가 빌드한 ChainBridge는 EVM 및 Substrate 호환 체인을 지원하는 모듈식 다방향 블록체인 브리지입니다. 사용자는 2개의 서로 다른 체인 사이에서 모든 종류의 자산 또는 메시지를 전송할 수 있습니다.

ChainBridge에 관한 자세한 정보를 확인하려면 개발자가 제공하는 [공식 문서](https://chainbridge.chainsafe.io/)를 참고하시기 바랍니다.

이 가이드는 ChainBridge를 Polygon 엣지에 통합하는 것을 돕기 위한 것으로, 실행 중인 Polygon PoS(Mumbai 테스트넷)와 로컬 Polygon 엣지 네트워크 간의 브리지 설정 방법을 안내합니다.

## 요구사항 {#requirements}

이 가이드에서는 Polygon 엣지 노드, ChainBridge 릴레이어(자세한 내용은 [여기](/docs/edge/additional-features/chainbridge/definitions) 참조), 로컬로 계약을 배포하고 리소스를 등록하며 브리지 설정을 변경하는 CLI 도구인 cb-sol-cli 도구([여기](https://chainbridge.chainsafe.io/cli-options/#cli-options) 참조)를 실행합니다. 설정을 시작하기 전에 다음 환경을 갖춰야 합니다.

* Go: 1.17 이상
* Node.js: 16.13.0 이상
* Git


또한, 다음 저장소를 일부 애플리케이션을 실행할 버전으로 복제해야 합니다.

* [Polygon 엣지](https://github.com/0xPolygon/polygon-edge): `develop` 분기에서
* [ChainBridge](https://github.com/ChainSafe/ChainBridge): v1.1.5
* [ChainBridge 배포 도구](https://github.com/ChainSafe/chainbridge-deploy): `main` 분기의 `f2aa093`


다음 섹션으로 넘어가기 전에 Polygon 엣지 네트워크를 설정해야 합니다. 자세한 내용은 [로컬 설정](/docs/edge/get-started/set-up-ibft-locally) 또는 [클라우드 설정](/docs/edge/get-started/set-up-ibft-on-the-cloud)을 확인하시기 바랍니다.
---
id: overview
title: Polygon 엣지
sidebar_label: What is Edge
description: "Polygon 엣지 소개."
keywords:
  - docs
  - polygon
  - edge
  - network
  - modular

---

Polygon 엣지는 이더리움 호환 블록체인 네트워크, 사이드체인 및 일반 확장 솔루션 구축을 위한 모듈식 확장형 프레임워크입니다.

주요 용도는 이더리움 스마트 계약 및 트랜잭션과의 완전한 호환성을 제공하면서 새로운 블록체인 네트워크를 부트스트랩하는 것입니다. Polygon 엣지는 IBFT(Istanbul Byzantine Fault Tolerant) 합의 메커니즘을 사용하며, [PoA(권한증명)](/docs/edge/consensus/poa) 및 [PoS(지분증명)](/docs/edge/consensus/pos-stake-unstake)의 두 가지 방식으로 지원됩니다.

또한 여러 블록체인 네트워크와의 통신을 지원하므로, [중앙 집중식 브리지 솔루션](/docs/edge/additional-features/chainbridge/overview)을 활용해 [ERC-20](https://ethereum.org/en/developers/docs/standards/tokens/erc-20)과 [ERC-721](https://ethereum.org/en/developers/docs/standards/tokens/erc-721) 토큰을 모두 전송할 수 있습니다.

업계 표준 지갑을 사용해 [JSON-RPC](/docs/edge/working-with-node/query-json-rpc) 엔드포인트를 통해 Polygon 엣지와 상호작용할 수 있으며, 노드 연산자는 [gRPC](/docs/edge/working-with-node/query-operator-info) 프로토콜을 통해 노드에서 다양한 작업을 수행할 수 있습니다.

Polygon에 관한 자세한 내용은 [공식 웹사이트](https://polygon.technology)를 참조하시기 바랍니다.

**[GitHub 저장소](https://github.com/0xPolygon/polygon-edge)**

:::caution

현재 작업 진행 중이므로, 향후 아키텍처가 변경될 수 있습니다. 아직 코드에 대한 감사가 완료되지 않았으므로, 프로덕션에 사용하려면 Polygon 팀에 문의하시기 바랍니다.

:::



`polygon-edge` 네트워크를 로컬로 실행하여 시작하려면 [설치](/docs/edge/get-started/installation) 및 [로컬 설정](/docs/edge/get-started/set-up-ibft-locally)을 확인하시기 바랍니다.

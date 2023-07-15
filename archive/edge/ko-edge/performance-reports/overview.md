---
id: overview
title: 개요
description: "Polygon 엣지 테스트 소개."
keywords:
  - docs
  - polygon
  - edge
  - performance
  - tests
  - loadbot
---
:::caution
이러한 테스트를 수행하는 데 사용되는 `loadbot`사용자가 이제 감가 상각된다는 점에 유의하십시오.
:::

| 유형 | 값 | 테스트 링크 |
| ---- | ----- | ------------ |
| 일반 전송 | 1428 tps | [2022년 7월 4일](test-history/test-2022-07-04.md#results-of-eoa-to-eoa-transfers) |
| ERC-20 전송 | 1111 tps | [2022년 7월 4일](test-history/test-2022-07-04.md#results-of-erc20-token-transfers) |
| NFT 발행 | 714 tps | [2022년 7월 4일](test-history/test-2022-07-04.md#results-of-erc721-token-minting) |

---

Polygon의 목표는 풍부한 기능을 갖추고 설정과 유지 관리가 쉬운 고성능 블록체인 클라이언트 소프트웨어를 만드는 것입니다.
모든 테스트는 Polygon 엣지 로드봇을 사용하여 수행했습니다.
본 섹션의 모든 성능 보고서는 날짜, 환경, 테스트 방법을 명확하게 설명하고 있습니다.

이 성능 테스트의 목표는 Polygon 엣지 블록체인 네트워크의 실제 성능을 보여주는 것입니다.
누구든 동일한 환경에서 Polygon 로드봇을 사용하여 여기에 게시된 것과 동일한 결과를 얻을 수 있습니다.

모든 성능 테스트는 AWS 플랫폼에서 EC2 인스턴스 노드로 구성된 체인에 대해 수행했습니다.
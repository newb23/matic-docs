---
id: types
title: 유형
description: Polygon 엣지의 유형 모듈에 대한 설명.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - types
  - marshaling
---

## 개요 {#overview}

**유형** 모듈은 다음과 같은 핵심 객체 유형을 구현합니다.

* **주소**
* **해시**
* **헤더**
* 여러 도우미 함수

## RLP 인코딩 / 디코딩 {#rlp-encoding-decoding}

GETH와 같은 클라이언트와 달리 Polygon 엣지는 인코딩에 리플렉션을 사용하지 않습니다.<br />
리플렉션 사용을 선호하지 않은 이유는 성능 악화, 확장의 어려움과 같은
새로운 문제가 발생하기 때문입니다.

**유형** 모듈은 FastRLP 패키지를 사용하여 RLP 마셜링 및 마셜링 취소를 할 수 있는 편리한 인터페이스를 제공합니다.

마셜링은 *MarshalRLPWith* 및 *MarshalRLPTo* 메서드를 통해 수행됩니다. 마셜링 취소를 위한 유사한 메서드도
있습니다.

Polygon 엣지는 이러한 메서드를 수동으로 정의하므로 리플렉션이 필요하지 않습니다. *rlp_marshal.go*에서
마셜링을 위한 메서드를 확인할 수 있습니다.

* **Bodies**
* **Blocks**
* **Headers**
* **Receipts**
* **Logs**
* **Transactions**
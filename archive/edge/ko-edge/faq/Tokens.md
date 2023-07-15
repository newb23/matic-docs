---
id: tokens
title: 토큰 FAQ
description: "Polygon 엣지 토큰에 대한 FAQ"
keywords:
  - docs
  - polygon
  - edge
  - FAQ
  - tokens
---

## Polygon 엣지는 EIP-1559를 지원하나요? {#does-polygon-edge-support-eip-1559}
현재 Polygon 엣지는 EIP-1559를 지원하지 않습니다.

## 화폐(토큰) 기호는 어떻게 설정하나요? {#how-to-set-the-currency-token-symbol}

토큰 기호는 UI에 해당하므로 네트워크 어디에서도 구성하거나 하드코딩할 수 없습니다.
그러나 예를 들어 메타마스크와 같은 지갑에 네트워크를 추가할 때는 토큰 기호를 변경할 수 있습니다.

## 체인에서 중단되면 트랜잭션을 어떻게 될까요? {#what-happens-to-transactions-when-a-chain-halts}

처리되지 않은 모든 거래는 TxPool(enbeygor 홍보 대기열에 포함)에 있습니다. 체인 할트(모든 블록 제작 정류장)를 사용하면 이러한 거래는 결코 블록에 들어가지 않을 것입니다.<br/> 이것은 체인 할트가 끝나면 경우에만 아닙니다. 노드가 중지되거나 다시 시작되면, 실행되지 않은 모든 거래가 여전히 TxPool에 있는 경우 조용히 제거됩니다.<br/> 노드가 다시 시작할 필요가 있으므로 어획 변경이 도입될 때 동일한 일이 발생할 것입니다.

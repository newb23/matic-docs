---
id: gas
title: 가스 FAQ
description: "Polygon 엣지의 가스에 대한 FAQ"
keywords:
  - docs
  - polygon
  - edge
  - FAQ
  - validators

---

## 최소 가스 가격을 적용하려면 어떻게 하나요? {#how-to-enforce-a-minimum-gas-price}
서버 명령어에 제공된 `--price-limit` 플래그를 사용하면 됩니다. 그러면 노드에서 사용자가 설정한 가격 한도 이상의 가스를 보유한 트랜잭션만 수락합니다. 이를 전체 네트워크에 적용하려면 모든 노드의 가격 한도가 동일해야 합니다.


## 가스 요금이 0인 트랜잭션이 있을 수 있나요? {#can-you-have-transactions-with-0-gas-fees}
예, 가능합니다. 노드가 적용하는 기본 가격 한도는 `0`입니다. 즉, 노드는 가스 가격이 `0`으로 설정된 트랜잭션을 수락하게 됩니다.

## 가스(기본) 토큰 총 공급량은 어떻게 설정하나요? {#how-to-set-the-gas-native-token-total-supply}

`--premine flag`를 사용하여 사전 채굴된 잔액을 계정(주소)에 설정할 수 있습니다. 이 설정은 제네시스 파일의 구성 항목이며 나중에 변경할 수 없습니다.

`--premine flag`를 사용하는 방법의 예가 아래에 나와 있습니다.

`--premine=0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000`

이는 사전 채굴된 잔액 1000ETH를 0x3956E90e632AEbBF34DEB49b71c28A83Bc029862에 설정합니다(인수의 금액은 wei 단위).

사전 채굴된 가스 토큰 금액이 총 공급량이 됩니다. 나중에 다른 기본 화폐(가스 토큰) 금액은 발행할 수 없습니다.

## 엣지에서 ERC-20을 가스 토큰으로 사용할 수 있나요? {#does-edge-support-erc-20-as-a-gas-token}

엣지는 ERC-20 토큰을 가스 토큰으로 지원하지 않습니다. 가스에는 네이티브 엣지 통화만 지원됩니다.

## 가스 제한을 어떻게 늘려야 할까요? {#how-to-increase-the-gas-limit}

Polygon Edge에서 가스 제한을 증가시키기 위해 두 가지 옵션이 있습니다.
1. 제네시스 파일의 최대 uint64 값으로 체인을 제거하고 `block-gas-limit`증가
2. 모든 노드의 가스 제한을 높이기 위해 높은 값으로 `--block-gas-target`플래그를 사용하십시오. 이 경우 노드 재부팅이 필요합니다. [자세한](/docs/edge/architecture/modules/txpool/#block-gas-target) 설명은 여기에서 자세히 설명합니다.
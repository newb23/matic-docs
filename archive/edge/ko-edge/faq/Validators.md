---
id: validators
title: 검사기 FAQ
description: "Polygon 엣지 검사기 FAQ"
keywords:
  - docs
  - polygon
  - edge
  - FAQ
  - validators

---

## 검사기를 추가/삭제하려면 어떻게 하나요? {#how-to-add-remove-a-validator}

### PoA {#poa}
검사기는 투표를 통해 추가되거나 삭제됩니다. 이에 관한 전체 가이드는 [여기](/docs/edge/consensus/poa)에서 찾을 수 있습니다.

### PoS {#pos}
노드가 검사기가 될 수 있도록 하는 자금 스테이킹 방법과 스테이킹 해제(검사기 삭제)하는 방법에 관한 가이드는 [여기](/docs/edge/consensus/pos-stake-unstake)에서 찾을 수 있습니다.

다음 사항을 참고하세요.
- 제네시스 플래그 `--max-validator-count`를 사용하여 검사기 세트에 포함될 수 있는 최대 스테이커 수를 설정할 수 있습니다.
- 제네시스 플래그 `--min-validator-count `를 사용하여 검사기 세트에 포함해야 하는 최소 스테이커 수를 설정할 수 있습니다(기본 값은 `1`).
- 최대 검사기 수에 도달하면, 해당 세트에서 기존 검사기를 삭제해야 다른 검사기를 추가할 수 있습니다. 새 검사기의 스테이킹 금액이 더 높은 경우에도 마찬가지입니다. 검사기를 삭제하는 경우, 남은 검사기의 수는 `--min-validator-count` 이상이어야 합니다.
- 검사기가 되기 위한 기본 임계값인 `1`단위의 기본 네트워크(가스) 화폐가 있습니다.



## 검사기에 어느 정도의 디스크 공간이 필요한가요? {#how-much-disk-space-is-recommended-for-a-validator}

보수적으로 추정하여 최소 100G로 시작하고 나중에 디스크 확장이 가능하도록 하는 것이 좋습니다.


## 검사기 수에 한도가 있나요? {#is-there-a-limit-to-the-number-of-validators}

기술적 제한과 관련하여, 네트워크에서 가질 수 있는 노드 수에 대해 Polygon 엣지가 명시한 한도는 없습니다. 노드별로 연결 한도(인바운드/아웃바운드 연결 수)를 정할 수 있습니다.

현실적인 한계를 말하자면, 100노드 클러스터는 10노드 클러스터보다 성능이 떨어질 것입니다. 클러스터의 노드 수를 늘리면 일반적으로 통신 복잡성과 네트워킹 오버헤드가 커집니다. 그러나 이는 실행 중인 네트워크의 종류 및 네트워크 토폴로지의 종류에 따라 다릅니다.

## PoA에서 PoS로 어떻게 전환하나요? {#how-to-switch-from-poa-to-pos}

PoA는 기본 합의 메커니즘입니다. 새 클러스터의 경우, PoS로 전환하려면 제네시스 파일을 생성할 때 `--pos` 플래그를 추가해야 합니다. 실행 클러스터가 있는 경우, 전환하는 방법은 [여기](/docs/edge/consensus/migration-to-pos)에서 확인할 수 있습니다. 합의 메커니즘 및 설정에 관해 필요한 모든 정보는 [합의 섹션](/docs/edge/consensus/poa)에서 찾을 수 있습니다.

## 호환성을 손상하는 변경이 있는 경우, 노드를 어떻게 업데이트하나요? {#how-do-i-update-my-nodes-when-there-s-a-breaking-change}

이 절차에 관한 자세한 가이드는 [여기](/docs/edge/validator-hosting#update)에서 찾을 수 있습니다.

## PoS 엣지에 설정할 수 있는 최소 스테이킹 금액이 있나요? {#is-the-minimum-staking-amount-configurable-for-pos-edge}

최소 스테이킹 금액은 기본적으로 `1 ETH`이며, 별도로 구성할 수 없습니다.

## JSON RPC 명령어 `eth_getBlockByNumber`및 `eth_getBlockByHash`가 채굴자의 주소를 반환하지 않는 이유는 무엇인가요? {#not-return-the-miner-s-address}

현재 Polygon 엣지에서 사용되는 합의는 IBFT 2.0이며, 이는 다시 Clique PoA: [ethereum/EIPs#225](https://github.com/ethereum/EIPs/issues/225)에서 설명하는 투표 메커니즘을 기반으로 합니다.

EIP-225(Clique PoA)를 보면, `miner`(일명 `beneficiary`)의 용도를 설명하는 부분입니다.

<blockquote>
Polygon은 다음과 같이 ethash 헤더 필드의 용도를 변경합니다.
<ul>
<li><b>수익자 / 채굴자: </b> 승인된 서명자 목록의 수정을 제안할 주소.</li>
<ul>
<li>일반적으로 0이 입력되어 있으며 투표하는 동안에만 수정할 수 있습니다.</li>
<li>그렇지만 투표 메커니즘 관련 구현의 복잡성이 커지지 않도록 임의의 값도 허용됩니다(비서명자 삭제 투표와 같은 무의미한 값도 가능).</li>
<li>체크포인트(즉, 에포크 전환) 블록에는 0이 입력되어야 합니다. </li>
</ul>

</ul>

</blockquote>

따라서 `miner` 필드는 블록의 제안자 표시가 아니라 일정 주소에 대한 투표 제안에 사용됩니다.

블록 제안자에 관한 정보는 블록 헤더의 RLP 인코딩 Istanbul 추가 데이터 필드 중 봉인 필드에서 공개 키를 복구하여 찾을 수 있습니다.

## 제네시스의 일부 및 값을 안전하게 수정할 수 있습니까? {#which-parts-and-values-of-genesis-can-safely-be-modified}

:::caution

편집 하려고 하기 전에 기존 genesis.json 파일의 수동 사본을 만드시는지 확인하십시오. 또한 genesis.json 파일을 편집하는 데 앞서 전체 체인을 중단해야 합니다. 또한 genesis.json 파일을 편집하기 전에 전체 체인을 사용해야 합니다. 제네시스 파일이 수정되면, 새로운 버전은 모든 비 검증자 및 valdiator 노드를 통해 배포해야 합니다.

:::

목록에서 부트 노드를 추가하거나 제거할 수 있는 **제네시스 파일의 부트 노드 섹션만으로도 안전하게 수정할** 수 있습니다.
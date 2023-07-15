---
id: manage-private-keys
title: 비공개 키 관리
description: "비공개 키 관리 방법 및 비공개 키의 유형."
keywords:
  - docs
  - polygon
  - edge
  - private
  - key
  - keystore
---

## 개요 {#overview}

Polygon 엣지에서 직접 관리하는 두 가지 유형의 비공개 키가 있습니다.

* **합의 메커니즘에 사용되는 비공개 키**
* **libp2p가 네트워킹에 사용하는 비공개 키**
* **(선택 사항) 합의 메커니즘에서 검사기의 서명을 취합하는 데 사용하는 BLS 비공개 키**

현재 Polygon 엣지는 직접적인 계정 관리를 지원하지 않습니다.

[백업 및 복원 가이드](/docs/edge/working-with-node/backup-restore)에서 설명하는 디렉터리 구조를 기반으로, Polygon 엣지는 위에 언급된 키 파일을 **consensus**, **keystore**라는 서로 다른 두 개의 디렉터리에 저장합니다.

## 키 형식 {#key-format}

비공개 키는 단순한 **Base64 형식**으로 저장되므로 사람이 읽기 쉽고 이동이 가능합니다.

```bash
# Example private key
0802122068a1bdb1c8af5333e58fe586bc0e9fc7aff882da82affb678aef5d9a2b9100c0
```

:::info 키 유형

Polygon 엣지 내부에서 생성되고 사용되는 모든 비공개 키 파일은 [secp256k1](https://en.bitcoin.it/wiki/Secp256k1) 곡선을 갖는 ECDSA에 의존합니다.

이 곡선은 표준이 아니므로 표준화된 PEM 형식으로 인코딩하여 저장할 수 없습니다.
이 키 유형을 따르지 않는 키를 가져오는 것은 지원되지 않습니다.

:::
## 합의 비공개 키 {#consensus-private-key}

*합의 비공개 키*라는 비공개 키 파일은 **검사기 비공개 키**라고도 합니다.
이 비공개 키는 노드가 네트워크에서 검사기 역할을 하고 새 데이터에 서명해야 하는 경우 사용됩니다.

이 비공개 키 파일은 `consensus/validator.key`에 있으며 언급된 [키 형식](/docs/edge/configuration/manage-private-keys#key-format)을 따릅니다.

:::warning

검사기 비공개 키는 각각의 검사기 노드에 고유한 것입니다. 체인 보안 침해 가능성 때문에 이 키는 모든 검사기가 공유할 수 <b>없습니다</b>.

:::

## 네트워킹 비공개 키 {#networking-private-key}

위에 언급된 네트워킹용 비공개 키 파일은 libp2p에서 피어 ID를 생성하고 노드가 네트워크에 참여할 수 있게 하는 데 사용됩니다.

`keystore/libp2p.key`에 있으며, 언급된 [키 형식](/docs/edge/configuration/manage-private-keys#key-format)을 따릅니다.

## BLS 보안 비밀 키 {#bls-secret-key}

BLS 보안 비밀 키 파일은 합의 레이어에서 커밋된 봉인을 집계하는 데 사용됩니다. BLS가 집계하는 커밋된 봉인의 크기는 직렬화된 커밋 ECDSA 서명보다 작습니다.

BLS 기능은 선택 사항이며 BLS 사용 여부를 선택할 수 있습니다. 자세한 내용은 [BLS](/docs/edge/consensus/bls)를 참조하시기 바랍니다.

## 가져오기 / 내보내기 {#import-export}

키 파일은 단순한 Base64로 디스크에 저장되므로 쉽게 백업하거나 가져올 수 있습니다.

:::caution 키 파일 변경

합의 및 피어 탐색 메커니즘은 이러한 키에서 도출된 데이터를 노드별 스토리지에 저장하고 이 데이터에 의존하여 연결을 시작하고 합의 논리를 수행하기 때문에, 이미 설정 또는 실행 중인 네트워크상의 키 파일에 대한 모든 종류의 변경은 심각한 네트워크/합의 중단으로 이어질 수 있습니다.

:::
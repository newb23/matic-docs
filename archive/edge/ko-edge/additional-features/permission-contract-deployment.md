---
id: permission-contract-deployment
title: 스마트 계약 배포 권한
description: 스마트 계약 배포 권한을 추가하는 방법.
keywords:
  - docs
  - polygon
  - edge
  - smart contract
  - permission
  - deployment
---

## 개요 {#overview}

이 가이드에서는 스마트 계약을 배포할 수 있는 주소를 허용 목록에 추가하는 방법에 관해 자세히 설명합니다.
네트워크 운영자는 사용자가 네트워크의 목적과 무관한 스마트 계약을 배포하지 못하도록 해야 할 수 있습니다. 네트워크 운영자는 다음 작업을 할 수 있습니다.

1. 스마트 계약 배포를 위한 허용 목록에 주소 추가
2. 스마트 계약 배포를 위한 허용 목록에서 주소 삭제

## 비디오 프레젠테이션 {#video-presentation}

[![허가 계약 배포 - 비디오](https://img.youtube.com/vi/yPOkINpf7hg/0.jpg)](https://www.youtube.com/watch?v=yPOkINpf7hg)

## 사용 방법 {#how-to-use-it}


[CLI 명령어](/docs/edge/get-started/cli-commands#whitelist-commands) 페이지에서 배포 허용 목록과 관련된 모든 CLI 명령어를 확인할 수 있습니다.

* `whitelist show`: 허용 목록 정보를 표시합니다
* `whitelist deployment --add`: 계약 배포 허용 목록에 새 주소를 추가합니다
* `whitelist deployment --remove`: 계약 배포 허용 목록에서 새 주소를 삭제합니다

#### 배포 허용 목록의 모든 주소 표시 {#show-all-addresses-in-the-deployment-whitelist}

배포 허용 목록에서 주소를 찾는 방법은 두 가지가 있습니다.
1. 허용 목록이 저장되어 있는 `genesis.json`을 확인합니다
2. `whitelist show`를 실행하면 Polygon 엣지가 지원하는 모든 허용 목록의 정보가 출력됩니다

```bash

./polygon-edge whitelist show

[WHITELISTS]

Contract deployment whitelist : [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d],


```

#### 배포 허용 목록에 주소 추가 {#add-an-address-to-the-deployment-whitelist}

배포 허용 목록에 새 주소를 추가하려면 `whitelist deployment --add [ADDRESS]` CLI 명령어를 실행합니다. 허용 목록의 주소 수에는 제한이 없습니다. 계약 배포 허용 목록에 있는 주소만 계약을 배포할 수 있습니다. 허용 목록이 비어 있다면 모든 주소가 계약을 배포할 수 있습니다.

```bash

./polygon-edge whitelist deployment --add 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d --add 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF


[CONTRACT DEPLOYMENT WHITELIST]

Added addresses: [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],
Contract deployment whitelist : [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],



```

#### 배포 허용 목록에서 주소 삭제 {#remove-an-address-from-the-deployment-whitelist}

배포 허용 목록에서 주소를 삭제하려면 `whitelist deployment --remove [ADDRESS]` CLI 명령어를 실행합니다. 계약 배포 허용 목록에 있는 주소만 계약을 배포할 수 있습니다. 허용 목록이 비어 있다면 모든 주소가 계약을 배포할 수 있습니다.

```bash

./polygon-edge whitelist deployment --remove 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d --remove 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF


[CONTRACT DEPLOYMENT WHITELIST]

Removed addresses: [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],
Contract deployment whitelist : [],



```

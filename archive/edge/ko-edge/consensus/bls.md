---
id: bls
title: BLS
description: "BLS 모드에 관한 설명 및 지침."
keywords:
  - docs
  - polygon
  - edge
  - bls
---

## 개요 {#overview}

BBLS라고도 하는 BS는 사용자가 서명자가 진짜임을 확인할 수 있는 암호화 서명 방식입니다. 여러 서명을 집계할 수 있는 시그니처 계획입니다. Polygon 엣지에서는 IBFT 합의 모드의 보안을 강화하기 위해 기본적으로 BLS를 사용합니다. BLS는 서명을 단일 바이트 배열로 집계하고 블록 헤더 크기를 줄일 수 있습니다. 각 체인은 BLS 사용 여부를 선택할 수 있습니다. ECDSA 키는 BLS 모드의 활성화 여부와 관계없이 사용됩니다.

## 비디오 프레젠테이션 {#video-presentation}

[![bls - 비디오](https://img.youtube.com/vi/HbUmZpALlqo/0.jpg)](https://www.youtube.com/watch?v=HbUmZpALlqo)

## BLS를 사용하여 새로운 체인을 설정하는 방법 {#how-to-setup-a-new-chain-using-bls}

자세한 설정 지침은 [로컬 셋업](/docs/edge/get-started/set-up-ibft-locally) / [클라우드 설정](/docs/edge/get-started/set-up-ibft-on-the-cloud) 섹션을 참조하세요.

## 기존 ECDSA PoA 체인에서 BLS PoA 체인으로 마이그레이션하는 방법 {#how-to-migrate-from-an-existing-ecdsa-poa-chain-to-bls-poa-chain}

이 섹션은 기존 PoA 체인에서 BLS 모드를 사용하는 방법에 대해 설명합니다.
PoA 체인에서 BLS를 활성화하려면 다음 단계를 수행해야 합니다.

1. 모든 노드를 종료합니다.
2. 검사기용 BLS 키를 생성합니다.
3. genesis.json에 포크 설정을 추가합니다.
4. 모드 노드를 다시 시작합니다.

### 1. 모든 노드 종료 {#1-stop-all-nodes}

Ctrl + c(Control + c)를 눌러 검사기의 모든 프로세스를 종료합니다. 마지막 블록 높이(블록 커밋 로그에서 가장 높은 시퀀스 번호)를 기억하시기 바랍니다.

### 2. BLS 키 생성 {#2-generate-the-bls-key}

`secrets init`가 있는 `--bls`는 BLS 키를 생성합니다. 기존 ECDSA 및 네트워크 키를 보존하면서 새로운 BLS 키를 추가하려면 `--ecdsa` 및 `--network`를 비활성화해야 합니다.

```bash
polygon-edge secrets init --bls --ecdsa=false --network=false

[SECRETS INIT]
Public key (address) = 0x...
BLS Public key       = 0x...
Node ID              = 16...
```

### 3. 포크 설정 추가 {#3-add-fork-setting}

`ibft switch` 명령어는 기존 체인에서 BLS를 활성화하는 포크 설정을 `genesis.json`에 추가합니다.

PoA 네트워크의 경우 명령어에 검사기를 제공해야 합니다. `genesis` 명령어의 방식과 마찬가지로 `--ibft-validators-prefix-path`또는 `--ibft-validator` 플래그를 사용하여 검사기를 지정할 수 있습니다.

`--from` 플래그와 함께 BLS를 사용하여 체인 시작 높이를 지정하세요.

```bash
polygon-edge ibft switch --chain ./genesis.json --type PoA --ibft-validator-type bls --ibft-validators-prefix-path test-chain- --from 100
```

### 4. 모든 노드 재시작 {#4-restart-all-nodes}

`server` 명령어로 모든 노드를 재시작하세요. 이전 단계에서 지정된 `from`의 블록이 생성되면 체인은 BLS를 활성화하고 아래와 같이 로그를 표시합니다.

```bash
2022-09-02T11:45:24.535+0300 [INFO]  polygon.ibft: IBFT validation type switched: old=ecdsa new=bls
```

또한, 로그는 블록이 생성된 후 각 블록을 생성하는 데 사용된 검증 모드를 보여줍니다.

```
2022-09-02T11:45:28.728+0300 [INFO]  polygon.ibft: block committed: number=101 hash=0x5f33aa8cea4e849807ca5e350cb79f603a0d69a39f792e782f48d3ea57ac46ca validation_type=bls validators=3 committed=3
```

## 기존 ECDSA PoS 체인에서 BLS PoS 체인으로 마이그레이션하는 방법 {#how-to-migrate-from-an-existing-ecdsa-pos-chain-to-a-bls-pos-chain}

이 섹션은 기존 PoS 체인에서 BLS 모드를 사용하는 방법에 대해 설명합니다.
PoS 체인에서 BLS를 활성화하려면 다음 단계를 수행해야 합니다.

1. 모든 노드를 종료합니다.
2. 검사기용 BLS 키를 생성합니다.
3. genesis.json에 포크 설정을 추가합니다.
4. 스테이킹 계약을 호출하여 BLS 공개 키를 등록합니다.
5. 모드 노드를 다시 시작합니다.

### 1. 모든 노드 종료 {#1-stop-all-nodes-1}

Ctrl + c(Control + c)를 눌러 검사기의 모든 프로세스를 종료합니다. 마지막 블록 높이(블록 커밋 로그에서 가장 높은 시퀀스 번호)를 기억하시기 바랍니다.

### 2. BLS 키 생성 {#2-generate-the-bls-key-1}

`--bls` 플래그가 있는 `secrets init`는 BLS 키를 생성합니다. 기존 ECDSA 및 네트워크 키를 보존하면서 새로운 BLS 키를 추가하려면 `--ecdsa` 및 `--network`를 비활성화해야 합니다.

```bash
polygon-edge secrets init --bls --ecdsa=false --network=false

[SECRETS INIT]
Public key (address) = 0x...
BLS Public key       = 0x...
Node ID              = 16...
```

### 3. 포크 설정 추가 {#3-add-fork-setting-1}

`ibft switch` 명령어는 체인의 중반부터 BLS를 활성화하는 포크 설정을 `genesis.json`에 추가합니다.

`from` 플래그와 함께 BLS 모드를 사용하여 체인 시작 높이를 지정하고 `development` 플래그를 사용하여 계약이 업데이트되는 높이를 지정하세요.

```bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --ibft-validator-type bls --deployment 50 --from 200
```

### 4. 스테이킹 계약에 BLS 공개 키 등록 {#4-register-bls-public-key-in-staking-contract}

포크가 추가되고 검사기가 다시 시작되면, 각 검사기는 스테이킹 계약에서 `registerBLSPublicKey`를 호출하여 BLS 공개 키를 등록해야 합니다. 이 작업은 `--deployment`에 지정된 높이 뒤 그리고 `--from`에 지정된 높이 전에 수행되어야 합니다.

BLS 공개 키를 등록하는 스크립트는 [스테이킹 스마트 계약 저장소](https://github.com/0xPolygon/staking-contracts)에 정의되어 있습니다.

`.env` 파일에 등록할 `BLS_PUBLIC_KEY`를 설정합니다. 기타 매개변수에 대한 자세한 정보는 [pos-stake-unstake](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts)를 참조하세요.

```env
JSONRPC_URL=http://localhost:10002
STAKING_CONTRACT_ADDRESS=0x0000000000000000000000000000000000001001
PRIVATE_KEYS=0x...
BLS_PUBLIC_KEY=0x...
```

다음 명령어는 `.env`에 제공된 BLS 공개 키를 계약에 등록합니다.

```bash
npm run register-blskey
```

:::warning 검사기는 BLS 공개 키를 수동으로 등록해야 합니다.

BLS 모드에서 검사기는 자체 주소와 BLS 공개 키가 있어야 합니다. 합의 레이어는 합의가 계약에서 검사기 정보를 가져올 때 계약에 BLS 공개 키를 등록하지 않는 검사기를 무시합니다.

:::

### 5. 모든 노드 재시작 {#5-restart-all-nodes}

`server` 명령어로 모든 노드를 재시작하세요. 이전 단계에서 지정된 `from`의 블록이 생성되면 체인은 BLS를 활성화합니다.

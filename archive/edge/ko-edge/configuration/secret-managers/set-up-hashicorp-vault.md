---
id: set-up-hashicorp-vault
title: Hashicorp Vault 설정
description: "Polygon 엣지를 위한 Hashicorp Vault 설정."
keywords:
  - docs
  - polygon
  - edge
  - hashicorp
  - vault
  - secrets
  - manager
---

## 개요 {#overview}

현재 Polygon 엣지는 두 가지의 주요 런타임 보안 비밀을 유지하기 위해 노력하고 있습니다.
* 노드가 검사기인 경우 노드에서 사용하는 **검사기 비공개 키**
* 다른 피어와의 통신 및 참여를 위해 libp2p에서 사용하는 **네트워킹 비공개 키**

:::warning

검사기 비공개 키는 각 검사기 노드에 고유한 것입니다. 체인 보안 침해 가능성 때문에 이 키는 모든 검사기 간에 공유할 수 <b>없습니다</b>.

:::

자세한 정보는 [비공개 키 관리 가이드](/docs/edge/configuration/manage-private-keys)를 참조하세요.

Polygon 엣지의 모듈은 **보안 비밀을 유지하는 방법을 알 필요가 없습니다**. 궁극적으로, 모듈은
보안 비밀이 멀리 떨어진 서버에 저장되어 있는지 아니면 노드의 디스크에 로컬로 저장되어 있는지 고려할 필요가 없어야 합니다.

모듈이 보안 비밀 유지와 관련하여 알아야 할 것은 **보안 비밀 사용 방법** 그리고 **어떤 비밀을 가져오거나
저장해야 하는지**가 전부입니다. 이러한 작업의 고급 구현 세부 정보는 `SecretsManager`에 위임되며, 이는 물론 추상적 개념입니다.

Polygon 엣지를 시작하는 노드 연산자는 이제 사용할 비밀 관리자를 지정할 수 있습니다.
올바른 보안 비밀 관리자가 인스턴스화되는 즉시, 모듈은 언급된 인터페이스를 통해 보안 비밀을 처리합니다.
보안 비밀이 디스크에 저장되었는지, 서버에 저장되었는지는 고려하지 않습니다.

이 문서에서는 [Hashicorp Vault](https://www.vaultproject.io/) 서버와 함께 Polygon 엣지를 시작하고 실행하는 데 필요한 단계를 자세히 설명합니다.

:::info 이전 가이드

이 문서를 읽기 전 **권장 사항**은 [**로컬 설정**](/docs/edge/get-started/set-up-ibft-locally)
및 [**클라우드 설정**](/docs/edge/get-started/set-up-ibft-on-the-cloud)에 관한 문서를 읽는 것입니다.

:::


## 기본 요건 {#prerequisites}

이 문서에서는 작동하는 Hashicorp Vault 서버 인스턴스가 **이미 설정되어 있다고** 가정합니다.

또한, Polygon 엣지에 사용되는 Hashicorp Vault 서버는 **활성화된 KV 스토리지**가 있어야 합니다.

계속하려면 다음 정보가 필요합니다.
* **서버 URL**(Hashicorp Vault 서버의 API URL)
* **토큰**(KV 스토리지 엔진 액세스에 사용할 액세스 토큰)

## 1단계 - 보안 비밀 관리자 구성 생성 {#step-1-generate-the-secrets-manager-configuration}

Polygon 엣지가 Vault 서버와 원활하게 통신할 수 있으려면 이미 생성된
구성 파일을 파싱해야 합니다. 이 파일에는 Vault의 보안 비밀 스토리지에 필요한 모든 정보가 포함되어 있습니다.

구성을 생성하려면 다음 명령어를 실행합니다.

```bash
polygon-edge secrets generate --dir <PATH> --token <TOKEN> --server-url <SERVER_URL> --name <NODE_NAME>
```

매개변수 의미:
* `PATH`는 구성 파일을 내보내야 하는 경로입니다. 기본값은 `./secretsManagerConfig.json`입니다.
* `TOKEN`은 [기본 요건 섹션](/docs/edge/configuration/secret-managers/set-up-hashicorp-vault#prerequisites)에서 설명한 액세스 토큰입니다.
* `SERVER_URL`은 Vault 서버의 API URL이며 [기본 요건 섹션](/docs/edge/configuration/secret-managers/set-up-hashicorp-vault#prerequisites)에도 설명되어 있습니다.
* `NODE_NAME`은 Vault 구성이 설정되고 있는 현재 노드의 이름입니다. 임의의 값일 수 있습니다. 기본값은 `polygon-edge-node`입니다.

:::caution 노드 이름

노드 이름을 지정할 때 주의하세요.

Polygon 엣지는 지정된 노드 이름을 사용하여 Vault 인스턴스에서 생성하고 사용하는 보안 비밀을 추적합니다.
이미 존재하는 노드 이름을 지정하면 Vault 서버에서 데이터를 덮어쓸 수 있습니다.

보안 비밀은 다음 기본 경로에 저장됩니다. `secrets/node_name`

:::

## 2단계 - 구성을 사용하여 보안 비밀 키 초기화 {#step-2-initialize-secret-keys-using-the-configuration}

이제 구성 파일이 있으므로
1단계에서 `--config`를 사용하여 설정한 구성 파일로 필요한 보안 비밀 키를 초기화할 수 있습니다.

```bash
polygon-edge secrets init --config <PATH>
```

`PATH` 매개변수는 1단계에서 생성한 보안 비밀 관리자 매개변수의 위치입니다.

## 3단계 - 제네시스 파일 생성 {#step-3-generate-the-genesis-file}

제네시스 파일은 사소한 변경 사항을 제외하고는 [**로컬 설정**](/docs/edge/get-started/set-up-ibft-locally)
및 [**클라우드 설정**](/docs/edge/get-started/set-up-ibft-on-the-cloud) 가이드와 유사한 방식으로 생성되어야 합니다.

로컬 파일 시스템 대신 Hashicorp Vault가 사용되고 있으므로  `--ibft-validator` 플래그를 통해 검사기 주소를 추가해야 합니다.
```bash
polygon-edge genesis --ibft-validator <VALIDATOR_ADDRESS> ...
```

## 4단계 - Polygon 엣지 클라이언트 시작 {#step-4-start-the-polygon-edge-client}

이제 키가 설정되고 제네시스 파일이 생성되었으므로 이 프로세스의 마지막 단계는
`server` 명령어로 Polygon 엣지를 시작하는 것입니다.

`server` 명령어는 사소한 추가(`--secrets-config` 플래그)를 제외하고는 앞서 설명한 가이드와 동일한 방식으로 사용됩니다.
```bash
polygon-edge server --secrets-config <PATH> ...
```

`PATH` 매개변수는 1단계에서 생성한 보안 비밀 관리자 매개변수의 위치입니다.
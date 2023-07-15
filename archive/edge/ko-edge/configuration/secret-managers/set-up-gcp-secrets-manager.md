---
id: set-up-gcp-secrets-manager
title: GCP Secrets Manager 설정
description: "Polygon 엣지를 위한 GCP Secrets Manager 설정."
keywords:
  - docs
  - polygon
  - edge
  - gcp
  - secrets
  - manager
---

## 개요 {#overview}

현재 Polygon 엣지는 두 가지의 주요 런타임 보안 비밀을 유지하기 위해 노력하고 있습니다.
* 노드가 검사기인 경우 노드에서 사용하는 **검사기 비공개 키**
* 다른 피어와의 통신 및 참여를 위해 libp2p에서 사용하는 **네트워킹 비공개 키**

자세한 정보는 [비공개 키 관리 가이드](/docs/edge/configuration/manage-private-keys)를 참조하세요.

Polygon 엣지의 모듈은 **보안 비밀을 유지하는 방법을 알 필요가 없습니다**. 궁극적으로, 모듈은
보안 비밀이 멀리 떨어진 서버에 저장되어 있는지 아니면 노드의 디스크에 로컬로 저장되어 있는지 고려할 필요가 없어야 합니다.

모듈이 보안 비밀 유지와 관련하여 알아야 할 것은 **보안 비밀 사용 방법** 그리고 **어떤 비밀을 가져오거나
저장해야 하는지**가 전부입니다. 이러한 작업의 고급 구현 세부 정보는 `SecretsManager`에 위임되며, 이는 물론 추상적 개념입니다.

Polygon 엣지를 시작하는 노드 연산자는 이제 사용할 비밀 관리자를 지정할 수 있습니다.
올바른 보안 비밀 관리자가 인스턴스화되는 즉시, 모듈은 언급된 인터페이스를 통해 보안 비밀을 처리합니다.
보안 비밀이 디스크에 저장되었는지, 서버에 저장되었는지는 고려하지 않습니다.

이 문서에서는 [GCP Secrets Manager](https://cloud.google.com/secret-manager)와 함께 Polygon 엣지를 시작하고 실행하는 데 필요한 단계를 자세히 설명합니다.

:::info 이전 가이드

이 문서를 읽기 전 **권장 사항**은 [**로컬 설정**](/docs/edge/get-started/set-up-ibft-locally)
및 [**클라우드 설정**](/docs/edge/get-started/set-up-ibft-on-the-cloud)에 관한 문서를 읽는 것입니다.

:::


## 기본 요건 {#prerequisites}
### GCP 청구 계정 {#gcp-billing-account}
GCP Secrets Manager를 활용하려면 사용자가 GCP 포털에서 [청구 계정](https://console.cloud.google.com/)을 활성화해야 합니다. GCP 플랫폼의 새 Google 계정에는 무료 체험판으로 시작할 수 있는 자금이 제공됩니다. 상세 정보: [GCP 문서](https://cloud.google.com/free)

### Secrets Manager API {#secrets-manager-api}
사용자는 Secrets Manager를 사용 전에 [Secrets Manager API 포털](https://console.cloud.google.com/apis/library/secretmanager.googleapis.com)을 통해 GCP Secrets Manager API를 활성화해야 합니다.
상세 정보: [Secrets Manger 구성](https://cloud.google.com/secret-manager/docs/configuring-secret-manager)

### GCP 자격 증명 {#gcp-credentials}
마지막으로, 사용자는 인증에 사용될 새로운 자격 증명을 생성해야 합니다.
[여기](https://cloud.google.com/secret-manager/docs/reference/libraries)에 게시된 설명을 따르면 됩니다.   
자격 증명이 포함된 생성된 json 파일은 GCP Secrets Manager를 활용해야 하는 각 노드로 전송되어야 합니다.

계속하려면 다음 정보가 필요합니다.
* **프로젝트 ID**(GCP 플랫폼에 정의된 프로젝트 ID)
* **자격 증명 파일 위치**(자격 증명이 포함된 json 파일의 경로)

## 1단계 - 보안 비밀 관리자 구성 생성 {#step-1-generate-the-secrets-manager-configuration}

Polygon 엣지가 GCP SM과 원활하게 통신할 수 있으려면 이미 생성된
구성 파일을 파싱해야 합니다. 이 파일에는 GCP SM의 보안 비밀 스토리지에 필요한 모든 정보가 포함되어 있습니다.

구성을 생성하려면 다음 명령어를 실행합니다.

```bash
polygon-edge secrets generate --type gcp-ssm --dir <PATH> --name <NODE_NAME> --extra project-id=<PROJECT_ID>,gcp-ssm-cred=<GCP_CREDS_FILE>
```

매개변수 의미:
* `PATH`는 구성 파일을 내보내야 하는 경로입니다. 기본은 `./secretsManagerConfig.json`입니다.
* `NODE_NAME`은 GCP SM 구성이 설정되는 현재 노드의 이름입니다. 임의의 값일 수 있습니다. 기본은 `polygon-edge-node`입니다.
* `PROJECT_ID`는 계정 설정 및 Secrets Manager API 활성화 과정에서 사용자가 GCP 콘솔에서 정의한 프로젝트의 ID입니다.
* `GCP_CREDS_FILE`은 Secrets Manager에 대한 읽기/쓰기 액세스를 허용하는 자격 증명이 포함된 json 파일의 경로입니다.

:::caution 노드 이름

노드 이름을 지정할 때 주의하세요.

Polygon 엣지는 지정된 노드 이름을 사용하여 GCP SM에서 생성하고 사용하는 보안 비밀을 추적합니다.
이미 존재하는 노드 이름을 지정하면 GCP SM에 보안 비밀을 쓰지 못하게 될 수 있습니다.

보안 비밀은 다음 기본 경로에 저장됩니다. `projects/PROJECT_ID/NODE_NAME`

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

로컬 파일 시스템 대신 GCP SM이 사용되고 있으므로 `--ibft-validator` 플래그를 통해 검사기 주소를 추가해야 합니다.
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
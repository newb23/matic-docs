---
id: set-up-aws-ssm
title: AWS SSM(시스템 관리자) 설정
description: "Polygon 엣지용 AWS SSM(시스템 관리자)을 설정합니다."
keywords:
  - docs
  - polygon
  - edge
  - aws
  - ssm
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

이 문서에서는
[AWS Systems Manager Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html)와 함께 Polygon 엣지를 시작하고 실행하는 데 필요한 단계를 자세히 설명합니다.

:::info 이전 가이드

이 문서를 읽기 전 **권장 사항**은 [**로컬 설정**](/docs/edge/get-started/set-up-ibft-locally)
및 [**클라우드 설정**](/docs/edge/get-started/set-up-ibft-on-the-cloud)에 관한 문서를 읽는 것입니다.

:::


## 기본 요건 {#prerequisites}
### IAM 정책 {#iam-policy}
사용자는 AWS Systems Manager Parameter Store의 읽기/쓰기 작업을 허용하는 IAM 정책을 생성해야 합니다.
IAM 정책을 성공적으로 생성한 후에는 Polygon 엣지 서버를 실행하는 EC2 인스턴스에 연결해야 합니다.
IAM 정책은 다음과 같이 표시됩니다.
```json
{
  "Version": "2012-10-17",
  "Statement" : [
    {
      "Effect" : "Allow",
      "Action" : [
        "ssm:PutParameter",
        "ssm:DeleteParameter",
        "ssm:GetParameter"
      ],
      "Resource" : [
        "arn:aws:ssm:<aws_region>:<aws_account_id>:parameter<ssm-parameter-path>*"
      ]
    }
  ]
}
```
AWS SSM IAM 역할에 대한 자세한 정보는 [AWS 문서](https://docs.aws.amazon.com/systems-manager/latest/userguide/setup-instance-profile.html)에서 찾을 수 있습니다.

계속하기 전에 필요한 정보:
* **지역**(시스템 관리자 및 노드의 소재지)
* **매개변수 경로**(보안 비밀이 배치될 임의 경로, 예: `/polygon-edge/nodes`)

## 1단계 - 보안 비밀 관리자 구성 생성 {#step-1-generate-the-secrets-manager-configuration}

Polygon 엣지가 AWS SSM과 원활하게 통신할 수 있으려면 이미 생성된
구성 파일을 파싱해야 합니다. 이 파일에는 AWS SSM의 보안 비밀 스토리지에 필요한 모든 정보가 포함되어 있습니다.

구성을 생성하려면 다음 명령어를 실행합니다.

```bash
polygon-edge secrets generate --type aws-ssm --dir <PATH> --name <NODE_NAME> --extra region=<REGION>,ssm-parameter-path=<SSM_PARAM_PATH>
```

매개변수 의미:
* `PATH`는 구성 파일을 내보내야 하는 경로입니다. 기본 `./secretsManagerConfig.json`
* `NODE_NAME`은 AWS SSM 구성이 설정될 현재 노드의 이름입니다. 임의의 값일 수 있습니다. 기본 `polygon-edge-node`
* `REGION`은 AWS SSM이 있는 지역입니다. AWS SSM을 활용하는 노드와 동일한 지역이어야 합니다.
* `SSM_PARAM_PATH`는 보안 비밀이 저장될 경로의 이름입니다. 예를 들어, `--name node1`과 `ssm-parameter-path=/polygon-edge/nodes`가
지정되면 보안 비밀은 `/polygon-edge/nodes/node1/<secret_name>`으로 저장됩니다.

:::caution 노드 이름

노드 이름을 지정할 때 주의하세요.

Polygon 엣지는 지정된 노드 이름을 사용하여 AWS SSM에서 생성하고 사용하는 보안 비밀을 추적합니다.
기존 노드 이름을 지정하면 AWS SSM에 보안 비밀을 작성하지 못하는 결과가 발생할 수 있습니다.

보안 비밀은 다음 기본 경로에 저장됩니다. `SSM_PARAM_PATH/NODE_NAME`

:::

## 2단계 - 구성을 사용하여 보안 비밀 키 초기화 {#step-2-initialize-secret-keys-using-the-configuration}

이제 구성 파일이 있으므로
1단계에서 `--config`를 사용하여 설정한 구성 파일로 필요한 보안 비밀 키를 초기화할 수 있습니다.

```bash
polygon-edge secrets init --config <PATH>
```

`PATH` 매개변수는 1단계에서 생성한 보안 비밀 관리자 매개변수의 위치입니다.

:::info IAM 정책

읽기/쓰기 작업을 허용하는 IAM 정책이 올바르게 구성되지 않았거나 이 명령어를 실행하는 EC2 인스턴스에 연결되지 않으면 이 단계는 실패합니다.

:::

## 3단계 - 제네시스 파일 생성 {#step-3-generate-the-genesis-file}

제네시스 파일은 사소한 변경 사항을 제외하고는 [**로컬 설정**](/docs/edge/get-started/set-up-ibft-locally)
및 [**클라우드 설정**](/docs/edge/get-started/set-up-ibft-on-the-cloud) 가이드와 유사한 방식으로 생성되어야 합니다.

로컬 파일 시스템 대신 AWS SSM을 사용 중이므로 `--ibft-validator`플래그를 통해 검사기 주소를 추가해야 합니다.
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
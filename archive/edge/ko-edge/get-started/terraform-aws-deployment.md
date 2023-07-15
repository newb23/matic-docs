---
id: terraform-aws-deployment
title: Terraform AWS 배포
description: "Terraform을 사용하여 AWS 클라우드 공급업체에 Polygon 엣지 네트워크 배포하기"
keywords:
  - docs
  - polygon
  - edge
  - deployment
  - terraform
  - aws
  - script
---
:::info 프로덕션 배포 가이드

프로덕션용으로 완전 자동화된 공식 AWS 배포 가이드입니다.

***[클라우드](set-up-ibft-on-the-cloud)*** 또는 ***[로컬](set-up-ibft-locally)***에 대한 수동 배포는 테스트 목적이거나 AWS 외의 클라우드 공급업체를 이용하는 경우에 적합합니다.

:::

:::info

이 배포는 PoA에 한정됩니다.   
PoS 메커니즘이 필요한 경우, 본 ***[가이드](/docs/edge/consensus/migration-to-pos)***를 따라 PoA에서 PoS로 전환하면 됩니다.

:::

이 가이드에서는 검사기 노드가 여러 가용 영역에 걸쳐 있어 프로덕션 준비가 완료된 AWS 클라우드 공급업체에 Polygon 엣지 블록체인 네트워크를 배포하는 과정을 자세히 설명합니다.

## 기본 요건 {#prerequisites}

### 시스템 도구 {#system-tools}
* [Terraform](https://www.terraform.io/)
* [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
* [AWS 액세스 키 ID 및 보안 비밀 액세스 키](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-prereqs.html#getting-started-prereqs-keys)

### Terraform 변수 {#terraform-variables}
배포하기 전에 두 개의 변수가 제공되어야 합니다.

* `alb_ssl_certificate`- ALB가 https 프로토콜에 사용할 AWS Certificate Manager 인증서의 ARN.   
인증서는 배포 시작 전에 생성되어야 하며, **발급 완료** 상태여야 합니다.
* `premine` - 사전 채굴된 기본 화폐를 수령할 계정.
값은 공식 [CLI](/docs/edge/get-started/cli-commands#genesis-flags) 플래그 사양을 따라야 합니다.

## 배포 정보 {#deployment-information}
### 배포된 리소스 {#deployed-resources}
배포될 리소스에 대한 상위 수준 개요는 다음과 같습니다.

* 전용 VPC
* 4개의 검사기 노드(부트 노드이기도 함)
* 노드 아웃바운드 인터넷 트래픽을 허용하는 4개의 NAT 게이트웨이
* 첫 (제네시스) 블록을 생성하고 체인을 시작하는 데 사용되는 람다 함수
* 전용 보안 그룹 및 IAM 역할
* genesis.json 파일 저장에 사용되는 S3 버킷
* JSON-RPC 엔드포인트 노출에 사용되는 애플리케이션 부하 분산기

### 내결함성 {#fault-tolerance}

4개의 가용 영역이 있는 지역만 이 배포에 필요합니다. 각 노드는 단일 가용 영역에 배포됩니다.

각 노드를 단일 가용 영역에 배치하면 Polygon 엣지가 4개의 검사기 노드 클러스터에서 단일 노드의 실패를 허용하는 IBFT 합의를 구현하므로, 전체 블록체인 클러스터가 단일 노드(가용 영역) 장애에 대해 내결함성을 갖습니다.

### 명령줄 액세스 {#command-line-access}

검사기 노드는 어떤 방식으로도 공용 인터넷에 노출되지 않으며(JSON-PRC는 ALB를 통해서만 액세스됨), 공개 IP 주소가 연결되어 있지도 않습니다.  
노드 명령줄은 [AWS Systems Manager - Session Manager](https://aws.amazon.com/systems-manager/features/)를 통해서만 액세스할 수 있습니다.

### 기본 AMI 업그레이드 {#base-ami-upgrade}

이 배포는 `ubuntu-focal-20.04-amd64-server` AWS AMI를 사용합니다. AWS AMI가 업데이트되는 경우 EC2 *재배포*를 트리거하지 **않습니다**.

어떤 이유로 기본 AMI를 업데이트해야 하는 경우, `terraform apply`에 앞서 각 인스턴스에 `terraform taint` 명령어를 실행하여 업데이트할 수 있습니다.   
    `terraform taint module.instances[<instance_number>].aws_instance.polygon_edge_instance` 명령어를 실행하면 인스턴스가 테인트(taint)될 수 있습니다.

예시:
```shell
terraform taint module.instances[0].aws_instance.polygon_edge_instance
terraform taint module.instances[1].aws_instance.polygon_edge_instance
terraform taint module.instances[2].aws_instance.polygon_edge_instance
terraform taint module.instances[3].aws_instance.polygon_edge_instance
terraform apply
```

:::info

프로덕션 환경에서 `terraform taint`는 블록체인 네트워크 기능을 유지하기 위해 하나씩 실행되어야 합니다.

:::

## 배포 절차 {#deployment-procedure}

### 사전 배포 단계 {#pre-deployment-steps}
* [polygon-technology-edge](https://registry.terraform.io/modules/aws-ia/polygon-technology-edge/aws) Terraform 레지스트리 리드미를 자세히 읽습니다.
* 모듈 readme 페이지의 *프로비저닝 지침*을 따라, `main.tf` 파일에 `polygon-technology-edge` 모듈을 추가합니다.
* `terraform init` 명령어를 실행하여 필요한 Terraform 종속 항목을 모두 설치합니다.
* [AWS Certificate Manager](https://aws.amazon.com/certificate-manager/)에 새로운 인증서를 제공합니다.
* 제공된 인증서가 **발급 완료** 상태임을 확인하고 인증서의 **ARN**을 기록합니다.
* CLI에서 모듈 출력을 가져오려면 출력 문을 설정합니다.

#### `main.tf` 예시 {#example}
```terraform
module "polygon-edge" {
  source  = "aws-ia/polygon-technology-edge/aws"
  version = ">=0.0.1"

  premine             = var.premine
  alb_ssl_certificate = var.alb_ssl_certificate
}

output "json_rpc_dns_name" {
  value       = module.polygon-edge.jsonrpc_dns_name
  description = "The dns name for the JSON-RPC API"
}

variable "premine" {
  type        = string
  description = "Public account that will receive premined native currency"
}

variable "alb_ssl_certificate" {
  type        = string
  description = "The ARN of SSL certificate that will be placed on JSON-RPC ALB"
}
```

#### `terraform.tfvars` 예시 {#example-1}
```terraform
premine             = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
alb_ssl_certificate = "arn:aws:acm:us-west-2:123456789:certificate/64c7f117-61f5-435e-878b-83186676a8af"
```

### 배포 단계 {#deployment-steps}
* `terraform.tfvars` 파일을 생성합니다.
* 필요한 Terraform 변수를 이 파일에 설정합니다(위에서 설명함).
:::info

이 배포를 완전히 사용자 정의할 수 있는 다른 비필수 변수가 있습니다.
`terraform.tfvars` 파일에 자체 값을 입력하여 기본 값을 재정의할 수 있습니다.

사용 가능한 모든 변수의 사양은 모듈의 Terraform ***[레지스트리](https://registry.terraform.io/modules/aws-ia/polygon-technology-edge/aws)***에서 확인할 수 있습니다.

:::
* `aws s3 ls`를 실행하여 AWS CLI 인증을 올바르게 설정했는지 확인하세요. 오류가 없어야 합니다.
* `terraform apply` 인프라를 배포합니다.

### 배포 후 단계 {#post-deployment-steps}
* 배포가 끝나면 CLI에 출력된 `json_rpc_dns_name` 변수 값을 기록합니다.
* 도메인 이름이 제공된 `json_rpc_dns_name` 값을 가리키는 공개 DNS CNAME 레코드를 생성합니다. 예시:
  ```shell
  # BIND syntax
  # NAME                            TTL       CLASS   TYPE      CANONICAL NAME
  rpc.my-awsome-blockchain.com.               IN      CNAME     jrpc-202208123456879-123456789.us-west-2.elb.amazonaws.com.
  ```
* CNAME 레코드가 전파되면 JSON-PRC 엔드포인트를 호출하여 체인이 제대로 작동하는지 확인합니다.   
위의 예시에서:
  ```shell
    curl  https://rpc.my-awsome-blockchain.com -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
  ```

## 폐기 절차 {#destroy-procedure}
:::warning

다음 절차를 따르면 Terraform 스크립트를 이용해 배포한 전체 인프라가 영구적으로 삭제됩니다.    
적절한 [블록체인 데이터 백업](docs/edge/working-with-node/backup-restore)이 있어야 하며, 테스트 환경에서 작업해야 합니다.

:::

전체 인프라를 삭제해야 하는 경우 `terraform destroy` 명령어를 실행하세요.   
또한 배포가 이루어진 지역에 대해 AWS [Parameter Store](https://aws.amazon.com/systems-manager/features/)에 저장되어 있는 보안 비밀을 수동으로 삭제해야 합니다.

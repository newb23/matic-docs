---
id: validator-hosting
title: 검사기 호스팅
description: "Polygon 엣지의 호스팅 요구사항"
keywords:
- docs
- polygon
- edge
- hosting
- cloud
- setup
- validator
---

Polygon 엣지 네트워크에서 검사기 노드를 적절하게 호스팅하기 위한 제안 사항을 알려드립니다. 아래 나열된 모든 항목에 유의하여 검사기가 안전하고 안정적으로 성능을 발휘하도록 설정되었는지 확인하세요.

## Knowledge Base {#knowledge-base}

검사기 노드를 실행하기 전에 이 문서를 자세히 읽으시기 바랍니다.    아래 문서도 유용할 수 있습니다.

- [설치](get-started/installation)
- [클라우드 설정](get-started/set-up-ibft-on-the-cloud)
- [CLI 명령어](get-started/cli-commands)
- [서버 구성 파일](configuration/sample-config)
- [비공개 키](configuration/manage-private-keys)
- [Prometheus 측정항목](configuration/prometheus-metrics)
- [보안 비밀 관리자](/docs/category/secret-managers)
- [백업/복원](working-with-node/backup-restore)

## 최소 시스템 요구사항 {#minimum-system-requirements}

| 유형 | 값 | 영향을 미치는 요소 |
|------|------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|
| CPU | 코어 2개 | <ul><li>JSON-RPC 쿼리 수</li><li>블록체인 상태의 크기</li><li>블록 가스 한도</li><li>블록 시간</li></ul> |
| RAM | 2GB | <ul><li>JSON-RPC 쿼리 수</li><li>블록체인 상태의 크기</li><li>블록 가스 한도</li></ul> |
| 디스크 | <ul><li>10GB 루트 파티션</li><li>30GB 루트 파티션과 디스크 확장을 위한 LVM</li></ul> | <ul><li>블록체인 상태의 크기</li></ul> |


## 서비스 구성 {#service-configuration}

`polygon-edge` 바이너리는 설정된 네트워크 연결에서 시스템 서비스로 자동 실행되어야 하며 시작/중지/재시작 기능이 있어야 합니다. `systemd.`와 같은 서비스 관리자 사용을 권장합니다.

예시 `systemd` 시스템 구성 파일:
```
[Unit]
Description=Polygon Edge Server
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=10
User=ubuntu
ExecStart=/usr/local/bin/polygon-edge server --config /home/ubuntu/polygon/config.yaml

[Install]
WantedBy=multi-user.target
```

### 바이너리 {#binary}

프로덕션 워크로드의 경우, `polygon-edge` 바이너리는 수동 컴파일이 아닌 사전 빌드된 GitHub 릴리스 바이너리에서 배포해야 합니다.
:::info

`develop` GitHub 분기를 수동으로 컴파일하면, 환경에 호환성을 손상하는 변경 사항이 발생할 수 있습니다.   
따라서 호환성을 손상하는 변경 사항 및 해결 방법에 관한 정보가 포함된 릴리스를 통해서만 Polygon 엣지 바이너리를 배포하는 것을 권장합니다.

:::

설치 방법에 대한 전체 개요는 [설치](/docs/edge/get-started/installation)를 참조하세요.

### 데이터 스토리지 {#data-storage}

전체 블록체인 상태를 포함하는 `data/` 폴더는 자동 디스크 백업, 볼륨 확장이 가능하고 필요에 따라 장애 발생 시 해당 디스크/볼륨을 다른 인스턴스에 마운팅할 수 있도록 전용 디스크 / 볼륨에 마운트되어야 합니다.


### 로그 파일 {#log-files}

로그 파일은 (`logrotate` 같은 도구를 통해) 매일 로테이션 처리되어야 합니다.
:::warning

로그 로테이션 없이 구성되는 경우, 로그 파일은 모든 가용 디스크 공간을 차지하여 검사기 가동 시간에 지장을 줄 수 있습니다.

:::

예시 `logrotate` 구성:
```
/home/ubuntu/polygon/logs/node.log
{
        rotate 7
        daily
        missingok
        notifempty
        compress
        prerotate
                /usr/bin/systemctl stop polygon-edge.service
        endscript
        postrotate
                /usr/bin/systemctl start polygon-edge.service
        endscript
}
```


로그 스토리지에 대한 권장 사항은 아래 [로깅](#logging) 섹션을 참조하시기 바랍니다.

### 추가 종속 항목 {#additional-dependencies}

`polygon-edge`는 정적으로 컴파일되어 추가적인 호스트 OS 종속 항목이 필요하지 않습니다.

## 유지 보수 {#maintenance}

다음은 Polygon 엣지 네트워크에서 실행 중인 검사기 노드의 유지 보수 모범 사례입니다.

### 백업 {#backup}

Polygon 엣지 노드에 권장되는 두 가지 백업 절차가 있습니다.

가능한 한 항상 두 가지 모두 사용하고, Polygon 엣지 백업은 상시 사용 가능하도록 하는 옵션을 권장합니다.

* ***볼륨 백업***:     Polygon 엣지 노드의 `data/` 볼륨, 또는 가능한 경우 전체 VM을 일일 증분 백업합니다.


* ***Polygon 엣지 백업***:    
Polygon 엣지의 정기적인 백업을 수행하고 `.dat` 파일을 외부 위치 또는 안전한 클라우드 객체 스토리지로 이동하는 일일 크론 작업을 권장합니다.

Polygon 엣지 백업은 위에서 설명한 볼륨 백업과 겹치지 않는 것이 이상적입니다.

Polygon 엣지 백업 방법에 관한 지침은 [노드 인스턴스 백업/복원](working-with-node/backup-restore)을 참조하시기 바랍니다.

### 로깅 {#logging}

Polygon 엣지 노드에서 출력된 로그는 다음과 같아야 합니다.
- 색인 지정 및 검색 기능이 있는 외부 데이터 스토리지로 전송됩니다.
- 30일의 로그 보존 기간이 있습니다.

Polygon 엣지 검사기를 처음 설정하는 경우, 발생할 수 있는 문제를 신속하게 디버그할 수 있도록 `--log-level=DEBUG` 옵션으로 노드를 시작할 것을 권장합니다.

:::info

`--log-level=DEBUG`를 사용하면 노드 로그를 최대한 자세히 출력할 수 있습니다.   
디버그 로그는 로그 로테이션 솔루션을 설정할 때 고려해야 하는 로그 파일의 크기를 크게 증가시킵니다.

:::
### OS 보안 패치 {#os-security-patches}

관리자는 검사기 인스턴스 OS가 최신 패치를 통해 매달 1회 이상 업데이트되도록 해야 합니다.

## 측정항목 {#metrics}

### 시스템 측정항목 {#system-metrics}

관리자는 시스템 측정항목 모니터링(예: Telegraf + InfluxDB + Grafana 또는 타사 SaaS)을 설정해야 합니다.

모니터링 및 알림 설정이 필요한 측정항목

| 측정항목 이름 | 알림 임계값 |
|-----------------------|-------------------------------|
| CPU 사용량(%) | 5분 이상 90% 초과 |
| RAM 사용률(%) | 5분 이상 90% 초과 |
| 루트 디스크 사용률 | 90% 초과 |
| 데이터 디스크 사용률 | 90% 초과 |

### 검사기 측정항목 {#validator-metrics}

관리자는 블록체인 성능을 모니터링할 수 있도록 Polygon 엣지의 Prometheus API의 측정항목 모음을 설정해야 합니다.

노출되는 측정항목과 Prometheus 측정항목 모음 설정 방법을 이해하려면 [Prometheus 측정항목](configuration/prometheus-metrics)을 참조하시기 바랍니다.


다음 측정항목에 특히 유의해야 합니다.
- ***블록 생성 시간*** - 블록 생성 시간이 평소보다 길면 네트워크에 잠재적인 문제가 있는 것입니다
- ***합의 라운드 수*** - 라운드가 2회 이상인 경우, 네트워크에 설정된 검사기에 잠재적인 문제가 있는 것입니다
- 피어 ***수*** - 피어 수가 감소하면 네트워크에 연결 문제가 있는 것입니다

## 보안 {#security}

다음은 Polygon 엣지 네트워크에서 실행 중인 검사기 노드를 보호하는 모범 사례입니다.

### API 서비스 {#api-services}

- ***JSON-RPC*** -
(부하 분산기를 통해 또는 직접) 일반에 공개되어야 하는 API 서비스만 해당합니다.    이 API는 모든 인터페이스나 특정 IP 주소(예: `--json-rpc 0.0.0.0:8545`또는 `--json-prc 192.168.1.1:8545`)에서 실행되어야 합니다.
:::info

일반에 공개되는 API이므로, 부하 분산기/역방향 프록시를 앞에 두어 보안 및 속도 제한을 제공하는 것이 좋습니다.

:::


- ***LibP2P*** -
피어 통신을 위해 노드에서 사용하는 네트워킹 API로서, 모든 인터페이스나 특정 IP 주소 (`--libp2p 0.0.0.0:1478` 또는 `--libp2p 192.168.1.1:1478`)에서 실행되어야 합니다. 이 API는 공개적으로 노출하면 안 되지만, 다른 모든 노드를 통해 도달할 수 있습니다.
:::info

Localhost(`--libp2p 127.0.0.1:1478`)에서 실행되는 경우에는 다른 노드가 연결할 수 없습니다.

:::


- ***GRPC*** -
이 API는 연산자 명령어를 실행하고 기타 사항을 언급하기 위해서만 사용됩니다. 따라서 localhost(`--grpc-address 127.0.0.1:9632`)에서만 실행되어야 합니다.

### Polygon 엣지 보안 비밀 {#polygon-edge-secrets}

Polygon 엣지 보안 비밀(`ibft` 및 `libp2p` 키)는 로컬 파일 시스템에 저장하면 안 됩니다.  
대신, 지원되는 [비밀 관리자](configuration/secret-managers/set-up-aws-ssm)를 사용해야 합니다.   
로컬 파일 시스템에 보안 비밀을 저장하는 것은 비프로덕션 환경에서만 사용해야 합니다.

## 업데이트 {#update}

아래에서는 검사기 노드 업데이트 기본 절차를 단계별 지침으로 설명합니다.

### 업데이트 절차 {#update-procedure}

- 공식 GitHub [릴리스](https://github.com/0xPolygon/polygon-edge/releases)에서 최신 Polygon 엣지 바이너리를 다운로드합니다.
- Polygon 엣지 서비스(예: `sudo systemctl stop polygon-edge.service`)를 중지합니다.
- 기존 `polygon-edge` 바이너리를 다운로드한 바이너리(예: `sudo mv polygon-edge /usr/local/bin/`)로 교체합니다.
- `polygon-edge version`을 실행하여 올바른 `polygon-edge` 버전인지 확인합니다. 릴리스 버전과 일치해야 합니다.
- `polygon-edge` 서비스 시작 전에 수행해야 할 이전 버전과의 호환성 단계가 있는지 릴리스 문서를 확인하세요.
- `polygon-edge` 서비스(예: `sudo systemctl start polygon-edge.service`)를 시작합니다.
- 마지막으로 `polygon-edge` 로그 출력을 확인하고 모든 것이 `[ERROR]` 로그 없이 실행되고 있는지 확인합니다.

:::warning

호환성을 손상하는 릴리스가 있는 경우, 현재 실행 중인 바이너리가 새 릴리스와 호환되지 않으므로 이 업데이트 절차를 모든 노드에서 수행해야 합니다.

이는 짧은 시간 동안(즉, `polygon-edge` 바이너리가 교체되고 서비스가 재시작될 때까지) 체인이 중단되어야 함을 의미하므로, 사전에 계획하시기 바랍니다.

**[Ansible](https://www.ansible.com/)** 또는 일부 사용자 정의 스크립트와 같은 도구를 사용하여 업데이트를 효율적으로 수행하고 체인 가동 중지 시간을 최소화할 수 있습니다.

:::

## 시작 절차 {#startup-procedure}

아래에서는 Polygon 엣지 검사기의 시작 절차 기본 흐름을 설명합니다.

- [Knowledge Base](#knowledge-base) 섹션에 나열된 문서를 모두 읽으시기 바랍니다.
- 검사기 노드에 최신 OS 패치를 적용합니다.
- 공식 GitHub [릴리스](https://github.com/0xPolygon/polygon-edge/releases)에서 최신 `polygon-edge` 바이너리를 다운로드하여 로컬 인스턴스 `PATH`에 배치합니다.
- 지원되는 [비밀 관리자](/docs/category/secret-managers) 중 하나를 `polygon-edge secrets generate` CLI 명령어를 사용하여 초기화합니다.
- `polygon-edge secrets init`[CLI 명령어](/docs/edge/get-started/cli-commands#secrets-init-flags)를 사용하여 보안 비밀을 생성하고 저장합니다.
- `NodeID` 및 `Public key (address)` 값을 기록합니다.
- `polygon-edge genesis`[CLI 명령어](/docs/edge/get-started/cli-commands#genesis-flags)를 사용하여 [클라우드 설정](get-started/set-up-ibft-on-the-cloud#step-3-generate-the-genesis-file-with-the-4-nodes-as-validators)에서 설명하는 대로 `genesis.json` 파일을 생성합니다.
- `polygon-edge server export`[CLI 명령어](/docs/edge/configuration/sample-config)를 사용하여 기본 구성 파일을 생성합니다.
- 로컬 검사기 노드 환경(파일 경로 등)을 수용하도록 `default-config.yaml` 파일을 편집합니다.
- `polygon-edge` 바이너리가 `default-config.yaml` 파일에서 서버를 실행하는 Polygon 엣지 서비스(`systemd`또는 이와 유사한 것)를 생성합니다.
- 해당 서비스(예: `systemctl start polygon-edge`)를 시작하여 Polygon 엣지 서버를 시작합니다.
- `polygon-edge` 로그 출력을 확인하고, 블록이 생성되고 있는지 그리고 `[ERROR]` 로그가 없는지 확인합니다.
- [`eth_chainId`](/docs/edge/api/json-rpc-eth#eth_chainid) 같은 JSON-RPC 메서드를 호출하여 체인 기능을 확인합니다.

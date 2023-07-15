---
id: backup-restore
title: 노드 인스턴스 백업/복원
description: "Polygon 엣지 노드 인스턴스를 백업하고 복원하는 방법."
keywords:
  - docs
  - polygon
  - edge
  - instance
  - restore
  - directory
  - node
---

## 개요 {#overview}

이 가이드에서는 Polygon 엣지 노드 인스턴스를 백업하고 복원하는 방법에 관해 자세히 설명합니다.
기본 폴더 및 기본 폴더에 포함된 항목, 성공적인 백업 및 복원에 중요한 파일을 다룹니다.

## 기본 폴더 {#base-folders}

Polygon 엣지는 LevelDB를 스토리지 엔진으로 활용합니다.
Polygon 엣지 노드를 시작하면, 지정된 작업 디렉터리에 다음 하위 폴더들이 생성됩니다.
* **blockchain** - 블록체인 데이터 저장
* **trie** - Merkle 트리 저장(월드 상태 데이터)
* **keystore** - 클라이언트의 비공개 키 저장. 여기에는 libp2p 비공개 키 및 봉인/검사기 비공개 키가 포함됩니다.
* **consensus** - 작업 중 클라이언트가 필요로 할 수 있는 합의 정보 저장. 지금은 노드의 *비공개 검사기 키*를 저장합니다.

Polygon 엣지 인스턴스의 원활한 실행을 위해 이 폴더들을 보존하는 것이 중요합니다.

## 실행 중인 노드에서 백업을 생성하고 새 노드에 복원하기 {#create-backup-from-a-running-node-and-restore-for-new-node}

이 섹션에서는 실행 중인 노드에서 블록체인의 보관 데이터를 생성하고 다른 인스턴스에서 이를 복원하는 방법을 설명합니다.

### 백업 {#backup}

`backup` 명령어는 gRPC로 실행 중인 노드에서 블록을 가져오고 보관 파일을 생성합니다. 명령어에 `--from`과 `--to`가 지정되지 않는 경우, 이 명령어는 제네시스부터 최근 노드까지의 블록을 가져옵니다.

```bash
$ polygon-edge backup --grpc-address 127.0.0.1:9632 --out backup.dat [--from 0x0] [--to 0x100]
```

### 복원 {#restore}

`--restore` 플래그로 시작할 때 서버는 아카이브에서 블록을 가져옵니다. 새 노드의 키가 있는지 확인하세요. 키 가져오기 또는 키 생성에 관해 자세히 알아보려면, [Secret Managers 섹션](/docs/edge/configuration/secret-managers/set-up-aws-ssm)을 확인하세요.

```bash
$ polygon-edge server --restore archive.dat
```

## 전체 데이터 백업/복원 {#back-up-restore-whole-data}

이 섹션에서는 상태 데이터 및 키를 포함한 데이터를 백업하고 새 인스턴스로 복원하는 과정을 설명합니다.

### 1단계: 실행 중인 클라이언트 중지 {#step-1-stop-the-running-client}

Polygon 엣지는 데이터 스토리지로 **LevelDB**를 사용하므로 백업이 진행되는 동안 해당 노드를 중지시켜야 합니다. **LevelDB**가 데이터베이스 파일에 대한 동시 액세스를 허용하지 않기 때문입니다.

또한 Polygon 엣지를 닫을 때 데이터 플러시도 진행됩니다.

첫 단계에서는 (서비스 관리자를 통하거나 SIGINT 신호를 프로세스에 보내는 다른 메커니즘을 통해) 실행 중인 클라이언트를 중지하며, 그 결과 정상적으로 종료되는 동안 2개의 이벤트를 트리거할 수 있습니다.
* 디스크로 데이터 플러시 실행하기
* LevelDB에 의한 DB 파일 잠금 해제

### 2단계: 디렉터리 백업 {#step-2-backup-the-directory}

이제 클라이언트가 실행 중이 아니므로 데이터 디렉터리를 다른 매체에 백업할 수 있습니다.
확장자가 `.key`인 파일에는 현재 노드를 대리하는 데 사용할 수 있는 비공개 키 데이터가 포함되어 있습니다. 이를 제3자나 알려지지 않은 당사자와 절대로 공유해서는 안 됩니다.

:::info

생성된 `genesis` 파일을 수동으로 백업하고 복원하세요. 그래야 복원된 노드가 완전하게 작동할 수 있습니다.

:::

## 복원 {#restore-1}

### 1단계: 실행 중인 클라이언트 중지 {#step-1-stop-the-running-client-1}

Polygon 엣지의 인스턴스가 실행 중인 경우, 인스턴스를 중지해야 2단계를 성공적으로 완료할 수 있습니다.

### 2단계: 백업된 데이터 디렉터리를 원하는 폴더에 복사하기 {#step-2-copy-the-backed-up-data-directory-to-the-desired-folder}

일단 클라이언트가 실행 중이 아니면, 이전에 백업한 데이터 디렉터리를 원하는 폴더로 복사할 수 있습니다.
그리고, 이전에 복사한 `genesis` 파일을 복원합니다.

### 3단계: 올바른 데이터 디렉터리를 지정하면서 Polygon 엣지 클라이언트 실행하기 {#step-3-run-the-polygon-edge-client-while-specifying-the-correct-data-directory}

Polygon 엣지가 복원된 데이터 디렉터리를 사용하려면 시작 시 사용자가 데이터 디렉터리 경로를 지정해야 합니다. `data-dir` 플래그에 관한 정보는 [CLI 명령어](/docs/edge/get-started/cli-commands) 섹션을 참조하시기 바랍니다.

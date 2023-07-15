---
id: set-up-ibft-locally
title: 로컬 설정
description: "단계별 로컬 설정 가이드."
keywords:
  - docs
  - polygon
  - edge
  - local
  - setup
  - genesis
---

:::caution 테스트용 가이드입니다

아래 가이드는 테스트 및 개발 목적으로 로컬 머신에 Polygon 엣지 네트워크를 설정하는 방법에 대해 안내합니다.

이 절차는 실제 사용 시나리오에 Polygon 엣지 네트워크를 설정하는 클라우드 공급자: **[클라우드 설치](/docs/edge/get-started/set-up-ibft-on-the-cloud)**

:::


## 요구사항 {#requirements}

Polygon 엣지를 설치하려면 [설치](/docs/edge/get-started/installation)를 참조하세요.

## 개요 {#overview}

![로컬 설정](/img/edge/ibft-setup/local.svg)

본 가이드에서 우리의 목표는 [IBFT 합의 프로토콜](https://github.com/ethereum/EIPs/issues/650)과 함께 작동하는 `polygon-edge` 블록체인 네트워크를 설정하는 것입니다.
블록체인 네트워크는 4개의 노드로 구성되고 모든 노드가 검사기 노드이므로, 블록 제안과 다른 제안자의 블록 검증에 모두 적합합니다.
본 가이드의 목적은 최소한의 시간 내에 완전하게 작동하는 IBFT 클러스터를 제공하는 것이므로 4개 노드가 모두 같은 머신에서 실행됩니다.

이를 위해 간단한 4가지 단계를 안내합니다.

1. 데이터 디렉터리를 초기화하면 4개 노드에 각각 검사기 키가 모두 생성되고 빈 블록체인 데이터 디렉터리가 초기화됩니다. 검사기 키는 초기 검사기 세트로 제네시스 블록을 부트스트랩할 때 사용해야 하므로 중요합니다.
2. 부트노드의 연결 문자열을 준비하는 것은 처음 시작할 때 연결할 모든 노드에 실행할 중요한 정보가 됩니다.
3. `genesis.json` 파일을 생성하려면 제네시스 블록 네트워크의 초기 검사기를 설정하는 데 사용되는 **1단계**에서 생성된 검사기 키와 **2단계**의 부트노드 연결 문자열이 모두 입력되어야 합니다.
4. 모든 노드를 실행하는 것이 본 가이드의 최종 목표이며 마지막 단계가 될 것이므로, 노드에 사용할 데이터 디렉터리와 초기 네트워크 상태를 부트스트랩하는 `genesis.json`의 위치를 알려드립니다.

4개 노드가 모두 로컬 호스트에서 실행되므로 설정 프로세스 중 각 노드의 모든 데이터 디렉터리가 같은 상위 디렉터리에 있어야 합니다.

:::info 검사기 수

클러스터의 노드 수에는 최솟값이 없어, 검사기 노드가 1개뿐인 클러스터가 있을 수 있습니다.
_단일_ 노드 클러스터에는 **비정상 종료 내결함성**과 **BFT 보장**이 없다는 없다는 점에 유의하세요.

BFT 보장을 받기 위한 최소 권장 노드 수는 4개입니다. 노드가 4개인 클러스터에서는 나머지 3개 노드가 정상 작동하기에 노드 1개의 장애는 허용될 수 있기 때문입니다.

:::

## 1단계: IBF용 데이터 폴더 초기화 및 검사기 키 생성 {#step-1-initialize-data-folders-for-ibft-and-generate-validator-keys}

IBFT를 통해 시작하고 실행하려면 각 노드에 하나씩 데이터 폴더를 초기화해야 합니다.

````bash
polygon-edge secrets init --data-dir test-chain-1
````

````bash
polygon-edge secrets init --data-dir test-chain-2
````

````bash
polygon-edge secrets init --data-dir test-chain-3
````

````bash
polygon-edge secrets init --data-dir test-chain-4
````

각 명령어는 검사기 키, BLS 공개 키, [노드 ID](https://docs.libp2p.io/concepts/peer-id/)를 출력합니다. 다음 단계에 첫 번째 노드의 노드 ID가 필요합니다.

### 비밀 퍼팅 {#outputting-secrets}
필요한 경우 비밀 출력이 다시 검색 될 수 있습니다.

```bash
polygon-edge secrets output --data-dir test-chain-4
```

## 2단계: 부트노드의 Multiaddr 연결 문자열 준비 {#step-2-prepare-the-multiaddr-connection-string-for-the-bootnode}

노드가 연결을 완료하려면, 네트워크의 나머지 모든 노드에 대한 정보를 얻기 위해 어떤 `bootnode` 서버를 연결해야 하는지 알아야 합니다. `bootnode`는 p2p 전문 용어로 `rendezvous` 서버라고도 합니다.

`bootnode`는 polygon-엣지 노드의 특별한 인스턴스가 아닙니다. 모든 polygon-엣지 노드는 `bootnode` 역할을 할 수 있지만, 모든 Polygon 엣지 노드는 네트워크의 나머지 모든 노드와 연결하는 방법에 관한 정보 제공을 위해 연결할 부트노드 세트를 지정해야 합니다.

부트노드를 지정할 연결 문자열을 생성하려면 다음 [Multiaddr 형식](https://docs.libp2p.io/concepts/addressing/)을 따라야 합니다.
```
/ip4/<ip_address>/tcp/<port>/p2p/<node_id>
```

본 가이드에서는 첫 번째 노드와 두 번째 노드를 다른 모든 노드의 부트노드로 취급합니다. 이 시나리오에서는 상호 연결된 부트노드를 통해 `node 1`이나 `node 2`에 연결된 노드가 서로 연결하는 방법에 대한 정보를 얻을 수 있습니다.

:::info 노드를 시작하려면 부트노드를 하나 이상 지정해야 합니다

네트워크의 다른 노드가 서로를 탐색할 수 있도록 **하나** 이상의 부트노드가 필요합니다. 부트노드는 많을수록 좋습니다. 서비스 중단 시 네트워크 복원력을 제공하기 때문입니다. 본 가이드에는 두 개의 노드가 나와 있지만, `genesis.json` 파일의 유효성에 영향을 주지 않고 즉석에서 변경할 수 있습니다.

:::

Localhost에서 실행 중이므로 `<ip_address>`는 `127.0.0.1`로 가정하는 것이 안전합니다.

`<port>`의 경우, 이후 이 포트에서 수신 대기하도록 `node 1`의 libp2p 서버를 구성할 것이므로 `10001`을 사용할 것입니다.

마지막으로, 이전에 실행한 `polygon-edge secrets init --data-dir test-chain-1` 명령어(`node1`의 키와 데이터 디렉터리 생성에 사용)의 출력에서 가져올 수 있는 `<node_id>`가 필요합니다.

조합을 마친 후 부트노드로 사용할 `node 1`에 대한 Multiaddr 연결 문자열은 다음과 같습니다(마지막에 있는 `<node_id>`만 달라야 함).
```
/ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW
```
마찬가지로, 아래와 같이 두 번째 부트노드의 Multiaddr를 구성합니다.
```
/ip4/127.0.0.1/tcp/20001/p2p/16Uiu2HAmS9Nq4QAaEiogE4ieJFUYsoH28magT7wSvJPpfUGBj3Hq
```

:::info IPS 대신 DNS 호스트 이름

Polygon 엣지에서는 노드 구성에 DNS 호스트 이름을 사용할 수 있습니다. 다양한 이유로 노드의 IP가 변경될 수 있어, 이는 클라우드 기반 배포에 매우 유용한 기능입니다.

DNS 호스트 이름을 사용하는 중 연결 문자열의 Multiaddr 형식은 다음과 같습니다.
`/dns4/sample.hostname.com/tcp/<port>/p2p/nodeid`

:::


## 3단계: 4개 노드가 검사기인 제네시스 파일 생성 {#step-3-generate-the-genesis-file-with-the-4-nodes-as-validators}

````bash
polygon-edge genesis --consensus ibft --ibft-validators-prefix-path test-chain- --bootnode /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW --bootnode /ip4/127.0.0.1/tcp/20001/p2p/16Uiu2HAmS9Nq4QAaEiogE4ieJFUYsoH28magT7wSvJPpfUGBj3Hq
````

다음 명령어가 수행하는 작업:

* `--ibft-validators-prefix-path`는 프리픽스 폴더 경로를 Polygon 엣지의 IBFT가 사용할 수 있는 지정된 경로로 설정합니다. 이 디렉터리는 검사기의 비공개 키가 보관되는 `consensus/` 폴더를 저장하는 데 사용됩니다. 부트스트랩 노드의 초기 목록인 제네시스 파일을 빌드하려면 검사기의 공개 키가 필요합니다.
이 플래그는 실제 시나리오에서 모든 노드의 데이터 디렉터리가 공개 키를 쉽게 읽을 수 있는 동일 파일 시스템에  있을 것으로 기대할 수 없으므로 localhost에서 네트워크를 설정할 때만 의미가 있습니다.
* `--bootnode` 세트는 노드가 서로를 찾을 수 있도록 부트노드의 주소를 설정합니다.
**2단계**에서 언급한 대로 `node 1`의 Multiaddr 문자열을 사용합니다.

이 명령어의 결과는 새 블록체인의 제네시스 블록이 포함된 `genesis.json` 파일로, 미리 정의된 유효성 검사자 세트 및 연결 설정을 위해 먼저 연결할 노드의 구성이 포함되어 있습니다.

:::info ECSA로 전환

BLS는 블록 헤더의 기본 유효성 검사 모드입니다. ECDSA 모드에서 체인이 실행되기를 원한다면 인수와 함께 `—ibft-validator-type`플래그를 사용할 수 `ecdsa`있습니다.

```
genesis --ibft-validator-type ecdsa
```
:::
:::info 계정 잔액 사전 채굴

'사전 채굴된' 잔액이 있는 일부 주소로 블록체인 네트워크를 구성해야 할 수 있습니다.

이를 위해 블록체인의 특정 잔액으로 초기화하려는 주소당 원하는 만큼 `--premine` 플래그를  전달하세요.

예를 들어, 제네시스 블록에서 주소 `0x3956E90e632AEbBF34DEB49b71c28A83Bc029862`를 지정해 1000ETH를 사전 채굴하려면 다음 인수를 제공해야 합니다.

```
--premine=0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000
```

**사전 채굴된 금액은 ETH가 아닌 WEI로 표시됩니다.**

:::

:::info 블록 가스 한도 설정

각 블록의 기본 가스 한도는 `5242880`입니다. 이 값은 제네시스 파일에 기록되지만, 증감해야 할 수 있습니다.

아래와 같이 플래그 `--block-gas-limit` 다음에 원하는 값을 입력하여 증감하면 됩니다.

```shell
--block-gas-limit 1000000000
```

:::

:::info 시스템 파일 설명자 한도 설정

일부 운영체제에서는 기본 파일 설명자 한도(열린 파일의 최대 수)가 매우 적습니다.
노드의 처리량이 많을 것으로 예상되면 OS 수준에서 이 한도를 늘리는 것을 고려할 수 있습니다.

Ubuntu 배포판의 경우 절차는 다음과 같습니다(Ubuntu/Debian 배포판을 사용하지 않는다면 OS의 공식 문서를 확인하세요).
- 현재 운영체제 한도(열린 파일) 확인
```shell title="ulimit -a"
ubuntu@ubuntu:~$ ulimit -a
core file size          (blocks, -c) 0
data seg size           (kbytes, -d) unlimited
scheduling priority             (-e) 0
file size               (blocks, -f) unlimited
pending signals                 (-i) 15391
max locked memory       (kbytes, -l) 65536
max memory size         (kbytes, -m) unlimited
open files                      (-n) 1024
pipe size            (512 bytes, -p) 8
POSIX message queues     (bytes, -q) 819200
real-time priority              (-r) 0
stack size              (kbytes, -s) 8192
cpu time               (seconds, -t) unlimited
max user processes              (-u) 15391
virtual memory          (kbytes, -v) unlimited
file locks                      (-x) unlimited
```

- 열린 파일 한도 늘리기
	- 로컬 - 현재 세션에만 영향을 미칩니다.
	```shell
	ulimit -u 65535
	```
	- 전역 또는 사용자별(/etc/security/limits.conf 파일 끝에 한도 추가)
	```shell
	sudo vi /etc/security/limits.conf  # we use vi, but you can use your favorite text editor
	```
	```shell title="/etc/security/limits.conf"
	# /etc/security/limits.conf
	#
	#Each line describes a limit for a user in the form:
	#
	#<domain>        <type>  <item>  <value>
	#
	#Where:
	#<domain> can be:
	#        - a user name
	#        - a group name, with @group syntax
	#        - the wildcard *, for default entry
	#        - the wildcard %, can be also used with %group syntax,
	#                 for maxlogin limit
	#        - NOTE: group and wildcard limits are not applied to root.
	#          To apply a limit to the root user, <domain> must be
	#          the literal username root.
	#
	#<type> can have the two values:
	#        - "soft" for enforcing the soft limits
	#        - "hard" for enforcing hard limits
	#
	#<item> can be one of the following:
	#        - core - limits the core file size (KB)
	#        - data - max data size (KB)
	#        - fsize - maximum filesize (KB)
	#        - memlock - max locked-in-memory address space (KB)
	#        - nofile - max number of open file descriptors
	#        - rss - max resident set size (KB)
	#        - stack - max stack size (KB)
	#        - cpu - max CPU time (MIN)
	#        - nproc - max number of processes
	#        - as - address space limit (KB)
	#        - maxlogins - max number of logins for this user

	#        - maxsyslogins - max number of logins on the system
	#        - priority - the priority to run user process with
	#        - locks - max number of file locks the user can hold
	#        - sigpending - max number of pending signals
	#        - msgqueue - max memory used by POSIX message queues (bytes)
	#        - nice - max nice priority allowed to raise to values: [-20, 19]
	#        - rtprio - max realtime priority
	#        - chroot - change root to directory (Debian-specific)
	#
	#<domain>      <type>  <item>         <value>
	#

	#*               soft    core            0
	#root            hard    core            100000
	#*               hard    rss             10000
	#@student        hard    nproc           20
	#@faculty        soft    nproc           20
	#@faculty        hard    nproc           50
	#ftp             hard    nproc           0
	#ftp             -       chroot          /ftp
	#@student        -       maxlogins       4

	*               soft    nofile          65535
	*               hard    nofile          65535

	# End of file
	```
필요한 경우 추가 매개변수를 수정하고 파일을 저장한 후 시스템을 다시 시작하세요.
다시 시작한 후 파일 설명자 한도를 다시 확인하세요.
limits.conf 파일에서 정의한 값으로 설정해야 합니다.
:::


## 4단계: 모든 클라이언트 실행 {#step-4-run-all-the-clients}

4개 노드로 구성된 Polygon 엣지 네트워크를 모두 같은 머신에서 실행하려고 하므로 포트 충돌이 발생하지 않게 주의해야 합니다. 따라서 노드의 각 서버의 수신 대기 포트를 결정할 때 다음 추론을 사용합니다.

- `node 1`의 gRPC 서버는 `10000`, `node 2`의 GRPC 서버는 `20000` 등.
- `node 1`의 libp2p 서버는 `10001`, `node 2`의 libp2p 서버는 `20001` 등.
- `node 1`의 JSON-RPC 서버는 `10002`, `node 2`의 JSON-RPC 서버는 `20002` 등.

**첫 번째** 클라이언트를 실행하려면(노드 1의 노드 ID와 함께 **2단계**에서 libp2p multiaddr의 일부로 사용된 포트 `10001`을 기록해 두세요)

````bash
polygon-edge server --data-dir ./test-chain-1 --chain genesis.json --grpc-address :10000 --libp2p :10001 --jsonrpc :10002 --seal
````

**두 번째** 클라이언트를 실행하려면,

````bash
polygon-edge server --data-dir ./test-chain-2 --chain genesis.json --grpc-address :20000 --libp2p :20001 --jsonrpc :20002 --seal
````

**세 번째** 클라이언트를 실행하려면,

````bash
polygon-edge server --data-dir ./test-chain-3 --chain genesis.json --grpc-address :30000 --libp2p :30001 --jsonrpc :30002 --seal
````

**네 번째** 클라이언트를 실행하려면,

````bash
polygon-edge server --data-dir ./test-chain-4 --chain genesis.json --grpc-address :40000 --libp2p :40001 --jsonrpc :40002 --seal
````

지금까지의 과정을 요약하겠습니다.

* 클라이언트 데이터의 디렉터리가 **./test-chain-\***으로 지정되었습니다
* GRPC 서버가 각 노드의 포트 **10000**, **20000**, **30000**, **40000**에서 시작되었습니다
* libp2p 서버가 각 노드의 포트 **10001**, **20001**, **30001**, **40001**에서 시작되었습니다
* JSON-RPC 서버가 각 노드의 포트 **10002**, **20002**, **30002**, **40002**에서 시작되었습니다
* *봉인* 플래그는 시작되고 있는 노드가 블록 봉인에 참여한다는 것을 의미합니다
* *체인* 플래그는 체인 구성에 사용할 제네시스 파일을 지정합니다

제네시스 파일의 구조는 [CLI 명령어](/docs/edge/get-started/cli-commands) 섹션에서 다룹니다.

이전 명령어를 실행한 후, 블록을 봉인하고 노드 장애에서 복구할 수 있는 4-노드 Polygon 엣지 네트워크를 설정했습니다.

:::info 구성 파일을 통해 클라이언트 시작

모든 구성 매개변수를 CLI 인수로 지정하는 대신, 다음 명령어를 실행하여 구성 파일을 통해 클라이언트를 시작할 수도 있습니다.

````bash
polygon-edge server --config <config_file_path>
````
예시:

````bash
polygon-edge server --config ./test/config-node1.json
````
현재 우리는 지원 `yaml`및 `json`기반 구성 파일을 지원하고 있습니다. 샘플 구성 파일이 **[여기에서](/docs/edge/configuration/sample-config)** 확인할 수 있습니다.

:::

:::info 비 유효성 검사자 노드 실행 단계

비 검사기는 항상 검사기 노드에서 수신한 최신 블록을 동기화합니다. 다음 명령어를 실행해 비 검사기 노드를 시작할 수 있습니다.

````bash
polygon-edge server --data-dir <directory_path> --chain <genesis_filename> --grpc-address <portNo> --libp2p <portNo> --jsonrpc <portNo>
````
예를 들어, 다음 명령어를 실행하여 **다섯 번째** 비 검사기 클라이언트를 추가할 수 있습니다.

````bash
polygon-edge server --data-dir ./test-chain --chain genesis.json --grpc-address :50000 --libp2p :50001 --jsonrpc :50002
````
:::

:::info 가격 제한 지정

수신 트랜잭션에 **가격 제한**을 설정해 Polygon 엣지 노드를 시작할 수 있습니다.

가격 제한 단위는 `wei`입니다.

가격 제한을 설정하면 현재 노드에서 처리되는 모든 트랜잭션의 가스 가격이 설정된 가격 제한보다 **높아야** 하며, 그렇지 않으면 블록에 포함되지 않습니다.

대다수의 노드가 특정 가격 제한을 준수하도록 하면 네트워크의 트랜잭션이 특정 가격 임계값보다  낮을 수 없다는 규칙이 적용됩니다.

가격 제한의 기본값은 `0`이며, 기본적으로는 적용되지 않는다는 의미입니다.

`--price-limit` 플래그 사용 예시:
````bash
polygon-edge server --price-limit 100000 ...
````

가격 제한은 **로컬이 아닌 트랜잭션에만 적용되므로**, 노드에 로컬로 추가된 트랜잭션에는 적용되지 않습니다.

:::

:::info 웹소켓 URL

기본적으로 Polygon 엣지를 실행할 때는 체인 위치를 기반으로 웹소켓 URL이 생성됩니다.
HTTPS 링크에 사용되는 URL 체계는 `wss://`, HTTP 링크의 경우 `ws://`입니다.

Localhost 웹소켓 URL은 다음과 같습니다.
````bash
ws://localhost:10002/ws
````
포트 번호는 노드를 위해 선택한 JSON-RPC 포트에 따라 결정됩니다.

Edgenet 웹소켓 URL은 다음과 같습니다.
````bash
wss://rpc-edgenet.polygon.technology/ws
````
:::



## 5단계: Polygon 엣지 네트워크와 상호작용 {#step-5-interact-with-the-polygon-edge-network}

이제 실행 중인 클라이언트를 1개 이상 설정했으니, 위에서 사전 채굴한 계정을 사용해 4개 노드 중 하나에 JSON-RPC URL을 지정해 블록체인과 상호작용할 수 있습니다.
- 노드 1: `http://localhost:10002`
- 노드 2: `http://localhost:20002`
- 노드 3: `http://localhost:30002`
- 노드 4: `http://localhost:40002`

[연산자 정보를 쿼리하는 방법](/docs/edge/working-with-node/query-operator-info) 가이드를 따라, 새로 빌드된 클러스터에 연산자 명령어를 실행하세요. (빌드한 클러스터의 노드별 GRPC 포트는 각각 `10000`/`20000`/`30000`/`40000`입니다.)

---
id: set-up-ibft-on-the-cloud
title: 클라우드 설정
description: "단계별 클라우드 설정 가이드."
keywords:
  - docs
  - polygon
  - edge
  - cloud
  - setup
  - genesis
---

:::info 메인넷 또는 테스트넷 설정을 위한 가이드입니다

아래 가이드에서는 테스트넷 또는 메인넷의 프로덕션 설정을 위해 클라우드 제공업체에서 Polygon 엣지 네트워크를 설정하는 방법을 설명합니다.

프로덕션용 설정에 앞서 `polygon-edge`를 신속하게 테스트하기 위해 Polygon 엣지 네트워크를 로컬로 설정하려면 다음을 참조하시기 바랍니다. **[로컬 설치](/docs/edge/get-started/set-up-ibft-locally)**
:::

## 요구사항 {#requirements}

Polygon 엣지를 설치하려면 [설치](/docs/edge/get-started/installation)를 참조하세요.

### VM 연결 설정 {#setting-up-the-vm-connectivity}

선택한 클라우드 제공업체에 따라 방화벽, 보안 그룹, 액세스 제어 목록을 사용하여 VM 간의 연결 및 규칙을 설정할 수 있습니다.

`polygon-edge`에서 다른 VM에 노출되어야 하는 유일한 부분은 libp2p 서버이므로, 기본 libp2p 포트 `1478`에서 VM 간의 모든 통신을 허용하는 것으로 충분합니다.

## 개요 {#overview}

![클라우드 설정](/img/edge/ibft-setup/cloud.svg)

본 가이드에서 우리의 목표는 [IBFT 합의 프로토콜](https://github.com/ethereum/EIPs/issues/650)과 함께 작동하는 `polygon-edge` 블록체인 네트워크를 설정하는 것입니다.
블록체인 네트워크는 4개의 노드로 구성되고 모든 노드가 검사기 노드이므로, 블록 제안과 다른 제안자의 블록 검증에 모두 적합합니다.
이 가이드의 목적은 신뢰 보증이 필요 없는 네트워크 설정을 위해 검사기 키를 비공개로 유지하면서 완전히 작동하는 Polygon 엣지 네트워크를 제공하는 것이므로, 4개의 노드 각각은 자체 VM에서 실행됩니다.

이를 위해 간단한 4가지 단계를 안내합니다.

0. 위의 **요구사항** 목록을 확인합니다.
1. 각 검사기의 비공개 키를 생성하고 데이터 디렉터리를 초기화합니다.
2. 공유 `genesis.json` 노드에 들어갈 부트노드의 연결 문자열을 준비합니다.
3. 로컬 머신에 `genesis.json`을 생성하고 각 노드로 전송합니다.
4. 모든 노드를 시작합니다.

:::info 검사기 수

클러스터의 노드 수에는 최솟값이 없어, 검사기 노드가 1개뿐인 클러스터가 있을 수 있습니다.
_단일_ 노드 클러스터에는 **비정상 종료 내결함성**과 **BFT 보장**이 없다는 없다는 점에 유의하세요.

BFT 보장을 받기 위한 최소 권장 노드 수는 4개입니다. 노드가 4개인 클러스터에서는 나머지 3개 노드가 정상 작동하기에 노드 1개의 장애는 허용될 수 있기 때문입니다.

:::

## 1단계: 데이터 폴더 초기화 및 검사기 키 생성 {#step-1-initialize-data-folders-and-generate-validator-keys}

Polygon 엣지를 시작하고 실행하려면 각 노드에서 데이터 폴더를 초기화해야 합니다.


````bash
node-1> polygon-edge secrets init --data-dir data-dir
````

````bash
node-2> polygon-edge secrets init --data-dir data-dir
````

````bash
node-3> polygon-edge secrets init --data-dir data-dir
````

````bash
node-4> polygon-edge secrets init --data-dir data-dir
````

각 명령어는 검사기 키, BLS 공개 키, [노드 ID](https://docs.libp2p.io/concepts/peer-id/)를 출력합니다. 다음 단계에 첫 번째 노드의 노드 ID가 필요합니다.

### 비밀 퍼팅 {#outputting-secrets}
필요한 경우 비밀 출력이 다시 검색 될 수 있습니다.

```bash
polygon-edge secrets output --data-dir test-chain-4
```

:::warning 데이터 디렉터리를 비밀로 유지하십시오!

위에서 생성된 데이터 디렉터리는 블록체인 상태를 유지하기 위해 디렉터리를 초기화하는 것 외에 검사기의 비공개 키도 생성합니다.
**이 키는 보안 비밀로 유지되어야 합니다. 만약 도용된다면 네트워크에서 검사기로 가장할 수 있기 때문입니다!**

:::

## 2단계: 부트노드의 Multiaddr 연결 문자열 준비 {#step-2-prepare-the-multiaddr-connection-string-for-the-bootnode}

노드가 연결을 완료하려면, 네트워크의 나머지 모든 노드에 관한 정보를 얻기 위해 어떤 `bootnode` 서버를 연결해야 하는지 알아야 합니다. `bootnode`는 p2p 전문 용어로 `rendezvous` 서버라고도 합니다.

`bootnode`는 Polygon 엣지 노드의 특별한 인스턴스가 아닙니다. 모든 Polygon 엣지 노드는 `bootnode` 역할을 할 수 있으며,
모든 Polygon 엣지 노드는 네트워크의 나머지 모든 노드와 연결하는 방법에 관한 정보 제공을 위해 연결할 부트노드 세트를 지정해야 합니다.

부트노드를 지정할 연결 문자열을 생성하려면 다음 [Multiaddr 형식](https://docs.libp2p.io/concepts/addressing/)을 따라야 합니다.
```
/ip4/<ip_address>/tcp/<port>/p2p/<node_id>
```

본 가이드에서는 첫 번째 노드와 두 번째 노드를 다른 모든 노드의 부트노드로 취급합니다. 이 시나리오에서는 상호 연결된 부트노드를 통해 `node 1`이나 `node 2`에 연결된 노드가 서로 연결하는 방법에 대한 정보를 얻을 수 있습니다.

:::info 노드를 시작하려면 부트노드를 하나 이상 지정해야 합니다

네트워크의 다른 노드가 서로를 탐색할 수 있도록 **하나** 이상의 부트노드가 필요합니다. 부트노드는 많을수록 좋습니다. 서비스 중단 시 네트워크 복원력을 제공하기 때문입니다. 본 가이드에는 두 개의 노드가 나와 있지만, `genesis.json` 파일의 유효성에 영향을 주지 않고 즉석에서 변경할 수 있습니다.

:::

Multiaddr 연결 문자열의 첫 번째 부분이 `<ip_address>`이므로 다른 노드가 연결할 수 있는 IP 주소를 입력해야 하며, 사용자 설정에 따라 `127.0.0.1`이 아닌 공개 또는 비공개 IP 주소를 입력할 수 있습니다.

`<port>`의 경우 기본 libp2p 포트인 `1478`을 사용합니다.

마지막으로, 이전에 실행한 `polygon-edge secrets init --data-dir data-dir` 명령어(`node 1`의 키와 데이터 디렉터리 생성에 사용)의 출력에서 가져올 수 있는 `<node_id>`가 필요합니다.

조합을 마친 후 부트노드로 사용할 `node 1`에 대한 Multiaddr 연결 문자열은 다음과 같습니다(마지막에 있는 `<node_id>`만 달라야 함).
```
/ip4/<public_or_private_ip>/tcp/1478/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW
```
마찬가지로, 아래와 같이 두 번째 부트노드의 Multiaddr를 구성합니다.
```
/ip4/<public_or_private_ip>/tcp/1478/p2p/16Uiu2HAmS9Nq4QAaEiogE4ieJFUYsoH28magT7wSvJPpfUGBj3Hq
```
:::info IPS 대신 DNS 호스트 이름

Polygon 엣지에서는 노드 구성에 DNS 호스트 이름을 사용할 수 있습니다. 다양한 이유로 노드의 IP가 변경될 수 있어, 이는 클라우드 기반 배포에 매우 유용한 기능입니다.

DNS 호스트 이름을 사용하는 중 연결 문자열의 Multiaddr 형식은 다음과 같습니다.
`/dns4/sample.hostname.com/tcp/<port>/p2p/nodeid`

:::

## 3단계: 4개 노드가 검사기인 제네시스 파일 생성 {#step-3-generate-the-genesis-file-with-the-4-nodes-as-validators}

이 단계는 로컬 머신에서 실행할 수 있지만, 4개의 검사기 각각에 대해 공개 검사기 키가 필요합니다.

아래에 표시된 바와 같이 검사기는 자체 `secrets init` 명령어에 대한 출력에서 `Public key (address)`를 안전하게 공유할 수 있으므로 최초 검사기 세트에서 공개 키로 식별되는 검사기들로 genesis.json을 안전하게 생성할 수 있습니다.

```
[SECRETS INIT]
Public key (address) = 0xC12bB5d97A35c6919aC77C709d55F6aa60436900
BLS Public key       = 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf
Node ID              = 16Uiu2HAmVZnsqvTwuzC9Jd4iycpdnHdyVZJZTpVC8QuRSKmZdUrf
```

검사기의 공개 키 4개를 모두 받았다면 다음 명령어를 실행하여 `genesis.json`을 생성할 수 있습니다.

````bash
polygon-edge genesis --consensus ibft --ibft-validator 0xC12bB5d97A35c6919aC77C709d55F6aa60436900:0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --ibft-validator <2nd validator IBFT public key>:<2nd validator BLS public key> --ibft-validator <3rd validator IBFT public key>:<3rd validator BLS public key> --ibft-validator <4th validator IBFT public key>:<4th validator BLS public key> --bootnode=<first_bootnode_multiaddr_connection_string_from_step_2> --bootnode <second_bootnode_multiaddr_connection_string_from_step_2> --bootnode <optionally_more_bootnodes>
````

다음 명령어가 수행하는 작업:

* `--ibft-validator`는 제네시스 블록에 설정된 최초 검사기 세트에 포함되어야 하는 검사기의 공개 키를 설정합니다. 여러 개의 최초 검사기가 있을 수 있습니다.
* `--bootnode` 세트는 노드가 서로를 찾을 수 있도록 부트노드의 주소를 설정합니다.
**2단계**에서 언급한 바와 같이, 우리는 `node 1`의 multiaddr 문자열을 사용할 것이지만, 위에 표시된 것처럼 원하는 만큼 부트노드를 추가할 수 있습니다.

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

먼저 다음 사항을 지정합니다.
1. 검사기 세트로 제네시스 블록에 포함될 검사기의 공개 키
2. 부트노드 multiaddr 연결 문자열
3. 제네시스 블록에 포함될 사전 채굴 계정 및 잔액

그런 다음 `genesis.json`을 생성하고, 이를 네트워크 내의 모든 VM에 복사해야 합니다. 설정에 따라, 복사하여 붙여 넣거나, 노드 연산자에 보내거나, 간단히 SCP/FTP로 보낼 수 있습니다.

제네시스 파일의 구조는 [CLI 명령어](/docs/edge/get-started/cli-commands) 섹션에서 다룹니다.

## 4단계: 모든 클라이언트 실행 {#step-4-run-all-the-clients}

:::note 클라우드 제공업체의 네트워킹

대부분의 클라우드 제공업체는 IP 주소(특히 공개 주소)를 VM의 직접적인 네트워크 인터페이스로 노출하지 않으며, 표시되지 않는 NAT 프록시를 설정합니다.


이 경우 노드들이 서로 연결될 수 있게 하려면, `0.0.0.0` IP 주소를 수신 대기하여 모든 인터페이스에서 바인딩해야 할 필요가 있지만, 다른 노드들이 인스턴스에 연결하기 위해 사용할 수 있는 IP 주소 또는 DNS 주소를 지정해야 합니다. 각각 외부 IP 또는 DNS 주소를 지정할 수 있는 `--nat` 또는 `--dns` 인수를 사용하면 됩니다.

#### 예시 {#example}

수신 대기하려는 관련 IP 주소는 `192.0.2.1`이지만, 네트워크 인터페이스에 직접 바인딩되지 않습니다.

노드가 연결되게 하려면 다음 매개변수를 전달해야 합니다.

`polygon-edge ... --libp2p 0.0.0.0:10001 --nat 192.0.2.1`

또는, DNS 주소 `dns/example.io`를 지정하려면 다음 매개변수를 전달하세요.

`polygon-edge ... --libp2p 0.0.0.0:10001 --dns dns/example.io`

이렇게 하면 노드가 모든 인터페이스에서 수신 대기하며, 지정된 `--nat` 또는 `--dns` 주소를 통해 클라이언트가 노드에 연결하고 있음을 인식하게 됩니다.

:::

**첫 번째** 클라이언트를 실행하려면,


````bash
node-1> polygon-edge server --data-dir ./data-dir --chain genesis.json  --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

**두 번째** 클라이언트를 실행하려면,

````bash
node-2> polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

**세 번째** 클라이언트를 실행하려면,

````bash
node-3> polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

**네 번째** 클라이언트를 실행하려면,

````bash
node-4> polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

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
현재 우리는 단지 지원 구성 파일만을 `json`사용하고 있습니다. 샘플 구성 파일이 **[여기에서](/docs/edge/configuration/sample-config)** 찾을 수 있습니다.

:::

:::info 비 검사기 노드 실행 단계

비 검사기는 항상 검사기 노드에서 수신한 최신 블록을 동기화합니다. 다음 명령어를 실행해 비 검사기 노드를 시작할 수 있습니다.

````bash
polygon-edge server --data-dir <directory_path> --chain <genesis_filename>  --libp2p <IPAddress:PortNo> --nat <public_or_private_ip>
````
예를 들어, 다음 명령어를 실행하여 **다섯 번째** 비 검사기 클라이언트를 추가할 수 있습니다.

````bash
polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat<public_or_private_ip>
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

EdgeNet 웹소켓 URL은 다음과 같습니다.
````bash
wss://rpc-edgenet.polygon.technology/ws
````
:::

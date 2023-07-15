---
id: cli-commands
title: CLI 명령어
description: "Polygon 엣지 명령어 및 명령어 플래그 목록."
keywords:
  - docs
  - polygon
  - edge
  - cli
  - commands
  - flags
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


이 섹션에서는 Polygon 엣지의 현재 명령어와 명령 플래그, 그 사용 방식에 대해 설명합니다.

:::tip JSON 출력 지원

일부 명령어에서 `--json` 플래그가 지원됩니다. 이 플래그는 명령어가 결과를 JSON 형식으로 출력하도록 지시합니다.

:::

## 시작 명령어 {#startup-commands}

| **명령어** | **설명** |
|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| server | 모든 모듈을 함께 부트스트랩하여 블록체인 클라이언트를 시작하는 기본 명령어입니다. |
| genesis | 클라이언트 시작 전에 사전 정의된 체인 상태를 설정하는 데 사용되는 *genesis.json* 파일을 생성합니다. 제네시스 파일 구조는 아래 설명으로 이루어집니다. |
| 제네시스 사전 배포 | 새로운 네트워크에 대한 스마트 계약을 미리 배포하기 |

### 서버 플래그 {#server-flags}


| **모든 서버 플래그** |
|---------------------------------------|---------------------------------------------|
| [data-dir](/docs/edge/get-started/cli-commands#data-dir) | [jsonrpc](/docs/edge/get-started/cli-commands#jsonrpc) |
| [json-rpc-block-range-limit](/docs/edge/get-started/cli-commands#json-rpc-block-range-limit) | [json-rpc-batch-request-limit](/docs/edge/get-started/cli-commands#json-rpc-batch-request-limit) |
| [grpc](/docs/edge/get-started/cli-commands#grpc) | [libp2p](/docs/edge/get-started/cli-commands#libp2p) |
| [프로메테우스](/docs/edge/get-started/cli-commands#prometheus) | [블록-gas-타겟](/docs/edge/get-started/cli-commands#block-gas-target) |
| [최대 쌍](/docs/edge/get-started/cli-commands#max-peers) | [최대-인바운드-쌍](/docs/edge/get-started/cli-commands#max-inbound-peers) |
| [최대-아웃바운드-쌍](/docs/edge/get-started/cli-commands#max-outbound-peers) | [최대-대기행렬](/docs/edge/get-started/cli-commands#max-enqueued) |
| [로그 레벨](/docs/edge/get-started/cli-commands#log-level) | [로그 투](/docs/edge/get-started/cli-commands#log-to) |
| [체인](/docs/edge/get-started/cli-commands#chain) | [가입](/docs/edge/get-started/cli-commands#join) |
| [nat](/docs/edge/get-started/cli-commands#nat) | [dns](/docs/edge/get-started/cli-commands#dns) |
| [가격 한도](/docs/edge/get-started/cli-commands#price-limit) | [최대 슬롯](/docs/edge/get-started/cli-commands#max-slots) |
| [구성](/docs/edge/get-started/cli-commands#config) | [기밀-구성](/docs/edge/get-started/cli-commands#secrets-config) |
| [개발자](/docs/edge/get-started/cli-commands#dev) | [개발자 구간](/docs/edge/get-started/cli-commands#dev-interval) |
| [찾지 못함](/docs/edge/get-started/cli-commands#no-discover) | [복원](/docs/edge/get-started/cli-commands#restore) |
| [블록-시간](/docs/edge/get-started/cli-commands#block-time) | [access-control-allow-origins](/docs/edge/get-started/cli-commands#access-control-allow-origins) |


#### <h4></h4><i>data-dir</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--data-dir DATA_DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    server --data-dir ./example-dir

</TabItem>
</Tabs>

Polygon 엣지 클라이언트 데이터를 저장할 때 사용되는 데이터 디렉터리를 지정하는 데 사용됩니다. 기본값은 `./test-chain`입니다.

---


#### <h4></h4><i>jsonrpc</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--jsonrpc JSONRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    server --jsonrpc 127.0.0.1:10000

</TabItem>
</Tabs>

SON-RPC 서비스의 주소와 포트를 설정합니다(`address:port`   ).
포트만 정의되면(`:10001`), 모든 인터페이스에 바인딩됩니다(`0.0.0.0:10001`   ).
생략하는 경우, 서비스는 기본값에 바인딩됩니다(`address:port`   ).
기본 주소는 `0.0.0.0:8545`입니다.

---

#### <h4></h4><i>json-rpc-block-range-limit</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--json-rpc-block-range-limit BLOCK_RANGE]

</TabItem>
  <TabItem value="example" label="Example">

    server --json-rpc-block-range-limit 1500

</TabItem>
</Tabs>

fromBlock 및 toBlock 값(예: eth_getLogs)을 포함하는 json-rpc 요청 실행 시 고려할 최대 블록 범위를 설정합니다. 기본값은 `1000`입니다.

---

#### <h4></h4><i>json-rpc-batch-request-limit</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--json-rpc-batch-request-limit MAX_LENGTH]

</TabItem>
  <TabItem value="example" label="Example">

    server --json-rpc-batch-request-limit 50

</TabItem>
</Tabs>

json-rpc 일괄 요청을 처리할 때 최대 길이를 설정합니다. 기본값은 `20`입니다.

---

#### <h4></h4><i>grpc</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    server --grpc-address 127.0.0.1:10001

</TabItem>
</Tabs>

gRPC 서비스의 주소와 포트를 설정합니다(`address:port`). 기본 주소는 `127.0.0.1:9632`입니다.

---

#### <h4></h4><i>libp2p</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--libp2p LIBP2P_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    server --libp2p 127.0.0.1:10002

</TabItem>
</Tabs>

libp2p 서비스의 주소와 포트를 설정합니다(`address:port`). 기본 주소는 `127.0.0.1:1478`입니다.

---

#### <h4></h4><i>prometheus</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--prometheus PROMETHEUS_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    server --prometheus 127.0.0.1:10004

</TabItem>
</Tabs>

Prometheus 서버의 주소와 포트를 설정합니다(`address:port`   ).
포트만 정의하면(`:5001`), 서비스는 모든 인터페이스에 바인딩됩니다(`0.0.0.0:5001`   ).
생략하는 경우, 서비스가 시작되지 않습니다.

---

#### <h4></h4><i>block-gas-target</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--block-gas-target BLOCK_GAS_TARGET]

</TabItem>
  <TabItem value="example" label="Example">

    server --block-gas-target 10000000

</TabItem>
</Tabs>

체인의 목표 블록 가스 한도를 설정합니다. 기본값은 `0`입니다(즉, 적용되지 않음).

블록 가스 목표에 대한 자세한 설명은 [TxPool의 섹션](/docs/edge/architecture/modules/txpool#block-gas-target)에서 확인할 수 있습니다.

---

#### <h4></h4><i>max-peers</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--max-peers PEER_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    server --max-peers 40

</TabItem>
</Tabs>

클라이언트의 최대 피어 수를 설정합니다. 기본값은 `40`입니다.

피어 한도는 `max-peers` 또는 `max-inbound/outbound-peers` 플래그를 사용하여 지정해야 합니다.

---

#### <h4></h4><i>max-inbound-peers</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--max-inbound-peers PEER_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    server --max-inbound-peers 32

</TabItem>
</Tabs>

클라이언트의 최대 인바운드 피어 수를 설정합니다. `max-peers`가 설정되면, 다음 공식에 따라 최대 인바운드 피어 한도가 계산됩니다.

`max-inbound-peer = InboundRatio * max-peers`, `InboundRatio`는 `0.8`

---

#### <h4></h4><i>max-outbound-peers</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--max-outbound-peers PEER_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    server --max-outbound-peers 8

</TabItem>
</Tabs>

클라이언트의 최대 아웃바운드 피어 수를 설정합니다. `max-peers`가 설정되면, 다음 공식에 따라 최대 아웃바운드 피어 수가 계산됩니다.

`max-outbound-peer = OutboundRatio * max-peers`, `OutboundRatio`는 `0.2`

---

#### <h4></h4><i>max-enqueued</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--max-enqueued ENQUEUED_TRANSACTIONS]

</TabItem>
  <TabItem value="example" label="Example">

    server --max-enqueued 210

</TabItem>
</Tabs>

계정별로 대기열에 추가된 트랜잭션 최대 수를 설정합니다. 기본값은 `128`입니다.

---

#### <h4></h4><i>log-level</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--log-level LOG_LEVEL]

</TabItem>
  <TabItem value="example" label="Example">

    server --log-level DEBUG

</TabItem>
</Tabs>

콘솔 출력의 로그 수준을 설정합니다. 기본값은 `INFO`입니다.

---

#### <h4></h4><i>log-to</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--log-to LOG_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    server --log-to node.log

</TabItem>
</Tabs>

서버 명령어의 모든 로그 출력을 포함하는 로그 파일 이름을 정의합니다.
기본적으로 모든 서버 로그는 콘솔(stdout)로 출력됩니다.
그러나 플래그가 설정된 경우, 서버 명령어를 실행하면 콘솔에 출력되지 않습니다.

---

#### <h4></h4><i>chain</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    server --chain /home/ubuntu/genesis.json

</TabItem>
</Tabs>

체인을 시작하는 데 사용할 제네시스 파일을 지정합니다. 기본값은 `./genesis.json`입니다.

---

#### <h4></h4><i>join</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--join JOIN_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    server --join /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

조인해야 할 피어의 주소를 지정합니다.

---

#### <h4></h4><i>nat</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--nat NAT_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    server --nat 192.0.2.1

</TabItem>
</Tabs>

포트 없이 외부 IP 주소를 설정합니다. 포트가 피어에 표시될 수 있기 때문입니다.

---

#### <h4></h4><i>dns</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--dns DNS_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    server --dns dns4/example.io

</TabItem>
</Tabs>

호스트 DNS 주소를 설정합니다. 외부 DNS를 광고하는 데 사용될 수 있습니다. `dns``dns4``dns6`지원

---

#### <h4></h4><i>가격 한도</i>


<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--price-limit PRICE_LIMIT]

</TabItem>
  <TabItem value="example" label="Example">

    server --price-limit 10000

</TabItem>
</Tabs>

풀 참여 승인에 적용할 최소 가스 가격 한도를 설정합니다. `1`디폴트:

---

#### <h4></h4><i>최대 슬롯</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--max-slots MAX_SLOTS]

</TabItem>
  <TabItem value="example" label="Example">

    server --max-slots 1024

</TabItem>
</Tabs>

풀의 최대 슬롯 수를 설정합니다. 기본값은 `4096`입니다.

---

#### <h4></h4><i>config</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--config CLI_CONFIG_PATH]

</TabItem>
  <TabItem value="example" label="Example">

    server --config ./myConfig.json

</TabItem>
</Tabs>

CLI 구성 경로를 지정합니다. `.json`을 지원합니다.

---

#### <h4></h4><i>secrets-config</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--secrets-config SECRETS_CONFIG]

</TabItem>
  <TabItem value="example" label="Example">

    server --secrets-config ./secretsManagerConfig.json

</TabItem>
</Tabs>

보안 비밀 관리자 구성 파일 경로를 설정합니다. Hashicorp Vault, AWS SSM, GCP Secrets Manager에 사용됩니다. 생략하는 경우, 로컬 FS 보안 비밀 관리자가 사용됩니다.

---

#### <h4></h4><i>dev</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--dev DEV_MODE]

</TabItem>
  <TabItem value="example" label="Example">

    server --dev

</TabItem>
</Tabs>

클라이언트를 개발 모드로 설정합니다. `false`기본값: dev 모드에서 동료 발견은 기본적으로 비활성화됩니다.

---

#### <h4></h4><i>dev-interval</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--dev-interval DEV_INTERVAL]

</TabItem>
  <TabItem value="example" label="Example">

    server --dev-interval 20

</TabItem>
</Tabs>

몇 초 안에 클라이언트의 개발 알림 간격을 설정합니다. 기본값은 `0`입니다.

---

#### <h4></h4><i>no-discover</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--no-discover NO_DISCOVER]

</TabItem>
  <TabItem value="example" label="Example">

    server --no-discover

</TabItem>
</Tabs>

클라이언트가 다른 피어를 탐색하지 못하도록 합니다. 기본값은 `false`입니다.

---

#### <h4></h4><i>restore</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--restore RESTORE]

</TabItem>
  <TabItem value="example" label="Example">

    server --restore backup.dat

</TabItem>
</Tabs>

특정 보관 파일에서 블록을 복원합니다.

---

#### <h4></h4><i>block-time</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--block-time BLOCK_TIME]

</TabItem>
  <TabItem value="example" label="Example">

    server --block-time 1000

</TabItem>
</Tabs>

몇 초 안에 블록 생성 시간을 설정합니다. 기본값은 `2`입니다.

---

#### <h4></h4><i>access-control-allow-origins</i>
<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--access-control-allow-origins ACCESS_CONTROL_ALLOW_ORIGINS]

</TabItem>
  <TabItem value="example" label="Example">

    server --access-control-allow-origins "https://edge-docs.polygon.technology"

</TabItem>
</Tabs>

JSON-RPC 요청의 응답을 공유할 수 있도록 승인된 도메인을 설정합니다.   
여러 개의 플래그 `--access-control-allow-origins "https://example1.com" --access-control-allow-origins "https://example2.com"`을 추가하여 여러 도메인을 승인할 수 있습니다.   
생략하는 경우, Access-Control-Allow-Origins 헤더는 `*`로 설정되고 모든 도메인이 승인됩니다.

---

### 제네시스 플래그 {#genesis-flags}
| **모든 genisic 플래그** |
|---------------------------------------|---------------------------------------------|
| [디렉토리](/docs/edge/get-started/cli-commands#dir) | [이름](/docs/edge/get-started/cli-commands#name) |
| [지분증명](/docs/edge/get-started/cli-commands#pos) | [에포크 ](/docs/edge/get-started/cli-commands#epoch-size)크기 |
| [premine](/docs/edge/get-started/cli-commands#premine) | [체인화된](/docs/edge/get-started/cli-commands#chainid) |
| [증명서 유효 검사기 유형](/docs/edge/get-started/cli-commands#ibft-validator-type) | [증명서 유효 검증 실행 경로](/docs/edge/get-started/cli-commands#ibft-validators-prefix-path) |
| [증명서 검증](/docs/edge/get-started/cli-commands#ibft-validator) | [블록 가스 제한](/docs/edge/get-started/cli-commands#block-gas-limit) |
| [consensus](/docs/edge/get-started/cli-commands#consensus) | [부트 ](/docs/edge/get-started/cli-commands#bootnode)노드 |
| [최대 유효 검증 개수](/docs/edge/get-started/cli-commands#max-validator-count) | [최소 검증 개](/docs/edge/get-started/cli-commands#min-validator-count)수 |


#### <h4></h4><i>dir</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--dir DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --dir ./genesis.json

</TabItem>
</Tabs>

Polygon 엣지 제네시스 데이터를 위한 디렉터리를 설정합니다. 기본값은 `./genesis.json`입니다.

---

#### <h4></h4><i>이름</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--name NAME]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --name test-chain

</TabItem>
</Tabs>

체인 이름을 설정합니다. 기본값은 `polygon-edge`입니다.

---

#### <h4></h4><i>pos</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--pos IS_POS]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --pos

</TabItem>
</Tabs>

클라이언트가 지분증명 IBFT를 사용해야 한다는 플래그를 설정합니다.
플래그가 제공되지 않거나 `false`인 경우, 권위증명이 기본값으로 설정됩니다.

---

#### <h4></h4><i>epoch-size</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--epoch-size EPOCH_SIZE]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --epoch-size 50

</TabItem>
</Tabs>

체인의 에포크 크기를 설정합니다. 기본값은 `100000`입니다.

---

#### <h4></h4><i>premine</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--premine ADDRESS:VALUE]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --premine 0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000

</TabItem>
</Tabs>

사전 채굴 계정과 잔액을 `address:amount` 형식으로 설정합니다.
값은 소수이거나 6진수입니다. 기본 사전 불확실한 균형에 : `0xD3C21BCECCEDA1000000`(100만 개의 네이티브 통화 토큰).

---

#### <h4></h4><i>chainid</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--chain-id CHAIN_ID]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --chain-id 200

</TabItem>
</Tabs>

체인 ID를 설정합니다. 기본값은 `100`입니다.

---

#### <h4></h4><i>ibft-validator-type</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--ibft-validator-type IBFT_VALIDATOR_TYPE]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --ibft-validator-type ecdsa

</TabItem>
</Tabs>

블록 헤더의 검증 모드를 지정합니다. 가능한 값은 `[ecdsa, bls]`입니다. 기본값은 `bls`입니다.

---

#### <h4></h4><i>ibft-validators-prefix-path</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--ibft-validators-prefix-path IBFT_VALIDATORS_PREFIX_PATH]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --ibft-validators-prefix-path test-chain-

</TabItem>
</Tabs>

검사기 폴더 디렉터리의 프리픽스 경로입니다. `ibft-validator` 플래그를 생략하는 경우 이 플래그가 있어야 합니다.

---

#### <h4></h4><i>ibft-validator</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--ibft-validator IBFT_VALIDATOR_LIST]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --ibft-validator 0xC12bB5d97A35c6919aC77C709d55F6aa60436900

</TabItem>
</Tabs>

전달된 주소를 IBFT 검사기로 설정합니다. `ibft-validators-prefix-path` 플래그를 생략하는 경우 이 플래그가 있어야 합니다.
1. 네트워크가 ECDSA와 함께 실행되는 경우 `--ibft-validator [ADDRESS]` 형식입니다.
2. 네트워크가 BLS와 함께 실행중인 경우 `--ibft-validator [ADDRESS]:[BLS_PUBLIC_KEY]` 형식입니다.

---

#### <h4></h4><i>block-gas-limit</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--block-gas-limit BLOCK_GAS_LIMIT]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --block-gas-limit 5000000

</TabItem>
</Tabs>

블록의 모든 작업에 사용할 최대 가스 금액을 가리킵니다. 기본값은 `5242880`입니다.

---

#### <h4></h4><i>consensus</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--consensus CONSENSUS_PROTOCOL]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --consensus ibft

</TabItem>
</Tabs>

합의 프로토콜을 설정합니다. 기본값은 `pow`입니다.

---

#### <h4></h4><i>bootnode</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--bootnode BOOTNODE_URL]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --bootnode /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

P2P 탐색 부트스트랩을 위한 Multiaddr URL입니다. 이 플래그는 여러 번 사용할 수 있습니다.
IP 주소 대신, 부트노드의 DNS 주소를 제공할 수 있습니다.

---

#### <h4></h4><i>max-validator-count</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--max-validator-count MAX_VALIDATOR_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --max-validator-count 42

</TabItem>
</Tabs>

PoS 합의에서 검사기 세트에 포함할 수 있는 최대 스테이커 수입니다.
MAX_SAFE_INTEGER(2^53 - 2) 값을 초과할 수 없습니다.

---

#### <h4></h4><i>min-validator-count</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--min-validator-count MIN_VALIDATOR_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --min-validator-count 4

</TabItem>
</Tabs>

PoS 합의에 설정된 검사기 세트에 포함해야 할 최소 스테이커 수입니다.
최대 검사기 수의 값을 초과할 수 없습니다.
디폴트 1.

---

### 제네시스 사전 배포 플래그 {#genesis-predeploy-flags}

<h4><i>아티팩트 패스</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis predeploy [--artifacts-path PATH_TO_ARTIFACTS]

</TabItem>
  <TabItem value="example" label="Example">

    genesis predeploy --artifacts-path ./ArtifactsData.json

</TabItem>
</Tabs>

`abi``bytecode`계약을 포함하는 계약 아티팩트 JSON에 경로를 설정합니다.`deployedBytecode`

---

<h4><i>chain</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis predeploy [--chain PATH_TO_GENESIS]

</TabItem>
  <TabItem value="example" label="Example">

    genesis predeploy --chain ./genesis.json

</TabItem>
</Tabs>

업데이트 될 `genesis.json`파일에 경로를 설정합니다. `./genesis.json`디폴트

---

<h4><i>Procercuster-Arg</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis predeploy [--constructor-args CONSTRUCTOR_ARGUMENT]

</TabItem>
  <TabItem value="example" label="Example">

    genesis predeploy --constructor-args 123

</TabItem>
</Tabs>

누구든지 경우 스마트 계약 구축자 인수를 설정합니다. 이러한 인수가 어떻게 생겼는지에 대한 자세한 가이드를 보려면 [사전 배포 기사를](/docs/edge/additional-features/predeployment) 참조하십시오.

---

<h4><i>사전 배포 주소</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis predeploy [--predeploy-address PREDEPLOY_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    genesis predeploy --predeploy-address 0x5555

</TabItem>
</Tabs>

주소를 미리 배포하도록 설정합니다. `0x0000000000000000000000000000000000001100`디폴트

---


## 연산자 명령어 {#operator-commands}

### 피어 명령어 {#peer-commands}

| **명령어** | **설명** |
|------------------------|-------------------------------------------------------------------------------------|
| peers add | libp2p 주소를 사용하여 새 피어를 추가합니다. |
| peers list | libp2p를 통해 클라이언트가 연결된 모든 피어를 나열합니다. |
| peers status | libp2p 주소를 사용하여 피어 목록에 있는 특정 피어의 상태를 반환합니다. |

<h3>피어 추가 플래그</h3>

<h4><i>addr</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers add --addr PEER_ADDRESS

</TabItem>
  <TabItem value="example" label="Example">

    peers add --addr /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

multiaddr 형식의 피어 libp2p 주소입니다.

---

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers add [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    peers add --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API 주소입니다. 기본값은 `127.0.0.1:9632`입니다.

<h3>피어 나열 플래그</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers list [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    peers list --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API 주소입니다. 기본값은 `127.0.0.1:9632`입니다.

<h3>피어 상태 플래그</h3>

<h4><i>peer-id</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers status --peer-id PEER_ID

</TabItem>
  <TabItem value="example" label="Example">

    peers status --peer-id 16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

p2p 네트워크 내 특정 피어의 libp2p 노드 ID입니다.

---

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    peers status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API 주소입니다. 기본값은 `127.0.0.1:9632`입니다.

### IBFT 명령어 {#ibft-commands}

| **명령어** | **설명** |
|------------------------|-------------------------------------------------------------------------------------|
| ibft snapshot | IBFT 스냅샷을 반환합니다. |
| ibft candidates | 현재 제안된 후보 집합과 아직 포함되지 않은 후보를 쿼리합니다. |
| ibft propose | 검사기 세트에서 추가/삭제해야 할 새 후보를 제안합니다. |
| ibft status | IBFT 클라이언트 전체 상태를 반환합니다. |
| ibft switch | IBFT 유형을 전환하기 위해 포크 구성을 genesis.json 파일에 추가합니다. |
| ibft quorum | 블록 번호를 지정한 후, 합의에 도달하기 위한 최적의 쿼럼 크기 메서드가 사용됩니다. |


<h3>IBFT 스냅샷 플래그</h3>

<h4><i>number</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft snapshot [--number BLOCK_NUMBER]

</TabItem>
  <TabItem value="example" label="Example">

    ibft snapshot --number 100

</TabItem>
</Tabs>

스냅샷의 블록 높이(번호)입니다.

---

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft snapshot [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    ibft snapshot --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API 주소입니다. 기본값은 `127.0.0.1:9632`입니다.

<h3>IBFT 후보 플래그</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft candidates [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    ibft candidates --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API 주소입니다. 기본값은 `127.0.0.1:9632`입니다.

<h3>IBFT 제안 플래그</h3>

<h4><i>vote</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft propose --vote VOTE

</TabItem>
  <TabItem value="example" label="Example">

    ibft propose --vote auth

</TabItem>
</Tabs>

검사기 세트에 변경 사항을 제안합니다. 가능한 값은 `[auth, drop]`입니다.

---

<h4><i>addr</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft propose --addr ETH_ADDRESS

</TabItem>
  <TabItem value="example" label="Example">

    ibft propose --addr 0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7

</TabItem>
</Tabs>

투표할 계정의 주소입니다.

---

<h4><i>bls</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft propose --bls BLS_PUBLIC_KEY

</TabItem>
  <TabItem value="example" label="Example">

    ibft propose --bls 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf

</TabItem>
</Tabs>

투표할 계정의 BLS 공개 키로, BLS 모드에서만 필요합니다.

---

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft candidates [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    ibft candidates --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API 주소입니다. 기본값은 `127.0.0.1:9632`입니다.

<h3>IBFT 상태 플래그</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    ibft status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API 주소입니다. 기본값은 `127.0.0.1:9632`입니다.

<h3>IBFT 전환 플래그</h3>

<h4><i>chain</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --chain genesis.json

</TabItem>
</Tabs>

업데이트할 제네시스 파일을 지정합니다. 기본값은 `./genesis.json`입니다.

---

<h4><i>유형</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--type TYPE]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --type PoS

</TabItem>
</Tabs>

전환할 IBFT 유형을 지정합니다. 가능한 값은 `[PoA, PoS]`입니다.

---

<h4><i>deployment</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--deployment DEPLOYMENT]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --deployment 100

</TabItem>
</Tabs>

배포 계약의 높이를 지정합니다. PoS에만 사용 가능합니다.

---

<h4><i>from</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--from FROM]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --from 200

</TabItem>
</Tabs>

---

<h4><i>ibft-validator-type</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

     ibft switch [--ibft-validator-type IBFT_VALIDATOR_TYPE]

</TabItem>
  <TabItem value="example" label="Example">

     ibft switch --ibft-validator-type ecdsa

</TabItem>
</Tabs>

블록 헤더의 검증 모드를 지정합니다. 가능한 값은 `[ecdsa, bls]`입니다. 기본값은 `bls`입니다.

---

<h4><i>ibft-validators-prefix-path</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

     ibft switch [--ibft-validators-prefix-path IBFT_VALIDATORS_PREFIX_PATH]

</TabItem>
  <TabItem value="example" label="Example">

     ibft switch --ibft-validators-prefix-path test-chain-

</TabItem>
</Tabs>

새 검사기 디렉터리의 프리픽스 경로입니다. `ibft-validator` 플래그를 생략하는 경우 이 플래그가 있어야 합니다. IBFT 모드가 PoA인 경우에만 사용 가능합니다(`--pos` 플래그 생략됨).

---

<h4><i>ibft-validator</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

     ibft switch [--ibft-validator IBFT_VALIDATOR_LIST]

</TabItem>
  <TabItem value="example" label="Example">

     ibft switch --ibft-validator 0xC12bB5d97A35c6919aC77C709d55F6aa60436900

</TabItem>
</Tabs>

전달된 주소를 포크 후 사용할 IBFT 검사기로 설정합니다. `ibft-validators-prefix-path` 플래그를 생략하는 경우 이 플래그가 있어야 합니다. PoA 모드에서만 사용 가능합니다.
1. 네트워크가 ECDSA와 함께 실행되는 경우 `--ibft-validator [ADDRESS]` 형식입니다.
2. 네트워크가 BLS와 함께 실행중인 경우 `--ibft-validator [ADDRESS][BLS_PUBLIC_KEY]` 형식입니다.

---

<h4><i>max-validator-count</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--max-validator-count MAX_VALIDATOR_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --max-validator-count 42

</TabItem>
</Tabs>

PoS 합의에서 검사기 세트에 포함할 수 있는 최대 스테이커 수입니다.
MAX_SAFE_INTEGER(2^53 - 2) 값을 초과할 수 없습니다.

---

<h4><i>min-validator-count</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--min-validator-count MIN_VALIDATOR_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --min-validator-count 4

</TabItem>
</Tabs>

PoS 합의에 설정된 검사기 세트에 포함해야 할 최소 스테이커 수입니다.
최대 검사기 수의 값을 초과할 수 없습니다.
기본값은 1입니다.

포크의 시작 높이를 지정합니다.

---

<h3>IBFT 쿼럼 플래그</h3>

<h4><i>from</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft quorum [--from your_quorum_switch_block_num]

</TabItem>
  <TabItem value="example" label="Example">

    ibft quorum --from 350

</TabItem>
</Tabs>

쿼럼 계산을 최적 쿼럼으로 전환하기 위한 높이입니다. `(2/3 * N)` 공식을 사용하며, 여기서 `N`은 검사기 노드 수입니다. 하위 호환성을 위한 플래그로, 특정 블록 높이까지 쿼럼 기존 계산을 사용한 체인에만 사용합니다.

---

<h4><i>chain</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft quorum [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    ibft quorum --chain genesis.json

</TabItem>
</Tabs>

업데이트할 제네시스 파일을 지정합니다. 기본값은 `./genesis.json`입니다.

### 트랜잭션 풀 명령어 {#transaction-pool-commands}

| **명령어** | **설명** |
|------------------------|--------------------------------------------------------------------------------------|
| txpool status | 풀의 트랜잭션 수를 반환합니다. |
| txpool subscribe | 트랜잭션 풀의 이벤트를 구독합니다. |

<h3>트랜잭션 풀 상태 플래그</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    txpool status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API 주소입니다. 기본값은 `127.0.0.1:9632`입니다.

<h3>트랜잭션 풀 구독 플래그</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API 주소입니다. 기본값은 `127.0.0.1:9632`입니다.

---

<h4><i>promoted</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--promoted LISTEN_PROMOTED]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --promoted

</TabItem>
</Tabs>

트랜잭션 풀에서 승격된 트랜잭션 이벤트를 구독합니다.

---

<h4><i>dropped</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--dropped LISTEN_DROPPED]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --dropped

</TabItem>
</Tabs>

트랜잭션 풀에서 삭제된 트랜잭션 이벤트를 구독합니다.

---

<h4><i>demoted</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--demoted LISTEN_DEMOTED]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --demoted

</TabItem>
</Tabs>

트랜잭션 풀에서 강등된 트랜잭션 이벤트를 구독합니다.

---

<h4><i>added</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--added LISTEN_ADDED]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --added

</TabItem>
</Tabs>

트랜잭션 풀 이벤트에 추가된 트랜잭션 이벤트를 구독합니다.

---

<h4><i>enqueued</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--enqueued LISTEN_ENQUEUED]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --enqueued

</TabItem>
</Tabs>

계정 대기열에 추가된 트랜잭션 이벤트를 구독합니다.

---

### 블록체인 명령어 {#blockchain-commands}

| **명령어** | **설명** |
|------------------------|-------------------------------------------------------------------------------------|
| status | 클라이언트 상태를 반환합니다. 자세한 응답은 아래에서 확인할 수 있습니다. |
| monitor | 블록체인 이벤트 스트림을 구독합니다. 자세한 응답은 아래에서 확인할 수 있습니다. |
| version | 클라이언트의 현재 버전을 반환합니다. |

<h3>상태 플래그</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API 주소입니다. 기본값은 `127.0.0.1:9632`입니다.

<h3>모니터링 플래그</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    monitor [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    monitor --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API 주소입니다. 기본값은 `127.0.0.1:9632`입니다.

---
<h3>버전 명령</h3>


<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    version

</TabItem>
</Tabs>

릴리스 버전, git 지점의 표시, 해시 커밋 및 빌드 시간을 표시합니다.

## 보안 비밀 명령어 {#secrets-commands}

| **명령어** | **설명** |
|-------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| secrets init | 해당 보안 비밀 관리자의 비공개 키를 초기화합니다. |
| secrets generate | 폴리곤 엣지로부터 지정될 수 있는 기밀 관리자 파일을  생성합니다. |
| 비밀 출력 | BLS 공개 키 주소, 유효자 공개 키 주소 및 참조 노드 ID를 인쇄하십시오. |

### 기밀 이니트 플래그 {#secrets-init-flags}

<h4><i>config</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets init [--config SECRETS_CONFIG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets init --config ./secretsManagerConfig.json

</TabItem>
</Tabs>

보안 비밀 관리자 구성 파일 경로를 설정합니다. Hashicorp Vault에 사용됩니다. 생략하는 경우, 로컬 FS 보안 비밀 관리자가 사용됩니다.

---

<h4><i>data-dir</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets init [--data-dir DATA_DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    secrets init --data-dir ./example-dir

</TabItem>
</Tabs>

로컬 FS가 사용되는 경우 Polygon 엣지 데이터 디렉터리를 설정합니다.

---

<h4><i>ecdsa</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets init [--ecdsa FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets init --ecdsa=false

</TabItem>
</Tabs>

ECDSA 키 생성 여부를 나타내는 플래그를 설정합니다. 기본값은 `true`입니다.

---

<h4><i>network</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets init [--network FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets init --network=false

</TabItem>
</Tabs>

Libp2p 네트워크 키 생성 여부를 나타내는 플래그를 설정합니다. 기본값은 `true`입니다.

---

<h4><i>bls</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets init [--bls FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets init --bls

</TabItem>
</Tabs>

BLS 키 생성 여부를 나타내는 플래그를 설정합니다. 기본값은 `true`입니다.

### 보안 비밀 생성 플래그 {#secrets-generate-flags}

<h4><i>dir</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--dir DATA_DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --dir ./example-dir

</TabItem>
</Tabs>

보안 비밀 관리자 구성 파일의 디렉터리를 설정합니다. 기본값은 `./secretsManagerConfig.json`입니다.

---

<h4><i>유형</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--type TYPE]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --type hashicorp-vault

</TabItem>
</Tabs>

보안 비밀 관리자의 유형([`hashicorp-vault`])을 지정합니다. 기본값은 `hashicorp-vault`입니다.

---

<h4><i>token</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--token TOKEN]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --token s.zNrXa9zF9mgrdnClM7PZ19cu

</TabItem>
</Tabs>

서비스 액세스 토큰을 지정합니다.

---

<h4><i>server-url</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--server-url SERVER_URL]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --server-url http://127.0.0.1:8200

</TabItem>
</Tabs>

서비스 서버 URL을 지정합니다.

---

<h4><i>name</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--name NODE_NAME]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --name node-1

</TabItem>
</Tabs>

서비스 기록 보관을 위한 노드 이름을 지정합니다. 기본값은 `polygon-edge-node`입니다.

---

<h4><i>namespace</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--namespace NAMESPACE]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --namespace my-namespace

</TabItem>
</Tabs>

Hashicorp Vault 보안 비밀 관리자에 사용할 네임스페이스을 지정합니다. 디폴트:`admin`

### 비밀 출력 플래그 {#secrets-output-flags}

<h4><i>bls</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--bls FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --bls

</TabItem>
</Tabs>

BLS 공개 키만 출력할지 여부를 나타내는 플래그를 설정합니다. 디폴트:`true`

---

<h4><i>config</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--config SECRETS_CONFIG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --config ./secretsManagerConfig.json

</TabItem>
</Tabs>

보안 비밀 관리자 구성 파일 경로를 설정합니다. 생략되는 경우 로컬 FS 기밀 관리자가 사용됩니다.

---

<h4><i>data-dir</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--data-dir DATA_DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --data-dir ./example-dir

</TabItem>
</Tabs>

로컬 FS가 사용되는 경우 Polygon 엣지 데이터 디렉터리를 설정합니다.

---

<h4><i>node -id</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--node-id FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --node-id

</TabItem>
</Tabs>

네트워크 노드 ID를 출력할지 여부를 나타내는 플래그를 설정합니다. 디폴트:`true`

---

<h4><i>유효성 검사기</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--validator FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --validator

</TabItem>
</Tabs>

유효자 주소를 출력할지 여부를 나타내는 플래그를 설정합니다. 디폴트:`true`

---

## 응답 {#responses}

### 상태 응답 {#status-response}

응답 객체는 프로토콜 버퍼를 사용해 정의합니다.
````go title="minimal/proto/system.proto"
message ServerStatus {
    int64 network = 1;

    string genesis = 2;

    Block current = 3;

    string p2pAddr = 4;

    message Block {
        int64 number = 1;
        string hash = 2;
    }
}
````

### 모니터링 응답 {#monitor-response}
````go title="minimal/proto/system.proto"
message BlockchainEvent {
    // The "repeated" keyword indicates an array
    repeated Header added = 1;
    repeated Header removed = 2;

    message Header {
        int64 number = 1;
        string hash = 2;
    }
}
````

## 유틸리티 {#utilities}

### 허용 목록 명렁어 {#whitelist-commands}

| **명령어** | **설명** |
|------------------------|-------------------------------------------------------------------------------------|
| whitelist show | 허용 목록 정보를 표시합니다. |
| whitelist deployment | 스마트 계약 배포 허용 목록을 업데이트합니다. |

<h3> 허용 목록 표시 </h3>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist show

</TabItem>
</Tabs>

허용 목록 정보를 표시합니다.

---

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist show [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist show --chain genesis.json

</TabItem>
</Tabs>

업데이트할 제네시스 파일을 지정합니다. 기본값은 `./genesis.json`입니다.

---

<h3> 허용 목록 배포 </h3>

<h4><i>chain</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist deployment [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist deployment --chain genesis.json

</TabItem>
</Tabs>

업데이트할 제네시스 파일을 지정합니다. 기본값은 `./genesis.json`입니다.

---

<h4><i>add</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist deployment [--add ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist deployment --add 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d

</TabItem>
</Tabs>

계약 배포된 허용 목록에 새로운 주소를 추가합니다. 계약 배포 허용 목록의 주소만 계약을 배포할 수 있습니다. 비어 있는 경우, 모든 주소가 계약 배포를 실행할 수 있습니다.

---

<h4><i>remove</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist deployment [--remove ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist deployment --remove 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d

</TabItem>
</Tabs>

계약 배포 허용 목록에서 주소를 삭제합니다. 계약 배포 허용 목록의 주소만 계약을 배포할 수 있습니다. 비어 있는 경우, 모든 주소가 계약 배포를 실행할 수 있습니다.

---

### 백업 플래그 {#backup-flags}

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    backup [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    backup --grpc-address 127.0.0.1:9632

</TabItem>
</Tabs>

gRPC API 주소입니다. 기본값은 `127.0.0.1:9632`입니다.

---

<h4><i>out</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    backup [--out OUT]

</TabItem>
  <TabItem value="example" label="Example">

    backup --out backup.dat

</TabItem>
</Tabs>

저장할 보관 파일의 경로입니다.

---

<h4><i>from</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    from [--from FROM]

</TabItem>
  <TabItem value="example" label="Example">

    backup --from 0x0

</TabItem>
</Tabs>

보관 처리된 블록의 시작 높이입니다. 기본값은 0입니다.

---

<h4><i>to</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    to [--to TO]

</TabItem>
  <TabItem value="example" label="Example">

    backup --to 0x2710

</TabItem>
</Tabs>

보관 처리된 블록의 끝 높이입니다.

---

## 제네시스 템플릿 {#genesis-template}
블록체인의 초기 상태를 설정하기 위해 제네시스 파일을 사용해야 합니다(예: 일부 계정에 초기 잔액이 있어야 하는 경우).

다음 *./genesis.json* 파일이 생성됩니다.
````json
{
    "name": "example",
    "genesis": {
        "nonce": "0x0000000000000000",
        "gasLimit": "0x0000000000001388",
        "difficulty": "0x0000000000000001",
        "mixHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "coinbase": "0x0000000000000000000000000000000000000000",
        "parentHash": "0x0000000000000000000000000000000000000000000000000000000000000000"
    },
    "params": {
        "forks": {},
        "chainID": 100,
        "engine": {
            "pow": {}
        }
    },
    "bootnodes": []
}
````

### 데이터 디렉터리 {#data-directory}

*data-dir* 플래그를 실행하면 **test-chain** 폴더가 생성됩니다.
폴더 구조는 다음 하위 폴더로 구성됩니다.
* **blockchain** - 블록체인 객체의 LevelDB를 저장합니다.
* **trie리** - Merkle 트리의 LevelDB를 저장합니다.
* **keystore** - 클라이언트의 비공개 키를 저장합니다. 여기에는 libp2p 비공개 키 및 봉인/검사기 비공개 키가 포함됩니다.
* **consensus** - 클라이언트 작업 중 필요할 수 있는 모든 합의 정보를 저장합니다.

## 리소스 {#resources}
* **[프로토콜 버퍼](https://developers.google.com/protocol-buffers)**

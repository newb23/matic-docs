---
id: cli-commands
title: CLIコマンド
description: "Polygon EdgeのCLIコマンドとコマンドフラグのリストです。"
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


このセクションでは、現在のPolygon Edgeのコマンド、コマンドフラグとこれらがどのように使用されるかを詳しく説明します。

:::tip JSON出力サポート

`--json`フラグは一部のコマンドでサポートされます。 このフラグはコマンドに出力をJSON形式で表示するように指示します

:::

## スタートアップコマンド {#startup-commands}

| **コマンド** | **説明** |
|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| server | すべてのモジュールをまとめてブートストラップすることによりブロックチェーンクライアントを開始するデフォルトコマンドです。 |
| genesis | *genesis.json*ファイルを生成します、これはクライアントを起動する前に定義済みのチェーンステートを設定するために使用されます。ジェネシスファイルの構造は下記に説明しています |
| ジェネシスプレデプロイ | 新鮮なネットワークのためのスマートコントラクトを事前に展開します。 |

### サーバフラグ {#server-flags}


| **すべてのサーバーフラグ** |
|---------------------------------------|---------------------------------------------|
| [data-dir](/docs/edge/get-started/cli-commands#data-dir) | [jsonrpc](/docs/edge/get-started/cli-commands#jsonrpc) |
| [json-rpc-block-range-limit](/docs/edge/get-started/cli-commands#json-rpc-block-range-limit) | [json-rpc-batch-request-limit](/docs/edge/get-started/cli-commands#json-rpc-batch-request-limit) |
| [grpc](/docs/edge/get-started/cli-commands#grpc) | [libp2p](/docs/edge/get-started/cli-commands#libp2p) |
| [prometheus](/docs/edge/get-started/cli-commands#prometheus) | [block-gas-target](/docs/edge/get-started/cli-commands#block-gas-target) |
| [max-peers](/docs/edge/get-started/cli-commands#max-peers) | [max-inbound-peers](/docs/edge/get-started/cli-commands#max-inbound-peers) |
| [max-outbound-peers](/docs/edge/get-started/cli-commands#max-outbound-peers) | [max-enqueued](/docs/edge/get-started/cli-commands#max-enqueued) |
| [log-level](/docs/edge/get-started/cli-commands#log-level) | [log-to](/docs/edge/get-started/cli-commands#log-to) |
| [chain](/docs/edge/get-started/cli-commands#chain) | [join](/docs/edge/get-started/cli-commands#join) |
| [nat](/docs/edge/get-started/cli-commands#nat) | [dns](/docs/edge/get-started/cli-commands#dns) |
| [価格制限](/docs/edge/get-started/cli-commands#price-limit) | [maxスロット](/docs/edge/get-started/cli-commands#max-slots) |
| [設定](/docs/edge/get-started/cli-commands#config) | [secrets-config](/docs/edge/get-started/cli-commands#secrets-config) |
| [dev](/docs/edge/get-started/cli-commands#dev) | [dev-interval](/docs/edge/get-started/cli-commands#dev-interval) |
| [no-discover](/docs/edge/get-started/cli-commands#no-discover) | [restore](/docs/edge/get-started/cli-commands#restore) |
| [block-time](/docs/edge/get-started/cli-commands#block-time) | [access-control-allow-origins](/docs/edge/get-started/cli-commands#access-control-allow-origins) |


#### <h4></h4><i>data-dir</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--data-dir DATA_DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    server --data-dir ./example-dir

</TabItem>
</Tabs>

Polygon Edgeのクライアントデータの保存に使用されるデータディレクトリを指定するのに使用されます。デフォルト： `./test-chain`。

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

JSON-RPCサービスのアドレスとポートを設定する`address:port`。   
ポートだけが`:10001`と定義されている場合、すべてのインターフェース`0.0.0.0:10001`に結合されます。   
省略された場合はサービスはデフォルト`address:port`に結合されます。   
デフォルトアドレス：`0.0.0.0:8545`。

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

fromBlock/toBlockの値（例：eth_getLogs）を含むjson-rpcリクエストの実行時に考慮すべき最大ブロック範囲を設定します。デフォルト：`1000`。

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

json-rpcバッチリクエストを処理する際に考慮する最大の長さを設定します。デフォルト： `20`。

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

gRPCサービスのアドレスとポートを設定する`address:port`。
デフォルトアドレス：`127.0.0.1:9632`。

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

libp2pサービスのアドレスとポートを設定する`address:port`。 デフォルトアドレス：`127.0.0.1:1478`。

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

prometheusサーバ`address:port`のアドレスとポートを設定します。   
ポートだけが`:5001`と定義されている場合、サービスはすべてのインターフェース`0.0.0.0:5001`に結合されます。   
省略された場合サービスは開始されません。

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

チェーン用の目標ブロックガス制限を設定します。デフォルト（執行されていない）： `0`。

ブロックガスの目標に関する詳しい説明は[Txセクション](/docs/edge/architecture/modules/txpool#block-gas-target)で確認できます。

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

クライアントの最大ピアカウントを設定します。デフォルト： `40`。

ピア制限は`max-peers`または`max-inbound/outbound-peers`フラグを使用して指定する必要があります。

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

クライアンドの最大インバウンドピアカウントを設定します。`max-peers`が設定されている場合、max-inbound-peer制限は以下の式を使用して計算されます。

`max-inbound-peer = InboundRatio * max-peers`、そこでは`InboundRatio`が`0.8`となります。

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

クライアントの最大アウトバウンドピアカウントを設定します。`max-peers`が設定されている場合、max-outbound-peerカウントは以下の式を使用して計算されます。

`max-outbound-peer = OutboundRatio * max-peers`、そこでは`OutboundRatio`が`0.2`となります。

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

アカウントごとのエンキューされたトランザクションの最大数を設定します。デフォルト：`128`。

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

コンソール出力のログレベルを設定します。デフォルト： `INFO`。

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

サーバコマンドからのすべてのログ出力を保持するログファイル名を定義します。デフォルトでは、すべてのサーバログがコンソール（stdout）に出力されますが、フラグが設定されている場合、サーバコマンドを実行している時はコンソールには出力されません。

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

チェーン開始に使用されるジェネシスファイルを設定します。デフォルト： `./genesis.json`。

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

結合すべきピアのアドレスを指定します。

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

ピアによって見ることができるため、ポートなしの外部IPアドレスを設定します。

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

ホストDNSアドレスを設定します。これは外部DNSを宣伝するために使用できます。`dns`、`dns4`、`dns6`をサポートします。

---

#### <h4></h4><i>価格制限</i>


<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--price-limit PRICE_LIMIT]

</TabItem>
  <TabItem value="example" label="Example">

    server --price-limit 10000

</TabItem>
</Tabs>

プールへの受け入れを強制するために、最小ガス価格の制限を設定します。デフォルト：`1`。

---

#### <h4></h4><i>maxスロット</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--max-slots MAX_SLOTS]

</TabItem>
  <TabItem value="example" label="Example">

    server --max-slots 1024

</TabItem>
</Tabs>

プール内の最大スロット数を設定します。デフォルト： `4096`。

---

#### <h4></h4><i>設定</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--config CLI_CONFIG_PATH]

</TabItem>
  <TabItem value="example" label="Example">

    server --config ./myConfig.json

</TabItem>
</Tabs>

CLI設定へのパスを指定します。`.json`をサポートします。

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

シークレットマネージャ設定ファイルへのパスを設定します。Hashicorp Vault、AWS SSM、GCPシークレットマネージャ用に使用されます。省略された場合、ローカルFSシークレットマネジャーが使用されます。

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

クライアントを開発モードに設定します。デフォルト：`false`。devモードでは、ピアディスカバリーがデフォルトで無効になっています。

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

クライアントの開発通知間隔を秒単位で設定します。デフォルト：`0`。

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

クライアントが他のピアを発見することを防ぎます。デフォルト：`false`。

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

指定されたアーカイブファイルからブロックを復元します。

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

ブロック時間を秒単位で設定します。デフォルト：`2`

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

JSON-RPCリクエストからのレスポンスを共有できるように許可ドメインを設定します。   
複数のドメインを承認するために、複数のフラグ`--access-control-allow-origins "https://example1.com" --access-control-allow-origins "https://example2.com"`を追加します。   
省略された場合、Access-Control-Allow-Originsヘッダーは`*`に設定され、すべてのドメインが許可されます。

---

### ジェネシスフラグ {#genesis-flags}
| **すべてのジェネシスフラグ** |
|---------------------------------------|---------------------------------------------|
| [dir](/docs/edge/get-started/cli-commands#dir) | [名前](/docs/edge/get-started/cli-commands#name) |
| [pos](/docs/edge/get-started/cli-commands#pos) | [epoch-size](/docs/edge/get-started/cli-commands#epoch-size) |
| [premine](/docs/edge/get-started/cli-commands#premine) | [chainid](/docs/edge/get-started/cli-commands#chainid) |
| [ibft-validator-type](/docs/edge/get-started/cli-commands#ibft-validator-type) | [ibft-validators-prefix-path](/docs/edge/get-started/cli-commands#ibft-validators-prefix-path) |
| [ibft-validator](/docs/edge/get-started/cli-commands#ibft-validator) | [block-gas-limit](/docs/edge/get-started/cli-commands#block-gas-limit) |
| [consensus](/docs/edge/get-started/cli-commands#consensus) | [bootnode](/docs/edge/get-started/cli-commands#bootnode) |
| [max-validator-count](/docs/edge/get-started/cli-commands#max-validator-count) | [min-validator-count](/docs/edge/get-started/cli-commands#min-validator-count) |


#### <h4></h4><i>dir</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--dir DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --dir ./genesis.json

</TabItem>
</Tabs>

Polygon Edgeのジェネシスデータ用にディレクトリを設定します。デフォルト：`./genesis.json`。

---

#### <h4></h4><i>名前</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--name NAME]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --name test-chain

</TabItem>
</Tabs>

チェーン名を設定します。デフォルト：`polygon-edge`。

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

クライアントはプルーフ・オブ・ステークIBFTを使用する必要があることを示すフラグを設定します。フラグが提供されていないまたは`false`の場合のデフォルトはプルーフ・オブ・オーソリティです。

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

チェーンのエポックサイズを設定します。デフォルト`100000`。

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

前払いされた口座と残高を`address:amount`のフォーマットで設定します。
額は10進数または16進数に設定できます。デフォルトの事前登録残高：（`0xD3C21BCECCEDA1000000`100万ネイティブ通貨トークン）。

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

チェーンのIDを設定します。デフォルト：`100`。

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

ブロックヘッダの検証モードを指定します。可能な値：`[ecdsa, bls]`。デフォルト：`bls`。

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

バリデータフォルダディレクトリのプレフィックスパスです。フラグ`ibft-validator`が省略された場合に必要になります。

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

渡されたアドレスをIBFTバリデータとして設定します。フラグ`ibft-validators-prefix-path`が省略された場合に必要になります。
1. ネットワークがECDSAで実行されている場合、フォーマットは`--ibft-validator [ADDRESS]`です。
2. ネットワークがBLSで実行されている場合、フォーマットは`--ibft-validator [ADDRESS]:[BLS_PUBLIC_KEY]`です。

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

ブロック内の全操作で使用されるガスの最大数を指します。デフォルト：`5242880`。

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

コンセンサスプロトコルを設定します。デフォルト：`pow`。

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

p2pディスカバリーブートストラップ用のMultiaddr URLです。このフラグは複数回使用することができます。
IPアドレスの代わりに、ブートノードのDNSアドレスを提供することも可能です。

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

PoSコンセンサスで設定されたバリデータセットに参加できる最大ステーカー数です。
この数字は、MAX_SAFE_INTEGER（2^53 - 2）値を超えることはできません。

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

PoSコンセンサスで設定されたバリデータセットに参加する必要がある最低限のステーカー数です。この数はmax-validator-countの値を超えることはできません。デフォルトは1です。

---

### genesisの予備展開フラグ {#genesis-predeploy-flags}

<h4><i>artifacts-path</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis predeploy [--artifacts-path PATH_TO_ARTIFACTS]

</TabItem>
  <TabItem value="example" label="Example">

    genesis predeploy --artifacts-path ./ArtifactsData.json

</TabItem>
</Tabs>

`abi`コントラクトアーティファクトJSONへのパスを設定`bytecode`します。`deployedBytecode`

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

更新する`genesis.json`ファイルへのパスを設定します。デフォルト`./genesis.json`。

---

<h4><i>コンストラクターargs</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis predeploy [--constructor-args CONSTRUCTOR_ARGUMENT]

</TabItem>
  <TabItem value="example" label="Example">

    genesis predeploy --constructor-args 123

</TabItem>
</Tabs>

Smart Contractコンストラクターの引数を設定します。これらの引数をどのように見えるかについて詳しいガイドは、[事前展開の記事](/docs/edge/additional-features/predeployment)を参照してください。

---

<h4><i>事前デプロイアドレス</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis predeploy [--predeploy-address PREDEPLOY_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    genesis predeploy --predeploy-address 0x5555

</TabItem>
</Tabs>

事前デプロイするアドレスを設定します。デフォルト`0x0000000000000000000000000000000000001100`。

---


## オペレータコマンド {#operator-commands}

### ピアコマンド {#peer-commands}

| **コマンド** | **説明** |
|------------------------|-------------------------------------------------------------------------------------|
| peers add | 新しいピアをそのlibp2pアドレスを使用して追加します。 |
| peers list | クライアントがlibp2pを通じて接続されているすべてのピアのリストを表示します。 |
| peers status | libp2pアドレスを使用して、ピアリストから特定のピアのステータスを返します。 |

<h3>ピア追加フラグ</h3>

<h4><i>addr</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers add --addr PEER_ADDRESS

</TabItem>
  <TabItem value="example" label="Example">

    peers add --addr /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

multiaddr形式のピアのlibp2pアドレスです。

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

gRPC APIのアドレス。デフォルト：`127.0.0.1:9632`。

<h3>ピアリストフラグ</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers list [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    peers list --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC APIのアドレス。デフォルト：`127.0.0.1:9632`。

<h3>ピアステータスフラグ</h3>

<h4><i>peer-id</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers status --peer-id PEER_ID

</TabItem>
  <TabItem value="example" label="Example">

    peers status --peer-id 16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

ｐ2pネットワーク内の特定のピアのlibp2pノードID。

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

gRPC APIのアドレス。デフォルト：`127.0.0.1:9632`。

### IBFTコマンド {#ibft-commands}

| **コマンド** | **説明** |
|------------------------|-------------------------------------------------------------------------------------|
| ibft snapshot | IBFTスナップショットを返します |
| ibft candidates | 提案された候補者の現在のセット、およびまだ含まれてない候補者をクエリします。 |
| ibft propose | バリデータセットについて追加／削除する新しい候補者を提案します。 |
| ibft status | IBFTクライアントの全体的なステータスを返します |
| ibft switch | IBFTタイプを切り替えるためにgenesis.jsonファイルにフォーク設定を追加 |
| ibft quorum | ブロック番号を指定し、その後コンセンサスに到達するために最適なクォーラムサイズメソッドを使用します。 |


<h3>ibftスナップショットフラグ</h3>

<h4><i>number</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft snapshot [--number BLOCK_NUMBER]

</TabItem>
  <TabItem value="example" label="Example">

    ibft snapshot --number 100

</TabItem>
</Tabs>

スナップショットのブロックの高さ（数）。

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

gRPC APIのアドレス。デフォルト：`127.0.0.1:9632`。

<h3>ibft候補フラグ</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft candidates [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    ibft candidates --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC APIのアドレス。デフォルト：`127.0.0.1:9632`。

<h3>ibft提案フラグ</h3>

<h4><i>vote</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft propose --vote VOTE

</TabItem>
  <TabItem value="example" label="Example">

    ibft propose --vote auth

</TabItem>
</Tabs>

バリデータセットへの変更を提案します。可能な値：`[auth, drop]`。

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

投票するアカウントのアドレス。

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

投票するアカウントのBLS公開鍵は、BLSモードでのみ必要です。

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

gRPC APIのアドレス。デフォルト：`127.0.0.1:9632`。

<h3>ibftステータスフラグ</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    ibft status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC APIのアドレス。デフォルト：`127.0.0.1:9632`。

<h3>ibftスイッチフラグ</h3>

<h4><i>chain</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --chain genesis.json

</TabItem>
</Tabs>

更新するジェネシスファイルを指定します。デフォルト：`./genesis.json`。

---

<h4><i>タイプ</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--type TYPE]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --type PoS

</TabItem>
</Tabs>

切り替えるIBFTタイプを指定します。可能な値：`[PoA, PoS]`。

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

コントラクトデプロイメントの高さを指定します。PoSでのみ利用できます。

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

ブロックヘッダの検証モードを指定します。可能な値：`[ecdsa, bls]`。デフォルト：`bls`。

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

新しいバリデータのディレクトリのパスをプレフィックスします。フラグ`ibft-validator`が省略された場合に必要になります。IBFTモードがPoA（`--pos`フラグは省略）である時にのみ使用できます。

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

渡されたアドレスをフォークの後に使用するIBFTバリデータとして設定します。フラグ`ibft-validators-prefix-path`が省略された場合に必要になります。PoAモードでのみ使用できます。
1. ネットワークがECDSAで実行されている場合、フォーマットは`--ibft-validator [ADDRESS]`です。
2. ネットワークがBLSで実行されている場合、フォーマットは`--ibft-validator [ADDRESS][BLS_PUBLIC_KEY]`です。

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

PoSコンセンサスで設定されたバリデータセットに参加できる最大ステーカー数です。
この数字は、MAX_SAFE_INTEGER（2^53 - 2）値を超えることはできません。

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

PoSコンセンサスで設定されたバリデータセットに参加する必要がある最低限のステーカー数です。この数はmax-validator-countの値を超えることはできません。デフォルトは1です。

フォークの最初の高さを指定します。

---

<h3>ibftクォーラムフラグ</h3>

<h4><i>from</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft quorum [--from your_quorum_switch_block_num]

</TabItem>
  <TabItem value="example" label="Example">

    ibft quorum --from 350

</TabItem>
</Tabs>

クォーラム計算をQuorumOptimalに切り替える高さは、数式`(2/3 * N)`を使用しますが、`N`はバリデータノードの数です。これは下位互換性のため、つまり一定のブロックの高さまでについてクォーラムレガシー計算を使用したチェーンだけのためであることに注意してください。

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

更新するジェネシスファイルを指定します。デフォルト：`./genesis.json`。

### トランザクションプールコマンド {#transaction-pool-commands}

| **コマンド** | **説明** |
|------------------------|--------------------------------------------------------------------------------------|
| txpool status | プール内のトランザクション数を返します。 |
| txpool subscribe | トランザクションプール内のイベントをサブスクライブします |

<h3>txpoolステイタスフラグ</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    txpool status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC APIのアドレス。デフォルト：`127.0.0.1:9632`。

<h3>txpoolサブスクライブフラグ</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC APIのアドレス。デフォルト：`127.0.0.1:9632`。

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

TxPool内のプロモーションされたTxイベントをサブスクライブします。

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

TxPoolでトロップしたTxイベントをサブスクライブします。

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

TxPool内の降格されたtxイベントをサブスクライブします。

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

TxPoolに追加されたTxイベントをサブスクライブします。

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

アカウントキューにエンキューされたtxイベントをサブスクライブします。

---

### ブロックチェーンコマンド {#blockchain-commands}

| **コマンド** | **説明** |
|------------------------|-------------------------------------------------------------------------------------|
| status | クライアントのステータスを返します。回答の詳細は以下にあります |
| monitor | ブロックチェーンイベントストリームをサブスクライブします。回答の詳細は以下にあります |
| version | クライアントの現在のバージョンを返します。 |

<h3>ステータスフラグ</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC APIのアドレス。デフォルト：`127.0.0.1:9632`。

<h3>モニターフラグ</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    monitor [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    monitor --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC APIのアドレス。デフォルト： `127.0.0.1:9632`。

---
<h3>バージョンコマンド</h3>


<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    version

</TabItem>
</Tabs>

リリースバージョン、gitブランチ、コミットハッシュ、ビルド時間を表示します。

## シークレットコマンド {#secrets-commands}

| **コマンド** | **説明** |
|-------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| secrets init | 対応するシークレットマネージャへの秘密鍵を初期化します。 |
| secrets generate | Polygon Edgeで解析することができるシークレットマネージャ設定ファイルを生成します。 |
| 秘密の出力 | BLS公開鍵アドレス、バリデータ公開鍵アドレス、および参照のためにノードIDを印刷します。 |

### シークレット初期化フラグ {#secrets-init-flags}

<h4><i>設定</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets init [--config SECRETS_CONFIG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets init --config ./secretsManagerConfig.json

</TabItem>
</Tabs>

シークレットマネージャ設定ファイルへのパスを設定します。Hashicorp Vault用に使用されます。省略された場合、ローカルFSシークレットマネジャーが使用されます。

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

ローカルFSを使用する場合はPolygon Edgeデータ用のディレクトリを設定します。

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

ECDSA鍵を生成するかどうかを示すフラグを設定します。デフォルト：`true`。

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

Libp2pネットワーク鍵を生成するかどうかを示すフラグを設定します。デフォルト：`true`。

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

BLS鍵を生成するかどうかを示すフラグを設定します。デフォルト：`true`。

### シークレット生成フラグ {#secrets-generate-flags}

<h4><i>dir</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--dir DATA_DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --dir ./example-dir

</TabItem>
</Tabs>

シークレットマネージャ設定ファイル用のディレクトリを設定します。デフォルト： `./secretsManagerConfig.json`

---

<h4><i>タイプ</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--type TYPE]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --type hashicorp-vault

</TabItem>
</Tabs>

シークレットマネージャのタイプを指定します[`hashicorp-vault`]。 デフォルト：`hashicorp-vault`

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

サービスのアクセストークンを指定します。

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

サービスのサーバURLを指定します。

---

<h4><i>名前</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--name NODE_NAME]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --name node-1

</TabItem>
</Tabs>

オンサービス記録保存用のノード名を指定します。デフォルト：`polygon-edge-node`

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

Hashicorp Vaultのシークレットマネージャに使用されるネームスペースを指定します。デフォルト：`admin`

### secretsがフラグを出力する {#secrets-output-flags}

<h4><i>bls</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--bls FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --bls

</TabItem>
</Tabs>

BLS公開鍵のみを出力するかどうかを示すフラグを設定します。デフォルト：`true`

---

<h4><i>設定</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--config SECRETS_CONFIG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --config ./secretsManagerConfig.json

</TabItem>
</Tabs>

シークレットマネージャ設定ファイルへのパスを設定します。省略された場合、ローカルFSシークレットマネジャーが使用されます。

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

ローカルFSを使用する場合はPolygon Edgeデータ用のディレクトリを設定します。

---

<h4><i>node-id</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--node-id FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --node-id

</TabItem>
</Tabs>

ネットワークノードIDのみを出力するかどうかを示すフラグを設定します。デフォルト：`true`

---

<h4><i>バリデータ</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--validator FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --validator

</TabItem>
</Tabs>

バリデータアドレスだけを出力するかどうかを示すフラグを設定します。デフォルト：`true`

---

## レスポンス {#responses}

### ステータスレスポンス {#status-response}

レスポンスオブジェクトはプロトコルバッファを使用して定義されます。
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

### モニターレスポンス {#monitor-response}
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

## ユーティリティ {#utilities}

### ホワイトリストコマンド {#whitelist-commands}

| **コマンド** | **説明** |
|------------------------|-------------------------------------------------------------------------------------|
| whitelist show | ホワイトリスト情報を表示します |
| whitelist deployment | スマートコントラクトのデプロイメントホワイトリストを更新します。 |

<h3>ホワイトリスト表示</h3>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist show

</TabItem>
</Tabs>

ホワイトリスト情報が表示されます。

---

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist show [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist show --chain genesis.json

</TabItem>
</Tabs>

更新するジェネシスファイルを指定します。デフォルト：`./genesis.json`。

---

<h3>ホワイトリストデプロイメント</h3>

<h4><i>chain</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist deployment [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist deployment --chain genesis.json

</TabItem>
</Tabs>

更新するジェネシスファイルを指定します。デフォルト：`./genesis.json`。

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

コントラクトデプロイメントホワイトリストに新しいアドレスを追加します。コントラクトデプロイメントホワイトリスト内のアドレスだけがコントラクトをデプロイできます。空の場合、すべてのアドレスがコントラクトデプロイメントを実行できます。

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

コントラクトデプロイメントホワイトリストからアドレスを削除します。コントラクトデプロイメントホワイトリスト内のアドレスだけがコントラクトをデプロイできます。空の場合、すべてのアドレスがコントラクトデプロイメントを実行できます。

---

### バックアップフラグ {#backup-flags}

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    backup [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    backup --grpc-address 127.0.0.1:9632

</TabItem>
</Tabs>

gRPC APIのアドレス。デフォルト：`127.0.0.1:9632`。

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

保存するアーカイブファイルのパス。

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

アーカイブ内のブロックの最初の高さ。デフォルト：0。

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

アーカイブ内のブロックの最後の高さ。

---

## ジェネシステンプレート {#genesis-template}
ジェネシスファイルはブロックチェーンの当初のステートを設定するために使用する必要があります（例、一部のアカウントが開始用の残高を持っている必要がある場合）。

次の *./genesis.json* ファイルが生成されます：
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

### データディレクトリ {#data-directory}

*data-dir*フラグを実行する時、**test-chain**フォルダが生成されます。
フォルダ構造は次のサブフォルダから構成されます：
* **blockchain** - ブロックチェーンオブジェクトのLevelDBを保存する
* **trie** - MerkleトライのLevelDBを保存する
* **keystore** - クライアントの秘密鍵を保存するこれは、libp2p秘密鍵とシーリング／バリデータ秘密鍵が含まれます。
* **consensus** - クライアントが作業中に必要となりうるすべてのコンセンサス情報を保存します。

## リソース {#resources}
* **[プロトコルバッファ](https://developers.google.com/protocol-buffers)**

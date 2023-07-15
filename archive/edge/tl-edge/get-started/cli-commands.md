---
id: cli-commands
title: Mga CLI Command
description: "Listahan ng mga CLI command at mga command flag para sa Polygon Edge."
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


Idinedetalye ng seksyong ito ang mga kasalukuyang command at mga command flag sa Polygon Edge, at kung paano ginagamit ang mga ito.

:::tip Suporta sa JSON output

Ang `--json` flag ay sinusuportahan sa ilang command. Ang flag na ito ay nag-uutos sa command na i-print ang output sa JSON format

:::

## Mga Startup Command {#startup-commands}

| **Command** | **Paglalarawan** |
|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| server | Ang default na command na nagpapasimula sa blockchain client, sa pamamagitan ng pag-bootstrap ng lahat ng module nang magkakasama |
| genesis | Bumubuo ng *genesis.json* file na ginagamit para magtakda ng paunang natukoy na state ng chain bago simulan ang client. Ang istruktura ng genesis file ay inilalarawan sa ibaba |
| genesis predeploy | Predeploys ang isang Smart Contract para sa mga sariwang network |

### mga server flag {#server-flags}


| **Lahat ng server flag** |
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
| [limitasyon ng presyo.](/docs/edge/get-started/cli-commands#price-limit) | [max-slots](/docs/edge/get-started/cli-commands#max-slots) |
| [config](/docs/edge/get-started/cli-commands#config) | [secrets-config](/docs/edge/get-started/cli-commands#secrets-config) |
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

Ginagamit para tukuyin directory ng data na ginagamit para sa pag-store ng data ng client ng Polygon Edge. Default: `./test-chain`.

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

Itinatakda ang address at port para sa serbisyo ng JSON-RPC `address:port`.   
Kung ang port lang ang tinutukoy `:10001` magba-bind ito sa lahat ng interface `0.0.0.0:10001`.   
Kung inalis ang serbisyo, magba-bind ito sa default `address:port`.   
Default na address: `0.0.0.0:8545`.

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

Sets ang maximum na hanay ng block na ituturing kapag executing ng mga kahilingan ng json-rpc na kinabibilangan ng mga values ng fromBlock/toBlock (hal. eth_getLogs).   Maaaring ganap na hindi pinagana ang limitasyong ito sa pamamagitan ng pagtatakda ng halaga sa `0`. Default:`1000`.

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

Nakatakda ang maximum na haba na ituturing kapag hinawakan ang mga kahilingan ng batch ng json-rpc. Maaaring ganap na hindi pinagana ang limitasyong ito sa pamamagitan ng pagtatakda ng halaga sa `0`. Default: `20`.

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

Itinatakda ang address at port para sa serbisyo ng gRPC `address:port`. Default address: `127.0.0.1:9632`.

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

Itinatakda ang address at port para sa serbisyo ng libp2p `address:port`. Default address: `127.0.0.1:1478`.

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

Itinatakda ang address at port para sa prometheus server `address:port`.   
Kung ang port lang ang tinutukoy, `:5001` magba-bind ang serbisyo sa lahat ng interface `0.0.0.0:5001`.   
Kung aalisin, hindi sisimulan ang serbisyo.

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

Itinatakda ang target na limitasyon sa gas kada block para sa chain. Default (hindi ipinatutupad): `0`.

May mas detalyadong paliwanag tungkol sa block gas target na matatagpuan sa [seksyong TxPool](/docs/edge/architecture/modules/txpool#block-gas-target).

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

Itinatakda ang maximum na bilang ng peer ng client. Default: `40`.

Dapat tukuyin ang peer limit sa pamamagitan ng paggamit ng `max-peers`o `max-inbound/outbound-peers` flag.

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

Itinatakda ang maximum na bilang ng inbound na peer ng client. Kung nakatakda ang `max-peers`, ang max-inbound-peer limit ay kinakalkula gamit ang mga sumusunod na formula.

`max-inbound-peer = InboundRatio * max-peers`, kung saan ang `InboundRatio` ay `0.8`.

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

Itinatakda ang maximum na bilang ng outbound na peer. Kung nakatakda ang `max-peers`, ang max-outbound-peer count ay kinakalkula gamit ang mga sumusunod na formula.

`max-outbound-peer = OutboundRatio * max-peers`, kung saan ang `OutboundRatio` ay `0.2`.

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

Itinatakda ang maximum na bilang ng mga na-enqueue na transaksyon kada account. Default:`128`.

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

Itinatakda ang antas ng log para sa console output. Default: `INFO`.

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

Tinutukoy ang pangalan ng log file na hahawak sa lahat ng log output mula sa server command.
Bilang default, ang lahat ng server log ay ia-output sa console (stdout),
ngunit kung nakatakda ang flag, hindi magkakaroon ng output sa console kapag nagpapatakbo ng server command.

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

Tinutukoy ang genesis file na ginagamit para sa pagsisimula ng chain. Default: `./genesis.json`.

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

Tinutukoy ang address ng peer na nakasali dapat.

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

Itinatakda ang panlabas na IP address nang walang port, dahil nakikita ito ng mga peer.

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

Itinatakda ang DNS address ng host. Magagamit ito para mag-advertise ng external na DNS. Sinusuportahan ang `dns`,`dns4`,`dns6`.

---

#### <h4></h4><i>limitasyon ng presyo.</i>


<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--price-limit PRICE_LIMIT]

</TabItem>
  <TabItem value="example" label="Example">

    server --price-limit 10000

</TabItem>
</Tabs>

Itinatakda ang limitasyon sa gas price para ipatupad ang pagtanggap sa pool. Default: `1`.

---

#### <h4></h4><i>max-slots</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--max-slots MAX_SLOTS]

</TabItem>
  <TabItem value="example" label="Example">

    server --max-slots 1024

</TabItem>
</Tabs>

Itinatakda ang maximum na bilang ng mga slot sa pool. Default: `4096`.

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

Tinutukoy ang path sa CLI config. Sinusuportahan ang `.json`.

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

Itinatakda ang path sa config file ng SecretsManager. Ginagamit para sa Hashicorp Vault, AWS SSM at GCP Secrets Manager. Kung aalisin, gagamitin ang lokal na FS secrets manager.

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

Itinatakda sa dev mode ang client. Default: `false`. Sa dev mode, pinagana ang peer discovery sa pamamagitan ng default.

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

Itinatakda ang agwat ng dev notification ng client sa segundo. Default: `0`.

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

Pinipigilan ang client na matuklasan ang iba pang peer. Default: `false`.

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

I-restore ang mga block mula sa tinukoy na archive file

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

Itinatakda ang tagal ng produksyon ng block sa segundo. Default: `2`

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

Itinatakda ang mga awtorisadong domain para makapagbahagi ng mga response mula sa mga kahilingan ng JSON-RPC.   
Nagdadagdag ng maraming flag `--access-control-allow-origins "https://example1.com" --access-control-allow-origins "https://example2.com"` para pahintulutan ang maraming domain.   
Kung aalisin, ang Access-Control-Allow-Origins header ay itatakda sa `*` at ang lahat ng domain ay pahihintulutan.

---

### mga flag sa genesis {#genesis-flags}
| **Lahat ng genesis flag** |
|---------------------------------------|---------------------------------------------|
| [dir](/docs/edge/get-started/cli-commands#dir) | [Pangalan](/docs/edge/get-started/cli-commands#name) |
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

Itinatakda ang direktoryo para sa genesis data ng Polygon Edge. Default: `./genesis.json`.

---

#### <h4></h4><i>Pangalan</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--name NAME]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --name test-chain

</TabItem>
</Tabs>

Itinatakda ang name para sa chain. Default: `polygon-edge`.

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

Itinatakda ang flag na nagpapahiwatig na dapat gamitin ng client ang Proof of Stake IBFT.
Nagde-default sa Proof of Authority kung hindi ibinigay ang flag o `false`.

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

Itinatakda ang laki ng epoch para sa chain. Default na `100000`.

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

Itinatakda ang mga premined na account at balanse sa format na `address:amount`.
Ang halaga ay maaaring decimal o hex.
Default na premined balanse: `0xD3C21BCECCEDA1000000`(1 milyong katutubong currency tokens).

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

Itinatakda ang ID ng chain. Default: `100`.

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

Tinutukoy ang validation mode ng mga block header. Mga posibleng value: `[ecdsa, bls]`. Default: `bls`.

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

Prefix path para sa direktoryo ng folder ng validator. Mayroon dapat kung ang flag na `ibft-validator` ay inalis.

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

Itinatakda ang mga naipasang address bilang mga validator ng IBFT. Mayroon dapat kung ang flag na `ibft-validators-prefix-path` ay inalis.
1. Kung ang network ay tumatakbo sa pamamagitan ng ECDSA, ang format ay `--ibft-validator [ADDRESS]`.
2. Kung ang network ay tumatakbo sa pamamagitan ng BLS, ang format ay `--ibft-validator [ADDRESS]:[BLS_PUBLIC_KEY]`.

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

Tumutukoy sa maximum na dami ng gas na ginagamit ng lahat ng operasyon sa isang block. Default: `5242880`.

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

Itinatakda ang protokol ng consensus. Default: `pow`.

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

Multiaddr URL para sa p2p discovery bootstrap. Magagamit ang flag na ito nang maraming beses.
Sa halip na isang IP address, maaaring ibigay ang DNS address ng bootnode.

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

Ang maximum na bilang ng mga staker na makakasali sa validator na itinakda sa PoS consensus.
Ang bilang na ito ay hindi maaaring lumampas sa value ng MAX_SAFE_INTEGER (2^53 - 2).

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

Ang minimum na bilang ng mga staker na kinakailangang sumali sa validator na itinakda sa PoS consensus.
Ang bilang na ito ay hindi maaaring lumampas sa value ng max-validator-count.
Nagde-default sa 1.

---

### genesis predeploy flag {#genesis-predeploy-flags}

<h4><i>artifacts-path</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis predeploy [--artifacts-path PATH_TO_ARTIFACTS]

</TabItem>
  <TabItem value="example" label="Example">

    genesis predeploy --artifacts-path ./ArtifactsData.json

</TabItem>
</Tabs>

Sets ng landas sa mga artifacts ng kontrata na JSON na naglalaman ng `abi`, `bytecode`at .`deployedBytecode`

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

I-set ang landas sa `genesis.json`file na dapat i-update. Default na `./genesis.json`.

---

<h4><i>constructor-args</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis predeploy [--constructor-args CONSTRUCTOR_ARGUMENT]

</TabItem>
  <TabItem value="example" label="Example">

    genesis predeploy --constructor-args 123

</TabItem>
</Tabs>

Nakatakda ang mga argument ng constructor ng Smart Contract, kung meron man. Para sa isang detalyadong gabay kung paano dapat magmukhang reference ang mga argumento na [ito](/docs/edge/additional-features/predeployment).

---

<h4><i>predeploy-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis predeploy [--predeploy-address PREDEPLOY_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    genesis predeploy --predeploy-address 0x5555

</TabItem>
</Tabs>

I-set ang address para to ang. Default na `0x0000000000000000000000000000000000001100`.

---


## Mga Command ng Operator {#operator-commands}

### Mga Command ng Peer {#peer-commands}

| **Command** | **Paglalarawan** |
|------------------------|-------------------------------------------------------------------------------------|
| peers add | Nagdadagdag ng bagong peer gamit ang kanilang libp2p address |
| peers list | Inililista ang lahat ng peer kung saan nakakonekta ang client sa pamamagitan ng libp2p |
| peers status | Ibinabalik ang status ng partikular na peer mula sa listahan ng mga peer, gamit ang libp2p address |

<h3>mga peers add flag</h3>

<h4><i>addr</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers add --addr PEER_ADDRESS

</TabItem>
  <TabItem value="example" label="Example">

    peers add --addr /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

Ang libp2p address ng peer sa multiaddr format.

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

Address ng gRPC API. Default: `127.0.0.1:9632`.

<h3>mga peers list flag</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers list [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    peers list --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Address ng gRPC API. Default: `127.0.0.1:9632`.

<h3>mga peers status flag</h3>

<h4><i>peer-id</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers status --peer-id PEER_ID

</TabItem>
  <TabItem value="example" label="Example">

    peers status --peer-id 16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

Libp2p node ID ng partikular na peer sa p2p network.

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

Address ng gRPC API. Default: `127.0.0.1:9632`.

### Mga Command ng IBFT {#ibft-commands}

| **Command** | **Paglalarawan** |
|------------------------|-------------------------------------------------------------------------------------|
| ibft snapshot | Ibinabalik ang IBFT snapshot |
| ibft candidates | Kini-query ang kasalukuyang set ng mga iminungkahing candidate, pati na rin ang mga candidate na hindi pa naisasama |
| ibft propose | Nagmumungkahi ng bagong candidate na idadagdag/aalisin sa validator set |
| ibft status | Ibinabalik ang pangkalahatang status ng IBFT client |
| ibft switch | Magdagdag ng mga configuration ng fork sa genesis.json file para magpalit ng type ng IBFT |
| ibft quorum | Tinutukoy ang bilang ng block kung saan pagkatapos ay gagamitin ang optimal quorum size na paraan para maabot ang consensus |


<h3>mga ibft snapshot flag</h3>

<h4><i>number</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft snapshot [--number BLOCK_NUMBER]

</TabItem>
  <TabItem value="example" label="Example">

    ibft snapshot --number 100

</TabItem>
</Tabs>

Ang block height (number) para sa snapshot.

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

Address ng gRPC API. Default: `127.0.0.1:9632`.

<h3>mga ibft candidates flag</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft candidates [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    ibft candidates --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Address ng gRPC API. Default: `127.0.0.1:9632`.

<h3>mga ibft propose flag</h3>

<h4><i>vote</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft propose --vote VOTE

</TabItem>
  <TabItem value="example" label="Example">

    ibft propose --vote auth

</TabItem>
</Tabs>

Nagmumungkahi ng pagbabago sa validator set. Mga posibleng value: `[auth, drop]`.

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

Address ng account na iboboto.

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

BLS Public Key ng account na iboboto, kinakailangan lang sa BLS mode.

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

Address ng gRPC API. Default: `127.0.0.1:9632`.

<h3>mga ibft status flag</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    ibft status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Address ng gRPC API. Default: `127.0.0.1:9632`.

<h3>mga ibft switch flag</h3>

<h4><i>chain</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --chain genesis.json

</TabItem>
</Tabs>

Tinutukoy ang genesis file na ia-update. Default: `./genesis.json`.

---

<h4><i>Uri</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--type TYPE]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --type PoS

</TabItem>
</Tabs>

Tinutukoy ang uri ng IBFT na papalitan. Mga posibleng value: `[PoA, PoS]`.

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

Tinutukoy ang height ng deployment ng kontrata. Available lang sa PoS.

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

Tinutukoy ang validation mode ng mga block header. Mga posibleng value: `[ecdsa, bls]`. Default: `bls`.

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

Prefix path para sa mga direktoryo ng mga bagong validator. Mayroon dapat kung ang flag na `ibft-validator` ay inalis. Available lang kapag PoA ang IBFT mode (inalis ang flag na `--pos`).

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

Mga set na naipapasa sa mga address bilang mga validator ng IBFT na ginagamit pagkatapos ng fork. Mayroon dapat kung ang flag na `ibft-validators-prefix-path` ay inalis. Available lang sa PoA mode.
1. Kung ang network ay tumatakbo sa pamamagitan ng ECDSA, ang format ay `--ibft-validator [ADDRESS]`.
2. Kung ang network ay tumatakbo sa pamamagitan ng BLS, ang format ay `--ibft-validator [ADDRESS][BLS_PUBLIC_KEY]`.

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

Ang maximum na bilang ng mga staker na makakasali sa validator na itinakda sa PoS consensus.
Ang bilang na ito ay hindi maaaring lumampas sa value ng MAX_SAFE_INTEGER (2^53 - 2).

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

Ang minimum na bilang ng mga staker na kinakailangang sumali sa validator na itinakda sa PoS consensus.
Ang bilang na ito ay hindi maaaring lumampas sa value ng max-validator-count.
Nagde-default sa 1.

Tinutukoy ang simulang height ng fork.

---

<h3>mga ibft quorum flag</h3>

<h4><i>from</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft quorum [--from your_quorum_switch_block_num]

</TabItem>
  <TabItem value="example" label="Example">

    ibft quorum --from 350

</TabItem>
</Tabs>

Ang height para gawing QuorumOptimal, ang kalkulasyon ng quorum, kung saan ginagamit ang formula na `(2/3 * N)`, at `N` ang bilang ng mga validator node. Mangyaring tandaan na ito ay para sa backwards compatibility, ibig sabihin, para lang sa mga chain na gumagamit ng Quorum legacy calculation hanggang sa partikular na block height.

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

Tinutukoy ang genesis file na ia-update. Default: `./genesis.json`.

### Mga Command sa Pool ng Transaksyon {#transaction-pool-commands}

| **Command** | **Paglalarawan** |
|------------------------|--------------------------------------------------------------------------------------|
| txpool status | Ibinabalik ang bilang ng mga transaksyon sa pool |
| txpool subscribe | Nagsu-subscribe para sa mga event sa transaction pool |

<h3>mga txpool status flag</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    txpool status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Address ng gRPC API. Default: `127.0.0.1:9632`.

<h3>mga txpool subscribe flag</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Address ng gRPC API. Default: `127.0.0.1:9632`.

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

Nagsu-subscribe para sa mga promoted na event ng tx sa TxPool.

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

Nagsu-subscribe para sa mga dropped na event ng tx sa TxPool.

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

Nagsu-subscribe para sa mga demoted na event ng tx sa TxPool.

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

Nagsu-subscribe para sa mga added na event ng tx sa TxPool.

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

Nagsu-subscribe para sa mga enqueued na event ng tx sa mga account queue.

---

### Mga blockchain command {#blockchain-commands}

| **Command** | **Paglalarawan** |
|------------------------|-------------------------------------------------------------------------------------|
| status | Ibinabalik ang status ng client. Makikita sa ibaba ang detalyadong response |
| monitor | Nagsu-subscribe sa stream ng blockchain event. Makikita sa ibaba ang detalyadong response |
| version | Ibinabalik ang kasalukuyang bersyon ng client |

<h3>mga status flag</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Address ng gRPC API. Default: `127.0.0.1:9632`.

<h3>mga monitor flag</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    monitor [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    monitor --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Address ng gRPC API. Default: `127.0.0.1:9632`.

---
<h3>command ng bersyon</h3>


<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    version

</TabItem>
</Tabs>

Nagpapakita ng release version, git branch, mag-commit ng hash at magtayo ng oras.

## Mga Sikretong Command {#secrets-commands}

| **Command** | **Paglalarawan** |
|-------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| secrets init | Ini-initialize ang mga pribadong key sa kaukulang secrets manager |
| secrets generate | Bumubuo ng configuration file sa secrets manager na maaaring i-parse ng Polygon Edge |
| secrets output | I-print ang public key address ng BLS, validator public key address, at node id para sa sanggunian |

### mga secrets init flag {#secrets-init-flags}

<h4><i>config</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets init [--config SECRETS_CONFIG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets init --config ./secretsManagerConfig.json

</TabItem>
</Tabs>

Itinatakda ang path sa config file ng SecretsManager. Ginagamit para sa Hashicorp Vault. Kung aalisin, gagamitin ang lokal na FS secrets manager.

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

Itinatakda ang direktoryo para sa data ng Polygon Edge kung ginagamit ang lokal na FS.

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

Itinatakda ang flag na nagpapahiwatig kung dapat bumuo ng ECDSA key. Default: `true`.

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

Itinatakda ang flag na nagpapahiwatig kung dapat bumuo ng Libp2p Network key. Default: `true`.

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

Itinatakda ang flag na nagpapahiwatig kung dapat bumuo ng BLS key. Default: `true`.

### mga secrets generate flag {#secrets-generate-flags}

<h4><i>dir</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--dir DATA_DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --dir ./example-dir

</TabItem>
</Tabs>

Itinatakda ang direktoryo para sa configuration file ng secrets manager Default: `./secretsManagerConfig.json`

---

<h4><i>Uri</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--type TYPE]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --type hashicorp-vault

</TabItem>
</Tabs>

Tinutukoy ang uri ng secrets manager [`hashicorp-vault`]. Default: `hashicorp-vault`

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

Tinutukoy ang access token para sa serbisyo

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

Tinutukoy ang URL ng server para sa serbisyo

---

<h4><i>Pangalan</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--name NODE_NAME]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --name node-1

</TabItem>
</Tabs>

Tinutukoy ang pangalan ng node para sa pagpapanatili ng record sa serbisyo. Default: `polygon-edge-node`

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

Tinutukoy ang namespace na ginagamit para sa secrets manager ng Hashicorp Vault. Default: `admin`

### mga secret output flag {#secrets-output-flags}

<h4><i>bls</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--bls FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --bls

</TabItem>
</Tabs>

Nakatakda ang bandila na nagpapahiwatig kung i-output lamang ang public key ng BLS. Default: `true`

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

Itinatakda ang path sa config file ng SecretsManager. Kung aalisin, gagamitin ang lokal na FS secrets manager.

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

Itinatakda ang direktoryo para sa data ng Polygon Edge kung ginagamit ang lokal na FS.

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

Nakatakda ang bandila na nagpapahiwatig kung i-output lamang ang network node ID. Default: `true`

---

<h4><i>Validator</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--validator FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --validator

</TabItem>
</Tabs>

I-set ang flag na nagpapahiwatig kung i-output lamang ang validator address. Default: `true`

---

## Mga Response {#responses}

### Status Response {#status-response}

Tinutukoy ang response object gamit ang mga Protokol ng Buffer.
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

### Monitor Response {#monitor-response}
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

## Mga Utility {#utilities}

### mga whitelist command {#whitelist-commands}

| **Command** | **Paglalarawan** |
|------------------------|-------------------------------------------------------------------------------------|
| whitelist show | Nagpapakita ng impormasyon ng whitelist |
| whitelist deployment | Ina-update ang whitelist ng deployment ng smart na kontrata |

<h3> whitelist show </h3>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist show

</TabItem>
</Tabs>

Nagpapakita ng impormasyon ng whitelist.

---

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist show [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist show --chain genesis.json

</TabItem>
</Tabs>

Tinutukoy ang genesis file na ia-update. Default: `./genesis.json`.

---

<h3> whitelist deployment </h3>

<h4><i>chain</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist deployment [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist deployment --chain genesis.json

</TabItem>
</Tabs>

Tinutukoy ang genesis file na ia-update. Default: `./genesis.json`.

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

Nagdaragdag ng bagong address sa contract deployment whitelist. Ang mga address lang sa contract deployment whitelist ang maaaring mag-deploy ng mga kontrata. Kung walang laman, ang anumang address ay maaaring magsagawa ng deployment ng kontrata

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

Nag-aalis ng address sa contract deployment whitelist. Ang mga address lang sa contract deployment whitelist ang maaaring mag-deploy ng mga kontrata. Kung walang laman, ang anumang address ay maaaring magsagawa ng contract deployment

---

### mga backup flag {#backup-flags}

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    backup [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    backup --grpc-address 127.0.0.1:9632

</TabItem>
</Tabs>

Address ng gRPC API. Default: `127.0.0.1:9632`.

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

Path ng file ng archive na ise-save.

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

Ang simulang height ng mga block sa archive. Default: 0.

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

Ang end height ng mga block sa archive.

---

## Template ng Genesis {#genesis-template}
Dapat gamitin ang genesis file para itakda ang inisyal na state ng blockchain (hal. kung ang ilang account ay dapat na magkaroon ng panimulang balanse).

Nabubuo ang sumusunod na *./genesis.json* file:
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

### Data Directory {#data-directory}

Kapag isinasagawa ang flag na *data-dir*, may nabubuong folder na **test-chain**.
Ang istruktura ng folder ay naglalaman ng mga sumusunod na sub-folder:
* **blockchain** - Ini-store ang LevelDB para sa mga blockchain object
* **trie** - Ini-store ang LevelDB para sa Merkle tries
* **keystore** - Nagi-store ng mga pribadong key para sa client. Kabilang dito ang pribadong key ng libp2p at ang pribadong key ng sealing/validator
* **consensus** - Nagi-store ng anumang impormasyon ng consensus na maaaring kailanganin ng client habang tumatakbo

## Mga Resource {#resources}
* **[Mga Protokol ng Buffer](https://developers.google.com/protocol-buffers)**

---
id: cli-commands
title: CLI Komutları
description: "Polygon Edge için CLI komutları ve komut bayrakları listesi."
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


Bu bölüm Polygon Edge'deki mevcut komutları, komut bayraklarını ve nasıl kullanıldıklarını ayrıntılarıyla açıklar.

:::tip JSON çıktı desteği

`--json` bayrağı bazı komutlarda desteklenir. Bu bayrak, komuta JSON formatında çıktı yazdırma talimatı verir

:::

## Başlangıç Komutları {#startup-commands}

| **Komut** | **Açıklama** |
|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| sunucu | Tüm modüllerin önyüklemesini birlikte yaparak blok zinciri istemcisini çalıştıran varsayılan komut |
| genesis | İstemciyi başlatmadan önce, önceden belirlenmiş bir zincir durumu ayarlamak için kullanılan bir *genesis.json* dosyası oluşturur. Genesis dosyasının yapısı aşağıda açıklanmaktadır |
| genesis predeploy | Taze ağlar için Akıllı Sözleşme hazırlar |

### sunucu bayrakları {#server-flags}


| **Tüm sunucu bayrakları** |
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
| [price-limit](/docs/edge/get-started/cli-commands#price-limit) | [max-slots](/docs/edge/get-started/cli-commands#max-slots) |
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

Polygon Edge istemci verisini depolamak için kullanılacak veri dizinini belirtmekte kullanılır. Varsayılan: `./test-chain`.

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

JSON-RPC hizmeti için adresi ve portu ayarlar `address:port`.   
Tanımlanan tek port `:10001` ise, tüm arabirimlere bağlanacaktır `0.0.0.0:10001`.   
Belirlenmezse, hizmet varsayılan `address:port` ile bağlanacaktır.   
Varsayılan adres: `0.0.0.0:8545`.

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

Json-rpc istekleri için en fazla blok aralığını ayarlar ve bu istekleri (örneğin eth_getLogs) ile de içeren blok/toBlock değerlerini (örneğin eth_getLogs) içerir.   Bu limit değeri ayarlayarak tamamen devre dışı `0`bırakılabilir. Varsayılan: `1000`.

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

Json-rpc toplu istekleri ile ilgili olarak düşünülecek maksimum uzunluğu ayarlar. Bu limit değeri ayarlayarak tamamen devre dışı `0`bırakılabilir. Varsayılan: `20`.

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

gRPC hizmeti için adresi ve portu ayarlar `address:port`. Varsayılan adres: `127.0.0.1:9632`.

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

libp2p hizmeti için adres ve portu ayarlar `address:port`. Varsayılan adres: `127.0.0.1:1478`.

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

Prometheus sunucusu için adres ve portu ayarlar `address:port`.   
Yalnızca `:5001` portu tanımlandıysa, hizmet tüm arabirimlere bağlanacaktır `0.0.0.0:5001`.   
Göz ardı edilirse, hizmet başlamayacaktır.

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

Zincir için hedef blok gaz limitini ayarlar. Varsayılan (zorlanmayan): `0`.

Blok gaz hedefi hakkında daha ayrıntılı bir açıklama [TxPool kısmında](/docs/edge/architecture/modules/txpool#block-gas-target) bulunabilir.

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

İstemcinin maksimum eş sayısını ayarlar. Varsayılan: `40`.

Eş limiti `max-peers` veya `max-inbound/outbound-peers` bayrağı kullanılarak belirtilmelidir.

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

İstemcinin maksimum gelen eş sayısını ayarlar. Eğer `max-peers`olarak ayarlandıysa, max-inbound-peer limiti aşağıdaki formüller kullanılarak hesaplanır.

`InboundRatio` değerinin `0.8` olduğu yerde `max-inbound-peer = InboundRatio * max-peers`.

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

İstemcinin maksimum giden eş sayısını ayarlar. `max-peers` olarak ayarlandıysa, max-outbound-peer sayısı aşağıdaki formüller kullanılarak hesaplanır.

`OutboundRatio` değerinin `0.2` olduğu yerde `max-outbound-peer = OutboundRatio * max-peers`.

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

Hesap başına kuyruğa alınan maksimum işlem sayısını ayarlar. Varsayılan: `128`.

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

Konsol çıktısı için günlük seviyesini ayarlar. Varsayılan: `INFO`.

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

Sunucu komutundan gelen tüm günlük çıktısını tutacak günlük dosya adını tanımlar.
Varsayılan olarak tüm sunucu günlüklerinin çıktısı konsola (stdout) verilecektir,
ancak bayrak ayarlandıysa, sunucu komutunu çalıştırırken konsola hiçbir çıktı olmayacaktır.

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

Zinciri başlatmak için kullanılan genesis dosyasını belirtir. Varsayılan: `./genesis.json`.

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

Katılınması gereken eşin adresini belirtir.

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

Harici IP adresini, port olmadan, eşler tarafından görüneceği şekliyle ayarlar.

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

Ana bilgisayar DNS adresini ayarlar. Harici bir DNS yayını yapmak için kullanılabilir. `dns4`, `dns`, `dns6` destekler.

---

#### <h4></h4><i>price-limit</i>


<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--price-limit PRICE_LIMIT]

</TabItem>
  <TabItem value="example" label="Example">

    server --price-limit 10000

</TabItem>
</Tabs>

Havuza kabul edilmek için minimum gaz fiyatı limitini ayarlar. Varsayılan: `1`.

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

Havuzdaki maksimum slotu ayarlar. Varsayılan: `4096`.

---

#### <h4></h4><i>Yapılandırma</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--config CLI_CONFIG_PATH]

</TabItem>
  <TabItem value="example" label="Example">

    server --config ./myConfig.json

</TabItem>
</Tabs>

CLI yapılandırması için dizini belirtir. `.json` destekler.

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

SecretsManager yapılandırma dosyası için dizini belirler. Hashicorp Vault, AWS SSM ve GCP Secrets Manager için kullanılır. Göz ardı edilirse, yerel FS sır yöneticisi kullanılır.

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

İstemciyi geliştirici moduna ayarlar. Varsayılan `false`: Dev modunda eşlerin keşfi varsayılan olarak devre dışı bırakılır.

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

İstemcinin dev bildirim aralığını saniye cinsinden ayarlar. Varsayılan: `0`.

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

İstemcinin diğer eşleri keşfetmesini önler. Varsayılan: `false`.

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

Belirtilen arşiv dosyasından blokları geri yükler

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

Blok üretim zamanını saniye cinsinden ayarlar. Varsayılan: `2`

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

JSON-RPC isteklerinden gelen yanıtları paylaşabilmek için yetkili alan adlarını ayarlar.   
Çoklu alan adlarını yetkilendirmek için çoklu bayrak `--access-control-allow-origins "https://example1.com" --access-control-allow-origins "https://example2.com"` ekler.   
Göz ardı edilirse, Access-Control-Allow-Origins başlığı `*` olarak ayarlanır ve tüm alan adları yetkilendirilir.

---

### genesis bayrakları {#genesis-flags}
| **Tüm genesis bayrakları** |
|---------------------------------------|---------------------------------------------|
| [dir](/docs/edge/get-started/cli-commands#dir) | [name](/docs/edge/get-started/cli-commands#name) |
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

Polygon Edge genesis verisi için dizini ayarlar. Varsayılan: `./genesis.json`.

---

#### <h4></h4><i>Ad</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--name NAME]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --name test-chain

</TabItem>
</Tabs>

Zincirin adını ayarlar. Varsayılan: `polygon-edge`.

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

İstemcinin Hisse Kanıtı IBFT kullanması gerektiğini belirten bayrağı ayarlar.
Belirlenmediyse veya `false` ise varsayılan olarak Yetki Kanıtı ayarlar.

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

Zincir için dönem boyutunu ayarlar. Varsayılan `100000`.

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

Önceden mine edilmiş hesapları ve bakiyeleri `address:amount` formatında ayarlar.
Miktar ondalık veya hex cinsinden olabilir.
Varsayılan önceden belirlenmiş bakiye: `0xD3C21BCECCEDA1000000`(1 milyon yerel para birimi belirteçi).

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

Zincirin kimliğini ayarlar. Varsayılan: `100`.

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

Blok başlıklarının doğrulama modunu belirtir. Olası değerler: `[ecdsa, bls]`. Varsayılan: `bls`.

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

Doğrulayıcı klasör dizini için ön ek yolu. `ibft-validator` bayrağı göz ardı edilirse, mevcut olmalıdır.

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

Geçilen adresleri IBFT doğrulayıcıları olarak belirler. `ibft-validators-prefix-path` bayrağı göz ardı edilirse, mevcut olmalıdır.
1. Ağ ECDSA ile çalışıyorsa, format `--ibft-validator [ADDRESS]` şeklindedir.
2. Ağ BLS ile çalışıyorsa, format `--ibft-validator [ADDRESS]:[BLS_PUBLIC_KEY]` şeklindedir.

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

Bir blok içindeki tüm operasyonlar tarafından kullanılan gaz miktarına karşılık gelir. Varsayılan: `5242880`.

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

Konsensüs protokolünü ayarlar. Varsayılan: `pow`.

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

p2p keşif önyüklemesi için Multiaddr URL'sidir. Bu bayrak çok kez kullanılabilir.
Bir IP adresi yerine, bootnode'un DNS adresi sağlanabilir.

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

Bir PoS konsensüsü içinde ayarlanan doğrulayıcı kümesine katılabilecek maksimum staker sayısını belirler.
Bu sayı MAX_SAFE_INTEGER (2^53 - 2) değerini aşamaz.

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

Bir PoS konsensüsü içinde ayarlanan doğrulayıcı kümesine katılmak için gereken minimum staker sayısını belirtir.
Bu sayı max-validator-count değerini aşamaz.
Varsayılan olarak 1 değerini alır.

---

### genesis önceden dağıtılmış bayraklar {#genesis-predeploy-flags}

<h4><i>artifacts-path</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis predeploy [--artifacts-path PATH_TO_ARTIFACTS]

</TabItem>
  <TabItem value="example" label="Example">

    genesis predeploy --artifacts-path ./ArtifactsData.json

</TabItem>
</Tabs>

JSON ile ilgili sözleşme eserlerine giden yolu ayarlar ve `bytecode`bu işlemi `abi`içerir.`deployedBytecode`

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

Güncellenmesi gereken `genesis.json`dosyanın yolunu ayarlar. Varsayılan `./genesis.json`.

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

Eğer varsa Akıllı Sözleşme yapıcı argümanlarını ayarlar. Bu argümanların nasıl görünmesi gerektiği konusunda ayrıntılı bir kılavuz için lütfen [ön dağıtım](/docs/edge/additional-features/predeployment) makalesine başvurun.

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

Bu adrese önceden dağıtılmak için adresi ayarlar. Varsayılan `0x0000000000000000000000000000000000001100`.

---


## Operatör Komutları {#operator-commands}

### Eş Komutları {#peer-commands}

| **Komut** | **Açıklama** |
|------------------------|-------------------------------------------------------------------------------------|
| peers add | libp2p adresini kullanarak yeni bir eş ekler |
| peers list | istemcinin libp2p aracılığıyla bağlandığı tüm eşleri listeler |
| peers status | libp2p adresini kullanarak eşler listesinden belirli bir eşin durumunu getirir |

<h3>peers add bayrakları</h3>

<h4><i>addr</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers add --addr PEER_ADDRESS

</TabItem>
  <TabItem value="example" label="Example">

    peers add --addr /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

Eşin multiaddr biçiminde libp2p adresi.

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

gRPC API adresidir. Varsayılan: `127.0.0.1:9632`.

<h3>peers list bayrakları</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers list [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    peers list --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API adresidir. Varsayılan: `127.0.0.1:9632`.

<h3>peers status bayrakları</h3>

<h4><i>peer-id</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers status --peer-id PEER_ID

</TabItem>
  <TabItem value="example" label="Example">

    peers status --peer-id 16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

p2p ağı içinde belirli bir eşin Libp2p düğüm kimliğidir.

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

gRPC API adresidir. Varsayılan: `127.0.0.1:9632`.

### IBFT Komutları {#ibft-commands}

| **Komut** | **Açıklama** |
|------------------------|-------------------------------------------------------------------------------------|
| ibft snapshot | IBFT anlık görüntüsünü getirir |
| ibft candidates | Önerilen mevcut aday kümesini ve henüz dâhil edilmemiş adayları sorgular |
| ibft propose | Doğrulayıcı kümesi için eklenecek/çıkarılacak yeni bir aday önerir |
| ibft status | IBFT istemcisinin genel durumunu getirir |
| ibft switch | IBFT türünü değiştirmek için genesis.json dosyası içine çatal yapılandırmaları ekler |
| ibft quorum | Blok numarasını belirtir ve bunun ardından optimal quorum boyutu yöntemi konsensüse varmak için kullanılır |


<h3>ibft snapshot bayrakları</h3>

<h4><i>number</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft snapshot [--number BLOCK_NUMBER]

</TabItem>
  <TabItem value="example" label="Example">

    ibft snapshot --number 100

</TabItem>
</Tabs>

Anlık görüntü için blok yüksekliği (sayı).

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

gRPC API adresidir. Varsayılan: `127.0.0.1:9632`.

<h3>ibft candidates bayrakları</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft candidates [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    ibft candidates --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API adresidir. Varsayılan: `127.0.0.1:9632`.

<h3>ibft propose bayrakları</h3>

<h4><i>vote</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft propose --vote VOTE

</TabItem>
  <TabItem value="example" label="Example">

    ibft propose --vote auth

</TabItem>
</Tabs>

Doğrulayıcı kümesinde bir değişiklik önerir. Olası değerler: `[auth, drop]`.

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

Oylanacak hesabın adresidir.

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

Oylanacak hesap için BLS genel anahtarıdır, yalnızca BLS modunda gereklidir.

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

gRPC API adresidir. Varsayılan: `127.0.0.1:9632`.

<h3>ibft status bayrakları</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    ibft status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API adresidir. Varsayılan: `127.0.0.1:9632`.

<h3>ibft switch bayrakları</h3>

<h4><i>chain</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --chain genesis.json

</TabItem>
</Tabs>

Güncellenecek genesis dosyasını belirtir. Varsayılan: `./genesis.json`.

---

<h4><i>Tip</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--type TYPE]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --type PoS

</TabItem>
</Tabs>

Değiştirilecek IBFT türünü belirtir. Olası değerler: `[PoA, PoS]`.

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

Sözleşme devreye alımının yüksekliğini belirtir. Sadece PoS ile kullanılabilir.

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

Blok başlıklarının doğrulama modunu belirtir. Olası değerler: `[ecdsa, bls]`. Varsayılan: `bls`.

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

Yeni doğrulayıcıların dizinleri için ön ek yoludur. `ibft-validator` bayrağı göz ardı edilirse, mevcut olmalıdır. Sadece IBFT modu PoA olduğunda kullanılabilir (`--pos` bayrağı göz ardı edilir).

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

Geçirilen adresleri çatal sonrasında kullanılan IBFT doğrulayıcıları olarak ayarlar. `ibft-validators-prefix-path` bayrağı göz ardı edilirse, mevcut olmalıdır. Sadece PoA modunda kullanılabilir.
1. Ağ ECDSA ile çalışıyorsa, format `--ibft-validator [ADDRESS]` şeklindedir.
2. Ağ BLS ile çalışıyorsa, format `--ibft-validator [ADDRESS][BLS_PUBLIC_KEY]` şeklindedir.

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

Bir PoS konsensüsü içinde ayarlanan doğrulayıcı kümesine katılabilecek maksimum staker sayısını belirler.
Bu sayı MAX_SAFE_INTEGER (2^53 - 2) değerini aşamaz.

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

Bir PoS konsensüsü içinde ayarlanan doğrulayıcı kümesine katılmak için gereken minimum staker sayısını belirtir.
Bu sayı max-validator-count değerini aşamaz.
Varsayılan olarak 1 değerini alır.

Çatalın başlangıç yüksekliğini belirtir.

---

<h3>ibft quorum bayrakları</h3>

<h4><i>from</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft quorum [--from your_quorum_switch_block_num]

</TabItem>
  <TabItem value="example" label="Example">

    ibft quorum --from 350

</TabItem>
</Tabs>

Quorum hesaplamasını QuorumOptimal olarak değiştirecek yüksekliktir; bu hesaplamada `(2/3 * N)` formülü kullanılır ve `N` doğrulayıcı düğümlerin sayısıdır. Lütfen bunun geriye dönük uyumluluk için olduğunu; yani yalnızca belli bir blok yüksekliğine kadar eski Quorum hesaplamasını kullanan zincirler için olduğunu unutmayın.

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

Güncellenecek genesis dosyasını belirtir. Varsayılan: `./genesis.json`.

### İşlem Havuzu Komutları {#transaction-pool-commands}

| **Komut** | **Açıklama** |
|------------------------|--------------------------------------------------------------------------------------|
| txpool status | Havuzdaki işlem sayısını getirir |
| txpool subscribe | İşlem havuzundaki olaylara abone olur |

<h3>txpool status bayrakları</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    txpool status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API adresidir. Varsayılan: `127.0.0.1:9632`.

<h3>txpool subscribe bayrakları</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API adresidir. Varsayılan: `127.0.0.1:9632`.

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

TxPool içinde yükseltilen işlem olaylarına abone olur.

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

TxPool içinde düşürülen işlem olaylarına abone olur.

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

TxPool içinde alçaltılan işlem olaylarına abone olur.

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

TxPool'a eklenen işlem olaylarına abone olur.

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

Hesap kuyruklarında sıralanan işlem olaylarına abone olur.


---

### Blok zinciri komutları {#blockchain-commands}

| **Komut** | **Açıklama** |
|------------------------|-------------------------------------------------------------------------------------|
| status | İstemcinin durumunu getirir. Ayrıntılı yanıt aşağıda bulunabilir |
| monitor | Bir blok zinciri olay akışına abone olur. Ayrıntılı yanıt aşağıda bulunabilir |
| version | İstemcinin güncel sürümünü getirir |

<h3>status bayrakları</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API adresidir. Varsayılan: `127.0.0.1:9632`.

<h3>monitor bayrakları</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    monitor [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    monitor --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

gRPC API adresidir. Varsayılan: `127.0.0.1:9632`.

---
<h3>version komutu</h3>


<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    version

</TabItem>
</Tabs>

Bu görüntüler, sürüm sürümü, git şubesi, hash işlemesi ve zaman oluşturma

## Sır Komutları {#secrets-commands}

| **Komut** | **Açıklama** |
|-------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| secrets init | İlgili sır yöneticisi için özel anahtarları başlatır |
| secrets generate | Polygon Edge tarafından ayrıştırılabilecek bir sır yöneticisi yapılandırma dosyası oluşturur |
| sırlar çıktı | BLS genel anahtar adresi, doğrulayıcı genel anahtar adresini ve referans için düğüm kimliğini yazdırır |

### secrets init bayrakları {#secrets-init-flags}

<h4><i>Yapılandırma</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets init [--config SECRETS_CONFIG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets init --config ./secretsManagerConfig.json

</TabItem>
</Tabs>

SecretsManager yapılandırma dosyası için dizini belirler. Hashicorp Vault için kullanılır. Göz ardı edilirse, yerel FS sır yöneticisi kullanılır.

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

Yerel FS kullanılıyorsa, Polygon Edge verisi için dizini ayarlar.

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

ECDSA anahtarı oluşturup oluşturulmayacağını belirten bayrağı ayarlar. Varsayılan: `true`.

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

Bir Libp2p Ağ anahtarı oluşturulup oluşturumayacağını belirten bayrağı ayarlar. Varsayılan: `true`.

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

Bir BLS anahtarı oluşturulup oluşturulmayacağını belirten bayrağı ayarlar. Varsayılan: `true`.

### secrets generate bayrakları {#secrets-generate-flags}

<h4><i>dir</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--dir DATA_DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --dir ./example-dir

</TabItem>
</Tabs>

Sır yöneticisi yapılandırma dosyası için dizini ayarlar; Varsayılan: `./secretsManagerConfig.json`

---

<h4><i>Tip</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--type TYPE]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --type hashicorp-vault

</TabItem>
</Tabs>

Sır yöneticisinin türünü belirtir [`hashicorp-vault`]. Varsayılan: `hashicorp-vault`

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

Hizmet için erişim token'ını belirtir

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

Hizmet için sunucu URL'sini belirtir

---

<h4><i>Ad</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--name NODE_NAME]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --name node-1

</TabItem>
</Tabs>

Hizmet içi kayıt tutma için düğüm adını belirtir. Varsayılan: `polygon-edge-node`

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

Hashicorp Vault sır yöneticisi için kullanılan ad alanını belirtir. Varsayılan: `admin`

### sırlar çıkış bayrakları {#secrets-output-flags}

<h4><i>bls</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--bls FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --bls

</TabItem>
</Tabs>

BLS genel anahtarını yalnızca çıkarıp çıkarmayacağını belirten bayrağı ayarlar. Varsayılan: `true`

---

<h4><i>Yapılandırma</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--config SECRETS_CONFIG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --config ./secretsManagerConfig.json

</TabItem>
</Tabs>

SecretsManager yapılandırma dosyası için dizini belirler. Göz ardı edilirse, yerel FS sır yöneticisi kullanılır.

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

Yerel FS kullanılıyorsa, Polygon Edge verisi için dizini ayarlar.

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

Bu bayrağı ayarlar, ağ düğüm kimliğini yalnızca çıkarıp çıkarmayacağını gösterir. Varsayılan: `true`

---

<h4><i>Doğrulayıcı</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--validator FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --validator

</TabItem>
</Tabs>

Bu bayrağı yalnızca doğrulayıcı adresini çıkarıp çıkarmayacağını gösteren bir şekilde ayarlar. Varsayılan: `true`

---

## Yanıtlar {#responses}

### Durum Yanıtı {#status-response}

Yanıt nesnesi, Protokol Arabellekleri kullanılarak tanımlanır.
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

### İzleme Yanıtı {#monitor-response}
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

## Yardımcı Programlar {#utilities}

### beyaz liste (whitelist) komutları {#whitelist-commands}

| **Komut** | **Açıklama** |
|------------------------|-------------------------------------------------------------------------------------|
| whitelist show | Beyaz liste bilgilerini görüntüler |
| whitelist deployment | Akıllı sözleşme devreye alma beyaz listesini günceller |

<h3> whitelist show </h3>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist show

</TabItem>
</Tabs>

Beyaz liste bilgilerini görüntüler.

---

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist show [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist show --chain genesis.json

</TabItem>
</Tabs>

Güncellenecek genesis dosyasını belirtir. Varsayılan: `./genesis.json`.

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

Güncellenecek genesis dosyasını belirtir. Varsayılan: `./genesis.json`.

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

Sözleşme devreye alma beyaz listesine yeni bir adres ekler. Sadece sözleşme devreye alma beyaz listesindeki adresler sözleşmeleri devreye alabilir. Boş bırakılırsa, herhangi bir adres sözleşmeyi devreye alma işlemini gerçekleştirebilir

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

Bir adresi sözleşme devreye alma beyaz listesinden kaldırır. Sadece sözleşme devreye alma beyaz listesindeki adresler sözleşmeleri devreye alabilir. Boş bırakılırsa, herhangi bir adres sözleşmeyi devreye alma işlemini gerçekleştirebilir

---

### yedekleme bayrakları {#backup-flags}

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    backup [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    backup --grpc-address 127.0.0.1:9632

</TabItem>
</Tabs>

gRPC API adresidir. Varsayılan: `127.0.0.1:9632`.

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

Kaydedilecek arşiv dosya dizinidir.

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

Arşivdeki blokların başlangıç yüksekliğidir. Varsayılan: 0.

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

Arşivdeki blokların son yüksekliğidir.

---

## Genesis Şablonu {#genesis-template}
Genesis dosyası blok zincirinin başlangıç durumunu ayarlamak için kullanılmalıdır (ör., bazı hesaplarda bakiye bulunması gerekiyorsa).

Aşağıdaki *./genesis.json* dosyası oluşturulur:
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

### Veri Dizini {#data-directory}

*Data-dir* bayrağını çalıştırırken, bir **test zinciri** klasörü oluşturulur.
Klasör yapısı aşağıdaki alt klasörlerden oluşur:
* **blockchain** - Blok zinciri nesneleri için LevelDB'yi depolar
* **trie** - Merkle ağaçları için LevelDB'yi depolar
* **keystore** - İstemci için özel anahtarları depolar. Buna libp2p özel anahtarı mühürleme/doğrulama özel anahtarı dâhildir
* **consensus** - İstemcinin çalışırken ihtiyaç duyabileceği tüm konsensüs bilgisini depolar

## Kaynaklar {#resources}
* **[Protokol Arabellekleri](https://developers.google.com/protocol-buffers)**

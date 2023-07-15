---
id: cli-commands
title: Perintah CLI
description: "Daftar perintah CLI dan bendera perintah untuk Polygon Edge."
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


Bagian ini memerinci perintah yang ada, bendera perintah di Polygon Edge, dan cara penggunaannya.

:::tip Mendukung output JSON

Bendera `--json` didukung pada beberapa perintah. Bendera ini menginstruksikan perintah untuk mencetak output dalam format JSON

:::

## Perintah Startup {#startup-commands}

| **Perintah** | **Deskripsi** |
|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| server | Perintah default yang memulai klien blockchain dengan melakukan bootstrap bersama semua modul |
| genesis | Menghasilkan file *genesis.json*, yang digunakan untuk mengatur kondisi rantai sebelum memulai klien. Struktur file genesis dijelaskan di bawah |
| genesis predeploy | Pre-deploys s a Smart Contract untuk jaringan segar |

### bendera server {#server-flags}


| **Semua bendera** |
|---------------------------------------|---------------------------------------------|
| [data-dir](/docs/edge/get-started/cli-commands#data-dir) | [jsonrpc](/docs/edge/get-started/cli-commands#jsonrpc) |
| [json-rpc-block-range-limit](/docs/edge/get-started/cli-commands#json-rpc-block-range-limit) | [json-rpc-batch-request-limit](/docs/edge/get-started/cli-commands#json-rpc-batch-request-limit) |
| [grpc](/docs/edge/get-started/cli-commands#grpc) | [libp2p](/docs/edge/get-started/cli-commands#libp2p) |
| [prometheus](/docs/edge/get-started/cli-commands#prometheus) | [target-gas-blok](/docs/edge/get-started/cli-commands#block-gas-target) |
| [max-peers](/docs/edge/get-started/cli-commands#max-peers) | [max-inbound-peers](/docs/edge/get-started/cli-commands#max-inbound-peers) |
| [max-outbound-peers](/docs/edge/get-started/cli-commands#max-outbound-peers)  | [max-enqueued](/docs/edge/get-started/cli-commands#max-enqueued) |
| [level-log](/docs/edge/get-started/cli-commands#log-level) | [log-ke](/docs/edge/get-started/cli-commands#log-to) |
| [rantai](/docs/edge/get-started/cli-commands#chain) | [bergabung](/docs/edge/get-started/cli-commands#join) |
| [nat](/docs/edge/get-started/cli-commands#nat) | [dns](/docs/edge/get-started/cli-commands#dns) |
| [image](/docs/edge/get-started/cli-commands#price-limit) | [max-slots](/docs/edge/get-started/cli-commands#max-slots) |
| [Konfig](/docs/edge/get-started/cli-commands#config) | [konfig-rahasia](/docs/edge/get-started/cli-commands#secrets-config) |
| [dev](/docs/edge/get-started/cli-commands#dev) | [dev-interval](/docs/edge/get-started/cli-commands#dev-interval) |
| [tidak ada-penemuan](/docs/edge/get-started/cli-commands#no-discover) | [mengembalikan](/docs/edge/get-started/cli-commands#restore) |
| [waktu-blok](/docs/edge/get-started/cli-commands#block-time) | [access-control-allow-origins](/docs/edge/get-started/cli-commands#access-control-allow-origins) |


#### <h4></h4><i>data-dir</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--data-dir DATA_DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    server --data-dir ./example-dir

</TabItem>
</Tabs>

Digunakan untuk menentukan direktori data yang menyimpan data klien Polygon Edge. Default: `./test-chain`.

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

Menentukan alamat dan port untuk layanan JSON-RPC `address:port`.   
Jika hanya port ditentukan `:10001`, itu akan mengikat ke semua antarmuka `0.0.0.0:10001`.   
Jika dihilangkan, layanan akan mengikat ke default `address:port`.   
Alamat default: `0.0.0.0:8545`.

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

Menentukan jangkauan blok maksimum yang dipertimbangkan ketika mengeksekusi permintaan json-rpc yang termasuk nilai fromBlock/toBlock (misalnya eth_getLogs). Default:`1000`.

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

Menentukan panjang maksimum yang dipertimbangkan ketika menangani permintaan batch json-rpc. Default: `20`.

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

Menentukan alamat dan port untuk layanan gRPC `address:port`. Alamat default: `127.0.0.1:9632`.

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

Menentukan alamat dan port untuk layanan libp2p `address:port`. Alamat default: `127.0.0.1:1478`.

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

Menentukan alamat dan port untuk server prometheus `address:port`.   
Jika hanya port yang ditentukan `:5001`, layanan akan mengikat ke semua antarmuka `0.0.0.0:5001`.   
Jika dihilangkan, layanan tidak akan dimulai.

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

Menentukan batas gas blok target untuk rantai . Default (tidak dilaksanakan): `0`.

Penjelasan lebih terperinci tentang target gas blok dapat ditemukan di [bagian TxPool](/docs/edge/architecture/modules/txpool#block-gas-target).

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

Menentukan jumlah peer maksimum klien. Default: `40`.

Batas peer harus ditentukan baik dengan menggunakan `max-peers` maupun bendera `max-inbound/outbound-peers`.

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

Menentukan jumlah peer maksimum klien. JIka `max-peers` ditetapkan, batas max-inbound-peer dihitung menggunakan formula berikut.

`max-inbound-peer = InboundRatio * max-peers`, di mana `InboundRatio` adalah `0.8`.

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

Menentukan jumlah peer outbound maksimum klien. Jika `max-peers` ditetapkan, jumlah max-outbound-peer dihitung menggunakan formula berikut.

`max-outbound-peer = OutboundRatio * max-peers`, di mana `OutboundRatio` adalah `0.2`.

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

Menentukan jumlah maksimum antrean transaksi per akun. Default:`128`.

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

Menentukan level log untuk output konsol. Default: `INFO`.

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

Menentukan nama file log yang akan menampung semua output log dari perintah server.
Secara default, semua log server akan ditampilkan ke konsol (stdout),
tetapi jika bendera ditetapkan, tidak akan ada output ke konsol ketika menjalankan perintah server.

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

Menentukan file genesis untuk memulai rantai. Default: `./genesis.json`.

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

Menentukan alamat peer yang harus bergabung.

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

Menentukan alamat IP eksternal tanpa port, seperti yang dapat dilihat oleh peer.

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

Menentukan alamat DNS host. Ini dapat digunakan untuk mengiklankan DNS eksternal. Dukung `dns`,`dns4`,`dns6`.

---

#### <h4></h4><i>image</i>


<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--price-limit PRICE_LIMIT]

</TabItem>
  <TabItem value="example" label="Example">

    server --price-limit 10000

</TabItem>
</Tabs>

Menentukan batas harga gas minimum untuk memberlakukan penerimaan ke dalam pool. Default: `1`.

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

Menentukan slot maksimum dalam pool. Default: `4096`.

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

Menentukan jalur ke konfigurasi CLI. Mendukung `.json`.

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

Menentukan jalur ke file konfigurasi SecretsManager. Digunakan untuk Hashicorp Vault, AWS SSM, dan Manajer Rahasia GCP. Jika dihilangkan, manajer rahasia FS lokal akan digunakan.

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

Menentukan klien ke mode dev. Default `false`: Dalam mode dev, penemuan peer dinonaktifkan secara default.

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

Menentukan interval notifikasi dev klien dalam beberapa detik. Default: `0`.

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

Mencegah klien menemukan peer lain. Default: `false`.

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

Mengembalikan blok dari file arsip yang ditentukan

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

Menetapkan waktu produksi blok dalam beberapa detik. Default: `2`

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

Menentukan domain yang diotorisasi untuk dapat berbagi respons dari permintaan JSON-RPC.   
Tambah beberapa bendera `--access-control-allow-origins "https://example1.com" --access-control-allow-origins "https://example2.com"` untuk mengotorisasi beberapa domain.   
Jika dihilangkan header Access-Control-Allow-Origins akan ditetapkan ke `*` dan semua domain akan diotorisasi.

---

### bendera genesis {#genesis-flags}
| **Semua bendera genesis** |
|---------------------------------------|---------------------------------------------|
| [dir](/docs/edge/get-started/cli-commands#dir) | [nama](/docs/edge/get-started/cli-commands#name) |
| [pos](/docs/edge/get-started/cli-commands#pos) | [epoch-size](/docs/edge/get-started/cli-commands#epoch-size) |
| [premine](/docs/edge/get-started/cli-commands#premine) | [chainid](/docs/edge/get-started/cli-commands#chainid) |
| [tipe-validator-ibft](/docs/edge/get-started/cli-commands#ibft-validator-type) | [jalur-prefiks-validator-ibft](/docs/edge/get-started/cli-commands#ibft-validators-prefix-path) |
| [validator-ibft](/docs/edge/get-started/cli-commands#ibft-validator) | [batas-gas-blok](/docs/edge/get-started/cli-commands#block-gas-limit) |
| [konsensus](/docs/edge/get-started/cli-commands#consensus) | [bootnode](/docs/edge/get-started/cli-commands#bootnode) |
| [jumlah-validator-maksimal](/docs/edge/get-started/cli-commands#max-validator-count) | [jumlah-validator-minimal](/docs/edge/get-started/cli-commands#min-validator-count) |


#### <h4></h4><i>dir</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--dir DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --dir ./genesis.json

</TabItem>
</Tabs>

Menentukan direktori untuk data genesis Polygon Edge. Default: `./genesis.json`.

---

#### <h4></h4><i>Nama</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--name NAME]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --name test-chain

</TabItem>
</Tabs>

Menentukan nama rantai ini. Default: `polygon-edge`.

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

Menentukan bendera yang mengindikasikan bahwa klien harus menggunakan Proof of Stake IBFT.
Default pada Proof of Authority jika bendera tidak disediakan atau `false`.

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

Menentukan ukuran epoch untuk rantai ini. Default `100000`.

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

Menentukan akun premined dan saldo dalam format `address:amount`.
Jumlah dapat berada dalam desimal atau hex.
Default telah ditambang keseimbangan: `0xD3C21BCECCEDA1000000`(1 juta token mata uang asli).

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

Menentukan ID rantai. Default: `100`.

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

Menentukan mode validasi header blok. Nilai yang mungkin: `[ecdsa, bls]`. Default: `bls`.

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

Jalur prefiks untuk direktori folder validator. Perlu ada jika bendera `ibft-validator` dihilangkan.

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

Menentukan alamat yang diteruskan sebagai validator IBFT. Perlu ada jika bendera `ibft-validators-prefix-path` dihilangkan.
1. Jika jaringan berjalan dengan ECDSA, formatnya adalah `--ibft-validator [ADDRESS]`.
2. Jika jaringan berjalan dengan BLS, formatnya adalah  `--ibft-validator [ADDRESS]:[BLS_PUBLIC_KEY]`.

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

Mengacu jumlah gas maksimum yang digunakan oleh semua operasi di blok. Default: `5242880`.

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

Menentukan protokol konsensus. Default: `pow`.

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

Multiaddr URL untuk p2p discovery bootstrap. Bendera ini dapat digunakan beberapa kali.
Alih-alih alamat IP, alamat DNS dari bootnode dapat disediakan.

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

Jumlah maksimum staker yang dapat bergabung dengan set validator dalam konsensus PoS.
Jumlah ini tidak boleh melebihi nilai MAX_SAFE_INTEGER (2^53 - 2).

---

#### <h4></h4><i>jumlah-validator-minimal</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--min-validator-count MIN_VALIDATOR_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --min-validator-count 4

</TabItem>
</Tabs>

Jumlah minimum staker yang diperlukan untuk bergabung dengan set validator dalam konsensus PoS.
Nomor ini tidak dapat melebihi nilai max-validator-count.
Default ke 1.

---

### genesis predeploy {#genesis-predeploy-flags}

<h4><i>arti path</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis predeploy [--artifacts-path PATH_TO_ARTIFACTS]

</TabItem>
  <TabItem value="example" label="Example">

    genesis predeploy --artifacts-path ./ArtifactsData.json

</TabItem>
</Tabs>

Menampilkan jalur ke artefak kontrak JSON yang berisi `abi`, `bytecode`dan .`deployedBytecode`

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

Menampilkan jalur ke `genesis.json`file yang harus diperbarui. Default `./genesis.json`.

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

Menampilkan argumen konstruktor Smart Contract jika ada. Untuk panduan rinci tentang bagaimana argumen ini harus terlihat seperti, silakan merujuk [artikel pra-penyebaran](/docs/edge/additional-features/predeployment)

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

Menampilkan alamat untuk melakukan predeploy Default `0x0000000000000000000000000000000000001100`.

---


## Perintah Operator {#operator-commands}

### Perintah Peer {#peer-commands}

| **Perintah** | **Deskripsi** |
|------------------------|-------------------------------------------------------------------------------------|
| peers add | Menambahkan peer baru menggunakan alamat libp2p mereka |
| peers list | Daftar semua peer klien terhubung melalui libp2p |
| peers status | Mengembalikan status peer spesifik dari daftar peer menggunakan alamat libp2p |

<h3>bendera peers add</h3>

<h4><i>addr</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers add --addr PEER_ADDRESS

</TabItem>
  <TabItem value="example" label="Example">

    peers add --addr /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

Alamat libp2p peer dalam format multiaddr.

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

Alamat API gRPC. Default: `127.0.0.1:9632`.

<h3>bendera peers list</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers list [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    peers list --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Alamat API gRPC. Default: `127.0.0.1:9632`.

<h3>bendera peers status</h3>

<h4><i>peer-id</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers status --peer-id PEER_ID

</TabItem>
  <TabItem value="example" label="Example">

    peers status --peer-id 16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

ID node libp2p dari peer tertentu dalam jaringan p2p.

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

Alamat API gRPC. Default: `127.0.0.1:9632`.

### Perintah IBFT {#ibft-commands}

| **Perintah** | **Deskripsi** |
|------------------------|-------------------------------------------------------------------------------------|
| ibft snapshot | Mengembalikan snapshot IBFT |
| ibft candidates | Kueri set kandidat yang diusulkan saat ini, juga kandidat yang belum disertakan |
| ibft propose | Menentukan kandidat baru untuk ditambahkan/dihapus dari set validator |
| ibft status | Mengembalikan status keseluruhan klien IBFT |
| ibft switch | Tambah konfigurasi fork ke dalam file genesis.json untuk mengganti jenis IBFT |
| ibft quorum | Menentukan nomor blok, kemudian metode ukuran kuorum optimal akan digunakan untuk konsensus |


<h3>bendera ibft snapshot</h3>

<h4><i>number</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft snapshot [--number BLOCK_NUMBER]

</TabItem>
  <TabItem value="example" label="Example">

    ibft snapshot --number 100

</TabItem>
</Tabs>

Tinggi blok (nomor) untuk snapshot.

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

Alamat API gRPC. Default: `127.0.0.1:9632`.

<h3>bendera ibft candidates</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft candidates [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    ibft candidates --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Alamat API gRPC. Default: `127.0.0.1:9632`.

<h3>bendera ibft propose</h3>

<h4><i>vote</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft propose --vote VOTE

</TabItem>
  <TabItem value="example" label="Example">

    ibft propose --vote auth

</TabItem>
</Tabs>

Mengusulkan perubahan ke set validator. Nilai yang mungkin: `[auth, drop]`.

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

Alamat akun yang akan dipilih.

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

Akun Kunci Publik BLS untuk dipilih, hanya perlu dalam mode BLS.

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

Alamat API gRPC. Default: `127.0.0.1:9632`.

<h3>bendera ibft status</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    ibft status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Alamat API gRPC. Default: `127.0.0.1:9632`.

<h3>bendera ibft switch</h3>

<h4><i>chain</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --chain genesis.json

</TabItem>
</Tabs>

Menentukan file genesis untuk memutakhirkan. Default: `./genesis.json`.

---

<h4><i>Jenis</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--type TYPE]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --type PoS

</TabItem>
</Tabs>

Menentukan tipe IBFT untuk dialihkan. Nilai yang mungkin: `[PoA, PoS]`.

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

Menentukan tinggi penyebaran kontrak. Hanya tersedia dengan PoS.

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

Menentukan mode validasi header blok. Nilai yang mungkin: `[ecdsa, bls]`. Default: `bls`.

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

Jalur prefiks untuk direktori validator baru. Perlu ada jika bendera `ibft-validator` dihilangkan. Hanya tersedia ketika mode IBFT adalah PoA (bendera `--pos` dihilangkan).

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

Set yang diteruskan pada alamat sebagai validator IBFT akan digunakan setelah fork. Perlu ada jika bendera `ibft-validators-prefix-path` dihilangkan. Hanya tersedia dalam mode PoA.
1. Jika jaringan berjalan dengan ECDSA, formatnya adalah `--ibft-validator [ADDRESS]`.
2. Jika jaringan berjalan dengan BLS, formatnya adalah  `--ibft-validator [ADDRESS][BLS_PUBLIC_KEY]`.

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

Jumlah maksimum staker yang dapat bergabung dengan set validator dalam konsensus PoS.
Jumlah ini tidak boleh melebihi nilai MAX_SAFE_INTEGER (2^53 - 2).

---

<h4><i>jumlah-validator-minimal</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--min-validator-count MIN_VALIDATOR_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --min-validator-count 4

</TabItem>
</Tabs>

Jumlah minimum staker yang diperlukan untuk bergabung dengan set validator dalam konsensus PoS.
Nomor ini tidak dapat melebihi nilai max-validator-count.
Default ke 1.

Menentukan tinggi awal fork.

---

<h3>bendera ibft quorum</h3>

<h4><i>from</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft quorum [--from your_quorum_switch_block_num]

</TabItem>
  <TabItem value="example" label="Example">

    ibft quorum --from 350

</TabItem>
</Tabs>

Tinggi untuk mengalihkan perhitungan quorum ke QuorumOptimal yang menggunakan formula `(2/3 * N)`, `N` menjadi nomor node validator. Harap diperhatikan bahwa ini untuk kompatibilitas mundur, yaitu hanya untuk rantai yang menggunakan perhitungan lama Quorum sampai tinggi blok tertentu.

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

Menentukan file genesis untuk memutakhirkan. Default: `./genesis.json`.

### Perintah Pool Transaksi {#transaction-pool-commands}

| **Perintah** | **Deskripsi** |
|------------------------|--------------------------------------------------------------------------------------|
| txpool status | Menghasilkan jumlah transaksi di dalam pool |
| txpool subscribe | Berlangganan peristiwa dalam pool transaksi |

<h3>bendera txpool status</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    txpool status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Alamat API gRPC. Default: `127.0.0.1:9632`.

<h3>bendera txpool subscribe</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Alamat API gRPC. Default: `127.0.0.1:9632`.

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

Berlangganan peristiwa tx yang dipromosikan di TxPool.

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

Berlangganan peristiwa tx yang dikeluarkan dari TxPool

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

Berlangganan peristiwa tx yang diturunkan di TxPool.

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

Berlangganan peristiwa tx yang ditambahkan ke TxPool.

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

Berlangganan peristiwa tx yang diantrekan di antrean akun.

---

### Perintah blockchain {#blockchain-commands}

| **Perintah** | **Deskripsi** |
|------------------------|-------------------------------------------------------------------------------------|
| status | Menampilkan status klien. Respons terperinci dapat ditemukan berikut ini |
| monitor | Berlangganan aliran peristiwa blockchain. Respons terperinci dapat ditemukan berikut ini |
| version | Mengembalikan versi klien saat ini |

<h3>bendera status</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Alamat API gRPC. Default: `127.0.0.1:9632`.

<h3>bendera monitor</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    monitor [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    monitor --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Alamat API gRPC. Default: `127.0.0.1:9632`

---
<h3>perintah versi</h3>


<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    version

</TabItem>
</Tabs>

Menampilkan versi rilis git, hash commit dan waktu built.

## Perintah Rahasia {#secrets-commands}

| **Perintah** | **Deskripsi** |
|-------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| secrets init | Menjalankan kunci privat untuk pengelola rahasia terkait |
| secrets generate | Menghasilkan file konfigurasi manajer rahasia yang dapat diurai oleh Polygon Edge |
| output rahasia | Menampilkan alamat kunci publik BLS, alamat kunci publik validator, dan node id untuk referensi |

### bendera init rahasia {#secrets-init-flags}

<h4><i>config</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets init [--config SECRETS_CONFIG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets init --config ./secretsManagerConfig.json

</TabItem>
</Tabs>

Menentukan jalur ke file konfigurasi SecretsManager. Digunakan untuk Hashicorp Vault. Jika dihilangkan, pengelola rahasia FS lokal akan digunakan.

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

Menentukan direktori data Polygon Edge jika FS lokal digunakan.

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

Menentukan bendera yang mengindikasikan apakah akan menghasilkan kunci ECDSA. Default: `true`.

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

Menentukan bendera yang mengindikasikan apakah akan menghasilkan kunci jaringan Libp2p. Default: `true`.

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

Menentukan bendera yang mengindikasikan apakah akan menghasilkan kunci BLS. Default: `true`.

### bendera secrets generate {#secrets-generate-flags}

<h4><i>dir</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--dir DATA_DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --dir ./example-dir

</TabItem>
</Tabs>

Menentukan direktori file konfigurasi pengelola rahasia Default: `./secretsManagerConfig.json`

---

<h4><i>Jenis</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--type TYPE]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --type hashicorp-vault

</TabItem>
</Tabs>

Menentukan tipe pengelola rahasia [`hashicorp-vault`]. Default: `hashicorp-vault`

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

Menentukan token akses untuk layanan

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

Menentukan URL server untuk layanan

---

<h4><i>Nama</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--name NODE_NAME]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --name node-1

</TabItem>
</Tabs>

Menentukan nama node untuk arsip rekaman layanan. Default: `polygon-edge-node`

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

Menentukan namespace yang digunakan untuk pengelola rahasia Hashicorp Vault. Default: `admin`

### tanda keluaran archive {#secrets-output-flags}

<h4><i>bls</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--bls FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --bls

</TabItem>
</Tabs>

Menampilkan bendera yang menunjukkan apakah hanya mengeluarkan kunci publik BLS. Default: `true`

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

Menentukan jalur ke file konfigurasi SecretsManager. Jika dihilangkan, manajer rahasia FS lokal digunakan.

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

Menentukan direktori data Polygon Edge jika FS lokal digunakan.

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

Menampilkan bendera yang menunjukkan apakah hanya mengeluarkan node ID jaringan. Default: `true`

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

Menampilkan bendera yang menunjukkan apakah hanya mengeluarkan alamat validator. Default: `true`

---

## Respons {#responses}

### Respons Status {#status-response}

Objek respons didefinisikan menggunakan Protokol Buffer.
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

### Respons Monitor {#monitor-response}
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

## Penggunaan {#utilities}

### perintah whitelist {#whitelist-commands}

| **Perintah** | **Deskripsi** |
|------------------------|-------------------------------------------------------------------------------------|
| whitelist show | Menampilkan informasi whitelist |
| whitelist deployment | Memperbarui whitelist penyebaran kontrak cerdas |

<h3> whitelist show </h3>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist show

</TabItem>
</Tabs>

Menampilkan informasi whitelist.

---

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist show [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist show --chain genesis.json

</TabItem>
</Tabs>

Menentukan file genesis untuk memutakhirkan. Default: `./genesis.json`.

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

Menentukan file genesis untuk memutakhirkan. Default: `./genesis.json`.

---

<h4><i>tambah</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist deployment [--add ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist deployment --add 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d

</TabItem>
</Tabs>

Menambahkan alamat baru ke whitelist penyebaran kontrak. Hanya alamat di whitelist penyebaran kontrak yang dapat menyebarkan kontrak. Jika kosong, alamat apa pun dapat menjalankan penyebaran kontrak

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

Menghapus alamat dari whitelist penyebaran kontrak. Hanya alamat di whitelist penyebaran kontrak yang dapat menyebarkan kontrak.  Jika kosong, alamat apa pun dapat menjalankan penyebaran kontrak

---

### bendera backup {#backup-flags}

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    backup [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    backup --grpc-address 127.0.0.1:9632

</TabItem>
</Tabs>

Alamat API gRPC. Default: `127.0.0.1:9632`.

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

Jalur file arsip yang akan disimpan.

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

Tinggi awal blok di arsip. Default: 0.

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

Tinggi akhir blok di arsip.

---

## Templat Genesis {#genesis-template}
File genesis harus digunakan untuk mengatur kondisi awal blockchain (misalnya, jika beberapa akun harus memiliki saldo awal).

File *./genesis.json* berikut dihasilkan:
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

### Direktori Data {#data-directory}

Ketika mengeksekusi bendera *data-dir*, folder **test-chain** dihasilkan.
Struktur folder terdiri dari subfolder berikut:
* **blockchain** - Menyimpan LevelDB untuk objek blockchain
* **trie** - Menyimpan LevelDB untuk pohon Merkle
* **keystore** - Menyimpan kunci privat untuk klien. Ini termasuk kunci privat libp2p dan kunci privat penyegel/validator
* **consensus** - Menyimpan informasi konsensus apa pun yang mungkin dibutuhkan klien ketika bekerja

## Sumber daya {#resources}
* **[Buffer Protokol](https://developers.google.com/protocol-buffers)**

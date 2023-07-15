---
id: cli-commands
title: CLI Befehle
description: "Liste der CLI-Befehle und command flags für Polygon Edge."
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


Dieser Abschnitt enthält die aktuellen Befehle, die command flags in der Polygon Edge und wie sie verwendet werden.

:::tip Unterstützung für die JSON Ausgabe

Die  `--json`Flag wird auf einigen Befehlen unterstützt. Diese Flag weist den Befehl an, die Ausgabe im JSON-Format zu drucken

:::

## Startup Befehle {#startup-commands}

| **Befehl** | **Beschreibung** |
|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Server | Der Standardbefehle, der den Blockchain Client startet, indem alle Module zusammenlädt |
| genesis | Generiert eine *genesis.json* Datei, die verwendet wird, um einen vorbestimmten Chain Status festzulegen, bevor du den Client startest. Die Struktur der genesis Datei ist unten beschrieben |
| genesis predeploy | Predeploys einen Smart Contract für frische Netzwerke |

### Server Flags {#server-flags}


| **Alle server** |
|---------------------------------------|---------------------------------------------|
| [data-dir](/docs/edge/get-started/cli-commands#data-dir) | [jsonrpc](/docs/edge/get-started/cli-commands#jsonrpc) |
| [json-rpc-block-range-limit](/docs/edge/get-started/cli-commands#json-rpc-block-range-limit) | [json-rpc-batch-request-limit](/docs/edge/get-started/cli-commands#json-rpc-batch-request-limit) |
| [GRPC](/docs/edge/get-started/cli-commands#grpc) | [libp2p](/docs/edge/get-started/cli-commands#libp2p) |
| [prometheus](/docs/edge/get-started/cli-commands#prometheus) | [block-gas-target](/docs/edge/get-started/cli-commands#block-gas-target) |
| [max-Peers](/docs/edge/get-started/cli-commands#max-peers) | [max-inbound-Peers](/docs/edge/get-started/cli-commands#max-inbound-peers) |
| [max-outbound-Peers](/docs/edge/get-started/cli-commands#max-outbound-peers) | [max-enqueued](/docs/edge/get-started/cli-commands#max-enqueued) |
| [log-Level](/docs/edge/get-started/cli-commands#log-level) | [log-to](/docs/edge/get-started/cli-commands#log-to) |
| [Chain](/docs/edge/get-started/cli-commands#chain) | [mitmachen](/docs/edge/get-started/cli-commands#join) |
| [nat](/docs/edge/get-started/cli-commands#nat) | [dns](/docs/edge/get-started/cli-commands#dns) |
| [price-limit](/docs/edge/get-started/cli-commands#price-limit) | [max-Slots](/docs/edge/get-started/cli-commands#max-slots) |
| [config](/docs/edge/get-started/cli-commands#config) | [secrets-config](/docs/edge/get-started/cli-commands#secrets-config) |
| [dev](/docs/edge/get-started/cli-commands#dev) | [dev-interval](/docs/edge/get-started/cli-commands#dev-interval) |
| [no-Discover](/docs/edge/get-started/cli-commands#no-discover) | [wiederherstellen](/docs/edge/get-started/cli-commands#restore) |
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

`./test-chain`Wird verwendet, um das Datenverzeichnis anzugeben, das für die Speicherung von Polygon Edge Clientdaten verwendet wird.

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

Setzt die Adresse und den Port für den JSON-RPC Service `address:port`   . `0.0.0.0:10001`   Wenn nur Port definiert ist  wird `:10001`er an alle Schnittstellen gebunden Wenn der Dienst nicht mehr an den Standard `address:port`   bindet. Standardadresse: `0.0.0.0:8545`.

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

Setzt den maximalen Blockbereich, der bei der Ausführung von json-rpc Requests berücksichtigt werden soll, die fromBlock/toBlock Werte enthalten (z.B. eth_getLogs). Default:`1000`.

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

Setzt die maximale Länge, die bei der Bearbeitung von json-rpc berücksichtigt werden soll. `20`Standard:

---

#### <h4></h4><i>GRPC</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    server --grpc-address 127.0.0.1:10001

</TabItem>
</Tabs>

Setzt die Adresse und den Port für den gRPC Service `address:port`. Standardadresse: `127.0.0.1:9632`.

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

Setzt die Adresse und den Port für den libp2p Service `address:port`. Standardadresse: `127.0.0.1:1478`.

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

Setzt die Adresse und den Port für prometheus Server `address:port`   . Wenn nur Port definiert ist `0.0.0.0:5001`   , wird `:5001`der Dienst an alle Schnittstellen gebunden Wenn der Dienst nicht ausgelassen wird, wird nicht gestartet.

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

Setzt das target block gas Limit für die Chain . Standard (nicht durchgesetzt): `0`.

Eine ausführlichere Erklärung zum block findest du im [Abschnitt](/docs/edge/architecture/modules/txpool#block-gas-target) TxPool.

---

#### <h4></h4><i>max-Peers</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--max-peers PEER_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    server --max-peers 40

</TabItem>
</Tabs>

Setzt die maximale Peer Count des Clients. `40`Standard:

Peer limit sollte entweder mit Hilfe von  `max-peers`oder  `max-inbound/outbound-peers`Flag angegeben

---

#### <h4></h4><i>max-inbound-Peers</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--max-inbound-peers PEER_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    server --max-inbound-peers 32

</TabItem>
</Tabs>

Setzt die maximale Inbound Peer Count des Clients. Wenn `max-peers` gesetzt wird, wird Max-inbound-Peer Grenze mit den folgenden Formeln berechnet.

`max-inbound-peer = InboundRatio * max-peers`, wo  `InboundRatio`ist `0.8`.

---

#### <h4></h4><i>max-outbound-Peers</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--max-outbound-peers PEER_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    server --max-outbound-peers 8

</TabItem>
</Tabs>

Setzt die maximale Outbound Peer Count des Clients. Wenn  gesetzt `max-peers`wird, wird max-outbound-Peer count mit den folgenden Formeln berechnet.

`max-outbound-peer = OutboundRatio * max-peers`, wo  `OutboundRatio`ist `0.2`.

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

Setzt die maximale Anzahl der angeforderten Transaktionen pro Konto. Default:`128`.

---

#### <h4></h4><i>log-Level</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--log-level LOG_LEVEL]

</TabItem>
  <TabItem value="example" label="Example">

    server --log-level DEBUG

</TabItem>
</Tabs>

Setzt den Log-Level für die Ausgabe der Konsole. `INFO`Standard:

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

Definiert den Protokolldateinamen, der alle Protokollausgabe aus dem server hält. Standardmäßig werden alle Server-Protokolle zur Konsole (stdout) ausgegeben, aber wenn das Flag gesetzt ist, wird es keine Ausgabe an der Konsole geben, wenn du den server ausführst.

---

#### <h4></h4><i>Chain</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    server --chain /home/ubuntu/genesis.json

</TabItem>
</Tabs>

Gibt die Genesis-Datei an, die für den Start der Chain verwendet wird. `./genesis.json`Standard:

---

#### <h4></h4><i>mitmachen</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--join JOIN_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    server --join /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

Gibt die Adresse des Peers an, die beigetreten werden sollte.

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

Setzt die externe IP-Adresse ohne den Port, wie sie von Peers zu sehen ist.

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

Setzt die host DNS Adresse. Dies kann verwendet werden, um einen externen DNS zu werben. Unterstützt `dns`,`dns4`,`dns6`.

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

Setzt das minimum für Gas Preislimit, um die Annahme in den Pool zu erzwingen. `1`Standard:

---

#### <h4></h4><i>max-Slots</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--max-slots MAX_SLOTS]

</TabItem>
  <TabItem value="example" label="Example">

    server --max-slots 1024

</TabItem>
</Tabs>

Setzt maximale Slots im Pool. `4096`Standard:

---

#### <h4></h4><i>Config</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--config CLI_CONFIG_PATH]

</TabItem>
  <TabItem value="example" label="Example">

    server --config ./myConfig.json

</TabItem>
</Tabs>

Gibt den Pfad zur CLI Config an. Unterstützt `.json`.

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

Setzt den Pfad zur SecretsManager Config Datei ein. Wird für Hashicorp Vault, AWS SSM und GCP Secrets Manager verwendet. Wenn weggelassen, wird der lokale FS secrets Manager verwendet.

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

Setzt den Client in den dev Modus. Standard: `false`. Im dev ist peer standardmäßig deaktiviert.

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

Setzt das dev notification Intervall des Clients in Sekunden ein. `0`Standard:

---

#### <h4></h4><i>no-Discover</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--no-discover NO_DISCOVER]

</TabItem>
  <TabItem value="example" label="Example">

    server --no-discover

</TabItem>
</Tabs>

Hindert den Client daran, andere Peers zu entdecken. `false`Standard:

---

#### <h4></h4><i>wiederherstellen</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--restore RESTORE]

</TabItem>
  <TabItem value="example" label="Example">

    server --restore backup.dat

</TabItem>
</Tabs>

Stellen Sie Blöcke aus der angegebenen Archivdatei wieder her

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

Stellt die Block-Produktionszeit in Sekunden ein. Default:`2`

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

Setzt die autorisierten Domains um Antworten von JSON-RPC Anfragen zu    teilen.    Füge mehrere Flags  hinzu, `--access-control-allow-origins "https://example1.com" --access-control-allow-origins "https://example2.com"`um mehrere Domains zu autorisieren. Wenn der Access-Control-Allow-Origins Header auf  eingestellt wird `*`und alle Domains autorisiert werden.

---

### genesis flags {#genesis-flags}
| **Alle genesis Flags** |
|---------------------------------------|---------------------------------------------|
| [dir](/docs/edge/get-started/cli-commands#dir) | [Name](/docs/edge/get-started/cli-commands#name) |
| [PoS](/docs/edge/get-started/cli-commands#pos) | [epoch-size](/docs/edge/get-started/cli-commands#epoch-size) |
| [premine](/docs/edge/get-started/cli-commands#premine) | [chainid](/docs/edge/get-started/cli-commands#chainid) |
| [ibft-validator-type](/docs/edge/get-started/cli-commands#ibft-validator-type) | [ibft-validators-prefix-path](/docs/edge/get-started/cli-commands#ibft-validators-prefix-path) |
| [ibft-validator](/docs/edge/get-started/cli-commands#ibft-validator) | [block-gas-limit](/docs/edge/get-started/cli-commands#block-gas-limit) |
| [Konsens](/docs/edge/get-started/cli-commands#consensus) | [bootnode](/docs/edge/get-started/cli-commands#bootnode) |
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

Setzt das Verzeichnis für Polygon Edge genesis Daten. Default: `./genesis.json`.

---

#### <h4></h4><i>Name</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--name NAME]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --name test-chain

</TabItem>
</Tabs>

Setzt den Namen für die Chain. `polygon-edge`Standard:

---

#### <h4></h4><i>PoS</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--pos IS_POS]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --pos

</TabItem>
</Tabs>

Setzt die Flag, die anzeigt, dass der Client Proof of Stake IBFT verwenden sollte. Defaults zu Proof of Authority wenn Flag nicht bereitgestellt wird oder `false`.

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

Setzt die epoch für die Chain. `100000`Standard.

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

Setzt die vorab entwickelten Konten und Salden im Format `address:amount`. Die Menge kann entweder in Dezimal oder in Hex sein. Default Balance: `0xD3C21BCECCEDA1000000`(1 Million native currency

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

Setzt die ID der Chain. `100`Standard:

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

Gibt den validation Modus von Block Header an. Mögliche Werte: `[ecdsa, bls]`. `bls`Standard:

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

Prefix Pfad für validator Ordner Directory. Muss vorhanden sein, wenn die Flag weggelassen `ibft-validator`wird.

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

Setzt Adressen als IBFT validatoren. Muss vorhanden sein, wenn die Flag weggelassen `ibft-validators-prefix-path`wird.
1. Wenn das Netzwerk mit ECDSA läuft, ist das Format `--ibft-validator [ADDRESS]`.
2. Wenn das Netzwerk mit BLS läuft, ist das Format  `--ibft-validator [ADDRESS]:[BLS_PUBLIC_KEY]`.

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

Bezieht sich auf die maximale Menge an Gas, das von allen Operationen in einem Block verwendet wird. `5242880`Standard:

---

#### <h4></h4><i>Konsens</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--consensus CONSENSUS_PROTOCOL]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --consensus ibft

</TabItem>
</Tabs>

Sets consensus protocol. `pow`Standard:

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

Multiaddr URL für p2p discovery bootstrap. Diese Flag kann mehrmals verwendet werden. Anstelle einer IP-Adresse kann die DNS Adresse des bootnode bereitgestellt werden.

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

Die maximale Anzahl an Stakers, die in der Lage sind, dem validator in einem PoS Konsens beizutreten. Diese Zahl kann den Wert von MAX_SAFE_INTEGER (2^53 - 2) nicht überschreiten.

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

Die minimale Anzahl an Stakers benötigt, um dem validator in einem PoS Konsens beizutreten. Diese Zahl kann den Wert von max-validator-count nicht überschreiten. Standardmäßig auf 1.

---

### genesis predeploy flags {#genesis-predeploy-flags}

<h4><i>artifacts-path</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis predeploy [--artifacts-path PATH_TO_ARTIFACTS]

</TabItem>
  <TabItem value="example" label="Example">

    genesis predeploy --artifacts-path ./ArtifactsData.json

</TabItem>
</Tabs>

Setzt den Pfad zu den contract JSON, die die `abi`enthält, `bytecode`und .`deployedBytecode`

---

<h4><i>Chain</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis predeploy [--chain PATH_TO_GENESIS]

</TabItem>
  <TabItem value="example" label="Example">

    genesis predeploy --chain ./genesis.json

</TabItem>
</Tabs>

Setzt den Pfad zur `genesis.json`Datei, die aktualisiert werden soll. `./genesis.json`Standard.

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

Setzt die Argumente des Smart Contract Konstruktors fest, falls vorhanden. Für einen detaillierten Leitfaden darüber, wie diese Argumente aussehen sollen, referiere bitte [Predeployment Artikel](/docs/edge/additional-features/predeployment).

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

Setzt die Adresse für die predeploy fest. `0x0000000000000000000000000000000000001100`Standard.

---


## Bedienerbefehle {#operator-commands}

### Peer Befehle {#peer-commands}

| **Befehl** | **Beschreibung** |
|------------------------|-------------------------------------------------------------------------------------|
| Peers hinzufügen | Fügt einen neuen Peer mit libp2p Adresse hinzu |
| Peers Liste | Listet alle Peers auf, mit denen der Client über libp2p verbunden ist |
| Peers Status | Gibt den Status eines bestimmten Peers aus der Peers Liste mit der libp2p Adresse zurück |

<h3>Peers fügen Flags hinzu</h3>

<h4><i>addr</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers add --addr PEER_ADDRESS

</TabItem>
  <TabItem value="example" label="Example">

    peers add --addr /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

Peers libp2p Adresse im Multiaddr Format.

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

Adresse der gRPC API. `127.0.0.1:9632`Standard:

<h3>Peers list Flags</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers list [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    peers list --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Adresse der gRPC API. `127.0.0.1:9632`Standard:

<h3>Peers Status Flags</h3>

<h4><i>peer-id</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers status --peer-id PEER_ID

</TabItem>
  <TabItem value="example" label="Example">

    peers status --peer-id 16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

Libp2p node ID eines bestimmten Peer innerhalb des p2p Netzwerks.

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

Adresse der gRPC API. `127.0.0.1:9632`Standard:

### IBFT Befehle {#ibft-commands}

| **Befehl** | **Beschreibung** |
|------------------------|-------------------------------------------------------------------------------------|
| ibft Snapshot | Gibt den IBFT Snapshot zurück |
| ibft Kandidaten | Dieser Befehl fragt die aktuelle Menge der vorgeschlagenen Kandidaten ab, sowie die Kandidaten, die noch nicht aufgenommen wurden |
| ibft Vorschlag | Schlägt einen neuen Kandidaten, der hinzugefügt oder aus dem validator entfernt werden soll |
| ibft Status | Gibt den Gesamtstatus des IBFT Clients zurück |
| ibft Switch | Füge Fork Konfigurationen in die genesis.json Datei hinzu um den IBFT Typ zu schalten |
| ibft quorum | Gibt die Blocknummer an, nach der die optimale quorum Methode für das Erreichen des Konsens verwendet wird |


<h3>ibft Snapshot Flags</h3>

<h4><i>Nummer</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft snapshot [--number BLOCK_NUMBER]

</TabItem>
  <TabItem value="example" label="Example">

    ibft snapshot --number 100

</TabItem>
</Tabs>

Die Blockhöhe (Nummer) für den Snapshot.

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

Adresse der gRPC API. `127.0.0.1:9632`Standard:

<h3>ibft candidates flags</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft candidates [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    ibft candidates --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Adresse der gRPC API. `127.0.0.1:9632`Standard:

<h3>ibft schlagen Flags vor</h3>

<h4><i>Abstimmung</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft propose --vote VOTE

</TabItem>
  <TabItem value="example" label="Example">

    ibft propose --vote auth

</TabItem>
</Tabs>

Schlage eine Änderung des validator vor. Mögliche Werte:`[auth, drop]`

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

Adresse des Kontos, für das du stimmen sollst.

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

BLS Public Key des Kontos für das gewählt werden soll, nur im BLS Modus notwendig

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

Adresse der gRPC API. `127.0.0.1:9632`Standard:

<h3>ibft status flags</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    ibft status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Adresse der gRPC API. `127.0.0.1:9632`Standard:

<h3>ibft switch Flags</h3>

<h4><i>Chain</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --chain genesis.json

</TabItem>
</Tabs>

Gibt die genesis Datei an, die aktualisiert werden soll. `./genesis.json`Standard:

---

<h4><i>Art</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--type TYPE]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --type PoS

</TabItem>
</Tabs>

Gibt den IBFT Typ an, den sie umschalten sollen. Mögliche Werte: `[PoA, PoS]`.

---

<h4><i>Bereitstellung</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--deployment DEPLOYMENT]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --deployment 100

</TabItem>
</Tabs>

Gibt die Höhe der contract Bereitstellung an. Nur mit PoS verfügbar.

---

<h4><i>von</i></h4>

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

Gibt den validation Modus von Block Header an. Mögliche Werte: `[ecdsa, bls]`. `bls`Standard:

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

Prefix Pfad für die Verzeichnisse der neuen validatoren Muss vorhanden sein, wenn die Flag weggelassen `ibft-validator`wird. Verfügbar nur wenn der IBFT Modus PoA ist ( `--pos`Flag wird weggelassen).

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

Sets wurden in Adressen als IBFT validators übergeben, die nach der Fork verwendet werden. Muss vorhanden sein, wenn die Flag weggelassen `ibft-validators-prefix-path`wird. Verfügbar nur im PoA Modus.
1. Wenn das Netzwerk mit ECDSA läuft, ist das Format `--ibft-validator [ADDRESS]`.
2. Wenn das Netzwerk mit BLS läuft, ist das Format  `--ibft-validator [ADDRESS][BLS_PUBLIC_KEY]`.

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

Die maximale Anzahl an Stakers, die in der Lage sind, dem validator in einem PoS Konsens beizutreten. Diese Zahl kann den Wert von MAX_SAFE_INTEGER (2^53 - 2) nicht überschreiten.

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

Die minimale Anzahl an Stakers benötigt, um dem validator in einem PoS Konsens beizutreten. Diese Zahl kann den Wert von max-validator-count nicht überschreiten. Standardmäßig auf 1.

Gibt die Anfangshöhe der Fork an.

---

<h3>ibft quorum flags</h3>

<h4><i>von</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft quorum [--from your_quorum_switch_block_num]

</TabItem>
  <TabItem value="example" label="Example">

    ibft quorum --from 350

</TabItem>
</Tabs>

`(2/3 * N)``N`Die Höhe um die quorum Kalkulation auf QuorumOptimal zu wechseln, die die Formel verwendet, ist die Anzahl der validator Knoten. Bitte beachte, dass dies für die Abwärtskompatibilität bestimmt ist, dh nur für Chains, die eine Quorum Legacy Berechnung bis zu einer bestimmten Blockhöhe verwendet haben.

---

<h4><i>Chain</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft quorum [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    ibft quorum --chain genesis.json

</TabItem>
</Tabs>

Gibt die genesis Datei an, die aktualisiert werden soll. `./genesis.json`Standard:

### Transaction Pool Befehle {#transaction-pool-commands}

| **Befehl** | **Beschreibung** |
|------------------------|--------------------------------------------------------------------------------------|
| txpool Status | Gibt die Anzahl der Transaktionen im Pool zurück |
| txpool subscribe | Abonniert für Events im Transaktionspool |

<h3>txpool status Flags</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    txpool status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Adresse der gRPC API. `127.0.0.1:9632`Standard:

<h3>txpool subscribe Flags</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Adresse der gRPC API. `127.0.0.1:9632`Standard:

---

<h4><i>gefördert</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--promoted LISTEN_PROMOTED]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --promoted

</TabItem>
</Tabs>

Abonniert für beworbene tx Events im TxPool.

---

<h4><i>gelöscht</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--dropped LISTEN_DROPPED]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --dropped

</TabItem>
</Tabs>

Abonniert für dropped tx Events im TxPool.

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

Abonniert für demoted tx Events im TxPool.

---

<h4><i>hinzugefügt</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--added LISTEN_ADDED]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --added

</TabItem>
</Tabs>

Abonniert für zusätzliche tx Events zum TxPool.

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

Abonniert für enqueued tx Events in den Konto Warteschlangen.

---

### Blockchain Befehle {#blockchain-commands}

| **Befehl** | **Beschreibung** |
|------------------------|-------------------------------------------------------------------------------------|
| Status | Gibt den Status des Clients zurück. Die detaillierte Antwort kann unten gefunden  |
| Monitor | Abonniert einen Blockchain Event Stream. Die detaillierte Antwort kann unten gefunden  |
| Version | Gibt die aktuelle Version des Clients zurück |

<h3>status-Flags</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Adresse der gRPC API. `127.0.0.1:9632`Standard:

<h3>monitor flags</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    monitor [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    monitor --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Adresse der gRPC API. `127.0.0.1:9632`Standard:

---
<h3>Version-Befehl</h3>


<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    version

</TabItem>
</Tabs>

Zeigt Release-Version, git branch, bekomme Hash und Build-Zeit.

## Secrets Befehle {#secrets-commands}

| **Befehl** | **Beschreibung** |
|-------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| secrets init | Initialisiert die privaten Keys zum entsprechenden Secrets Manager |
| secrets generieren | Generiert eine secrets manager Konfigurationsdatei, die von dem Polygon Edge analysiert werden kann |
| secrets Ausgabe | Druckt die öffentlichen key die öffentliche address, des Prüfers und den Knoten-ID für die Referenz |

### secrets init Flag {#secrets-init-flags}

<h4><i>Config</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets init [--config SECRETS_CONFIG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets init --config ./secretsManagerConfig.json

</TabItem>
</Tabs>

Setzt den Pfad zur SecretsManager Config Datei ein. Wird für Hashicorp Vault verwendet. Wenn weggelassen, wird der lokale FS secrets Manager verwendet.

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

Setzt das Verzeichnis für die Polygon Edge Daten, wenn der lokale FS verwendet wird.

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

Setzt das Flag mit dem Hinweis, ob du einen ECDSA Key generieren soll. `true`Standard:

---

<h4><i>Netzwerk</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets init [--network FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets init --network=false

</TabItem>
</Tabs>

Setzt die Flag mit der Anzeige, ob du ein Libp2p Network generieren soll. `true`Standard:

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

Setzt das Flag mit dem Hinweis, ob du einen BLS Key generieren sollst. `true`Standard:

### secrets generieren Flags {#secrets-generate-flags}

<h4><i>dir</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--dir DATA_DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --dir ./example-dir

</TabItem>
</Tabs>

Setzt das Verzeichnis für die secrets Manager Konfigurationsdatei Default:`./secretsManagerConfig.json`

---

<h4><i>Art</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--type TYPE]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --type hashicorp-vault

</TabItem>
</Tabs>

Gibt den Typ des secrets Manager [`hashicorp-vault`]an. Default:`hashicorp-vault`

---

<h4><i>Token</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--token TOKEN]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --token s.zNrXa9zF9mgrdnClM7PZ19cu

</TabItem>
</Tabs>

Gibt den Access Token für den Dienst an

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

Gibt die Server-URL für den Dienst an

---

<h4><i>Name</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--name NODE_NAME]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --name node-1

</TabItem>
</Tabs>

Gibt den Namen des Knotens für die on-Service Record keeping an. Default:`polygon-edge-node`

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

Gibt den Namespace an, der für den Hashicorp Vault Secrets Manager verwendet wird. Default:`admin`

### secrets output {#secrets-output-flags}

<h4><i>bls</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--bls FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --bls

</TabItem>
</Tabs>

Setzt die Flagge an, die anzeigt, ob nur den öffentlichen BLS Key ausgegeben werden soll. Default:`true`

---

<h4><i>Config</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--config SECRETS_CONFIG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --config ./secretsManagerConfig.json

</TabItem>
</Tabs>

Setzt den Pfad zur SecretsManager Config Datei ein. Wenn weggelassen, wird der lokale FS secrets Manager verwendet.

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

Setzt das Verzeichnis für die Polygon Edge Daten, wenn der lokale FS verwendet wird.

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

Setzt die Flagge an, die anzeigt, ob nur die network ausgegeben werden soll. Default:`true`

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

Setzt die Flagge an, die angibt, ob nur die validator ausgegeben werden soll. Default:`true`

---

## Antworten {#responses}

### Status Antwort {#status-response}

Das Antwort Objekt wird mit Protocol Buffers definiert.
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

### Monitor Antwort {#monitor-response}
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

## Utilities {#utilities}

### whitelist Befehle {#whitelist-commands}

| **Befehl** | **Beschreibung** |
|------------------------|-------------------------------------------------------------------------------------|
| whitelist Show | Zeigt Whitelist Informationen |
| whitelist Bereitstellung | Aktualisiert die Smart Contract Deployment Whitelist |

<h3>whitelist Show</h3>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist show

</TabItem>
</Tabs>

Zeigt Whitelist Informationen an.

---

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist show [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist show --chain genesis.json

</TabItem>
</Tabs>

Gibt die genesis Datei an, die aktualisiert werden soll. `./genesis.json`Standard:

---

<h3>whitelist Bereitstellung</h3>

<h4><i>Chain</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist deployment [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist deployment --chain genesis.json

</TabItem>
</Tabs>

Gibt die genesis Datei an, die aktualisiert werden soll. `./genesis.json`Standard:

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

Fügt eine neue Adresse zur Bereitstellung von Contracts hinzu Nur die Adressen in der Contract Deployment Whitelist können Verträge bereitstellen. Wenn leer, kann jede Adresse die contract Bereitstellung ausführen

---

<h4><i>entfernen</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist deployment [--remove ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist deployment --remove 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d

</TabItem>
</Tabs>

Entfernt eine Adresse aus der Contract Deployment Whitelist. Nur die Adressen in der Contract Deployment Whitelist können Verträge bereitstellen. Wenn leer, kann jede Adresse die contract Bereitstellung ausführen

---

### backup flags {#backup-flags}

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    backup [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    backup --grpc-address 127.0.0.1:9632

</TabItem>
</Tabs>

Adresse der gRPC API. `127.0.0.1:9632`Standard:

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

Pfad, die Archivdatei zu speichern.

---

<h4><i>von</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    from [--from FROM]

</TabItem>
  <TabItem value="example" label="Example">

    backup --from 0x0

</TabItem>
</Tabs>

Die Anfangshöhe der Blöcke im Archiv. Standard: 0.

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

Die Endhöhe der Blöcke im Archiv.

---

## Genesis Vorlage {#genesis-template}
Die genesis-Datei sollte verwendet werden, um den Anfangszustand der Blockchain zu setzen (z.B. wenn einige Konten ein Startguthaben haben).

Die folgende *./genesis.json* Datei wird generiert:
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

Wenn du die *data-dir* Flagge ausführt, wird ein **Test-Chain** Ordner generiert. Die Ordnerstruktur besteht aus den folgenden Unterordnern:
* **blockchain** - Speichert die LevelDB für blockchain Objekte
* **trie** - Speichert die LevelDB für die Merkle Versuche
* **Keystore** - Speichert Private Keys für den Client. Dazu gehören der Private Key von libp2p und der Private Key des Sealers/Prüfers
* **Konsens** - Speichert alle Konsensinformationen, die der Client während der Arbeit benötigt.

## Ressourcen {#resources}
* **[Protokollpuffer](https://developers.google.com/protocol-buffers)**

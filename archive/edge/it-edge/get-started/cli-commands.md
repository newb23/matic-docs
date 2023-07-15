---
id: cli-commands
title: Comandi CLI
description: "Elenco dei comandi CLI e dei flag di comando per Polygon Edge."
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


Questa sezione illustra i comandi presenti, i flag di comando in Polygon Edge e il loro utilizzo.

:::tip Supporto per l'output JSON

Il flag `--json` è supportato da alcuni comandi. Questo flag indica al comando di stampare l'output nel formato JSON

:::

## Comandi di avvio {#startup-commands}

| **Comando** | **Descrizione** |
|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| server | Il comando predefinito che avvia il client della blockchain, avviando tutti i moduli insieme |
| genesi | Genera un file *genesis.json*, usato per impostare uno stato di catena predefinito prima di avviare il client. La struttura del file genesi è descritta a seguito del |
| genesis predeploy | Predeploys uno Smart Contract per le nuove reti |

### flag del server {#server-flags}


| **Tutte le bandiere del server** |
|---------------------------------------|---------------------------------------------|
| [data-dir](/docs/edge/get-started/cli-commands#data-dir) | [jsonrpc](/docs/edge/get-started/cli-commands#jsonrpc) |
| [json-rpc-block-range-limit](/docs/edge/get-started/cli-commands#json-rpc-block-range-limit) | [json-rpc-batch-request-limit](/docs/edge/get-started/cli-commands#json-rpc-batch-request-limit) |
| [grpc](/docs/edge/get-started/cli-commands#grpc) | [libp2p](/docs/edge/get-started/cli-commands#libp2p) |
| [prometheus](/docs/edge/get-started/cli-commands#prometheus) | [block-gas-target](/docs/edge/get-started/cli-commands#block-gas-target) |
| [max-peers](/docs/edge/get-started/cli-commands#max-peers) | [max-inbound-peers](/docs/edge/get-started/cli-commands#max-inbound-peers) |
| [max-outbound-peers](/docs/edge/get-started/cli-commands#max-outbound-peers) | [max-enqueued](/docs/edge/get-started/cli-commands#max-enqueued) |
| [log-level](/docs/edge/get-started/cli-commands#log-level) | [log-to](/docs/edge/get-started/cli-commands#log-to) |
| [catena](/docs/edge/get-started/cli-commands#chain) | [join](/docs/edge/get-started/cli-commands#join) |
| [nat](/docs/edge/get-started/cli-commands#nat) | [dns](/docs/edge/get-started/cli-commands#dns) |
| [limite di prezzo](/docs/edge/get-started/cli-commands#price-limit) | [max-slots](/docs/edge/get-started/cli-commands#max-slots) |
| [Configurazione](/docs/edge/get-started/cli-commands#config) | [secrets-config](/docs/edge/get-started/cli-commands#secrets-config) |
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

Consente di specificare la directory dei dati utilizzata per memorizzare i dati del client Polygon Edge. Predefinito: `./test-chain`.


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

Imposta l'indirizzo e la porta per il servizio JSON-RPC `address:port`   
Se viene definita solo la porta, `:10001`il binding verrà effettuato su tutte le `0.0.0.0:10001`   interfacce. Se viene omesso, il servizio si legherà al `address:port`predefinito.    Indirizzo predefinito  `0.0.0.0:8545`.

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

Imposta l'intervallo massimo di blocchi da considerare quando si eseguono richieste json-rpc che includono i valori fromBlock/toBlock (ad esempio eth_getLogs). Predefinito:`1000`

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

Imposta la lunghezza massima da considerare quando si gestiscono le richieste batch json-rpc. Predefinito: `20`

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

Imposta l'indirizzo e la porta per il servizio gRPC `address:port`.
Indirizzo predefinito  `127.0.0.1:9632`.

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

Imposta l'indirizzo e la porta per il servizio libp2p `address:port`.
Indirizzo predefinito  `127.0.0.1:1478`.

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

Imposta l'indirizzo e la porta per il server Prometheus `address:port`   
Se viene definita solo la porta, `:5001`il servizio si legherà a tutte le interfacce `0.0.0.0:5001`.   
Se omesso, il servizio non verrà avviato.

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

Imposta il limite di gas del blocco target per la catena. Predefinito (non eseguito): `0`.

Per una spiegazione più dettagliata del target del gas del blocco, consultare la [sezione TxPool](/docs/edge/architecture/modules/txpool#block-gas-target).

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

Imposta il numero massimo di peer del client. Predefinito: `40`

Il limite del peer deve essere specificato utilizzando `max-peers` o il flag `max-inbound/outbound-peers`.

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

Imposta il numero massimo di peer in entrata del client. Se `max-peers`è impostato, il limite max-inbound-peer viene calcolato con le seguenti formule.

`max-inbound-peer = InboundRatio * max-peers`, dov'`InboundRatio`è il   `0.8`.

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

Imposta il numero massimo di peer in uscita del client. Se `max-peers`è impostato, il numero max-outbound-peer viene calcolato utilizzando le seguenti formule.

`max-outbound-peer = OutboundRatio * max-peers`, dov'`OutboundRatio`è il   `0.2`.

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

Imposta il numero massimo di transazioni in attesa per account. Predefinito:`128`

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

Imposta il livello di log per l'output della console. Predefinito: `INFO`

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

Definisce il nome del file di log che conterrà tutti i risultati del comando del server.
Per impostazione predefinita, tutti i log del server vengono inviati alla console (stdout),
ma se il flag è impostato, non ci sarà alcun output sulla console quando si esegue il comando del server.

---

#### <h4></h4><i>catena</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    server --chain /home/ubuntu/genesis.json

</TabItem>
</Tabs>

Specifica il file genesi usato per avviare la catena. Predefinito: `./genesis.json`

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

Specifica l'indirizzo del peer da unire.

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

Imposta l'indirizzo IP esterno senza la porta, come può essere visto dai peer.

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

Imposta l'indirizzo DNS dell'host. Può essere utilizzato per pubblicizzare un DNS esterno. Supporta `dns`,`dns4`,`dns6`.

---

#### <h4></h4><i>limite di prezzo</i>


<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--price-limit PRICE_LIMIT]

</TabItem>
  <TabItem value="example" label="Example">

    server --price-limit 10000

</TabItem>
</Tabs>

Imposta il limite minimo di prezzo del gas da applicare per l'accettazione nel pool. Predefinito: `1`

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

Imposta il numero massimo di slot nel pool. Predefinito: `4096`

---

#### <h4></h4><i>Configurazione</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--config CLI_CONFIG_PATH]

</TabItem>
  <TabItem value="example" label="Example">

    server --config ./myConfig.json

</TabItem>
</Tabs>

Specifica il percorso della configurazione della CLI. Supporti `.json`.

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

Imposta il percorso del file di configurazione di SecretsManager. Utilizzato per Hashicorp Vault, AWS SSM e GCP Secrets Manager. Se omesso, viene utilizzato il secrets manager FS locale.

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

Imposta il client in modalità dev. Predefinita: `false`. In modalità dev, la scoperta peer è disabilitata per impostazione predefinita.

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

Imposta l'intervallo di notifica dev del client in secondi. Predefinito: `0`

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

Impedisce al client di scoprire altri peer. Predefinito: `false`

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

Ripristina i blocchi dal file di archivio specificato

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

Imposta il tempo di produzione dei blocchi in secondi. Predefinito: `2`

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

Imposta i domini autorizzati a condividere le risposte alle richieste JSON-RPC.   
Aggiungere più flag `--access-control-allow-origins "https://example1.com" --access-control-allow-origins "https://example2.com"`per autorizzare più domini.    Se omesso l'intestazione Access-Control-Allow-Origins sarà impostata su `*`e tutti i domini saranno autorizzati.

---

### flag genesis {#genesis-flags}
| **Tutte le bandiere di genesi** |
|---------------------------------------|---------------------------------------------|
| [dir](/docs/edge/get-started/cli-commands#dir) | [Nome](/docs/edge/get-started/cli-commands#name) |
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

Imposta la directory per i dati della genesi di Polygon Edge. Predefinito: `./genesis.json`.

---

#### <h4></h4><i>Nome</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--name NAME]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --name test-chain

</TabItem>
</Tabs>

Imposta il nome della catena. Predefinito: `polygon-edge`

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

Imposta il flag che indica che il cliente deve utilizzare la Proof of Stake IBFT.
Si imposta in maniera predefinita su Proof of Authority se il flag non viene fornito o `false`.

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

Imposta la dimensione dell'epoca per la catena. Predefinito `100000`.

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

Imposta gli account e i saldi predefiniti nel formato `address:amount`.
L'importo può essere in formato decimale o esadecimale.
Bilancio preminato: `0xD3C21BCECCEDA1000000`(1 milione di gettoni di valuta nativa).

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

Imposta l'ID della catena. Predefinito: `100`

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

Specifica la modalità di convalida delle intestazioni di blocco. Valori possibili: `[ecdsa, bls]`. Predefinito: `bls`

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

Percorso del prefisso per la cartella del validatore. Deve essere presente se il flag `ibft-validator`viene omesso.

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

Imposta gli indirizzi passati come validatori IBF. Deve essere presente se il flag `ibft-validators-prefix-path`viene omesso.
1. Se la rete funziona con ECDSA, il formato è `--ibft-validator [ADDRESS]`.
2. Se la rete funziona con BLS, il formato è `--ibft-validator [ADDRESS]:[BLS_PUBLIC_KEY]`.

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

Si riferisce alla quantità massima di gas utilizzata da tutte le operazioni in un blocco. Predefinito: `5242880`

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

Imposta il protocollo di consenso. Predefinito: `pow`

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

URL multiddr per il bootstrap della scoperta p2p. Questo flag può essere utilizzato più volte.
Invece di un indirizzo IP, è possibile fornire l'indirizzo DNS del bootnode.

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

Il numero massimo di staker in grado di unirsi al set di validatori in un consenso PoS. Questo numero non può superare il valore di MAX_SAFE_INTEGER (2^53 - 2).

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

Il numero minimo di staker necessari per unirsi al set di validatori in un consenso PoS. Questo numero non può superare il valore di max-validator-count.
Predefinito a 1.

---

### genesis predeploy le bandiere {#genesis-predeploy-flags}

<h4><i>percorso artefatto-</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis predeploy [--artifacts-path PATH_TO_ARTIFACTS]

</TabItem>
  <TabItem value="example" label="Example">

    genesis predeploy --artifacts-path ./ArtifactsData.json

</TabItem>
</Tabs>

Imposta il percorso degli artefatti del contratto JSON che contiene il `abi`, `bytecode`e .`deployedBytecode`

---

<h4><i>catena</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis predeploy [--chain PATH_TO_GENESIS]

</TabItem>
  <TabItem value="example" label="Example">

    genesis predeploy --chain ./genesis.json

</TabItem>
</Tabs>

Imposta il percorso del `genesis.json`file che dovrebbe essere aggiornato. Predefinito `./genesis.json`.

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

Impostare gli argomenti costruttori dello Smart Contract se presente. Per una guida dettagliata su come queste argomentazioni dovrebbero essere presentate, si prega di fare riferimento [all'articolo di predeployment](/docs/edge/additional-features/predeployment).

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

Imposta l'indirizzo a cui predeploy Predefinito `0x0000000000000000000000000000000000001100`.

---


## Comandi dell'operatore {#operator-commands}

### Comandi dei peer {#peer-commands}

| **Comando** | **Descrizione** |
|------------------------|-------------------------------------------------------------------------------------|
| aggiunta peer | Aggiunge un nuovo peer utilizzando il suo indirizzo libp2p |
| elenco peer | Elenca tutti i peer a cui il client è connesso tramite libp2p |
| stato peer | Restituisce lo stato di uno specifico peer dall'elenco dei peer, utilizzando l'indirizzo libp2p |

<h3>flag aggiungi peer</h3>

<h4><i>addr</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers add --addr PEER_ADDRESS

</TabItem>
  <TabItem value="example" label="Example">

    peers add --addr /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

Indirizzo libp2p del peer nel formato multiaddr.

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

Indirizzo dell'API gRPC. Predefinito: `127.0.0.1:9632`

<h3>flag elenco peer</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers list [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    peers list --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Indirizzo dell'API gRPC. Predefinito: `127.0.0.1:9632`

<h3>flag stato peer</h3>

<h4><i>peer-id</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers status --peer-id PEER_ID

</TabItem>
  <TabItem value="example" label="Example">

    peers status --peer-id 16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

ID del nodo Libp2p di uno specifico peer all'interno della rete p2p.

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

Indirizzo dell'API gRPC. Predefinito: `127.0.0.1:9632`

### Comandi IBFT  {#ibft-commands}

| **Comando** | **Descrizione** |
|------------------------|-------------------------------------------------------------------------------------|
| istantanea ibft | Restituisce l'istantanea IBFT |
| candidati ibft | Interroga l'insieme attuale dei candidati proposti e i candidati che non sono ancora stati inclusi. |
| proponi ibft | Propone un nuovo candidato da aggiungere/rimuovere dal set di validatori. |
| stato ibft | Restituisce lo stato generale del client IBFT |
| interruttore ibft | Aggiungere configurazioni di fork nel file genesis.json per cambiare il tipo di IBFT |
| quorum ibft  | Specifica il numero di blocchi dopo il quale verrà utilizzato il metodo della dimensione ottimale del quorum per raggiungere il consenso. |


<h3>flag istantanea ibft</h3>

<h4><i>numero</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft snapshot [--number BLOCK_NUMBER]

</TabItem>
  <TabItem value="example" label="Example">

    ibft snapshot --number 100

</TabItem>
</Tabs>

L'altezza del blocco (numero) per l'istantanea.

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

Indirizzo dell'API gRPC. Predefinito: `127.0.0.1:9632`

<h3>flag candidati ibft</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft candidates [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    ibft candidates --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Indirizzo dell'API gRPC. Predefinito: `127.0.0.1:9632`

<h3>ibft propone flags</h3>

<h4><i>vote</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft propose --vote VOTE

</TabItem>
  <TabItem value="example" label="Example">

    ibft propose --vote auth

</TabItem>
</Tabs>

Propone una modifica al set di validatori. Valori possibili: `[auth, drop]`.

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

Indirizzo dell'account da votare.


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

Chiave pubblica BLS dell'account da votare, necessaria solo in modalità BLS.


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

Indirizzo dell'API gRPC. Predefinito: `127.0.0.1:9632`

<h3>flag di stato ibft</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    ibft status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Indirizzo dell'API gRPC. Predefinito: `127.0.0.1:9632`

<h3>flag interruttore ibft</h3>

<h4><i>catena</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --chain genesis.json

</TabItem>
</Tabs>

Specifica il file genesi da aggiornare. Predefinito: `./genesis.json`

---

<h4><i>Tipo</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--type TYPE]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --type PoS

</TabItem>
</Tabs>

Specifica il tipo di IBFT da commutare. Valori possibili: `[PoA, PoS]`.

---

<h4><i>implementazione</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--deployment DEPLOYMENT]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --deployment 100

</TabItem>
</Tabs>

Specifica l'altezza della distribuzione del contratto. Disponibile solo con PoS.

---

<h4><i>da</i></h4>

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

Specifica la modalità di convalida delle intestazioni di blocco. Valori possibili: `[ecdsa, bls]`. Predefinito: `bls`

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

Percorso del prefisso per le directory dei nuovi validatori. Deve essere presente se il flag `ibft-validator`è omesso. Disponibile solo quando la modalità IBFT è PoA (il flag `--pos` è omesso).

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

Imposta gli indirizzi passati come validatori IBFT utilizzati dopo il fork. Deve essere presente se il flag `ibft-validators-prefix-path`è omesso. Disponibile solo in modalità PoA.
1. Se la rete funziona con ECDSA, il formato è `--ibft-validator [ADDRESS]`.
2. Se la rete funziona con BLS, il formato è `--ibft-validator [ADDRESS][BLS_PUBLIC_KEY]`.

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

Il numero massimo di staker in grado di unirsi al set di validatori in un consenso PoS. Questo numero non può superare il valore di MAX_SAFE_INTEGER (2^53 - 2).

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

Il numero minimo di staker necessari per unirsi al set di validatori in un consenso PoS. Questo numero non può superare il valore di max-validator-count.
Predefinito a 1.

Specifica l'altezza di inizio del fork.

---

<h3>flag quorum ibft </h3>

<h4><i>da</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft quorum [--from your_quorum_switch_block_num]

</TabItem>
  <TabItem value="example" label="Example">

    ibft quorum --from 350

</TabItem>
</Tabs>

L'altezza per passare il calcolo del quorum a QuorumOptimal, che utilizza la formula `(2/3 * N)`, con il numero di nodi validatori `N`. Si noti che questo è per la compatibilità all'indietro, cioè solo per le catene che utilizzavano un calcolo Quorum legacy fino a una certa altezza del blocco.

---

<h4><i>catena</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft quorum [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    ibft quorum --chain genesis.json

</TabItem>
</Tabs>

Specifica il file genesi da aggiornare. Predefinito: `./genesis.json`

### Comandi Transazione Pool {#transaction-pool-commands}

| **Comando** | **Descrizione** |
|------------------------|--------------------------------------------------------------------------------------|
| stato txpool | Restituisce il numero di transazioni nel pool |
| sottoscrizione txpool | Si iscrive agli eventi del pool di transazioni |

<h3>flag stato txpool</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    txpool status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Indirizzo dell'API gRPC. Predefinito: `127.0.0.1:9632`

<h3>flag abbonamento txpool</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Indirizzo dell'API gRPC. Predefinito: `127.0.0.1:9632`

---

<h4><i>promosso</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--promoted LISTEN_PROMOTED]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --promoted

</TabItem>
</Tabs>

Si iscrive agli eventi tx promossi nel TxPool.

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

Si iscrive agli eventi tx abbandonati nel TxPool.

---

<h4><i>retrocesso</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--demoted LISTEN_DEMOTED]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --demoted

</TabItem>
</Tabs>

Si iscrive agli eventi tx retrocessi nel TxPool.

---

<h4><i>aggiunto</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--added LISTEN_ADDED]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --added

</TabItem>
</Tabs>

Si iscrive agli eventi tx aggiunti al TxPool.

---

<h4><i>in coda</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--enqueued LISTEN_ENQUEUED]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --enqueued

</TabItem>
</Tabs>

Si iscrive agli eventi tx in coda nell'account

---

### Comandi blockchain {#blockchain-commands}

| **Comando** | **Descrizione** |
|------------------------|-------------------------------------------------------------------------------------|
| stato | Restituisce lo stato del client La risposta dettagliata può essere visualizzata sotto |
| monitor | Si iscrive a un flusso di eventi della blockchain. La risposta dettagliata può essere visualizzata sotto |
| versione | Restituisce la versione corrente del client |

<h3>flag stato</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Indirizzo dell'API gRPC. Predefinito: `127.0.0.1:9632`

<h3>flag monitor</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    monitor [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    monitor --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Indirizzo dell'API gRPC. Predefinito: `127.0.0.1:9632`

---
<h3>comando della versione</h3>


<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    version

</TabItem>
</Tabs>

Visualizza la versione di rilascio, il git branch, commit hash e il tempo di costruzione.

## Comandi segreti {#secrets-commands}

| **Comando** | **Descrizione** |
|-------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| segreti init | Inizializza le chiavi private al gestore di segreti corrispondenti |
| genera segreti | Genera un file di configurazione del gestore dei segreti che può essere analizzato da Polygon Edge |
| segreti di uscita | Stampare l'indirizzo di chiave pubblica BLS, l'indirizzo di chiave pubblica del validatore e il nodo id per riferimento |

### flag segreti init {#secrets-init-flags}

<h4><i>Configurazione</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets init [--config SECRETS_CONFIG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets init --config ./secretsManagerConfig.json

</TabItem>
</Tabs>

Imposta il percorso del file di configurazione di SecretsManager. Usato per Hashicorp Vault. Se omesso, viene utilizzato il gestore dei segreti FS locale.

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

Imposta la directory per i dati di Polygon Edge se si usa il FS locale.

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

Imposta il flag che indica se generare una chiave ECDSA. Predefinito: `true`

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

Imposta il flag che indica se generare una chiave di rete Libp2p. Predefinito: `true`

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

Imposta il flag che indica se generare una chiave BLS. Predefinito: `true`

### flag genera segreti {#secrets-generate-flags}

<h4><i>dir</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--dir DATA_DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --dir ./example-dir

</TabItem>
</Tabs>

Imposta la directory per il file di configurazione del gestore dei segreti Predefinito: `./secretsManagerConfig.json`

---

<h4><i>Tipo</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--type TYPE]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --type hashicorp-vault

</TabItem>
</Tabs>

Specifica il tipo di gestore dei segreti [`hashicorp-vault`]. Predefinito: `hashicorp-vault`

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

Specifica il token di accesso per il servizio

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

Specifica l'URL del server per il servizio

---

<h4><i>Nome</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--name NODE_NAME]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --name node-1

</TabItem>
</Tabs>

Specifica il nome del nodo per la registrazione on-service. Predefinito: `polygon-edge-node`

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

Specifica lo spazio dei nomi utilizzato per il gestore dei segreti di Hashicorp Vault. Predefinito: `admin`

### segreti bandiere di uscita {#secrets-output-flags}

<h4><i>bls</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--bls FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --bls

</TabItem>
</Tabs>

Imposta la bandiera che indica se produrre solo la chiave pubblica BLS. Predefinito: `true`

---

<h4><i>Configurazione</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--config SECRETS_CONFIG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --config ./secretsManagerConfig.json

</TabItem>
</Tabs>

Imposta il percorso del file di configurazione di SecretsManager. Se omesso, viene utilizzato il secrets manager FS locale.

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

Imposta la directory per i dati di Polygon Edge se si usa il FS locale.

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

Imposta la bandiera che indica se produrre solo il nodo di rete ID. Predefinito: `true`

---

<h4><i>Validatore</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--validator FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --validator

</TabItem>
</Tabs>

Imposta la bandiera che indica se produrre solo l'indirizzo del validatore. Predefinito: `true`

---

## Risposte {#responses}

### Stato delle risposte {#status-response}

L'oggetto della risposta è definito utilizzando i buffer di protocollo.
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

### Monitor risposte {#monitor-response}
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

## Utilità {#utilities}

### comandi lista bianca {#whitelist-commands}

| **Comando** | **Descrizione** |
|------------------------|-------------------------------------------------------------------------------------|
| mostra lista bianca | Mostra le informazioni della lista bianca |
| implementazione lista bianca | Aggiorna la lista bianca di implementazione degli smart contract
 |

<h3>mostra lista bianca</h3>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist show

</TabItem>
</Tabs>

Mostra le informazioni della lista bianca.

---

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist show [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist show --chain genesis.json

</TabItem>
</Tabs>

Specifica il file genesi da aggiornare. Predefinito: `./genesis.json`

---

<h3>implementazione lista bianca</h3>

<h4><i>catena</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist deployment [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist deployment --chain genesis.json

</TabItem>
</Tabs>

Specifica il file genesi da aggiornare. Predefinito: `./genesis.json`

---

<h4><i>aggiungi</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist deployment [--add ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist deployment --add 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d

</TabItem>
</Tabs>

Aggiunge un nuovo indirizzo alla lista bianca di implementazione del contratto. Solo gli indirizzi presenti nella lista bianca di implementazione dei contratti possono implementare i contratti.
Se vuota, qualsiasi indirizzo può eseguire l'implementazione del contratto

---

<h4><i>rimuovi</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist deployment [--remove ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist deployment --remove 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d

</TabItem>
</Tabs>

Rimuove un indirizzo dalla lista bianca dell'implementazione del contratto.
Solo gli indirizzi presenti nella lista bianca di implementazione dei contratti possono implementare i contratti.
Se vuota, qualsiasi indirizzo può eseguire l'implementazione del contratto

---

### flag di backup {#backup-flags}

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    backup [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    backup --grpc-address 127.0.0.1:9632

</TabItem>
</Tabs>

Indirizzo dell'API gRPC. Predefinito: `127.0.0.1:9632`

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

Percorso del file di archivio da salvare.

---

<h4><i>da</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    from [--from FROM]

</TabItem>
  <TabItem value="example" label="Example">

    backup --from 0x0

</TabItem>
</Tabs>

L'altezza iniziale dei blocchi nell'archivo. Predefinito: 0.

---

<h4><i>a</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    to [--to TO]

</TabItem>
  <TabItem value="example" label="Example">

    backup --to 0x2710

</TabItem>
</Tabs>

L'altezza finale dei blocchi nell'archivo.

---

## Modello genesi {#genesis-template}
Il file genesi deve essere utilizzato per impostare lo stato iniziale della blockchain (ad esempio, se alcuni account devono avere un saldo iniziale).

Viene generato il seguente file *./genesis.json*:
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

Quando si esegue il flag *data-dir*, viene generata una cartella **della catena di prova**. La struttura della cartella è composta dalle seguenti sottocartelle:
* **blockchain** - Memorizza il LevelDB per gli oggetti della blockchain
* **trie** - Memorizza il LevelDB per i tentativi Merkle
* **keystore** - Memorizza le chiavi private del client. Questo include la chiave privata di libp2p e la chiave privata del sigillatore/validatore.
* **consensus** - Memorizza tutte le informazioni sul consenso di cui il client potrebbe avere bisogno durante il lavoro

## Risorse {#resources}
* **[I buffer di protocollo](https://developers.google.com/protocol-buffers)**

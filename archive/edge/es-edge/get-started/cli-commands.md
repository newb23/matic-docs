---
id: cli-commands
title: Comandos de la CLI (Interfaz de línea de comandos)
description: "Lista de comandos de la interfaz de línea de comandos (CLI) y opciones de comando para Polygon Edge."
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


Esta sección detalla los comandos actuales y las opciones de comando en Polygon Edge, al igual que cómo se utilizan.

:::tip Soporte de salida de JSON

La opción `--json` se apoya en algunos comandos. Esta indicación le indica al comando que imprima la salida en formato JSON.

:::

## Comandos de inicio {#startup-commands}

| **Comando** | **Descripción** |
|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| server | El comando por defecto que inicia el cliente de la cadena de bloques arrancando todos los módulos juntos |
| genesis | Genera un archivo de *genesis.json*, que se utiliza para establecer un estado de cadena predefinido antes de iniciar el cliente. La estructura del archivo génesis se describe más adelante. |
|  | Predespliega un contrato inteligente para redes nuevas |

### server flags {#server-flags}


| **Todos los indicadores del servidor** |
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
| [límite de precios](/docs/edge/get-started/cli-commands#price-limit) | [Ranuras máximas](/docs/edge/get-started/cli-commands#max-slots) |
| [Configuración](/docs/edge/get-started/cli-commands#config) | [secrets-config](/docs/edge/get-started/cli-commands#secrets-config) |
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

Se utiliza para especificar el directorio de datos utilizado para almacenar los datos de los clientes de Polygon Edge. Por defecto: `./test-chain`.

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

Establece la dirección y el puerto para el servicio de RPC JSON `address:port`.   
Si solo se define el puerto `:10001`, se unirá a todas las interfaces `0.0.0.0:10001`.   
Si se omite, el servicio se unirá al `address:port` por defecto.   
Dirección por defecto: `0.0.0.0:8545`.

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

Establece el rango máximo de bloques que se deben considerar al ejecutar las solicitudes de rpc json que incluyen valores fromBlock/toBlock (por ejemplo, eth_getLogs). Por defecto:`1000`

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

Establece la longitud máxima que se debe considerar al manejar las solicitudes de tandas de rpc json. Por defecto: `20`.

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

Establece la dirección y el puerto para el servicio de gRPC `address:port`. Dirección por defecto: `127.0.0.1:9632`.

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

Establece la dirección y el puerto para el servicio `address:port` de libp2p. Dirección por defecto: `127.0.0.1:1478`.

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

Establece la dirección y el puerto para el servidor `address:port` de prometheus.   
Si solo se define el puerto `:5001`, el servicio se unirá a todas las interfaces `0.0.0.0:5001`.   
Si se omite, el servicio no se iniciará.

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

Establece el límite de gas de los bloques de destino para la cadena. Por defecto (no se hace cumplir): `0`.

Puedes encontrar una explicación más detallada sobre el gas de los bloques de destino en la [sección TxPool](/docs/edge/architecture/modules/txpool#block-gas-target).

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

Establece el número máximo de pares del cliente. Por defecto: `40`.

El límite de pares se debería especificar con la indicación `max-peers` o `max-inbound/outbound-peers`.

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

Establece el número de pares entrantes máximo del cliente. Si se establece `max-peers`, el límite máximo de pares entrantes se calcula con las siguientes fórmulas.

`max-inbound-peer = InboundRatio * max-peers`, donde `InboundRatio` es `0.8`.

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

Establece el número de pares salientes máximo del cliente. Si se establece `max-peers`, el número de pares salientes máximo se calcula con las siguientes fórmulas.

`max-outbound-peer = OutboundRatio * max-peers`, donde `OutboundRatio` es `0.2`.

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

Establece el número máximo de transacciones en cola por cuenta. Por defecto:`128`

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

Establece el nivel de registro para la salida de la consola. Por defecto: `INFO`.

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

Define el nombre del archivo de registro que mantendrá todas las salidas del comando del servidor.
Por defecto, todos los registros del servidor saldrán a la consola (stdout),
pero si se establece la indicación, no habrá salida a la consola cuando se ejecute el comando del servidor.

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

Especifica el archivo génesis utilizado para iniciar la cadena. Por defecto: `./genesis.json`.

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

Especifica la dirección del par al que se debe unir.

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

Establece la dirección IP externa sin el puerto, ya que puede ser vista por pares.

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

Establece la dirección DNS del anfitrión. Se puede utilizar para publicitar un DNS externo. Soporta `dns`,`dns4`,`dns6`.

---

#### <h4></h4><i>límite de precios</i>


<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--price-limit PRICE_LIMIT]

</TabItem>
  <TabItem value="example" label="Example">

    server --price-limit 10000

</TabItem>
</Tabs>

Establece un límite mínimo de precio de gas para hacer cumplir su aceptación en el grupo. Por defecto: `1`.

---

#### <h4></h4><i>Ranuras máximas</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--max-slots MAX_SLOTS]

</TabItem>
  <TabItem value="example" label="Example">

    server --max-slots 1024

</TabItem>
</Tabs>

Establece un máximo de ranuras en el grupo. Por defecto: `4096`.

---

#### <h4></h4><i>Configuración</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--config CLI_CONFIG_PATH]

</TabItem>
  <TabItem value="example" label="Example">

    server --config ./myConfig.json

</TabItem>
</Tabs>

Especifica la ruta hacia la configuración de CLI. Soporta `.json`.

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

Establece la ruta hacia el archivo de configuración de Secrets Manager (Administrador de secretos). Se utiliza para Hashicorp Vault, SSM de AWS y Secrets Manager de GCP. Si se omite, se utiliza el administrador Secrets Manager FS local.

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

Pone al cliente en modo desarrollador. Por `false`defecto: En el modo  , el descubrimiento de los compañeros se desactiva de forma predeterminada.

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

Establece el intervalo de notificaciones de desarrollo del cliente en segundos. Por defecto: `0`.

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

Evita que el cliente descubra otros pares. Por defecto: `false`.

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

Restaura bloques desde el archivo especificado.

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

Establece el tiempo de producción de bloques en segundos. Por defecto: `2`

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

Establece los dominios autorizados para poder compartir respuestas de solicitudes de RPC JSON.   
Añade múltiples indicaciones `--access-control-allow-origins "https://example1.com" --access-control-allow-origins "https://example2.com"` para autorizar múltiples dominios    .
Si se omite, el encabezado Access-Control-Allow-Origins se establecerá en `*` y todos los dominios serán autorizados.

---

### genesis flags {#genesis-flags}
| **Todas las banderas génesis** |
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

Establece el directorio para los datos de génesis de Polygon Edge. Por defecto: `./genesis.json`.

---

#### <h4></h4><i>Nombre</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--name NAME]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --name test-chain

</TabItem>
</Tabs>

Establece el nombre para la cadena. Por defecto: `polygon-edge`.

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

Establece la indicación de que el cliente debería usar la prueba de participación IBFT.
Se pone por defecto en prueba de autoridad si no se suministra la indicación o `false`.

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

Establece el tamaño de la época para la cadena. Por defecto, `100000`.

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

Establece las cuentas y los saldos preminados en formato `address:amount`.
La cantidad puede estar en decimales o en hexadecimales.
Saldo preminado por defecto: `0xD3C21BCECCEDA1000000`(1 millón de tokens de moneda nativa).

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

Establece la ID de la cadena. Por defecto: `100`.

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

Especifica el modo de validación de los encabezados de los bloques. Valores posibles: `[ecdsa, bls]`. Por defecto: `bls`.

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

Ruta de prefijo para el directorio de la carpeta de validadores. Debe estar presente si se omite la indicación `ibft-validator`.

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

Establece las direcciones pasadas como validadores IBFT. Debe estar presente si se omite la indicación `ibft-validators-prefix-path`.
1. Si la red se está ejecutando con ECDSA, el formato es `--ibft-validator [ADDRESS]`.
2. Si la red se está ejecutando con BLS, el formato es `--ibft-validator [ADDRESS]:[BLS_PUBLIC_KEY]`.

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

Se refiere a la cantidad de gas que utilizan todas las operaciones en un bloque. Por defecto: `5242880`.

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

Establece el protocolo de consenso. Por defecto: `pow`.

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

URL multidirección para el arranque del descubrimiendo p2p. Esta indicación se puede usar muchas veces.
En vez de una dirección IP, se puede suministrar la dirección DNS del nodo de arranque.

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

El número máximo de participantes en subastas que se pueden unirse al conjunto de validadores en un consenso de PoS.
Este número no puede superar el valor de MAX_SAFE_INTEGER (2^53 - 2).

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

El número mínimo de participantes necesario para unirse al conjunto de validadores en un consenso de PoS.
Este número no puede superar el valor de max-validator-count.
Por defecto se establece en 1.

---

### banderas de predespliegue de génesis {#genesis-predeploy-flags}

<h4><i>ruta de los artefactos</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis predeploy [--artifacts-path PATH_TO_ARTIFACTS]

</TabItem>
  <TabItem value="example" label="Example">

    genesis predeploy --artifacts-path ./ArtifactsData.json

</TabItem>
</Tabs>

Establece la ruta hacia los artefactos contractuales que contiene `abi`el , `bytecode`y .`deployedBytecode`

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

Establece la ruta al `genesis.json`archivo que se debe actualizar . Por defecto, `./genesis.json`.

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

Establece los argumentos de constructor de contratos inteligentes, si los hay. Para una guía detallada sobre cómo deberían ser estos argumentos, consulta [el artículo previo a la implementación](/docs/edge/additional-features/predeployment).

---

<h4><i>predespliegue</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis predeploy [--predeploy-address PREDEPLOY_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    genesis predeploy --predeploy-address 0x5555

</TabItem>
</Tabs>

Establece la dirección a la que se desea desplegar en . Por defecto, `0x0000000000000000000000000000000000001100`.

---


## Comandos del operador {#operator-commands}

### Comandos del par {#peer-commands}

| **Comando** | **Descripción** |
|------------------------|-------------------------------------------------------------------------------------|
| peers add | Añade un nuevo par con su dirección de libp2p. |
| peers list | Enumera todos los pares con los que el cliente está conectado a través de libp2p. |
| peers status | Arroja el estado de un par específico de la lista de pares mediante el uso de la dirección de libp2p. |

<h3>peers add flags</h3>

<h4><i>addr</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers add --addr PEER_ADDRESS

</TabItem>
  <TabItem value="example" label="Example">

    peers add --addr /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

Dirección de libp2p del par en formato multidirección.

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

Dirección de la API de gRPC. Por defecto: `127.0.0.1:9632`.

<h3>peers list flags</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers list [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    peers list --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Dirección de la API de gRPC. Por defecto: `127.0.0.1:9632`.

<h3>peers status flags</h3>

<h4><i>peer-id</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers status --peer-id PEER_ID

</TabItem>
  <TabItem value="example" label="Example">

    peers status --peer-id 16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

ID del nodo de libp2p de un par específico dentro de la red p2p.

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

Dirección de la API de gRPC. Por defecto: `127.0.0.1:9632`.

### Comandos IBFT {#ibft-commands}

| **Comando** | **Descripción** |
|------------------------|-------------------------------------------------------------------------------------|
| ibft snapshot | Arroja la foto instantánea de IBFT. |
| ibft candidates | Consulta el conjunto actual de candidatos propuestos, así como los candidatos que aún no se han incluido. |
| ibft propose | Propone a un nuevo candidato para añadir o eliminar del conjunto de validadores. |
| ibft status | Arroja el estado general del cliente IBFT. |
| ibft switch | Agrega configuraciones de bifurcación en el archivo genesis.json para cambiar el tipo de IBFT. |
| ibft quorum | Especifica el número de bloque después del cual se utilizará el método de tamaño de quorum óptimo para llegar al consenso. |


<h3>ibft snapshot flags</h3>

<h4><i>number</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft snapshot [--number BLOCK_NUMBER]

</TabItem>
  <TabItem value="example" label="Example">

    ibft snapshot --number 100

</TabItem>
</Tabs>

Es la altura del bloque (número) para la foto instantánea.

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

Dirección de la API de gRPC. Por defecto: `127.0.0.1:9632`.

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

Dirección de la API de gRPC. Por defecto: `127.0.0.1:9632`.

<h3>ibft propose flags</h3>

<h4><i>vote</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft propose --vote VOTE

</TabItem>
  <TabItem value="example" label="Example">

    ibft propose --vote auth

</TabItem>
</Tabs>

Propone un cambio en el conjunto de validadores. Valores posibles: `[auth, drop]`.

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

Dirección de la cuenta por la cual se votará

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

Clave pública BLS de la cuenta por la que se votará, necesaria solo en modo BLS.

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

Dirección de la API de gRPC. Por defecto: `127.0.0.1:9632`.

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

Dirección de la API de gRPC. Por defecto: `127.0.0.1:9632`.

<h3>ibft switch flags</h3>

<h4><i>chain</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --chain genesis.json

</TabItem>
</Tabs>

Especifica el archivo génesis que se va a actualizar. Por defecto: `./genesis.json`.

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

Especifica el tipo de IBFT que se va a cambiar. Valores posibles: `[PoA, PoS]`.

---

<h4><i>despliegue</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--deployment DEPLOYMENT]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --deployment 100

</TabItem>
</Tabs>

Especifica la altura del despliegue del contrato. Solo está disponible con PoS.

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

Especifica el modo de validación de los encabezados de los bloques. Valores posibles: `[ecdsa, bls]`. Por defecto: `bls`.

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

Ruta prefijada para los directorios de los nuevos validadores. Debe estar presente si se omite la indicación `ibft-validator`. Solo está disponible cuando el modo IBFT es PoA (se omite la indicación `--pos`).

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

Conjuntos aprobados en direcciones como validadores IBFT utilizados después de la bifurcación. Debe estar presente si se omite la indicación `ibft-validators-prefix-path`. Solo están disponibles en modo de PoA.
1. Si la red se está ejecutando con ECDSA, el formato es `--ibft-validator [ADDRESS]`.
2. Si la red se está ejecutando con BLS, el formato es `--ibft-validator [ADDRESS][BLS_PUBLIC_KEY]`.

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

El número máximo de participantes en subastas que se pueden unirse al conjunto de validadores en un consenso de PoS.
Este número no puede superar el valor de MAX_SAFE_INTEGER (2^53 - 2).

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

El número mínimo de participantes necesario para unirse al conjunto de validadores en un consenso de PoS.
Este número no puede superar el valor de max-validator-count.
Por defecto se establece en 1.

Especifica la altura inicial de la bifurcación.

---

<h3>ibft quorum flags</h3>

<h4><i>from</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft quorum [--from your_quorum_switch_block_num]

</TabItem>
  <TabItem value="example" label="Example">

    ibft quorum --from 350

</TabItem>
</Tabs>

Es la altura para cambiar el cálculo del quorum a QuorumOptimal, que utiliza la fórmula `(2/3 * N)`, donde `N` es el número de nodos validadores. Fíjate que esto es para la compatibilidad con versiones anteriores, es decir, solo para cadenas que utilizaron un cálculo heredado de quorum hasta cierta altura de bloque.

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

Especifica el archivo génesis que se va a actualizar. Por defecto: `./genesis.json`.

### Comandos del grupo de transacciones {#transaction-pool-commands}

| **Comando** | **Descripción** |
|------------------------|--------------------------------------------------------------------------------------|
| txpool status | Arroja el número de transacciones en el grupo. |
| txpool subscribe | Suscripciones para eventos en el grupo de transacciones. |

<h3>txpool status flags</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    txpool status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Dirección de la API de gRPC. Por defecto: `127.0.0.1:9632`.

<h3>txpool subscribe flags</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Dirección de la API de gRPC. Por defecto: `127.0.0.1:9632`.

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

Suscribe a eventos de transacción promovidos en el grupo de transacciones.

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

Suscribe a eventos de transacción dejados en el grupo de transacciones.

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

Suscribe a eventos de transacción degradados en el grupo de transacciones.

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

Suscribe a eventos de transacción agregados al grupo de transacciones.

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

Suscribe a eventos de transacción que estén en las colas de la cuenta.

---

### Comandos de la cadena de bloques {#blockchain-commands}

| **Comando** | **Descripción** |
|------------------------|-------------------------------------------------------------------------------------|
| status | Arroja el estado del cliente. La respuesta detallada se puede encontrar más adelante. |
| monitor | Suscribe al flujo de eventos de la cadena de bloques. La respuesta detallada se puede encontrar más adelante. |
| version | Muestra la versión actual del cliente. |

<h3>status flags</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Dirección de la API de gRPC. Por defecto: `127.0.0.1:9632`.

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

Dirección de la API de gRPC. Por defecto: `127.0.0.1:9632`.

---
<h3>comando de la versión</h3>


<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    version

</TabItem>
</Tabs>

Muestra la versión de liberación, rama git, comite hash y construir tiempo.

## Comandos de Secrets {#secrets-commands}

| **Comando** | **Descripción** |
|-------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| secrets init | Inicializa las claves privadas del administrador de secretos correspondiente. |
| secrets generate | Genera un archivo de configuración del administrador de secretos que puede ser analizado por Polygon Edge. |
| Salida de secretos | Imprime la dirección de la clave pública de BLS, la dirección de la clave pública de validador y el id del nodo para referencia |

### secrets init flags {#secrets-init-flags}

<h4><i>Configuración</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets init [--config SECRETS_CONFIG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets init --config ./secretsManagerConfig.json

</TabItem>
</Tabs>

Establece la ruta hacia el archivo de configuración de Secrets Manager (Administrador de secretos). Hashicorp Vault lo usa. Si se omite, se utiliza el administrador Secrets Manager FS local.

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

Establece el directorio de los datos de Polygon Edge si se utiliza FS local.

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

Establece la indicación de si generar una clave de ECDSA. Por defecto: `true`.

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

Establece la indicación de si generar una clave de la red Libp2p. Por defecto: `true`.

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

Establece la indicación de si generar una clave de BLS. Por defecto: `true`.

### secrets generate flags {#secrets-generate-flags}

<h4><i>dir</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--dir DATA_DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --dir ./example-dir

</TabItem>
</Tabs>

Establece el directorio del archivo de configuración por defecto de Secrets Manager (Administrador de secretos): `./secretsManagerConfig.json`

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

Especifica el tipo de Secrets Manager (Administrador de secretos) [`hashicorp-vault`]. Por defecto: `hashicorp-vault`

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

Especifica el token de acceso para el servicio.

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

Especifica el URL del servidor para el servicio.

---

<h4><i>Nombre</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--name NODE_NAME]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --name node-1

</TabItem>
</Tabs>

Especifica el nombre del nodo para el mantenimiento de registros en servicio. Por defecto: `polygon-edge-node`

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

Especifica el espacio del nombre utilizado para el administrador de secretos de Hashicorp Vault. Por defecto: `admin`

### secretos de las banderas de salida {#secrets-output-flags}

<h4><i>bls</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--bls FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --bls

</TabItem>
</Tabs>

Establece la bandera que indica si solo se debe transmitir la clave pública . Por defecto: `true`

---

<h4><i>Configuración</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--config SECRETS_CONFIG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --config ./secretsManagerConfig.json

</TabItem>
</Tabs>

Establece la ruta hacia el archivo de configuración de Secrets Manager (Administrador de secretos). Si se omite, se utiliza el administrador Secrets Manager FS local.

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

Establece el directorio de los datos de Polygon Edge si se utiliza FS local.

---

<h4><i>nodo</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--node-id FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --node-id

</TabItem>
</Tabs>

Establece la bandera que indica si solo se debe transmitir la ID del nodo de red. Por defecto: `true`

---

<h4><i>Validador</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--validator FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --validator

</TabItem>
</Tabs>

Establece la bandera que indica si solo se debe producir la dirección del validador. Por defecto: `true`

---

## Respuestas {#responses}

### Respuesta del estado {#status-response}

El objeto de respuesta se define mediante el uso de búferes de protocolo.
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

### Respuesta del monitor {#monitor-response}
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

## Utilidades {#utilities}

### whitelist commands {#whitelist-commands}

| **Comando** | **Descripción** |
|------------------------|-------------------------------------------------------------------------------------|
| whitelist show | Muestra información de la lista blanca |
| whitelist deployment | Actualiza la lista blanca del despliegue del contrato inteligente |

<h3> whitelist show </h3>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist show

</TabItem>
</Tabs>

Muestra información de la lista blanca.

---

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist show [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist show --chain genesis.json

</TabItem>
</Tabs>

Especifica el archivo génesis que se va a actualizar. Por defecto: `./genesis.json`.

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

Especifica el archivo génesis que se va a actualizar. Por defecto: `./genesis.json`.

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

Añade una nueva dirección a la lista blanca de despliegue de contratos. Solo las direcciones de la lista blanca de despliegue de contratos pueden desplegar contratos. Si está vacía, cualquier dirección puede ejecutar el despliegue del contrato.

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

Elimina una dirección de la lista blanca de despliegue de contratos. Solo las direcciones de la lista blanca de despliegue de contratos pueden desplegar contratos. Si está vacía, cualquier dirección puede ejecutar el despliegue del contrato.

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

Dirección de la API de gRPC. Por defecto: `127.0.0.1:9632`.

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

Ruta del archivo que se va a guardar

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

Altura inicial de los bloques en el archivo Por defecto: 0.

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

Altura final de los bloques en el archivo

---

## Plantilla de génesis {#genesis-template}
El archivo de génesis se debe utilizar para establecer el estado inicial de la cadena de bloques (por ejemplo, si algunas cuentas deberían tener un saldo inicial).

Se genera el siguiente archivo *./genesis.json*:
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

### Directorio de datos {#data-directory}

Al ejecutar la indicación *data-dir*, se genera una carpeta de **cadena de prueba**.
La estructura de la carpeta consta de las siguientes subcarpetas:
* **blockchain**: guarda el LevelDB para los objetos de la cadena de bloques
* **trie**: guarda el LevelDB para los árboles de Merkle
* **keystore**: guarda las claves privadas para el cliente Esto incluye la clave privada de libp2p y la clave privada de sellado y validación.
* **consensus**: guarda cualquier información del consenso que el cliente pueda necesitar mientras trabaja

## Recursos {#resources}
* **[Búferes de protocolo](https://developers.google.com/protocol-buffers)**

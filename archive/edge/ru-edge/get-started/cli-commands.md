---
id: cli-commands
title: Команды CLI
description: "Перечень команд интерфейса командной строки (CLI) и параметров команд для Polygon Edge."
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


В этом разделе описываются команды и параметры команд Polygon Edge, а также их использование.

:::tip Поддержка вывода JSON

Некоторые команды поддерживают параметр `--json`. Этот флаг предписывает команде распечатать вывод в формате JSON

:::

## Команды пуска {#startup-commands}

| **Команда** | **Описание** |
|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| server | Команда по умолчанию, запускающая клиент блокчейна и выполняющая загрузку всех модулей |
| genesis | Генерирует файл *genesis.json*, который используется для установки заданного состояния цепочки до запуска клиента. Структура файла генезиса описана ниже |
| genesis predeploy | Предварительно развертывает смарт-контракт для свежих сетей |

### параметры команды server {#server-flags}


| **Все флаги сервера** |
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

Используется, чтобы указать директорию данных для хранения данных клиента Polygon Edge. По умолчанию: `./test-chain`.

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

Устанавливает адрес и порт для сервиса JSON-RPC `address:port`.   
Если определен только порт, `:10001` он привязывается ко всем интерфейсам `0.0.0.0:10001`.   
Если параметр пропущен, сервис выполняет привязку по умолчанию `address:port`.   
Адрес по умолчанию: `0.0.0.0:8545`.

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

Устанавливает максимальный диапазон блоков, рассматриваемых при выполнении запросов json-rpc и включающих значения fromBlock/toBlock (например, eth_getLogs). Значение по умолчанию:`1000`.

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

Устанавливает максимальную длину, рассматриваемую при обработке пакетных запросов json-rpc. По умолчанию: `20`.

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

Устанавливает адрес и порт для сервиса gRPC `address:port`. Адрес по умолчанию: `127.0.0.1:9632`.

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

Устанавливает адрес и порт для сервиса libp2p `address:port`. Адрес по умолчанию: `127.0.0.1:1478`.

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

Устанавливает адрес и порт для сервера prometheus `address:port`.   
Если определен только порт, `:5001` сервис будет привязан ко всем интерфейсам `0.0.0.0:5001`.   
Если параметр пропущен, сервис не запускается.

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

Устанавливает целевой лимит газа на блок для цепочки. По умолчанию (не устанавливается принудительно): `0`.

Более подробное разъяснение целевого предела газа на блок находится в [разделе TxPool](/docs/edge/architecture/modules/txpool#block-gas-target).

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

Устанавливает максимальное количество пиров для клиента. По умолчанию: `40`.

Лимит пиров задается с помощью параметра `max-peers` или `max-inbound/outbound-peers`.

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

Задает максимальное количество входящих пиров клиента. Если установлено значение `max-peers`, лимит max-inbound-peer рассчитывается по следующей формуле.

`max-inbound-peer = InboundRatio * max-peers`, где `InboundRatio` равняется `0.8`.

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

Устанавливает максимальное количество исходящих пиров клиента. Если установлено значение `max-peers`, количество max-outbound-peer рассчитывается по следующей формуле.

`max-outbound-peer = OutboundRatio * max-peers`, где `OutboundRatio` равняется `0.2`.

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

Устанавливает максимальное количество транзакций в очереди на аккаунт. Значение по умолчанию:`128`.

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

Устанавливает уровень журнала для вывода консоли. По умолчанию: `INFO`.

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

Определяет имя файла журнала, которое будет держать весь вывод журнала для команды server.
По умолчанию все журналы команды server выводятся на консоль (stdout),
но если этот параметр включен, вывода на консоль при запуске команды server не будет.

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

Указывает файл генезиса, используемый для запуска цепочки. По умолчанию: `./genesis.json`.

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

Указывает адрес пира, который требуется присоединить.

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

Устанавливает внешний IP-адрес без порта так, как его видят пиры.

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

Задает DNS-адрес хоста. Можно использовать, чтобы рекламировать внешний DNS. Поддерживает `dns`,`dns4`,`dns6`.

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

Устанавливает минимальный лимит цены на газ для принятия в пул. По умолчанию: `1`.

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

Устанавливает максимальное количество слотов в пуле. По умолчанию: `4096`.

---

#### <h4></h4><i>Конфигурация</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--config CLI_CONFIG_PATH]

</TabItem>
  <TabItem value="example" label="Example">

    server --config ./myConfig.json

</TabItem>
</Tabs>

Указывает путь к конфигурации интерфейса командной строки. Поддерживает `.json`.

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

Задает путь к файлу конфигурации SecretsManager. Используется для Hashicorp Vault, AWS SSM и GCP Secrets Manager. Если пропущен, используется локальный диспетчер секретов FS.

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

Устанавливает клиент в режим разработчика. По умолчанию: `false`. В режиме dev открытие сверстника отключено по умолчанию.

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

Устанавливает интервал уведомления разработчика клиента в секундах. По умолчанию: `0`.

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

Запрещает клиенту находить других пиров. По умолчанию: `false`.

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

Восстанавливает блоки из указанного файла архива

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

Задает время производства блока в секундах. По умолчанию: `2`

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

Задает авторизованные домены для общего доступа к ответам из запросов JSON-RPC.   
Несколько параметров `--access-control-allow-origins "https://example1.com" --access-control-allow-origins "https://example2.com"` можно использовать для включения авторизации нескольких доменов.   
Если параметр пропущен, заголовок Access-Control-Allow-Origins устанавливается как `*` и все домены авторизуются.

---

### параметры команды genesis {#genesis-flags}
| **Все флаги генеза** |
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

Устанавливает каталог для данных генезиса Polygon Edge. По умолчанию: `./genesis.json`.

---

#### <h4></h4><i>Название</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--name NAME]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --name test-chain

</TabItem>
</Tabs>

Задает имя цепочки. По умолчанию: `polygon-edge`.

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

Устанавливает флаг, указывающий, что клиент должен использовать PoS IBFT. PoA используется по умолчанию, если флаг не установлен или `false`.

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

Задает размер эпохи для цепочки. По умолчанию `100000`.

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

Задает предварительно пополненные счета и их остатки на балансе в формате `address:amount`.
Количество можно вводить в десятичном или шестнадцатеричном формате.
По умолчанию предопределен баланс: `0xD3C21BCECCEDA1000000`(1 миллион токенов нативной валюты).

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

Задает идентификатор цепочки. По умолчанию: `100`.

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

Указывает режим валидации заголовков блоков. Возможные значения: `[ecdsa, bls]`. По умолчанию: `bls`.

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

Путь префикса для каталога папки валидатора. Должен присутствовать, если отсутствует параметр `ibft-validator`.

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

Задает передаваемые адреса как валидаторы IBFT. Должен присутствовать, если отсутствует параметр `ibft-validators-prefix-path`.
1. Если сеть работает с ECDSA, используется формат `--ibft-validator [ADDRESS]`.
2. Если сеть работает с BLS, используется формат  `--ibft-validator [ADDRESS]:[BLS_PUBLIC_KEY]`.

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

Указывает максимальное количество газа, используемое всеми операциями в блоке. По умолчанию: `5242880`.

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

Задает протокол консенсуса. По умолчанию: `pow`.

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

Multiaddr URL для загрузочной строки обнаружения p2p. Этот параметр можно использовать несколько раз.
Вместо IP-адреса можно указать DNS-адрес загрузочного узла.

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

Максимальное количество стейкеров, которые могут присоединиься к набору валидаторов в консенсусе PoS.
Это количество не может превышать значение MAX_SAFE_INTEGER (2^53 - 2).

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

Минимальное количество стейкеров, которые должны присоединиться к набору валидаторов в консенсусе PoS.
Это количество не может превышать значение max-validator-count.
Значение по умолчанию равняется 1.

---

### flags predeploy {#genesis-predeploy-flags}

<h4><i>artifacts-path</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis predeploy [--artifacts-path PATH_TO_ARTIFACTS]

</TabItem>
  <TabItem value="example" label="Example">

    genesis predeploy --artifacts-path ./ArtifactsData.json

</TabItem>
</Tabs>

Устанавливает путь к контрактному артефактам `abi`JSON, который содержит , `bytecode`и .`deployedBytecode`

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

Устанавливает путь к `genesis.json`файлу, который должен быть обновлен. По умолчанию `./genesis.json`.

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

Устанавливает аргументы конструктора смарт-контракта, если таковые имеются. Подробное руководство по тому, как должны выглядеть эти аргументы, пожалуйста, обратитесь в [статью предварительного развертывания](/docs/edge/additional-features/predeployment).

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

Устанавливает адрес для предварительного развертывания. По умолчанию `0x0000000000000000000000000000000000001100`.

---


## Команды оператора {#operator-commands}

### Команды пиров {#peer-commands}

| **Команда** | **Описание** |
|------------------------|-------------------------------------------------------------------------------------|
| peers add | Добавляет нового пира, используя адрес libp2p |
| peers list | Выводит список все пиров, к которым клиент подключен через libp2p |
| peers status | Выводит статус определенного пира из списка пиров, используя адрес libp2p |

<h3>Параметры команды peers add</h3>

<h4><i>addr</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers add --addr PEER_ADDRESS

</TabItem>
  <TabItem value="example" label="Example">

    peers add --addr /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

Адрес пира libp2p в формате multiaddr.

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

Адрес gRPC API. По умолчанию: `127.0.0.1:9632`.

<h3>Параметры комнады peers list</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers list [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    peers list --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Адрес gRPC API. По умолчанию: `127.0.0.1:9632`.

<h3>Параметры команды peers status</h3>

<h4><i>peer-id</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers status --peer-id PEER_ID

</TabItem>
  <TabItem value="example" label="Example">

    peers status --peer-id 16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

Идентификатор нода Libp2p определенного пира в сети p2p.

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

Адрес gRPC API. По умолчанию: `127.0.0.1:9632`.

### Команды IBFT {#ibft-commands}

| **Команда** | **Описание** |
|------------------------|-------------------------------------------------------------------------------------|
| ibft snapshot | Возвращает снимок IBFT |
| ibft candidates | Запрашивает текущий набор предложенных кандидатов, а также кандидатов, которые еще не были включены |
| ibft propose | Предлагает нового кандидата для добавления/удаления из набора валидаторов |
| ibft status | Возвращает общий статус клиента IBFT |
| ibft switch | Добавляет конфигурации форка в файл genesis.json для переключения типа IBFT |
| ibft quorum | Указывает номер блока, после которого для достижения консенсуса будет использоваться метод оптимального размера кворума |


<h3>Параметры команды ibft snapshot</h3>

<h4><i>number</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft snapshot [--number BLOCK_NUMBER]

</TabItem>
  <TabItem value="example" label="Example">

    ibft snapshot --number 100

</TabItem>
</Tabs>

Высота блока (число) для снимка.

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

Адрес gRPC API. По умолчанию: `127.0.0.1:9632`.

<h3>Параметры команды ibft candidates</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft candidates [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    ibft candidates --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Адрес gRPC API. По умолчанию: `127.0.0.1:9632`.

<h3>Параметры команды ibft propose</h3>

<h4><i>vote</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft propose --vote VOTE

</TabItem>
  <TabItem value="example" label="Example">

    ibft propose --vote auth

</TabItem>
</Tabs>

Предлагает изменения набора валидаторов. Возможные значения: `[auth, drop]`.

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

Адрес аккаунта, за который требуется проголосовать.

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

Публичный ключ BLS аккаунта, за который требуется проголосовать, нужен только в режиме BLS.

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

Адрес gRPC API. По умолчанию: `127.0.0.1:9632`.

<h3>Параметры команды ibft status</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    ibft status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Адрес gRPC API. По умолчанию: `127.0.0.1:9632`.

<h3>Параметры команды ibft switch</h3>

<h4><i>chain</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --chain genesis.json

</TabItem>
</Tabs>

Указывает файл генезиса для обновления. По умолчанию: `./genesis.json`.

---

<h4><i>Тип</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--type TYPE]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --type PoS

</TabItem>
</Tabs>

Указывает тип IBFT для переключения. Возможные значения: `[PoA, PoS]`.

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

Указывает высоту развертывания контракта. Параметр доступен только для PoS.

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

Указывает режим валидации заголовков блоков. Возможные значения: `[ecdsa, bls]`. По умолчанию: `bls`.

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

Путь префикса для каталогов новых валидаторов. Должен присутствовать, если отсутствует параметр `ibft-validator`. Доступен только при использовании IBFT в режиме PoA (параметр `--pos` отсутствует).

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

Задает переданные адреса, использованные валидаторами IBFT после форка. Должен присутствовать, если отсутствует параметр `ibft-validators-prefix-path`. Доступен только в режиме PoA.
1. Если сеть работает с ECDSA, используется формат `--ibft-validator [ADDRESS]`.
2. Если сеть работает с BLS, используется формат  `--ibft-validator [ADDRESS][BLS_PUBLIC_KEY]`.

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

Максимальное количество стейкеров, которые могут присоединиься к набору валидаторов в консенсусе PoS.
Это количество не может превышать значение MAX_SAFE_INTEGER (2^53 - 2).

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

Минимальное количество стейкеров, которые должны присоединиться к набору валидаторов в консенсусе PoS.
Это количество не может превышать значение max-validator-count.
Значение по умолчанию равняется 1.

Задает начальную высоту форка.

---

<h3>Параметры команды ibft quorum</h3>

<h4><i>from</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft quorum [--from your_quorum_switch_block_num]

</TabItem>
  <TabItem value="example" label="Example">

    ibft quorum --from 350

</TabItem>
</Tabs>

Высота переключения расчета кворума на QuorumOptimal, который использует формулу `(2/3 * N)`, где `N` — количество нодов валидатора. Обратите внимание, что это требуется только для обратной совместимости, т. е. только для цепочек, использовавших старые расчеты кворума до определенной высоты блока.

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

Указывает файл генезиса для обновления. По умолчанию: `./genesis.json`.

### Команды пула транзакций {#transaction-pool-commands}

| **Команда** | **Описание** |
|------------------------|--------------------------------------------------------------------------------------|
| txpool status | Возвращает количество транзакций в пуле |
| txpool subscribe | Подписывается на события в пуле транзакций |

<h3>Параметры команды txpool status</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    txpool status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Адрес gRPC API. По умолчанию: `127.0.0.1:9632`.

<h3>Параметры команды txpool subscribe</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Адрес gRPC API. По умолчанию: `127.0.0.1:9632`.

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

Подписывается на продвигаемые события транзакций в пуле TxPool.

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

Подписывается на отброшенные события транзакций в пуле TxPool.

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

Подписывается на пониженные события транзакций в пуле TxPool.

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

Подписывается на добавленные события транзакций в пуле TxPool.

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

Подписывается на поставленные в очередь события транзакций в очередях аккаунта.

---

### Команды блокчейна {#blockchain-commands}

| **Команда** | **Описание** |
|------------------------|-------------------------------------------------------------------------------------|
| status | Возвращает статус клиента. Подробный отклик приведен ниже |
| monitor | Подписывается на поток событий блокчейна. Подробный отклик приведен ниже |
| version | Возвращает текущую версию клиента |

<h3>Параметры команды status</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Адрес gRPC API. По умолчанию: `127.0.0.1:9632`.

<h3>Параметры команды monitor</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    monitor [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    monitor --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Адрес gRPC API. По умолчанию: `127.0.0.1:9632`.

---
<h3>Команда</h3>


<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    version

</TabItem>
</Tabs>

Отображает версию релиза, ветку git, хэш и время сборки.

## Команды секретов {#secrets-commands}

| **Команда** | **Описание** |
|-------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| secrets init | Инициализирует приватные ключи для соответствующего диспетчера секретов |
| secrets generate | Генерирует файл конфигурации диспетчера секретов, который может обрабатываться Polygon Edge |
| вывод секретов | Отображает адрес открытого ключа BLS, адрес открытого ключа валидатора и идентификатор нода для ссылки |

### Параметры команды secrets init {#secrets-init-flags}

<h4><i>Конфигурация</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets init [--config SECRETS_CONFIG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets init --config ./secretsManagerConfig.json

</TabItem>
</Tabs>

Задает путь к файлу конфигурации SecretsManager. Используется для Hashicorp Vault. Если пропущен, используется локальный диспетчер секретов FS.

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

Задает директорию данных Polygon Edge, если используется локальная файловая система.

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

Устанавливает флаг необходимости сгенерировать ключ ECDSA. По умолчанию: `true`.

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

Устанавливает флаг необходимости сгенерировать ключ сети Libp2p. По умолчанию: `true`.

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

Устанавливает флаг необходимости сгенерировать ключ BLS. По умолчанию: `true`.

### Параметры команды secrets generate {#secrets-generate-flags}

<h4><i>dir</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--dir DATA_DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --dir ./example-dir

</TabItem>
</Tabs>

Задает каталог файла конфигурации диспетчера секретов по умолчанию: `./secretsManagerConfig.json`

---

<h4><i>Тип</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--type TYPE]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --type hashicorp-vault

</TabItem>
</Tabs>

Указывает тип диспетчера секретов [`hashicorp-vault`]. По умолчанию: `hashicorp-vault`

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

Указывает токен доступа к сервису

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

Указывает URL-адрес сервера для сервиса

---

<h4><i>Название</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--name NODE_NAME]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --name node-1

</TabItem>
</Tabs>

Указывает имя нода для учета записей в сервисе. По умолчанию: `polygon-edge-node`

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

Задает пространство имен, используемое для диспетчера секретов Hashicorp Vault. По умолчанию: `admin`

### Флаги вывода {#secrets-output-flags}

<h4><i>bls</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--bls FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --bls

</TabItem>
</Tabs>

Устанавливает флаг, указывающий, выводить ли только открытый ключ BLS. По умолчанию: `true`

---

<h4><i>Конфигурация</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--config SECRETS_CONFIG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --config ./secretsManagerConfig.json

</TabItem>
</Tabs>

Задает путь к файлу конфигурации SecretsManager. Если пропущен, используется локальный диспетчер секретов FS.

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

Задает директорию данных Polygon Edge, если используется локальная файловая система.

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

Устанавливает флаг, указывающий, следует ли выводить только идентификатор сетевой ноды. По умолчанию: `true`

---

<h4><i>Валидатор</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--validator FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --validator

</TabItem>
</Tabs>

Устанавливает флаг, указывающий, следует ли выводить только адрес валидатора. По умолчанию: `true`

---

## Отклики {#responses}

### Отклик состояния {#status-response}

Объект отклика определяется с использованием буферов протокола.
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

### Отклик монитора {#monitor-response}
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

## Утилиты {#utilities}

### Команды белого списка {#whitelist-commands}

| **Команда** | **Описание** |
|------------------------|-------------------------------------------------------------------------------------|
| whitelist show | Выводит информацию белого списка |
| whitelist deployment | Обновляет белый список развертывания смарт-контракта |

<h3> whitelist show </h3>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist show

</TabItem>
</Tabs>

Отображает информацию белого списка.

---

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist show [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist show --chain genesis.json

</TabItem>
</Tabs>

Указывает файл генезиса для обновления. По умолчанию: `./genesis.json`.

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

Указывает файл генезиса для обновления. По умолчанию: `./genesis.json`.

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

Добавляет новый адрес к белому списку для развертывания контрактов. Выполнять развертывание контрактов могут только адреса из белого списка развертывания контрактов. Если белый список пуст, любой адрес может развернуть контракт

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

Удаляет адрес из белого списка развертывания контракта. Выполнять развертывание контрактов могут только адреса из белого списка развертывания контрактов. Если белый список пуст, любой адрес может развернуть контракт

---

### параметры backup {#backup-flags}

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    backup [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    backup --grpc-address 127.0.0.1:9632

</TabItem>
</Tabs>

Адрес gRPC API. По умолчанию: `127.0.0.1:9632`.

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

Путь к файлу архива для сохранения.

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

Начальная высота блоков в архиве. По умолчанию: 0.

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

Конечная высота блоков в архиве.

---

## Шаблон генезиса {#genesis-template}
Файл генезиса следует использовать для установки начального состояния блокчейна (например, если какие-то аккаунты должны иметь начальный баланс).

Генерируется следующий файл *./genesis.json*:
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

### Директория данных {#data-directory}

При выполнении команды с параметром *data-dir* создается папка **test-chain**.
Структура этой папки состоит из следующих вложенных папок:
* **blockchain** — хранит БД LevelDB для объектов блокчейна
* **trie** — хранит БД LevelDB для попыток Merkle
* **хранилище ключей** — хранит приватные ключи для клиента. Это включает приватный ключ libp2p и приватный ключ запечатывания/валидатора
* **consensus** — хранит любую информацию о консенсусе, которая может потребоваться клиенту во время работы

## Информационные ресурсы {#resources}
* **[Буферы протоколов](https://developers.google.com/protocol-buffers)**

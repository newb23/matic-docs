---
id: poa
title: Доказательство полномочий (PoA)
description: "Разъяснения и инструкции относительно доказательства полномочий."
keywords:
  - docs
  - polygon
  - edge
  - PoA
  - autorithy
---

## Обзор {#overview}

IBFT PoA используется в Polygon Edge как механизм консенсуса по умолчанию. В PoA валидаторы отвечают за создание блоков и их последовательное добавление в блокчейн.

Все валидаторы составляют динамический набор валидаторов, поддерживающий добавление и удаление валидаторов с помощью механизма голосования. Это означает, что валидатора можно добавить в набор или удалить из набора, если большинство (51%) нодов валидаторов проголосуют за добавление или удаление данного валидатора. Это позволяет распознавать и удалять из сети злоумышленников и добавлять в сеть новых валидаторов, которым можно доверять.

Все валидаторы по очереди предлагают следующий блок (круговая очередь), и для валидации блока и его вставки в блокчейн требуется одобрение данного блока квалифицированным большинством (более 2/3) валидаторов.

Помимо валидаторов, имеются и другие ноды, которые не участвуют в создании блоков, но участвуют в процессе валидации.

## Добавление валидатора в набор валидаторов {#adding-a-validator-to-the-validator-set}

В этом руководстве описывается добавление нового нода валидатора в активную сеть IBFT с 4 нодами валидаторов.
Если вам нужна помощь в настройке сети, обратитесь в секции [Local Setup](/edge/get-started/set-up-ibft-locally.md) / [Cloud Setup](/edge/get-started/set-up-ibft-on-the-cloud.md).

### Шаг 1. Инициализируйте папки данных для IBFT и сгенерируйте ключи валидаторов для нового нода {#step-1-initialize-data-folders-for-ibft-and-generate-validator-keys-for-the-new-node}

Чтобы запустить IBFT на новом ноде, необходимо предварительно инициализировать папки данных и сгенерировать ключи:

````bash
polygon-edge secrets init --data-dir test-chain-5
````

Эта команда распечатает ключ валидатора (адрес) и идентификатор нода. Для следующего шага вам потребуется ключ валидатора (адрес).

### Шаг 2. Предложите нового кандидата из числа других нодов валидатора {#step-2-propose-a-new-candidate-from-other-validator-nodes}

Чтобы новый нод стал валидатором, его должны предложить не менее 51% валидаторов.

Примеры предложения нового валидатора (`0x8B15464F8233F718c8605B16eBADA6fc09181fC2`) из существующего нода валидатора на адресе grpc: 127.0.0.1:10000:

````bash
polygon-edge ibft propose --grpc-address 127.0.0.1:10000 --addr 0x8B15464F8233F718c8605B16eBADA6fc09181fC2 --bls 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --vote auth
````

Структура команд IBFT описывается в разделе [Команды CLI](/docs/edge/get-started/cli-commands).

:::info Публичный ключ BLS

Публичный ключ BLS необходим, только если сеть работает с BLS. Если сеть не работает в режиме BLS `--bls`, это не требуется
:::

### Шаг 3. Запустите нод клиента {#step-3-run-the-client-node}

Поскольку в этом примере мы пытаемся запустить сеть, где все ноды находятся на одном компьютере, нам нужно следить за тем, чтобы избежать конфликтов портов.

````bash
polygon-edge server --data-dir ./test-chain-5 --chain genesis.json --grpc-address :50000 --libp2p :50001 --jsonrpc :50002 --seal
````

После доставки всех блоков на консоли можно заметить, что в валидации участвует новый нод

````bash
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=4004
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=5 votes=0
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft: proposer calculated: proposer=0x8B15464F8233F718c8605B16eBADA6fc09181fC2 block=4004
````

:::info Повышение статуса нода до валидатора

Нод может стать валидатором в результате голосования, однако для успешного добавления в набор валидаторов после окончания голосования нод необходимо перезапустить с флагом `--seal`.

:::

## Удаление валидатора из набора валидаторов {#removing-a-validator-from-the-validator-set}

Это довольно простая операция. Чтобы удалить нод валидатора из набора валидаторов, эту команду необходимо выполнить на большинстве нодов валидатора.

````bash
polygon-edge ibft propose --grpc-address 127.0.0.1:10000 --addr 0x8B15464F8233F718c8605B16eBADA6fc09181fC2 --bls 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --vote drop
````

:::info Публичный ключ BLS

Публичный ключ BLS необходим, только если сеть работает с BLS. Если сеть не работает в режиме BLS `--bls`, это не требуется
:::

После выполнения команд необходимо убедиться, что количество валидаторов уменьшилось (в данном примере журнала — с 4 до 3).

````bash
2021-12-15T19:20:51.014+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=2399 round=1
2021-12-15T19:20:51.014+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=4 votes=2
2021-12-15T19:20:51.015+0100 [INFO]  polygon.consensus.ibft.acceptState: we are the proposer: block=2399
2021-12-15T19:20:51.015+0100 [INFO]  polygon.consensus.ibft: picked out txns from pool: num=0 remaining=0
2021-12-15T19:20:51.015+0100 [INFO]  polygon.consensus.ibft: build block: number=2399 txns=0
2021-12-15T19:20:53.002+0100 [INFO]  polygon.consensus.ibft: state change: new=ValidateState
2021-12-15T19:20:53.009+0100 [INFO]  polygon.consensus.ibft: state change: new=CommitState
2021-12-15T19:20:53.009+0100 [INFO]  polygon.blockchain: write block: num=2399 parent=0x768b3bdf26cdc770525e0be549b1fddb3e389429e2d302cb52af1722f85f798c
2021-12-15T19:20:53.011+0100 [INFO]  polygon.blockchain: new block: number=2399 hash=0x6538286881d32dc7722dd9f64b71ec85693ee9576e8a2613987c4d0ab9d83590 txns=0 generation_time_in_sec=2
2021-12-15T19:20:53.011+0100 [INFO]  polygon.blockchain: new head: hash=0x6538286881d32dc7722dd9f64b71ec85693ee9576e8a2613987c4d0ab9d83590 number=2399
2021-12-15T19:20:53.011+0100 [INFO]  polygon.consensus.ibft: block committed: sequence=2399 hash=0x6538286881d32dc7722dd9f64b71ec85693ee9576e8a2613987c4d0ab9d83590 validators=4 rounds=1 committed=3
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft: state change: new=AcceptState
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=2400 round=1
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=3 votes=0
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft: proposer calculated: proposer=0xea21efC826F4f3Cb5cFc0f986A4d69C095c2838b block=2400
````

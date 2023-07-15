---
id: bls
title: BLS
description: "Объяснение и инструкции для режима BLS."
keywords:
  - docs
  - polygon
  - edge
  - bls
---

## Обзор {#overview}

BLS, также известный как Boneh–Lynn–Shacham (BLS) — это криптографическая схема подписи, которая позволяет пользователю удостовериться в том, что подписант является подлинным. Это схема подписи, которая может объединить несколько подписей. BLS используется в Polygon Edge по умолчанию для повышения безопасности в режиме консенсуса IBFT. BLS может агрегировать подписи в однобайтый массив и уменьшать размер заголовка блока. Каждая цепочка может выбрать, следует ли использовать BLS. Ключ ECDSA используется вне зависимости от того, включен ли режим BLS.

## Видеопрезентация {#video-presentation}

[![bls - видео](https://img.youtube.com/vi/HbUmZpALlqo/0.jpg)](https://www.youtube.com/watch?v=HbUmZpALlqo)

## Настройка новой цепочки с помощью BLS {#how-to-setup-a-new-chain-using-bls}

Подробные инструкции по настройке можно найти в разделах [Локальная настройка](/docs/edge/get-started/set-up-ibft-locally) / [Облачная настройка](/docs/edge/get-started/set-up-ibft-on-the-cloud).

## Как выполнить миграцию из существующей цепочки ECDSA PoA в цепочку BLS PoA {#how-to-migrate-from-an-existing-ecdsa-poa-chain-to-bls-poa-chain}

В этом разделе описывается использование режима BLS в существующей цепочке PoA.
Для включения BLS в цепочке PoA требуются следующие шаги.

1. Остановите все ноды
2. Сгенерируйте ключи BLS для валидаторов
3. Добавьте настройку форка в genesis.json
4. Перезапустите все ноды

### 1. Остановка всех нодов {#1-stop-all-nodes}

Завершите все процессы валидаторов, нажав Ctrl + c (Control + c). Запомните высоту последнего блока (самый большой порядковый номер в журнале записанных блоков).

### 2. Генерирование ключа BLS {#2-generate-the-bls-key}

`secrets init` с `--bls` генерирует ключ BLS. Чтобы сохранить ECDSA и сетевой ключ и добавить новый ключ BLS, необходимо отключить `--ecdsa` и `--network`.

```bash
polygon-edge secrets init --bls --ecdsa=false --network=false

[SECRETS INIT]
Public key (address) = 0x...
BLS Public key       = 0x...
Node ID              = 16...
```

### 3. Добавление настройки форка {#3-add-fork-setting}

Команда `ibft switch` добавляет настройку форка, включающую BLS в существующей цепочке, в `genesis.json`.

В сетях PoA в команде необходимо указать валидаторы. Как и в случае с командой `genesis`, для указания валидатора можно использовать флаги `--ibft-validators-prefix-path` или `--ibft-validator`.

Укажите высоту, с которой начинается цепочка, используя BLS с флагом `--from`.

```bash
polygon-edge ibft switch --chain ./genesis.json --type PoA --ibft-validator-type bls --ibft-validators-prefix-path test-chain- --from 100
```

### 4. Перезапуск всех нодов {#4-restart-all-nodes}

Перезапустите все ноды с помощью команды `server`. После создания блока на позиции `from`, как указано в предыдущем шаге, цепочка включает BLS и показывает журналы следующим образом:

```bash
2022-09-02T11:45:24.535+0300 [INFO]  polygon.ibft: IBFT validation type switched: old=ecdsa new=bls
```

Журналы также показывают, какой режим проверки используется для генерирования каждого блока после создания блока.

```
2022-09-02T11:45:28.728+0300 [INFO]  polygon.ibft: block committed: number=101 hash=0x5f33aa8cea4e849807ca5e350cb79f603a0d69a39f792e782f48d3ea57ac46ca validation_type=bls validators=3 committed=3
```

## Как выполнить миграцию из существующей цепочки ECDSA PoA в цепочку BLS PoS {#how-to-migrate-from-an-existing-ecdsa-pos-chain-to-a-bls-pos-chain}

В этом разделе описывается использование режима BLS в существующей цепочке PoS.
Для включения BLS в цепочке PoS требуются следующие шаги.

1. Остановите все ноды
2. Сгенерируйте ключи BLS для валидаторов
3. Добавьте настройку форка в genesis.json
4. Вызовите контракт стейкинга для регистрации публичного ключа BLS
5. Перезапустите все ноды

### 1. Остановка всех нодов {#1-stop-all-nodes-1}

Завершите все процессы валидаторов, нажав Ctrl + c (Control + c). Запомните высоту последнего блока (самый большой порядковый номер в журнале записанных блоков).

### 2. Генерирование ключа BLS {#2-generate-the-bls-key-1}

`secrets init` с флагом `--bls` генерирует ключ BLS. Чтобы сохранить ECDSA и сетевой ключ и добавить новый ключ BLS, необходимо отключить `--ecdsa` и `--network`.

```bash
polygon-edge secrets init --bls --ecdsa=false --network=false

[SECRETS INIT]
Public key (address) = 0x...
BLS Public key       = 0x...
Node ID              = 16...
```

### 3. Добавление настройки форка {#3-add-fork-setting-1}

Команда `ibft switch` добавляет настройку форка, включающую BLS из середины цепочки, в `genesis.json`.

Укажите высоту начала цепочки, используя режим BLS с флагом `from`, а также высоту обновления контракта с флагом `development`.

```bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --ibft-validator-type bls --deployment 50 --from 200
```

### 4. Регистрация публичного ключа BLS в контракте стейкинга {#4-register-bls-public-key-in-staking-contract}

После добавления форка и перезапуска валидаторов каждый валидатор должен вызвать `registerBLSPublicKey` в контракте стейкинга для регистрации публичного ключа BLS. Это необходимо сделать после указания высоты в `--deployment`, прежде чем высота будет указана в `--from`.

Скрипт регистрации публичного ключа BLS определен в [репозитории Staking Smart Contract](https://github.com/0xPolygon/staking-contracts).

Установите `BLS_PUBLIC_KEY` для регистрации в файл `.env`. Используйте [pos-stake-unstake](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts) для получения более подробной информации о других параметрах.

```env
JSONRPC_URL=http://localhost:10002
STAKING_CONTRACT_ADDRESS=0x0000000000000000000000000000000000001001
PRIVATE_KEYS=0x...
BLS_PUBLIC_KEY=0x...
```

Следующая команда регистрирует в контракте публичный ключ BLS, заданный в `.env`.

```bash
npm run register-blskey
```

:::warning Валидаторы должны регистрировать публичный ключ BLS вручную

В режиме BLS валидаторы должны иметь собственный адрес и публичный ключ BLS. Уровень консенсуса игнорирует валидаторов, которые не зарегистрировали публичный ключ BLS в контракте, когда консенсус доставляет информацию валидатора из контракта.

:::

### 5. Перезапуск всех нодов {#5-restart-all-nodes}

Перезапустите все ноды с помощью команды `server`. Цепочка включает BLS после создания блока в `from`, как указано на предыдущем шаге.

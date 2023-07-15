---
id: blockscout
title: Blockscout
description: Настройка экземпляра Blockscout для работы с Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - blockscout
  - deploy
  - setup
  - instance
---

## Обзор {#overview}
В этом руководстве подробно рассказывается о компиляции и развертывании экземпляров Blockscout для работы с Polygon-Edge.
Blockscout использует собственную [документацию](https://docs.blockscout.com/for-developers/manual-deployment), однако в настоящем руководстве содержатся простые, но подробные пошаговые инструкции по настройке экземпляра Blockscout.

## Среда {#environment}
* Операционная система: [ссылка для загрузки](https://releases.ubuntu.com/20.04/) Ubuntu Server 20.04 LTS с разрешениями sudo
* Аппаратное обеспечение сервера: 8 процессоров / ОЗУ 16 ГБ / жесткий диск 50 ГБ (LVM)
* Сервер базы данных: выделенный сервер с 2 процессорами / ОЗУ 4 ГБ / SSD-накопитель 100 ГБ / PostgreSQL 13.4

### Сервер БД {#db-server}
Для настоящего руководства требуется подготовить сервер базы данных и настроить базу данных и пользователя БД.
В настоящем руководстве не будет подробно описываться процесс развертывания и настройки сервера PostgreSQL.
Этому посвящено множество других руководств, например [Руководство DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-install-postgresql-on-ubuntu-20-04-quickstart)

:::info ОТКАЗ ОТ ОТВЕТСТВЕННОСТИ

Настоящее руководство предназначено только для запуска Blockscout на одном экземпляре, что не является идеальной моделью работы.   
В производственной среде может потребоваться добавление в архитектуру обратного прокси, балансировщика нагрузки, опций масштабируемости и т. д.

:::

# Процедура развертывания Blockscout {#blockscout-deployment-procedure}

## Часть 1 — установка зависимостей {#part-1-install-dependencies}
Прежде чем начинать, нам нужно убедиться, что мы установили все двоичные файлы, от которых зависит blockscout.

### Обновление и модернизация системы {#update-upgrade-system}
```bash
sudo apt -y update && sudo apt -y upgrade
```

### Добавление репозиториев erlang {#add-erlang-repos}
```bash
# go to your home dir
cd ~
# download deb
wget https://packages.erlang-solutions.com/erlang-solutions_2.0_all.deb
# download key
wget https://packages.erlang-solutions.com/ubuntu/erlang_solutions.asc
# install repo
sudo dpkg -i erlang-solutions_2.0_all.deb
# install key
sudo apt-key add erlang_solutions.asc
# remove deb
rm erlang-solutions_2.0_all.deb
# remove key
rm erlang_solutions.asc
```

### Добавление репозитория NodeJS {#add-nodejs-repo}
```bash
sudo curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
```

### Установка Rust {#install-rust}
```bash
sudo curl https://sh.rustup.rs -sSf | sh -s -- -y
```

### Установите требуемую версию Erlang {#install-required-version-of-erlang}
```bash
sudo apt -y install esl-erlang=1:24.*
```

### Установите требуемую версию Elixir {#install-required-version-of-elixir}
Требуется версия Elixir `1.13`. Если мы попробуем установить эту версию из официального репозитория,
`erlang` произведет обновление до `Erlang/OTP 25`, а нам этого не нужно.     
В связи с этим мы установим конкретную предварительно скомпилированную версию `elixir`со страницы релизов на GitHub.

```bash
cd ~
mkdir /usr/local/elixir
wget https://github.com/elixir-lang/elixir/releases/download/v1.13.4/Precompiled.zip
sudo unzip -d /usr/local/elixir/ Precompiled.zip
rm Precompiled.zip
```

Теперь нам нужно будет правильно настроить двоичные файлы системы `exlixir`.
```bash
sudo ln -s /usr/local/elixir/bin/elixir /usr/local/bin/elixir
sudo ln -s /usr/local/elixir/bin/mix /usr/local/bin/mix
sudo ln -s /usr/local/elixir/bin/iex /usr/local/bin/iex
sudo ln -s /usr/local/elixir/bin/elixirc /usr/local/bin/elixirc
```

Проверьте правильность установки `elixir`и ,`erlang` запустив .`elixir -v`
Вывод должен выглядеть следующим образом:
```bash
Erlang/OTP 24 [erts-12.3.1] [source] [64-bit] [smp:8:8] [ds:8:8:10] [async-threads:1] [jit]

Elixir 1.13.4 (compiled with Erlang/OTP 22)
```

:::warning

`Erlang/OTP` версии `24` и `Elixir` версии `1.13.*` обязательны.    
Если использовать другие версии, вы столкнетесь с проблемами при компиляции и запуске Blockscout.

:::   
:::info

Ознакомьтесь с официальной ***[страницей требований Blockscout](https://docs.blockscout.com/for-developers/information-and-settings/requirements)***

:::

### Установите NodeJS {#install-nodejs}
```bash
sudo apt -y install nodejs
```

### Установите Cargo {#install-cargo}
```bash
sudo apt -y install cargo
```

### Установите другие зависимости {#install-other-dependencies}
```bash
sudo apt -y install automake libtool inotify-tools gcc libgmp-dev make g++ git
```

### Также вы можете установить клиент postgresql для проверки подключения к базе данных {#optionally-install-postgresql-client-to-check-your-db-connection}
```bash
sudo apt install -y postgresql-client
```

## Часть 2 — установка переменных среды {#part-2-set-environment-variables}
Прежде чем начать компиляцию Blockscout, необходимо установить переменные среды.
В этом руководстве мы установим только базовый минимум для начала работы.
Полный список переменных, которые можно настроить, находится [здесь](https://docs.blockscout.com/for-developers/information-and-settings/env-variables)

### Задайте подключение к базе данных как переменную среды {#set-database-connection-as-environment-variable}
```bash
# postgresql connection example:  DATABASE_URL=postgresql://blockscout:Passw0Rd@db.instance.local:5432/blockscout
export DATABASE_URL=postgresql://<db_user>:<db_pass>@<db_host>:<db_port>/<db_name> # db_name does not have to be existing database

# we set these env vars to test the db connection with psql
export PGPASSWORD=Passw0Rd
export PGUSER=blockscout
export PGHOST=db.instance.local
export PGDATABASE=postgres # on AWS RDS postgres database is always created
```

Протестируйте подключение к базе данных, используя указанные параметры.
Поскольку вы задали переменные среды PG, вы сможете подключиться к базе данных только следующим образом:
```bash
psql
```

Если база данных настроена правильно, вы должны увидеть строку psql:
```bash
psql (12.9 (Ubuntu 12.9-0ubuntu0.20.04.1))
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, bits: 256, compression: off)
Type "help" for help.

blockscout=>
```

Иначе вы увидите ошибку следующего вида:
```bash
psql: error: FATAL:  password authentication failed for user "blockscout"
FATAL:  password authentication failed for user "blockscout"
```
В этом случае вам будут полезны [эти документы](https://ubuntu.com/server/docs/databases-postgresql).

:::info Подключение к базе данных

Перед переходом к следующей части убедитесь, что вы решили все проблемы с подключением к базе данных. Вам нужно будет предоставить привилегии superuser пользователю blockscout.

:::
```bash
postgres@ubuntu:~$ createuser --interactive
Enter name of role to add: blockscout
Shall the new role be a superuser? (y/n) y
```

## Часть 3 — клонирование и компиляция Blockscout {#part-3-clone-and-compile-blockscout}
Теперь мы готовы начать установку Blockscout.

### Клонируйте репозиторий Blockscout {#clone-blockscout-repo}
```bash
cd ~
git clone https://github.com/Trapesys/blockscout
```

### Сгенерируйте секретный ключ для защиты рабочей сборки {#generate-secret-key-base-to-protect-production-build}
```bash
cd blockscout
mix deps.get
mix local.rebar --force
mix phx.gen.secret
```
В последней строке вы должны увидеть длинную строку случайных символов.     
Ее необходимо задать как переменную среды `SECRET_KEY_BASE`, прежде чем переходить к следующему шагу.     
Например:
```bash
export SECRET_KEY_BASE="912X3UlQ9p9yFEBD0JU+g27v43HLAYl38nQzJGvnQsir2pMlcGYtSeRY0sSdLkV/"
```

### Задайте производственный режим {#set-production-mode}
```bash
export MIX_ENV=prod
```

### Выполните компиляцию {#compile}
Перейдите в каталог клонирования и начните компиляцию

```bash
cd blockcout
mix local.hex --force
mix do deps.get, local.rebar --force, deps.compile, compile
```

:::info

Если вы уже выполнили развертывание, удалите статичные активы из предыдущей сборки ***mix phx.digest.clean***.

:::

### Перенесите базы данных {#migrate-databases}
:::info

Этот этап не будет успешно выполнен, если вы не настроили подключение к БД надлежащим образом, не указали
или задали неправильные параметры переменой среды DATABASE_URL.
Пользователь базы данных должен иметь привилегии superuser.

:::
```bash
mix do ecto.create, ecto.migrate
```

Если вам требуется сначала отключить базу данных, запустите
```bash
mix do ecto.drop, ecto.create, ecto.migrate
```

### Установите зависимости npm и скомпилируйте активы клиентской части {#install-npm-dependencies-and-compile-frontend-assets}
Вам нужно будет перейти в каталог, содержащий активы клиентской части.

```bash
cd apps/block_scout_web/assets
sudo npm install
sudo node_modules/webpack/bin/webpack.js --mode production
```

:::info Имейте терпение

Компиляция этих активов может занять несколько минут, и при этом не будет отображаться никакой вывод.
Может показаться, что процесс завис, но нужно просто подождать. Когда процесс компиляции будет завершен, вывод должен выглядеть примерно так: `webpack 5.69.1 compiled with 3 warnings in 104942 ms`

:::

### Создайте статичные активы {#build-static-assets}
Для этого шага нужно будет вернуться на корневой уровень папки клонирования Blockscout.
```bash
cd ~/blockscout
sudo mix phx.digest
```

### Сгенерируйте самостоятельно подписанные сертификаты {#generate-self-signed-certificates}
:::info

Вы можете пропустить этот шаг, если не будете использовать `https`.

:::
```bash
cd apps/block_scout_web
mix phx.gen.cert blockscout blockscout.local
```

## Часть 4 — создание и запуск сервиса Blockscout {#part-4-create-and-run-blockscout-service}
В этой части нам требуется настроить системный сервис, поскольку мы хотим, чтобы Blockscout запускался и работал в фоновом режиме даже после перезагрузки системы.

### Создайте файл сервиса {#create-service-file}
```bash
sudo touch /etc/systemd/system/explorer.service
```

### Отредактируйте файл сервиса {#edit-service-file}
Используйте предпочитаемый текстовый редактор Linux, чтобы отредактировать этот файл и настроить сервис.
```bash
sudo vi /etc/systemd/system/explorer.service
```
Содержимое файла explorer.service должно выглядеть следующим образом:
```bash
[Unit]
Description=BlockScout Server
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=1
User=root
StandardOutput=syslog
StandardError=syslog
WorkingDirectory=/usr/local/blockscout
ExecStart=/usr/local/bin/mix phx.server
EnvironmentFile=/usr/local/blockscout/env_vars.env

[Install]
WantedBy=multi-user.target
```

### Включите запуск сервиса при загрузке системы {#enable-starting-service-on-system-boot}
```bash
sudo systemctl daemon-reload
sudo systemctl enable explorer.service
```

### Переместите папку клонирования Blockscout в общесистемную область {#move-your-blockscout-clone-folder-to-system-wide-location}
Сервису Blockscout потребуется доступ к папке, которую вы клонировали из репозитория Blockscout и где вы скомпилировали все активы.
```bash
sudo mv ~/blockscout /usr/local
```

### Создайте файл переменных среды, который будет использоваться сервисом Blockscout {#create-env-vars-file-which-will-be-used-by-blockscout-service}

```bash
sudo touch /usr/local/blockscout/env_vars.env
# use your favorite text editor
sudo vi /usr/local/blockscout/env_vars.env

# env_vars.env file should hold these values ( adjusted for your environment )
ETHEREUM_JSONRPC_HTTP_URL="localhost:8545"  # json-rpc API of the chain
ETHEREUM_JSONRPC_TRACE_URL="localhost:8545" # same as json-rpc API
DATABASE_URL='postgresql://blockscout:Passw0Rd@db.instance.local:5432/blockscout' # database connection from Step 2
SECRET_KEY_BASE="912X3UlQ9p9yFEBD0JU+g27v43HLAYl38nQzJGvnQsir2pMlcGYtSeRY0sSdLkV/" # secret key base
ETHEREUM_JSONRPC_WS_URL="ws://localhost:8545/ws" # websocket API of the chain
CHAIN_ID=93201 # chain id
HEART_COMMAND="systemctl restart explorer" # command used by blockscout to restart it self in case of failure
SUBNETWORK="Supertestnet PoA" # this will be in html title
LOGO="/images/polygon_edge_logo.svg" # logo location
LOGO_FOOTER="/images/polygon_edge_logo.svg" # footer logo location
COIN="EDGE" # coin
COIN_NAME="EDGE Coin" # name of the coin
INDEXER_DISABLE_BLOCK_REWARD_FETCHER="true" # disable block reward indexer as Polygon Edge doesn't support tracing
INDEXER_DISABLE_PENDING_TRANSACTIONS_FETCHER="true" # disable pending transactions indexer as Polygon Edge doesn't support tracing
INDEXER_DISABLE_INTERNAL_TRANSACTIONS_FETCHER="true" # disable internal transactions indexer as Polygon Edge doesn't support tracing
MIX_ENV="prod" # run in production mode
BLOCKSCOUT_PROTOCOL="http" # protocol to run blockscout web service on
PORT=4000 # port to run blockscout service on
DISABLE_EXCHANGE_RATES="true" # disable fetching of exchange rates
POOL_SIZE=200 # the number of database connections
POOL_SIZE_API=300 # the number of read-only database connections
ECTO_USE_SSL="false" # if protocol is set to http this should be false
HEART_BEAT_TIMEOUT=60 # run HEARTH_COMMAND if heartbeat missing for this amount of seconds
INDEXER_MEMORY_LIMIT="10Gb" # soft memory limit for indexer - depending on the size of the chain and the amount of RAM the server has
FETCH_REWARDS_WAY="manual" # disable trace_block query
INDEXER_EMPTY_BLOCKS_SANITIZER_BATCH_SIZE=1000 # sanitize empty block in this batch size
```
:::info

Используйте `SECRET_KEY_BASE`, сгенерированный в части 3.

:::
Сохраните файл и выйдите из редактора.

### Запустите сервис Blockscout {#finally-start-blockscout-service}
```bash
sudo systemctl start explorer.service
```

## Часть 5 — тестирование функционала экземпляра Blockscout {#part-5-test-out-the-functionality-of-your-blockscout-instance}
Теперь осталось только проверить, работает ли сервис Blockscout.
Проверьте статус сервиса:
```bash
sudo systemctl status explorer.service
```

Для проверки статуса сервиса:
```bash
sudo journalctl -u explorer.service -f
```

Вы можете проверить, есть ли новые порты для прослушивания:
```bash
# if netstat is not installed
sudo apt install net-tools
sudo netstat -tulpn
```

Вам нужно будет получить список портов прослушивания, и в этом списке должно быть примерно следующее:
```
tcp        0      0 0.0.0.0:5432            0.0.0.0:*               LISTEN      28142/postgres
tcp        0      0 0.0.0.0:4000            0.0.0.0:*               LISTEN      42148/beam.smp
```

Веб-сервис Blockscout запускает порт и протокол, определенные в файле env. В этом примере используется `4000`(http).   
Если все хорошо, у вас должен быть доступ к веб-порталу Blockscout с помощью `http://<host_ip>:4000`.

## Важные соображения {#considerations}
Для наилучшей производительности рекомендуется использовать выделенный/локальный полный нод `polygon-edge`как архивный нод, не являющийся валидатором. Он будет использоваться только для запросов Blockscout.    
К API `json-rpc`этого нода не требуется открытый доступ, поскольку Blockscout выполняет все запросы на серверном уровне.


## Заключительные соображения {#final-thoughts}
Мы только что развернули один экземпляр Blockscout, который работает нормально, однако для рабочих целей следует разместить этот экземпляр за обратным прокси, например Nginx.
Также следует подумать о масштабируемости базы данных и экземпляра в зависимости от требований вашего сценария работы.

Обязательно ознакомьтесь с официальной [документацией по Blockscout](https://docs.blockscout.com/), где вы найдете множество вариантов настройки.
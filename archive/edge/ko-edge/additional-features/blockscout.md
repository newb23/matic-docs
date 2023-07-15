---
id: blockscout
title: Blockscout
description: Polygon 엣지와 함께 작동하도록 Blockscout 인스턴스를 설정하는 방법.
keywords:
  - docs
  - polygon
  - edge
  - blockscout
  - deploy
  - setup
  - instance
---

## 개요 {#overview}
이 가이드는 Blockscout 인스턴스를 Polygon 에지와 함께 작동하도록 컴파일하고 배포하는 방법에 대해 자세히 설명합니다.
Blockscout에는 자체 [문서](https://docs.blockscout.com/for-developers/manual-deployment)가 있지만 이 가이드는 Blockscout 인스턴스를 설정하는 방법의 간단하지만 자세한 단계별 지침에 중점을 둡니다.

## 환경 {#environment}
* 운영체제: sudo 권한이 있는 Ubuntu Server 20.04 LTS [다운로드 링크](https://releases.ubuntu.com/20.04/)
* 서버 하드웨어: CPU 8개/16GB RAM/50GB HDD(LVM)
* 데이터베이스 서버: CPU 2개/4GB RAM/100GB SSD/PostgreSQL 13.4 전용 서버

### DB 서버 {#db-server}
이 가이드를 따르려면 데이터베이스 서버가 준비되어 있고, 데이터베이스와 DB 사용자가 구성되어 있어야 합니다.
PostgreSQL 서버를 배포하고 구성하는 방법은 이 가이드에서 자세히 다루지 않습니다.
[DigitalOcean 가이드](https://www.digitalocean.com/community/tutorials/how-to-install-postgresql-on-ubuntu-20-04-quickstart)처럼 이를 위한 가이드는 많습니다.

:::info 고지 사항

이상적인 프로덕션 설정이 아닌 단일 인스턴스에서 Blockscout을 시작하고 실행하는 데 도움을 주는 가이드입니다.   
프로덕션에서는 역방향 프록시, 부하 분산 장치, 확장성 옵션 등을 아키텍처에 도입하고 싶을 것입니다.

:::

# Blockscout 배포 절차 {#blockscout-deployment-procedure}

## 파트 1 - 종속 항목 설치 {#part-1-install-dependencies}
시작하기 전에 Blockscout가 의존하는 모든 바이너리를 설치해야 합니다.

### 업데이트 및 업그레이드 시스템 {#update-upgrade-system}
```bash
sudo apt -y update && sudo apt -y upgrade
```

### Erlang 저장소 추가 {#add-erlang-repos}
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

### NodeJS 저장소 추가 {#add-nodejs-repo}
```bash
sudo curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
```

### Rust 설치 {#install-rust}
```bash
sudo curl https://sh.rustup.rs -sSf | sh -s -- -y
```

### 필요한 Erlang 버전 설치 {#install-required-version-of-erlang}
```bash
sudo apt -y install esl-erlang=1:24.*
```

### 필요한 Elixir 버전 설치 {#install-required-version-of-elixir}
Elixir 버전은 `1.13`이어야 합니다. 공식 저장소에서 이 버전을 설치하려고 하면
`erlang`이 `Erlang/OTP 25`로 업데이트되며, 이는 올바른 버전이 아닙니다.     
따라서 GitHub 릴리스 페이지에서 미리 컴파일된 특정 `elixir` 버전을 설치해야 합니다.

```bash
cd ~
mkdir /usr/local/elixir
wget https://github.com/elixir-lang/elixir/releases/download/v1.13.4/Precompiled.zip
sudo unzip -d /usr/local/elixir/ Precompiled.zip
rm Precompiled.zip
```

이제 `exlixir` 시스템 바이너리를 적절히 설정해야 합니다.
```bash
sudo ln -s /usr/local/elixir/bin/elixir /usr/local/bin/elixir
sudo ln -s /usr/local/elixir/bin/mix /usr/local/bin/mix
sudo ln -s /usr/local/elixir/bin/iex /usr/local/bin/iex
sudo ln -s /usr/local/elixir/bin/elixirc /usr/local/bin/elixirc
```

`elixir -v`를 실행하여 `elixir` 및 `erlang`이 제대로 설치되었는지 확인합니다.
다음 결과가 출력됩니다.
```bash
Erlang/OTP 24 [erts-12.3.1] [source] [64-bit] [smp:8:8] [ds:8:8:10] [async-threads:1] [jit]

Elixir 1.13.4 (compiled with Erlang/OTP 22)
```

:::warning
`Erlang/OTP`는 버전 `24`여야 하고, `Elixir`는 버전 `1.13.*`이어야 합니다.    
그렇지 않으면 Blockscout를 컴파일하거나 실행하는 데 문제가 발생할 수 있습니다.

:::   
:::info

공식 ***[Blockscout 요구 사항 페이지](https://docs.blockscout.com/for-developers/information-and-settings/requirements)***를 확인하세요.

:::

### NodeJS 설치 {#install-nodejs}
```bash
sudo apt -y install nodejs
```

### Cargo 설치 {#install-cargo}
```bash
sudo apt -y install cargo
```

### 다른 종속 항목 설치 {#install-other-dependencies}
```bash
sudo apt -y install automake libtool inotify-tools gcc libgmp-dev make g++ git
```

### 필요에 따라 Postgresql 클라이언트를 설치해 DB 연결 확인 {#optionally-install-postgresql-client-to-check-your-db-connection}
```bash
sudo apt install -y postgresql-client
```

## 파트 2 - 환경 변수 설정 {#part-2-set-environment-variables}
Blockscout 컴파일을 시작하기 전에 환경 변수를 설정해야 합니다.
이 가이드에서는 작동을 위한 최소한의 기본값만 설정합니다.
설정할 수 있는 변수의 전체 목록은 [여기](https://docs.blockscout.com/for-developers/information-and-settings/env-variables)에서 확인하세요.

### 데이터베이스 연결을 환경 변수로 설정 {#set-database-connection-as-environment-variable}
```bash
# postgresql connection example:  DATABASE_URL=postgresql://blockscout:Passw0Rd@db.instance.local:5432/blockscout
export DATABASE_URL=postgresql://<db_user>:<db_pass>@<db_host>:<db_port>/<db_name> # db_name does not have to be existing database

# we set these env vars to test the db connection with psql
export PGPASSWORD=Passw0Rd
export PGUSER=blockscout
export PGHOST=db.instance.local
export PGDATABASE=postgres # on AWS RDS postgres database is always created
```

이제 제공된 매개변수로 DB 연결을 테스트합니다.
PG 환경 변수를 제공했으니 다음을 실행하기만 하면 데이터베이스에 연결할 수 있습니다.
```bash
psql
```

데이터베이스가 올바르게 구성되었다면 다음 psql 프롬프트가 표시됩니다.
```bash
psql (12.9 (Ubuntu 12.9-0ubuntu0.20.04.1))
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, bits: 256, compression: off)
Type "help" for help.

blockscout=>
```

그렇지 않으면 다음과 같은 오류가 표시될 수 있습니다.
```bash
psql: error: FATAL:  password authentication failed for user "blockscout"
FATAL:  password authentication failed for user "blockscout"
```
이 경우 [이 문서](https://ubuntu.com/server/docs/databases-postgresql)가 도움이 될 수 있습니다.

:::info DB 연결

다음 파트로 넘어가기 전에 모든 DB 연결 문제를 해결했는지 확인하세요.
Blockscout 사용자에게 슈퍼유저 권한을 부여해야 합니다.

:::
```bash
postgres@ubuntu:~$ createuser --interactive
Enter name of role to add: blockscout
Shall the new role be a superuser? (y/n) y
```

## 파트 3 - Blockscout 복제 및 컴파일 {#part-3-clone-and-compile-blockscout}
이제 마지막으로 Blockscout 설치를 시작합니다.

### Blockscout 저장소 복제 {#clone-blockscout-repo}
```bash
cd ~
git clone https://github.com/Trapesys/blockscout
```

### 프로덕션 빌드를 보호하는 비밀 키 기반 생성 {#generate-secret-key-base-to-protect-production-build}
```bash
cd blockscout
mix deps.get
mix local.rebar --force
mix phx.gen.secret
```
맨 마지막 줄에는 임의의 문자로 이루어진 긴 문자열이 표시됩니다.     
이는 다음 단계로 넘어가기 전에 `SECRET_KEY_BASE` 환경 변수로 설정해야 합니다.     
예시:
```bash
export SECRET_KEY_BASE="912X3UlQ9p9yFEBD0JU+g27v43HLAYl38nQzJGvnQsir2pMlcGYtSeRY0sSdLkV/"
```

### 프로덕션 모드 설정 {#set-production-mode}
```bash
export MIX_ENV=prod
```

### 컴파일 {#compile}
복제 디렉터리에 CD 명령어를 입력하여 컴파일 시작

```bash
cd blockcout
mix local.hex --force
mix do deps.get, local.rebar --force, deps.compile, compile
```

:::info

이전에 배포했다면 이전 빌드 ***mix phx.digest.clean***에서 정적 자산을 삭제합니다.

:::

### 데이터베이스 마이그레이션 {#migrate-databases}
:::info

이 부분은 DB 연결을 제대로 설정 또는 제공하지 않았거나
DATABASE_URL 환경 변수에 잘못된 매개변수를 정의하면 실패합니다.
데이터베이스 사용자에게는 슈퍼유저 권한이 있어야 합니다.

:::
```bash
mix do ecto.create, ecto.migrate
```

데이터베이스를 먼저 삭제해야 한다면, 다음을 실행하세요.
```bash
mix do ecto.drop, ecto.create, ecto.migrate
```

### npm 종속 항목 설치 및 프론트엔드 자산 컴파일 {#install-npm-dependencies-and-compile-frontend-assets}
디렉터리를 프론트엔드 자산이 있는 폴더로 변경해야 합니다.

```bash
cd apps/block_scout_web/assets
sudo npm install
sudo node_modules/webpack/bin/webpack.js --mode production
```

:::info 참고

해당 자산을 컴파일하는 데 몇 분 정도 소요될 수 있으며, 출력 결과는 표시되지 않습니다.
프로세스가 멈춘 것처럼 보일 수 있지만, 조금 기다려주세요.
컴파일 프로세스가 완료되면 다음과 같이 출력됩니다.`webpack 5.69.1 compiled with 3 warnings in 104942 ms`

:::

### 정적 자산 빌드 {#build-static-assets}
이 단계를 진행하려면 Blockscout 복제 폴더의 루트로 돌아가야 합니다.
```bash
cd ~/blockscout
sudo mix phx.digest
```

### 자체 서명 인증서 생성 {#generate-self-signed-certificates}
:::info

`https`를 사용하지 않으면 이 단계는 건너뛰어도 됩니다.

:::
```bash
cd apps/block_scout_web
mix phx.gen.cert blockscout blockscout.local
```

## 파트 4 - Blockscout 서비스 생성 및 실행 {#part-4-create-and-run-blockscout-service}
이 부분에서는 Blockscout이 백그라운드에서 실행되고 시스템 재부팅 후에도 유지되도록 시스템 서비스를 설정해야 합니다.

### 서비스 파일 생성 {#create-service-file}
```bash
sudo touch /etc/systemd/system/explorer.service
```

### 서비스 파일 편집 {#edit-service-file}
원하는 Linux 텍스트 편집기를 사용해 이 파일을 편집하고 서비스를 구성합니다.
```bash
sudo vi /etc/systemd/system/explorer.service
```
explorer.service 파일의 내용은 다음과 같습니다.
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

### 시스템 부팅 시 서비스가 시작되도록 사용 설정 {#enable-starting-service-on-system-boot}
```bash
sudo systemctl daemon-reload
sudo systemctl enable explorer.service
```

### Blockscout 복제 폴더를 시스템 전체 위치로 이동 {#move-your-blockscout-clone-folder-to-system-wide-location}
Blockscout 서비스가 Blockscout 저장소에서 복제하고 모든 자산을 컴파일한 폴더에 액세스할 수 있어야 합니다.
```bash
sudo mv ~/blockscout /usr/local
```

### Blockscout 서비스에서 사용할 환경 변수 파일 생성 {#create-env-vars-file-which-will-be-used-by-blockscout-service}

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

파트 3에서 생성한 `SECRET_KEY_BASE`를 사용합니다.

:::
파일을 저장하고 종료합니다.

### Blockscout 서비스 시작 {#finally-start-blockscout-service}
```bash
sudo systemctl start explorer.service
```

## 파트 5 - Blockscout 인스턴스 기능 테스트 {#part-5-test-out-the-functionality-of-your-blockscout-instance}
이제 Blockscout 서비스가 실행되고 있는지 확인하는 일만 남았습니다.
다음으로 서비스 상태를 확인하세요.
```bash
sudo systemctl status explorer.service
```

서비스 출력 결과를 확인하려면 다음을 실행하세요.
```bash
sudo journalctl -u explorer.service -f
```

새로운 수신 대기 포트가 있는지 다음에서 확인할 수 있습니다.
```bash
# if netstat is not installed
sudo apt install net-tools
sudo netstat -tulpn
```

수신 대기 포트 목록을 가져와야 하며 목록에는 다음 항목이 있어야 합니다.
```
tcp        0      0 0.0.0.0:5432            0.0.0.0:*               LISTEN      28142/postgres
tcp        0      0 0.0.0.0:4000            0.0.0.0:*               LISTEN      42148/beam.smp
```

Blockscout 웹 서비스는 env 파일에 정의된 포트와 프로토콜을 실행합니다. 이 예에서는 `4000`(http)   로 실행됩니다.
문제가 없으면 `http://<host_ip>:4000`을 통해 Blockscout 웹 포털에 액세스할 수 있습니다.

## 고려 사항 {#considerations}
최고의 성능을 위해 Blockscout 쿼리에만 사용할 전용/로컬 `polygon-edge` 전체 아카이브
비 유효성 검사 노드를 사용하는 것이 좋습니다.    
Blockscout는 백엔드에서 모든 쿼리를 실행하므로 이 노드의 `json-rpc` API를 공개적으로 노출할 필요가 없습니다.


## 마무리 글 {#final-thoughts}
Blockscout 단일 인스턴스를 성공적으로 배포했습니다. 그러나 프로덕션의 경우 이 인스턴스를 Nginx 같은 역방향 프록시 뒤에 배치하는 것을 고려해야 합니다.
사용 사례에 따라 데이터베이스와 인스턴스 확장성에 대해서도 생각해 봐야 합니다.

다양한 사용자 지정 옵션이 있으니 공식 [Blockscout 문서](https://docs.blockscout.com/)를 반드시 확인해야 합니다.
---
id: blockscout
title: Blockscout
description: Polygon Edgeで動作するようにBlockscoutインスタンスを設定する方法。
keywords:
  - docs
  - polygon
  - edge
  - blockscout
  - deploy
  - setup
  - instance
---

## 概要 {#overview}
このガイドでは、Polygon Edgeで動作するようにBlockscoutインスタンスをコンパイル、デプロイする方法を詳しく説明します。
Blockscoutには独自の[ドキュメント](https://docs.blockscout.com/for-developers/manual-deployment)がありますが、このガイドではBlockscoutインスタンスを設定する簡単かつ詳細なステップバイステップの手順に焦点を当てています。

## 環境 {#environment}
* オペレーティングシステム： Ubuntu Server 20.04 LTS[ダウンロードリンク](https://releases.ubuntu.com/20.04/)とsudo権限
* サーバーハードウェア： 8CPU / 16GB RAM / 50GB HDD（LVM）
* データベースサーバ：2 CPU / 4GB RAM / 100GB SSD / PostgreSQL 13.4の専用サーバ

### DBサーバ {#db-server}
このガイドに従うための要件はデータベースサーバーを準備し、データベースとdbユーザーを設定することです。
ガイドでは、PostgreSQLサーバーのデプロイと設定の方法は詳しく説明しません。
この方法については現在多数のガイドがあります。たとえば[DigitalOceanガイド](https://www.digitalocean.com/community/tutorials/how-to-install-postgresql-on-ubuntu-20-04-quickstart)です。

:::info 免責事項

ガイドはシングルインスタンスでのBlockscoutの起動、実行を支援することだけを目的にしており、これは理想的な実稼働用の設定ではありません。   
実稼働用の運用では、おそらくアーキテクチャにリバースプロキシ、ロードバランサ―、拡張性オプションなどを導入する方が良いでしょう。
:::

# Blockscoutデプロイメント手順 {#blockscout-deployment-procedure}

## パート1 - インストール依存関係 {#part-1-install-dependencies}
始める前に、blockscoutが依存しているすべてのバイナリがインストールされていることを確認する必要があります。

### アップデートとアップグレードシステム {#update-upgrade-system}
```bash
sudo apt -y update && sudo apt -y upgrade
```

### erlangレポジトリを追加する {#add-erlang-repos}
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

### NodeJSレポジトリを追加する {#add-nodejs-repo}
```bash
sudo curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
```

### Rustをインストールする {#install-rust}
```bash
sudo curl https://sh.rustup.rs -sSf | sh -s -- -y
```

### Erlangの対応バージョンをインストールする {#install-required-version-of-erlang}
```bash
sudo apt -y install esl-erlang=1:24.*
```

### Elixirの対応バージョンをインストールする {#install-required-version-of-elixir}
Elixirのバージョンは`1.13`でなくてはなりません。公式レポジトリからこのバージョンを試し、インストールしようとする場合、
`erlang`は`Erlang/OTP 25`に更新されますが、それは望ましくありません。     
このため、GitHubのリリースページから特別にプリコンパイルされた`elixir`バージョンをインストールする必要があります。

```bash
cd ~
mkdir /usr/local/elixir
wget https://github.com/elixir-lang/elixir/releases/download/v1.13.4/Precompiled.zip
sudo unzip -d /usr/local/elixir/ Precompiled.zip
rm Precompiled.zip
```

ここで`exlixir`システムバイナリを適切に設定する必要があります。
```bash
sudo ln -s /usr/local/elixir/bin/elixir /usr/local/bin/elixir
sudo ln -s /usr/local/elixir/bin/mix /usr/local/bin/mix
sudo ln -s /usr/local/elixir/bin/iex /usr/local/bin/iex
sudo ln -s /usr/local/elixir/bin/elixirc /usr/local/bin/elixirc
```

`elixir`と`erlang`が適切にインストールされているか`elixir -v`を実行して確認してください。
下記が出力されるはずです：
```bash
Erlang/OTP 24 [erts-12.3.1] [source] [64-bit] [smp:8:8] [ds:8:8:10] [async-threads:1] [jit]

Elixir 1.13.4 (compiled with Erlang/OTP 22)
```

:::warning

`Erlang/OTP`はバージョン`24`および`Elixir`はバージョン`1.13.*`である必要があります。    
こうなっていない場合、Blockscoutのコンパイルおよび／または実行に問題が生じることになります。
:::   
:::info

公式の***[Blockscout要件ページ](https://docs.blockscout.com/for-developers/information-and-settings/requirements)***を確認してください

:::

### NodeJSをインストールする {#install-nodejs}
```bash
sudo apt -y install nodejs
```

### Cargoをインストールする {#install-cargo}
```bash
sudo apt -y install cargo
```

### 他の依存関係をインストールする {#install-other-dependencies}
```bash
sudo apt -y install automake libtool inotify-tools gcc libgmp-dev make g++ git
```

### オプションとしてpostgresqlクライアントをインストールしてdb接続を確認する {#optionally-install-postgresql-client-to-check-your-db-connection}
```bash
sudo apt install -y postgresql-client
```

## パート2 - 環境変数を設定する {#part-2-set-environment-variables}
Blockscoutのコンパイルを始める前に環境変数を設定する必要があります。ガイドでは機能するための最小限の基本のみを設定します。設定できる変数の完全なリストは[ここ](https://docs.blockscout.com/for-developers/information-and-settings/env-variables)にあります

### データベース接続を環境変数として設定する {#set-database-connection-as-environment-variable}
```bash
# postgresql connection example:  DATABASE_URL=postgresql://blockscout:Passw0Rd@db.instance.local:5432/blockscout
export DATABASE_URL=postgresql://<db_user>:<db_pass>@<db_host>:<db_port>/<db_name> # db_name does not have to be existing database

# we set these env vars to test the db connection with psql
export PGPASSWORD=Passw0Rd
export PGUSER=blockscout
export PGHOST=db.instance.local
export PGDATABASE=postgres # on AWS RDS postgres database is always created
```

提供されたパラメータでDB接続をテストしましょう。
PG環境変数を提供したため、実行するだけでデータベースに接続できるはずです：
```bash
psql
```

データベースが正しく設定されていれば、psqlプロンプトが表示されます：
```bash
psql (12.9 (Ubuntu 12.9-0ubuntu0.20.04.1))
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, bits: 256, compression: off)
Type "help" for help.

blockscout=>
```

そうでなければ、次のようにエラーが表示される可能性があります：
```bash
psql: error: FATAL:  password authentication failed for user "blockscout"
FATAL:  password authentication failed for user "blockscout"
```
この場合は[これらのドキュメント](https://ubuntu.com/server/docs/databases-postgresql)が助けになるかもしれません。

:::info DB接続

db接続の問題をすべて解決してから次の部分に進むことを確認してください。Blockscoutユーザーにスーパーユーザー権限を付与する際に必要になります。

:::
```bash
postgres@ubuntu:~$ createuser --interactive
Enter name of role to add: blockscout
Shall the new role be a superuser? (y/n) y
```

## パート3 - Blockscoutをクローン、コンパイルする {#part-3-clone-and-compile-blockscout}
ここでついにBlockscoutのインストールを開始できるようになりました。

### Blockscoutレポジトリをクローンする {#clone-blockscout-repo}
```bash
cd ~
git clone https://github.com/Trapesys/blockscout
```

### 運用ビルドを保護するために秘密鍵ベースを生成する {#generate-secret-key-base-to-protect-production-build}
```bash
cd blockscout
mix deps.get
mix local.rebar --force
mix phx.gen.secret
```
最後の行では、ランダムな文字の長い文字列が表示されます。     
これを`SECRET_KEY_BASE`環境変数として設定してから、次のステップへと進みます。     
例：
```bash
export SECRET_KEY_BASE="912X3UlQ9p9yFEBD0JU+g27v43HLAYl38nQzJGvnQsir2pMlcGYtSeRY0sSdLkV/"
```

### 運用モードを設定する {#set-production-mode}
```bash
export MIX_ENV=prod
```

### コンパイル {#compile}
cdコマンドでクローンディレクトリに移動して、コンパイルを開始する

```bash
cd blockcout
mix local.hex --force
mix do deps.get, local.rebar --force, deps.compile, compile
```

:::info

以前にデプロイしている場合、***mix phx.digest.clean***で、以前のビルドから静的アセットを削除します。

:::

### データベースを移行する {#migrate-databases}
:::info

この部分はDB接続を適切に設定していない場合や、DATABASE_URL環境変数でパラメータを提供しなかったまたは誤ったものを定義した場合に失敗します。データベースユーザーはスーパーユーザー権限を有する必要があります。

:::
```bash
mix do ecto.create, ecto.migrate
```

最初にデータベースをドロップする必要がある場合、実行する
```bash
mix do ecto.drop, ecto.create, ecto.migrate
```

### npm依存関係をインストールし、フロントエンドアセットをコンパイルする {#install-npm-dependencies-and-compile-frontend-assets}
フロントエンドアセットを含むフォルダへとディレクトリを変更する必要があります。

```bash
cd apps/block_scout_web/assets
sudo npm install
sudo node_modules/webpack/bin/webpack.js --mode production
```

:::info 辛抱強く

これらのアセットのコンパイルには数分間かかり、なおかつ出力は表示されません。
プロセスがスタックしたかのように見えることがありますが、辛抱してください。コンパイルプロセスが完了すると、次のような出力があります：`webpack 5.69.1 compiled with 3 warnings in 104942 ms`

:::

### 静的アセットをビルドする {#build-static-assets}
このステップではBlockscoutクローンフォルダのルートに戻る必要があります。
```bash
cd ~/blockscout
sudo mix phx.digest
```

### 自己署名証明書を生成する {#generate-self-signed-certificates}
:::info

`https`を使用しない場合はこのステップを省略することができます。

:::
```bash
cd apps/block_scout_web
mix phx.gen.cert blockscout blockscout.local
```

## パート4 - Blockscoutサービスの作成と実行 {#part-4-create-and-run-blockscout-service}
このパートでは、Blockscoutがバックグラウンドで実行し、システム再起動後に継続するようにシステムサービスを設定する必要があります。

### サービスファイルを作成する {#create-service-file}
```bash
sudo touch /etc/systemd/system/explorer.service
```

### サービスファイルを編集する {#edit-service-file}
お気に入りのLinuxテキストエディタを使用してこのファイルを編集し、サービスを設定します。
```bash
sudo vi /etc/systemd/system/explorer.service
```
explorer.serviceファイルの内容は次のようになるべきです：
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

### システムブートでサービス開始を有効化する {#enable-starting-service-on-system-boot}
```bash
sudo systemctl daemon-reload
sudo systemctl enable explorer.service
```

### Blockscoutクローンフォルダをシステム全体の場所に移動する {#move-your-blockscout-clone-folder-to-system-wide-location}
BlockscoutサービスはBlockscoutレポジトリからクローンしたフォルダとコンパイルしたすべてのアセットにアクセスする必要があります。
```bash
sudo mv ~/blockscout /usr/local
```

### Blockscoutサービスで使用される環境変数ファイルを作成する {#create-env-vars-file-which-will-be-used-by-blockscout-service}

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

パート3で生成した`SECRET_KEY_BASE`を使用します。

:::
ファイルを保存し、終了します。

### 最後に、Blockscoutサービスをスタートする {#finally-start-blockscout-service}
```bash
sudo systemctl start explorer.service
```

## パート5 - Blockscoutインスタンスの機能をテストする {#part-5-test-out-the-functionality-of-your-blockscout-instance}
ここで、残っているのはBlockscoutサービスが実行されているか確認することです。
以下でサービスステータスを確認します：
```bash
sudo systemctl status explorer.service
```

サービス出力を確認するには：
```bash
sudo journalctl -u explorer.service -f
```

新しいリスニングポートがあるか確認することができます：
```bash
# if netstat is not installed
sudo apt install net-tools
sudo netstat -tulpn
```

リスニングポートのリストを取得すべきであり、そのリストには次のようなものになるはずです：
```
tcp        0      0 0.0.0.0:5432            0.0.0.0:*               LISTEN      28142/postgres
tcp        0      0 0.0.0.0:4000            0.0.0.0:*               LISTEN      42148/beam.smp
```

Blockscout webサービスは環境ファイルで定義されたポートとプロトコルを実行します。この例では `4000`（http）で実行されます。   
すべてがうまくいけば、`http://<host_ip>:4000`でBlockscout webポータルにアクセスできるはずです。

## 考慮事項 {#considerations}
最高のパフォーマンスのためには、専門／ローカルの`polygon-edge`フルアーカイブのノンバリデータのノードを持ち、それをBlockscoutクエリ専用に使用することをお勧めします。    
このノードの`json-rpc`APIは公表する必要はありません。Blockscoutがすべてのクエリをバックエンドから実行するためです。


## 最後に {#final-thoughts}
これまでシングルBlockscoutインスタンスをデプロイし、これはうまく動作しますが、運用のためにはこのインスタンスをNginxなどのリバースプロキシの背後に置くことを検討すべきです。また、ユースケースに応じてデータベースやインスタンスの拡張性について考慮する必要があります。

多くのカスタマイズオプションがあるため、公式[Blockscoutドキュメント](https://docs.blockscout.com/)は必ずチェックすべきでしょう。
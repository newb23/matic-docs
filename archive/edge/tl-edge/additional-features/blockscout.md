---
id: blockscout
title: Blockscout
description: Paano mag-set up ng instance ng Blockscout na gagana sa Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - blockscout
  - deploy
  - setup
  - instance
---

## Pangkalahatang-ideya {#overview}
Idinedetalye sa gabay na ito kung paano mag-compile at mag-deploy ng instance ng Blockscout na gagana sa Polygon-Edge.
Ang Blockscout ay may sariling [dokumentasyon](https://docs.blockscout.com/for-developers/manual-deployment) ngunit gabay na ito ay nakatuon sa simple ngunit detalyadong step-by-step na tagubilin kung paano mag-set up ng instance ng Blockscout.

## Kapaligiran {#environment}
* Operating System: Ubuntu Server 20.04 LTS [link sa pag-download](https://releases.ubuntu.com/20.04/) na may mga sudo permission
* Server Hardware:  8CPU / 16GB RAM / 50GB HDD (LVM)
* Database Server:  Nakatalagang server na may 2 CPU / 4GB RAM / 100GB SSD / PostgreSQL 13.4

### DB Server {#db-server}
Ang kinakailangan para sa pagsunod sa gabay na ito ay magkaroon ng database server na handa na, at ng naka-configure na database at db user.
Hindi idedetalye sa gabay na ito kung paano i-deploy at i-configure ang PostgreSQL server.
Maraming gabay sa kung paano gawin ito, halimbawa ang [DigitalOcean Guide](https://www.digitalocean.com/community/tutorials/how-to-install-postgresql-on-ubuntu-20-04-quickstart)

:::info DISCLAIMER

Ang layunin lang ng gabay na ito ay tulungan kang patakbuhin ang Blockscout sa iisang instance na hindi magandang setup sa produksyon.   
Para sa produksyon, maaari kang magpasok sa arkitektura ng reverse proxy, load balancer, mga pagpipilian sa kakayahang mai-scale at iba pa.

:::

# Pamamaraan sa Deployment ng Blockscout {#blockscout-deployment-procedure}

## Bahagi 1 - i-install ang mga dependency {#part-1-install-dependencies}
Bago tayo magsimula, kailangan nating tiyakin na na-install natin ang lahat ng binary na ginagamit ng blockscout.

### I-update at i-upgrade ang system {#update-upgrade-system}
```bash
sudo apt -y update && sudo apt -y upgrade
```

### Idagdag ang mga erlang repo {#add-erlang-repos}
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

### Idagdag ang NodeJS repo  {#add-nodejs-repo}
```bash
sudo curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
```

### I-install ang Rust {#install-rust}
```bash
sudo curl https://sh.rustup.rs -sSf | sh -s -- -y
```

### i-install ang kinakailangang bersyon ng Erlang {#install-required-version-of-erlang}
```bash
sudo apt -y install esl-erlang=1:24.*
```

### I-install ang kinakailangang bersyon ng Elixir {#install-required-version-of-elixir}
Dapat ay `1.13` ang bersyon ng Elixir. Kung susubukan nating i-install ang bersyong ito mula sa opisyal na repo,
ang `erlang` ay mag-a-update sa `Erlang/OTP 25` at hindi natin gusto iyon.      
Dahil dito, kailangan nating i-install ang partikular na precompiled na bersyon `elixir` mula sa page ng mga release ng GitHub.

```bash
cd ~
mkdir /usr/local/elixir
wget https://github.com/elixir-lang/elixir/releases/download/v1.13.4/Precompiled.zip
sudo unzip -d /usr/local/elixir/ Precompiled.zip
rm Precompiled.zip
```

Ngayon, kailangan nating maayos na mag-set up ng `exlixir` mga binary na sistema.
```bash
sudo ln -s /usr/local/elixir/bin/elixir /usr/local/bin/elixir
sudo ln -s /usr/local/elixir/bin/mix /usr/local/bin/mix
sudo ln -s /usr/local/elixir/bin/iex /usr/local/bin/iex
sudo ln -s /usr/local/elixir/bin/elixirc /usr/local/bin/elixirc
```

Tingnan kung maayos na naka-install ang `elixir` at `erlang` sa pamamagitan ng pagpapatakbo sa `elixir -v`.
Ito dapat ang maging output:
```bash
Erlang/OTP 24 [erts-12.3.1] [source] [64-bit] [smp:8:8] [ds:8:8:10] [async-threads:1] [jit]

Elixir 1.13.4 (compiled with Erlang/OTP 22)
```

:::warning

Ang `Erlang/OTP` ay dapat maging bersyon `24` at ang `Elixir` ay dapat maging bersyon `1.13.*`.    
Kung hindi ganoon ang kaso, makakaranas ka ng mga isyu sa pag-compile ng Blockscout at/o sa pagpapatakbo nito.

:::   
:::info

Tingnan ang opisyal na ***[page ng mga kinakailangan ng Blockscout](https://docs.blockscout.com/for-developers/information-and-settings/requirements)***

:::

### I-install ang NodeJS {#install-nodejs}
```bash
sudo apt -y install nodejs
```

### I-install ang Cargo {#install-cargo}
```bash
sudo apt -y install cargo
```

### I-install ang iba pang dependency {#install-other-dependencies}
```bash
sudo apt -y install automake libtool inotify-tools gcc libgmp-dev make g++ git
```

### Kung gusto mo, i-install ang postgresql client para matingnan ang iyong koneksyon sa db {#optionally-install-postgresql-client-to-check-your-db-connection}
```bash
sudo apt install -y postgresql-client
```

## Bahagi 2 - itakda ang mga environment variable {#part-2-set-environment-variables}
Kailangan nating itakda ang mga environment variable bago tayo magsimula sa pag-compile ng Blockscout.
Sa gabay na ito, itatakda lang natin ang minimum na kinakailangan para mapagana ito.
Makikita mo [rito](https://docs.blockscout.com/for-developers/information-and-settings/env-variables) ang kumpletong listahan ng mga variable na maaari mong itakda

### Itakda ang koneksyon sa database bilang environment variable {#set-database-connection-as-environment-variable}
```bash
# postgresql connection example:  DATABASE_URL=postgresql://blockscout:Passw0Rd@db.instance.local:5432/blockscout
export DATABASE_URL=postgresql://<db_user>:<db_pass>@<db_host>:<db_port>/<db_name> # db_name does not have to be existing database

# we set these env vars to test the db connection with psql
export PGPASSWORD=Passw0Rd
export PGUSER=blockscout
export PGHOST=db.instance.local
export PGDATABASE=postgres # on AWS RDS postgres database is always created
```

Ngayon, subukan ang iyong koneksyon sa DB gamit ang mga ibinigay na parameter.
Dahil nagbigay ka ng mga PG env var, dapat ay nakakakonekta ka sa database sa pamamagitan lang ng pagpapatakbo sa:
```bash
psql
```

Kung naka-configure nang tama ang database, dapat kang makakita ng prompt ng psql:
```bash
psql (12.9 (Ubuntu 12.9-0ubuntu0.20.04.1))
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, bits: 256, compression: off)
Type "help" for help.

blockscout=>
```

Kung hindi, maaari kang makakakita ng error tulad nito:
```bash
psql: error: FATAL:  password authentication failed for user "blockscout"
FATAL:  password authentication failed for user "blockscout"
```
Sa ganitong sitwasyon, maaaring makatulong sa iyo ang [mga dokumentong ito](https://ubuntu.com/server/docs/databases-postgresql).

:::info Koneksyon sa DB

Siguraduhing nalutas mo na ang lahat ng isyu sa koneksyon sa db bago magpatuloy sa susunod na bahagi.
Kakailanganin mong magbigay ng mga pribilehiyo ng superuser sa user ng blockscout.

:::
```bash
postgres@ubuntu:~$ createuser --interactive
Enter name of role to add: blockscout
Shall the new role be a superuser? (y/n) y
```

## Bahagi 3 - i-clone at i-compile ang Blockscout {#part-3-clone-and-compile-blockscout}
Ngayon, masisimulan na natin sa wakas ang pag-install ng Blockscout.

### I-clone ang Blockscout repo {#clone-blockscout-repo}
```bash
cd ~
git clone https://github.com/Trapesys/blockscout
```

### Bumuo ng sikretong key base para maprotektahan ang build ng produksyon {#generate-secret-key-base-to-protect-production-build}
```bash
cd blockscout
mix deps.get
mix local.rebar --force
mix phx.gen.secret
```
Sa pinakahuling linya, dapat kang makakita ng mahabang string ng mga random na character.     
Dapat itong itakda bilang iyong `SECRET_KEY_BASE` environment variable, bago ang susunod na hakbang.     
Halimbawa:
```bash
export SECRET_KEY_BASE="912X3UlQ9p9yFEBD0JU+g27v43HLAYl38nQzJGvnQsir2pMlcGYtSeRY0sSdLkV/"
```

### Itakda ang mode ng produksyon {#set-production-mode}
```bash
export MIX_ENV=prod
```

### I-compile {#compile}
ang Cd sa clone directory at simulang mag-compile

```bash
cd blockcout
mix local.hex --force
mix do deps.get, local.rebar --force, deps.compile, compile
```

:::info

Kung nag-deploy ka dati, alisin ang mga static na asset sa dating build na ***mix phx.digest.clean***.

:::

### I-migrate ang mga database {#migrate-databases}
:::info

Mabibigo ang bahaging ito kung hindi mo na-set up nang maayos ang iyong koneksyon sa DB, hindi ka nagbigay,
o mali ang mga tinukoy mong parameter sa DATABASE_URL environment variable.
Kailangang magkaroon ng mga pribilehiyo ng superuser ang user ng database.

:::
```bash
mix do ecto.create, ecto.migrate
```

Kung kailangan mong i-drop muna ang database, patakbuhin
```bash
mix do ecto.drop, ecto.create, ecto.migrate
```

### I-install ang mga npm dependency at i-compile ang mga frontend asset {#install-npm-dependencies-and-compile-frontend-assets}
Kailangan mong baguhin ang directory sa folder na naglalaman ng mga frontend asset.

```bash
cd apps/block_scout_web/assets
sudo npm install
sudo node_modules/webpack/bin/webpack.js --mode production
```

:::info Maghintay

Maaaring abutin nang ilang minuto ang pag-compile ng mga asset na ito, at wala itong ipapakitang output.
Maaaring magmukhang hindi umuusad ang proseso, pero maghintay lang.
Kapag tapos na ang proseso ng pag-compile, dapat itong magkaroon ng output na tulad nito: `webpack 5.69.1 compiled with 3 warnings in 104942 ms`

:::

### Gumawa ng mga static na asset {#build-static-assets}
Para sa hakbang na ito, kailangan mong bumalik sa root ng clone folder ng iyong Blockscout.
```bash
cd ~/blockscout
sudo mix phx.digest
```

### Bumuo ng mga self-signed na certificate {#generate-self-signed-certificates}
:::info

Maaari mong laktawan ang hakbang na ito kung hindi mo gagamitin ang `https`.

:::
```bash
cd apps/block_scout_web
mix phx.gen.cert blockscout blockscout.local
```

## Bahagi 4 - gumawa at magpatakbo ng serbisyo ng Blockscout {#part-4-create-and-run-blockscout-service}
Sa bahaging ito, kailangan nating mag-set up ng serbisyo sa sistema dahil gusto nating tumakbo ang Blockscout sa background at magpatuloy ito pagkatapos na mag-reboot ng sistema.

### Gumawa ng file ng serbisyo {#create-service-file}
```bash
sudo touch /etc/systemd/system/explorer.service
```

### I-edit ang file ng serbisyo {#edit-service-file}
Gamitin ang paboritong linux text editor mo para i-edit ang file na ito at i-configure ang serbisyo.
```bash
sudo vi /etc/systemd/system/explorer.service
```
Ganito dapat ang maging hitsura ng mga nilalaman ng explorer.service: file:
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

### I-enable ang pagsisimula ng serbisyo sa boot ng sistema {#enable-starting-service-on-system-boot}
```bash
sudo systemctl daemon-reload
sudo systemctl enable explorer.service
```

### Ilipat ang clone folder ng iyong Blockscout sa system-wide na lokasyon {#move-your-blockscout-clone-folder-to-system-wide-location}
Kinakailangan ng serbisyo ng Blockscout na magkaroon ng access sa folder na na-clone mo mula sa Blockscout repo at kailangan nitong ma-compile ang lahat ng asset.
```bash
sudo mv ~/blockscout /usr/local
```

### Gumawa ng mga file ng env var na gagamitin ng serbisyo ng Blockscout {#create-env-vars-file-which-will-be-used-by-blockscout-service}

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

Gamitin ang `SECRET_KEY_BASE` na binuo mo sa Bahagi 3.

:::
I-save ang file at lumabas..

### Panghuli, simulan ang serbisyo ng Blockscout {#finally-start-blockscout-service}
```bash
sudo systemctl start explorer.service
```

## Part 5 - subukan ang functionality ng instance ng Blockscout mo {#part-5-test-out-the-functionality-of-your-blockscout-instance}
Ngayon, ang kailangan na lang gawin ay tingnan kung tumatakbo ang serbisyo ng Blockscout.
Tingnan ang status ng serbisyo sa:
```bash
sudo systemctl status explorer.service
```

Para tingnan ang output ng serbisyo:
```bash
sudo journalctl -u explorer.service -f
```

Maaari mong tingnan kung mayroong ilang bagong port sa pakikinig:
```bash
# if netstat is not installed
sudo apt install net-tools
sudo netstat -tulpn
```

Dapat kang makakuha ng listahan ng mga port sa pakikinig at sa listahan, mayroon dapat na ganito:
```
tcp        0      0 0.0.0.0:5432            0.0.0.0:*               LISTEN      28142/postgres
tcp        0      0 0.0.0.0:4000            0.0.0.0:*               LISTEN      42148/beam.smp
```

Pinapatakbo ng serbisyo sa web ng Blockscout ang port at protocol na tinukoy sa file ng env. Sa halimbawang ito, tumatakbo ito sa `4000`(http).   
Kung ok ang lahat, dapat mong ma-access ang web portal ng Blockscout gamit ang `http://<host_ip>:4000`.

## Mga Pagsasaalang-alang {#considerations}
Para sa pinakamahusay na performance, ipinapayo na magkaroon ng nakatalaga/lokal na non-validator node ng buong archive ng `polygon-edge`
na eksklusibong gagamitin para sa mga query sa Blockscout.    
Ang `json-rpc` API ng node na ito ay hindi kailangang ipakita sa publiko dahil pinapatakbo ng Blockscout ang lahat ng query mula sa backend.


## Kongklusyon {#final-thoughts}
Katatapos lang nating mag-deploy ng isang instance ng Blockscout, na gumagana nang maayos, ngunit para sa produksyon, dapat mong pag-isipang ilagay ang instance na ito sa likod ng reverse proxy tulad ng Nginx.
Dapat mo ring pag-isipan ang kakayahang mai-scale ng database at instance, depende sa iyong kaso ng paggamit.

Dapat mong tingnan ang opisyal na [dokumentasyon ng Blockscout](https://docs.blockscout.com/) dahil maraming opsyon doon para sa pag-customize.
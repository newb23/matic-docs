---
id: blockscout
title: Blockscout
description: Come impostare un'istanza Blockscout per lavorare con Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - blockscout
  - deploy
  - setup
  - instance
---

## Panoramica {#overview}
Questa guida spiega in dettaglio come compilare e implementare un'istanza Blockscout per lavorare con Polygon-Edge. Blockscout ha la propria [documentazione](https://docs.blockscout.com/for-developers/manual-deployment), ma questa guida è composta da istruzioni passo-passo semplici ma dettagliate su come configurare l'istanza di Blockscout.

## Ambiente {#environment}
* Sistema operativo: Ubuntu Server 20.04 LTS [link di download](https://releases.ubuntu.com/20.04/) con autorizzazioni sudo
* Server Hardware:  8CPU / 16GB RAM / 50GB HDD (LVM)
* Database server:  server dedicato con 2 CPU / 4GB RAM / 100GB SSD / PostgreSQL 13.4

### DB server {#db-server}
Il requisito per seguire questa guida è quello di avere pronto un database server, e un database e db utente configurati. Questa guida non spiegherà in dettaglio come implementare e configurare il server PostgreSQL. Ci sono molte guide che spiegano come farlo, ad esempio la [DigitalOcean Guide](https://www.digitalocean.com/community/tutorials/how-to-install-postgresql-on-ubuntu-20-04-quickstart)

:::info DICHIARAZIONE DI NON RESPONSABILITÀ
Questa guida ha il solo scopo di aiutarti a far funzionare Blockscout su una singola istanza, che comunque non è la configurazione ideale per la produzione.    Per la produzione, sarà probabilmente necessario introdurre nell'architettura un reverse proxy, un load balancer e opzioni di scalabilità
:::

# Procedura di implementazione di Blockscout {#blockscout-deployment-procedure}

## Parte 1 - Installare le dipendenze {#part-1-install-dependencies}
Prima di iniziare, dobbiamo assicurarci di avere installato tutti i binari da cui dipende Blockscout.

### Aggiornare e potenziare il sistema {#update-upgrade-system}
```bash
sudo apt -y update && sudo apt -y upgrade
```

### Aggiungere il repos Erlang {#add-erlang-repos}
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

### Aggiungere il repos NodeJS {#add-nodejs-repo}
```bash
sudo curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
```

### Installare Rust {#install-rust}
```bash
sudo curl https://sh.rustup.rs -sSf | sh -s -- -y
```

### Installare la versione richiesta di Erlang {#install-required-version-of-erlang}
```bash
sudo apt -y install esl-erlang=1:24.*
```

### Installare la versione richiesta di Elixir {#install-required-version-of-elixir}
La versione di Elixir deve essere `1.13`. Se proviamo ad installare questa versione dal repos ufficiale, `erlang`si aggiornerà a `Erlang/OTP 25`e noi non vogliamo che questo succeda.      Per questo motivo dobbiamo installare la versione specifica precompilata `elixir` che possiamo trovare sulla pagina delle versioni rilasciate di GitHub.

```bash
cd ~
mkdir /usr/local/elixir
wget https://github.com/elixir-lang/elixir/releases/download/v1.13.4/Precompiled.zip
sudo unzip -d /usr/local/elixir/ Precompiled.zip
rm Precompiled.zip
```

Ora dobbiamo configurare correttamente `exlixir` i binari di sistema.
```bash
sudo ln -s /usr/local/elixir/bin/elixir /usr/local/bin/elixir
sudo ln -s /usr/local/elixir/bin/mix /usr/local/bin/mix
sudo ln -s /usr/local/elixir/bin/iex /usr/local/bin/iex
sudo ln -s /usr/local/elixir/bin/elixirc /usr/local/bin/elixirc
```

Controllare che `elixir` e `erlang`siano installati correttamente eseguendo `elixir -v`. L'output dovrebbe essere questo:
```bash
Erlang/OTP 24 [erts-12.3.1] [source] [64-bit] [smp:8:8] [ds:8:8:10] [async-threads:1] [jit]

Elixir 1.13.4 (compiled with Erlang/OTP 22)
```

:::warning
La versione di `Erlang/OTP`deve essere `24`, e quella di `Elixir` deve essere `1.13.*`.     In caso contrario, avrai problemi con la compilazione di Blockscout e/o con la sua esecuzione.
:::   
:::info
Controllare la ***[pagina ufficiale dei requisiti di Blockscout](https://docs.blockscout.com/for-developers/information-and-settings/requirements)***
:::

### Installare NodeJS {#install-nodejs}
```bash
sudo apt -y install nodejs
```

### Installare Cargo {#install-cargo}
```bash
sudo apt -y install cargo
```

### Installare le altre dipendenze {#install-other-dependencies}
```bash
sudo apt -y install automake libtool inotify-tools gcc libgmp-dev make g++ git
```

### Installare facoltativamente il client postgresql per controllare la tua connessione al db {#optionally-install-postgresql-client-to-check-your-db-connection}
```bash
sudo apt install -y postgresql-client
```

## Parte 2 - Impostare le variabili ambientali {#part-2-set-environment-variables}
Dobbiamo impostare le variabili ambientali prima di partire con la compilazione di Blockscout. In questa guida imposteremo solo il necessario per farlo funzionare. L'elenco completo delle variabili che possono essere impostate è consultabile [qui](https://docs.blockscout.com/for-developers/information-and-settings/env-variables)  

### Impostare la connessione al database come variabile ambientale {#set-database-connection-as-environment-variable}
```bash
# postgresql connection example:  DATABASE_URL=postgresql://blockscout:Passw0Rd@db.instance.local:5432/blockscout
export DATABASE_URL=postgresql://<db_user>:<db_pass>@<db_host>:<db_port>/<db_name> # db_name does not have to be existing database

# we set these env vars to test the db connection with psql
export PGPASSWORD=Passw0Rd
export PGUSER=blockscout
export PGHOST=db.instance.local
export PGDATABASE=postgres # on AWS RDS postgres database is always created
```

Ora testa la tua connessione al DB con il parametri forniti. Poiché hai fornito le variabili ambientali PG, dovresti essere in grado di connetterti al database solo eseguendo:
```bash
psql
```

Se il database è configurato correttamente, dovresti vedere un prompt psql:
```bash
psql (12.9 (Ubuntu 12.9-0ubuntu0.20.04.1))
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, bits: 256, compression: off)
Type "help" for help.

blockscout=>
```

In caso contrario, potresti vedere un errore come questo:
```bash
psql: error: FATAL:  password authentication failed for user "blockscout"
FATAL:  password authentication failed for user "blockscout"
```
In questo caso, [questi documenti](https://ubuntu.com/server/docs/databases-postgresql) potrebbero esserti di aiuto.

:::info Connessione al DB
Assicurati di aver risolto tutti i problemi di connessione al db prima di procedere alla parte successiva.
È necessario fornire i privilegi di superutente all'utente blockscout.

:::
```bash
postgres@ubuntu:~$ createuser --interactive
Enter name of role to add: blockscout
Shall the new role be a superuser? (y/n) y
```

## Parte - Clonare e compilare Blockscout {#part-3-clone-and-compile-blockscout}
Ora possiamo finalmente avviare l'installazione di Blockscout.

### Clonare il repo di Blockscout {#clone-blockscout-repo}
```bash
cd ~
git clone https://github.com/Trapesys/blockscout
```

### Generare la chiave segreta principale per proteggere la produzione {#generate-secret-key-base-to-protect-production-build}
```bash
cd blockscout
mix deps.get
mix local.rebar --force
mix phx.gen.secret
```
All'ultima riga, dovresti vedere una lunga stringa di caratteri casuali.      Questa dovrebbe essere impostata come la tua `SECRET_KEY_BASE` variabile ambientale  prima del passo successivo.      Ad esempio:
```bash
export SECRET_KEY_BASE="912X3UlQ9p9yFEBD0JU+g27v43HLAYl38nQzJGvnQsir2pMlcGYtSeRY0sSdLkV/"
```

### Impostare la modalità di produzione {#set-production-mode}
```bash
export MIX_ENV=prod
```

### Compilare {#compile}
Cd nella directory del clone e inizia a compilare

```bash
cd blockcout
mix local.hex --force
mix do deps.get, local.rebar --force, deps.compile, compile
```

:::info
Se hai implementato in precedenza, rimuovi gli asset statici dal precedente build ***mix phx.digest.clean***
:::

### Migrare i database {#migrate-databases}
:::info
Questa parte non funzionerà se non hai configurato correttamente la tua connessione al DB, se non hai fornito o hai definito i parametri errati alla variabile ambientale DATABASE_URL. L'utente del database deve avere i privilegi di superutente.
:::
```bash
mix do ecto.create, ecto.migrate
```

Se è necessario abbandonare prima il database, eseguire
```bash
mix do ecto.drop, ecto.create, ecto.migrate
```

### Installare le dipendenze npm e compilare i frontend asset {#install-npm-dependencies-and-compile-frontend-assets}
Devi cambiare la directory nella cartella che contiene i frontend asset.

```bash
cd apps/block_scout_web/assets
sudo npm install
sudo node_modules/webpack/bin/webpack.js --mode production
```

:::info Sii paziente
La compilazione di questi asset può richiedere qualche minuto e non mostrerà alcun output. Può sembrare che il processo sia bloccato, ma devi solo essere paziente. Quando il processo di compilazione è completato, dovresti vedere qualcosa come: `webpack 5.69.1 compiled with 3 warnings in 104942 ms`
:::

### Costruire gli asset statici {#build-static-assets}
Per questo passo devi tornare al root della tua cartella del clone Blockscout.
```bash
cd ~/blockscout
sudo mix phx.digest
```

### Generare i certificati autofirmati {#generate-self-signed-certificates}
:::info
Puoi saltare questo passo se non utilizzerai `https`.
:::
```bash
cd apps/block_scout_web
mix phx.gen.cert blockscout blockscout.local
```

## Parte 4 - Creare ed eseguire servizi Blockscout {#part-4-create-and-run-blockscout-service}
In questa parte dobbiamo configurare un sistema di servizi poiché vogliamo che Blockscout continui ad essere in esecuzione in background dopo il riavvio del sistema.

### Creare i file servizio {#create-service-file}
```bash
sudo touch /etc/systemd/system/explorer.service
```

### Modificare i file di servizio {#edit-service-file}
Usa il tuo editor di testo linux preferito per modificare file e configurare il servizio.
```bash
sudo vi /etc/systemd/system/explorer.service
```
Il contenuto del file explorer.service dovrebbe essere simile a questo:
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

### Abilita l'avvio del servizio all'avvio del sistema {#enable-starting-service-on-system-boot}
```bash
sudo systemctl daemon-reload
sudo systemctl enable explorer.service
```

### Sposta la tua cartella clone di Blockscout in una posizione system-wide {#move-your-blockscout-clone-folder-to-system-wide-location}
Il servizio Blockscout deve avere accesso alla cartella che hai clonato dal repo di Blockscout e che ha compilato tutte le risorse.
```bash
sudo mv ~/blockscout /usr/local
```

### Creare il file delle variabili ambientali che sarà utilizzato dal servizio Blockscout. {#create-env-vars-file-which-will-be-used-by-blockscout-service}

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
Usa `SECRET_KEY_BASE` che hai generato nella parte 3.
:::Salva il file ed esci.

### Infine, avvia il servizio Blockscout {#finally-start-blockscout-service}
```bash
sudo systemctl start explorer.service
```

## Parte 5 - Testa la funzionalità della tua istanza Blockscout {#part-5-test-out-the-functionality-of-your-blockscout-instance}
Ora tutto ciò che devi fare è controllare se il servizio Blockscout è in esecuzione. Controllare lo stato del servizio con:
```bash
sudo systemctl status explorer.service
```

Per controllare l'output del servizio
```bash
sudo journalctl -u explorer.service -f
```

Puoi controllare se ci sono nuove porte in ascolto:
```bash
# if netstat is not installed
sudo apt install net-tools
sudo netstat -tulpn
```

Dovresti ottenere una lista di porte in ascolto e nella lista dovresti trovare qualcosa come:
```
tcp        0      0 0.0.0.0:5432            0.0.0.0:*               LISTEN      28142/postgres
tcp        0      0 0.0.0.0:4000            0.0.0.0:*               LISTEN      42148/beam.smp
```

Il servizio web Blockscout esegue la porta e il protocollo definito nei file ambientali. In questo esempio viene eseguito su `4000` (http).    Se è tutto ok, dovresti essere in grado di accedere al portale web Blockscout con `http://<host_ip>:4000`.

## Considerazioni {#considerations}
Per ottenere prestazioni ottimali, è consigliabile avere un nodo non validatore dell'archivio `polygon-edge`completo dedicato/locale che sarà utilizzato esclusivamente per le richieste Blockscout.     `json-rpc`L'API di questo nodo non deve essere esposto pubblicamente,  poiché Blockscout esegue tutte le richieste dal backend.


## Considerazioni finali {#final-thoughts}
Abbiamo appena implementato una singola istanza Blockscout, che funziona bene, ma per la produzione dovresti considerare di mettere questa istanza dietro un reverse proxy come Nginx. Dovresti anche fare attenzione al database e alla scalabilità dell'istanza, a seconda del tuo utilizzo.

Dovresti sicuramente controllare la [documentazione ufficiale Blockscout](https://docs.blockscout.com/) poiché ci sono molte opzioni di personalizzazione.
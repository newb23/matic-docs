---
id: blockscout
title: Blockscout
description: Wie man eine Blockscout Instance einrichtet, um mit Polygon Edge zu arbeiten.
keywords:
  - docs
  - polygon
  - edge
  - blockscout
  - deploy
  - setup
  - instance
---

## Übersicht {#overview}
Dieser Leitfaden geht in Details darüber, wie man Blockscout zusammenstellen und implementieren kann, um mit Polygon-Edge zusammenzuarbeiten. Blockscout hat seine eigene [Dokumentation](https://docs.blockscout.com/for-developers/manual-deployment), aber dieser Leitfaden konzentriert sich auf einfache aber detaillierte Schritt-für-Schritt-Anleitungen darüber, wie man step-by-step einrichtet.

## Umgebung {#environment}
* Betriebssystem: Ubuntu Server 20.04 LTS [Download-Link](https://releases.ubuntu.com/20.04/) mit Sudo-Genehmigungen
* Server-Hardware:  8CPU / 16 GB RAM / 50 GB HDD (LVM)
* Datenbankserver:  Dedizierter Server mit 2 CPU / 4 GB RAM / 100 GB SSD / PostgreSQL 13.4

### DB-Server {#db-server}
Die Voraussetzung für die Befolgung dieses Leitfadens ist, dass ein Datenbankserver bereit ist, Datenbank und db-Benutzer konfiguriert sind. Dieser Leitfaden wird nicht in Details darüber gehen, wie man den PostgreSQL-Server einsetzen und konfigurieren kann. Es gibt zu diesem Thema viele Leitfäden, wie beispielsweise [DigitalOcean Guide](https://www.digitalocean.com/community/tutorials/how-to-install-postgresql-on-ubuntu-20-04-quickstart)

:::info HAFTUNGSAUSSCHLUSS
Dieser Leitfaden soll nur helfen, Blockscout auf einer einzigen Instance zu starten und zu laufen, was kein ideales Produktions-   Setup ist. Für die Produktion möchten Sie wahrscheinlich Reverse-Proxy, Load-Balancer, scalability usw. in die Architektur einführen.
:::

# Blockscout Bereitstellungsverfahren {#blockscout-deployment-procedure}

## Teil 1 - Abhängigkeiten installieren {#part-1-install-dependencies}
Bevor wir beginnen, müssen wir sicherstellen, dass alle Binaries installiert sind, von denen der Blockscout abhängig ist.

### System aktualisieren {#update-upgrade-system}
```bash
sudo apt -y update && sudo apt -y upgrade
```

### Erlang repos hinzufügen {#add-erlang-repos}
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

### NodeJS repo hinzufügen {#add-nodejs-repo}
```bash
sudo curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
```

### Rust installieren {#install-rust}
```bash
sudo curl https://sh.rustup.rs -sSf | sh -s -- -y
```

### Erforderliche Version von Erlang installieren {#install-required-version-of-erlang}
```bash
sudo apt -y install esl-erlang=1:24.*
```

### Erforderliche Version von Elixir installieren {#install-required-version-of-elixir}
Die Version von Elixir muss `1.13`sein. Wenn wir versuchen, diese Version aus dem offiziellen Repo zu installieren, `erlang`wird auf aktualisiert werden `Erlang/OTP 25`und das wollen wir      nicht. Aus diesem Grund müssen wir die spezifische vorkompilierte  `elixir`Version von GitHub Releases installieren.

```bash
cd ~
mkdir /usr/local/elixir
wget https://github.com/elixir-lang/elixir/releases/download/v1.13.4/Precompiled.zip
sudo unzip -d /usr/local/elixir/ Precompiled.zip
rm Precompiled.zip
```

`exlixir`Jetzt müssen wir System Binaries ordnungsgemäß einrichten.
```bash
sudo ln -s /usr/local/elixir/bin/elixir /usr/local/bin/elixir
sudo ln -s /usr/local/elixir/bin/mix /usr/local/bin/mix
sudo ln -s /usr/local/elixir/bin/iex /usr/local/bin/iex
sudo ln -s /usr/local/elixir/bin/elixirc /usr/local/bin/elixirc
```

Überprüfen, ob  `elixir`und 2 ordnungsgemäß installiert sind. Dazu wird `erlang``elixir -v`ausgeführt. Dies sollte die Ausgabe sein:
```bash
Erlang/OTP 24 [erts-12.3.1] [source] [64-bit] [smp:8:8] [ds:8:8:10] [async-threads:1] [jit]

Elixir 1.13.4 (compiled with Erlang/OTP 22)
```

:::warning
`Erlang/OTP`muss Version  sein `24`und  `Elixir`muss Version sein.`1.13.*`     Wenn das nicht der Fall ist, werden Sie Probleme mit der Erstellung von Blockscout und/oder Ausführung haben.
:::   
:::info
Schaue die offizielle ***[Seite von Blockscout Anforderungen an](https://docs.blockscout.com/for-developers/information-and-settings/requirements)***
:::

### NodeJS installieren {#install-nodejs}
```bash
sudo apt -y install nodejs
```

### Cargo installieren {#install-cargo}
```bash
sudo apt -y install cargo
```

### Andere Abhängigkeiten installieren {#install-other-dependencies}
```bash
sudo apt -y install automake libtool inotify-tools gcc libgmp-dev make g++ git
```

### Installieren Sie optional postgresql Client, um Ihre db-Verbindung zu überprüfen {#optionally-install-postgresql-client-to-check-your-db-connection}
```bash
sudo apt install -y postgresql-client
```

## Teil 2 - Umgebungsvariablen setzen {#part-2-set-environment-variables}
Wir müssen die Umgebungsvariablen setzen, bevor wir Blockscout Compilation beginnen. In diesem Leitfaden werden wir nur das grundlegende Minimum festlegen, damit es funktioniert. Die vollständige Liste [der](https://docs.blockscout.com/for-developers/information-and-settings/env-variables) Variablen, die eingestellt werden können, finden Sie hier

### Datenbankverbindung als Umgebungsvariable einstellen {#set-database-connection-as-environment-variable}
```bash
# postgresql connection example:  DATABASE_URL=postgresql://blockscout:Passw0Rd@db.instance.local:5432/blockscout
export DATABASE_URL=postgresql://<db_user>:<db_pass>@<db_host>:<db_port>/<db_name> # db_name does not have to be existing database

# we set these env vars to test the db connection with psql
export PGPASSWORD=Passw0Rd
export PGUSER=blockscout
export PGHOST=db.instance.local
export PGDATABASE=postgres # on AWS RDS postgres database is always created
```

Testen Sie jetzt ihre DB-Verbindung mit den angegebenen Parametern. Da Sie PG env vars zur Verfügung gestellt haben, sollten Sie sich mit der Datenbank nur durch Ausführen von verbinden können:
```bash
psql
```

Wenn die Datenbank korrekt konfiguriert ist, sollten Sie eine psql sehen:
```bash
psql (12.9 (Ubuntu 12.9-0ubuntu0.20.04.1))
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, bits: 256, compression: off)
Type "help" for help.

blockscout=>
```

Andernfalls wird ein Fehler wie folgt angezeigt:
```bash
psql: error: FATAL:  password authentication failed for user "blockscout"
FATAL:  password authentication failed for user "blockscout"
```
Wenn dies der Fall ist, könnten [diese Dokumente](https://ubuntu.com/server/docs/databases-postgresql) Ihnen helfen.

:::info DB-Verbindung
Stelle sicher, dass du alle db-Verbindungsprobleme aussortiert hast, bevor du zum nächsten fortfährst. Du musst Superuser-Rechte für den blockscout-Benutzer bereitstellen.
:::
```bash
postgres@ubuntu:~$ createuser --interactive
Enter name of role to add: blockscout
Shall the new role be a superuser? (y/n) y
```

## Teil 3 - klonen und kompilieren von Blockscout {#part-3-clone-and-compile-blockscout}
Jetzt bekommen wir endlich Blockscout Installation zu starten.

### Blockscout repo klonen {#clone-blockscout-repo}
```bash
cd ~
git clone https://github.com/Trapesys/blockscout
```

### Geheime Schlüsselbasis generieren, um den Produktions-Build zu schützen {#generate-secret-key-base-to-protect-production-build}
```bash
cd blockscout
mix deps.get
mix local.rebar --force
mix phx.gen.secret
```
In der letzten Zeile sollten Sie eine lange Reihe von zufälligen Zeichen      sehen. Dies sollte als `SECRET_KEY_BASE`Umgebungsvariable festgelegt werden, vor dem nächsten      Schritt. Zum Beispiel:
```bash
export SECRET_KEY_BASE="912X3UlQ9p9yFEBD0JU+g27v43HLAYl38nQzJGvnQsir2pMlcGYtSeRY0sSdLkV/"
```

### Produktionsmodus einstellen {#set-production-mode}
```bash
export MIX_ENV=prod
```

### Kompilieren {#compile}
Cd in das Klonverzeichnis und mit dem Kompilieren beginnen

```bash
cd blockcout
mix local.hex --force
mix do deps.get, local.rebar --force, deps.compile, compile
```

:::info
Wenn Sie bereits eine Installation durchgeführt haben, entfernen Sie die statischen Elemente aus dem vorherigen Build ***mix phx.digestclean.***
:::

### Datenbanken migrieren {#migrate-databases}
:::info
Dieser Teil wird misslingen, wenn Sie Ihre DB-Verbindung nicht richtig eingerichtet haben, sie nicht zur Verfügung gestellt haben, oder in der DATABASE_URL-Umgebung festgelegt wurden. Der Datenbankbenutzer muss Superuser-Rechte haben.
:::
```bash
mix do ecto.create, ecto.migrate
```

Muss die Datenbank zuerst abgelegt werden,
```bash
mix do ecto.drop, ecto.create, ecto.migrate
```

### zuerst Npm-Abhängigkeiten installieren ausführen und Frontend Assets kompilieren {#install-npm-dependencies-and-compile-frontend-assets}
Sie müssen das Verzeichnis im Ordner mit den Frontend Assets ändern.

```bash
cd apps/block_scout_web/assets
sudo npm install
sudo node_modules/webpack/bin/webpack.js --mode production
```

:::info Sei geduldig
Das Kompilieren dieser Assets kann ein paar Minuten dauern, und es wird keine Ausgabe anzeigen. Es kann aussehen, als wäre der Prozess eingefroren, aber Abwarten und Tee trinken. Wenn der Kompiliervorgang abgeschlossen ist, sollte etwas ausgegeben werden, `webpack 5.69.1 compiled with 3 warnings in 104942 ms`wie:
:::

### Statische Assets erstellen {#build-static-assets}
Für diesen Schritt müssen Sie zur Root Ihres Blockscout clone zurückkehren.
```bash
cd ~/blockscout
sudo mix phx.digest
```

### Selbstsignierte Zertifikate generieren {#generate-self-signed-certificates}
:::info
Du kannst diesen Schritt überspringen, wenn du `https`nicht verwendest.
:::
```bash
cd apps/block_scout_web
mix phx.gen.cert blockscout blockscout.local
```

## Teil 4 - Blockscout Service erstellen und ausführen {#part-4-create-and-run-blockscout-service}
In diesem Teil müssen wir einen Systemdienst einrichten, da Blockscout im Hintergrund läuft und nach dem System-Neustart fortbesteht.

### Service file erstellen {#create-service-file}
```bash
sudo touch /etc/systemd/system/explorer.service
```

### Servicedatei bearbeiten {#edit-service-file}
Verwende den bevorzugten Linux Texteditor, um diese Datei zu bearbeiten und den Service zu konfigurieren.
```bash
sudo vi /etc/systemd/system/explorer.service
```
Der Inhalt der explorer.service-Datei sollte wie folgt aussehen:
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

### Start service auf Systemstart aktivieren {#enable-starting-service-on-system-boot}
```bash
sudo systemctl daemon-reload
sudo systemctl enable explorer.service
```

### Verschieben des Blockscout clone an systemweiten Standort {#move-your-blockscout-clone-folder-to-system-wide-location}
Blockscout-Service muss Zugriff auf den Ordner haben, den du von Blockscout repo geklont hast und alle Assets kompiliert hast.
```bash
sudo mv ~/blockscout /usr/local
```

### env vars Datei erstellen, die von Blockscout-Service verwendet werden {#create-env-vars-file-which-will-be-used-by-blockscout-service}

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
Verwende  den `SECRET_KEY_BASE`du in Teil 3 generiert hast.
:::Speichern der Datei und beenden.

### Starten Sie Blockscout-Service {#finally-start-blockscout-service}
```bash
sudo systemctl start explorer.service
```

## Teil 5 - teste die Funktionalität deiner Blockscout-Instance {#part-5-test-out-the-functionality-of-your-blockscout-instance}
Alles was jetzt noch zu tun ist, ist zu überprüfen, ob der Blockscout-Service läuft. Service-Status prüfen mit:
```bash
sudo systemctl status explorer.service
```

Um die Service-Ausgabe zu überprüfen:
```bash
sudo journalctl -u explorer.service -f
```

Sie können überprüfen, ob es neue Listening Ports gibt:
```bash
# if netstat is not installed
sudo apt install net-tools
sudo netstat -tulpn
```

Du solltest eine Liste der listening Ports erhalten, und auf der Liste sollte so etwas sein:
```
tcp        0      0 0.0.0.0:5432            0.0.0.0:*               LISTEN      28142/postgres
tcp        0      0 0.0.0.0:4000            0.0.0.0:*               LISTEN      42148/beam.smp
```

Blockscout führt den in env-Datei definierten Port und das Protokoll aus. In diesem Beispiel läuft es auf `4000`(http)   . `http://<host_ip>:4000`Wenn alles in Ordnung ist, sollte man auf das Blockscout-Web-Portal mit zugreifen können.

## Überlegungen {#considerations}
Für die beste Leistung ist es ratsam, einen dedizierten/lokalen  `polygon-edge`vollständigen full -archive nicht validator-Knoten zu haben     der ausschließlich für Blockscout-Abfragen verwendet wird. Die `json-rpc`API dieses Knotens müssen nicht öffentlich exponiert werden, da Blockscout alle Abfragen vom Backend ausführt.


## Schlussgedanken {#final-thoughts}
Wir haben gerade eine einzige Blockscout-Instance bereitgestellt, die in Ordnung ist, aber für die Produktion sollte erwogen werden, diese Instanz hinter einem Reverse-Proxy wie Nginx einzustellen. Du solltest auch über die Skalierbarkeit von Datenbanken und Instances nachdenken, abhängig von deinem Anwendungsfall.

Sie sollten auf jeden Fall die offizielle [Blockscout-Dokumentation](https://docs.blockscout.com/) ansehen, da viele Anpassungsmöglichkeiten vorhanden sind.
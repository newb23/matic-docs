---
id: blockscout
title: Blockscout
description: Comment configurer une instance de Blockscout pour travailler avec l'Edge de Polygon.
keywords:
  - docs
  - polygon
  - edge
  - blockscout
  - deploy
  - setup
  - instance
---

## Aperçu {#overview}
Ce guide explique en détail comment compiler et déployer l'instance Blockscout pour travailler avec Polygon-Edge.
Blockscout a sa propre [documentation](https://docs.blockscout.com/for-developers/manual-deployment), mais ce guide se concentre sur des instructions simples mais détaillées, étape par étape, sur comment configurer une instance Blockscout.

## Environnement {#environment}
* Système d'Exploitation: Ubuntu Server 20.04 LTS [lien de téléchargement](https://releases.ubuntu.com/20.04/) avec les autorisations de sudo
* Matériel Serveur: 8CPU / 16Go de RAM / 50Go de disque dur (LVM)
* Serveur de base de données : Serveur dédié avec 2 CPU / 4 Go de RAM / 100 Go de SSD / PostgreSQL 13.4

### Serveur DB {#db-server}
L'exigence pour suivre ce guide est d'avoir un serveur de base de données prêt, une base de données et un utilisateur de base de données configurées. Ce guide n'entrera pas dans les détails sur comment déployer et configurer le serveur PostgreSQL. Il existe actuellement de nombreux guides pour le faire, par exemple [le Guide de DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-install-postgresql-on-ubuntu-20-04-quickstart)

:::info CLAUSE DE NON-RESPONSABILITÉ
Ce guide est uniquement destiné à vous aider à faire fonctionner Blockscout sur une seule instance, ce qui n'est pas une configuration de production idéale.   
Pour la production, vous souhaiterez probablement introduire un proxy inverse, un équilibreur de charge, des options d'évolutivité, etc. dans l'architecture.
:::

# Procédure de Déploiement de Blockscout {#blockscout-deployment-procedure}

## Partie 1 - installez les dépendances {#part-1-install-dependencies}
Avant de commencer, nous devons nous assurer que nous avons installé tous les binaires dont dépend Blockscout.

### Mettez à jour et améliorez le système {#update-upgrade-system}
```bash
sudo apt -y update && sudo apt -y upgrade
```

### Ajoutez le référentiel d'erlang {#add-erlang-repos}
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

### Ajoutez le référentiel NodeJS {#add-nodejs-repo}
```bash
sudo curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
```

### Installez Rust {#install-rust}
```bash
sudo curl https://sh.rustup.rs -sSf | sh -s -- -y
```

### Installez la version requise d'Erlang {#install-required-version-of-erlang}
```bash
sudo apt -y install esl-erlang=1:24.*
```

### Installez la version requise d'Elixir {#install-required-version-of-elixir}
La version d'Elixir doit être `1.13`. Si nous essayons d'installer cette version à partir du référentiel officiel, la `erlang` sera mise à jour en `Erlang/OTP 25` et nous ne le voulons pas.     
Pour cette raison, nous devons installer la `elixir` version précompilée spécifique à partir de la page des versions de GitHub.

```bash
cd ~
mkdir /usr/local/elixir
wget https://github.com/elixir-lang/elixir/releases/download/v1.13.4/Precompiled.zip
sudo unzip -d /usr/local/elixir/ Precompiled.zip
rm Precompiled.zip
```

Nous devons maintenant configurer correctement `exlixir` les binaires du système.
```bash
sudo ln -s /usr/local/elixir/bin/elixir /usr/local/bin/elixir
sudo ln -s /usr/local/elixir/bin/mix /usr/local/bin/mix
sudo ln -s /usr/local/elixir/bin/iex /usr/local/bin/iex
sudo ln -s /usr/local/elixir/bin/elixirc /usr/local/bin/elixirc
```

Vérifiez si `elixir` et `erlang` sont correctement installés en exécutant `elixir -v`.
Cela devrait être la sortie:
```bash
Erlang/OTP 24 [erts-12.3.1] [source] [64-bit] [smp:8:8] [ds:8:8:10] [async-threads:1] [jit]

Elixir 1.13.4 (compiled with Erlang/OTP 22)
```

:::warning
`Erlang/OTP` doit être la version `24` et `Elixir` doit être la version `1.13.*`.     Si ce n'est pas le cas, vous rencontrerez des problèmes lors de la compilation et/ou de l'exécution de Blockscout.
:::   
:::info
Consultez la page officielle ***[des exigences Blockscout](https://docs.blockscout.com/for-developers/information-and-settings/requirements)***
:::

### Installez NodeJS {#install-nodejs}
```bash
sudo apt -y install nodejs
```

### Installez Cargo {#install-cargo}
```bash
sudo apt -y install cargo
```

### Installez d'autres dépendances {#install-other-dependencies}
```bash
sudo apt -y install automake libtool inotify-tools gcc libgmp-dev make g++ git
```

### Installez facultativement le client postgresql pour vérifier votre connexion de base de données {#optionally-install-postgresql-client-to-check-your-db-connection}
```bash
sudo apt install -y postgresql-client
```

## Partie 2 - définissez les variables d'environnement {#part-2-set-environment-variables}
Nous devons définir les variables d'environnement avant de commencer la compilation Blockscout. Dans ce guide, nous ne définirons que le minimum de l'essentiel pour le faire fonctionner. La liste complète des variables pouvant être définies est disponible [ici](https://docs.blockscout.com/for-developers/information-and-settings/env-variables)

### Définissez la connexion de base de données comme variable d'environnement {#set-database-connection-as-environment-variable}
```bash
# postgresql connection example:  DATABASE_URL=postgresql://blockscout:Passw0Rd@db.instance.local:5432/blockscout
export DATABASE_URL=postgresql://<db_user>:<db_pass>@<db_host>:<db_port>/<db_name> # db_name does not have to be existing database

# we set these env vars to test the db connection with psql
export PGPASSWORD=Passw0Rd
export PGUSER=blockscout
export PGHOST=db.instance.local
export PGDATABASE=postgres # on AWS RDS postgres database is always created
```

Testez maintenant votre connexion de base de données avec les paramètres fournis. Puisque vous avez fourni des variables d'environnement PG, vous devriez pouvoir vous connecter à la base de données seulement en exécutant:
```bash
psql
```

Si la base de données est configurée correctement, vous devriez voir une psql apparaître:
```bash
psql (12.9 (Ubuntu 12.9-0ubuntu0.20.04.1))
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, bits: 256, compression: off)
Type "help" for help.

blockscout=>
```

Sinon, vous pourriez voir une erreur comme celle-ci:
```bash
psql: error: FATAL:  password authentication failed for user "blockscout"
FATAL:  password authentication failed for user "blockscout"
```
Si tel est le cas, [ces documents](https://ubuntu.com/server/docs/databases-postgresql) pourraient vous aider.

:::info Connexion de la base de données
Assurez-vous d'avoir résolu tous les problèmes de connexion à la base de données avant de passer à la partie suivante.
Vous devrez fournir des privilèges de superutilisateur à l'utilisateur blockscout.
:::
```bash
postgres@ubuntu:~$ createuser --interactive
Enter name of role to add: blockscout
Shall the new role be a superuser? (y/n) y
```

## Partie 3 - clonez et compilez Blockscout {#part-3-clone-and-compile-blockscout}
Maintenant, nous pouvons enfin démarrer l'installation de Blockscout.

### Clonez le référentiel de Blockscout {#clone-blockscout-repo}
```bash
cd ~
git clone https://github.com/Trapesys/blockscout
```

### Générez une base de clés secrètes pour protéger la version de production {#generate-secret-key-base-to-protect-production-build}
```bash
cd blockscout
mix deps.get
mix local.rebar --force
mix phx.gen.secret
```
À la toute dernière ligne, vous devriez voir une longue chaîne de caractères aléatoires.     
Cela devrait être défini comme votre `SECRET_KEY_BASE` variable d'environnement, avant l'étape suivante.     
Par exemple:
```bash
export SECRET_KEY_BASE="912X3UlQ9p9yFEBD0JU+g27v43HLAYl38nQzJGvnQsir2pMlcGYtSeRY0sSdLkV/"
```

### Définissez le mode de production {#set-production-mode}
```bash
export MIX_ENV=prod
```

### Compilez {#compile}
Cd dans le répertoire clone et commencez à compiler

```bash
cd blockcout
mix local.hex --force
mix do deps.get, local.rebar --force, deps.compile, compile
```

:::info

Si vous avez déjà déployé, supprimez les actifs de ressources statiques de la production précédente de ***mix phx.digest.clean***.

:::

### Migrez les bases de données {#migrate-databases}
:::info
Cette partie échouera si vous n'avez pas configuré correctement votre connexion de base de données, si vous n'avez pas fourni, ou si vous avez défini de mauvais paramètres dans la variable d'environnement DATABASE_URL. L'utilisateur de la base de données doit disposer de privilèges de superutilisateur.
:::
```bash
mix do ecto.create, ecto.migrate
```

Si vous devez d'abord supprimer la base de données, exécutez
```bash
mix do ecto.drop, ecto.create, ecto.migrate
```

### Installez les dépendances npm et compilez les premiers actifs  {#install-npm-dependencies-and-compile-frontend-assets}
Vous devez changer de répertoire dans le dossier qui contient les actifs frontaux.

```bash
cd apps/block_scout_web/assets
sudo npm install
sudo node_modules/webpack/bin/webpack.js --mode production
```

:::info Soyez patient
La compilation de ces actifs peut prendre quelques minutes et n'affichera aucune sortie. Il peut sembler que le processus est bloqué, mais soyez patient. Lorsque le processus de compilation est terminé, il devrait afficher quelque chose comme: `webpack 5.69.1 compiled with 3 warnings in 104942 ms`

:::

### Créez des actifs statiques {#build-static-assets}
Pour cette étape, vous devez revenir à la racine de votre dossier clone Blockscout.
```bash
cd ~/blockscout
sudo mix phx.digest
```

### Générez des certificats auto-signés {#generate-self-signed-certificates}
:::info
Vous pouvez ignorer cette étape si vous n'avez pas besoin`https`.
:::
```bash
cd apps/block_scout_web
mix phx.gen.cert blockscout blockscout.local
```

## Partie 4 - créez et exécutez le service Blockscout {#part-4-create-and-run-blockscout-service}
Dans cette partie, nous devons configurer un service de système car nous voulons que Blockscout s'exécute en arrière-plan et persiste après le redémarrage du système.

### Créez un dossier de service {#create-service-file}
```bash
sudo touch /etc/systemd/system/explorer.service
```

### Modifiez le fichier de service {#edit-service-file}
Utilisez votre éditeur de texte Linux préféré pour modifier ce fichier et configurez le service.
```bash
sudo vi /etc/systemd/system/explorer.service
```
Le contenu du fichier explorer.service devrait ressembler à ceci:
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

### Activez le démarrage du service au démarrage du système {#enable-starting-service-on-system-boot}
```bash
sudo systemctl daemon-reload
sudo systemctl enable explorer.service
```

### Déplacez votre dossier clone Blockscout vers un emplacement à l'échelle du système {#move-your-blockscout-clone-folder-to-system-wide-location}
Le service Blockscout doit avoir accès au dossier que vous avez cloné à partir du référentiel Blockscout et de tous les actifs compilés.
```bash
sudo mv ~/blockscout /usr/local
```

### Créez un fichier env vars qui sera utilisé par le service Blockscout {#create-env-vars-file-which-will-be-used-by-blockscout-service}

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
Utiliser ce que `SECRET_KEY_BASE`vous avez généré dans la Partie 3.
:::Enregistrez le fichier et quittez.

### Enfin, démarrez le service Blockscout {#finally-start-blockscout-service}
```bash
sudo systemctl start explorer.service
```

## Partie 5 - testez la fonctionnalité de votre instance Blockscout {#part-5-test-out-the-functionality-of-your-blockscout-instance}
Il ne reste plus qu'à vérifier si le service Blockscout est en cours d'exécution. Vérifiez l'état du service avec:
```bash
sudo systemctl status explorer.service
```

Pour vérifier la sortie du service:
```bash
sudo journalctl -u explorer.service -f
```

Vous pouvez vérifier s'il y a de nouveaux ports d'écoute:
```bash
# if netstat is not installed
sudo apt install net-tools
sudo netstat -tulpn
```

Vous devriez obtenir une liste de ports d'écoute et sur la liste, il devrait y avoir quelque chose comme ceci:
```
tcp        0      0 0.0.0.0:5432            0.0.0.0:*               LISTEN      28142/postgres
tcp        0      0 0.0.0.0:4000            0.0.0.0:*               LISTEN      42148/beam.smp
```

Le service Web Blockscout exécute le port et le protocole définis dans le fichier env. Dans cet exemple, il s'exécute sur `4000`(http).    Si tout va bien, vous devriez pouvoir accéder au portail Web Blockscout avec `http://<host_ip>:4000`

## Considérations {#considerations}
Pour de meilleures performances, il est conseillé d'avoir un nœud non validateur d'archive `polygon-edge`complète dédié/local qui sera utilisé exclusivement pour les requêtes Blockscout.     L'`json-rpc`API de ce nœud n'a pas besoin d'être exposée publiquement, car Blockscout exécute toutes les requêtes à partir du dorsal.


## Réflexions finales {#final-thoughts}
Nous venons de déployer une seule instance Blockscout, qui fonctionne bien, mais pour la production, vous devriez envisager de placer cette instance derrière un proxy inverse comme Nginx. Vous devez également penser à l'évolutivité de la base de données et de l'instance, en fonction de votre cas d'utilisation.

Vous devriez certainement consulter la documentation officielle [de Blockscout](https://docs.blockscout.com/) car il y a beaucoup d'options de personnalisation.
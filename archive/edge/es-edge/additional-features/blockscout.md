---
id: blockscout
title: Blockscout
description: Cómo configurar una instancia de Blockscout para que funcione con Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - blockscout
  - deploy
  - setup
  - instance
---

## Descripción general {#overview}
Esta guía ahonda en los detalles sobre cómo compilar y desplegar una instancia de Blockscout para que funcione con Polygon Edge.
Blockscout tiene su propia [documentación](https://docs.blockscout.com/for-developers/manual-deployment), pero esta guía se centra en instrucciones paso a paso simples y detalladas sobre cómo configurar la instancia de Blockscout.

## Entorno {#environment}
* Sistema operativo: Ubuntu Server 20.04 LTS [descarga el enlace](https://releases.ubuntu.com/20.04/) con los permisos de sudo (superusuario).
* Hardware del servidor:  8 CPU, 16 GB de RAM, HDD (LVM) de 50 GB
* Servidor de la base de datos:  servidor dedicado con 2 CPU, 4 GB de RAM, SSD 100 GB, PostgreSQL 13.4

### Servidor de base de datos {#db-server}
El requisito para seguir esta guía es tener un servidor de base de datos listo, una base de datos y un usuario de base de datos configurado. Esta guía no ahondará en los detalles de cómo desplegar y configurar el servidor PostgreSQL. Hay muchas guías en este momento para hacerlo, por ejemplo, la [Guía de DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-install-postgresql-on-ubuntu-20-04-quickstart).

:::info DESCARGO DE RESPONSABILIDAD

El propósito de esta guía es ayudarte a configurar y ejecutar Blockscout en una única instancia, lo que no es una configuración de producción ideal.   
Para producción, probablemente debas introducir el proxy inverso, el equilibrador de carga, opciones de escalabilidad, etc. en la arquitectura.

:::

# Procedimiento de despliegue de Blockscout {#blockscout-deployment-procedure}

## Parte 1: instalación de dependencias {#part-1-install-dependencies}
Antes de comenzar, debemos cerciorarnos de tener instalados todos los binarios de los que depende Blockscout.

### Actualiza el sistema {#update-upgrade-system}
```bash
sudo apt -y update && sudo apt -y upgrade
```

### Adición de repositorio de Erlang {#add-erlang-repos}
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

### Agrega el repositorio de NodeJS {#add-nodejs-repo}
```bash
sudo curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
```

### Instala Rust {#install-rust}
```bash
sudo curl https://sh.rustup.rs -sSf | sh -s -- -y
```

### Instala la versión necesaria de Erlang {#install-required-version-of-erlang}
```bash
sudo apt -y install esl-erlang=1:24.*
```

### Instala la versión necesaria de Elixir {#install-required-version-of-elixir}
La versión de Elixir debe ser `1.13`. Si intentamos instalar esta versión desde el repositorio oficial,
`erlang` se actualizará a `Erlang/OTP 25`, lo cual debemos evitar.     
Debido a eso, debemos instalar la versión `elixir` específica y precompilada de la página de publicaciones de GitHub.

```bash
cd ~
mkdir /usr/local/elixir
wget https://github.com/elixir-lang/elixir/releases/download/v1.13.4/Precompiled.zip
sudo unzip -d /usr/local/elixir/ Precompiled.zip
rm Precompiled.zip
```

Ahora, necesitamos configurar correctamente el sistema de binarios `exlixir`.
```bash
sudo ln -s /usr/local/elixir/bin/elixir /usr/local/bin/elixir
sudo ln -s /usr/local/elixir/bin/mix /usr/local/bin/mix
sudo ln -s /usr/local/elixir/bin/iex /usr/local/bin/iex
sudo ln -s /usr/local/elixir/bin/elixirc /usr/local/bin/elixirc
```

Revisa si `elixir` y `erlang` están correctamente instalados ejecutando `elixir -v`.
Este debería ser el resultado:
```bash
Erlang/OTP 24 [erts-12.3.1] [source] [64-bit] [smp:8:8] [ds:8:8:10] [async-threads:1] [jit]

Elixir 1.13.4 (compiled with Erlang/OTP 22)
```

:::warning

`Erlang/OTP` debe ser versión `24` y `Elixir` debe ser versión `1.13.*`.    
Si no es así, tendrás problemas con la compilación o ejecución de Blockscout.

:::   
:::info

Dale un vistazo a la ***[página oficial de los requisitos de Blockscout](https://docs.blockscout.com/for-developers/information-and-settings/requirements)***.

:::

### Instala NodeJS {#install-nodejs}
```bash
sudo apt -y install nodejs
```

### Instala Cargo {#install-cargo}
```bash
sudo apt -y install cargo
```

### Instala otras dependencias {#install-other-dependencies}
```bash
sudo apt -y install automake libtool inotify-tools gcc libgmp-dev make g++ git
```

### Opcionalmente, instala el cliente postgresql para comprobar tu conexión de base de datos {#optionally-install-postgresql-client-to-check-your-db-connection}
```bash
sudo apt install -y postgresql-client
```

## Parte 2: configuración de las variables del entorno {#part-2-set-environment-variables}
Necesitamos configurar las variables del entorno antes de comenzar con la compilación de Blockscout. En esta guía únicamente configuraremos el mínimo básico para que funcione.
Puedes encontrar una lista completa de variables configurables [aquí](https://docs.blockscout.com/for-developers/information-and-settings/env-variables).

### Configura la conexión de la base de datos como variable del entorno {#set-database-connection-as-environment-variable}
```bash
# postgresql connection example:  DATABASE_URL=postgresql://blockscout:Passw0Rd@db.instance.local:5432/blockscout
export DATABASE_URL=postgresql://<db_user>:<db_pass>@<db_host>:<db_port>/<db_name> # db_name does not have to be existing database

# we set these env vars to test the db connection with psql
export PGPASSWORD=Passw0Rd
export PGUSER=blockscout
export PGHOST=db.instance.local
export PGDATABASE=postgres # on AWS RDS postgres database is always created
```

Ahora, prueba tu conexión a la base de datos con los parámetros proporcionados.
Como has proporcionado las variables del entorno de PG, deberías poder conectarte a la base de datos con solo ejecutar:
```bash
psql
```

Si la base de datos está configurada correctamente, deberías ver un mensaje de psql:
```bash
psql (12.9 (Ubuntu 12.9-0ubuntu0.20.04.1))
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, bits: 256, compression: off)
Type "help" for help.

blockscout=>
```

De lo contrario, puede que veas un error como este:
```bash
psql: error: FATAL:  password authentication failed for user "blockscout"
FATAL:  password authentication failed for user "blockscout"
```
Si es así, [estos documentos](https://ubuntu.com/server/docs/databases-postgresql) te ayudarán.

:::info Conexión a la base de datos

Cerciórate de haber ordenado todos los problemas de conexión a la base de datos antes de pasar a la siguiente parte.
Tendrás que darle privilegios de superusuario al usuario de Blockscout.

:::
```bash
postgres@ubuntu:~$ createuser --interactive
Enter name of role to add: blockscout
Shall the new role be a superuser? (y/n) y
```

## Parte 3: clonación y compilación de Blockscout {#part-3-clone-and-compile-blockscout}
Ahora, finalmente empezamos con la instalación de Blockscout.

### Clona el repositorio de Blockscout  {#clone-blockscout-repo}
```bash
cd ~
git clone https://github.com/Trapesys/blockscout
```

### Genera una base clave secreta para proteger la construcción de la producción {#generate-secret-key-base-to-protect-production-build}
```bash
cd blockscout
mix deps.get
mix local.rebar --force
mix phx.gen.secret
```
En la última línea, deberías ver una larga cadena de caracteres aleatorios.     
Esta debería estar configurada como tu variable de entorno `SECRET_KEY_BASE` antes de pasar al siguiente paso.     
Por ejemplo:
```bash
export SECRET_KEY_BASE="912X3UlQ9p9yFEBD0JU+g27v43HLAYl38nQzJGvnQsir2pMlcGYtSeRY0sSdLkV/"
```

### Configura el modo de producción {#set-production-mode}
```bash
export MIX_ENV=prod
```

### Compila {#compile}
Cambia de directorio al directorio clonado y empieza a compilar

```bash
cd blockcout
mix local.hex --force
mix do deps.get, local.rebar --force, deps.compile, compile
```

:::info

Si ya has hecho el despliegue antes, elimina los activos estáticos de la mezcla anterior de construcción de ***mix phx.digest.clean***.

:::

### Migra las bases de datos {#migrate-databases}
:::info

Esta parte fallará si no configuraste correctamente tu conexión a la base de datos correctamente, o si no suministraste
los parámetros en la variable del entorno DATABASE_URL, o si los definiste de forma incorrecta.
El usuario de la base de datos debe tener privilegios de superusuario.

:::
```bash
mix do ecto.create, ecto.migrate
```

Si tienes que eliminar la base de datos primero, ejecuta
```bash
mix do ecto.drop, ecto.create, ecto.migrate
```

### Instala las dependencias npm y compila los activos de la interfaz del usuario {#install-npm-dependencies-and-compile-frontend-assets}
Deberás mover el directorio a la carpeta que contiene los activos de la interfaz del usuario.

```bash
cd apps/block_scout_web/assets
sudo npm install
sudo node_modules/webpack/bin/webpack.js --mode production
```

:::info Ten paciencia.

La compilación de estos activos puede demorar algunos minutos y no mostrará resultados.
Puede parecer que el proceso está trabado, pero ten paciencia.
Cuando termine el proceso de compilación, el resultado debe ser similar a este: `webpack 5.69.1 compiled with 3 warnings in 104942 ms`

:::

### Construye activos estáticos {#build-static-assets}
Para este paso, debes volver a la raíz de tu carpeta de clones de Blockscout.
```bash
cd ~/blockscout
sudo mix phx.digest
```

### Genera certificados autofirmados {#generate-self-signed-certificates}
:::info

Puedes omitir paso si no vas a usar `https`.

:::
```bash
cd apps/block_scout_web
mix phx.gen.cert blockscout blockscout.local
```

## Parte 4: creación y ejecución del servicio de Blockscout {#part-4-create-and-run-blockscout-service}
En esta parte, tenemos que configurar un servicio del sistema, ya que queremos que Blockscout se ejecute en segundo plano y persista después de reiniciar el sistema.

### Crea un archivo de servicio {#create-service-file}
```bash
sudo touch /etc/systemd/system/explorer.service
```

### Edita el archivo de servicio {#edit-service-file}
Utiliza tu editor de texto favorito de Linux para editar este archivo y configurar el servicio.
```bash
sudo vi /etc/systemd/system/explorer.service
```
El contenido del archivo explorer.service debe verse así:
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

### Habilita el servicio de inicio en el arranque del sistema {#enable-starting-service-on-system-boot}
```bash
sudo systemctl daemon-reload
sudo systemctl enable explorer.service
```

### Mueve tu carpeta de clones de Blockscout a la ubicación en el sistema general. {#move-your-blockscout-clone-folder-to-system-wide-location}
El servicio de Blockscout requiere tener acceso a la carpeta que clonaste del repositorio de Blockscout y compilado todos los activos.
```bash
sudo mv ~/blockscout /usr/local
```

### Crea un archivo de variables del entorno que será utilizado por el servicio de Blockscout {#create-env-vars-file-which-will-be-used-by-blockscout-service}

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

Utiliza `SECRET_KEY_BASE` que generaste en la parte 3.

:::
Guarda el archivo y sal.

### Finalmente, inicia el servicio de Blockscout. {#finally-start-blockscout-service}
```bash
sudo systemctl start explorer.service
```

## Parte 5: prueba de la funcionalidad de tu instancia de Blockscout. {#part-5-test-out-the-functionality-of-your-blockscout-instance}
Lo único que falta hacer es comprobar que el servicio de Blockscout se esté ejecutando.
Revisa el estado del servicio con:
```bash
sudo systemctl status explorer.service
```

Para revisar los resultados del servicio:
```bash
sudo journalctl -u explorer.service -f
```

Puedes revisar si hay algunos nuevos puertos de escucha:
```bash
# if netstat is not installed
sudo apt install net-tools
sudo netstat -tulpn
```

Deberías obtener una lista de puertos de escucha; en esa lista, debería haber algo como esto:
```
tcp        0      0 0.0.0.0:5432            0.0.0.0:*               LISTEN      28142/postgres
tcp        0      0 0.0.0.0:4000            0.0.0.0:*               LISTEN      42148/beam.smp
```

El servicio web de Blockscout ejecuta el puerto y el protocolo definidos en el archivo del entorno. En este ejemplo, se ejecuta en `4000` (http)   
Si todo está bien, debes poder acceder al portal web de Blockscout con `http://<host_ip>:4000`.

## Consideraciones {#considerations}
Para obtener el mejor desempeño, es aconsejable tener un nodo completo no validador de archivos `polygon-edge` dedicado o local,
que se utilizará exclusivamente para consultas de Blockscout.    
La API `json-rpc` de este nodo no tiene que estar expuesta públicamente, ya que Blockscout ejecuta todas las consultas desde el modo administrador.


## Reflexiones finales {#final-thoughts}
Acabamos de desplegar una única instancia de Blockscout que funciona bien, pero, para la producción, deberías considerar ubicar esta instancia detrás de un proxy inverso, como Nginx.
También, deberías pensar en la escalabilidad de las bases de datos y de las instancias, según tu caso de uso.

Definitivamente, deberías darle un vistazo a la [documentación oficial de Blockscout](https://docs.blockscout.com/), ya que hay muchas opciones de personalización.
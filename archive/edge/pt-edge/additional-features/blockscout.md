---
id: blockscout
title: Blockscout
description: Como configurar uma instância Blockscout para trabalhar com o Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - blockscout
  - deploy
  - setup
  - instance
---

## Visão geral {#overview}
Este guia especifica em detalhes como compilar e implantar a instância Blockscout para trabalhar com o Polygon-Edge.
O Blockscout tem a sua própria [documentação](https://docs.blockscout.com/for-developers/manual-deployment), mas este guia concentra-se em instruções passo-a-passo simples, embora detalhadas, sobre como configurar a instância Blockscout.

## Ambiente {#environment}
* Sistema operativo: [faça o download do link](https://releases.ubuntu.com/20.04/) do Ubuntu Server 20.04 LTS com permissões sudo
* Hardware do servidor: 8CPU / 16GB de RAM / 50GB HDD (LVM)
* Servidor de base de dados: servidor dedicado com 2 CPU / 4GB de RAM / SSD 100GB / PostgreSQL 13.4

### Servidor BD {#db-server}
O requisito para seguir este guia é ter um servidor de base de dados pronto, uma base de dados e um utilizador de base de dados configurado.
Este guia não irá entrar em detalhes sobre como implantar e configurar o servidor PostgreSQL.
Existem muitos guias disponíveis para isso como, por exemplo, [o Guia DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-install-postgresql-on-ubuntu-20-04-quickstart)

:::info EXCLUSÃO DE RESPONSABILIDADE

Este guia destina-se apenas a ajuda colocar o Blockscout em funcionamento numa única instância, o que não é a configuração de produção ideal.   
Para produção, é provavelmente aconselhável introduzir o proxy reverso, o balanceador de carga, as opções de escalabilidade etc. na arquitetura.

:::

# Procedimento de implantação do Blockscout {#blockscout-deployment-procedure}

## Parte 1 - instalar as dependências {#part-1-install-dependencies}
Antes do início, precisamos de ter certeza de que temos instalados todos binários de que o Blockscout depende.

### Atualizar e fazer upgrade do sistema {#update-upgrade-system}
```bash
sudo apt -y update && sudo apt -y upgrade
```

### Adicionar repos de erlang {#add-erlang-repos}
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

### Adicionar repo NodeJS {#add-nodejs-repo}
```bash
sudo curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
```

### Instalar o Rust {#install-rust}
```bash
sudo curl https://sh.rustup.rs -sSf | sh -s -- -y
```

### Instalar versão necessária do Erlang {#install-required-version-of-erlang}
```bash
sudo apt -y install esl-erlang=1:24.*
```

### Instalar versão necessária do Elixir {#install-required-version-of-elixir}
A versão do Elixir deve ser `1.13`. Se tentarmos instalar esta versão do repositório oficial,
o `erlang` irá atualizar para `Erlang/OTP 25` e não queremos isso.     
Por isso, precisamos instalar a `elixir`versão pré-compilada específica da página de lançamentos do GitHub.

```bash
cd ~
mkdir /usr/local/elixir
wget https://github.com/elixir-lang/elixir/releases/download/v1.13.4/Precompiled.zip
sudo unzip -d /usr/local/elixir/ Precompiled.zip
rm Precompiled.zip
```

Agora precisamos configurar corretamente `exlixir` binários do sistema.
```bash
sudo ln -s /usr/local/elixir/bin/elixir /usr/local/bin/elixir
sudo ln -s /usr/local/elixir/bin/mix /usr/local/bin/mix
sudo ln -s /usr/local/elixir/bin/iex /usr/local/bin/iex
sudo ln -s /usr/local/elixir/bin/elixirc /usr/local/bin/elixirc
```

Verifique se `elixir` e `erlang` estão devidamente instalados executando `elixir -v`.
A saída deve ser:
```bash
Erlang/OTP 24 [erts-12.3.1] [source] [64-bit] [smp:8:8] [ds:8:8:10] [async-threads:1] [jit]

Elixir 1.13.4 (compiled with Erlang/OTP 22)
```

:::warning

`Erlang/OTP` deve ser versão `24` e `Elixir` deve ser versão `1.13.*`.    
Se não for esse o caso, RUN vai ter problemas para compilar o Blockscout e/ou executá-lo.

:::   
:::info

Confira a página oficial ***[de requisitos do Blockscout](https://docs.blockscout.com/for-developers/information-and-settings/requirements)***

:::

### instalar NodeJS {#install-nodejs}
```bash
sudo apt -y install nodejs
```

### Instalar Cargo {#install-cargo}
```bash
sudo apt -y install cargo
```

### Instalar outras dependências {#install-other-dependencies}
```bash
sudo apt -y install automake libtool inotify-tools gcc libgmp-dev make g++ git
```

### Opcionalmente, instale cliente postgresql para verificar a sua conexão de banco de dados {#optionally-install-postgresql-client-to-check-your-db-connection}
```bash
sudo apt install -y postgresql-client
```

## Parte 2 - definir variáveis do ambiente {#part-2-set-environment-variables}
Precisamos definir as variáveis do ambiente antes de começar com a compilação Blockscout.
Neste guia, definiremos apenas o mínimo básico para fazê-lo funcionar.
A lista completa de variáveis que podem ser definidas é fornecida [aqui](https://docs.blockscout.com/for-developers/information-and-settings/env-variables)

### Definir conexão de base de dados como variável de ambiente {#set-database-connection-as-environment-variable}
```bash
# postgresql connection example:  DATABASE_URL=postgresql://blockscout:Passw0Rd@db.instance.local:5432/blockscout
export DATABASE_URL=postgresql://<db_user>:<db_pass>@<db_host>:<db_port>/<db_name> # db_name does not have to be existing database

# we set these env vars to test the db connection with psql
export PGPASSWORD=Passw0Rd
export PGUSER=blockscout
export PGHOST=db.instance.local
export PGDATABASE=postgres # on AWS RDS postgres database is always created
```

Teste agora sua conexão de base de dados com parâmetros fornecidos.
Como forneceu vars de PG env, deve ser capaz conectar à base de dados apenas executando:
```bash
psql
```

Se a base de dados estiver configurada corretamente, deve ser exibido um prompt de psql:
```bash
psql (12.9 (Ubuntu 12.9-0ubuntu0.20.04.1))
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, bits: 256, compression: off)
Type "help" for help.

blockscout=>
```

Caso contrário, pode ver um erro como este:
```bash
psql: error: FATAL:  password authentication failed for user "blockscout"
FATAL:  password authentication failed for user "blockscout"
```
Se for este o caso, [estes documentos](https://ubuntu.com/server/docs/databases-postgresql) podem ajudar.

:::info Conexão de base de dados

Verifique se todos os problemas de conexão da base de dados foram classificados antes de prosseguir para a próxima parte. É necessário fornecer privilégios de superutilizador para o utilizador do Blockscout.

:::
```bash
postgres@ubuntu:~$ createuser --interactive
Enter name of role to add: blockscout
Shall the new role be a superuser? (y/n) y
```

## Parte 3 - faça clone e compile o Blockscout {#part-3-clone-and-compile-blockscout}
Agora finalmente começamos a instalação do Blockscout.

### Faça o clone do repositório do Blockscout {#clone-blockscout-repo}
```bash
cd ~
git clone https://github.com/Trapesys/blockscout
```

### Gere uma base de chave secreta para proteger a construção da produção {#generate-secret-key-base-to-protect-production-build}
```bash
cd blockscout
mix deps.get
mix local.rebar --force
mix phx.gen.secret
```
Na última linha, deve existir uma string longa de caracteres aleatórios     .
Isso deve ser definido como sua variável de ambiente `SECRET_KEY_BASE`, antes da etapa seguinte.     
Por exemplo:
```bash
export SECRET_KEY_BASE="912X3UlQ9p9yFEBD0JU+g27v43HLAYl38nQzJGvnQsir2pMlcGYtSeRY0sSdLkV/"
```

### Definir o modo de produção {#set-production-mode}
```bash
export MIX_ENV=prod
```

### Compilar {#compile}
Cd para o diretório do clone e inicie a compilação

```bash
cd blockcout
mix local.hex --force
mix do deps.get, local.rebar --force, deps.compile, compile
```

:::info

Se tiver implantado anteriormente, remova os ativos estáticos da compilação anterior ***mix phx.digest.clean***.

:::

### Migrar bases de dados {#migrate-databases}
:::info

Esta parte falhará se sua conexão de base de dados não tiver sido configurada corretamente e os
parâmetros na variável de ambiente DATABASE_URL não tiverem sido definidos ou estiverem errados.
O utilizador da base de dados precisa de privilégios de superutilizador.

:::
```bash
mix do ecto.create, ecto.migrate
```

Se precisar largar a base de dados primeiro, execute
```bash
mix do ecto.drop, ecto.create, ecto.migrate
```

### Instale as dependências NPM e compile os ativos frontend {#install-npm-dependencies-and-compile-frontend-assets}
É necessário alterar o diretório para a pasta que contém os ativos frontend.

```bash
cd apps/block_scout_web/assets
sudo npm install
sudo node_modules/webpack/bin/webpack.js --mode production
```

:::info Seja paciente

A compilação destes ativos pode levar alguns minutos e não será exibida nenhuma saída.
Pode parecer que o processo está empacado. Por favor, seja paciente e aguarde.
Quando o processo de compilar for concluído, ele deve produzir algo semelhante a: `webpack 5.69.1 compiled with 3 warnings in 104942 ms`

:::

### Construir ativos estáticos {#build-static-assets}
Para esta etapa, é necessário retornar à raiza da sua pasta do clone Blockscout.
```bash
cd ~/blockscout
sudo mix phx.digest
```

### Gerar certificados autoassinados {#generate-self-signed-certificates}
:::info

Pode ignorar esta etapa se não for usar `https`.

:::
```bash
cd apps/block_scout_web
mix phx.gen.cert blockscout blockscout.local
```

## Parte 4 - crie e execute o serviço Blockscout {#part-4-create-and-run-blockscout-service}
Nesta parte, precisamos configurar um serviço de sistema da forma que queremos que o Blockscout seja executado no segundo plano e persista após a reinicialização do sistema.

### Criar ficheiro de serviço {#create-service-file}
```bash
sudo touch /etc/systemd/system/explorer.service
```

### Editar ficheiro de serviço {#edit-service-file}
Use o seu editor de texto Linux favorito para editar este ficheiro e configurar serviço
```bash
sudo vi /etc/systemd/system/explorer.service
```
O conteúdo do ficheiro explorer.service deve ser semelhante a este:
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

### Ativar serviço na inicialização do sistema {#enable-starting-service-on-system-boot}
```bash
sudo systemctl daemon-reload
sudo systemctl enable explorer.service
```

### Mova a sua pasta do clone Blockscout para a localização em todo o sistema {#move-your-blockscout-clone-folder-to-system-wide-location}
O serviço Blockscout precisa ter acesso à pasta que foi clonada no repositório Blockscout e compilou todos os ativos.
```bash
sudo mv ~/blockscout /usr/local
```

### Crie ficheiro env vars que será usado pelo serviço Blockscout {#create-env-vars-file-which-will-be-used-by-blockscout-service}

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

Use `SECRET_KEY_BASE` que foi gerado na Parte 3.

:::
Salve o ficheiro e saia.

### Finalmente, inicie o serviço Blockscout {#finally-start-blockscout-service}
```bash
sudo systemctl start explorer.service
```

## Parte 5 - teste a funcionalidade da sua instância Blockscout {#part-5-test-out-the-functionality-of-your-blockscout-instance}
Agora tudo o que resta a fazer é verificar se o serviço Blockscout está em execução.
Verifique o status do serviço com:
```bash
sudo systemctl status explorer.service
```

Para verificar a saída do serviço:
```bash
sudo journalctl -u explorer.service -f
```

É possível verificar se existem novas portas de escuta:
```bash
# if netstat is not installed
sudo apt install net-tools
sudo netstat -tulpn
```

Obtenha uma lista de portas de escuta. Na lista, deve haver algo assim:
```
tcp        0      0 0.0.0.0:5432            0.0.0.0:*               LISTEN      28142/postgres
tcp        0      0 0.0.0.0:4000            0.0.0.0:*               LISTEN      42148/beam.smp
```

Serviço web do Blockscout executa a porta e o protocolo definidos no ficheiro env. Neste exemplo, ele é executado em `4000`(http).   .
Se estiver tudo bem, ele deve ser capaz de acessar o portal web do Blockscout com `http://<host_ip>:4000`.

## Considerações {#considerations}
Para melhor desempenho, é aconselhável ter um nó não validador de arquivo completo de `polygon-edge` dedicado/local
que será usado exclusivamente para consultas do Blockscout.    
A `json-rpc`API deste nó não precisa ser exposta publicamente, já que o Blockscout executa todas as consultas a partir do backend.


## Conclusões finais {#final-thoughts}
Acabamos de implantar uma única instância do Blockscout, que funciona bem. No entanto, para produção, é aconselhável colocar esta instância atrás de um proxy reverso como o Nginx.
Também deve pensar na escalabilidade da base de dados e da instância, dependendo do seu caso de uso.

Definitivamente, recomendamos consultar a [documentação oficial do Blockscout](https://docs.blockscout.com/) visto que há muitas opções de personalização.
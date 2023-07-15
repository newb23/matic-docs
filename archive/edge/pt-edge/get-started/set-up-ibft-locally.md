---
id: set-up-ibft-locally
title: Configuração local
description: "Guia de configuração local passo a passo."
keywords:
  - docs
  - polygon
  - edge
  - local
  - setup
  - genesis
---

:::caution Este guia é apenas para fins de teste

O guia abaixo irá instruí-lo em como configurar uma rede Polygon Edge na sua máquina local para finalidades de testes
e desenvolvimento.

O procedimento difere muito da maneira que você gostaria de configurar a rede Polygon Edge para um cenário num
um provedor de nuvem: **[Configuração da nuvem](/docs/edge/get-started/set-up-ibft-on-the-cloud)**

:::


## Requisitos {#requirements}

Consultar [Instalação](/docs/edge/get-started/installation) para instalar o Polygon Edge.

## Visão geral {#overview}

![Configuração local](/img/edge/ibft-setup/local.svg)

Neste guia, o nosso objetivo é estabelecer uma rede blockchain `polygon-edge` funcional trabalhando com o [protocolo de consenso IBFT](https://github.com/ethereum/EIPs/issues/650).
A rede blockchain consistirá em 4 nós, todos eles nós de validador e, como tal, elegíveis para propor blocos e validar blocos provenientes de outros proponentes.
Todos os 4 nós serão executados na mesma máquina, pois a ideia deste guia é fornecer um cluster de IBFT totalmente funcional no menor tempo possível.

Para o conseguir, iremos guiá-lo ao longo de 4 etapas fáceis:

1. A inicialização de diretórios de dados irá gerar as chaves de validador para cada um dos 4 nós e inicializar os diretórios de dados de blockchain vazios. As chaves de validador são importantes, pois precisamos fazer o bootstrap do bloco de génese com o conjunto inicial de validadores usando essas chaves.
2. A preparação da string de conexão para o bootnode trará informações vitais para cada nó que vamos executar em relação a que nó se conectar ao iniciar.
3. Para gerar o ficheiro `genesis.json`, será preciso inserir as chaves de validador geradas na **etapa 1** e usadas para definir os validadores iniciais da rede no bloco de génese e a string de conexão de bootnode na **etapa 2**.
4. Executar todos os nós é o principal objetivo deste guia e será a a última etapa a ser executada. Vamos instruir os nós sobre que diretório de dados usar e onde encontrar `genesis.json`, o que executa o bootstrap do estado inicial da rede.

Como todos os quatro nós serão executados no localhost, durante o processo de configuração, é esperado que todos os diretórios de dados
para cada um dos nós estejam no mesmo diretório principal.

:::info Número de validadores

Não há um número mínimo de nós por cluster, o que significa que são possíveis clusters com apenas 1 nó de validador.
Lembre-se de que com um cluster de um _único_ nó **não existe tolerância às falhas** nem **garantia de BFT**.

O número mínimo recomendado de nós para obter a garantia de BFT é 4 - já que num cluster de 4 nós pode ser tolerada
a falha de 1 nó, com os restantes 3 a funcionarem normalmente.

:::

## Etapa 1: inicialize as pastas de dados para o IBFT e gere chaves de validador {#step-1-initialize-data-folders-for-ibft-and-generate-validator-keys}

Para operar com o IBFT, é necessário inicializar as pastas de dados,
uma para cada nó:

````bash
polygon-edge secrets init --data-dir test-chain-1
````

````bash
polygon-edge secrets init --data-dir test-chain-2
````

````bash
polygon-edge secrets init --data-dir test-chain-3
````

````bash
polygon-edge secrets init --data-dir test-chain-4
````

Cada um destes comandos imprimirá a chave de validador, a chave pública BLS e a [ID do nó](https://docs.libp2p.io/concepts/peer-id/). Irá precisar da identificação do primeiro nó para a etapa seguinte.

### Segredos de execução {#outputting-secrets}
A saída de segredos pode ser recuperada novamente, se necessário.

```bash
polygon-edge secrets output --data-dir test-chain-4
```

## Etapa 2: preparar o string de conexão multiaddr para o bootnode {#step-2-prepare-the-multiaddr-connection-string-for-the-bootnode}

Para estabelecer com sucesso a conectividade, um nó deve saber a que servido `bootnode` se conectar para obter
informações sobre todos os nós restantes da rede. O `bootnode` é, por vezes, conhecido como servidor `rendezvous` no jargão p2p.

`bootnode` não é uma instância especial do nó do polygon-edge. Cada nó do polygon-edge pode atuar como um `bootnode`, mas
cada nó do polygon-edge precisa ter um conjunto de bootnodes especificado, que será contatado para informações sobre como se conectar com
todos os restantes nós da rede.

Para criar um string de conexão para especificar o bootnode, temos de seguir
o [formato multiaddr](https://docs.libp2p.io/concepts/addressing/):
```
/ip4/<ip_address>/tcp/<port>/p2p/<node_id>
```

Neste guia trataremos o primeiro e segundo nós como bootnodes para todos os outros nós. O que acontece neste cenário
é que os nós que se conectam ao `node 1` ou `node 2` irão obter informações sobre como se conectar entre si através de um
bootnode mutuamente contactado.

:::info É necessário especificar pelo menos um bootnode para iniciar um nó

É necessário pelo menos **um** bootnode para que outros nós da rede possam encontrar-se. São recomendados mais bootnodes, pois
eles oferecem resiliência à rede em caso de interrupção.
Neste guia listaremos dois nós, mas isto pode ser alterado rapidamente, sem qualquer impacto na validade do ficheiro `genesis.json`.

:::

Como estamos a executar no localhost, é seguro assumir que o `<ip_address>` é `127.0.0.1`.

Para o , `<port>`vamos usar  `10001`já que configuraremos o servidor libp2p para  `node 1`para ouvir nesta porta posteriormente.

Por fim, precisamos da `<node_id>`, que podemos obter da saída do comando `polygon-edge secrets init --data-dir test-chain-1` previamente executado (que foi usado para gerar chaves e diretórios de dados para o `node1`)

Depois da compilação, o string de conexão multiaddr para o `node 1` que usaremos como bootnode terá o seguinte aspeto (só a `<node_id>`, que se encontra no final, deverá ser diferente):
```
/ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW
```
Da mesma forma, construímos o multiaddr para o segundo bootnode como abaixo
```
/ip4/127.0.0.1/tcp/20001/p2p/16Uiu2HAmS9Nq4QAaEiogE4ieJFUYsoH28magT7wSvJPpfUGBj3Hq
```

:::info Hostnames DNS em vez de ips

O Polygon Edge suporta o uso de hostnames DNS para a configuração dos nós. Este é um recurso muito útil para implantações baseadas na nuvem, já que o ip do nó pode mudar por vários motivos.

O formato multiaddr para o string de conexão ao usar os hostnames DNS é o seguinte:
`/dns4/sample.hostname.com/tcp/<port>/p2p/nodeid`

:::


## Etapa 3: gerar o ficheiro de génese com os 4 nós como validadores {#step-3-generate-the-genesis-file-with-the-4-nodes-as-validators}

````bash
polygon-edge genesis --consensus ibft --ibft-validators-prefix-path test-chain- --bootnode /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW --bootnode /ip4/127.0.0.1/tcp/20001/p2p/16Uiu2HAmS9Nq4QAaEiogE4ieJFUYsoH28magT7wSvJPpfUGBj3Hq
````

O que faz este comando:

* O `--ibft-validators-prefix-path` define o caminho da pasta do prefixo para o caminho especificado que o IBF no Polygon Edge pode
usar. Este diretório é usado para abrigar a pasta `consensus/`, onde a chave privada do validador é mantida. A
chave pública do validador é necessária para construir o ficheiro de génese - a lista inicial de nós de bootstrap.
Este sinalizador faz sentido apenas ao configurar a rede no localhost, já que num cenário do mundo real não podemos esperar
que todos os diretórios de dados de nós estejam no mesmo sistema de arquivos de onde podemos ler facilmente suas chaves públicas.
* O `--bootnode` define o endereço do bootnode que irá permitir que os nós se encontrem.
Usaremos a string multiaddr do `node 1`, como mencionado na **etapa 2**.

O resultado deste comando é o ficheiro `genesis.json`, que contém o bloco de génese do nosso blockchain novo, com o conjunto de validador predefinido e a configuração para que nó para entrar em contato primeiro para estabelecer a conectividade.

:::info Mudar para ECDSA

BLS é o modo de validação padrão dos cabeçalhos de blocos. Se desejar que a sua chain seja executada no modo ECDSA, pode usar o `—ibft-validator-type`sinalizador , com o argumento `ecdsa`:

```
genesis --ibft-validator-type ecdsa
```
:::
:::info Pré-mineração de saldos de conta

Provavelmente quererá configurar a sua rede blockchain com alguns endereços que têm saldos "pré-minerados".

Para o conseguir, passe tantos flags `--premine` quantos quiser por endereço que pretende que seja inicializado com um determinado saldo
na blockchain.

Por exemplo, se quisermos pré-minerar 1000 ETH para o endereço `0x3956E90e632AEbBF34DEB49b71c28A83Bc029862` do nosso bloco de génese, então precisaremos de fornecer o seguinte argumento:

```
--premine=0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000
```

**Note que o valor pré-minerado está em WEI, não ETH.**

:::

:::info Defina o limite de gás do bloco

O limite de gás predefinido para cada bloco é `5242880`. Este valor é escrito no ficheiro génese, mas poderá querer
aumentá-lo/diminui-lo.

Para o fazer, pode usar o flag `--block-gas-limit`, seguido do valor pretendido, como se mostra abaixo:

```shell
--block-gas-limit 1000000000
```
:::

:::info Defina o limite do descritor do ficheiro de sistema

O limite de descritores de ficheiros padrão (número máximo de ficheiros abertos) pode ser baixo e, no Linux, tudo é um ficheiro. Se os nós forem esperados ter alta taxa de transferência, poderá considerar aumentar este limite. Verifique os documentos oficiais da sua distribuição do linux para mais detalhes.

#### Verifique os limites atuais do sistema operativo (ficheiros abertos) {#check-current-os-limits-open-files}
```shell title="ulimit -n"
1024 # Ubuntu default
```

#### Aumente o limite de ficheiros abertos {#increase-open-files-limit}
- Executar `polygon-edge`em primeiro plano (shell)
  ```shell title="Set FD limit for the current session"
  ulimit -n 65535 # affects only current session, limit won't persist after logging out
  ```

  ```shell title="Edit /etc/security/limits.conf"
  # add the following lines to the end of the file to modify FD limits
  *               soft    nofile          65535 # sets FD soft limit for all users
  *               hard    nofile          65535 # sets FD hard limit for all users

  # End of file
  ```
Salve o ficheiro e reinicie o sistema.

- Executar `polygon-edge`em segundo plano como serviço

Se for `polygon-edge`executado como serviço de sistema, usando a ferramenta como , limites do descritor de `systemd`arquivos deve ser gerenciado usando `systemd`.
  ```shell title="Edit /etc/systemd/system/polygon-edge.service"
  [Service]
   ...
  LimitNOFILE=65535
  ```

### Solução de problemas {#troubleshooting}
```shell title="Watch FD limits of polygon edge running process"
watch -n 1 "ls /proc/$(pidof polygon-edge)/fd | wc -l"
```

```shell title="Check max FD limits for polygon-edge running process"
cat /proc/$(pidof polygon-edge)/limits
```
:::


## Etapa 4: executar todos os clientes {#step-4-run-all-the-clients}

Como estamos a tentar executar uma rede Polygon Edge consistindo em 4 nós, todos na mesma máquina, precisamos
evitar conflitos de portas. É por isso que usaremos a seguinte lógica para determinar as portas de escuta de cada servidor de um nó:

- `10000` para o servidor de gRPC de `node 1`, `20000` para o servidor de GRPC de `node 2`, etc.
- `10001` para o servidor de libp2p de `node 1`, `20001` para o servidor de libp2p de `node 2`, etc.
- `10002` para o servidor JSON-RPC de `node 1`, `20002` para o servidor JSON-RPC de `node 2`, etc.

Para executar o **primeiro** cliente (observe a porta `10001` desde que ela foi usada como parte do libp2p multiaddr na **etapa 2** junto com a ID de Nó de 1s do nó):

````bash
polygon-edge server --data-dir ./test-chain-1 --chain genesis.json --grpc-address :10000 --libp2p :10001 --jsonrpc :10002 --seal
````

Para executar o **segundo** cliente:

````bash
polygon-edge server --data-dir ./test-chain-2 --chain genesis.json --grpc-address :20000 --libp2p :20001 --jsonrpc :20002 --seal
````

Para executar o **terceiro** cliente:

````bash
polygon-edge server --data-dir ./test-chain-3 --chain genesis.json --grpc-address :30000 --libp2p :30001 --jsonrpc :30002 --seal
````

Para executar o **quarto** cliente:

````bash
polygon-edge server --data-dir ./test-chain-4 --chain genesis.json --grpc-address :40000 --libp2p :40001 --jsonrpc :40002 --seal
````

Para rever brevemente o que foi feito até agora:

* O diretório para dados de cliente foi especificado para ser **./test-chain-\***
* Os servidores GRPC foram iniciados nas portas **10000**, **20000**, **30000** e **40000**, para cada nó respetivamente
* Os servidores de libp2p foram iniciados nas portas **10001**, **20001**, **30001** e **40001**, para cada nó respetivamente
* Os servidores JSON-RPC foram iniciados nas portas **10002**, **20002**, **30002** e **40002**, para cada nó respetivamente
* O sinalizador *de vedação* significa que o nó que está a ser iniciado irá participar na selagem do bloco
* O sinalizador *chain* especifica que ficheiro de génese deve ser usado para a configuração de chain

A estrutura do ficheiro de génese é abordada na secção [Comandos CLI](/docs/edge/get-started/cli-commands).

Depois de executar os comandos anteriores, configurou uma rede Polygon Edge de 4 nós capaz de selar blocos e recuperar
da falha de um nó.

:::info Inicie o cliente usando o ficheiro config

Em vez de especificar todos os parâmetros de configuração como argumentos CLI, o cliente também pode ser iniciado usando um ficheiro config através da execução do seguinte comando:

````bash
polygon-edge server --config <config_file_path>
````
Exemplo:

````bash
polygon-edge server --config ./test/config-node1.json
````
Atualmente, suportamos e com `json`base em ficheiros de configuração, os ficheiros de configuração `yaml`de amostra podem ser encontrados **[aqui](/docs/edge/configuration/sample-config)**

:::

:::info Etapas para executar um nó não-validador

Um não-validador irá sempre sincronizar os últimos blocos recebidos do nó de validador; pode iniciar um nó não-validador executando o seguinte comando.

````bash
polygon-edge server --data-dir <directory_path> --chain <genesis_filename> --grpc-address <portNo> --libp2p <portNo> --jsonrpc <portNo>
````
Por exemplo, pode adicionar o **quinto** cliente não-validador executando o seguinte comando:

````bash
polygon-edge server --data-dir ./test-chain --chain genesis.json --grpc-address :50000 --libp2p :50001 --jsonrpc :50002
````
:::

:::info Especifique o limite de preço

Um nó Polygon Edge pode ser iniciado com um **limite de preço** definido para as transações de entrada.

A unidade para o limite de preço é `wei`.

A definição de um limite de preço significa que qualquer transação processada pelo nó atual terá de ter um preço do gás **superior**
ao limite de preço definido; caso contrário, não será incluído num bloco.

O facto de obrigar a maioria dos nós a respeitar um determinado limite de preço impõe a regra de que as transações na rede
não podem estar abaixo de um determinado preço limite.

O valor predefinido para o limite de preço é `0`, o que significa que não é de todo imposto por predefinição.

Exemplo de uso do flag `--price-limit`:
````bash
polygon-edge server --price-limit 100000 ...
````

Vale a pena notar que os limites de preço **são aplicados apenas em transações não locais**, ou seja,
que o limite de preço não se aplica a transações adicionadas localmente ao nó.

:::

:::info URL WebSocket

Por predefinição, quando se executa o Polygon Edge, este gera um URL WebSocket baseado na localização da chain.
O esquema do URL `wss://` é usado para links HTTPS e o `ws://` para HTTP.

URL Localhost WebSocket:
````bash
ws://localhost:10002/ws
````
Note que o número da porta depende da porta JSON-RPC escolhida para o nó.

URL de WebSocket Edgenet:
````bash
wss://rpc-edgenet.polygon.technology/ws
````
:::



## Etapa 5: interaja com a rede polygon-edge {#step-5-interact-with-the-polygon-edge-network}

Agora que configurou pelo menos um cliente em execução, pode interagir com o blockchain usando a conta que pré-minerou acima
e especificando o URL JSON-RPC para qualquer um dos 4 nós:
- Nó 1: `http://localhost:10002`
- Nó 2: `http://localhost:20002`
- Nó 3: `http://localhost:30002`
- Nó 4: `http://localhost:40002`

Siga este guia para emitir comandos do operador para o cluster recém-construído: [como consultar informações do operador](/docs/edge/working-with-node/query-operator-info) (as portas GRPC para o cluster que construímos são `10000`/`20000`/`30000`/ `40000`para cada nó respetivamente)

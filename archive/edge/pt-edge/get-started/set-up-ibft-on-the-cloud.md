---
id: set-up-ibft-on-the-cloud
title: Configuração da nuvem
description: "Guia passo-a-passo de configuração da nuvem."
keywords:
  - docs
  - polygon
  - edge
  - cloud
  - setup
  - genesis
---

:::info Este guia destina-se a configurações mainnet ou testnet

O guia abaixo indicará como configurar uma rede Polygon Edge num fornecedor de serviços na nuvem para a configuração de produção da sua testnet ou mainnet.

Se pretende configurar uma rede Polygon Edge localmente para testar rapidamente o `polygon-edge` antes de fazer uma configuração tipo produção, consulte a página
**[Configuração Local](/docs/edge/get-started/set-up-ibft-locally)**
:::

## Requisitos {#requirements}

Consultar [Instalação](/docs/edge/get-started/installation) para instalar o Polygon Edge.

### Configurar a conectividade da VM {#setting-up-the-vm-connectivity}

Dependendo do fornecedor de serviços na nuvem que escolher, pode configurar a conectividade e as regras entre VMs usando uma firewall,
grupos de segurança ou listas de controlo de acesso.

Como a única parte do `polygon-edge` que precisa de ser exposta a outras VMs é o servidor libp2p, basta permitir
todas as comunicações entre VMs na porta `1478` padrão do libp2p.

## Visão geral {#overview}

![Configuração da nuvem](/img/edge/ibft-setup/cloud.svg)

Neste guia, o nosso objetivo é estabelecer uma rede blockchain `polygon-edge` funcional trabalhando com o [protocolo de consenso IBFT](https://github.com/ethereum/EIPs/issues/650).
A rede blockchain consistirá em 4 nós, todos eles nós de validador e, como tal, elegíveis para propor blocos e validar blocos provenientes de outros proponentes.
Cada um dos 4 nós correrá sobre a sua própria VM, já que a ideia deste guia é dar-lhe uma rede Polygon Edge totalmente funcional, mantendo as chaves privadas de validador para garantir uma configuração de rede sem confiança.

Para o conseguir, iremos guiá-lo ao longo de 4 etapas fáceis:

0. Consulte a lista de **Requisitos** mais acima
1. Gere as chaves privadas para cada um dos validadores e inicialize o diretório de dados
2. Prepare o string de conexão para que o bootnode seja colocado no `genesis.json` partilhado
3. Crie o `genesis.json` na sua máquina local e envie-o/transfira-o para cada um dos nós
4. Inicie todos os nós

:::info Número de validadores

Não há um número mínimo de nós por cluster, o que significa que são possíveis clusters com apenas 1 nó de validador.
Lembre-se de que com um cluster de um _único_ nó **não existe tolerância às falhas** nem **garantia de BFT**.

O número mínimo recomendado de nós para obter a garantia de BFT é 4 - já que num cluster de 4 nós pode ser tolerada
a falha de 1 nó, com os restantes 3 a funcionarem normalmente.

:::

## Etapa 1: inicializar as pastas de dados e gerar as chaves de validador {#step-1-initialize-data-folders-and-generate-validator-keys}

Para colocar o Polygon Edge a funcionar, é necessário inicializar as pastas de dados, em cada nó:


````bash
node-1> polygon-edge secrets init --data-dir data-dir
````

````bash
node-2> polygon-edge secrets init --data-dir data-dir
````

````bash
node-3> polygon-edge secrets init --data-dir data-dir
````

````bash
node-4> polygon-edge secrets init --data-dir data-dir
````

Cada um destes comandos imprimirá a chave de validador, a chave pública BLS e a [ID do nó](https://docs.libp2p.io/concepts/peer-id/). Irá precisar da identificação do primeiro nó para a etapa seguinte.

### Segredos de execução {#outputting-secrets}
A saída de segredos pode ser recuperada novamente, se necessário.

```bash
polygon-edge secrets output --data-dir test-chain-4
```

:::warning Não divulgue o seu diretório de dados!

Os diretórios de dados gerados acima, além de inicializarem os diretórios para reter o estado da blockchain, também geram as suas chaves privadas de validador.
**Esta chave deve ser mantida em segredo, já que o respetivo roubo poderia conceder a alguém a capacidade de se fazer passar por si como validador na rede!**

:::

## Etapa 2: preparar o string de conexão multiaddr para o bootnode {#step-2-prepare-the-multiaddr-connection-string-for-the-bootnode}

Para estabelecer com sucesso a conectividade, um nó deve saber a que servidor `bootnode` se ligar para obter
informações sobre todos os nós restantes da rede. O `bootnode` é por vezes conhecido como servidor `rendezvous` na gíria p2p.

O `bootnode` não é uma instância especial de um nó do Polygon Edge. Cada nó do Polygon Edge pode servir de `bootnode` e
cada nó do Polygon Edge precisa de ter um conjunto de bootnodes especificados, que serão contactados para fornecerem informações sobre como se conectar
com todos os restantes nós da rede.

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

Como a primeira parte do string de conexão multiaddr é o `<ip_address>`, aqui terá de inserir o endereço IP conforme acessível por outros nós; dependendo da sua configuração, este poderá ser um endereço IP privado ou público, não `127.0.0.1`.

Para a `<port>` usaremos `1478`, já que é a porta predefinida do libp2p.

Por fim, precisamos da `<node_id>`, que podemos obter da saída do comando `polygon-edge secrets init --data-dir data-dir` previamente executado (que foi usado para gerar chaves e diretórios de dados para o `node 1`)

Depois da compilação, o string de conexão multiaddr para o `node 1` que usaremos como bootnode terá o seguinte aspeto (só a `<node_id>`, que se encontra no final, deverá ser diferente):
```
/ip4/<public_or_private_ip>/tcp/1478/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW
```
Da mesma forma, construímos o multiaddr para o segundo bootnode como abaixo
```
/ip4/<public_or_private_ip>/tcp/1478/p2p/16Uiu2HAmS9Nq4QAaEiogE4ieJFUYsoH28magT7wSvJPpfUGBj3Hq
```
:::info Hostnames DNS em vez de ips

O Polygon Edge suporta o uso de hostnames DNS para a configuração dos nós. Este é um recurso muito útil para implantações baseadas na nuvem, já que o ip do nó pode mudar por vários motivos.

O formato multiaddr para o string de conexão ao usar os hostnames DNS é o seguinte:
`/dns4/sample.hostname.com/tcp/<port>/p2p/nodeid`

:::

## Etapa 3: gerar o ficheiro de génese com os 4 nós como validadores {#step-3-generate-the-genesis-file-with-the-4-nodes-as-validators}

Esta etapa pode ser executada na sua máquina local, mas precisará das chaves públicas de validador para cada um dos 4 validadores.

Os validadores podem partilhar com segurança o `Public key (address)`, como mostrado abaixo, na saída dos seus comandos `secrets init`, para que
possa gerar com segurança o genesis.json com esses validadores no conjunto inicial de validadores, identificados através das chaves públicas:

```
[SECRETS INIT]
Public key (address) = 0xC12bB5d97A35c6919aC77C709d55F6aa60436900
BLS Public key       = 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf
Node ID              = 16Uiu2HAmVZnsqvTwuzC9Jd4iycpdnHdyVZJZTpVC8QuRSKmZdUrf
```

Dado que recebeu as 4 chaves públicas dos validadores, pode executar o seguinte comando para gerar o `genesis.json`

````bash
polygon-edge genesis --consensus ibft --ibft-validator 0xC12bB5d97A35c6919aC77C709d55F6aa60436900:0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --ibft-validator <2nd validator IBFT public key>:<2nd validator BLS public key> --ibft-validator <3rd validator IBFT public key>:<3rd validator BLS public key> --ibft-validator <4th validator IBFT public key>:<4th validator BLS public key> --bootnode=<first_bootnode_multiaddr_connection_string_from_step_2> --bootnode <second_bootnode_multiaddr_connection_string_from_step_2> --bootnode <optionally_more_bootnodes>
````

O que faz este comando:

* O `--ibft-validator` define a chave pública do validador que deve ser incluído no conjunto inicial de validadores do bloco de génese. Podem existir muitos validadores iniciais.
* O `--bootnode` define o endereço do bootnode que irá permitir que os nós se encontrem.
Usaremos o string multiaddr do `node 1`, como mencionado na **etapa 2**, embora possa adicionar o número de bootnodes que quiser, como mostrado acima.

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

Depois de especificar:
1. As chaves públicas dos validadores a serem incluídas no bloco de génese como conjunto de validadores
2. Os strings de conexão multiaddr do bootnode
3. As contas e saldos pré-minerados a serem incluídos no bloco de génese

e de gerar o `genesis.json`, deve copiá-lo para todas as VMs da rede. Dependendo da sua configuração, pode
copiá-lo/colá-lo, enviá-lo para o operador de nós ou simplesmente colocá-lo no SCP/FTP.

A estrutura do ficheiro de génese é abordada na secção [Comandos CLI](/docs/edge/get-started/cli-commands).

## Etapa 4: executar todos os clientes {#step-4-run-all-the-clients}

:::note Networking nos fornecedores de serviços na nuvem

A maioria dos fornecedores de serviços na nuvem não expõe os endereços IP (especialmente, os de domínio público) como interface de rede direta na sua VM, mas configuram um proxy NAT invisível.


Para permitir que os nós se conectem entre si, neste caso, precisaria de ouvir o endereço IP `0.0.0.0` para se ligar a todas as interfaces; ainda assim, precisaria de especificar o endereço IP ou endereço DNS que os outros nós podem usar para se conectarem à sua instância. Isto é conseguido usando o argumento `--nat` ou `--dns`, onde pode especificar o seu endereço IP ou DNS externo, respetivamente.

#### Exemplo {#example}

O endereço IP associado que pretende escutar é `192.0.2.1`, mas não está diretamente ligado a nenhuma das interfaces da sua rede.

Para permitir que os nós se conectem, teria de passar os seguintes parâmetros:

`polygon-edge ... --libp2p 0.0.0.0:10001 --nat 192.0.2.1`

Ou, se pretende especificar um endereço DNS `dns/example.io`, passe os seguintes parâmetros:

`polygon-edge ... --libp2p 0.0.0.0:10001 --dns dns/example.io`

Isto faria com que o seu nó escutasse todas as interfaces, mas também se apercebesse de que os clientes se ligam a ele através do endereço `--nat` ou `--dns` especificado.

:::

Para executar o **primeiro** cliente:


````bash
node-1> polygon-edge server --data-dir ./data-dir --chain genesis.json  --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

Para executar o **segundo** cliente:

````bash
node-2> polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

Para executar o **terceiro** cliente:

````bash
node-3> polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

Para executar o **quarto** cliente:

````bash
node-4> polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

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
Atualmente, apenas oferecemos suporte ao arquivo de configuração com `json`base, o ficheiro de configuração de amostra pode ser encontrado **[aqui](/docs/edge/configuration/sample-config)**

:::

:::info Etapas para executar um nó não-validador

Um não-validador irá sempre sincronizar os últimos blocos recebidos do nó de validador; pode iniciar um nó não-validador executando o seguinte comando.

````bash
polygon-edge server --data-dir <directory_path> --chain <genesis_filename>  --libp2p <IPAddress:PortNo> --nat <public_or_private_ip>
````
Por exemplo, pode adicionar o **quinto** cliente não-validador executando o seguinte comando:

````bash
polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat<public_or_private_ip>
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

URL Edgenet WebSocket:
````bash
wss://rpc-edgenet.polygon.technology/ws
````
:::

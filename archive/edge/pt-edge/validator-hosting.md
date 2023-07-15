---
id: validator-hosting
title: Hosting de validadores
description: "Requisitos de hosting para o Polygon Edge"
keywords:
- docs
- polygon
- edge
- hosting
- cloud
- setup
- validator
---

Seguem-se sugestões para a hospedagem correta de um nó de validador numa rede Polygon Edge. Preste muita atenção a todos os itens listados abaixo para garantir
que o seu validador está devidamente configurado para ser seguro, estável e apresentar um elevado desempenho.

## Base de conhecimento {#knowledge-base}

Leia este documento com atenção antes de tentar executar o nó de validador.   
Documentos adicionais que podem ser úteis:

- [Instalação](get-started/installation)
- [Configuração da nuvem](get-started/set-up-ibft-on-the-cloud)
- [Comandos CLI](get-started/cli-commands)
- [Ficheiro config do servidor](configuration/sample-config)
- [Chaves privadas](configuration/manage-private-keys)
- [Métricas Prometheus](configuration/prometheus-metrics)
- [Gestores de segredos](/docs/category/secret-managers)
- [Backup/Recuperação](working-with-node/backup-restore)

## Requisitos de sistema mínimos {#minimum-system-requirements}

| Tipo | Valor | Influenciado por |
|------|------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|
| CPU | 2 núcleos | <ul><li>Número de consultas JSON-RPC</li><li>Tamanho do estado da blockchain</li><li>Limite de gás do bloco</li><li>Tempo do bloco</li></ul> |
| RAM | 2 GB | <ul><li>Número de consultas JSON-RPC</li><li>Tamanho do estado da blockchain</li><li>Limite de gás do bloco</li></ul> |
| Disco | <ul><li>10 GB de partição da raiz</li><li>30 GB de partição da raiz com LVM para extensão do disco</li></ul> | <ul><li>Tamanho do estado da blockchain</li></ul> |


## Configuração do serviço {#service-configuration}

O binário `polygon-edge` tem de ser executado como serviço de sistema automaticamente depois de se estabelecer a conectividade de rede e de ter as funcionalidades start / stop / restart.
 Recomendamos que seja usado um gestor de serviço como `systemd.`

Exemplo de ficheiro de configuração do sistema `systemd`:
```
[Unit]
Description=Polygon Edge Server
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=10
User=ubuntu
ExecStart=/usr/local/bin/polygon-edge server --config /home/ubuntu/polygon/config.yaml

[Install]
WantedBy=multi-user.target
```

### Binário {#binary}

Nas cargas de trabalho de produção, o binário `polygon-edge` só deve ser implantado a partir de binários de lançamento do GitHub pré-construídos - não por compilação manual.
:::info

Ao compilar manualmente o ramo Github `develop`, pode introduzir alterações de quebra de código no seu ambiente.   
Por este motivo, é recomendável implantar o binário Polygon Edge exclusivamente a partir das novas versões, pois ele
contém informações sobre alterações de quebra de código e como superá-las.

:::

Consulte a [Instalação](/docs/edge/get-started/installation) para uma visão geral completa do método de instalação.

### Armazenamento de dados {#data-storage}

A pasta `data/` com todo o estado da blockchain deve ser montada num disco/volume dedicado, permitindo
backups automáticos do disco, a extensão do volume e, opcionalmente, a montagem do disco/volume noutra instância, em caso de falha.


### Ficheiros log {#log-files}

Os ficheiros log têm de ser rodados diariamente (com uma ferramenta como `logrotate`).
:::warning

Se configurados sem rotação de log, os ficheiros log podem usar todo o espaço em disco disponível, o que pode interromper o tempo de atividade do validador.

:::

Exemplo de configuração do `logrotate`:
```
/home/ubuntu/polygon/logs/node.log
{
        rotate 7
        daily
        missingok
        notifempty
        compress
        prerotate
                /usr/bin/systemctl stop polygon-edge.service
        endscript
        postrotate
                /usr/bin/systemctl start polygon-edge.service
        endscript
}
```


Consulte a seção [Logging](#logging) abaixo para obter recomendações sobre o armazenamento do log.

### Dependências adicionais {#additional-dependencies}

`polygon-edge` é compilado estaticamente, não necessitando de dependências adicionais do sistema operativo host.

## Manutenção {#maintenance}

Seguem abaixo as melhores práticas para manter o nó de validador da rede Polygon Edge em execução

### Backup {#backup}

Existem dois tipos de procedimentos de backup recomendados para nós Polygon Edge.

A sugestão é usar ambos, sempre que possível, sendo o backup do Polygon Edge uma opção sempre disponível.

* ***Backup do volume***:    
  Backup diário incremental do volume `data/` do nó Polygon Edge ou da VM completa, se possível.


* ***Backup do Polygon Edge***:    
  É recomendado o trabalho diário do CRON, que faz backups regulares do Polygon Edge e move os ficheiros `.dat` para um local externo ou para um armazenamento seguro de objetos na nuvem.

Idealmente, o backup do Polygon Edge não se deve sobrepor ao backup do volume descrito acima.

Consulte a [Instância de backup/recuperação de nós](working-with-node/backup-restore) para obter instruções sobre como executar backups do Polygon Edge.

### Logging {#logging}

Os logs produzidos pelos nós Polygon Edge devem:
- ser enviados para um armazenamento de dados externo com capacidade de indexação e pesquisa
- ter um período de retenção de log de 30 dias

Se é a primeira vez que configura um validador Polygon Edge, recomendamos que inicie o nó
com a opção `--log-level=DEBUG` para poder depurar rapidamente quaisquer problemas que possa enfrentar.

:::info

O `--log-level=DEBUG` fará com que a saída do log do nó seja a mais prolixa possível.   
Os logs de depuração irão aumentar drasticamente o tamanho do ficheiro log, algo que deve ser considerado ao configurar
a solução de rotação do log.

:::
### Patches de segurança do sistema operativo {#os-security-patches}

Os administradores precisam de garantir que o SO da instância do validador é atualizada regularmente com os patches mais recentes, pelo menos uma vez por mês.

## Métricas {#metrics}

### Métricas do sistema {#system-metrics}

Os administradores precisam de configurar algum tipo de monitor das métricas do sistema (por exemplo: Telegraf + InfluxDB + Grafana ou um SaaS de terceiros).

Métricas que precisam de ser monitorizadas e que precisam de notificações de alarme configuradas:

| Nome da métrica | Limite do alarme |
|-----------------------|-------------------------------|
| Uso da CPU (%) | > 90% durante mais de 5 minutos |
| Utilização da RAM (%) | > 90% durante mais de 5 minutos |
| Utilização do disco raiz | > 90% |
| Utilização do disco de dados | > 90% |

### Métricas do validador {#validator-metrics}

Os administradores precisam de configurar a recolha de métricas da API Prometheus do Polygon Edge para poderem
monitorizar o desempenho da blockchain.

Consulte as [métricas Prometheus](configuration/prometheus-metrics) para entender que métricas estão a ser expostas e como configurar a recolha de métricas Prometheus.


É necessário ter uma atenção extra às seguintes métricas:
- ***Tempo de produção do bloco*** - se o tempo de produção do bloco é superior ao normal, isso significa que existe um potencial problema na rede
- ***Número de rondas de consenso*** - se existe mais do que 1 ronda, isso significa que existe um potencial problema com o conjunto de validadores da rede
- ***Número de pares*** - se o número de pares cair, isso significa que existe um problema de conectividade na rede

## Segurança {#security}

Seguem abaixo as melhores práticas para garantir o funcionamento do nó de validador da rede Polygon Edge.

### Serviços API {#api-services}

- ***JSON-RPC*** -
Único serviço API que tem de ser exposto ao público (através do load balancer ou diretamente).   
Esta API deve ser executada em todas as interfaces ou num endereço IP específico (exemplo: `--json-rpc 0.0.0.0:8545` ou `--json-prc 192.168.1.1:8545`  ).
:::info

Como esta é uma API voltada para o público, é recomendável que o load balancer/proxy reverso na sua frente ofereça segurança e limite da taxa.

:::


- ***LibP2P*** -
Esta é a API de networking usada por nós para comunicação por pares. Tem de ser executada em todas as interfaces ou num endereço IP específico
( `--libp2p 0.0.0.0:1478` ou `--libp2p 192.168.1.1:1478` ). Esta API não deve ser publicamente exposta,
mas antes acessível a todos os outros nós.
:::info

Se executada num localhost ( `--libp2p 127.0.0.1:1478` ), os outros nós não conseguirão conectar-se.

:::


- ***GRPC*** -
Esta API é usada apenas para executar comandos do operador, nada mais. Como tal, deve ser executada exclusivamente no localhost ( `--grpc-address 127.0.0.1:9632` ).

### Segredos do Polygon Edge {#polygon-edge-secrets}

Os segredos do Polygon Edge (chaves `ibft` e `libp2p`) não devem ser armazenados num sistema de ficheiros local.  
Em vez disso, deve usar um [Gestor de Segredos](configuration/secret-managers/set-up-aws-ssm) suportado.   
O armazenamento de segredos num sistema de ficheiros local só deve ser usado em ambientes de não produção.

## Atualização {#update}

Segue-se o procedimento de atualização pretendido para nós de validador, descrito como instruções passo-a-passo.

### Procedimento de atualização {#update-procedure}

- Descarregue o binário Polygon Edge mais recente a partir das [releases](https://github.com/0xPolygon/polygon-edge/releases) oficiais do GitHub
- Pare o serviço Polygon Edge (exemplo: `sudo systemctl stop polygon-edge.service` )
- Substitua o binário `polygon-edge` existente pelo que descarregou (exemplo: `sudo mv polygon-edge /usr/local/bin/` )
- Verifique se foi instalada a versão `polygon-edge` correta executando `polygon-edge version` - deve corresponder à versão de lançamento
- Consulte a documentação de lançamento para ver se existe algum passo de retrocompatibilidade que tem de seguir antes de iniciar o serviço `polygon-edge`
- Inicie o serviço `polygon-edge` (exemplo: `sudo systemctl start polygon-edge.service` )
- Por fim, verifique a saída do log `polygon-edge` e certifique-se de que está a correr sem quaisquer logs de `[ERROR]`

:::warning

Quando existe uma versão de quebra de código, este procedimento de atualização deve ser executado em todos os nós,
pois o binário atualmente em execução não é compatível com o novo lançamento.

Isto significa que a chain tem de ser interrompida por um período de tempo curto (até os binários `polygon-edge` serem substituídos e o serviço reiniciado),
logo planeie tudo corretamente.

Pode usar ferramentas como **[Ansible](https://www.ansible.com/)** ou um script personalizado para executar a atualização de forma eficiente
e minimizar o tempo de inatividade da chain.

:::

## Procedimento de inicialização {#startup-procedure}

Segue-se o fluxo pretendido para o procedimento de inicialização do validador Polygon Edge

- Leia atentamente os documentos listados na secção [Base de Conhecimento](#knowledge-base)
- Aplique os patches mais recentes do sistema operativo no nó de validador
- Descarregue o binário `polygon-edge` mais recente dos [lançamentos](https://github.com/0xPolygon/polygon-edge/releases) oficiais do GitHub e coloque-o na instância local `PATH`
- Inicialize um dos [gestores de segredos](/docs/category/secret-managers) suportados usando o comando CLI `polygon-edge secrets generate`
- Gere e armazene segredos usando o `polygon-edge secrets init` [comando CLI](/docs/edge/get-started/cli-commands#secrets-init-flags)
- Anote os valores `NodeID` e `Public key (address)`
- Gere o ficheiro `genesis.json` conforme descrito na [configuração da nuvem](get-started/set-up-ibft-on-the-cloud#step-3-generate-the-genesis-file-with-the-4-nodes-as-validators) usando o `polygon-edge genesis` [comando CLI](/docs/edge/get-started/cli-commands#genesis-flags)
- Gere o ficheiro config predefinido usando o `polygon-edge server export` [comando CLI](/docs/edge/configuration/sample-config)
- Edite o ficheiro `default-config.yaml` para acomodar o ambiente de nó de validador local (caminhos dos ficheiros, etc.)
- Crie um serviço Polygon Edge ( `systemd` ou semelhante) onde o binário `polygon-edge` executará o servidor a partir de um ficheiro `default-config.yaml`
- Inicie o servidor Polygon Edge iniciando o serviço (exemplo: `systemctl start polygon-edge` )
- Verifique a saída do log `polygon-edge` e certifique-se de que os blocos estão a ser gerados e que não existem logs de `[ERROR]`
- Verifique a funcionalidade da chain chamando um método JSON-RPC como [`eth_chainId`](/docs/edge/api/json-rpc-eth#eth_chainid)

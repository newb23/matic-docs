---
id: backup-restore
title: Backup/Recuperação de instância de nó
description: "Como fazer backup e recuperar uma instância de nó Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - instance
  - restore
  - directory
  - node
---

## Visão geral {#overview}

Este guia explica a detalhe como fazer backup e recuperar uma instância de nó Polygon Edge.
Cobre as pastas base e o que estas contêm, bem como os ficheiros que são críticos para a realização de um backup e recuperação bem-sucedidos.

## Pastas base {#base-folders}

O Polygon Edge usa o LevelDB como motor de armazenamento.
Ao iniciar um nó Polygon Edge, as seguintes subpastas são criadas no diretório de trabalho especificado:
* **blockchain** - armazena os dados da blockchain
* **trie** - armazena as árvores Merkle (dados de estado do mundo)
* **keystore** - armazena chaves privadas para o cliente. Isto inclui a chave privada libp2p e a chave privada de selagem/validador
* **consensus** - armazena qualquer informação de consenso que o cliente possa necessitar durante o trabalho. Por enquanto, armazena a *chave de validador privada* do nó

É essencial que estas pastas sejam preservadas para que a instância Polygon Edge seja executada sem problemas.

## Criar o backup de um nó em execução e recuperá-lo para um novo nó {#create-backup-from-a-running-node-and-restore-for-new-node}

Esta secção orienta-o ao longo da criação de dados de arquivo da blockchain num nó em execução e da recuperação para outra instância.

### Backup {#backup}

O comando `backup` obtém blocos de um nó em execução por gRPC e gera um ficheiro de arquivo. Se `--from` e `--to` não forem indicados no comando, este comando irá buscar blocos da génese até ao mais recente.

```bash
$ polygon-edge backup --grpc-address 127.0.0.1:9632 --out backup.dat [--from 0x0] [--to 0x100]
```

### Recuperação {#restore}

Um servidor importa blocos de um arquivo no início quando começa com um flag `--restore`. Certifique-se de que existe uma chave para o novo nó. Para saber mais sobre a importação ou geração de chaves, visite a secção [Gestores de Segredos](/docs/edge/configuration/secret-managers/set-up-aws-ssm).

```bash
$ polygon-edge server --restore archive.dat
```

## Backup/Recuperação de dados inteiros {#back-up-restore-whole-data}

Esta secção orienta-o ao longo do backup de dados, incluindo dados de estado e chave, e da recuperação para a nova instância.

### Etapa 1: parar o cliente em execução {#step-1-stop-the-running-client}

Como o Polygon Edge usa o **LevelDB** para armazenamento de dados, o nó tem de ser interrompido durante o período de backup,
pois o **LevelDB** não permite o acesso simultâneo aos ficheiros da sua base de dados.

Além disso, o Polygon Edge também faz a descarga de dados.

A etapa inicial envolve a interrupção do cliente em execução (seja por meio de um gestor de serviços ou de outro mecanismo que envia um sinal SIGINT para o processo),
para que possa desencadear 2 eventos, enquanto é encerrado graciosamente:
* Descarga de dados em execução para o disco
* Ativação do bloqueio de ficheiros DB pelo LevelDB

### Etapa 2: backup do diretório {#step-2-backup-the-directory}

Agora que cliente não está a funcionar, o diretório de dados já pode ser copiado para outro meio.
Lembre-se que os ficheiros com extensão `.key` contêm dados da chave privada que podem ser usados para representar o nó atual,
e jamais deverão ser partilhados com terceiros/desconhecidos.

:::info

Faça backup e recupere o ficheiro `genesis` gerado manualmente, para que o nó recuperado fique totalmente operacional.

:::

## Recuperação {#restore-1}

### Etapa 1: parar o cliente em execução {#step-1-stop-the-running-client-1}

Se qualquer instância do Polygon Edge estiver a ser executada, ela precisa de ser interrompida para que a etapa 2 seja bem-sucedida.

### Etapa 2: copiar o diretório de dados de backup para a pasta pretendida {#step-2-copy-the-backed-up-data-directory-to-the-desired-folder}

O diretório de dados cujo backup foi feito anteriormente pode ser copiado para a pasta pretendida assim que o cliente deixar de estar a funcionar.
Além disso, recupere o ficheiro `genesis` previamente copiado.

### Etapa 3: execute o cliente Polygon Edge enquanto especifica o diretório de dados correto {#step-3-run-the-polygon-edge-client-while-specifying-the-correct-data-directory}

Para que o Polygon Edge possa usar o diretório de dados recuperados, no lançamento, o utilizador tem de especificar o caminho para o
diretório de dados. Consulte o flag [Comandos CLI](/docs/edge/get-started/cli-commands) para informações sobre o flag `data-dir`.

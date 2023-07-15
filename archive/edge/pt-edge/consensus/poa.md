---
id: poa
title: Prova de Autoridade (PoA)
description: "Explicação e instruções sobre Prova de Autoridade."
keywords:
  - docs
  - polygon
  - edge
  - PoA
  - autorithy
---

## Visão geral {#overview}

A PoA do IBFT é o mecanismo de consenso padrão no Polygon Edge. Na PoA, os validadores são os responsáveis por criar os blocos e adicioná-los ao blockchain numa série.

Todos os validadores formam um conjunto de validadores dinâmicos, em que os validadores podem ser adicionados ou removidos do conjunto empregando um mecanismo de voto. Isso significa que os validadores podem ser aceitos ou recusados no conjunto de validadores se a maioria (51%) dos nós validadores votar por adicionar/soltar um determinado validador ao conjunto. Desta forma, validadores mal-intencionados podem ser reconhecidos e removidos da rede, enquanto os novos validadores confiáveis podem ser adicionados.

Todos os validadores se revezam em propor o próximo bloco (round-robin), e para o bloco ser validado/inserido no blockchain, uma supermaioria (mais de 2/3) dos validadores deve aprovar o bloco citado.

Além dos validadores, existem não validadores que não participam da criação dos blocos, mas participam do processo de validação de blocos.

## Como adicionar um validador ao conjunto de validadores {#adding-a-validator-to-the-validator-set}

Este guia descreve como adicionar um nó de validador novo a uma rede IBFT ativa com 4 nós de validadores.
Se precisar de ajuda para configurar a rede, consulte as seções [Configuração Local/Configuração da](/edge/get-started/set-up-ibft-on-the-cloud.md)[](/edge/get-started/set-up-ibft-locally.md) Nuvem.

### Etapa 1: Inicialize as pastas de dados para o IBFT e gere chaves de validador para o novo nó {#step-1-initialize-data-folders-for-ibft-and-generate-validator-keys-for-the-new-node}

Para se começar a executar com o IBFT no novo nó é necessário primeiro inicializar as pastas de dados e gerar as chaves:

````bash
polygon-edge secrets init --data-dir test-chain-5
````

Este comando imprimirá a chave do validador (endereço) e a ID do nó. Precisará da chave do validador (endereço) para a etapa seguinte.

### Etapa 2: Proponha um novo candidato a outros nós validadores. {#step-2-propose-a-new-candidate-from-other-validator-nodes}

Para um nó novo se tornar um validador, pelo menos 51% dos validadores precisam propô-lo.

Exemplo de como propor um novo validador (`0x8B15464F8233F718c8605B16eBADA6fc09181fC2`) do nó de validador existente no endereço grpc: 127.0.0.1:1000:

````bash
polygon-edge ibft propose --grpc-address 127.0.0.1:10000 --addr 0x8B15464F8233F718c8605B16eBADA6fc09181fC2 --bls 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --vote auth
````

A estrutura dos IBFT é coberta na secção [Comandos CLI](/docs/edge/get-started/cli-commands).

:::info A chave pública do BLS

A chave pública do BLS só é necessária se a rede estiver a ser executada com o BLS, pois a rede que não está a ser executada no `--bls` do modo BLS é desnecessária

:::

### Etapa 3: Execute o nó do cliente {#step-3-run-the-client-node}

Como, neste exemplo, estamos a tentar executar a rede com todos os nós na mesma máquina, precisamos de cautela para evitar conflitos de portas.

````bash
polygon-edge server --data-dir ./test-chain-5 --chain genesis.json --grpc-address :50000 --libp2p :50001 --jsonrpc :50002 --seal
````

Depois de buscar todos os blocos dentro do consola, notará que um novo nó está a participar da validação

````bash
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=4004
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=5 votes=0
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft: proposer calculated: proposer=0x8B15464F8233F718c8605B16eBADA6fc09181fC2 block=4004
````

:::info Promover um não validador para um validador

Naturalmente, um não validador pode se tornar um validador pelo processo de votação, mas para que ele seja incluído com sucesso no conjunto de validadores após o processo, o nó precisa ser reiniciado com o sinalizador `--seal`.

:::

## Como remover um validador do conjunto de validadores {#removing-a-validator-from-the-validator-set}

Esta operação é bastante simples. Para remover um nó de validador do conjunto de validadores, este comando precisa de ser executado para a maioria dos nós de validador.

````bash
polygon-edge ibft propose --grpc-address 127.0.0.1:10000 --addr 0x8B15464F8233F718c8605B16eBADA6fc09181fC2 --bls 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --vote drop
````

:::info A chave pública do BLS

A chave pública do BLS só é necessária se a rede estiver a ser executada com o BLS, pois a rede que não está a ser executada no `--bls` do modo BLS é desnecessária

:::

Depois que os comandos são executados, observe que o número de validadores caiu (neste exemplo de registo, de 4 para 3).

````bash
2021-12-15T19:20:51.014+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=2399 round=1
2021-12-15T19:20:51.014+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=4 votes=2
2021-12-15T19:20:51.015+0100 [INFO]  polygon.consensus.ibft.acceptState: we are the proposer: block=2399
2021-12-15T19:20:51.015+0100 [INFO]  polygon.consensus.ibft: picked out txns from pool: num=0 remaining=0
2021-12-15T19:20:51.015+0100 [INFO]  polygon.consensus.ibft: build block: number=2399 txns=0
2021-12-15T19:20:53.002+0100 [INFO]  polygon.consensus.ibft: state change: new=ValidateState
2021-12-15T19:20:53.009+0100 [INFO]  polygon.consensus.ibft: state change: new=CommitState
2021-12-15T19:20:53.009+0100 [INFO]  polygon.blockchain: write block: num=2399 parent=0x768b3bdf26cdc770525e0be549b1fddb3e389429e2d302cb52af1722f85f798c
2021-12-15T19:20:53.011+0100 [INFO]  polygon.blockchain: new block: number=2399 hash=0x6538286881d32dc7722dd9f64b71ec85693ee9576e8a2613987c4d0ab9d83590 txns=0 generation_time_in_sec=2
2021-12-15T19:20:53.011+0100 [INFO]  polygon.blockchain: new head: hash=0x6538286881d32dc7722dd9f64b71ec85693ee9576e8a2613987c4d0ab9d83590 number=2399
2021-12-15T19:20:53.011+0100 [INFO]  polygon.consensus.ibft: block committed: sequence=2399 hash=0x6538286881d32dc7722dd9f64b71ec85693ee9576e8a2613987c4d0ab9d83590 validators=4 rounds=1 committed=3
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft: state change: new=AcceptState
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=2400 round=1
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=3 votes=0
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft: proposer calculated: proposer=0xea21efC826F4f3Cb5cFc0f986A4d69C095c2838b block=2400
````

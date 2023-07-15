---
id: query-operator-info
title: Consulta de informações sobre o operador
description: "Como consultar informações sobre o operador."
keywords:
  - docs
  - polygon
  - edge
  - node
  - query
  - operator
---

## Pré-requisitos {#prerequisites}

Este guia assume que seguiu a [Configuração Local](/docs/edge/get-started/set-up-ibft-locally) ou o [guia sobre como configurar um cluster IBFT na nuvem](/docs/edge/get-started/set-up-ibft-on-the-cloud).

É necessário um nó em funcionamento para consulta de qualquer tipo de informações sobre o operador.

Com o Polygon Edge, os operadores de nós têm tudo sob controlo e sabem o que está a fazer o nó que eles operam.<br />
Em qualquer momento, eles podem usar a camada de informações sobre os nós no gRPC e obter informações significativas - sem necessitar de filtrar os logs.

:::note

Se o seu nó não estiver a ser executado em `127.0.0.1:8545`, deve adicionar um flag `--grpc-address <address:port>` aos comandos listados neste documento.

:::

## informações sobre os pares {#peer-information}

### Lista de pares {#peers-list}

Para obter uma lista completa de pares conectados (incluindo o próprio nó em execução), execute o seguinte comando:
````bash
polygon-edge peers list
````

Este retornará uma lista de endereços libp2p que são atualmente pares do cliente em execução.

### Estado dos pares {#peer-status}

Para o estado de um par específico, execute:
````bash
polygon-edge peers status --peer-id <address>
````
Sendo que o parâmetro *address* é o endereço libp2p do par.

## Informações sobre o IBFT {#ibft-info}

Muitas vezes, um operador pode querer conhecer o estado do nó em funcionamento no consenso IBFT.

Felizmente, o Polygon Edge oferece uma maneira fácil de encontrar esta informação.

### Snapshots {#snapshots}

A execução do comando a seguir retorna o snapshot mais recente.
````bash
polygon-edge ibft snapshot
````
Para consultar o snapshot a uma altura específica (número do bloco), o operador pode executar:
````bash
polygon-edge ibft snapshot --num <block-number>
````

### Candidatos {#candidates}

Para obter as informações mais recentes sobre candidatos, o operador pode executar:
````bash
polygon-edge ibft candidates
````
Este comando consulta o conjunto atual de candidatos propostos, bem como os candidatos que ainda não foram incluídos

### Estado {#status}

O comando que se segue retorna a chave de validador atual do cliente IBFT em execução:
````bash
polygon-edge ibft status
````

## Pool de transações {#transaction-pool}

Para encontrar o número atual de transações na pool de transações, o operador pode executar:
````bash
polygon-edge txpool status
````

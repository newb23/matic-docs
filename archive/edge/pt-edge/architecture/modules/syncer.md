---
id: syncer
title: Syncer
description: Explicação para o módulo syncer do Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - synchronization
---

## Visão geral {#overview}

 Este módulo contém a lógica do protocolo de sincronização. Ele usado para sincronizar um nó novo com a rede em execução ou validar/inserir novos blocos para os nós que não participam do consenso (não são validadores).

O Polygon Edge usa o **libp2p** como camada de rede e executa o **gRPC** sobre ele.

Existem basicamente dois tipos de sincronização no Polygon Edge:
* Sincronização em massa: sincroniza uma grande variedade de blocos de uma só vez
* Sincronização de relógios: sincroniza por blocos

### Sincronização em massa {#bulk-sync}

Os passos para conseguir obter uma sincronização em massa são bastante simples: sincronize o máximo de blocos possível (disponíveis) do outro par para alcançá-lo o mais rápido possível.

Este é o fluxo do processo de sincronização em massa:

1. ** Determine se o nó precisa de sincronização em massa ** - Nesta etapa, o nó verifica o mapa de pares para ver se há alguém com um número de blocos maior do que o número que o nó possui localmente
2. ** Encontre o melhor par (usando o mapa de pares de sincronização) ** -  Nesta etapa, o nó encontra o melhor par para sincronizar conforme os critérios mencionados no exemplo acima.
3. ** Abra um fluxo de sincronização em massa ** - Nesta etapa, o nó abre um fluxo de gRPC para o melhor par com o objetivo de obter blocos de sincronização em massa do número de blocos comum.
4. ** O melhor par fecha o fluxo após concluir o envio em massa ** - Nesta etapa, o melhor par com que o nó está a sincronizar vai fechar o fluxo assim que conclui o envio de todos os blocos disponíveis que ele possui
5. ** Ao concluir a sincronização em massa, verifique se o nó é um validador ** - Nesta etapa, o fluxo é fechado pelo melhor par, e o nó precisa verificar se é um validador após a sincronização em massa.
  * Se for, ele sai do estado de sincronização e começa a participar do consenso
  * Se não for, ele prossegue para uma ** Sincronização de relógios **

### Sincronização de relógios {#watch-sync}

:::info
A etapa para a sincronização de relógios só é executada se o nó não for um validador, mas um nó comum não validador da rede, que apenas escuta os blocos recebidos.

:::

O comportamento da sincronização de relógios é bastante simples. O nó já está sincronizado com o resto da rede e só precisa analisar os novos blocos que estão a chegar.

Este é o fluxo do processo de sincronização de relógios:

1. ** Adicione um novo bloco quando o status de um par for atualizado ** - Nesta etapa, os nós escutam os eventos dos novos blocos. Quando chega um novo bloco, ele executa uma chamada de função de gRPC, recebe o bloco e atualiza o estado local.
2. ** Verifique se o nó é um validador após a sincronização do último bloco **
   * Se for, saia do estado de sincronização
   * Se não for, continue a ouvir os eventos dos novos blocos

## Relatório de desempenho {#perfomance-report}

:::info
O desempenho foi medido numa máquina local sincronizando um ** milhão de blocos **
:::

| Nome | Resultado |
|----------------------|----------------|
| Sincronização de 1 milhão de blocos | ~ 25 minutos |
| Transferência de 1 milhão de blocos | ~ 1 minuto |
| Número de chamadas de GRPC | 2 |
| Cobertura de teste | ~ 93% |
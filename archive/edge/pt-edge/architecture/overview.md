---
id: overview
title: Visão geral da arquitetura
sidebar_label: Overview
description: Introdução à arquitetura do Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - modular
  - layer
  - libp2p
  - extensible
---

Partimos da ideia de criar um software que fosse *modular*.

Essa característica está presente em quase todas as partes do Polygon Edge. Abaixo, temos uma breve visão geral da
arquitetura construída e das suas camadas.

## Camadas do Polygon Edge {#polygon-edge-layering}

![Arquitetura do Polygon Edge](/img/edge/Architecture.jpg)

## Libp2p {#libp2p}

Tudo começa na camada de rede de base, que utiliza o **libp2p**. Decidimos adotar esta tecnologia porque ela
se encaixa bem nas filosofias de design do Polygon Edge. Libp2p é:

- Modular
- Extensível
- Rápida

Mais importante, ela fornece uma ótima base para recursos mais avançados, que cobriremos posteriormente.


## Sincronização e Consenso {#synchronization-consensus}
A separação dos protocolos de sincronização e consenso permite a modularidade e implementação de mecanismos de sincronização e consenso **personalizados**, dependendo de como o cliente está a ser executado.

O Polygon Edge foi projetado para oferecer algoritmos de consenso disponíveis e conectáveis.

A lista atual de algoritmos de consenso aceitos:

* IBFT PoA
* IBFT PoS

## Blockchain {#blockchain}
A camada de blockchain é a camada central que coordena tudo no sistema do Polygon Edge. Ele é coberto em profundidade na seção *Módulos* correspondente.

## Estado {#state}
A camada interna de Estado contém a lógica de transição do estado. Ela gerencia as mudanças de estado quando um novo bloco é incluído. Ele é coberto em profundidade na seção *Módulos* correspondente.

## JSON RPC {#json-rpc}
A camada de RPC do JSON é uma camada dApp que os programadores do dApp usam para interagir com blockchains. Ele é coberto em profundidade na seção *Módulos* correspondente.

## TxPool {#txpool}
A camada de TxPool representa o pool de transações e está intimamente ligada a outros módulos do sistema, pois as transações podem ser adicionadas a partir de múltiplos pontos de entrada.

## GRPC {#grpc}
gRPC ou chamada de procedimento remoto do Google, é um framework RPC de código aberto robusto que o Google criou inicialmente para criar APIs escaláveis e rápidas. A camada de GRPC é vital para as interações do operador. Através dela, os operadores de nós podem interagir facilmente com o cliente e fornecer uma interface de utilizador agradável.

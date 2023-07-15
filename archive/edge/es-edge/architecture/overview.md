---
id: overview
title: Descripción general de la arquitectura
sidebar_label: Overview
description: Introducción a la arquitectura de Polygon Edge
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

Comenzamos con la idea de crear software *modular*.

Eso está presente en casi todas las partes de Polygon Edge. Más adelante, encontrarás una breve descripción general de la
arquitectura integrada y sus capas.

## Capas de Polygon Edge {#polygon-edge-layering}

![Arquitectura de Polygon Edge](/img/edge/Architecture.jpg)

## Libp2p {#libp2p}

Todo comienza en la capa de redes base, la cual utiliza **libp2p**. Optamos por esta tecnología porque
encaja con las filosofías de diseño de Polygon Edge. Libp2p es:

- Modular
- Ampliable
- Rápido

Lo más importante es que proporciona una base excelente para características más avanzadas, acerca de las cuales hablaremos más adelante.


## Sincronización y consenso {#synchronization-consensus}
La separación de los protocolos de sincronización y consenso permite la modularidad e implementación de mecanismos **personalizados** de sincronización y consenso, en función de cómo se está ejecutando el cliente.

Polygon Edge está diseñado para ofrecer algoritmos de consenso conectables y disponibles de inmediato.

La lista actual de algoritmos de consenso admitidos:

* Prueba de autoridad (PoA) tolerante a falla bizantina de Estambul (IBFT)
* Prueba de participación (PoS) IBFT

## Cadena de bloques {#blockchain}
La capa de la cadena de bloques es la capa central que coordina todo en el sistema de Polygon Edge. La sección correspondiente de *Módulos* profundiza sobre ella.

## Estado {#state}
La capa interna Estado contiene la lógica de las transiciones de estado. Se ocupa de cómo cambia el estado cuando se incluye un bloque nuevo. La sección correspondiente de *Módulos* profundiza sobre ella.

## RPC JSON {#json-rpc}
La capa de RPC JSON es la capa de la API que los desarrolladores de aplicaciones descentralizadas usan para interactuar con la cadena de bloques. La sección correspondiente de *Módulos* profundiza sobre ella.

## TxPool {#txpool}
La capa TxPool representa el grupo de transacciones y está estrechamente vinculada con otros módulos en el sistema, ya que se pueden agregar transacciones desde múltiples puntos de entrada.

## grpc {#grpc}
 o llamada de procedimiento remoto de Google, es un sólido marco de código abierto que creó inicialmente para crear API escalables y rápidas. La capa GRPC es vital para las interacciones de los operadores. A través de ella, los operadores de nodos pueden interactuar fácilmente con el cliente y proporcionar una experiencia del usuario agradable.

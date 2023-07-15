---
id: syncer
title: Sincronizador
description: Explicación del módulo sincronizador de Polygon Edge
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - synchronization
---

## Descripción general {#overview}

Este módulo contiene la lógica del protocolo de sincronización. Se utiliza para sincronizar un nodo nuevo con la red en ejecución, o para validar o insertar nuevos bloques para los nodos que no participan en el consenso (no validadores).

Polygon Edge utiliza **libp2p** como capa de interconexión y, además, ejecuta **gRPC**.

Esencialmente, hay dos tipos de sincronización en Polygon Edge:
* Bulk Sync (Sincronización en volumen): sincronización de una gran variedad de bloques al mismo tiempo
* Sincronización de observación: sincronización por bloques

### Sincronización en volumen {#bulk-sync}

Los pasos para la sincronización en volumen son bastante sencillos para adaptarse al objetivo de sincronizar en volumen: la sincronización de tantos bloques como sea posible (disponibles) de los demás pares, para ponerse al día lo más rápidamente posible.

Este es el flujo del proceso de sincronización en volumen:

1. ** Determina si el nodo necesita sincronización en volumen **: en este paso, el nodo revisa el mapa de pares para ver si hay alguien con más bloques de los que tiene el nodo localmente.
2. ** Busca el mejor par (con el mapa de pares de sincronización) **: en este paso, el nodo busca el mejor par con el cual sincronizarse, con base en los criterios mencionados en el ejemplo anterior.
3. ** Abre una secuencia de sincronización en volumen **: en este paso, el nodo le abre una secuencia de gRPC al mejor par para sincronizar en volumen los bloques desde el número de bloques común.
4. ** El mejor par cierra la secuencia cuando completa el envío en volumen **: en este paso, el mejor par del nodo se sincroniza con el que cerrará la secuencia tan pronto como envíe todos los bloques que tenga disponibles.
5. ** Cuando culmina la sincronización en volumen, revisa si el nodo es validador **: en este paso, el mejor par cierra la secuencia y, después de la sincronización en volumen, el nodo debe revisar si son validadores.
  * Si lo son, salen del estado de sincronización y empiezan a participar en el consenso.
  * Si no lo son, siguen con la ** Sincronización por observación **

### Sincronización por observación {#watch-sync}

:::info

El paso de sincronización por observación solo se ejecuta si el nodo no es un validador, sino un nodo regular no validador en la red que solo escucha bloques entrantes.

:::

El comportamiento de la sincronización por observación es bastante sencillo: el nodo ya está sincronizado con el resto de la red y solo debe analizar los bloques nuevos que entran.

Este es el flujo del proceso de sincronización por observación:

1. ** Añade un bloque nuevo cuando se actualiza el estado de un par **:eEn este paso, los nodos escuchan los eventos de los nuevos bloques. Cuando tiene un bloque nuevo, ejecuta una llamada de función gRPC, obtiene el bloque y actualiza el estado local.
2. ** Revisa si el nodo es validador después de sincronizar el bloque más reciente **
   * Si lo es, sale del estado de sincronización.
   * Si no lo es, continúa escuchando eventos de bloques nuevos.

## Informe de rendimiento {#perfomance-report}

:::info

El rendimiento se midió en una máquina local sincronizando ** un millón de bloques **

:::

| Nombre | Resultado |
|----------------------|----------------|
| Sincronización de un millón de bloques | ~ 25 minutos |
| Transferencia de un millón de bloques | ~ 1 minuto |
| Número de llamadas de GRPC | 2 |
| Cobertura de la prueba | ~ 93 % |
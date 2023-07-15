---
id: query-operator-info
title: Consulta la información del operador
description: "Cómo consultar la información del operador"
keywords:
  - docs
  - polygon
  - edge
  - node
  - query
  - operator
---

## Prerrequisitos {#prerequisites}

Esta guía asume que has seguido la [configuración local](/docs/edge/get-started/set-up-ibft-locally) o la [guía sobre cómo configurar un grupo IBFT en la nube](/docs/edge/get-started/set-up-ibft-on-the-cloud).

Se necesita un nodo que funcione para poder consultar cualquier tipo de información del operador.

Con Polygon Edge, los operadores de los nodos tienen el control y están informados de qué hace el nodo que están operando.<br />
En todo momento, pueden utilizar la capa de información del nodo, construida sobre gRPC, y obtener información significativa, sin necesidad de filtrar los registros.

:::note

Si tu nodo no se está ejecutando en `127.0.0.1:8545` deberías añadirle una marca `--grpc-address <address:port>`a los comandos que aparecen en este documento.

:::

## Información del par {#peer-information}

### Lista de pares {#peers-list}

Para obtener una lista completa de los pares conectados (incluyendo el propio nodo en ejecución), ejecuta el siguiente comando:
````bash
polygon-edge peers list
````

Eso mostrará una lista de direcciones libp2p que actualmente son pares del cliente en ejecución.

### Estado del par {#peer-status}

Para conocer el estado de un par específico, ejecuta:
````bash
polygon-edge peers status --peer-id <address>
````
Donde el parámetro *address* (Dirección) es la dirección libp2p del par.

## Información sobre tolerancia a fallas bizantinas de Estambul (IBFT) {#ibft-info}

En muchas ocasiones, puede que un operador quiera conocer el estado del nodo en operación en el consenso IBFT.

Afortunadamente, Polygon Edge ofrece una manera fácil de encontrar esa información.

### Fotos instantáneas {#snapshots}

La ejecución del siguiente comando muestra la foto instantánea más reciente.
````bash
polygon-edge ibft snapshot
````
Para consultar la instantánea a una altura determinada (número de bloque), el operador puede ejecutar:
````bash
polygon-edge ibft snapshot --num <block-number>
````

### Candidatos {#candidates}

Para obtener la información más reciente sobre los candidatos, el operador puede ejecutar:
````bash
polygon-edge ibft candidates
````
Este comando consulta el conjunto actual de candidatos propuestos, además de los candidatos que aún no han sido incluidos.

### Estado {#status}

El siguiente comando arroja la clave del validador actual del cliente IBFT en ejecución:
````bash
polygon-edge ibft status
````

## Grupo de transacciones {#transaction-pool}

Para conocer el número actual de transacciones en el grupo de transacciones, el operador puede ejecutar:
````bash
polygon-edge txpool status
````

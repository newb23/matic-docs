---
id: poa
title: Prueba de autoridad (PoA)
description: "Explicación e instrucciones de la prueba de autoridad."
keywords:
  - docs
  - polygon
  - edge
  - PoA
  - autorithy
---

## Descripción general {#overview}

La PoA con tolerancia a la falla bizantina de Estambul (IBFT) es el mecanismo de consenso por defecto en Polygon Edge. En las PoA, los validadores son los responsables de crear los bloques y de añadirlos a la cadena de bloques en una serie.

Todos los validadores forman un conjunto de validadores dinámicos, en el que se pueden añadir o eliminar validadores al conjunto mediante la utilización de un mecanismo de votación. Esto significa que se puede votar para que los validadores entren o salgan del conjunto de validadores si la mayoría (51 %) de los nodos validadores votan para añadir o eliminar ciertos validadores al conjunto. De esa manera, se pueden reconocer y eliminar los validadores maliciosos de la red, a la vez que se pueden añadir nuevos validadores confiables a la red.

Todos los validadores toman turnos para proponer el siguiente bloque (round-robin), y para validar o insertar el bloque en la cadena de bloques. Una supermayoría (más de dos terceras partes) de los validadores debe aprobar el bloque mencionado.

Además de los validadores, hay no validadores que no participan en la creación del bloque, pero que sí participan en el proceso de validación del bloque.

## Adición de un validador al conjunto de validadores {#adding-a-validator-to-the-validator-set}

Esta guía describe cómo añadir un nuevo nodo validador a una red IBFT activa con cuatro nodos validadores.
Si necesitas ayuda para configurar la red, consulta las secciones [de configuración local/configuración en](/edge/get-started/set-up-ibft-on-the-cloud.md)[](/edge/get-started/set-up-ibft-locally.md) la nube.

### Paso 1: inicializa las carpetas de datos para IBFT y genera claves​ de validador para el nodo nuevo {#step-1-initialize-data-folders-for-ibft-and-generate-validator-keys-for-the-new-node}

Para iniciar y ejecutar con IBFT en el nuevo nodo, primero debes inicializar las carpetas de datos y generar las claves:

````bash
polygon-edge secrets init --data-dir test-chain-5
````

Este comando imprimirá la clave del validador (dirección) y la ID del nodo. Para el siguiente paso, necesitarás la clave del validador (dirección).

### Paso 2: propón un nuevo candidato de otros nodos validadores {#step-2-propose-a-new-candidate-from-other-validator-nodes}

Para que un nodo nuevo se convierta en validador, al menos el 51 % de los validadores deben proponerlo.

Ejemplo de cómo proponer un nuevo validador (`0x8B15464F8233F718c8605B16eBADA6fc09181fC2`) del nodo validador existente en la dirección de grpc: 127.0.0.1:1000:

````bash
polygon-edge ibft propose --grpc-address 127.0.0.1:10000 --addr 0x8B15464F8233F718c8605B16eBADA6fc09181fC2 --bls 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --vote auth
````

La estructura de los comandos de IBFT se encuentra en la sección de [comandos CLI](/docs/edge/get-started/cli-commands).

:::info Clave pública de BLS

La clave pública de BLS solo es necesaria si la red se está ejecutando con BLS, para la red que no se está ejecutando en modo BLS `--bls` no es necesario

:::

### Paso 3: ejecuta el nodo cliente {#step-3-run-the-client-node}

Dado que en este ejemplo estamos tratando de ejecutar la red donde todos los nodos están en la misma máquina, debemos procurar que no haya conflictos de puertos.

````bash
polygon-edge server --data-dir ./test-chain-5 --chain genesis.json --grpc-address :50000 --libp2p :50001 --jsonrpc :50002 --seal
````

Después de traer todos los bloques, notarás que dentro de tu consola hay un nodo nuevo participando en la validación.

````bash
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=4004
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=5 votes=0
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft: proposer calculated: proposer=0x8B15464F8233F718c8605B16eBADA6fc09181fC2 block=4004
````

:::info Promoción de un no validador a un validador

Naturalmente, un no validador puede convertirse en validador mediante el proceso de votación, pero para que se incluya correctamente en el conjunto de validadores después del proceso de votación, el nodo se debe reiniciar con el indicador `--seal`.

:::

## Eliminar un validador del conjunto de validadores {#removing-a-validator-from-the-validator-set}

Esta operación es bastante simple. Para eliminar un nodo validador del conjunto de validadores, este comando se debe ejecutar para la mayoría de los nodos validadores.

````bash
polygon-edge ibft propose --grpc-address 127.0.0.1:10000 --addr 0x8B15464F8233F718c8605B16eBADA6fc09181fC2 --bls 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --vote drop
````

:::info Clave pública de BLS

La clave pública de BLS solo es necesaria si la red se está ejecutando con BLS, para la red que no se está ejecutando en modo BLS `--bls` no es necesario

:::

Después de ejecutar los comandos, observa que el número de validadores se ha reducido (en este ejemplo de registro, de 4 a 3).

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

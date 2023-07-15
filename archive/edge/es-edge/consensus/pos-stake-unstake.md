---
id: pos-stake-unstake
title: Configura y usa la prueba de participación (PoS)
description: "Participación, eliminación de participaciones y otras instrucciones relacionadas con las participaciones en subastas."
keywords:
  - docs
  - polygon
  - edge
  - stake
  - unstake
  - validator
  - epoch
---

## Descripción general {#overview}

Esta guía profundiza en cómo configurar una red de pruebas de participación con Polygon Edge, cómo invertir fondos para que los nodos
se conviertan en validadores y cómo eliminar la participación de fondos.

Se **anima encarecidamente** a leer y pasar por las secciones de [configuración local](/docs/edge/get-started/set-up-ibft-locally) y
de la [configuración de la nube](/docs/edge/get-started/set-up-ibft-on-the-cloud) antes de continuar
con esta guía de PoS. Estas secciones describen los pasos necesarios para iniciar un grupo de pruebas de autoridad (PoA) con Polygon Edge.

Actualmente, en el contrato inteligente de participación en subastas no hay límite en la cantidad de validadores que pueden invertir fondos.

## Contrato inteligente de participación en subastas {#staking-smart-contract}

El repositorio del contrato inteligente de participación en subastas se encuentra [aquí](https://github.com/0xPolygon/staking-contracts).

Este posee las secuencias de comandos necesarias, los archivos de la interfaz binaria de aplicación (ABI) y, lo más importante, el contrato inteligente de participación en subastas.

## Configuración de un grupo de nodos N {#setting-up-an-n-node-cluster}

La configuración de redes con Polygon Edge se describe en
las secciones de [configuración local](/docs/edge/get-started/set-up-ibft-locally) y
[configuración de la nube](/docs/edge/get-started/set-up-ibft-on-the-cloud).

La **única diferencia** entre configurar un grupo de PoS y PoA está en la parte de la generación de génesis.

**Al generar el archivo génesis para un grupo de PoS, se necesita un indicador adicional `--pos`**:

```bash
polygon-edge genesis --pos ...
```

## Establecimiento de la duración de una época {#setting-the-length-of-an-epoch}

Las épocas se describen en detalle en la sección de [bloques de épocas](/docs/edge/consensus/pos-concepts#epoch-blocks).

Para establecer la duración de una época para un grupo (en bloques) al generar el archivo génesis, se especifica un
indicador adicional `--epoch-size`:

```bash
polygon-edge genesis --epoch-size 50
```

Este valor especificado en el archivo génesis indica que la duración de la época debería ser de `50` bloques.

El valor por defecto del tamaño de una época (en bloques) es `100000`.

:::info Disminución de la duración de una época

Como se describe en la sección de [bloques de épocas](/docs/edge/consensus/pos-concepts#epoch-blocks),
los bloques de épocas se utilizan para actualizar los conjuntos de validadores para los nodos.

Por defecto, la duración de la época en bloques (`100000`) puede requerir mucho tiempo de espera para las actualizaciones de los conjuntos de validadores. Teniendo en cuenta que
a los bloques nuevos se les agregan ~2 s, el conjunto de validadores se demoraría ~55,5 para cambiar.

Establecer un valor inferior para la duración de la época garantiza que el conjunto de validadores se actualice con más frecuencia.

:::

## Uso de las secuencias de comandos de los contratos inteligentes de participación en subastas {#using-the-staking-smart-contract-scripts}

### Prerrequisitos {#prerequisites}

El repositorio de contratos inteligentes de participación en subastas es el proyecto Hardhat, el cual requiere NPM.

Para inicializarlo correctamente, en el directorio principal puedes ejecutar:

```bash
npm install
````

### Configuración de las secuencias de comandos de ayuda suministradas {#setting-up-the-provided-helper-scripts}

Las secuencias de comandos para interactuar con el contrato inteligente de participación en subastas desplegado se ubican en
el [repositorio de contratos inteligentes de participación en subastas](https://github.com/0xPolygon/staking-contracts).

Crea un archivo `.env` con los siguientes parámetros en la ubicación del repositorio de contratos inteligentes:

```bash
JSONRPC_URL=http://localhost:10002
PRIVATE_KEYS=0x0454f3ec51e7d6971fc345998bb2ba483a8d9d30d46ad890434e6f88ecb97544
STAKING_CONTRACT_ADDRESS=0x0000000000000000000000000000000000001001
BLS_PUBLIC_KEY=0xa..
```

Ubicaciones de los parámetros:

* **JSONRPC_URL**: la terminal de RPC JSON para el nodo en ejecución
* **PRIVATE_KEYS**: claves privadas de la dirección del participante en subastas
* **STAKING_CONTRACT_ADDRESS**: la dirección del contrato inteligente de participación en subastas (
por defecto `0x0000000000000000000000000000000000001001`)
* **BLS_PUBLIC_KEY**: la clave pública de BLS del participante Solo se necesita si la red se está ejecutando con BLS.

### Inversión de fondos en subastas {#staking-funds}

:::info Dirección de la participación en subastas

El contrato inteligente de la participación en subastas se despliega en
la dirección `0x0000000000000000000000000000000000001001`.

Cualquier tipo de interacción con el mecanismo de participación en subastas se hace a través del contrato inteligente de participación en subastas en la dirección especificada.

Para conocer más sobre el contrato inteligente de participación en subastas, visita la sección del
el **[contrato inteligente de participación](/docs/edge/consensus/pos-concepts#contract-pre-deployment)** .

:::

Para volverse parte del conjunto de validadores, una dirección debe invertir cierta cantidad de fondos por encima de un umbral.

Actualmente, el umbral por defecto para convertirse en parte del conjunto de validadores es `1 ETH`.

Se puede iniciar la participación en subastas llamando al método `stake` del contrato inteligente de participación en subastas y especificar un valor `>= 1 ETH`.

Después de que el archivo `.env`, mencionado en
la [sección anterior](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts) ha sido configurado y una
cadena se ha iniciado en el modo de PoS, se puede participar en subastas con el siguiente comando en el repositorio de contratos inteligentes de participación en subastas:

```bash
npm run stake
```

La secuencia de comandos `stake` de Hardhat invierte una cantidad por defecto de `1 ETH`, que se puede cambiar modificando el archivo `scripts/stake.ts`.

Si los fondos invertidos son `>= 1 ETH`, el conjunto de validadores en el contrato inteligente de participación en subastas se actualiza y la dirección
será parte del conjunto de validadores a partir de la siguiente época.

:::info Registro de las claves de BLS

Si la red se está ejecutando en modo BLS, para que los nodos se conviertan en validadores, deben registrar sus claves públicas de BLS después de participar en subastas.

Eso se puede hacer con el siguiente comando:

```bash
npm run register-blskey
```
:::

### Desinversión de fondos {#unstaking-funds}

Las direcciones que tienen participaciones en subastas solo pueden **desinvertir todos sus fondos** a la vez.

Después de que el archivo `.env`, mencionado en
la [sección anterior](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts)
ha sido configurado y se ha iniciado una cadena en modo de PoS, se pueden eliminar las participaciones con el siguiente comando en el
repositorio de contratos inteligentes de participación en subastas:

```bash
npm run unstake
```

### Búsqueda de la lista de los participantes {#fetching-the-list-of-stakers}

Todas las direcciones que invierten fondos se guardan en el contrato inteligente de participación en subastas.

Después de que el archivo `.env`, mencionado en
la [sección anterior](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts)
ha sido configurado y se ha iniciado una cadena en el modo de PoS, se puede traer la lista de validadores con
el siguiente comando en el repositorio de contratos inteligentes de participación en subastas:

```bash
npm run info
```

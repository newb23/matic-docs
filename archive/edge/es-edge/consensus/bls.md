---
id: bls
title: BLS
description: "Explicación e instrucciones con respecto al modo Boneh–Lynn–Shacham (BLS)"
keywords:
  - docs
  - polygon
  - edge
  - bls
---

## Descripción general {#overview}

BLS también conocido como Boneh–Lynn–Shacham (BLS)) es un esquema de firma criptográfica que permite a un usuario verificar que un firmador es auténtico. Es un esquema de firma que puede agregar varias firmas. BLS se utiliza en Polygon Edge por defecto para dar más seguridad en el modo de consenso de tolerancia a fallas bizantinas de Estambul (IBFT). BLS puede agregarle firmas a un solo grupo de bytes y reducir el tamaño del encabezado de los bloques. Cada cadena puede elegir si utilizará BLS. La clave del algoritmo digital de firma de curva elíptica (ECDSA) se utiliza independientemente de si el modo BLS está habilitado.

## Presentación en vídeo {#video-presentation}

[![bls - vídeo](https://img.youtube.com/vi/HbUmZpALlqo/0.jpg)](https://www.youtube.com/watch?v=HbUmZpALlqo)

## Cómo configurar una cadena nueva con BLS {#how-to-setup-a-new-chain-using-bls}

Consulta las secciones de [configuración local](/docs/edge/get-started/set-up-ibft-locally) y de[ configuración de la nube](/docs/edge/get-started/set-up-ibft-on-the-cloud) para obtener instrucciones detalladas de instalación.

## Cómo migrar de una cadena con pruebas de autoridad (PoA) de ECDSA existente a la cadena de PoA de BLS {#how-to-migrate-from-an-existing-ecdsa-poa-chain-to-bls-poa-chain}

Esta sección describe cómo utilizar el modo BLS en una cadena de PoA existente.
Los siguientes pasos son necesarios para habilitar BLS en una cadena de PoA.

1. Detener todos los nodos
2. Generar las claves de BLS para los validadores
3. Agregarle un ajuste de bifurcación a genesis.json
4. Reiniciar todos los nodos

### 1. Detén todos los nodos {#1-stop-all-nodes}

Finaliza todos los procesos de los validadores presionando Ctrl + c (Control + c). Recuerde la altura de bloque más reciente (el número de secuencia más alto en el registro comprometido del bloque).

### 2. Genera la clave de BLS {#2-generate-the-bls-key}

`secrets init` con `--bls` genera una clave de BLS. Para mantener la clave de red y ECDSA existentes y añadir una nueva clave de BLS, se deben desactivar `--ecdsa` y `--network`.

```bash
polygon-edge secrets init --bls --ecdsa=false --network=false

[SECRETS INIT]
Public key (address) = 0x...
BLS Public key       = 0x...
Node ID              = 16...
```

### 3. Añade un ajuste de bifurcación {#3-add-fork-setting}

El comando `ibft switch` añade un ajuste de bifurcación, el cual habilita BLS en la cadena existente, en `genesis.json`.

Para redes con PoA, se deben suministrar los validadores en el comando. Al igual que con el modo de comando `genesis`, se pueden utilizar los indicadores `--ibft-validators-prefix-path` o `--ibft-validator` para especificar el validador.

Especifica la altura desde la que comienza la cadena mediante el uso de BLS con el indicador `--from`.

```bash
polygon-edge ibft switch --chain ./genesis.json --type PoA --ibft-validator-type bls --ibft-validators-prefix-path test-chain- --from 100
```

### 4. Reinicia todos los nodos {#4-restart-all-nodes}

Reinicia todos los nodos con el comando `server`. Después de crear el bloque en `from`, especificado en el paso anterior, la cadena habilita el BLS y muestra los registros así:

```bash
2022-09-02T11:45:24.535+0300 [INFO]  polygon.ibft: IBFT validation type switched: old=ecdsa new=bls
```

Además, los registros muestran qué modo de verificación se utiliza para generar cada bloque después de crear el bloque.

```
2022-09-02T11:45:28.728+0300 [INFO]  polygon.ibft: block committed: number=101 hash=0x5f33aa8cea4e849807ca5e350cb79f603a0d69a39f792e782f48d3ea57ac46ca validation_type=bls validators=3 committed=3
```

## Cómo migrar de una cadena con PoS de ECDSA existente a la cadena con PoS de BLS {#how-to-migrate-from-an-existing-ecdsa-pos-chain-to-a-bls-pos-chain}

Esta sección describe cómo utilizar el modo BLS en una cadena de PoS existente.
Los siguientes pasos son necesarios para habilitar BLS en la cadena de PoS.

1. Detener todos los nodos
2. Generar las claves de BLS para los validadores
3. Agregarle un ajuste de bifurcación a genesis.json
4. Llamar al contrato de participación en subastas para registrar la clave pública de BLS
5. Reiniciar todos los nodos

### 1. Detén todos los nodos {#1-stop-all-nodes-1}

Finaliza todos los procesos de los validadores presionando Ctrl + c (Control + c). Recuerde la altura de bloque más reciente (el número de secuencia más alto en el registro comprometido del bloque).

### 2. Genera la clave de BLS {#2-generate-the-bls-key-1}

`secrets init` con la indicación `--bls` generan la clave de BLS. Para mantener la clave de red y ECDSA existentes y añadir una nueva clave de BLS, se deben desactivar `--ecdsa` y `--network`.

```bash
polygon-edge secrets init --bls --ecdsa=false --network=false

[SECRETS INIT]
Public key (address) = 0x...
BLS Public key       = 0x...
Node ID              = 16...
```

### 3. Añade un ajuste de bifurcación {#3-add-fork-setting-1}

El comando `ibft switch` añade un ajuste de bifurcación, el cual habilita BLS desde el centro de la cadena, a `genesis.json`.

Especifica la altura desde la que la cadena comienza a usar el modo BLS con el indicador `from` y la altura en la que el contrato se actualiza con la indicación `development`.

```bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --ibft-validator-type bls --deployment 50 --from 200
```

### 4. Registra la clave pública de BLS en el contrato de participación en subastas {#4-register-bls-public-key-in-staking-contract}

Después de que se añade la bifurcación y los validadores se reinician, cada validador debe llamar a `registerBLSPublicKey` en el contrato de participación en subastas para registrar la clave pública de BLS. Eso se debe hacer después de la altura especificada en `--deployment` y antes de la altura especificada en `--from`.

La secuencia de comandos para registrar la clave pública de BLS se define en el [repositorio de contratos inteligentes de participación en subastas](https://github.com/0xPolygon/staking-contracts).

Establece que `BLS_PUBLIC_KEY` se registre en el archivo `.env`. Consulta [PoS de participación y eliminación de participación en subastas](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts) para obtener más información acerca de los otros parámetros.

```env
JSONRPC_URL=http://localhost:10002
STAKING_CONTRACT_ADDRESS=0x0000000000000000000000000000000000001001
PRIVATE_KEYS=0x...
BLS_PUBLIC_KEY=0x...
```

El siguiente comando registra la clave pública de BLS suministrada en `.env` al contrato.

```bash
npm run register-blskey
```

:::warning Los validadores deben registrar la clave pública de BLS manualmente.

En el modo BLS, los validadores deben tener su propia dirección y la clave pública de BLS. La capa de consenso ignora los validadores que no han registrado la clave pública de BLS en el contrato cuando el consenso trae la información del validador desde el contrato.

:::

### 5. Reinicia todos los nodos {#5-restart-all-nodes}

Reinicia todos los nodos con el comando `server`. La cadena habilita el BLS después de crear el bloque en `from`, especificado en el paso anterior.

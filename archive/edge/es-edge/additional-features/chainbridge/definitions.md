---
id: definitions
title: Definiciones generales
description: Definiciones generales de los términos utilizados en Chain Bridge
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---


## Repetidor {#relayer}
Chainbridge es un puente de tipo repetidor. El papel de un repetidor es votar por la ejecución de una solicitud (cuántos tokens quemar o liberar, por ejemplo).
Este monitorea los eventos de cada cadena y vota a favor de una propuesta en el contrato de puente de la cadena de destino cuando recibe un evento `Deposit` de una cadena. Un repetidor llama a un método en el contrato del puente para ejecutar la propuesta después de enviar el número de votos requerido. El puente delega la ejecución en el contrato del manejador (Handler).


## Tipos de contratos {#types-of-contracts}
En ChainBridge, hay tres tipos de contratos en cada cadena denominados Bridge (puente), Handler (manejador) y Target (meta).

| **Tipo** | **Descripción** |
|----------|-------------------------------------------------------------------------------------------------------------------------------|
| Contrato de puente | Es necesario desplegar en cada cadena un contrato de puente que gestione las solicitudes, los votos y las ejecuciones. Para iniciar una transferencia, los usuarios llamarán a `deposit` en el puente y este delega el proceso en el contrato manejador correspondiente al contrato meta. Cuando el contrato manejador ha logrado llamar al contrato meta, el contrato de puente emite un evento `Deposit` para notificar a los repetidores. |
| Contrato manejador | Este contrato interactúa con el contrato meta para ejecutar un depósito o una propuesta. Este valida la solicitud del usuario, llama al contrato meta y ayuda con algunos ajustes para el contrato meta. Hay ciertos contratos manejadores para llamar a cada contrato meta que tiene una interfaz diferente. Las llamadas indirectas del contrato manejador hacen que el puente habilite la transferencia de cualquier tipo de activos o datos. Actualmente, hay tres tipos de contratos manejadores implementados por ChainBridge: ERC20Handler, ERC721Handler y GenericHandler. |
| Contrato meta | Un contrato que gestiona los activos que se intercambian o los mensajes que se transfieren entre cadenas. La interacción con este contrato se hará desde cada lado del puente. |

<div style={{textAlign: 'center'}}>

![Arquitectura de ChainBridge](/img/edge/chainbridge/architecture.svg)
*Arquitectura de ChainBridge*

</div>

<div style={{textAlign: 'center'}}>

![Flujo de trabajo de la transferencia de un token ERC-20](/img/edge/chainbridge/erc20-workflow.svg)
*ejemplo de Flujo de trabajo de la transferencia de un token ERC-20*

</div>

## Tipos de cuentas {#types-of-accounts}

Por favor, asegúrate de que las cuentas tengan suficientes tokens nativos para crear transacciones antes de empezar. En Polygon Edge, puedes asignar saldos preminados a las cuentas al generar el bloque de génesis.

| **Tipo** | **Descripción** |
|----------|-------------------------------------------------------------------------------------------------------------------------------|
| Administrador | A esta cuenta se le asignará el rol de administrador por defecto. |
| Usuario | La cuenta del emisor o receptor que envía o recibe los activos. La cuenta del emisor paga las tarifas de gas al aprobar las transferencias de token y al llamar al depósito en el contrato de puente para iniciar una transferencia. |

:::info El rol de administrador

Ciertas acciones solo pueden ser realizadas por la cuenta con rol de administrador. Por defecto, el desplegador del contrato de puente tiene el rol de administrador. A continuación encontrarás cómo otorgarle el rol de administrador a otra cuenta o eliminarlo.

### Añade el rol de administrador {#add-admin-role}

Añade un administrador

```bash
# Grant admin role
$ cb-sol-cli admin add-admin \
  --url [JSON_RPC_URL] \
  --privateKey [PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --admin "[NEW_ACCOUNT_ADDRESS]"
```
### Revoca el rol de administrador {#revoke-admin-role}

Elimina un administrador

```bash
# Revoke admin role
$ cb-sol-cli admin remove-admin \
  --url [JSON_RPC_URL] \
  --privateKey [PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --admin "[NEW_ACCOUNT_ADDRESS]"
```

## Las operaciones que permite la cuenta `admin` son las siguientes. {#account-are-as-below}

### Establecer un recurso {#set-resource}

Registrar una ID de recurso con una dirección de contrato para un manejador.

```bash
# Register new resource
$ cb-sol-cli bridge register-resource \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --resourceId "[RESOURCE_ID]" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[TARGET_CONTRACT_ADDRESS]"
```

### Hacer el contrato quemable o acuñable {#make-contract-burnable-mintable}

Establecer un contrato de token como acuñable o quemable en un manejador.

```bash
# Let contract burnable/mintable
$ cb-sol-cli bridge set-burn \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[TARGET_CONTRACT_ADDRESS]"
```

### Cancelar una propuesta {#cancel-proposal}

Cancelar la propuesta de ejecución

```bash
# Cancel ongoing proposal
$ cb-sol-cli bridge cancel-proposal \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --resourceId "[RESOURCE_ID]" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --chainId "[CHAIN_ID_OF_SOURCE_CHAIN]" \
  --depositNonce "[NONCE]"
```

### Pausar o continuar {#pause-unpause}

Pon en pausa de forma temporal los depósitos, la creación de propuestas, las votaciones y las ejecuciones de depósitos.

```bash
# Pause
$ cb-sol-cli admin pause \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]"

# Unpause
$ cb-sol-cli admin unpause \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]"
```

### Cambiar tarifa {#change-fee}

Cambiar la tarifa que se le pagará al contrato puente

```bash
# Change fee for execution
$ cb-sol-cli admin set-fee \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --fee [FEE_IN_WEI]
```

### Añadir o eliminar un repetidor {#add-remove-a-relayer}

Añadir una cuenta como nuevo repetidor o eliminar una cuenta de los repetidores

```bash
# Add relayer
$ cb-sol-cli admin add-relayer \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --relayer "[NEW_RELAYER_ADDRESS]"

# Remove relayer
$ cb-sol-cli admin remove-relayer \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --relayer "[RELAYER_ADDRESS]"
```

### Cambiar el umbral del repetidor {#change-relayer-threshold}

Cambiar el número de votos necesarios para la ejecución de una propuesta

```bash
# Remove relayer
$ cb-sol-cli admin set-threshold \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --threshold [THRESHOLD]
```
:::

## ID de la cadena {#chain-id}

El `chainId`de Chainbridge es un valor arbitrario utilizado en el puente diferenciar entre las redes de cadenas de bloques y tiene que estar en el rango de uint8. No hay que confundirlo con la ID de la cadena de la red; no son lo mismo. Es necesario que este valor sea único, pero no tiene que ser el mismo que la ID de la red.

En este ejemplo, establecemos `99`en `chainId`, porque la ID de la cadena de la red de prueba Mumbai es `80001`, que no puede representarse con un uint8.

## ID del recurso {#resource-id}

La ID de un recurso es un valor único de 32 bytes en un entorno entre cadenas, que se asocia a un determinado activo (recurso) que se transfiere entre redes.

La ID del recurso es arbitraria, pero, como una convención, normalmente el último byte contiene la ID de la cadena de origen (la red de la que procede ese activo).

## URL de RPC JSON para las pruebas de participación (PoS) de Polygon {#json-rpc-url-for-polygon-pos}

Para esta guía, utilizaremos https://rpc-mumbai.matic.today, un URL de RPC JSON público suministrada por Polygon, que puede tener límites de tráfico o de velocidad. Se utilizará únicamente para conectarse con la red de pruebas Mumbai de Polygon. Te aconsejamos que obtengas tu URL de RPC JSON a través de un servicio externo como Infura, ya que el despliegue de contratos enviará muchas consultas o solicitudes a la RPC JSON.

## Formas de procesar transferencia de tokens {#ways-of-processing-the-transfer-of-tokens}
Al transferir los tokens ERC-20 entre las cadenas, se pueden procesar en dos modos diferentes:

### Modo de bloqueo y modo de liberación {#lock-release-mode}
<b>Cadena de origen: </b>los tokens que envíes estarán bloqueados en el contrato manejador. <br/>
<b>Cadena de destino:</b> la misma cantidad de tokens que enviaste en la cadena de origen se desbloquearía y se transferiría desde el contrato manejador a la cuenta del destinatario en la cadena de destino.

### Modo de quemado o acuñación {#burn-mint-mode}
<b>Cadena de origen:</b> los tokens que envíes serán quemados.   <br/>
<b>Cadena de destino:</b> la misma cantidad de tokens que enviaste y quemaste en la cadena de origen se acuñará en la cadena de destino y se enviará a la cuenta del destinatario.

Puedes utilizar diferentes modos para cada cadena. Eso significa que se puede bloquear un token en la cadena principal mientras se acuña un token en la subcadena para su transferencia. Por ejemplo, puede tener sentido bloquear o liberar tokens si está controlada la oferta total o el calendario de acuñación. Los tokens deberían ser acuñados o quemados si el contrato en la subcadena tiene que seguir el suministro en la cadena principal.

El modo por defecto es el de bloqueo o liberación. Si quieres hacer que los tokens sean acuñables o quemables, tienes que llamar al método `adminSetBurnable`. Si quieres acuñar los tokens en la ejecución, tendrás que otorgarle un rol de `minter` al contrato manejador ERC-20.



---
id: migration-to-pos
title: Migración de PoA a PoS
description: "Cómo migrar de prueba de autoridad (PoA) a prueba de participación (PoS) y viceversa en modo IBFT "
keywords:
  - docs
  - polygon
  - edge
  - migrate
  - PoA
  - PoS
---

## Descripción general {#overview}

Esta sección te explicará la migración de PoA a PoS y viceversa en modo IBFT para un grupo en ejecución, sin tener que reiniciar la cadena de bloques.

## Cómo migrar a PoS {#how-to-migrate-to-pos}

Deberás detener todos los nodos, añadir la configuración de la bifurcación en genesis.json con el comando `ibft switch` y reiniciar los nodos.

````bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --deployment 100 --from 200
````
:::caution Cambio mientras utiliza ECDSA
Cuando se utiliza ECDSA, la `--ibft-validator-type`bandera se debe agregar al interruptor, mencionando que se utiliza ECDSA. Si no está incluido, Edge se cambiará automáticamente a BLS.

````bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --ibft-validator-type ecdsa --deployment 100 --from 200
````
:::Para cambiar a PoS, deberás especificar 2 alturas de bloques: `deployment`y . `from`es la altura para desplegar el contrato de participación y `from`es `deployment`la altura del comienzo de PoS. El contrato de participación en subastas se desplegará en la dirección `0x0000000000000000000000000000000000001001` en `deployment`, como en el caso del contrato predesplegado.

Revisa la [prueba de participación](/docs/edge/consensus/pos-concepts) para obtener más detalles sobre los contratos de participación en subastas.

:::warning Los validadores deben participar en subastas manualmente.

Cada validador debe participar después de que su contrato se despliegue en `deployment` y antes de `from` para poder ser un validador al comienzo de la PoS. Cada validador actualizará cada conjunto de validadores en el contrato de participación en subastas, al inicio de la PoS.

Para obtener más información sobre participar en este proceso, visita la **[configuración y utiliza la prueba de participación ](/docs/edge/consensus/pos-stake-unstake)**.
:::

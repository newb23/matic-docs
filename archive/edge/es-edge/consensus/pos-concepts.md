---
id: pos-concepts
title: Prueba de participación
description: "Explicación e instrucciones de la prueba de participación"
keywords:
  - docs
  - polygon
  - edge
  - PoS
  - stake
---

## Descripción general {#overview}

El objetivo de esta sección es describir mejor algunos conceptos presentes actualmente en la implementación
de la prueba de participación (PoS) en Polygon Edge.

La implementación de la prueba de participación (PoS) de Polygon Edge busca ser una alternativa a la implementación de la IBFT en la Prueba de autoridad (PoA) existente,
lo que les da a los operadores de nodos la capacidad de elegir fácilmente entre ambas opciones al iniciar la cadena.

## Características de las pruebas de participación (PoS) {#pos-features}

La lógica central de la implementación de la prueba de participación está dentro
el **[contrato inteligente de participación](https://github.com/0xPolygon/staking-contracts/blob/main/contracts/Staking.sol)**

Este contrato se predespliega cada vez que se inicia una cadena de Polygon Edge con mecanismo PoS y está disponible en la dirección
`0x0000000000000000000000000000000000001001` del bloque `0`.

### Épocas {#epochs}

Las épocas son un concepto introducido con la adición de PoS a Polygon Edge.

Se considera que una época es un marco temporal especial (en bloques) en el que un conjunto de validadores puede producir bloques.
Su duración es modificable, lo que significa que los operadores de los nodos pueden configurar la duración de una época durante la generación de génesis.

Al final de cada época se crea un _bloque de época_ y, después de ese evento, comienza una nueva época. Para conocer más acerca de
los bloques de época, consulta la sección de [bloques de época](/docs/edge/consensus/pos-concepts#epoch-blocks).

Los conjuntos de validadores se actualizan al final de cada época. Los nodos consultan al conjunto de validadores del contrato inteligente de participación en subastas
durante la creación del bloque de época y guardan los datos obtenidos en el almacenamiento local. Esta consulta y ciclo de almacenamiento
se repite al final de cada época.

Esencialmente, asegura que el contrato inteligente de participación en subastas tenga pleno control de las direcciones en el conjunto de validadores y
les deja una única responsabilidad a los nodos: consultar el contrato una vez durante una época para buscar la información
más reciente del conjunto de validadores. Eso alivia la responsabilidad de los nodos individuales de cuidar a los conjuntos de validadores.

### Participación en subastas {#staking}

Las direcciones pueden invertir fondos en el contrato inteligente de participación en subastas invocando el método `stake` y especificando un valor para
la suma invertida en la transacción:

````js
const StakingContractFactory = await ethers.getContractFactory("Staking");
let stakingContract = await StakingContractFactory.attach(STAKING_CONTRACT_ADDRESS)
as
Staking;
stakingContract = stakingContract.connect(account);

const tx = await stakingContract.stake({value: STAKE_AMOUNT})
````

Al invertir fondos en el contrato inteligente de participación en subastas, las direcciones pueden ingresar al conjunto de validadores y así pueden participar en
el proceso de producción de bloques.

:::info Umbral para participar en subastas

Actualmente, el umbral mínimo para ingresar al conjunto de validadores es invertir `1 ETH`.


:::

### Eliminar una participación {#unstaking}

Las direcciones que tienen fondos invertidos solo pueden **desinvertir todos los fondos invertidos simultáneamente**.

La eliminación de participaciones se puede invocar llamando al método `unstake`en el contrato inteligente de participación en subastas:

````js
const StakingContractFactory = await ethers.getContractFactory("Staking");
let stakingContract = await StakingContractFactory.attach(STAKING_CONTRACT_ADDRESS)
as
Staking;
stakingContract = stakingContract.connect(account);

const tx = await stakingContract.unstake()
````

Después de desinvertir sus fondos, las direcciones se eliminan del conjunto de validadores en el contrato inteligente de participación en subastas y no se
considerarán validadores durante la siguiente época.

## Bloques de época {#epoch-blocks}

Los **bloques de época** son un concepto introducido en la implementación de PoS de IBFT en Polygon Edge.

En esencia, los bloques de época son bloques especiales que **no contienen transacciones** y se producen solo al **final de una época**.
Por ejemplo, si el **tamaño** de la época está establecido en bloques, los bloques de la época se considerarán como `50`bloques `50`, `100``150`etc.

Se utilizan para representar una lógica adicional que no debería ocurrir durante la producción regular de bloques.

Lo más importante es que son una indicación al nodo de que **debe traer la información más reciente del conjunto de validadores**
del contrato inteligente de participación en subastas.

Tras actualizar el conjunto de validadores en el bloque de época, el conjunto de validadores (modificado o no)
se utiliza para los bloques `epochSize - 1` posteriores, hasta que se vuelva a actualizar extrayendo la información más reciente
del contrato inteligente de participación en subastas.

Las duraciones de las épocas (en bloques) son modificables al generar el archivo génesis mediante el uso de un indicador especial `--epoch-size`:

```bash
polygon-edge genesis --epoch-size 50 ...
```

Por defecto, en Polygon Edge, el tamaño de una época es de `100000` bloques.

## Predespliegue del contrato {#contract-pre-deployment}

Polygon Edge _predespliega_
el [contrato inteligente de participación en subastas](https://github.com/0xPolygon/staking-contracts/blob/main/contracts/Staking.sol)
durante la **generación de génesis** a la dirección `0x0000000000000000000000000000000000001001`.

Lo hace sin ejecutar la máquina virtual de Ethereum (EVM) modificando el estado de la cadena de bloques del contrato inteligente directamente, utilizando los valores de configuración
aprobados en el comando de génesis.

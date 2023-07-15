---
id: validators
title: Preguntas frecuentes sobre los validadores
description: "Preguntas frecuentes sobre los validadores de Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - FAQ
  - validators

---

## ¿Cómo agregar o quitar un validador? {#how-to-add-remove-a-validator}

### Prueba de autoridad (PoA) {#poa}
La adición o eliminación de validadores se realiza mediante votación. [Aquí](/docs/edge/consensus/poa) puedes encontrar una guía completa al respecto.

### PoS {#pos}
[Aqui](/docs/edge/consensus/pos-stake-unstake)puedes encontrar un guía sobre cómo invertir fondos, de modo que un nodo pueda convertirse en validador y sobre cómo desinvertir (eliminar el validador).

Ten en cuenta que:
- Puedes utilizar el indicador de génesis `--max-validator-count` para establecer un número máximo de participantes que pueden unirse al conjunto de validadores.
- Puedes utilizar el indicador de génesis `--min-validator-count ` para establecer el número mínimo de participantes necesarios para unirse al conjunto de validadores (`1`por defecto).
- Cuando se ha alcanzado el número máximo de validadores, no puedes añadir otro validador hasta que se elimine uno existente del conjunto (no importa si la cantidad invertida del nuevo es mayor). Si se elimina un validador, el número de validadores restantes no puede ser inferior a `--min-validator-count`.
- Existe un umbral por defecto de la unidad `1`  de la moneda de la red(gas) nativa para convertirse en validador.



## ¿Cuánto espacio en disco se recomienda para un validador? {#how-much-disk-space-is-recommended-for-a-validator}

Recomendamos comenzar con 100 G de forma conservadora, y asegurarte de que es posible escalar el disco después.


## ¿Existe límite en el número de validadores? {#is-there-a-limit-to-the-number-of-validators}

Si hablamos de limitaciones técnicas, Polygon Edge no tiene un límite explicito del número de nodos que puedes tener en una red. Puedes establecer límites de conexión (número de conexiones de entrada o salida) por cada nodo.

Si hablamos de las limitaciones prácticas, un grupo de 100 nodos tendrá menos rendimiento que un grupo de 10 nodos. Al aumentar el número de nodos en el grupo, se incrementa la complejidad de la comunicación y la sobrecarga de la red en general. Todo depende del tipo de red que utilices y del tipo de topología de red que tengas.

## ¿Cómo cambiar de Prueba de autoridad (PoA) a Prueba de participación (PoS) {#how-to-switch-from-poa-to-pos}

Prueba de autoridad (PoA) es el mecanismo de consenso por defecto. En un grupo nuevo, para cambiar a Prueba de participación (PoS) tendrás que añadir la indicación `--pos`al generar el archivo genesis. Si tienes un grupo en ejecución, [aquí](/docs/edge/consensus/migration-to-pos) puedes encontrar cómo hacer el cambio. Cualquier información que necesites sobre nuestros mecanismos de consenso y configuración se puede encontrar en nuestra [sección de consenso](/docs/edge/consensus/poa).

## ¿Cómo puedo actualizar mis nodos cuando hay un cambio súbito? {#how-do-i-update-my-nodes-when-there-s-a-breaking-change}

[Aquí](/docs/edge/validator-hosting#update) puedes encontrar una guía detallada sobre cómo hacer ese procedimiento.

## ¿Se puede configurar la cantidad mínima de participación para PoS Edge? {#is-the-minimum-staking-amount-configurable-for-pos-edge}

La cantidad mínima de participación por defecto es `1 ETH`y no es configurable.

## ¿Por qué los comandos de RPC JSON `eth_getBlockByNumber`y `eth_getBlockByHash`no arrojan la dirección del minero? {#not-return-the-miner-s-address}

El consenso utilizado actualmente en Polygon Edge es la IBFT 2.0, que, a su vez, se basa en el mecanismo de votación explicado en la PoA de Clique: [ethereum/EIPs#225](https://github.com/ethereum/EIPs/issues/225).

Al observar el EIP-225 (PoA en Clique), esta es la parte relevante que explica para qué se utiliza el `miner`(también llamado `beneficiary`):

<blockquote>
Reconvertimos los campos del encabezado ethash de la siguiente manera:
<ul>
<li><b>beneficiario o minero:</b> dirección con la que se propone modificar la lista de firmantes autorizados.</li>
<ul>
<li>Normalmente debe rellenarse con ceros y se modifica solo mientras se vota.</li>
<li>No obstante, se permiten los valores arbitrarios (incluso los que no tienen sentido, como la expulsión de los no firmantes) para evitar una complejidad adicional en las implementaciones relacionadas con la dinámica de la votación.</li>
<li> Debe rellenarse con ceros en los bloques de punto de control (Ej. transición de época). </li>
</ul>

</ul>

</blockquote>

Así, el campo `miner`se utiliza para proponer un voto para determinada dirección, no para mostrar al proponente del bloque.

La información sobre el proponente del bloque puede encontrarse recuperando la clave pública del campo Seal (Sello) del campo de datos adicionales de Estambul codificado en RLP en los encabezados del bloque.

## ¿Qué partes y valores de Genesis se pueden modificar de forma segura? {#which-parts-and-values-of-genesis-can-safely-be-modified}

:::caution

Por favor, asegúrate de crear una copia manual del archivo genesis.json existente antes de intentar editarlo. Además, toda la cadena debe ser detenida antes de editar el archivo genesis.json. Una vez que el archivo génesis se modifique, la nueva versión de este tiene que distribuir en todos los nodos no validadores y valdiator

:::

**Solo la sección de nodos de inicio del archivo génesis se puede modificar de forma segura**, donde puedes añadir o eliminar nodos de inicio de la lista.
---
id: gas
title: Preguntas frecuentes sobre el gas
description: "Preguntas frecuentes sobre el gas para Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - FAQ
  - validators

---

## ¿Cómo hacer cumplir un precio de gas mínimo? {#how-to-enforce-a-minimum-gas-price}
Puedes utilizar el indicador `--price-limit`, proporcionado en el comando del servidor. Esto hará que tu nodo solo acepte transacciones con el mismo o más gas que el límite de precio que hayas establecido. Para asegurarte de que esto se cumpla en toda la red de trabajo, debes asegurarte de que todos los nodos tengan el mismo límite de precio.


## ¿Puedes realizar transacciones con tarifas de cero gas? {#can-you-have-transactions-with-0-gas-fees}
Sí, puedes. Por defecto, el límite de precio que los nodos hacen cumplir es `0`, lo que significa que los nodos aceptarán transacciones que tengan un precio del gas establecido en `0`.

## ¿Cómo establecer el suministro total de tokens de gas (nativo)? {#how-to-set-the-gas-native-token-total-supply}

Puedes establecer un saldo preminado en las cuentas (direcciones) mediante el uso de `--premine flag`. Nota que esta es una configuración del archivo génesis y no se puede cambiar más tarde.

Ejemplo de cómo utilizar `--premine flag`:

`--premine=0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000`

Esto establece un saldo preminado de 1000 ETH a 0x3956E90e632AEbBF34DEB49b71c28A83Bc029862 (the amount from the argument is in wei).

La cantidad preminada del token de gas será el suministro total. Ninguna otra cantidad de la moneda nativa (token de gas) se podrá acuñar después.

## ¿Edge soporta ERC-20 como token de gas? {#does-edge-support-erc-20-as-a-gas-token}

Edge no soporta el token ERC-20 como token de gas. Solo la moneda nativa de Edge es soportada para gas.

## ¿Cómo aumentar el límite de gas? {#how-to-increase-the-gas-limit}

Existen dos opciones para aumentar el límite de gas en Polygon Edge:
1. Limpiar la cadena y aumentar `block-gas-limit`hasta el máximo valor de  en el archivo génesis
2. Utiliza la `--block-gas-target`bandera con un alto valor para aumentar el límite de gas de todos los nodos. Esto requiere de reinicio de nodos. [Aquí](/docs/edge/architecture/modules/txpool/#block-gas-target)
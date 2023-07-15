---
id: permission-contract-deployment
title: Permiso de despliegue de contratos
description: Cómo añadir el permiso de despliegue de contratos inteligentes
keywords:
  - docs
  - polygon
  - edge
  - smart contract
  - permission
  - deployment
---

## Descripción general {#overview}

Esta guía explica la forma de incluir en la lista blanca las direcciones que pueden desplegar los contratos inteligentes.
En ocasiones, los operadores de la red quieren evitar que los usuarios desplieguen los contratos inteligentes que no están relacionados con el propósito de la red. Los operadores de la red pueden:

1. Direcciones de la lista blanca para el despliegue de los contratos inteligentes
2. Eliminar las direcciones de la lista blanca para el despliegue de los contratos inteligentes.

## Presentación en vídeo {#video-presentation}

[![despliegue de contrato de permiso - vídeo](https://img.youtube.com/vi/yPOkINpf7hg/0.jpg)](https://www.youtube.com/watch?v=yPOkINpf7hg)

## ¿Cómo utilizarlo? {#how-to-use-it}


Puedes encontrar todos los comandos relacionados con la lista blanca de despliegue en la página de [Comandos CLI](/docs/edge/get-started/cli-commands#whitelist-commands).

* `whitelist show`: muestra información de la lista blanca
* `whitelist deployment --add`: añade una nueva dirección a la lista blanca de despliegue de contratos
* `whitelist deployment --remove`: elimina una nueva dirección de la lista blanca de despliegue de contratos

#### Muestra todas las direcciones en la lista blanca de despliegue {#show-all-addresses-in-the-deployment-whitelist}

Existen 2 formas de encontrar las direcciones de la lista blanca de despliegue.
1. Mirar dónde se guardan las `genesis.json` de las listas blancas
2. Ejecutar `whitelist show`, lo que imprime la información de todas las listas blancas admitidas por Polygon Edge

```bash

./polygon-edge whitelist show

[WHITELISTS]

Contract deployment whitelist : [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d],


```

#### Añadir una dirección a la lista blanca de despliegue {#add-an-address-to-the-deployment-whitelist}

Para añadir una nueva dirección a la lista blanca de despliegue ejecuta el comando CLI `whitelist deployment --add [ADDRESS]` No existe límite en el número de direcciones presentes en la lista blanca. Solo las direcciones que existen en la lista blanca de despliegue de contratos pueden desplegar contratos. Si la lista blanca está vacía, cualquier dirección puede realizar el despliegue

```bash

./polygon-edge whitelist deployment --add 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d --add 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF


[CONTRACT DEPLOYMENT WHITELIST]

Added addresses: [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],
Contract deployment whitelist : [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],



```

#### Eliminar una dirección de la lista blanca de despliegue {#remove-an-address-from-the-deployment-whitelist}

Para eliminar una dirección de la lista blanca de despliegue ejecuta el comando CLI `whitelist deployment --remove [ADDRESS]`. Solo las direcciones que existen en la lista blanca de despliegue de contratos pueden desplegar contratos. Si la lista blanca está vacía, cualquier dirección puede realizar el despliegue

```bash

./polygon-edge whitelist deployment --remove 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d --remove 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF


[CONTRACT DEPLOYMENT WHITELIST]

Removed addresses: [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],
Contract deployment whitelist : [],



```

---
id: overview
title: Descripción general
description: "Introducción a las pruebas de Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - performance
  - tests
  - loadbot
---
:::caution
Ten en cuenta que nuestro , `loadbot`que se utilizó para realizar estas pruebas, ahora se deprecia.
:::

| Tipo | Valor | Enlace a la prueba |
| ---- | ----- | ------------ |
| Transferencias regulares | 1428 tps | [4 de julio de 2022](test-history/test-2022-07-04.md#results-of-eoa-to-eoa-transfers) |
| Transferencias ERC-20 | 1111 tps | [4 de julio de 2022](test-history/test-2022-07-04.md#results-of-erc20-token-transfers) |
| Acuñamiento de NFT | 714 tps | [4 de julio de 2022](test-history/test-2022-07-04.md#results-of-erc721-token-minting) |

---

Nuestro objetivo es crear un software para clientes de cadenas de bloques de alto rendimiento, rico en funciones y fácil de configurar y mantener.
Todas las pruebas se hicieron usando Polygon Edge Loadbot.
Cada uno de los informes de rendimiento que encontrarás en esta sección está debidamente fechado, el entorno claramente descrito y el método de prueba claramente explicado.

El objetivo de esas pruebas de rendimiento es mostrar el rendimiento en el mundo real de la red de cadenas de bloques de Polygon Edge.
Cualquier usuario debería poder obtener los mismos resultados que se han publicado aquí, en el mismo entorno, utilizando nuestro Loadbot.

Todas las pruebas de rendimiento se realizaron en la plataforma de AWS en una cadena formada por nodos de instancia EC2.
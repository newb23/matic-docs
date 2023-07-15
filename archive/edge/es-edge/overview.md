---
id: overview
title: Polygon Edge
sidebar_label: What is Edge
description: "Introducción a Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - network
  - modular

---

Polygon Edge es una estructura modular y expandible para la construcción de redes de cadenas de bloques compatibles con Ethereum, cadenas laterales y soluciones generales de escalado.

Su principal uso es el de iniciar una nueva red de cadenas de bloques, a la vez que proporciona plena compatibilidad con los contratos inteligentes y las transacciones de Ethereum. Utiliza el mecanismo de consenso de tolerancia a fallas bizantinas de Estambul (IBFT), con dos variantes: [PoA (pruebas de autoridad)](/docs/edge/consensus/poa) y [PoS (pruebas de participación)](/docs/edge/consensus/pos-stake-unstake).

Polygon Edge también admite la comunicación con varias redes de cadenas de bloques, lo que permite la transferencia de tokens [ERC-20](https://ethereum.org/en/developers/docs/standards/tokens/erc-20) y [ERC-721](https://ethereum.org/en/developers/docs/standards/tokens/erc-721), utilizando la [solución de puente centralizado](/docs/edge/additional-features/chainbridge/overview).

Las billeteras estándar de la industria pueden ser utilizadas para interactuar con Polygon Edge a través de los terminales de [RPC JSON](/docs/edge/working-with-node/query-json-rpc) y los operadores de nodos pueden realizar varias acciones en los nodos por medio del protocolo [gRPC](/docs/edge/working-with-node/query-operator-info).

Para obtener más información sobre Polygon, consulta el [sitio web oficial](https://polygon.technology).

**[Repositorio de GitHub](https://github.com/0xPolygon/polygon-edge)**

:::caution

Se trata de un trabajo en curso, por lo que pueden producirse cambios arquitectónicos en el futuro. El código no ha sido auditado
todavía, así que por favor, contacta al equipo de Polygon si quieres usarlo en producción.

:::



Para comenzar a ejecutar una red `polygon-edge` localmente, por favor, lee: [Instalación](/docs/edge/get-started/installation) y [configuración local](/docs/edge/get-started/set-up-ibft-locally).

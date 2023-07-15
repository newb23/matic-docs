---
id: overview
title: Polygon Edge
sidebar_label: What is Edge
description: "Uma introdução ao Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - network
  - modular

---

O Polygon Edge é uma estrutura modular e extensível para construir redes blockchain compatíveis com a Ethereum, sidechains e soluções de escalonamento geral.

A sua principal utilização é a de alavancar uma nova rede blockchain ao mesmo tempo que oferece a compatibilidade total com os contratos inteligentes e transações da Ethereum. Utiliza o mecanismo de consenso IBFT (Istanbul Byzantine Fault Tolerant), suportado por dois "sabores" como [PoA (proof of authority)](/docs/edge/consensus/poa) e [PoS (proof of stake)](/docs/edge/consensus/pos-stake-unstake).

O Polygon Edge também suporta a comunicação com múltiplas redes blockchain, permitindo transferências de tokens [ERC-20](https://ethereum.org/en/developers/docs/standards/tokens/erc-20) e [ERC-721](https://ethereum.org/en/developers/docs/standards/tokens/erc-721) através da utilização da [solução de bridge centralizada](/docs/edge/additional-features/chainbridge/overview).

As carteiras padrão da indústria podem ser usadas para interagir com o Polygon Edge através dos endpoints [JSON-RPC](/docs/edge/working-with-node/query-json-rpc) e os operadores de nós podem realizar várias ações nos nós através do protocolo [gRPC](/docs/edge/working-with-node/query-operator-info).

Para saber mais sobre o Polygon, visite o [website oficial](https://polygon.technology).

**[Repositório GitHub](https://github.com/0xPolygon/polygon-edge)**

:::caution

Trata-se de um trabalho em curso, pelo que se podem verificar mudanças arquitetónicas no futuro. O código ainda não foi auditado,
pelo que deve contactar a equipa do Polygon se pretende usá-lo para produção.

:::



Para começar com a execução de uma rede `polygon-edge` localmente, leia: [Instalação](/docs/edge/get-started/installation) e [Configuração Local](/docs/edge/get-started/set-up-ibft-locally).

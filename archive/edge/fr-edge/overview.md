---
id: overview
title: Polygon Edge
sidebar_label: What is Edge
description: "Une introduction à Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - network
  - modular

---

Polygon Edge est un cadre modulaire et extensible permettant de créer des réseaux de blockchain, des chaînes latérales et des solutions de mise à l'échelle générales compatibles avec Ethereum.

Son utilisation principale est de démarrer un nouveau réseau de blockchain tout en offrant une compatibilité totale avec les contrats intelligents et les transactions d'Ethereum. Il utilise le mécanisme de consensus IBFT (Istanbul Byzantine Fault Tolerant), pris en charge en deux versions comme [PoA (preuve d'autorité)](/docs/edge/consensus/poa) et [PoS (preuve d'enjeu)](/docs/edge/consensus/pos-stake-unstake).

Polygon Edge prend également en charge la communication avec plusieurs réseaux de blockchain, permettant les transferts de jetons [ERC-20](https://ethereum.org/en/developers/docs/standards/tokens/erc-20) et [ERC-721](https://ethereum.org/en/developers/docs/standards/tokens/erc-721) en utilisant la [solution de pont centralisée](/docs/edge/additional-features/chainbridge/overview).

Les portefeuilles standard de l'industrie peuvent être utilisés pour interagir avec Polygon Edge via les points de terminaison [JSON-RPC](/docs/edge/working-with-node/query-json-rpc) et les opérateurs de nœuds peuvent effectuer diverses actions sur les nœuds via le protocole [gRPC](/docs/edge/working-with-node/query-operator-info).

Pour en savoir plus sur Polygon, visitez le [site officiel](https://polygon.technology).

**[Répertoire GitHub](https://github.com/0xPolygon/polygon-edge)**

:::caution

Il s'agit d'un travail en cours, donc des changements architecturaux peuvent se produire à l'avenir. Le code n'a pas été audité pour le moment, veuillez donc contacter l'équipe de Polygon si vous souhaitez l'utiliser en production.

:::



Pour démarrer en exécutant un `polygon-edge` réseau localement, veuillez lire: [Installation](/docs/edge/get-started/installation) et [Configuration Locale](/docs/edge/get-started/set-up-ibft-locally).

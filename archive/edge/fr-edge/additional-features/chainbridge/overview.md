---
id: overview
title: Aperçu
description: Aperçu de ChainBridge
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

## Qu'est-ce que ChainBridge? {#what-is-chainbridge}

ChainBridge est un pont de blockchain multidirectionnel modulaire prenant en charge les chaînes compatibles EVM et Substrate, construit par ChainSafe. Cela permet aux utilisateurs de transférer toutes sortes d'actifs ou des messages entre deux chaînes différentes.

Pour en savoir plus sur ChainBridge, veuillez d'abord consulter les [documents officiels](https://chainbridge.chainsafe.io/) fournis par ses développeurs.

Ce guide est destiné à faciliter l'intégration de Chainbridge à Polygon Edge. Cela décrit la configuration d'un pont entre un PoS de Polygon en cours d'exécution (testnet de Mumbai) et un réseau Edge de Polygon local.

## Exigences {#requirements}

Dans ce guide, vous exécuterez des nœuds Edge de Polygon, un relais de ChainBridge (plus d'informations [ici](/docs/edge/additional-features/chainbridge/definitions)) et l'outil cb-sol-cli, qui est un outil CLI pour déployer des contrats localement, enregistrer des ressources et modifier les paramètres du pont (vous pouvez vérifier [cela](https://chainbridge.chainsafe.io/cli-options/#cli-options) aussi). Les environnements suivants sont requis avant de commencer l'installation:

* Go: >= 1.17
* Node.js >= 16.13.0
* Git


De plus, vous devrez cloner les référentiels suivants avec les versions pour exécuter certaines applications.

* [Edge de Polygon](https://github.com/0xPolygon/polygon-edge): sur le `develop` domaine
* [ChainBridge](https://github.com/ChainSafe/ChainBridge): v1.1.5
* [Outils de Déploiement de ChainBridge](https://github.com/ChainSafe/chainbridge-deploy): `f2aa093` sur le `main`domaine


Vous devez configurer un réseau Edge de Polygon avant de passer à la section suivante. Veuillez vérifier la [Configuration Locale](/docs/edge/get-started/set-up-ibft-locally) ou la [Configuration Cloud](/docs/edge/get-started/set-up-ibft-on-the-cloud) pour plus de détails.
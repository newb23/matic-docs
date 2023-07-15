---
id: pos-stake-unstake
title: Configuration et utilisation de la Preuve d'Enjeu (PoS)
description: "Faire du Stake, défaire du stake et autres instructions relatives au staking."
keywords:
  - docs
  - polygon
  - edge
  - stake
  - unstake
  - validator
  - epoch
---

## Aperçu {#overview}

Ce guide explique en détail comment mettre en place un réseau de Preuve d'Enjeu avec le Polygon Edge, comment faire du stake des fonds pour que les nœuds deviennent des validateurs et comment défaire du stake des fonds.

Il est **fortement encouragé** à lire et à passer les sections de [Configuration Locale](/docs/edge/get-started/set-up-ibft-locally) et la [Configuration du Cloud](/docs/edge/get-started/set-up-ibft-on-the-cloud) avant de suivre
 ce guide de PoS. Ces sections décrivent les étapes nécessaires pour démarrer une groupe de Preuve d'Autorité (PoA) avec le Polygon Edge.

Actuellement, le nombre de validateurs pouvant faire du stake des fonds sur le Contrat Intelligent de Staking n'est pas limité.

## Contrat Intelligent de Staking {#staking-smart-contract}

Le repo pour le Contrat Intelligent de Staking est situé [ici](https://github.com/0xPolygon/staking-contracts).

Celui-ci contient les scénarios de test nécessaires, les fichiers ABI et, surtout, le Contrat Intelligent de Staking lui-même.

## Configuration d'un groupe de nœuds de N {#setting-up-an-n-node-cluster}

La configuration d'un réseau à l'aide du Polygon Edge est abordée dans les sections de [Configuration Locale](/docs/edge/get-started/set-up-ibft-locally) et la [Configuration du Cloud](/docs/edge/get-started/set-up-ibft-on-the-cloud).

La phase de génération de la genèse constitue la **seule différence** entre la configuration d'un groupe de PoS et de PoA.

**Lors de la génération du fichier de genèse pour une groupe de PoS, un indicateur supplémentaire est nécessaire `--pos`**:

```bash
polygon-edge genesis --pos ...
```

## Configuration de la longueur d'une époque {#setting-the-length-of-an-epoch}

Les époques sont décrites en détail dans la section des [Blocs d'Époque](/docs/edge/consensus/pos-concepts#epoch-blocks).

Pour définir la taille d'une époque pour un groupe (en blocs), lors de la génération du fichier de genèse, un indicateur supplémentaire est spécifié `--epoch-size`:

```bash
polygon-edge genesis --epoch-size 50
```

Cette valeur indique dans le fichier de genèse que la taille de l'époque doit être de `50` blocs.

La valeur par défaut de la taille d'une époque (en blocs) est de `100000`.

:::info Diminuer la longueur de l'époque

Comme indiqué dans la section de [Blocs d'Époques](/docs/edge/consensus/pos-concepts#epoch-blocks), ces derniers sont utilisés pour mettre à jour les ensembles de validateur pour les nœuds.

La durée par défaut de l'époque en blocs (`100000`) peut être longue afin de pouvoir effectuer les mises à jour de l'ensemble des validateurs. Si l'on considère que des nouveaux blocs sont ajoutés environ toutes les 2 secondes, il faudrait environ 55,5 heures pour que l'ensemble des validateur change éventuellement.

Définir une valeur inférieure pour la durée de l'époque, permet d'assurer que l'ensemble de validateur est mis à jour plus fréquemment.

:::

## Utiliser les scénarios du Contrat Intelligent de Staking {#using-the-staking-smart-contract-scripts}

### Prérequis {#prerequisites}

Le repo du Contrat Intelligent de Staking est un projet Hardhat, qui nécessite NPM.

Pour l'initialiser correctement, suivez les étapes suivantes dans le répertoire principal:

```bash
npm install
````

### Configurer les scénarios d'assistant fournis {#setting-up-the-provided-helper-scripts}

Les scénarios permettant d'interagir avec le Contrat Intelligent de Staking déployé se trouvent sur le [repo du Contrat Intelligent de Staking](https://github.com/0xPolygon/staking-contracts).

Créez un `.env` fichier avec les paramètres suivants dans l'emplacement du repo des Contrats Intelligents:

```bash
JSONRPC_URL=http://localhost:10002
PRIVATE_KEYS=0x0454f3ec51e7d6971fc345998bb2ba483a8d9d30d46ad890434e6f88ecb97544
STAKING_CONTRACT_ADDRESS=0x0000000000000000000000000000000000001001
BLS_PUBLIC_KEY=0xa..
```

Où les paramètres se trouvent:

* **JSONRPC_URL** - le point de terminaison JSON-RPC pour le nœud en cours
* **PRIVATE_KEYS** - les clés privées de l'adresse du staker.
* **STAKING_CONTRACT_ADDRESS** - l'adresse du contrat intelligent de staking ( par défaut `0x0000000000000000000000000000000000001001`)
* **BLS_PUBLIC_KEY** - la clé publique BLS du staker. Seulement nécessaire si le réseau fonctionne avec BLS

### Des fonds de staking {#staking-funds}

:::info Adresse de staking

Le Contrat Intelligent de Staking est pré-déployé sur l'adresse `0x0000000000000000000000000000000000001001`.

Tout type d'interaction avec le mécanisme de staking se fait par le biais du Contrat Intelligent de Staking à l'adresse spécifiée.

Pour en savoir plus sur le Contrat Intelligent de Staking, veuillez consulter le **[contrat intelligent Staking](/docs/edge/consensus/pos-concepts#contract-pre-deployment)** .
:::

Pour faire partie de l'ensemble des validateurs, une adresse doit faire du stake sur un montant donné de fonds au-dessus d'un certain niveau.

Actuellement, le niveau par défaut pour faire partie de l'ensemble de validateur est de `1 ETH`.

Le staking peut être initié en invoquant la `stake` méthode du Contrat Intelligent de Staking, et en spécifiant une valeur `>= 1 ETH`.

Une fois que le `.env` fichier mentionné dans la [section précédente](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts) a été configuré, et qu'une chaîne a été lancée en mode PoS, le staking peut être effectué avec la commande suivante dans le repo du Contrat Intelligent de Staking:

```bash
npm run stake
```

Le `stake` scénario d'Hardhat fait du stake sur un montant par défaut de `1 ETH`, qui peut être changé en modifiant le `scripts/stake.ts`fichier.

Si les fonds stakés sont `>= 1 ETH`, l'ensemble de validateurs du Contrat Intelligent de Staking est mis à jour et l'adresse fera partie de l'ensemble de validateur à partir de la prochaine époque.

:::info Enregistrer les clés BLS

Si le réseau fonctionne en mode BLS, les nœuds doivent enregistrer leurs clés publiques BLS après le staking, pour pouvoir devenir des validateurs

Cela peut être effectué avec la commande suivante:

```bash
npm run register-blskey
```
:::

### Défaire le stake sur des fonds {#unstaking-funds}

Les adresses qui ont une participation peuvent **seulement défaire du stake de tous leurs fonds** en une seule fois seulement.

Une fois que le `.env` fichier mentionné dans la [section précédente](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts) a été configuré, et qu'une chaîne a été lancée dans le mode PoS, défaire du stake peut être effectué avec la commande suivante dans le repo du Contrat Intelligent de Staking:

```bash
npm run unstake
```

### Récupérer la liste des stakers {#fetching-the-list-of-stakers}

Toutes les adresses qui stakent des fonds sont enregistrées dans le Contrat Intelligent de Staking.

Une fois que le `.env` fichier mentionné dans la [section précédente](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts) a été configuré, et qu'une chaîne a été lancée dans le mode PoS, la récupération de la liste des validateurs peut être effectuée avec la commande suivante dans le repo du Contrat Intelligent de Staking:

```bash
npm run info
```

---
id: query-operator-info
title: Interrogez les informations de l'opérateur.
description: "Comment interroger les informations de l'opérateur."
keywords:
  - docs
  - polygon
  - edge
  - node
  - query
  - operator
---

## Prérequis {#prerequisites}

Ce guide suppose que vous avez suivi la [Configuration Locale](/docs/edge/get-started/set-up-ibft-locally) ou le [guide sur la configuration d'un cluster IBFT sur le cloud](/docs/edge/get-started/set-up-ibft-on-the-cloud).

Un nœud fonctionnel est nécessaire pour interroger tout type d'informations sur l'opérateur.

Avec Polygon Edge, les opérateurs de nœuds ont le contrôle et sont informés de ce que fait le nœud qu'ils exploitent. <br />
À tout moment, ils peuvent utiliser la couche d'informations de nœud, construite au-dessus de gRPC, et obtenir des informations significatives - aucun filtrage des journaux n'est requis.

:::note

Si votre nœud n'est pas en cours d'exécution sur `127.0.0.1:8545` vous devez ajouter un indicateur `--grpc-address <address:port>` aux commandes répertoriées dans ce document.

:::

## Informations sur les pairs {#peer-information}

### Liste des pairs {#peers-list}

Pour obtenir une liste complète des pairs connectés (y compris le nœud en cours d'exécution lui-même), exécutez la commande suivante :
````bash
polygon-edge peers list
````

Cela renverra une liste d'adresses libp2p qui sont actuellement des pairs du client en cours d'exécution.

### Statut des pairs {#peer-status}

Pour connaître l'état d'un pair spécifique, exécutez :
````bash
polygon-edge peers status --peer-id <address>
````
Le paramètre *d'adresse* étant l'adresse libp2p du pair.

## Informations sur les IBFT {#ibft-info}

Souvent, un opérateur peut vouloir connaître l'état du nœud d'exploitation dans le consensus IBFT.

Heureusement, Polygon Edge fournit un moyen facile de trouver ces informations.

### Prise de photos {#snapshots}

L'exécution de la commande suivante renvoie l'instantané le plus récent.
````bash
polygon-edge ibft snapshot
````
Pour interroger l'instantané à une hauteur spécifique (numéro de bloc), l'opérateur peut exécuter :
````bash
polygon-edge ibft snapshot --num <block-number>
````

### Candidats {#candidates}

Pour obtenir les informations les plus récentes sur les candidats, l'opérateur peut exécuter :
````bash
polygon-edge ibft candidates
````
Cette commande interroge l'ensemble actuel de candidats proposés, ainsi que les candidats qui n'ont pas encore été inclus

### Statut {#status}

La commande suivante renvoie la clé de validation actuelle du client IBFT en cours d'exécution :
````bash
polygon-edge ibft status
````

## Pool de transactions {#transaction-pool}

Pour trouver le nombre actuel de transactions dans le pool de transactions, l'opérateur peut exécuter :
````bash
polygon-edge txpool status
````

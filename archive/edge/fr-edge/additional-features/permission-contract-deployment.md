---
id: permission-contract-deployment
title: Autorisation du déploiement de contrat intelligent
description: Comment ajouter une autorisation pour le déploiement de contrat intelligent.
keywords:
  - docs
  - polygon
  - edge
  - smart contract
  - permission
  - deployment
---

## Aperçu {#overview}

Ce guide explique en détail comment ajouter à la liste blanche des adresses pouvant déployer des contrats intelligents. Parfois, les opérateurs de réseau souhaitent empêcher les utilisateurs de déployer des contrats intelligents qui ne sont pas liés à l'objectif du réseau. Les opérateurs de réseau peuvent:

1. Ajoutez à la liste blanche des adresses pour le déploiement de Contrat Intelligent
2. Supprimez des adresses de la liste blanche pour le déploiement de Contrat Intelligent

## Présentation vidéo {#video-presentation}

[![déploiement de contrat de permission - vidéo](https://img.youtube.com/vi/yPOkINpf7hg/0.jpg)](https://www.youtube.com/watch?v=yPOkINpf7hg)

## Comment l'utiliser? {#how-to-use-it}


Vous pouvez trouver toutes les commandes cli liées à la liste blanche de déploiement sur la page des [Commandes CLI](/docs/edge/get-started/cli-commands#whitelist-commands).

* `whitelist show`: Affiche les informations de la liste blanche
* `whitelist deployment --add`:  Ajoute une nouvelle adresse à la liste blanche de déploiement du contrat
* `whitelist deployment --remove`: Supprime une nouvelle adresse de la liste blanche de déploiement du contrat

#### Affichez toutes les adresses dans la liste blanche de déploiement {#show-all-addresses-in-the-deployment-whitelist}

Il existe 2 façons de trouver des adresses à partir de la liste blanche de déploiement.
1. En regardant le `genesis.json` où les listes blanches sont enregistrées
2. Exécution `whitelist show`, ce qui imprime des informations pour toutes les listes blanches prises en charge par Edge de Polygon

```bash

./polygon-edge whitelist show

[WHITELISTS]

Contract deployment whitelist : [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d],


```

#### Ajoutez une adresse à la liste blanche de déploiement {#add-an-address-to-the-deployment-whitelist}

Pour ajouter une nouvelle adresse à la liste blanche de déploiement, exécutez la `whitelist deployment --add [ADDRESS]` commande CLI. Il n'y a pas de limite au nombre d'adresses présentes dans la liste blanche. Seules les adresses qui existent dans la liste blanche de déploiement de contrats peuvent déployer des contrats. Si la liste blanche est vide, n'importe quelle adresse peut effectuer le déploiement

```bash

./polygon-edge whitelist deployment --add 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d --add 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF


[CONTRACT DEPLOYMENT WHITELIST]

Added addresses: [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],
Contract deployment whitelist : [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],



```

#### Supprimez une adresse de la liste blanche de déploiement {#remove-an-address-from-the-deployment-whitelist}

Pour supprimer une adresse de la liste blanche de déploiement, exécutez la `whitelist deployment --remove [ADDRESS]` commande CLI. Seules les adresses qui existent dans la liste blanche de déploiement de contrats peuvent déployer des contrats. Si la liste blanche est vide, n'importe quelle adresse peut effectuer le déploiement

```bash

./polygon-edge whitelist deployment --remove 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d --remove 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF


[CONTRACT DEPLOYMENT WHITELIST]

Removed addresses: [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],
Contract deployment whitelist : [],



```

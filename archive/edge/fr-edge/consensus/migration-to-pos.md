---
id: migration-to-pos
title: Migration de la PoA à la PoS
description: "Comment migrer de PoA au mode d'IBFT de la preuve de participation et vice versa."
keywords:
  - docs
  - polygon
  - edge
  - migrate
  - PoA
  - PoS
---

## Aperçu {#overview}

Cette section vous explique comment passer du mode de PoA au mode d'IBFT de la preuve de participation, et vice versa, pour un groupe en fonctionnement, sans avoir à réinitialiser la blockchain.

## Comment migrer vers PoS {#how-to-migrate-to-pos}

Vous devrez arrêter tous les nœuds, ajouter la configuration de la fourche dans genesis.json par `ibft switch` la commande, et redémarrer les nœuds.

````bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --deployment 100 --from 200
````
:::caution Passer lors de l'utilisation ECDSA
Lors de l'utilisation ECDSA, `--ibft-validator-type`l'indicateur doit être ajouté au commutateur, en indiquant que ECDSA est utilisé. Si elle n'est pas incluse, Edge passera automatiquement vers BLS.

````bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --ibft-validator-type ecdsa --deployment 100 --from 200
````
:::Pour passer à PoS, vous devrez spécifier 2 hauteurs de bloc `deployment`: . `from`est `deployment`la hauteur pour déployer le contrat de staking et est `from`la hauteur du début de PoS. Le contrat de staking sera déployé à l'adresse `0x0000000000000000000000000000000000001001` au `deployment`, comme dans le cas du contrat pré-déployé.

Veuillez consulter la [Preuve d'Enjeu](/docs/edge/consensus/pos-concepts) pour plus de détails sur le contrat de Staking.

:::warning Les validateurs doivent être mis en place manuellement

Chaque validateur doit miser après le déploiement du contrat à `deployment` et avant `from` afin de pouvoir être un validateur au début de la Preuve de Participation. Chaque validateur mettra à jour son propre ensemble de validateurs par l'ensemble dans le contrat de staking au début de la Preuve de Participation.

Pour en savoir plus sur Staking, consultez la **[Configuration et utilisez la preuve de Stake](/docs/edge/consensus/pos-stake-unstake)**.
:::

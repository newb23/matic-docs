---
id: poa
title: Preuve d'Autorité (PoA)
description: "Explication et les instructions concernant la Preuve d'Autorité."
keywords:
  - docs
  - polygon
  - edge
  - PoA
  - autorithy
---

## Aperçu {#overview}

La PoA d'IBFT est le mécanisme de consensus par défaut dans le Polygone Edge. Dans la PoA, les validateurs sont chargés de créer les blocs et de les ajouter en série à la blockchain.

Tous les validateurs constituent un ensemble de validateur dynamique, dans lequel des validateurs peuvent être ajoutés ou retirés en utilisant un mécanisme de vote. Cela signifie que les validateurs peuvent être ajoutés ou retirés de l'ensemble des validateurs si la majorité (51%) des nœuds de validations vote pour ajouter ou retirer un certain validateur de l'ensemble. De cette façon, les validateurs malveillants peuvent être reconnus et écartés du réseau, tandis que de nouveaux validateurs de confiance peuvent être ajoutés au réseau.

Tous les validateurs proposent à tour de rôle le bloc suivant (round-robin), et pour que le bloc soit validé ou inséré dans la blockchain, une supermajorité (plus de 2/3) des validateurs doit approuver bloc désigné.

Outre les validateurs, certains non-validateurs ne participent pas dans la création du bloc mais participe au processus de validation du bloc.

## Ajouter un validateur à l'ensemble des validateur {#adding-a-validator-to-the-validator-set}

Ce guide décrit comment ajouter un nouveau nœud de validateur à un réseau IBFT actif avec 4 nœuds de validation.
 Si vous avez besoin d'aide pour configurer le réseau, consultez les sections Configuration [locale](/edge/get-started/set-up-ibft-locally.md) / [Configuration du](/edge/get-started/set-up-ibft-on-the-cloud.md) Cloud.

### Étape 1: Initialiser les dossiers de données pour IBFT et générer les clés de validation pour le nouveau nœud. {#step-1-initialize-data-folders-for-ibft-and-generate-validator-keys-for-the-new-node}

Afin de se lever et rendre IBFT opérationnel sur le nouveau nœud, vous devez d'abord initialiser les dossiers de données et générer les clés:

````bash
polygon-edge secrets init --data-dir test-chain-5
````

Cette commande imprimera la clé de validation (adresse) et l'Identifiant du nœud. Vous aurez besoin de la clé de validation (adresse) pour l'étape suivante.

### Étape 2: Proposer un nouveau candidat à partir d'autres nœuds de validation {#step-2-propose-a-new-candidate-from-other-validator-nodes}

Pour qu'un nouveau nœud devienne un validateur, au moins 51 % des validateurs doivent le proposer.

Exemple sur la façon de proposer un nouveau validateur (`0x8B15464F8233F718c8605B16eBADA6fc09181fC2`) à partir du noeud de validation existant sur l'adresse grpc: 127.0.0.1:10000:

````bash
polygon-edge ibft propose --grpc-address 127.0.0.1:10000 --addr 0x8B15464F8233F718c8605B16eBADA6fc09181fC2 --bls 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --vote auth
````

La structure des commandes IBFT est traitée dans la section des [Commandes CLI](/docs/edge/get-started/cli-commands).

:::info Clé publique de BLS

La clé publique de BLS est nécessaire uniquement si le réseau fonctionne avec le BLS, `--bls` c'est inutile pour le réseau qui ne fonctionne pas en mode de BLS
:::

### Étape 3: Exécuter un nœud de client {#step-3-run-the-client-node}

Étant donné que dans cet exemple, nous essayons de faire fonctionner le réseau dans lequel tous les nœuds sont sur la même machine, nous devons veiller à éviter les conflits de port.

````bash
polygon-edge server --data-dir ./test-chain-5 --chain genesis.json --grpc-address :50000 --libp2p :50001 --jsonrpc :50002 --seal
````

Après avoir récupéré tous les blocs, vous remarquerez dans votre console qu'un nouveau nœud participe dans la validation

````bash
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=4004
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=5 votes=0
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft: proposer calculated: proposer=0x8B15464F8233F718c8605B16eBADA6fc09181fC2 block=4004
````

:::info Promouvoir un non-validateur à un validateur

Naturellement, un non-validateur peut devenir un validateur par le processus de vote, mais pour qu'il puisse être inclus dans l'ensemble des validateurs après le processus de vote, le nœud doit être redémarré avec `--seal` l'option.
:::

## Supprimer un validateur de l'ensemble des validateur {#removing-a-validator-from-the-validator-set}

Cette opération est assez simple. Pour supprimer un nœud de validation de l'ensemble des validateurs, cette commande doit être exécutée pour la majorité des nœuds de validation.

````bash
polygon-edge ibft propose --grpc-address 127.0.0.1:10000 --addr 0x8B15464F8233F718c8605B16eBADA6fc09181fC2 --bls 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --vote drop
````

:::info Clé publique de BLS

La clé publique de BLS est nécessaire uniquement si le réseau fonctionne avec le BLS, `--bls` c'est inutile pour le réseau qui ne fonctionne pas en mode de BLS
:::

Après l'exécution des commandes, on constate que le nombre de validateurs a diminué (dans cet exemple de protocole, de 4 à 3).

````bash
2021-12-15T19:20:51.014+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=2399 round=1
2021-12-15T19:20:51.014+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=4 votes=2
2021-12-15T19:20:51.015+0100 [INFO]  polygon.consensus.ibft.acceptState: we are the proposer: block=2399
2021-12-15T19:20:51.015+0100 [INFO]  polygon.consensus.ibft: picked out txns from pool: num=0 remaining=0
2021-12-15T19:20:51.015+0100 [INFO]  polygon.consensus.ibft: build block: number=2399 txns=0
2021-12-15T19:20:53.002+0100 [INFO]  polygon.consensus.ibft: state change: new=ValidateState
2021-12-15T19:20:53.009+0100 [INFO]  polygon.consensus.ibft: state change: new=CommitState
2021-12-15T19:20:53.009+0100 [INFO]  polygon.blockchain: write block: num=2399 parent=0x768b3bdf26cdc770525e0be549b1fddb3e389429e2d302cb52af1722f85f798c
2021-12-15T19:20:53.011+0100 [INFO]  polygon.blockchain: new block: number=2399 hash=0x6538286881d32dc7722dd9f64b71ec85693ee9576e8a2613987c4d0ab9d83590 txns=0 generation_time_in_sec=2
2021-12-15T19:20:53.011+0100 [INFO]  polygon.blockchain: new head: hash=0x6538286881d32dc7722dd9f64b71ec85693ee9576e8a2613987c4d0ab9d83590 number=2399
2021-12-15T19:20:53.011+0100 [INFO]  polygon.consensus.ibft: block committed: sequence=2399 hash=0x6538286881d32dc7722dd9f64b71ec85693ee9576e8a2613987c4d0ab9d83590 validators=4 rounds=1 committed=3
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft: state change: new=AcceptState
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=2400 round=1
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=3 votes=0
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft: proposer calculated: proposer=0xea21efC826F4f3Cb5cFc0f986A4d69C095c2838b block=2400
````

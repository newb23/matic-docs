---
id: backup-restore
title: Instance de nœud de sauvegarde/restauration
description: "Comment sauvegarder et restaurer une instance de nœud de Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - instance
  - restore
  - directory
  - node
---

## Aperçu {#overview}

Ce guide explique en détail comment sauvegarder et restaurer une instance de nœud Polygon Edge.
Il couvre les dossiers de base et ce qu'ils contiennent, ainsi que les fichiers essentiels pour effectuer une sauvegarde et une restauration réussies.

## Dossiers de base {#base-folders}

Polygon Edge utilise LevelDB comme moteur de stockage.
Lors du démarrage d'un nœud Polygon Edge, les sous-dossiers suivants sont créés dans le répertoire de travail spécifié :
* **blockchain** - Stocke les données de la blockchain
* **trie** - Stocke les tries de Merkle (données sur l'état mondial)
* **keystore** - Stocke les clés privées du client. Cela inclut la clé privée libp2p et la clé privée de scellement/validateur
* **consensus** - Stocke toutes les informations de consensus dont le client pourrait avoir besoin pendant son travail. Pour l'instant, il stocke la *clé de validation privée* du nœud

Il est essentiel que ces dossiers soient conservés pour que l'instance Polygon Edge fonctionne correctement.

## Créez une sauvegarde à partir d'un nœud en cours d'exécution et faîtes une restauration pour un nouveau nœud {#create-backup-from-a-running-node-and-restore-for-new-node}

Cette section vous guide dans la création de données d'archive de la blockchain dans un nœud en cours d'exécution et dans sa restauration dans une autre instance.

### Sauvegarde {#backup}

`backup` La commande récupère les blocs d'un nœud en cours d'exécution par gRPC et génère un fichier d'archive. Si `--from` et `--to` ne sont pas donnés dans la commande, cette commande récupérera les blocs de la genèse au plus récent.

```bash
$ polygon-edge backup --grpc-address 127.0.0.1:9632 --out backup.dat [--from 0x0] [--to 0x100]
```

### Restaurez {#restore}

Un serveur importe des blocs d'une archive au démarrage lorsqu'il démarre avec l'indicateur `--restore`. Assurez-vous qu'il existe une clé pour le nouveau nœud. Pour en savoir plus sur l'importation ou la génération de clés, visitez la [section Gestionnaires de secrets](/docs/edge/configuration/secret-managers/set-up-aws-ssm).

```bash
$ polygon-edge server --restore archive.dat
```

## Sauvegardez/restaurez des données Complètes {#back-up-restore-whole-data}

Cette section vous guide dans la sauvegarde des données, y compris les données d'état et la clé, puis la restauration dans la nouvelle instance.

### Étape 1 : Arrêtez le client en cours d'exécution {#step-1-stop-the-running-client}

Étant donné que Polygon Edge utilise **LevelDB** pour le stockage des données, le nœud doit être arrêté pendant la durée de la sauvegarde,
car **LevelDB** n'autorise pas l'accès simultané à ses fichiers de base de données.

De plus, Polygon Edge effectue également le vidage des données à la fermeture.

La première étape consiste à arrêter le client en cours d'exécution (soit via un gestionnaire de services, soit via un autre mécanisme qui envoie un signal SIGINT au processus),
cela peut donc déclencher 2 événements tout en s'arrêtant gracieusement :
* Exécution du vidage des données sur le disque
* Libération du verrouillage des fichiers DB par LevelDB

### Étape 2 : sauvegardez le répertoire {#step-2-backup-the-directory}

Maintenant que le client n'est pas en cours d'exécution, le répertoire de données peut être sauvegardé sur un autre support. Gardez à l'esprit que les fichiers avec une extension `.key` contiennent les données de clé privée qui peuvent être utilisées pour emprunter l'identité du nœud actuel, et ils ne doivent jamais être partagés avec un tiers/inconnu.

:::info
Veuillez sauvegarder et restaurer manuellement le fichier `genesis` généré, afin que le nœud restauré soit pleinement opérationnel.
:::

## Restaurez {#restore-1}

### Étape 1 : Arrêtez le client en cours d'exécution {#step-1-stop-the-running-client-1}

Si une instance de Polygon Edge est en cours d'exécution, elle doit être arrêtée pour que l'étape 2 réussisse.

### Étape 2 : Copiez le répertoire de données sauvegardées dans le dossier souhaité {#step-2-copy-the-backed-up-data-directory-to-the-desired-folder}

Une fois que le client n'est pas en cours d'exécution, le répertoire de données précédemment sauvegardé peut être copié dans le dossier souhaité. De plus, restaurez le fichier `genesis` précédemment copié.

### Étape 3 : Exécutez le client de Polygon Edge tout en spécifiant le répertoire de données correct {#step-3-run-the-polygon-edge-client-while-specifying-the-correct-data-directory}

Pour que Polygon Edge utilise le répertoire de données restauré, au lancement, l'utilisateur doit spécifier le chemin d'accès au répertoire de données. Veuillez consulter la section [Commandes CLI](/docs/edge/get-started/cli-commands) pour plus d'informations sur l'indicateur `data-dir`.

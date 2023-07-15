---
id: set-up-gcp-secrets-manager
title: Configurez le Gestionnaire de Secrets GCP
description: "Configurez le Gestionnaire de Secrets GCP pour Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - gcp
  - secrets
  - manager
---

## Aperçu {#overview}

Actuellement, Polygon Edge se préoccupe de garder 2 secrets d'exécution majeurs:
* La **clé privée du validateur** utilisée par le nœud, si le nœud est un validateur
* La **clé privée de mise en réseau** utilisée par libp2p, pour participer et communiquer avec d'autres pairs

Pour plus d'informations, veuillez lire le [Guide de Gestion des Clés Privées](/docs/edge/configuration/manage-private-keys)

Les modules du Polygon Edge **ne devraient pas avoir besoin de savoir garder des secrets**. En fin de compte, un module ne devrait pas se soucier du fait qu'un secret soit stocké sur un serveur distant ou localement sur le disque du nœud.

Tout ce qu'un module doit savoir sur la conservation des secrets, c'est **savoir utiliser le secret**, **savoir quels secrets obtenir
ou enregistrer**. Les détails d'implémentation les plus fins de ces opérations sont délégués au `SecretsManager`, ce qui est bien sûr une abstraction.

L'opérateur du nœud qui démarre le Polygon Edge peut désormais spécifier le gestionnaire des secrets qu'il souhaite utiliser, et dès que le bon gestionnaire de secrets est instancié, les modules traitent les secrets via l'interface mentionnée - sans se soucier de savoir si les secrets sont stockés sur un disque ou sur un serveur.

Cet article détaille les étapes nécessaires pour que Polygon Edge soit opérationnel avec le [Gestionnaire de Secrets GCP](https://cloud.google.com/secret-manager).

:::info guides précédents

Il est **fortement recommandé** qu'avant de parcourir cet article, les articles sur [**Configuration locale**](/docs/edge/get-started/set-up-ibft-locally)
et [**Configuration cloud**](/docs/edge/get-started/set-up-ibft-on-the-cloud) soient lus.
:::


## Prérequis {#prerequisites}
### Compte de Facturation GCP {#gcp-billing-account}
Pour utiliser le Gestionnaire de Secrets GCP, l'utilisateur doit avoir activé le [Compte de facturation](https://console.cloud.google.com/) sur le portail GCP.
Les nouveaux comptes Google sur la plate-forme GCP reçoivent des fonds pour démarrer, en tant que roi de l'essai gratuit.
Plus d'informations sur la [documentation GCP](https://cloud.google.com/free)

### API du Gestionnaire de Secrets {#secrets-manager-api}
L'utilisateur devra activer l'API du Gestionnaire de Secrets GCP avant de pouvoir l'utiliser.
Cela peut être fait via le [portail API du Gestionnaire de Secrets GCP](https://console.cloud.google.com/apis/library/secretmanager.googleapis.com).
Plus d'informations : [Configuration du Gestionnaire de Secrets](https://cloud.google.com/secret-manager/docs/configuring-secret-manager)

### Identifiant GCP {#gcp-credentials}
Enfin, l'utilisateur doit générer de nouvelles informations d'identification qui seront utilisées pour l'authentification.
Cela peut être fait en suivant les instructions affichées [ici](https://cloud.google.com/secret-manager/docs/reference/libraries).   
Le fichier json généré contenant les informations d'identification doit être transféré à chaque nœud devant utiliser le Gestionnaire de Secrets GCP.

Informations requises avant de continuer :
* **Identifiant du projet** (l'identifiant du projet défini sur la plate-forme GCP)
* **Emplacement du Fichier des Identifiants** (le chemin d'accès au fichier json contenant les informations d'identification)

## Étape 1 - Générez la configuration du gestionnaire de secrets {#step-1-generate-the-secrets-manager-configuration}

Pour que Polygon Edge puisse communiquer de manière transparente avec GCP SM, il doit analyser un
fichier de configuration déjà généré, qui contient toutes les informations nécessaires pour le stockage secret sur GCP SM.

Pour générer la configuration, exécutez la commande suivante :

```bash
polygon-edge secrets generate --type gcp-ssm --dir <PATH> --name <NODE_NAME> --extra project-id=<PROJECT_ID>,gcp-ssm-cred=<GCP_CREDS_FILE>
```

Paramètres présents:
* `PATH` est le chemin vers lequel le fichier de configuration doit être exporté. `./secretsManagerConfig.json` Par défaut
* `NODE_NAME` est le nom du nœud actuel pour lequel la configuration GCP SM est en cours de configuration. Il peut s'agir d'une valeur arbitraire. `polygon-edge-node` Par défaut
* `PROJECT_ID` est l'identifiant du projet que l'utilisateur a défini dans la console GCP lors de la configuration du compte et de l'activation de l'API du Gestionnaire de Secrets.
* `GCP_CREDS_FILE` est le chemin d'accès au fichier json contenant les informations d'identification qui permettront l'accès en lecture/écriture au Gestionnaire de Secrets.

:::caution Noms de nœud

Soyez prudent lorsque vous spécifiez les noms de nœud.

Polygon Edge utilise le nom de nœud spécifié pour suivre les secrets qu'il génère et utilise sur le SM GCP.
La spécification d'un nom de nœud existant peut entraîner l'échec de l'écriture du secret dans GCP SM.

Les secrets sont stockés sur le chemin de base suivant : `projects/PROJECT_ID/NODE_NAME`

:::

## Étape 2 - Initialiser les clés secrètes à l'aide de la configuration {#step-2-initialize-secret-keys-using-the-configuration}

Maintenant que le fichier de configuration est présent, nous pouvons initialiser les clés secrètes requises avec le fichier de configuration le fichier est configuré à l'étape 1, à l'aide de `--config`:

```bash
polygon-edge secrets init --config <PATH>
```

Le `PATH` param est l'emplacement du paramètre de gestionnaire des secrets généré précédemment à l'étape 1.

## Étape 3 - Générer le fichier de genèse {#step-3-generate-the-genesis-file}

Le fichier de genèse doit être généré de la même manière que la [**Configuration Locale**](/docs/edge/get-started/set-up-ibft-locally) et les guides de [**Configuration du Cloud**](/docs/edge/get-started/set-up-ibft-on-the-cloud), avec des modifications mineures.

Étant donné que GCP SM est utilisé à la place du système de fichiers local, les adresses de validateur doivent être ajoutées via l'`--ibft-validator` indicateur:
```bash
polygon-edge genesis --ibft-validator <VALIDATOR_ADDRESS> ...
```

## Étape 4 - Démarrez le client de Polygon Edge {#step-4-start-the-polygon-edge-client}

Maintenant que les clés sont configurées et que le fichier de genèse est généré, la dernière étape de ce processus serait de démarrer le Polygon Edge avec la `server` commande.

La `server` commande  est utilisée de la même manière que dans les guides mentionnés précédemment, avec un ajout mineur - l'`--secrets-config`indicateur :
```bash
polygon-edge server --secrets-config <PATH> ...
```

Le `PATH` param est l'emplacement du paramètre de gestionnaire des secrets généré précédemment à l'étape 1.
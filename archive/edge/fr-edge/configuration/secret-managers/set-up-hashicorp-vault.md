---
id: set-up-hashicorp-vault
title: Configurer Hashicorp Vault
description: "Configurer le Hashicorp Vault pour Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - hashicorp
  - vault
  - secrets
  - manager
---

## Aperçu {#overview}

Actuellement, Polygon Edge se préoccupe de garder 2 secrets d'exécution majeurs:
* La **clé privée du validateur** utilisée par le nœud, si le nœud est un validateur
* La **clé privée de réseau** utilisée par libp2p, pour participer et communiquer avec d'autres pairs

:::warning

La clé privée du validateur est unique pour chaque nœud de validateur. La même clé ne doit <b>pas</b> être partagée entre tous les validateurs, car cela pourrait compromettre la sécurité de votre chaîne.
:::

Pour plus d'informations, veuillez lire le [Guide de Gestion Des Clés Privées](/docs/edge/configuration/manage-private-keys)

Les modules du Polygon Edge **ne devraient pas avoir besoin de savoir garder des secrets**. En fin de compte, un module ne devrait pas se soucier du fait qu'un secret soit stocké sur un serveur distant ou localement sur le disque du nœud.

Tout ce qu'un module doit savoir sur la conservation des secrets, c'est **savoir utiliser le secret**, **savoir quels secrets obtenir
ou enregistrer**. Les détails d'implémentation les plus fins de ces opérations sont délégués au `SecretsManager`, ce qui est bien sûr une abstraction.

L'opérateur du nœud qui démarre le Polygon Edge peut désormais spécifier le gestionnaire des secrets qu'il souhaite utiliser, et dès que le bon gestionnaire de secrets est instancié, les modules traitent les secrets via l'interface mentionnée - sans se soucier de savoir si les secrets sont stockés sur un disque ou sur un serveur.

Cet article détaille les étapes nécessaires pour que le Polygon Edge soit opérationnel avec un serveur [Hashicorp Vault](https://www.vaultproject.io/).

:::info guides précédents

Il est **fortement recommandé** qu'avant de parcourir cet article, les articles sur [**Configuration locale**](/docs/edge/get-started/set-up-ibft-locally)
et [**Configuration cloud**](/docs/edge/get-started/set-up-ibft-on-the-cloud) soient lus.
:::


## Prérequis {#prerequisites}

Cet article suppose qu'une instance de fonctionnement du serveur Hashicorp Vault **est déjà configurée**.

De plus, il est nécessaire que le serveur Hashicorp Vault utilisé pour le Polygon Edge ait **activé le stockage KV**.

Informations requises avant de continuer:
* **L'URL du serveur** (l'URL de l'API du serveur Hashicorp Vault)
* **Jeton** (jeton d'accès utilisé pour accéder au moteur de stockage KV)

## Étape 1 - Générer la configuration du gestionnaire de secrets {#step-1-generate-the-secrets-manager-configuration}

Pour que le Polygon Edge puisse communiquer de manière transparente avec le serveur Vault, il doit analyser un fichier de configuration déjà généré, qui contient toutes les informations nécessaires pour le stockage de secrets sur Vault.

Pour générer la configuration, exécutez la commande suivante:

```bash
polygon-edge secrets generate --dir <PATH> --token <TOKEN> --server-url <SERVER_URL> --name <NODE_NAME>
```

Paramètres présents:
* `PATH` est le chemin vers lequel le fichier de configuration doit être exporté.  Par Défaut `./secretsManagerConfig.json`
* `TOKEN` est le jeton d'accès mentionné précédemment dans la [section des prérequis](/docs/edge/configuration/secret-managers/set-up-hashicorp-vault#prerequisites)
* `SERVER_URL` est l'URL de l'API pour le serveur Vault, également mentionnée dans la [section des prérequis](/docs/edge/configuration/secret-managers/set-up-hashicorp-vault#prerequisites)
* `NODE_NAME` est le nom du nœud actuel pour lequel la configuration Vault est installée. Il peut s'agir d'une valeur arbitraire.  Par Défaut `polygon-edge-node`

:::caution Les noms de nœud

Soyez prudent lorsque vous spécifiez des noms de nœud.

Le Polygon Edge utilise le nom de nœud spécifié pour suivre les secrets qu'il génère et utilise sur l'instance de Vault. La spécification d'un nom de nœud existant peut entraîner l'écrasement des données sur le serveur de Vault.

Les secrets sont stockés sur le chemin de base suivant: `secrets/node_name`
:::

## Étape 2 - Initialiser les clés secrètes à l'aide de la configuration {#step-2-initialize-secret-keys-using-the-configuration}

Maintenant que le fichier de configuration est présent, nous pouvons initialiser les clés secrètes requises avec le fichier de configuration le fichier est configuré à l'étape 1, à l'aide de `--config`:

```bash
polygon-edge secrets init --config <PATH>
```

Le `PATH` param est l'emplacement du paramètre de gestionnaire des secrets généré précédemment à l'étape 1.

## Étape 3 - Générer le fichier de genèse {#step-3-generate-the-genesis-file}

Le fichier de genèse doit être généré de la même manière que la [**Configuration Locale**](/docs/edge/get-started/set-up-ibft-locally) et les guides de [**Configuration du Cloud**](/docs/edge/get-started/set-up-ibft-on-the-cloud), avec des modifications mineures.

Étant donné que Hashicorp Vault est utilisé à la place du système de fichiers local, les adresses de validateur doivent être ajoutées via `--ibft-validator` l'option:
```bash
polygon-edge genesis --ibft-validator <VALIDATOR_ADDRESS> ...
```

## Étape 4 - Démarrer le client de Polygon Edge {#step-4-start-the-polygon-edge-client}

Maintenant que les clés sont configurées et que le fichier de genèse est généré, la dernière étape de ce processus serait de démarrer le Polygon Edge avec la `server` commande.

La `server` commande  est utilisée de la même manière que dans les guides mentionnés précédemment, avec un ajout mineur - l'`--secrets-config`indicateur :
```bash
polygon-edge server --secrets-config <PATH> ...
```

Le `PATH` param est l'emplacement du paramètre de gestionnaire des secrets généré précédemment à l'étape 1.
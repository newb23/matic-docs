---
id: set-up-aws-ssm
title: Configuration d’AWS SSM (Systems Manager)
description: "Configuration d’AWS SSM (Systems Manager) pour Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - aws
  - ssm
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

Cet article détaille les étapes nécessaires afin de rendre le Polygon Edge opérationnel avec
[AWS Systems Manager Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html).

:::info guides précédents

Il est **fortement recommandé** qu'avant de parcourir cet article, les articles sur [**Configuration locale**](/docs/edge/get-started/set-up-ibft-locally)
et [**Configuration cloud**](/docs/edge/get-started/set-up-ibft-on-the-cloud) soient lus.
:::


## Prérequis {#prerequisites}
### Politique IAM {#iam-policy}
L'utilisateur doit créer une politique IAM qui autorise les opérations de lecture et d'écriture pour AWS Systems Manager Parameter Store.
 Après avoir correctement créé la politique IAM, l'utilisateur doit l'attacher à l'instance EC2 qui exécute le serveur de Polygon Edge.
 La politique IAM doit ressembler à ceci :
```json
{
  "Version": "2012-10-17",
  "Statement" : [
    {
      "Effect" : "Allow",
      "Action" : [
        "ssm:PutParameter",
        "ssm:DeleteParameter",
        "ssm:GetParameter"
      ],
      "Resource" : [
        "arn:aws:ssm:<aws_region>:<aws_account_id>:parameter<ssm-parameter-path>*"
      ]
    }
  ]
}
```
Vous trouverez de plus amples informations sur les rôles IAM d'AWS SSM dans les [documents AWS](https://docs.aws.amazon.com/systems-manager/latest/userguide/setup-instance-profile.html).

Informations requises avant de continuer :
* **Région** (la région dans laquelle Systems Manager et les nœuds réside)
* **Chemin de paramètre** (chemin arbitraire dans lequel le secret sera placé, par exemple `/polygon-edge/nodes`)

## Étape 1 - Générez la configuration du gestionnaire de secrets {#step-1-generate-the-secrets-manager-configuration}

Pour que Polygon Edge puisse communiquer de manière transparente avec AWS SSM, il doit analyser un
fichier de configuration déjà généré, qui contient toutes les informations nécessaires au stockage des secrets sur l'AWS SSM.

Pour générer la configuration, exécutez la commande suivante :

```bash
polygon-edge secrets generate --type aws-ssm --dir <PATH> --name <NODE_NAME> --extra region=<REGION>,ssm-parameter-path=<SSM_PARAM_PATH>
```

Paramètres présents:
* `PATH` est le chemin vers lequel le fichier de configuration doit être exporté. `./secretsManagerConfig.json` Par défaut
* `NODE_NAME` est le nom du nœud actuel pour lequel la configuration AWS SSM est en cours de définition. Il peut s'agir d'une valeur arbitraire. `polygon-edge-node` Par défaut
* `REGION` est la région dans laquelle le SSM AWS réside dans le système. Il doit s'agir de la même région que le nœud utilisant AWS SSM.
* `SSM_PARAM_PATH` est le nom du chemin dans lequel le secret sera stocké. Par exemple, si `--name node1` et `ssm-parameter-path=/polygon-edge/nodes`
sont spécifiés, le secret sera stocké en tant que .`/polygon-edge/nodes/node1/<secret_name>`

:::caution Noms de nœud

Soyez prudent lorsque vous spécifiez les noms de nœud.

Polygon Edge utilise le nom de nœud spécifié pour suivre les secrets qu'il génère et utilise sur AWS SSM.
Spécifier un nom de nœud existant peut avoir pour conséquence l'échec de l'écriture du secret dans AWS SSM.

Les secrets sont stockés sur le chemin de base suivant : `SSM_PARAM_PATH/NODE_NAME`

:::

## Étape 2 - Initialiser les clés secrètes à l'aide de la configuration {#step-2-initialize-secret-keys-using-the-configuration}

Maintenant que le fichier de configuration est présent, nous pouvons initialiser les clés secrètes requises avec le fichier de configuration le fichier est configuré à l'étape 1, à l'aide de `--config`:

```bash
polygon-edge secrets init --config <PATH>
```

Le paramètre `PATH` est l'emplacement du paramètre du gestionnaire de secrets généré précédemment à l'étape 1.

:::info Politique IAM

Cette étape échouera si la politique IAM qui autorise les opérations de lecture/écriture n'est pas configurée correctement ou n'est pas attachée à l'instance EC2 qui exécute cette commande.

:::

## Étape 3 - Générez le fichier de genèse {#step-3-generate-the-genesis-file}

Le fichier de genèse doit être généré de la même manière que la [**Configuration Locale**](/docs/edge/get-started/set-up-ibft-locally) et les guides de [**Configuration du cloud**](/docs/edge/get-started/set-up-ibft-on-the-cloud), avec des modifications mineures.

Étant donné qu’AWS SSM est utilisé à la place du système de fichiers local, les adresses de validateur doivent être ajoutées via l'`--ibft-validator`indicateur  :
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
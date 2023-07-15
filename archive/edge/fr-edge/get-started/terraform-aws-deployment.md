---
id: terraform-aws-deployment
title: Déploiement d'AWS Terraform
description: "DéployeZ le réseau de Polygon Edge sur le fournisseur de cloud AWS à l'aide de Terraform"
keywords:
  - docs
  - polygon
  - edge
  - deployment
  - terraform
  - aws
  - script
---
:::info Guide de déploiement de la production

Il s'agit du guide de déploiement AWS officiel, prêt pour la production et entièrement automatisé.

Les déploiements manuels dans le ***[Cloud](set-up-ibft-on-the-cloud)*** ou ***[Local](set-up-ibft-locally)***
sont recommandés pour les tests et/ou si votre fournisseur de cloud n'est pas AWS.
:::

:::info

Ce déploiement est uniquement compatible à PoA.   
Si un mécanisme PoS est nécessaire, suivez simplement ce ***[guide](/docs/edge/consensus/migration-to-pos)*** maintenant pour passer du PoA au PoS.

:::

Ce guide décrira en détail le processus de déploiement d'un réseau blockchain de Polygon Edge sur le fournisseur de cloud AWS, qui est prêt pour la production, car les nœuds de validation sont répartis sur plusieurs zones de disponibilité.

## Prérequis {#prerequisites}

### Outils du système {#system-tools}
* [terraform](https://www.terraform.io/)
* [aws cli](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
* [Identifiant de clé d'accès aws et clé d'accès secrète](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-prereqs.html#getting-started-prereqs-keys)

### Variables de Terraform {#terraform-variables}
Deux variables qui doivent être fournies, avant d'exécuter le déploiement:

* `alb_ssl_certificate` - l'ARN du certificat provenant d'AWS Certificate Manager à utiliser par ALB pour le protocole https.   
  Le certificat doit être généré avant de commencer le déploiement, et il doit avoir le statut **Émis**
* `premine` - le compte qui recevra la devise native préminée.
La valeur doit suivre la spécification officielle de l'indicateur [CLI](/docs/edge/get-started/cli-commands#genesis-flags)

## Informations de déploiement {#deployment-information}
### Ressources déployées {#deployed-resources}
Aperçu de haut niveau des ressources qui seront déployées :

* VPC dédié
* 4 nœuds de validation (qui sont également des nœuds de démarrage)
* 4 passerelles NAT pour autoriser le trafic Internet sortant des nœuds
* Fonction lambda utilisée pour générer le premier bloc (genesis) et démarrer la chaîne
* Groupes de sécurité dédiés et rôles IAM
* Compartiment S3 utilisé pour stocker le fichier genesis.json
* Équilibreur de charge d'application utilisé pour exposer le point de terminaison JSON-RPC

### Tolérance d'erreurs {#fault-tolerance}

Seules les régions qui ont 4 zones de disponibilité sont requises pour ce déploiement. Chaque nœud est déployé dans une seule AZ (zone de disponibilité).

En plaçant chaque nœud dans une seule zone de disponibilité, l'ensemble du cluster de la blockchain est tolérant aux erreurs en cas de défaillance d'un seul nœud (AZ), car Polygon Edge implémente le consensus IBFT
qui permet à un seul nœud d'échouer dans un cluster de 4 nœuds validateurs.

### Accès à la ligne de commande {#command-line-access}

Les nœuds de validation ne sont en aucun cas exposés à l'Internet public (JSON-PRC est accessible uniquement via ALB) et ils n'ont même pas d'adresses IP publiques qui leur sont attachées.  
L'accès à la ligne de commande du nœud n'est possible que via [AWS Systems Manager - Session Manager](https://aws.amazon.com/systems-manager/features/).

### Mise à niveau de l'AMI de base {#base-ami-upgrade}

Ce déploiement utilise `ubuntu-focal-20.04-amd64-server` AWS AMI. Il **ne** déclenchera pas le *redéploiement* EC2 si l'AWS AMI est mise à jour.

Si, pour une raison quelconque, l'AMI de base doit être mise à jour, cela peut être réalisé en exécutant la commande `terraform taint` pour chaque instance, avant que `terraform apply`.   
des instances ne puissent être entachées en exécutant la commande    
`terraform taint module.instances[<instance_number>].aws_instance.polygon_edge_instance`commande

Exemple :
```shell
terraform taint module.instances[0].aws_instance.polygon_edge_instance
terraform taint module.instances[1].aws_instance.polygon_edge_instance
terraform taint module.instances[2].aws_instance.polygon_edge_instance
terraform taint module.instances[3].aws_instance.polygon_edge_instance
terraform apply
```

:::info

Dans un environnement de production, `terraform taint` doivent être exécutés un par un afin de maintenir le réseau blockchain opérationnel.

:::

## Procédure de déploiement {#deployment-procedure}

### Étapes de pré-déploiement {#pre-deployment-steps}
* lisez le fichier readme [polygon-technology-edge](https://registry.terraform.io/modules/aws-ia/polygon-technology-edge/aws) du registre terraform
* ajoutez le module `polygon-technology-edge` à votre fichier `main.tf` en utilisant les *instructions de mise à disposition* sur la page readme des modules
* exécutez la `terraform init`commande  pour installer toutes les dépendances Terraform nécessaires
* fournissez un nouveau certificat dans [AWS Certificate Manager](https://aws.amazon.com/certificate-manager/)
* assurez-vous que le certificat fourni est dans l'état **Émis** et notez **l'ARN** du certificat
* configurez votre instruction de sortie afin d'obtenir la sortie des modules dans la cli

#### `main.tf` exemple {#example}
```terraform
module "polygon-edge" {
  source  = "aws-ia/polygon-technology-edge/aws"
  version = ">=0.0.1"

  premine             = var.premine
  alb_ssl_certificate = var.alb_ssl_certificate
}

output "json_rpc_dns_name" {
  value       = module.polygon-edge.jsonrpc_dns_name
  description = "The dns name for the JSON-RPC API"
}

variable "premine" {
  type        = string
  description = "Public account that will receive premined native currency"
}

variable "alb_ssl_certificate" {
  type        = string
  description = "The ARN of SSL certificate that will be placed on JSON-RPC ALB"
}
```

#### `terraform.tfvars` exemple {#example-1}
```terraform
premine             = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
alb_ssl_certificate = "arn:aws:acm:us-west-2:123456789:certificate/64c7f117-61f5-435e-878b-83186676a8af"
```

### Étapes de déploiement {#deployment-steps}
* créez le `terraform.tfvars`fichier
* définissez les variables terraform requises dans ce fichier (comme expliqué ci-dessus).
:::info
Il existe d'autres variables non obligatoires qui peuvent entièrement personnaliser ce déploiement. Vous pouvez remplacer les valeurs par défaut en ajoutant les vôtres au fichier `terraform.tfvars`.

  La spécification de toutes les variables disponibles peut être trouvée dans le ***[registre](https://registry.terraform.io/modules/aws-ia/polygon-technology-edge/aws)*** Terraform des modules

:::
* assurez-vous que vous avez correctement configuré une authentification aws cli en exécutant `aws s3 ls` - il ne devrait y avoir aucune erreur
* déployez l'infrastructure `terraform apply`

### Étapes du post-déploiement {#post-deployment-steps}
* une fois le déploiement terminé, notez la valeur de la variable `json_rpc_dns_name` imprimée dans la cli
* créez un enregistrement DNS public cname pointant votre nom de domaine vers la valeur `json_rpc_dns_name` fournie. Par exemple :
  ```shell
  # BIND syntax
  # NAME                            TTL       CLASS   TYPE      CANONICAL NAME
  rpc.my-awsome-blockchain.com.               IN      CNAME     jrpc-202208123456879-123456789.us-west-2.elb.amazonaws.com.
  ```
* une fois l'enregistrement cname propagé, vérifiez si la chaîne fonctionne correctement en appelant votre point de terminaison JSON-PRC.   
À partir de l'exemple ci-dessus :
  ```shell
    curl  https://rpc.my-awsome-blockchain.com -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
  ```

## Détruisez la procédure {#destroy-procedure}
:::warning

La procédure suivante supprimera définitivement l'ensemble de votre infrastructure déployée avec ces scripts terraform.    
Assurez-vous que vous disposez de [sauvegardes de données de blockchain](docs/edge/working-with-node/backup-restore) appropriées et/ou que vous travaillez avec un environnement de test.

:::

Si vous devez supprimer toute l'infrastructure, exécutez la commande suivante `terraform destroy`.   
De plus, vous devrez supprimer manuellement les secrets stockés dans [Parameter Store](https://aws.amazon.com/systems-manager/features/) d'AWS
pour la région où le déploiement a eu lieu.

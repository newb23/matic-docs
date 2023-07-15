---
id: validator-hosting
title: Hébergement du Validateur
description: "Exigences d'hébergement pour Polygon Edge"
keywords:
- docs
- polygon
- edge
- hosting
- cloud
- setup
- validator
---

Vous trouverez ci-dessous les suggestions pour héberger correctement un nœud de validation dans un réseau Polygon Edge. Veuillez porter une attention particulière à tous les éléments énumérés ci-dessous pour vous assurer que votre configuration de validateur est correctement configurée pour être sécurisée, stable et performante.

## Base de connaissances {#knowledge-base}

Avant d'essayer d'exécuter le nœud de validation, veuillez lire attentivement ce document.   
Les documents supplémentaires qui pourraient être utiles sont :

- [Installation](get-started/installation)
- [Configuration Cloud](get-started/set-up-ibft-on-the-cloud)
- [Commandes CLI](get-started/cli-commands)
- [Fichier de configuration du serveur](configuration/sample-config)
- [Clés privées](configuration/manage-private-keys)
- [Mesures Prometheus](configuration/prometheus-metrics)
- [Gestionnaires de secrets](/docs/category/secret-managers)
- [Sauvegarde/Restauration](working-with-node/backup-restore)

## Recommandation minimum du système {#minimum-system-requirements}

| Type | Valeur | Influencée par |
|------|------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|
| CPU | 2 centres | <ul><li>Nombre de requêtes JSON-RPC</li><li>Taille de l'état de la blockchain</li><li>Limite de gaz du bloc</li><li>Temps de bloc</li></ul> |
| RAM | 2 Go | <ul><li>Nombre de requêtes JSON-RPC</li><li>Taille de l'état de la blockchain</li><li>Limite de gaz du bloc</li></ul> |
| Disque | <ul><li>Partition de root de 10 Go</li><li>Partition de root de 30 Go avec LVM pour l'extension de disque</li></ul> | <ul><li>Taille de l'état de la blockchain</li></ul> |


## Configuration de service {#service-configuration}

`polygon-edge` binaire doit s'exécuter automatiquement en tant que service de système lors de l'établissement de la connectivité du réseau et avoir des fonctionnalités de démarrage / arrêt / redémarrage
. Nous vous recommandons d'utiliser un gestionnaire de service comme `systemd.`

Exemple `systemd` de fichier de configuration du système:
```
[Unit]
Description=Polygon Edge Server
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=10
User=ubuntu
ExecStart=/usr/local/bin/polygon-edge server --config /home/ubuntu/polygon/config.yaml

[Install]
WantedBy=multi-user.target
```

### Binaire {#binary}

Dans les charges de travail de production, `polygon-edge` le binaire doit être seulement déployé à partir des binaires de version GitHub pré-construits - et non par compilation manuelle.
:::info

En compilant manuellement `develop` la branche de GitHub, vous pouvez introduire des modifications radicales dans votre environnement.    Pour cette raison, il est recommandé de déployer le binaire de Polygon Edge exclusivement à partir des versions, car il contiendra des informations sur les changements avec rupture et sur la façon de les surmonter.
:::

Veuillez vous référer à [Installation](/docs/edge/get-started/installation) pour un aperçu complet de la méthode d'installation.

### Stockage de données {#data-storage}

Le dossier `data/` contenant l'état complet de la blockchain doit être monté sur un disque / volume dédié permettant de faire les sauvegardes de disque automatiques, l'extension de volume et éventuellement le montage de disque / volume sur une autre instance en cas de panne.


### Le registre des Fichiers {#log-files}

Le registre des fichiers doivent être tournés quotidiennement (avec un outil comme `logrotate`).
:::warning
S'ils sont configurés sans rotation des journaux, le registre des fichiers peuvent utiliser tout l'espace de disque disponible, ce qui peut perturber la disponibilité du validateur.
:::

Exemple de `logrotate`configuration:
```
/home/ubuntu/polygon/logs/node.log
{
        rotate 7
        daily
        missingok
        notifempty
        compress
        prerotate
                /usr/bin/systemctl stop polygon-edge.service
        endscript
        postrotate
                /usr/bin/systemctl start polygon-edge.service
        endscript
}
```


Reportez-vous à la section de [Registre](#logging) ci-dessous pour obtenir des recommandations sur le stockage des registres.

### Dépendances supplémentaires {#additional-dependencies}

`polygon-edge` est compilé statiquement, ne nécessitant aucune dépendance supplémentaire du système d'exploitation hôte.

## Maintenance {#maintenance}

Vous trouverez ci-dessous les meilleures pratiques pour maintenir un nœud de validation en cours d'exécution d'un réseau de Polygon Edge.

### Sauvegarde {#backup}

Il existe deux types de procédures de sauvegarde recommandées pour les nœuds de Polygon Edge.

La suggestion est d'utiliser les deux, dans la mesure du possible, avec la sauvegarde de Polygon Edge étant une option toujours disponible.

* ***Sauvegarde du volume***:    
  Sauvegarde incrémentale quotidienne du `data/` volume du nœud de Polygon Edge, ou de la VM complète si possible.


* ***Sauvegarde de Polygon Edge***:    
  Un travail CRON quotidien qui effectue des sauvegardes régulières de Polygon Edge et qui déplace les fichiers `.dat` vers un emplacement hors site ou vers un stockage d'objets cloud sécurisé est recommandé.

La sauvegarde de Polygon Edge ne devrait idéalement pas dupliquer la sauvegarde de Volume décrite ci-dessus.

Référez-vous à [l'instance du nœud de Sauvegarde/restauration](working-with-node/backup-restore) pour obtenir des instructions sur la façon d'effectuer des sauvegardes de Polygon Edge.

### Registre {#logging}

Les registres générés par les nœuds de Polygon Edge doivent:
- être envoyés à un magasin de données externe avec des capacités d'indexation et de recherche
- ayant une période de rétention du registre de 30 jours

Si c'est la première fois que vous configurez un validateur de Polygon Edge, nous vous recommandons de démarrer le nœud
avec la possibilité `--log-level=DEBUG` de déboguer rapidement tous les problèmes que vous pourriez rencontrer.

:::info

Le `--log-level=DEBUG` rendra la sortie du registre de nœud aussi détaillée que possible.   
Les registres de débogage augmenteront considérablement la taille du fichier de registre qui doit être pris en compte lors de la configuration
de la solution de rotation de registre.

:::
### Les pièces de sécurité du Système d'Exploitation {#os-security-patches}

Les administrateurs doivent s'assurer que le Système d'Exploitation de l'instance du validateur est toujours mis à jour avec les derniers correctifs au moins une fois par mois.

## Métriques {#metrics}

### Les métriques du système {#system-metrics}

Les administrateurs doivent configurer une sorte de moniteur des métriques du système (par exemple, Telegraf + InfluxDB + Grafana ou un SaaS tiers).

Les métriques qui doivent être surveillées et être configurées pour les notifications d'alarme:

| Nom de la métrique | Niveau d'alarme |
|-----------------------|-------------------------------|
| Utilisation du processeur (%) | > 90% pendant plus de 5 minutes |
| Utilisation de RAM (%) | > 90% pendant plus de 5 minutes |
| Utilisation du disque de root | > 90% |
| Utilisation du disque de données | > 90% |

### Les métriques du validateur {#validator-metrics}

Les administrateurs doivent configurer la collection de métriques à partir de l'API Prometheus de Polygon Edge pour être capable de surveiller les performances de la blockchain.

Référez-vous à des [métriques Prometheus](configuration/prometheus-metrics) pour comprendre quelles métriques sont exposées et comment configurer la collection des métriques Prometheus.


Une attention particulière doit être accordée aux mesures suivantes:
- ***Le temps de production de bloc*** - si le temps de production de bloc est supérieur à la normale, il y a un problème potentiel avec le réseau
- ***Nombre de tours de consensus*** - s'il y a plus d'1 tour, il y aura un problème potentiel avec le validateur défini dans le réseau
- ***Nombre de pairs*** - si le nombre de pairs chute, il y a un problème de connectivité dans le réseau

## Securité {#security}

Vous trouverez ci-dessous les meilleures pratiques pour sécuriser un nœud de validation en cours d'exécution d'un réseau de Polygon Edge.

### Services d'API {#api-services}

- ***JSON-RPC*** -
Seuls les service d'API doivent être exposés au public (via un équilibreur de charge ou directement).   
Cette API doit s'exécuter sur toutes les interfaces ou sur une adresse IP spécifique (exemple: `--json-rpc 0.0.0.0:8545` ou `--json-prc 192.168.1.1:8545`).
:::info

Comme il s'agit d'une API publique, il est recommandé d'avoir un équilibreur de charge ou un proxy inverse devant lui, pour assurer la sécurité et la limitation du débit.

:::


- ***LibP2P*** -
Il s'agit de l'API de mise en réseau utilisée par les nœuds pour la communication entre pairs. Il doit fonctionner sur toutes les interfaces ou sur une adresse IP spécifique
( `--libp2p 0.0.0.0:1478` ou `--libp2p 192.168.1.1:1478` ). Cette API ne doit pas être exposée au publique,
mais elle doit être accessible depuis tous les autres nœuds.
:::info

S'il est exécuté sur localhost, (`--libp2p 127.0.0.1:1478`) les autres nœuds ne pourront pas se connecter.

:::


- ***GRPC*** -
Cette API est utilisée uniquement pour exécuter des commandes d'opérateur et rien d'autres. En tant que tel, elle doit s'exécuter exclusivement sur localhost ( `--grpc-address 127.0.0.1:9632` ).

### Les secrets de Polygone Edge {#polygon-edge-secrets}

Les secrets de Polygon Edge ( `ibft` et des `libp2p` clés ) ne doivent pas être stockés sur un système de fichiers local.  
Au lieu de cela, un [Gestionnaire de Secret](configuration/secret-managers/set-up-aws-ssm) pris en charge doit être utilisé.   
Le stockage des secrets dans le système de fichiers local doit être seulement utilisé dans des environnements de non-production.

## Mise À Jour {#update}

Vous trouverez ci-dessous la procédure de mise à jour souhaitée pour les nœuds de validation, décrite sous forme d'instructions détaillées.

### Procédure de mise à jour {#update-procedure}

- Téléchargez le dernier binaire de Polygon Edge à partir des [versions](https://github.com/0xPolygon/polygon-edge/releases) officielles du GitHub
- Arrêtez le service de Polygon Edge ( exemple: `sudo systemctl stop polygon-edge.service` )
- Remplacez le `polygon-edge` binaire existant par celui téléchargé ( par exemple: `sudo mv polygon-edge /usr/local/bin/` )
- Vérifiez si la `polygon-edge` version correcte est en place en exécutant `polygon-edge version` - elle doit correspondre à la version publiée
- Vérifiez la documentation de la version s'il y a des étapes de rétrocompatibilité à effectuer avant de démarrer le `polygon-edge` service
- Démarrez `polygon-edge` le service ( exemple: `sudo systemctl start polygon-edge.service` )
- Enfin, vérifiez la sortie du registre `polygon-edge` et assurez-vous que tout fonctionne sans aucun registre `[ERROR]`

:::warning

Lorsqu'il y a une version de rupture, cette procédure de mise à jour doit être effectuée sur tous les nœuds, car
le binaire en cours d'exécution n'est pas compatible avec la nouvelle version.

Cela signifie que la chaîne doit être arrêtée pendant une courte période ( jusqu'à ce que les `polygon-edge` binaires soient remplacés et que le service redémarre )
alors plannifiez en conséquence.

Vous pouvez utiliser des outils comme **[Ansible](https://www.ansible.com/)** ou un scénario personnalisé pour effectuer la mise à jour efficacement
et minimiser les temps d'arrêt de la chaîne.

:::

## Procédure de démarrage {#startup-procedure}

Voici le flux souhaité de la procédure de démarrage pour le validateur de Polygon Edge

- Lisez les documents répertoriés dans la section de [Base Des Connaissances](#knowledge-base)
- Appliquez les derniers correctifs du Système d'Exploitation sur le nœud du validateur
- Téléchargez le dernier `polygon-edge` fichier binaire  à partir des [versions](https://github.com/0xPolygon/polygon-edge/releases) officielles du GitHub et placez-le dans une instance locale `PATH`
- Initialisez l'un des [gestionnaires de secrets](/docs/category/secret-managers) pris en charge en utilisant `polygon-edge secrets generate` la commande CLI
- Générez et stockez des secrets en utilisant la `polygon-edge secrets init` [commande CLI](/docs/edge/get-started/cli-commands#secrets-init-flags)
- Prendre note de `Public key (address)` et `NodeID` des valeurs
- Générez `genesis.json` le fichier comme décrit dans la [configuration de cloud](get-started/set-up-ibft-on-the-cloud#step-3-generate-the-genesis-file-with-the-4-nodes-as-validators) en utilisant la `polygon-edge genesis` [commande CLI](/docs/edge/get-started/cli-commands#genesis-flags)
- Générer le fichier de configuration par défaut en utilisant la `polygon-edge server export` [commande CLI](/docs/edge/configuration/sample-config)
- Modifier `default-config.yaml` le fichier pour s'adapter à l'environnement du nœud de validation local ( les trajectoires de fichiers, etc. )
- Créez un service de Polygon Edge (`systemd` ou similaire) où le fichier binaire `polygon-edge` dirigera le serveur à partir d'un `default-config.yaml` fichier
- Démarrez le serveur de Polygon Edge en démarrant le service ( exemple: `systemctl start polygon-edge` )
- Vérifiez la sortie du registre `polygon-edge` et assurez-vous que les blocs sont générés et qu'il n'y a pas de `[ERROR]` registres
- Vérifiez la fonctionnalité de la chaîne en appelant une méthode JSON-RPC comme [`eth_chainId`](/docs/edge/api/json-rpc-eth#eth_chainid)

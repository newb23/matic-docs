---
id: manage-private-keys
title: Gérer les clés privées
description: "Comment gérer les clés privées et quels types de clés existent."
keywords:
  - docs
  - polygon
  - edge
  - private
  - key
  - keystore
---

## Aperçu {#overview}

Polygon Edge dispose de deux types de clés privées qu'il gère directement:

* **Clé privée utilisée pour le mécanisme de consensus**
* **Clé privée utilisée pour la mise en réseau par libp2p**
* **(Facultatif) Clé Privée de BLS utilisée pour le mécanisme de consensus afin d'agréger les signatures des validateurs**

Actuellement, Polygon Edge n'offre pas de prise en charge de la gestion directe des comptes.

Sur la base de la structure de répertoire décrite dans le [guide de Sauvegarde et de Restauration](/docs/edge/working-with-node/backup-restore), Polygon Edge stocke ces fichiers de clés mentionnés dans deux répertoires distincts - **consensus** et **keystore**.

## Format de clé {#key-format}

Les clés privées sont stockées au **format Base64** simple, elles peuvent donc être lisibles par l'homme et portables.

```bash
# Example private key
0802122068a1bdb1c8af5333e58fe586bc0e9fc7aff882da82affb678aef5d9a2b9100c0
```

:::info Type de Clé

Tous les fichiers de clé privée générés et utilisés à l'intérieur de Polygon Edge reposent sur ECDSA avec la courbe [secp256k1](https://en.bitcoin.it/wiki/Secp256k1).

Comme la courbe n'est pas standard, elle ne peut être encodée et stockée dans aucun format PEM standardisé. L'importation de clés non conformes à ce type de clé n'est pas prise en charge.
:::
## La Clé Privée du Consensus {#consensus-private-key}

Le fichier de clé privée mentionné comme la *clé privée du consensus* est également la  **clé privée du validateur**. Cette clé privée est utilisée lorsque le nœud agit en tant que validateur dans le réseau et doit signer de nouvelles données.

Le fichier de clé privée se trouve dans `consensus/validator.key`, et respecte le [format de clé](/docs/edge/configuration/manage-private-keys#key-format) mentionné.

:::warning

La clé privée du validateur est unique pour chaque nœud de validateur. La même clé ne doit <b>pas</b> être partagée entre tous les validateurs, car cela pourrait compromettre la sécurité de votre chaîne.
:::

## La Clé Privée De Mise En Réseau {#networking-private-key}

Le fichier de clé privée mentionné pour la mise en réseau est utilisé par libp2p pour générer le PeerID correspondant, et cela permet au nœud de participer au réseau.

Il se trouve dans `keystore/libp2p.key`, et respecte le [format de clé](/docs/edge/configuration/manage-private-keys#key-format) mentionné.

## Clé Secrète De BLS {#bls-secret-key}

Le fichier de clé secrète de BLS est utilisé pour agréger les sceaux validés dans la couche du consensus. La taille des sceaux validés agrégés par BLS est inférieure à celle des signatures ECDSA validées sérialisées.

La fonction BLS est facultative et il est possible de choisir d'utiliser BLS ou non. Référez-vous à [BLS](/docs/edge/consensus/bls) pour plus de détails.

## Importer / Exporter {#import-export}

Comme les fichiers de clé sont stockés au format Base64 simple sur disque, ils peuvent être facilement sauvegardés ou importés.

:::caution Modification des fichiers de clé

Tout type de modification apportée aux fichiers de clés sur un réseau déjà configuré / en cours d'exécution peut entraîner de graves perturbations du réseau/consensus, étant donné que les mécanismes de consensus et de découverte par les pairs stockent les données dérivées de ces clés dans un stockage spécifique au nœud et s'appuient sur ces données pour initier des connexions et exécuter une logique de consensus

:::
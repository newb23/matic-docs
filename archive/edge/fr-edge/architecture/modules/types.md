---
id: types
title: Types
description: Explication pour le module de types de Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - types
  - marshaling
---

## Aperçu {#overview}

Le module **Types** implémente des types d'objet de base, tels que:

* **Adresse**
* **Identifiant**
* **En-tête**
* beaucoup de fonctions d'aide

## Encodage / Décodage RLP {#rlp-encoding-decoding}

Contrairement aux clients tels que GETH, le Polygon Edge n'utilise pas la réflexion pour l'encodage.<br />
 Nous avons préféré ne pas utiliser la réflexion, car celle-ci introduit de nouveaux problèmes, tels que la détérioration
 des performances, et une mise à l'échelle plus difficile.

Le module **Types** offre une interface facile à utiliser pour la sérialisation et la désérialisation de RLP, en utilisant l'ensemble de FastRLP.

La sérialisation est effectuée au moyen des méthodes *MarshalRLPWith* et *MarshalRLPTo*. Les méthodes analogues existent pour
 la désérialisation.

En définissant manuellement ces méthodes, le Polygon Edge n'a pas besoin d'utiliser la réflexion. Dans *rlp_marshal.go*, vous pouvez trouver
 des méthodes de sérialisation:

* **Corps**
* **Blocs**
* **En-têtes**
* **Reçus**
* **Registres**
* **Transactions**
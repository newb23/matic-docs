---
id: gas
title: FAQ sur le Gaz
description: "FAQ sur le gaz pour Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - FAQ
  - validators

---

## Comment appliquer un prix de gaz minimum? {#how-to-enforce-a-minimum-gas-price}
Vous pouvez utiliser l'indicateur `--price-limit` fourni sur la commande du serveur. Cela obligera votre nœud à accepter uniquement les transactions dont le gaz est supérieur ou égal à la limite de prix que vous avez définie. Pour s'assurer qu'elle est appliquée sur l'ensemble du réseau, vous devez vous assurer que tous les nœuds ont la même limite de prix.


## Pouvez-vous avoir des transactions sans frais de gaz ? {#can-you-have-transactions-with-0-gas-fees}
Oui, c'est possible. La limite de prix par défaut que les nœuds appliquent est `0`, ce qui signifie que les nœuds accepteront les transactions dont le prix du gaz est fixé à `0`.

## Comment définir la quantité totale d'approvisionnement du jeton de gaz (natif) ? {#how-to-set-the-gas-native-token-total-supply}

Vous pouvez définir un solde prédéfini pour les comptes (adresses) en utilisant le `--premine flag`. Veuillez noter qu'il s'agit d'une configuration du fichier de genèse, et que celle-ci ne peut être modifiée ultérieurement.

Exemple sur la façon d'utiliser le `--premine flag` :

`--premine=0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000`

Ceci établit un solde pré-miné de 1 000 ETH à l'adresse 0x3956E90e632AEbBF34DEB49b71c28A83Bc029862 (le montant de l'argument est exprimé en wei).

La quantité pré-minée du jeton de gaz constituera l'approvisionnement total. Aucune autre quantité de la monnaie native (jeton de gaz) ne peut être frappée ultérieurement.

## Edge supporte-t-il l'ERC-20 comme jeton de gaz ? {#does-edge-support-erc-20-as-a-gas-token}

Edge ne prend pas en charge le jeton ERC-20 comme jeton de gaz. Seule la monnaie native Edge est prise en charge pour le gaz.

## Comment augmenter la limite de gaz? {#how-to-increase-the-gas-limit}

Il existe deux options pour augmenter la limite de gaz dans Polygon Edge:
1. Essuyez la chaîne et augmentez `block-gas-limit`à la valeur uint64 maximale dans le fichier de genèse
2. Utilisez `--block-gas-target`l'indicateur avec une valeur élevée pour augmenter la limite de gaz de tous les nœuds. Cela nécessite un redémarrage de nœud . Explication détaillée [ici](/docs/edge/architecture/modules/txpool/#block-gas-target).
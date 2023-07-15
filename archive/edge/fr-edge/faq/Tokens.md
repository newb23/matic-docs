---
id: tokens
title: FAQ sur les Jetons
description: "FAQ sur les jetons de Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - FAQ
  - tokens
---

## Le Polygon Edge prend-il en charge la norme EIP-1559 ? {#does-polygon-edge-support-eip-1559}
Pour l'instant, le Polygon Edge ne prend pas en charge la norme EIP-1559.

## Comment définir le symbole de la devise (jeton) ? {#how-to-set-the-currency-token-symbol}

Le symbole du jeton n'est qu'un élément de l'Interface Utilisateur, il ne peut donc pas être configuré ou codé en dur sur le réseau.
 Cependant, vous pouvez le modifier lorsque vous ajoutez le réseau à un portefeuille, comme Metamask, par exemple.

## Qu'arrive-t-il aux transactions lorsqu'une chaîne s'arrête? {#what-happens-to-transactions-when-a-chain-halts}

Toutes les transactions qui n'ont pas été traitées sont à l'intérieur de la file d'attente TxPool (enqueued ou promus). Si la chaîne s'arrête (tous les blocs de production s'arrêtent ), ces transactions ne seront jamais dans des blocs.<br/> Ce n'est pas seulement le cas lorsque la chaîne s'arrête. Si les nœuds sont arrêtés ou redémarrés, toutes les transactions qui n'ont pas été exécutées et sont toujours dans TxPool, seront silencieusement supprimées.<br/> La même chose arrivera aux transactions lorsqu'un changement de rupture est introduit, car il est nécessaire que les nœuds soient redémarrés.

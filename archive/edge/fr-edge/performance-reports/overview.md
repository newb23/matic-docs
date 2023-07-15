---
id: overview
title: Aperçu
description: "Introduction aux tests de Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - performance
  - tests
  - loadbot
---
:::caution
Veuillez noter que nos , `loadbot`qui ont été utilisés pour effectuer ces tests, sont maintenant dépréciés.
:::

| Type | Valeur | Lien vers le test |
| ---- | ----- | ------------ |
| Transferts Réguliers | 1428 tps | [4 Juillet 2022](test-history/test-2022-07-04.md#results-of-eoa-to-eoa-transfers) |
| Transferts d'ERC-20 | 1111 tps | [4 Juillet 2022](test-history/test-2022-07-04.md#results-of-erc20-token-transfers) |
| Frappe de NFT | 714 tps | [4 Juillet 2022](test-history/test-2022-07-04.md#results-of-erc721-token-minting) |

---

Notre objectif est de créer un logiciel client de blockchain hautement performant, riche en fonctionnalités et facile à configurer et à entretenir. Tous les tests ont été effectués à l'aide du Polygon Edge Loadbot. Chaque rapport de performance que vous trouverez dans cette section est correctement daté, l'environnement clairement décrit et la méthode de test est clairement expliquée.

L'objectif de ces tests de performance est de montrer une performance réelle du réseau de blockchain de Polygon Edge. N'importe qui devrait pouvoir obtenir les mêmes résultats que ceux publiés ici, sur le même environnement, en utilisant notre loadbot.

Tous les tests de performance ont été menés sur la plateforme AWS sur une chaîne composée de nœuds d'instance EC2.
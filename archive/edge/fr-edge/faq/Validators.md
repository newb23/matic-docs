---
id: validators
title: FAQ des validateurs
description: "FAQ pour les validateurs de Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - FAQ
  - validators

---

## Comment ajouter/supprimer un validateur ? {#how-to-add-remove-a-validator}

### PoA {#poa}
L'ajout / la suppression de validateurs se fait par vote. Vous trouverez [ici](/docs/edge/consensus/poa) un guide complet à ce sujet.

### Preuve de Participation {#pos}
Vous pouvez trouver un guide sur la façon de faire le stake des fonds [ici](/docs/edge/consensus/pos-stake-unstake), afin qu'un nœud puisse devenir un validateur, et comment défaire le stake (supprimer le validateur).

Veuillez noter que :
- Vous pouvez utiliser l'indicateur de genèse `--max-validator-count` pour définir un nombre maximum de participants pouvant rejoindre l'ensemble de validateurs.
- Vous pouvez utiliser l'indicateur de genèse `--min-validator-count ` pour définir le nombre minimum de participants nécessaires pour rejoindre l'ensemble de validateurs (`1` par défaut).
- Lorsque le nombre maximum de validateurs est atteint, vous ne pouvez pas ajouter un autre validateur tant que vous n'en supprimez pas un existant de l'ensemble (peu importe si le montant en stake du nouveau est plus élevé). Si vous supprimez un validateur, le nombre de validateurs restants ne peut pas être inférieur à `--min-validator-count`.
- Il existe une limite par défaut `1`  d'unité de devise du réseau natif (gaz) pour devenir un validateur.



## Quelle quantité d'espace disque est recommandée pour un validateur? {#how-much-disk-space-is-recommended-for-a-validator}

Nous vous recommandons de commencer avec 100G comme piste estimée de manière prudente et de vous assurer qu'il est possible de mettre le disque à l'échelle par la suite.


## Y a-t-il une limite au nombre de validateurs? {#is-there-a-limit-to-the-number-of-validators}

Si nous parlons de limitations techniques, Polygon Edge n'a pas explicitement de plafond en ce qui concerne le nombre de nœuds que vous pouvez avoir dans un réseau. Vous pouvez définir des plafonds de connexion (nombre de connexions entrantes / sortantes) par nœud.

Si nous parlons de limitations pratiques, vous allez voir une performance plus dégradée avec un cluster à 100 nœuds qu'avec un cluster à 10 nœuds. En augmentant le nombre de nœuds dans votre cluster, vous augmentez la complexité de la communication et donc la surcharge de mise en réseau en général. Tout dépend du type de réseau que vous utilisez et du type de topologie de réseau dont vous disposez.

## Comment passer du PoA au PoS? {#how-to-switch-from-poa-to-pos}

Le PoA est le mécanisme de consensus par défaut. Dans un nouveau cluster, pour passer en PoS, vous devrez ajouter l'indicateur `--pos` lors de la génération du fichier de genèse. Si vous avez un cluster en cours d'exécution, vous pouvez trouver [ici](/docs/edge/consensus/migration-to-pos) comment effectuer le changement. Toutes les informations dont vous avez besoin sur nos mécanismes de consensus et leur configuration se trouvent dans notre [section consensus](/docs/edge/consensus/poa).

## Comment mettre à jour mes nœuds lorsqu'il y a un changement avec rupture? {#how-do-i-update-my-nodes-when-there-s-a-breaking-change}

Vous pouvez trouver un guide détaillé sur la façon d'entamer cette procédure [ici](/docs/edge/validator-hosting#update).

## Le montant minimum de staking est-il configurable pour le PoS Edge? {#is-the-minimum-staking-amount-configurable-for-pos-edge}

Le montant minimum de staking par défaut est `1 ETH`, et il n'est pas configurable.

## Pourquoi les commandes JSON RPC `eth_getBlockByNumber` et `eth_getBlockByHash` ne renvoient-elles pas l'adresse du mineur? {#not-return-the-miner-s-address}

Le consensus utilisé actuellement dans Polygon Edge est IBFT 2.0, qui, à son tour, s'appuie sur le mécanisme de vote expliqué dans Clique PoA : [ethereum/EIPs#225](https://github.com/ethereum/EIPs/issues/225).

En regardant l'EIP-225 (Clique PoA), c'est la partie pertinente qui explique à quoi sert le `miner` (aka `beneficiary`):

<blockquote>
Nous réaffectons les champs d'en-tête ethash ainsi:
<ul>
<li><b>bénéficiaire/mineur: </b> Adresse avec laquelle vous proposez de modifier la liste des signataires autorisés.</li>
<ul>
<li>Devrait être rempli de zéros normalement, modifié uniquement lors du vote.</li>
<li>Les valeurs arbitraires sont néanmoins autorisées (même celles qui n'ont pas de sens telles que le vote contre les non-signataires) pour éviter une complexité supplémentaire dans les implémentations autour des mécanismes de vote.</li>
<li> Doit être rempli de zéros sur les blocs de point de contrôle (c'est-à-dire la transition d'époque).</li>
</ul>

</ul>

</blockquote>

Ainsi, le `miner` champ est utilisé pour proposer un vote pour une certaine adresse, pas pour montrer le proposant du bloc.

Les informations sur le proposant du bloc peuvent être trouvées en récupérant la clé publique à partir du champ Seal du champ de données supplémentaires Istanbul encodé RLP dans les en-têtes de bloc.

## Quelles parties et quelles valeurs de Genèse peuvent être modifiées en toute sécurité? {#which-parts-and-values-of-genesis-can-safely-be-modified}

:::caution

Assurez-vous de créer une copie manuelle du fichier genesis.json existant avant de tenter de le modifier. Aussi, la chaîne entière doit être arrêtée avant de modifier le fichier genesis.json. Une fois que le fichier de genèse est modifié, la version la plus récente doit être distribuée sur tous les nœuds non validateurs et valdiator

:::

**Seule la section de nœuds de démarrage du fichier genèse peut être modifiée en toute sécurité**, où vous pouvez ajouter ou supprimer des nœuds de démarrage de la liste.
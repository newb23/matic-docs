---
id: syncer
title: Synchronisation
description: Explication du module de synchronisation de l'Edge de Polygon.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - synchronization
---

## Aperçu {#overview}

Ce module contient la logique du protocole de synchronisation. Il est utilisé pour synchroniser un nouveau nœud avec le réseau en cours, ou pour valider/insérer de nouveaux blocs pour les nœuds qui ne participent pas au consensus (non-validateurs).

L'Edge de Polygon utilise **libp2p** comme couche de réseau, et en plus de cela démarre **gRPC**.

L'Edge de Polygon comporte essentiellement 2 types de synchronisation:
* Synchronisation en masse  -  synchroniser un grand nombre de blocs à la fois
* Vérifier la Synchronisation - sous la base de synchronisation par bloc.

### Synchronisation en Masse {#bulk-sync}

Les étapes de la synchronisation en masse sont assez simples pour répondre à l'objectif de la synchronisation en masse, à savoir synchroniser autant de blocs (disponibles) que possible de l'autre pair pour compenser le retard, aussi rapidement que possible.

Voici le flux du processus de Synchronisation en Masse:

1. ** Déterminer si le nœud a besoin de Synchronisation en Masse ** - Dans cette étape, le nœud vérifie la carte des paires pour voir si quelqu'un possède un numéro de bloc plus grand que celui que le nœud possède localement
2. ** Trouver le meilleur pair (à l'aide de la carte des pairs de synchronisation) ** - Au cours de cette étape, le nœud trouve le meilleur pair avec lequel se synchroniser en fonction des critères mentionnés dans l'exemple ci-dessus.
3. ** Ouvrir un flux de synchronisation en masse ** - Au cours de cette étape, le nœud ouvre un flux gRPC au meilleur pair afin de synchroniser en masse les blocs à partir du numéro de bloc commun.
4. ** Le meilleur pair ferme le flux lorsqu'il a terminé l'envoi massif ** - Dans cette étape, le meilleur pair avec lequel le nœud est synchronisé fermera le flux dès qu'il aura envoyé tous les blocs disponibles qu'il détient
5. ** Lorsque la synchronisation en masse est terminée, vérifiez que le nœud est un validateur ** - Dans cette étape, le flux est fermé par le meilleur pair, et le nœud doit vérifier s'il est un validateur après la synchronisation en masse.
  * S'ils le sont, ils sortent de l'état de synchronisation et commencent à participer au consensus
  * S'ils ne le sont pas, ils continuent à ** Vérifier la Synchronisation **

### Vérifier la Synchronisation {#watch-sync}

:::info

L'étape de Vérifier la Synchronisation est exécutée uniquement si le nœud n'est pas un validateur, mais plutôt un nœud non validateur ordinaire dans le réseau qui ne fait que détecter les blocs qui arrivent.

:::

Le comportement de Vérifier la Synchronisation est assez simple, le nœud est déjà synchronisé avec le reste du réseau et a seulement besoin d'analyser les nouveaux blocs qui arrivent.

Voici le déroulement du processus de Vérifier la Synchronisation:

1. ** Ajoutez un nouveau bloc lorsque l'état d'un pair est mis à jour ** - Dans cette étape, les nœuds détectent les événements de nouveaux blocs. Lorsqu'ils ont un nouveau bloc, ils exécutent un appel de fonction gRPC, obtiennent le bloc et mettent à jour l'état local.
2. ** Vérifiez si le nœud est un validateur après avoir synchronisé le dernier bloc **
   * Si c'est le cas, il faut sortir de l'état de synchronisation
   * Si ce n'est pas le cas, il faut continuer à détecter les nouveaux événements du bloc

## Rapport sur la perfomance {#perfomance-report}

:::info

Les performances ont été mesurées sur une machine locale en synchronisant un ** million de blocs **

:::

| Nom | Résultat |
|----------------------|----------------|
| Synchroniser 1M de blocs | ~ 25 min |
| Transférer 1M de blocs | ~ 1 min |
| Nombre d'appels GRPC | 2 |
| Capacité de test | ~ 93 % |
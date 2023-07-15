---
id: prometheus-metrics
title: Les métriques Prometheus
description: "Comment activer les métriques Prometheus pour Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - metrics
  - prometheus
---

## Aperçu {#overview}

Polygon Edge peut signaler et servir les métriques Prometheus, qui à leur tour peuvent être consommées en utilisant des collecteurs Prometheus.

Les métriques Prometheus sont désactivées par défaut. Il peut être activé en spécifiant l'adresse de l'écouteur en utilisant un `--prometheus`indicateur  ou `Telemetry.prometheus`un champ dans le fichier de configuration. Les métriques seront diffusées sur `/metrics` à l'adresse indiquée.

## Les métriques disponibles {#available-metrics}

Les métriques suivantes sont disponibles:

| **Nom** | **Type** | **Description** |
|-----------------------------------------------|---------------|-------------------------------------------------|
| txpool_pending_transactions | Évaluer | Nombre de transactions en attente dans TxPool |
| consensus_validators | Évaluer | Nombre de Validateurs |
| consensus_rounds | Évaluer | Nombre de Tours |
| consensus_num_txs | Évaluer | Nombre de Transactions dans le dernier bloc |
| consensus_block_interval | Évaluer | Temps entre ce bloc et le dernier en secondes |
| network_peers | Évaluer | Nombre de pairs Connectés |
| network_outbound_connections_count | Évaluer | Nombre de connexions sortantes |
| network_inbound_connections_count | Évaluer | Nombre de connexions entrantes |
| network_pending_outbound_connections_count | Évaluer | Nombre de connexions sortantes en attente |
| network_pending_inbound_connections_count | Évaluer | Nombre de connexions entrantes en attente |
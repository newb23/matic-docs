---
id: prometheus-metrics
title: Métricas Prometheus
description: "Como ativar as métricas Prometheus para o Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - metrics
  - prometheus
---

## Visão geral {#overview}

O Polygon Edge pode relatar e servir as métricas Prometheus que, por sua vez, podem ser consumidas usando o(s) coletor(es) Prometheus.

As métricas do Prometheus estão desativadas por padrão. Ele pode ser ativado especificando o endereço do ouvinte usando `--prometheus`[sinalizador](/docs/edge/get-started/cli-commands#prometheus) ou `Telemetry.prometheus`campo no ficheiro de configuração. As métricas serão servidas sob `/metrics` no endereço especificado.

## Métricas disponíveis {#available-metrics}

Estão disponíveis as seguintes métricas:

| **Nome** | **Tipo** | **Descrição** |
|-------------------------------------------------|----------|---------------------------------------------|
| edge_txpool_pending_transactions | Gauge | Número de transações pendentes na TxPool |
| edge_consensus_validators | Gauge | Número de validadores |
| edge_consensus_rounds | Gauge | Número de rondas |
| edge_consensus_num_txs | Gauge | Número de transações no último bloco |
| edge_consensus_block_interval | Gauge | Tempo entre este bloco e o último, em segundos |
| edge_network_peers | Gauge | Número de pares conectados |
| edge_network_outbound_connections_count | Gauge | Número de conexões de saída |
| edge_network_inbound_connections_count | Gauge | Número de conexões de entrada |
| edge_network_pending_inbound_connections_count | Gauge | Número de conexões de saída pendentes |
| edge_network_pending_outbound_connections_count | Gauge | Número de conexões de entrada pendentes |
| edge_consensus_epoch_number | Gauge | Número de época atual |
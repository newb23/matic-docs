---
id: prometheus-metrics
title: Prometheus metrics
description: "Kung paano i-enable ang Prometheus metrics para sa Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - metrics
  - prometheus
---

## Pangkalahatang-ideya {#overview}

Ang Polygon Edge ay maaaring mag-ulat at gumamit ng Prometheus metrics, na sa kalaunan ay maaaring maubos gamit ang Prometheus collector(s).

Pinagana ang mga metrics ng Prometheus ng Prometheus sa pamamagitan ng default. Maaari itong i-enable sa pamamagitan ng pagtukoy sa address ng tagapakinig gamit ang `--prometheus`f[lag ](/docs/edge/get-started/cli-commands#prometheus)o `Telemetry.prometheus`field sa config file. Ang mga metrics ay gagamitin sa ilalim ng `/metrics` sa tinukoy na address.

## Mga available na metrics {#available-metrics}

Ang mga sumusunod na metrics ay available:

| **Pangalan** | **Uri** | **Paglalarawan** |
|-------------------------------------------------|----------|---------------------------------------------|
| edge_txpool_pending_transactions | Gauge | Bilang ng mga nakabinbing transaksyon sa TxPool |
| edge_consensus_validators | Gauge | Bilang ng mga Validator |
| edge_consensus_rounds | Gauge | Bilang ng mga Round |
| edge_consensus_num_txs | Gauge | Bilang ng mga Transaksyon sa pinakahuling block |
| edge_consensus_block_interval | Gauge | Oras sa pagitan nito at ng huling block sa mga segundo |
| edge_network_peers | Gauge | Bilang ng mga Konektadong peer |
| edge_network_outbound_connections_count | Gauge | Bilang ng mga outbound na koneksyon |
| edge_network_inbound_connections_count | Gauge | Bilang ng mga inbound na koneksyon |
| edge_network_pending_inbound_connections_count | Gauge | Bilang ng mga nakabinbing outbound na koneksyon |
| edge_network_pending_outbound_connections_count | Gauge | Bilang ng mga nakabinbing inbound na koneksyon |
| edge_consensus_epoch_number | Gauge | Kasalukuyang numero ng epoch |
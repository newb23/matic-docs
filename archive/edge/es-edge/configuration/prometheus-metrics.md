---
id: prometheus-metrics
title: Métricas de Prometheus
description: "Cómo habilitar las métricas de Prometheus para Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - metrics
  - prometheus
---

## Descripción general {#overview}

Polygon Edge puede reportar y proveer las métricas de Prometheus, las cuales a su vez pueden ser consumidas mediante los colectores de Prometheus.

Las métricas de Prometheus están deshabilitadas por defecto. Puede habilitarse indicando la dirección del oyente a través de una `--prometheus`marca  o`Telemetry.prometheus` un campo en el archivo de configuración.
Las métricas son servidas bajo `/metrics`en la dirección especificada.

## Métricas disponibles {#available-metrics}

Están disponibles las siguientes métricas:

| **Nombre** | **Tipo** | **Descripción** |
|-----------------------------------------------|---------------|-------------------------------------------------|
| txpool_pending_transactions | Medidor | Número de transacciones pendientes en TxPool |
| consensus_validators | Medidor | Número de validadores |
| consensus_rounds | Medidor | Número de rondas |
| consensus_num_txs | Medidor | Número de transacciones en el bloque más reciente |
| consensus_block_interval | Medidor | Tiempo entre este y el último bloque en segundos |
| network_peers | Medidor | Número de pares conectados |
| network_outbound_connections_count | Medidor | Número de conexiones salientes |
| network_inbound_connections_count | Medidor | Número de conexiones entrantes |
| network_pending_outbound_connections_count | Medidor | Número de conexiones salientes pendientes |
| network_pending_inbound_connections_count | Medidor | Número de conexiones entrantes pendientes |
---
id: prometheus-metrics
title: Metriche Prometheus
description: "Come abilitare le metriche Prometheus per Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - metrics
  - prometheus
---

## Panoramica {#overview}

Polygon Edge può segnalare e servire le metriche Prometheus, che a loro volta possono essere consumate utilizzando il collettore o i collettori Prometheus.

Le metriche Prometheus sono disabilitate di default. Può essere attivato specificando l'indirizzo dell'ascoltatore utilizzando `--prometheus` il flag o `Telemetry.prometheus` il campo nel file di configurazione.
Le metriche verranno servite sotto `/metrics` sull'indirizzo specificato.

## Metriche disponibili {#available-metrics}

Sono disponibili le seguenti metriche:

| **Nome** | **Tipo** | **Descrizione** |
|-----------------------------------------------|---------------|-------------------------------------------------|
| txpool_pending_transactions | Gauge | Numero di transazioni in attesa in TxPool |
| consensus_validators | Gauge | Numero di validatori |
| consensus_rounds | Gauge | Numero di round |
| consensus_num_txs | Gauge | Numero di transazioni nell'ultimo blocco |
| consensus_block_interval | Gauge | Tempo tra questo e l'ultimo blocco in secondi |
| network_peers | Gauge | Numero di peer collegati |
| network_outbound_connections_count | Gauge | Numero di connessioni in uscita |
| network_inbound_connections_count | Gauge | Numero di connessioni in entrata |
| network_pending_outbound_connections_count | Gauge | Numero di connessioni in uscita in attesa |
| network_pending_inbound_connections_count | Gauge | Numero di connessioni in entrata in sospeso |
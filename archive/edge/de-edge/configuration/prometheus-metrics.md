---
id: prometheus-metrics
title: Prometheus-Metriken
description: "Wie Sie Prometheus-Metriken für Polygon Edge aktivieren."
keywords:
  - docs
  - polygon
  - edge
  - metrics
  - prometheus
---

## Übersicht {#overview}

Polygon Edge kann die Prometheus-Metriken melden und bereitstellen, die wiederum mit Prometheus-Collector(s) verwendet werden können.

Prometheus-Metriken sind standardmäßig deaktiviert. Es kann aktiviert werden, indem die Listener-Adresse über eine `--prometheus`Flagge oder einem `Telemetry.prometheus`Feld in der Konfigurationsdatei angegeben wird.
Metriken werden unter `/metrics`auf die angegebene Adresse zugestellt.

## Verfügbare Metriken {#available-metrics}

Folgende Metriken sind verfügbar:

| **Name** | **Art** | **Beschreibung** |
|-----------------------------------------------|---------------|-------------------------------------------------|
| txpool_pending_transactions | Messgerät | Anzahl ausstehender Transaktionen in TxPool |
| consensus_validators | Messgerät | Anzahl der Validatoren |
| consensus_rounds | Messgerät | Anzahl der Runden |
| consensus_num_txs | Messgerät | Anzahl der Transaktionen im neuesten Block |
| consensus_block_interval | Messgerät | Zeit zwischen diesem und dem letzten Block in Sekunden |
| network_peers | Messgerät | Anzahl verbundener Peers |
| network_outbound_connections_count | Messgerät | Anzahl ausgehender Verbindungen |
| network_inbound_connections_count | Messgerät | Anzahl eingehender Verbindungen |
| network_pending_outbound_connections_count | Messgerät | Anzahl ausstehender ausgehender Verbindungen |
| network_pending_inbound_connections_count | Messgerät | Anzahl ausstehender eingehender Verbindungen |
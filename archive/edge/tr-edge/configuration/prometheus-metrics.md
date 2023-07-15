---
id: prometheus-metrics
title: Prometheus ölçütleri
description: "Polygon Edge için Prometheus ölçütleri nasıl etkinleştirilir?"
keywords:
  - docs
  - polygon
  - edge
  - metrics
  - prometheus
---

## Genel Bakış {#overview}

Polygon Edge, sıraları geldiğinde Prometheus toplayıcıları kullanarak tüketilebilen Prometheus ölçütlerini raporlayabilir ve sunabilir.

Prometheus ölçümleri varsayılan olarak devre dışı bırakılır. Yapılandırma dosyasında `--prometheus`[bayrak](/docs/edge/get-started/cli-commands#prometheus) veya `Telemetry.prometheus`alan kullanarak dinleyici adresini belirleme ile etkinleştirilebilir. Ölçütler, belirtilen adreste `/metrics` altında sunulacaktır.

## Mevcut ölçütler {#available-metrics}

Aşağıdaki ölçütler mevcuttur:

| **Ad** | **Tip** | **Açıklama** |
|-------------------------------------------------|----------|---------------------------------------------|
| edge_txpool_pending_transactions | Ölçü | TxPool'da bekleyen işlem sayısı |
| edge_consensus_validators | Ölçü | Doğrulayıcı Sayısı |
| edge_consensus_rounds | Ölçü | Round Sayısı |
| edge_consensus_num_txs | Ölçü | Son bloktaki İşlem Sayısı |
| edge_consensus_block_interval | Ölçü | Saniye cinsinden bu ve son blok arasındaki zaman |
| edge_network_peers | Ölçü | Bağlı eşlerin sayısı |
| edge_network_outbound_connections_count | Ölçü | Giden bağlantı sayısı |
| edge_network_inbound_connections_count | Ölçü | Gelen bağlantı sayısı |
| edge_network_pending_inbound_connections_count | Ölçü | Bekleyen giden bağlantı sayısı |
| edge_network_pending_outbound_connections_count | Ölçü | Bekleyen gelen bağlantı sayısı |
| edge_consensus_epoch_number | Ölçü | Mevcut dönem numarası |
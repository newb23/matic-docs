---
id: prometheus-metrics
title: Prometheusメトリクス
description: "Polygon EdgeのPrometheusメトリクスを有効化する方法"
keywords:
  - docs
  - polygon
  - edge
  - metrics
  - prometheus
---

## 概要 {#overview}

Polygon EdgeはPrometheusメトリクスを報告及び提供し、順番が来ると、Prometheusコレクターを使用して消費します。

Prometheusメトリクスはデフォルトでは無効化されています。設定ファイル内の`--prometheus`フラグまたは`Telemetry.prometheus`フィールドを使用してリスナーアドレスを指定することによって有効化することができます。メトリクスは指定されたアドレスの`/metrics`下で提供されます。

## 利用可能なメトリクス {#available-metrics}

次のメトリクスは利用できます：

| **名前** | **タイプ** | **説明** |
|-----------------------------------------------|---------------|-------------------------------------------------|
| txpool_pending_transactions | Gauge | TxPoolにおける保留中のトランザクション数 |
| consensus_validator | Gauge | バリデータ数 |
| consensus_rounds | Gauge | ラウンド数 |
| consensus_num_txs | Gauge | 最後のブロックにおけるトランザクション数 |
| consensus_block_interval | Gauge | このブロックと最後のブロック間の秒単位での時間 |
| network_peers | Gauge | 接続されたピア数 |
| network_outbound_connections_count | Gauge | アウトバウンド接続数 |
| network_inbound_connections_count | Gauge | インバウンド接続数 |
| network_pending_outbound_connections_count | Gauge | 保留中のアウトバウンド接続数 |
| network_pending_inbound_connections_count | Gauge | 保留中のインバウンド接続数 |
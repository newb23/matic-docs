---
id: prometheus-metrics
title: Prometheus 측정항목
description: "Polygon 엣지에서 Prometheus 측정항목을 활성화하는 방법."
keywords:
  - docs
  - polygon
  - edge
  - metrics
  - prometheus
---

## 개요 {#overview}

Polygon 엣지는 Prometheus 측정항목을 보고 및 제공할 수 있으며, 그 후 이 측정항목을 Prometheus 수집기릁 통해 사용할 수 있습니다.

기본적으로 Prometheus 측정항목은 비활성화되어 있으며, 구성 파일에서 `--prometheus` 플래그 또는 `Telemetry.prometheus` 필드를 사용하여 리스너 주소를 지정함으로써 활성화할 수 있습니다.
측정항목은 지정된 주소의 `/metrics` 아래에서 제공됩니다.

## 사용 가능한 측정항목 {#available-metrics}

다음 측정항목을 사용할 수 있습니다.

| **이름** | **유형** | **설명** |
|-----------------------------------------------|---------------|-------------------------------------------------|
| txpool_pending_transactions | 측정 | 트랜잭션 풀에서 대기 중인 트랜잭션 수 |
| consensus_validators | 측정 | 검사기 수 |
| consensus_rounds | 측정 | 라운드 수 |
| consensus_num_txs | 측정 | 최근 블록의 트랜잭션 수 |
| consensus_block_interval | 측정 | 이 블록과 마지막 블록 사이의 시간(초) |
| network_peers | 측정 | 연결된 피어 수 |
| network_outbound_connections_count | 측정 | 아웃바운드 연결 수 |
| network_inbound_connections_count | 측정 | 인바운드 연결 수 |
| network_pending_outbound_connections_count | 측정 | 대기 중인 아웃바운드 연결 수 |
| network_pending_inbound_connections_count | 측정 | 대기 중인 인바운드 연결 수 |
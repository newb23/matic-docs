---
id: prometheus-metrics
title: Метрика Prometheus
description: "Как включить метрику Prometheus для Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - metrics
  - prometheus
---

## Обзор {#overview}

Polygon Edge может сообщать и обслуживать метрику Prometheus, которая в свою очередь может быть использована с помощью коллекторов Prometheus.

Метрика Prometheus отключена по умолчанию. Она может быть включена путем указания адреса слушателя с помощью флага `--prometheus` или поля `Telemetry.prometheus` в файле конфигурации. Метрика будет обслуживаться в соответствии с `/metrics` на указанный адрес.

## Доступная метрика  {#available-metrics}

Доступна следующая метрика:

| **Название** | **Тип** | **Описание** |
|-----------------------------------------------|---------------|-------------------------------------------------|
| txpool_pending_transactions | Gauge | Количество отложенных транзакций в TxPool |
| consensus_validators | Gauge | Количество валидаторов |
| consensus_rounds | Gauge | Количество раундов |
| consensus_num_txs | Gauge | Количество транзакций в последнем блоке |
| consensus_block_interval | Gauge | Время между этим и последним блоком в секундах |
| network_peers | Gauge | Количество подключаемых одноранговых узлов |
| network_outbound_connections_count | Gauge | Количество исходящих соединений |
| network_inbound_connections_count | Gauge | Количество входящих соединений |
| network_pending_outbound_connections_count | Gauge | Количество отложенных исходящих соединений |
| network_pending_inbound_connections_count | Gauge | Количество отложенных входящих соединений |
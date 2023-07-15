---
id: prometheus-metrics
title: Metrik Prometheus
description: "Cara mengaktifkan metrik Prometheus untuk Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - metrics
  - prometheus
---

## Ikhtisar {#overview}

Polygon Edge dapat melaporkan dan melayani metrik Prometheus yang nantinya dapat dimanfaatkan menggunakan kolektor Prometheus.

Metrik Prometheus dinonaktifkan secara default. Metrik ini dapat diaktifkan dengan menentukan alamat listener (pendengar) menggunakan bendera `--prometheus` atau bidang `Telemetry.prometheus` di file konfigurasi.
Metrik dapat disajikan di `/metrics` pada alamat yang ditentukan.

## Metrik yang tersedia {#available-metrics}

Tersedia metrik berikut ini:

| **Nama** | **Tipe** | **Deskripsi** |
|-----------------------------------------------|---------------|-------------------------------------------------|
| txpool_pending_transactions | Ukuran | Jumlah transaksi yang menunggu di TxPool |
| consensus_validators | Ukuran | Jumlah Validator |
| consensus_rounds | Ukuran | Jumlah Babak |
| consensus_num_txs | Ukuran | Jumlah Transaksi di blok terbaru |
| consensus_block_interval | Ukuran | Waktu antara blok ini dan terakhir dalam detik |
| network_peers | Ukuran | Jumlah peer yang terhubung |
| network_outbound_connections_count | Ukuran | Jumlah koneksi keluar |
| network_inbound_connections_count | Ukuran | Jumlah koneksi masuk |
| network_pending_outbound_connections_count | Ukuran | Jumlah koneksi keluar yang menunggu |
| network_pending_inbound_connections_count | Ukuran | Jumlah koneksi masuk yang menunggu |
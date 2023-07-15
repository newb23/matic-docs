---
id: prometheus-metrics
title: Số liệu Prometheus

description: "Cách kích hoạt số liệu Prometheus trên Polygon Edge.\n"
keywords:
  - docs
  - polygon
  - edge
  - metrics
  - prometheus
---

## Tổng quan {#overview}

Polygon Edge có thể báo cáo và phân phát các số liệu Prometheus, chúng có thể được sử dụng bằng trình thu thập Prometheus.


metheus đã bị tắt theo mặc định. Nó có thể được bật bằng cách xác định địa chỉ của người nghe bằng `--prometheus`[cờ](/docs/edge/get-started/cli-commands#prometheus) `Telemetry.prometheus`hoặc trường trong tệp tin cấu hình. Các số liệu sẽ được phân phát dưới dạng `/metrics` trên địa chỉ được chỉ định.


## Số liệu có sẵn {#available-metrics}

Hiện có sẵn các số liệu sau đây:


| **Tên** | **Loại** | **Mô tả** |
|-------------------------------------------------|----------|---------------------------------------------|
| edge_txpool_pool_pend_translated by | Gauge | Số lượng giao dịch đang chờ xử lý trong TxPool |
| edge_asufactor | Gauge | Số lượng trình xác thực
 |
| edge_deal_cours_cours_courssus | Gauge | Số lượng lượt |
| edge_dealsum_num_txs | Gauge | Số lượng giao dịch trong khối mới nhất |
| edge_econtinuues_block_interview | Gauge | Thời gian giữa khối này và khối gần nhất tính theo giây
 |
| edge_nets_peeer | Gauge | Số lượng các số đồng số kết nối |
| edge_neted_nets_outbbed_outbbed_interbbben_outbound_bed_en_e_ed_interbound_e_e_ed_tabbed_intered_ | Gauge | Số lượng kết nối bên ngoài |
| edge_mạng need_inbbbed_inbbound_intered_intereded_inbbbound__e_tabed_intereded_intered_tab_e_intered_intered_intered_comp_e_e_coun | Gauge | Số lượng kết nối bên trong |
| ededed_mạng lưới_pen_inbed_interededed_pen_deed_compe_pen_pen_inbed_e_tabed_e_ededed_pen_e_e_deed_coun_count_ed | Gauge | Số lượng kết nối bên ngoài đang chờ xử lý |
| edge_net_pend_pend_outs_depend_contrump_en, depends_enborn_dep, depend_en, depend_ened | Gauge | Số lượng kết nối bên trong đang chờ xử lý |
| edge_epoch_số edge_ededep_epoch_edge_epededepeep_number | Gauge | Số epoch hiện tại |
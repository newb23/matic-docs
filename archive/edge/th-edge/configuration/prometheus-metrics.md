---
id: prometheus-metrics
title: เมตริก Prometheus
description: "วิธีการเปิดใช้งานเมตริก Prometheus สำหรับ Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - metrics
  - prometheus
---

## ภาพรวม {#overview}

Polygon Edge สามารถรายงานและรับใช้เมตริก Prometheus โดยเมตริกนั้นก็สามารถรับใช้ระบบรวบรวมข้อมูลของ Prometheus ได้ด้วย

ตัวเมเยอร์ Prometheus ถูกปิดการทำงานโดยค่าปริยายสามารถเปิดใช้งานได้โดยระบุที่อยู่ผู้ฟังโดยใช้`--prometheus`[แฟล็ก](/docs/edge/get-started/cli-commands#prometheus)หรือ`Telemetry.prometheus`ฟิลด์ในไฟล์การปรับแต่งจะมีการใช้เมตริกภายใต้ `/metrics` บนที่อยู่ที่กำหนดไว้

## เมตริกที่สามารถใช้ได้ {#available-metrics}

เมตริกดังต่อไปนี้สามารถใช้ได้:

| **ชื่อ** | **ประเภท** | **คำอธิบาย** |
|-------------------------------------------------|----------|---------------------------------------------|
| ed_txsurior pending_transformation | ตัววัด | จำนวนธุรกรรมที่อยู่ในระหว่างการดำเนินการที่ TxPool |
| ตัวตรวจสอบความถูกต้องของ ede_consensus_ | ตัววัด | จำนวนตัวตรวจสอบความถูกต้อง |
| ed_consensus_rout | ตัววัด | จำนวนรอบ |
| ed_consensus_num_txs | ตัววัด | จำนวนธุรกรรมในบล็อกล่าสุด |
| ed_consensus_block_ช่วงเวลาการผลิต | ตัววัด | ระยะเวลาระหว่างบล็อกนี้และบล็อกล่าสุด หน่วยเป็นวินาที |
| Eed_networkers | ตัววัด | จำนวนเพียร์ที่เชื่อมต่อ |
| ed_networwork_outbedded การเชื่อมต่อ_count | ตัววัด | จำนวนการเชื่อมต่อขาออก |
| ed_network_inbed_newset | ตัววัด | จำนวนการเชื่อมต่อขาเข้า |
| ed_network_nworksworkset | ตัววัด | จำนวนการเชื่อมต่อขาออกที่ค้างอยู่ |
| ed_networwork_nworksworkset pending_outbalecount | ตัววัด | จำนวนการเชื่อมต่อขาเข้าที่ค้างอยู่ |
| ed_consensus_eepch_bent | ตัววัด | หมายเลข ePoint ปัจจุบัน |
---
id: sample-config
title: ไฟล์กำหนดค่าเซิร์ฟเวอร์
description: "เริ่มใช้เซิร์ฟเวอร์ของ Polygon Edge โดยใช้ไฟล์กำหนดค่า"
keywords:
  - docs
  - polygon
  - edge
  - server
  - configuration
  - yaml
  - jason

---
# ไฟล์กำหนดค่าเซิร์ฟเวอร์ {#server-configuration-file}
เริ่มใช้งานเซิร์ฟเวอร์ด้วยตัวเลือกการกำหนดค่าต่างๆ ได้โดยใช้ไฟล์กำหนดค่าแทนการใช้เฉพาะค่าสถานะเท่านั้นคำสั่งที่ใช้เพื่อเริ่มใช้งานเซิร์ฟเวอร์ด้วยไฟล์กำหนดค่า `polygon-edge server --config <config_file_name>`

## ส่งออกไฟล์กำหนดค่าด้วยการกำหนดค่าเริ่มต้น {#export-config-file-with-default-configuration}
ส่งออกการกำหนดค่าเซิร์ฟเวอร์ Polygon Edge ด้วยการตั้งค่าเริ่มต้นในไฟล์กำหนดค่าในรูปแบบไฟล์ `yaml` หรือ `json` ได้ใช้ไฟล์นี้เป็นเทมเพลตในการใช้งานเซิร์ฟเวอร์โดยใช้ไฟล์กำหนดค่าได้

### YAML {#yaml}
เพื่อสร้างไฟล์กำหนดค่าในรูปแบบ `yaml`:
```bash
polygon-edge server export --type yaml
```
หรือเพียงแต่
```bash
polygon-edge server export
```
จะมีการสร้างไฟล์กำหนดค่าซึ่งมีชื่อว่า `default-config.yaml` ในไดเรกทอรีที่เป็นแหล่งที่มาของการเรียกใช้คำสั่ง

ตัวอย่างไฟล์:
```yaml
chain_config: ./genesis.json
secrets_config: ""
data_dir: ""
block_gas_target: "0x0"
grpc_addr: ""
jsonrpc_addr: ""
telemetry:
  prometheus_addr: ""
network:
  no_discover: false
  libp2p_addr: 127.0.0.1:1478
  nat_addr: ""
  dns_addr: ""
  max_peers: -1
  max_outbound_peers: -1
  max_inbound_peers: -1
seal: true
tx_pool:
  price_limit: 0
  max_slots: 4096
log_level: INFO
restore_file: ""
block_time_s: 2
headers:
  access_control_allow_origins:
    - '*'
log_to: ""
```

### JSON {#json}
เพื่อสร้างไฟล์กำหนดค่าในรูปแบบ `json`:
```bash
polygon-edge server export --type json
```
จะมีการสร้างไฟล์กำหนดค่าซึ่งมีชื่อว่า `default-config.json` ในไดเรกทอรีที่เป็นแหล่งที่มาของการเรียกใช้คำสั่ง

ตัวอย่างไฟล์:

```json
{
  "chain_config": "./genesis.json",
  "secrets_config": "",
  "data_dir": "",
  "block_gas_target": "0x0",
  "grpc_addr": "",
  "jsonrpc_addr": "",
  "telemetry": {
    "prometheus_addr": ""
  },
  "network": {
    "no_discover": false,
    "libp2p_addr": "127.0.0.1:1478",
    "nat_addr": "",
    "dns_addr": "",
    "max_peers": -1,
    "max_outbound_peers": -1,
    "max_inbound_peers": -1
  },
  "seal": true,
  "tx_pool": {
    "price_limit": 0,
    "max_slots": 4096
  },
  "log_level": "INFO",
  "restore_file": "",
  "block_time_s": 2,
  "headers": {
    "access_control_allow_origins": [
      "*"
    ]
  },
  "log_to": ""
}
```

ดูข้อมูลเกี่ยวกับแนวทางการใช้พารามิเตอร์เหล่านี้ได้ในส่วน [คำสั่ง CLI](/docs/edge/get-started/cli-commands)

### โครงสร้าง Typescript {#typescript-schema}

รูปแบบดังต่อไปนี้เป็นรูปแบบตัวอย่างสำหรับไฟล์กำหนดค่าซึ่งเขียนไว้ใน TypeScript เพื่อแสดงประเภทคุณสมบัติต่างๆ (`string`, `number`, `boolean`) และคุณสามารถกำหนดค่าของตนเองได้ด้วยการใช้ไฟล์นั้นเราเห็นสมควรแจ้งด้วยว่าประเภท `PartialDeep` จาก `type-fest` มีการใช้เพื่อแสดงให้เห็นว่าคุณสมบัติทั้งหมดเป็นแบบไม่บังคับ

```typescript
import { PartialDeep } from 'type-fest';

type ServerConfig = PartialDeep<{
  chain_config: string; // <genesis_file_path>
  secrets_config: string; // <secrets_file_path>
  data_dir: string; // <data_directory_path>
  block_gas_target: string; // <block_gas_limit>
  grpc_addr: string; // <grpc_listener_address>
  jsonrpc_addr: string; // <json_rpc_listener_address>
  telemetry: {
    prometheus_addr: string; // <prometheus_listener_address>
  };
  network: {
    no_discover: boolean; // <enable/disable_discovery>,
    libp2p_addr: string; // <libp2p_server_address>,
    nat_addr: string; // <nat_address>,
    dns_addr: string; // <dns_address>,
    max_peers: number; // <maximum_allowded_peers>,
    max_inbound_peers: number; // <maximum_allowded_inbound_peers>,
    max_outbound_peers: number; // <maximum_allowded_outbound_peers>
  };
  seal: boolean; // <enable/disable_block_sealing>
  txpool: {
    price_limit: number; // <minimum_gas_price_limit>
    max_slots: number; // <maximum_txpool_slots>
  };
  log_level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'DPANIC' | 'PANIC' | 'FATAL'; // <log_level>
  restore_file: string; // <restore_file_path>
  block_time_s: number; // <block_time_seconds>
  headers: Record<string, any>;
  log_to: string; // <log_to>
}>
```


---
id: sample-config
title: File Konfigurasi Server
description: "Memulai server Polygon Edge menggunakan file konfigurasi."
keywords:
  - docs
  - polygon
  - edge
  - server
  - configuration
  - yaml
  - jason

---
# File konfigurasi server {#server-configuration-file}
Memulai server dengan beragam opsi konfigurasi dapat dilakukan menggunakan file konfigurasi alih-alih hanya bendera.
Perintah yang digunakan untuk memulai server dengan file config: `polygon-edge server --config <config_file_name>`

## Ekspor file config dengan konfigurasi default {#export-config-file-with-default-configuration}
Konfigurasi dengan pengaturan default untuk server Polygon Edge dapat diekspor ke file konfigurasi dalam format file `yaml` atau `json`.
File ini dapat digunakan sebagai templat untuk menjalankan server menggunakan file konfigurasi.

### YAML {#yaml}
Untuk membuat file konfigurasi dalam format `yaml`:
```bash
polygon-edge server export --type yaml
```
atau hanya
```bash
polygon-edge server export
```
file konfigurasi bernama `default-config.yaml` akan dibuat pada direktori yang sama tempat perintah ini dijalankan.

Contoh file:
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
Untuk membuat file konfigurasi dalam format `json`:
```bash
polygon-edge server export --type json
```
file konfigurasi bernama `default-config.json` akan dibuat pada direktori yang sama tempat perintah ini dijalankan.

Contoh file:

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

Baca bagian [Perintah CLI](/docs/edge/get-started/cli-commands) untuk mendapatkan informasi tentang cara menggunakan parameter ini.

### Skema Typscript {#typescript-schema}

Yang berikut ini adalah format contoh untuk file konfigurasi. Ini ditulis dalam format TypeScript untuk menyatakan jenis properti (`string`, `number`, `boolean`), Anda dapat memperoleh konfigurasi dari sini. Perlu diketahui bahwa jenis `PartialDeep` dari `type-fest` digunakan untuk menyatakan bahwa semua properti bersifat opsional.

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


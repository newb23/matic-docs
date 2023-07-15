---
id: sample-config
title: Tệp cấu hình máy chủ
description: "Khởi động máy chủ Polygon Edge bằng tệp cấu hình.\n"
keywords:
  - docs
  - polygon
  - edge
  - server
  - configuration
  - yaml
  - jason

---
# Tệp cấu hình máy chủ {#server-configuration-file}
Khởi động máy chủ với các tùy chọn cấu hình khác nhau có thể được thực hiện bằng tệp cấu hình thay vì chỉ sử dụng cờ.
 Lệnh được dùng để khởi động máy chủ với tệp cấu hình:
`polygon-edge server --config <config_file_name>`

## Xuất tệp cấu hình với cấu hình mặc định
 {#export-config-file-with-default-configuration}
Cấu hình với cài đặt mặc định dành cho máy chủ Polygon Edge có thể được xuất thành tệp cấu hình ở định dạng tệp `yaml` hoặc `json`.
 Tệp này có thể được sử dụng làm mẫu cho việc chạy máy chủ bằng tệp cấu hình.


### YAML {#yaml}
Để tạo tệp cấu hình theo định dạng `yaml`:
```bash
polygon-edge server export --type yaml
```
hoặc chỉ
```bash
polygon-edge server export
```
Tệp cấu hình có tên `default-config.yaml` sẽ được tạo trong cùng thư mục mà lệnh này đã được chạy.


Ví dụ về tệp tin:
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
Để tạo tệp cấu hình theo định dạng `json`:
```bash
polygon-edge server export --type json
```
Tệp cấu hình có tên `default-config.json` sẽ được tạo trong cùng thư mục mà lệnh này đã được chạy.


Ví dụ về tệp tin:

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

Hãy xem phần [Lệnh CLI](/docs/edge/get-started/cli-commands) để biết thông tin về cách sử dụng các tham số này.


### Lược đồ TypeScript
 {#typescript-schema}

Sau đây là định dạng mẫu cho tệp cấu hình. Nó được viết bằng TypeScript để trình bày các kiểu thuộc tính (·`string`, `number`, `boolean`), từ đó bạn có thể lấy ra cấu hình của mình.
 Lưu ý rằng kiểu `PartialDeep` từ `type-fest` được sử dụng để trình bày rằng tất cả các thuộc tính là không bắt buộc.


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


---
id: sample-config
title: Sunucu Yapılandırma Dosyası
description: "Bir yapılandırma dosyası kullanarak Polygon Edge sunucusunu başlatın."
keywords:
  - docs
  - polygon
  - edge
  - server
  - configuration
  - yaml
  - jason

---
# Sunucu yapılandırma dosyası {#server-configuration-file}
Sunucu, sadece bayrak kullanmak yerine yapılandırma dosyası kullanılarak çeşitli yapılandırma seçenekleriyle başlatılabilir.
Bir yapılandırma dosyası ile sunucuyu başlatmak için kullanılan komut: `polygon-edge server --config <config_file_name>`

## Yapılandırma dosyasını varsayılan yapılandırma ile dışa aktarma {#export-config-file-with-default-configuration}
Polygon Edge sunucusu için varsayılan ayarları içeren yapılandırma, `yaml` veya `json`dosya biçiminde bir yapılandırma dosyasına aktarılabilir. Bu dosya, bir yapılandırma dosyası kullanarak sunucuyu çalıştırmak için şablon olarak kullanılabilir.

### YAML {#yaml}
`yaml` formatında yapılandırma dosyası oluşturmak için:
```bash
polygon-edge server export --type yaml
```
veya sadece
```bash
polygon-edge server export
```
`default-config.yaml` adlı yapılandırma dosyası bu komutun çalıştırıldığı dizinde oluşturulacaktır.

Dosya örneği:
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
`json` formatında yapılandırma dosyası oluşturmak için:
```bash
polygon-edge server export --type json
```
`default-config.json` adlı yapılandırma dosyası bu komutun çalıştırıldığı dizinde oluşturulacaktır.

Dosya örneği:

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

Bu parametrelerin nasıl kullanılacağı hakkında bilgi almak için [CLI Komutları](/docs/edge/get-started/cli-commands) bölümüne göz atın.

### Typescript şeması {#typescript-schema}

Yapılandırma dosyası için örnek format aşağıdadır. Özellik türlerini (`string`, `number`, `boolean`) ifade etmek için TypeScript'te yazılmıştır, bu özellik türlerinden yapılandırmanızı türetebilirsiniz. Tüm özelliklerin isteğe bağlı olduğunu ifade etmek için `type-fest`'ten `PartialDeep` türünün kullanıldığını belirtmekte fayda var.

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


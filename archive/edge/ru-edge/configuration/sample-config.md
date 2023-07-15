---
id: sample-config
title: Файл конфигурации сервера
description: "Запустите сервер Polygon Edge с помощью файла конфигурации."
keywords:
  - docs
  - polygon
  - edge
  - server
  - configuration
  - yaml
  - jason

---
# Файл конфигурации сервера {#server-configuration-file}
Запуск сервера с различными вариантами конфигурации можно сделать с помощью файла конфигурации вместо использования только флагов. Команда, которая используется для запуска сервера с помощью файла конфигурации: `polygon-edge server --config <config_file_name>`

## Экспорт файла конфигурации с конфигурацией по умолчанию  {#export-config-file-with-default-configuration}
Конфигурация по умолчанию для сервера Polygon Edge может быть экспортирована в файл конфигурации в любом из следующих форматов: `yaml`или `json`. Этот файл можно использовать в качестве шаблона для запуска сервера с помощью файла конфигурации.

### YAML {#yaml}
Для создания файла конфигурации в формате `yaml`:
```bash
polygon-edge server export --type yaml
```
или просто
```bash
polygon-edge server export
```
файл конфигурации с названием `default-config.yaml` будет создан в той же директории, из которой была запущена эта команда.

Пример файла:
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
Для создания файла конфигурации в формате `json`:
```bash
polygon-edge server export --type json
```
файл конфигурации с названием `default-config.json` будет создан в той же директории, из которой была запущена эта команда.

Пример файла:

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

Ознакомьтесь с разделом [Команды CLI](/docs/edge/get-started/cli-commands), чтобы узнать, как использовать эти параметры.

### Схема Typescript {#typescript-schema}

Ниже приводится формат образца для файла конфигурации. Он написан в TypeScript для выражения типов свойств (`string`, `number`, `boolean`), из которых вы можете вывести свою конфигурацию. Стоит отметить, что тип `PartialDeep` от `type-fest` используется для выражения того, что все свойства необязательны.

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


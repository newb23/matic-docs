---
id: sample-config
title: Config File ng Server
description: "Paganahin ang Polygon Edge server gamit ang isang configuration file."
keywords:
  - docs
  - polygon
  - edge
  - server
  - configuration
  - yaml
  - jason

---
# Configuration file ng server {#server-configuration-file}
Ang pagpapagana ng server sa pamamagitan ng iba't ibang mga configuration option ay maaaring gawin gamit ang isang configuration file sa halip na gumamit lang ng mga flag.
Ang command na ginamit para paganahin ang server sa pamamagitan ng isang config file: `polygon-edge server --config <config_file_name>`

## I-export ang config file na may default configuration {#export-config-file-with-default-configuration}
Ang configuration na may default na mga setting para sa Polygon Edge server ay maaaring i-export sa isang config file sa alinman sa `yaml` o `json` na file format.
Ang file na ito ay maaaring gamitin bilang isang template para sa pagpapatakbo ng server gamit ang isang configuration file.

### YAML {#yaml}
Para buuin ang config file sa `yaml` na format:
```bash
polygon-edge server export --type yaml
```
o ang
```bash
polygon-edge server export
```
config file lang na pinangalanang `default-config.yaml` ay malilikha sa kaparehong directory kung saan pinatakbo ang command na ito.

Halimbawa ng file:
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
Para buuin ang config file sa `json` na format:
```bash
polygon-edge server export --type json
```
config file lang na pinangalanang `default-config.json` ay malilikha sa kaparehong directory kung saan pinatakbo ang command na ito.

Halimbawa ng file:

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

Tingnan ang [CLI Commands](/docs/edge/get-started/cli-commands) na seksyon para makakuha ng impormasyon kung paano gamitin ang mga parameter na ito.

### Typescript schema {#typescript-schema}

Ang sumusunod ay ang sample format para sa configuration file. Ito ay nakasulat sa TypeScript para ipahayag ang mga type ng properties (`string`, `number`, `boolean`), mula rito ay maaari mong kunin ang iyong configuration. Mahalagang banggitin na ang `PartialDeep` na type mula sa `type-fest` ay ginagamit para ipahayag na ang lahat ng properties ay optional.

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


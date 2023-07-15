---
id: sample-config
title: Server-Konfigurationsdatei
description: "Starte den Polygon Edge-Server mithilfe einer Konfigurationsdatei."
keywords:
  - docs
  - polygon
  - edge
  - server
  - configuration
  - yaml
  - jason

---
# Server-Konfigurationsdatei {#server-configuration-file}
Das Starten des Servers mit verschiedenen Konfigurationsoptionen kann über eine Konfigurationsdatei erfolgen, anstatt nur über Flags.
Der Befehl, mit dem der Server mit einer Konfigurationsdatei gestartet wird: `polygon-edge server --config <config_file_name>`

## Konfigurationsdatei mit Standardkonfiguration exportieren {#export-config-file-with-default-configuration}
Die Konfiguration mit den Standardeinstellungen für den Polygon Edge-Server kann in eine Konfigurationsdatei im `yaml`oder `json`Dateiformat exportiert werden.
Diese Datei kann als Vorlage für den Betrieb des Servers mit einer Konfigurationsdatei verwendet werden.

### YAML {#yaml}
Erstellen der Konfigurationsdatei im `yaml`-Format:
```bash
polygon-edge server export --type yaml
```
oder nur
```bash
polygon-edge server export
```
die Konfigurationsdatei mit dem Namen `default-config.yaml`wird in demselben Verzeichnis erstellt, von dem dieser Befehl ausgeführt wurde.

Dateibeispiel:
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
Erstellen der Konfigurationsdatei im `json`-Format:
```bash
polygon-edge server export --type json
```
die Konfigurationsdatei mit dem Namen `default-config.json`wird in demselben Verzeichnis erstellt, von dem dieser Befehl ausgeführt wurde.

Dateibeispiel:

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

Im Abschnitt [CLI-Befehle](/docs/edge/get-started/cli-commands) erfahren Sie, wie Sie diese Parameter verwenden können.

### Typoscript-Schema {#typescript-schema}

Im Folgenden finden Sie ein Beispiel für das Format der Konfigurationsdatei. Es ist in TypeScript geschrieben, um die Eigenschaftstypen (`string`, `number`,)`boolean` auszudrücken, von denen Sie ihre Konfiguration ableiten können. Erwähnenswert ist, dass der `PartialDeep`Typ von v`type-fest`erwendet wird, um auszudrücken, dass alle Eigenschaften optional sind.

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


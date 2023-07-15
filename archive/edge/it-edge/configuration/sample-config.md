---
id: sample-config
title: File di configurazione del server
description: "Avvia il server Polygon Edge utilizzando un file di configurazione."
keywords:
  - docs
  - polygon
  - edge
  - server
  - configuration
  - yaml
  - jason

---
# File di configurazione del server {#server-configuration-file}
L'avvio del server con varie opzioni di configurazione può essere eseguito utilizzando un file di configurazione anziché utilizzare solo i flag. Il comando utilizzato per avviare il server con un file di configurazione: `polygon-edge server --config <config_file_name>`

## Esporta il file di configurazione con la configurazione predefinita {#export-config-file-with-default-configuration}
La configurazione con le impostazioni predefinite per il server Polygon Edge può essere esportata in un file di configurazione in formato `yaml` o `json`.
Questo file può essere utilizzato come modello per l'esecuzione del server utilizzando un file di configurazione.

### YAML {#yaml}
Per generare il file di configurazione in formato `yaml`:
```bash
polygon-edge server export --type yaml
```
oppure solo
```bash
polygon-edge server export
```
il file di configurazione denominato `default-config.yaml` verrà creato nella stessa directory da cui è stato eseguito questo comando.

Esempio di file:
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
Per generare il file di configurazione in formato `json`:
```bash
polygon-edge server export --type json
```
il file di configurazione denominato `default-config.json` verrà creato nella stessa directory da cui è stato eseguito questo comando.

Esempio di file:

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

Consulta la sezione [Comandi CLI](/docs/edge/get-started/cli-commands) per ottenere informazioni su come utilizzare questi parametri.

### Schema di TypeScript {#typescript-schema}

Di seguito è riportato il formato del campione per il file di configurazione. È scritto in TypeScript per esprimere i tipi di proprietà (`string`, `number`, `boolean`), da esso si potrebbe ricavare la configurazione. Vale la pena ricordare che il type `PartialDeep` da `type-fest` viene utilizzato per esprimere che tutte le proprietà sono facoltative.

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


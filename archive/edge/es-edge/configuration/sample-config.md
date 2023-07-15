---
id: sample-config
title: Archivo de configuración del servidor
description: "Inicia el servidor de Polygon Edge utilizando un archivo de configuración."
keywords:
  - docs
  - polygon
  - edge
  - server
  - configuration
  - yaml
  - jason

---
# Archivo de configuración del servidor {#server-configuration-file}
Se puede iniciar el servidor con varias opciones de configuración utilizando un archivo de configuración en lugar de utilizar solo indicadores.
El comando utilizado para iniciar el servidor con un archivo de configuración: `polygon-edge server --config <config_file_name>`

## Exporta el archivo de configuración con la configuración por defecto {#export-config-file-with-default-configuration}
La configuración con los ajustes por defecto del servidor de Polygon Edge se puede exportar a un archivo de configuración `yaml`o `json`en cualquiera de los dos formatos. Este archivo se puede utilizar como plantilla para ejecutar el servidor utilizando un archivo de configuración.

### YAML {#yaml}
Para generar el archivo de configuración en: `yaml`
```bash
polygon-edge server export --type yaml
```
o simplemente
```bash
polygon-edge server export
```
el archivo de configuración nombrado `default-config.yaml` se creará en el mismo directorio desde donde se ejecutó este comando.

Ejemplo de archivo:
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
Para generar el archivo de configuración en: `json`
```bash
polygon-edge server export --type json
```
el archivo de configuración nombrado `default-config.json` se creará en el mismo directorio desde donde se ejecutó este comando.

Ejemplo de archivo:

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

Consulta la sección [Comandos CLI](/docs/edge/get-started/cli-commands) para obtener información sobre cómo utilizar estos parámetros.

### Esquema de los Typescript {#typescript-schema}

El siguiente es el formato de ejemplo para el archivo de configuración. Está escrito en TypeScript para expresar los tipos de propiedades (`string`,`number`,`boolean`) a partir de él podría derivar tu configuración. Es importante mencionar que el tipo `PartialDeep`desde `type-fest` se utiliza para expresar que todas las propiedades son opcionales.

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


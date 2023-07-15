---
id: sample-config
title: Ficheiro Config do servidor
description: "Iniciar o servidor Polygon Edge utilizando um ficheiro de configuração."
keywords:
  - docs
  - polygon
  - edge
  - server
  - configuration
  - yaml
  - jason

---
# Ficheiro de configuração do servidor {#server-configuration-file}
É possível iniciar o servidor com várias opções de configuração utilizando um ficheiro de configuração, em vez de usar apenas sinalizadores.
Comando usado para iniciar o servidor com um ficheiro config: `polygon-edge server --config <config_file_name>`

## Exportar o ficheiro config com a configuração padrão {#export-config-file-with-default-configuration}
A configuração com definições padrão para o servidor Polygon Edge pode ser exportada para um ficheiro config tanto no formato de ficheiro `yaml` como `json`.
Este ficheiro pode ser usado como modelo para executar o servidor utilizando um ficheiro de configuração.

### YAML {#yaml}
Para gerar o ficheiro config no formato `yaml`:
```bash
polygon-edge server export --type yaml
```
ou apenas
```bash
polygon-edge server export
```
o ficheiro config denominado `default-config.yaml` será criado no diretório a partir do qual este comando foi executado.

Exemplo de ficheiro:
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
Para gerar o ficheiro config no formato `json`:
```bash
polygon-edge server export --type json
```
o ficheiro config denominado `default-config.json` será criado no diretório a partir do qual este comando foi executado.

Exemplo de ficheiro:

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

Consulte a secção [Comandos CLI](/docs/edge/get-started/cli-commands) para obter informações sobre como utilizar estes parâmetros.

### Esquema Typescript {#typescript-schema}

Segue-se o exemplo de um formato para o ficheiro de configuração. Está escrito em TypeScript para expressar os tipos de propriedades (`string`, `number`, `boolean`), a sua configuração pode ser derivada deles. Cabe destacar que o tipo `PartialDeep` de `type-fest` é usado para expressar que todas as propriedades são opcionais.

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


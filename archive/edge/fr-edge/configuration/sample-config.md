---
id: sample-config
title: Fichier de Configuration du Serveur
description: "Démarrez le serveur de Polygon Edge à l'aide d'un fichier de configuration."
keywords:
  - docs
  - polygon
  - edge
  - server
  - configuration
  - yaml
  - jason

---
# Fichier de configuration du serveur {#server-configuration-file}
Le démarrage du serveur avec diverses options de configuration peut être effectué à l'aide d'un fichier de configuration au lieu d'utiliser uniquement des indicateurs. La commande utilisée pour démarrer le serveur avec un fichier de configuration : `polygon-edge server --config <config_file_name>`

## Exportez le fichier de configuration avec la configuration par défaut {#export-config-file-with-default-configuration}
La configuration avec les paramètres par défaut du serveur de Polygon Edge peut être exportée dans un fichier de configuration en n'importe quelle `yaml`ou `json`format de fichier.
Ce fichier peut être utilisé comme modèle pour exécuter le serveur à l'aide d'un fichier de configuration.

### YAML {#yaml}
Pour générer le fichier de configuration au format `yaml` :
```bash
polygon-edge server export --type yaml
```
ou simplement
```bash
polygon-edge server export
```
le fichier de configuration nommé `default-config.yaml` sera créé dans le même répertoire que celui à partir duquel cette commande a été exécutée.

Exemple de fichier:
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
Pour générer le fichier de configuration au format `json` :
```bash
polygon-edge server export --type json
```
le fichier de configuration nommé `default-config.json` sera créé dans le même répertoire que celui à partir duquel cette commande a été exécutée.

Exemple de fichier:

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

Consultez la section [Commandes CLI](/docs/edge/get-started/cli-commands) pour obtenir des informations sur l'utilisation de ces paramètres.

### Schéma Typescript {#typescript-schema}

Voici un exemple de format pour le fichier de configuration. Il est écrit en TypeScript pour exprimer les types de propriétés (`string`, `number`, `boolean`), vous pouvez en dériver votre configuration. Il convient de mentionner que le type `type-fest` de `PartialDeep` est utilisé pour exprimer que toutes les propriétés sont facultatives.

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


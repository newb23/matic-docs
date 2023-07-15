---
id: sample-config
title: サーバ設定ファイル
description: "設定ファイルを使用してPolygon Edgeサーバを起動します。"
keywords:
  - docs
  - polygon
  - edge
  - server
  - configuration
  - yaml
  - jason

---
# サーバ設定ファイル {#server-configuration-file}
さまざまな設定オプションでサーバを起動することは、フラグを使用する代わりに設定ファイルを使用して行うことができます。
設定ファイルでサーバを起動するのに使用するコマンド：`polygon-edge server --config <config_file_name>`

## デフォルト設定で設定ファイルをエクスポート {#export-config-file-with-default-configuration}
Polygon Edgeサーバのデフォルト設定での設定は、`yaml`または`json`ファイル形式で設定ファイルにエクスポートすることができます。このファイルは設定ファイルを使用してサーバを実行するためのテンプレートとして使用することができます。

### YAML {#yaml}
`yaml`形式で設定ファイルを生成する：
```bash
polygon-edge server export --type yaml
```
または
```bash
polygon-edge server export
```
`default-config.yaml`という名の設定ファイルは、このコマンドを実行したディレクトリと同じディレクトリに作成されます。

ファイルの例：
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
`json`形式で設定ファイルを生成する：
```bash
polygon-edge server export --type json
```
`default-config.json`という名の設定ファイルは、このコマンドを実行したディレクトリと同じディレクトリに作成されます。

ファイルの例：

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

[CLIコマンド](/docs/edge/get-started/cli-commands)セクションをチェックして、これらのパラメータをどのように使用するか情報を取得してください。

### タイプスクリプトスキーマ {#typescript-schema}

設定ファイルのサンプルフォーマットを以下に示します。TypeScriptに書かれており、プロパティタイプ（`string`, `number`, `boolean`）を表現し、そこから設定を得るできます。すべてのプロパティがオプションであることを表現するために、`type-fest`の`PartialDeep`タイプを使用するということを言及しておくべきでしょう。

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


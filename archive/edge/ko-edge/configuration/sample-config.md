---
id: sample-config
title: 서버 구성 파일
description: "구성 파일을 사용하여 Polygon 엣지 서버 시작하기."
keywords:
  - docs
  - polygon
  - edge
  - server
  - configuration
  - yaml
  - jason

---
# 서버 구성 파일 {#server-configuration-file}
단순히 플래그 대신 구성 파일을 사용하여 다양한 구성 옵션으로 서버를 시작할 수 있습니다.
구성 파일로 서버를 시작하기 위해 사용하는 명령어는 `polygon-edge server --config <config_file_name>`입니다.

## 기본 구성의 구성 파일 내보내기 {#export-config-file-with-default-configuration}
Polygon 엣지 서버에 대한 기본 설정이 있는 구성은 `yaml` 또는 `json` 파일 형식의 구성 파일로 내보낼 수 있습니다.
이 파일을 구성 파일을 사용하여 서버를 실행하기 위한 템플릿으로 사용할 수 있습니다.

### YAML {#yaml}
`yaml` 형식으로 구성 파일을 생성하려면 다음을 실행하세요.
```bash
polygon-edge server export --type yaml
```
또는 다음을 실행하세요.
```bash
polygon-edge server export
```
이 명령어를 실행한 디렉터리에 `default-config.yaml`이라는 이름의 구성 파일이 생성됩니다.

파일 예시:
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
`json` 형식으로 구성 파일을 생성하려면 다음을 실행하세요.
```bash
polygon-edge server export --type json
```
이 명령어를 실행한 디렉터리에 `default-config.json`이라는 이름의 구성 파일이 생성됩니다.

파일 예시:

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

이러한 매개변수를 사용하는 방법에 관해 알아보려면 [CLI 명령어](/docs/edge/get-started/cli-commands) 섹션을 확인하세요.

### Typescript 스키마 {#typescript-schema}

다음은 구성 파일 형식의 예시입니다. 속성 유형(`number`, `boolean`, `string`)을 표현하기 위해 TypeScript로 작성되었으며, 이를 통해 구성을 도출할 수 있습니다. `type-fest`의 `PartialDeep` 유형은 모든 속성이 선택 사항임을 나타내는 데 사용됩니다.

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


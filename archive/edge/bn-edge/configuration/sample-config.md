---
id: sample-config
title: সার্ভার কনফিগ ফাইল
description: "একটি কনফিগারেশন ফাইল ব্যবহার করে Polygon Edge সার্ভার শুরু করুন।"
keywords:
  - docs
  - polygon
  - edge
  - server
  - configuration
  - yaml
  - jason

---
# সার্ভার কনফিগারেশন ফাইল {#server-configuration-file}
শুধু ফ্ল্যাগ ব্যবহার করার পরিবর্তে, বিভিন্ন কনফিগারেশন অপশন সহ একটি কনফিগারেশন ফাইল ব্যবহার করে সার্ভার শুরু করা যেতে পারে। একটি কনফিগ ফাইল দিয়ে সার্ভার শুরু করার কমান্ড: `polygon-edge server --config <config_file_name>`

## ডিফল্ট কনফিগারেশন সহ কনফিগ ফাইল এক্সপোর্ট করুন {#export-config-file-with-default-configuration}
Polygon Edge সার্ভারের জন্য ডিফল্ট সেটিংস সহ একটি কনফিগারেশন ফাইল হয় `yaml` অথবা `json` ফাইল ফরম্যাটে এক্সপোর্ট করা যাবে। একটি কনফিগারেশন ফাইল ব্যবহার করে সার্ভার চালানোর জন্য এই ফাইলটি একটি টেমপ্লেট হিসাবে ব্যবহার করা যাবে।

### YAML {#yaml}
`yaml` ফরম্যাটে কনফিগ ফাইল তৈরি করতে:
```bash
polygon-edge server export --type yaml
```
বা শুধু
```bash
polygon-edge server export
```
`default-config.yaml` নামে কনফিগ ফাইলটি সেই ডিরেক্টরিতে তৈরি হবে যেখান থেকে এই কমান্ড রান করা হয়েছে।

ফাইলের উদাহরণ:
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
`json` ফরম্যাটে কনফিগ ফাইল তৈরি করতে:
```bash
polygon-edge server export --type json
```
`default-config.json` নামে কনফিগ ফাইলটি সেই ডিরেক্টরিতে তৈরি হবে যেখান থেকে এই কমান্ড রান করা হয়েছে।

ফাইলের উদাহরণ:

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

এই প্যারামিটারগুলো কীভাবে ব্যবহার করতে হয় তা জানতে [CLI কমান্ড](/docs/edge/get-started/cli-commands) বিভাগটি দেখুন।

### Typescript schema {#typescript-schema}

কনফিগারেশন ফাইলের জন্য নিম্নোক্তটি হলো নমুনা ফরম্যাট। বৈশিষ্ট্যের ধরণ (`string`,,`number`) `boolean` প্রকাশ করার জন্য এটি TypeScript-এ লেখা আছে, এটি থেকে আপনি আপনার কনফিগারেশন পেতে পারেন। এটি উল্লেখযোগ্য যে, সকল বৈশিষ্ট্য যে ঐচ্ছিক তা প্রকাশ করতে `type-fest`-এর `PartialDeep` টাইপ ব্যবহার করা হয়।

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


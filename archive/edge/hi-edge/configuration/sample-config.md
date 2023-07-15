---
id: sample-config
title: सर्वर कन्फिग्यरैशन फाइल
description: "कन्फिग्यरैशन फ़ाइल का इस्तेमाल करके पॉलीगॉन एज सर्वर शुरू करें."
keywords:
  - docs
  - polygon
  - edge
  - server
  - configuration
  - yaml
  - jason

---
# सर्वर कन्फिग्यरैशन फ़ाइल {#server-configuration-file}
सर्वर को विभिन्न कॉन्फ़िगरेशन विकल्पों के साथ शुरू करने के लिए केवल झंडे का उपयोग करने के बजाय कॉन्फ़िगरेशन फ़ाइल का उपयोग किया जा सकता है. सर्वर को कॉन्फ़िगरेशन फ़ाइल के साथ शुरू करने के लिए उपयोग की जाने वाली कमांड: `polygon-edge server --config <config_file_name>`

## डिफ़ॉल्ट कॉन्फ़िगरेशन के साथ कॉन्फ़िगरेशन  फ़ाइल निर्यात करें {#export-config-file-with-default-configuration}
पॉलीगॉन एज सर्वर के लिए डिफ़ॉल्ट सेटिंग्स के साथ कॉन्फ़िगरेशन को `yaml`या `json`फ़ाइल प्रारूप में कॉन्फ़िग फ़ाइल में निर्यात किया जा सकता है. कॉन्फ़िगरेशन फ़ाइल का उपयोग करके सर्वर को चलाने के लिए इस फ़ाइल का उपयोग टेम्पलेट के रूप में किया जा सकता है.

### YAML {#yaml}
To generate the config file in  format कॉन्फ़िगरेशन फ़ाइल को `yaml`प्रारूप में सृजित करने के लिए:
```bash
polygon-edge server export --type yaml
```
या सिर्फ
```bash
polygon-edge server export
```
`default-config.yaml`नाम की कॉन्फ़िगरेशन फ़ाइल उसी डायरेक्टरी में बनाई जाएगी जिससे यह कमांड चलाया गया है.

फ़ाइल उदाहरण:
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
To generate the config file in  format कॉन्फ़िगरेशन फ़ाइल को `json`प्रारूप में सृजित करने के लिए:
```bash
polygon-edge server export --type json
```
`default-config.json`नाम की कॉन्फ़िगरेशन फ़ाइल उसी डायरेक्टरी में बनाई जाएगी जिससे यह कमांड चलाया गया है.

फ़ाइल उदाहरण:

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

इन मापदंडों का उपयोग कैसे करें, इस बारे में जानकारी प्राप्त करने के लिए [सीएलआई कमांड](/docs/edge/get-started/cli-commands) सेक्शन देखें.

### टीपेसक्रीटप स्कीमा {#typescript-schema}

कॉन्फ़िगरेशन फ़ाइल के लिए नमूना स्वरूप निम्न है. यह टाइपस्क्रिप्ट में गुण प्रकारों (`string`, `number`, `boolean`) को व्यक्त करने के लिए लिखा गया है, जिससे आप अपना कॉन्फ़िगरेशन प्राप्त कर सकते हैं. यह उल्लेखनीय है कि `type-fest` से `PartialDeep` प्रकार का उपयोग यह व्यक्त करने के लिए किया जाता है कि सभी गुण वैकल्पिक हैं.

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


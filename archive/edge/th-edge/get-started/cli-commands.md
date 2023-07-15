---
id: cli-commands
title: คำสั่ง CLI
description: "รายการคำสั่ง CLI และค่าสถานะคำสั่งสำหรับ Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - cli
  - commands
  - flags
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


ส่วนนี้ให้รายละเอียดคำสั่งปัจจุบัน ค่าสถานะคำสั่งใน Polygon Edge และวิธีใช้งาน

:::tip การรองรับเอาต์พุต JSON

รองรับค่าสถานะ `--json` บนบางคำสั่งค่าสถานะนี้สั่งให้คำสั่งพิมพ์เอาต์พุตในรูปแบบ JSON

:::

## คำสั่งเริ่มต้น {#startup-commands}

| **คำสั่ง** | **คำอธิบาย** |
|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| server | คำสั่งเริ่มต้นที่เริ่มต้นไคลเอ็นต์บล็อกเชน โดยการเริ่มต้นโมดูลทั้งหมดพร้อมกัน |
| genesis | สร้างไฟล์ *genesis.json* ซึ่งใช้ในการตั้งค่าสถานะเชนที่กำหนดไว้ล่วงหน้าก่อนเริ่มไคลเอ็นต์มีคำอธิบายโครงสร้างของไฟล์ Genesis ด้านล่าง |
| genesis | นำสัญญาอัจฉริยะสำหรับเครือข่ายใหม่ |

### แฟล็กเซิร์ฟเวอร์ {#server-flags}


| **แฟล็ก ของเซิร์ฟเวอร์** |
|---------------------------------------|---------------------------------------------|
| [data-dir](/docs/edge/get-started/cli-commands#data-dir) | [jsonrpc](/docs/edge/get-started/cli-commands#jsonrpc) |
| [json-rpc-block-range-limit](/docs/edge/get-started/cli-commands#json-rpc-block-range-limit) | [json-rpc-batch-request-limit](/docs/edge/get-started/cli-commands#json-rpc-batch-request-limit) |
| [grpc](/docs/edge/get-started/cli-commands#grpc) | [libp2p](/docs/edge/get-started/cli-commands#libp2p) |
| [Prometheus](/docs/edge/get-started/cli-commands#prometheus) | [block-gas-target](/docs/edge/get-started/cli-commands#block-gas-target) |
| [max-peers](/docs/edge/get-started/cli-commands#max-peers) | [max-inbound-peers](/docs/edge/get-started/cli-commands#max-inbound-peers) |
| [max-outbound-peers](/docs/edge/get-started/cli-commands#max-outbound-peers) | [max-enqueued](/docs/edge/get-started/cli-commands#max-enqueued) |
| [log-level](/docs/edge/get-started/cli-commands#log-level) | [log-to](/docs/edge/get-started/cli-commands#log-to) |
| [เชน](/docs/edge/get-started/cli-commands#chain) | [เข้าร่วม](/docs/edge/get-started/cli-commands#join) |
| [nat](/docs/edge/get-started/cli-commands#nat) | [dns](/docs/edge/get-started/cli-commands#dns) |
| [ขีดจำกัดราคา](/docs/edge/get-started/cli-commands#price-limit) | [สล็อตสูงสุด](/docs/edge/get-started/cli-commands#max-slots) |
| [การกำหนดค่า](/docs/edge/get-started/cli-commands#config) | [secrets-config](/docs/edge/get-started/cli-commands#secrets-config) |
| [dev](/docs/edge/get-started/cli-commands#dev) | [dev-interval](/docs/edge/get-started/cli-commands#dev-interval) |
| [no-discover](/docs/edge/get-started/cli-commands#no-discover) | [กู้คืน](/docs/edge/get-started/cli-commands#restore) |
| [block-time](/docs/edge/get-started/cli-commands#block-time) | [access-control-allow-origins](/docs/edge/get-started/cli-commands#access-control-allow-origins) |


#### <h4></h4><i>data-dir</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--data-dir DATA_DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    server --data-dir ./example-dir

</TabItem>
</Tabs>

ใช้เพื่อระบุไดเรกทอรีข้อมูลที่ใช้สำหรับจัดเก็บข้อมูลไคลเอ็นต์ Polygon Edge ค่าเริ่มต้น: `./test-chain`

---


#### <h4></h4><i>jsonrpc</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--jsonrpc JSONRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    server --jsonrpc 127.0.0.1:10000

</TabItem>
</Tabs>

ตั้งค่าที่อยู่และพอร์ตสำหรับบริการ JSON-RPC `address:port`   หากมีการกำหนดเฉพาะพอร์ต `:10001` บริการจะผูกกับอินเทอร์เฟซทั้งหมด `0.0.0.0:10001`   
หากไม่ระบุ บริการจะผูกกับ `address:port` ที่เป็นค่าเริ่มต้น   ที่อยู่ตามค่าเริ่มต้น: `0.0.0.0:8545`

---

#### <h4></h4><i>json-rpc-block-range-limit</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--json-rpc-block-range-limit BLOCK_RANGE]

</TabItem>
  <TabItem value="example" label="Example">

    server --json-rpc-block-range-limit 1500

</TabItem>
</Tabs>

ตั้งค่าช่วงบล็อกสูงสุดเพื่อพิจารณาเมื่อทำการประมวลผลคำขอของ json-rpc ซึ่งรวมจากค่า Bock/toBlock (เช่น eth_getLogs)  ขีดจำกัดนี้สามารถปิดการทำงานได้อย่างสมบูรณ์ได้โดยตั้งค่าค่า`0`ไปยังค่าเริ่มต้น: `1000`

---

#### <h4></h4><i>json-rpc-batch-request-limit</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--json-rpc-batch-request-limit MAX_LENGTH]

</TabItem>
  <TabItem value="example" label="Example">

    server --json-rpc-batch-request-limit 50

</TabItem>
</Tabs>

ตั้งค่าความยาวสูงสุดที่จะถูกพิจารณาเมื่อจัดการการร้องขอชุดของ json - rpcขีดจำกัดนี้สามารถปิดการทำงานได้อย่างสมบูรณ์ได้โดยตั้งค่าค่า`0`ไปยังค่าเริ่มต้น: `20`

---

#### <h4></h4><i>grpc</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    server --grpc-address 127.0.0.1:10001

</TabItem>
</Tabs>

ตั้งค่าที่อยู่และพอร์ตสำหรับบริการ gRPC `address:port`ที่อยู่ตามค่าเริ่มต้น: `127.0.0.1:9632`

---

#### <h4></h4><i>libp2p</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--libp2p LIBP2P_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    server --libp2p 127.0.0.1:10002

</TabItem>
</Tabs>

ตั้งค่าที่อยู่และพอร์ตสำหรับบริการ libp2p `address:port`ที่อยู่ตามค่าเริ่มต้น: `127.0.0.1:1478`

---

#### <h4></h4><i>prometheus</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--prometheus PROMETHEUS_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    server --prometheus 127.0.0.1:10004

</TabItem>
</Tabs>

ตั้งค่าที่อยู่และพอร์ตสำหรับเซิร์ฟเวอร์ Prometheus `address:port`   
หากมีการกำหนดเฉพาะพอร์ต `:5001` บริการจะผูกกับอินเทอร์เฟซทั้งหมด `0.0.0.0:5001`   หากไม่ระบุ บริการจะไม่เริ่มทำงาน

---

#### <h4></h4><i>block-gas-target</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--block-gas-target BLOCK_GAS_TARGET]

</TabItem>
  <TabItem value="example" label="Example">

    server --block-gas-target 10000000

</TabItem>
</Tabs>

ตั้งค่าขีดจำกัดค่าแก๊สต่อบล็อกเป้าหมายสำหรับเชนค่าเริ่มต้น (ไม่บังคับ): `0`

ดูคำอธิบายโดยละเอียดเพิ่มเติมเกี่ยวกับเป้าหมายค่าแก๊สต่อบล็อกได้ใน[ส่วน TxPool](/docs/edge/architecture/modules/txpool#block-gas-target)

---

#### <h4></h4><i>max-peers</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--max-peers PEER_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    server --max-peers 40

</TabItem>
</Tabs>

ตั้งค่าจำนวนเพียร์สูงสุดของไคลเอ็นต์ค่าเริ่มต้น: `40`

ควรระบุขีดจำกัดเพียร์โดยใช้ค่าสถานะ `max-peers` หรือ `max-inbound/outbound-peers`

---

#### <h4></h4><i>max-inbound-peers</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--max-inbound-peers PEER_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    server --max-inbound-peers 32

</TabItem>
</Tabs>

ตั้งค่าจำนวนเพียร์ขาเข้าสูงสุดของไคลเอ็นต์หากตั้งค่า `max-peers` ขีดจำกัด max-inbound-peer จะได้รับการคำนวณโดยใช้สูตรต่อไปนี้

`max-inbound-peer = InboundRatio * max-peers` โดย `InboundRatio` คือ `0.8`

---

#### <h4></h4><i>max-outbound-peers</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--max-outbound-peers PEER_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    server --max-outbound-peers 8

</TabItem>
</Tabs>

ตั้งค่าจำนวนเพียร์ขาออกสูงสุดของไคลเอ็นต์หากตั้งค่า `max-peers` จำนวน max-outbound-peer จะได้รับการคำนวณโดยใช้สูตรต่อไปนี้

`max-outbound-peer = OutboundRatio * max-peers` โดย `OutboundRatio` คือ `0.2`

---

#### <h4></h4><i>max-enqueued</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--max-enqueued ENQUEUED_TRANSACTIONS]

</TabItem>
  <TabItem value="example" label="Example">

    server --max-enqueued 210

</TabItem>
</Tabs>

ตั้งค่าจำนวนสูงสุดของธุรกรรมในคิวต่อหนึ่งบัญชีค่าเริ่มต้น: `128`

---

#### <h4></h4><i>log-level</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--log-level LOG_LEVEL]

</TabItem>
  <TabItem value="example" label="Example">

    server --log-level DEBUG

</TabItem>
</Tabs>

ตั้งค่าระดับบันทึกสำหรับคอนโซลเอาต์พุตค่าเริ่มต้น: `INFO`

---

#### <h4></h4><i>log-to</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--log-to LOG_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    server --log-to node.log

</TabItem>
</Tabs>

กำหนดชื่อไฟล์บันทึกที่จะเก็บเอาต์พุตบันทึกทั้งหมดจากคำสั่งเซิร์ฟเวอร์ตามค่าเริ่มต้น จะมีการส่งข้อมูลบันทึกเซิร์ฟเวอร์ทั้งหมดไปยังคอนโซล (stdout)แต่ถ้าตั้งค่าสถานะไว้ จะไม่มีเอาต์พุตไปยังคอนโซลเมื่อเรียกใช้คำสั่งเซิร์ฟเวอร์

---

#### <h4></h4><i>chain</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    server --chain /home/ubuntu/genesis.json

</TabItem>
</Tabs>

ระบุไฟล์ Genesis ที่ใช้สำหรับเริ่มเชนค่าเริ่มต้น: `./genesis.json`

---

#### <h4></h4><i>join</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--join JOIN_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    server --join /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

ระบุที่อยู่ของเพียร์ที่ควรเข้าร่วม

---

#### <h4></h4><i>nat</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--nat NAT_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    server --nat 192.0.2.1

</TabItem>
</Tabs>

ตั้งค่าที่อยู่ IP ภายนอกโดยไม่มีพอร์ตตามที่เพียร์สามารถเห็น

---

#### <h4></h4><i>dns</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--dns DNS_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    server --dns dns4/example.io

</TabItem>
</Tabs>

ตั้งค่าที่อยู่ DNS โฮสต์ซึ่งสามารถใช้เพื่อโฆษณา DNS ภายนอกรองรับ `dns`,`dns4`,`dns6`

---

#### <h4></h4><i>ขีดจำกัดราคา</i>


<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--price-limit PRICE_LIMIT]

</TabItem>
  <TabItem value="example" label="Example">

    server --price-limit 10000

</TabItem>
</Tabs>

ตั้งค่าขีดจำกัดราคาแก๊สขั้นต่ำเพื่อบังคับใช้สำหรับการยอมรับในพูลเริ่มต้น: `1`

---

#### <h4></h4><i>สล็อตสูงสุด</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--max-slots MAX_SLOTS]

</TabItem>
  <TabItem value="example" label="Example">

    server --max-slots 1024

</TabItem>
</Tabs>

ตั้งสล็อตสูงสุดในพูลค่าเริ่มต้น: `4096`

---

#### <h4></h4><i>การกำหนดค่า</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--config CLI_CONFIG_PATH]

</TabItem>
  <TabItem value="example" label="Example">

    server --config ./myConfig.json

</TabItem>
</Tabs>

ระบุพาธไปยังการกำหนดค่า CLIรองรับ `.json`

---

#### <h4></h4><i>secrets-config</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--secrets-config SECRETS_CONFIG]

</TabItem>
  <TabItem value="example" label="Example">

    server --secrets-config ./secretsManagerConfig.json

</TabItem>
</Tabs>

ตั้งค่าพาธไปยังไฟล์กำหนดค่า SecretsManagerใช้สำหรับ Hashicorp Vaul, AWS SSM และ GCP Secrets Managerหากไม่ระบุ จะมีการใช้ตัวจัดการข้อมูลลับ FS ภายใน

---

#### <h4></h4><i>dev</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--dev DEV_MODE]

</TabItem>
  <TabItem value="example" label="Example">

    server --dev

</TabItem>
</Tabs>

ตั้งค่าไคลเอ็นต์เป็นโหมด devค่าปริยาย`false`:ในโหมด dev การค้นพบ Peer จะถูกปิดการทำงานโดยค่าปริยาย

---

#### <h4></h4><i>dev-interval</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--dev-interval DEV_INTERVAL]

</TabItem>
  <TabItem value="example" label="Example">

    server --dev-interval 20

</TabItem>
</Tabs>

ตั้งค่าช่วงแจ้งเตือน dev ของไคลเอ็นต์ หน่วยเป็นวินาทีค่าเริ่มต้น: `0`

---

#### <h4></h4><i>no-discover</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--no-discover NO_DISCOVER]

</TabItem>
  <TabItem value="example" label="Example">

    server --no-discover

</TabItem>
</Tabs>

ป้องกันไคลเอ็นต์ไม่ให้ค้นพบเพียร์อื่นๆค่าเริ่มต้น: `false`

---

#### <h4></h4><i>restore</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--restore RESTORE]

</TabItem>
  <TabItem value="example" label="Example">

    server --restore backup.dat

</TabItem>
</Tabs>

กู้คืนบล็อกจากไฟล์เก็บถาวรที่ระบุ

---

#### <h4></h4><i>block-time</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--block-time BLOCK_TIME]

</TabItem>
  <TabItem value="example" label="Example">

    server --block-time 1000

</TabItem>
</Tabs>

ตั้งค่าเวลาในการสร้างบล็อก หน่วยเป็นวินาทีค่าเริ่มต้น: `2`

---

#### <h4></h4><i>access-control-allow-origins</i>
<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--access-control-allow-origins ACCESS_CONTROL_ALLOW_ORIGINS]

</TabItem>
  <TabItem value="example" label="Example">

    server --access-control-allow-origins "https://edge-docs.polygon.technology"

</TabItem>
</Tabs>

ตั้งค่าโดเมนที่ได้รับอนุญาตให้สามารถแชร์การตอบสนองจากคำขอ JSON-RPC   
เพิ่มหลายค่าสถานะ `--access-control-allow-origins "https://example1.com" --access-control-allow-origins "https://example2.com"` เพื่ออนุญาตหลายโดเมน    
หากไม่ระบุ จะกำหนดส่วนหัว Access-Control-Allow-Origins เป็น `*` และโดเมนทั้งหมดจะได้รับอนุญาต

---

### แฟล็ก Genesis {#genesis-flags}
| **แฟล็ก Genesis** |
|---------------------------------------|---------------------------------------------|
| [dir](/docs/edge/get-started/cli-commands#dir) | [ชื่อ](/docs/edge/get-started/cli-commands#name) |
| [pos](/docs/edge/get-started/cli-commands#pos) | [epoch-size](/docs/edge/get-started/cli-commands#epoch-size) |
| [วางล่วงหน้า](/docs/edge/get-started/cli-commands#premine) | [chainid](/docs/edge/get-started/cli-commands#chainid) |
| [ibft-validator-type](/docs/edge/get-started/cli-commands#ibft-validator-type) | [ibft-validators-prefix-path](/docs/edge/get-started/cli-commands#ibft-validators-prefix-path) |
| [ibft-validator](/docs/edge/get-started/cli-commands#ibft-validator) | [block-gas-limit](/docs/edge/get-started/cli-commands#block-gas-limit) |
| [ฉันทามติ](/docs/edge/get-started/cli-commands#consensus) | [bootnode](/docs/edge/get-started/cli-commands#bootnode) |
| [max-validator-count](/docs/edge/get-started/cli-commands#max-validator-count) | [min-validator-count](/docs/edge/get-started/cli-commands#min-validator-count) |


#### <h4></h4><i>dir</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--dir DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --dir ./genesis.json

</TabItem>
</Tabs>

ตั้งค่าไดเรกทอรีสำหรับข้อมูล Genesis บน Polygon Edge ค่าเริ่มต้น: `./genesis.json`

---

#### <h4></h4><i>ชื่อ</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--name NAME]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --name test-chain

</TabItem>
</Tabs>

ตั้งชื่อให้กับเชนค่าเริ่มต้น: `polygon-edge`

---

#### <h4></h4><i>pos</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--pos IS_POS]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --pos

</TabItem>
</Tabs>

ตั้งค่าค่าสถานะที่ระบุว่าไคลเอ็นต์ควรใช้ IBFT แบบ Proof of Stakeตั้งค่าเริ่มต้นเป็น Proof of Authority หากไม่ได้ให้ค่าสถานะไว้หรือมีค่าเป็น `false`

---

#### <h4></h4><i>epoch-size</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--epoch-size EPOCH_SIZE]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --epoch-size 50

</TabItem>
</Tabs>

ตั้งค่าขนาด Epoch สำหรับเชนค่าเริ่มต้น `100000`

---

#### <h4></h4><i>premine</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--premine ADDRESS:VALUE]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --premine 0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000

</TabItem>
</Tabs>

ตั้งค่าบัญชีและยอดคงเหลือที่วางไว้ล่วงหน้าในรูปแบบ `address:amount`จำนวนสามารถเป็นทศนิยมหรือฐานสิบหกสมดุลที่กำหนดล่วงหน้า: (โทเค็นแบบดั้งเดิม`0xD3C21BCECCEDA1000000`1 ล้าน)

---

#### <h4></h4><i>chainid</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--chain-id CHAIN_ID]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --chain-id 200

</TabItem>
</Tabs>

ตั้งค่า ID ของเชนค่าเริ่มต้น: `100`

---

#### <h4></h4><i>ibft-validator-type</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--ibft-validator-type IBFT_VALIDATOR_TYPE]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --ibft-validator-type ecdsa

</TabItem>
</Tabs>

ระบุโหมดการตรวจสอบความถูกต้องของส่วนหัวบล็อกค่าที่เป็นไปได้: `[ecdsa, bls]`ค่าเริ่มต้น: `bls`

---

#### <h4></h4><i>ibft-validators-prefix-path</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--ibft-validators-prefix-path IBFT_VALIDATORS_PREFIX_PATH]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --ibft-validators-prefix-path test-chain-

</TabItem>
</Tabs>

พาธนำหน้าสำหรับไดเรกทอรีโฟลเดอร์ตัวตรวจสอบความถูกต้องจำเป็นต้องมี หากเว้นค่าสถานะ `ibft-validator` ไว้

---

#### <h4></h4><i>ibft-validator</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--ibft-validator IBFT_VALIDATOR_LIST]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --ibft-validator 0xC12bB5d97A35c6919aC77C709d55F6aa60436900

</TabItem>
</Tabs>

ตั้งค่าที่อยู่ที่ส่งผ่านเป็นตัวตรวจสอบความถูกต้อง IBFTจำเป็นต้องมี หากเว้นค่าสถานะ `ibft-validators-prefix-path` ไว้
1. หากเครือข่ายทำงานด้วย ECDSA รูปแบบจะเป็น `--ibft-validator [ADDRESS]`
2. หากเครือข่ายทำงานด้วย BLS รูปแบบจะเป็น `--ibft-validator [ADDRESS]:[BLS_PUBLIC_KEY]`

---

#### <h4></h4><i>block-gas-limit</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--block-gas-limit BLOCK_GAS_LIMIT]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --block-gas-limit 5000000

</TabItem>
</Tabs>

หมายถึงปริมาณแก๊สสูงสุดที่การดำเนินการทั้งหมดในบล็อกใช้ค่าเริ่มต้น: `5242880`

---

#### <h4></h4><i>consensus</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--consensus CONSENSUS_PROTOCOL]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --consensus ibft

</TabItem>
</Tabs>

ตั้งค่าโปรโตคอลฉันทามติค่าเริ่มต้น: `pow`

---

#### <h4></h4><i>bootnode</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--bootnode BOOTNODE_URL]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --bootnode /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

Multiaddr URL สำหรับการเริ่มต้นระบบการค้นพบ p2pใช้ค่าสถานะนี้ได้หลายครั้งคุณสามารถระบุที่อยู่ DNS ของบูตโหนด แทนที่อยู่ IP ได้

---

#### <h4></h4><i>max-validator-count</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--max-validator-count MAX_VALIDATOR_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --max-validator-count 42

</TabItem>
</Tabs>

จำนวนผู้วาง Stake สูงสุดที่สามารถเข้าร่วมชุดตัวตรวจสอบความถูกต้องตามฉันทามติ PoSตัวเลขนี้ต้องไม่เกินค่า MAX_SAFE_INTEGER (2^53 - 2)

---

#### <h4></h4><i>min-validator-count</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--min-validator-count MIN_VALIDATOR_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --min-validator-count 4

</TabItem>
</Tabs>

จำนวนผู้วาง Stake ขั้นต่ำที่จำเป็นในการเข้าร่วมชุดตัวตรวจสอบความถูกต้องตามฉันทามติ PoSจำนวนนี้ต้องไม่เกินค่าของ max-validator-countค่าเริ่มต้นเป็น 1.

---

### genesis ปรับใช้เบื้องต้นแฟล็ก {#genesis-predeploy-flags}

<h4><i>เส้นทางของวัตถุ</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis predeploy [--artifacts-path PATH_TO_ARTIFACTS]

</TabItem>
  <TabItem value="example" label="Example">

    genesis predeploy --artifacts-path ./ArtifactsData.json

</TabItem>
</Tabs>

ตั้งค่าพาธไปยังวัตถุสำหรับสัญญา`abi`ที่มีค่า JSON `bytecode`และ`deployedBytecode`

---

<h4><i>chain</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis predeploy [--chain PATH_TO_GENESIS]

</TabItem>
  <TabItem value="example" label="Example">

    genesis predeploy --chain ./genesis.json

</TabItem>
</Tabs>

ตั้งค่าพาธไปยัง`genesis.json`แฟ้มที่ควรจะมีการอัปเดตค่าเริ่มต้น `./genesis.json`

---

<h4><i>ตัวสร้างอาร์ตเตอร์</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis predeploy [--constructor-args CONSTRUCTOR_ARGUMENT]

</TabItem>
  <TabItem value="example" label="Example">

    genesis predeploy --constructor-args 123

</TabItem>
</Tabs>

ตั้งค่าอาร์กิวเมนต์ตัวสร้างสัญญาแบบ Smart หากมีสำหรับคู่มือโดยละเอียดเกี่ยวกับวิธีการอาร์กิวเมนต์เหล่านี้ควรมีลักษณะอย่างไร โปรดอ้างอิง[บทความการเคลื่อนไหว](/docs/edge/additional-features/predeployment)

---

<h4><i>ที่อยู่ก่อนการใช้</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis predeploy [--predeploy-address PREDEPLOY_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    genesis predeploy --predeploy-address 0x5555

</TabItem>
</Tabs>

ตั้งค่าที่อยู่เพื่อปรับใช้ไปยังการตั้งค่าดั้งเดิมค่าเริ่มต้น `0x0000000000000000000000000000000000001100`

---


## คำสั่งของผู้ดำเนินการ {#operator-commands}

### คำสั่งของเพียร์ {#peer-commands}

| **คำสั่ง** | **คำอธิบาย** |
|------------------------|-------------------------------------------------------------------------------------|
| peers add | เพิ่มเพียร์ใหม่โดยใช้ที่อยู่ libp2p ของพวกเขา |
| peers list | รายการเพียร์ทั้งหมดที่เชื่อมต่อกับไคลเอ็นต์ผ่าน libp2p |
| peers status | ส่งกลับสถานะของเพียร์เฉพาะจากรายการเพียร์ โดยใช้ที่อยู่ libp2p |

<h3>ค่าสถานะ peers add</h3>

<h4><i>addr</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers add --addr PEER_ADDRESS

</TabItem>
  <TabItem value="example" label="Example">

    peers add --addr /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

ที่อยู่ libp2p ของเพียร์ในรูปแบบ multiaddr

---

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers add [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    peers add --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

ที่อยู่ของ gRPC APIค่าเริ่มต้น: `127.0.0.1:9632`

<h3>ค่าสถานะ peers list</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers list [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    peers list --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

ที่อยู่ของ gRPC APIค่าเริ่มต้น: `127.0.0.1:9632`

<h3>ค่าสถานะ peers status</h3>

<h4><i>peer-id</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers status --peer-id PEER_ID

</TabItem>
  <TabItem value="example" label="Example">

    peers status --peer-id 16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

ID โหนด Libp2p ของเพียร์เฉพาะภายในเครือข่าย p2p

---

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    peers status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

ที่อยู่ของ gRPC APIค่าเริ่มต้น: `127.0.0.1:9632`

### คำสั่ง IBFT {#ibft-commands}

| **คำสั่ง** | **คำอธิบาย** |
|------------------------|-------------------------------------------------------------------------------------|
| ibft snapshot | ส่งกลับสแนปชอต IBFT |
| ibft candidates | ค้นหาชุดผู้สมัครที่เสนอปัจจุบัน เช่นเดียวกับผู้สมัครที่ยังไม่ได้รวม |
| ibft propose | เสนอผู้สมัครใหม่ที่จะเพิ่ม/ลบออกจากชุดตัวตรวจสอบความถูกต้อง |
| ibft status | ส่งกลับสถานะโดยรวมของไคลเอ็นต์ IBFT |
| ibft switch | เพิ่มการกำหนดค่า Fork ไปยังไฟล์ genesis.json เพื่อสลับประเภท IBFT |
| ibft quorum | ระบุหมายเลขบล็อกที่จะใช้เมธอด optimal quorum size เพื่อให้ได้ฉันทามติหลังหลังจากนั้น |


<h3>ค่าสถานะ ibft snapshot</h3>

<h4><i>number</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft snapshot [--number BLOCK_NUMBER]

</TabItem>
  <TabItem value="example" label="Example">

    ibft snapshot --number 100

</TabItem>
</Tabs>

ความสูงของบล็อก (ตัวเลข) สำหรับสแนปชอต

---

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft snapshot [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    ibft snapshot --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

ที่อยู่ของ gRPC APIค่าเริ่มต้น: `127.0.0.1:9632`

<h3>ค่าสถานะ ibft candidates</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft candidates [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    ibft candidates --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

ที่อยู่ของ gRPC APIค่าเริ่มต้น: `127.0.0.1:9632`

<h3>ค่าสถานะ ibft propose</h3>

<h4><i>vote</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft propose --vote VOTE

</TabItem>
  <TabItem value="example" label="Example">

    ibft propose --vote auth

</TabItem>
</Tabs>

เสนอการเปลี่ยนแปลงชุดตัวตรวจสอบความถูกต้อง ค่าที่เป็นไปได้: `[auth, drop]`

---

<h4><i>addr</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft propose --addr ETH_ADDRESS

</TabItem>
  <TabItem value="example" label="Example">

    ibft propose --addr 0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7

</TabItem>
</Tabs>

ที่อยู่ของบัญชีที่จะลงคะแนนให้

---

<h4><i>bls</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft propose --bls BLS_PUBLIC_KEY

</TabItem>
  <TabItem value="example" label="Example">

    ibft propose --bls 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf

</TabItem>
</Tabs>

คีย์สาธารณะ BLS ของบัญชีที่จะลงคะแนนให้ ซึ่งจำเป็นเฉพาะในโหมด BLS

---

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft candidates [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    ibft candidates --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

ที่อยู่ของ gRPC APIค่าเริ่มต้น: `127.0.0.1:9632`

<h3>ค่าสถานะ ibft status</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    ibft status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

ที่อยู่ของ gRPC APIค่าเริ่มต้น: `127.0.0.1:9632`

<h3>ibft switch flags</h3>

<h4><i>chain</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --chain genesis.json

</TabItem>
</Tabs>

ระบุไฟล์ Genesis เพื่ออัปเดตค่าเริ่มต้น: `./genesis.json`

---

<h4><i>ประเภท</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--type TYPE]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --type PoS

</TabItem>
</Tabs>

ระบุประเภท IBFT เพื่อสลับค่าที่เป็นไปได้: `[PoA, PoS]`

---

<h4><i>deployment</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--deployment DEPLOYMENT]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --deployment 100

</TabItem>
</Tabs>

ระบุความสูงของการปรับใช้สัญญาพร้อมใช้งานกับ PoS เท่านั้น

---

<h4><i>from</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--from FROM]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --from 200

</TabItem>
</Tabs>

---

<h4><i>ibft-validator-type</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

     ibft switch [--ibft-validator-type IBFT_VALIDATOR_TYPE]

</TabItem>
  <TabItem value="example" label="Example">

     ibft switch --ibft-validator-type ecdsa

</TabItem>
</Tabs>

ระบุโหมดการตรวจสอบความถูกต้องของส่วนหัวบล็อกค่าที่เป็นไปได้: `[ecdsa, bls]`ค่าเริ่มต้น: `bls`

---

<h4><i>ibft-validators-prefix-path</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

     ibft switch [--ibft-validators-prefix-path IBFT_VALIDATORS_PREFIX_PATH]

</TabItem>
  <TabItem value="example" label="Example">

     ibft switch --ibft-validators-prefix-path test-chain-

</TabItem>
</Tabs>

พาธนำหน้าสำหรับไดเรกทอรีของตัวตรวจสอบความถูกต้องใหม่จำเป็นต้องมี หากเว้นค่าสถานะ `ibft-validator` ไว้ใช้ได้เฉพาะเมื่อโหมด IBFT เป็น PoA (เว้นค่าสถานะ `--pos` ไว้)

---

<h4><i>ibft-validator</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

     ibft switch [--ibft-validator IBFT_VALIDATOR_LIST]

</TabItem>
  <TabItem value="example" label="Example">

     ibft switch --ibft-validator 0xC12bB5d97A35c6919aC77C709d55F6aa60436900

</TabItem>
</Tabs>

ชุดที่ส่งผ่านในที่อยู่เป็นตัวตรวจสอบความถูกต้อง IBFT ที่ใช้หลัง Forkจำเป็นต้องมี หากเว้นค่าสถานะ `ibft-validators-prefix-path` ไว้พร้อมใช้งานในโหมด PoA เท่านั้น
1. หากเครือข่ายทำงานด้วย ECDSA รูปแบบจะเป็น `--ibft-validator [ADDRESS]`
2. หากเครือข่ายทำงานด้วย BLS รูปแบบจะเป็น `--ibft-validator [ADDRESS][BLS_PUBLIC_KEY]`

---

<h4><i>max-validator-count</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--max-validator-count MAX_VALIDATOR_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --max-validator-count 42

</TabItem>
</Tabs>

จำนวนผู้วาง Stake สูงสุดที่สามารถเข้าร่วมชุดตัวตรวจสอบความถูกต้องตามฉันทามติ PoSตัวเลขนี้ต้องไม่เกินค่า MAX_SAFE_INTEGER (2^53 - 2)

---

<h4><i>min-validator-count</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--min-validator-count MIN_VALIDATOR_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --min-validator-count 4

</TabItem>
</Tabs>

จำนวนผู้วาง Stake ขั้นต่ำที่จำเป็นในการเข้าร่วมชุดตัวตรวจสอบความถูกต้องตามฉันทามติ PoSจำนวนนี้ต้องไม่เกินค่าของ max-validator-countค่าเริ่มต้นเป็น 1

ระบุความสูงเริ่มต้นของ Fork

---

<h3>ค่าสถานะ ibft quorum</h3>

<h4><i>from</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft quorum [--from your_quorum_switch_block_num]

</TabItem>
  <TabItem value="example" label="Example">

    ibft quorum --from 350

</TabItem>
</Tabs>

ความสูงที่จะสลับการคำนวณ Quorum เป็น QuorumOptimal ซึ่งใช้สูตร `(2/3 * N)` โดยที่ `N` เป็นจำนวนโหนดตัวตรวจสอบความถูกต้องโปรดทราบว่าสิ่งนี้มีไว้สำหรับความเข้ากันได้แบบย้อนหลัง กล่าวคือ มีไว้สำหรับเชนที่ใช้การคำนวณแบบเดิมของ Quorum จนถึงความสูงบล็อกที่แน่นอนเท่านั้น

---

<h4><i>chain</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft quorum [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    ibft quorum --chain genesis.json

</TabItem>
</Tabs>

ระบุไฟล์ Genesis เพื่ออัปเดตค่าเริ่มต้น: `./genesis.json`

### คำสั่งพูลธุรกรรม {#transaction-pool-commands}

| **คำสั่ง** | **คำอธิบาย** |
|------------------------|--------------------------------------------------------------------------------------|
| txpool status | ส่งกลับจำนวนธุรกรรมในพูล |
| txpool subscribe | สมัครติดตามอีเวนต์ในพูลธุรกรรม |

<h3>ค่าสถานะ txpool status</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    txpool status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

ที่อยู่ของ gRPC APIค่าเริ่มต้น: `127.0.0.1:9632`

<h3>ค่าสถานะ txpool subscribe</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

ที่อยู่ของ gRPC APIค่าเริ่มต้น: `127.0.0.1:9632`

---

<h4><i>promoted</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--promoted LISTEN_PROMOTED]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --promoted

</TabItem>
</Tabs>

สมัครติดตามอีเวนต์ธุรกรรมที่ปรับให้เผยแพร่ได้ใน TxPool

---

<h4><i>dropped</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--dropped LISTEN_DROPPED]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --dropped

</TabItem>
</Tabs>

สมัครติดตามอีเวนต์ธุรกรรมที่ดรอปใน TxPool

---

<h4><i>demoted</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--demoted LISTEN_DEMOTED]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --demoted

</TabItem>
</Tabs>

สมัครติดตามอีเวนต์ธุรกรรมที่ปรับกลับไปเป็นธุรกรรมภายในของ TxPool

---

<h4><i>added</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--added LISTEN_ADDED]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --added

</TabItem>
</Tabs>

สมัครติดตามอีเวนต์ธุรกรรมที่เพิ่มไปยัง TxPool

---

<h4><i>enqueued</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--enqueued LISTEN_ENQUEUED]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --enqueued

</TabItem>
</Tabs>

สมัครติดตามอีเวนต์ธุรกรรมที่เข้าคิวในคิวบัญชี

---

### คำสั่งบล็อกเชน {#blockchain-commands}

| **คำสั่ง** | **คำอธิบาย** |
|------------------------|-------------------------------------------------------------------------------------|
| status | ส่งกลับสถานะของไคลเอ็นต์ดูการตอบกลับโดยละเอียดได้ที่ด้านล่าง |
| monitor | สมัครติดตามอีเวนต์สตรีมของบล็อกเชนดูการตอบกลับโดยละเอียดได้ที่ด้านล่าง |
| version | ส่งกลับเวอร์ชันปัจจุบันของไคลเอ็นต์ |

<h3>ค่าสถานะ status</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

ที่อยู่ของ gRPC APIค่าเริ่มต้น: `127.0.0.1:9632`

<h3>ค่าสถานะ monitor</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    monitor [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    monitor --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

ที่อยู่ของ gRPC APIค่าเริ่มต้น: `127.0.0.1:9632`

---
<h3>คำสั่งของเวอร์ชัน</h3>


<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    version

</TabItem>
</Tabs>

แสดงเวอร์ชั่นปล่อย, แบรนช์ git , count and building

## คำสั่ง Secrets {#secrets-commands}

| **คำสั่ง** | **คำอธิบาย** |
|-------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| secrets init | เริ่มต้นคีย์ส่วนตัวไปยังตัวจัดการข้อมูลลับที่เกี่ยวข้อง |
| secrets generate | สร้างไฟล์การกำหนดค่าตัวจัดการความลับ ซึ่งสามารถแยกวิเคราะห์โดย Polygon Edge |
| ออกข้อมูลลับ | พิมพ์ที่อยู่ของคีย์สาธารณะ BS ที่อยู่ของตัวตรวจสอบความถูกต้องและโหนดสำหรับการอ้างอิง |

### แฟล็ก secrets init {#secrets-init-flags}

<h4><i>การกำหนดค่า</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets init [--config SECRETS_CONFIG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets init --config ./secretsManagerConfig.json

</TabItem>
</Tabs>

ตั้งค่าพาธไปยังไฟล์กำหนดค่า SecretsManagerใช้สำหรับ Hashicorp Vaultหากไม่ระบุ จะมีการใช้ตัวจัดการข้อมูลลับ FS ภายใน

---

<h4><i>data-dir</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets init [--data-dir DATA_DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    secrets init --data-dir ./example-dir

</TabItem>
</Tabs>

ตั้งค่าไดเรกทอรีสำหรับข้อมูล Polygon Edge หากใช้ FS ภายใน

---

<h4><i>ecdsa</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets init [--ecdsa FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets init --ecdsa=false

</TabItem>
</Tabs>

ตั้งค่าค่าสถานะที่ระบุว่าจะสร้างคีย์ ECDSA หรือไม่ค่าเริ่มต้น: `true`

---

<h4><i>network</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets init [--network FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets init --network=false

</TabItem>
</Tabs>

ตั้งค่าค่าสถานะที่ระบุว่าจะสร้างคีย์เครือข่าย Libp2p หรือไม่ค่าเริ่มต้น: `true`

---

<h4><i>bls</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets init [--bls FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets init --bls

</TabItem>
</Tabs>

ตั้งค่าค่าสถานะที่ระบุว่าจะสร้างคีย์ BLS หรือไม่ค่าเริ่มต้น: `true`

### ค่าสถานะ secrets generate {#secrets-generate-flags}

<h4><i>dir</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--dir DATA_DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --dir ./example-dir

</TabItem>
</Tabs>

ตั้งค่าไดเรกทอรีสำหรับไฟล์การกำหนดค่าตัวจัดการข้อมูลลับ ค่าเริ่มต้น: `./secretsManagerConfig.json`

---

<h4><i>ประเภท</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--type TYPE]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --type hashicorp-vault

</TabItem>
</Tabs>

ระบุประเภทตัวจัดการข้อมูลลับ [`hashicorp-vault`]ค่าเริ่มต้น: `hashicorp-vault`

---

<h4><i>token</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--token TOKEN]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --token s.zNrXa9zF9mgrdnClM7PZ19cu

</TabItem>
</Tabs>

ระบุโทเค็นเข้าถึงบริการ

---

<h4><i>server-url</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--server-url SERVER_URL]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --server-url http://127.0.0.1:8200

</TabItem>
</Tabs>

ระบุ URL เซิร์ฟเวอร์สำหรับบริการ

---

<h4><i>name</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--name NODE_NAME]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --name node-1

</TabItem>
</Tabs>

ระบุชื่อของโหนดสำหรับการเก็บบันทึกบนบริการค่าเริ่มต้น: `polygon-edge-node`

---

<h4><i>namespace</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--namespace NAMESPACE]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --namespace my-namespace

</TabItem>
</Tabs>

ระบุเนมสเปซที่ใช้สำหรับตัวจัดการข้อมูลลับของ Hashicorp Vaultค่าเริ่มต้น: `admin`

### แฟล็กของลับ {#secrets-output-flags}

<h4><i>bls</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--bls FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --bls

</TabItem>
</Tabs>

ตั้งค่าแฟล็กที่ระบุว่าจะส่งคีย์สาธารณะของ BS เท่านั้นค่าเริ่มต้น: `true`

---

<h4><i>การกำหนดค่า</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--config SECRETS_CONFIG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --config ./secretsManagerConfig.json

</TabItem>
</Tabs>

ตั้งค่าพาธไปยังไฟล์กำหนดค่า SecretsManagerหากไม่ระบุ ตัวจัดการความลับ FS ในเครื่องจะถูกใช้

---

<h4><i>data-dir</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--data-dir DATA_DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --data-dir ./example-dir

</TabItem>
</Tabs>

ตั้งค่าไดเรกทอรีสำหรับข้อมูล Polygon Edge หากใช้ FS ภายใน

---

<h4><i>node-id</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--node-id FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --node-id

</TabItem>
</Tabs>

ตั้งค่าสถานะที่ระบุว่าจะส่งหมายเลขโหนดของเครือข่ายค่าเริ่มต้น: `true`

---

<h4><i>ตัวตรวจสอบความถูกต้อง</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--validator FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --validator

</TabItem>
</Tabs>

ตั้งค่าสถานะที่ระบุว่าจะส่งเพียงที่อยู่ตัวตรวจสอบความถูกต้องหรือไม่ค่าเริ่มต้น: `true`

---

## การตอบกลับ {#responses}

### การตอบกลับสถานะ {#status-response}

นิยามอ็อบเจ็กต์การตอบกลับโดยใช้ Protocol Buffers
````go title="minimal/proto/system.proto"
message ServerStatus {
    int64 network = 1;

    string genesis = 2;

    Block current = 3;

    string p2pAddr = 4;

    message Block {
        int64 number = 1;
        string hash = 2;
    }
}
````

### การตอบกลับการติดตาม {#monitor-response}
````go title="minimal/proto/system.proto"
message BlockchainEvent {
    // The "repeated" keyword indicates an array
    repeated Header added = 1;
    repeated Header removed = 2;

    message Header {
        int64 number = 1;
        string hash = 2;
    }
}
````

## ยูทิลิตี้ {#utilities}

### คำสั่ง whitelist {#whitelist-commands}

| **คำสั่ง** | **คำอธิบาย** |
|------------------------|-------------------------------------------------------------------------------------|
| whitelist show | แสดงข้อมูลไวท์ลิสต์ |
| whitelist deployment | อัปเดตไวท์ลิสต์การปรับใช้สัญญาอัจฉริยะ |

<h3>whitelist show</h3>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist show

</TabItem>
</Tabs>

แสดงข้อมูลไวท์ลิสต์

---

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist show [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist show --chain genesis.json

</TabItem>
</Tabs>

ระบุไฟล์ Genesis เพื่ออัปเดตค่าเริ่มต้น: `./genesis.json`

---

<h3> whitelist deployment </h3>

<h4><i>chain</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist deployment [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist deployment --chain genesis.json

</TabItem>
</Tabs>

ระบุไฟล์ Genesis เพื่ออัปเดตค่าเริ่มต้น: `./genesis.json`

---

<h4><i>เพิ่ม</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist deployment [--add ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist deployment --add 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d

</TabItem>
</Tabs>

เพิ่มที่อยู่ใหม่ไปยังไวท์ลิสต์การปรับใช้สัญญาเฉพาะที่อยู่ในไวท์ลิสต์การปรับใช้สัญญาเท่านั้นที่ปรับใช้สัญญาได้หากว่างเปล่า ที่อยู่ใดๆ สามารถดำเนินการปรับใช้สัญญาได้

---

<h4><i>remove</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist deployment [--remove ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist deployment --remove 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d

</TabItem>
</Tabs>

ลบที่อยู่ออกจากไวท์ลิสต์การปรับใช้สัญญาเฉพาะที่อยู่ในไวท์ลิสต์การปรับใช้สัญญาเท่านั้นที่ปรับใช้สัญญาได้หากว่างเปล่า ที่อยู่ใดๆ สามารถดำเนินการปรับใช้สัญญาได้

---

### ค่าสถานะ backup {#backup-flags}

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    backup [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    backup --grpc-address 127.0.0.1:9632

</TabItem>
</Tabs>

ที่อยู่ของ gRPC APIค่าเริ่มต้น: `127.0.0.1:9632`

---

<h4><i>out</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    backup [--out OUT]

</TabItem>
  <TabItem value="example" label="Example">

    backup --out backup.dat

</TabItem>
</Tabs>

พาธของไฟล์เก็บถาวรที่จะบันทึก

---

<h4><i>from</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    from [--from FROM]

</TabItem>
  <TabItem value="example" label="Example">

    backup --from 0x0

</TabItem>
</Tabs>

ความสูงเริ่มต้นของบล็อกในหน่วยเก็บถาวรค่าเริ่มต้น: 0

---

<h4><i>to</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    to [--to TO]

</TabItem>
  <TabItem value="example" label="Example">

    backup --to 0x2710

</TabItem>
</Tabs>

ความสูงสิ้นสุดของบล็อกในหน่วยเก็บถาวร

---

## เทมเพลต Genesis {#genesis-template}
ต้องใช้ไฟล์ Genesis เพื่อกำหนดสถานะเริ่มต้นของบล็อกเชน (เช่น บางบัญชีควรมียอดคงเหลือเริ่มต้นหรือไม่)

ไฟล์ *./genesis.json* ต่อไปนี้จะได้รับการสร้างขึ้น:
````json
{
    "name": "example",
    "genesis": {
        "nonce": "0x0000000000000000",
        "gasLimit": "0x0000000000001388",
        "difficulty": "0x0000000000000001",
        "mixHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "coinbase": "0x0000000000000000000000000000000000000000",
        "parentHash": "0x0000000000000000000000000000000000000000000000000000000000000000"
    },
    "params": {
        "forks": {},
        "chainID": 100,
        "engine": {
            "pow": {}
        }
    },
    "bootnodes": []
}
````

### ไดเรกทอรีข้อมูล {#data-directory}

เมื่อดำเนินการค่าสถานะ *data-dir* จะมีการสร้างโฟลเดอร์ **test-chain** ขึ้นโครงสร้างโฟลเดอร์ประกอบด้วยโฟลเดอร์ย่อยต่อไปนี้:
* **blockchain** - จัดเก็บ LevelDB ให้กับอ็อบเจ็กต์บล็อกเชน
* **trie** - จัดเก็บ LevelDB ให้กับ Merkle Trie
* **keystore** - จัดเก็บคีย์ส่วนตัวให้กับไคลเอ็นต์รวมถึงคีย์ส่วนตัว libp2p และคีย์ส่วนตัวการซีล/ตัวตรวจสอบความถูกต้อง
* **consensus** - จัดเก็บข้อมูลฉันทามติที่ไคลเอ็นต์อาจต้องใช้ในการดำเนินงาน

## แหล่งข้อมูล {#resources}
* **[Protocol Buffers](https://developers.google.com/protocol-buffers)**

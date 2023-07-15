---
id: definitions
title: คำนิยามทั่วไป
description: นิยามทั่วไปสำหรับคำที่ใช้ใน ChainBridge
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---


## ตัวรีเลย์ {#relayer}
Chainbridge เป็นบริดจ์ประเภทตัวรีเลย์ บทบาทของตัวรีเลย์คือการโหวตเพื่อดำเนินการคำขอ (เช่น มีจำนวนโทเค็นที่ต้องเบิร์น/ปลดล็อกเท่าใด)โดยจะตรวจสอบอีเวนต์จากทุกเชนและโหวตข้อเสนอในสัญญาบริดจ์ของเชนปลายทางเมื่อได้รับอีเวนต์ `Deposit` จากเชนตัวรีเลย์จะเรียกเมธอดในสัญญาบริดจ์เพื่อดำเนินการกับข้อเสนอหลังจากส่งการโหวตในจำนวนที่ต้องการบริดจ์จะ Delegate การดำเนินการให้กับสัญญา Handler


## ประเภทของสัญญา {#types-of-contracts}
ใน ChainBridge มีสัญญา 3 ประเภทในแต่ละเชน ซึ่งเรียกว่าบริดจ์/Handler/Target

| **ประเภท** | **คำอธิบาย** |
|----------|-------------------------------------------------------------------------------------------------------------------------------|
| สัญญาบริดจ์ | สัญญาบริดจ์ที่จัดการคำขอ โหวต และการดำเนินการที่ต้องปรับใช้ในแต่ละเชนผู้ใช้จะเรียก `deposit` ในบริดจ์เพื่อเริ่มการโอน แล้วบริดจ์จะ Delegate กระบวนการให้กับสัญญา Handler ที่สอดคล้องกับสัญญา Targetเมื่อสัญญา Handler เรียกสัญญา Target สำเร็จแล้ว สัญญาบริดจ์จะปล่อยอีเวนต์ `Deposit` เพื่อแจ้งตัวรีเลย์ |
| สัญญา Handler | สัญญานี้จะโต้ตอบกับสัญญา Target เพื่อดำเนินการกับการฝากหรือข้อเสนอ โดยจะตรวจสอบความถูกต้องที่คำขอของผู้ใช้, เรียกสัญญา Target และช่วยการตั้งค่าบางอย่างให้สัญญา Targetมีสัญญา Handler เฉพาะที่จะเรียกสัญญา Target แต่ละสัญญาโดยจะมีอินเทอร์เฟซที่แตกต่างกันการเรียกโดยอ้อมด้วยสัญญา Handler ทำให้บริดจ์สามารถทำการโอนสินทรัพย์หรือข้อมูลได้ทุกประเภท ในขณะนี้จะมีสัญญา Handler อยู่ 3 ประเภทที่ ChainBridge นำไปใช้งานคือ: ERC20, ERC721, และ GenericHandler |
| สัญญา Target | สัญญาที่จัดการสินทรัพย์ที่จะทำการแลกเปลี่ยนหรือข้อความที่จะทำการโอนระหว่างเชนการโต้ตอบกับสัญญานี้จะเกิดขึ้นจากทั้งสองฝั่งของบริดจ์ |

<div style={{textAlign: 'center'}}>

![สถาปัตยกรรม ChainBridge](/img/edge/chainbridge/architecture.svg)*สถาปัตยกรรม ChainBridge*

</div>

<div style={{textAlign: 'center'}}>

![กระบวนการทำงานของการโอนโทเค็น ERC20](/img/edge/chainbridge/erc20-workflow.svg)*ตัวอย่างกระบวนการทำงานของการโอนโทเค็น ERC20*

</div>

## ประเภทของบัญชี {#types-of-accounts}

โปรดตรวจสอบให้แน่ใจว่าบัญชีมีโทเค็นของเชนเพียงพอสำหรับการสร้างธุรกรรมก่อนที่จะเริ่มดำเนินการใน Polygon Edge คุณสามารถกำหนดยอดคงเหลือที่วางไว้ล่วงหน้า (Premined) ให้กับบัญชีเมื่อสร้างบล็อก Genesis

| **ประเภท** | **คำอธิบาย** |
|----------|-------------------------------------------------------------------------------------------------------------------------------|
| แอดมิน | บัญชีนี้จะได้รับบทบาทแอดมินเป็นค่าเริ่มต้น |
| ผู้ใช้ | บัญชีผู้ส่ง/ผู้รับที่ส่ง/รับสินทรัพย์บัญชีผู้ส่งจะจ่ายค่าแก๊สเมื่ออนุมัติการโอนโทเค็นและเรียกการฝากในสัญญาบริดจ์เพื่อเริ่มการโอน |

:::info บทบาทแอดมิน

การดำเนินการบางอย่างสามารถทำได้โดยบัญชีที่มีบทบาทแอดมินเท่านั้นตามค่าเริ่มต้น ผู้ที่ปรับใช้สัญญาบริดจ์จะได้รับบทบาทแอดมินคุณสามารถดูวิธีการกำหนดบทบาทแอดมินให้กับบัญชีอื่นหรือวิธีการลบออกได้ที่ด้านล่างนี้

### เพิ่มบทบาทแอดมิน {#add-admin-role}

เพิ่มเป็นแอดมิน

```bash
# Grant admin role
$ cb-sol-cli admin add-admin \
  --url [JSON_RPC_URL] \
  --privateKey [PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --admin "[NEW_ACCOUNT_ADDRESS]"
```
### เพิกถอนบทบาทแอดมิน {#revoke-admin-role}

ลบออกจากการเป็นแอดมิน

```bash
# Revoke admin role
$ cb-sol-cli admin remove-admin \
  --url [JSON_RPC_URL] \
  --privateKey [PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --admin "[NEW_ACCOUNT_ADDRESS]"
```

## การดำเนินงานที่บัญชี `admin` สามารถทำได้มีดังนี้ {#account-are-as-below}

### กำหนดทรัพยากร {#set-resource}

ตั้งค่า Resource ID ด้วยที่อยู่สัญญาสำหรับ Handler

```bash
# Register new resource
$ cb-sol-cli bridge register-resource \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --resourceId "[RESOURCE_ID]" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[TARGET_CONTRACT_ADDRESS]"
```

### สร้างสัญญาที่เบิร์น/สร้างได้ {#make-contract-burnable-mintable}

กำหนดสัญญาโทเค็นให้สร้าง/เบิร์นได้ใน Handler

```bash
# Let contract burnable/mintable
$ cb-sol-cli bridge set-burn \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[TARGET_CONTRACT_ADDRESS]"
```

### ยกเลิกข้อเสนอ {#cancel-proposal}

ยกเลิกข้อเสนอสำหรับการดำเนินการ

```bash
# Cancel ongoing proposal
$ cb-sol-cli bridge cancel-proposal \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --resourceId "[RESOURCE_ID]" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --chainId "[CHAIN_ID_OF_SOURCE_CHAIN]" \
  --depositNonce "[NONCE]"
```

### หยุดชั่วคราว/ยกเลิกการหยุดชั่วคราว {#pause-unpause}

หยุดการฝาก การสร้างข้อเสนอ การโหวต และการดำเนินการฝากชั่วคราว

```bash
# Pause
$ cb-sol-cli admin pause \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]"

# Unpause
$ cb-sol-cli admin unpause \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]"
```

### เปลี่ยนแปลงค่าธรรมเนียม {#change-fee}

เปลี่ยนแปลงค่าธรรมเนียมที่จ่ายให้สัญญาบริดจ์

```bash
# Change fee for execution
$ cb-sol-cli admin set-fee \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --fee [FEE_IN_WEI]
```

### เพิ่ม/ลบตัวรีเลย์ {#add-remove-a-relayer}

เพิ่มบัญชีเป็นตัวรีเลย์ใหม่หรือลบบัญชีออกจากตัวรีเลย์

```bash
# Add relayer
$ cb-sol-cli admin add-relayer \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --relayer "[NEW_RELAYER_ADDRESS]"

# Remove relayer
$ cb-sol-cli admin remove-relayer \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --relayer "[RELAYER_ADDRESS]"
```

### เปลี่ยนเกณฑ์ของตัวรีเลย์ {#change-relayer-threshold}

เปลี่ยนจำนวนโหวตที่จำเป็นสำหรับการดำเนินการข้อเสนอ

```bash
# Remove relayer
$ cb-sol-cli admin set-threshold \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --threshold [THRESHOLD]
```
:::

## Chain ID {#chain-id}

`chainId` ของ Chainbridge เป็นค่าแบบกำหนดเอง ซึ่งใช้ในบริดจ์เพื่อแยกความแตกต่างระหว่างเครือข่ายบล็อกเชนต่างๆ โดยต้องอยู่ในช่วงของ uint8อย่าสับสนกับ Chain ID ของเครือข่าย สองอย่างนี้ไม่เหมือนกันค่านี้จะต้องไม่ซ้ำกับค่าอื่น แต่ไม่จำเป็นต้องเหมือนกับ ID ของเครือข่าย

ในตัวอย่างนี้ เรากำหนดให้ `99` เป็น `chainId` เนื่องจาก Chain ID ของ Mumbai Testnet คือ `80001` ซึ่งไม่สามารถนำไปแสดงค่าใน uint8 ได้

## Resource ID {#resource-id}

Resource ID เป็นค่า 32 ไบต์ที่ไม่ซ้ำกับค่าอื่นในสภาพแวดล้อมแบบข้ามเชน ซึ่งจะสอดคล้องกับสินทรัพย์หนึ่ง (Resource) ที่ทำการโอนระหว่างเครือข่าย

Resource ID เป็นค่าแบบกำหนดเอง แต่ตามธรรมเนียมไบต์สุดท้ายมักจะเป็น Chain ID ของเชนต้นทาง (เครือข่ายที่สินทรัพย์นี้กำเนิดขึ้น)

## JSON-RPC URL สำหรับ Polygon PoS {#json-rpc-url-for-polygon-pos}

สำหรับคู่มือนี้ เราจะใช้ https://rpc-mumbai.matic.today ซึ่งเป็น JSON-RPC URL สาธารณะที่ให้บริการโดย Polygon ซึ่งอาจมีการแออัดหรือการจำกัดอัตราการใช้งานโดยจะใช้เพื่อเชื่อมต่อกับ Polygon Mumbai Testnet เท่านั้นเราขอแนะนำให้คุณใช้ JSON-RPC URL จากบริการภายนอก เช่น Infura เนื่องจากการปรับใช้สัญญาจะการสืบค้น/คำขอจำนวนมากไปยัง JSON-RPC

## วิธีการประมวลผลการโอนโทเค็น {#ways-of-processing-the-transfer-of-tokens}
ในการโอนโทเค็น ERC20 ระหว่างเชน จะสามารถประมวลผลโทเค็นได้ใน 2 โหมดที่แตกต่างกัน:

### โหมดล็อก/ปลดล็อก {#lock-release-mode}
<b>เชนต้นทาง: </b>โทเค็นที่คุณส่งจะได้รับการล็อกไว้ในสัญญา Handler  <br/><b>เชนปลายทาง:</b> โทเค็นในจำนวนเท่ากับที่คุณส่งมาจากเชนต้นทางจะได้รับการปลดล็อกและโอนจากสัญญา Handler ไปยังบัญชีผู้รับในเชนปลายทาง

### โหมดเบิร์น/สร้าง {#burn-mint-mode}
<b>เชนต้นทาง:</b> โทเค็นที่คุณส่งจะได้รับการเบิร์น <br/><b>เชนปลายทาง:</b> โทเค็นในจำนวนเท่ากับที่คุณส่งและเบิร์นในเชนต้นทางจะได้รับการสร้างขึ้นในเชนปลายทางและส่งไปยังบัญชีผู้รับ

คุณสามารถใช้โหมดที่แตกต่างกันไปได้ในแต่ละเชนซึ่งหมายความว่าคุณสามารถล็อกโทเค็นในเชนหลักไปพร้อมๆ กับสร้างโทเค็นในเชนย่อยสำหรับการโอนได้ยกตัวอย่างเช่น การล็อก/ปลดล็อกโทเค็นอาจเหมาะสมกว่า หากมีการควบคุมจำนวนทั้งหมดหรือกำหนดการสร้างไว้จะมีการสร้าง/เบิร์นโทเค็น หากสัญญาในเชนย่อยต้องเป็นไปตามอุปทานในเชนหลัก

โหมดเริ่มต้นคือโหมดล็อก/ปลดล็อกหากคุณต้องการกำหนดให้โทเค็นสามารถสร้าง/เบิร์นได้ คุณต้องเรียกเมธอด `adminSetBurnable`หากคุณต้องการสร้างโทเค็นเมื่อมีการดำเนินการ คุณจะต้องกำหนดบทบาท `minter` ให้กับสัญญา ERC20 Handler



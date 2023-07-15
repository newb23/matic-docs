---
id: bls
title: BLS
description: "คำอธิบายและคำแนะนำเกี่ยวกับโหมด BLS"
keywords:
  - docs
  - polygon
  - edge
  - bls
---

## ภาพรวม {#overview}

BLS หรือที่รู้จักกันในชื่อ Boneh-Lynn-Shachm (BLS) คือรูปแบบลายเซ็นของ cryptoographic ซึ่งช่วยให้ผู้ใช้ตรวจสอบว่าตัวเซ็นเซอร์เป็นเรื่องจริงมันเป็นโครงการลายเซ็นที่สามารถรวมรวมลายเซ็นได้หลายฉบับใน Polygon Edge มีการใช้ BLS ตามค่าเริ่มต้นเพื่อให้การรักษาความปลอดภัยที่ดีขึ้นในโหมดฉันทามติ IBFTBLS สามารถรวมลายเซ็นเป็นอาร์เรย์ไบต์เดียวและลดขนาดส่วนหัวของบล็อกแต่ละเชนสามารถเลือกได้ว่าจะใช้ BLS หรือไม่ใช้คีย์ ECDSA โดยไม่คำนึงว่าโหมด BLS จะเปิดใช้งานหรือไม่

## นำเสนอวิดีโอ {#video-presentation}

[![bls - วิดีโอ](https://img.youtube.com/vi/HbUmZpALlqo/0.jpg)](https://www.youtube.com/watch?v=HbUmZpALlqo)

## วิธีตั้งค่าเชนใหม่โดยใช้ BLS {#how-to-setup-a-new-chain-using-bls}

ดูคำแนะนำการตั้งค่าแบบละเอียดได้ในส่วน[การตั้งค่าภายใน](/docs/edge/get-started/set-up-ibft-locally) / [การตั้งค่าในระบบคลาวด์](/docs/edge/get-started/set-up-ibft-on-the-cloud)

## วิธีย้ายจากเชน ECDSA PoA ที่มีอยู่ไปยังเชน BLS PoA {#how-to-migrate-from-an-existing-ecdsa-poa-chain-to-bls-poa-chain}

ส่วนนี้อธิบายวิธีใช้โหมด BLS ในเชน PoA ที่มีอยู่จำเป็นต้องมีขั้นตอนต่อไปนี้เพื่อเปิดใช้งาน BLS ในเชน PoA

1. หยุดโหนดทั้งหมด
2. สร้างคีย์ BLS สำหรับตัวตรวจสอบความถูกต้อง
3. เพิ่มการตั้งค่า Fork ใน Genesis.json
4. รีสตาร์ทโหนดทั้งหมด

### 1. หยุดโหนดทั้งหมด {#1-stop-all-nodes}

ยุติกระบวนการทั้งหมดของตัวตรวจสอบความถูกต้องโดยกด Ctrl + c (Control + c)โปรดจำความสูงของบล็อกล่าสุด (หมายเลขลำดับสูงสุดในบันทึกการคอมมิตบล็อก)

### 2. สร้างคีย์ BLS {#2-generate-the-bls-key}

`secrets init` กับ `--bls` สร้างคีย์ BLSต้องปิดการใช้งาน `--ecdsa` และ `--network` เพื่อเก็บ ECDSA และคีย์เครือข่ายที่มีอยู่และเพิ่มคีย์ BLS ใหม่

```bash
polygon-edge secrets init --bls --ecdsa=false --network=false

[SECRETS INIT]
Public key (address) = 0x...
BLS Public key       = 0x...
Node ID              = 16...
```

### 3. เพิ่มการตั้งค่า Fork {#3-add-fork-setting}

คำสั่ง `ibft switch` เพิ่มการตั้งค่า Fork ซึ่งเปิดใช้งาน BLS ในเชนที่มีอยู่ เข้าใน `genesis.json`

สำหรับเครือข่าย PoA ต้องให้ตัวตรวจสอบความถูกต้องในคำสั่งโดยใช้วิธีการของคำสั่ง `genesis` ในการระบุตัวตรวจสอบความถูกต้องด้วยค่าสถานะ `--ibft-validators-prefix-path` หรือ `--ibft-validator` ได้

ระบุความสูงที่เชนเริ่มโดยใช้ BLS ที่มีค่าสถานะ `--from`

```bash
polygon-edge ibft switch --chain ./genesis.json --type PoA --ibft-validator-type bls --ibft-validators-prefix-path test-chain- --from 100
```

### 4. รีสตาร์ทโหนดทั้งหมด {#4-restart-all-nodes}

รีสตาร์ทโหนดทั้งหมดตามคำสั่ง `server`หลังจากสร้างบล็อกที่ `from` ที่ระบุในขั้นตอนก่อนหน้าแล้ว เชนจะเปิดใช้งาน BLS และแสดงบันทึกดังต่อไปนี้:

```bash
2022-09-02T11:45:24.535+0300 [INFO]  polygon.ibft: IBFT validation type switched: old=ecdsa new=bls
```

นอกจากนี้ บันทึกยังแสดงโหมดการตรวจสอบความถูกต้องที่ใช้ในการสร้างแต่ละบล็อกหลังจากสร้างบล็อกแล้ว

```
2022-09-02T11:45:28.728+0300 [INFO]  polygon.ibft: block committed: number=101 hash=0x5f33aa8cea4e849807ca5e350cb79f603a0d69a39f792e782f48d3ea57ac46ca validation_type=bls validators=3 committed=3
```

## วิธีย้ายจากเชน ECDSA PoS ที่มีอยู่ไปยังเชน BLS PoS {#how-to-migrate-from-an-existing-ecdsa-pos-chain-to-a-bls-pos-chain}

ส่วนนี้อธิบายวิธีใช้โหมด BLS ในเชน PoS ที่มีอยู่จำเป็นต้องมีขั้นตอนต่อไปนี้เพื่อเปิดใช้งาน BLS ในเชน PoS

1. หยุดโหนดทั้งหมด
2. สร้างคีย์ BLS สำหรับตัวตรวจสอบความถูกต้อง
3. เพิ่มการตั้งค่า Fork ใน Genesis.json
4. เรียกสัญญา Stake เพื่อลงทะเบียนคีย์สาธารณะ BLS
5. รีสตาร์ทโหนดทั้งหมด

### 1. หยุดโหนดทั้งหมด {#1-stop-all-nodes-1}

ยุติกระบวนการทั้งหมดของตัวตรวจสอบความถูกต้องโดยกด Ctrl + c (Control + c)โปรดจำความสูงของบล็อกล่าสุด (หมายเลขลำดับสูงสุดในบันทึกการคอมมิตบล็อก)

### 2. สร้างคีย์ BLS {#2-generate-the-bls-key-1}

`secrets init` พร้อมกับค่าสถานะ `--bls` จะสร้างคีย์ BLS ขึ้นต้องปิดการใช้งาน `--ecdsa` และ `--network` เพื่อเก็บ ECDSA และคีย์เครือข่ายที่มีอยู่และเพิ่มคีย์ BLS ใหม่

```bash
polygon-edge secrets init --bls --ecdsa=false --network=false

[SECRETS INIT]
Public key (address) = 0x...
BLS Public key       = 0x...
Node ID              = 16...
```

### 3. เพิ่มการตั้งค่า Fork {#3-add-fork-setting-1}

คำสั่ง `ibft switch` เพิ่มการตั้งค่า Fork ซึ่งเปิดใช้งาน BLS จากตรงกลางของเชน ลงใน `genesis.json`

ระบุความสูงที่ที่เชนเริ่มโดยใช้โหมด BLS ที่มีค่าสถานะ `from` และความสูงที่อัปเดตสัญญาด้วยค่าสถานะ `development`

```bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --ibft-validator-type bls --deployment 50 --from 200
```

### 4. ลงทะเบียนคีย์สาธารณะ BLS ในสัญญา Stake {#4-register-bls-public-key-in-staking-contract}

หลังเพิ่ม Fork และรีสตาร์ทตัวตรวจสอบความถูกต้องแล้ว ตัวตรวจสอบความถูกต้องแต่ละตัวต้องเรียก `registerBLSPublicKey` ในสัญญา Stake เพื่อลงทะเบียนคีย์สาธารณะ BLSต้องทำหลังจากความสูงที่ระบุใน `--deployment` ก่อนความสูงที่ระบุใน `--from`

มีการนิยามสคริปต์ในการลงทะเบียนคีย์สาธารณะ BLS ไว้ใน[พื้นที่เก็บข้อมูลสัญญาอัจฉริยะการ Stake](https://github.com/0xPolygon/staking-contracts)

ตั้งค่า `BLS_PUBLIC_KEY` ให้มีการลงทะเบียนในไฟล์ `.env`ดูรายละเอียดเพิ่มเติมเกี่ยวกับพารามิเตอร์อื่นๆ ได้ที่ [pos-Stake-unStake](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts)

```env
JSONRPC_URL=http://localhost:10002
STAKING_CONTRACT_ADDRESS=0x0000000000000000000000000000000000001001
PRIVATE_KEYS=0x...
BLS_PUBLIC_KEY=0x...
```

คำสั่งต่อไปนี้ลงทะเบียนคีย์สาธารณะ BLS ที่ให้ไว้ใน `.env` กับสัญญา

```bash
npm run register-blskey
```

:::warning ตัวตรวจสอบความถูกต้องต้องลงทะเบียนคีย์สาธารณะ BLS ด้วยตนเอง
ในโหมด BLS ตัวตรวจสอบความถูกต้องจะต้องมีที่อยู่ของตนเองและคีย์สาธารณะ BLSเลเยอร์ฉันทามติละเว้นตัวตรวจสอบความถูกต้องที่ไม่ได้ลงทะเบียนคีย์สาธารณะ BLS ในสัญญาเมื่อฉันทามติดึงข้อมูลตัวตรวจสอบความถูกต้องจากสัญญา
:::

### 5. รีสตาร์ทโหนดทั้งหมด {#5-restart-all-nodes}

รีสตาร์ทโหนดทั้งหมดตามคำสั่ง `server`เชนเปิดใช้งาน BLS หลังจากสร้างบล็อกที่ `from` ที่ระบุในขั้นตอนก่อนหน้า

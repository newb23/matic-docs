---
id: migration-to-pos
title: การย้ายจาก PoA ไปยัง PoS
description: "วิธีย้ายโหมด IBFT จาก PoA ไปยัง PoS และในทางตรงกันข้าม"
keywords:
  - docs
  - polygon
  - edge
  - migrate
  - PoA
  - PoS
---

## ภาพรวม {#overview}

ส่วนนี้แนะนำคุณตลอดการย้ายโหมด IBFT จาก PoA เป็น PoS สำหรับคลัสเตอร์ที่ทำงานอยู่ และในทางกลับกัน โดยไม่จำเป็นต้องรีเซ็ตบล็อกเชน

## วิธีย้ายไปยัง PoS {#how-to-migrate-to-pos}

คุณจะต้องหยุดโหนดทั้งหมด เพิ่มการกำหนดค่า Fork เข้าใน genesis.json โดยคำสั่ง `ibft switch` และรีสตาร์ทโหนด

````bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --deployment 100 --from 200
````
:::caution สลับขณะใช้ ECDSA
เมื่อใช้ ECDSA จะต้องเพิ่ม`--ibft-validator-type`ธงชาติลงในสวิตต์ โดยกล่าวถึงการใช้ ECDAหากไม่รวมด้วย Edge จะเปลี่ยนเป็น BS โดยอัตโนมัติ

````bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --ibft-validator-type ecdsa --deployment 100 --from 200
````
:::เพื่อเปลี่ยนเป็น PoS คุณจะต้องกำหนดความสูงของบล็อก2 อัน `deployment``from``deployment`และความสูงคือค่าปรับในการปรับใช้สัญญาการเดิมพัน`from`และเป็นการปรับระดับความสูงของจุดเริ่มต้นของ PoSจะมีการปรับใช้สัญญาการ Stake ตามที่อยู่ `0x0000000000000000000000000000000000001001` ที่ `deployment` เช่นในกรณีสัญญาที่ปรับใช้ล่วงหน้า

โปรดดูรายละเอียดเพิ่มเติมเกี่ยวกับสัญญาการ Stake ที่ [Proof of Stake](/docs/edge/consensus/pos-concepts)

:::warning ตัวตรวจสอบความถูกต้องจำเป็นต้อง Stake ด้วยตนเอง
ตัวตรวจสอบความถูกต้องแต่ละตัวจำเป็นต้อง Stake หลังจากปรับใช้สัญญาที่ `deployment` และก่อน `from`เพื่อที่จะเป็นตัวตรวจสอบความถูกต้องที่จุดเริ่มต้นของ PoSตัวตรวจสอบความถูกต้องแต่ละตัวจะอัปเดตตัวตรวจสอบความถูกต้องของตัวเองตามที่กำหนดไว้ในสัญญาการ Stake ที่จุดเริ่มต้นของ PoS

เพื่อค้นหาข้อมูลเพิ่มเติมเกี่ยวกับการปักกิ่ง เยี่ยมชม**[การตั้งค่าและ](/docs/edge/consensus/pos-stake-unstake)**ใช้Proof of Sake.
:::

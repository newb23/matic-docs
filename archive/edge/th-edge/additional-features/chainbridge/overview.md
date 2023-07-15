---
id: overview
title: ภาพรวม
description: ภาพรวมของ ChainBridge
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

## ChainBridge คืออะไร {#what-is-chainbridge}

ChainBridge เป็นบริดจ์สำหรับบล็อกเชนแบบหลายทิศทางชนิดโมดูลาร์ ที่รองรับเชนที่เข้ากันได้กับ EVM และ Substrate ซึ่ง ChainSafe สร้างขึ้นโดยจะช่วยให้ผู้ใช้สามารถโอนสินทรัพย์หรือสารต่างๆ ทุกประเภทระหว่างสองเชนที่แตกต่างกัน

หากต้องการทราบเพิ่มเติมเกี่ยวกับ ChainBridge โปรดไปที่[เอกสารอย่างเป็นทางการ](https://chainbridge.chainsafe.io/)ที่ผู้พัฒนาเขียนไว้

คู่มือนี้มีวัตถุประสงค์เพื่อช่วยให้ความช่วยเหลือในการผสานรวม Chainbridge เข้ากับ Polygon Edgeโดยจะอธิบายการตั้งค่าบริดจ์ระหว่าง Polygon PoS (Mumbai Testnet) ที่ดำเนินการอยู่กับเครือข่าย Polygon Edge ภายในอย่างละเอียด

## ข้อกำหนด {#requirements}

ในคู่มือนี้ คุณจะรันโหนด Polygon Edge, ตัวรีเลย์ ChainBridge (ดูข้อมูลเพิ่มเติม[ที่นี่](/docs/edge/additional-features/chainbridge/definitions)) และเครื่องมือ cb-sol-cli ซึ่งเป็นเครื่องมือ CLI เพื่อปรับใช้สัญญาภายใน ลงทะเบียนทรัพยากร และเปลี่ยนการตั้งค่าของบริดจ์ (คุณสามารถดูเพิ่มเติมได้[ที่นี่](https://chainbridge.chainsafe.io/cli-options/#cli-options)อีกด้วย)ต้องมีสภาพแวดล้อมดังต่อไปนี้ก่อนที่จะเริ่มการตั้งค่า:

* Go: >= 1.17
* Node.js >= 16.13.0
* Git


นอกจากนี้ คุณจะต้องโคลนพื้นที่เก็บข้อมูลต่อไปนี้พร้อมกับเวอร์ชันต่างๆ เพื่อรันแอปพลิเคชันบางตัว

* [Polygon Edge](https://github.com/0xPolygon/polygon-edge): ใน Branch ที่ชื่อ `develop`
* [ChainBridge](https://github.com/ChainSafe/ChainBridge): v1.1.5
* [ChainBridge Deploy Tools](https://github.com/ChainSafe/chainbridge-deploy): `f2aa093` ใน Branch ที่ชื่อ `main`


คุณต้องตั้งค่าเครือข่าย Polygon Edge ก่อนดำเนินการต่อไปยังส่วนต่อไปโปรดดูรายละเอียดเพิ่มเติมที่[การตั้งค่าภายใน](/docs/edge/get-started/set-up-ibft-locally)หรือ[การตั้งค่าในระบบคลาวด์](/docs/edge/get-started/set-up-ibft-on-the-cloud)
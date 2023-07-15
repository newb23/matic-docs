---
id: overview
title: Polygon Edge
sidebar_label: What is Edge
description: "ข้อมูลเบื้องต้นเกี่ยวกับ Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - network
  - modular

---

Polygon Edge โครงสร้างแบบโมดูลาร์ที่ขยายได้ ซึ่งใช้ในการสร้างเครือข่ายบล็อกเชน ไซด์เชน และโซลูชันการปรับขนาดทั่วไปที่ Ethereum รองรับ

วัตถุประสงค์หลักในการใช้คือการเริ่มต้นระบบเครือข่ายบล็อกเชนใหม่ พร้อมกับให้ความเข้าใจได้อย่างเต็มรูปแบบกับสัญญาอัจฉริยะและธุรกรรมของ Ethereumซึ่งใช้กลไกฉันทามติ IBFT (Istanbul Byzantine Fault Tolerant) ที่รองรับสองรูปแบบ ได้แก่ [PoA (Proof of Authority)](/docs/edge/consensus/poa) และ [PoS (Proof of Stake)](/docs/edge/consensus/pos-stake-unstake)

นอกจากนั้น Polygon Edge รองรับการสื่อสารกับเครือข่ายบล็อกเชนจำนวนมาก ทำให้สามารถใช้ทั้งโทเค็น [ERC-20](https://ethereum.org/en/developers/docs/standards/tokens/erc-20) และ [ERC-721](https://ethereum.org/en/developers/docs/standards/tokens/erc-721) ผ่านการใช้[โซลูชันบริดจ์แบบมีตัวกลาง](/docs/edge/additional-features/chainbridge/overview)

ใช้วอลเล็ตมาตรฐานอุตสาหกรรมเพื่อโต้ตอบกับ Polygon Edge ผ่าน [JSON-RPC](/docs/edge/working-with-node/query-json-rpc) Endpoint และตัวตรวจสอบความถูกต้องโหนดสามารถดำเนินการต่างๆ ผ่านการใช้โปรโตคอล [gRPC](/docs/edge/working-with-node/query-operator-info)

ดูข้อมูลเพิ่มเติมเกี่ยวกับ Polygon ได้ที่[เว็บไซต์อย่างเป็นทางการ](https://polygon.technology)

**[พื้นที่เก็บข้อมูล GitHub](https://github.com/0xPolygon/polygon-edge)**

:::caution

ส่วนนี้อยู่ในระหว่างการสร้าง จึงอาจมีการเปลี่ยนแปลงทางสถาปัตยกรรมในอนาคตยังไม่มีการตรวจสอบโค้ดโปรดติดต่อทีม Polygon หากคุณประสงค์ใช้ส่วนนี้ในการใช้งานจริง

:::



ในการเริ่มต้นใช้งานโดยการเรียกใช้เครือข่าย `polygon-edge` ภายใน โปรดอ่าน[การติดตั้ง](/docs/edge/get-started/installation)และ[การตั้งค่าในเครื่อง](/docs/edge/get-started/set-up-ibft-locally)

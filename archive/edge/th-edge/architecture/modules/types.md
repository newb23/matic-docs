---
id: types
title: Types
description: คำอธิบายเกี่ยวกับโมดูล types ของ Polygon Edge
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - types
  - marshaling
---

## ภาพรวม {#overview}

โมดูล **Types** จะนำประเภทอ็อบเจ็กต์หลักต่างๆ ไปใช้ เช่น:

* **Address**
* **Hash**
* **Header**
* ฟังก์ชันตัวช่วยอีกมากมาย

## การเข้ารหัส / การถอดรหัส RLP {#rlp-encoding-decoding}

Polygon Edge ต่างจากไคลเอ็นต์อย่าง GETH ตรงที่ไม่ใช้การสะท้อนในการเข้ารหัส<br />ถ้าให้ดีไม่ควรใช้การสะท้อนเพราะทำให้เกิดปัญหาใหม่ๆ เช่น ประสิทธิภาพการเสื่อมสภาพ และการปรับขนาดที่ยากขึ้น

โมดูล **Types** จัดเตรียมอินเทอร์เฟซที่ใช้งานง่ายสำหรับกระบวนการ Marshall และ Unmarshall ตัว RLP โดยใช้แพ็คเกจ FastRLP

ทำกระบวนการ Marshall ผ่านเมธอด *MarshalRLPWith* และ *MarshalRLPTo*เมธอดที่คล้ายคลึงกันมีไว้สำหรับกระบวนการ Unmarshall

การกำหนดเมธอดเหล่านี้ด้วยตนเองทำให้ Polygon Edge ไม่จำเป็นต้องใช้การสะท้อนใน *rlp_marshal.go* คุณสามารถพบเมธอดสำหรับกระบวนการ Marshall

* **Bodies**
* **Blocks**
* **Headers**
* **Receipts**
* **Logs**
* **Transactions**
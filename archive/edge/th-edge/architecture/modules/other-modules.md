---
id: other-modules
title: โมดูลอื่นๆ
description: คำอธิบายเกี่ยวกับโมดูลบางอย่างของ Polygon Edge
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - modules
---

## Crypto {#crypto}

โมดูล **Crypto** ประกอบด้วยฟังก์ชันซึ่งใช้เพื่อประโยชน์ของคริปโต

## Chain {#chain}

โมดูล **Chain** ประกอบด้วยพารามิเตอร์ chain (Fork ต่างๆ ที่ใช้งานอยู่ กลไกฉันทามติ ฯลฯ)

* **chains** - ค่ากำหนดเกี่ยวกับเชนที่กำหนดไว้ล่วงหน้า (mainnet, goerli, ibft)

## Helper {#helper}

โมดูล **Helper** ประกอบด้วยแพ็กเกจ helper

* **dao** - โปรแกรมอรรถประโยชน์ Dao
* **enode** - ฟังก์ชันเข้ารหัส/ถอดรหัสของ Enode
* **hex** - ฟังก์ชันเข้ารหัส/ถอดรหัสของ Hex
* **ipc** - ฟังก์ชันการเชื่อมต่อของ IPC
* **keccak** - ฟังก์ชันของ Keccak
* **rlputil** - ฟังก์ชัน helper เกี่ยวกับการเข้ารหัส/ถอดรหัสของ Rlp

## Command {#command}

โมดูล **Command** ประกอบด้วยอินเทอร์เฟซต่างๆ สำหรับคำสั่ง CLI
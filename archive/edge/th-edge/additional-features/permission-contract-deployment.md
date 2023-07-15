---
id: permission-contract-deployment
title: การอนุญาตให้ปรับใช้สัญญาอัจฉริยะ
description: วิธีการเพิ่มการอนุญาตให้ปรับใช้สัญญาอัจฉริยะ
keywords:
  - docs
  - polygon
  - edge
  - smart contract
  - permission
  - deployment
---

## ภาพรวม {#overview}

คู่มือนี้จะลงรายละเอียดถึงวิธีการให้การอนุญาตที่อยู่เพื่อให้สามารถปรับใช้สัญญาอัจฉริยะได้ในบางครั้งตัวดำเนินการเครือข่ายต้องการที่จะป้องกันไม่ให้ผู้ใช้ปรับใช้สัญญาอัจฉริยะที่ไม่เกี่ยวกับวัตถุประสงค์ของเครือข่ายตัวดำเนินการเครือข่ายสามารถ:

1. เพิ่มที่อยู่สำหรับการปรับใช้สัญญาอัจฉริยะเข้าในรายการอนุญาต
2. ลบที่อยู่สำหรับการปรับใช้สัญญาอัจฉริยะออกจากรายการอนุญาต

## นำเสนอวิดีโอ {#video-presentation}

[![การใช้งานสัญญาอนุญาต - วิดีโอ](https://img.youtube.com/vi/yPOkINpf7hg/0.jpg)](https://www.youtube.com/watch?v=yPOkINpf7hg)

## วิธีการใช้งาน {#how-to-use-it}


คุณสามารถดูคำสั่ง cli ทั้งหมดที่เกี่ยวกับรายการอนุญาตให้ปรับใช้ได้ในหน้า[คำสั่ง CLI](/docs/edge/get-started/cli-commands#whitelist-commands)

* `whitelist show`: แสดงข้อมูลของรายการอนุญาต
* `whitelist deployment --add`:  เพิ่มที่อยู่ใหม่ไปยังรายการอนุญาตให้ปรับใช้สัญญา
* `whitelist deployment --remove`:  ลบที่อยู่ใหม่ออกจากรายการอนุญาตให้ปรับใช้สัญญา

#### การแสดงที่อยู่ทั้งหมดในรายการอนุญาตให้ปรับใช้ {#show-all-addresses-in-the-deployment-whitelist}

การค้นหาที่อยู่ในรายการอนุญาตให้ปรับใช้มี 2 วิธี
1. ดู `genesis.json` ที่บันทึกรายการอนุญาตไว้
2. ใช้ `whitelist show` ซึ่งจะแสดงข้อมูลรายการอนุญาตทั้งหมดที่ Polygon Edge รองรับ

```bash

./polygon-edge whitelist show

[WHITELISTS]

Contract deployment whitelist : [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d],


```

#### การเพิ่มที่อยู่ในรายการอนุญาตให้ปรับใช้ {#add-an-address-to-the-deployment-whitelist}

หากต้องการเพิ่มที่อยู่ใหม่ในรายการอนุญาตให้ปรับใช้ โปรดใช้คำสั่ง CLI `whitelist deployment --add [ADDRESS]`โดยจะไม่มีการจำกัดจำนวนของที่อยู่ที่สามารถมีในรายการอนุญาตที่อยู่ที่มีในรายการอนุญาตให้ปรับใช้สัญญาเท่านั้นที่จะสามารถปรับใช้สัญญาได้หากรายการอนุญาตว่างเปล่า ทุกที่อยู่จะสามารถทำการปรับใช้ได้

```bash

./polygon-edge whitelist deployment --add 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d --add 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF


[CONTRACT DEPLOYMENT WHITELIST]

Added addresses: [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],
Contract deployment whitelist : [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],



```

#### การลบที่อยู่ออกจากรายการอนุญาตให้ปรับใช้ {#remove-an-address-from-the-deployment-whitelist}

หากต้องการลบที่อยู่ออกจากรายการอนุญาตให้ปรับใช้ โปรดใช้คำสั่ง CLI `whitelist deployment --remove [ADDRESS]`ที่อยู่ที่มีในรายการอนุญาตให้ปรับใช้สัญญาเท่านั้นที่จะสามารถปรับใช้สัญญาได้หากรายการอนุญาตว่างเปล่า ทุกที่อยู่จะสามารถทำการปรับใช้ได้

```bash

./polygon-edge whitelist deployment --remove 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d --remove 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF


[CONTRACT DEPLOYMENT WHITELIST]

Removed addresses: [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],
Contract deployment whitelist : [],



```

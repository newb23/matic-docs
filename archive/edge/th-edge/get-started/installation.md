---
id: installation
title: การติดตั้ง
description: "วิธีการติดตั้ง Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - install
  - installation
---

โปรดเลือกวิธีการติดตั้งที่คุณสามารถใช้ได้อย่างสะดวก

เราขอแนะนำให้คุณใช้รุ่นที่สร้างไว้ล่วงหน้าและตรวจสอบ checksum ต่างๆ ที่ให้ไว้

## รุ่นที่สร้างไว้ล่วงหน้า {#pre-built-releases}

โปรดดูรายการเวอร์ชันที่หน้า[รุ่นต่างๆ ของ GitHub](https://github.com/0xPolygon/polygon-edge/releases)

Polygon Edge ประกอบด้วยไบนารี AMD64/ARM64 แบบข้ามสถาปัตยกรรมซึ่งสามารถใช้ได้ทั้งกับ Darwin และ Linux

---

## อิมเมจ Docker {#docker-image}

มีอิมเมจ Docker อย่างเป็นทางการอยู่ใน[รีจิสทรี hub.docker.com](https://hub.docker.com/r/0xpolygon/polygon-edge)

`docker pull 0xpolygon/polygon-edge:latest`

---

## สร้างจากต้นฉบับ {#building-from-source}

ก่อนใช้ `go install` ตรวจสอบให้แน่ใจว่าคุณได้ติดตั้ง Go `>=1.18` และกำหนดค่าอย่างถูกต้องแล้ว

สาขาที่มั่นคงคือสาขาของรุ่นล่าสุด

```shell
git clone https://github.com/0xPolygon/polygon-edge.git
cd polygon-edge/
go build -o polygon-edge main.go
sudo mv polygon-edge /usr/local/bin
```

---

## การใช้ `go install`

ก่อนใช้ `go install` ตรวจสอบให้แน่ใจว่าคุณได้ติดตั้ง Go `>=1.17` และกำหนดค่าอย่างถูกต้องแล้ว

`go install github.com/0xPolygon/polygon-edge@release/<latest release>`

จะมีไบนารีใน`GOBIN`ตัวแปรแวดล้อม ของคุณ และจะรวมการเปลี่ยนแปลงจากรุ่นล่าสุดคุณสามารถเช็คเอาท์แบบ [GitHub ได้ Release Release](https://github.com/0xPolygon/polygon-edge/releases) เพื่อค้นหาว่าอันไหนเป็นตัวเลือกที่ช้าที่สุด

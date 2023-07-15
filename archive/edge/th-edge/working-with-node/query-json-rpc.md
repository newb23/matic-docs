---
id: query-json-rpc
title: ค้นหา JSON RPC Endpoint
description: "ค้นหาข้อมูลและเริ่มต้นเชนด้วยบัญชีที่วางไว้ล่วงหน้า"
keywords:
  - docs
  - polygon
  - edge
  - query
  - premine
  - node
---

## ภาพรวม {#overview}

เลเยอร์ JSON-RPC ของ Polygon Edge ให้ฟังก์ชันในการโต้ตอบกับบล็อกเชนอันแสนง่ายดายกับนักพัฒนาผ่านคำขอ HTTP

ตัวอย่างนี้ครอบคลุมการใช้เครื่องมือ เช่น **curl**  เพื่อค้นหาข้อมูล และเริ่มต้นเชนด้วยบัญชีที่วางไว้ล่วงหน้าและส่งธุรกรรม

## ขั้นตอนที่ 1: สร้างไฟล์ Genesis ด้วยบัญชีที่วางไว้ล่วงหน้า {#step-1-create-a-genesis-file-with-a-premined-account}

ในการสร้างไฟล์ Genesis ให้เรียกใช้คำสั่งต่อไปนี้:
````bash
polygon-edge genesis --premine 0x1010101010101010101010101010101010101010
````

ค่าสถานะ **Premine** กำหนดที่อยู่ที่ควรรวมอยู่กับยอดคงเหลือเริ่มต้นในไฟล์ **Genesis**<br />ในกรณีนี้ ที่อยู่ `0x1010101010101010101010101010101010101010` จะมี **ยอดคงเหลือตามค่าเริ่มต้น** ในการเริ่มต้นเป็น
`0xD3C21BCECCEDA1000000`(โทเค็นแบบดั้งเดิม1 ล้าน)

หากเราต้องการระบุยอดคงเหลือ เราสามารถแยกยอดคงเหลือและที่อยู่ด้วย `:` ดังนี้:
````bash
polygon-edge genesis --premine 0x1010101010101010101010101010101010101010:0x123123
````

ยอดคงเหลือสามารถเป็นค่า `hex` หรือ `uint256` ก็ได้

:::warning วางบัญชีล่วงหน้าก็ต่อเมื่อคุณมีคีย์ส่วนตัวสำหรับบัญชีเท่านั้น!
หากคุณวางบัญชีล่วงหน้าและไม่มีคีย์ส่วนตัวในการเข้าถึง ยอดคงเหลือที่วางไว้ล่วงหน้าของคุณจะใช้งานไม่ได้
:::

## ขั้นตอนที่ 2: เริ่ม Polygon edge ในโหมด Dev {#step-2-start-the-polygon-edge-in-dev-mode}

ในการเริ่ม Polygon Edge ในโหมดการพัฒนา ซึ่งอธิบายไว้ในส่วน[คำสั่ง CLI](/docs/edge/get-started/cli-commands)
ให้เรียกใช้ชุดคำสั่งต่อไปนี้:
````bash
polygon-edge server --chain genesis.json --dev --log-level debug
````

## ขั้นตอนที่ 3: ค้นหายอดคงเหลือในบัญชี {#step-3-query-the-account-balance}

ตอนนี้ไคลเอ็นต์เริ่มทำงานในโหมด Dev โดยใช้ไฟล์ Genesis ที่สร้างใน**ขั้นตอนที่ 1** เราสามารถใช้เครื่องมือเช่น**curl** เพื่อค้นหายอดคงเหลือในบัญชี:
````bash
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x1010101010101010101010101010101010101010", "latest"],"id":1}' localhost:8545
````

คำสั่งควรส่งกลับเอาต์พุตต่อไปนี้:
````bash
{
  "id":1,
  "result":"0x100000000000000000000000000"
}
````

## ขั้นตอนที่ 4: ส่งธุรกรรมการโอน {#step-4-send-a-transfer-transaction}

ตอนนี้เราได้ยืนยันว่าบัญชีที่เราตั้งค่าไว้เป็นบัญชีที่วางล่วงหน้ามียอดคงเหลือที่ถูกต้องแล้ว เราสามารถโอน Ether บางส่วนได้:

````js
var Web3 = require("web3");

const web3 = new Web3("<provider's websocket jsonrpc address>"); //example: ws://localhost:10002/ws
web3.eth.accounts
  .signTransaction(
    {
      to: "<recipient address>",
      value: web3.utils.toWei("<value in ETH>"),
      gas: 21000,
    },
    "<private key from premined account>"
  )
  .then((signedTxData) => {
    web3.eth
      .sendSignedTransaction(signedTxData.rawTransaction)
      .on("receipt", console.log);
  });

````

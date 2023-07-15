---
id: troubleshooting
title: การแก้ไขปัญหา
description: "ส่วนการแก้ไขปัญหาสำหรับ Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - troubleshooting

---

# การแก้ไขปัญหา {#troubleshooting}

## ข้อผิดพลาด `method=eth_call err="invalid signature"` {#error}

เมื่อคุณใช้วอลเล็ตเพื่อทำธุรกรรมกับ Polygon Edge โปรดตรวจสอบให้แน่ใจว่า ในการตั้งค่าเครือข่ายภายในของวอลเล็ตของคุณ:

1. `chainID` นั้นถูกต้อง`chainID` เริ่มต้นสำหรับ Edge คือ `100` แต่สามารถปรับแต่งได้โดยใช้ค่าสถานะ Genesis`--chain-id`

````bash
genesis [--chain-id CHAIN_ID]
````
2. ตรวจสอบให้แน่ใจว่าในฟิลด์ "RPC URL" คุณใช้พอร์ต JSON RPC ของโหนดที่คุณกำลังเชื่อมต่ออยู่


## วิธีรับ WebSocket URL {#how-to-get-a-websocket-url}

ตามค่าเริ่มต้น เมื่อคุณเรียกใช้ Polygon Edge จะมีการแสดง WebSocket Endpoint โดยใช้ที่ตั้งของเชนเป็นหลักใช้โครงสร้าง URL `wss://` กับลิงก์ HTTPS และ `ws://` สำหรับ HTTP

Localhost WebSocket URL:
````bash
ws://<JSON-RPC URL>:<PORT>/ws
````
โปรดจำไว้ว่าหมายเลขพอร์ตขึ้นอยู่กับพอร์ต JSON-RPC ที่คุณได้เลือกไว้สำหรับโหนดดังกล่าว

Edgenet WebSocket URL:
````bash
wss://rpc-edgenet.polygon.technology/ws
````

## ข้อผิดพลาด `insufficient funds` เมื่อพยายามปรับใช้สัญญา {#error-when-trying-to-deploy-a-contract}

หากคุณได้รับข้อผิดพลาดนี้ โปรดตรวจสอบให้แน่ใจว่าคุณมีทุนเพียงพอในที่อยู่ที่ต้องการ และที่อยู่ที่ใช้คือที่อยู่ที่ถูกต้อง <br/>ในการตั้งค่ายอดคงเหลือที่วางไว้ล่วงหน้า คุณสามารถใช้ค่าสถานะ Genesis `genesis [--premine ADDRESS:VALUE]` ในขณะที่สร้างไฟล์ Genesisตัวอย่างการใช้ค่าสถานะนี้:
````bash
genesis --premine 0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000
````
ซึ่งวางล่วงหน้า 1000000000000000000000 WEI ใน 0x3956E90e632AEbBF34DEB49b71c28A83Bc029862


## โทเค็น ERC20 ไม่ได้ถูกปล่อยขณะใช้ Chainbridge {#erc20-tokens-not-released-while-using-chainbridge}

หากคุณพยายามโอนโทเค็น ERC20 ระหว่าง Polygon POS และเครือข่าย Edge ภายใน และมีการฝากโทเค็น ERC20 ของคุณพร้อมกับดำเนินการกับข้อเสนอที่ตัวรีเลย์ แต่ไม่มีการปล่อยโทเค็นในเครือข่าย Edge ของคุณ โปรดตรวจสอบให้แน่ใจว่า ERC20 Handler ในเชน Polygon Edge มีโทเค็นเพียงพอที่จะปล่อย <br/>
สัญญา Handler ในเชนปลายทางต้องมีโทเค็นเพียงพอที่จะปล่อยสำหรับโหมดปลดล็อกหากคุณไม่มีโทเค็น ERC20 ใน ERC20 Handler ของเครือข่าย Edge ภายในของคุณ โปรดสร้างโทเค็นใหม่และโอนไปยัง ERC20 Handler

## `Incorrect fee supplied` ข้อผิดพลาดเมื่อใช้ Chainbridge {#error-when-using-chainbridge}

คุณอาจได้รับข้อผิดพลาดนี้เมื่อพยายามโอนโทเค็น ERC20 ระหว่างเชน Mumbai Polygon POS และการตั้งค่า Polygon Edge ภายในข้อผิดพลาดนี้ปรากฏขึ้นเมื่อคุณตั้งค่าค่าธรรมเนียมในการปรับใช้โดยใช้แฟล็ก `--fee` แต่คุณไม่ได้ตั้งค่าเดียวกันในธุรกรรมการฝากเงินคุณสามารถใช้คำสั่งด้านล่างเพื่อเปลี่ยนค่าธรรมเนียม:
````bash
 $ cb-sol-cli admin set-fee --bridge <BRIDGE_ADDRESS> --fee 0 --url <JSON_RPC_URL> --privateKey <PRIVATE_KEY>
 ````
คุณสามารถค้นหาข้อมูลเพิ่มเติมเกี่ยวกับแฟล็กนี้[ได้ที่](https://github.com/ChainSafe/chainbridge-deploy/blob/main/cb-sol-cli/docs/deploy.md)นี่






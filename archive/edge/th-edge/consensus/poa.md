---
id: poa
title: Proof of Authority (PoA)
description: "คำอธิบายและคำแนะนำเกี่ยวกับ Proof of Authority"
keywords:
  - docs
  - polygon
  - edge
  - PoA
  - autorithy
---

## ภาพรวม {#overview}

IBFT PoA เป็นกลไกฉันทามติเริ่มต้นใน Polygon Edgeใน PoA ตัวตรวจสอบความถูกต้องคือตัวที่รับผิดชอบต่อการสร้างและเพิ่มบล็อกเข้าในบล็อกเชนต่อกันเป็นชุด

ตัวตรวจสอบความถูกต้องทั้งหมดประกอบขึ้นเป็นชุดตัวตรวจสอบความถูกต้องแบบไดนามิก ที่สามารถเพิ่มหรือลบตัวตรวจสอบความถูกต้องออกจากชุดได้โดยใช้กลไกการโหวตซึ่งหมายความว่าสามารถลงคะแนนตัวตรวจสอบความถูกต้องเข้า/ออกจากชุดตัวตรวจสอบความถูกต้องได้ หากโหนดตัวตรวจสอบความถูกต้องส่วนใหญ่ (51%) ลงคะแนนเพื่อเพิ่ม/ปลดตัวตรวจสอบความถูกต้องไปยัง/ออกจากชุด ด้วยวิธีนี้ เราจะสามารถรับรู้และลบตัวตรวจสอบความถูกต้องที่เป็นอันตรายออกจากเครือข่าย ในขณะที่สามารถเพิ่มตัวตรวจสอบความถูกต้องที่เชื่อถือได้ใหม่ลงในเครือข่าย

ตัวตรวจสอบความถูกต้องทั้งหมดผลัดกันเสนอบล็อกถัดไป (Round-Robin) และสำหรับบล็อกที่จะตรวจสอบความถูกต้อง/แทรกในบล็อกเชน ตัวตรวจสอบความถูกต้องส่วนใหญ่ (มากกว่า 2 ใน 3) จะต้องอนุมัติบล็อกดังกล่าว

นอกจากตัวตรวจสอบความถูกต้องแล้ว ยังมีสิ่งที่ไม่ใช่ตัวตรวจสอบความถูกต้องที่ไม่ได้มีส่วนร่วมในการสร้างบล็อก แต่มีส่วนร่วมในกระบวนการตรวจสอบความถูกต้องของบล็อก

## การเพิ่มตัวตรวจสอบความถูกต้องไปยังชุดตัวตรวจสอบความถูกต้อง {#adding-a-validator-to-the-validator-set}

คู่มือนี้อธิบายวิธีเพิ่มโหนดตัวตรวจสอบความถูกต้องใหม่ไปยังเครือข่าย IBFT ที่ใช้งานอยู่ พร้อมกับ 4 โหนดตัวตรวจสอบความถูกต้องหากคุณต้องการความช่วยเหลือในการตั้งค่าเครือข่ายโดยอ้างถึงส่วน[การตั้งค่า/ Cloud Setup ภายในระบบ](/edge/get-started/set-up-ibft-locally.md)[](/edge/get-started/set-up-ibft-on-the-cloud.md)

### ขั้นตอนที่ 1: เริ่มต้นโฟลเดอร์ข้อมูลสำหรับ IBFT และสร้างคีย์ตัวตรวจสอบความถูกต้องสำหรับโหนดใหม่ {#step-1-initialize-data-folders-for-ibft-and-generate-validator-keys-for-the-new-node}

ในการเริ่มใช้งาน IBFT บนโหนดใหม่ คุณจำเป็นต้องเริ่มต้นโฟลเดอร์ข้อมูลและสร้างคีย์ก่อน:

````bash
polygon-edge secrets init --data-dir test-chain-5
````

คำสั่งนี้จะพิมพ์คีย์ตัวตรวจสอบความถูกต้อง (ที่อยู่) และรหัสโหนดคุณจะต้องใช้คีย์ตัวตรวจสอบความถูกต้อง (ที่อยู่) สำหรับขั้นตอนต่อไป

### ขั้นตอนที่ 2: เสนอผู้สมัครใหม่จากโหนดตัวตรวจสอบความถูกต้องอื่นๆ {#step-2-propose-a-new-candidate-from-other-validator-nodes}

ในการที่โหนดใหม่ที่จะกลายเป็นตัวตรวจสอบความถูกต้อง ตัวตรวจสอบความถูกต้องอย่างน้อย 51% จำเป็นต้องเป็นผู้เสนอ

ตัวอย่างวิธีเสนอตัวตรวจสอบความถูกต้องใหม่ (`0x8B15464F8233F718c8605B16eBADA6fc09181fC2`) จากโหนดตัวตรวจสอบความถูกต้องที่มีอยู่บนที่อยู่ grpc: 127.0.0.1:10000:

````bash
polygon-edge ibft propose --grpc-address 127.0.0.1:10000 --addr 0x8B15464F8233F718c8605B16eBADA6fc09181fC2 --bls 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --vote auth
````

เนื้อหาของโครงสร้างคำสั่ง IBFT มีอยู่ในส่วน[คำสั่ง CLI](/docs/edge/get-started/cli-commands)

:::info คีย์สาธารณะ BLS
คีย์สาธารณะ BLS จะจำเป็นก็ต่อเมื่อเครือข่ายทำงานกับ BLS ซึ่งเครือข่ายที่ไม่ทำงานในโหมด BLS ไม่จำเป็นต้องมี `--bls`
:::

### ขั้นตอนที่ 3: เรียกใช้โหนดไคลเอ็นต์ {#step-3-run-the-client-node}

เนื่องจากในตัวอย่างนี้ เรากำลังพยายามเรียกใช้เครือข่ายโดยที่โหนดทั้งหมดอยู่ในเครื่องเดียวกัน เราจึงต้องระมัดระวังเพื่อหลีกเลี่ยงปัญหาพอร์ตขัดแย้งกัน

````bash
polygon-edge server --data-dir ./test-chain-5 --chain genesis.json --grpc-address :50000 --libp2p :50001 --jsonrpc :50002 --seal
````

หลังจากดึงบล็อกทั้งหมดแล้ว ภายในคอนโซลของคุณ คุณจะสังเกตเห็นว่ามีโหนดใหม่เข้าร่วมในการตรวจสอบความถูกต้อง

````bash
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=4004
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=5 votes=0
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft: proposer calculated: proposer=0x8B15464F8233F718c8605B16eBADA6fc09181fC2 block=4004
````

:::info การเลื่อนตำแหน่งสิ่งที่ไม่ใช่ตัวตรวจสอบความถูกต้องเป็นตัวตรวจสอบความถูกต้อง
โดยปกติ สิ่งที่ไม่ใช่ตัวตรวจสอบความถูกต้องสามารถกลายเป็นตัวตรวจสอบความถูกต้องได้โดยกระบวนการโหวต แต่การรวมสิ่งที่ไม่ใช่ตัวตรวจสอบความถูกต้องไว้ในชุดตัวตรวจสอบความถูกต้องจะเสร็จสิ้นหลังจากกระบวนการโหวต จึงจะต้องรีสตาร์ทโหนดด้วยค่าสถานะ `--seal`

:::

## การลบตัวตรวจสอบความถูกต้องออกจากชุดตัวตรวจสอบความถูกต้อง {#removing-a-validator-from-the-validator-set}

การดำเนินการนี้ค่อนข้างเรียบง่ายในการลบโหนดตัวตรวจสอบความถูกต้องออกจากชุดตัวตรวจสอบความถูกต้อง จำเป็นต้องดำเนินการคำสั่งนี้สำหรับโหนดตัวตรวจสอบความถูกต้องส่วนใหญ่

````bash
polygon-edge ibft propose --grpc-address 127.0.0.1:10000 --addr 0x8B15464F8233F718c8605B16eBADA6fc09181fC2 --bls 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --vote drop
````

:::info คีย์สาธารณะ BLS
คีย์สาธารณะ BLS จะจำเป็นก็ต่อเมื่อเครือข่ายทำงานกับ BLS ซึ่งเครือข่ายที่ไม่ทำงานในโหมด BLS ไม่จำเป็นต้องมี `--bls`
:::

หลังจากดำเนินการคำสั่งแล้ว ให้สังเกตว่าจำนวนตัวตรวจสอบความถูกต้องลดลง (ในตัวอย่างบันทึกนี้ลดลงจาก 4 เหลือ 3)

````bash
2021-12-15T19:20:51.014+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=2399 round=1
2021-12-15T19:20:51.014+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=4 votes=2
2021-12-15T19:20:51.015+0100 [INFO]  polygon.consensus.ibft.acceptState: we are the proposer: block=2399
2021-12-15T19:20:51.015+0100 [INFO]  polygon.consensus.ibft: picked out txns from pool: num=0 remaining=0
2021-12-15T19:20:51.015+0100 [INFO]  polygon.consensus.ibft: build block: number=2399 txns=0
2021-12-15T19:20:53.002+0100 [INFO]  polygon.consensus.ibft: state change: new=ValidateState
2021-12-15T19:20:53.009+0100 [INFO]  polygon.consensus.ibft: state change: new=CommitState
2021-12-15T19:20:53.009+0100 [INFO]  polygon.blockchain: write block: num=2399 parent=0x768b3bdf26cdc770525e0be549b1fddb3e389429e2d302cb52af1722f85f798c
2021-12-15T19:20:53.011+0100 [INFO]  polygon.blockchain: new block: number=2399 hash=0x6538286881d32dc7722dd9f64b71ec85693ee9576e8a2613987c4d0ab9d83590 txns=0 generation_time_in_sec=2
2021-12-15T19:20:53.011+0100 [INFO]  polygon.blockchain: new head: hash=0x6538286881d32dc7722dd9f64b71ec85693ee9576e8a2613987c4d0ab9d83590 number=2399
2021-12-15T19:20:53.011+0100 [INFO]  polygon.consensus.ibft: block committed: sequence=2399 hash=0x6538286881d32dc7722dd9f64b71ec85693ee9576e8a2613987c4d0ab9d83590 validators=4 rounds=1 committed=3
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft: state change: new=AcceptState
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=2400 round=1
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=3 votes=0
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft: proposer calculated: proposer=0xea21efC826F4f3Cb5cFc0f986A4d69C095c2838b block=2400
````

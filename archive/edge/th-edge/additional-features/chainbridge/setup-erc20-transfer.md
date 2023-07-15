---
id: setup-erc20-transfer
title: การโอนโทเค็น ERC20
description: วิธีการตั้งค่าการโอน ERC-20 ใน ChainBridge
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

จนถึงตอนนี้ เราได้ตั้งค่าบริดจ์เพื่อแลกเปลี่ยนสินทรัพย์/ข้อมูลระหว่าง Polygon PoS กับเชน Polygon Edgeคู่มือส่วนนี้จะแนะนำวิธีการตั้งค่าบริดจ์ ERC20 และส่งโทเค็นระหว่างบล็อกเชนที่แตกต่างกัน

## ขั้นตอนที่ 1: ลงทะเบียน Resource ID {#step-1-register-resource-id}

ก่อนอื่น คุณจะต้องลงทะเบียน Resource ID ที่เชื่อมโยงทรัพยากรในสภาพแวดล้อมแบบข้ามเชนResource ID เป็นค่า 32 ไบต์ที่ต้องเป็นค่าเฉพาะตัวของทรัพยากรนั้นที่เรากำลังโอนระหว่างบล็อกเชนResource ID เป็นค่าแบบกำหนดเอง แต่ตามธรรมเนียมไบต์สุดท้ายจะเป็น Chain ID ของ Home Chain (Home Chain หมายถึงเครือข่ายที่ทรัพยากรนี้กำเนิดขึ้น)

ในการลงทะเบียน Resource ID คุณสามารถใช้คำสั่ง `cb-sol-cli bridge register-resource`คุณจะต้องให้คีย์ส่วนตัวของบัญชี `admin`

```bash
# For Polygon PoS chain
$ cb-sol-cli bridge register-resource \
  --url https://rpc-mumbai.matic.today \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  # Set Resource ID for ERC20
  --resourceId "0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[ERC20_CONTRACT_ADDRESS]"

# For Polygon Edge chain
$ cb-sol-cli bridge register-resource \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  # Set Resource ID for ERC20
  --resourceId "0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[ERC20_CONTRACT_ADDRESS]"
```

## (ไม่บังคับ) ทำให้สัญญาสร้าง/เบิร์นได้ {#optional-make-contracts-mintable-burnable}


```bash
# Let ERC20 contract burn on source chain and mint on destination chain
$ cb-sol-cli bridge set-burn \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[ERC20_CONTRACT_ADDRESS]"

# Grant minter role to ERC20 Handler contract
$ cb-sol-cli erc20 add-minter \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --minter "[ERC20_HANDLER_CONTRACT_ADDRESS]"
```

## ขั้นตอนที่ 2: โอนโทเค็น ERC20 {#step-2-transfer-erc20-token}

เราจะส่งโทเค็น ERC20 จากเชน Polygon PoS ไปยังเชน Polygon Edge

ก่อนอื่น คุณจะต้องได้โทเค็นจากการสร้างโทเค็นบัญชีที่มีบทบาท `minter` สามารถสร้างโทเค็นใหม่ได้ตามค่าเริ่มต้น บัญชีที่ปรับใช้สัญญา ERC20 จะได้รับบทบาท `minter`ในการกำหนดบัญชีอื่นๆ ให้เป็นสมาชิกของบทบาท `minter` คุณจะต้องรันคำสั่ง `cb-sol-cli erc20 add-minter`

```bash
# Mint ERC20 tokens
$ cb-sol-cli erc20 mint \
  --url https://rpc-mumbai.matic.today \
  --privateKey [MINTER_ACCOUNT_PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --amount 1000
```

ในการตรวจสอบยอดคงเหลือปัจจุบัน คุณสามารถใช้คำสั่ง `cb-sol-cli erc20 balance` ได้

```bash
# Check ERC20 token balance
$ cb-sol-cli erc20 balance \
  --url https://rpc-mumbai.matic.today \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --address "[ACCOUNT_ADDRESS]"

[erc20/balance] Account <ACCOUNT_ADDRESS> has a balance of 1000.0
```

ถัดไป คุณจะต้องอนุมัติการโอนโทเค็น ERC20 จากบัญชีโดย ERC20 Handler

```bash
# Approve transfer from the account by ERC20 Handler
$ cb-sol-cli erc20 approve \
  --url https://rpc-mumbai.matic.today \
  --privateKey [USER_ACCOUNT_ADDRESS] \
  --gasPrice [GAS_PRICE] \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --recipient "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --amount 500
```

ในการโอนโทเค็นไปยังเชน Polygon Edge คุณจะต้องเรียก `deposit`

```bash
# Start transfer from Polygon PoS to Polygon Edge chain
$ cb-sol-cli erc20 deposit \
  --url https://rpc-mumbai.matic.today \
  --privateKey [PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  --amount 10 \
  # ChainID of Polygon Edge chain
  --dest 100 \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --recipient "[RECIPIENT_ADDRESS_IN_POLYGON_EDGE_CHAIN]" \
  --resourceId "0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00"
```

หลังธุรกรรมการฝากสำเร็จ ตัวรีเลย์จะได้รับอีเวนต์และการโหวตสำหรับข้อเสนอตัวรีเลย์จะดำเนินการธุรกรรมเพื่อส่งโทเค็นไปยังบัญชีผู้รับในเชน Polygon Edge หลังจากส่งการโหวตในจำนวนที่ต้องการ

```bash
INFO[11-19|08:15:58] Handling fungible deposit event          chain=mumbai dest=100 nonce=1
INFO[11-19|08:15:59] Attempting to resolve message            chain=polygon-edge type=FungibleTransfer src=99 dst=100 nonce=1 rId=000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00
INFO[11-19|08:15:59] Creating erc20 proposal                  chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Watching for finalization event          chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Submitted proposal vote                  chain=polygon-edge tx=0x67a97849951cdf0480e24a95f59adc65ae75da23d00b4ab22e917a2ad2fa940d src=99 depositNonce=1 gasPrice=1
INFO[11-19|08:16:24] Submitted proposal execution             chain=polygon-edge tx=0x63615a775a55fcb00676a40e3c9025eeefec94d0c32ee14548891b71f8d1aad1 src=99 dst=100 nonce=1 gasPrice=5
```

เมื่อธุรกรรมดำเนินการสำเร็จ คุณจะได้รับโทเค็นในเชน Polygon Edge

```bash
# Check the ERC20 balance in Polygon Edge chain
$ cb-sol-cli erc20 balance \
  --url https://localhost:10002 \
  --privateKey [PRIVATE_KEY] \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --address "[ACCOUNT_ADDRESS]"

[erc20/balance] Account <RECIPIENT_ACCOUNT_ADDRESS> has a balance of 10.0
```

---
id: use-case-erc20-bridge
title: กรณีการใช้งาน - บริดจ์ ERC20
description: ตัวอย่างสำหรับการบริดจ์สัญญา ERC20
keywords:
  - docs
  - polygon
  - edge
  - Bridge
  - ERC20
---

ส่วนนี้มีจุดมุ่งหมายเพื่อให้คุณมีขั้นตอนการตั้งค่าบริดจ์ ERC20 สำหรับกรณีการใช้งานจริง

ในคำแนะนำนี้ คุณจะใช้ Mumbai Polygon PoS Testnet และเชนภายใน Polygon Edgeโปรดตรวจสอบให้แน่ใจว่าคุณมี JSON-RPC Endpoint สำหรับ Mumbai และคุณได้ตั้งค่า Polygon Edge ในสภาพแวดล้อมภายในแล้วโปรดดูรายละเอียดเพิ่มเติมที่[การตั้งค่าภายใน](/docs/edge/get-started/set-up-ibft-locally)หรือ[การตั้งค่าในระบบคลาวด์](/docs/edge/get-started/set-up-ibft-on-the-cloud)

## สถานการณ์จำลอง {#scenario}

สถานการณ์จำลองนี้คือการตั้งค่าบริดจ์สำหรับโทเค็น ERC20 ที่ได้รับการปรับใช้ในเชนสาธารณะ (Polygon PoS) แล้วเพื่อเปิดใช้งานการถ่ายโอนต้นทุนต่ำในเชนส่วนตัว (Polygon Edge) สำหรับผู้ใช้ในกรณีปกติในกรณีดังกล่าว จะมีการกำหนดจำนวนทั้งหมดของโทเค็นไว้แล้วในเชนสาธารณะ และจะต้องมีเฉพาะโทเค็นในจำนวนที่โอนจากเชนสาธารณะไปยังเชนส่วนตัวอยู่ในเชนส่วนตัวเท่านั้นด้วยเหตุผลดังกล่าว คุณจะต้องใช้โหมดล็อก/ปลดล็อกในเชนสาธารณะและโหมดเบิร์น/สร้างในเชนส่วนตัว

เมื่อส่งโทเค็นจากเชนสาธารณะไปยังเชนส่วนตัว จะมีการล็อกโทเค็นในสัญญา ERC20 Handler ของเชนสาธารณะ และสร้างโทเค็นจำนวนเท่ากันในเชนส่วนตัวในทางกลับกัน ในกรณีที่โอนจากเชนส่วนตัวไปยังเชนสาธารณะ จะมีการเบิร์นโทเค็นในเชนส่วนตัวและปล่อยโทเค็นในจำนวนที่เท่ากันนี้จากสัญญา ERC20 Handler ในเชนสาธารณะ

## สัญญา {#contracts}

การอธิบายด้วยสัญญา ERC20 อย่างง่าย แทนที่จะเป็นสัญญาที่ ChainBridge พัฒนาขึ้นสำหรับโหมดเบิร์น/สร้าง สัญญา ERC20 ต้องมีเมธอด `mint` และ `burnFrom` นอกจากเมธอดสำหรับ ERC20 ดังนี้:

```sol
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract SampleToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(MINTER_ROLE, _msgSender());
        _setupRole(BURNER_ROLE, _msgSender());
    }

    function mint(address recipient, uint256 amount)
        external
        onlyRole(MINTER_ROLE)
    {
        _mint(recipient, amount);
    }

    function burnFrom(address owner, uint256 amount)
        external
        onlyRole(BURNER_ROLE)
    {
        _burn(owner, amount);
    }
}
```

โค้ดและสคริปต์ทั้งหมดอยู่ในพื้นที่เก็บข้อมูล Github [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example)

## ขั้นตอนที่ 1: ปรับใช้สัญญาบริดจ์และ ERC20 Handler {#step1-deploy-bridge-and-erc20-handler-contracts}

ประการแรก คุณจะปรับใช้สัญญาบริดจ์และ ERC20Handler โดยใช้ `cb-sol-cli` ในทั้งสองเชน

```bash
# Deploy Bridge and ERC20 contracts in Polygon PoS chain
$ cb-sol-cli deploy --bridge --erc20Handler --chainId 99 \
  --url https://rpc-mumbai.matic.today \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```

```bash
# Deploy Bridge and ERC20 contracts in Polygon Edge chain
$ cb-sol-cli deploy --bridge --erc20Handler --chainId 100 \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```

คุณจะได้รับที่อยู่สัญญาบริดจ์และ ERC20Handler ดังนี้:

```bash
Deploying contracts...
✓ Bridge contract deployed
✓ ERC20Handler contract deployed

================================================================
Url:        https://rpc-mumbai.matic.today
Deployer:   <ADMIN_ACCOUNT_ADDRESS>
Gas Limit:   8000000
Gas Price:   20000000
Deploy Cost: 0.00029065308

Options
=======
Chain Id:    <CHAIN_ID>
Threshold:   <RELAYER_THRESHOLD>
Relayers:    <RELAYER_ACCOUNT_ADDRESS>
Bridge Fee:  0
Expiry:      100

Contract Addresses
================================================================
Bridge:             <BRIDGE_CONTRACT_ADDRESS>
----------------------------------------------------------------
Erc20 Handler:      <ERC20_HANDLER_CONTRACT_ADDRESS>
----------------------------------------------------------------
Erc721 Handler:     Not Deployed
----------------------------------------------------------------
Generic Handler:    Not Deployed
----------------------------------------------------------------
Erc20:              Not Deployed
----------------------------------------------------------------
Erc721:             Not Deployed
----------------------------------------------------------------
Centrifuge Asset:   Not Deployed
----------------------------------------------------------------
WETC:               Not Deployed
================================================================
```

## ขั้นตอนที่ 2: ปรับใช้สัญญา ERC20 ของคุณ {#step2-deploy-your-erc20-contract}

คุณจะปรับใช้สัญญา ERC20 ของคุณตัวอย่างนี้จะแนะนำคุณเกี่ยวกับโครงการ Hardhat [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example)

```bash
$ git clone https://github.com/Trapesys/chainbridge-example.git
$ cd chainbridge-example
$ npm i
```

โปรดสร้างไฟล์ `.env` และตั้งค่าต่อไปนี้

```.env
PRIVATE_KEYS=0x...
MUMBAI_JSONRPC_URL=https://rpc-mumbai.matic.today
EDGE_JSONRPC_URL=http://localhost:10002
```

ต่อไปคุณจะปรับใช้สัญญา ERC20 ในทั้งสองเชน

```bash
$ npx hardhat deploy --contract erc20 --name <ERC20_TOKEN_NAME> --symbol <ERC20_TOKEN_SYMBOL> --network mumbai
```

```bash
$ npx hardhat deploy --contract erc20 --name <ERC20_TOKEN_NAME> --symbol <ERC20_TOKEN_SYMBOL> --network edge
```

หลังการปรับใช้สำเร็จ คุณจะได้รับที่อยู่ของสัญญาดังนี้:

```bash
ERC20 contract has been deployed
Address: <ERC20_CONTRACT_ADDRESS>
Name: <ERC20_TOKEN_NAME>
Symbol: <ERC20_TOKEN_SYMBOL>
```

## ขั้นตอนที่ 3: ลงทะเบียน Resource ID ใน Bridge {#step3-register-resource-id-in-bridge}

คุณจะลงทะเบียน Resource ID ที่เชื่อมโยงทรัพยากรในสภาพแวดล้อมแบบข้ามเชนคุณต้องตั้งค่า Resource ID เดียวกันในทั้งสองเชน

```bash
$ cb-sol-cli bridge register-resource \
  --url https://rpc-mumbai.matic.today \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  --resourceId "0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[ERC20_CONTRACT_ADDRESS]"
```

```bash
$ cb-sol-cli bridge register-resource \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --resourceId "0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[ERC20_CONTRACT_ADDRESS]"
```

## ขั้นตอนที่ 4: ตั้งค่าโหมดสร้าง/เบิร์น ในบริดจ์ ERC20 ของ Edge {#step4-set-mint-burn-mode-in-erc20-bridge-of-the-edge}

Bridge คาดว่าจะทำงานในโหมดเบิร์น/สร้างใน Polygon Edgeคุณจะตั้งค่าโหมดเบิร์น/สร้างโดยใช้ `cb-sol-cli`

```bash
$ cb-sol-cli bridge set-burn \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[ERC20_CONTRACT_ADDRESS]"
```

และคุณจำเป็นต้องมอบบทบาทผู้สร้างและผู้เบิร์นให้สัญญา ERC20 Handler

```bash
$ npx hardhat grant --role mint --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --network edge
$ npx hardhat grant --role burn --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --network edge
```

## ขั้นตอนที่ 5: สร้างโทเค็น {#step5-mint-token}

คุณจะสร้างโทเค็น ERC20 ใหม่ในเชน Mumbai

```bash
$ npx hardhat mint --type erc20 --contract [ERC20_CONTRACT_ADDRESS] --address [ACCOUNT_ADDRESS] --amount 100000000000000000000 --network mumbai # 100 Token
```

หลังธุรกรรมสำเร็จแล้ว บัญชีจะมีโทเค็นที่สร้าง

## ขั้นตอนที่ 6: เริ่มการโอน ERC20 {#step6-start-erc20-transfer}

ก่อนเริ่มขั้นตอนนี้ โปรดตรวจสอบให้แน่ใจว่าคุณได้เริ่มต้นตัวรีเลย์แล้วโปรดดูรายละเอียดเพิ่มเติมที่[การตั้งค่า](/docs/edge/additional-features/chainbridge/setup)

ระหว่างการโอนโทเค็นจาก Mumbai ไปยัง Edge สัญญา ERC20 Handler ใน Mumbai จะถอนโทเค็นจากบัญชีของคุณคุณจะเรียก approve ก่อนโอน

```bash
$ npx hardhat approve --type erc20 --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --amount 10000000000000000000 --network mumbai # 10 Token
```

สุดท้าย คุณจะเริ่มโอนโทเค็นจาก Mumbai ไปยัง Edge โดยใช้ `cb-sol-cli`

```bash
# Start transfer from Mumbai to Polygon Edge chain
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

หลังธุรกรรมฝากเงินสำเร็จ ตัวรีเลย์จะได้รับอีเวนต์และโหวตข้อเสนอตัวรีเลย์ดำเนินการธุรกรรมเพื่อส่งโทเค็นไปยังบัญชีผู้รับในเชน Polygon Edge หลังจากส่งการโหวตในจำนวนที่ต้องการ

```bash
INFO[11-19|08:15:58] Handling fungible deposit event          chain=mumbai dest=100 nonce=1
INFO[11-19|08:15:59] Attempting to resolve message            chain=polygon-edge type=FungibleTransfer src=99 dst=100 nonce=1 rId=000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00
INFO[11-19|08:15:59] Creating erc20 proposal                  chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Watching for finalization event          chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Submitted proposal vote                  chain=polygon-edge tx=0x67a97849951cdf0480e24a95f59adc65ae75da23d00b4ab22e917a2ad2fa940d src=99 depositNonce=1 gasPrice=1
INFO[11-19|08:16:24] Submitted proposal execution             chain=polygon-edge tx=0x63615a775a55fcb00676a40e3c9025eeefec94d0c32ee14548891b71f8d1aad1 src=99 dst=100 nonce=1 gasPrice=5
```

เมื่อธุรกรรมดำเนินการสำเร็จ คุณจะได้รับโทเค็นในเชน Polygon Edge

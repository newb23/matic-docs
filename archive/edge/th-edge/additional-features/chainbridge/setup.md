---
id: setup
title: การตั้งค่า
description: วิธีตั้งค่า ChainBridge
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

## การปรับใช้สัญญา {#contracts-deployment}

ในส่วนนี้ คุณจะปรับใช้สัญญาที่จำเป็นไปยังเชน Polygon PoS และ Polygon Edge ด้วย `cb-sol-cli`

```bash
# Setup for cb-sol-cli command
$ git clone https://github.com/ChainSafe/chainbridge-deploy.git
$ cd chainbridge-deploy/cb-sol-cli
$ make install
```

ประการแรก เราจะปรับใช้สัญญากับเชน Polygon PoS โดยใช้คำสั่ง `cb-sol-cli deploy` ค่าสถานะ `--all` ทำให้คำสั่งปรับใช้สัญญาทั้งหมด รวมถึงบริดจ์, ERC20 Handler, ERC721 Handler, Generic Handler, ERC20 และสัญญา ERC721นอกจากนี้ ยังจะตั้งค่าที่อยู่บัญชีตัวรีเลย์เริ่มต้นและหลักเกณฑ์

```bash
# Deploy all required contracts into Polygon PoS chain
$ cb-sol-cli deploy --all --chainId 99 \
  --url https://rpc-mumbai.matic.today \
  --gasPrice [GAS_PRICE] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```


เรียนรู้เกี่ยวกับ chainID และ JSON-RPC URL [ที่นี่](/docs/edge/additional-features/chainbridge/definitions)

:::caution

ราคาแก๊สเริ่มต้นใน `cb-sol-cli` คือ `20000000` (`0.02 Gwei`)หากต้องการกำหนดราคาแก๊สที่เหมาะสมในธุรกรรม โปรดตั้งค่าโดยใช้อาร์กิวเมนต์ `--gasPrice`

```bash
$ cb-sol-cli deploy --all --chainId 99 \
  --url https://rpc-mumbai.matic.today \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1 \
  # Set gas price to 5 Gwei
  --gasPrice 5000000000
```

:::

:::caution

สัญญาบริดจ์ใช้ค่าแก๊สประมาณ 0x3f97b8 (4167608) ในการปรับใช้โปรดตรวจสอบให้แน่ใจว่าบล็อกที่กำลังสร้างมีขีดจำกัดค่าแก๊สต่อบล็อกเพียงพอสำหรับการทำธุรกรรมการสร้างสัญญาหากต้องการเรียนรู้เพิ่มเติมเกี่ยวกับการเปลี่ยนขีดจำกัดค่าแก๊สต่อบล็อกใน Polygon Edge โปรดไปที่[การตั้งค่าภายใน](/docs/edge/get-started/set-up-ibft-locally)

:::

เมื่อปรับใช้งานสัญญาแล้ว คุณจะได้รับผลลัพธ์ต่อไปนี้:

```bash
Deploying contracts...
✓ Bridge contract deployed
✓ ERC20Handler contract deployed
✓ ERC721Handler contract deployed
✓ GenericHandler contract deployed
✓ ERC20 contract deployed
WARNING: Multiple definitions for safeTransferFrom
✓ ERC721 contract deployed

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
Erc721 Handler:     <ERC721_HANDLER_CONTRACT_ADDRESS>
----------------------------------------------------------------
Generic Handler:    <GENERIC_HANDLER_CONTRACT_ADDRESS>
----------------------------------------------------------------
Erc20:              <ERC20_CONTRACT_ADDRESS>
----------------------------------------------------------------
Erc721:             <ERC721_CONTRACT_ADDRESS>
----------------------------------------------------------------
Centrifuge Asset:   Not Deployed
----------------------------------------------------------------
WETC:               Not Deployed
================================================================
```

ตอนนี้เราอาจปรับใช้สัญญากับเชน Polygon Edge

```bash
# Deploy all required contracts into Polygon Edge chain
$ cb-sol-cli deploy --all --chainId 100 \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```

บันทึกเอาต์พุตเทอร์มินัลด้วยที่อยู่สัญญาอัจฉริยะที่ปรับใช้ เนื่องจากเราต้องมีไว้สำหรับขั้นตอนต่อไป

## การตั้งค่าตัวรีเลย์ {#relayer-setup}

ในส่วนนี้ คุณจะเริ่มต้นตัวรีเลย์เพื่อแลกเปลี่ยนข้อมูลระหว่าง 2 เชน

ขั้นแรก เราต้องโคลนและสร้างพื้นที่เก็บข้อมูล ChainBridge

```bash
$ git clone https://github.com/ChainSafe/ChainBridge.git
$ cd chainBridge && make install
```

ถัดไป คุณต้องสร้าง `config.json` และตั้งค่า JSON-RPC URL, ที่อยู่ตัวรีเลย์ และที่อยู่สัญญาสำหรับแต่ละเชน

```json
{
  "chains": [
    {
      "name": "mumbai",
      "type": "ethereum",
      "id": "99",
      "endpoint": "https://rpc-mumbai.matic.today",
      "from": "<RELAYER_ACCOUNT_ADDRESS>",
      "opts": {
        "bridge": "<BRIDGE_CONTRACT_ADDRESS>",
        "erc20Handler": "<ERC20_HANDLER_CONTRACT_ADDRESS>",
        "erc721Handler": "<ERC721_HANDLER_CONTRACT_ADDRESS>",
        "genericHandler": "<GENERIC_HANDLER_CONTRACT_ADDRESS>",
        "minGasPrice": "1",
        "http": "true"
      }
    },
    {
      "name": "polygon-edge",
      "type": "ethereum",
      "id": "100",
      "endpoint": "http://localhost:10002",
      "from": "<RELAYER_ACCOUNT_ADDRESS>",
      "opts": {
        "bridge": "<BRIDGE_CONTRACT_ADDRESS>",
        "erc20Handler": "<ERC20_HANDLER_CONTRACT_ADDRESS>",
        "erc721Handler": "<ERC721_HANDLER_CONTRACT_ADDRESS>",
        "genericHandler": "<GENERIC_HANDLER_CONTRACT_ADDRESS>",
        "minGasPrice": "1",
        "http": "true"
      }
    }
  ]
}
```

ในการเริ่มต้นตัวรีเลย์ คุณต้องนำเข้าคีย์ส่วนตัวที่สอดคล้องกับที่อยู่บัญชีของตัวรีเลย์คุณจะต้องป้อนรหัสผ่านเมื่อคุณนำเข้าคีย์ส่วนตัวเมื่อการนำเข้าสำเร็จ คีย์จะได้รับการเก็บไว้ใต้ `keys/<ADDRESS>.key`

```bash
# Import private key and store to local with encryption
$ chainbridge accounts import --privateKey [RELAYER_ACCOUNT_PRIVATE_KEY]

INFO[11-19|07:09:01] Importing key...
Enter password to encrypt keystore file:
> [PASSWORD_TO_ENCRYPT_KEY]
INFO[11-19|07:09:05] private key imported                     address=<RELAYER_ACCOUNT_ADDRESS> file=.../keys/<RELAYER_ACCOUNT_ADDRESS>.key
```

จากนั้น คุณก็สามารถเริ่มตัวรีเลย์ได้คุณจะต้องป้อนรหัสผ่านเดียวกับที่คุณเลือกไว้สำหรับการจัดเก็บคีย์ในตอนเริ่มต้น

```bash
# Start relayer
$ chainbridge --config config.json --latest

INFO[11-19|07:15:19] Starting ChainBridge...
Enter password for key ./keys/<RELAYER_ACCOUNT_ADDRESS>.key:
> [PASSWORD_TO_DECRYPT_KEY]
INFO[11-19|07:15:25] Connecting to ethereum chain...          chain=mumbai url=<JSON_RPC_URL>
Enter password for key ./keys/<RELAYER_ACCOUNT_ADDRESS>.key:
> [PASSWORD_TO_DECRYPT_KEY]
INFO[11-19|07:15:31] Connecting to ethereum chain...          chain=polygon-edge url=<JSON_RPC_URL>
```

เมื่อตัวรีเลย์เริ่มต้นขึ้นแล้ว ตัวรีเลย์จะเริ่มดูบล็อกใหม่ๆ ในแต่ละเชน

---
id: use-case-erc721-bridge
title: กรณีการใช้งาน - บริดจ์ ERC721
description: ตัวอย่างของการบริดจ์สัญญา ERC721
keywords:
  - docs
  - polygon
  - edge
  - Bridge
  - ERC721
---

ส่วนนี้มีจุดมุ่งหมายเพื่อให้คุณมีขั้นตอนการตั้งค่าบริดจ์ ERC721 สำหรับกรณีการใช้งานจริง

ในคู่มือนี้ คุณจะใช้ Mumbai Polygon PoS Testnet และเชน Polygon Edge ภายในโปรดตรวจสอบให้แน่ใจว่าคุณมี JSON-RPC Endpoint สำหรับ Mumbai และคุณได้ตั้งค่า Polygon Edge ในสภาพแวดล้อมภายในแล้วโปรดดูรายละเอียดเพิ่มเติมที่[การตั้งค่าภายใน](/docs/edge/get-started/set-up-ibft-locally)หรือ[การตั้งค่าในระบบคลาวด์](/docs/edge/get-started/set-up-ibft-on-the-cloud)

## สถานการณ์จำลอง {#scenario}

สถานการณ์นี้คือการตั้งค่าบริดจ์สำหรับ NFT มาตรฐาน ERC721 ที่ได้รับการปรับใช้ในเชนสาธารณะ (Polygon PoS) แล้วเพื่อเปิดใช้งานการโอนต้นทุนต่ำในเชนส่วนตัว (Polygon Edge) สำหรับผู้ใช้ในกรณีปกติในกรณีดังกล่าว มีการกำหนดข้อมูลเมตาต้นฉบับไว้ในเชนสาธารณะแล้ว และมีแต่ NFT ที่ได้รับการโอนมาจากเชนสาธารณะเท่านั้นที่จะสามารถอยู่ในเชนส่วนตัวได้ด้วยเหตุผลดังกล่าว คุณจะต้องใช้โหมดล็อก/ปลดล็อกในเชนสาธารณะและโหมดเบิร์น/สร้างในเชนส่วนตัว

เมื่อส่ง NFT จากเชนสาธารณะไปยังเชนส่วนตัว จะมีการล็อก NFT ในสัญญา ERC721 Handler ในเชนสาธารณะ และสร้าง NFT เดียวกันในเชนส่วนตัวในทางกลับกัน ในกรณีที่โอนจากเชนส่วนตัวไปยังเชนสาธารณะ จะมีการเบิร์น NFT ในเชนส่วนตัวและปลดล็อก NFT เดียวกันจากสัญญา ERC721 Handler ในเชนสาธารณะ

## สัญญา {#contracts}

การอธิบายด้วยสัญญา ERC721 อย่างง่าย แทนที่จะเป็นสัญญาที่ ChainBridge พัฒนาขึ้นสำหรับโหมดเบิร์น/สร้าง สัญญา ERC721 ต้องมีเมธอด `mint` และ `burn` นอกจากเมธอดสำหรับ ERC721 ดังนี้:

```sol
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract SampleNFT is ERC721, ERC721Burnable, ERC721URIStorage, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    string public baseURI;

    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI
    ) ERC721(name, symbol) {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(MINTER_ROLE, _msgSender());
        _setupRole(BURNER_ROLE, _msgSender());

        _setBaseURI(baseURI);
    }

    function mint(
        address recipient,
        uint256 tokenID,
        string memory data
    ) public onlyRole(MINTER_ROLE) {
        _mint(recipient, tokenID);
        _setTokenURI(tokenID, data);
    }

    function burn(uint256 tokenID)
        public
        override(ERC721Burnable)
        onlyRole(BURNER_ROLE)
    {
        _burn(tokenID);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _burn(uint256 tokenId)
        internal
        virtual
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function _setBaseURI(string memory baseURI_) internal {
        baseURI = baseURI_;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }
}
```

โค้ดและสคริปต์ทั้งหมดอยู่ในพื้นที่เก็บข้อมูล Github [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example)

## ขั้นตอนที่ 1: ปรับใช้สัญญาบริดจ์และ ERC721 Handler {#step1-deploy-bridge-and-erc721-handler-contracts}

ก่อนอื่นคุณจะต้องปรับใช้สัญญาบริดจ์และ ERC721Handler โดยใช้ `cb-sol-cli` ในทั้งสองเชน

```bash
# Deploy Bridge and ERC721 contracts in Polygon PoS chain
$ cb-sol-cli deploy --bridge --erc721Handler --chainId 99 \
  --url https://rpc-mumbai.matic.today \
  --gasPrice [GAS_PRICE] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```

```bash
# Deploy Bridge and ERC721 contracts in Polygon Edge chain
$ cb-sol-cli deploy --bridge --erc721Handler --chainId 100 \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```

คุณจะได้รับที่อยู่สัญญาบริดจ์และ ERC721Handler ดังนี้:

```bash
Deploying contracts...
✓ Bridge contract deployed
✓ ERC721Handler contract deployed

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
Erc20 Handler:      Not Deployed
----------------------------------------------------------------
Erc721 Handler:     <ERC721_HANDLER_CONTRACT_ADDRESS>
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

## ขั้นตอนที่ 2: ปรับใช้สัญญา ERC721 ของคุณ {#step2-deploy-your-erc721-contract}

คุณจะต้องปรับใช้สัญญา ERC721 ของคุณตัวอย่างนี้จะแนะนำคุณเกี่ยวกับโครงการ Hardhat [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example)

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

ต่อไปคุณจะต้องปรับใช้สัญญา ERC721 ในทั้งสองเชน

```bash
$ npx hardhat deploy --contract erc721 --name <ERC721_TOKEN_NAME> --symbol <ERC721_TOKEN_SYMBOL> --uri <BASE_URI> --network mumbai
```

```bash
$ npx hardhat deploy --contract erc721 --name <ERC721_TOKEN_NAME> --symbol <ERC721_TOKEN_SYMBOL> --uri <BASE_URI> --network edge
```

หลังจากการปรับใช้สำเร็จ คุณจะได้รับที่อยู่ของสัญญาดังนี้:

```bash
ERC721 contract has been deployed
Address: <ERC721_CONTRACT_ADDRESS>
Name: <ERC721_TOKEN_NAME>
Symbol: <ERC721_TOKEN_SYMBOL>
Base URI: <ERC721_BASE_URI>
```

## ขั้นตอนที่ 3: ลงทะเบียน Resource ID ในบริดจ์ {#step3-register-resource-id-in-bridge}

คุณจะต้องลงทะเบียน Resource ID ที่เชื่อมโยงทรัพยากรในสภาพแวดล้อมแบบข้ามเชน

```bash
$ cb-sol-cli bridge register-resource \
  --url https://rpc-mumbai.matic.today \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  # Set Resource ID for ERC721
  --resourceId "0x000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC721_HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[ERC721_CONTRACT_ADDRESS]"
```

```bash
$ cb-sol-cli bridge register-resource \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  # Set Resource ID for ERC721
  --resourceId "0x000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC721_HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[ERC721_CONTRACT_ADDRESS]"
```

## ขั้นตอนที่ 4: ตั้งค่าโหมดสร้าง/เบิร์นในบริดจ์ ERC721 ของ Edge {#step4-set-mint-burn-mode-in-erc721-bridge-of-the-edge}

บริดจ์จะทำงานในโหมดเบิร์น/สร้างใน Edgeคุณจะต้องตั้งค่าโหมดเบิร์น/สร้าง

```bash
$ cb-sol-cli bridge set-burn \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC721_HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[ERC721_CONTRACT_ADDRESS]"
```

และคุณจะต้องมอบบทบาทผู้สร้างและผู้เบิร์นให้สัญญา ERC721 Handler

```bash
$ npx hardhat grant --role mint --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --network edge
$ npx hardhat grant --role burn --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --network edge
```

## ขั้นตอนที่ 5: สร้าง NFT {#step5-mint-nft}

คุณจะต้องสร้าง NFT มาตรฐาน ERC721 ใหม่ในเชน Mumbai

```bash
$ npx hardhat mint --type erc721 --contract [ERC721_CONTRACT_ADDRESS] --address [ACCOUNT_ADDRESS] --id 0x50 --data hello.json --network mumbai
```

หลังธุรกรรมสำเร็จแล้ว บัญชีจะมี NFT ที่สร้างขึ้น

## ขั้นตอนที่ 6: เริ่มการโอน ERC721 {#step6-start-erc721-transfer}

ก่อนเริ่มขั้นตอนนี้ โปรดตรวจสอบให้แน่ใจว่าคุณได้เริ่มต้นตัวรีเลย์แล้วโปรดดูรายละเอียดเพิ่มเติมที่[การตั้งค่า](/docs/edge/additional-features/chainbridge/setup)

ระหว่างการโอน NFT จาก Mumbai ไปยัง Edge สัญญา ERC721 Handler ใน Mumbai จะถอน NFT จากบัญชีของคุณคุณจะต้องเรียก approve ก่อนโอน

```bash
$ npx hardhat approve --type erc721 --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --id 0x50 --network mumbai
```

สุดท้ายนี้ คุณจะต้องเริ่มต้นการโอน NFT จาก Mumbai ไปยัง Edge

```bash
# Start transfer from Mumbai to Polygon Edge chain
$ cb-sol-cli erc721 deposit \
  --url https://rpc-mumbai.matic.today \
  --privateKey [PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  --id 0x50 \
  # ChainID for Polygon Edge chain
  --dest 100 \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --recipient "[RECIPIENT_ADDRESS_IN_POLYGON_EDGE_CHAIN]" \
  --resourceId "0x000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501"
```

หลังธุรกรรมการฝากสำเร็จ ตัวรีเลย์จะได้รับอีเวนต์และการโหวตสำหรับข้อเสนอ  ตัวรีเลย์จะดำเนินการธุรกรรมเพื่อส่ง NFT ไปยังบัญชีผู้รับในเชน Polygon Edge หลังจากส่งการโหวตในจำนวนที่ต้องการ

```bash
INFO[11-19|09:07:50] Handling nonfungible deposit event       chain=mumbai
INFO[11-19|09:07:50] Attempting to resolve message            chain=polygon-edge type=NonFungibleTransfer src=99 dst=100 nonce=2 rId=000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501
INFO[11-19|09:07:50] Creating erc721 proposal                 chain=polygon-edge src=99 nonce=2
INFO[11-19|09:07:50] Watching for finalization event          chain=polygon-edge src=99 nonce=2
INFO[11-19|09:07:50] Submitted proposal vote                  chain=polygon-edge tx=0x58a22d84a08269ad2e8d52d8dc038621f1a21109d11c7b6e0d32d5bf21ea8505 src=99 depositNonce=2 gasPrice=1
INFO[11-19|09:08:15] Submitted proposal execution             chain=polygon-edge tx=0x57419844881a07531e31667c609421662d94d21d0709e64fb728138309267e68 src=99 dst=100 nonce=2 gasPrice=3
```

เมื่อธุรกรรมดำเนินการสำเร็จ คุณจะได้รับ NFT ในเชน Polygon Edge

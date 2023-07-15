---
id: use-case-erc721-bridge
title: Trường hợp sử dụng - Cầu nối ERC721
description: Ví dụ về Hợp đồng Cầu nối ERC721
keywords:
  - docs
  - polygon
  - edge
  - Bridge
  - ERC721
---

Phần này nhằm hướng dẫn quy trình thiết lập của Cầu nối ERC721 trong thực tế.

Trong hướng dẫn này, bạn sẽ sử dụng mạng thử nghiệm Polygon PoS Mumbai và chuỗi cục bộ Polygon Edge. Hãy đảm bảo bạn có điểm cuối JSON-RPC dành cho Mumbai và bạn đã thiết lập Polygon Edge trong môi trường cục bộ. Vui lòng tham khảo [Thiết lập cục bộ](/docs/edge/get-started/set-up-ibft-locally) hoặc [Thiết lập đám mây](/docs/edge/get-started/set-up-ibft-on-the-cloud) để biết thêm chi tiết.

## Tình huống {#scenario}

Tình huống này đề cập đến việc thiết lập Cầu nối cho NFT ERC721, vốn được triển khai trong chuỗi công khai (Polygon PoS), nhằm hỗ trợ chuyển nhượng chi phí thấp trong chuỗi riêng (Polygon Edge) dành cho người dùng trong trường hợp thông thường.
 Trong trường hợp này, siêu dữ liệu ban đầu đã được xác định trong chuỗi công khai và chỉ các NFT được chuyển nhượng từ chuỗi Công khai có thể tồn tại trong chuỗi riêng.
 Vì vậy, bạn sẽ cần sẽ cần sử dụng chế độ khóa/phát hành trong chuỗi công khai và chế độ đốt/mint trong chuỗi riêng.


Khi gửi NFT từ chuỗi công khai sang chuỗi riêng, NFT sẽ bị khóa theo Hợp đồng ERC721 Handler trong chuỗi công khai và NFT tương ứng sẽ được mint trong chuỗi riêng.
 Mặt khác, trong trường hợp chuyển nhượng từ chuỗi riêng sang chuỗi công khai, NFT trong chuỗi riêng sẽ bị đốt và NFT tương ứng sẽ được phát hành từ hợp đồng ERC721 Handler trong chuỗi công khai.


## Hợp đồng {#contracts}

Giải thích bằng hợp đồng ERC721 đơn giản thay vì hợp đồng do ChainBridge phát triển.
 Đối với chế độ đốt/mint, ngoài các phương thức được định nghĩa trong ERC721, hợp đồng ERC721 phải có phương thức  `mint`và  `burn`như sau:


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

Tất cả các mã và tập lệnh đều có trong Github Repo [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example).

## Bước 1: Triển khai các hợp đồng Bridge và ERC721 Handler {#step1-deploy-bridge-and-erc721-handler-contracts}

Đầu tiên, bạn sẽ triển khai các hợp đồng Bridge và ERC721 Handler bằng  `cb-sol-cli`trong cả hai chuỗi.

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

Bạn sẽ nhận được các địa chỉ hợp đồng Bridge và ERC721 Handler như sau:


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

## Bước 2: Triển khai Hợp đồng ERC721 của bạn {#step2-deploy-your-erc721-contract}

Bạn sẽ triển khai Hợp đồng ERC721. Ví dụ này sẽ hướng dẫn bạn về dự án hardhat [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example).


```bash
$ git clone https://github.com/Trapesys/chainbridge-example.git
$ cd chainbridge-example
$ npm i
```

Hãy tạo tệp `.env` và thiết lập các giá trị sau.

```.env
PRIVATE_KEYS=0x...
MUMBAI_JSONRPC_URL=https://rpc-mumbai.matic.today
EDGE_JSONRPC_URL=http://localhost:10002
```

Tiếp theo, bạn sẽ triển khai hợp đồng ERC721 trong cả hai chuỗi.


```bash
$ npx hardhat deploy --contract erc721 --name <ERC721_TOKEN_NAME> --symbol <ERC721_TOKEN_SYMBOL> --uri <BASE_URI> --network mumbai
```

```bash
$ npx hardhat deploy --contract erc721 --name <ERC721_TOKEN_NAME> --symbol <ERC721_TOKEN_SYMBOL> --uri <BASE_URI> --network edge
```

Sau khi triển khai thành công, bạn sẽ nhận địa chỉ hợp đồng như sau:

```bash
ERC721 contract has been deployed
Address: <ERC721_CONTRACT_ADDRESS>
Name: <ERC721_TOKEN_NAME>
Symbol: <ERC721_TOKEN_SYMBOL>
Base URI: <ERC721_BASE_URI>
```

## Bước 3: Đăng ký ID tài nguyên trong Bridge {#step3-register-resource-id-in-bridge}

Bạn sẽ đăng ký một ID tài nguyên liên kết với các tài nguyên trong môi trường chuỗi chéo.


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

## Bước 4: Thiết lập chế độ Đúc/Mint cho cầu nối ERC721 của Edge {#step4-set-mint-burn-mode-in-erc721-bridge-of-the-edge}

Bridge dự kiến ​​sẽ hoạt động ở chế độ đốt/mint trong Edge.
 Bạn sẽ thiết lập chế độ đốt/mint.

```bash
$ cb-sol-cli bridge set-burn \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC721_HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[ERC721_CONTRACT_ADDRESS]"
```

Và bạn cần cấp quyền mint và đốt cho hợp đồng ERC721 Handler.


```bash
$ npx hardhat grant --role mint --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --network edge
$ npx hardhat grant --role burn --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --network edge
```

## Bước 5: Mint NFT {#step5-mint-nft}

Bạn sẽ tiến hành mint NFT ERC721 mới trong chuỗi Mumbai.


```bash
$ npx hardhat mint --type erc721 --contract [ERC721_CONTRACT_ADDRESS] --address [ACCOUNT_ADDRESS] --id 0x50 --data hello.json --network mumbai
```

Sau khi giao dịch thành công, tài khoản sẽ nhận được NFT đã mint.

## Bước 6: Bắt đầu giao dịch ERC721 {#step6-start-erc721-transfer}

Trước khi bắt đầu bước này, hãy đảm bảo rằng bạn đã kích hoạt trình chuyển tiếp.
 Vui lòng kiểm tra mục [Thiết lập](/docs/edge/additional-features/chainbridge/setup) để biết thêm chi tiết.

Trong quá trình chuyển NFT từ Mumbai sang Edge, hợp đồng ERC721 Hanlder ở Mumbai sẽ rút NFT khỏi tài khoản của bạn.
 Bạn sẽ gọi mục phê duyệt trước khi chuyển nhượng.

```bash
$ npx hardhat approve --type erc721 --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --id 0x50 --network mumbai
```

Cuối cùng, bạn tiến hành chuyển NFT từ Mumbai sang Edge.


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

Sau khi giao dịch nạp tiền thành công, trình chuyển tiếp sẽ nhận được sự kiện và bỏ phiếu cho đề xuất.   Trình chuyển tiếp sẽ thực thi một giao dịch để gửi NFT đến tài khoản người nhận trong chuỗi Polygon Edge sau khi nộp đủ số lượng phiếu bầu cần thiết.


```bash
INFO[11-19|09:07:50] Handling nonfungible deposit event       chain=mumbai
INFO[11-19|09:07:50] Attempting to resolve message            chain=polygon-edge type=NonFungibleTransfer src=99 dst=100 nonce=2 rId=000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501
INFO[11-19|09:07:50] Creating erc721 proposal                 chain=polygon-edge src=99 nonce=2
INFO[11-19|09:07:50] Watching for finalization event          chain=polygon-edge src=99 nonce=2
INFO[11-19|09:07:50] Submitted proposal vote                  chain=polygon-edge tx=0x58a22d84a08269ad2e8d52d8dc038621f1a21109d11c7b6e0d32d5bf21ea8505 src=99 depositNonce=2 gasPrice=1
INFO[11-19|09:08:15] Submitted proposal execution             chain=polygon-edge tx=0x57419844881a07531e31667c609421662d94d21d0709e64fb728138309267e68 src=99 dst=100 nonce=2 gasPrice=3
```

Sau khi thực thi giao dịch thành công, bạn sẽ nhận được NFT trong chuỗi Polygon Edge.

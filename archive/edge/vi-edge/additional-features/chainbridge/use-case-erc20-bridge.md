---
id: use-case-erc20-bridge
title: Trường hợp sử dụng - Bridge ERC20
description: Ví dụ để bắc cầu hợp đồng ERC20
keywords:
  - docs
  - polygon
  - edge
  - Bridge
  - ERC20
---

Phần này nhằm mục đích cung cấp cho bạn quy trình thiết lập của Bridge ERC20 cho tình huống sử dụng thực tế.

Trong hướng dẫn này, bạn sẽ sử dụng mạng thử nghiệm Polygon PoS Mumbai và chuỗi cục bộ Polygon Edge. Hãy đảm bảo bạn có điểm cuối JSON-RPC dành cho Mumbai và bạn đã thiết lập Polygon Edge trong môi trường cục bộ. Vui lòng tham khảo [Thiết lập cục bộ](/docs/edge/get-started/set-up-ibft-locally) hoặc [Thiết lập đám mây](/docs/edge/get-started/set-up-ibft-on-the-cloud) để biết thêm chi tiết.

## Tình huống {#scenario}

Tình huống này là thiết lập Bridge cho token ERC20 đã được triển khai trong chuỗi công khai (Polygon PoS) để cho phép quá trình chuyển nhượng chi phí thấp trong chuỗi riêng (Polygon Edge) dành cho người dùng trong tình huống thông thường. Trong trường hợp đó, tổng nguồn cung token đã được xác định trong chuỗi công khai và chỉ số lượng token đã được chuyển từ chuỗi công khai sang chuỗi riêng phải tồn tại trong chuỗi riêng. Vì vậy, bạn sẽ cần sử dụng chế độ khóa/phát hành trong chuỗi công khai và chế độ đốt/mint trong chuỗi riêng tư.

Khi gửi token từ chuỗi công khai sang chuỗi riêng, token sẽ bị khóa theo hợp đồng ERC20 Handler của chuỗi công khai và lượng token tương ứng sẽ được mint trong chuỗi riêng. Mặt khác, trong trường hợp chuyển nhượng từ chuỗi riêng sang chuỗi công khai, token trong chuỗi riêng sẽ bị đốt và lượng token tương ứng sẽ được phát hành từ hợp đồng ERC20 Handler trong chuỗi công khai.

## Hợp đồng {#contracts}

Giải thích bằng hợp đồng ERC20 đơn giản thay vì hợp đồng do ChainBridge phát triển. Đối với chế độ đốt/mint, hợp đồng ERC20 phải có phương thức `mint` và `burnFrom` ngoài các phương pháp cho ERC20 như thế này:

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

Tất cả các mã và tập lệnh đều có trong Github Repo [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example).

## Bước 1: Triển khai Bridge và các hợp đồng ERC20 Handler {#step1-deploy-bridge-and-erc20-handler-contracts}

Đầu tiên, bạn sẽ triển khai các hợp đồng Bridge và ERC20 Handler bằng `cb-sol-cli` trong cả hai chuỗi.

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

Bạn sẽ nhận được các địa chỉ hợp đồng Bridge và ERC20Handler như sau:

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

## Bước 2: Triển khai hợp đồng ERC20 của bạn {#step2-deploy-your-erc20-contract}

Bạn sẽ triển khai hợp đồng ERC20 của mình. Ví dụ này sẽ hướng dẫn bạn về dự án hardhat [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example).


```bash
$ git clone https://github.com/Trapesys/chainbridge-example.git
$ cd chainbridge-example
$ npm i
```

Vui lòng tạo tệp `.env` và thiết lập các giá trị sau.

```.env
PRIVATE_KEYS=0x...
MUMBAI_JSONRPC_URL=https://rpc-mumbai.matic.today
EDGE_JSONRPC_URL=http://localhost:10002
```

Tiếp theo, bạn sẽ cần triển khai hợp đồng ERC20 trong cả hai chuỗi.

```bash
$ npx hardhat deploy --contract erc20 --name <ERC20_TOKEN_NAME> --symbol <ERC20_TOKEN_SYMBOL> --network mumbai
```

```bash
$ npx hardhat deploy --contract erc20 --name <ERC20_TOKEN_NAME> --symbol <ERC20_TOKEN_SYMBOL> --network edge
```

Sau khi triển khai thành công, bạn sẽ nhận địa chỉ hợp đồng như sau:

```bash
ERC20 contract has been deployed
Address: <ERC20_CONTRACT_ADDRESS>
Name: <ERC20_TOKEN_NAME>
Symbol: <ERC20_TOKEN_SYMBOL>
```

## Bước 3: Đăng ký ID tài nguyên trong Bridge {#step3-register-resource-id-in-bridge}

Bạn sẽ cần đăng ký một ID tài nguyên liên kết với tài nguyên trong môi trường chuỗi chéo. Bạn cần thiết lập cùng một ID tài nguyên trong cả hai chuỗi.

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

## Bước 4: Thiết lập chế độ Mint/Đốt cho cầu nối ERC20 của Edge {#step4-set-mint-burn-mode-in-erc20-bridge-of-the-edge}

Bridge mong muốn hoạt động như chế độ đốt/mint trong Polygon Edge. Bàn sẽ thiết lập chế độ đốt/mint bằng `cb-sol-cli`.

```bash
$ cb-sol-cli bridge set-burn \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[ERC20_CONTRACT_ADDRESS]"
```

Và bạn cần cấp vai trò mint và đốt cho hợp đồng ERC20 Handler.

```bash
$ npx hardhat grant --role mint --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --network edge
$ npx hardhat grant --role burn --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --network edge
```

## Bước 5: Mint token {#step5-mint-token}

Bạn sẽ mint token ERC20 mới trong chuỗi Mumbai.

```bash
$ npx hardhat mint --type erc20 --contract [ERC20_CONTRACT_ADDRESS] --address [ACCOUNT_ADDRESS] --amount 100000000000000000000 --network mumbai # 100 Token
```

Sau khi giao dịch thành công, tài khoản sẽ có token được mint.

## Bước 6: Bắt đầu chuyển nhượng ERC20 {#step6-start-erc20-transfer}

Trước khi bắt đầu bước này, vui lòng đảm bảo rằng bạn đã khởi động trình chuyển tiếp. Vui lòng kiểm tra mục [Thiết lập](/docs/edge/additional-features/chainbridge/setup) để biết thêm chi tiết.

Trong quá trình chuyển token từ Mumbai sang Edge, hợp đồng ERC20 Handler ở Mumbai sẽ rút token từ tài khoản của bạn. Bạn sẽ gọi mục phê duyệt trước khi chuyển nhượng.

```bash
$ npx hardhat approve --type erc20 --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --amount 10000000000000000000 --network mumbai # 10 Token
```

Cuối cùng, bạn sẽ bắt đầu chuyển token từ Mumbai sang Edge bằng `cb-sol-cli`.

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

Sau khi giao dịch nạp tiền thành công, trình chuyển tiếp sẽ nhận được sự kiện và bỏ phiếu cho đề xuất. Nó thực thi một giao dịch để gửi token đến tài khoản người nhận trong chuỗi Polygon Edge sau khi đã nộp đủ số phiếu bầu cần thiết.

```bash
INFO[11-19|08:15:58] Handling fungible deposit event          chain=mumbai dest=100 nonce=1
INFO[11-19|08:15:59] Attempting to resolve message            chain=polygon-edge type=FungibleTransfer src=99 dst=100 nonce=1 rId=000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00
INFO[11-19|08:15:59] Creating erc20 proposal                  chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Watching for finalization event          chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Submitted proposal vote                  chain=polygon-edge tx=0x67a97849951cdf0480e24a95f59adc65ae75da23d00b4ab22e917a2ad2fa940d src=99 depositNonce=1 gasPrice=1
INFO[11-19|08:16:24] Submitted proposal execution             chain=polygon-edge tx=0x63615a775a55fcb00676a40e3c9025eeefec94d0c32ee14548891b71f8d1aad1 src=99 dst=100 nonce=1 gasPrice=5
```

Khi giao dịch thực thi thành công, bạn sẽ nhận được các token trong chuỗi Polygon Edge.

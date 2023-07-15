---
id: setup
title: Thiết lập
description: Cách thiết lập chainBridge
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

## Triển khai hợp đồng {#contracts-deployment}

Trong phần này, bạn sẽ triển khai các hợp đồng bắt buộc đối với chuỗi Polygon PoS và Polygon Edge bằng `cb-sol-cli`.

```bash
# Setup for cb-sol-cli command
$ git clone https://github.com/ChainSafe/chainbridge-deploy.git
$ cd chainbridge-deploy/cb-sol-cli
$ make install
```

Đầu tiên, chúng ta sẽ triển khai các hợp đồng cho chuỗi Polygon PoS bằng lệnh `cb-sol-cli deploy`. Cờ `--all` tạo lệnh triển khai tất cả các hợp đồng, bao gồm Bridge, ERC20 Handler, ERC721 Handler, Generic Handler, ERC20 và ERC721. Ngoài ra, nó sẽ thiết lập địa chỉ tài khoản trình chuyển tiếp mặc định và ngưỡng

```bash
# Deploy all required contracts into Polygon PoS chain
$ cb-sol-cli deploy --all --chainId 99 \
  --url https://rpc-mumbai.matic.today \
  --gasPrice [GAS_PRICE] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```


Tìm hiểu về URL chainID và JSON-RPC [tại đây](/docs/edge/additional-features/chainbridge/definitions)

:::caution

Giá gas mặc định trong `cb-sol-cli` là `20000000` (`0.02 Gwei`). Để thiết lập giá gas thích hợp cho giao dịch, vui lòng đặt giá trị bằng cách sử dụng đối số `--gasPrice`.

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

Hợp đồng Bridge mất khoảng 0x3f97b8 (4167608) gas để triển khai. Hãy đảm bảo rằng các khối được tạo có đủ giới hạn gas khối để chứa giao dịch tạo hợp đồng. Để tìm hiểu thêm về cách thay đổi giới hạn gas khối trong Polygon Edge, vui lòng truy cập mục [Thiết lập cục bộ](/docs/edge/get-started/set-up-ibft-locally)

:::

Khi các hợp đồng được triển khai, bạn sẽ nhận được kết quả sau:

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

Giờ chúng ta có thể triển khai các hợp đồng đến chuỗi Polygon Edge.

```bash
# Deploy all required contracts into Polygon Edge chain
$ cb-sol-cli deploy --all --chainId 100 \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```

Lưu kết quả đầu cuối bằng các địa chỉ hợp đồng thông minh đã triển khai vì chúng ta sẽ cần chúng cho bước tiếp theo.

## Thiết lập trình chuyển tiếp {#relayer-setup}

Trong phần này, bạn sẽ khởi động một trình chuyển tiếp để trao đổi dữ liệu giữa 2 chuỗi.

Đầu tiên, chúng ta cần nhân bản và xây dựng kho lưu trữ ChainBridge.

```bash
$ git clone https://github.com/ChainSafe/ChainBridge.git
$ cd chainBridge && make install
```

Tiếp theo, bạn cần tạo `config.json`và thiết lập các URL JSON-RPC, địa chỉ trình chuyển tiếp và địa chỉ hợp đồng cho mỗi chuỗi.

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

Để khởi động trình chuyển tiếp, bạn cần nhập khóa riêng tương ứng với địa chỉ tài khoản của trình chuyển tiếp. Bạn sẽ cần nhập mật khẩu khi nhập khóa riêng tư. Sau khi nhập thành công, khóa sẽ được lưu trữ trong `keys/<ADDRESS>.key`.

```bash
# Import private key and store to local with encryption
$ chainbridge accounts import --privateKey [RELAYER_ACCOUNT_PRIVATE_KEY]

INFO[11-19|07:09:01] Importing key...
Enter password to encrypt keystore file:
> [PASSWORD_TO_ENCRYPT_KEY]
INFO[11-19|07:09:05] private key imported                     address=<RELAYER_ACCOUNT_ADDRESS> file=.../keys/<RELAYER_ACCOUNT_ADDRESS>.key
```

Sau đó, bạn có thể bắt đầu trình chuyển tiếp. Bạn sẽ cần phải nhập cùng một mật khẩu mà bạn đã chọn để lưu trữ khóa lúc đầu.

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

Khi trình chuyển tiếp đã chạy, nó sẽ bắt đầu theo dõi các khối mới trên mỗi chuỗi.

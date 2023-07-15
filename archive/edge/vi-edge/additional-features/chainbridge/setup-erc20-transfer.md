---
id: setup-erc20-transfer
title: Chuyển nhượng Token ERC20
description: Cách thiết lập giao dịch ERC-20 trên ChainBridge
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

Hiện tại, chúng ta đã thiết lập cầu nối để trao đổi tài sản/dữ liệu giữa chuỗi Polygon PoS và Polygon Edge.
 Phần này sẽ hướng dẫn bạn thiết lập cầu nối ERC20 và gửi token giữa các blockchain khác nhau.


## Bước 1: Đăng ký ID tài nguyên
 {#step-1-register-resource-id}

Đầu tiên, bạn cần đăng ký một ID tài nguyên có liên kết với các tài nguyên trong môi trường chuỗi chéo.
 ID tài nguyên là một giá trị 32 byte duy nhất, gắn với tài nguyên mà chúng ta chuyển giữa các blockchain này.
 Các ID tài nguyên là tùy ý, nhưng theo quy ước, chúng thường chứa ID chuỗi gốc của byte cuối cùng (chuỗi gốc là mạng lưới khởi nguồn của các tài nguyên này).


Để đăng ký ID tài nguyên, bạn có thể sử dụng lệnh `cb-sol-cli bridge register-resource`. Bạn sẽ cần cung cấp khóa riêng tư của tài tài khoản `admin`.

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

## (Không bắt buộc) Đưa hợp đồng về trạng thái có thể đốt/mint
 {#optional-make-contracts-mintable-burnable}


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

## Bước 2: Chuyển nhượng Token ERC20 {#step-2-transfer-erc20-token}

Chúng ta sẽ gửi Token ERC20 từ chuỗi Polygon PoS đến chuỗi Polygon Edge.


Đầu tiên, bạn sẽ nhận được token nhờ quá trình mint.
 Tài khoản có vai trò `minter` có thể mint các token mới.
 Tài khoản đã triển khai hợp đồng ERC20 sẽ giữ vai trò `minter` theo mặc định.
 Để chỉ định vai trò thành viên của `minter` cho tài khoản khác, bạn cần chạy lệnh `cb-sol-cli erc20 add-minter`.


```bash
# Mint ERC20 tokens
$ cb-sol-cli erc20 mint \
  --url https://rpc-mumbai.matic.today \
  --privateKey [MINTER_ACCOUNT_PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --amount 1000
```

Để kiểm tra số dư hiện tại, bạn có thể sử dụng lệnh `cb-sol-cli erc20 balance`.

```bash
# Check ERC20 token balance
$ cb-sol-cli erc20 balance \
  --url https://rpc-mumbai.matic.today \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --address "[ACCOUNT_ADDRESS]"

[erc20/balance] Account <ACCOUNT_ADDRESS> has a balance of 1000.0
```

Tiếp theo, bạn cần phê duyệt việc chuyển token ERC20 từ tài khoản bằng ERC20 Handler


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

Để chuyển token sang chuỗi Polygon Edge, bạn cần triển khai `deposit`.


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

Sau khi giao dịch ký quỹ được thực hiện thành công, trình chuyển tiếp sẽ nhận được sự kiện và tiến hành bỏ phiếu cho đề xuất. Trình chuyển tiếp sẽ thực thi một giao dịch để gửi token đến tài khoản người nhận trong chuỗi Polygon Edge sau khi có đủ số lượng phiếu bầu cần thiết.

```bash
INFO[11-19|08:15:58] Handling fungible deposit event          chain=mumbai dest=100 nonce=1
INFO[11-19|08:15:59] Attempting to resolve message            chain=polygon-edge type=FungibleTransfer src=99 dst=100 nonce=1 rId=000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00
INFO[11-19|08:15:59] Creating erc20 proposal                  chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Watching for finalization event          chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Submitted proposal vote                  chain=polygon-edge tx=0x67a97849951cdf0480e24a95f59adc65ae75da23d00b4ab22e917a2ad2fa940d src=99 depositNonce=1 gasPrice=1
INFO[11-19|08:16:24] Submitted proposal execution             chain=polygon-edge tx=0x63615a775a55fcb00676a40e3c9025eeefec94d0c32ee14548891b71f8d1aad1 src=99 dst=100 nonce=1 gasPrice=5
```

Khi giao dịch được thực thi thành công, bạn sẽ nhận được token trong chuỗi Polygon Edge.

```bash
# Check the ERC20 balance in Polygon Edge chain
$ cb-sol-cli erc20 balance \
  --url https://localhost:10002 \
  --privateKey [PRIVATE_KEY] \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --address "[ACCOUNT_ADDRESS]"

[erc20/balance] Account <RECIPIENT_ACCOUNT_ADDRESS> has a balance of 10.0
```

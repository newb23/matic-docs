---
id: bls
title: BLS
description: "Giải thích và hướng dẫn liên quan đến chế độ BLS."
keywords:
  - docs
  - polygon
  - edge
  - bls
---

## Tổng quan {#overview}

BLS cũng được biết đến với tên Bloneh–Lynn–Shamm (BS)- là một kế hoạch đặc trưng mã hóa cho phép người dùng xác thực rằng một signer là xác thực. Đây là một kế hoạch đặc trưng có thể kết hợp nhiều chữ ký. Trong Polygon Edge, BLS được sử dụng mặc định để cung cấp bảo mật tốt hơn trong chế độ đồng thuận IBFT. BLS có thể tổng hợp các chữ ký thành một mảng byte đơn và giảm kích thước tiêu đề khối. Mỗi chuỗi có thể chọn sử dụng BLS hoặc không. Khóa ECDSA được sử dụng bất kể chế độ BLS có được bật hay không.

## Trình soạn tin Video {#video-presentation}

[![bls - video](https://img.youtube.com/vi/HbUmZpALlqo/0.jpg)](https://www.youtube.com/watch?v=HbUmZpALlqo)

## Cách thiết lập một chuỗi mới bằng BLS {#how-to-setup-a-new-chain-using-bls}

Tham khảo phần [Thiết lập Cục bộ](/docs/edge/get-started/set-up-ibft-locally) / [Thiết lập Đám mây](/docs/edge/get-started/set-up-ibft-on-the-cloud) để biết hướng dẫn thiết lập chi tiết.

## Cách chuyển từ chuỗi ECDSA PoA hiện hữu sang chuỗi BLS PoA {#how-to-migrate-from-an-existing-ecdsa-poa-chain-to-bls-poa-chain}

Phần này mô tả cách sử dụng chế độ BLS trong chuỗi PoA hiện hữu. Các bước sau là bắt buộc để kích hoạt BLS trong chuỗi PoA.

1. Dừng tất cả các nút
2. Tạo khóa BLS cho các trình xác thực
3. Thêm cài đặt fork vào genesis.json
4. Khởi động lại tất cả các nút

### 1. Dừng tất cả các nút {#1-stop-all-nodes}

Chấm dứt tất cả các quy trình của các trình xác thực bằng cách nhấn Ctrl + c (Control + c). Vui lòng ghi nhớ chiều cao khối mới nhất (số thứ tự cao nhất trong nhật ký cam kết khối).

### 2. Tạo khóa BLS {#2-generate-the-bls-key}

`secrets init` với `--bls` tạo khóa BLS. Để giữ ECDSA và khóa Mạng hiện hữu và thêm khóa BLS mới, cần vô hiệu hoá `--ecdsa` và `--network`.

```bash
polygon-edge secrets init --bls --ecdsa=false --network=false

[SECRETS INIT]
Public key (address) = 0x...
BLS Public key       = 0x...
Node ID              = 16...
```

### 3. Thêm thiết lập fork {#3-add-fork-setting}

Lệnh `ibft switch` thêm thiết lập fork, cho phép bật BLS trong chuỗi hiện hữu, thành `genesis.json`.

Đối với mạng PoA, các trình xác thực cần được cho sẵn trong lệnh. Giống như lệnh `genesis`, cờ `--ibft-validators-prefix-path`hoặc `--ibft-validator` có thể được sử dụng để chỉ định trình xác thực.

Chỉ định độ cao (số lượng khối) mà từ đó chuỗi bắt đầu sử dụng BLS với cờ `--from`.

```bash
polygon-edge ibft switch --chain ./genesis.json --type PoA --ibft-validator-type bls --ibft-validators-prefix-path test-chain- --from 100
```

### 4. Khởi động lại tất cả các nút {#4-restart-all-nodes}

Khởi động lại tất cả các nút bằng lệnh `server`. Sau khi khối ở `from` đã chỉ định trong bước trước được tạo, chuỗi sẽ bật BLS và hiển thị nhật ký như bên dưới:

```bash
2022-09-02T11:45:24.535+0300 [INFO]  polygon.ibft: IBFT validation type switched: old=ecdsa new=bls
```

Ngoài ra, các bản ghi cho thấy chế độ xác minh nào được sử dụng để tạo mỗi khối sau khi khối được tạo.

```
2022-09-02T11:45:28.728+0300 [INFO]  polygon.ibft: block committed: number=101 hash=0x5f33aa8cea4e849807ca5e350cb79f603a0d69a39f792e782f48d3ea57ac46ca validation_type=bls validators=3 committed=3
```

## Cách chuyển từ chuỗi ECDSA PoS hiện hữu sang chuỗi BLS PoS {#how-to-migrate-from-an-existing-ecdsa-pos-chain-to-a-bls-pos-chain}

Phần này mô tả cách sử dụng chế độ BLS trong chuỗi PoS hiện hữu. Các bước sau là bắt buộc để kích hoạt BLS trong chuỗi PoS.

1. Dừng tất cả các nút
2. Tạo khóa BLS cho các trình xác thực
3. Thêm cài đặt fork vào genesis.json
4. Gọi hợp đồng góp cổ phần để đăng ký Khóa công khai BLS
5. Khởi động lại tất cả các nút

### 1. Dừng tất cả các nút {#1-stop-all-nodes-1}

Chấm dứt tất cả các quy trình của các trình xác thực bằng cách nhấn Ctrl + c (Control + c). Vui lòng ghi nhớ chiều cao khối mới nhất (số thứ tự cao nhất trong nhật ký cam kết khối).

### 2. Tạo khóa BLS {#2-generate-the-bls-key-1}

`secrets init` với cờ `--bls` tạo khóa BLS. Để giữ ECDSA và Khóa mạng hiện hữu và thêm khóa BLS mới, cần phải vô hiệu hoá `--ecdsa` và `--network`.

```bash
polygon-edge secrets init --bls --ecdsa=false --network=false

[SECRETS INIT]
Public key (address) = 0x...
BLS Public key       = 0x...
Node ID              = 16...
```

### 3. Thêm thiết lập fork {#3-add-fork-setting-1}

Lệnh `ibft switch` thêm cài đặt fork, cho phép bật BLS từ giữa chuỗi, thành `genesis.json`.

Chỉ định độ cao (số lượng khối) mà từ đó chuỗi bắt đầu sử dụng chế độ BLS với cờ `from` và độ cao mà hợp đồng được cập nhật với cờ `development`.

```bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --ibft-validator-type bls --deployment 50 --from 200
```

### 4. Đăng ký Khóa công khai BLS trong hợp đồng góp cổ phần {#4-register-bls-public-key-in-staking-contract}

Sau khi fork được thêm vào và các trình xác thực được khởi động lại, mỗi trình xác nhận cần gọi `registerBLSPublicKey` trong hợp đồng góp cổ phần để đăng ký Khóa công khai BLS. Điều này phải được thực hiện sau khi chiều cao được chỉ định trong `--deployment` trước chiều cao được chỉ định trong `--from`.

Tập lệnh để đăng ký Khóa công khai BLS được định nghĩa trong [ Kho lưu trữ Hợp đồng thông minh góp cổ phần](https://github.com/0xPolygon/staking-contracts).

Thiết lập `BLS_PUBLIC_KEY` để được đăng ký vào tệp `.env`. Tham khảo mục [pos-stake-unake](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts) để biết thêm chi tiết về các thông số khác.

```env
JSONRPC_URL=http://localhost:10002
STAKING_CONTRACT_ADDRESS=0x0000000000000000000000000000000000001001
PRIVATE_KEYS=0x...
BLS_PUBLIC_KEY=0x...
```

Lệnh sau đăng ký Khóa công khai BLS đã cho trong `.env` với hợp đồng.

```bash
npm run register-blskey
```

:::warning Các trình xác thực cần đăng ký Khóa công khai BLS theo cách thủ công

Ở chế độ BLS, các trình xác thực phải có địa chỉ riêng và khóa công khai BLS. Lớp đồng thuận bỏ qua các trình xác thực chưa đăng ký khóa công khai BLS trong hợp đồng khi sự đồng thuận tìm nạp thông tin trình xác thực từ hợp đồng.
:::

### 5. Khởi động lại tất cả các nút {#5-restart-all-nodes}

Khởi động lại tất cả các nút bằng lệnh `server`. Chuỗi kích hoạt BLS sau khi khối tại `from` đã chỉ định trong bước trước được tạo.

---
id: pos-stake-unstake
title: Thiết lập và sử dụng Bằng chứng Cổ phần (Proof Stake - PoS)
description: "Góp cổ phần, hủy góp cổ phần và các hướng dẫn khác liên quan đến góp cổ phần."
keywords:
  - docs
  - polygon
  - edge
  - stake
  - unstake
  - validator
  - epoch
---

## Tổng quan {#overview}

Hướng dẫn này đi vào chi tiết về cách thiết lập mạng Bằng chứng Cổ phần với Polygon Edge, cách góp cổ phần cho các nút để trở thành các trình xác thực và cách huỷ góp các phần vốn góp.

Nó được **khuyến khích rất nhiều** khi đọc và xem qua [Thiết lập Cục bộ](/docs/edge/get-started/set-up-ibft-locally) / [Thiết lập Đám mây](/docs/edge/get-started/set-up-ibft-on-the-cloud), trước khi tiến hành theo hướng dẫn PoS này. Các phần này phác thảo các bước cần thiết để bắt đầu một cụm Bằng chứng Thẩm quyền (PoA) với Polygon Edge.

Hiện tại, không có giới hạn về số lượng người xác thực có thể góp vốn vào Hợp đồng Thông minh Góp cổ phần.

## Hợp đồng Thông minh Góp cổ phần {#staking-smart-contract}

Kho lưu trữ dành cho Hợp đồng Thông minh Góp cổ phần được đặt [tại đây](https://github.com/0xPolygon/staking-contracts).

Nó chứa các tập lệnh thử nghiệm cần thiết, các tệp ABI và quan trọng nhất là bản thân Hợp đồng Thông minh Góp cổ phần.

## Thiết lập một cụm nút N {#setting-up-an-n-node-cluster}

Thiết lập mạng với Polygon Edge được đề cập trong phần [Thiết lập Cục bộ](/docs/edge/get-started/set-up-ibft-locally) / [Thiết lập Đám mây](/docs/edge/get-started/set-up-ibft-on-the-cloud).

Sự **khác biệt duy nhất** giữa việc thiết lập một cụm PoS và PoA là ở phần tạo genesis.

**Khi tạo tệp genesis cho một cụm PoS, cần có cờ `--pos`** bổ sung:

```bash
polygon-edge genesis --pos ...
```

## Thiết lập độ dài của một epoch {#setting-the-length-of-an-epoch}

Epoch được đề cập chi tiết trong phần [Khối Epoch](/docs/edge/consensus/pos-concepts#epoch-blocks).

Để thiết lập kích thước của một epoch cho một cụm (trong các khối), khi tạo tệp genesis, một cờ bổ sung được chỉ định `--epoch-size`:

```bash
polygon-edge genesis --epoch-size 50
```

Giá trị này được chỉ định trong tệp genesis mà kích thước epoch phải là `50` khối.

Giá trị mặc định cho kích thước của một epoch (tính bằng khối) là `100000`.

:::info Giảm độ dài epoch

Như đã được nêu trong phần [Khối Epoch](/docs/edge/consensus/pos-concepts#epoch-blocks), các khối epoch được sử dụng để cập nhật các tập hợp trình xác thực cho các nút.

Độ dài epoch mặc định trong các khối (`100000`) có thể là một khoảng thời gian dài để chuẩn bị cho các bản cập nhật tập hợp trình xác thực. Cân nhắc rằng  các khối mới được thêm ~ 2 giây, sẽ mất ~ 55,5 giờ để tập hợp trình xác nhận có thể thay đổi.

Thiết lập giá trị thấp hơn cho độ dài epoch đảm bảo rằng tập hợp trình xác thực được cập nhật thường xuyên hơn.
:::

## Sử dụng tập lệnh Hợp đồng Thông minh Góp cổ phần {#using-the-staking-smart-contract-scripts}

### Điều kiện tiên quyết {#prerequisites}

Kho lưu trữ Hợp đồng Thông minh Góp cổ phần là một dự án Hardhat, cần có NPM.

Để khởi tạo một cách chính xác, trong thư mục chính, hãy chạy:

```bash
npm install
````

### Thiết lập các tập lệnh trình trợ giúp được cung cấp {#setting-up-the-provided-helper-scripts}

Các tập lệnh để tương tác với Hợp đồng Thông minh Góp cổ phần đã triển khai được đặt trong kho lưu trữ [Hợp đồng Thông minh Góp cổ phần](https://github.com/0xPolygon/staking-contracts).

Tạo tệp `.env` với các thông số sau trong vị trí kho lưu trữ Hợp đồng Thông Minh:

```bash
JSONRPC_URL=http://localhost:10002
PRIVATE_KEYS=0x0454f3ec51e7d6971fc345998bb2ba483a8d9d30d46ad890434e6f88ecb97544
STAKING_CONTRACT_ADDRESS=0x0000000000000000000000000000000000001001
BLS_PUBLIC_KEY=0xa..
```

Trong đó các thông số là:

* **JSONRPC_URL** - điểm cuối JSON-RPC dành cho nút đang chạy
* **PRIVATE_KEYS** - khóa riêng tư của địa chỉ người góp cổ phần.
* **STAKING_CONTRACT_ADDRESS** - địa chỉ của hợp đồng thông minh góp cổ phần ( mặc định `0x0000000000000000000000000000000000001001`)
* **BLS_PUBLIC_KEY** - Khóa công khai BLS của người góp cổ phần. Chỉ cần thiết nếu mạng đang chạy với BLS

### Số tiền góp cổ phần {#staking-funds}

:::info Địa chỉ góp cổ phần

Hợp đồng Thông minh Góp cổ phần được triển khai trước tại địa chỉ `0x0000000000000000000000000000000000001001`.

Bất kỳ loại tương tác nào với cơ chế góp cổ phần đều được thực hiện thông qua Hợp đồng Thông minh Góp cổ phần tại địa chỉ được chỉ định.

Để tìm hiểu thêm về Hợp đồng Thông minh Góp cổ phần, vui lòng xem phần **[Hợp đồng Thông minh Smart Smart](/docs/edge/consensus/pos-concepts#contract-pre-deployment)** .
:::

Để trở thành một phần của tập hợp trình xác thực, một địa chỉ cần góp vào một số tiền nhất định trên ngưỡng yêu cầu.

Hiện tại, ngưỡng mặc định để trở thành một phần của tập hợp trình xác thực là `1 ETH`.

Việc góp cổ phần có thể được bắt đầu bằng cách gọi phương thức `stake` của Hợp đồng Thông minh Góp cổ phần và chỉ định một giá trị `>= 1 ETH`.

Sau khi tệp `.env` được đề cập trong [phần trước](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts) đã được thiết lập và một chuỗi đã được bắt đầu ở chế độ PoS, việc góp cổ phần có thể được thực hiện bằng lệnh sau trong kho lưu trữ Hợp đồng Thông minh Góp cổ phần:

```bash
npm run stake
```

Tập lệnh Hardhat `stake` góp vào một lượng `1 ETH` mặc định, có thể được thay đổi bằng cách sửa đổi tệp `scripts/stake.ts`.

Nếu số tiền đang được góp vào là `>= 1 ETH`, trình xác thực được đặt trên Hợp đồng Thông minh Góp cổ phần sẽ được cập nhật và địa chỉ sẽ là một phần của tập hợp trình xác thực bắt đầu từ epoch tiếp theo.

:::info Đăng ký khóa BLS

Nếu mạng đang chạy ở chế độ BLS, để các nút trở thành trình xác thực, họ cần đăng ký khóa công khai BLS của mình sau khi góp cổ phần

Việc này có thể được thực hiện bằng lệnh sau:

```bash
npm run register-blskey
```
:::

### Huỷ góp cổ phần {#unstaking-funds}

Các địa chỉ đã góp cổ phần **chỉ có thể rút tất cả số tiền đã góp** của họ cùng một lúc.

Sau khi tệp `.env` được đề cập trong [phần trước](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts) đã được thiết lập và một chuỗi đã được bắt đầu ở chế độ PoS, việc hủy góp cổ phần có thể thực hiện bằng lệnh sau trong Kho lưu trữ Hợp đồng Thông minh Góp cổ phần:

```bash
npm run unstake
```

### Tìm nạp danh sách những người góp cổ phần {#fetching-the-list-of-stakers}

Tất cả các địa chỉ góp cổ phần sẽ được lưu vào Hợp đồng Thông minh Góp Cổ phần.

Sau khi tệp `.env` được đề cập trong [phần trước](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts) đã được thiết lập và một chuỗi đã được bắt đầu ở chế độ PoS, việc tìm nạp danh sách trình xác thực có thể được thực hiện bằng lệnh sau trong kho Hợp đồng Thông minh Góp cổ phần:

```bash
npm run info
```

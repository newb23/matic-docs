---
id: pos-concepts
title: Bằng chứng Cổ phần
description: "Giải thích và hướng dẫn liên quan đến Bằng chứng Cổ phần."
keywords:
  - docs
  - polygon
  - edge
  - PoS
  - stake
---

## Tổng quan {#overview}

Phần này nhằm mục đích cung cấp cái nhìn tổng quan hơn về một số khái niệm hiện có trong Bằng chứng Cổ phần (PoS) triển khai Polygon Edge.

Triển khai Polygon Edge Proof of Stake (PoS) có nghĩa là một sự thay thế cho việc triển khai PoA IBFT hiện có, mang lại cho trình vận hành nút khả năng dễ dàng lựa chọn giữa hai cách khi bắt đầu một chuỗi.

## Tính năng PoS {#pos-features}

Logic cốt lõi đằng sau việc triển khai Bằng chứng Cổ phần nằm trong **[Hợp đồng Thông minh Smart](https://github.com/0xPolygon/staking-contracts/blob/main/contracts/Staking.sol)**.

Hợp đồng này được triển khai trước bất cứ khi nào chuỗi Polygon Edge theo cơ chế PoS được khởi tạo và có sẵn trên địa chỉ
`0x0000000000000000000000000000000000001001` từ khối `0`.

### Epoch {#epochs}

Epoch là một khái niệm được giới thiệu kèm việc bổ sung PoS vào Polygon Edge.

Epoch được coi là một khung thời gian đặc biệt (theo khối) trong đó một tập hợp các trình xác thực nhất định có thể tạo ra các khối. Độ dài của chúng có thể thay đổi được, nghĩa là các nhà vận hành nút có thể định cấu hình độ dài của một epoch trong quá trình tạo genesis.

Ở cuối mỗi epoch, một _khối epoch_ được tạo và sau sự kiện đó, epoch mới bắt đầu. Để tìm hiểu thêm về khối epoch, hãy xem phần [Khối Epoch](/docs/edge/consensus/pos-concepts#epoch-blocks).

Các tập hợp trình xác thực được cập nhật ở cuối mỗi epoch. Các nút truy vấn tập hợp trình xác thực từ Hợp đồng Thông minh Góp cổ phần trong quá trình tạo khối epoch và lưu dữ liệu thu được vào bộ nhớ cục bộ. Chu kỳ truy vấn và lưu này được lặp lại vào cuối mỗi epoch.

Về cơ bản, nó đảm bảo rằng Hợp đồng Thông minh Góp cổ phần có toàn quyền kiểm soát các địa chỉ trong tập hợp trình xác thực và để các nút chỉ có 1 trách nhiệm - truy vấn hợp đồng một lần trong suốt thời gian epoch tìm nạp thông tin tập hợp trình xác thực mới nhất. Điều này làm giảm bớt trách nhiệm từ các nút riêng lẻ khỏi việc chăm sóc các tập hợp trình xác thực.

### Góp cổ phần {#staking}

Các địa chỉ có thể góp tiền vào Hợp đồng Thông minh Góp cổ phần bằng cách gọi phương thức `stake` và bằng cách chỉ định giá trị cho số tiền góp cổ phần trong giao dịch:

````js
const StakingContractFactory = await ethers.getContractFactory("Staking");
let stakingContract = await StakingContractFactory.attach(STAKING_CONTRACT_ADDRESS)
as
Staking;
stakingContract = stakingContract.connect(account);

const tx = await stakingContract.stake({value: STAKE_AMOUNT})
````

Bằng cách góp tiền vào Hợp đồng Thông minh Góp cổ phần, các địa chỉ có thể tham gia tập hợp trình xác thực và do đó có thể tham gia vào quy trình sản xuất khối.

:::info Ngưỡng góp cổ phần

Hiện tại, ngưỡng tối thiểu để gia nhập tập hợp trình xác thực là góp cổ phần `1 ETH`
:::

### Huỷ góp cổ phần {#unstaking}

Các địa chỉ đã góp tiền chỉ có thể **hủy góp cùng một lúc tất cả số tiền đã góp vào của họ**.

Có thể hủy việc góp cổ phần bằng cách gọi phương thức `unstake` trong Hợp đồng Thông minh Góp cổ phần:

````js
const StakingContractFactory = await ethers.getContractFactory("Staking");
let stakingContract = await StakingContractFactory.attach(STAKING_CONTRACT_ADDRESS)
as
Staking;
stakingContract = stakingContract.connect(account);

const tx = await stakingContract.unstake()
````

Sau khi huỷ góp số tiền của mình, các địa chỉ sẽ bị xóa khỏi tập hợp trình xác thực trên Hợp đồng Thông minh Góp cổ phần và sẽ không được coi là trình xác thực trong epoch tiếp theo.

## Khối Epoch {#epoch-blocks}

**Khối Epoch** là một khái niệm được giới thiệu trong quá trình triển khai PoS của IBFT trong Polygon Edge.

Về cơ bản, các khối epoch là các khối đặc biệt **không chứa giao dịch** và chỉ phát sinh ở **cuối một epoch**. Ví dụ, **nếu kích thước epoch** được thiết lập thành khối `50`thì khối epoch sẽ được xem là khối `50``100``150`và như vậy.

Chúng được sử dụng để thực hiện logic bổ sung không nên xảy ra trong quá trình sản xuất khối thông thường.

Quan trọng nhất, chúng là dấu hiệu cho nút thấy **nút cần tìm nạp thông tin tập hợp trình xác thực mới nhất** từ Hợp đồng Thông minh Góp cổ phần.

Sau khi cập nhật tập hợp trình xác thực tại khối epoch, tập hợp trình xác thực (có thể thay đổi hoặc không thay đổi) được sử dụng cho các khối `epochSize - 1` tiếp theo, cho đến khi nó được cập nhật lại bằng cách lấy thông tin mới nhất từ Hợp đồng Thông minh Góp cổ phần.

Độ dài epoch (theo khối) có thể sửa đổi được khi tạo tệp genesis, bằng cách sử dụng cờ đặc biệt `--epoch-size`:

```bash
polygon-edge genesis --epoch-size 50 ...
```

Kích thước mặc định của một epoch là `100000` khối trong Polygon Edge.

## Trước khi triển khai hợp đồng {#contract-pre-deployment}

Polygon Edge _trước khi triển khai_ [Hợp đồng Thông minh Góp cổ phần](https://github.com/0xPolygon/staking-contracts/blob/main/contracts/Staking.sol) trong quá trình **khởi tạo genesis** tới địa chỉ `0x0000000000000000000000000000000000001001`.

Có thể làm như vậy mà không cần chạy EVM, bằng cách sửa đổi trực tiếp trạng thái blockchain của Hợp đồng Thông minh, sử dụng các giá trị cấu hình được chuyển vào lệnh genesis.

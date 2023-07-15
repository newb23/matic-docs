---
id: manage-private-keys
title: Quản lý khóa riêng tư
description: "Cách quản lý khóa riêng tư và phân loại khóa.\n"
keywords:
  - docs
  - polygon
  - edge
  - private
  - key
  - keystore
---

## Tổng quan {#overview}

Polygon Edge có hai loại khóa riêng tư mà nó trực tiếp quản lý:


* **Khóa riêng tư sử dụng cho cơ chế đồng đồng thuận**
* **Khóa riêng tư dùng để kết nối mạng của libp2p**
* **(Không bắt buộc) Khóa riêng tư BLS sử dụng trong cơ chế đồng thuận để tổng hợp chữ ký của trình xác thực**

Hiện tại, Polygon Edge không hỗ trợ quản lý tài khoản trực tiếp.

Dựa trên cấu trúc thư mục được nêu trong [Hướng dẫn Phục hồi và Lưu trữ](/docs/edge/working-with-node/backup-restore)
,
 Polygon Edge lưu trữ các tệp khóa này trong hai thư mục riêng biệt - **đồng thuận** và **kho khóa**.


## Định dạng khóa {#key-format}

Các khóa riêng tư được lưu trữ ở **định dạng Base64** đơn giản, vì vậy người dùng có thể đọc được và có thể chuyển được.


```bash
# Example private key
0802122068a1bdb1c8af5333e58fe586bc0e9fc7aff882da82affb678aef5d9a2b9100c0
```

:::info Loại khóa
Tất cả các tệp khóa riêng tư được tạo và sử dụng trong Polygon Edge đều dựa trên ECDSA và curve [secp256k1](https://en.bitcoin.it/wiki/Secp256k1).


Vì curve không được chuẩn hóa, nên không thể được mã hóa và lưu trữ ở bất kỳ định dạng PEM tiêu chuẩn nào.
 Không hỗ trợ việc nhập khóa không phù hợp với loại khóa này.

:::
## Khóa riêng tư đồng thuận {#consensus-private-key}

Tệp khóa riêng tư được gọi là *khóa riêng tư đồng đồng thuận* còn được gọi là **khóa riêng tư xác thực**. Khóa riêng tư này được sử dụng khi nút đóng vai trò trình xác thực trong mạng lưới và cần ký dữ liệu mới.

Tệp khóa riêng tư nằm trong `consensus/validator.key` và tuân thủ theo [định dạng khóa](/docs/edge/configuration/manage-private-keys#key-format) đã đề cập.

:::warning
Khóa riêng tư trình xác thực là duy nhất với mỗi nút trình xác thực.
 Khóa sẽ <b>không</b> được chia sẻ cho tất cả các trình xác thực, vì điều này có thể ảnh hưởng đến tính bảo mật của chuỗi.

:::

## Khóa riêng tư kết nối mạng {#networking-private-key}

Tệp khóa riêng tư kết nối mạng đã đề cập được libp2p sử dụng để tạo PeerID tương ứng, cho phép nút tham gia vào mạng lưới.


Tệp nằm trong `keystore/libp2p.key` và tuân thủ theo [định dạng khóa](/docs/edge/configuration/manage-private-keys#key-format) đã đề cập.

## Khóa bí mật BLS {#bls-secret-key}

Tệp tin khóa bí mật BLS được sử dụng để tổng hợp dấu đồng thuận với lớp đồng thuận. Kích thước của các dấu cam kết được tổng hợp bằng BLS nhỏ hơn chữ ký ECDSA đã cam kết tuần tự.


Tính năng BLS là không bắt buộc và bạn có thể chọn sử dụng BLS hoặc không.
 Xem thêm [BLS](/docs/edge/consensus/bls) để biết thêm chi tiết.

## Nhập / Xuất {#import-export}

Vì các tệp khóa được lưu trữ ở định dạng Base64 đơn giản trên đĩa, chúng có thể được sao lưu hoặc nhập dễ dàng.


:::caution Thay đổi tệp khóa
Bất kỳ thay đổi nào được thực hiện đối với các tệp khóa trên một mạng lưới đã thiết lập/chạy đều có thể dẫn đến gián đoạn mạng lưới/đồng thuận nghiêm trọng, vì cơ chế đồng thuận và cơ chế khám phá ngang hàng đều lưu trữ dữ liệu thu được từ các khóa này trong bộ nhớ dành riêng cho từng nút, cũng như sử dụng dữ liệu này để
 khởi tạo kết nối và thực hiện logic đồng thuận

:::
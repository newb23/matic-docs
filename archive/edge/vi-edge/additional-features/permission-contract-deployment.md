---
id: permission-contract-deployment
title: Quyền triển khai hợp đồng thông minh

description: Cách thêm quyền triển khai hợp đồng thông minh.

keywords:
  - docs
  - polygon
  - edge
  - smart contract
  - permission
  - deployment
---

## Tổng quan {#overview}

Hướng dẫn này đi vào chi tiết về cách lập danh sách trắng cho các địa chỉ có thể triển khai hợp đồng thông minh.
 Đôi khi các trình vận hành mạng sẽ ngăn người dùng triển khai các hợp đồng thông minh nếu không liên quan đến mục đích của mạng.
 Trình vận hành mạng có thể:

1. Đưa các địa chỉ vào danh sách trắng để triển khai Hợp đồng thông minh

2. Xóa địa chỉ khỏi danh sách trắng triển khai Hợp đồng thông minh


## Trình soạn tin Video {#video-presentation}

[![Việc triển khai hợp đồng cho phép - video](https://img.youtube.com/vi/yPOkINpf7hg/0.jpg)](https://www.youtube.com/watch?v=yPOkINpf7hg)

## Cách sử dụng? {#how-to-use-it}


Bạn có thể tìm thấy tất cả các lệnh cli liên quan đến danh sách trắng triển khai trong trang [Lệnh CLI](/docs/edge/get-started/cli-commands#whitelist-commands).

* `whitelist show`: Hiển thị thông tin danh sách trắng
* `whitelist deployment --add`: Thêm một địa chỉ mới vào danh sách trắng triển khai hợp đồng
* `whitelist deployment --remove`: Xóa một địa chỉ mới khỏi danh sách trắng triển khai hợp đồng

#### Hiển thị tất cả các địa chỉ trong danh sách trắng triển khai {#show-all-addresses-in-the-deployment-whitelist}

Có 2 cách để tìm địa chỉ trong danh sách trắng triển khai.
1. Tìm trong `genesis.json`, nơi lưu danh sách trắng
2. Triển khai `whitelist show`, giúp in thông tin của tất cả các danh sách trắng được Polygon Edge hỗ trợ


```bash

./polygon-edge whitelist show

[WHITELISTS]

Contract deployment whitelist : [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d],


```

#### Thêm địa chỉ vào danh sách trắng triển khai {#add-an-address-to-the-deployment-whitelist}

Để thêm một địa chỉ mới vào danh sách trắng triển khai, thực thi lệnh CLI `whitelist deployment --add [ADDRESS]`. Số lượng địa chỉ trong danh sách trắng là không giới hạn. Chỉ có địa chỉ nằm trong danh sách trắng triển khai hợp đồng mới có thể triển khai hợp đồng.
 Nếu danh sách trắng trống, bất kỳ địa chỉ nào cũng có thể thực hiện quá trình triển khai


```bash

./polygon-edge whitelist deployment --add 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d --add 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF


[CONTRACT DEPLOYMENT WHITELIST]

Added addresses: [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],
Contract deployment whitelist : [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],



```

#### Xóa một địa chỉ khỏi danh sách trắng triển khai
 {#remove-an-address-from-the-deployment-whitelist}

Để xóa bỏ địa chỉ khỏi danh sách trắng triển khai, thực thi lệnh CLI `whitelist deployment --remove [ADDRESS]`. Chỉ có địa chỉ nằm trong danh sách trắng triển khai hợp đồng mới có thể triển khai hợp đồng.
 Nếu danh sách trắng trống, bất kỳ địa chỉ nào cũng có thể thực hiện quá trình triển khai


```bash

./polygon-edge whitelist deployment --remove 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d --remove 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF


[CONTRACT DEPLOYMENT WHITELIST]

Removed addresses: [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],
Contract deployment whitelist : [],



```

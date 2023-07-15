---
id: gas
title: Hỏi đáp về Gas
description: "Hỏi đáp về Gas trong Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - FAQ
  - validators

---

## Cách thức để thực thi giá gas tối thiểu? {#how-to-enforce-a-minimum-gas-price}
Bạn có thể sử dụng cờ `--price-limit` được cung cấp trên lệnh máy chủ. Điều này sẽ buộc nút của bạn chỉ chấp nhận các giao dịch có gas cao hơn hoặc bằng giới hạn giá mà bạn đã thiết lập. Để đảm bảo nó được thực thi trên toàn bộ mạng, bạn cần đảm bảo tất cả các nút có cùng giới hạn giá.


## Bạn có thể có các giao dịch với phí gas bằng 0 không? {#can-you-have-transactions-with-0-gas-fees}
Vâng, bạn có thể. Giới hạn giá mặc định mà các nút cần để thực thi là `0`, điều này có nghĩa là các nút sẽ chấp nhận các giao dịch có giá gas được đặt là `0`.

## Cách thức để đặt tổng cung cho token gas(native)? {#how-to-set-the-gas-native-token-total-supply}

Bạn có thể thiết lập số dư định trước cho các tài khoản (địa chỉ) bằng cách sử dụng `--premine flag`. Xin lưu ý rằng đây là cấu hình từ tệp genesis và không thể thay đổi về sau.

Ví dụ về cách sử dụng `--premine flag`:

`--premine=0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000`

Điều này thiết lập số dư 1000 ETH định trước thành 0x3956E90e632AEbBF34DEB49b71c28A83Bc029862 (số lượng trong đối số tính bằng wei).

Số tiền định trước của token gas sẽ là tổng nguồn cung. Không có số lượng tiền bản địa nào khác (gas token) có thể được mint sau này.

## Edge có hỗ trợ ERC-20 như một gas token không? {#does-edge-support-erc-20-as-a-gas-token}

Edge không hỗ trợ token ERC-20 làm gas token. Chỉ có đơn vị tiền tệ Edge gốc mới được hỗ trợ cho gas.

## Làm thế nào để tăng giới hạn gas ? {#how-to-increase-the-gas-limit}

Có hai lựa chọn để tăng giới hạn gas trong Polygon Edge:
1. Việc quét chuỗi và tăng lên `block-gas-limit`giá trị uint64 trong tệp tin genesis
2. Sử `--block-gas-target`dụng cờ với giá trị cao để tăng giới hạn gas của tất cả các nút. Điều này đòi hỏi sự khởi động lại nút Giải thích chi tiết [ở đây](/docs/edge/architecture/modules/txpool/#block-gas-target).
---
id: overview
title: Tổng quan
description: "Giới thiệu về thử nghiệm Polygon Edge.\n"
keywords:
  - docs
  - polygon
  - edge
  - performance
  - tests
  - loadbot
---
:::caution
Vui lòng lưu ý rằng `loadbot`chúng tôi đã sử dụng để thực hiện các thử nghiệm này, hiện đang bị giảm giá.
:::

| Loại | Giá trị | Liên kết tới thử nghiệm
 |
| ---- | ----- | ------------ |
| Giao dịch thông thường | 1428 tps | [Ngày 04/07/2022](test-history/test-2022-07-04.md#results-of-eoa-to-eoa-transfers) |
| Giao dịch ERC-20 | 1111 tps | [Ngày 04/07/2022](test-history/test-2022-07-04.md#results-of-erc20-token-transfers) |
| Đúc NFT (NFT Minting) | 714 tps | [Ngày 04/07/2022](test-history/test-2022-07-04.md#results-of-erc721-token-minting) |

---

Mục tiêu của chúng tôi là tạo ra một phần mềm ứng dụng khách blockchain hiệu suất cao, giàu tính năng và dễ dàng thiết lập và bảo trì.
 Tất cả các thử nghiệm đều được thực hiện bằng Loadbot của Polygon Edge. Mọi báo cáo hiệu suất bạn tìm thấy trong phần này đều được ghi chép theo đúng ngày tháng, mô tả môi trường rõ ràng và giải thích cụ thể về phương pháp thử nghiệm.


Mục tiêu của các bài kiểm tra hiệu suất này là để thể hiện hiệu suất thực tế của mạng blockchain Polygon Edge.
 Bất kỳ ai cũng có thể nhận được kết quả tương tự như kết quả đăng tải tại đây, với điều kiện sử dụng cùng môi trường và cùng loadbot của chúng tôi.


Tất cả các thử nghiệm hiệu suất đều được thực hiện trên nền tảng AWS bằng một chuỗi chứa các nút EC2.

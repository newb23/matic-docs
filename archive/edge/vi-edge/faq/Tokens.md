---
id: tokens
title: Hỏi đáp về token
description: "Hỏi đáp về token Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - FAQ
  - tokens
---

## Polygon Edge có hỗ trợ EIP-1559 không? {#does-polygon-edge-support-eip-1559}
Hiện tại, Polygon Edge không hỗ trợ EIP-1559.

## Làm thế nào để thiết lập ký hiệu tiền tệ (token)? {#how-to-set-the-currency-token-symbol}

Biểu tượng token chỉ là một giao diện người dùng, vì vậy nó không thể được định cấu hình hoặc mã hóa cứng ở bất kỳ đâu trong mạng.
Nhưng bạn có thể thay đổi nó khi thêm mạng vào ví, chẳng hạn như Metamask.

## Điều gì sẽ xảy ra với giao dịch khi một hời dây chuyền? {#what-happens-to-transactions-when-a-chain-halts}

Tất cả các giao dịch chưa được xử lý đều nằm trong TxPool(có vẻ là hàng đợi hoặc hàng đợi thăng chức). Nếu chuỗi halts(tất cả blocks production), các giao dịch này sẽ không bao giờ bị kẹt.<br/> Đây không chỉ là trường hợp khi các hời dây chuyền. Nếu các nút bị dừng hoặc khởi động, tất cả các giao dịch chưa thực hiện, và vẫn đang ở TxPool, sẽ im lặng được gỡ bỏ.<br/> Tương tự sẽ xảy ra với giao dịch khi thay đổi đột phá được giới thiệu, vì nó được yêu cầu để các nút được khởi động.

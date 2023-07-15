---
id: types
title: Loại
description: Giải thích dành cho các loại mô-đun của Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - types
  - marshaling
---

## Tổng quan {#overview}

Mô-đun **Loại** thực hiện các kiểu đối tượng cốt lõi, chẳng hạn như:

* **Địa chỉ**
* **Hàm băm**
* **Tiêu đề**
* Rất nhiều chức năng của trình trợ giúp

## Mã hoá / Giải mã RLP {#rlp-encoding-decoding}

Không giống như các ứng dụng khách như GETH, Polygon Edge không sử dụng tính năng phản chiếu cho mã hóa.<br /> Ưu tiên không sử dụng tính năng phản chiếu vì nó tạo ra các sự cố mới, chẳng hạn như suy giảm hiệu suất và khó mở rộng quy mô hơn.

Mô-đun **Loại** cung cấp giao diện dễ sử dụng để marshaling (quá trình chuyển đổi các đối tượng thành chuỗi hoặc dữ liệu) và unmarshalling (quá trình chuyển đổi các chuỗi hoặc dữ liệu thành đối tượng) RLP, bằng cách sử dụng gói FastRLP.

Marshaling (quá trình chuyển đổi các đối tượng thành chuỗi hoặc dữ liệu) được thực hiện thông qua các phương pháp *MarshalRLPWith* và *MarshalRLPTo*. Phương pháp tương tự tồn tại cho unmarshalling (quá trình chuyển đổi các chuỗi hoặc dữ liệu thành các đối tượng).

Bằng cách xác định thủ công các phương pháp này, Polygon Edge không cần sử dụng tính năng phản xạ. Trong *rlp_marshal.go*, bạn có thể tìm thấy
phương pháp cho việc chuyển đổi marshaling:

* **Thân**
* **Khối**
* **Tiêu đề**
* **Biên nhận**
* **Nhật ký**
* **Giao dịch**
---
id: syncer
title: Trình đồng bộ
description: Giải thích dành cho mô-đun trình đồng bộ của Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - synchronization
---

## Tổng quan {#overview}

Mô-đun này chứa logic cho giao thức đồng bộ hóa. Nó được sử dụng để đồng bộ một nút mới với mạng đang chạy, hoặc xác thực/chèn các khối mới cho các nút không tham gia vào sự đồng thuận (không có trình xác thực).

Polygon Edge sử dụng **libp2p** làm lớp mạng và trên đó chạy **gRPC**.

Về cơ bản có 2 kiểu đồng bộ trong Polygon Edge:
* Bulk Sync  - đồng bộ một loạt các khối cùng một lúc
* Watch Sync - đồng bộ trên cơ sở mỗi khối

### Bulk Sync {#bulk-sync}

Các bước cho quá trình Đồng bộ hàng loạt (Bulk Syncing) khá đơn giản để đáp ứng mục tiêu của Bulk Sync - đồng bộ càng nhiều khối càng tốt (có sẵn) từ máy ngang hàng khác để bắt kịp càng nhanh càng tốt.

Dưới đây là luồng công việc của quy trình Bulk Sync:

1. ** Xác định xem nút có cần Bulk Sync không ** - Trong bước này, nút kiểm tra bản đồ ngang hàng để xem có ai có số lượng khối lớn hơn số lượng khối cục bộ của nút không
2. ** Tìm máy ngang hàng tốt nhất (sử dụng bản đồ máy ngang hàng đồng bộ) ** - Trong bước này, nút tìm máy ngang hàng tốt nhất để đồng bộ theo các tiêu chí được đề cập trong ví dụ trên.
3. ** Mở luồng đồng bộ hàng loạt ** - Trong bước này, nút mở một luồng gRPC cho máy ngang hàng tốt nhất để đồng bộ hàng loạt các khối từ số khối chung
4. ** Máy ngang hàng tốt nhất đóng luồng khi hoàn tất gửi hàng loạt ** - Trong bước này, máy ngang hàng tốt nhất mà nút đang đồng bộ sẽ đóng luồng ngay sau khi gửi tất cả các khối khả dụng mà nó có
5. ** Khi hoàn tất quá trình đồng bộ hàng loạt, hãy kiểm tra xem nút có phải là trình xác thực không ** - Trong bước này, luồng được đóng bằng máy ngang hàng tốt nhất và nút cần kiểm tra xem chúng có phải là trình xác thực sau khi đồng bộ hàng loạt hay không.
  * Nếu đúng như vậy, chúng sẽ nhảy ra khỏi trạng thái đồng bộ và bắt đầu tham gia vào quá trình đồng thuận
  * Nếu không, chúng sẽ tiếp tục với ** Watch Sync **

### Watch Sync {#watch-sync}

:::info

Bước cho Đồng bộ trên cơ sở mỗi khối (Watch Syncing) chỉ được thực thi nếu nút không phải là trình xác thực, mà là nút không cần xác thực thông thường trong mạng và chỉ lắng nghe các khối đang đến.
:::

Hoạt động của Watch Sync khá đơn giản, nút đã được đồng bộ với phần còn lại của mạng và chỉ cần phân tích cú pháp các khối mới sắp xuất hiện.

Đây là luồng công việc của quy trình Watch Sync:

1. ** Thêm một khối mới khi trạng thái của máy ngang hàng được cập nhật ** - Trong bước này, các nút lắng nghe các sự kiện khối mới, khi có một khối mới, nó sẽ chạy một lệnh gọi hàm gRPC, lấy khối và cập nhật trạng thái cục bộ.
2. ** Kiểm tra xem nút có phải là trình xác thực hay không sau khi đồng bộ khối mới nhất **
   * Nếu đúng như vậy, hãy ra khỏi trạng thái đồng bộ
   * Nếu không thì vẫn tiếp tục nghe các sự kiện khối mới

## Báo cáo hiệu suất {#perfomance-report}

:::info

Hiệu suất được đo trên một máy cục bộ bằng cách đồng bộ ** triệu khối **

:::

| Tên | Kết quả |
|----------------------|----------------|
| Đồng bộ 1M khối | ~ 25 phút |
| Chuyển 1M khối | ~ 1 phút |
| Số lượng lệnh gọi GRPC | 2 |
| Phạm vi thử nghiệm | ~ 93% |
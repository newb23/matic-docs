---
id: query-operator-info
title: Truy vấn thông tin trình vận hành

description: "Cách truy vấn thông tin trình vận hành."
keywords:
  - docs
  - polygon
  - edge
  - node
  - query
  - operator
---

## Điều kiện tiên quyết {#prerequisites}

Hướng dẫn này giả định rằng bạn đã làm theo hướng dẫn [Cài đặt cục bộ](/docs/edge/get-started/set-up-ibft-locally) hoặc [cách thiết lập cụm IBFT trên đám mây](/docs/edge/get-started/set-up-ibft-on-the-cloud).


Cần có một nút hoạt động để truy vấn bất kỳ loại thông tin của trình vận hành nào.


Với Polygon Edge, các trình vận hành nút có quyền kiểm soát và nắm thông tin về những gì nút đang thực hiện.<br /> Bất cứ lúc nào, chúng cũng có thể sử dụng lớp thông tin nút được phát triển trên gRPC và nhận thông tin có nghĩa - mà không cần sàng lọc bản ghi.


:::note

Nếu nút của bạn không chạy trên `127.0.0.1:8545`, bạn nên thêm cờ `--grpc-address <address:port>` vào các lệnh được liệt kê trong tài liệu này.


:::

## Thông tin máy ngang hàng
 {#peer-information}

### Danh sách máy ngang hàng {#peers-list}

Để nhận danh sách đầy đủ các máy ngang hàng đang được kết nối (bao gồm cả nút đang chạy), hãy chạy lệnh sau:

````bash
polygon-edge peers list
````

Thao tác này sẽ trả về danh sách các địa chỉ libp2p hiện là máy ngang hàng của máy khách đang chạy.


### Trạng thái máy ngang hàng {#peer-status}

Để xem trạng thái của một máy ngang hàng cụ thể, hãy chạy:

````bash
polygon-edge peers status --peer-id <address>
````
Với tham số *địa chỉ* là địa chỉ libp2p của máy ngang hàng.


## Thông tin IBFT {#ibft-info}

Trong nhiều trường hợp, một trình vận hành sẽ muốn biết về trạng thái của nút hoạt động theo đồng thuận IBFT.


Thật may, Polygon Edge cung cấp cách thức dễ dàng để tìm thông tin này.


### Snapshot {#snapshots}

Chạy lệnh sau sẽ trả về snapshot mới nhất.

````bash
polygon-edge ibft snapshot
````
Để truy vấn snapshot tại một số lượng khối cụ thể (số khối), trình vận hành có thể chạy:

````bash
polygon-edge ibft snapshot --num <block-number>
````

### Ứng cử viên
 {#candidates}

Để nhận thông tin mới nhất về các ứng cử viên, trình vận hành có thể chạy:

````bash
polygon-edge ibft candidates
````
Lệnh này truy vấn nhóm ứng cử viên được đề xuất hiện tại, cũng như các ứng cử viên chưa được đưa vào

### Trạng thái {#status}

Lệnh sau trả về các khóa của trình xác thực hiện tại của máy khách IBFT đang hoạt động:

````bash
polygon-edge ibft status
````

## Nhóm giao dịch
 {#transaction-pool}

Để tìm số lượng giao dịch hiện tại trong nhóm giao dịch, trình vận hành có thể chạy:

````bash
polygon-edge txpool status
````

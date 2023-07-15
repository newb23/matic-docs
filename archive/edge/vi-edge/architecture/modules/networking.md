---
id: networking
title: Kết nối mạng
description: Giải thích về mô-đun kết nối mạng của Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - networking
  - libp2p
  - GRPC
---

## Tổng quan {#overview}

Một nút thường phải giao tiếp với các nút khác trên mạng lưới để trao đổi thông tin hữu ích.<br />
 Để thực hiện nhiệm vụ này, Polygon Edge sử dụng khung **libp2p**, vốn đã được sử dụng rộng rãi.

Lựa chọn sử dụng **libp2p** chủ yếu là vì:

* **Tốc độ** - libp2p cải tiến đáng kể về hiệu suất so với devp2p (được sử dụng trong GETH và các máy khách khác)
* **Khả năng mở rộng** - đây là nền tảng tuyệt vời dành cho các tính năng khác của hệ thống

* **Đặc tính mô-đun** - libp2p bản chất là một mô-đun, giống như Polygon Edge. Điều này mang lại tính linh hoạt cao hơn, đặc biệt khi các phần của Polygon Edge cần được hoán đổi


## GRPC {#grpc}

Ngoài **libp2p**, Polygon Edge còn sử dụng giao thức **GRPC**.<br />
 Về mặt kỹ thuật, Polygon Edge sử dụng nhiều giao thức GRPC, sẽ được đề cập thêm ở phần sau.


Lớp GRPC giúp tóm tắt tất cả các giao thức yêu cầu/phản hồi và đơn giản hóa các giao thức phát trực tuyến cần thiết để Polygon Edge hoạt động.


GRPC sử dụng **Bộ đệm giao thức** để xác định các *dịch vụ* và *cấu trúc thông điệp*.<br /> Các dịch vụ và cấu trúc được định nghĩa trong tệp *.proto*, được biên dịch và là ngôn ngữ bất khả tri.


Ở phần trên, chúng ta đã đề cập rằng Polygon Edge tận dụng một số giao thức GRPC.<br />
 Việc này được thực hiện để tăng tốc UX tổng thể dành cho trình vận hành nút, một khía cạnh thường bị các máy khách như GETH và Parity xem nhẹ.


Trình vận hành nút sẽ có cái nhìn tổng quan tốt hơn về những hoạt động đang diễn ra trong hệ thống nhờ gọi dịch vụ GRPC thay vì sàng lọc các nhật ký để tìm thông tin cần thiết.


### GRPC dành cho các trình vận hành nút
 {#grpc-for-node-operators}

Phần tiếp theo sẽ tương đối quen thuộc vì đã được trình bày qua trong phần [Lệnh CLI](/docs/edge/get-started/cli-commands).


Dịch vụ GRPC sẽ được sử dụng bởi **trình vận hành nút** được xác định như sau:

````go title="minimal/proto/system.proto"
service System {
    // GetInfo returns info about the client
    rpc GetStatus(google.protobuf.Empty) returns (ServerStatus);

    // PeersAdd adds a new peer
    rpc PeersAdd(PeersAddRequest) returns (google.protobuf.Empty);

    // PeersList returns the list of peers
    rpc PeersList(google.protobuf.Empty) returns (PeersListResponse);

    // PeersInfo returns the info of a peer
    rpc PeersStatus(PeersStatusRequest) returns (Peer);

    // Subscribe subscribes to blockchain events
    rpc Subscribe(google.protobuf.Empty) returns (stream BlockchainEvent);
}
````
:::tip
Các lệnh CLI thực sự gọi các quá trình triển khai các phương thức dịch vụ này.


Các phương thức được triển khai qua ***minimal/system_service.go***.
:::

### GRPC dành cho các nút khác {#grpc-for-other-nodes}

Polygon Edge cũng triển khai một số phương thức dịch vụ được sử dụng bởi các nút khác trên mạng lưới.<br /> Dịch vụ được đề cập sẽ được mô tả trong phần **[giao thức](docs/edge/architecture/modules/consensus)**.

## 📜 Tài nguyên {#resources}
* **[Bộ đệm giao thức](https://developers.google.com/protocol-buffers)**
* **[Libp2p](https://libp2p.io/)**
* **[gRPC](https://grpc.io/)**

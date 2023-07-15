---
id: overview
title: Tổng quan kiến trúc
sidebar_label: Overview
description: Giới thiệu kiến trúc Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - modular
  - layer
  - libp2p
  - extensible
---

Chúng ta bắt đầu với ý tưởng tạo một phần mềm dạng *mô-đun*.

Đây là mục hiện diện ở hầu hết các phần của Polygon Edge. Dưới đây, bạn sẽ tìm thấy tổng quan ngắn gọn về kiến trúc xây dựng và sự phân lớp của nó.

## Phân lớp Polygon Edge {#polygon-edge-layering}

![Kiến trúc Polygon Edge](/img/edge/Architecture.jpg)

## Libp2p {#libp2p}

Tất cả bắt đầu ở lớp mạng cơ sở, sử dụng **libp2p**. Chúng tôi quyết định sử dụng công nghệ này vì nó phù hợp với triết lý thiết kế của Polygon Edge. Libp2p là:

- Mô-đun
- Khả năng mở rộng
- Nhanh

Quan trọng nhất là nó cung cấp một nền tảng tuyệt vời cho các tính năng nâng cao hơn, điều chúng tôi sẽ đề cập ở phần sau.


## Đồng bộ hóa & Đồng thuận {#synchronization-consensus}
Sự tách biệt giữa các giao thức đồng bộ và đồng thuận cho phép mô-đun hóa và triển khai các cơ chế đồng bộ và đồng thuận **tùy chỉnh** - tùy thuộc vào cách máy thức khách đang được chạy.

Polygon Edge được thiết kế để cung cấp các thuật toán đồng thuận có thể sẵn sàng được sử dụng.

Danh sách các thuật toán đồng thuận hiện tại:

* IBFT PoA
* IBFT PoS

## Blockchain {#blockchain}
Lớp Blockchain là lớp trung tâm điều phối mọi thứ trong hệ thống Polygon Edge. Mục này sẽ được đề cập sâu trong phần *Mô-đun* tương ứng.

## Trạng thái {#state}
Lớp bên trong Trạng thái chứa logic chuyển đổi trạng thái. Lớp này giải quyết cách trạng thái thay đổi khi một khối mới được đưa vào. Mục này sẽ được đề cập sâu trong phần *Mô-đun* tương ứng.

## JSON RPC {#json-rpc}
Lớp JSON RPC là một lớp API mà các nhà phát triển dApp sử dụng để tương tác với blockchain. Mục này sẽ được đề cập sâu trong phần *Mô-đun* tương ứng.

## TxPool {#txpool}
Lớp TxPool đại diện cho nhóm giao dịch và sẽ được liên kết chặt chẽ với các mô-đun khác trong hệ thống, vì các giao dịch có thể được thêm vào từ nhiều điểm.

## grpc {#grpc}
gRPC, hoặc Google Remote Proceduture Call, là một khung mã nguồn mở và nguồn gốc mạnh mà Google ban đầu tạo ra để xây dựng một APC có thể và phát triển nhanh. Lớp GRPC rất quan trọng đối với các tương tác của người vận hành. Thông qua đó, các trình vận hành nút có thể dễ dàng tương tác với máy khách, mang đến trải nghiệm người dùng thú vị.

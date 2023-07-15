---
id: overview
title: Polygon Edge
sidebar_label: What is Edge
description: "Giới thiệu về Polygon Edge.\n"
keywords:
  - docs
  - polygon
  - edge
  - network
  - modular

---

Polygon Edge là một bộ khung dạng mô-đun và có thể mở rộng, giúp xây dựng các mạng blockchain tương thích Ethereum, các chuỗi bên và các giải pháp mở rộng quy mô nói chung.


Công dụng chính của nó là khởi động mạng blockchain mới đồng thời cung cấp khả năng tương thích hoàn toàn với các hợp đồng và giao dịch thông minh Ethereum.
 Nó sử dụng cơ chế đồng thuận IBFT (Istanbul Byzantine Fault Tolerant), được hỗ trợ trong [PoA (bằng chứng quyền hạn)](/docs/edge/consensus/poa) và [PoS (bằng chứng cổ phần)](/docs/edge/consensus/pos-stake-unstake).


Polygon Edge cũng hỗ trợ giao tiếp với nhiều mạng blockchain, cho phép chuyển nhượng cả [ERC-20](https://ethereum.org/en/developers/docs/standards/tokens/erc-20) và [ERC-721](https://ethereum.org/en/developers/docs/standards/tokens/erc-721), bằng cách sử dụng [giải pháp cầu nối tập trung](/docs/edge/additional-features/chainbridge/overview).


Các ví đạt tiêu chuẩn của ngành có thể được sử dụng để tương tác với Polygon Edge thông qua các điểm cuối [JSON-RPC](/docs/edge/working-with-node/query-json-rpc), các trình vận hành nút cũng có thể thực hiện nhiều thao tác trên nút thông qua giao thức [gRPC](/docs/edge/working-with-node/query-operator-info).


Để tìm hiểu thêm về Polygon, hãy truy cập [trang web chính thức](https://polygon.technology).


**[Kho lưu trữ GitHub](https://github.com/0xPolygon/polygon-edge)**

:::caution

Mảng này vẫn đang được hoàn thiện nên có thể sẽ có thay đổi về kiến ​​trúc trong tương lai.
 Mã lập trình chưa được kiểm tra nên hãy liên lạc với đội ngũ Polygon nếu bạn muốn đưa mảng này vào vận hành.

:::



Để bắt đầu bằng cách chạy `polygon-edge` trên mạng cục bộ, vui lòng đọc: [Cài đặt](/docs/edge/get-started/installation) và [Cài đặt cục bộ](/docs/edge/get-started/set-up-ibft-locally).


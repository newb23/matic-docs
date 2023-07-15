---
id: overview
title: Tổng quan
description: Tổng quan về ChainBridge
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

## ChainBridge là gì? {#what-is-chainbridge}

ChainBridge là một cầu nối blockchain đa hướng dạng mô-đun, hỗ trợ các chuỗi tương thích EVM và Substrate, do ChainSafe xây dựng.
 ChainBridge cho phép người dùng chuyển nhượng mọi loại tài sản hoặc thông điệp giữa hai chuỗi khác nhau.


Để tìm hiểu thêm về ChainBridge, tham khảo các [tài liệu chính thức](https://chainbridge.chainsafe.io/) do nhà phát triển cung cấp.


Hướng dẫn này nhằm giúp tích hợp Chainbridge vào Polygon Edge.
 Hướng dẫn này đi vào việc thiết lập cầu nối giữa Polygon PoS (mạng thử nghiệm Mumbai) và mạng Polygon Edge cục bộ.


## Yêu cầu {#requirements}

Trong hướng dẫn này, bạn sẽ chạy các nút Polygon Edge, một trình chuyển tiếp ChainBridge (xem thông tin chi tiết [tại đây](/docs/edge/additional-features/chainbridge/definitions)) cùng công cụ cb-sol-cli, một công cụ CLI dùng để triển khai các hợp đồng cục bộ, đăng ký tài nguyên và thay đổi cài đặt cho cầu nối (bạn cũng có thể xem thêm [tại đây](https://chainbridge.chainsafe.io/cli-options/#cli-options)).
 Cần đảm bảo các môi trường sau đây khi cài đặt:

* Go: >= 1.17
* Node.js >= 16.13.0
* Git


Ngoài ra, bạn sẽ cần sao chép các kho lưu trữ sau với các phiên bản để chạy một số ứng dụng.


* [Polygon Edge](https://github.com/0xPolygon/polygon-edge): trên nhánh `develop`
* [ChainBridge](https://github.com/ChainSafe/ChainBridge): v1.1.5
* [Công cụ triển khai ChainBridge](https://github.com/ChainSafe/chainbridge-deploy): `f2aa093`trên nhánh
`main`


Bạn cần thiết lập mạng Polygon Edge trước khi chuyển sang phần tiếp theo.
 Vui lòng kiểm tra phần [Cài đặt cục bộ](/docs/edge/get-started/set-up-ibft-locally) hoặc [Cài đặt đám mây](/docs/edge/get-started/set-up-ibft-on-the-cloud) để biết thêm chi tiết.

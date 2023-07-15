---
id: migration-to-pos
title: Di chuyển từ PoA sang PoS
description: "Cách di chuyển từ PoA sang chế độ PoS IBFT và ngược lại."
keywords:
  - docs
  - polygon
  - edge
  - migrate
  - PoA
  - PoS
---

## Tổng quan {#overview}

Phần này hướng dẫn bạn di chuyển từ chế độ PoA sang chế độ PoS IBFT và ngược lại, đối với một cụm đang chạy - mà không cần thiết lập lại blockchain.

## Cách di chuyển sang PoS {#how-to-migrate-to-pos}

Bạn sẽ cần dừng tất cả các nút, thêm cấu hình fork vào genesis.json bằng lệnh `ibft switch` và khởi động lại các nút.

````bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --deployment 100 --from 200
````
:::caution Chuyển đổi trong khi sử dụng ECDSA
Khi sử dụng ECDSA, `--ibft-validator-type`cờ phải được thêm vào công tắc, đề cập đến ECDSA đã được sử dụng. Nếu không được bao gồm , Edge sẽ tự động chuyển sang BLS.

````bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --ibft-validator-type ecdsa --deployment 100 --from 200
````
:::Để chuyển sang PoS, bạn sẽ cần chỉ định 2 khối độ cao: `deployment``from``deployment`và . Là chiều cao để triển khai hợp đồng giả và `from`là chiều cao của sự khởi đầu của PoS. Hợp đồng đấu giá sẽ được triển khai tại địa chỉ `0x0000000000000000000000000000000000001001`tại `deployment`, giống như trường hợp của hợp đồng triển khai sẵn.

Vui lòng kiểm tra [Bằng chứng cổ phần](/docs/edge/consensus/pos-concepts) để biết thêm chi tiết về hợp đồng đấu giá.

:::warning Trình xác thực cần đấu giá theo cách thủ công

Mỗi trình xác thực cần phải đặt cược sau khi hợp đồng được triển khai tại `deployment` và trước `from` để trở thành người xác thực ở đầu PoS. Mỗi trình xác thực sẽ cập nhật trình xác thực của riêng nó được thiết lập bởi bộ lệnh trong hợp đồng đấu giá ở đầu PoS.

Để tìm hiểu thêm về Staking, hãy thăm **[Set và sử dụng Proof Stake](/docs/edge/consensus/pos-stake-unstake)**.
:::

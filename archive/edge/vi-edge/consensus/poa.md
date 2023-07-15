---
id: poa
title: Bằng chứng Thẩm quyền (PoA)
description: "Giải thích và hướng dẫn liên quan đến Bằng chứng Thẩm quyền."
keywords:
  - docs
  - polygon
  - edge
  - PoA
  - autorithy
---

## Tổng quan {#overview}

IBFT PoA là cơ chế đồng thuận mặc định trong Polygon Edge. Trong PoA, trình xác thực là các trình sẽ chịu trách nhiệm tạo các khối và thêm chúng vào chuỗi khối.

Tất cả các trình xác thực tạo thành một tập hợp trình xác thực động, nơi các trình xác thực có thể được thêm vào hoặc xóa khỏi tập hợp bằng cơ chế bỏ phiếu. Điều này có nghĩa là các trình xác thực có thể được bỏ phiếu thuận/chống từ tập hợp trình xác thực nếu đa số (51%) nút xác thực bỏ phiếu để thêm/bỏ một trình xác thực nhất định vào/khỏi tập hợp. Bằng cách này, các trình xác thực độc hại có thể được nhận dạng và xóa khỏi mạng, trong khi các trình xác thực đáng tin cậy mới có thể được thêm vào mạng.

Tất cả các trình xác thực thay phiên nhau đề xuất khối tiếp theo (round-robin) và để khối được xác thực/chèn vào blockchain, đa số (hơn 2/3) trình xác thực phải chấp thuận khối đã đề cập.

Bên cạnh trình xác thực, có những trình không xác thực không tham gia vào việc tạo khối nhưng có tham gia vào quá trình xác thực khối.

## Thêm trình xác thực vào tập hợp trình xác thực {#adding-a-validator-to-the-validator-set}

Hướng dẫn này mô tả cách thêm một nút trình xác thực mới vào mạng IBFT đang hoạt động với 4 nút trình xác thực. Nếu bạn cần giúp thiết lập mạng đang đề cập đến sự [Thiết lập](/edge/get-started/set-up-ibft-locally.md) Cục bộ / [Cloud](/edge/get-started/set-up-ibft-on-the-cloud.md) September

### Bước 1: Khởi tạo thư mục dữ liệu cho IBFT và tạo khóa trình xác thực cho nút mới {#step-1-initialize-data-folders-for-ibft-and-generate-validator-keys-for-the-new-node}

Để thiết lập và chạy IBFT trên nút mới, trước tiên bạn cần khởi tạo các thư mục dữ liệu và tạo các khóa:

````bash
polygon-edge secrets init --data-dir test-chain-5
````

Lệnh này sẽ in khóa của trình xác thực (địa chỉ) và ID nút. Bạn sẽ cần khóa của trình xác thực (địa chỉ) cho bước tiếp theo.

### Bước 2: Đề xuất một ứng cử viên mới từ các nút trình xác thực khác {#step-2-propose-a-new-candidate-from-other-validator-nodes}

Để một nút mới trở thành trình xác thực, ít nhất 51% người xác thực cần đề xuất anh ta.

Ví dụ về cách đề xuất trình xác thực mới (`0x8B15464F8233F718c8605B16eBADA6fc09181fC2`) từ nút trình xác thực hiện có trên địa chỉ grpc: 127.0.0.1:10000:

````bash
polygon-edge ibft propose --grpc-address 127.0.0.1:10000 --addr 0x8B15464F8233F718c8605B16eBADA6fc09181fC2 --bls 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --vote auth
````

Cấu trúc của các lệnh IBFT được trình bày trong phần [Lệnh CLI](/docs/edge/get-started/cli-commands).

:::info Khóa công khai BLS

Khóa công khai BLS chỉ cần thiết nếu mạng đang chạy với BLS, `--bls`không cần thiết đối với mạng không chạy ở chế độ BLS
:::

### Bước 3: Chạy nút máy khách {#step-3-run-the-client-node}

Vì trong ví dụ này, chúng ta đang cố gắng chạy mạng mà tất cả các nút đều nằm trên cùng một máy, chúng ta cần chú ý để tránh xung đột cổng.

````bash
polygon-edge server --data-dir ./test-chain-5 --chain genesis.json --grpc-address :50000 --libp2p :50001 --jsonrpc :50002 --seal
````

Sau khi tìm nạp tất cả các khối, bên trong bảng điều khiển của bạn, bạn sẽ nhận thấy rằng một nút mới đang tham gia vào quá trình xác thực

````bash
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=4004
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=5 votes=0
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft: proposer calculated: proposer=0x8B15464F8233F718c8605B16eBADA6fc09181fC2 block=4004
````

:::info Thăng cấp một trình không xác thực thành một trình xác thực

Đương nhiên, một trình không xác thực có thể trở thành trình xác thực trong quá trình bỏ phiếu, nhưng để được đưa vào tập hợp trình xác thực sau quá trình bỏ phiếu thành công, nút phải được khởi động lại bằng cờ `--seal`.
:::

## Xóa trình xác thực khỏi tập hợp trình xác thực {#removing-a-validator-from-the-validator-set}

Thao tác này khá đơn giản. Để xóa một nút trình xác thực khỏi tập hợp trình xác thực, lệnh này cần được thực hiện cho phần lớn các nút trình xác thực.

````bash
polygon-edge ibft propose --grpc-address 127.0.0.1:10000 --addr 0x8B15464F8233F718c8605B16eBADA6fc09181fC2 --bls 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --vote drop
````

:::info Khóa công khai BLS

Khóa công khai BLS chỉ cần thiết nếu mạng đang chạy với BLS, `--bls`không cần thiết đối với mạng không chạy ở chế độ BLS
:::

Sau khi các lệnh được thực hiện, hãy quan sát rằng số lượng trình xác thực đã giảm (trong ví dụ nhật ký này từ 4 xuống còn 3).

````bash
2021-12-15T19:20:51.014+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=2399 round=1
2021-12-15T19:20:51.014+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=4 votes=2
2021-12-15T19:20:51.015+0100 [INFO]  polygon.consensus.ibft.acceptState: we are the proposer: block=2399
2021-12-15T19:20:51.015+0100 [INFO]  polygon.consensus.ibft: picked out txns from pool: num=0 remaining=0
2021-12-15T19:20:51.015+0100 [INFO]  polygon.consensus.ibft: build block: number=2399 txns=0
2021-12-15T19:20:53.002+0100 [INFO]  polygon.consensus.ibft: state change: new=ValidateState
2021-12-15T19:20:53.009+0100 [INFO]  polygon.consensus.ibft: state change: new=CommitState
2021-12-15T19:20:53.009+0100 [INFO]  polygon.blockchain: write block: num=2399 parent=0x768b3bdf26cdc770525e0be549b1fddb3e389429e2d302cb52af1722f85f798c
2021-12-15T19:20:53.011+0100 [INFO]  polygon.blockchain: new block: number=2399 hash=0x6538286881d32dc7722dd9f64b71ec85693ee9576e8a2613987c4d0ab9d83590 txns=0 generation_time_in_sec=2
2021-12-15T19:20:53.011+0100 [INFO]  polygon.blockchain: new head: hash=0x6538286881d32dc7722dd9f64b71ec85693ee9576e8a2613987c4d0ab9d83590 number=2399
2021-12-15T19:20:53.011+0100 [INFO]  polygon.consensus.ibft: block committed: sequence=2399 hash=0x6538286881d32dc7722dd9f64b71ec85693ee9576e8a2613987c4d0ab9d83590 validators=4 rounds=1 committed=3
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft: state change: new=AcceptState
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=2400 round=1
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=3 votes=0
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft: proposer calculated: proposer=0xea21efC826F4f3Cb5cFc0f986A4d69C095c2838b block=2400
````

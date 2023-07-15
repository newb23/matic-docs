---
id: set-up-ibft-locally
title: Thiết lập Cục bộ
description: "Hướng dẫn từng bước thiết lập cục bộ."
keywords:
  - docs
  - polygon
  - edge
  - local
  - setup
  - genesis
---

:::caution Hướng dẫn này chỉ nhằm mục đích thử nghiệm

Hướng dẫn dưới đây sẽ hướng dẫn bạn cách thiết lập mạng Polygon Edge trên máy cục bộ của bạn cho các mục đích thử nghiệm và phát triển.

Quy trình này khác rất nhiều so với cách bạn muốn thiết lập mạng Polygon Edge cho một kịch bản sử dụng thực tế trên một nhà cung cấp đám mây: **[Thiết lập Đám mây](/docs/edge/get-started/set-up-ibft-on-the-cloud)**

:::


## Yêu cầu {#requirements}

Tham khảo mục [Cài đặt](/docs/edge/get-started/installation) để cài đặt Polygon Edge.

## Tổng quan {#overview}

![Thiết lập Cục bộ](/img/edge/ibft-setup/local.svg)

Trong hướng dẫn này, mục tiêu của chúng ta là thiết lập một mạng `polygon-edge`blockchain hoạt động với [Giao thức đồng thuận IBFT](https://github.com/ethereum/EIPs/issues/650).
 Mạng blockchain sẽ gồm 4 nút và cả 4 nút đều là nút trình xác thực, đủ điều kiện để đề xuất khối và xác thực các khối đến từ những người đề xuất khác.
 Tất cả 4 nút sẽ chạy trên cùng một máy, vì ý tưởng của hướng dẫn này là cung cấp cho bạn một cụm IBFT đầy đủ chức năng trong khoảng thời gian ngắn nhất.

Để đạt được điều đó, chúng tôi hướng dẫn bạn qua 4 bước dễ dàng:

1. Việc khởi tạo các thư mục dữ liệu sẽ tạo cả các khóa của trình xác thực cho từng nút trong số 4 nút và khởi tạo các thư mục dữ liệu blockchain trống. Các khóa của trình xác thực rất quan trọng vì chúng ta cần khởi động khối genesis với tập hợp ban đầu gồm các trình xác thực bằng các khóa này.
2. Chuẩn bị chuỗi kết nối dành cho bootnode sẽ là thông tin quan trọng cho mọi nút mà chúng ta sẽ chạy để kết nối với nút nào khi bắt đầu lần đầu tiên.
3. Việc tạo tệp `genesis.json`sẽ yêu cầu nhập cả các khóa của trình xác thực được tạo ở **bước 1** được sử dụng để thiết lập các trình xác thực ban đầu của mạng trong khối genesis và chuỗi kết nối bootnode từ **bước 2**.
4. Chạy tất cả các nút là mục tiêu cuối cùng của hướng dẫn này và sẽ là bước cuối cùng chúng ta thực hiện, chúng tôi sẽ hướng dẫn các nút sử dụng thư mục dữ liệu nào và nơi để tìm `genesis.json`sẽ khởi động trạng thái mạng ban đầu.

Vì tất cả bốn nút sẽ chạy trên localhost, nên trong quá trình thiết lập, tất cả các thư mục dữ liệu được mong đợi cho mỗi nút nằm trong cùng một thư mục mẹ.

:::info Số lượng trình xác thực

Không có quy định về số lượng nút tối thiểu trong một cụm, nghĩa là có thể có các cụm chỉ có 1 nút trình xác thực.
 Xin lưu ý rằng cụm với _một_ nút duy nhất sẽ không có **khả năng chống lại sự cố** và **không đảm bảo BFT**.


Số lượng nút tối thiểu được đề xuất để đảm bảo BFT là 4 - vì trong một cụm 4 nút, lỗi của
 1 nút có thể được chấp nhận nếu 3 nút còn lại hoạt động bình thường.

:::

## Bước 1: Khởi tạo các thư mục dữ liệu dành cho IBFT và tạo các khóa của trình xác thực {#step-1-initialize-data-folders-for-ibft-and-generate-validator-keys}

Để thiết lập và chạy với IBFT, bạn cần khởi tạo các thư mục dữ liệu, một thư mục cho mỗi nút:

````bash
polygon-edge secrets init --data-dir test-chain-1
````

````bash
polygon-edge secrets init --data-dir test-chain-2
````

````bash
polygon-edge secrets init --data-dir test-chain-3
````

````bash
polygon-edge secrets init --data-dir test-chain-4
````

Mỗi lệnh này sẽ in khóa của trình xác thực, khóa công khai BLS và  [ID nút](https://docs.libp2p.io/concepts/peer-id/).
 Bạn sẽ cần Node ID của nút đầu tiên cho bước tiếp theo.

### Bí mật ngoài khơi {#outputting-secrets}
Kết quả bí mật có thể được lấy lại một lần nữa, nếu cần.

```bash
polygon-edge secrets output --data-dir test-chain-4
```

## Bước 2: Chuẩn bị chuỗi kết nối multiaddr cho bootnode {#step-2-prepare-the-multiaddr-connection-string-for-the-bootnode}

Để một nút có thể thiết lập kết nối thành công, nút này cần biết nên kết nối với máy chủ `bootnode` nào để
 có thông tin về các nút còn lại trên mạng lưới. `bootnode` đôi khi cũng được gọi là máy chủ `rendezvous` theo thuật ngữ p2p.

`bootnode` không phải là một phiên bản đặc biệt của nút Polygon Edge. Mỗi nút polygon-edge có thể đóng vai trò là một `bootnode`, nhưng mỗi nút polygon-edge cần phải có một tập hợp các bootnode được chỉ định, chúng sẽ được liên hệ để cung cấp thông tin về cách kết nối với các nút còn lại trong mạng lưới.

Để tạo chuỗi kết nối và chỉ định bootnode, chúng ta cần tuân thủ [định dạng multiaddr](https://docs.libp2p.io/concepts/addressing/):
```
/ip4/<ip_address>/tcp/<port>/p2p/<node_id>
```

Trong hướng dẫn này, chúng ta sẽ coi nút đầu tiên và nút thứ hai là bootnode cho các nút còn lại.
 Điều sẽ xảy ra trong tình huống này chính là các nút kết nối với `node 1` hoặc  `node 2`sẽ nhận được thông tin về cách kết nối với nhau thông qua
 các bootnode chung.

:::info Bạn cần chỉ định ít nhất một bootnode để bắt đầu một nút

Cần có ít nhất **một** bootnode để các nút khác trong mạng có thể phát hiện ra nhau. Nhiều bootnode hơn được khuyến nghị, như chúng cung cấp khả năng phục hồi cho mạng trong trường hợp mất điện. Trong hướng dẫn này, chúng ta sẽ liệt kê hai nút, nhưng có thể thay đổi điều này trong quá trình mà không ảnh hưởng đến tính hợp lệ của tệp `genesis.json`.

:::

Vì chúng ta đang chạy trên localhost, nên có thể an toàn khi giả sử rằng `<ip_address>` là `127.0.0.1`.

Đối với `<port>` mà chúng ta sẽ sử dụng `10001` vì chúng ta sẽ định cấu hình máy chủ libp2p cho `node 1` để nghe trên cổng này sau.

Và cuối cùng, chúng ta cần `<node_id>` mà chúng ta có thể lấy từ đầu ra của lệnh đã chạy trước đó `polygon-edge secrets init --data-dir test-chain-1` (được sử dụng để tạo các khóa và thư mục dữ liệu cho `node1`)

Sau khi liên kết, chuỗi kết nối multiaddr với `node 1` mà chúng ta sẽ sử dụng làm bootnode sẽ trông giống thế này (chỉ có `<node_id>` ở cuối là khác biệt):
```
/ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW
```
Tương tự, chúng ta sẽ dựng multiaddr cho bootnode thứ hai như hình dưới đây
```
/ip4/127.0.0.1/tcp/20001/p2p/16Uiu2HAmS9Nq4QAaEiogE4ieJFUYsoH28magT7wSvJPpfUGBj3Hq
```

:::info Tên máy chủ DNS thay vì ips

Polygon Edge hỗ trợ sử dụng tên máy chủ DNS cho cấu hình các nút. Đây là một tính năng rất hữu ích dành cho các triển khai sử dụng đám mây, vì ip của nút có thể thay đổi vì nhiều lý do khác nhau.

Định dạng multiaddr cho chuỗi kết nối khi sử dụng tên máy chủ DNS như sau:
`/dns4/sample.hostname.com/tcp/<port>/p2p/nodeid`

:::


## Bước 3: Tạo tệp genesis với 4 nút làm trình xác thực {#step-3-generate-the-genesis-file-with-the-4-nodes-as-validators}

````bash
polygon-edge genesis --consensus ibft --ibft-validators-prefix-path test-chain- --bootnode /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW --bootnode /ip4/127.0.0.1/tcp/20001/p2p/16Uiu2HAmS9Nq4QAaEiogE4ieJFUYsoH28magT7wSvJPpfUGBj3Hq
````

Lệnh này thực hiện:

* `--ibft-validators-prefix-path` thiết lập đường dẫn thư mục tiền tố thành đường dẫn được chỉ định mà IBFT trong Polygon Edge có thể sử dụng. Thư mục này được sử dụng để chứa thư mục `consensus/`, nơi giữ khóa riêng tư của trình xác thực. Khoá công khai của trình xác thực là cần thiết để dựng tệp genesis - danh sách ban đầu của các nút bootstrap. Cờ này chỉ có ý nghĩa khi thiết lập mạng trên máy chủ cục bộ, vì trong trường hợp thực tế, chúng ta không thể mong đợi tất cả các thư mục dữ liệu của các nút nằm trên cùng một hệ thống tệp mà từ đó chúng ta có thể dễ dàng đọc các khóa công khai của chúng.
* `--bootnode` thiết lập địa chỉ của bootnode để cho phép các nút tìm thấy nhau.
 Chúng ta sẽ sử dụng chuỗi multiadr của `node 1`, như đã đề cập trong **bước 2**.

Kết quả của lệnh này là tệp `genesis.json` chứa khối khởi đầu của chuỗi khối mới của chúng tôi, với bộ xác thực được xác định trước và cấu hình cho nút nào cần liên hệ trước để thiết lập kết nối.

:::info Chuyển sang ECDSA

BLS là chế độ xác thực mặc định của người đầu khối Nếu bạn muốn chuỗi của bạn chạy trong chế độ ECDSA, bạn có thể sử dụng cờ `—ibft-validator-type`, bằng sự tranh `ecdsa`luận:

```
genesis --ibft-validator-type ecdsa
```
:::
:::info Số dư tài khoản trước khi khai thác

Bạn có thể sẽ muốn thiết lập mạng lưới blockchain của mình với một số địa chỉ có số dư "định sẵn".

Để làm như vậy, hãy tùy ý chuyển cờ `--premine` cho mỗi địa chỉ mà bạn muốn được khởi tạo với số dư nhất định
 trên blockchain.

Ví dụ: nếu chúng ta muốn định trước 1000 ETH để xử lý `0x3956E90e632AEbBF34DEB49b71c28A83Bc029862` trong khối khởi đầu của mình, thì chúng ta cần cung cấp đối số sau:

```
--premine=0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000
```

**Lưu ý rằng số lượng trước khi đào là WEI, không phải ETH.**

:::

:::info Thiết lập giới hạn gas khối

Giới hạn gas mặc định cho mỗi khối là `5242880`. Giá trị này được ghi trong tệp genesis, nhưng bạn có thể muốn tăng / giảm nó.

Để làm như vậy, bạn có thể sử dụng cờ `--block-gas-limit`theo sau là giá trị mong muốn như hình dưới đây:

```shell
--block-gas-limit 1000000000
```
:::

:::info Thiết lập giới hạn trình mô tả tệp hệ thống

Giới hạn tệp tin mặc định (số lượng tệp tin đã mở) có thể thấp, và trên Linux, mọi thứ đều là tệp. Nếu các nút được dự kiến sẽ có thông lượng cao, bạn có thể cân nhắc việc tăng giới hạn này. Kiểm tra các tiến sĩ chính thức của sự phân tâm linux của bạn để biết thêm chi tiết.

#### Kiểm tra giới hạn hệ điều hành hiện tại (tệp đang mở) {#check-current-os-limits-open-files}
```shell title="ulimit -n"
1024 # Ubuntu default
```

#### Tăng giới hạn tệp đang mở {#increase-open-files-limit}
- Chạy `polygon-edge`trong foreground (vỏ sọc)
  ```shell title="Set FD limit for the current session"
  ulimit -n 65535 # affects only current session, limit won't persist after logging out
  ```

  ```shell title="Edit /etc/security/limits.conf"
  # add the following lines to the end of the file to modify FD limits
  *               soft    nofile          65535 # sets FD soft limit for all users
  *               hard    nofile          65535 # sets FD hard limit for all users

  # End of file
  ```
Lưu tệp tin và khởi động lại hệ thống.

- Chạy `polygon-edge`trong nền như một dịch vụ

Nếu được `polygon-edge`chạy như một dịch vụ hệ thống, sử dụng công cụ như , giới hạn mô tả `systemd`tệp tin sẽ được quản lý bằng cách sử dụng `systemd`.
  ```shell title="Edit /etc/systemd/system/polygon-edge.service"
  [Service]
   ...
  LimitNOFILE=65535
  ```

### Khắc phục sự cố {#troubleshooting}
```shell title="Watch FD limits of polygon edge running process"
watch -n 1 "ls /proc/$(pidof polygon-edge)/fd | wc -l"
```

```shell title="Check max FD limits for polygon-edge running process"
cat /proc/$(pidof polygon-edge)/limits
```
:::


## Bước 4: Chạy tất cả máy khách {#step-4-run-all-the-clients}

Vì chúng ta đang cố gắng chạy một mạng Polygon Edge gồm 4 nút trên cùng một máy, chúng ta cần chú ý để tránh xung đột cổng. Đây là lý do chúng ta sẽ sử dụng lý do sau để xác định các cổng nghe của từng máy chủ của một nút:

- `10000` cho máy chủ gRPC của `node 1`, `20000` cho máy chủ GRPC của `node 2` v.v.
- `10001` cho máy chủ libp2p của `node 1` , `20001` cho máy chủ libp2p của `node 2` v.v.
- `10002` cho máy chủ JSON-RPC của `node 1`, `20002` cho máy chủ JSON-RPC của `node 2` v.v.

Để chạy ứng dụng khách **đầu tiên** (lưu ý cổng `10001` vì nó được sử dụng như một phần của multiaddr libp2p ở **bước 2** cùng với ID nút của nút 1):

````bash
polygon-edge server --data-dir ./test-chain-1 --chain genesis.json --grpc-address :10000 --libp2p :10001 --jsonrpc :10002 --seal
````

Để chạy máy khách **thứ hai**:

````bash
polygon-edge server --data-dir ./test-chain-2 --chain genesis.json --grpc-address :20000 --libp2p :20001 --jsonrpc :20002 --seal
````

Để chạy máy khách **thứ ba**:

````bash
polygon-edge server --data-dir ./test-chain-3 --chain genesis.json --grpc-address :30000 --libp2p :30001 --jsonrpc :30002 --seal
````

Để chạy máy khách **thứ tư**:

````bash
polygon-edge server --data-dir ./test-chain-4 --chain genesis.json --grpc-address :40000 --libp2p :40001 --jsonrpc :40002 --seal
````

Để xem qua những gì đã được thực hiện cho đến nay:

* Thư mục cho dữ liệu máy khách đã được chỉ định là **./test-chain-\***
* Các máy chủ GRPC đã được khởi động trên các cổng **10000**, **20000**, **30000** và **40000**, cho mỗi nút tương ứng
* Các máy chủ libp2p đã được khởi động trên các cổng **10001**, **20001**, **30001** và **40001**, cho mỗi nút tương ứng
* Các máy chủ JSON-RPC đã được khởi động trên các cổng **10002**, **20002**, **30002** và **40002**, cho mỗi nút tương ứng
* Cờ *flag* có nghĩa là nút đang được khởi động sẽ tham gia vào quá trình niêm phong khối
* Cờ *chain* chỉ định tệp gốc nào sẽ được sử dụng cho cấu hình chuỗi

Cấu trúc của tệp tin genesis được đề cập trong phần [Lệnh CLI](/docs/edge/get-started/cli-commands).

Sau khi chạy các lệnh trước đó, bạn đã thiết lập mạng Polygon Edge 4 nút, có khả năng niêm phong các khối và khôi phục từ lỗi nút.

:::info Khởi động máy khách bằng tệp cấu hình

Thay vì chỉ định tất cả các tham số cấu hình dưới dạng đối số CLI, Máy khách cũng có thể được khởi động bằng tệp cấu hình bằng cách thực thi lệnh sau:

````bash
polygon-edge server --config <config_file_path>
````
Ví dụ:

````bash
polygon-edge server --config ./test/config-node1.json
````
Hiện tại, chúng tôi hỗ trợ `yaml`và tệp tin cấu hình dựa `json`trên đây, có thể tìm thấy tệp tin cấu hình mẫu **[ở đây](/docs/edge/configuration/sample-config)**.

:::

:::info Các bước để chạy một nút không xác thực

Một nút không phải là trình xác thực sẽ luôn đồng bộ các khối mới nhất nhận được từ nút trình xác thực, bạn có thể kích hoạt một nút không phải là trình xác thực bằng cách chạy lệnh sau.


````bash
polygon-edge server --data-dir <directory_path> --chain <genesis_filename> --grpc-address <portNo> --libp2p <portNo> --jsonrpc <portNo>
````
Ví dụ: bạn có thể thêm máy khách không phải là trình xác thực **thứ năm** bằng cách thực thi lệnh sau:

````bash
polygon-edge server --data-dir ./test-chain --chain genesis.json --grpc-address :50000 --libp2p :50001 --jsonrpc :50002
````
:::

:::info Chỉ định giới hạn giá

Một nút Polygon Edge có thể được bắt đầu với **giới hạn giá** đã đặt cho các giao dịch đến.

Đơn vị dành cho giới hạn giá là `wei`.


Thiết lập giới hạn giá nghĩa là bất kỳ giao dịch nào được xử lý bởi nút hiện tại sẽ cần có giá gas **cao hơn
** giới hạn giá đã thiết lập, nếu không, giá sẽ không được đưa vào trong một khối.

Việc đa số các nút tuân theo một giới hạn giá nhất định sẽ thực thi quy tắc giao dịch trong mạng không được dưới một ngưỡng giá nhất định.

Giá trị mặc định cho giới hạn giá là `0`, có nghĩa là nó hoàn toàn không được thực thi theo mặc định.

Ví dụ sử dụng cờ `--price-limit` :
````bash
polygon-edge server --price-limit 100000 ...
````

Cần lưu ý rằng giới hạn giá **chỉ được thực thi đối với các giao dịch không cục bộ**, nghĩa là giới hạn giá không áp dụng cho các giao dịch được thêm cục bộ trên nút.
:::

:::info URL websocket

Theo mặc định, khi bạn chạy Polygon Edge, nó sẽ tạo một URL WebSocket dựa trên vị trí chuỗi. Lược đồ URL `wss://` được sử dụng cho các liên kết HTTPS và `ws://` cho HTTP.

URL Localhost Websocket:
````bash
ws://localhost:10002/ws
````
Vui lòng lưu ý rằng số cổng phụ thuộc vào cổng JSON-RPC đã chọn cho nút.

URL Websocket Edgenet:
````bash
wss://rpc-edgenet.polygon.technology/ws
````
:::



## Bước 5: Tương tác với mạng Polygon Edge {#step-5-interact-with-the-polygon-edge-network}

Bây giờ bạn đã thiết lập ít nhất 1 máy khách đang chạy, bạn có thể tiếp tục và tương tác với blockchain bằng tài khoản bạn đã tạo trước ở trên và bằng cách chỉ định URL JSON-RPC cho bất kỳ nút nào trong số 4 nút:
- Nút 1: `http://localhost:10002`
- Nút 2: `http://localhost:20002`
- Nút 3: `http://localhost:30002`
- Nút 4: `http://localhost:40002`

Thực hiện theo hướng dẫn này để phát hành lệnh của trình vận hành cho cụm vừa mới dựng: [Cách để truy vấn thông tin trình vận hành](/docs/edge/working-with-node/query-operator-info) (cổng GRPC cho cụm chúng ta mới dựng là `10000`/`20000`/`30000`/`40000` cho mỗi nút tương ứng)

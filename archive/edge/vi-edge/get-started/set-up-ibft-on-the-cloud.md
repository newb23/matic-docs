---
id: set-up-ibft-on-the-cloud
title: Thiết lập Đám mây
description: "Hướng dẫn thiết lập đám mây chi tiết."
keywords:
  - docs
  - polygon
  - edge
  - cloud
  - setup
  - genesis
---

:::info Hướng dẫn này dành cho thiết lập mạng lưới chính hoặc mạng thử nghiệm

Hướng dẫn dưới đây sẽ hỗ trợ bạn cách thiết lập mạng Polygon Edge với nhà cung cấp dịch vụ đám mây để thiết lập vận hành mạng thử nghiệm hoặc mạng lưới chính.


Nếu bạn muốn thiết lập cục bộ mạng Polygon Edge để nhanh chóng kiểm tra `polygon-edge` trước khi thực hiện các thiết lập tương tự khi vận hành, vui lòng tham khảo
 **[Thiết lập Cục bộ](/docs/edge/get-started/set-up-ibft-locally)**
:::

## Yêu cầu {#requirements}

Tham khảo mục [Cài đặt](/docs/edge/get-started/installation) để cài đặt Polygon Edge.

### Thiết lập kết nối VM
 {#setting-up-the-vm-connectivity}

Tùy thuộc vào lựa chọn nhà cung cấp dịch vụ đám mây, bạn có thể thiết lập kết nối và quy tắc giữa các VM bằng tường lửa,
 nhóm bảo mật hoặc danh sách kiểm soát truy cập.


Phần duy nhất của `polygon-edge` cần được tiếp xúc với các VM khác là máy chủ libp2p, chỉ cần cho phép
 tất cả giao tiếp giữa các VM trên cổng libp2p `1478`mặc định là đủ.


## Tổng quan {#overview}

![Thiết lập đám mây](/img/edge/ibft-setup/cloud.svg)

Trong hướng dẫn này, mục tiêu của chúng ta là thiết lập một mạng `polygon-edge`blockchain hoạt động với [Giao thức đồng thuận IBFT](https://github.com/ethereum/EIPs/issues/650).
 Mạng blockchain sẽ gồm 4 nút và cả 4 nút đều là nút trình xác thực, đủ điều kiện để đề xuất khối và xác thực các khối đến từ những người đề xuất khác.
 Mỗi nút trong số 4 nút sẽ chạy trên VM riêng của chúng, vì ý tưởng của hướng dẫn này là xây dựng một mạng Polygon Edge đầy đủ chức năng trong khi vẫn để các khóa của trình xác thực ở chế độ riêng tư để đảm bảo thiết lập mạng không cần tin cậy.


Để làm được như vậy, chúng tôi sẽ hướng dẫn bạn qua 4 bước dễ dàng:

0. Hãy xem danh sách các **Yêu cầu** ở trên

1. Tạo các khóa riêng tư cho mỗi trình xác thực và khởi tạo thư mục dữ liệu

2. Chuẩn bị chuỗi kết nối cho bootnode để đưa vào `genesis.json` được chia sẻ

3. Tạo `genesis.json` trên máy cục bộ của bạn và gửi/chuyển đến từng nút

4. Kích hoạt tất cả các nút

:::info Số lượng trình xác thực

Không có quy định về số lượng nút tối thiểu trong một cụm, nghĩa là có thể có các cụm chỉ có 1 nút trình xác thực.
 Xin lưu ý rằng cụm với _một_ nút duy nhất sẽ không có **khả năng chống lại sự cố** và **không đảm bảo BFT**.


Số lượng nút tối thiểu được đề xuất để đảm bảo BFT là 4 - vì trong một cụm 4 nút, lỗi của
 1 nút có thể được chấp nhận nếu 3 nút còn lại hoạt động bình thường.

:::

## Bước 1: Khởi tạo thư mục dữ liệu và tạo các khóa của trình xác thực
 {#step-1-initialize-data-folders-and-generate-validator-keys}

Để thiết lập và vận hành Polygon Edge, bạn cần khởi tạo các thư mục dữ liệu, trên mỗi nút:



````bash
node-1> polygon-edge secrets init --data-dir data-dir
````

````bash
node-2> polygon-edge secrets init --data-dir data-dir
````

````bash
node-3> polygon-edge secrets init --data-dir data-dir
````

````bash
node-4> polygon-edge secrets init --data-dir data-dir
````

Mỗi lệnh này sẽ in khóa của trình, khóa công khai BLS và [ID nút](https://docs.libp2p.io/concepts/peer-id/).
 Bạn sẽ cần Node ID của nút đầu tiên cho bước tiếp theo.

### Bí mật ngoài khơi {#outputting-secrets}
Kết quả bí mật có thể được lấy lại một lần nữa, nếu cần.

```bash
polygon-edge secrets output --data-dir test-chain-4
```

:::warning Hãy giữ bảo mật thư mục dữ liệu của bạn!


Các thư mục dữ liệu được tạo ở trên, ngoài khởi tạo các thư mục để duy trì trạng thái blockchain, cũng sẽ tạo các khóa riêng tư cho trình xác thực của bạn.
 **Khóa này phải được giữ bí mật vì nếu bị đánh cắp, nó sẽ giúp người khác mạo danh bạn làm người xác thực trong mạng lưới!**

:::

## Bước 2: Chuẩn bị chuỗi kết nối multiaddr cho bootnode {#step-2-prepare-the-multiaddr-connection-string-for-the-bootnode}

Để một nút thiết lập kết nối thành công, nút này cần biết nên kết nối với máy chủ `bootnode`chủ nào để
 có thông tin về các nút còn lại trên mạng lưới. `bootnode` đôi khi cũng được gọi là máy chủ `rendezvous` theo thuật ngữ p2p.

`bootnode` không phải là một phiên bản đặc biệt của nút Polygon Edge. Mỗi nút Polygon Edge đều có thể đóng vai trò là `bootnode` và
 mỗi nút Polygon Edge cần phải có một tập hợp các bootnode được chỉ định để liên hệ khi cần thông tin về cách kết nối với
 các nút còn lại trong mạng lưới.

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

Vì phần đầu tiên của chuỗi kết nối multiaddr là `<ip_address>`, bạn sẽ cần nhập địa chỉ IP mà các nút khác có thể truy cập được, tùy thuộc vào thiết lập của bạn, đây có thể là địa chỉ IP riêng hoặc công khai, không phải `127.0.0.1`.


Đối với `<port>` chúng ta sẽ sử dụng `1478`, vì đây là cổng libp2p mặc định.

Và cuối cùng, chúng ta cần `<node_id>` mà chúng ta có thể lấy từ đầu ra của lệnh `polygon-edge secrets init --data-dir data-dir` đã chạy trước đó (được sử dụng để tạo các khóa và thư mục dữ liệu cho `node 1`)


Sau khi liên kết, chuỗi kết nối multiaddr với `node 1` mà chúng ta sẽ sử dụng làm bootnode sẽ trông giống thế này (chỉ có `<node_id>` ở cuối là khác biệt):

```
/ip4/<public_or_private_ip>/tcp/1478/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW
```
Tương tự, chúng ta xây dựng multiaddr cho bootnode thứ hai như hình dưới đây
```
/ip4/<public_or_private_ip>/tcp/1478/p2p/16Uiu2HAmS9Nq4QAaEiogE4ieJFUYsoH28magT7wSvJPpfUGBj3Hq
```
:::info Tên máy chủ DNS thay vì ips

Polygon Edge hỗ trợ sử dụng tên máy chủ DNS cho cấu hình các nút. Đây là một tính năng rất hữu ích dành cho các triển khai sử dụng đám mây, vì ip của nút có thể thay đổi vì nhiều lý do khác nhau.

Định dạng multiaddr cho chuỗi kết nối khi sử dụng tên máy chủ DNS như sau:
`/dns4/sample.hostname.com/tcp/<port>/p2p/nodeid`

:::

## Bước 3: Tạo tệp genesis với 4 nút làm trình xác thực {#step-3-generate-the-genesis-file-with-the-4-nodes-as-validators}

Bước này có thể được chạy trên máy cục bộ của bạn, nhưng bạn sẽ cần các khóa xác thực công khai cho từng trình xác thực trong số 4 trình xác thực.


Các trình xác thực có thể chia sẻ `Public key (address)` một cách an toàn như hình bên dưới thông qua đầu ra của lệnh `secrets init`, do đó
 bạn có thể tạo genesis.json một cách an toàn bằng những trình xác thực đó trong tập hợp trình xác thực ban đầu, xác định bằng khóa công khai:


```
[SECRETS INIT]
Public key (address) = 0xC12bB5d97A35c6919aC77C709d55F6aa60436900
BLS Public key       = 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf
Node ID              = 16Uiu2HAmVZnsqvTwuzC9Jd4iycpdnHdyVZJZTpVC8QuRSKmZdUrf
```

Khi bạn đã nhận được đủ 4 khóa công khai của trình xác thực, bạn có thể chạy lệnh sau để tạo
`genesis.json`

````bash
polygon-edge genesis --consensus ibft --ibft-validator 0xC12bB5d97A35c6919aC77C709d55F6aa60436900:0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --ibft-validator <2nd validator IBFT public key>:<2nd validator BLS public key> --ibft-validator <3rd validator IBFT public key>:<3rd validator BLS public key> --ibft-validator <4th validator IBFT public key>:<4th validator BLS public key> --bootnode=<first_bootnode_multiaddr_connection_string_from_step_2> --bootnode <second_bootnode_multiaddr_connection_string_from_step_2> --bootnode <optionally_more_bootnodes>
````

Lệnh này thực hiện:

*  `--ibft-validator` thiết lập khóa công khai của trình xác thực cần đưa vào trong tập hợp trình xác thực ban đầu của khối genesis.
 Có thể có nhiều trình xác thực ban đầu.
* `--bootnode` thiết lập địa chỉ của bootnode nhằm cho phép các nút tìm thấy nhau.
 Chúng ta sẽ sử dụng chuỗi multiaddr của `node 1` như đã đề cập trong **bước 2**, mặc dù bạn có thể thêm bao nhiêu bootnode tùy thích, như hiển thị ở trên.


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

Sau khi chỉ định:
1. Khóa công khai của các trình xác thực sẽ được đưa vào trong khối genesis như tập hợp trình xác nhận

2. Các chuỗi kết nối Bootnode multiaddr

3. Các tài khoản và số dư định trước sẽ được đưa vào khối genesis


và tạo `genesis.json`, bạn nên sao chép nó vào tất cả VM trong mạng lưới.
 Tùy thuộc vào thiết lập, bạn có thể sao chép/dán, gửi nó đến trình vận hành nút, hoặc đơn giản là SCP/FTP nó.


Cấu trúc của tệp genesis được đề cập trong phần [Lệnh CLI](/docs/edge/get-started/cli-commands).

## Bước 4: Chạy tất cả máy khách {#step-4-run-all-the-clients}

:::note Kết nối mạng lưới với các nhà cung cấp Đám mây


Hầu hết các nhà cung cấp dịch vụ đám mây không để lộ địa chỉ IP (đặc biệt là các địa chỉ công khai) dưới dạng giao diện mạng trực tiếp trên MV, thay vào đó, họ thiết lập một proxy NAT ẩn.



Trong trường hợp này, để cho phép các nút kết nối với nhau, bạn sẽ cần nghe `0.0.0.0` trên địa chỉ IP để liên kết trên tất cả các giao diện, nhưng bạn vẫn cần chỉ định địa chỉ IP hoặc địa chỉ DNS mà các nút khác có thể sử dụng để kết nối với phiên của bạn.
 Có thể thực hiện việc này bằng đối số  `--nat` hoặc `--dns`, nơi bạn có thể chỉ định địa chỉ IP hoặc DNS bên ngoài tương ứng.


#### Ví dụ {#example}

Địa chỉ IP liên kết mà bạn muốn nghe là `192.0.2.1`, nhưng nó không bị ràng buộc trực tiếp với bất kỳ giao diện mạng nào của bạn.


Để cho phép các nút kết nối, bạn sẽ chuyển các tham số sau:


`polygon-edge ... --libp2p 0.0.0.0:10001 --nat 192.0.2.1`

Hoặc, nếu bạn muốn chỉ định địa chỉ DNS `dns/example.io`, hãy chuyển các tham số sau:


`polygon-edge ... --libp2p 0.0.0.0:10001 --dns dns/example.io`

Việc này sẽ khiến nút của bạn nghe trên tất cả các giao diện, nhưng cũng làm cho nút biết rằng các máy khách đang kết nối với nó thông qua địa chỉ  `--nat`hoặc `--dns` được chỉ định.


:::

Để chạy máy khách **đầu tiên**:



````bash
node-1> polygon-edge server --data-dir ./data-dir --chain genesis.json  --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

Để chạy máy khách **thứ hai**:

````bash
node-2> polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

Để chạy máy khách **thứ ba**:

````bash
node-3> polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

Để chạy máy khách **thứ tư**:

````bash
node-4> polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

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
Hiện tại, chúng tôi chỉ hỗ trợ tệp tin cấu hình dựa `json`trên , có thể tìm thấy tệp tin cấu hình mẫu **[ở đây](/docs/edge/configuration/sample-config)**.

:::

:::info Các bước để chạy một nút không phải là trình xác thực

Một nút không phải là trình xác thực sẽ luôn đồng bộ các khối mới nhất nhận được từ nút trình xác thực, bạn có thể kích hoạt một nút không phải là trình xác thực bằng cách chạy lệnh sau.


````bash
polygon-edge server --data-dir <directory_path> --chain <genesis_filename>  --libp2p <IPAddress:PortNo> --nat <public_or_private_ip>
````
Ví dụ: bạn có thể thêm máy khách không phải là trình xác thực **thứ năm** bằng cách thực thi lệnh sau:

````bash
polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat<public_or_private_ip>
````
:::

:::info Chỉ định giới hạn giá

Một nút Polygon Edge có thể được bắt đầu với **giới hạn giá** đã đặt cho các giao dịch đến.

Đơn vị dành cho giới hạn giá là `wei`.


Thiết lập giới hạn giá nghĩa là bất kỳ giao dịch nào được xử lý bởi nút hiện tại sẽ cần có giá gas **cao hơn
** so với giới hạn giá đã đặt, nếu không, giá này sẽ không được đưa vào khối.


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

---
id: cli-commands
title: Lệnh CLI
description: "Danh sách các lệnh CLI và cờ lệnh cho Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - cli
  - commands
  - flags
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


Phần này trình bày chi tiết các lệnh hiện tại, cờ lệnh trong Polygon Edge và cách chúng được sử dụng.

:::tip Hỗ trợ đầu ra JSON

Cờ `--json` được hỗ trợ trên một số lệnh. Cờ này chỉ thị lệnh in đầu ra ở định dạng JSON

:::

## Lệnh khởi động {#startup-commands}

| **Lệnh** | **Mô tả** |
|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| server | Lệnh mặc định khởi động ứng dụng máy khách blockchain, bằng cách khởi động tất cả các mô-đun với nhau |
| genesis | Tạo tệp *genesis.json*, được sử dụng để thiết lập trạng thái chuỗi được định sẵn trước khi khởi động máy khách. Cấu trúc của tệp tin genesis được mô bên dưới |
| Khởi động dự báo | Khởi động Hợp đồng Thông minh cho mạng mới |

### cờ máy chủ {#server-flags}


| **Tất cả cờ máy chủ** |
|---------------------------------------|---------------------------------------------|
| [data-dir](/docs/edge/get-started/cli-commands#data-dir) | [jsonrpc](/docs/edge/get-started/cli-commands#jsonrpc) |
| [json-rpc-block-range-limit](/docs/edge/get-started/cli-commands#json-rpc-block-range-limit) | [json-rpc-batch-request-limit](/docs/edge/get-started/cli-commands#json-rpc-batch-request-limit) |
| [grpc](/docs/edge/get-started/cli-commands#grpc) | [libp2p](/docs/edge/get-started/cli-commands#libp2p) |
| [prometheus](/docs/edge/get-started/cli-commands#prometheus) | [block-gas-target](/docs/edge/get-started/cli-commands#block-gas-target) |
| [max-peers](/docs/edge/get-started/cli-commands#max-peers) | [max-inbound-peers](/docs/edge/get-started/cli-commands#max-inbound-peers) |
| [max-outbound-peers](/docs/edge/get-started/cli-commands#max-outbound-peers) | [max-enqueued](/docs/edge/get-started/cli-commands#max-enqueued) |
| [log-level](/docs/edge/get-started/cli-commands#log-level) | [log-to](/docs/edge/get-started/cli-commands#log-to) |
| [chain](/docs/edge/get-started/cli-commands#chain) | [join](/docs/edge/get-started/cli-commands#join) |
| [nat](/docs/edge/get-started/cli-commands#nat) | [dns](/docs/edge/get-started/cli-commands#dns) |
| [Giới hạn giá](/docs/edge/get-started/cli-commands#price-limit) | [Slot max-](/docs/edge/get-started/cli-commands#max-slots) |
| [Cấu hình](/docs/edge/get-started/cli-commands#config) | [secrets-config](/docs/edge/get-started/cli-commands#secrets-config) |
| [dev](/docs/edge/get-started/cli-commands#dev) | [dev-interval](/docs/edge/get-started/cli-commands#dev-interval) |
| [no-discover](/docs/edge/get-started/cli-commands#no-discover) | [restore](/docs/edge/get-started/cli-commands#restore) |
| [block-time](/docs/edge/get-started/cli-commands#block-time) | [access-control-allow-origins](/docs/edge/get-started/cli-commands#access-control-allow-origins) |


#### <h4></h4><i>data-dir</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--data-dir DATA_DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    server --data-dir ./example-dir

</TabItem>
</Tabs>

Được sử dụng để chỉ định thư mục dữ liệu được sử dụng để lưu trữ dữ liệu máy khách Polygon Edge. Mặc định: `./test-chain`.

---


#### <h4></h4><i>jsonrpc</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--jsonrpc JSONRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    server --jsonrpc 127.0.0.1:10000

</TabItem>
</Tabs>

Thiết lập địa chỉ và cổng cho dịch vụ `address:port` JSON-RPC.    Nếu chỉ có cổng được xác định `:10001`, nó sẽ liên kết với tất cả các giao diện `0.0.0.0:10001`.    Nếu lược bỏ dịch vụ sẽ liên kết với `address:port` mặc định.   
Địa chỉ mặc định: `0.0.0.0:8545`.

---

#### <h4></h4><i>json-rpc-block-range-limit</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--json-rpc-block-range-limit BLOCK_RANGE]

</TabItem>
  <TabItem value="example" label="Example">

    server --json-rpc-block-range-limit 1500

</TabItem>
</Tabs>

Sets the straight Khối tối đa sẽ được xem xét khi thực thi các yêu cầu json-rpc bao gồm giá trị từ Block/toBlock (ví dụ như: eth_getlogs).   Giới hạn này có thể bị tắt hoàn toàn bằng cách thiết lập giá trị cho `0`. Mặc định:`1000`.

---

#### <h4></h4><i>json-rpc-batch-request-limit</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--json-rpc-batch-request-limit MAX_LENGTH]

</TabItem>
  <TabItem value="example" label="Example">

    server --json-rpc-batch-request-limit 50

</TabItem>
</Tabs>

Đặt chiều dài tối đa để được xem xét khi xử lý yêu cầu mẻ json-rpc. Giới hạn này có thể bị tắt hoàn toàn bằng cách thiết lập giá trị cho `0`. Mặc định: `20`.

---

#### <h4></h4><i>grpc</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    server --grpc-address 127.0.0.1:10001

</TabItem>
</Tabs>

Thiết lập địa chỉ và cổng cho dịch vụ gRPC `address:port`. Địa chỉ mặc định: `127.0.0.1:9632`.

---

#### <h4></h4><i>libp2p</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--libp2p LIBP2P_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    server --libp2p 127.0.0.1:10002

</TabItem>
</Tabs>

Thiết lập địa chỉ và cổng cho dịch vụ libp2p `address:port`. Địa chỉ mặc định: `127.0.0.1:1478`.

---

#### <h4></h4><i>prometheus</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--prometheus PROMETHEUS_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    server --prometheus 127.0.0.1:10004

</TabItem>
</Tabs>

Thiết lập địa chỉ và cổng cho máy chủ prometheus `address:port`.    Nếu chỉ có cổng được xác định `:5001`, dịch vụ sẽ liên kết với tất cả các giao diện `0.0.0.0:5001`   . Nếu lược bỏ, dịch vụ sẽ không được bắt đầu.

---

#### <h4></h4><i>block-gas-target</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--block-gas-target BLOCK_GAS_TARGET]

</TabItem>
  <TabItem value="example" label="Example">

    server --block-gas-target 10000000

</TabItem>
</Tabs>

Thiết lập giới hạn gas khối mục tiêu cho chuỗi. Mặc định (không thực thi): `0`.

Giải thích chi tiết hơn về mục tiêu gas khối có thể được tìm thấy trong [phần TxPool](/docs/edge/architecture/modules/txpool#block-gas-target).

---

#### <h4></h4><i>max-peers</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--max-peers PEER_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    server --max-peers 40

</TabItem>
</Tabs>

Thiết lập số lượng ngang hàng tối đa của máy khách. Mặc định: `40`.

Giới hạn ngang hàng phải được chỉ định bằng `max-peers` hoặc gắn cờ `max-inbound/outbound-peers`.

---

#### <h4></h4><i>max-inbound-peers</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--max-inbound-peers PEER_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    server --max-inbound-peers 32

</TabItem>
</Tabs>

Thiết lập số lượng ngang hàng gửi vào tối đa trên máy khách. Nếu `max-peers` được thiết lập, giới hạn max-inbound-peer được tính bằng các công thức sau.

`max-inbound-peer = InboundRatio * max-peers`, trong đó `InboundRatio` là `0.8`.

---

#### <h4></h4><i>max-outbound-peers</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--max-outbound-peers PEER_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    server --max-outbound-peers 8

</TabItem>
</Tabs>

Thiết lập số lượng ngang hàng gửi đi tối đa trên máy khách. Nếu `max-peers` được thiết lập, giới hạn max-outbound-peer được tính bằng các công thức sau.

`max-outbound-peer = OutboundRatio * max-peers`, trong đó `OutboundRatio` là `0.2`.

---

#### <h4></h4><i>max-enqueued</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--max-enqueued ENQUEUED_TRANSACTIONS]

</TabItem>
  <TabItem value="example" label="Example">

    server --max-enqueued 210

</TabItem>
</Tabs>

Thiết lập số lượng giao dịch được xếp hàng tối đa cho mỗi tài khoản. Mặc định:`128`.

---

#### <h4></h4><i>log-level</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--log-level LOG_LEVEL]

</TabItem>
  <TabItem value="example" label="Example">

    server --log-level DEBUG

</TabItem>
</Tabs>

Thiết lập mức nhật ký cho đầu ra bảng điều khiển. Mặc định: `INFO`.

---

#### <h4></h4><i>log-to</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--log-to LOG_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    server --log-to node.log

</TabItem>
</Tabs>

Xác định tên tệp nhật ký sẽ giữ tất cả đầu ra nhật ký từ lệnh máy chủ. Theo mặc định, tất cả nhật ký máy chủ sẽ được xuất ra bảng điều khiển (stdout), nhưng nếu cờ được thiết lập, sẽ không có đầu ra cho bảng điều khiển khi chạy lệnh máy chủ.

---

#### <h4></h4><i>chain</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    server --chain /home/ubuntu/genesis.json

</TabItem>
</Tabs>

Chỉ định tệp gốc được sử dụng để bắt đầu chuỗi. Mặc định: `./genesis.json`.

---

#### <h4></h4><i>join</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--join JOIN_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    server --join /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

Chỉ định địa chỉ của mục ngang hàng sẽ được tham gia.

---

#### <h4></h4><i>nat</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--nat NAT_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    server --nat 192.0.2.1

</TabItem>
</Tabs>

Thiết lập địa chỉ IP bên ngoài mà không có cổng, vì nó có thể được máy ngang hàng nhìn thấy.

---

#### <h4></h4><i>dns</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--dns DNS_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    server --dns dns4/example.io

</TabItem>
</Tabs>

Thiết lập địa chỉ DNS máy chủ. Mục này có thể được sử dụng để quảng cáo một DNS bên ngoài. Hỗ trợ `dns`, `dns4`, `dns6`.

---

#### <h4></h4><i>Giới hạn giá</i>


<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--price-limit PRICE_LIMIT]

</TabItem>
  <TabItem value="example" label="Example">

    server --price-limit 10000

</TabItem>
</Tabs>

Thiết lập giới hạn giá gas tối thiểu để thực thi để được chấp nhận vào nhóm. Mặc định `1`.

---

#### <h4></h4><i>Slot max-</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--max-slots MAX_SLOTS]

</TabItem>
  <TabItem value="example" label="Example">

    server --max-slots 1024

</TabItem>
</Tabs>

Thiết lập số lượng tối đa trong nhóm. Mặc định: `4096`.

---

#### <h4></h4><i>config</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--config CLI_CONFIG_PATH]

</TabItem>
  <TabItem value="example" label="Example">

    server --config ./myConfig.json

</TabItem>
</Tabs>

Chỉ định đường dẫn đến cấu hình CLI. Hỗ trợ `.json`.

---

#### <h4></h4><i>secrets-config</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--secrets-config SECRETS_CONFIG]

</TabItem>
  <TabItem value="example" label="Example">

    server --secrets-config ./secretsManagerConfig.json

</TabItem>
</Tabs>

Thiết lập đường dẫn đến tệp cấu hình SecretsManager. Được sử dụng cho Hashicorp Vault, AWS SSM và GCP Secrets Manager. Nếu lược bỏ, trình quản lý bí mật FS cục bộ sẽ được sử dụng.

---

#### <h4></h4><i>dev</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--dev DEV_MODE]

</TabItem>
  <TabItem value="example" label="Example">

    server --dev

</TabItem>
</Tabs>

Thiết lập máy khách sang chế độ dev. `false`Lỗi Trong chế độ dev, phát hiện peer bị tắt theo mặc định.

---

#### <h4></h4><i>dev-interval</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--dev-interval DEV_INTERVAL]

</TabItem>
  <TabItem value="example" label="Example">

    server --dev-interval 20

</TabItem>
</Tabs>

Thiết lập khoảng thời gian thông báo dành cho dev của máy khách tính bằng giây. Mặc định: `0`.

---

#### <h4></h4><i>no-discover</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--no-discover NO_DISCOVER]

</TabItem>
  <TabItem value="example" label="Example">

    server --no-discover

</TabItem>
</Tabs>

Ngăn không cho máy khách phát hiện ra các máy ngang hàng khác. Mặc định: `false`.

---

#### <h4></h4><i>restore</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--restore RESTORE]

</TabItem>
  <TabItem value="example" label="Example">

    server --restore backup.dat

</TabItem>
</Tabs>

Khôi phục các khối từ tệp lưu trữ được chỉ định

---

#### <h4></h4><i>block-time</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--block-time BLOCK_TIME]

</TabItem>
  <TabItem value="example" label="Example">

    server --block-time 1000

</TabItem>
</Tabs>

Thiết lập thời gian sản xuất khối tính bằng giây. Mặc định: `2`

---

#### <h4></h4><i>access-control-allow-origins</i>
<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--access-control-allow-origins ACCESS_CONTROL_ALLOW_ORIGINS]

</TabItem>
  <TabItem value="example" label="Example">

    server --access-control-allow-origins "https://edge-docs.polygon.technology"

</TabItem>
</Tabs>

Thiết lập các miền được ủy quyền để có thể chia sẻ phản hồi từ các yêu cầu JSON-RPC.    Thêm nhiều cờ `--access-control-allow-origins "https://example1.com" --access-control-allow-origins "https://example2.com"` để ủy quyền cho nhiều miền.    Nếu lược bỏ, tiêu đề Access-Control-Allow-Origins sẽ được đặt thành `*` và tất cả các miền sẽ được ủy quyền.

---

### genesis flags {#genesis-flags}
| **Tất cả cờ genesis** |
|---------------------------------------|---------------------------------------------|
| [dir](/docs/edge/get-started/cli-commands#dir) | [Tên](/docs/edge/get-started/cli-commands#name) |
| [pos](/docs/edge/get-started/cli-commands#pos) | [epoch-size](/docs/edge/get-started/cli-commands#epoch-size) |
| [premine](/docs/edge/get-started/cli-commands#premine) | [chainid](/docs/edge/get-started/cli-commands#chainid) |
| [ibft-validator-type](/docs/edge/get-started/cli-commands#ibft-validator-type) | [ibft-validators-prefix-path](/docs/edge/get-started/cli-commands#ibft-validators-prefix-path) |
| [ibft-validator](/docs/edge/get-started/cli-commands#ibft-validator) | [block-gas-limit](/docs/edge/get-started/cli-commands#block-gas-limit) |
| [consensus](/docs/edge/get-started/cli-commands#consensus) | [bootnode](/docs/edge/get-started/cli-commands#bootnode) |
| [max-validator-count](/docs/edge/get-started/cli-commands#max-validator-count) | [min-validator-count](/docs/edge/get-started/cli-commands#min-validator-count) |


#### <h4></h4><i>dir</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--dir DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --dir ./genesis.json

</TabItem>
</Tabs>

Thiết lập thư mục cho dữ liệu genesis Polygon Edge. Mặc định: `./genesis.json`.

---

#### <h4></h4><i>Tên</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--name NAME]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --name test-chain

</TabItem>
</Tabs>

Đặt tên cho chuỗi. Mặc định: `polygon-edge`.

---

#### <h4></h4><i>pos</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--pos IS_POS]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --pos

</TabItem>
</Tabs>

Đặt cờ chỉ ra rằng máy khách nên sử dụng IBFT Proof of Stake. Mặc định là Bằng chứng Thẩm quyền nếu cờ không được cung cấp hoặc `false`.

---

#### <h4></h4><i>epoch-size</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--epoch-size EPOCH_SIZE]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --epoch-size 50

</TabItem>
</Tabs>

Thiết lập kích thước giao đoạn dành cho chuỗi. Mặc định `100000`.

---

#### <h4></h4><i>premine</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--premine ADDRESS:VALUE]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --premine 0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000

</TabItem>
</Tabs>

Thiết lập các tài khoản và số dư định sẵn theo định dạng `address:amount`.
Số tiền có thể ở dạng thập phân hoặc hex.
Số dư được thiết lập mặc định: `0xD3C21BCECCEDA1000000`(1 triệu đồng tiền bản địa).

---

#### <h4></h4><i>chainid</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--chain-id CHAIN_ID]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --chain-id 200

</TabItem>
</Tabs>

Thiết lập ID cho chuỗi. Mặc định: `100`.

---

#### <h4></h4><i>ibft-validator-type</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--ibft-validator-type IBFT_VALIDATOR_TYPE]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --ibft-validator-type ecdsa

</TabItem>
</Tabs>

Chỉ định chế độ xác thực của tiêu đề khối. Các giá trị khả thi: `[ecdsa, bls]`. Mặc định: `bls`.

---

#### <h4></h4><i>ibft-validators-prefix-path</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--ibft-validators-prefix-path IBFT_VALIDATORS_PREFIX_PATH]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --ibft-validators-prefix-path test-chain-

</TabItem>
</Tabs>

Đường dẫn tiền tố cho thư mục trình xác thực. Cần phải có nếu cờ `ibft-validator` bị lược bỏ.

---

#### <h4></h4><i>ibft-validator</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--ibft-validator IBFT_VALIDATOR_LIST]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --ibft-validator 0xC12bB5d97A35c6919aC77C709d55F6aa60436900

</TabItem>
</Tabs>

Thiết lập các địa chỉ đã chuyển làm trình xác thực IBFT. Cần phải có nếu cờ `ibft-validators-prefix-path` bị lược bỏ.
1. Nếu mạng đang chạy với ECDSA, định dạng là `--ibft-validator [ADDRESS]`.
2. Nếu mạng đang chạy với BLS, định dạng là `--ibft-validator [ADDRESS]:[BLS_PUBLIC_KEY]`.

---

#### <h4></h4><i>block-gas-limit</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--block-gas-limit BLOCK_GAS_LIMIT]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --block-gas-limit 5000000

</TabItem>
</Tabs>

Ám chỉ lượng gas tối đa được sử dụng cho tất cả các hoạt động trong một khối. Mặc định: `5242880`.

---

#### <h4></h4><i>consensus</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--consensus CONSENSUS_PROTOCOL]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --consensus ibft

</TabItem>
</Tabs>

Thiết lập giao thức đồng thuận Mặc định: `pow`.

---

#### <h4></h4><i>bootnode</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--bootnode BOOTNODE_URL]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --bootnode /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

Multiaddr URL cho p2p phát hiện bootstrap. Cờ này có thể được sử dụng nhiều lần. Thay vì địa chỉ IP, địa chỉ DNS của bootnode có thể được cung cấp.

---

#### <h4></h4><i>max-validator-count</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--max-validator-count MAX_VALIDATOR_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --max-validator-count 42

</TabItem>
</Tabs>

Số lượng trình đặt cược tối đa có thể tham gia trình xác thực được đặt trong chế độ đồng thuận PoS. Số này không thể vượt quá giá trị của MAX_SAFE_INTEGER (2^53 - 2).

---

#### <h4></h4><i>min-validator-count</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--min-validator-count MIN_VALIDATOR_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --min-validator-count 4

</TabItem>
</Tabs>

Số lượng trình đặt cược tối thiểu cần thiết để tham gia trình xác thực được đặt trong đồng thuận PoS. Số này không thể vượt quá giá trị của max-validator-count. Mặc định là 1.

---

### sgenesis pretriển khai cờ {#genesis-predeploy-flags}

<h4><i>path</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis predeploy [--artifacts-path PATH_TO_ARTIFACTS]

</TabItem>
  <TabItem value="example" label="Example">

    genesis predeploy --artifacts-path ./ArtifactsData.json

</TabItem>
</Tabs>

Đặt đường dẫn đến các hiện vật hợp đồng JSON chứa đựng `abi`, `bytecode`và .`deployedBytecode`

---

<h4><i>chain</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis predeploy [--chain PATH_TO_GENESIS]

</TabItem>
  <TabItem value="example" label="Example">

    genesis predeploy --chain ./genesis.json

</TabItem>
</Tabs>

Đặt đường dẫn đến `genesis.json`tệp tin sẽ được cập nhật. Mặc định `./genesis.json`.

---

<h4><i>structor- arg</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis predeploy [--constructor-args CONSTRUCTOR_ARGUMENT]

</TabItem>
  <TabItem value="example" label="Example">

    genesis predeploy --constructor-args 123

</TabItem>
</Tabs>

Thiết lập Hợp đồng Thông minh về việc xây dựng Công ty Thông minh, nếu có. Để có một hướng dẫn chi tiết về các đối số này sẽ giống như thế nào, vui lòng tham khảo [bài báo về sự triển khai trước mắt](/docs/edge/additional-features/predeployment).

---

<h4><i>Địa chỉ trước</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis predeploy [--predeploy-address PREDEPLOY_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    genesis predeploy --predeploy-address 0x5555

</TabItem>
</Tabs>

Đặt địa chỉ để triển khai trước khi. Mặc định `0x0000000000000000000000000000000000001100`.

---


## Lệnh điều hành {#operator-commands}

### Lệnh ngang hàng {#peer-commands}

| **Lệnh** | **Mô tả** |
|------------------------|-------------------------------------------------------------------------------------|
| peers add | Thêm một máy ngang hàng mới bằng cách sử dụng địa chỉ libp2p của họ |
| peers list | Liệt kê tất cả các máy ngang hàng mà máy khách được kết nối thông qua libp2p |
| peers status | Trả về trạng thái của một máy ngang hàng cụ thể từ danh sách ngang hàng, sử dụng địa chỉ libp2p |

<h3>peers add flags</h3>

<h4><i>addr</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers add --addr PEER_ADDRESS

</TabItem>
  <TabItem value="example" label="Example">

    peers add --addr /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

Địa chỉ libp2p của máy ngang hàng ở định dạng multiaddr.

---

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers add [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    peers add --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Địa chỉ của API gRPC. Mặc định: `127.0.0.1:9632`.

<h3>peers list flags</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers list [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    peers list --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Địa chỉ của API gRPC. Mặc định: `127.0.0.1:9632`.

<h3>peers status flags</h3>

<h4><i>peer-id</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers status --peer-id PEER_ID

</TabItem>
  <TabItem value="example" label="Example">

    peers status --peer-id 16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

ID nút Libp2p của một máy ngang hàng cụ thể trong mạng p2p.

---

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    peers status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Địa chỉ của API gRPC. Mặc định: `127.0.0.1:9632`.

### Lệnh IBFT {#ibft-commands}

| **Lệnh** | **Mô tả** |
|------------------------|-------------------------------------------------------------------------------------|
| ibft snapshot | Trả về bản chụp IBFT |
| ibft candidates | Truy vấn nhóm ứng viên được đề xuất hiện tại, cũng như các ứng viên chưa được đưa vào |
| ibft propose | Đề xuất một ứng cử viên mới được thêm vào/xóa khỏi tập hợp trình xác thực |
| ibft status | Trả về trạng thái tổng thể của máy khách IBFT |
| ibft switch | Thêm cấu hình fork vào tệp genesis.json để chuyển loại IBFT |
| ibft quorum | Chỉ định số khối mà sau đó phương pháp kích thước số đại biểu tối ưu sẽ được sử dụng để đạt được sự đồng thuận |


<h3>ibft snapshot flags</h3>

<h4><i>number</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft snapshot [--number BLOCK_NUMBER]

</TabItem>
  <TabItem value="example" label="Example">

    ibft snapshot --number 100

</TabItem>
</Tabs>

Chiều cao khối (số) cho ảnh chụp nhanh.

---

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft snapshot [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    ibft snapshot --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Địa chỉ của API gRPC. Mặc định: `127.0.0.1:9632`.

<h3>ibft candidates flags</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft candidates [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    ibft candidates --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Địa chỉ của API gRPC. Mặc định: `127.0.0.1:9632`.

<h3>ibft propose flags</h3>

<h4><i>vote</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft propose --vote VOTE

</TabItem>
  <TabItem value="example" label="Example">

    ibft propose --vote auth

</TabItem>
</Tabs>

Đề xuất thay đổi đối với bộ trình xác thực. Các giá trị khả thi: `[auth, drop]`.

---

<h4><i>addr</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft propose --addr ETH_ADDRESS

</TabItem>
  <TabItem value="example" label="Example">

    ibft propose --addr 0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7

</TabItem>
</Tabs>

Địa chỉ của tài khoản được bình chọn.

---

<h4><i>bls</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft propose --bls BLS_PUBLIC_KEY

</TabItem>
  <TabItem value="example" label="Example">

    ibft propose --bls 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf

</TabItem>
</Tabs>

Khóa công khai BLS của tài khoản được bình chọn, chỉ cần thiết trong chế độ BLS.

---

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft candidates [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    ibft candidates --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Địa chỉ của API gRPC. Mặc định: `127.0.0.1:9632`.

<h3>ibft status flags</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    ibft status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Địa chỉ của API gRPC. Mặc định: `127.0.0.1:9632`.

<h3>ibft switch flags</h3>

<h4><i>chain</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --chain genesis.json

</TabItem>
</Tabs>

Chỉ định tệp gốc để cập nhật. Mặc định: `./genesis.json`.

---

<h4><i>Loại</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--type TYPE]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --type PoS

</TabItem>
</Tabs>

Xác định loại IBFT để chuyển đổi. Các giá trị khả thi: `[PoA, PoS]`.

---

<h4><i>deployment</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--deployment DEPLOYMENT]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --deployment 100

</TabItem>
</Tabs>

Chỉ định độ cao (số lượng khối) của việc triển khai hợp đồng. Chỉ có sẵn với PoS.

---

<h4><i>from</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--from FROM]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --from 200

</TabItem>
</Tabs>

---

<h4><i>ibft-validator-type</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

     ibft switch [--ibft-validator-type IBFT_VALIDATOR_TYPE]

</TabItem>
  <TabItem value="example" label="Example">

     ibft switch --ibft-validator-type ecdsa

</TabItem>
</Tabs>

Chỉ định chế độ xác thực của tiêu đề khối. Các giá trị khả thi: `[ecdsa, bls]`. Mặc định: `bls`.

---

<h4><i>ibft-validators-prefix-path</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

     ibft switch [--ibft-validators-prefix-path IBFT_VALIDATORS_PREFIX_PATH]

</TabItem>
  <TabItem value="example" label="Example">

     ibft switch --ibft-validators-prefix-path test-chain-

</TabItem>
</Tabs>

Đường dẫn tiền tố dành cho các thư mục của trình xác thực mới. Cần có mặt nếu cờ `ibft-validator` bị lược bỏ. Chỉ khả dụng khi chế độ IBFT là PoA (lược bỏ cờ `--pos`).

---

<h4><i>ibft-validator</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

     ibft switch [--ibft-validator IBFT_VALIDATOR_LIST]

</TabItem>
  <TabItem value="example" label="Example">

     ibft switch --ibft-validator 0xC12bB5d97A35c6919aC77C709d55F6aa60436900

</TabItem>
</Tabs>

Thiết lập các địa chỉ được chuyển vào làm trình xác thực IBFT được sử dụng sau đợt fork. Cần có mặt nếu cờ `ibft-validators-prefix-path` bị lược bỏ. Chỉ sẵn có trong chế độ PoA.
1. Nếu mạng đang chạy với ECDSA, định dạng là `--ibft-validator [ADDRESS]`.
2. Nếu mạng đang chạy với BLS, định dạng là `--ibft-validator [ADDRESS][BLS_PUBLIC_KEY]`.

---

<h4><i>max-validator-count</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--max-validator-count MAX_VALIDATOR_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --max-validator-count 42

</TabItem>
</Tabs>

Số lượng trình đặt cược tối đa có thể tham gia trình xác thực được đặt trong chế độ đồng thuận PoS. Số này không thể vượt quá giá trị của MAX_SAFE_INTEGER (2^53 - 2).

---

<h4><i>min-validator-count</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--min-validator-count MIN_VALIDATOR_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --min-validator-count 4

</TabItem>
</Tabs>

Số lượng trình đặt cược tối thiểu cần thiết để tham gia trình xác thực được đặt trong đồng thuận PoS. Số này không thể vượt quá giá trị của max-validator-count. Mặc định là 1.

Chỉ định chiều cao (số lượng khối) bắt đầu của fork.

---

<h3>ibft quorum flags</h3>

<h4><i>from</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft quorum [--from your_quorum_switch_block_num]

</TabItem>
  <TabItem value="example" label="Example">

    ibft quorum --from 350

</TabItem>
</Tabs>

Chiều cao (số lượng khối) để chuyển phép tính số đại biểu thành QuorumOptimal, sử dụng công thức `(2/3 * N)`, trong đó `N` là số lượng nút trình xác thực. Xin lưu ý rằng mục này là để tương thích ngược, tức là chỉ dành cho các chuỗi đã sử dụng phép tính Quorum legacy số lượng tối đa đến một chiều cao (số lượng) khối nhất định.

---

<h4><i>chain</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft quorum [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    ibft quorum --chain genesis.json

</TabItem>
</Tabs>

Chỉ định tệp gốc để cập nhật. Mặc định: `./genesis.json`.

### Lệnh nhóm giao dịch {#transaction-pool-commands}

| **Lệnh** | **Mô tả** |
|------------------------|--------------------------------------------------------------------------------------|
| txpool status | Trả về số lượng giao dịch trong nhóm |
| txpool subscribe | Đăng ký cho các sự kiện trong nhóm giao dịch |

<h3>txpool status flags</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    txpool status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Địa chỉ của API gRPC. Mặc định: `127.0.0.1:9632`.

<h3>txpool subscribe flags</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Địa chỉ của API gRPC. Mặc định: `127.0.0.1:9632`.

---

<h4><i>promoted</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--promoted LISTEN_PROMOTED]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --promoted

</TabItem>
</Tabs>

Đăng ký cho các sự kiện tx được đẩy mạnh trong TxPool.

---

<h4><i>dropped</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--dropped LISTEN_DROPPED]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --dropped

</TabItem>
</Tabs>

Đăng ký cho các sự kiện tx bị loại bỏ trong TxPool.

---

<h4><i>demoted</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--demoted LISTEN_DEMOTED]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --demoted

</TabItem>
</Tabs>

Đăng ký cho các sự kiện tx bị giáng cấp trong TxPool.

---

<h4><i>added</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--added LISTEN_ADDED]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --added

</TabItem>
</Tabs>

Đăng ký các sự kiện tx được thêm vào TxPool.

---

<h4><i>enqueued</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--enqueued LISTEN_ENQUEUED]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --enqueued

</TabItem>
</Tabs>

Đăng ký cho các sự kiện tx được xếp hàng trong hàng đợi tài khoản.

---

### Lệnh blockchain {#blockchain-commands}

| **Lệnh** | **Mô tả** |
|------------------------|-------------------------------------------------------------------------------------|
| status | Trả về trạng thái của máy khách. Có thể tìm thấy phản hồi chi tiết dưới đây |
| monitor | Đăng ký luồng sự kiện blockchain. Có thể tìm thấy phản hồi chi tiết dưới đây |
| version | Trả về phiên bản hiện tại của máy khách |

<h3>status flags</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Địa chỉ của API gRPC. Mặc định: `127.0.0.1:9632`.

<h3>monitor flags</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    monitor [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    monitor --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Địa chỉ của API gRPC. Mặc định: `127.0.0.1:9632`.

---
<h3>lệnh phiên bản</h3>


<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    version

</TabItem>
</Tabs>

Hiển thị phiên bản phát hành, chi nhánh git, cam kết hash, và thời gian xây dựng.

## Lệnh bí mật {#secrets-commands}

| **Lệnh** | **Mô tả** |
|-------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| secrets init | Khởi tạo khóa riêng cho trình quản lý bí mật tương ứng |
| secrets generate | Tạo tệp cấu hình trình quản lý bí mật có thể được phân tích cú pháp bởi Polygon Edge |
| Sản xuất bí mật | In địa chỉ khóa công khai BLS và địa chỉ khóa công khai và nút để tham khảo. |

### secrets init flags {#secrets-init-flags}

<h4><i>config</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets init [--config SECRETS_CONFIG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets init --config ./secretsManagerConfig.json

</TabItem>
</Tabs>

Thiết lập đường dẫn đến tệp cấu hình SecretsManager. Sử dụng cho Hashicorp Vault. Nếu lược bỏ, trình quản lý bí mật FS cục bộ sẽ được sử dụng.

---

<h4><i>data-dir</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets init [--data-dir DATA_DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    secrets init --data-dir ./example-dir

</TabItem>
</Tabs>

Thiết lập thư mục cho dữ liệu Polygon Edge nếu FS cục bộ được sử dụng.

---

<h4><i>ecdsa</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets init [--ecdsa FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets init --ecdsa=false

</TabItem>
</Tabs>

Đặt cờ ám chỉ có tạo khóa ECDSA hay không. Mặc định: `true`.

---

<h4><i>network</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets init [--network FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets init --network=false

</TabItem>
</Tabs>

Đặt cờ ám chỉ có tạo khóa Mạng Libp2p hay không. Mặc định: `true`.

---

<h4><i>bls</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets init [--bls FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets init --bls

</TabItem>
</Tabs>

Đặt cờ ám chỉ có tạo khóa BLS hay không. Mặc định: `true`.

### secrets generate flags {#secrets-generate-flags}

<h4><i>dir</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--dir DATA_DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --dir ./example-dir

</TabItem>
</Tabs>

Thiết lập thư mục cho tệp cấu hình trình quản lý bí mật Mặc định: `./secretsManagerConfig.json`

---

<h4><i>Loại</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--type TYPE]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --type hashicorp-vault

</TabItem>
</Tabs>

Chỉ định loại trình quản lý bí mật [`hashicorp-vault`]. Mặc định: `hashicorp-vault`

---

<h4><i>token</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--token TOKEN]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --token s.zNrXa9zF9mgrdnClM7PZ19cu

</TabItem>
</Tabs>

Chỉ định token truy cập cho dịch vụ

---

<h4><i>server-url</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--server-url SERVER_URL]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --server-url http://127.0.0.1:8200

</TabItem>
</Tabs>

Chỉ định URL máy chủ dành cho dịch vụ

---

<h4><i>Tên</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--name NODE_NAME]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --name node-1

</TabItem>
</Tabs>

Chỉ định tên của nút để lưu trữ hồ sơ tại chỗ. Mặc định: `polygon-edge-node`

---

<h4><i>namespace</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--namespace NAMESPACE]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --namespace my-namespace

</TabItem>
</Tabs>

Chỉ định không gian tên được sử dụng cho trình quản lý bí mật Hashicorp Vault. Mặc định: `admin`

### Cờ xuất bí mật {#secrets-output-flags}

<h4><i>bls</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--bls FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --bls

</TabItem>
</Tabs>

Đánh dấu cờ chỉ ra liệu có phải là chỉ ra chìa khóa công khai BLS không. Mặc định: `true`

---

<h4><i>config</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--config SECRETS_CONFIG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --config ./secretsManagerConfig.json

</TabItem>
</Tabs>

Thiết lập đường dẫn đến tệp cấu hình SecretsManager. Nếu lược bỏ, trình quản lý bí mật FS địa phương sẽ được sử dụng.

---

<h4><i>data-dir</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--data-dir DATA_DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --data-dir ./example-dir

</TabItem>
</Tabs>

Thiết lập thư mục cho dữ liệu Polygon Edge nếu FS cục bộ được sử dụng.

---

<h4><i>node-id</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--node-id FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --node-id

</TabItem>
</Tabs>

Đặt cờ chỉ ra sự phát triển của thẻ thông tin về mạng hay không. Mặc định: `true`

---

<h4><i>Người xác thực</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--validator FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --validator

</TabItem>
</Tabs>

Sets Cờ sẽ chỉ ra địa chỉ xác thực có phải là chỉ ra không. Mặc định: `true`

---

## Phản hồi {#responses}

### Phản hồi trạng thái {#status-response}

Đối tượng phản hồi được xác định bằng cách Bộ đệm giao thức.
````go title="minimal/proto/system.proto"
message ServerStatus {
    int64 network = 1;

    string genesis = 2;

    Block current = 3;

    string p2pAddr = 4;

    message Block {
        int64 number = 1;
        string hash = 2;
    }
}
````

### Theo dõi phản hồi {#monitor-response}
````go title="minimal/proto/system.proto"
message BlockchainEvent {
    // The "repeated" keyword indicates an array
    repeated Header added = 1;
    repeated Header removed = 2;

    message Header {
        int64 number = 1;
        string hash = 2;
    }
}
````

## Tiện ích {#utilities}

### whitelist commands {#whitelist-commands}

| **Lệnh** | **Mô tả** |
|------------------------|-------------------------------------------------------------------------------------|
| whitelist show | Hiển thị thông tin danh sách trắng |
| whitelist deployment | Cập nhật hợp đồng thông minh triển khai danh sách trắng |

<h3> whitelist show </h3>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist show

</TabItem>
</Tabs>

Hiển thị thông tin danh sách trắng.

---

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist show [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist show --chain genesis.json

</TabItem>
</Tabs>

Chỉ định tệp gốc để cập nhật. Mặc định: `./genesis.json`.

---

<h3> whitelist deployment </h3>

<h4><i>chain</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist deployment [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist deployment --chain genesis.json

</TabItem>
</Tabs>

Chỉ định tệp gốc để cập nhật. Mặc định: `./genesis.json`.

---

<h4><i>add</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist deployment [--add ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist deployment --add 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d

</TabItem>
</Tabs>

Thêm địa chỉ mới vào danh sách trắng triển khai hợp đồng. Chỉ các địa chỉ trong danh sách trắng triển khai hợp đồng mới có thể triển khai hợp đồng. Nếu trống, bất kỳ địa chỉ nào cũng có thể thực thi việc triển khai hợp đồng

---

<h4><i>remove</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist deployment [--remove ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist deployment --remove 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d

</TabItem>
</Tabs>

Xóa địa chỉ khỏi danh sách trắng triển khai hợp đồng. Chỉ các địa chỉ trong danh sách trắng triển khai hợp đồng mới có thể triển khai hợp đồng. Nếu trống, bất kỳ địa chỉ nào cũng có thể thực thi việc triển khai hợp đồng

---

### backup flags {#backup-flags}

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    backup [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    backup --grpc-address 127.0.0.1:9632

</TabItem>
</Tabs>

Địa chỉ của API gRPC. Mặc định: `127.0.0.1:9632`.

---

<h4><i>out</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    backup [--out OUT]

</TabItem>
  <TabItem value="example" label="Example">

    backup --out backup.dat

</TabItem>
</Tabs>

Đường dẫn của tệp lưu trữ cần lưu.

---

<h4><i>from</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    from [--from FROM]

</TabItem>
  <TabItem value="example" label="Example">

    backup --from 0x0

</TabItem>
</Tabs>

Chiều cao bắt đầu của các khối trong kho lưu trữ. Mặc định: 0.

---

<h4><i>to</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    to [--to TO]

</TabItem>
  <TabItem value="example" label="Example">

    backup --to 0x2710

</TabItem>
</Tabs>

Chiều cao (số lượng) cuối của các khối trong kho lưu trữ.

---

## Biểu mẫu Genesis {#genesis-template}
Tệp genesis nên được sử dụng để thiết lập trạng thái ban đầu của blockchain (ví dụ: nếu một số tài khoản phải có số dư ban đầu).

Tệp *./genesis.json* sau đây được tạo:
````json
{
    "name": "example",
    "genesis": {
        "nonce": "0x0000000000000000",
        "gasLimit": "0x0000000000001388",
        "difficulty": "0x0000000000000001",
        "mixHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "coinbase": "0x0000000000000000000000000000000000000000",
        "parentHash": "0x0000000000000000000000000000000000000000000000000000000000000000"
    },
    "params": {
        "forks": {},
        "chainID": 100,
        "engine": {
            "pow": {}
        }
    },
    "bootnodes": []
}
````

### Thư mục dữ liệu {#data-directory}

Khi thực thi cờ *data-dir*, một thư mục **chuỗi thử nghiệm** sẽ được tạo. Cấu trúc thư mục bao gồm các thư mục con sau đây:
* **blockchain** - Lưu trữ LevelDB dành cho các đối tượng blockchain
* **trie** - Lưu trữ LevelDB dành cho Merkle trie
* **keystore** - Lưu trữ khóa riêng dành cho máy khách. Mục này bao gồm khóa riêng tư libp2p và khóa niêm phong/trình xác thực
* **consensus** - Lưu trữ bất kỳ thông tin đồng thuận nào mà khách hàng có thể cần khi làm việc

## Tài nguyên {#resources}
* **[Bộ đệm giao thức](https://developers.google.com/protocol-buffers)**

---
id: definitions
title: Các định nghĩa chung
description: Các định nghĩa chung về thuật ngữ sử dụng trong chainBridge

keywords:
  - docs
  - polygon
  - edge
  - Bridge
---


## Trình chuyển tiếp {#relayer}
Chainbridge là một cầu nối trình chuyển tiếp. Vai trò của trình chuyển tiếp là bỏ phiếu về việc thực thi một yêu cầu (ví dụ: đốt/phát hành bao nhiêu token).
 Trình này giám sát các sự kiện từ mọi chuỗi và bỏ phiếu cho đề xuất trong hợp đồng Bridge của chuỗi đích khi nhận sự kiện `Deposit` từ chuỗi.
 Trình chuyển tiếp sẽ triển khai một phương pháp trong hợp đồng Brigde để thực thi đề xuất sau khi đã có đủ số phiếu yêu cầu.
 Cầu nối sẽ ủy quyền việc thực thi hợp đồng Handler.



## Các loại hợp đồng {#types-of-contracts}
Trong ChainBridge, có ba loại hợp đồng trên mỗi chuỗi, được gọi là Bridge/Handler/Target.

| **Loại** | **Mô tả** |
|----------|-------------------------------------------------------------------------------------------------------------------------------|
| Hợp đồng Bridge | Hợp đồng Bridge quản lý các yêu cầu, phiếu bầu, hoạt động thực thi sẽ được triển khai trong mỗi chuỗi.
 Người dùng sẽ gọi `deposit` trong hợp đồng Bridge để bắt đầu chuyển nhượng, hợp đồng Bridge sẽ ủy quyền quá trình cho hợp đồng Handler tương ứng với hợp đồng Target.
 Khi hợp đồng Handler gọi thành công hợp đồng Target, hợp đồng Bridge sẽ tạo sự kiện `Deposit` để thông báo cho các trình chuyển tiếp.
 |
| Hợp đồng Handler | Hợp đồng này tương tác với hợp đồng Target để thực thi ký quỹ hoặc đề xuất.
 Hợp đồng này sẽ xác thực yêu cầu của người dùng, gọi hợp đồng Target và trợ giúp một số cài đặt cho hợp đồng Target.
 Có một số hợp đồng Handler nhất định để gọi từng hợp đồng Target có giao diện khác biệt.
 Các lệnh gọi gián tiếp của hợp đồng Handler giúp tạo cầu nối cho phép chuyển nhượng mọi loại tài sản hoặc dữ liệu. Hiện tại, có ba loại hợp đồng Handler được ChainBridge thực thi: ERC20Handler, ERC721Handler và GenericHandler.
 |
| Hợp đồng Target | Là hợp đồng quản lý các tài sản được trao đổi hoặc các thông điệp được chuyển tiếp giữa các chuỗi.
 Tương tác với hợp đồng này sẽ được thực hiện từ mỗi bên của cầu nối.
 |

<div style={{textAlign: 'center'}}>

![Kiến trúc ChainBridge](/img/edge/chainbridge/architecture.svg) *Kiến trúc ChainBridge*

</div>

<div style={{textAlign: 'center'}}>

![Quy trình chuyển nhượng token ERC20](/img/edge/chainbridge/erc20-workflow.svg)
 *Ví dụ: Quy trình chuyển nhượng token ERC20*

</div>

## Các loại tài khoản {#types-of-accounts}

Hãy đảm bảo các tài khoản có đủ token gốc để tạo giao dịch trước khi bắt đầu.
 Trong Polygon Edge, bạn có thể gán số dư định trước cho các tài khoản khi tạo khối gốc.


| **Loại** | **Mô tả** |
|----------|-------------------------------------------------------------------------------------------------------------------------------|
| Quản trị viên | Tài khoản này sẽ được trao vai trò quản trị viên như mặc định.
 |
| Người dùng |  Tài khoản người gửi/người nhận thực hiện gửi/nhận tài sản.
 Tài khoản người gửi thanh toán phí gas khi phê duyệt giao dịch chuyển nhượng token và gọi ký quỹ quy định trong hợp đồng Bridge để bắt đầu chuyển nhượng.
 |

:::info Vai trò quản trị viên
Một số thao tác nhất định chỉ có thể được thực hiện bằng tài khoản quản trị viên.
 Theo mặc định, nhà phát triển của hợp đồng Bridge sẽ giữ vai trò quản trị viên. Phía dưới sẽ có hướng dẫn chỉ định/gỡ bỏ vai trò quản trị viên cho tài khoản khác.


### Thêm vai trò quản trị viên {#add-admin-role}

Thêm với tư cách quản trị viên

```bash
# Grant admin role
$ cb-sol-cli admin add-admin \
  --url [JSON_RPC_URL] \
  --privateKey [PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --admin "[NEW_ACCOUNT_ADDRESS]"
```
### Thu hồi vai trò quản trị viên {#revoke-admin-role}

Xóa bỏ quản trị viên

```bash
# Revoke admin role
$ cb-sol-cli admin remove-admin \
  --url [JSON_RPC_URL] \
  --privateKey [PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --admin "[NEW_ACCOUNT_ADDRESS]"
```

## Các thao tác vận hành được cấp phép bởi tài khoản `admin` được nêu dưới đây. {#account-are-as-below}

### Thiết lập tài nguyên {#set-resource}

Đăng ký ID tài nguyên cùng địa chỉ hợp đồng cho trình xử lý.


```bash
# Register new resource
$ cb-sol-cli bridge register-resource \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --resourceId "[RESOURCE_ID]" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[TARGET_CONTRACT_ADDRESS]"
```

### Đảm bảo hợp đồng có thể được đốt/mint {#make-contract-burnable-mintable}

Chuyển hợp đồng token thành có thể đốt/mint trong trình xử lý.

```bash
# Let contract burnable/mintable
$ cb-sol-cli bridge set-burn \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[TARGET_CONTRACT_ADDRESS]"
```

### Hủy đề xuất {#cancel-proposal}

Hủy đề xuất thực thi

```bash
# Cancel ongoing proposal
$ cb-sol-cli bridge cancel-proposal \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --resourceId "[RESOURCE_ID]" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --chainId "[CHAIN_ID_OF_SOURCE_CHAIN]" \
  --depositNonce "[NONCE]"
```

### Tạm dừng/Tiếp tục {#pause-unpause}

Tạm dừng ký quỹ, tạo đề xuất, bỏ phiếu và thực hiện ký quỹ.


```bash
# Pause
$ cb-sol-cli admin pause \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]"

# Unpause
$ cb-sol-cli admin unpause \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]"
```

### Thay đổi phí {#change-fee}

Thay đổi phí thanh toán cho hợp đồng Bridge

```bash
# Change fee for execution
$ cb-sol-cli admin set-fee \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --fee [FEE_IN_WEI]
```

### Thêm/Gỡ bỏ trình chuyển tiếp {#add-remove-a-relayer}

Chỉ định tài khoản làm trình chuyển tiếp mới hoặc gỡ bỏ tài khoản khỏi trình chuyển tiếp


```bash
# Add relayer
$ cb-sol-cli admin add-relayer \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --relayer "[NEW_RELAYER_ADDRESS]"

# Remove relayer
$ cb-sol-cli admin remove-relayer \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --relayer "[RELAYER_ADDRESS]"
```

### Thay đổi ngưỡng của trình chuyển tiếp
 {#change-relayer-threshold}

Thay đổi số lượng phiếu bầu cần thiết để thực hiện đề xuất


```bash
# Remove relayer
$ cb-sol-cli admin set-threshold \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --threshold [THRESHOLD]
```
:::

## ID Chuỗi {#chain-id}

Chainbridge `chainId`là một giá trị tùy ý được sử dụng trong cầu nối để phân biệt các mạng blockchain, giá trị này phải nằm trong phạm vi uint8.
 Không được nhầm lẫn với ID chuỗi của mạng lưới, chúng không giống nhau.
 Giá trị này phải là duy nhất và không nhất thiết phải giống với ID của mạng lưới.


Ví dụ, chúng tôi đặt  `99`trong `chainId`, vì chuỗi ID của mạng thử nghiệm Mumbai là `80001`, vốn không thể được biểu diễn bằng uint8.


## ID tài nguyên {#resource-id}

ID tài nguyên là một giá trị 32 byte duy nhất trong môi trường chuỗi chéo, được liên kết với một tài sản (tài nguyên) nhất định đang được chuyển nhượng giữa các mạng lưới.


ID tài nguyên là tùy ý, nhưng theo quy ước, sẽ là byte đứng cuối cùng chứa ID chuỗi của chuỗi nguồn (mạng khởi nguồn của tài sản).


## URL JSON-RPC dành cho Polygon PoS
 {#json-rpc-url-for-polygon-pos}

Trong hướng dẫn này, chúng tôi sẽ dùng https://rpc-mumbai.matic.today, một URL JSON-RPC công khai do Polygon cung cấp, có thể có giới hạn lưu lượng truy cập hoặc tỷ lệ.
 URL này sẽ chỉ được sử dụng để kết nối với mạng thử nghiệm Polygon Mumbai.
 Chúng tôi khuyến nghị nên nhận URL JSON-RPC qua một dịch vụ bên ngoài như Infura vì việc triển khai hợp đồng sẽ gửi nhiều truy vấn/yêu cầu đến JSON-RPC.


## Các cách xử lý chuyển nhượng token {#ways-of-processing-the-transfer-of-tokens}
Khi chuyển nhượng token ERC20 giữa các chuỗi, chúng có thể được xử lý theo hai chế độ khác nhau:


### Chế độ khóa/phát hành {#lock-release-mode}
<b>Chuỗi nguồn: </b>Các token bạn đang gửi sẽ được khóa trong Hợp đồng Handler.  <br/>
<b>Chuỗi đích:</b> Lượng token bạn đã gửi vào chuỗi nguồn sẽ được mở khóa và chuyển từ hợp đồng Handler sang tài khoản người nhận tại chuỗi đích.

### Chế độ đốt/mint {#burn-mint-mode}
<b>Chuỗi nguồn:</b> Các token bạn đang gửi sẽ bị đốt.<br/> <b>Chuỗi đích:</b> Lượng token bạn đã gửi và đốt trên chuỗi nguồn sẽ được mint trên chuỗi đích và gửi đến tài tài khoản người nhận.

Bạn có thể dùng các chế độ khác nhau trên mỗi chuỗi. Nghĩa là, bạn có thể khóa token trên chuỗi chính trong quá trình mint token trên chuỗi con để chuyển nhượng.
 Ví dụ: Nên khóa/phát hành token nếu tổng nguồn cung hoặc lịch mint token bị kiểm soát.
 Token sẽ được mint/đốt nếu hợp đồng trong chuỗi con phải tuân thủ theo nguồn cung của chuỗi chính.


Chế độ mặc định là khóa/phát hành. Nếu bạn muốn chuyển Token về trạng thái có thể mint/đốt, bạn cần triển khai phương thức `adminSetBurnable`.
 Nếu bạn muốn mint token trong quá trình thực thi, bạn sẽ cần chỉ định vai trò `minter` cho hợp đồng ERC20 Handler.




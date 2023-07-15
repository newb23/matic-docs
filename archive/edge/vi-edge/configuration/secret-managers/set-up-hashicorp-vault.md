---
id: set-up-hashicorp-vault
title: Thiết lập Hashicorp Vault

description: "Thiết lập Hashicorp Vault cho Polygon Edge.\n"
keywords:
  - docs
  - polygon
  - edge
  - hashicorp
  - vault
  - secrets
  - manager
---

## Tổng quan {#overview}

Hiện tại, Polygon Edge quan tâm đến việc giữ 2 bí mật chính về thời gian chạy:
* **Khóa riêng tư của trình xác thực** được nút sử dụng, nếu nút là trình xác thực
* **Khóa riêng tư của mạng** được libp2p sử dụng để tham gia và giao tiếp với mạng ngang hàng khác

:::warning
Khóa riêng tư của trình xác thực là duy nhất với mỗi nút trình xác thực.
 Khóa này sẽ <b>không</b> được chia sẻ cho tất cả các trình xác thực, vì điều này có thể ảnh hưởng đến tính bảo mật của chuỗi.

:::

Để biết thêm thông tin, vui lòng đọc qua [Hướng dẫn Quản lý Khóa Riêng tư](/docs/edge/configuration/manage-private-keys)

Các mô-đun của Polygon Edge **không cần biết cách giữ bí mật**. Sau cùng, một mô-đun không cần quan tâm nếu
 một bí mật được lưu trữ trên một máy chủ ở xa hoặc cục bộ trên ổ cứng của nút.


Mọi thứ mà một mô-đun cần biết về việc giữ bí mật là **biết cách sử dụng bí mật**, **biết những bí mật nào cần lấy
 hoặc lưu lại**. Các thông tin triển khai quan trọng hơn của các hoạt động này được ủy quyền cho  `SecretsManager`, tất nhiên đây chỉ là cách diễn giải trừu tượng.


Trình vận hành nút khởi động Polygon Edge hiện có thể chỉ định trình quản lý bí mật nào họ muốn sử dụng và ngay
 khi trình quản lý bí mật chính xác được khởi tạo, các mô-đun xử lý các bí mật thông qua giao diện được đề cập -
 mà không cần quan tâm các bí mật được lưu trữ trên đĩa hay máy chủ.


Bài viết này trình bày chi tiết các bước cần thiết để thiết lập và chạy Polygon Edge với máy chủ [Hashicorp Vault](https://www.vaultproject.io/)


:::info các hướng dẫn trước đây
Chúng tôi **khuyến nghị** rằng trước khi xem bài viết này, hãy đọc các bài viết về [**Thiết lập Cục bộ**](/docs/edge/get-started/set-up-ibft-locally)
 và [**Thiết lập Đám mây**](/docs/edge/get-started/set-up-ibft-on-the-cloud).
:::


## Điều kiện tiên quyết {#prerequisites}

Bài viết này, giả định rằng một phiên bản đang hoạt động của máy chủ Hashicorp Vault **đã được thiết lập**.


Ngoài ra, máy chủ Hashicorp Vault được sử dụng cho Polygon Edge phải có  **bộ lưu trữ KV được kích hoạt** .


Thông tin cần có trước khi tiếp tục:
* **URL máy chủ** (URL API của máy chủ Hashicorp Vault)

* **Token** (token truy cập được sử dụng để truy cập vào công cụ lưu trữ KV)


## Bước 1 - Tạo cấu hình trình quản lý bí mật {#step-1-generate-the-secrets-manager-configuration}

Để Polygon Edge có thể giao tiếp liền mạch với máy chủ Vault, cần có phân tích cú pháp
 của tệp cấu hình đã tạo, gồm tất cả thông tin cần thiết để lưu trữ bí mật trên Vault.


Để tạo cấu hình, hãy chạy lệnh sau:

```bash
polygon-edge secrets generate --dir <PATH> --token <TOKEN> --server-url <SERVER_URL> --name <NODE_NAME>
```

Các tham số hiện tại:
* `PATH`là đường dẫn mà tệp tin cấu hình cần được xuất vào. Mặc định `./secretsManagerConfig.json`
* `TOKEN`là token truy cập đã được đề cập trước đó trong [phần điều kiện tiên quyết](/docs/edge/configuration/secret-managers/set-up-hashicorp-vault#prerequisites)

* `SERVER_URL`là URL của API máy chủ Vault, cũng được đề cập trong [phần điều kiện tiên quyết](/docs/edge/configuration/secret-managers/set-up-hashicorp-vault#prerequisites)

* `NODE_NAME` là tên của nút hiện tại mà cấu hình Vault đang được thiết lập.
 Nó có thể là một giá giá trị tùy ý. Mặc định `polygon-edge-node`

:::caution Tên nút

Hãy thận trọng khi chỉ định tên nút.

Polygon Edge sử dụng tên nút được chỉ định để theo dõi các bí mật mà nó tạo ra và sử dụng trên Vault.
 Việc chỉ định tên nút đã tồn tại có thể dẫn đến hậu quả là dữ liệu bị ghi đè trên máy chủ Vault.


Các bí mật được lưu trữ trên đường dẫn cơ sở sau: `secrets/node_name`
:::

## Bước 2 - Khởi tạo khóa bí mật bằng cách sử dụng cấu hình {#step-2-initialize-secret-keys-using-the-configuration}

Giờ đây, khi đã có tệp cấu hình, chúng ta có thể khởi tạo các khóa bí mật cần thiết với tệp cấu hình
 được thiết lập ở bước 1, sử dụng `--config`:

```bash
polygon-edge secrets init --config <PATH>
```

Tham số `PATH` là vị trí của tham số trình quản lý bí mật đã được tạo trước đó từ bước 1.


## Bước 3 - Tạo tệp tin khởi nguồn {#step-3-generate-the-genesis-file}

Tệp tin khởi nguồn phải được tạo theo cách tương tự như hướng dẫn [**Thiết lập Cục bộ**](/docs/edge/get-started/set-up-ibft-locally)
 và [**Thiết lập Đám mây**](/docs/edge/get-started/set-up-ibft-on-the-cloud), với một vài thay đổi nhỏ.

Vì Hashicorp Vault được sử dụng thay cho hệ thống tệp cục bộ, nên việc thêm địa chỉ trình xác thực cần được thực hiện qua cờ `--ibft-validator`:

```bash
polygon-edge genesis --ibft-validator <VALIDATOR_ADDRESS> ...
```

## Bước 4 - Bắt đầu máy khách Polygon Edge {#step-4-start-the-polygon-edge-client}

Bây giờ khi các khóa đã được thiết lập và tệp khởi nguồn đã được tạo, bước cuối cùng của quá trình là khởi tạo Polygon Edge bằng lệnh `server`.

Lệnh `server` được sử dụng theo cách tương tự như trong các hướng dẫn đã đề cập trước đó, với một bổ sung nhỏ - cờ `--secrets-config`:

```bash
polygon-edge server --secrets-config <PATH> ...
```

Tham số `PATH` là vị trí của tham số trình quản lý bí mật đã được tạo trước đó từ bước 1.

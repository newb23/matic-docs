---
id: set-up-gcp-secrets-manager
title: Thiết lập Trình quản lý bí mật GCP
description: "Thiết lập Trình quản lý bí mật GCP cho Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - gcp
  - secrets
  - manager
---

## Tổng quan {#overview}

Hiện tại, Polygon Edge quan tâm đến việc giữ 2 bí mật chính về thời gian chạy:
* **Khóa riêng tư của trình xác thực** được nút sử dụng, nếu nút là trình xác thực
* **Khóa riêng tư của mạng** được libp2p sử dụng để tham gia và giao tiếp với mạng ngang hàng khác

Để biết thêm thông tin, vui lòng đọc qua [Hướng dẫn Quản lý Khóa Riêng tư](/docs/edge/configuration/manage-private-keys)

Các mô-đun của Polygon Edge **không cần biết cách giữ bí mật**. Sau cùng, một mô-đun không cần quan tâm nếu
 một bí mật được lưu trữ trên một máy chủ ở xa hoặc cục bộ trên ổ cứng của nút.


Mọi thứ mà một mô-đun cần biết về việc giữ bí mật là **biết cách sử dụng bí mật**, **biết những bí mật nào cần lấy
 hoặc lưu lại**. Các thông tin triển khai quan trọng hơn của các hoạt động này được ủy quyền cho  `SecretsManager`, tất nhiên đây chỉ là cách diễn giải trừu tượng.


Trình vận hành nút khởi động Polygon Edge hiện có thể chỉ định trình quản lý bí mật nào họ muốn sử dụng và ngay
 khi trình quản lý bí mật chính xác được khởi tạo, các mô-đun xử lý các bí mật thông qua giao diện được đề cập -
 mà không cần quan tâm các bí mật được lưu trữ trên đĩa hay máy chủ.


Bài viết này trình bày chi tiết các bước cần thiết để thiết lập và chạy Polygon Edge với [Trình quản lý bí mật GCP](https://cloud.google.com/secret-manager).


:::info các hướng dẫn trước đây
Chúng tôi **khuyến nghị** rằng trước khi xem bài viết này, hãy đọc các bài viết về [**Thiết lập Cục bộ**](/docs/edge/get-started/set-up-ibft-locally)
 và [**Thiết lập Đám mây**](/docs/edge/get-started/set-up-ibft-on-the-cloud).
:::


## Điều kiện tiên quyết {#prerequisites}
### Tài khoản thanh toán GCP
 {#gcp-billing-account}
Để sử dụng Trình quản lý bí mật GCP, người dùng phải có [Tài khoản thanh toán](https://console.cloud.google.com/) được kích hoạt trên cổng GCP.
 Các tài khoản Google mới trên nền tảng GCP được cung cấp một số tiền ban đầu, với tư cách là tài khoản dùng thử miễn phí.
 Thông tin thêm có tại [tài liệu GCP](https://cloud.google.com/free)

### API Trình quản lý bí mật {#secrets-manager-api}

Người dùng sẽ cần kích hoạt API Trình quản lý bí mật GCP trước khi sử dụng.
Có thể thực hiện việc này thông qua [cổng thông tin API Trình quản lý bí mật](https://console.cloud.google.com/apis/library/secretmanager.googleapis.com). Thông tin thêm: [Cấu hình Trình quản lý bí mật](https://cloud.google.com/secret-manager/docs/configuring-secret-manager)


### Thông tin đăng nhập GCP
 {#gcp-credentials}
Cuối cùng, người dùng cần tạo thông tin đăng nhập mới để xác thực.
 Có thể thực hiện việc này theo chỉ dẫn sau được đăng tải [tại đây](https://cloud.google.com/secret-manager/docs/reference/libraries).    Tệp json được tạo có chứa thông tin đăng nhập và sẽ được chuyển đến từng nút cần sử dụng Trình quản lý bí mật GCP.


Thông tin cần có trước khi tiếp tục:
* **Project ID** (ID dự án được xác định trên nền tảng GCP)

* **Credentials File Location** (đường dẫn đến tệp json chứa thông tin đăng nhập)


## Bước 1 - Tạo cấu hình trình quản lý bí mật {#step-1-generate-the-secrets-manager-configuration}

Để Polygon Edge có thể giao tiếp liền mạch với GCP SM, cần phân tích cú pháp
 của tệp cấu hình đã tạo, gồm tất cả thông tin cần thiết để lưu trữ bí mật trên GCP SM.


Để tạo cấu hình, hãy chạy lệnh sau:

```bash
polygon-edge secrets generate --type gcp-ssm --dir <PATH> --name <NODE_NAME> --extra project-id=<PROJECT_ID>,gcp-ssm-cred=<GCP_CREDS_FILE>
```

Các tham số hiện tại:
* `PATH`là đường dẫn mà tệp tin cấu hình cần được xuất vào. Mặc định `./secretsManagerConfig.json`
* `NODE_NAME`là tên của nút hiện tại mà cấu hình GCP SM đang được thiết lập.
 Nó có thể là một giá giá trị tùy ý. Mặc định `polygon-edge-node`
* `PROJECT_ID` là ID của dự án mà người dùng đã chỉ định trong bảng điều khiển GCP trong quá trình thiết lập tài khoản và kích hoạt API Trình quản lý bí mật.

* `GCP_CREDS_FILE` là đường dẫn đến tệp tin json chứa thông tin đăng nhập mà sẽ cho phép đọc/ghi vào Trình quản lý Bí mật.

:::caution Tên nút
Hãy thận trọng khi chỉ định tên nút.

Polygon Edge sử dụng tên nút được chỉ định để theo dõi các bí mật mà nó tạo và sử dụng trên GCP SM.
 Việc chỉ định tên nút hiện tại có thể dẫn đến hậu quả là không thể ghi bí mật vào GCP SM.


Các bí mật được lưu trữ trên đường dẫn cơ sở sau: `projects/PROJECT_ID/NODE_NAME`
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

Vì GCP SM được sử dụng thay vì hệ thống tệp cục bộ, việc các thêm địa chỉ  của trình xác thực cần được thực hiện thông qua cờ `--ibft-validator`:

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

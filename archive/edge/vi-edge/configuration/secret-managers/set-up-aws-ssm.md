---
id: set-up-aws-ssm
title: Thiết lập AWS SSM (Trình quản lý Hệ thống)
description: "Thiết lập AWS SSM (Trình quản lý Hệ thống) cho Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - aws
  - ssm
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


Bài viết này trình bày chi tiết các bước cần thiết để thiết lập và chạy Polygon Edge với [Cửa hàng thông số trình quản lý hệ thống AWS](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html).

:::info các hướng dẫn trước đây
Chúng tôi **khuyến nghị** rằng trước khi xem bài viết này, hãy đọc các bài viết về [**Thiết lập Cục bộ**](/docs/edge/get-started/set-up-ibft-locally)
 và [**Thiết lập Đám mây**](/docs/edge/get-started/set-up-ibft-on-the-cloud).
:::


## Điều kiện tiên quyết {#prerequisites}
### Chính sách IAM {#iam-policy}
Người dùng cần tạo Chính sách IAM cho phép hoạt động đọc/ghi đối với Cửa hàng thông số trình quản lý hệ thống AWS. Sau khi tạo thành công Chính sách IAM, người dùng cần đính kèm nó vào cá thể EC2 đang chạy máy chủ Polygon Edge. Chính sách IAM sẽ trông giống như sau:
```json
{
  "Version": "2012-10-17",
  "Statement" : [
    {
      "Effect" : "Allow",
      "Action" : [
        "ssm:PutParameter",
        "ssm:DeleteParameter",
        "ssm:GetParameter"
      ],
      "Resource" : [
        "arn:aws:ssm:<aws_region>:<aws_account_id>:parameter<ssm-parameter-path>*"
      ]
    }
  ]
}
```
Bạn có thể tìm thấy thông tin chi tiết về Vai trò AWS SSM IAM trong [tài liệu AWS](https://docs.aws.amazon.com/systems-manager/latest/userguide/setup-instance-profile.html).

Thông tin cần có trước khi tiếp tục:
* **Region** (khu vực có chứa Trình quản lý Hệ thống và nút)
* **Parameter Path** (ví dụ: đường dẫn tùy ý mà bí mật sẽ được đặt vào `/polygon-edge/nodes`)

## Bước 1 - Tạo cấu hình trình quản lý bí mật {#step-1-generate-the-secrets-manager-configuration}

Để Polygon Edge có thể giao tiếp liền mạch với AWS SSM, cần phân tích cú pháp
 tệp cấu hình đã tạo, chứa tất cả thông tin cần thiết để lưu trữ bí mật trên AWS SSM.

Để tạo cấu hình, hãy chạy lệnh sau:

```bash
polygon-edge secrets generate --type aws-ssm --dir <PATH> --name <NODE_NAME> --extra region=<REGION>,ssm-parameter-path=<SSM_PARAM_PATH>
```

Các tham số hiện tại:
* `PATH`là đường dẫn mà tệp tin cấu hình cần được xuất vào. Mặc định `./secretsManagerConfig.json`
* `NODE_NAME` là tên của nút hiện tại mà cấu hình AWS SSM đang được thiết lập. Nó có thể là một giá giá trị tùy ý. Mặc định `polygon-edge-node`
* `REGION`là vùng trong đó lưu trữ AWS SSM. Đây phải cùng một vùng với nút sử dụng AWS SSM.
* `SSM_PARAM_PATH` là tên của đường dẫn mà bí mật sẽ được lưu trữ trong đó. Ví dụ nếu `--name node1` và `ssm-parameter-path=/polygon-edge/nodes`được chỉ định, bí mật sẽ được lưu trữ như `/polygon-edge/nodes/node1/<secret_name>`

:::caution Tên nút

Hãy thận trọng khi chỉ định tên nút.

Polygon Edge sử dụng tên nút được chỉ định để theo dõi các bí mật mà nó tạo và sử dụng trên AWS SSM.
 Việc chỉ định tên nút hiện tại có thể dẫn đến hậu quả là không thể ghi bí mật vào AWS SSM.

Các bí mật được lưu trữ trên đường dẫn cơ sở sau: `SSM_PARAM_PATH/NODE_NAME`
:::

## Bước 2 - Khởi tạo khóa bí mật bằng cách sử dụng cấu hình {#step-2-initialize-secret-keys-using-the-configuration}

Giờ đây, khi đã có tệp cấu hình, chúng ta có thể khởi tạo các khóa bí mật cần thiết với tệp cấu hình
 được thiết lập ở bước 1, sử dụng `--config`:

```bash
polygon-edge secrets init --config <PATH>
```

Tham số `PATH` là vị trí của tham số trình quản lý bí mật đã được tạo trước đó từ bước 1.


:::info Chính sách IAM

Bước này sẽ không thành công nếu Chính sách IAM cho phép hoạt động đọc/ghi không được định cấu hình chính xác và/hoặc không được đính kèm với phiên bản EC2 chạy lệnh này.
:::

## Bước 3 - Tạo tệp tin khởi nguồn {#step-3-generate-the-genesis-file}

Tệp tin khởi nguồn phải được tạo theo cách tương tự như hướng dẫn [**Thiết lập Cục bộ**](/docs/edge/get-started/set-up-ibft-locally)
 và [**Thiết lập Đám mây**](/docs/edge/get-started/set-up-ibft-on-the-cloud), với một vài thay đổi nhỏ.

Vì AWS SSM đang được sử dụng thay vì hệ thống tệp cục bộ, nên các địa chỉ của trình xác thực phải được thêm thông qua cờ `--ibft-validator`:
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

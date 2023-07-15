---
id: terraform-aws-deployment
title: Triển khai Terraform AWS

description: "Triển khai mạng Polygon Edge qua nhà cung cấp dịch vụ đám mây AWS bằng Terraform\n"
keywords:
  - docs
  - polygon
  - edge
  - deployment
  - terraform
  - aws
  - script
---
:::info Hướng dẫn triển khai vận hành
Đây là hướng dẫn triển khai AWS chính thức, sẵn sàng đưa vào vận hành và hoàn toàn tự động.


Triển khai thủ công trên ***[Đám mây](set-up-ibft-on-the-cloud)*** hoặc ***[Cục bộ](set-up-ibft-locally)*** được khuyến nghị cho hoạt động thử nghiệm và/hoặc khi nhà cung cấp dịch vụ đám mây của bạn không phải là AWS.
:::

:::info
Triển khai này chỉ dành cho PoA.    Nếu cơ chế PoS là cần thiết, chỉ cần làm theo ***[hướng dẫn](/docs/edge/consensus/migration-to-pos)*** này để thực hiện chuyển đổi từ PoA sang PoS.

:::

Hướng dẫn này sẽ mô tả chi tiết quá trình triển khai mạng blockchain Polygon Edge qua nhà cung cấp dịch đám mây AWS,
 đảm bảo sẵn sàng vận hành với các nút trình xác thực được mở rộng trên nhiều vùng khả dụng.


## Điều kiện tiên quyết {#prerequisites}

### Công cụ hệ thống {#system-tools}
* [terraform](https://www.terraform.io/)
* [aws cli](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
* [ID khóa truy cập aws và khóa truy cập bí mật](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-prereqs.html#getting-started-prereqs-keys)

### Các biến Terraform
 {#terraform-variables}
Hai biến cần được cung cấp, trước khi tiến hành triển triển khai:

* `alb_ssl_certificate`- ARN của chứng chỉ gửi từ Trình quản lý chứng chỉ AWS, được ALB sử dụng cho giao thức https.   
 Chứng chỉ phải được tạo trước khi bắt đầu triển khai và phải ở trạng thái **Đã cấp**

* `premine`- tài khoản sẽ nhận được tiền bản địa đã khai thác sẵn.
 Giá trị phải tuân thủ các đặc điểm kỹ thuật của cờ [CLI](/docs/edge/get-started/cli-commands#genesis-flags) chính thức


## Thông tin triển khai
 {#deployment-information}
### Các tài nguyên đã triển khai
 {#deployed-resources}
Tổng quan mức cao về các tài nguyên sẽ được triển khai:


* VPC chuyên dụng

* 4 nút trình xác thực (cũng là nút khởi động)

* 4 cổng NAT cho phép các nút gửi lưu lượng internet

* Hàm Lambda được sử dụng để tạo khối (genesis) đầu tiên và bắt đầu chuỗi

* Các nhóm bảo mật chuyên dụng và vai trò IAM

* Nhóm S3 được sử dụng để lưu trữ tệp genesis.json

* Bộ cân bằng tải ứng dụng được sử dụng để hiển thị điểm cuối JSON-RPC


### Khả năng chịu lỗi
 {#fault-tolerance}

Chỉ những vùng có 4 vùng khả dụng mới cần thiết cho quá trình triển khai này.
 Mỗi nút được triển khai trong một AZ (vùng khả dụng) duy nhất.


Bằng cách đặt mỗi nút trong một AZ duy nhất, toàn bộ cụm blockchain sẽ có khả năng chịu lỗi đối với lỗi trên một nút (AZ), vì Polygon Edge đã triển khai
 đồng thuận IBFT, cho phép gặp lỗi đối với một nút trong cụm 4 nút trình xác thực.


### Truy cập dòng lệnh
 {#command-line-access}

Các nút trình xác thực sẽ không được hiển thị theo bất kỳ cách nào đối với mạng internet công cộng (JSON-PRC chỉ được truy cập qua ALB)
 và chúng thậm chí sẽ không được gắn với địa chỉ IP công cộng.  
 Truy cập dòng lệnh nút chỉ có thể thực hiện được thông qua [AWS Systems Manager - Trình quản lý phiên](https://aws.amazon.com/systems-manager/features/)



### Nâng cấp AMI cơ sở
 {#base-ami-upgrade}

Triển khai này sử dụng `ubuntu-focal-20.04-amd64-server`AWS AMI.
 Nó sẽ **không** kích hoạt *triển khai lại* EC2 nếu AWS AMI được cập nhật.


Nếu vì lý do nào đó, AMI cơ sở được yêu cầu cập nhật,
 bạn có thể thực hiện việc này bằng cách chạy lệnh `terraform taint` từng lần, trước khi `terraform apply`.   
 Các phiên bản có thể bị nhiễm bẩn khi chạy lệnh    `terraform taint module.instances[<instance_number>].aws_instance.polygon_edge_instance` .

Ví dụ:
```shell
terraform taint module.instances[0].aws_instance.polygon_edge_instance
terraform taint module.instances[1].aws_instance.polygon_edge_instance
terraform taint module.instances[2].aws_instance.polygon_edge_instance
terraform taint module.instances[3].aws_instance.polygon_edge_instance
terraform apply
```

:::info
Trong môi trường vận hành, nên chạy từng `terraform taint` để duy trì hoạt động của mạng blockchain.

:::

## Quy trình triển khai {#deployment-procedure}

### Các bước trước
 khi triển khai {#pre-deployment-steps}
* xem qua ghi chú đăng ký terraform [polygon-technology-edge](https://registry.terraform.io/modules/aws-ia/polygon-technology-edge/aws)

* thêm mô-đun `polygon-technology-edge` vào tệp `main.tf` của bạn bằng cách làm theo *hướng dẫn cung cấp* trên trang ghi chú của mô-đun

* chạy lệnh `terraform init` để cài đặt tất cả các mục phụ thuộc Terraform cần thiết
* cung cấp chứng chỉ mới trong [AWS Certificate Manager](https://aws.amazon.com/certificate-manager/)

* đảm bảo chứng chỉ được cấp ở trạng thái **Đã cấp** và ghi lại **ARN** của chứng chỉ

* thiết lập câu lệnh đầu ra của bạn để nhận đầu ra của mô-đun trong cli


#### Ví dụ `main.tf` {#example}
```terraform
module "polygon-edge" {
  source  = "aws-ia/polygon-technology-edge/aws"
  version = ">=0.0.1"

  premine             = var.premine
  alb_ssl_certificate = var.alb_ssl_certificate
}

output "json_rpc_dns_name" {
  value       = module.polygon-edge.jsonrpc_dns_name
  description = "The dns name for the JSON-RPC API"
}

variable "premine" {
  type        = string
  description = "Public account that will receive premined native currency"
}

variable "alb_ssl_certificate" {
  type        = string
  description = "The ARN of SSL certificate that will be placed on JSON-RPC ALB"
}
```

#### Ví dụ `terraform.tfvars` {#example-1}
```terraform
premine             = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
alb_ssl_certificate = "arn:aws:acm:us-west-2:123456789:certificate/64c7f117-61f5-435e-878b-83186676a8af"
```

### Các bước triển khai {#deployment-steps}
* tạo tệp `terraform.tfvars`
* thiết lập các biến terraform bắt buộc trong tệp này (như đã giải thích ở trên).
:::info
Có các biến không bắt buộc khác có thể hoàn toàn tùy chỉnh triển khai này.
 Bạn có thể ghi đè các giá trị mặc định khi thêm giá trị của riêng bạn vào tệp `terraform.tfvars`.


Có thể tìm thấy đặc điểm kỹ thuật của tất cả các biến có sẵn trong mục ***[đăng ký](https://registry.terraform.io/modules/aws-ia/polygon-technology-edge/aws)*** Terraform của mô-đun

:::
* đảm bảo bạn đã thiết lập xác thực cli aws đúng cách bằng cách chạy `aws s3 ls` và đảm bảo không có lỗi phát sinh

* triển khai cơ sở hạ tầng `terraform apply`

### Các bước sau khi triển khai
 {#post-deployment-steps}
* sau khi hoàn thành việc triển khai, hãy ghi lại giá trị biến `json_rpc_dns_name` được in trong cli

* tạo một bản ghi dns cname công khai trỏ tên miền của bạn đến giá trị `json_rpc_dns_name` được cung cấp.
 Ví dụ:
  ```shell
  # BIND syntax
  # NAME                            TTL       CLASS   TYPE      CANONICAL NAME
  rpc.my-awsome-blockchain.com.               IN      CNAME     jrpc-202208123456879-123456789.us-west-2.elb.amazonaws.com.
  ```
* khi bản ghi cname được truyền đi, hãy kiểm tra xem chuỗi có hoạt động bình thường hay không bằng cách triển khai điểm cuối JSON-PRC của bạn.   
 Từ ví dụ phía trên:
  ```shell
    curl  https://rpc.my-awsome-blockchain.com -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
  ```

## Quy trình hủy
 {#destroy-procedure}
:::warning
Quy trình sau sẽ xóa vĩnh viễn toàn bộ cơ sở hạ tầng được triển khai bằng các tập lệnh terraform này.    
 Đảm bảo rằng bạn có [bản sao lưu dữ liệu blockchain](docs/edge/working-with-node/backup-restore) thích hợp và/hoặc làm việc trên môi trường thử nghiệm.

:::

Nếu bạn cần xóa toàn bộ cơ sở hạ tầng, hãy chạy lệnh sau `terraform destroy`.    Ngoài ra, bạn sẽ cần xóa thủ công các bí mật được lưu trữ trong [Bộ nhớ Tham số](https://aws.amazon.com/systems-manager/features/) AWS
 dành cho khu vực đã diễn ra việc triển khai.


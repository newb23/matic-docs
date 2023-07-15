---
id: validator-hosting
title: Lưu trữ trình xác thực

description: "Điều kiện để thực hiện lưu trữ đối với Polygon Edge\n"
keywords:
- docs
- polygon
- edge
- hosting
- cloud
- setup
- validator
---

Dưới đây là các đề xuất để lưu trữ đúng cách một nút trình xác thực trong mạng Polygon Edge.
 Vui lòng chú ý đến tất cả các mục được liệt kê dưới đây để đảm bảo
 rằng thiết lập trình xác thực của bạn được định cấu hình đúng cách, mang lại sự an toàn, ổn định và hoạt động hiệu quả.


## Kiến thức cơ bản
 {#knowledge-base}

Trước khi vận hành nút trình xác thực, vui lòng đọc kỹ tài liệu này.
    Các tài liệu bổ sung có thể hữu ích là:


- [Cài đặt](get-started/installation)
- [Thiết lập đám mây](get-started/set-up-ibft-on-the-cloud)
- [Lệnh CLI](get-started/cli-commands)
- [Tệp cấu hình máy chủ](configuration/sample-config)
- [Khóa riêng tư](configuration/manage-private-keys)
- [Số liệu Prometheus
](configuration/prometheus-metrics)
- [Trình quản lý bí mật](/docs/category/secret-managers)
- [Sao lưu/Phục hồi ](working-with-node/backup-restore)

## Yêu cầu hệ thống tối thiểu {#minimum-system-requirements}

| Loại | Giá trị | Ảnh hưởng bởi |
|------|------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|
| CPU | 2 lõi
 | <ul><li>Số lượng truy vấn JSON-RPC</li><li>Kích thước của trạng thái blockchain</li><li>Giới hạn gas khối</li><li>Thời gian khối</li></ul> |
| RAM | 2 GB | <ul><li>Số lượng truy vấn JSON-RPC</li><li>Kích thước của trạng thái blockchain</li><li>Giới hạn gas khối</li></ul> |
| Ổ đĩa | <ul><li>10 GB phân vùng gốc</li><li>30 GB phân vùng gốc với LVM cho phép mở rộng</li></ul> | <ul><li>Kích thước của trạng thái blockchain</li></ul> |


## Cấu hình dịch vụ {#service-configuration}

Nhị phân `polygon-edge` cần hoạt động như một dịch vụ hệ thống tự động khi kết nối mạng được thiết lập và có
 các chức năng khởi động / dừng / khởi động lại.
 Chúng tôi khuyến nghị sử dụng trình quản lý dịch vụ như `systemd.`

Ví dụ `systemd` tệp cấu hình hệ thống:

```
[Unit]
Description=Polygon Edge Server
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=10
User=ubuntu
ExecStart=/usr/local/bin/polygon-edge server --config /home/ubuntu/polygon/config.yaml

[Install]
WantedBy=multi-user.target
```

### Nhị phân {#binary}

Trong khối lượng vận hành `polygon-edge` chỉ nên triển khai nhị phân từ các tệp nhị phân phát hành GitHub được tạo sẵn - thay vì biên dịch thủ công.
:::info
Bằng cách biên dịch thủ công nhánh GitHub `develop`, bạn có thể thực hiện những thay đổi đột phá trong môi trường của mình.    
 Vì vậy, bạn chỉ nên triển khai nhị phân Polygon Edge từ các bản phát hành, vì các bản này sẽ chứa
 thông tin về những thay đổi lớn và cách khắc phục chúng.

:::

Vui lòng tham khảo mục [Cài đặt](/docs/edge/get-started/installation) để có thông tin tổng quan về phương pháp cài đặt.


### Lưu trữ dữ liệu
 {#data-storage}

Thư mục `data/` chứa toàn bộ trạng thái blockchain nên được đặt trên một ổ đĩa chuyên dụng, có thể
 tự động sao lưu, mở rộng bộ nhớ và cho phép gắn vào một phiên bản khác trong trường hợp bị lỗi.



### Tệp bản ghi {#log-files}

Các tệp bản ghi cần được luân chuyển hàng ngày (bằng công cụ như `logrotate`).
:::warning
Nếu được định cấu hình mà không luân chuyển bản ghi, các tệp bản ghi có thể sử dụng hết dung lượng ổ cứng có sẵn, làm gián đoạn thời gian hoạt động của trình xác thực.

:::

Ví dụ  `logrotate`cấu hình:
```
/home/ubuntu/polygon/logs/node.log
{
        rotate 7
        daily
        missingok
        notifempty
        compress
        prerotate
                /usr/bin/systemctl stop polygon-edge.service
        endscript
        postrotate
                /usr/bin/systemctl start polygon-edge.service
        endscript
}
```


Tham khảo phần [Bản ghi](#logging) bên dưới để xem các khuyến nghị về lưu trữ bản ghi.


### Các mục phụ thuộc bổ sung
 {#additional-dependencies}

`polygon-edge` được biên dịch tĩnh, không yêu cầu thêm các mục phụ thuộc vào hệ điều hành máy chủ.


## Bảo trì {#maintenance}

Dưới đây là các phương pháp tốt nhất để duy trì hoạt động của nút trình xác thực trên mạng Polygon Edge.


### Sao lưu {#backup}

Có hai loại quy trình sao lưu được khuyến nghị dành cho nút Polygon Edge.


Bạn nên sử dụng cả hai nếu có thể, với bản sao lưu Polygon Edge luôn sẵn sàng.


* ***Sao lưu dữ liệu***    : Sao lưu hàng ngày dữ liệu `data/` của nút Polygon Edge hoặc của VM hoàn chỉnh nếu có thể.



* ***Sao lưu Polygon Edge***    : Chúng tôi khuyến nghị sử dụng Hoạt động CRON hàng ngày để thực hiện sao lưu thường xuyên Polygon Edge và di chuyển các tệp `.dat` đến vị trí ngoại vi hoặc bộ lưu trữ đối tượng đám mây an toàn.


Bản sao lưu Polygon Edge lý tưởng sẽ không chồng chéo với bản sao lưu dữ liệu ở trên.


Tham khảo mục [Sao lưu/khôi phục phiên bản của nút](working-with-node/backup-restore) để xem hướng dẫn về cách thực hiện sao lưu Polygon Edge.

### Bản ghi {#logging}

Các bản ghi được xuất bởi nút Polygon Edge cần:

- được gửi đến kho dữ liệu bên ngoài có khả năng lập chỉ mục và tìm kiếm

- có thời gian lưu trữ là 30 ngày


Nếu đây là lần đầu bạn thiết lập trình xác thực Polygon Edge, chúng tôi khuyên bạn nên khởi động nút
 với tùy chọn `--log-level=DEBUG` để có thể nhanh chóng gỡ lỗi nếu gặp phải bất kỳ sự cố nào.


:::info
 `--log-level=DEBUG` sẽ đảm bảo đầu ra bản ghi của nút cụ thể nhất có thể.   
 Bản ghi gỡ lỗi sẽ làm tăng đáng kể kích thước của tệp bản ghi, hãy cân nhắc vấn đề này khi thiết lập
 giải pháp luân chuyên bản ghi.
:::
### Bản vá bảo mật hệ điều hành
 {#os-security-patches}

Ít nhất một lần mỗi tháng, quản trị viên cần đảm bảo rằng hệ điều hành của phiên bản trình xác thực được cập nhật với các bản vá mới nhất.


## Chỉ số {#metrics}

### Chỉ số hệ thống
 {#system-metrics}

Quản trị viên cần thiết lập một trình giám sát chỉ số hệ thống, (ví dụ: Telegraf + InfluxDB + Grafana hoặc SaaS của bên thứ ba).


Thiết lập các chỉ số cần được theo dõi và cảnh báo:


| Tên chỉ số
 | Ngưỡng báo động
 |
|-----------------------|-------------------------------|
| Mức sử dụng CPU (%)
 | > 90% trong hơn 5 phút
 |
| Mức sử dụng RAM (%) | > 90% trong hơn 5 phút
 |
| Sử dụng ổ đĩa gốc
 | > 90% |
| Sử dụng ổ đĩa dữ liệu | > 90% |

### Chỉ số trình xác thực
 {#validator-metrics}

Quản trị viên cần thiết lập bộ chỉ số từ API Prometheus của Polygon Edge để có thể
 giám sát hiệu suất của blockchain.


Tham khảo [Chỉ số Prometheus](configuration/prometheus-metrics) để hiểu rõ về các chỉ số được hiển thị và cách thiết lập bộ chỉ số Prometheus.



Cần đặc biệt chú ý đến các chỉ số sau:

- ***Thời gian sản xuất khối*** - nếu thời gian sản xuất cao hơn bình thường, có thể có vấn đề tiềm ẩn với mạng lưới
- ***Số lượng lượt đồng thuận*** - nếu có nhiều hơn 1 lượt, có thể có vấn đề tiềm ẩn với tập hợp trình xác thực của mạng lưới
- ***Số lượng máy ngang hàng*** - nếu số lượng máy ngang hàng giảm, báo hiện có sự cố kết nối trong mạng
 lưới

## Bảo mật {#security}

Dưới đây là các phương pháp tốt nhất để đảm bảo hoạt động của nút trình xác thực trên mạng Polygon Edge.


### Dịch vụ API {#api-services}

- ***JSON-RPC*** - Chỉ dịch vụ API cần được công khai (trực tiếp hoặc thông qua bộ cân bằng tải).   
 API có thể hoạt động trên tất cả các giao diện hoặc trên địa chỉ IP cụ thể (ví dụ:  `--json-rpc 0.0.0.0:8545`hoặc  `--json-prc 192.168.1.1:8545`):::info
Vì đây là API công khai, bạn nên sử dụng bộ cân bằng tải/proxy ngược để đảm bảo về bảo mật và giới hạn tốc độ.

:::


- ***LibP2P*** - Đây là API kết nối mạng được các nút sử dụng để giao tiếp ngang hàng.
 API này cần hoạt động được trên tất cả các giao diện hoặc trên một địa chỉ IP cụ thể
 (  `--libp2p 0.0.0.0:1478`hoặc  `--libp2p 192.168.1.1:1478`). API này không được hiển thị công khai,
 nhưng có thể được truy cập từ tất cả các nút.
:::info
Nếu được chạy trên localhost ( `--libp2p 127.0.0.1:1478`) các nút khác sẽ không thể kết nối.

:::


- ***GRPC***- API này chỉ được sử dụng để chạy các lệnh của trình điều hành.
 Vì vậy, nó sẽ hoạt động riêng trên localhost ( `--grpc-address 127.0.0.1:9632`).


### Bí mật Polygon Edge {#polygon-edge-secrets}

Bí mật Polygon Edge (  `ibft` và khóa `libp2p`) không được lưu trên hệ thống tệp cục bộ.   Thay vào đó, nên sử dụng một [Trình quản lý bí mật](configuration/secret-managers/set-up-aws-ssm) được hỗ trợ .    Việc lưu trữ bí mật vào hệ thống tệp cục bộ chỉ nên được áp dụng trong môi trường phi vận hành.


## Cập nhật {#update}

Sau đây là quy trình cập nhật cho các nút trình xác thực, được mô tả theo từng bước.


### Quy trình cập nhật {#update-procedure}

- Tải xuống nhị phân Polygon Edge mới nhất từ ​​[bản phát hành](https://github.com/0xPolygon/polygon-edge/releases) GitHub chính thứ
c
- Dừng dịch vụ Polygon Edge (ví dụ: `sudo systemctl stop polygon-edge.service`)

- Thay thế tệp nhị phân `polygon-edge` hiện có bằng tệp đã tải xuống (ví dụ: `sudo mv polygon-edge /usr/local/bin/`)

- Kiểm tra xem phiên bản `polygon-edge` đang dùng có chính xác hay không bằng cách chạy  `polygon-edge version`- phải tương ứng với phiên bản phát hành

- Kiểm tra tài liệu phát hành và có cần thực hiện các bước tương thích ngược cần thiết hay không trước khi bắt đầu dịch vụ `polygon-edge`

- Bắt đầu dịch vụ `polygon-edge` (ví dụ: `sudo systemctl start polygon-edge.service`)
- Cuối cùng, kiểm tra kết quả bản ghi `polygon-edge` và đảm bảo mọi thứ hoạt động mà không phát sinh bản ghi  `[ERROR]`

:::warning
Khi có một bản phát hành ngắt, quy trình cập nhật này phải được thực hiện trên tất cả các nút vì
 tệp nhị phân đang chạy không tương thích với bản phát hành mới.


Điều này có nghĩa là chuỗi phải được tạm dừng trong một khoảng thời gian ngắn (cho đến khi mã nhị phân `polygon-edge` được thay thế và dịch vụ được khởi động lại)
 vì vậy hãy lên kế hoạch hợp lý.


Bạn có thể sử dụng các công cụ như **[Ansible](https://www.ansible.com/)** hoặc một số tập lệnh tùy chỉnh để cập nhật hiệu quả
 và giảm thiểu thời gian chuỗi ngừng hoạt động.

:::

## Quy trình khởi động {#startup-procedure}

Sau đây là luồng tối ưu cho quy trình khởi động của trình xác thực Polygon Edge


- Tham khảo thêm các tài liệu được liệt kê trong phần [Kiến thức cơ bản](#knowledge-base)

- Áp dụng các bản vá hệ điều hành mới nhất trên nút trình xác thực

- Tải xuống bản nhị phân `polygon-edge` mới nhất từ​​ bản [phát hành](https://github.com/0xPolygon/polygon-edge/releases) GitHub chính thức và đặt trong phiên bản cục bộ
`PATH`
- Khởi động một trong những [trình quản lý bí mật](/docs/category/secret-managers) được hỗ trợ bằng lệnh CLI `polygon-edge secrets generate`
- Tạo và lưu trữ bí mật bằng [lệnh CLI](/docs/edge/get-started/cli-commands#secrets-init-flags)`polygon-edge secrets init`
- Ghi lại các giá trị `NodeID` và `Public key (address)`

- Tạo tập tin `genesis.json` theo mô tả trong mục [thiết lập đám mây](get-started/set-up-ibft-on-the-cloud#step-3-generate-the-genesis-file-with-the-4-nodes-as-validators)  bằng [lệnh CLI](/docs/edge/get-started/cli-commands#genesis-flags)  `polygon-edge genesis`.

- Tạo tệp cấu hình mặc định bằng [lệnh CLI](/docs/edge/configuration/sample-config)`polygon-edge server export`
- Sửa tệp `default-config.yaml` để phù hợp với môi trường nút trình xác thực cục bộ (các đường dẫn tệp, v.v.)
- Tạo một dịch vụ Polygon Edge ( `systemd`hoặc tương tự) trong đó nhị phân `polygon-edge` sẽ vận hành máy chủ từ tệp `default-config.yaml`

- Khởi động máy chủ Polygon Edge bằng cách khởi động dịch vụ (ví dụ: `systemctl start polygon-edge`)

- Kiểm tra đầu ra bản ghi `polygon-edge`, đảm bảo rằng các khối đang được tạo ra và không có bản ghi `[ERROR]`

- Kiểm tra chức năng chuỗi bằng cách triển khai phương thức JSON-RPC như
[`eth_chainId`](/docs/edge/api/json-rpc-eth#eth_chainid)

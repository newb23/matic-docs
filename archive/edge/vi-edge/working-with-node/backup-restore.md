---
id: backup-restore
title: Sao lưu/khôi phục phiên bản nút

description: "Cách sao lưu và khôi phục một phiên bản nút Polygon Edge.\n"
keywords:
  - docs
  - polygon
  - edge
  - instance
  - restore
  - directory
  - node
---

## Tổng quan {#overview}

Hướng dẫn này đi vào chi tiết cách thức sao lưu và khôi phục một phiên bản nút Polygon Edge.
 Phần này gồm các thư mục cơ sở và nội dung bên trong, cũng như thông tin về các tệp quan trọng để thực hiện sao lưu và khôi phục thành công.


## Thư mục cơ bản {#base-folders}

Polygon Edge tận dụng LevelDB làm công cụ lưu trữ.
 Khi khởi động nút Polygon Edge, các thư mục con sau đây sẽ được tạo trong thư mục chỉ định:

* **blockchain** - Lưu trữ dữ liệu blockchain
* **trie** - Lưu trữ các Merkle trie (dữ liệu trạng thái thế giới)
* **keystore** - Lưu trữ khóa riêng dành cho máy khách. Mục này gồm khóa riêng tư libp2p và khóa niêm phong/trình xác thực
* **consensus** - Lưu trữ bất kỳ thông tin đồng thuận nào mà máy khách có thể cần đến khi hoạt động. Hiện tại, mục này lưu trữ *khóa trình xác thực riêng tư* của nút

Điều quan trọng là các thư mục này phải được bảo quản để phiên bản Polygon Edge có thể hoạt động trơn tru.


## Tạo bản sao lưu từ một nút đang hoạt động và khôi phục cho nút mới
 {#create-backup-from-a-running-node-and-restore-for-new-node}

Phần này hướng dẫn bạn cách tạo dữ liệu lưu trữ của blockchain trên một nút đang hoạt động và khôi phục nó trong một phiên bản khác.


### Sao lưu {#backup}

Lệnh `backup` nạp các khối từ một nút đang hoạt động bằng gRPC và tạo một tệp lưu trữ.
 Nếu `--from` và `--to` không được cho sẵn trong lệnh, lệnh này sẽ nạp các khối từ genesis đến mới nhất.

```bash
$ polygon-edge backup --grpc-address 127.0.0.1:9632 --out backup.dat [--from 0x0] [--to 0x100]
```

### Khôi phục
 {#restore}

Máy chủ nhập các khối từ kho lưu trữ khi bắt đầu khi được kích hoạt bằng cờ `--restore`.
 Hãy đảm bảo rằng có khóa cho mỗi nút mới.
 Để tìm hiểu thêm về việc nhập hoặc tạo khóa, hãy truy cập [phần Quản lý bí mật](/docs/edge/configuration/secret-managers/set-up-aws-ssm).

```bash
$ polygon-edge server --restore archive.dat
```

## Sao lưu/Khôi phục toàn bộ dữ liệu
 {#back-up-restore-whole-data}

Phần này sẽ hướng dẫn cách sao lưu dữ liệu bao gồm dữ liệu trạng thái và khóa, cũng như cách khôi phục vào phiên bản mới.


### Bước 1: Dừng máy khách đang chạy
 {#step-1-stop-the-running-client}

Vì Polygon Edge sử dụng **LevelDB** để lưu trữ dữ liệu, nút cần dừng hoạt động trong suốt thời gian sao lưu,
 vì **LevelDB** không cho phép truy cập đồng thời vào các tệp cơ sở dữ liệu.


Ngoài ra, Polygon Edge cũng thực hiện đẩy dữ liệu khi đóng.


Bước đầu tiên là cần dừng máy khách đang hoạt động (thông qua trình quản lý dịch vụ hoặc một số cơ chế có thể gửi tín hiệu SIGINT đến quy trình),
 qua đó, cho phép kích hoạt 2 sự kiện trong khi tắt:

* Thực hiển đẩy dữ liệu sang đĩa

* Phát hành khóa các tệp DB bằng LevelDB


### Bước 2: Sao lưu thư mục
 {#step-2-backup-the-directory}

Tới bước này, khi máy khách không hoạt động, thư mục dữ liệu có thể được sao lưu sang một phương tiện khác.
 Lưu ý rằng các tệp có phần mở rộng `.key` sẽ chứa dữ liệu khóa riêng tư có thể được sử dụng để mạo danh nút hiện tại,
 nên không được chia sẻ chúng với một bên thứ ba/không xác định.


:::info
Vui lòng sao lưu và khôi phục tệp `genesis` đã tạo theo cách thủ công, để nút được khôi phục hoạt động hoàn toàn.

:::

## Khôi phục
 {#restore-1}

### Bước 1: Dừng máy khách đang chạy
 {#step-1-stop-the-running-client-1}

Nếu bất kỳ phiên bản nào của Polygon Edge đang hoạt động, nó cần phải dừng lại để bước 2 có thể thành công.


### Bước 2: Sao chép thư mục dữ liệu đã sao lưu vào thư mục mong muốn
 {#step-2-copy-the-backed-up-data-directory-to-the-desired-folder}

Khi máy khách ngưng hoạt động, thư mục dữ liệu đã được sao lưu trước đó có thể được sao chép sang thư mục mong muốn.
 Ngoài ra, khôi phục tệp `genesis`đã sao chép trước đó.


### Bước 3: Chạy máy khách Polygon Edge khi đang chỉ định thư mục dữ liệu chính xác
 {#step-3-run-the-polygon-edge-client-while-specifying-the-correct-data-directory}

Để Polygon Edge có thể sử dụng thư mục dữ liệu đã khôi phục, khi khởi chạy, người dùng cần chỉ định đường dẫn đến
 thư mục dữ liệu. Vui lòng tham khảo phần [Lệnh CLI](/docs/edge/get-started/cli-commands) để biết thông tin về thông tin về cờ `data-dir`.

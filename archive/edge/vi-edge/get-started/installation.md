---
id: installation
title: Cài đặt
description: "Cách cài đặt Polygon Edge.\n"
keywords:
  - docs
  - polygon
  - edge
  - install
  - installation
---

Vui lòng tham khảo phương pháp cài đặt phù hợp hơn với bạn.


Khuyến nghị của chúng tôi là sử dụng các bản phát hành được tạo sẵn và xác minh các tổng kiểm tra được cấp.


## Bản phát hành được tạo sẵn
 {#pre-built-releases}

Vui lòng tham khảo trang [Bản phát hành GitHub](https://github.com/0xPolygon/polygon-edge/releases) để xem danh sách các bản phát hành.


Polygon Edge đi kèm các mã nhị phân AMD64/ARM64 được biên dịch chéo cho Darwin và Linux.


---

## Hình ảnh Docker
 {#docker-image}

Hình ảnh Docker chính thức được lưu trữ trong [hub.docker.com registry](https://hub.docker.com/r/0xpolygon/polygon-edge).


`docker pull 0xpolygon/polygon-edge:latest`

---

## Xây dựng từ nguồn {#building-from-source}

Trước khi sử dụng `go install` hãy đảm bảo rằng bạn đã cài đặt Go `>=1.18` và định cấu hình phù hợp.


Chi nhánh ổn định là chi nhánh của sự phát hành mới nhất.

```shell
git clone https://github.com/0xPolygon/polygon-edge.git
cd polygon-edge/
go build -o polygon-edge main.go
sudo mv polygon-edge /usr/local/bin
```

---

## Sử dụng `go install`

Trước khi sử dụng `go install` hãy đảm bảo rằng bạn đã cài đặt Go `>=1.17` và định cấu hình phù hợp.


`go install github.com/0xPolygon/polygon-edge@release/<latest release>`

Việc nhị phân sẽ có sẵn trong biến `GOBIN`môi trường của bạn, và sẽ bao gồm sự thay đổi từ sự phát hành mới nhất. Bạn có thể kiểm tra [Github Feleases](https://github.com/0xPolygon/polygon-edge/releases) để tìm ra ai là người mới nhất.

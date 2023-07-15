---
id: installation
title: Kurulum
description: "Polygon Edge nasıl kurulur?"
keywords:
  - docs
  - polygon
  - edge
  - install
  - installation
---

Lütfen sizin için daha uygun olan kurulum yöntemine bakın.

Önerimiz, önceden oluşturulmuş sürümleri kullanmak ve sağlanan dosya özetlerini doğrulamaktır.

## Önceden oluşturulmuş sürümler {#pre-built-releases}

Sürümlerin listesi için lütfen [GitHub Sürümleri](https://github.com/0xPolygon/polygon-edge/releases) sayfasına başvurun.

Polygon Edge, Darwin ve Linux için çapraz derlenmiş AMD64/ARM64 ikili dosyaları ile birlikte gelir.

---

## Docker görüntüsü {#docker-image}

Resmî Docker görüntüleri, [hub.docker.com kayıt defteri](https://hub.docker.com/r/0xpolygon/polygon-edge) altında barındırılır.

`docker pull 0xpolygon/polygon-edge:latest`

---

## Kaynaktan oluşturma {#building-from-source}

Kullanmadan önce `go install`Go'nun yüklü olduğundan`>=1.18` ve doğru bir şekilde yapılandırıldığından emin olun.

Kararlı şube en son sürümün dalıdır.

```shell
git clone https://github.com/0xPolygon/polygon-edge.git
cd polygon-edge/
go build -o polygon-edge main.go
sudo mv polygon-edge /usr/local/bin
```

---

## `go install` Kullanımı

Kullanmadan önce `go install`Go'nun yüklü olduğundan`>=1.17` ve doğru bir şekilde yapılandırıldığından emin olun.

`go install github.com/0xPolygon/polygon-edge@release/<latest release>`

İkili `GOBIN`çevrenizde mevcut olacak ve en son sürümden gelen değişiklikleri içerecektir. Hangisinin en son olduğunu öğrenmek için [GitHub Releases](https://github.com/0xPolygon/polygon-edge/releases) çıkışını kontrol edebilirsiniz.

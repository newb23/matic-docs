---
id: installation
title: Установка
description: "Как установить Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - install
  - installation
---

Вы можете применить тот способ установки, который наиболее вам удобен.

Мы рекомендуем использовать предварительно построенные релизы и проверять предоставленные контрольные суммы.

## Предварительно построенные релизы {#pre-built-releases}

Вы можете увидеть список всех релизов на странице [Релизы GitHub](https://github.com/0xPolygon/polygon-edge/releases).

Polygon Edge поставляется с кросс-компилированными двоичными файлами AMD64/ARM64 для Darwin и Linux.

---

## Изображение Docker {#docker-image}

Официальные изображения Docker размещаются в [реестре hub.docker.com](https://hub.docker.com/r/0xpolygon/polygon-edge).

`docker pull 0xpolygon/polygon-edge:latest`

---

## Построение из источника {#building-from-source}

Перед тем как использовать `go install`, убедитесь, что вы установили и правильно настроили Go `>=1.18`.

Стабильный филиал — это ветка последнего релиза.

```shell
git clone https://github.com/0xPolygon/polygon-edge.git
cd polygon-edge/
go build -o polygon-edge main.go
sudo mv polygon-edge /usr/local/bin
```

---

## Использование `go install`

Перед тем как использовать `go install`, убедитесь, что вы установили и правильно настроили Go `>=1.17`.

`go install github.com/0xPolygon/polygon-edge@release/<latest release>`

Бинарный будет доступен в переменной `GOBIN`окружения, и будет включать изменения из последнего релиза. Вы можете оформить заказ на [GitHub Releases](https://github.com/0xPolygon/polygon-edge/releases), чтобы узнать, кто из них является последним.

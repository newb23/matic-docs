---
id: installation
title: 설치
description: "Polygon 엣지 설치 방법."
keywords:
  - docs
  - polygon
  - edge
  - install
  - installation
---

적절한 설치 방법을 참조하세요.

사전 빌드된 릴리스를 사용하고 제공된 체크섬을 확인하는 것을 권장합니다.

## 사전 빌드된 릴리스 {#pre-built-releases}

릴리스 목록은 [GitHub 릴리스](https://github.com/0xPolygon/polygon-edge/releases) 페이지를 참조하세요.

Polygon 엣지는 Darwin 및 Linux용으로 교차 컴파일된 AMD64/ARM64 바이너리와 함께 제공됩니다.

---

## Docker 이미지 {#docker-image}

공식 Docker 이미지는 [hub.docker.com 레지스트리](https://hub.docker.com/r/0xpolygon/polygon-edge)에서 호스팅됩니다.

`docker pull 0xpolygon/polygon-edge:latest`

---

## 소스에서 빌드하기 {#building-from-source}

`go install`을 사용하기 전에 Go `>=1.18`을 설치하고 적절히 구성했는지 확인하세요.

안정적인 지점은 최신 릴리스의 지점입니다.

```shell
git clone https://github.com/0xPolygon/polygon-edge.git
cd polygon-edge/
go build -o polygon-edge main.go
sudo mv polygon-edge /usr/local/bin
```

---

## `go install` 사용하기

`go install`을 사용하기 전에 Go `>=1.17`을 설치하고 적절히 구성했는지 확인하세요.

`go install github.com/0xPolygon/polygon-edge@release/<latest release>`

바이너리 변수는 `GOBIN`환경 변수에 사용할 수 있으며, 최신 릴리스의 변경을 포함합니다. [GitHub를](https://github.com/0xPolygon/polygon-edge/releases) 체크 아웃하여 최신 중 어느 것이 있는지 알 수 있습니다.

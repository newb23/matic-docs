---
id: installation
title: Pag-install
description: "Kung paano i-install ang Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - install
  - installation
---

Mangyaring sumangguni sa paraan ng pag-install na mas naaangkop sa iyo.

Ang aming rekomendasyon ay ang paggamit ng mga pre-built na release at i-verify ang mga ibinigay na checksum.

## Mga pre-built na release {#pre-built-releases}

Mangyaring sumangguni sa pahina ng [mga GitHub Release](https://github.com/0xPolygon/polygon-edge/releases) para sa listahan ng mga release.

Ang Polygon Edge ay may cross-compiled na AMD64/ARM64 na mga binary para sa Darwin at Linux.

---

## Docker image {#docker-image}

Ang mga opisyal na Docker image ay naka-host sa ilalim ng [registry ng hub.docker.com](https://hub.docker.com/r/0xpolygon/polygon-edge).

`docker pull 0xpolygon/polygon-edge:latest`

---

## Pagbuo mula sa source {#building-from-source}

Bago gamitin ang `go install` siguraduhin na mayroon kang Go na `>=1.18` naka-install at maayos na naka-configure.

Ang matatag na branch ang sangay ng pinakabagong release.

```shell
git clone https://github.com/0xPolygon/polygon-edge.git
cd polygon-edge/
go build -o polygon-edge main.go
sudo mv polygon-edge /usr/local/bin
```

---

## Paggamit `go install`

Bago gamitin ang `go install` siguraduhin na mayroon kang Go na `>=1.17` naka-install at maayos na naka-configure.

`go install github.com/0xPolygon/polygon-edge@release/<latest release>`

Makukuha ang binary sa variable ng iyong `GOBIN`kapaligiran, at isasama ang mga pagbabago mula sa pinakabagong release. Maaari mong checkout ang [Mga Release](https://github.com/0xPolygon/polygon-edge/releases) ng GitHub para malaman kung alin ang isa ang pinakabago.

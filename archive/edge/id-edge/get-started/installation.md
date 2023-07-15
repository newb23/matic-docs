---
id: installation
title: Instalasi
description: "Cara menginstal Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - install
  - installation
---

Silakan merujuk metode instalasi yang lebih sesuai untuk Anda.

Rekomendasi kami yakni menggunakan rilis siap pakai dan verifikasi checksum yang tersedia.

## Rilis siap pakai {#pre-built-releases}

Lihat halaman [Rilis GitHub](https://github.com/0xPolygon/polygon-edge/releases) untuk daftar rilisan.

Polygon Edge dilengkapi biner AMD64/ARM64 kompilasi silang untuk Darwin dan Linux.

---

## Citra Docker {#docker-image}

Citra Docker resmi dihos di [registri hub.docker.com](https://hub.docker.com/r/0xpolygon/polygon-edge).

`docker pull 0xpolygon/polygon-edge:latest`

---

## Membangun dari sumber {#building-from-source}

Sebelum menggunakan `go install`, pastikan Anda sudah menginstal Go `>=1.18` dan telah mengonfigurasinya dengan tepat.

Cabang stabil adalah cabang dari rilis terbaru.

```shell
git clone https://github.com/0xPolygon/polygon-edge.git
cd polygon-edge/
go build -o polygon-edge main.go
sudo mv polygon-edge /usr/local/bin
```

---

## Menggunakan `go install`

Sebelum menggunakan `go install`, pastikan Anda sudah menginstal Go `>=1.17` dan telah mengonfigurasinya dengan tepat.

`go install github.com/0xPolygon/polygon-edge@release/<latest release>`

biner akan tersedia dalam variabel `GOBIN`lingkungan Anda, dan akan mencakup perubahan dari rilis terbaru. Anda dapat memeriksa [Release GitHub](https://github.com/0xPolygon/polygon-edge/releases) untuk mencari tahu yang mana yang paling terbaru.

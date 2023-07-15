---
id: installation
title: Instalação
description: "Como instalar o Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - install
  - installation
---

Consulte o método de instalação que melhor se aplica a si.

Recomendamos que use os lançamentos pré-construídos e verifique os checksums fornecidos.

## Lançamentos pré-construídos {#pre-built-releases}

Consulte a página [Lançamentos do GitHub](https://github.com/0xPolygon/polygon-edge/releases) para uma lista de lançamentos.

O Polygon Edge é fornecido com binários AMD64/ARM64 de compilação cruzada para Darwin e Linux.

---

## Imagem do Docker {#docker-image}

As imagens oficiais do Docker estão hospedadas no [hub.docker.com registry](https://hub.docker.com/r/0xpolygon/polygon-edge).

`docker pull 0xpolygon/polygon-edge:latest`

---

## Construir a partir da fonte {#building-from-source}

Antes de usar `go install`, certifique-se de que tem o Go `>=1.18` instalado e devidamente configurado.

O ramo estável é o ramo da versão mais recente.

```shell
git clone https://github.com/0xPolygon/polygon-edge.git
cd polygon-edge/
go build -o polygon-edge main.go
sudo mv polygon-edge /usr/local/bin
```

---

## Utilizar `go install`

Antes de usar `go install`, certifique-se de que tem o Go `>=1.17` instalado e devidamente configurado.

`go install github.com/0xPolygon/polygon-edge@release/<latest release>`

O binário estará disponível na variável de `GOBIN`ambiente e incluirá as alterações da versão mais recente. Pode verificar as [Liberações do GitHub](https://github.com/0xPolygon/polygon-edge/releases) para saber qual é o mais tardar.

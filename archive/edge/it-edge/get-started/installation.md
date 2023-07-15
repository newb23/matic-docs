---
id: installation
title: Installazione
description: "Come installare Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - install
  - installation
---

Fai riferimento al metodo di installazione che meglio ti si addice.

Il nostro consiglio è di utilizzare le versioni predefinite e di verificare i checksum forniti.

## Versioni predefinite {#pre-built-releases}

Fai riferimento alla pagina [Versioni di GitHub](https://github.com/0xPolygon/polygon-edge/releases)per un elenco di versioni.

Polygon Edge viene fornito con binari AMD64/ARM64 cross-compilati per Darwin e Linux.

---

## Immagine Docker {#docker-image}

Le immagini Docker ufficiali sono ospitate nel [registro hub.docker.com](https://hub.docker.com/r/0xpolygon/polygon-edge).

`docker pull 0xpolygon/polygon-edge:latest`

---

## Costruire dalla sorgente {#building-from-source}

Prima di utilizzare `go install` assicurati di avere Go `>=1.18` installato e configurato correttamente.

La ramo stabile è la ranca dell'ultima release.

```shell
git clone https://github.com/0xPolygon/polygon-edge.git
cd polygon-edge/
go build -o polygon-edge main.go
sudo mv polygon-edge /usr/local/bin
```

---

## Uso di `go install`

Prima di utilizzare `go install` assicurati di avere Go `>=1.17` installato e configurato correttamente.

`go install github.com/0xPolygon/polygon-edge@release/<latest release>`

La binaria sarà disponibile nella tua variabile di `GOBIN`ambiente e includerà le modifiche dell'ultima release. Puoi checkout [GitHub](https://github.com/0xPolygon/polygon-edge/releases) Rilasciare per scoprire quale sia l'ultimo.

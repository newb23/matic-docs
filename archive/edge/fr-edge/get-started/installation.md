---
id: installation
title: Installation
description: "Comment installer Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - install
  - installation
---

Veuillez vous référer à la méthode d'installation qui est la plus applicable à votre cas.

Nous vous recommandons d'utiliser les versions prédéfinies et de vérifier les sommes de contrôle fournies.

## Versions pré-construites {#pre-built-releases}

Veuillez vous référer à la page des [Versions de GitHub](https://github.com/0xPolygon/polygon-edge/releases) pour une liste des versions.

Polygon Edge est livré avec des fichiers binaires AMD64/ARM64 compilés de manière croisée pour Darwin et Linux.

---

## Image Docker {#docker-image}

Les images Docker officielles sont hébergées sur le registre [hub.docker.com](https://hub.docker.com/r/0xpolygon/polygon-edge).

`docker pull 0xpolygon/polygon-edge:latest`

---

## Construire à partir de la source {#building-from-source}

Avant de l'utiliser, `go install` assurez-vous que Go `>=1.18` est installé et correctement configuré.

La branche stable est la branche de la dernière version.

```shell
git clone https://github.com/0xPolygon/polygon-edge.git
cd polygon-edge/
go build -o polygon-edge main.go
sudo mv polygon-edge /usr/local/bin
```

---

## Utilisation de `go install`

Avant de l'utiliser, `go install` assurez-vous que Go `>=1.17` est installé et correctement configuré.

`go install github.com/0xPolygon/polygon-edge@release/<latest release>`

Le binaire sera disponible dans votre variable `GOBIN`d'environnement et inclura les modifications de la dernière version. Vous pouvez consulter [les versions GitHub](https://github.com/0xPolygon/polygon-edge/releases) pour savoir lequel est le plus récent.

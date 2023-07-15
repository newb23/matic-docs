---
id: installation
title: Instalación
description: "Cómo instalar Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - install
  - installation
---

Por favor, consulta el método de instalación más adecuado para ti.

Nuestra recomendación es usar las versiones previamente construidas y verificar las sumas de control suministradas.

## Versiones construidas previamente {#pre-built-releases}

Por favor, consulta la página de las [publicaciones de GitHub](https://github.com/0xPolygon/polygon-edge/releases) para obtener una lista de las publicaciones.

Polygon Edge se presenta con binarios AMD64/ARM64 compilados de forma cruzada para Darwin y Linux.

---

## Imagen de Docker {#docker-image}

Las imágenes oficiales de Docker se alojan en el [registro hub.docker.com](https://hub.docker.com/r/0xpolygon/polygon-edge).

`docker pull 0xpolygon/polygon-edge:latest`

---

## Construcción desde la fuente {#building-from-source}

Antes de usarlo, `go install`asegúrate de que tienes Go `>=1.18`instalado y configurado correctamente.

La ramificación estable es la rama de la última versión.

```shell
git clone https://github.com/0xPolygon/polygon-edge.git
cd polygon-edge/
go build -o polygon-edge main.go
sudo mv polygon-edge /usr/local/bin
```

---

## Uso de `go install`

Antes de usarlo, `go install`asegúrate de que tienes Go `>=1.17`instalado y configurado correctamente.

`go install github.com/0xPolygon/polygon-edge@release/<latest release>`

El binario estará disponible en tu variable de `GOBIN`entorno, e incluirá los cambios de la última versión. Puedes salir de [las versiones de GitHub](https://github.com/0xPolygon/polygon-edge/releases) para averiguar cuál es la última.

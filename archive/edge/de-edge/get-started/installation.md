---
id: installation
title: Installation
description: "Wie installiere ich Polygon Edge?"
keywords:
  - docs
  - polygon
  - edge
  - install
  - installation
---

Bitte wähle die für dich am besten geeignete Installationsmethode.

Wir empfehlen, die vorgefertigten Releases zu verwenden und die angegebenen Prüfsummen zu verifizieren.

## Vorgefertigte Releases {#pre-built-releases}

Auf der Seite [GitHub Releases](https://github.com/0xPolygon/polygon-edge/releases) findest du eine Liste von Releases.

Polygon Edge wird mit per Cross-Compiler erstellten AMD64/ARM64-Binärdateien für Darwin und Linux geliefert.

---

## Docker Image {#docker-image}

Offizielle Docker Images werden unter der [Registry hub.docker.com](https://hub.docker.com/r/0xpolygon/polygon-edge) gehostet.

`docker pull 0xpolygon/polygon-edge:latest`

---

## Von der Quelle aus aufbauen {#building-from-source}

Vergewissere dich vor der Verwendung von `go install`, dass du Go `>=1.18` installiert und richtig konfiguriert hast.

Der stabile Zweig ist der Zweig der neuesten Release.

```shell
git clone https://github.com/0xPolygon/polygon-edge.git
cd polygon-edge/
go build -o polygon-edge main.go
sudo mv polygon-edge /usr/local/bin
```

---

## Verwenden von `go install`

Vergewissere dich vor der Verwendung von `go install`, dass du Go `>=1.17` installiert und richtig konfiguriert hast.

`go install github.com/0xPolygon/polygon-edge@release/<latest release>`

Die Binärdatei ist in deiner `GOBIN`Umgebungsvariable verfügbar und enthält die Änderungen von der neuesten Version. Du kannst [GitHub Releases](https://github.com/0xPolygon/polygon-edge/releases) ausprobieren, um herauszufinden, welche die neueste ist.

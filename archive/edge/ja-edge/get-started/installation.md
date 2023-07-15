---
id: installation
title: インストール
description: "Polygon Edgeをインストールする方法"
keywords:
  - docs
  - polygon
  - edge
  - install
  - installation
---

より適したインストールの方法を参照してください。

事前構築されたリリースを使用し、提供されたチェックサムを確認することを推奨します。

## 事前構築されたリリース {#pre-built-releases}

リリースのリストについては、[GitHubリリース](https://github.com/0xPolygon/polygon-edge/releases)ページを参照してください。

Polygon Edgeには、DarwinとLinuxのクロスコンパイルされたAMD64/ARM64バイナリが付属しています。

---

## Dockerイメージ {#docker-image}

公式Dockerイメージは、[hub.docker.comレジストリ](https://hub.docker.com/r/0xpolygon/polygon-edge)にあります。

`docker pull 0xpolygon/polygon-edge:latest`

---

## ソースからの構築 {#building-from-source}

`go install`を使用する前に、Go`>=1.18`をインストールし、適切に設定されているか確認してください。

安定したブランチは最新リリースであります。

```shell
git clone https://github.com/0xPolygon/polygon-edge.git
cd polygon-edge/
go build -o polygon-edge main.go
sudo mv polygon-edge /usr/local/bin
```

---

## `go install`を使用する

`go install`を使用する前に、Go`>=1.17`をインストールし、適切に設定されているか確認してください。

`go install github.com/0xPolygon/polygon-edge@release/<latest release>`

バイナリは`GOBIN`環境変数で利用可能になり、最新のリリースからの変更が含まれます。[GitHub](https://github.com/0xPolygon/polygon-edge/releases)リリースで最新のものを確認することができます。

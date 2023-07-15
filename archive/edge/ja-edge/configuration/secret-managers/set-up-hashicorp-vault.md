---
id: set-up-hashicorp-vault
title: Hashicorp Vaultの設定
description: "Polygon Edge用のHashicorp Vaultを設定します。"
keywords:
  - docs
  - polygon
  - edge
  - hashicorp
  - vault
  - secrets
  - manager
---

## 概要 {#overview}

現在、Polygon Edgeは2つの主なランタイムシークレットを守ることに関心を持っています：
* ノードがバリデータの場合、ノードによって使用される**バリデータ秘密鍵**
* 他のピアと参加し通信するためにlibp2pによって使用される**ネットワーキング秘密鍵**

:::warning

バリデータ秘密鍵は、各バリデータノードに固有です。同じ鍵をすべてのバリデータ間で共有することは<b>できません</b>。これはチェーンのセキュリティを損なう可能性があるためです。
:::

詳細情報については、[秘密鍵管理ガイド](/docs/edge/configuration/manage-private-keys)を参照してください。

Polygon Edgeのモジュールは**秘密を守る方法を知る必要はありません**。 最終的には、モジュールは秘密が遠くのサーバーに保存されているのかあるいはノードのディスクにローカルで保存されているかは問題にしません。

モジュールが秘密保持について知る必要があるのは、**秘密を使用することを知っている**ことと**どの秘密を取得
または保存**するかを知っていることだけです。 これらの操作のより微細な実装についての詳細は`SecretsManager`に委任されますが、これは言うまでもなく抽象化です。

Polygon Edgeを起動するノードオペレータはどのシークレットマネージャを使用したいかを指定でき、正しいシークレットマネージャがインスタンス化されるとただちに、モジュールが前述のインターフェースを通じて秘密を処理します。介して秘密を処理します。

この文書では、[Hashicorp Vault](https://www.vaultproject.io/)サーバでPolygon Edgeを起動して実行するために必要な手順について詳しく説明します。

:::info 以前のガイド

この記事を読まれる前に、次の記事を読まれることを**強くお勧めしまします**：[**ローカル設定**](/docs/edge/get-started/set-up-ibft-locally)
および[**クラウド設定**](/docs/edge/get-started/set-up-ibft-on-the-cloud)。
:::


## 前提条件 {#prerequisites}

この文書では、Hashicorp Vaultサーバの機能しているインスタンスが**すでに設定されていること**を前提としています。

また、Polygon Edgeに使用されているHashicorp Vaultサーバで**KVストレージを有効にする必要があります**。

続行する前に必要な情報：
* **サーバURL**（Hashicorp VaultサーバのAPI URL）
* **トークン**（KVストレージエンジンへのアクセスに使用されるアクセストークン）

## ステップ1 - シークレットマネージャ設定の生成 {#step-1-generate-the-secrets-manager-configuration}

Polygon EdgeがVaultサーバとシームレスに通信できるようにするには、Vault上のシークレットストレージに必要なすべての情報を含む、すでに生成された設定ファイルを解析する必要があります。

設定を生成するには、次のコマンドを実行します：

```bash
polygon-edge secrets generate --dir <PATH> --token <TOKEN> --server-url <SERVER_URL> --name <NODE_NAME>
```

存在するパラメータ：
* `PATH`は設定ファイルをエクスポートすべきパスです。デフォルトは`./secretsManagerConfig.json`
* `TOKEN`は、[前提条件のセクション](/docs/edge/configuration/secret-managers/set-up-hashicorp-vault#prerequisites)で前述したアクセストークンです
* `SERVER_URL`は、VaultサーバのAPIのURLで、[前提条件のセクション](/docs/edge/configuration/secret-managers/set-up-hashicorp-vault#prerequisites)でも説明されています
* `NODE_NAME`は、Vault設定が設定されている現在のノードの名前です。任意の値を指定できます。デフォルトは`polygon-edge-node`

:::caution ノード名

ノード名を指定する場合は注意してください。

Polygon Edgeは、指定されたノード名を使用して、Vaultインスタンスで生成および使用される秘密を追跡します。既存のノード名を指定すると、Vaultサーバでデータが上書きされることがあります。

秘密は、次の基本パスに保存されます：`secrets/node_name`
:::

## ステップ2 - 設定を使用した秘密鍵の初期化 {#step-2-initialize-secret-keys-using-the-configuration}

すでに設定ファイルが存在するため、必要な秘密鍵をステップ1で設定した設定ファイルで`--config`を使用して初期化できます：

```bash
polygon-edge secrets init --config <PATH>
```

`PATH`パラメータは、ステップ1から以前に生成されたシークレットマネージャパラメータの場所です。

## ステップ3 - ジェネシスファイルの生成 {#step-3-generate-the-genesis-file}

ジェネシスファイルは[**ローカル設定**](/docs/edge/get-started/set-up-ibft-locally)
[**クラウド設定**](/docs/edge/get-started/set-up-ibft-on-the-cloud)ガイドと同様の方法で生成する必要があり、若干の変更が必要です。

Hashicorp Vaultがローカルファイルシステムの代わりに使用されているため、次の`--ibft-validator`フラグを使用してバリデータアドレスを追加する必要があります：
```bash
polygon-edge genesis --ibft-validator <VALIDATOR_ADDRESS> ...
```

## ステップ4 - Polygon Edgeクライアントのスタート {#step-4-start-the-polygon-edge-client}

鍵が設定され、ジェネシスファイルが生成されたため、このプロセスの最終ステップは`server`コマンドでPolygon Edgeを起動することです。

`server`コマンドは前述のガイドと同様の方法に若干の追加 - `--secrets-config`フラグを加えて使用されます：
```bash
polygon-edge server --secrets-config <PATH> ...
```

`PATH`パラメータはステップ1から以前に生成されたシークレットマネージャパラメータの場所になります。
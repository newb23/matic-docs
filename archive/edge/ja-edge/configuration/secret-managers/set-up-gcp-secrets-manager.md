---
id: set-up-gcp-secrets-manager
title: GCPシークレットマネージャの設定
description: "Polygon Edge用のGCPシークレットマネージャを設定します。"
keywords:
  - docs
  - polygon
  - edge
  - gcp
  - secrets
  - manager
---

## 概要 {#overview}

現在、Polygon Edgeは2つの主なランタイムシークレットを守ることに関心を持っています：
* ノードがバリデータの場合、ノードによって使用される**バリデータ秘密鍵**
* 他のピアと参加し通信するため、libp2pによって使用される**ネットワーク秘密鍵**

追加情報については、[秘密鍵の管理ガイド](/docs/edge/configuration/manage-private-keys)をお読みください

Polygon Edgeのモジュールは**秘密を守る方法を知る必要はありません**。 最終的には、モジュールは秘密が遠くのサーバーに保存されているのかあるいはノードのディスクにローカルで保存されているかは問題にしません。

モジュールが秘密保持について知る必要があるのは、**秘密を使用することを知っている**ことと**どの秘密を取得
または保存**するかを知っていることだけです。 これらの操作のより微細な実装についての詳細は`SecretsManager`に委任されますが、これは言うまでもなく抽象化です。

Polygon Edgeを起動するノードオペレータはどのシークレットマネージャを使用したいかを指定でき、正しいシークレットマネージャがインスタンス化されるとただちに、モジュールが前述のインターフェースを通じて秘密を処理します。介して秘密を処理します。

この文書では、[GCPシークレットマネージャ](https://cloud.google.com/secret-manager)でPolygon Edgeを起動して実行するために必要な手順について詳しく説明します。

:::info 以前のガイド

この記事を読まれる前に、次の記事を読まれることを**強くお勧めしまします**：[**ローカル設定**](/docs/edge/get-started/set-up-ibft-locally)
および[**クラウド設定**](/docs/edge/get-started/set-up-ibft-on-the-cloud)。
:::


## 前提条件 {#prerequisites}
### GCP請求アカウント {#gcp-billing-account}
GCPシークレットマネージャを使用するには、ユーザはGCPポータルで[請求アカウント](https://console.cloud.google.com/)を有効にする必要があります。GCPプラットフォーム上の新しいGoogleアカウントには、無料トライアルの王様としてスタートするためのファンドがいくつか提供されています。詳細は[GCPドキュメント](https://cloud.google.com/free)をご覧ください

### シークレットマネージャAPI {#secrets-manager-api}
ユーザは、GCPシークレットマネージャAPIを使用する前に有効にする必要があります。
これは、[シークレットマネージャAPIポータル](https://console.cloud.google.com/apis/library/secretmanager.googleapis.com)から実行できます。詳細情報：[シークレットマネージャ設定](https://cloud.google.com/secret-manager/docs/configuring-secret-manager)

### GCP資格情報 {#gcp-credentials}
最後に、ユーザは認証に使用される新しい資格情報を生成する必要があります。これは、[ここ](https://cloud.google.com/secret-manager/docs/reference/libraries)に記載されている手順に従って行うことができます。   
生成されたjsonファイルには資格情報が含まれており、GCPシークレットマネージャを使用する必要がある各ノードに転送する必要があります。

続行する前に必要な情報：
* **プロジェクトID**（GCPプラットフォームで定義されているプロジェクトID）
* **資格情報ファイルの場所**（資格情報を含むjsonファイルへのパス）

## ステップ1 - シークレットマネージャ設定の生成 {#step-1-generate-the-secrets-manager-configuration}

Polygon EdgeがGCP SMとシームレスに通信できるようにするには、GCP SM上のシークレットストレージに必要なすべての情報を含む、すでに生成された設定ファイルを解析する必要があります。

設定を生成するには、次のコマンドを実行します：

```bash
polygon-edge secrets generate --type gcp-ssm --dir <PATH> --name <NODE_NAME> --extra project-id=<PROJECT_ID>,gcp-ssm-cred=<GCP_CREDS_FILE>
```

存在するパラメータ：
* `PATH`は設定ファイルをエクスポートすべきパスです。デフォルトは`./secretsManagerConfig.json`
* `NODE_NAME`GCP SM設定が設定される現在のノードの名前です。任意の値を指定できます。デフォルトは`polygon-edge-node`
* `PROJECT_ID`は、アカウントの設定およびシークレットマネージャAPIのアクティベーション中にユーザがGCPコンソールで定義したプロジェクトのIDです。
* `GCP_CREDS_FILE`は、シークレットマネージャへの読み取り／書き込みアクセスを許可する資格情報を含むjsonファイルへのパスです。

:::caution ノード名

ノード名を指定する場合は注意してください。

Polygon Edgeは、指定されたノード名を使用して、GCP SMで生成および使用される秘密を追跡します。既存のノード名を指定すると、GCP SMへの秘密の書き込みに失敗する場合があります。

秘密は、次の基本パスに保存されます：`projects/PROJECT_ID/NODE_NAME`

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

GCP SMがローカルファイルシステムの代わりに使用されているため、次の`--ibft-validator`フラグを使用してバリデータアドレスを追加する必要があります：
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
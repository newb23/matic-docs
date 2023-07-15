---
id: set-up-aws-ssm
title: AWS SSM（システムマネージャ）の設定
description: "Polygon EdgeにAWS SSM（システムマネージャ）を設定します。"
keywords:
  - docs
  - polygon
  - edge
  - aws
  - ssm
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

Polygon Edgeを起動するノードオペレータはどのシークレットマネージャを使用したいかを指定でき、正しいシークレットマネージャがインスタンス化されるとただちに、モジュールが前述のインターフェースを通じて秘密を処理します。これには秘密がディスクに保存されているか、またはサーバーにあるかには関わりません。

この記事では、Polygon Edgeを立ち上げ[AWSシステムマネージャパラメータストア](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html)で実行するために必要なステップを示します。

:::info 以前のガイド

この記事を読まれる前に、次の記事を読まれることを**強くお勧めしまします**：[**ローカル設定**](/docs/edge/get-started/set-up-ibft-locally)
および[**クラウド設定**](/docs/edge/get-started/set-up-ibft-on-the-cloud)。
:::


## 前提条件 {#prerequisites}
### IAMポリシー {#iam-policy}
ユーザーはAWSシステムマネージャパラメータストアの読み取り／書き込み操作を可能にするIAMポリシーを作成する必要があります。IAMポリシーを無事作成した後、ユーザーはPolygon Edgeサーバーを実行しているEC2インスタンスにこれを添付する必要があります。IAMポリシーは次のようになります：
```json
{
  "Version": "2012-10-17",
  "Statement" : [
    {
      "Effect" : "Allow",
      "Action" : [
        "ssm:PutParameter",
        "ssm:DeleteParameter",
        "ssm:GetParameter"
      ],
      "Resource" : [
        "arn:aws:ssm:<aws_region>:<aws_account_id>:parameter<ssm-parameter-path>*"
      ]
    }
  ]
}
```
AWS SSM IAMロールに関する詳細情報は[AWSドキュメント](https://docs.aws.amazon.com/systems-manager/latest/userguide/setup-instance-profile.html)で確認できます。

先に進む前に必要な情報：
* **リージョン**（システムマネージャとノードが所在するリージョン）
* **パラメータパス**（秘密が配置される任意のパス、たとえば `/polygon-edge/nodes`）

## ステップ1 -シークレットマネージャ設定の生成 {#step-1-generate-the-secrets-manager-configuration}

Polygon EdgeがAWS SSMとシームレスに通信できるようにするために、AWS SSM上の秘密の保管に必要なすべての情報を含む、すでに生成された設定ファイルを解析する必要があります。

設定を生成するには次のコマンドを実行します：

```bash
polygon-edge secrets generate --type aws-ssm --dir <PATH> --name <NODE_NAME> --extra region=<REGION>,ssm-parameter-path=<SSM_PARAM_PATH>
```

存在するパラメータ：
* `PATH`は設定ファイルをエクスポートすべきパスです。デフォルトは`./secretsManagerConfig.json`
* `NODE_NAME`はAWS SSM設定が設定されている現在のノードの名前です。これは任意の値にすることができます。デフォルトは`polygon-edge-node`
* `REGION`はAWS SSMが存在するリージョンです。これはAWS SSMを利用するノードと同じリージョンでなくてはなりません。
* `SSM_PARAM_PATH`は秘密が保存されるパスの名前です。たとえば、`--name node1`と`ssm-parameter-path=/polygon-edge/nodes`が特定されていれば、秘密は`/polygon-edge/nodes/node1/<secret_name>`として保存されます。

:::caution ノード名

ノード名を指定する場合は注意してください。

Polygon Edgeは、指定されたノード名を使用して、AWS SSMで生成および使用する秘密を追跡します。既存のノード名を指定すると、AWS SSMに秘密を書き込めないという結果をもたらす可能性があります。

秘密は、以下のベースパスに保存されます：`SSM_PARAM_PATH/NODE_NAME`

:::

## ステップ2 - 設定を使用した秘密鍵の初期化 {#step-2-initialize-secret-keys-using-the-configuration}

すでに設定ファイルが存在するため、必要な秘密鍵をステップ1で設定した設定ファイルで`--config`を使用して初期化できます：

```bash
polygon-edge secrets init --config <PATH>
```

`PATH`パラメータはステップ1から以前に生成されたシークレットマネージャパラメータの場所になります。

:::info IAMポリシー

このステップは、読み書き操作を可能にするIAMポリシーが正しく設定されていないおよび／またはこのコマンドを実行するEC2インスタンスに添付されていない場合、失敗します。
:::

## ステップ3 - ジェネシスファイルの生成 {#step-3-generate-the-genesis-file}

ジェネシスファイルは[**ローカル設定**](/docs/edge/get-started/set-up-ibft-locally)
および[**クラウド設定**](/docs/edge/get-started/set-up-ibft-on-the-cloud)ガイドと同様の方法に、多少の変更を加えて生成する必要があります。

AWS SSMがローカルなファイルシステムの代わりに使用されているため、`--ibft-validator`フラグを通じてバリデータアドレスを追加する必要があります。
```bash
polygon-edge genesis --ibft-validator <VALIDATOR_ADDRESS> ...
```

## ステップ4 - Polygon Edgeクライアントの起動 {#step-4-start-the-polygon-edge-client}

鍵が設定され、ジェネシスファイルが生成されたため、このプロセスの最終ステップは`server`コマンドでPolygon Edgeを起動することです。

`server`コマンドは前述のガイドと同様の方法に若干の追加 - `--secrets-config`フラグを加えて使用されます：
```bash
polygon-edge server --secrets-config <PATH> ...
```

`PATH`パラメータはステップ1から以前に生成されたシークレットマネージャパラメータの場所になります。
---
id: terraform-aws-deployment
title: Terraform AWSデプロイメント
description: "Terraformを使用してAWSクラウドプロバイダにPolygon Edgeネットワークをデプロイする"
keywords:
  - docs
  - polygon
  - edge
  - deployment
  - terraform
  - aws
  - script
---
:::info 実稼働環境デプロイメントガイド
これは、公式の実稼働対応の完全自動化AWS導入ガイドです。

***[クラウド](set-up-ibft-on-the-cloud)***または***[ローカル](set-up-ibft-locally)***への手動での展開は、テスト用やクラウドプロバイダがAWSではない場合に推奨されます。
:::

:::info
このデプロイメントはPoAだけです。   
PoSメカニズムが必要な場合は、この***[ガイド](/docs/edge/consensus/migration-to-pos)***に従ってPoAからPoSに切り替えます。
:::

このガイドでは、バリデータノードが複数の可用性領域にまたがっているため、実稼働可能なAWSクラウドプロバイダにPolygon Edgeブロックチェーンネットワークを展開するプロセスについて詳しく説明します。

## 前提条件 {#prerequisites}

### システムツール {#system-tools}
* [terraform](https://www.terraform.io/)
* [aws cli](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
* [awsアクセス鍵IDと秘密アクセス鍵](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-prereqs.html#getting-started-prereqs-keys)

### Terraform変数 {#terraform-variables}
デプロイを実行する前に、2つの変数を提供する必要があります：

* `alb_ssl_certificate` - ALBがhttpsプロトコルに使用するAWS証明書マネージャの証明書のARN。   
証明書は、展開を開始する前に生成する必要があり、「**発行済み**」の状態である必要があります
* `premine` - 前払い用のネイティブ通貨を受け取るアカウント。値は公式[CLI](/docs/edge/get-started/cli-commands#genesis-flags)フラグ仕様に従う必要があります

## デプロイメント情報 {#deployment-information}
### デプロイされるリソース {#deployed-resources}
デプロイするリソースの高レベルの概要：

* 専用VPC
* 4つのバリデータノード（ブートノードでもある）
* ノードの発信インターネットトラフィックを許可する4つのNATゲートウェイ
* 最初の（ジェネシス）ブロックを生成し、チェーンを開始するために使用されるラムダ関数
* 専用のセキュリティグループとIAMの役割
* genesis.jsonファイルの保存に使用されるS3バケット
* JSON-RPCエンドポイントを公開するために使用されるアプリケーションロードバランサ

### フォールトトレランス {#fault-tolerance}

このデプロイメントには、可用性ゾーンが4つある領域だけが必要です。各ノードはシングルのAZに配置されます。

各ノードをシングルのAZに配置することにより、ブロックチェーンクラスタ全体がシングルのノード（AZ）の障害に対してフォールトトレランスを実現します。Polygon Edgeは、シングルのノードが4つのバリデータノードクラスタで障害になることを可能にするIBFTコンセンサスを実装するためです。

### コマンドラインアクセス {#command-line-access}

バリデータノードは公共のインターネットに公開されておらず（JSON-PRCはALBを介してのみアクセス可能）、付属するパブリックIPアドレスもありません。  
ノードコマンドラインアクセスは[AWSシステムマネージャ（セッションマネージャ）](https://aws.amazon.com/systems-manager/features/)を介してのみ可能です。

### ベースAMIアップグレード {#base-ami-upgrade}

このデプロイメントでは、`ubuntu-focal-20.04-amd64-server`AWS AMIを使用します。AWSAMIが更新されると、EC2の*再デプロイメント*がトリガー**されません**。

何らかの理由でベースAMIを更新する必要がある場合は、`terraform apply`以前に各インスタンスに対して`terraform taint`コマンドを実行することによって、ベースAMIを更新できます。
       `terraform taint module.instances[<instance_number>].aws_instance.polygon_edge_instance`コマンドを実行すると、インスタンスが汚染される可能性が
あります。

例：
```shell
terraform taint module.instances[0].aws_instance.polygon_edge_instance
terraform taint module.instances[1].aws_instance.polygon_edge_instance
terraform taint module.instances[2].aws_instance.polygon_edge_instance
terraform taint module.instances[3].aws_instance.polygon_edge_instance
terraform apply
```

:::info

実稼働環境では、ブロックチェーンネットワークを機能させるために、`terraform taint`は、1つずつ実行する必要があります。
:::

## デプロイメント手順 {#deployment-procedure}

### プリデプロイメントステップ {#pre-deployment-steps}
* [polygon-technology-edge](https://registry.terraform.io/modules/aws-ia/polygon-technology-edge/aws) terraform registry readmeに目を通します
* `polygon-technology-edge`モジュールのreadmeページにある*プロビジョニング手順*を使用して、モジュールを`main.tf`ファイルに追加します
* `terraform init`コマンドを実行して、必要なすべてのTerraform依存関係をインストールします
* [AWS証明書マネージャ](https://aws.amazon.com/certificate-manager/)で新しい証明書を提供します
* 指定された証明書が「**発行済み**」の状態であることを確認し、証明書の**ARN**をメモします
* CLIでモジュールの出力を取得するには、出力ステートメントを設定します

#### `main.tf`例 {#example}
```terraform
module "polygon-edge" {
  source  = "aws-ia/polygon-technology-edge/aws"
  version = ">=0.0.1"

  premine             = var.premine
  alb_ssl_certificate = var.alb_ssl_certificate
}

output "json_rpc_dns_name" {
  value       = module.polygon-edge.jsonrpc_dns_name
  description = "The dns name for the JSON-RPC API"
}

variable "premine" {
  type        = string
  description = "Public account that will receive premined native currency"
}

variable "alb_ssl_certificate" {
  type        = string
  description = "The ARN of SSL certificate that will be placed on JSON-RPC ALB"
}
```

#### `terraform.tfvars`例 {#example-1}
```terraform
premine             = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
alb_ssl_certificate = "arn:aws:acm:us-west-2:123456789:certificate/64c7f117-61f5-435e-878b-83186676a8af"
```

### デプロイメントステップ {#deployment-steps}
* `terraform.tfvars`ファイルを作成します
* （上記で説明したように）必要なTerraform変数をこのファイルに設定します。
:::info

このデプロイメントを完全にカスタマイズできるその他の必須ではない変数があります。`terraform.tfvars`ファイルに独自の値を追加することで、デフォルト値を上書きできます。

使用可能なすべての変数の仕様は、モジュールのTerraform***[レジストリ](https://registry.terraform.io/modules/aws-ia/polygon-technology-edge/aws)***にあります。
:::
* `aws s3 ls`を実行してAWS CLI認証が正しく設定されていることを確認します - エラーは発生していないはずです
* インフラ`terraform apply`を展開します

### ポストデプロイメントステップ {#post-deployment-steps}
* 展開が完了したら、CLIに出力される`json_rpc_dns_name`変数値に注意してください
* 指定された`json_rpc_dns_name`値にドメイン名を指定するパブリックdns cnameレコードを作成します。例：
  ```shell
  # BIND syntax
  # NAME                            TTL       CLASS   TYPE      CANONICAL NAME
  rpc.my-awsome-blockchain.com.               IN      CNAME     jrpc-202208123456879-123456789.us-west-2.elb.amazonaws.com.
  ```
* cnameレコードが伝播したら、JSON-PRCエンドポイントを呼び出して、チェーンが正常に動作しているかチェックします。   
上記の例から：
  ```shell
    curl  https://rpc.my-awsome-blockchain.com -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
  ```

## 破棄手順 {#destroy-procedure}
:::warning
次の手順では、これらのTerraformスクリプトを使用して展開されたインフラ全体を完全に削除します。    
適切な[ブロックチェーンのデータバックアップ](docs/edge/working-with-node/backup-restore)があること、そして／またはテスト環境で作業していることを確認します。

:::

インフラ全体を削除する必要がある場合は、次のコマンド`terraform destroy`を実行します。   
さらに、デプロイメントが行われた領域のAWS[パラメータストア](https://aws.amazon.com/systems-manager/features/)に保存されている秘密を手動で削除する必要があります。

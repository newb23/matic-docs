---
id: validator-hosting
title: バリデータホスティング
description: "Polygon Edgeのホスティング要件"
keywords:
- docs
- polygon
- edge
- hosting
- cloud
- setup
- validator
---

次に、Polygon Edgeネットワークでバリデータノードを適切にホストするための推奨事項を示します。以下の項目に注意して、バリデータの設定が安全、安定、およびパフォーマンスに適切に構成されていることを確認してください。

## ナレッジベース {#knowledge-base}

バリデータノードを実行する前に、このドキュメントをよくお読みください。   
役立つその他のドキュメントは次のとおりです：

- [インストール](get-started/installation)
- [クラウド設定](get-started/set-up-ibft-on-the-cloud)
- [CLIコマンド](get-started/cli-commands)
- [サーバ設定ファイル](configuration/sample-config)
- [秘密鍵](configuration/manage-private-keys)
- [Prometheusメトリクス](configuration/prometheus-metrics)
- [シークレットマネージャ](/docs/category/secret-managers)
- [バックアップ／復元](working-with-node/backup-restore)

## 最小システム要件 {#minimum-system-requirements}

| タイプ | 値 | 影響を受ける対象 |
|------|------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|
| CPU | 2コア | <ul><li>JSON-RPCクエリの数</li><li>ブロックチェーン状態のサイズ</li><li>ブロックガス制限</li><li>ブロック時間</li></ul> |
| RAM | 2GB | <ul><li>JSON-RPCクエリの数</li><li>ブロックチェーン状態のサイズ</li><li>ブロックガス制限</li></ul> |
| ディスク | <ul><li>10GBのルートパーティション</li><li>ディスク拡張用のLVMを使用した30GBルートパーティション</li></ul> | <ul><li>ブロックチェーン状態のサイズ</li></ul> |


## サービス設定 {#service-configuration}

`polygon-edge`バイナリは、ネットワーク接続が確立されると自動的にシステムサービスとして実行され、スタート／停止／再起動機能を備えている必要があります。`systemd.`のようなサービスマネージャを使用することをお勧めします

`systemd`システム設定ファイルの例：
```
[Unit]
Description=Polygon Edge Server
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=10
User=ubuntu
ExecStart=/usr/local/bin/polygon-edge server --config /home/ubuntu/polygon/config.yaml

[Install]
WantedBy=multi-user.target
```

### バイナリ {#binary}

実稼働環境では、`polygon-edge`バイナリは手動でコンパイルするのではなく、構築済みのGitHubリリースバイナリからのみ展開する必要があります。
:::info

`develop`GitHubブランチを手動でコンパイルすると、環境に破壊的な変更が加わる可能性があります。   
そのため、Polygon Edgeバイナリはリリースからのみデプロイすることをお勧めします。これには、破壊的な変更の克服方法に関する情報が含まれてるためです。

:::

インストールメソッドの詳細については、[インストール](/docs/edge/get-started/installation)を参照してください。

### データストレージ {#data-storage}

ブロックチェーン全体の状態を含む`data/`フォルダは、自動的にディスクバックアップ、ボリューム拡張ができ、かつ障害発生時にディスク／ボリュームを別のインスタンスにオプションとしてマウントできるように、専用のディスク／ボリュームにマウントする必要があります。


### ログファイル {#log-files}

ログファイルは（`logrotate`のようなツールを使用して）毎日ローテーションする必要があります。
:::warning

ログローテーションなしで設定すると、ログファイルが使用可能なディスク領域をすべて使い果たし、バリデータのアップタイムが中断される可能性があります。

:::

`logrotate`設定例：
```
/home/ubuntu/polygon/logs/node.log
{
        rotate 7
        daily
        missingok
        notifempty
        compress
        prerotate
                /usr/bin/systemctl stop polygon-edge.service
        endscript
        postrotate
                /usr/bin/systemctl start polygon-edge.service
        endscript
}
```


ログストレージの推奨事項については、以下の[ログ](#logging)セクションを参照してください。

### その他の依存関係 {#additional-dependencies}

`polygon-edge`は静的にコンパイルされ、追加のホストOS依存性は必要ありません。

## メンテナンス {#maintenance}

次に、Polygon Edgeネットワークの実行中のバリデータノードを維持するためのベストプラクティスを示します。

### バックアップ {#backup}

Polygon Edgeノードに推奨されるバックアップ手順は2種類あります。

可能な場合は、Polygon Edgeバックアップを常に使用できるオプションとして両方を使用することをお勧めします。

* ***ボリュームバックアップ***    ：
Polygon Edgeノードの`data/`ボリュームまたは可能な場合は、全体のVMの毎日増分バックアップです。


* ***Polygon Edgeバックアップ***    ：
Polygon Edgeの定期的なバックアップを行い、`.dat`ファイルをオフサイトまたは安全なクラウドオブジェクトストレージに移動するCRONジョブを毎日実行することをお勧めします。

Polygon Edgeバックアップは、理想としては上記のボリュームバックアップと重複すべきではありません。

Polygon Edgeのバックアップの実行方法については、[バックアップ／復元ノードのインスタンス](working-with-node/backup-restore)を参照してください。

### ログ {#logging}

Polygon Edgeノードから出力されるログは次のとおりです：
- インデックス化と検索機能を備えた外部データストアに送信されます
- ログ保持期間は30日です

Polygon Edgeバリデータを初めて設定する場合は、問題を迅速にデバッグできる`--log-level=DEBUG`オプションを使用してノードをスタートすることをお勧めします。

:::info

`--log-level=DEBUG`により、ノードのログ出力は可能な限り詳細になります。   
デバッグログは、ログローテーションソリューションを設定する際に考慮する必要があるログファイルのサイズを大幅に大きくします。
:::
### OSセキュリティパッチ {#os-security-patches}

管理者は、バリデータインスタンスOSが常に最新のパッチで更新されていることを毎月少なくとも1回は確認する必要があります。

## メトリクス {#metrics}

### システムメトリクス {#system-metrics}

管理者は、何らかのシステムメトリクスモニタ（Telegraf + InfluceDB + GrafanaまたはサードパーティのSaaSなど）を設定する必要があります。

監視する必要があり、アラーム通知を設定する必要があるメトリクス：

| メトリクス名 | アラームしきい値 |
|-----------------------|-------------------------------|
| CPU使用率（％） | 90%を超える（5分以上） |
| RAM使用率（％） | 90%を超える（5分以上） |
| ルートディスク使用率（％） | 90%を超える |
| データディスク使用率 | 90%を超える |

### バリデータメトリクス {#validator-metrics}

管理者は、ブロックチェーンのパフォーマンスを監視するために、Polygon EdgeのPrometheus APIからメトリクスのコレクションを設定する必要があります。

公開されているメトリクスとPrometheusメトリクス収集を設定する方法を理解するには、[Prometheusメトリクス](configuration/prometheus-metrics)を参照してください。


次のメトリクスに特に注意する必要があります：
- ***ブロック生産時間*** - ブロックの生産時間が通常よりも長い場合は、ネットワークに潜在的な問題がある可能性があります
- ***コンセンサスラウンド数*** - ラウンドが複数ある場合は、ネットワーク内のバリデータセットに問題がある可能性があります
- ***ピアの数*** - ピアの数が減少すると、ネットワークに接続の問題があります

## セキュリティ {#security}

次に、Polygon Edgeネットワークの実行中のバリデータノードを保護するためのベストプラクティスを示します。

### APIサービス {#api-services}

- ***JSON-RPC*** -
（ロードバランサを介して、または直接）公開する必要がある唯一のAPIサービスです。   
このAPIは、すべてのインターフェイスまたは特定のIPアドレス（例:`--json-rpc 0.0.0.0:8545`または`--json-prc 192.168.1.1:8545`）で実行する必要があります。
:::info

これはAPIに公開されているため、セキュリティとレート制限を提供するために、ロードバランサ／リバースプロキシを前面に配置することをお勧めします。

:::


- ***LibP2P*** -
これは、ノードがピア通信に使用するネットワークAPIです。すべてのインターフェイスまたは特定のIPアドレス（`--libp2p 0.0.0.0:1478`または`--libp2p 192.168.1.1:1478`）で実行する必要があります。このAPIは公開すべきではありませんが、他のすべてのノードから到達可能である必要があります。
:::info

ローカルホスト（`--libp2p 127.0.0.1:1478`）で実行した場合、他のノードは接続できません。

:::


- ***GRPC***
このAPIは、オペレータコマンドを実行し、他のコマンドに注意する場合にだけ使用されます。したがって、ローカルホスト（`--grpc-address 127.0.0.1:9632`）だけで実行する必要があります。

### Polygon Edgeシークレット {#polygon-edge-secrets}

Polygon Edgeのシークレット（`ibft`と`libp2p`鍵）は、ローカルファイルシステムに保存するべきではありません。  
代わりに、サポートされている[シークレットマネージャ](configuration/secret-managers/set-up-aws-ssm)を使用する必要があります。   
ローカルファイルシステムへのシークレットの保存は、実稼働環境以外の環境でのみ使用する必要があります。

## 更新 {#update}

次に、バリデータノードに必要なアップデート手順を示します。手順はステップバイステップで説明しています。

### 更新手順 {#update-procedure}

- 公式GitHub[リリース](https://github.com/0xPolygon/polygon-edge/releases)から最新のPolygon Edgeバイナリをダウンロードします
- Polygon Edgeサービスを停止します（例：`sudo systemctl stop polygon-edge.service`）
- 既存のバイナリをダウンロードした`polygon-edge`バイナリと置き換えます（例：`sudo mv polygon-edge /usr/local/bin/`）
- `polygon-edge version`を実行して正しい`polygon-edge`バージョンがインストールされているかどうかを確認します。リリースバージョンに対応している必要があります。
- `polygon-edge`サービスを開始する前に、下位互換性の手順を実行する必要がある場合は、リリースドキュメントを確認します。
- `polygon-edge`サービスをスタートします（例：`sudo systemctl start polygon-edge.service`）
- 最後に、`polygon-edge`ログ出力を確認し、`[ERROR]`ログなしですべてが実行されていることを確認します

:::warning

ブレークリリースがある場合は、現在実行中のバイナリが新しいリリースと互換性がないため、このアップデート手順をすべてのノードで実行する必要があります。

つまり、`polygon-edge`バイナリが交換され、サービスが再起動されるまで、チェーンを短時間停止する必要があるため、それに応じて計画を立てます。

**[Ansible](https://www.ansible.com/)**や一部のカスタムスクリプトなどのツールを使用して、アップデートを効率的に実行し、チェーンダウンタイムを最小限に抑えることができます。
:::

## スタートアップ手順 {#startup-procedure}

次に、望ましいPolygon Edgeバリデータの起動手順のフローを示します

- [ナレッジベース](#knowledge-base)のセクションに記載されているドキュメントを読みます
- バリデータノードに最新のOSパッチを適用します
- 公式GitHub[リリース](https://github.com/0xPolygon/polygon-edge/releases)から最新の`polygon-edge`バイナリをダウンロードし、ローカルインスタンス`PATH`に置きます
- `polygon-edge secrets generate`CLIコマンドを使用して、サポートされている[シークレットマネージャ](/docs/category/secret-managers)のひとつを初期化します
- `polygon-edge secrets init`[CLIコマンド](/docs/edge/get-started/cli-commands#secrets-init-flags)を使用してシークレットを生成し、保存します
- `NodeID`と`Public key (address)`の値に注意します
- `polygon-edge genesis`[CLIコマンド](/docs/edge/get-started/cli-commands#genesis-flags)を使用して、[クラウド設定](get-started/set-up-ibft-on-the-cloud#step-3-generate-the-genesis-file-with-the-4-nodes-as-validators)の説明に従って`genesis.json`ファイルを生成します
- `polygon-edge server export`[CLIコマンド](/docs/edge/configuration/sample-config)を使用してデフォルトの設定ファイルを生成します
- ローカルバリデータノード環境（ファイルパスなど）に対応するように`default-config.yaml`ファイルを編集します
- `polygon-edge`バイナリが`default-config.yaml`ファイルからサーバを実行するPolygon Edgeサービス（`systemd`または類似のもの）を作成します
- サービスを開始して、Polygon Edgeサーバーをスタートします（例：`systemctl start polygon-edge`）
- `polygon-edge`ログ出力を確認し、ブロックが生成されていること、および`[ERROR]`ログがないことを確認します
- [`eth_chainId`](/docs/edge/api/json-rpc-eth#eth_chainid)のようなJSON-RPCメソッドを呼び出して、チェーンの機能を確認します

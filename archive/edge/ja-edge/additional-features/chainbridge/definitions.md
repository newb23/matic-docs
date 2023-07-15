---
id: definitions
title: 一般定義
description: chainBridgeで使用する用語の一般定義
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---


## リレイヤー {#relayer}
Chainbridgeはリレイヤータイプのブリッジです。リレイヤーの役割は、リクエストの実行（例：バーン／リリースするトークン数）に投票することです。これは、すべてのチェーンのイベントを監視し、チェーンから`Deposit`イベントを受信した際に宛先チェーンのブリッジコントラクトで提案を投票します。リレイヤーは、必要な投票数が送信された後に、提案を実行するためにブリッジコントラクトでメソッドを呼び出します。ブリッジは実行をハンドラーコントラクトに委任します。


## コントラクトの種類 {#types-of-contracts}
ChainBridgeでは、各チェーンに3つのコントラクトタイプ、ブリッジ／ハンドラー／ターゲットがあります。

| **タイプ** | **説明** |
|----------|-------------------------------------------------------------------------------------------------------------------------------|
| ブリッジコントラクト | リクエスト、投票、実行を管理するブリッジコントラクトを各チェーンにデプロイする必要があります。ユーザーは、ブリッジで`deposit`を呼び出し、転送を開始し、ブリッジは、プロセスをターゲットコントラクトに対応するハンドラーコントラクトに委任します。ハンドラーコントラクトがターゲットコントラクトを呼び出すのに成功すると、ブリッジコントラクトはリレイヤーに通知するために`Deposit`イベントを出します。 |
| ハンドラーコントラクト | このコントラクトはターゲットコントラクトとやりとりし、デポジットまたは提案を実行します。これはユーザーのリクエストを検証し、ターゲットコントラクトを呼び出し、ターゲットコントラクトの一部の設定のサポートを行います。さまざまなインターフェースを持つ各ターゲットコントラクトを呼び出すハンドラーコントラクトがあります。ハンドラーコントラクトによる間接的な呼び出しにより、ブリッジは、どのような種類のアセットまたはデータでも転送が可能になります。現在、ChainBridgeによって実装されているハンドラーコントラクトは３種類あります：ERC20Handler、ERC721Handler、GenericHandler。 |
| ターゲットコントラクト | チェーン間で交換されるアセットまたは転送されるメッセージを管理するコントラクト。このコントラクトとのやり取りは、ブリッジの各サイドから行われます。 |

<div style={{textAlign: 'center'}}>

![ChainBridgeアーキテクチャ](/img/edge/chainbridge/architecture.svg)
*ChainBridgeアーキテクチャ*

</div>

<div style={{textAlign: 'center'}}>

![ERC20トークン転送のワークフロー](/img/edge/chainbridge/erc20-workflow.svg)
*例：ERC20トークン転送のワークフロー*

</div>

## アカウントの種類 {#types-of-accounts}

アカウントに、起動前にトランザクションの作成するのに十分なネイティブトークンがあることを確認してください。Polygon Edgeでは、ジェネシスブロックを生成する際に、前払い残高をアカウントに割り当てることができます。

| **タイプ** | **説明** |
|----------|-------------------------------------------------------------------------------------------------------------------------------|
| 管理者 | このアカウントは、管理者の役割をデフォルトで与えられます。 |
| ユーザー | アセットを送信／受信する送信者／受信者アカウント。送信者アカウントは、トークンの転送を承認し、転送を開始するためにブリッジコントラクトでデポジットを呼び出す際にガス代を支払います。 |

:::info 管理者の役割

特定のアクションは、管理者のアカウントでしか実行できません。デフォルトでは、ブリッジコントラクトをデプロイした人に管理者の役割が割り当てられます。管理者の役割を他のアカウントに付与したり削除する方法については下記をご確認ください。

### 管理者の役割を追加 {#add-admin-role}

管理者の追加

```bash
# Grant admin role
$ cb-sol-cli admin add-admin \
  --url [JSON_RPC_URL] \
  --privateKey [PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --admin "[NEW_ACCOUNT_ADDRESS]"
```
### 管理者の役割を取り消す {#revoke-admin-role}

管理者の削除

```bash
# Revoke admin role
$ cb-sol-cli admin remove-admin \
  --url [JSON_RPC_URL] \
  --privateKey [PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --admin "[NEW_ACCOUNT_ADDRESS]"
```

## `admin`アカウントで許可されている操作は、以下の通りです。 {#account-are-as-below}

### リソースの設定 {#set-resource}

ハンドラーのコントラクトアドレスでリソースIDを登録します。

```bash
# Register new resource
$ cb-sol-cli bridge register-resource \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --resourceId "[RESOURCE_ID]" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[TARGET_CONTRACT_ADDRESS]"
```

### コントラクトをバーン／ミント可能にする {#make-contract-burnable-mintable}

トークンコントラクトをハンドラーでミント／バーン可能に設定します。

```bash
# Let contract burnable/mintable
$ cb-sol-cli bridge set-burn \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[TARGET_CONTRACT_ADDRESS]"
```

### 提案のキャンセル {#cancel-proposal}

実行の提案をキャンセル

```bash
# Cancel ongoing proposal
$ cb-sol-cli bridge cancel-proposal \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --resourceId "[RESOURCE_ID]" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --chainId "[CHAIN_ID_OF_SOURCE_CHAIN]" \
  --depositNonce "[NONCE]"
```

### 一時停止／一時停止解除 {#pause-unpause}

デポジット、提案の作成、投票、デポジットの実行を一時的に停止します。

```bash
# Pause
$ cb-sol-cli admin pause \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]"

# Unpause
$ cb-sol-cli admin unpause \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]"
```

### 手数料の変更 {#change-fee}

ブリッジコントラクトに支払われる手数料を変更します

```bash
# Change fee for execution
$ cb-sol-cli admin set-fee \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --fee [FEE_IN_WEI]
```

### リレイヤーの追加／削除 {#add-remove-a-relayer}

新しいリレイヤーとしてアカウントを追加するか、リレイヤーからアカウントを削除します。

```bash
# Add relayer
$ cb-sol-cli admin add-relayer \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --relayer "[NEW_RELAYER_ADDRESS]"

# Remove relayer
$ cb-sol-cli admin remove-relayer \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --relayer "[RELAYER_ADDRESS]"
```

### リレイヤーのしきい値を変更する {#change-relayer-threshold}

提案の実行に必要な投票数を変更する

```bash
# Remove relayer
$ cb-sol-cli admin set-threshold \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --threshold [THRESHOLD]
```
:::

## チェーンID {#chain-id}

Chainbridgeの`chainId`は、ブロックチェーンネットワークを区別するためにブリッジで使用される任意の値であり、それはuint8の範囲でなければなりません。ネットワークのチェーンIDと混同しないでください。それらは同じものではありません。この値は固有である必要がありますが、ネットワークのIDと同じである必要はありません。

この例では、MumbaiテストネットのチェーンIDが`80001`であるため、`99`を`chainId`に設定し、それはuint8では表現することはできません。

## リソースID {#resource-id}

リソースIDは、クロスチェーン環境の固有の32バイト値であり、ネットワーク間で転送されている特定のアセット（リソース）に関連付けられています。

リソースIDは任意ですが、通常、最後のバイトにはソースチェーン（このアセットが最初に発生したネットワーク）のチェーンIDを含みます。

## Polygon PoSのJSON-RPC URL {#json-rpc-url-for-polygon-pos}

このガイドでは、トラフィックまたはレート制限があるPolygonが提供する公開JSON-RPC URL、https://rpc-mumbai.matic.todayを使用します。これはPolygon Mumbaiテストネットとの接続にのみ使用されます。コントラクトをデプロイすると、JSON-RPCに多くのクエリ／リクエストを送信するため、Infuraなどの外部サービスでJSON-RPC URLを取得することを推奨します。

## トークンの転送を処理する方法 {#ways-of-processing-the-transfer-of-tokens}
チェーン間でERC20トークンを転送する際、次の2つの異なるモードで処理することができます：

### ロック／リリースモード {#lock-release-mode}
<b>ソースチェーン：</b>送信するトークンはハンドラーコントラクトでロックされます。<br/>
<b>送信先チェーン：</b>ソースチェーンで送信されたのと同額のトークンがロック解除され、ハンドラーコントラクトから送信先チェーン内の受信アカウントに転送されます。

### バーン／ミントモード {#burn-mint-mode}
<b>ソースチェーン：</b>送信するトークンがバーンされます<br/>。
<b>送信先チェーン：</b>ソースチェーンで送信およびバーンしたのと同額のトークンが送信先チェーンでミントされ、受信アカウントに送信されます。

チェーンごとに異なるモードを使用することができます。つまり、転送のためにサブチェーンでトークンをミントしながらメインチェーンでトークンをロックすることができます。たとえば、総供給量またはミントスケジュールが制御されている場合、トークンをロック／リリースすることは理にかなっています。サブチェーンのコントラクトがメインチェーン内の供給に従う必要がある場合、トークンがミント／バーンされます。

デフォルトモードはロック／リリースモードです。トークンをミント／バーン可能にする場合は、`adminSetBurnable`メソッドを呼び出す必要があります。実行時にトークンをミントする場合は、ERC20ハンドラーコントラクトに`minter`の役割を付与する必要があります。



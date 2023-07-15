---
id: gas
title: ガスに関するよくある質問
description: "Polygon Edgeのガスに関するよくある質問"
keywords:
  - docs
  - polygon
  - edge
  - FAQ
  - validators

---

## ガス価格の最小化をどのように行うのですか？ {#how-to-enforce-a-minimum-gas-price}
サーバーコマンドで提供される`--price-limit`フラグを使用することができます。これにより設定した価格制限以上のガスを持つトランザクションのみをノードが受け付けるようなります。ネットワーク全体でこれを確実にするには、すべてのノードが同じ価格制限を持つことを確認する必要があります。


## ガス手数料0で取引することはできますか？ {#can-you-have-transactions-with-0-gas-fees}
はい、可能です。ノードが執行するデフォルトの価格制限は`0`、つまりノードはガス価格が`0`に設定されているトランザクションを受け入れることを意味します。

## ガス（ネイティブ）トークンの総供給を設定する方法は？ {#how-to-set-the-gas-native-token-total-supply}

前払いされた残高を`--premine flag`を使用してアカウント（アドレス）に設定することができます。これはジェネシスファイルからの設定であり、後で変更できないことに注意してください。

`--premine flag`を使用する方法の例：

`--premine=0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000`

これは前払い残高1000ETHを0x3956E90e632AEbBF34DEB49b71c28A83Bc029862に設定します（引数からの額はweiベースです）。

ガストークンの前払い額は総供給となります。ネイティブ通貨（ガストークン）の額を後でミントすることはできません。

## EdgeはERC-20をガストークンとしてサポートしていますか？ {#does-edge-support-erc-20-as-a-gas-token}

EdgeはERC-20をガストークンとしてサポートしていません。ガスとしてサポートしているのはEdgeのネイティブ通貨のみです。

## ガス制限を増やす方法は？ {#how-to-increase-the-gas-limit}

Polygon Edgeでガス制限を増やすための2つのオプションがあります：
1. チェーンをワイプし、ジェネシスファイルで最大uint64値に増加`block-gas-limit`します。
2. すべてのノードでガス制限を増やすために、高い値を持つ`--block-gas-target`フラグを使用します。これにはノード再起動が必要です。詳細な説明は[こちらです。](/docs/edge/architecture/modules/txpool/#block-gas-target)
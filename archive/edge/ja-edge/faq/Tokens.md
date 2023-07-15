---
id: tokens
title: トークンのよくある質問
description: "Polygon Edgeトークンに関するよくある質問"
keywords:
  - docs
  - polygon
  - edge
  - FAQ
  - tokens
---

## Polygon EdgeはEIP-1559をサポートしていますか？ {#does-polygon-edge-support-eip-1559}
現時点でPolygon EdgeはEIP-1559をサポートしていません。

## 通貨（トークン）シンボルをどのように設定しますか？ {#how-to-set-the-currency-token-symbol}

トークンシンボルは単にUIのものなので、ネットワークのどこででも設定またはハードコードすることはできません。しかし、たとえばMetamaskなど、ネットワークをウォレットに追加する時に変更できます。

## チェーンが停止した場合、トランザクションはどうなりますか。 {#what-happens-to-transactions-when-a-chain-halts}

処理されていないトランザクションはすべて、TxPool（キューのエンキューまたはプロモーション）内にあります。チェーンが停止した場合（すべてのブロック制限が停止する）、これらのトランザクションはブロックにすることはありません。<br/>チェーンが停止する場合に限ります。ノードが停止または再起動された場合、実行されていないトランザクションがまだTxPoolに存在している場合、黙って削除されます。<br/>ノードが再起動される必要があるため、破損変更が導入された場合にもトランザクションが起こります。

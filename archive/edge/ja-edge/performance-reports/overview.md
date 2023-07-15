---
id: overview
title: 概要
description: "Polygon Edgeテストについて"
keywords:
  - docs
  - polygon
  - edge
  - performance
  - tests
  - loadbot
---
:::caution
これらのテストを実行するために使用`loadbot`した当社は、減価償却を行っています。
:::

| タイプ | 値 | テストへのリンク |
| ---- | ----- | ------------ |
| 定期的な転送 | 1428 tps | [2022年7月4日](test-history/test-2022-07-04.md#results-of-eoa-to-eoa-transfers) |
| ERC-20の転送 | 1111 tps | [2022年7月4日](test-history/test-2022-07-04.md#results-of-erc20-token-transfers) |
| NFTのミント | 714 tps | [2022年7月4日](test-history/test-2022-07-04.md#results-of-erc721-token-minting) |

---

私たちの目標は、高パフォーマンス、豊富な機能性、ブロックチェーンクライアントソフトウェアを簡単に設定し、維持することです。すべてのテストはPolygon Edge Loadbotを使用して行いました。
このセクションにあるすべてのパフォーマンスレポートは適切に日付が記され、環境は明確に記載されテスト手法も明確に説明されています。

これらのパフォーマンステストの目標は、Polygon Edgeブロックチェーンネットワークの現実世界でのパフォーマンスを示すことです。同じ環境で、我々のLoadbotを使用して、誰でも、ここに掲載された同じ結果を得ることができるはずです。

すべてのパフォーマンステストは、EC2インスタンスノードからなるチェーン上のAWSプラットフォームで実施されました。
---
id: overview
title: Polygon Edge
sidebar_label: What is Edge
description: "Polygon Edgeの紹介"
keywords:
  - docs
  - polygon
  - edge
  - network
  - modular

---

Polygon Edgeは、Ethereumと互換性のあるブロックチェーンネットワーク、サイドチェーン、一般的な拡張ソリューションを構築するためのモジュラー及び拡張可能なフレームワークです。

その主な使用目的はEthereumスマートコントラクトやトランザクションとの完全な互換性を提供しながら新しいブロックチェーンネットワークをブートストラップすることです。これはIBFT（イスタンブールビザンチンフォールトトレラント）コンセンサスメカニズムを使用し、[PoA（プルーフ・オブ・オーソリティ）](/docs/edge/consensus/poa)と[PoS（プルーフ・オブ・ステーク）](/docs/edge/consensus/pos-stake-unstake)の2つでサポートされています。

Polygon Edgeは、[中央集権型ブリッジソリューション](/docs/edge/additional-features/chainbridge/overview)を利用することで、[ERC-20](https://ethereum.org/en/developers/docs/standards/tokens/erc-20)と[ERC-721](https://ethereum.org/en/developers/docs/standards/tokens/erc-721)の両方のトークンの転送を可能にし、複数のブロックチェーンネットワークとの通信もサポートします。

[JSON-RPC](/docs/edge/working-with-node/query-json-rpc)エンドポイントを通じてPolygon Edgeとやりとりするのに業界標準のウォレットが使用でき、ノードオペレータは[GRPC](/docs/edge/working-with-node/query-operator-info)プロトコルを通じてノード上でさまざまなアクションを実行することができます。

Polygonの詳細については、[公式ウェブサイト](https://polygon.technology)をご覧ください。

**[GitHubリポジトリ](https://github.com/0xPolygon/polygon-edge)**

:::caution

これは進行中のものであり、将来アーキテクチャに関する変更が起こる可能性があります。コードはまだ監査されていません
それでも、実稼働での使用を希望される場合はPolygonチームにご連絡ください。

:::



ローカルで`polygon-edge`ネットワークを実行して開始するには、次をご確認ください：[インストール](/docs/edge/get-started/installation)と[ローカル設定](/docs/edge/get-started/set-up-ibft-locally)。

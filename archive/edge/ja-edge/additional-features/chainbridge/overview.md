---
id: overview
title: 概要
description: ChainBridgeの概要
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

## ChainBridgeとは {#what-is-chainbridge}

ChainBridgeは、ChainSafeによって構築されたEVMとSubstrateの互換性のあるチェーンをサポートするモジュラー多方向ブロックチェーンブリッジです。これにより、ユーザーは2つの異なるチェーン間であらゆる種類のアセットまたはメッセージを転送することができます。

ChainBridgeの詳細については、まず開発者が提供する[公式ドキュメント](https://chainbridge.chainsafe.io/)をご覧ください。

このガイドはPolygon EdgeにChainbridgeを統合するサポートになることを意図しています。実行中のPolygon PoS（Mumbaiテストネット）とローカルのPolygon Edgeネットワーク間のブリッジの設定について説明します。

## 要件 {#requirements}

このガイドでは、Polygon Edgeノード、ChainBridgeリレイヤー（詳細については[こちら](/docs/edge/additional-features/chainbridge/definitions)）、およびローカルにコントラクトをデプロイし、リソースの登録、ブリッジの設定を変更するためのCLIツールであるcb-sol-cliツールを実行します（[こちら](https://chainbridge.chainsafe.io/cli-options/#cli-options)も確認できます）。設定を開始する前に、次の環境が必要です：

* Go： >= 1.17
* Node.js >= 16.13.0
* Git


さらに、いくつかのアプリケーションを実行するためにこのバージョンで次のリポジトリをクローンする必要があります。

* [Polygon Edge](https://github.com/0xPolygon/polygon-edge)：`develop`ブランチ上
* [ChainBridge](https://github.com/ChainSafe/ChainBridge)：v1.1.5
* [ChainBridgeデプロイツール](https://github.com/ChainSafe/chainbridge-deploy)：`main`ブランチ上の`f2aa093`


次のセクションに進む前にPolygon Edgeネットワークを設定する必要があります。詳細については、[ローカル設定](/docs/edge/get-started/set-up-ibft-locally)または[クラウド設定](/docs/edge/get-started/set-up-ibft-on-the-cloud)をご覧ください。
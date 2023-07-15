---
id: overview
title: Genel Bakış
description: ChainBridge'e genel bakış
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

## ChainBridge nedir? {#what-is-chainbridge}

ChainBridge, ChainSafe tarafından oluşturulan, EVM ve Substrate uyumlu zincirleri destekleyen modüler, çok yönlü bir blok zinciri köprüsüdür. Kullanıcıların iki farklı zincir arasında her türlü varlığı veya mesajı aktarmasına olanak tanır.

ChainBridge hakkında daha fazla bilgi edinmek için lütfen öncelikle geliştiricileri tarafından sağlanan [resmî dokümanları](https://chainbridge.chainsafe.io/) inceleyin.

Bu kılavuz, Polygon Edge ile Chainbridge entegrasyonuna yardımcı olmak için hazırlanmıştır. Çalışan bir Polygon PoS (Mumbai test ağı) ve yerel bir Polygon Edge ağı arasında köprü kurulumunu adım adım anlatmaktadır.

## Gereksinimler {#requirements}

Bu kılavuzda, Polygon Edge düğümlerini, bir ChainBridge yönlendiricisini (daha fazla bilgiyi [burada](/docs/edge/additional-features/chainbridge/definitions) bulabilirsiniz) ve sözleşmeleri yerel olarak devreye almak, kaynağı kaydetmek ve köprü ayarlarını değiştirmek için bir CLI aracı olan cb-sol-cli aracını çalıştıracaksınız ([bunu](https://chainbridge.chainsafe.io/cli-options/#cli-options) da inceleyebilirsiniz). Kuruluma başlamadan önce aşağıdaki ortamlar gereklidir:

* Go: >= 1.17
* Node.js >= 16.13.0
* Git


Buna ek olarak, bazı uygulamaları çalıştırmak için aşağıdaki depoları sürümleriyle birlikte klonlamanız gerekecektir.

* [Polygon Edge](https://github.com/0xPolygon/polygon-edge): `develop` dalında
* [ChainBridge](https://github.com/ChainSafe/ChainBridge): v1.1.5
* [ChainBridge Dağıtım Araçları](https://github.com/ChainSafe/chainbridge-deploy): `main` dalda `f2aa093`


Bir sonraki bölüme geçmeden önce bir Polygon Edge ağı kurmanız gerekir. Daha fazla bilgi için lütfen [Yerel Kurulum](/docs/edge/get-started/set-up-ibft-locally) veya [Bulut Kurulumu](/docs/edge/get-started/set-up-ibft-on-the-cloud)'nu kontrol edin.
---
id: overview
title: Polygon Edge
sidebar_label: What is Edge
description: "Polygon Edge'e giriş."
keywords:
  - docs
  - polygon
  - edge
  - network
  - modular

---

Polygon Edge, Ethereum uyumlu blok zinciri ağları, yan zincirleri ve genel ölçekleme çözümleri oluşturmak için modüler ve genişletilebilir bir çerçevedir.

Birincil kullanımı, Ethereum akıllı sözleşmeleri ve işlemleriyle tam uyumluluk sağlarken, yeni bir blok zinciri ağına ön yükleme yapmaktır. [PoA (yetki kanıtı)](/docs/edge/consensus/poa) ve [PoS (hisse kanıtı)](/docs/edge/consensus/pos-stake-unstake) olmak üzere iki şekilde desteklenen IBFT (İstanbul Bizans Hata Toleransı) konsensüs mekanizmasını kullanır.

Polygon Edge aynı zamanda [merkezî köprü çözümünü](/docs/edge/additional-features/chainbridge/overview) kullanarak hem [ERC-20](https://ethereum.org/en/developers/docs/standards/tokens/erc-20) hem de [ERC-721](https://ethereum.org/en/developers/docs/standards/tokens/erc-721) token'larının aktarılmasını sağlayan çoklu blok zinciri ağı ile iletişimi de destekler.

Endüstri standardı cüzdanlar, [JSON-RPC](/docs/edge/working-with-node/query-json-rpc) uç noktaları üzerinden Polygon Edge ile etkileşim kurmak için kullanılabilir ve düğüm operatörleri, [gRPC](/docs/edge/working-with-node/query-operator-info) protokolü üzerinden düğümler üzerinde çeşitli eylemler gerçekleştirebilir.

Polygon hakkında daha fazla bilgi edinmek için [resmi web sitesini](https://polygon.technology) ziyaret edin.

**[GitHub deposu](https://github.com/0xPolygon/polygon-edge)**

:::caution

Bu devam eden bir çalışma olduğu için gelecekte mimari değişiklikler olabilir. Kod henüz denetlenmemiştir
bu nedenle üretimde kullanmak isterseniz lütfen Polygon ekibi ile iletişime geçin.

:::



Bir `polygon-edge` ağını yerel olarak çalıştırmaya başlamak için lütfen okuyun: [Kurulum](/docs/edge/get-started/installation) ve [Yerel Kurulum](/docs/edge/get-started/set-up-ibft-locally).

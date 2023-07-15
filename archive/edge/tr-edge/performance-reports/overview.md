---
id: overview
title: Genel Bakış
description: "Polygon Edge testine giriş."
keywords:
  - docs
  - polygon
  - edge
  - performance
  - tests
  - loadbot
---
:::caution
Bu testleri gerçekleştirmek için kullanılan `loadbot`bizim için kullanılan bizim artık amortisman olduğunu unutmayın.
:::

| Tip | Değer | Test etmek için bağlantı |
| ---- | ----- | ------------ |
| Düzenli Transferler | 1428 tps | [4 Temmuz 2022](test-history/test-2022-07-04.md#results-of-eoa-to-eoa-transfers) |
| ERC-20 Transferleri | 1111 tps | [4 Temmuz 2022](test-history/test-2022-07-04.md#results-of-erc20-token-transfers) |
| NFT Mint Etme | 714 tps | [4 Temmuz 2022](test-history/test-2022-07-04.md#results-of-erc721-token-minting) |

---

Amacımız, yüksek performanslı, özellik açısından zengin ve kurulumu ve bakımı kolay bir blok zinciri istemci yazılımı yapmaktır.
Tüm testler Polygon Edge Loadbot kullanılarak yapılmıştır.
Bu bölüm içinde bulacağınız her performans raporu doğru bir şekilde tarihlenmiştir, ortamı açıkça tanımlanmıştır ve test yöntemi açıkça belirtilmiştir.

Bu performans testlerinin amacı, Polygon Edge blok zinciri ağının gerçek dünyadaki performansını göstermektir.
Loadbot'umuzu kullanan herkes, aynı ortamda, burada yayımlanan sonuçların aynısını elde edebilmelidir.

Performans testlerinin tamamı, AWS platformunda EC2 bulut sunucusu düğümlerinden oluşan bir zincir üzerinde gerçekleştirilmiştir.
---
id: gas
title: Gaz SSS
description: "Polygon Edge için Gaz SSS"
keywords:
  - docs
  - polygon
  - edge
  - FAQ
  - validators

---

## Minimum gaz fiyatı nasıl uygulanır? {#how-to-enforce-a-minimum-gas-price}
Sunucu komutunda sağlanan `--price-limit` bayrağını kullanabilirsiniz. Bunu yapmak, düğümünüzün yalnızca belirlediğiniz fiyat limitinin üzerinde veya limite eşit olan gaz içeren işlemleri kabul etmesini sağlayacaktır. Tüm ağ üzerinde uygulandığından emin olmak için tüm düğümlerin aynı fiyat limitine sahip olduğundan emin olmanız gerekir.


## 0 gaz ücreti içeren işlemleriniz olabilir mi? {#can-you-have-transactions-with-0-gas-fees}
Evet, olabilir. Düğümlerin uyguladığı varsayılan fiyat limiti `0` olarak belirlenmiştir; yani düğümler gaz fiyatı `0` olarak ayarlanmış işlemleri kabul edecektir.

## Gaz (yerel) token için toplam arz nasıl ayarlanır? {#how-to-set-the-gas-native-token-total-supply}

Hesaplara (adreslere) önceden mine edilmiş bir bakiye ayarlamak için `--premine flag` kullanabilirsiniz. Lütfen bunun genesis dosyasından gelen bir yapılandırma olduğunu ve daha sonra değiştirilemeyeceğini unutmayın.

`--premine flag` kullanımına bir örnek:

`--premine=0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000`

Bu işlem 0x3956E90e632AEbBF34DEB49b71c28A83Bc029862 adresine önceden mine edilmiş 1000 ETH'lik bir bakiye ayarlar (argümandaki miktar wei cinsindendir).

Gaz token'ı için önceden mine edilmiş miktar, toplam arz olacaktır. Bundan sonra hiçbir miktarda yerel para birimi (gaz token'ı) mint edilemez.

## Edge gaz token'ı olarak ERC-20'yi destekler mi? {#does-edge-support-erc-20-as-a-gas-token}

Edge, gaz token'ı olarak ERC-20 token'ları desteklemez. Gaz için yalnızca yerel Edge para birimi desteklenir.

## Gaz limiti nasıl artırılır? {#how-to-increase-the-gas-limit}

Polygon Edge içinde gaz limitini artırmak için iki seçenek vardır:
1. Zinciri silmek ve genesis dosyasında maksimum uint64 değerine `block-gas-limit`yükseltme
2. Tüm düğümlerin gaz limitini artırmak için `--block-gas-target`bayrağı yüksek bir değere sahip kullanın. Bu durum düğüm yeniden başlatma gerektirir. Detaylı açıklama [burada](/docs/edge/architecture/modules/txpool/#block-gas-target).
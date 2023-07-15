---
id: permission-contract-deployment
title: Akıllı sözleşme devreye alma izni
description: Akıllı sözleşme devreye alma izni nasıl eklenir?
keywords:
  - docs
  - polygon
  - edge
  - smart contract
  - permission
  - deployment
---

## Genel Bakış {#overview}

Bu kılavuz, akıllı sözleşmeleri devreye alabilecek adreslerin nasıl beyaz listeye alınacağı hakkında ayrıntılı bilgi vermektedir.
Bazen ağ operatörleri, kullanıcıların ağın amacıyla ilgisi olmayan akıllı sözleşmeleri devreye almalarını önlemek ister. Ağ operatörleri şunları yapabilir:

1. Akıllı Sözleşme devreye alma için beyaz liste adresleri
2. Akıllı Sözleşme devreye alma için beyaz listeden adres çıkarma

## Video sunumu {#video-presentation}

[![izin sözleşmesi dağıtımı - video](https://img.youtube.com/vi/yPOkINpf7hg/0.jpg)](https://www.youtube.com/watch?v=yPOkINpf7hg)

## Nasıl kullanılır? {#how-to-use-it}


Devreye alma beyaz listesiyle ilgili tüm cli komutlarını [CLI Komutları](/docs/edge/get-started/cli-commands#whitelist-commands) sayfasında bulabilirsiniz.

* `whitelist show`: Beyaz liste bilgilerini görüntüler
* `whitelist deployment --add`: Sözleşme devreye alma beyaz listesine yeni bir adres ekler
* `whitelist deployment --remove`: Sözleşme devreye alma beyaz listesinden yeni bir adres kaldırır

#### Devreye alma beyaz listesindeki tüm adresleri gösterir {#show-all-addresses-in-the-deployment-whitelist}

Devreye alma beyaz listesindeki adresleri bulmanın 2 yolu vardır.
1. Beyaz listelerin kaydedildiği `genesis.json`'a bakma
2. Polygon Edge tarafından desteklenen tüm beyaz listelerin bilgilerini yazdıran `whitelist show`yürütme

```bash

./polygon-edge whitelist show

[WHITELISTS]

Contract deployment whitelist : [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d],


```

#### Devreye alma beyaz listesine adres ekleme {#add-an-address-to-the-deployment-whitelist}

Devreye alma beyaz listesine yeni bir adres eklemek için `whitelist deployment --add [ADDRESS]` CLI komutunu çalıştırın. Beyaz listede bulunan adres sayısı için hiçbir limit yoktur. Yalnızca sözleşme devreye alma beyaz listesinde bulunan adresler, sözleşmeleri devreye alabilir. Beyaz liste boş ise, her adres devreye alma işlemi yapabilir

```bash

./polygon-edge whitelist deployment --add 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d --add 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF


[CONTRACT DEPLOYMENT WHITELIST]

Added addresses: [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],
Contract deployment whitelist : [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],



```

#### Devreye alma beyaz listesinden adres kaldırma {#remove-an-address-from-the-deployment-whitelist}

Devreye alma beyaz listesinden bir adresi çıkarmak için `whitelist deployment --remove [ADDRESS]` CLI komutunu çalıştırın. Yalnızca sözleşme devreye alma beyaz listesinde bulunan adresler, sözleşmeleri devreye alabilir. Beyaz liste boş ise, her adres devreye alma işlemi yapabilir

```bash

./polygon-edge whitelist deployment --remove 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d --remove 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF


[CONTRACT DEPLOYMENT WHITELIST]

Removed addresses: [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],
Contract deployment whitelist : [],



```

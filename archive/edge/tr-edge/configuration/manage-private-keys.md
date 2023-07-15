---
id: manage-private-keys
title: Özel anahtarları yönetme
description: "Özel anahtarlar nasıl yönetilir ve anahtar türleri nelerdir?"
keywords:
  - docs
  - polygon
  - edge
  - private
  - key
  - keystore
---

## Genel Bakış {#overview}

Polygon Edge'in doğrudan yönettiği iki tür özel anahtar vardır:

* **Konsensüs mekanizması için kullanılan özel anahtar**
* **libp2p tarafından ağ oluşturmak için kullanılan özel anahtar**
* **(İsteğe bağlı) Doğrulayıcıların imzalarını toplamak için konsensüs mekanizması için kullanılan BLS Özel anahtarı**

Şu anda, Polygon Edge doğrudan hesap yönetimi için destek sunmamaktadır.

[Yedekleme ve Geri Yükleme kılavuzunda](/docs/edge/working-with-node/backup-restore) özetlenen dizin yapısına göre,
Polygon Edge, bahsedilen bu anahtar dosyalarını iki ayrı dizinde saklar: **konsensüs** ve **keystore**.

## Anahtar formatı {#key-format}

Özel anahtarlar basit **Base64 formatında** saklanır, böylece insanlar tarafından okunabilir ve taşınabilir.

```bash
# Example private key
0802122068a1bdb1c8af5333e58fe586bc0e9fc7aff882da82affb678aef5d9a2b9100c0
```

:::info Anahtar Türü

Polygon Edge içinde üretilen ve kullanılan tüm özel anahtar dosyaları [secp256k1](https://en.bitcoin.it/wiki/Secp256k1) eğrisi ile ECDSA'ya dayanır.

Eğri, standart olmadığı için kodlanamaz ve herhangi bir standartlaştırılmış PEM formatında saklanamaz.
Bu anahtar tipine uygun olmayan anahtarların içe aktarımı desteklenmemektedir.

:::
## Konsensüs Özel Anahtarı {#consensus-private-key}

*Konsensüs özel anahtarı* olarak bahsedilen özel anahtar dosyası, **doğrulayıcı özel anahtarı** olarak da adlandırılmaktadır.
Bu özel anahtar, düğüm ağda doğrulayıcı görevi gördüğünde ve yeni verileri imzalaması gerektiğinde kullanılır.

Özel anahtar dosyası `consensus/validator.key`'de yer alır ve bahsedilen [anahtar formatına](/docs/edge/configuration/manage-private-keys#key-format) bağlıdır.

:::warning

Doğrulayıcı özel anahtarı, her doğrulayıcı düğüm için benzersizdir. Aynı anahtar tüm <b>doğrulayıcılar</b> arasında paylaşılmamalıdır çünkü bu, zincirinizin güvenliğini tehlikeye atabilir.

:::

## Ağ Özel Anahtarı {#networking-private-key}

Ağ oluşturmak için bahsedilen özel anahtar dosyası, ilgili PeerID'yi oluşturmak ve düğümün ağa katılmasına izin vermek için libp2p tarafından kullanılır.

`keystore/libp2p.key`'de bulunur ve bahsedilen [anahtar formatına](/docs/edge/configuration/manage-private-keys#key-format) bağlıdır.

## BLS Gizli Anahtarı {#bls-secret-key}

BLS gizli anahtar dosyası, konsensüs katmanında taahhüt edilen mühürleri toplamak için kullanılır. BLS tarafından toplu olarak taahhüt edilen mühürlerin boyutu, serileştirilmiş taahhüt edilen ECDSA imzalarından daha azdır.

BLS özelliği isteğe bağlıdır ve BLS kullanıp kullanmamayı seçmek mümkündür. Daha fazla ayrıntı için [BLS](/docs/edge/consensus/bls)'ye göz atın.

## İçe Aktarma / Dışa Aktarma {#import-export}

Anahtar dosyaları diskte basit Base64 formatında depolandığı için kolayca yedeklenebilir veya içe aktarılabilir.

:::caution Anahtar dosyalarını değiştirme

Halihazırda kurulmuş/çalışan bir ağdaki anahtar dosyalarında yapılan her türlü değişiklik ciddi ağ/konsensüs bozulmasına yol açabilir
çünkü konsensüs ve eş bulma mekanizmaları bu anahtardan türetilen verileri düğüme özgü depoda saklar ve
bağlantıları başlatmak ve konsensüs mantığını gerçekleştirmek için bu verilere güvenir.

:::
---
id: types
title: Türler
description: Polygon Edge'in modül türlerine ilişkin açıklama.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - types
  - marshaling
---

## Genel Bakış {#overview}

**Türler** modülü, temel nesne türlerini uygular; örneğin:

* **Adres**
* **Hash**
* **Başlık**
* birçok yardımcı işlev

## RLP Kodlama / Çözme {#rlp-encoding-decoding}

GETH gibi istemcilerin aksine, Polygon Edge kodlama için yansıtma kullanmaz.<br />
Yansıtma tercih edilmemiştir çünkü bazı yeni sorunlar ortaya çıkarır, örneğin performans,
bozunma ve daha zor ölçekleme.

**Türler** modülü, FastRLP paketi kullanarak RLP marshaling ve unmarshaling için kolay bir arabirim sunar.

Marshaling *MarshalRLPWith* ve *MarshalRLPTo* yöntemleri ile yapılır. Benzer yöntemler unmarshaling
için de mevcuttur.

Bu yöntemleri manuel olarak tanımlayan Polygon Edge'in yansıtma kullanması gerekmez. *rlp_marshal.go* üzerinde
marshaling için yöntemler bulabilirsiniz:

* **Gövdeler**
* **Bloklar**
* **Başlıklar**
* **Alındılar**
* **Günlükler**
* **İşlemler**
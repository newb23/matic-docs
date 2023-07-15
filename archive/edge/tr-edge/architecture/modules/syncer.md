---
id: syncer
title: Eşitleyici
description: Polygon Edge'in eşitleyici modülüne ilişkin açıklama.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - synchronization
---

## Genel Bakış {#overview}

Bu modül, senkronizasyon protokolü mantığını içerir. Çalışan ağda yeni bir düğümü eşitlemek veya konsensüse katılmayan düğümler (doğrulayıcı olmayanlar) için yeni blok doğrulamak/eklemek için kullanılır.

Polygon Edge ağ katmanı olarak **libp2p** kullanır ve bunun yanında **gRPC** çalıştırır.

Polygon Edge'de temelde 2 eşitleme türü bulunur:
* Toplu Eşitleme - tek seferde büyük bir blok aralığını eşitleme
* İzleme Eşitleme - blok bazında eşitleme

### Toplu Eşitleme {#bulk-sync}

Toplu Eşitleme adımları, Toplu Eşitleme hedefini uygulamak için oldukça basittir; diğer eşte mümkün (kullanılabilir) olan en çok bloğu, mümkün olduğunca çabuk eşitleyerek yetişmek.

Toplu Eşitleme işleminin akışı şu şekildedir:

1. ** Düğümün Toplu Eşitleme ihtiyacı olup olmadığını belirleme ** - Bu adımda düğüm eş haritasını kontrol ederek düğümün yerel olarak sahip olduğundan daha büyük bir blok numarası olan biri olup olmadığını kontrol eder
2. ** En iyi eşi bulma (eşitleme eş haritasını kullanarak) ** - Bu adımda düğüm yukarıdaki örnekte belirtilen kriterlere bağlı olarak eşitlenecek en iyi eşi bulur.
3. ** Toplu bir eşitleme akışı açma ** - Bu adımda düğüm ortak blok numarasından blokları eşitlemek için en iyi eşe bir gRPC akışı açar
4. ** Toplu gönderme tamamlandığında akışı en iyi eş kapatır ** - Bu adımda düğümün eşitleme yaptığı en iyi eş, sahip olduğu tüm mevcut blokları gönderdiği anda akışı kapatır
5. ** Toplu eşitleme tamamlandığında düğümün bir doğrulayıcı olup olmadığını kontrol etme ** - Bu adımda akış en iyi eş tarafından kapatılır ve düğümün toplu eşitleme sonrasında onun bir doğrulayıcı olup olmadığını kontrol etmesi gerekir.
  * Eğer öyleyse, eşitleme durumundan çıkar ve konsensüs sürecine katılmaya başlar
  * Öyle değilse, ** İzleme Eşitleme ** durumunda devam eder

### İzleme Eşitleme {#watch-sync}

:::info

İzleme Eşitleme adımı yalnızca düğüm bir doğrulayıcı değilse ama ağdaki normal doğrulayıcı olmayan bir düğüm ise ve sadece gelen blokları dinliyorsa yürütülür.

:::

İzleme Eşitleme davranışı oldukça basittir; düğüm zaten ağın geri kalanı ile eşitlenmiştir ve yalnızca gelen yeni blokları ayrıştırması gerekir.

İzleme Eşitleme işleminin akışı bu şekildedir:

1. ** Bir eşin durumu güncellendiğinde yeni bir blok ekleme ** - Bu adımda düğümler yeni blok olaylarını dinler ve yeni bir blok geldiğinde bir gRPC işlev çağrısı yapar, bloku alır ve yerel durumu günceller.
2. ** En son bloku eşitledikten sonra düğümün bir doğrulayıcı olup olmadığını kontrol etme **
   * Eğer öyleyse, eşitleme durumundan çıkar
   * Değilse, yeni blok olaylarını dinlemeye devam eder

## Performans raporu {#perfomance-report}

:::info

Performans yerel bir makine üzerinde ** bir milyon blok ** eşitleyerek ölçülmüştür

:::

| Ad | Sonuç |
|----------------------|----------------|
| 1M blok eşitleme | ~ 25 dakika |
| 1M blok aktarma | ~ 1 dakika |
| GRPC çağrı sayısı | 2 |
| Test kapsamı | ~ %93 |
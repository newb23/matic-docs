---
id: query-operator-info
title: Operatör bilgisi sorgulama
description: "Operatör bilgileri nasıl sorgulanır?"
keywords:
  - docs
  - polygon
  - edge
  - node
  - query
  - operator
---

## Ön Koşullar {#prerequisites}

Bu kılavuz, [Yerel Kurulum](/docs/edge/get-started/set-up-ibft-locally)'u veya [bulutta bir IBFT kümesinin nasıl kurulacağına dair kılavuzu takip ettiğinizi varsayar](/docs/edge/get-started/set-up-ibft-on-the-cloud).

Her türlü operatör bilgisinin sorgulanabilmesi için çalışan bir düğüme ihtiyaç vardır.

Polygon Edge sayesinde, düğüm operatörleri kontrolü elinde tutar ve işlettikleri düğümün ne yaptığı hakkında bilgilendirilir.<br />
İstedikleri zaman, gRPC üzerine inşa edilen düğüm bilgi katmanını kullanabilir ve anlamlı bilgiler alabilirler - log inceleme gerekmez.

:::note

Düğümünüz `127.0.0.1:8545` üzerinde çalışmıyorsa, bu belgede listelenen komutlara bir `--grpc-address <address:port>` bayrağı eklemeniz gerekir.

:::

## Eş bilgileri {#peer-information}

### Eş listesi {#peers-list}

Bağlı eşlerin (çalışan düğümün kendisi dâhil) tam listesini almak için aşağıdaki komutu çalıştırın:
````bash
polygon-edge peers list
````

Bu, çalışan istemcinin mevcut eşleri olan libp2p adreslerinin bir listesini geri döndürür.

### Eş durumu {#peer-status}

Belirli bir eşin durumu için şunu çalıştırın:
````bash
polygon-edge peers status --peer-id <address>
````
Burada, *adres* parametresi, eşin libp2p adresidir.

## IBFT bilgisi {#ibft-info}

Çoğu zaman, operatörler IBFT konsensüsündeki işletim düğümünün durumu hakkında bilgi edinmek isteyebilir.

Neyse ki, Polygon Edge bu bilgiyi bulmak için kolay bir yol sunuyor.

### Anlık görüntüler {#snapshots}

Aşağıdaki komutu çalıştırmak, en son anlık görüntüyü döndürür.
````bash
polygon-edge ibft snapshot
````
Anlık görüntüyü belirli bir yükseklik için (blok numarası) sorgulamak için, operatör şu komutu çalıştırabilir:
````bash
polygon-edge ibft snapshot --num <block-number>
````

### Adaylar {#candidates}

Operatör, adaylar hakkında en güncel bilgiyi almak için aşağıdaki komutu çalıştırabilir:
````bash
polygon-edge ibft candidates
````
Bu komut, önerilen mevcut aday kümesini ve henüz dâhil edilmemiş adayları sorgular

### Durum {#status}

Aşağıdaki komut, çalışan IBFT istemcisinin geçerli doğrulayıcı anahtarını döndürür:
````bash
polygon-edge ibft status
````

## İşlem havuzu {#transaction-pool}

İşlem havuzundaki mevcut işlem sayısını bulmak için operatör aşağıdaki komutu çalıştırabilir:
````bash
polygon-edge txpool status
````

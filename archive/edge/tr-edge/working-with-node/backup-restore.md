---
id: backup-restore
title: Düğüm örneğini yedekleme/geri yükleme
description: "Polygon Edge düğüm örneği nasıl yedeklenir ve geri yüklenir?"
keywords:
  - docs
  - polygon
  - edge
  - instance
  - restore
  - directory
  - node
---

## Genel Bakış {#overview}

Bu kılavuz bir Polygon Edge düğüm örneğinin nasıl yedekleneceği ve geri yükleneceği hakkında ayrıntılı bilgi verir.
Başarılı bir yedekleme ve geri yükleme için hangi dosyaların kritik olduğunun yanı sıra ana dizinleri ve içeriklerini kapsar.

## Ana dizinler {#base-folders}

Polygon Edge, depolama motoru olarak LevelDB'yi kullanır.
Bir Polygon Edge düğümü başlatılırken, belirtilen çalışma dizininde aşağıdaki alt klasörler oluşturulur:
* **blokchain** - Blok zinciri verilerini depolar
* **trie** - Merkle ağaçlarını depolar (dünya durum verisi)
* **keystore** - İstemci için özel anahtarları depolar. Buna libp2p özel anahtarı ve mühürleyici/doğrulayıcı özel anahtarı dâhildir
* **consensus** - İstemcinin çalışırken ihtiyaç duyabileceği tüm konsensüs bilgilerini depolar. Şimdilik, düğümün *özel doğrulayıcı anahtarını* depolar

Polygon Edge örneğinin sorunsuz çalışması için bu klasörlerin korunması kritik önem taşır.

## Çalışan bir düğümün yedeklenmesi ve yeni düğüm için geri yüklenmesi {#create-backup-from-a-running-node-and-restore-for-new-node}

Bu bölüm, çalışan bir düğümde blok zincirinin arşiv verilerini oluşturma ve başka bir örnekte geri yükleme konusunda size rehberlik eder.

### Yedekleme {#backup}

`backup`komutu, gRPC ile çalışan bir düğümün bloklarını getirir ve bir arşiv dosyası oluşturur. Komutta `--from` ve `--to` belirtilmemişse, bu komut genesis'ten son bloğa kadar tüm blokları getirir.

```bash
$ polygon-edge backup --grpc-address 127.0.0.1:9632 --out backup.dat [--from 0x0] [--to 0x100]
```

### Geri yükleme {#restore}

Bir sunucu, `--restore` bayrağı ile başlarken, başlangıçta bir arşivden blokları içe aktarır. Lütfen yeni düğüm için bir anahtar bulunduğundan emin olun. Anahtarların içe aktarılması veya üretilmesi hakkında daha fazla bilgi edinmek için [Gizli Yöneticiler bölümünü](/docs/edge/configuration/secret-managers/set-up-aws-ssm) ziyaret edin.

```bash
$ polygon-edge server --restore archive.dat
```

## Tüm veriyi Yedekleme/Geri yükleme {#back-up-restore-whole-data}

Bu bölüm, durum verisi ve anahtar dâhil olmak üzere verilerin yedeklenmesi ve yeni örneğe geri yüklenmesi konusunda size rehberlik eder.

### Adım 1: Çalışan istemcinin durdurulması {#step-1-stop-the-running-client}

Polygon Edge, veri depolama için **LevelDB** kullandığı için düğümün yedekleme süresi boyunca durdurulması gerekir
çünkü **LevelDB** veri tabanı dosyalarına eş zamanlı erişime izin vermez.

Ek olarak, Polygon Edge, kapanışta veri senkronizasyonu da yapar.

İlk adım, çalışan istemciyi durdurmayı içerir (bir hizmet yöneticisi veya işleme SIGINT sinyali gönderen başka bir mekanizma aracılığıyla),
böylece doğal bir şekilde kapanırken 2 olayı tetikleyebilir:
* Diskte veri senkronizasyonu yapma
* LevelDB tarafından kilitlenen DB dosyalarının serbest bırakılması

### Adım 2: Dizini yedekleme {#step-2-backup-the-directory}

Artık istemci çalışmadığına göre, veri dizini başka bir ortama yedeklenebilir.
`.key`uzantısına sahip dosyaların, geçerli düğümün taklit edilmesi için kullanılabilecek özel anahtar verilerini içerdiğini
ve bunların asla üçüncü/bilinmeyen bir tarafla paylaşılmaması gerektiğini unutmayın.

:::info

Geri yüklenen düğümün tamamen çalışır durumda olması için lütfen oluşturulan `genesis` dosyasını manuel olarak yedekleyin ve geri yükleyin.

:::

## Geri yükleme {#restore-1}

### Adım 1: Çalışan istemcinin durdurulması {#step-1-stop-the-running-client-1}

Polygon Edge'in çalışan herhangi bir örneği varsa, 2. adımın başarılı olması için durdurulması gerekir.

### Adım 2: Yedeklenen veri dizininin istenen klasöre kopyalanması {#step-2-copy-the-backed-up-data-directory-to-the-desired-folder}

İstemci çalışmadığında, daha önce yedeklenmiş olan veri dizini, istenen klasöre kopyalanabilir.
Ek olarak, daha önce kopyalanan `genesis` dosyasını geri yükleyin.

### Adım 3: Doğru veri dizinini belirterek Polygon Edge istemcisini çalıştırma {#step-3-run-the-polygon-edge-client-while-specifying-the-correct-data-directory}

Polygon Edge'in geri yüklenen veri dizinini kullanması için, kullanıcının başlangıç esnasında veri dizinine giden yolu belirtmesi
gerekir. Lütfen `data-dir` bayrağı hakkındaki bilgiler için [CLI Komutları](/docs/edge/get-started/cli-commands) bölümüne danışın.

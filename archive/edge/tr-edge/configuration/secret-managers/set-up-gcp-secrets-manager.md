---
id: set-up-gcp-secrets-manager
title: GCP Sır Yöneticisi'ni Kurma
description: "Polygon Edge için GCP Sır Yöneticisi'ni Kurun."
keywords:
  - docs
  - polygon
  - edge
  - gcp
  - secrets
  - manager
---

## Genel Bakış {#overview}

Şu anda, Polygon Edge 2 temel çalışma zamanı sırrı tutmakla meşguldür:
* Düğüm bir doğrulayıcı ise, düğüm tarafından kullanılan **doğrulayıcı özel anahtarı**
* Diğer eşlere katılmak ve onlarla iletişim kurmak için libp2p tarafından kullanılan **ağ özel anahtarı**

Daha fazla bilgi için lütfen [Özel Anahtarları Yönetme Kılavuzu](/docs/edge/configuration/manage-private-keys)'nu okuyun

Polygon Edge modüllerinin **nasıl sır tutulacağını bilmesine gerek yoktur**. Sonuçta, bir modülün
sırrın uzaklarda bir sunucuda veya yerel olarak düğümün diskinde depolandığını umursamaması gerekir.

Bir modülün sır tutma hakkında bilmesi gereken her şey **sırrı nasıl kullanacağını**, **hangi sırrı alacağını
veya kaydedeceğini** bilmekten ibarettir. Bu operasyonların daha ince uygulama detayları, elbette bir soyutlama olan `SecretsManager` üzerine yüklenmiştir.

Polygon Edge'i başlatan düğüm operatörü, artık hangi sır yöneticisini kullanmak istediğini belirleyebilir ve
doğru sır yöneticisi somutlaştırıldığında, modüller sözü geçen arabirim aracılığıyla sırları yönetebilir -
bunu sırların bir diskte veya bir sunucuda depolanıp depolanmadığını umursamadan yapar.

Bu makalede, Polygon Edge'i [GCP Sır Yöneticisi](https://cloud.google.com/secret-manager) ile çalışır duruma getirmek için gerekli adımlar açıklanmaktadır.

:::info önceki kılavuzlar

Bu makaleyi okumadan önce, [**Yerel Kurulum**](/docs/edge/get-started/set-up-ibft-locally) ile ilgili makalelerin gözden geçirilmesi **tavsiye edilir**
ve ayrıca [**Bulut Kurulumu**](/docs/edge/get-started/set-up-ibft-on-the-cloud) da okunmalıdır.

:::


## Ön Koşullar {#prerequisites}
### GCP Fatura Hesabı {#gcp-billing-account}
GCP Sır Yöneticisi'ni kullanmak için, kullanıcının GCP portalında [Fatura Hesabını](https://console.cloud.google.com/) etkinleştirmiş olması gerekir.
GCP platformundaki yeni Google hesaplarına, ücretsiz deneme bonusu olarak başlangıç için bazı fonlar verilir.
[GCP belgeleri](https://cloud.google.com/free) hakkında daha fazla bilgi

### Sır Yöneticisi API'si {#secrets-manager-api}
Kullanıcının, kullanmadan önce GCP Sır Yöneticisi API'sini etkinleştirmesi gerekir.
Bu, [Sır Yöneticisi API portali](https://console.cloud.google.com/apis/library/secretmanager.googleapis.com) üzerinden yapılabilir. Daha fazla bilgi için: [Sır Yöneticisi'ni Yapılandırma](https://cloud.google.com/secret-manager/docs/configuring-secret-manager)

### GCP Kimlik Bilgileri {#gcp-credentials}
Son olarak, kullanıcının kimlik doğrulaması için kullanılacak yeni kimlik bilgilerini oluşturması gerekir.
Bu, [burada](https://cloud.google.com/secret-manager/docs/reference/libraries) yayımlanan talimatlar izlenerek yapılabilir.   
Kimlik bilgilerini içeren oluşturulan json dosyası, GCP Sır Yöneticisi'ni kullanması gereken her bir düğüme aktarılmalıdır.

Devam etmeden önce gerekli bilgiler:
* **Proje Kimliği** (GCP platformunda tanımlanan proje kimliği)
* **Kimlik Bilgileri Dosya Konumu** (kimlik bilgilerini içeren json dosyasının konumu)

## Adım 1 - Sır yöneticisi yapılandırmasını oluşturma {#step-1-generate-the-secrets-manager-configuration}

Polygon Edge'in GCP SM ile sorunsuz bir şekilde iletişim kurabilmesi için zaten oluşturulmuş bir yapılandırma dosyasını ayrıştırması gerekir
ve bu dosya GCP SM üzerinde sır depolama için gerekli tüm bilgiyi içerir.

Yapılandırmayı oluşturmak için aşağıdaki komutu çalıştırın:

```bash
polygon-edge secrets generate --type gcp-ssm --dir <PATH> --name <NODE_NAME> --extra project-id=<PROJECT_ID>,gcp-ssm-cred=<GCP_CREDS_FILE>
```

Mevcut parametreler:
* `PATH`, yapılandırma dosyasının dışa aktarılacağı dizindir. Varsayılan `./secretsManagerConfig.json`
* `NODE_NAME`, GCP SM yapılandırmasının kurulduğu mevcut düğümün adıdır. Gelişigüzel bir değer olarak belirlenebilir. Varsayılan `polygon-edge-node`
* `PROJECT_ID`, kullanıcının hesap kurulumu ve Sır Yöneticisi API etkinleştirmesi sırasında GCP konsolunda tanımladığı projenin kimliğidir.
* `GCP_CREDS_FILE`, Sır Yöneticisi'ne okuma/yazma erişimi sağlayacak olan kimlik bilgilerini içeren json dosyasına giden yoldur.

:::caution Düğüm adları

Düğüm adlarını belirlerken dikkatli olun.

Polygon Edge GCP SM üzerinde oluşturduğu ve kullandığı sırları takip etmek için belirlenen düğüm adını kullanır.
Mevcut bir düğüm adının belirtilmesi, GCP SM'ye sır yazılmaması gibi sonuçlar doğurabilir.

Sırlar aşağıdaki temel dizinde depolanır: `projects/PROJECT_ID/NODE_NAME`

:::

## Adım 2 - Yapılandırmayı kullanarak gizli anahtarları başlatma {#step-2-initialize-secret-keys-using-the-configuration}

Artık yapılandırma dosyası mevcut olduğuna göre, gerekli gizli anahtarları
adım 1'de ayarlanan yapılandırma dosyası ile `--config` kullanarak başlatabiliriz:

```bash
polygon-edge secrets init --config <PATH>
```

`PATH` parametresi, daha önce adım 1'de oluşturulan sır yöneticisi parametresinin konumudur.

## Adım 3 - Genesis dosyasını oluşturma {#step-3-generate-the-genesis-file}

Genesis dosyası [**Yerel Kurulum**](/docs/edge/get-started/set-up-ibft-locally)
ve [**Bulut Kurulumu**](/docs/edge/get-started/set-up-ibft-on-the-cloud) kılavuzları ile benzer şekilde, ancak birkaç küçük değişiklik ile oluşturulmalıdır.

GCP SM, yerel dosya sistemi yerine kullanıldığından, doğrulayıcı adresleri `--ibft-validator` bayrağı ile eklenmelidir:
```bash
polygon-edge genesis --ibft-validator <VALIDATOR_ADDRESS> ...
```

## Adım 4 - Polygon Edge istemcisini başlatma {#step-4-start-the-polygon-edge-client}

Artık anahtarlar kurulduğuna ve genesis dosyası oluşturulduğuna göre, bu işlemin son adımı
Polygon Edge'i `server` komutu ile başlatmak olacaktır.

`server` komutu daha önce bahsedilen kılavuzlardaki gibi aynı şekilde, küçük bir ekleme ile kullanılmalıdır: `--secrets-config`bayrağı:
```bash
polygon-edge server --secrets-config <PATH> ...
```

`PATH` parametresi, daha önce adım 1'de oluşturulan sır yöneticisi parametresinin konumudur.
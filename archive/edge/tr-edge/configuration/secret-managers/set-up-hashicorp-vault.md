---
id: set-up-hashicorp-vault
title: Hashicorp Vault'u Kurma
description: "Polygon Edge için Hashicorp Vault kurun."
keywords:
  - docs
  - polygon
  - edge
  - hashicorp
  - vault
  - secrets
  - manager
---

## Genel Bakış {#overview}

Şu anda, Polygon Edge 2 temel çalışma zamanı sırrı tutmakla meşguldür:
* Düğüm bir doğrulayıcı ise, düğüm tarafından kullanılan **doğrulayıcı özel anahtarı**
* Diğer eşlere katılmak ve onlarla iletişim kurmak için libp2p tarafından kullanılan **ağ özel anahtarı**

:::warning

Doğrulayıcı özel anahtarı, her doğrulayıcı düğüm için benzersizdir. Aynı anahtar, zincirinizin güvenliğini tehlikeye atabileceği için, tüm <b>doğrulayıcılar</b> arasında paylaşılmamalıdır.

:::

Daha fazla bilgi için lütfen [Özel Anahtarları Yönetme Kılavuzu](/docs/edge/configuration/manage-private-keys)'nu okuyun

Polygon Edge modüllerinin **nasıl sır tutulacağını bilmesine gerek yoktur**. Sonuçta, bir modülün
sırrın uzaklarda bir sunucuda veya yerel olarak düğümün diskinde depolandığını umursamaması gerekir.

Bir modülün sır tutma hakkında bilmesi gereken her şey **sırrı nasıl kullanacağını**, **hangi sırrı alacağını
veya kaydedeceğini** bilmekten ibarettir. Bu operasyonların daha ince uygulama detayları, elbette bir soyutlama olan `SecretsManager` üzerine yüklenmiştir.

Polygon Edge'i başlatan düğüm operatörü, artık hangi sır yöneticisini kullanmak istediğini belirleyebilir ve
doğru sır yöneticisi somutlaştırıldığında, modüller sözü geçen arabirim aracılığıyla sırları yönetebilir -
ve bunu sırların bir diskte veya bir sunucuda depolanıp depolanmadığını umursamadan yapar.

Bu makalede, Polygon Edge'i bir [Hashicorp Vault](https://www.vaultproject.io/) sunucusu ile çalışır duruma getirmek için gerekli adımlar açıklanmaktadır.

:::info önceki kılavuzlar

Bu makaleyi okumadan önce, [**Yerel Kurulum**](/docs/edge/get-started/set-up-ibft-locally) ile ilgili makalelerin gözden geçirilmesi **tavsiye edilir**
ve ayrıca [**Bulut Kurulumu**](/docs/edge/get-started/set-up-ibft-on-the-cloud) da okunmalıdır.

:::


## Ön Koşullar {#prerequisites}

Bu makalede, Hashicorp Vault sunucusunun çalışan bir örneğinin **zaten kurulu olduğu** varsayılmaktadır.

Buna ek olarak, Polygon Edge için kullanılan Hashicorp Vault sunucusunun **KV depolamasını etkinleştirmiş** olması gerekir.

Devam etmeden önce gerekli bilgiler:
* **Sunucu URL'si** (Hashicorp Vault sunucusunun API URL'si)
* **Token** (KV depolama motoruna erişim için kullanılan erişim token'ı)

## Adım 1 - Sır yöneticisi yapılandırmasını oluşturma {#step-1-generate-the-secrets-manager-configuration}

Polygon Edge'in Vault sunucusu ile sorunsuz bir şekilde iletişim kurabilmesi için zaten oluşturulmuş bir yapılandırma dosyasını ayrıştırması gerekir
ve bu dosya Vault üzerinde sır depolama için gerekli tüm bilgiyi içerir.

Yapılandırmayı oluşturmak için aşağıdaki komutu çalıştırın:

```bash
polygon-edge secrets generate --dir <PATH> --token <TOKEN> --server-url <SERVER_URL> --name <NODE_NAME>
```

Mevcut parametreler:
* `PATH`, yapılandırma dosyasının dışa aktarılacağı dizindir. Varsayılan `./secretsManagerConfig.json`
* `TOKEN` daha önce [ön koşullar bölümünde](/docs/edge/configuration/secret-managers/set-up-hashicorp-vault#prerequisites) bahsedilen erişim token'ıdır
* `SERVER_URL`, Vault sunucusunun API'sinin URL'sidir ve [ön koşullar bölümünde](/docs/edge/configuration/secret-managers/set-up-hashicorp-vault#prerequisites) de anlatılmıştır
* `NODE_NAME`, Vault yapılandırmasının ayarlandığı geçerli düğümün adıdır. Gelişigüzel bir değer olarak belirlenebilir. Varsayılan `polygon-edge-node`

:::caution Düğüm adları

Düğüm adlarını belirlerken dikkatli olun.

Polygon Edge, Vault örneğinde oluşturduğu ve kullandığı sırları takip etmek için belirlenen düğüm adını kullanır.
Varolan bir düğüm adı belirtilmesi, Vault sunucusunda verilerin üzerine yazılmasıyla sonuçlanabilir.

Sırlar aşağıdaki temel dizinde depolanır: `secrets/node_name`

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

Hashicorp Vault yerel dosya sistemi yerine kullanıldığından, doğrulayıcı adresleri `--ibft-validator`bayrağı ile eklenmelidir:
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
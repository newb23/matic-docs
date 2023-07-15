---
id: set-up-aws-ssm
title: AWS SSM (Sistem Yöneticisi) yapılandırması
description: "Polygon Edge için AWS SSM (Sistem Yöneticisi) yapılandırın."
keywords:
  - docs
  - polygon
  - edge
  - aws
  - ssm
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

Bu makalede, Polygon Edge'in
[AWS Systems Manager Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html) ile sorunsuz bir şekilde çalıştırılması için gereken adımlar ayrıntılarıyla anlatılmaktadır.

:::info önceki kılavuzlar

Bu makaleyi okumadan önce, [**Yerel Kurulum**](/docs/edge/get-started/set-up-ibft-locally) ile ilgili makalelerin gözden geçirilmesi **tavsiye edilir**
ve ayrıca [**Bulut Kurulumu**](/docs/edge/get-started/set-up-ibft-on-the-cloud) da okunmalıdır.

:::


## Ön Koşullar {#prerequisites}
### IAM Politikası {#iam-policy}
Kullanıcının AWS Systems Manager Parameter Store için okuma/yazma işlemlerine izin veren bir IAM Politikası oluşturması gerekir.
IAM Politikasını başarıyla oluşturduktan sonra, kullanıcı bunu Polygon Edge sunucusunu çalıştıran EC2 oturumuna eklemelidir.
IAM Politikası şöyle bir şeye benzemelidir:
```json
{
  "Version": "2012-10-17",
  "Statement" : [
    {
      "Effect" : "Allow",
      "Action" : [
        "ssm:PutParameter",
        "ssm:DeleteParameter",
        "ssm:GetParameter"
      ],
      "Resource" : [
        "arn:aws:ssm:<aws_region>:<aws_account_id>:parameter<ssm-parameter-path>*"
      ]
    }
  ]
}
```
AWS SSM IAM Rolleri hakkında daha bilgiyi [AWS belgeleri](https://docs.aws.amazon.com/systems-manager/latest/userguide/setup-instance-profile.html) içinde bulabilirsiniz.

Devam etmeden önce gerekli bilgiler:
* **Bölge** (Sistem Yöneticisinin ve düğümlerin bulunduğu bölge)
* **Parametre Yolu** (sırrın yerleştirileceği gelişigüzel bir dizin, örneğin `/polygon-edge/nodes`)

## Adım 1 - Sır yöneticisi yapılandırmasını oluşturma {#step-1-generate-the-secrets-manager-configuration}

Polygon Edge'in AWS SSM ile sorunsuz bir şekilde iletişim kurabilmesi için zaten oluşturulmuş bir yapılandırma dosyasını ayrıştırması gerekir
ve bu dosya AWS SSM üzerinde sır depolama için gerekli tüm bilgiyi içerir.

Yapılandırmayı oluşturmak için aşağıdaki komutu çalıştırın:

```bash
polygon-edge secrets generate --type aws-ssm --dir <PATH> --name <NODE_NAME> --extra region=<REGION>,ssm-parameter-path=<SSM_PARAM_PATH>
```

Mevcut parametreler:
* `PATH`, yapılandırma dosyasının dışa aktarılacağı dizindir. Varsayılan `./secretsManagerConfig.json`
* `NODE_NAME`, AWS SSM yapılandırmasının kurulduğu mevcut düğümün adıdır. Gelişigüzel bir değer olarak belirlenebilir. Varsayılan `polygon-edge-node`
* `REGION` AWS SSM'nin konumlandığı bölgedir. AWS SSM kullanan düğüm ile aynı bölgede olmalıdır.
* `SSM_PARAM_PATH`, sırrın depolanacağı dizinin adıdır. Örneğin, `--name node1` ve `ssm-parameter-path=/polygon-edge/nodes`
belirlendiyse, sır `/polygon-edge/nodes/node1/<secret_name>` olarak depolanacaktır

:::caution Düğüm adları

Düğüm adlarını belirlerken dikkatli olun.

Polygon Edge, AWS SSM üzerinde oluşturduğu ve kullandığı sırları takip etmek için belirlenen düğüm adını kullanır.
Mevcut bir düğümün adını belirlemek, AWS SSM için sır yazamamak gibi sonuçlara neden olabilir.

Sırlar aşağıdaki temel dizinde depolanır: `SSM_PARAM_PATH/NODE_NAME`

:::

## Adım 2 - Yapılandırmayı kullanarak gizli anahtarları başlatma {#step-2-initialize-secret-keys-using-the-configuration}

Artık yapılandırma dosyası mevcut olduğuna göre, gerekli gizli anahtarları
adım 1'de ayarlanan yapılandırma dosyası ile `--config` kullanarak başlatabiliriz:

```bash
polygon-edge secrets init --config <PATH>
```

`PATH` parametresi, daha önce adım 1'de oluşturulan sır yöneticisi parametresinin konumudur.

:::info IAM Politikası

Okuma/yazma işlemlerine izin veren IAM Politikası doğru şekilde yapılandırılmadıysa veya bu komutu çalıştıran EC2 oturumuna eklenmediyse bu adım başarısız olacaktır.

:::

## Adım 3 - Genesis dosyasını oluşturma {#step-3-generate-the-genesis-file}

Genesis dosyası [**Yerel Kurulum**](/docs/edge/get-started/set-up-ibft-locally)
ve [**Bulut Kurulumu**](/docs/edge/get-started/set-up-ibft-on-the-cloud) kılavuzları ile benzer şekilde, ancak birkaç küçük değişiklik ile oluşturulmalıdır.

AWS SSM, yerel dosya sistemi yerine kullanıldığından, doğrulayıcı adresleri `--ibft-validator` bayrağı ile eklenmelidir:
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
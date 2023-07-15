---
id: terraform-aws-deployment
title: Terraform AWS ile Devreye Alma
description: "Terraform kullanarak AWS bulut sağlayıcı üzerinde Polygon Edge ağını devreye alın"
keywords:
  - docs
  - polygon
  - edge
  - deployment
  - terraform
  - aws
  - script
---
:::info Üretim devreye alma kılavuzu

Bu kılavuz resmî, üretime hazır, tamamen otomatik, AWS devreye alma kılavuzudur.

Test için ve/veya bulut sağlayıcınızın AWS olmaması hâlinde ***[Bulut](set-up-ibft-on-the-cloud)*** veya ***[Yerel](set-up-ibft-locally)***
için manuel devreye alma tavsiye edilir.

:::

:::info

Bu devreye alma işlemi yalnızca PoA içindir.   
PoS mekanizmasına ihtiyaç duyuluyorsa, PoA'dan PoS'a geçiş yapmak için bu ***[kılavuzu](/docs/edge/consensus/migration-to-pos)*** takip etmeniz yeterlidir.

:::

Bu kılavuz, doğrulayıcı düğümler birden çok kullanılabilirlik bölgesine yayıldığından üretime hazır olan bir Polygon Edge blok zinciri ağını
AWS bulut sağlayıcısında devreye alma işlemini ayrıntılı olarak açıklayacaktır.

## Ön Koşullar {#prerequisites}

### Sistem araçları {#system-tools}
* [terraform](https://www.terraform.io/)
* [aws cli](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
* [aws erişim anahtarı kimliği ve gizli erişim anahtarı](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-prereqs.html#getting-started-prereqs-keys)

### Terraform değişkenleri {#terraform-variables}
Dağıtımı çalıştırmadan önce sağlanması gereken iki değişken:

* `alb_ssl_certificate`- https protokolü için ALB tarafından kullanılacak olan AWS Sertifika Yöneticisi'nin sertifikasının ARN'si.   
  Sertifika, devreye alma işlemine başlamadan önce oluşturulmalı ve **Çıkarıldı** durumuna sahip olmalıdır
* `premine` - önceden mine edilmiş yerel para birimini alacak hesap.
Değer, resmî [CLI](/docs/edge/get-started/cli-commands#genesis-flags) bayrağındaki teknik özelliklere uygun olmalıdır

## Devreye alma bilgileri {#deployment-information}
### Devreye alınan kaynaklar {#deployed-resources}
Devreye alınacak kaynaklara ilişkin üst düzey genel bakış:

* Adanmış VPC
* 4 doğrulayıcı düğüm (aynı zamanda önyükleme düğümleri)
* Düğümlerin giden internet trafiğine izin vermek için 4 NAT ağ geçidi
* İlk (genesis) bloku oluşturmak ve zinciri başlatmak için kullanılan Lambda işlevi
* Özel güvenlik grupları ve IAM rolleri
* genesis.json dosyasını saklamak için kullanılan S3 bucket
* JSON-RPC uç noktasını göstermek için kullanılan Uygulama Yük Dengeleyici

### Hata toleransı {#fault-tolerance}

Bu devreye alma işlemi için yalnızca 4 kullanılabilirlik bölgesine sahip bölgeler gereklidir. Her bir düğüm tek bir AZ'de devreye alınır.

Her düğüm tek bir AZ'ye yerleştirildiğinde, tüm blok zinciri kümesi tek bir düğüm (AZ) hatasına karşı hataya dayanıklı hale gelir çünkü Polygon Edge,
4 doğrulayıcı düğümlü bir kümede tek bir düğümün başarısız olmasına izin veren IBFT konsensüsünü uygulamaktadır.

### Komut satırı erişimi {#command-line-access}

Doğrulayıcı düğümler hiçbir şekilde genel internete açık değildir (JSON-PRC'ye yalnızca ALB üzerinden erişilir)
ve onlara bağlı genel IP adresleri bile yoktur.  
Düğüm komut satırı erişimi yalnızca [AWS Sistem Yöneticisi - Oturum Yöneticisi](https://aws.amazon.com/systems-manager/features/) üzerinden mümkündür.

### Temel AMI yükseltme {#base-ami-upgrade}

Bu devreye alma işlemi `ubuntu-focal-20.04-amd64-server` AWS AMI kullanır. AWS AMI güncellenirse EC2 *yeniden devreye alma işlemini* **tetiklemez**.

Herhangi bir nedenle temel AMI'nin güncellenmesi gerekiyorsa,
Her bir örnek için `terraform apply`'den önce için `terraform taint` komutu çalıştırılarak gerçekleştirilebilir.   
Örnekler,     
`terraform taint module.instances[<instance_number>].aws_instance.polygon_edge_instance` komutu çalıştırılarak elde edilebilir.

Örnek:
```shell
terraform taint module.instances[0].aws_instance.polygon_edge_instance
terraform taint module.instances[1].aws_instance.polygon_edge_instance
terraform taint module.instances[2].aws_instance.polygon_edge_instance
terraform taint module.instances[3].aws_instance.polygon_edge_instance
terraform apply
```

:::info

Bir üretim ortamında, blok zinciri ağını işlevsel tutmak için `terraform taint` tek tek çalıştırılmalıdır.

:::

## Dağıtım prosedürü {#deployment-procedure}

### Önceden devreye alma adımları {#pre-deployment-steps}
* [polygon-technology-edge](https://registry.terraform.io/modules/aws-ia/polygon-technology-edge/aws) terraform kayıt defteri benioku (readme) dosyasını okuyun
* modüllerin benioku sayfasında yer alan *provizyon talimatlarını* kullanarak `polygon-technology-edge`modülünü `main.tf` dosyasına ekleyin
* gerekli tüm Terraform bağımlılıklarını kurmak için `terraform init` komutunu çalıştırın
* [AWS Sertifika Yöneticisi](https://aws.amazon.com/certificate-manager/)'nde yeni bir sertifika sağlayın
* sağlanan sertifikanın **Çıkarıldı** durumunda olduğundan emin olun ve sertifikanın **ARN**'sini not edin
* modüllerin çıktısını cli'de almak için çıktı ifadenizi ayarlayın

#### `main.tf` örnek {#example}
```terraform
module "polygon-edge" {
  source  = "aws-ia/polygon-technology-edge/aws"
  version = ">=0.0.1"

  premine             = var.premine
  alb_ssl_certificate = var.alb_ssl_certificate
}

output "json_rpc_dns_name" {
  value       = module.polygon-edge.jsonrpc_dns_name
  description = "The dns name for the JSON-RPC API"
}

variable "premine" {
  type        = string
  description = "Public account that will receive premined native currency"
}

variable "alb_ssl_certificate" {
  type        = string
  description = "The ARN of SSL certificate that will be placed on JSON-RPC ALB"
}
```

#### `terraform.tfvars` örnek {#example-1}
```terraform
premine             = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
alb_ssl_certificate = "arn:aws:acm:us-west-2:123456789:certificate/64c7f117-61f5-435e-878b-83186676a8af"
```

### Devreye alma adımları {#deployment-steps}
* `terraform.tfvars` dosyasını oluşturun
* (yukarda açıklandığı gibi) bu dosya içindeki gerekli terraform değişkenlerini ayarlayın.
:::info

Bu dağıtımı tamamen özelleştirebilecek zorunlu olmayan başka değişkenler de vardır.
Kendi değerlerinizi `terraform.tfvars` dosyasına yazarak varsayılan değerleri geçersiz kılabilirsiniz.

  Mevcut tüm değişkenlerin teknik özellikleri, modüllerin Terraform ***[kayıt defterinde](https://registry.terraform.io/modules/aws-ia/polygon-technology-edge/aws)***bulunabilir.

:::
* `aws s3 ls` çalıştırarak bir aws cli kimlik doğrulamasını doğru bir şekilde kurduğunuzdan emin olun; hiçbir hata olmamalıdır
* `terraform apply` altyapısını devreye alın

### Devreye alma sonrası adımlar {#post-deployment-steps}
* Devreye alma tamamlandıktan sonra, cli'de yazdırılan `json_rpc_dns_name` değişken değerini not edin
* Alan adınızı, sağlanan `json_rpc_dns_name` değerine yönlendiren genel bir dns cname kaydı oluşturun. Örneğin:
  ```shell
  # BIND syntax
  # NAME                            TTL       CLASS   TYPE      CANONICAL NAME
  rpc.my-awsome-blockchain.com.               IN      CNAME     jrpc-202208123456879-123456789.us-west-2.elb.amazonaws.com.
  ```
* cname kaydı yayıldıktan sonra, JSON-PRC uç noktanızı çağırarak zincirin düzgün çalışıp çalışmadığını denetleyin.   
  Yukarıdaki örnekte:
  ```shell
    curl  https://rpc.my-awsome-blockchain.com -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
  ```

## İmha prosedürü {#destroy-procedure}
:::warning

Aşağıdaki prosedür, bu terraform komut dosyalarıyla devreye alınan tüm altyapınızı kalıcı olarak silecektir.    
Doğru [blok zinciri veri yedeklemelerine](docs/edge/working-with-node/backup-restore) sahip olduğunuzdan ve/veya bir test ortamıyla çalıştığınızdan emin olun.

:::

Tüm altyapıyı kaldırmanız gerekiyorsa, aşağıdaki `terraform destroy` komutunu çalıştırın.   
Ek olarak, devreye alma işleminin gerçekleştiği bölge için AWS [Parametre Store](https://aws.amazon.com/systems-manager/features/)'da saklanan
 sırları manuel olarak kaldırmanız gerekir.

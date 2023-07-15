---
id: validator-hosting
title: Doğrulayıcı Barındırma
description: "Polygon Edge için barındırma gereksinimleri"
keywords:
- docs
- polygon
- edge
- hosting
- cloud
- setup
- validator
---

Aşağıda bir Polygon Edge ağında bir doğrulayıcı düğümünü doğru şekilde barındırmak için öneriler verilmiştir. Lütfen aşağıda listelenen tüm maddelere dikkat ederek
doğrulayıcı kurulumunuzun güvenli, kararlı ve yüksek performanslı olacak şekilde doğru yapılandırıldığından emin olun.

## Bilgi tabanı {#knowledge-base}

Doğrulayıcı düğümü çalıştırmaya başlamadan önce, lütfen bu dokümanı dikkatle okuyun.   
Yardımcı olabilecek ilave dokümanlar şunlardır:

- [Kurulum](get-started/installation)
- [Bulut kurulumu](get-started/set-up-ibft-on-the-cloud)
- [CLI komutları](get-started/cli-commands)
- [Sunucu yapılandırma (config) dosyası](configuration/sample-config)
- [Özel anahtarlar](configuration/manage-private-keys)
- [Prometheus ölçümleri](configuration/prometheus-metrics)
- [Gizli bilgi yöneticileri](/docs/category/secret-managers)
- [Yedekleme/Geri Yükleme](working-with-node/backup-restore)

## Asgari sistem gereksinimleri {#minimum-system-requirements}

| Tür | Değer | Etkileyenler |
|------|------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|
| CPU | 2 çekirdek | <ul><li>JSON-RPC sorgularının sayısı</li><li>Blok zinciri durum boyutu</li><li>Blok gaz limiti</li><li>Blok süresi</li></ul> |
| RAM | 2 GB | <ul><li>JSON-RPC sorgularının sayısı</li><li>Blok zinciri durum boyutu</li><li>Blok gaz limiti</li></ul> |
| Disk | <ul><li>10 GB kök bölümü</li><li>Disk genişletme için LVM ile 30 GB kök bölümü</li></ul> | <ul><li>Blok zinciri durum boyutu</li></ul> |


## Hizmet yapılandırması {#service-configuration}

`polygon-edge` binary dosyası, ağ bağlantısı kurulduğunda otomatik olarak bir sistem hizmeti olarak çalışmalıdır ve başlatma / durdurma / yeniden başlatma işlevlerine
sahip olmalıdır `systemd.` gibi bir hizmet yöneticisi kullanmanızı öneririz

Örnek `systemd` sistem yapılandırma dosyası:
```
[Unit]
Description=Polygon Edge Server
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=10
User=ubuntu
ExecStart=/usr/local/bin/polygon-edge server --config /home/ubuntu/polygon/config.yaml

[Install]
WantedBy=multi-user.target
```

### Binary dosya {#binary}

Production iş yüklerinde `polygon-edge` binary dosyası, yalnızca önceden oluşturulmuş (pre-built) GitHub sürümü binary dosyalarından devreye alınmalıdır; manuel derleme kullanılmamalıdır.
:::info

`develop` GitHub dallanmasını manuel olarak derlediğinizde, ortamınıza breaking (çalışmanın kesilmesine neden olabilecek) değişiklikler ekleyebilirsiniz.   
Bu nedenle, Polygon Edge binary dosyasını yalnızca sürümlerden devreye almanız önerilir; çünkü
sürümlerde, breaking (çalışmanın kesilmesine neden olabilecek) değişiklikler ve bunların nasıl çözüleceği bilgileri yer alır.

:::

Kurulum yönteminin tam bir genel özeti için lütfen [Kurulum](/docs/edge/get-started/installation) bölümüne bakın.

### Veri depolama {#data-storage}

Blok zinciri durumunun tamamını içeren `data/` klasörü, buna ayrılmış bir diske / disk bölümüne mount edilerek
otomatik disk yedeklemelerine, disk bölümü genişletmeye ve isteğe bağlı olarak arıza durumunda diskin/disk bölümünün başka bir kuruluma (instance) mount edilmesine olanak sağlanmalıdır.


### Günlük dosyaları {#log-files}

Günlük dosyalarının (`logrotate` gibi bir araç kullanılarak) her gün yenilenmesi (rotation) gerekir.
:::warning

Günlük yenilemesi (rotation) olmadan yapılandırma yapılırsa, günlük dosyaları kullanılabilir disk alanının tamamını doldurarak doğrulayıcının çalışır kalma süresini (uptime) düşürebilir.

:::

Örnek `logrotate` yapılandırması:
```
/home/ubuntu/polygon/logs/node.log
{
        rotate 7
        daily
        missingok
        notifempty
        compress
        prerotate
                /usr/bin/systemctl stop polygon-edge.service
        endscript
        postrotate
                /usr/bin/systemctl start polygon-edge.service
        endscript
}
```


Günlüklerin saklanması hakkındaki öneriler için aşağıdaki [Günlükleme](#logging) bölümüne bakın.

### Ek bağımlılıklar {#additional-dependencies}

`polygon-edge` statik olarak derlenir ve ek ana makine (host) OS bağımlılığı gerekmez.

## Bakım {#maintenance}

Polygon Edge ağının bir doğrulayıcı düğümünün çalışmasını sürdürmek için en iyi uygulamalar aşağıda verilmiştir.

### Yedekleme {#backup}

Polygon Edge düğümleri için önerilen iki tür yedekleme prosedürü vardır.

Önerimiz, mümkün olduğunda her ikisini de kullanarak Polygon Edge yedeklemesini her zaman ulaşılabilir bir seçenek olarak tutmaktır.

* ***Disk bölümü yedekleme***    
  Polygon Edge düğümünün bulunduğu `data/` disk bölümünün veya mümkünse tüm VM'nin günlük bazda artımlı olarak yedeklemesi.


* ***Polygon Edge yedeklemesi***:    
  Polygon Edge düzenli yedeklemeleri yapan ve `.dat` dosyalarını uzaktaki bir konuma veya güvenli bir bulut nesne depolamasına taşıyan, günlük çalıştırılan CRON görevi (CRON job) önerilir.

Polygon Edge yedeklemesi ve yukarıda açıklanan Disk Bölümü yedeklemesi tercihen birbiriyle çakışmamalıdır.

Polygon Edge yedeklemelerinin nasıl yapılacağına dair talimatlar için [Düğüm kurulumunun yedeklenmesi/geri yüklenmesi](working-with-node/backup-restore) bölümüne bakın.

### Günlükleme {#logging}

Polygon Edge düğümleri tarafından oluşturulan günlükler:
- dizinleme ve arama imkanları olan harici bir veri deposuna gönderilmelidir;
- 30 günlük bir günlük saklama süresine sahip olmalıdır.

Polygon Edge doğrulayıcı kurulumunu ilk kez yapıyorsanız, düğümü başlatırken
`--log-level=DEBUG` seçeneğini kullanmanızı öneririz; bu sayede, karşılaşabileceğiniz sorunları hızlı bir şekilde giderebilirsiniz (debug).

:::info

`--log-level=DEBUG`, düğümün günlük çıktısını olabildiğince ayrıntılı yapar.   
Hata giderme günlükleri, günlük dosya boyutlarını büyük ölçüde artıracaktır; bu durum günlük yenileme çözümü kurulurken
dikkate alınmalıdır.

:::
### OS güvenlik yamaları {#os-security-patches}

Yöneticiler, her ay en az bir kez güncelleme yaparak, doğrulayıcı OS'nin her zaman en son yamalarla güncel kalmasını sağlamalıdır.

## Ölçümler {#metrics}

### Sistem ölçümleri {#system-metrics}

Yöneticiler bir çeşit sistem ölçümleri izleyicisi kurmalıdır, (ör. Telegraf + InfluxDB + Grafana veya bir üçüncü taraf SaaS).

İzlenmesi ve hakkında alarm bildirimleri kurulması gereken ölçümler şunlardır:

| Ölçüm adı | Alarm eşiği |
|-----------------------|-------------------------------|
| CPU kullanımı (%) | 5 dakikadan fazla %90 üzerinde kalması |
| RAM kullanımı (%) | 5 dakikadan fazla %90 üzerinde kalması |
| Kök disk kullanımı | > %90 |
| Veri diski kullanımı | > %90 |

### Doğrulayıcı ölçümleri {#validator-metrics}

Blok zinciri performansını izleyebilmek için, yöneticiler tarafından, Polygon Edge'in Prometheus API ölçümlerinin
toplanmasının ayarlanması gerekir.

Hangi ölçümlerin okunmaya açık olduğunu ve Prometheus ölçümlerin toplanmasının nasıl ayarlanacağını öğrenmek için [Prometheus ölçümlerine](configuration/prometheus-metrics) bakın.


Aşağıdaki ölçümlere özellikle dikkat edilmesi gerekir:
- ***Blok üretim süresi*** - Blok üretim süresi normalden daha yüksekse, ağda bir sorun olması muhtemeldir
- ***Konsensüs roundlarının sayısı*** - Round sayısı birden fazlaysa, ağdaki doğrulayıcı kümesinde bir sorun olması muhtemeldir
- ***Eşlerin (peers) sayısı*** - Eşlerin sayısı düşerse, ağda bir bağlantı sorunu vardır

## Güvenlik {#security}

Polygon Edge ağının bir doğrulayıcı düğümünün güvenliğini sağlamak için en iyi uygulamalar aşağıda verilmiştir.

### API hizmetleri {#api-services}

- ***JSON-RPC*** -
Genele açık olması gereken tek API hizmetidir ( yük dengeleyici üzerinden veya doğrudan ).   
Bu API, tüm arayüzler üzerinde veya belirli bir IP adresinde çalışmalıdır ( ör. `--json-rpc 0.0.0.0:8545` veya `--json-prc 192.168.1.1:8545`  ).
:::info

Genele açık bir API olduğundan, güvenliği sağlamak ve hızı sınırlamak için önünde bir yük dengeleyici / tersine proxy olması önerilir.

:::


- ***LibP2P*** -
Bu, eşlerin haberleşmesi için düğümler tarafından kullanılan ağ API'sidir. Tüm arayüzlerde veya belirli bir IP adresinde çalışması gerekir
( `--libp2p 0.0.0.0:1478` veya `--libp2p 192.168.1.1:1478` ). Bu API, genelin kullanımına açık olmamalıdır
ama diğer tüm düğümler tarafından erişilebilir olmalıdır.
:::info

Bir yerel ana makine (localhost) üzerinde çalıştırılırsa ( `--libp2p 127.0.0.1:1478` ) diğer düğümler bağlanamayacaktır.

:::


- ***GRPC*** -
Bu API sadece ve sadece operatör komutlarını çalıştırmak için kullanılır. Bu nedenle yalnızca localhost ( `--grpc-address 127.0.0.1:9632` ) üzerinde çalıştırılmalıdır.

### Polygon Edge gizli bilgileri {#polygon-edge-secrets}

Polygon Edge gizli bilgileri ( `ibft` ve `libp2p` anahtarları ), yerel dosya sistemi üzerinde saklanmamalıdır.  
Bunun yerine, desteklenen bir [Gizli Bilgi Yöneticisi](configuration/secret-managers/set-up-aws-ssm) kullanılmalıdır.   
Gizli bilgilerin yerel dosya sisteminde saklanması, yalnızca production dışı ortamlarda yapılabilir.

## Güncelleme {#update}

Aşağıda, doğrulayıcı düğümleri için önerilen güncelleme prosedürü adım adım talimatlar hâlinde verilmiştir.

### Güncelleme prosedürü {#update-procedure}

- Resmî GitHub [sürümlerinden](https://github.com/0xPolygon/polygon-edge/releases) en son Polygon Edge binary dosyasını indirin
- Polygon Edge hizmetini durdurun ( ör. `sudo systemctl stop polygon-edge.service` )
- Mevcut `polygon-edge` binary dosyasını, indirdiğiniz dosya ile değiştirin ( ör. `sudo mv polygon-edge /usr/local/bin/` )
- Doğru `polygon-edge` versiyonunun çalıştığını kontrol etmek için `polygon-edge version` komutunu çalıştırın - sürüm versiyonu ile aynı olmalıdır
- `polygon-edge` hizmetini başlatmadan önce, yapılması gereken geriye dönük uyumluluk adımları olup olmadığını görmek için sürüm dokümantasyonunu kontrol edin
- `polygon-edge` hizmetini başlatın ( ör. `sudo systemctl start polygon-edge.service` )
- Son olarak `polygon-edge` günlük çıktılarını kontrol edin ve `[ERROR]` günlüğü olmadan her şeyin çalıştığından emin olun

:::warning

Bir breaking (çalışmanın kesilmesine neden olabilecek) sürüm varsa, tüm düğümler üzerinde bu güncelleme prosedürü gerçekleştirilmelidir, çünkü
o anda çalışmakta olan binary dosya, yeni sürüm ile uyumlu değildir.

Bu, zincirin (`polygon-edge` binary dosyaları yenileriyle değiştirilene ve hizmet yeniden başlatılana kadar ) kısa bir süre durdurulması gerektiği anlamına gelir,
dolayısıyla buna göre planlama yapılmalıdır.

Verimli şekilde güncelleme yapmak ve zincirin çalışmama süresini (downtime) en aza indirmek için **[Ansible](https://www.ansible.com/)** gibi araçları
veya özel hazırlanmış bir script kullanabilirsiniz.

:::

## Başlatma prosedürü {#startup-procedure}

Aşağıda Polygon Edge doğrulayıcı için önerilen başlatma prosedürü akışı verilmiştir

- [Bilgi Tabanı](#knowledge-base) bölümünde listelenen dokümanları dikkatle okuyun
- En son OS yamalarını doğrulayıcı düğümü üzerinde uygulayın
- En son `polygon-edge` dosyasını, resmi GitHub [sürümlerinden](https://github.com/0xPolygon/polygon-edge/releases) indirin ve bu dosyayı, yerel kurulum `PATH`'a taşıyın
- Desteklenen [gizli bilgi yöneticilerinden](/docs/category/secret-managers) birini başlatmak için `polygon-edge secrets generate` CLI komutunu kullanın
- `polygon-edge secrets init` [CLI komutunu](/docs/edge/get-started/cli-commands#secrets-init-flags) kullanarak gizli bilgileri üretin ve kaydedin
- `NodeID` ve `Public key (address)` değerlerini ayrı bir yere not edin
- `genesis.json` dosyasını, [bulut kurulumunda](get-started/set-up-ibft-on-the-cloud#step-3-generate-the-genesis-file-with-the-4-nodes-as-validators) açıklandığı gibi `polygon-edge genesis` [CLI komutunu](/docs/edge/get-started/cli-commands#genesis-flags) kullanarak oluşturun
- `polygon-edge server export` [CLI komutunu](/docs/edge/configuration/sample-config) kullanarak varsayılan yapılandırma (config) dosyasını oluşturun
- Yerel doğrulayıcı düğümü ortamını ( dosya yolları vb. ) içerecek şekilde `default-config.yaml` dosyasını düzenleyin
- Bir Polygon Edge hizmeti ( `systemd` veya benzeri ) oluşturun, burada `polygon-edge` binary dosyası, sunucuyu bir `default-config.yaml` dosyasından çalıştırır
- Hizmeti başlatarak Polygon Edge sunucusunu başlatın ( ör. `systemctl start polygon-edge` )
- `polygon-edge` günlüğü çıktılarını kontrol edin; blokların üretildiğinden ve hiç `[ERROR]` günlüğü olmadığından emin olun
- [`eth_chainId`](/docs/edge/api/json-rpc-eth#eth_chainid) gibi bir JSON-RPC yöntemi çalıştırarak zincirin işlevselliğini kontrol edin

---
id: set-up-ibft-on-the-cloud
title: Bulut Kurulumu
description: "Adım adım bulut kurulum kılavuzu."
keywords:
  - docs
  - polygon
  - edge
  - cloud
  - setup
  - genesis
---

:::info Bu kılavuz, mainnet veya testnet kurulumları içindir

Aşağıdaki kılavuzda, testnet'inizin veya mainnet'inizin bir üretim ortamında kurulumu için, bir bulut sağlayıcı üzerinde Polygon Edge ağının nasıl kurulacağını açıklayan talimatlar bulunmaktadır.

Üretim ortamı benzeri bir kurulum yapmadan önce, hızlıca `polygon-edge` testi yapmak için yerel bir Polygon Edge ağı kurmak istiyorsanız, şuraya bakın
**[Yerel Kurulum](/docs/edge/get-started/set-up-ibft-locally)**
:::

## Gereksinimler {#requirements}

Polygon Edge kurmak için [Kurulum](/docs/edge/get-started/installation) kısmına göz atın.

### VM bağlantısı kurulumu {#setting-up-the-vm-connectivity}

Bulut sağlayıcı seçiminize bağlı olarak, VM'ler arasında bağlantı ve kuralları oluştururken, bir güvenlik duvarı,
güvenlik grupları veya erişim kontrol listeleri kullanabilirsiniz.

Diğer VM'lere açık kalması gereken tek `polygon-edge` parçası, libp2p sunucusu olduğundan
VM'ler arasındaki tüm haberleşmeye, varsayılan libp2p portu `1478` üzerinde izin vermek yeterli olacaktır.

## Genel Bakış {#overview}

![Bulut kurulumu](/img/edge/ibft-setup/cloud.svg)

Bu kılavuzda amacımız, [IBFT konsensüs protokolü](https://github.com/ethereum/EIPs/issues/650) ile çalışan işlevsel bir `polygon-edge` blok zinciri ağı oluşturmaktır.
Blok zinciri ağı 4 düğümden oluşacaktır ve bu düğümlerin dördü de doğrulayıcı düğüm olacak, dolayısıyla hem blok teklif etmek hem de diğer teklifçilerden gelen blokları doğrulamak için yetkili olacaktır.
4 düğümün her biri kendi VM'si üzerinde çalışacaktır; çünkü bu kılavuzun amacı, size, güven gerektirmeyen (trustless) bir ağ kurulumu sağlamak için doğrulayıcı anahtarlarının özel (private) tutulduğu tam işlevli bir Polygon Edge ağı sunmaktır.

Bunu başarmak için size 4 kolay adımla rehberlik edeceğiz:

0. Yukarıdaki **Gereksinimler** listesine bir göz atın
1. Doğrulayıcıların her biri için özel anahtarları üretin ve veri dizinini ilklendirin
2. Paylaşılmış `genesis.json` içine konulacak bootnode için bağlantı dizesini (string) hazırlayın
3. Yerel makinenizde `genesis.json` oluşturun ve bunu düğümlerin her birine gönderin/aktarın
4. Tüm düğümleri başlatın

:::info Doğrulayıcı sayısı

Bir kümedeki düğüm sayısı için belirlenmiş minimum bir sayı yoktur; bu da yalnızca 1 doğrulayıcı düğümü içeren kümeler olabileceği anlamına gelir.
Bununla birlikte, _tek_ düğümden oluşan bir kümede **bir çökme toleransı bulunmadığını** ve **BFT garantisi olmadığını** unutmayın.

BFT garantisi sağlamak için önerilen minimum düğüm sayısı 4'tür; çünkü 4 düğümlü bir kümede
1 düğümün başarısızlığı kalan 3'ünün normal olarak çalışmaya devam etmesi ile tolere edilebilir.

:::

## Adım 1: Veri klasörlerini ilklendirin ve doğrulayıcı anahtarlarını oluşturun {#step-1-initialize-data-folders-and-generate-validator-keys}

Polygon Edge'i hazırlayıp çalıştırabilmek için, her düğüm üzerindeki veri klasörlerini ilklendirmeniz gerekir:


````bash
node-1> polygon-edge secrets init --data-dir data-dir
````

````bash
node-2> polygon-edge secrets init --data-dir data-dir
````

````bash
node-3> polygon-edge secrets init --data-dir data-dir
````

````bash
node-4> polygon-edge secrets init --data-dir data-dir
````

Bu komutların her biri doğrulayıcı anahtarını, bls genel anahtarını ve [düğüm kimliğini](https://docs.libp2p.io/concepts/peer-id/) çıktı olarak verecektir. Bir sonraki adım için ilk düğümün Düğüm Kimliği'ne ihtiyacınız olacaktır.

### Sırları Outputting {#outputting-secrets}
Sır çıktısı tekrar alınabilir ve gerekirse

```bash
polygon-edge secrets output --data-dir test-chain-4
```

:::warning Veri dizininizin erişim ve kontrolü yalnızca size ait olmalıdır!

Yukarıdaki veri dizini oluşturma işlemleri, blok zinciri durumunu tutmak için kullanılan dizinleri ilklendirmenin yanı sıra, doğrulayıcınızın özel anahtarlarını da oluşturacaktır.
**Bu anahtar gizli tutulmalıdır; çünkü çalınırsa, başka birinin ağ içinde sizin yerinize kendisini doğrulayıcı olarak göstermesine olanak sağlar!**

:::

## Adım 2: Bootnode için multiaddr bağlantı dizesini hazırlayın {#step-2-prepare-the-multiaddr-connection-string-for-the-bootnode}

Bir düğümün başarılı bir şekilde bağlantı kurabilmesi için hangi `bootnode` sunucusuna bağlanacağını bilmesi gerekir;
bu şekilde ağdaki diğer düğümlerin tümünden bilgi alabilir. P2p jargonunda `bootnode`, bazen `rendezvous` olarak da bilinir.

`bootnode`, bir Polygon Edge düğümünün özel bir örneği değildir. Her Polygon Edge düğümü bir `bootnode` görevi görebilir ve
her Polygon Edge düğümünün belirtilen bir bootnode kümesine sahip olması gerekir; ağda geriye kalan tüm düğümlerle nasıl
bağlantı kurulacağının bilgisini almak için bu küme ile iletişim kurulacaktır.

Bootnode'u belirten bağlantı dizesini oluşturmak için,
[multiaddr formatına](https://docs.libp2p.io/concepts/addressing/) uymamız gerekir:
```
/ip4/<ip_address>/tcp/<port>/p2p/<node_id>
```

Bu kılavuzda birinci ve ikinci düğümleri diğer tüm düğümler için bootnode olarak ele alacağız. Bu senaryoda olacak şey şu şekildedir:
`node 1` veya `node 2` ile bağlantı kuran düğümler, birbiriyle nasıl bağlantı kuracağının bilgisini karşılıklı
iletişim kurulan bootnode üzerinden alacaktır.

:::info Bir düğüm başlatmak için en az bir bootnode belirtmeniz gerekir

En az **bir** bootnode gereklidir, böylece ağ içindeki diğer düğümler birbirlerini keşfedebilir. Daha fazla bootnode tavsiye edilir çünkü
kesinti durumlarına karşı ağ için dayanıklılık/koruma sağlarlar.
Bu kılavuzda iki düğüm listeleyeceğiz; ancak bu, çalışma esnasında `genesis.json` dosyasının geçerliliği üzerinde hiçbir etki yaratmadan değiştirilebilir.

:::

Multiaddr bağlantı dizesinin ilk kısmı `<ip_address>` olduğundan, burada IP adresini diğer düğümler tarafından erişilebilecek şekilde girmeniz gerekecektir; kurulumunuza bağlı olarak bu, `127.0.0.1` değil özel veya genel bir IP adresi olabilir.

`<port>` için, varsayılan libp2p portu olması nedeniyle `1478` kullanacağız.

Son olarak, `<node_id>` değerine ihtiyacımız var; bunu da daha önce çalıştırılan `polygon-edge secrets init --data-dir data-dir` komutunun (`node 1` için anahtarları ve veri dizinlerini oluşturmak için kullanılmıştı) çıktısından alabiliriz

Birleştirdikten sonra, bootnode olarak kullanacağımız `node 1` için multiaddr bağlantı dizesi şu şekilde görünecektir (yalnızca sondaki `<node_id>` farklı olacaktır):
```
/ip4/<public_or_private_ip>/tcp/1478/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW
```
Benzer şekilde, aşağıda gösterildiği gibi ikinci bootnode için multiaddr oluşturacağız
```
/ip4/<public_or_private_ip>/tcp/1478/p2p/16Uiu2HAmS9Nq4QAaEiogE4ieJFUYsoH28magT7wSvJPpfUGBj3Hq
```
:::info IP'ler yerine DNS ana bilgisayar adları

Polygon Edge düğüm yapılandırması için DNS ana bilgisayar adları kullanımını destekler. Düğümün IP'si çeşitli nedenlerle değişebileceği için, bu, bulut tabanlı devreye alma sırasında çok kullanışlı bir özelliktir.

DNS ana bilgisayar adlarını kullanırken uygulanacak bağlantı dizesi multiaddr formatı aşağıdaki gibidir:
`/dns4/sample.hostname.com/tcp/<port>/p2p/nodeid`

:::

## Adım 3: Doğrulayıcı olarak 4 düğümlü genesis dosyasını oluşturun {#step-3-generate-the-genesis-file-with-the-4-nodes-as-validators}

Bu adım yerel makinenizde çalıştırılabilir ancak 4 doğrulayıcının her biri için genel doğrulayıcı anahtarlarına ihtiyacınız olacaktır.

Doğrulayıcılar güvenli bir şekilde `Public key (address)`'i paylaşabilir (aşağıda kendi `secrets init` komutlarının çıktısı olarak gösterilmiştir); bu sayede
genel anahtarları ile tanımlanan ilk doğrulayıcı kümesindeki bu doğrulayıcılar ile genesis.json dosyasını güvenli bir şekilde oluşturabilirsiniz:

```
[SECRETS INIT]
Public key (address) = 0xC12bB5d97A35c6919aC77C709d55F6aa60436900
BLS Public key       = 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf
Node ID              = 16Uiu2HAmVZnsqvTwuzC9Jd4iycpdnHdyVZJZTpVC8QuRSKmZdUrf
```

4 doğrulayıcı genel anahtarının tamamını aldığınızda, `genesis.json` oluşturmak için aşağıdaki komutu çalıştırabilirsiniz

````bash
polygon-edge genesis --consensus ibft --ibft-validator 0xC12bB5d97A35c6919aC77C709d55F6aa60436900:0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --ibft-validator <2nd validator IBFT public key>:<2nd validator BLS public key> --ibft-validator <3rd validator IBFT public key>:<3rd validator BLS public key> --ibft-validator <4th validator IBFT public key>:<4th validator BLS public key> --bootnode=<first_bootnode_multiaddr_connection_string_from_step_2> --bootnode <second_bootnode_multiaddr_connection_string_from_step_2> --bootnode <optionally_more_bootnodes>
````

Bu komutun yaptığı şey:

* `--ibft-validator`, genesis bloğu içindeki ilk doğrulayıcı kümesinde yer alması gereken doğrulayıcının genel anahtarını belirler. Birden fazla ilk doğrulayıcı olabilir.
* `--bootnode`, düğümlerin birbirlerini bulmasını sağlayacak bootnode adresini ayarlar.
`node 1`'in multiaddr dizesini kullanacağız (**adım 2**'de de belirtilen şekilde); ancak yukarıda gösterildiği gibi istediğiniz kadar bootnode ekleyebilirsiniz.

:::info ECDSA'ya geçiş

BLS blok başlıklarının varsayılan doğrulama modudur. Zincirinizin ECDSA modunda çalışmasını istiyorsanız, şu argümanla birlikte `—ibft-validator-type`bayrağı `ecdsa`kullanabilirsiniz:

```
genesis --ibft-validator-type ecdsa
```
:::

:::info Hesap bakiyelerini önceden mine etmek

Blok zinciri ağınızı "önceden mine edilmiş" bakiyeye sahip bazı hesaplarla yapılandırmak isteyebilirsiniz.

Bunu başarmak için, blok zinciri üzerinde belli bir bakiye ile başlatılmasını istediğiniz adres başına istediğiniz kadar `--premine` bayrağı
girin.

Örneğin, genesis blokumuz içindeki `0x3956E90e632AEbBF34DEB49b71c28A83Bc029862` adresine 1000 ETH önceden mine etmek istiyorsak, aşağıdaki argümanı sağlamamız gerekir:

```
--premine=0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000
```

**Önceden mine edilecek miktarın ETH değil, WEI cinsinden olduğunu unutmayın.**

:::

:::info Blok gaz limitini ayarlayın

Her blok için varsayılan gaz limiti `5242880` olarak belirlenmiştir. Bu değer genesis dosyasına yazılmıştır ama bunu
artırmak/azaltmak isteyebilirsiniz.

Bunu yapmak için, aşağıda gösterildiği gibi `--block-gas-limit` bayrağını kullanıp ardından istenen değeri ekleyebilirsiniz:

```shell
--block-gas-limit 1000000000
```

:::

:::info Sistem dosya tanımlayıcı limitini ayarlayın

Varsayılan dosya tanımlayıcı limiti (en fazla açık dosya sayısı) düşük ve Linux üzerinde her şey bir dosyadır. Düğümlerin yüksek bir verim elde etmesi bekleniyorsa, bu limiti arttırmayı düşünebilirsiniz. Daha fazla ayrıntı için linux of resmi dokümanlarını kontrol edin.

#### Geçerli işletim sistemi limitlerini kontrol edin ( açık dosyalar ) {#check-current-os-limits-open-files}
```shell title="ulimit -n"
1024 # Ubuntu default
```

#### Açık dosya limitini artırın {#increase-open-files-limit}
- Ön planda `polygon-edge`koşmak (kabuk)
  ```shell title="Set FD limit for the current session"
  ulimit -n 65535 # affects only current session, limit won't persist after logging out
  ```

  ```shell title="Edit /etc/security/limits.conf"
  # add the following lines to the end of the file to modify FD limits
  *               soft    nofile          65535 # sets FD soft limit for all users
  *               hard    nofile          65535 # sets FD hard limit for all users

  # End of file
  ```
Dosyayı kaydedin ve sistemi yeniden başlatın.

- Arka planda hizmet olarak `polygon-edge`çalışan

Sistem servisi olarak `polygon-edge`çalıştırılırsa, aracı , `systemd`dosya tanımlayıcı limitleri gibi kullanarak Kullanılarak `systemd`yönetilmelidir.
  ```shell title="Edit /etc/systemd/system/polygon-edge.service"
  [Service]
   ...
  LimitNOFILE=65535
  ```

### Sorun Giderme {#troubleshooting}
```shell title="Watch FD limits of polygon edge running process"
watch -n 1 "ls /proc/$(pidof polygon-edge)/fd | wc -l"
```

```shell title="Check max FD limits for polygon-edge running process"
cat /proc/$(pidof polygon-edge)/limits
```
:::

Şunları belirttikten sonra:
1. Genesis bloğu içine doğrulayıcı kümesi olarak eklenecek doğrulayıcıların genel anahtarları
2. Bootnode multiaddr bağlantı dizeleri
3. Genesis blok içine eklenecek önceden mine edilmiş hesaplar ve bakiyeler

ve `genesis.json` dosyası oluşturulduğunda, bu dosyayı ağ içindeki tüm VM'lere kopyalamanız gerekir. Kurulumunuza bağlı olarak bunu
kopyala/yapıştır yapabilir, düğüm operatörüne gönderebilir veya basitçe SCP/FTP kullanabilirsiniz.

Genesis dosyasının yapısı [CLI Komutları](/docs/edge/get-started/cli-commands) bölümünde ele alınmıştır.

## Adım 4: Tüm istemcileri çalıştırın {#step-4-run-all-the-clients}

:::note Bulut sağlayıcıları üzerinde ağ oluşturma

Çoğu bulut sağlayıcı IP adreslerini (özellikle genel olanları), VM'nizde doğrudan bir ağ arayüzü olarak açmaz (expose etmez); bunun yerine görünmez bir NAT proxy kurar.


Bu durumda düğümlerin birbirine bağlanmasını sağlamak için tüm arayüzlerde bağlanılacak `0.0.0.0` IP adresini dinlemeniz gerekir; ancak yine de diğer düğümlerin sizin düğümünüze bağlanmak için kullanabileceği IP adresini veya DNS adresini belirtmeniz gerekir. Bu, `--nat` veya `--dns` kullanılarak gerçekleştirilir ve burada sırasıyla harici IP veya DNS adresinizi belirtirsiniz.

#### Örnek {#example}

Dinleme yapmak istediğiniz ilişkili IP adresi `192.0.2.1`; fakat bu adres, ağ arayüzlerinizden hiçbirine doğrudan bağlı değil.

Düğümlerin bağlanmasına izin vermek için aşağıdaki parametreleri göndermeniz gerekecektir:

`polygon-edge ... --libp2p 0.0.0.0:10001 --nat 192.0.2.1`

Veya bir DNS adresi `dns/example.io` belirtmek istiyorsanız, aşağıdaki parametreleri girebilirsiniz:

`polygon-edge ... --libp2p 0.0.0.0:10001 --dns dns/example.io`

Bu, düğümünüzün tüm arayüzlerde dinleme yapmasını sağlayacaktır; aynı zamanda istemcilerin bu adrese belirtilen `--nat` veya `--dns` adresi üzerinden bağlandığını da düğümünüze bildirecektir.

:::

**Birinci** istemciyi çalıştırmak için:


````bash
node-1> polygon-edge server --data-dir ./data-dir --chain genesis.json  --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

**İkinci** istemciyi çalıştırmak için:

````bash
node-2> polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

**Üçüncü** istemciyi çalıştırmak için:

````bash
node-3> polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

**Dördüncü** istemciyi çalıştırmak için:

````bash
node-4> polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

Önceki komutları çalıştırdıktan sonra, blokları mühürleyebilen ve düğüm arızasından kurtulabilecek 4 düğümlü bir Polygon Edge
ağı kurmuş oldunuz.

:::info Yapılandırma dosyasını kullanarak istemciyi başlatın

Tüm yapılandırma parametrelerini CLI argümanları olarak belirtmek yerine, İstemci aşağıdaki komutu çalıştırarak bir yapılandırma dosyası kullanarak da başlatılabilir:

````bash
polygon-edge server --config <config_file_path>
````
Örnek :

````bash
polygon-edge server --config ./test/config-node1.json
````
Şu anda, yalnızca `json`tabanlı yapılandırma dosyasını destekliyoruz, örnek yapılandırma dosyası **[burada](/docs/edge/configuration/sample-config)** bulunabilir

:::

:::info Doğrulayıcı olmayan bir düğüm çalıştırma adımları

Doğrulayıcı olmayan bir düğüm, her zaman, doğrulayıcı düğümden alınan en son blokları eşitleyecektir (senkronizasyon). Aşağıdaki komutu çalıştırarak doğrulayıcı olmayan bir düğümü başlatabilirsiniz.

````bash
polygon-edge server --data-dir <directory_path> --chain <genesis_filename>  --libp2p <IPAddress:PortNo> --nat <public_or_private_ip>
````
Örneğin, aşağıdaki komutu çalıştırarak **beşinci** Doğrulayıcı Olmayan istemciyi ekleyebilirsiniz :

````bash
polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat<public_or_private_ip>
````
:::

:::info Fiyat limitini belirleyin

Bir Polygon Edge düğümü, gelen işlemler için belirlenmiş bir **fiyat limiti** ile başlatılabilir.

Fiyat limitinin birimi `wei`'dir.

Bir fiyat limiti belirlemek, mevcut düğüm tarafından işlenen herhangi bir işlemin belirlenen fiyat limitinden **daha yüksek** bir gaz fiyatına
sahip olması gerektiği anlamına gelir; aksi takdirde işlem bir bloğa eklenmeyecektir.

Düğümlerin çoğunluğunun belli bir fiyat limitine uyması, ağ üzerindeki işlemlerin
belli bir fiyat eşiğinin altında olmaması kuralını uygulamaya koyar.

Fiyat limiti için varsayılan değer `0` olarak belirlenmiştir, yani varsayılan olarak limit uygulanmamaktadır.

`--price-limit` bayrağının kullanım örneği:
````bash
polygon-edge server --price-limit 100000 ...
````

Fiyat limitlerinin **yalnızca yerel olmayan işlemlerde uygulandığına** dikkat etmek gerekir, yani
fiyat limiti düğümde yerel olarak eklenen işlemlere uygulanmaz.

:::

:::info WebSocket URL'si

Polygon Edge çalıştırdığınızda, varsayılan olarak zincir konumuna göre bir WebSocket URL'si oluşturur.
HTTPS bağlantıları için `wss://` ve HTTP için `ws://` URL yöntemi kullanılır.

Localhost WebSocket URL:
````bash
ws://localhost:10002/ws
````
Port sayısının düğüm için seçilen JSON-RPC portuna bağlı olduğunu unutmayın.

Edgenet WebSocket URL:
````bash
wss://rpc-edgenet.polygon.technology/ws
````
:::

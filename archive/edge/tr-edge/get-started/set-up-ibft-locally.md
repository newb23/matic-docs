---
id: set-up-ibft-locally
title: Yerel Kurulum
description: "Adım adım yerel kurulum kılavuzu."
keywords:
  - docs
  - polygon
  - edge
  - local
  - setup
  - genesis
---

:::caution Bu kılavuz yalnızca test amaçlıdır

Aşağıdaki kılavuz size yerel makinenizde test ve geliştirme için bir Polygon Edge ağı kurma talimatlarını
sunacaktır.

Bu prosedür Polygon Edge ağınI gerçek bir kullanım senaryosu için bulut sağlayıcı üzerinde kurmaktan
bir bulut sağlayıcısı: **[Cloud Setup](/docs/edge/get-started/set-up-ibft-on-the-cloud)**

:::


## Gereksinimler {#requirements}

Polygon Edge kurmak için [Kurulum](/docs/edge/get-started/installation) kısmına göz atın.

## Genel Bakış {#overview}

![Yerel Kurulum](/img/edge/ibft-setup/local.svg)

Bu kılavuzda amacımız, [IBFT konsensüs protokolü](https://github.com/ethereum/EIPs/issues/650) ile çalışan işlevsel bir `polygon-edge` blok zinciri ağı oluşturmaktır.
Blok zinciri ağı 4 düğümden oluşacaktır ve bu düğümlerin her biri doğrulayıcı düğüm olacak, dolayısıyla hem blok teklif etmek hem de diğer teklifçilerden gelen blokları doğrulamak için yetkili olacaktır.
4 düğümün her biri aynı makinede çalışacaktır; çünkü bu kılavuzun amacı size mümkün olan en kısa zamanda tam işlevsel bir IBFT kümesi sunmaktır.

Bunu başarmak için size 4 kolay adımda rehberlik edeceğiz:

1. Veri dizinlerini başlatmak, 4 düğümün her biri için doğrulayıcı anahtarlarını oluşturacak ve blok zinciri veri dizinlerini başlatacaktır. Doğrulayıcı anahtarları, genesis blokunun önyüklemesini bu anahtarları kullanan başlangıç doğrulayıcı kümesiyle yapmamız gerektiği için önemlidir.
2. Bootnode için bağlantı dizesi hazırlığı, çalıştıracağımız her düğüm için ilk kez başlarken hangi düğüme bağlanacağına dair en önemli bilgi olacaktır.
3. `genesis.json` dosyasını oluşturmak için; genesis bloğunda ağın ilk doğrulayıcılarını belirlemek için kullanılan **adım 1**'de oluşturulmuş doğrulayıcı anahtarları ve **adım 2**'deki bootnode bağlantı dizesi girdi olarak gerekli olacaktır.
4. Bu kılavuzun nihai amacı tüm düğümleri çalıştırmaktır ve bu tamamlayacağımız son adım olacaktır. Düğümlere hangi veri dizininin kullanılacağını ve başlangıç ağ durumunun önyüklemesini yapacak olan `genesis.json` dosyasının nerede bulunacağını öğreteceğiz.

Dört düğümün tümü localhost üzerinde çalışacağı için, kurulum işlemi sırasında tüm veri dizinlerinin
her bir düğüm için aynı ana dizinde bulunması beklenmektedir.

:::info Doğrulayıcı sayısı

Bir kümedeki düğüm sayısı için belirlenmiş minimum bir sayı yoktur; bu da yalnızca 1 doğrulayıcı düğümü içeren kümeler olabileceği anlamına gelir.
Bununla birlikte, _tek_ düğümden oluşan bir kümede **bir çökme toleransı bulunmadığını** ve **BFT garantisi olmadığını** unutmayın.

BFT garantisi sağlamak için önerilen minimum düğüm sayısı 4'tür; çünkü 4 düğümlü bir kümede
1 düğümün başarısızlığı kalan 3'ünün normal olarak çalışmaya devam etmesi ile tolere edilebilir.

:::

## Adım 1: IBFT için veri klasörlerini başlatın ve doğrulayıcı anahtarlarını oluşturun {#step-1-initialize-data-folders-for-ibft-and-generate-validator-keys}

IBFT'yi doğru bir şekilde yapılandırmak ve çalıştırmak için veri klasörlerini
her düğüm için bir tane olacak şekilde başlatmalısınız:

````bash
polygon-edge secrets init --data-dir test-chain-1
````

````bash
polygon-edge secrets init --data-dir test-chain-2
````

````bash
polygon-edge secrets init --data-dir test-chain-3
````

````bash
polygon-edge secrets init --data-dir test-chain-4
````

Bu komutların her biri doğrulayıcı anahtarını, bls genel anahtarını ve [düğüm kimliğini](https://docs.libp2p.io/concepts/peer-id/) çıktı olarak verecektir. Bir sonraki adım için ilk düğümün Düğüm Kimliği'ne ihtiyacınız olacaktır.

### Sırları Outputting {#outputting-secrets}
Sır çıktısı tekrar alınabilir ve gerekirse

```bash
polygon-edge secrets output --data-dir test-chain-4
```

## Adım 2: Bootnode için multiaddr bağlantı dizesini hazırlayın {#step-2-prepare-the-multiaddr-connection-string-for-the-bootnode}

Bir düğümün başarılı bir şekilde bağlantı kurabilmesi için hangi `bootnode` sunucusuna bağlanacağını bilmesi gerekir;
bu şekilde ağdaki diğer düğümlerin tümünden bilgi alabilir. P2p jargonunda `bootnode`, bazen `rendezvous` olarak da bilinir.

`bootnode` , polygon-edge düğümünün özel bir örneği değildir. Her polygon-edge düğümü bir `bootnode` olarak görev yapabilir; ancak
her polygon-edge düğümünün belirtilmiş bir bootnode kümesine sahip olması gerekir. Ağdaki diğer tüm düğümler ile nasıl
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

Localhost üzerinde çalıştığımızdan, `<ip_address>` değerinin `127.0.0.1` olduğunu varsaymak makuldür.

`<port>` için `10001` değerini kullanacağız çünkü `node 1` için libp2p sunucusunu bu port üzerinden dinleyecek şekilde yapılandıracağız.

Son olarak, `<node_id>` değerine ihtiyacımız var; bunu da daha önce çalıştırılan `polygon-edge secrets init --data-dir test-chain-1` komutunun (`node1` için anahtarları ve veri dizinlerini oluşturmak için kullanılmıştı) çıktısından alabiliriz

Birleştirdikten sonra, bootnode olarak kullanacağımız `node 1` için multiaddr bağlantı dizesi şu şekilde görünecektir (yalnızca sondaki `<node_id>` farklı olacaktır):
```
/ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW
```
Benzer şekilde, aşağıda gösterildiği gibi ikinci bootnode için multiaddr oluşturacağız
```
/ip4/127.0.0.1/tcp/20001/p2p/16Uiu2HAmS9Nq4QAaEiogE4ieJFUYsoH28magT7wSvJPpfUGBj3Hq
```

:::info IP'ler yerine DNS ana bilgisayar adları

Polygon Edge düğüm yapılandırması için DNS ana bilgisayar adları kullanımını destekler. Düğümün IP'si çeşitli nedenlerle değişebileceği için, bu, bulut tabanlı devreye alma sırasında çok kullanışlı bir özelliktir.

DNS ana bilgisayar adlarını kullanırken uygulanacak bağlantı dizesi multiaddr formatı aşağıdaki gibidir:
`/dns4/sample.hostname.com/tcp/<port>/p2p/nodeid`

:::


## Adım 3: Doğrulayıcı olarak 4 düğümlü genesis dosyasını oluşturun {#step-3-generate-the-genesis-file-with-the-4-nodes-as-validators}

````bash
polygon-edge genesis --consensus ibft --ibft-validators-prefix-path test-chain- --bootnode /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW --bootnode /ip4/127.0.0.1/tcp/20001/p2p/16Uiu2HAmS9Nq4QAaEiogE4ieJFUYsoH28magT7wSvJPpfUGBj3Hq
````

Bu komutun yaptığı şey:

* `--ibft-validators-prefix-path`, ön ek klasör dizinini Polygon Edge'de IBFT'nin kullanabileceği belirlenmiş olan dizin olarak
ayarlar. Bu dizin, doğrulayıcının özel anahtarının tutulduğu `consensus/` klasörünü barındırmak için kullanılır. Doğrulayıcının
genel anahtarı, önyükleme düğümlerinin başlangıç listesi olan genesis dosyasını oluşturmak için gereklidir.
Bu bayrak yalnızca localhost üzerinde ağ kurarken mantıklıdır çünkü gerçek senaryoda tüm düğümlerin veri dizinlerinin
genel anahtarlarını kolayca okuyabileceğimiz aynı dosya sisteminde olmasını bekleyemeyiz.
* `--bootnode`, düğümlerin birbirlerini bulmasını sağlayacak bootnode adresini ayarlar.
**Adım 2**'de belirtildiği gibi, `node 1` için belirlenen multiaddr dizesini kullanacağız.

Bu komutun sonucu, yeni blok zincirimizin genesis blokunu içeren `genesis.json` dosyasıdır. Bu dosya, önceden tanımlanmış doğrulayıcı kümesini ve bağlantı kurabilmek için ilk olarak iletişim kurulacak düğüm bilgisini içerir.

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


## Adım 4: Tüm istemcileri çalıştırın {#step-4-run-all-the-clients}

Aynı makinede 4 düğümden oluşan bir Polygon Edge ağı çalıştırmayı denediğimiz için,
port çakışmalarını önlemeye dikkat etmeliyiz. Bu nedenle, bir düğümün her sunucusundaki dinleme portlarını belirlemek için aşağıdaki mantığı kullanacağız:

- `node 1` gRPC sunucusu için `10000`, `node 2` gRPC sunucusu için `20000`, vb.
- `node 1` libp2p sunucusu için `10001`, `node 2` libp2p sunucusu için `20001`, vb.
- `node 1` JSON-RPC sunucusu için `10002`, `node 2` JSON-RPC sunucusu için `20002`, vb.

**İlk** istemciyi çalıştırmak için (`10001` portuna dikkat edin çünkü **adım 2**'de düğüm 1'in Düğüm Kimliği yanında libp2p multiaddr'ın bir parçası olarak kullanılmıştı):

````bash
polygon-edge server --data-dir ./test-chain-1 --chain genesis.json --grpc-address :10000 --libp2p :10001 --jsonrpc :10002 --seal
````

**İkinci** istemciyi çalıştırmak için:

````bash
polygon-edge server --data-dir ./test-chain-2 --chain genesis.json --grpc-address :20000 --libp2p :20001 --jsonrpc :20002 --seal
````

**Üçüncü** istemciyi çalıştırmak için:

````bash
polygon-edge server --data-dir ./test-chain-3 --chain genesis.json --grpc-address :30000 --libp2p :30001 --jsonrpc :30002 --seal
````

**Dördüncü** istemciyi çalıştırmak için:

````bash
polygon-edge server --data-dir ./test-chain-4 --chain genesis.json --grpc-address :40000 --libp2p :40001 --jsonrpc :40002 --seal
````

Şimdiye kadar yapılanları kısaca gözden geçirmek gerekirse:

* İstemci verisi için dizin, **./test-chain-\*** olarak belirtilmiştir
* GRPC sunucuları her düğüm için sırasıyla **10000**, **20000**, **30000** ve **40000** portlarında başlatılmıştır
* libp2p sunucuları her düğüm için sırasıyla **10001**, **20001**, **30001** ve **40001** portlarında başlatılmıştır
* JSON-RPC sunucuları her düğüm için sırasıyla **10002**, **20002**, **30002** ve **40002** portlarında başlatılmıştır
* *seal* bayrağı, başlatılan düğümün blok mühürlemeye katılacağı anlamına gelir
* *chain* bayrağı, zincir yapılandırması için hangi genesis dosyasının kullanılması gerektiğini belirtir

Genesis dosyasının yapısı [CLI Komutları](/docs/edge/get-started/cli-commands) bölümünde ele alınmıştır.

Önceki komutları çalıştırdıktan sonra, blokları mühürleyebilen ve düğüm arızasından kurtulabilecek 4 düğümlü bir Polygon Edge
ağı kurmuş oldunuz.

:::info Yapılandırma dosyasını kullanarak istemciyi başlatın

Tüm yapılandırma parametrelerini CLI argümanları olarak belirtmek yerine, İstemci aşağıdaki komutu çalıştırarak bir yapılandırma dosyası kullanarak da başlatılabilir:

````bash
polygon-edge server --config <config_file_path>
````
Örnek:

````bash
polygon-edge server --config ./test/config-node1.json
````
Şu anda, biz destek `yaml`ve `json`tabanlı yapılandırma dosyaları, örnek yapılandırma dosyaları **[burada](/docs/edge/configuration/sample-config)** bulunabilir

:::

:::info Doğrulayıcı olmayan bir düğüm çalıştırma adımları

Doğrulayıcı olmayan bir düğüm, her zaman, doğrulayıcı düğümden alınan en son blokları eşitleyecektir (senkronizasyon). Aşağıdaki komutu çalıştırarak doğrulayıcı olmayan bir düğümü başlatabilirsiniz.

````bash
polygon-edge server --data-dir <directory_path> --chain <genesis_filename> --grpc-address <portNo> --libp2p <portNo> --jsonrpc <portNo>
````
Örneğin, aşağıdaki komutu çalıştırarak **beşinci** Doğrulayıcı Olmayan istemciyi ekleyebilirsiniz :

````bash
polygon-edge server --data-dir ./test-chain --chain genesis.json --grpc-address :50000 --libp2p :50001 --jsonrpc :50002
````
:::

:::info Fiyat limitini belirleyin

Bir Polygon Edge düğümü, gelen işlemler için belirlenmiş bir **fiyat limiti** ile başlatılabilir.

Fiyat limitinin birimi `wei`'dir.

Bir fiyat limiti belirlemek, mevcut düğüm tarafından işlenen herhangi bir işlemin belirlenen fiyat limitinden **daha yüksek** bir gaz fiyatı
olması gerektiği, aksi halde işlemin bloka eklenmeyeceği anlamına gelir.

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



## Adım 5: Polygon-edge ağı ile etkileşim kurun {#step-5-interact-with-the-polygon-edge-network}

Artık en az 1 istemci kurduğunuza göre, yukarıda önceden mine ettiğiniz hesabı kullanarak
ve 4 düğümden herhangi birinde JSON-RPC URL'sini belirterek blok zinciri ile etkileşim kurabilirsiniz:
- Düğüm 1: `http://localhost:10002`
- Düğüm 2: `http://localhost:20002`
- Düğüm 3: `http://localhost:30002`
- Düğüm 4: `http://localhost:40002`

Yeni oluşturulmuş kümeye operatör komutları yayımlamak için bu kılavuzu takip edin: [Operatör bilgisi nasıl sorgulanır?](/docs/edge/working-with-node/query-operator-info) (Oluşturduğumuz kümenin GRPC portları, her düğüm için sırasıyla `10000`/`20000`/`30000`/`40000` şeklindedir)

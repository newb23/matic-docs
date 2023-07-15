---
id: pos-stake-unstake
title: Hisse Kanıtı (PoS) yapılandırma ve kullanma
description: "Stake etme, stake kaldırma ve staking ile ilgili diğer talimatlar."
keywords:
  - docs
  - polygon
  - edge
  - stake
  - unstake
  - validator
  - epoch
---

## Genel Bakış {#overview}

Bu kılavuz Polygon Edge ile bir Hisse Kanıtı ağının nasıl kurulacağını, düğümlerin doğrulayıcı olabilmesi için nasıl fon stake edileceğini
ve fonların stake'inin nasıl kaldırılacağını ayrıntılarıyla ele alır.

Bu nedenle okumak ve geçmek **için çok teşvik** edilir [Yerel Kurulum](/docs/edge/get-started/set-up-ibft-locally)
[Bulut Kurulumu](/docs/edge/get-started/set-up-ibft-on-the-cloud) kısımlarının
okunmasıdır. Bu kısımlar Polygon Edge ile bir Yetki Kanıtı (PoA) kümesi başlatmak için gerekli
adımları özetler.

Şu anda, Staking Akıllı Sözleşmesi üzerinde fon stake edebilecek doğrulayıcı sayısı için herhangi bir limit bulunmamaktadır.

## Staking Akıllı Sözleşmesi {#staking-smart-contract}

Staking Akıllı Sözleşmesi için bilgi deposu [burada](https://github.com/0xPolygon/staking-contracts) bulunur.

Gerekli test komut dizilerini, ABI dosyalarını ve en önemlisi Staking Akıllı Sözleşmesi'nin kendisini içerir.

## N düğümlü bir küme yapılandırma {#setting-up-an-n-node-cluster}

Polygon Edge ile bir ağ kurulumu
[Yerel Kurulum](/docs/edge/get-started/set-up-ibft-locally)
/ [Bulut Kurulumu](/docs/edge/get-started/set-up-ibft-on-the-cloud) kısımlarında yer almaktadır.

PoS ve PoA kümelerinin kurulumu arasındaki **tek fark**, genesis oluşturma kısmındadır.

**Bir PoS kümesi için genesis dosyası oluştururken, ek bir bayrak gereklidir `--pos`**:

```bash
polygon-edge genesis --pos ...
```

## Bir dönemin uzunluğunu ayarlama {#setting-the-length-of-an-epoch}

Dönemler [Dönem Blokları](/docs/edge/consensus/pos-concepts#epoch-blocks) kısmında ayrıntılı olarak ele alınmaktadır.

Genesis dosyası oluştururken bir kümenin (blok cinsinden) boyunu ayarlamak için ek bir bayrak
belirlenir `--epoch-size`:

```bash
polygon-edge genesis --epoch-size 50
```

Bu değer genesis dosyası içinde dönem boyutunun `50` blok olması gerektiğini belirtir.

Bir dönemin boyutunun (blok cinsinden) varsayılan değeri `100000` olarak belirlenmiştir.

:::info Dönem uzunluğunu kısaltma

[Dönem Blokları](/docs/edge/consensus/pos-concepts#epoch-blocks) bölümünde özetlendiği gibi,
dönem blokları düğümler için doğrulayıcı kümelerini güncellemek için kullanılır.

Blok cinsinden varsayılan dönem uzunluğu (`100000`) doğrulayıcı kümesi güncellemeleri için uzun bir bekleme süresi olabilir. Yeni blokların
yaklaşık 2 saniyede eklendiği göz önüne alındığında, doğrulayıcı kümesinin değişmesi hâlinde değişim süresi yaklaşık 55,5 saat olur.

Dönem uzunluğu için daha düşük bir değer ayarlamak, doğrulayıcı kümesinin daha sık güncellenmesini sağlar.

:::

## Staking Akıllı Sözleşmesi betiklerini kullanma {#using-the-staking-smart-contract-scripts}

### Ön Koşullar {#prerequisites}

Staking Akıllı Sözleşme bilgi deposu bir Hardhat projesidir ve NPM gerektirir.

Doğru bir şekilde başlatmak için, ana dizinde şunu çalıştırın:

```bash
npm install
````

### Sağlanan yardımcı komut dosyalarını yapılandırma {#setting-up-the-provided-helper-scripts}

Devreye alınan Staking Akıllı Sözleşmesi ile etkileşim için kullanılacak komut dizileri,
[Staking Akıllı Sözleşmesi bilgi deposunda](https://github.com/0xPolygon/staking-contracts) bulunur.

Akıllı Sözleşmeler bilgi deposu konumunda aşağıdaki parametrelere sahip bir `.env` dosyası oluşturun:

```bash
JSONRPC_URL=http://localhost:10002
PRIVATE_KEYS=0x0454f3ec51e7d6971fc345998bb2ba483a8d9d30d46ad890434e6f88ecb97544
STAKING_CONTRACT_ADDRESS=0x0000000000000000000000000000000000001001
BLS_PUBLIC_KEY=0xa..
```

Parametreler şu şekilde olmalıdır:

* **JSONRPC_URL** - çalışan düğüm için JSON-RPC uç noktası
* **PRIVATE_KEYS** - stake eden adresin özel anahtarları.
* **STAKING_CONTRACT_ADDRESS** - stake eden akıllı sözleşme adresi (
varsayılan `0x0000000000000000000000000000000000001001`)
* **BLS_PUBLIC_KEY** - stake edenin BLS genel anahtarı. Sadece ağ BLS ile çalışıyorsa ihtiyaç duyulur

### Fon stake etme {#staking-funds}

:::info Stake eden adres

Staking Akıllı Sözleşmesi
`0x0000000000000000000000000000000000001001` adresi üzerinde önceden devreye alınır.

Staking mekanizması ile her türlü etkileşim, belirlenen adreste Staking Akıllı Sözleşmesi üzerinden yapılır.

Staking Akıllı Sözleşmesi hakkında daha fazla bilgi edinmek için lütfen ziyaret edin:
**[Staking Smart](/docs/edge/consensus/pos-concepts#contract-pre-deployment)** Sözleşmesi kısmı.

:::

Doğrulayıcı kümesinin bir parçası olmak için, adresin belli bir eşiğin üzerinde bir miktar fonu stake etmesi gerekir.

Şu anda, doğrulayıcı kümesinin bir parçası olmak için varsayılan eşik `1 ETH` olarak belirlenmiştir.

Stake etme, Staking Akıllı Sözleşmesinin `stake` yöntemini çağırarak ve `>= 1 ETH` değerini belirleyerek başlatılabilir.

`.env` dosyası
[önceki kısımda](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts) belirtildiği şekilde yapılandırıldıktan sonra ve bir
zincir PoS modunda başlatıldıktan sonra, Staking Akıllı Sözleşmesi bilgi deposunda bulunan aşağıdaki komut ile staking yapılabilir:

```bash
npm run stake
```

`stake` Hardhat betiği, varsayılan `1 ETH` miktarı kadar stake eder; bu değer `scripts/stake.ts` dosyası modifiye edilerek
değiştirilebilir.

Stake edilen fonlar `>= 1 ETH` ise, Staking Akıllı Sözleşmesi üzerinde belirlenen doğrulayıcı güncellenir ve adres
bir sonraki dönemden başlayarak doğrulayıcı kümesinin bir parçası olur.

:::info BLS anahtarlarını kaydetme

Ağ BLS modunda çalışıyorsa, düğümlerin doğrulayıcı olmak için staking sonrasında BLS genel anahtarlarını kaydetmeleri gerekir

Bu aşağıdaki komutla yapılabilir:

```bash
npm run register-blskey
```
:::

### Fonların stake'ini kaldırma {#unstaking-funds}

Stake eden adresler, stake kaldırma işlemini **sadece tüm fonlarını bir kerede unstake ederek** yapabilirler.

`.env` dosyası
[önceki bölümde](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts)
bahsedilen şekilde yapılandırıldıktan sonra ve PoS modunda zincir başlatıldıktan sonra, stake kaldırma işlemi
Staking Akıllı Sözleşmesi bilgi deposunda bulunan aşağıdaki komutla yapılabilir:

```bash
npm run unstake
```

### Stake edenlerin listesini alma {#fetching-the-list-of-stakers}

Stake eden tüm adresler, Staking Akıllı Sözleşmesine kaydedilir.

`.env` dosyası
[önceki bölümde](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts)
bahsedilen şekilde yapılandırıldıktan sonra ve PoS modunda bir zincir başlatıldıktan sonra, doğrulayıcı listesini alma işlemi
Staking Akıllı Sözleşmesi bilgi deposunda bulunan aşağıdaki komutla yapılabilir:

```bash
npm run info
```

---
id: bls
title: BLS
description: "BLS modu ile ilgili açıklama ve talimatlar."
keywords:
  - docs
  - polygon
  - edge
  - bls
---

## Genel Bakış {#overview}

Boneh–Lynn–Shacham (BLS) olarak da bilinen BLS, bir kullanıcının bir imzanın gerçek olduğunu doğrulamasına izin veren bir kriptografik imza şemasıdır. Bu bir imza planı, birden fazla imzayı toplayabilmektedir. Polygon Edge üzerinde BLS, IBFT konsensüs modu için daha iyi güvenlik sağlamak üzere varsayılan olarak kullanılır. BLS, imzaları tek bir bayt dizisine toplayabilir ve blok başlık boyutunu azaltabilir. Her zincir BLS kullanıp kullanmamak arasında seçin yapabilir. BLS modunun etkinleştirilip etkinleştirilmediğine bakılmaksızın ECDSA anahtarı kullanılır.

## Video sunumu {#video-presentation}

[![bls - video](https://img.youtube.com/vi/HbUmZpALlqo/0.jpg)](https://www.youtube.com/watch?v=HbUmZpALlqo)

## BLS kullanarak yeni bir zincir nasıl kurulur? {#how-to-setup-a-new-chain-using-bls}

Ayrıntılı kurulum talimatları için [Yerel Kurulum](/docs/edge/get-started/set-up-ibft-locally) / [Bulut Kurulumu](/docs/edge/get-started/set-up-ibft-on-the-cloud) bölümlerine göz atın.

## Mevcut bir ECDSA PoA zincirinden BLS PoA zincirine nasıl geçiş yapılır? {#how-to-migrate-from-an-existing-ecdsa-poa-chain-to-bls-poa-chain}

Bu bölüm BLS modunun var olan bir PoA zinciri içinde nasıl kullanılacağını açıklar.
Bir PoA zinciri içinde BLS etkinleştirmek için aşağıdaki adımlar gereklidir.

1. Tüm düğümleri durdurma
2. Doğrulayıcılar için BLS anahtarlarını oluşturma
3. Genesis.json içine çatal ayarı ekleme
4. Tüm düğümleri yeniden başlatma

### 1. Tüm düğümleri durdurma {#1-stop-all-nodes}

Ctrl + c (Control + c) tuşlarına basarak doğrulayıcıların tüm işlemlerini sonlandırın. Lütfen en son blok yüksekliğini aklınızda tutun (blok taahhüt günlüğündeki en yüksek sıra numarası).

### 2. BLS anahtarını oluşturma {#2-generate-the-bls-key}

`secrets init` ile `--bls` bir BLS anahtarı oluşturur. Mevcut ECDSA ve Ağ anahtarlarını korumak ve yeni bir BLS anahtarı eklemek için `--network` ve `--ecdsa` devre dışı bırakılmalıdır.

```bash
polygon-edge secrets init --bls --ecdsa=false --network=false

[SECRETS INIT]
Public key (address) = 0x...
BLS Public key       = 0x...
Node ID              = 16...
```

### 3. Çatal ayarı ekleme {#3-add-fork-setting}

`ibft switch` komutu mevcut zincir içinde BLS etkinleştiren bir çatal ayarını `genesis.json` içine ekler.

PoA ağları için doğrulayıcıların komutta belirlenmesi gerekir. `genesis` komutunda olduğu gibi, doğrulayıcıyı belirlemek için `--ibft-validators-prefix-path` veya `--ibft-validator` bayrakları kullanılabilir.

Zincirin BLS'yi `--from` bayrağı ile kullanmaya başladığı yüksekliği belirleyin.

```bash
polygon-edge ibft switch --chain ./genesis.json --type PoA --ibft-validator-type bls --ibft-validators-prefix-path test-chain- --from 100
```

### 4. Tüm düğümleri yeniden başlatma {#4-restart-all-nodes}

Tüm düğümleri `server` komutu ile yeniden başlatın. Önceki adımda belirtilen `from` üzerindeki blok oluşturulduktan sonra, zincir BLS'yi etkinleştirir ve aşağıdaki gibi bir günlükte gösterir:

```bash
2022-09-02T11:45:24.535+0300 [INFO]  polygon.ibft: IBFT validation type switched: old=ecdsa new=bls
```

Ayrıca günlükler, blok oluşturulduktan sonra her bloku oluşturmak için hangi doğrulama modunun kullanıldığını gösterir.

```
2022-09-02T11:45:28.728+0300 [INFO]  polygon.ibft: block committed: number=101 hash=0x5f33aa8cea4e849807ca5e350cb79f603a0d69a39f792e782f48d3ea57ac46ca validation_type=bls validators=3 committed=3
```

## Mevcut bir ECDSA PoS zincirinden bir BLS PoS zincirine nasıl geçiş yapılır? {#how-to-migrate-from-an-existing-ecdsa-pos-chain-to-a-bls-pos-chain}

Bu bölüm BLS modunun varolan bir PoS zinciri içinde nasıl kullanılacağını açıklar.
Bir PoS zinciri içinde BLS etkinleştirmek için aşağıdaki adımlar gereklidir.

1. Tüm düğümleri durdurma
2. Doğrulayıcılar için BLS anahtarlarını oluşturma
3. Genesis.json içine çatal ayarı ekleme
4. BLS Genel Anahtarını kaydetmek için staking sözleşmesini çağırma
5. Tüm düğümleri yeniden başlatma

### 1. Tüm düğümleri durdurma {#1-stop-all-nodes-1}

Ctrl + c (Control + c) tuşlarına basarak doğrulayıcıların tüm işlemlerini sonlandırın. Lütfen en son blok yüksekliğini aklınızda tutun (blok taahhüt günlüğündeki en yüksek sıra numarası).

### 2. BLS anahtarını oluşturma {#2-generate-the-bls-key-1}

`secrets init` ile `--bls` bayrağı, BLS anahtarını oluşturur. Mevcut ECDSA ve Ağ anahtarlarını korumak ve yeni bir BLS anahtarı eklemek için `--ecdsa` ve `--network` devre dışı bırakılmalıdır.

```bash
polygon-edge secrets init --bls --ecdsa=false --network=false

[SECRETS INIT]
Public key (address) = 0x...
BLS Public key       = 0x...
Node ID              = 16...
```

### 3. Çatal ayarı ekleme {#3-add-fork-setting-1}

`ibft switch` komutu BLS'yi zincirin ortasından etkinleştiren çatal ayarını `genesis.json` içine ekler.

Zincirin BLS modunu `from` bayrağı ile kullanmaya başladığı yüksekliği ve sözleşmenin `development` bayrağı ile güncellendiği yüksekliği belirleyin.

```bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --ibft-validator-type bls --deployment 50 --from 200
```

### 4. Staking sözleşmesi içinde BLS Genel Anahtarını kaydetme {#4-register-bls-public-key-in-staking-contract}

Çatal eklendikten ve doğrulayıcılar yeniden başlatıldıktan sonra, her doğrulayıcının BLS Genel Anahtarını kaydetmek için staking sözleşmesi içinde `registerBLSPublicKey` çağrısı yapması gerekir. Bunun `--deployment` üzerinde yükseklik belirtildikten sonra ve `--from` içinde yükseklik belirtilmeden önce yapılması gerekir.

BLS Genel Anahtarını kaydetmek için komut dizisi, [Akıllı Sözleşme Stake Etme bilgi deposunda](https://github.com/0xPolygon/staking-contracts) tanımlanmıştır.

`BLS_PUBLIC_KEY`'i `.env` dosyası içinde kaydolacak şekilde ayarlayın. Diğer parametreler hakkında daha fazla bilgi için [pos-stake-unstake](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts) makalesine göz atın.

```env
JSONRPC_URL=http://localhost:10002
STAKING_CONTRACT_ADDRESS=0x0000000000000000000000000000000000001001
PRIVATE_KEYS=0x...
BLS_PUBLIC_KEY=0x...
```

Aşağıdaki komut, `.env` içinde verilen BLS Genel Anahtarını sözleşmeye kaydeder.

```bash
npm run register-blskey
```

:::warning Doğrulayıcıların BLS Genel Anahtarını manuel olarak kaydetmesi gerekir

BLS modunda, doğrulayıcıların kendi adresleri ve BLS genel anahtarları olmalıdır. Konsensüs katmanı, konsensüs sözleşmeden doğrulayıcı bilgisini alırken sözleşme içinde BLS genel anahtar kaydını yaptırmamış olan doğrulayıcıları göz ardı eder.

:::

### 5. Tüm düğümleri yeniden başlatma {#5-restart-all-nodes}

Tüm düğümleri `server` komutu ile yeniden başlatın. Zincir, önceki adımda belirtilen `from` üzerindeki blok oluşturulduktan sonra BLS'yi etkinleştirir.

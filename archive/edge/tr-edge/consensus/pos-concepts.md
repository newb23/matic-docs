---
id: pos-concepts
title: Hisse Kanıtı
description: "Hisse Kanıtı (Proof of Stake) ile ilgili açıklama ve talimatlar."
keywords:
  - docs
  - polygon
  - edge
  - PoS
  - stake
---

## Genel Bakış {#overview}

Bu bölüm, Polygon Edge'in Hisse Kanıtı (PoS) uygulamasında mevcut olan bazı kavramlar hakkında
daha fazla bilgi vermeyi amaçlamaktadır.

Polygon Edge Hisse Kanıtı (PoS) uygulamasının mevcut PoA IBFT uygulamasına bir alternatif olması amaçlanmaktadır,
bu nedenle düğüm operatörlerine zinciri başlatırken ikisi arasında seçim yapma şansı sunar.

## PoS Özellikleri {#pos-features}

Hisse Kanıtı uygulamasının ardındaki temel mantık
**[Staking Smart](https://github.com/0xPolygon/staking-contracts/blob/main/contracts/Staking.sol)** Sözleşmesi.

Bu sözleşme, bir PoS mekanizmalı Polygon Edge zinciri başlatıldığında ve `0x0000000000000000000000000000000000001001` adresinde
(`0` blokundan) mevcut olduğunda önden devreye alınır.

### Dönemler {#epochs}

Dönemler, Polygon Edge'e PoS eklenmesi ile ortaya çıkan bir kavramdır.

Dönemler belirli bir doğrulayıcı kümesinin blok oluşturabileceği özel bir zaman aralığı (blok cinsinden) olarak kabul edilir.
Uzunlukları değiştirilebilir, yani düğüm operatörleri genesis oluşturma sırasında bir dönemin uzunluğunu ayarlayabilir.

Her dönemin sonunda bir _dönem bloku_ oluşturulur ve bu olay sonrasında yeni bir dönem başlar. Dönem blokları hakkında daha fazla bilgi edinmek için
[Dönem Blokları](/docs/edge/consensus/pos-concepts#epoch-blocks) kısmına göz atın.

Doğrulayıcı kümeleri her dönemin sonunda güncellenir. Düğümler, Staking Akıllı Sözleşmesi üzerinden doğrulayıcı kümesini
her dönem blokunun oluşturulması sırasında sorgular ve alınan veriyi yerel depolama alanına kaydeder. Bu sorgu ve kayıt döngüsü
her dönemin sonunda tekrarlanır.

Temel olarak, Staking Akıllı Sözleşmesi'nin doğrulayıcı kümesindeki adresler üzerinde tam kontrole sahip olmasını sağlar ve
düğümlere sadece 1 sorumluluk bırakır: en son doğrulayıcı kümesi bilgisini almak için sözleşmeyi her dönem içinde
bir kere sorgulamak. Bu da tekil düğümlerin doğrulayıcı kümelerini yönetme sorumluluğunu hafifletir.

### Staking {#staking}

Adresler, Staking Akıllı Sözleşmesi üzerinde `stake` yöntemini çağırarak ve işlemde stake edilen miktar için bir değer belirleyerek
fon stake edebilirler:

````js
const StakingContractFactory = await ethers.getContractFactory("Staking");
let stakingContract = await StakingContractFactory.attach(STAKING_CONTRACT_ADDRESS)
as
Staking;
stakingContract = stakingContract.connect(account);

const tx = await stakingContract.stake({value: STAKE_AMOUNT})
````

Staking Akıllı Sözleşmesi'nde fon stake ederek, adresler doğrulayıcı kümesine girebilirler ve bu sayede
blok üretim sürecine katılabilirler.

:::info Staking için eşik

Şu anda, doğrulayıcı kümesine girmek için minimum eşik `1 ETH` stake etmektir

:::

### Stake kaldırma (Unstake) {#unstaking}

Fon stake etmiş olan adresler, stake kaldırma işlemini sadece **stake etmiş oldukları fonların tümünü unstake ederek yapabilirler**.

Stake kaldırma, Staking Akıllı Sözleşmesi üzerinde `unstake` yöntemi çağrılarak yapılabilir:

````js
const StakingContractFactory = await ethers.getContractFactory("Staking");
let stakingContract = await StakingContractFactory.attach(STAKING_CONTRACT_ADDRESS)
as
Staking;
stakingContract = stakingContract.connect(account);

const tx = await stakingContract.unstake()
````

Adresler fonlarını unstake ettikten sonra Staking Akıllı Sözleşmesi üzerindeki doğrulayıcı kümesinden çıkarılırlar ve
bir sonraki dönem için doğrulayıcı olarak kabul edilmezler.

## Dönem Blokları {#epoch-blocks}

**Dönem Blokları**, Polygon Edge için IBFT'nin PoS uygulamasında ortaya çıkarılmış bir kavramdır.

Temel olarak, dönem blokları **hiçbir işlem** içermeyen ve sadece **bir dönemin sonunda** meydana gelen özel bloklardır.
Örneğin, **epo boyutu** bloklar olarak ayarlanırsa, epo blokları `50`blok olarak kabul `50`edilir, `100``150`ve bunun gibi.

Bunlar olağan blok üretimi sırasında oluşmaması gereken ek mantığı gerçekleştirmek için kullanılırlar.

En önemlisi, bunlar düğüm için Staking Akıllı Sözleşmesi'nden **en güncel doğrulayıcı kümesi** bilgisini
alması gerektiğine dair bir göstergedir.

Dönem blokunda doğrulayıcı kümesini güncelledikten sonra, doğrulayıcı kümesi (değişmiş veya değişmemiş)
sonraki `epochSize - 1` blokları için kullanılır, ta ki Staking Akıllı Sözleşmesi'nden en yeni bilgiyi alarak
tekrar güncellenene kadar.

Dönem uzunlukları (blok cinsinden) genesis dosyası oluşturulurken `--epoch-size` özel bayrağı kullanılarak değiştirilebilir:

```bash
polygon-edge genesis --epoch-size 50 ...
```

Polygon Edge üzerinde bir dönemin varsayılan boyutu `100000` bloktur.

## Sözleşmenin önceden devreye alınması {#contract-pre-deployment}

Polygon Edge _önceden devreye alma işleminde_;
[Staking Akıllı Sözleşmesi](https://github.com/0xPolygon/staking-contracts/blob/main/contracts/Staking.sol),
**genesis oluşturma** sırasında `0x0000000000000000000000000000000000001001` adresinde önceden devreye alınır.

Bu, bir EVM çalıştırılmadan, Akıllı Sözleşme'nin blok zinciri durumu doğrudan değiştirilerek,
genesis komutuna geçirilen yapılandırma değerleri kullanılarak yapılır.

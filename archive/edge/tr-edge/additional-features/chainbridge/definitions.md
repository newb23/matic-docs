---
id: definitions
title: Genel Tanımlar
description: chainBridge'de kullanılan terimler için Genel Tanımlar
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---


## Yönlendirici {#relayer}
Chainbridge, yönlendirici tipi bir köprüdür. Bir yönlendiricinin rolü, bir isteğin yürütülmesi için oy vermektir (örneğin, kaç token'ın yakılacağı/serbest bırakılacağı).
Her zincirdeki olayları izler ve bir zincirden bir `Deposit` olayı aldığında hedef zincirin Köprü sözleşmesinde bir teklif için oy kullanır. Bir yönlendirici, gerekli sayıda oy gönderildikten sonra teklifi yürütmek için Köprü sözleşmesindeki bir yöntemi çağırır. Köprü, yürütme işlemini İşleyici sözleşmesine delege eder.


## Sözleşme türleri {#types-of-contracts}
ChainBridge'de her zincir üzerinde Köprü/İşleyici/Hedef adı verilen üç sözleşme türü vardır.

| **Tip** | **Açıklama** |
|----------|-------------------------------------------------------------------------------------------------------------------------------|
| Köprü sözleşmesi | Her zincirde istekleri, oyları ve uygulamaları yöneten bir Köprü sözleşmesi devreye alınmalıdır. Kullanıcılar, bir aktarımı başlatmak için Köprüde `deposit` çağrısı yapar ve Köprü, süreci Hedef sözleşmesine karşılık gelen İşleyici sözleşmesine delege eder. İşleyici sözleşmesi Hedef sözleşmesini çağırmada başarılı olduktan sonra, Köprü sözleşmesi yönlendiricileri bilgilendirmek için bir `Deposit` olayı yayımlar. |
| İşleyici sözleşmesi | Bu sözleşme, bir fon yatırmak veya teklif yürütmek için Hedef sözleşmesi ile etkileşime girer. Kullanıcının isteğini doğrular, Hedef sözleşmeyi çağırır ve Hedef sözleşmesi için bazı ayarlara yardımcı olur. Farklı bir arabirime sahip olan her bir Hedef sözleşmesini çağırmak için belirli İşleyici sözleşmeleri vardır. İşleyici sözleşmesinin dolaylı çağrıları, her türlü varlık veya verinin aktarımını sağlamak için köprü oluşturur. Şu anda ChainBridge tarafından uygulanan üç tür İşleyici sözleşmesi vardır: ERC20Handler, ERC721Handler ve GenericHandler. |
| Hedef sözleşme | Zincirler arasında değiş tokuş edilecek varlıkları veya iletilen mesajları yöneten bir sözleşmedir. Bu sözleşme ile etkileşim köprünün her iki tarafından yapılır. |

<div style={{textAlign: 'center'}}>

![ChainBridge Mimarisi](/img/edge/chainbridge/architecture.svg)
*ChainBridge Mimarisi*

</div>

<div style={{textAlign: 'center'}}>

![ERC20 token aktarımının iş akışı](/img/edge/chainbridge/erc20-workflow.svg)
*ör. ERC20 token aktarımının iş akışı*

</div>

## Hesap türleri {#types-of-accounts}

Başlamadan önce lütfen hesapların işlem oluşturmaya yetecek kadar yerel token'a sahip olduğundan emin olun. Polygon Edge'de, genesis bloğunu oluştururken hesaplara önceden mine edilmiş bakiyeler atayabilirsiniz.

| **Tip** | **Açıklama** |
|----------|-------------------------------------------------------------------------------------------------------------------------------|
| Yönetici | Bu hesaba varsayılan olarak yönetici rolü verilir. |
| Kullanıcı | Varlıkları gönderen/alan gönderici/alıcı hesabı. Gönderici hesabı, token aktarımını onaylarken ve bir aktarıma başlamak için Köprü sözleşmesinde depozitoyu çağırırken gaz ücretlerini öder. |

:::info Yönetici rolü

Belirli eylemler sadece yönetici rolündeki hesap tarafından gerçekleştirilebilir. Varsayılan olarak, Köprü sözleşmesinin devreye alan, yönetici rolüne sahip olur. Yönetici rolünü başka bir hesaba nasıl vereceğinizi veya kaldıracağınızı aşağıda bulabilirsiniz.

### Yönetici rolü ekle {#add-admin-role}

Bir yönetici ekler

```bash
# Grant admin role
$ cb-sol-cli admin add-admin \
  --url [JSON_RPC_URL] \
  --privateKey [PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --admin "[NEW_ACCOUNT_ADDRESS]"
```
### Yönetici rolünü iptal et {#revoke-admin-role}

Bir yöneticiyi kaldırır

```bash
# Revoke admin role
$ cb-sol-cli admin remove-admin \
  --url [JSON_RPC_URL] \
  --privateKey [PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --admin "[NEW_ACCOUNT_ADDRESS]"
```

## `admin` hesabı tarafından izin verilen işlemler aşağıdaki gibidir. {#account-are-as-below}

### Kaynak Ayarla {#set-resource}

Bir işleyici için sözleşme adresi ile bir kaynak kimliği kaydeder.

```bash
# Register new resource
$ cb-sol-cli bridge register-resource \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --resourceId "[RESOURCE_ID]" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[TARGET_CONTRACT_ADDRESS]"
```

### Sözleşmeyi yakılabilir/mint edilebilir yap {#make-contract-burnable-mintable}

Bir işleyicide token sözleşmesini mint edilebilir/yakılabilir olarak ayarlar.

```bash
# Let contract burnable/mintable
$ cb-sol-cli bridge set-burn \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[TARGET_CONTRACT_ADDRESS]"
```

### Teklifi iptal et {#cancel-proposal}

Yürütme için teklifi iptal eder

```bash
# Cancel ongoing proposal
$ cb-sol-cli bridge cancel-proposal \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --resourceId "[RESOURCE_ID]" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --chainId "[CHAIN_ID_OF_SOURCE_CHAIN]" \
  --depositNonce "[NONCE]"
```

### Duraklat/Devam Et {#pause-unpause}

Fon yatırma, teklif oluşturma, oylama ve fon yürütme işlemlerini geçici olarak durdurur.

```bash
# Pause
$ cb-sol-cli admin pause \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]"

# Unpause
$ cb-sol-cli admin unpause \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]"
```

### Ücret Değiştir {#change-fee}

Köprü Sözleşmesi için ödenecek ücreti değiştirir

```bash
# Change fee for execution
$ cb-sol-cli admin set-fee \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --fee [FEE_IN_WEI]
```

### Bir yönlendirici Ekle/Kaldır {#add-remove-a-relayer}

Yeni bir yönlendirici olarak bir hesap ekler veya bir hesabı yönlendiricilerden kaldırır

```bash
# Add relayer
$ cb-sol-cli admin add-relayer \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --relayer "[NEW_RELAYER_ADDRESS]"

# Remove relayer
$ cb-sol-cli admin remove-relayer \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --relayer "[RELAYER_ADDRESS]"
```

### Yönlendirici eşiğini değiştir {#change-relayer-threshold}

Teklifin yürütülmesi için gereken oy sayısını değiştirir

```bash
# Remove relayer
$ cb-sol-cli admin set-threshold \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --threshold [THRESHOLD]
```
:::

## Zincir Kimliği {#chain-id}

Chainbridge `chainId`, blok zinciri ağları arasında ayrım yapmak için köprüde kullanılan rastgele bir değer olup, uint8 aralığında olmalıdır. Ağın zincir kimliği ile karıştırılmaması gerekir; bunlar aynı şey değildir. Bu değerin eşsiz olması gerekir ama ağın kimliği ile aynı olması gerekmez.

Bu örnekte, Mumbai test ağı, zincir kimliği bir uint8 ile gösterilemeyen `80001` olduğundan `chainId` için `99` atadık.

## Kaynak Kimliği {#resource-id}

Kaynak kimliği, ağlar arasında aktarılan belirli bir varlık (kaynak) ile ilişkili olan, zincirler arası bir ortamda 32 baytlık eşsiz bir değerdir.

Kaynak kimliği rastgeledir ancak genel bir kural olarak, genellikle son bayt kaynak zincirin (varlığın geldiği ağ) zincir kimliğini içerir.

## Polygon PoS için JSON-RPC URL {#json-rpc-url-for-polygon-pos}

Bu kılavuz için, Polygon tarafından sağlanan, trafik veya hız sınırları olabilecek genel bir JSON-RPC URL'si olan https://rpc-mumbai.matic.today'i kullanacağız. Bu yalnızca Polygon Mumbai test ağına bağlanmak için kullanılacaktır. Dağıtım sözleşmeleri JSON-RPC adresinize birçok sorgu/istek göndereceğinden, JSON-RPC URL'inizi Infura gibi harici bir servisten almanızı öneririz.

## Token aktarımını işleme yolları {#ways-of-processing-the-transfer-of-tokens}
ERC20 token'ları zincirler arasında aktarılırken iki farklı modda işlenebilir:

### Kilitleme/serbest bırakma modu {#lock-release-mode}
<b>Kaynak zinciri: </b>Gönderdiğiniz token'lar İşleyici Sözleşmesi'nde kilitlenecektir.  <br/>
<b>Hedef zincir:</b> Kaynak zincirde gönderdiğiniz ile aynı miktarda token kilitli durumdan çıkarılır ve İşleyici sözleşmesinden hedef zincirdeki alıcı hesabına aktarılır.

### Yakma/mint etme modu {#burn-mint-mode}
<b>Kaynak Zincir:</b> Gönderdiğiniz token'lar yakılır.   <br/><b>Hedef zincir:</b> Kaynak zincirde gönderdiğiniz ve yaktığınızla aynı miktarda token, hedef zincirde mint edilir ve alıcı hesabına gönderilir.

Her zincirde farklı modlar kullanabilirsiniz. Bu, aktarım için alt zincir üzerinde bir token'ı mint ederken, ana zincir üzerinde bir token'ı kilitleyebileceğiniz anlamına gelir. Örneğin, toplam arz veya mint programı kontrol ediliyorsa, token'ları kilitlemek/serbest bırakmak mantıklı olabilir. Alt zincirdeki sözleşmenin ana zincirdeki arzı takip etmesi gerekiyorsa token'lar mint edilmelidir/yakılmalıdır.

Varsayılan mod kilitleme/serbest bırakma modudur. Token'ları mint edilebilir/yakılabilir yapmak istiyorsanız, `adminSetBurnable` yöntemini çağırmanız gerekir. Yürütme esnasında token'ları mint etmek istiyorsanız, ERC20 İşleyici sözleşmesine `minter` rolü vermeniz gerekir.



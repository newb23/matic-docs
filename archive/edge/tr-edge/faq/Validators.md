---
id: validators
title: Doğrulayıcılar SSS
description: "Polygon Edge doğrulayıcıları için SSS"
keywords:
  - docs
  - polygon
  - edge
  - FAQ
  - validators

---

## Doğrulayıcı nasıl eklenir/kaldırılır? {#how-to-add-remove-a-validator}

### PoA {#poa}
Doğrulayıcıların eklenmesi/kaldırılması oylama ile yapılır. [Burada](/docs/edge/consensus/poa) bununla ilgili tam bir kılavuz bulabilirsiniz.

### PoS {#pos}
Bir düğümün doğrulayıcı olabilmesi için fonların nasıl stake edileceği ve nasıl unstake edileceği (doğrulayıcıyı kaldırma) hakkında [burada](/docs/edge/consensus/pos-stake-unstake) bir kılavuz bulabilirsiniz.

Lütfen dikkat edin:
- Doğrulayıcı kümesine katılabilecek maksimum sayıda stake eden ayarlamak için `--max-validator-count` genesis bayrağını kullanabilirsiniz.
- Doğrulayıcı kümesine katılabilecek minimum stake eden sayısını ayarlamak için `--min-validator-count ` genesis bayrağını kullanabilirsiniz (varsayılan olarak `1`).
- Maksimum doğrulayıcı sayısı karşılandığında, mevcut bir doğrulayıcıyı kümeden kaldırana kadar başka bir doğrulayıcı ekleyemezsiniz (yeni doğrulayıcının stake miktarının daha yüksek olup olmadığı önemli değildir). Bir doğrulayıcıyı kaldırırsanız, kalan doğrulayıcıların sayısı en az `--min-validator-count` olmalıdır.
- Doğrulayıcı olmak için varsayılan olarak `1` birim yerel ağ (gaz) para birimi eşiği vardır.



## Bir doğrulayıcı için ne kadar disk alanı önerilir? {#how-much-disk-space-is-recommended-for-a-validator}

İhtiyatlı bir şekilde tahmin edilen bir yol olarak 100G ile başlamanızı ve daha sonra diski ölçeklemenin mümkün olduğundan emin olmanızı öneririz.


## Doğrulayıcı sayısı için bir limit var mı? {#is-there-a-limit-to-the-number-of-validators}

Teknik limitlerden bahsetmek gerekirse, Polygon Edge, bir ağ üzerinde sahip olabileceğiniz düğüm sayısı konusunda açık bir sınıra sahip değildir. Bağlantı sınırlarını (gelen / giden bağlantı sayısı) düğüm bazında ayarlayabilirsiniz.

Pratik limitlerden bahsetmek gerekirse, 100 düğümlü bir kümede, 10 düğümlü bir kümeye göre daha düşük bir performans göreceksiniz. Kümenizdeki düğüm sayısını artırarak, iletişim karmaşıklığını ve yalnızca genel olarak ağ oluşturma yükünü artırırsınız. Her şey ne tür bir ağda çalıştığınıza ve ne tür bir ağ topolojisine sahip olduğunuza bağlıdır.

## PoA'dan PoS'a nasıl geçiş yapılır? {#how-to-switch-from-poa-to-pos}

PoA, varsayılan konsensüs mekanizmasıdır. Yeni bir küme için PoS'a geçmek için, genesis dosyasını oluştururken `--pos` bayrağını eklemeniz gerekir. Çalışan bir kümeniz varsa, [burada](/docs/edge/consensus/migration-to-pos) geçişin nasıl yapılacağını bulabilirsiniz. Konsensüs mekanizmalarımız ve kurulumumuz hakkında ihtiyacınız olan tüm bilgiler, [konsensüs bölümümüzde](/docs/edge/consensus/poa) bulunabilir.

## Bozucu bir değişiklik olduğunda düğümlerimi nasıl güncelleyebilirim? {#how-do-i-update-my-nodes-when-there-s-a-breaking-change}

Bu prosedürün nasıl yapılacağı hakkında ayrıntılı bir kılavuzu [burada](/docs/edge/validator-hosting#update) bulabilirsiniz.

## PoS Edge için minimum staking miktarı yapılandırılabilir mi? {#is-the-minimum-staking-amount-configurable-for-pos-edge}

Varsayılan olarak minimum staking miktarı `1 ETH`'dir ve yapılandırılamaz.

## JSON RPC komutları `eth_getBlockByNumber`ve `eth_getBlockByHash` neden madencinin adresini geri döndürmüyor? {#not-return-the-miner-s-address}

Şu anda Polygon Edge'de kullanılan konsensüs, Clique PoA: [ethereum/EIPs#225](https://github.com/ethereum/EIPs/issues/225)'te açıklanan oylama mekanizması üzerine kurulu olan IBFT 2.0'dır.

EIP-225'e (Clique PoA) baktığımızda, `miner`'in (diğer adıyla `beneficiary`) ne için kullanıldığını açıklayan ilgili bölüm şudur:

<blockquote>
ethash başlık alanlarını aşağıdaki gibi yeniden tasarlıyoruz:
<ul>
<li><b>yararlanıcı/madenci: </b>Yetkili imzalayanların listesinin değiştirilmesinin önerileceği adres.</li>
<ul>
<li>Normalde sıfırlarla doldurulmalı, yalnızca oylama yapılırken değiştirilmelidir.</li>
<li>Bununla birlikte, oylama mekanikleriyle ilgili uygulamalarda ekstra karmaşıklığı önlemek için rastgele değerlere (imzalamayanlara oy vermek gibi anlamsız olanlara bile) izin verilir.</li>
<li> Denetim noktası (yani dönem geçişi) bloklarında sıfırlarla doldurulmalıdır. </li>
</ul>

</ul>

</blockquote>

Bu nedenle `miner` alanı, blok teklif sahibini göstermek için değil, belirli bir adres için oylama teklif etmek için kullanılır.

Blok teklif sahibi ile ilgili bilgiler, blok başlıklarındaki RLP kodlanmış İstanbul ekstra veri alanının Mühür alanından genel anahtar kurtarılarak bulunabilir.

## Genesis'in hangi parçaları ve değerleri güvenle değiştirilebilir? {#which-parts-and-values-of-genesis-can-safely-be-modified}

:::caution

Lütfen düzenleme girişiminde bulunmadan önce mevcut genesis.json dosyasının manuel bir kopyasını oluşturduğunuzdan emin olun. Ayrıca, genesis.json dosyasını düzenlemeden önce tüm zincirin durdurulması gerekir. Genesis dosyası değiştirildikten sonra, bunun daha yeni sürümünün tüm doğrulayıcı olmayan ve valdiator düğümleri üzerinden dağıtılması gerekir.

:::

**Sadece genesis dosyasının önyükleme bölümü güvenli bir şekilde değiştirilebilir;** burada listeden bootnodes ekleyebilir veya kaldırabilirsiniz.
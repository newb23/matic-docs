---
id: migration-to-pos
title: PoA'dan PoS'a Geçiş
description: "PoA'dan PoS IBFT moduna ve tersine nasıl geçiş yapılır?"
keywords:
  - docs
  - polygon
  - edge
  - migrate
  - PoA
  - PoS
---

## Genel Bakış {#overview}

Bu bölüm, çalışan bir küme için, blok zinciri sıfırlamaya gerek kalmadan PoA'dan PoS IBFT modlarına ve tersine geçişi nasıl yapabileceğiniz konusunda size rehberlik etmektedir.

## PoS'a nasıl geçiş yapılır? {#how-to-migrate-to-pos}

Tüm düğümleri durdurmanız, genesis.json içine `ibft switch` komutu ile çatal yapılandırması eklemeniz ve düğümleri yeniden başlatmanız gerekir.

````bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --deployment 100 --from 200
````
:::caution ECDSA kullanırken geçiş
ECDSA kullanılırken, ECDSA kullanıldığından bahseden `--ibft-validator-type`bayrak düğmeye eklenmelidir. Bu durumda Edge otomatik olarak BLS'ye geçecektir.

````bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --ibft-validator-type ecdsa --deployment 100 --from 200
````
:::PoS'a geçmek için 2 blok yüksekliğini belirtmeniz gerekir: `deployment``from`ve staking sözleşmesini yerleştirmenin `deployment`yüksekliğidir ve PoS'un başlangıcının `from`yüksekliğidir. Staking sözleşmesi, önceden devreye alınmış sözleşmede olduğu gibi, `deployment` sırasında `0x0000000000000000000000000000000000001001` adresinde devreye alınacaktır.

Staking sözleşmesi hakkında daha fazla bilgi için lütfen [Hisse Kanıtı](/docs/edge/consensus/pos-concepts) kısmına göz atın.

:::warning Doğrulayıcıların manuel olarak stake etmesi gerekir

Her doğrulayıcı, PoS başlangıcında bir doğrulayıcı olmak için, sözleşme devreye alındıktan sonra `deployment` üzerinde ve devreye alınmadan önce `from` üzerinde stake etmelidir. Her doğrulayıcı PoS başlangıcındaki staking sözleşmesi sırasında ayarlanan kendi doğrulayıcısını güncelleyecektir.

Staking hakkında daha fazla bilgi edinmek için Set Kurulunu ziyaret edin **[ve Proof of of Stake kullanın](/docs/edge/consensus/pos-stake-unstake)**.
:::

---
id: tokens
title: Token'lar SSS
description: "Polygon Edge token'ları için SSS"
keywords:
  - docs
  - polygon
  - edge
  - FAQ
  - tokens
---

## Polygon Edge EIP-1559'u destekler mi? {#does-polygon-edge-support-eip-1559}
Şu anda, Polygon Edge EIP-1559'u desteklememektedir.

## Para birimi (token) sembolü nasıl ayarlanır? {#how-to-set-the-currency-token-symbol}

Token sembolü sadece kullanıcı arabirimi ile ilgilidir, bu nedenle ağda herhangi bir yerde yapılandırılamaz veya kodla sabitlenemez.
Ancak, ağı örneğin Metamask gibi bir cüzdana eklerken değiştirebilirsiniz.

## Bir zincir durduğunda işlemlere ne olur? {#what-happens-to-transactions-when-a-chain-halts}

İşlemi gerçekleştirilmeyen tüm işlemler TxPool'un (sıralı veya terfi edilen sıra) içindedir. Eğer zincir durursa (tüm blok üretimi durur), bu işlemler asla bloklara girmeyecektir.<br/> Bu durum sadece zincir durduğunda geçerli değildir. Düğümler durdurulur veya yeniden başlatılırsa, yürütülmemiş ve hala TxPool'da bulunan tüm işlemler sessizce kaldırılacaktır.<br/> Aynı şey bir kırılma değişikliği ile karşılaşıldığında işlemlerde de gerçekleşecektir, çünkü düğümlerin yeniden başlatılması için gerekli olan budur.

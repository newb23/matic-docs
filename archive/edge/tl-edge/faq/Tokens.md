---
id: tokens
title: FAQ tungkol sa mga Token
description: "FAQ para sa mga token ng Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - FAQ
  - tokens
---

## Sinusuportahan ba ng Polygon Edge ang EIP-1559? {#does-polygon-edge-support-eip-1559}
Sa ngayon, hindi sinusuportahan ng Polygon Edge ang EIP-1559.

## Paano itakda ang simbolo ng currency(token)? {#how-to-set-the-currency-token-symbol}

Ang simbolo ng token ay isang bagay lang sa UI, hindi ito mako-configure o maha-hardcode kahit saan sa network.
Gayunpaman, maaari mo itong baguhin kapag idinagdag mo ang network sa isang wallet, gaya ng Metamask, halimbawa.

## Ano ang nangyayari sa mga transaksyon kapag a ang isang chain? {#what-happens-to-transactions-when-a-chain-halts}

Lahat ng transaksyon na hindi pa napoproseso ay nasa loob ng TxPool(enqueued o promote queue). Kung humihinto ang chain (tumigil ang lahat ng produksyon ng block ), hindi na papasok ang mga transaksyong ito.<br/> Hindi lang ito ang kaso kapag halts. ang chain. Kung tumigil o restarted, ang mga node, ang lahat ng transaksyon na hindi pa naisagawa at nasa TxPool, tahimik na aalis ang<br/> Ganito ang mangyayari sa mga transaksyon kapag nagpakilala ang isang paglabag na pagbabago, dahil kinakailangan para change ang mga node.

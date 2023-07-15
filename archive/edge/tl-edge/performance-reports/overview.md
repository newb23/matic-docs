---
id: overview
title: Pangkalahatang-ideya
description: "Introduksyon sa Polygon Edge testing."
keywords:
  - docs
  - polygon
  - edge
  - performance
  - tests
  - loadbot
---
:::caution
Mangyaring tandaan na ang aming , na ginamit para sa pagsasagawa ng mga pagsubok `loadbot`na ito, ay niloloko na ngayon.
:::

| Uri | Value | Link sa test |
| ---- | ----- | ------------ |
| Mga Regular na Paglilipat | 1428 tps | [Ika-4 ng Hulyo 2022](test-history/test-2022-07-04.md#results-of-eoa-to-eoa-transfers) |
| Mga Paglilipat ng ERC-20 | 1111 tps | [Ika-4 ng Hulyo 2022](test-history/test-2022-07-04.md#results-of-erc20-token-transfers) |
| NFT Minting | 714 tps | [Ika-4 ng Hulyo 2022](test-history/test-2022-07-04.md#results-of-erc721-token-minting) |

---

Ang layunin namin ay gumawa ng isang mahusay, sagana sa feature at madaling i-setup at i-maintain na blockchain client software.
Lahat ng mga test ay ginawa gamit ang Polygon Edge Loadbot.
Ang bawat performance report na makikita mo sa seksyong ito ay may wastong petsa, malinaw na inilarawan ang kapaligiran at malinaw na ipinaliwanag ang pamamaraan ng pag-test.

Ang layunin ng mga performance test na ito ay upang ipakita ang tunay na kakayahan ng Polygon Edge blockchain network.
Ang sinuman ay tiyak na makakakuha ng kaparehong resulta na ipinaskil dito, sa parehong kapaligiran, gamit ang aming loadbot.

Ang lahat ng mga performance test ay isinagawa sa AWS platform sa isang chain na binubuo ng mga EC2 instance node.
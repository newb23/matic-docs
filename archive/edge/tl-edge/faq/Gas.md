---
id: gas
title: FAQ Tungkol sa Gas
description: "FAQ Tungkol sa Gas para sa Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - FAQ
  - validators

---

## Paano magpatupad ng minimum na gas price? {#how-to-enforce-a-minimum-gas-price}
Maaari mong gamitin ang `--price-limit` flag na ibinigay sa server command. Mag-aatas ito sa iyong node na tumanggap lang ng mga transaksyon na may gas na mas mataas sa o katumbas ng limitasyon sa presyo na itinakda mo. Para matiyak na naipatupad ito sa buong network, kailangan mong tiyakin na ang lahat ng node ay may parehong limitasyon sa presyo.


## Maaari ka bang magkaroon ng mga transaksyon na may mga 0 gas fee? {#can-you-have-transactions-with-0-gas-fees}
Oo, maaari. Ang default na limitasyon sa presyo na ipinapatupad ng mga node ay `0`, ibig sabihin, tatanggap ang mga node ng mga transaksyon na may gas price na nakatakda sa `0`.

## Paano itakda ang kabuuang supply ng gas(native) token? {#how-to-set-the-gas-native-token-total-supply}

Maaari kang magtakda ng na-premine na balanse sa mga account (mga address) gamit ang `--premine flag`. Mangyaring tandaan ito ay isang configuration mula sa genesis file, at hindi ito maaaring baguhin sa ibang pagkakataon.

Halimbawa kung paano gamitin ang `--premine flag`:

`--premine=0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000`

Nagtatakda ito ng na-premine na balanse na 1000 ETH sa 0x3956E90e632AEbBF34DEB49b71c28A83Bc029862 (ang halaga mula sa argument ay nasa wei).

Ang na-premine na halaga ng gas token ay ang magiging kabuuang supply. Walang ibang halaga ng native na currency (gas token) ang maaaring i-mint sa ibang pagkakataon.

## Sinusuportahan ba ng Edge ang ERC-20 bilang gas token? {#does-edge-support-erc-20-as-a-gas-token}

Hindi sinusuportahan ng Edge ang ERC-20 token bilang gas token. Ang native na currency ng Edge lang ang sinusuportahan para sa gas.

## Paano dadagdagan ang limitasyon ng gas? {#how-to-increase-the-gas-limit}

May dalawang pagpipilian para sa pagtaas ng limitasyon ng gas sa Polygon Edge:
1. Wiping ang chain at pagtaas sa maximum `block-gas-limit`na halaga ng uint64 sa genesis file
2. Gamitin ang `--block-gas-target`bandila na may mataas na halaga para madagdagan ang limitasyon ng gas ng lahat ng node. Nangangailangan ito ng node reboot. Detalyadong paliwanag [dito](/docs/edge/architecture/modules/txpool/#block-gas-target).
---
id: permission-contract-deployment
title: Pahintulot ng pag-deploy ng smart na kontrata
description: Paano magdagdag ng pahintulot sa pag-deploy ng smart na kontrata.
keywords:
  - docs
  - polygon
  - edge
  - smart contract
  - permission
  - deployment
---

## Pangkalahatang-ideya {#overview}

Idedetalye ng gabay na ito kung paano i-whitelist ang mga address na maaaring mag-deploy ng mga smart na kontrata. Kung minsan, nais hadlangan ng mga network operator ang mga user sa pag-deploy ng mga smart na kontrata na walang kaugnayan sa layunin ng network. Ang mga network operator ay maaaring:

1. Mag-whitelist ng mga address para sa pag-deploy ng Smart na Kontrata
2. Mag-alis ng mga adres mula sa whitelist para sa pag-deploy ng Smart Contract

## Video presentation {#video-presentation}

[![pag-deploy ng kontrata - video](https://img.youtube.com/vi/yPOkINpf7hg/0.jpg)](https://www.youtube.com/watch?v=yPOkINpf7hg)

## Paano gamitin ito? {#how-to-use-it}


Makikita mo ang lahat ng mga cli command na may kaugnayan sa deployment whitelist sa [CLI Commands](/docs/edge/get-started/cli-commands#whitelist-commands) page.

* `whitelist show`: Ipinapakita ang impormasyon ng whitelist
* `whitelist deployment --add`: Nagdadagdag ng isang bagong address sa contract deployment whitelist
* `whitelist deployment --remove`: Inaalis ang isang bagong address mula sa whitelist ng pag-deploy ng kontrata

#### Ipakita ang lahat ng mga address sa deployment whitelist {#show-all-addresses-in-the-deployment-whitelist}

Mayroong 2 paraan para mahanap ang mga address mula sa deployment whitelist.
1. Pagtingin sa `genesis.json` kung saan naka-save ang mga whitelist
2. Pagsasagawa ng `whitelist show`, na nagpi-print ng impormasyon para sa lahat ng mga whitelist na sinusuportahan ng Polygon Edge

```bash

./polygon-edge whitelist show

[WHITELISTS]

Contract deployment whitelist : [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d],


```

#### Magdagdag ng isang address sa deployment whitelist {#add-an-address-to-the-deployment-whitelist}

Para magdagdag ng isang bagong address sa deployment whitelist, isagawa ang `whitelist deployment --add [ADDRESS]` CLI command. Walang limitasyon ang bilang ng mga address na nasa whitelist. Ang mga address lamang na umiiral sa contract deployment whitelist ang maaaring mag-deploy ng mga kontrata. Kung walang laman ang whitelist, maaaring mag-deploy ang kahit anong address

```bash

./polygon-edge whitelist deployment --add 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d --add 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF


[CONTRACT DEPLOYMENT WHITELIST]

Added addresses: [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],
Contract deployment whitelist : [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],



```

#### Alisin ang isang address mula sa deployment whitelist {#remove-an-address-from-the-deployment-whitelist}

Para alisin isang address mula sa deployment whitelist, isagawa ang `whitelist deployment --remove [ADDRESS]` CLI command. Ang mga address lamang na umiiral sa contract deployment whitelist ang maaaring mag-deploy ng mga kontrata. Kung walang laman ang whitelist, maaaring mag-deploy ang kahit anong address

```bash

./polygon-edge whitelist deployment --remove 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d --remove 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF


[CONTRACT DEPLOYMENT WHITELIST]

Removed addresses: [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],
Contract deployment whitelist : [],



```

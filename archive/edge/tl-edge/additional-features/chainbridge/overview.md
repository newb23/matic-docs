---
id: overview
title: Pangkalahatang-ideya
description: Pangkalahatang-ideya ng ChainBridge
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

## Ano ang ChainBridge? {#what-is-chainbridge}

Isang modular multi-directional blockchain bridge ang Chainbridge na sumusuporta sa EVM at mga Substrate compatible chain, na binuo ng ChainSafe. Pinapahintulutan nito ang mga user na ilipat ang lahat ng uri ng mga asset o mensahe sa pagitan ng dalawang magkaibang chain.

Para alamin pa ang tungkol sa ChainBridge, bisitahin muna ang [mga opisyal na dokumento](https://chainbridge.chainsafe.io/) na inilaan ng mga developer nito.

Inilaan ang gabay na ito para tumulong sa pag-integrate ng Chainbridge sa Polygon Edge. Ipinapakita nito ang setup ng bridge sa pagitan ng gumaganang Polygon PoS (Mumbai testnet) at lokal na Polygon Edge network.

## Mga Kinakailangan {#requirements}

Sa gabay na ito, patatakbuhin mo ang mga Polygon Edge node, ChainBridge relayer (higit pa tungkol nito[ dito](/docs/edge/additional-features/chainbridge/definitions)), at ang cb-sol-cli tool, na isang CLI tool para lokal na mai-deploy ang mga kontrata, pagrerehistro ng resource, at pagbabago ng mga setting para sa bridge (maaari mo rin [itong](https://chainbridge.chainsafe.io/cli-options/#cli-options) tingnan). Kailangan ang sumusunod na mga enviroment bago simulan ang setup:

* Go: >= 1.17
* Node.js >= 16.13.0
* Git


Bilang karagdagan, kailangan mong i-clone ang sumusunod na mga repository kasama ang mga bersyon para mapatakbo ang ilang application.

* [Polygon Edge](https://github.com/0xPolygon/polygon-edge) : sa`develop` na branch
* [ChainBridge](https://github.com/ChainSafe/ChainBridge): v1.1.5
* [Mga ChainBridge Deploy Tool](https://github.com/ChainSafe/chainbridge-deploy) : `f2aa093`sa`main` branch


Kailangan mong i-set up ang Polygon Edge network bago magpatuloy sa susunod na seksyon. Tingnan ang [Lokal na Setup](/docs/edge/get-started/set-up-ibft-locally) o [Cloud Setup](/docs/edge/get-started/set-up-ibft-on-the-cloud) para sa higit pang mga detalye.
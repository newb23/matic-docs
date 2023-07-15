---
id: migration-to-pos
title: Pag-migrate mula sa PoA patungo sa PoS
description: "Paano mag-migrate mula sa PoA patungo sa PoS IBFT mode, at vice versa."
keywords:
  - docs
  - polygon
  - edge
  - migrate
  - PoA
  - PoS
---

## Pangkalahatang-ideya {#overview}

Ang seksyong ito ay gumagabay sa iyo sa pag-migrate mula sa PoA patungo sa mga PoS IBFT mode, at vice versa, para sa tumatakbong cluster - nang hindi kinakailangang i-reset ang blockchain.

## Paano mag-migrate sa PoS {#how-to-migrate-to-pos}

Kakailanganin mong itigil ang lahat ng node, magdagdag ng configuration ng fork sa genesis.json sa pamamagitan ng `ibft switch` command, at i-restart ang mga node.

````bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --deployment 100 --from 200
````
:::caution Paglipat habang gumagamit ng ECDSA
Kapag gumagamit ng ECDSA, dapat idagdag ang `--ibft-validator-type`bandila sa switch, na binabanggit ang ginagamit na ECDSA. Kung hindi kasama, awtomatikong lumipat ang Edge sa BLS.

````bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --ibft-validator-type ecdsa --deployment 100 --from 200
````
:::Para lumipat sa PoS, kakailanganin mong tukuyin ang 2 block heights: `deployment`at . ay `from`ang taas na i-deploy ang staking contract at ito `from``deployment`ang taas ng simula ng PoS. Ang staking contract ay ide-deploy sa address na `0x0000000000000000000000000000000000001001` sa `deployment`, gaya sa kaso ng paunang na-deploy na kontrata.

Pakitingnan ang [Proof of Stake](/docs/edge/consensus/pos-concepts) para sa higit pang detalye tungkol sa Staking na kontrata.

:::warning Kinakailangan ng mga validator na manual na mag-stake

Ang bawat validator ay kinakailangang mag-stake pagkatapos mag-deploy ng kontrata sa `deployment` at bago ang `from` para maging validator sa simula ng PoS. Ia-update ng bawat validator ang sarili nitong validator set ayon sa set sa staking na kontrata sa simula ng PoS.

Para malaman ang higit pa tungkol sa Stake, bisitahin ang **[set up at gamitin ang Proof of Stake](/docs/edge/consensus/pos-stake-unstake)**.
:::

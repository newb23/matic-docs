---
id: pos-stake-unstake
title: I-set up at gamitin ang Proof of Stake (PoS)
description: "Pag-stake, pag-unstake, at iba pang tagubilin na nauugnay sa pag-stake."
keywords:
  - docs
  - polygon
  - edge
  - stake
  - unstake
  - validator
  - epoch
---

## Pangkalahatang-ideya {#overview}

Tinatalakay nang detalyado sa gabay na ito kung paano mag-set up ng Proof of Stake network gamit ang Polygon Edge, paano mag-stake ng mga pondo para sa mga node
para maging mga validator at kung paano mag-unstake ng mga pondo.

**Lubhang hinihikayat** itong magbasa at dumaan [Lokal na Pag-set Up](/docs/edge/get-started/set-up-ibft-locally)
/ [Pag-set Up ng Cloud](/docs/edge/get-started/set-up-ibft-on-the-cloud) bago magpatuloy
sa gabay na ito sa PoS. Naka-outline sa mga seksyong ito ang mga hakbang na kinakailangan para magsimula ng Proof of Authority (PoA) cluster sa pamamagitan ng
Polygon Edge.

Sa kasalukuyan, walang limitasyon sa bilang ng mga validator na maaaring mag-stake ng mga pondo sa Smart na Kontrata sa Pag-stake.

## Smart na Kontrata sa Pag-stake {#staking-smart-contract}

Ang repo para sa Smart na Kontrata sa Pag-stake ay matatagpuan [dito](https://github.com/0xPolygon/staking-contracts).

Hawak nito ang mga kinakailangang testing script, mga ABI file, at higit sa lahat, ang mismong Smart na Kontrata sa Pag-stake.

## Pag-set up ng N node cluster {#setting-up-an-n-node-cluster}

Ang pag-set up ng network sa pamamagitan ng Polygon Edge ay tinatalakay sa mga seksyong
[Lokal na Pag-set Up](/docs/edge/get-started/set-up-ibft-locally)
/ [Pag-set Up ng Cloud](/docs/edge/get-started/set-up-ibft-on-the-cloud).

Ang **tanging pagkakaiba** ng pag-set up ng PoS cluster at ng PoA cluster ay nasa bahaging pagbuo ng genesis.

**Kapag binubuo ang genesis file para sa PoS cluster, nangangailangan ng karagdagang flag `--pos`**:

```bash
polygon-edge genesis --pos ...
```

## Pagtatakda sa haba ng epoch {#setting-the-length-of-an-epoch}

Ang mga epoch ay detalyadong tinatalakay sa seksyong [Mga Epoch Block](/docs/edge/consensus/pos-concepts#epoch-blocks).

Para itakda ang size ng epoch para sa isang cluster (ayon sa bilang ng mga block), kapag binubuo ang genesis file, may karagdagang flag na
tinutukoy `--epoch-size`:

```bash
polygon-edge genesis --epoch-size 50
```

Ang value na ito na tinutukoy sa genesis file na ang size ng epoch ay `50` block dapat.

Ang default na value para sa size ng epoch (ayon sa bilang ng mga block) ay `100000`.

:::info Pagpapaikli sa epoch

Gaya ng nakasaad sa seksyong [Mga Epoch Block](/docs/edge/consensus/pos-concepts#epoch-blocks),
ang mga epoch block ay ginagamit para i-update ang mga validator set para sa mga node.

Ang default na haba ng epoch ayon sa bilang ng mga block (`100000`) ay maaaring matagal para maisagawa ang mga update sa validator set. Kung isasaalang-alang na nagdadagdag ng mga bagong
block ~2s, aabutin nang ~55.5h ang validator set para sa posibilidad na magbago.

Ang pagtatakda ng mas mababang value para sa haba ng epoch ay makakatulong na matiyak na mas madalas na naa-update ang validator set.

:::

## Paggamit sa mga script ng Smart na Kontrata sa Pag-stake {#using-the-staking-smart-contract-scripts}

### Mga Paunang Kinakailangan {#prerequisites}

Ang repo ng Smart na Kontrata sa Pag-stake ay isang Hardhat na proyekto, na nangangailangan ng NPM.

Para simulan ito nang tama, sa main directory, patakbuhin ang:

```bash
npm install
````

### Pagset-up sa ibinigay na mga helper script {#setting-up-the-provided-helper-scripts}

Ang mga script para sa pakikipag-interaksyon sa na-deploy na Smart na Kontrata sa Pag-stake ay matatagpuan sa
[repo ng Smart na Kontrata sa Pag-stake](https://github.com/0xPolygon/staking-contracts).

Gumawa ng `.env` file na may mga sumusunod na parameter sa lokasyon ng repo ng mga Smart na Kontrata:

```bash
JSONRPC_URL=http://localhost:10002
PRIVATE_KEYS=0x0454f3ec51e7d6971fc345998bb2ba483a8d9d30d46ad890434e6f88ecb97544
STAKING_CONTRACT_ADDRESS=0x0000000000000000000000000000000000001001
BLS_PUBLIC_KEY=0xa..
```

Kung saan ang mga parameter ay:

* **JSONRPC_URL** - ang JSON-RPC endpoint para sa tumatakbong node
* **PRIVATE_KEYS** - mga pribadong key ng staker address.
* **STAKING_CONTRACT_ADDRESS** - ang address ng smart na kontrata sa pag-stake (
default na `0x0000000000000000000000000000000000001001`)
* **BLS_PUBLIC_KEY** - BLS public key ng staker. Kinakailangan lang kung tumatakbo ang network sa BLS

### Pag-stake ng mga pondo {#staking-funds}

:::info Address sa pag-stake

Ang Smart na Kontrata sa Pag-stake ay paunang naka-deploy sa
address na `0x0000000000000000000000000000000000001001`.

Ang anumang uri ng pakikipag-interaksyon sa mekanismo sa pag-stake ay isinasagawa sa pamamagitan ng Smart na Kontrata sa Pag-stake sa tinutukoy na address.

Para malaman ang higit pa tungkol sa Smart na Kontrata sa Pag-stake, pumunta sa
ang **[Staking Smart Contract](/docs/edge/consensus/pos-concepts#contract-pre-deployment)** .

:::

Para maging bahagi ng validator set, kinakailangan ng address na mag-stake ng partikular na halaga ng mga pondo na lampas sa threshold.

Sa kasalukuyan, ang default na threshold para maging bahagi ng validator set ay `1 ETH`.

Masisimulan ang pag-stake sa pamamagitan ng pagtawag sa paraang `stake` ng Smart na Kontrata sa Pag-stake at pagtukoy ng value na `>= 1 ETH`.

Pagkatapos ma-set up ang `.env` file na binanggit sa
[nakaraang seksyon](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts), at
nakapagsimula na ng chain sa PoS mode, maisasagawa ang pag-stake sa pamamagitan ng sumusunod na command sa repo ng Smart na Kontrata sa Pag-stake:

```bash
npm run stake
```

Ang script ng Hardhat na `stake` ay nagi-stake ng default na halaga na `1 ETH`, na maaaring baguhin sa pamamagitan ng pagmodipika sa `scripts/stake.ts`
file.

Kung ang mga pondo na ini-stake ay `>= 1 ETH`, ina-update ang validator set sa Smart na Kontrata sa Pag-stake, at ang address
ay magiging bahagi ng validator set na nagsisimula sa susunod na epoch.

:::info Pagpaparehistro ng mga key ng BLS

Kung ang network ay tumatakbo sa BLS mode, para maging mga validator ang mga node, kailangang iparehistro ng mga ito ang kanilang BLS public keys pagkatapos ng pag-stake

Magagawa ito sa pamamagitan ng sumusunod na command:

```bash
npm run register-blskey
```
:::

### Pag-unstake ng mga pondo {#unstaking-funds}

Ang mga address na may stake ay maaari **lang mag-unstake ng lahat ng pondo ng mga ito** nang sabay-sabay.

Pagkatapos ma-set up ang `.env` file na binanggit sa
[nakaraang seksyon](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts),
at nakapagsimula na ng chain sa PoS mode, maisasagawa ang pag-unstake sa pamamagitan ng sumusunod na command sa
repo ng Smart na Kontrata sa Pag-stake:

```bash
npm run unstake
```

### Pag-fetch sa listahan ng mga staker {#fetching-the-list-of-stakers}

Ang lahat ng address na nagi-stake ng mga pondo ay sine-save sa Smart na Kontrata sa Pag-stake.

Pagkatapos ma-set up ang `.env` file na binanggit sa
[nakaraang seksyon](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts),
at nakapagsimula na ng chain sa PoS mode, maisasagawa ang pag-fetch sa listahan ng mga validator sa pamamagitan ng
sumusunod na command sa repo ng Smart na Kontrata sa Pag-stake:

```bash
npm run info
```

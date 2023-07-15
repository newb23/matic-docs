---
id: pos-concepts
title: Proof of Stake
description: "Paliwanag at mga tagubilin tungkol sa Proof of Stake."
keywords:
  - docs
  - polygon
  - edge
  - PoS
  - stake
---

## Pangkalahatang-ideya {#overview}

Nilalayon ng seksyong ito na magbigay ng mas mahusay na pangkalahatang-ideya ng ilang konseptong kasalukuyang umiiral sa Proof of Stake (PoS)
na implementasyon ng Polygon Edge.

Ang implementasyon ng Proof of Stake (PoS) ng Polygon Edge ay naglalayong maging alternatibo sa umiiral na implementasyon ng PoA ng IBFT,
na nagbibigay sa mga operator ng node ng kakayahang madaling mamili sa pagitan ng dalawa kapag nagsisimula ng chain.

## Mga Feature ng PoS {#pos-features}

Ang core logic sa likod ng implementasyon ng Proof of Stake ay nasa
ang **[Staking Smart Contract](https://github.com/0xPolygon/staking-contracts/blob/main/contracts/Staking.sol)**.

Paunang dine-deploy ang kontratang ito sa tuwing nagsisimula ng chain ng Polygon Edge ng mekanismo ng PoS at available ito sa address
`0x0000000000000000000000000000000000001001` mula sa block na `0`.

### Mga Epoch {#epochs}

Ang mga Epoch ay isang konseptong ipinakilala kasama ng pagdadagdag ng PoS sa Polygon Edge.

Ang mga Epoch ay itinuturing na espesyal na time frame (ayon sa mga block) kung saan makakabuo ng mga block ang isang partikular na hanay ng mga validator.
Nababago ang haba ng mga ito, ibig sabihin, maaaring i-configure ng mga operator ng node ang haba ng epoch sa panahon ng pagbuo ng genesis.

Sa katapusan ng bawat epoch, nabubuo ang isang _epoch block_, at pagkatapos ng event iyon, magsisimula ang isang bagong epoch. Para malaman ang higit pa tungkol sa
mga epoch block, tingnan ang seksyong [Mga Epoch Block](/docs/edge/consensus/pos-concepts#epoch-blocks).

Ina-update ang mga validator set sa katapusan ng bawat epoch. Kinu-query ng mga node ang validator set mula sa Smart na Kontrata sa Pag-stake
sa panahon ng paggawa ng epoch block, at sine-save nito sa lokal na storage ang nakuhang data. Ang cycle na ito ng pag-query at pag-save ay
inuulit sa katapusan ng bawat epoch.

Sa pangkalahatan, tinitiyak nito na ang Smart na Kontrata sa Pagstake ay may ganap na kontrol sa mga address sa validator set, at
nagbibigay ito sa mga node ng 1 responsibilidad lang - na i-query ang kontrata nang isang beses sa panahon ng epoch para sa pag-fetch sa pinakabagong
impormasyon ng validator set. Inaalis nito ang responsibilidad sa mga indibidwal na node mula sa pangangasiwa ng mga validator set.

### Pag-stake {#staking}

Ang mga address ay maaaring mag-stake ng mga pondo sa Smart na Kontrata sa Pag-stake sa pamamagitan ng pag-invoke sa paraang `stake` at sa pamamagitan ng pagtukoy sa value para sa
na-stake na halaga sa transaksyon:

````js
const StakingContractFactory = await ethers.getContractFactory("Staking");
let stakingContract = await StakingContractFactory.attach(STAKING_CONTRACT_ADDRESS)
as
Staking;
stakingContract = stakingContract.connect(account);

const tx = await stakingContract.stake({value: STAKE_AMOUNT})
````

Sa pamamagitan ng pag-stake ng mga pondo sa Smart na Kontrata sa Pag-stake, magagawa ng mga address na pumasok sa validator set at bilang resulta, magagawa ng mga ito na lumahok sa
proseso ng produksyon ng block.

:::info Threshold para sa pag-stake

Sa kasalukuyan, ang minimum na threshold para sa pagpasok sa validator set ay pag-stake sa `1 ETH`

:::

### Pag-unstake {#unstaking}

Ang mga address na nag-stake ng mga pondo ay sabay-sabay lang **na makakapag-unstake ng lahat ng mga na-stake na pondo nito**.

Mai-invoke ang pag-unstake sa pamamagitan ng pag-call sa paraang `unstake` sa  Smart na Kontrata sa Pag-stake:

````js
const StakingContractFactory = await ethers.getContractFactory("Staking");
let stakingContract = await StakingContractFactory.attach(STAKING_CONTRACT_ADDRESS)
as
Staking;
stakingContract = stakingContract.connect(account);

const tx = await stakingContract.unstake()
````

Pagkatapos i-unstake ang mga pondo ng mga ito, inaalis ang mga address sa validator set sa  Smart na Kontrata sa Pag-stake, at hindi
ituturing na mga validator ang mga ito sa susunod na epoch.

## Mga Epoch Block {#epoch-blocks}

Ang **Mga Epoch Block** ay isang konseptong ipinakilala sa pagpapatupad ng PoS ng IBFT sa Polygon Edge.

Sa pangkalahatan, ang mga epoch block ay mga espesyal na block na hindi naglalaman ng **mga transaksyon** at nagaganap lang sa **katapusan ng epoch**.
Halimbawa, kung nakatakda ang **laki** ng epoch sa mga `50``50`bloke, ituturing na mga block ng epoch ang mga bloke na ito , `100``150`at iba pa.

Ginagamit ang mga ito para magsagawa ng mga karagdagang logic na hindi dapat mangyari sa produksyon ng regular na block.

Higit sa lahat, indikasyon ang mga ito sa node na **kinakailangan nitong i-fetch ang pinakabagong impormasyon ng validator set**
mula sa  Smart na Kontrata sa Pag-stake.

Pagkatapos i-update ang validator set sa epoch block, ang validator set (nagbago man o hindi)
ay ginagamit para sa mga kasunod na `epochSize - 1` block, hanggang sa ma-update ulit ito sa pamamagitan ng pagkuha sa pinakabagong impormasyon mula sa
Smart na Kontrata sa Pag-stake.

Nababago ang mga haba ng epoch (ayon sa bilang ng mga block) kapag binubuo ang genesis file, sa pamamagitan ng paggamit ng espesyal na flag na `--epoch-size`:

```bash
polygon-edge genesis --epoch-size 50 ...
```

Ang default na size ng isang epoch ay `100000` block sa Polygon Edge.

## Paunang pag-deploy ng kontrata {#contract-pre-deployment}

_Paunang dine-deploy_ ng Polygon Edge ang
seksyong [ Smart na Kontrata sa Pag-stake](https://github.com/0xPolygon/staking-contracts/blob/main/contracts/Staking.sol)
sa panahon ng **pagbuo ng genesis** sa address na `0x0000000000000000000000000000000000001001`.

Isinasagawa nito ito nang hindi nagpapatakbo ng EVM, sa pamamagitan ng direktang pagbabago sa state ng blockchain ng Smart na Kontrata, gamit ang na-pass in
na mga value ng configuration sa command ng genesis.

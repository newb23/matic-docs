---
id: validators
title: FAQ ng mga Validator
description: "FAQ para sa mga Polygon Edge validator"
keywords:
  - docs
  - polygon
  - edge
  - FAQ
  - validators

---

## Paano magdagdag/mag-alis ng isang validator? {#how-to-add-remove-a-validator}

### PoA {#poa}
Ang pagdadagdag/pag-aalis ng mga validator ay ginagawa sa pamamagitan ng pagboto. Makikita mo [rito](/docs/edge/consensus/poa) ang buong gabay tungkol dito.

### PoS {#pos}
Maaari mong makita ang gabay kung paano i-stake ang mga pondo [rito](/docs/edge/consensus/pos-stake-unstake), para maging validator ang isang node, at kung paano mag-unstake (alisin ang validator).

Mangyaring tandaan:
- Maaari mong gamitin ang genesis flag `--max-validator-count` para itakda ang maximum na bilang ng mga staker na maaaring sumali sa validator set.
- Maaari mong gamitin ang genesis flag `--min-validator-count ` para itakda ang minimum na bilang ng mga staker na kinakailangang sumali sa validator set (`1` bilang default).
- Kapag ang maximum na bilang ng validator ay naabot na, hindi ka na maaaring makapagdagdag ng isa pang validator hanggang alisin mo ang isang umiiral mula sa set (hindi mahalaga kung ang staked amount ng bago ay mas mataas). Kung nag-alis ka ng isa ng validator, ang bilang ng mga validator na natitira ay hindi maaaring bumaba sa `--min-validator-count`.
- Mayroong default na threshold ng `1` na unit ng native network(gas) currency para maging isang validator.



## Gaano karaming disk space ang inirerekomenda para sa isang validator? {#how-much-disk-space-is-recommended-for-a-validator}

Inirerekomenda naming magsimula sa 100G bilang isang maingat na tinatayang runway, at tiyaking posible na i-scale ang disk pagkatapos.


## Mayroon bang limitasyon sa bilang ng mga validator? {#is-there-a-limit-to-the-number-of-validators}

Kung tungkol sa mga teknikal na limitasyon, walang takdang limitasyon ang Polygon Edge sa bilang ng mga node na maaari mong taglayin sa isang network. Maaari kang magtakda ng mga limitasyon ng koneksyon (bilang ng inbound / outbound na koneksyon) sa isang per-node na batayan.

Kung tungkol sa mga praktikal na limitasyon, makikita mo ang isang mas pinababang performance na may 100 node cluster kaysa sa 10 node cluster. Sa pamamagitan ng pagtaas ng bilang ng mga node sa iyong cluster, pinataas mo ang complexity ng komunikasyon at ng pangkalahatang networking overhead. Nakadepende ang lahat ng ito sa kung anong uri ng network ang pinapatakbo mo, at kung anong uri ng network topology ang mayroon ka.

## Paano lumipat mula PoA patungong PoS? {#how-to-switch-from-poa-to-pos}

Ang PoA ay ang default na consensus mechanism. Para sa isang bagong cluster, para lumipat patungong PoS, kakailanganin mong dagdagan ang `--pos` flag kapag bumubuo ng genesis file. Kung mayroon kang tumatakbong cluster, makikita mo [rito](/docs/edge/consensus/migration-to-pos) kung paano gawin ang paglipat. Ang lahat ng impormasyon na kailangan mo tungkol sa aming consensus mechanism at pag-setup ay maaaring matagpuan sa aming [consensus na seksyon](/docs/edge/consensus/poa).

## Paano ko i-update ang mga node ko kapag may breaking change? {#how-do-i-update-my-nodes-when-there-s-a-breaking-change}

Maaari mong mahanap ang detalyadong gabay kung paano gawin ang pamamaraang ito [dito](/docs/edge/validator-hosting#update).

## Maaari bang ma-configure ang minimum na staking amount para sa PoS Edge? {#is-the-minimum-staking-amount-configurable-for-pos-edge}

Ang minimum na staking amount bilang default ay `1 ETH`, at hindi ito maaaring ma-configure.

## Bakit ang mga JSON RPC command ay `eth_getBlockByNumber` at `eth_getBlockByHash` hindi nagbabalik sa address ng miner? {#not-return-the-miner-s-address}

Ang concensus na kasalukuyang ginagamit sa Polygon Edge ay ang IBFT 2.0, na sa kalaunan ay nabubuo sa mekanismo ng pagboto na ipinaliwanag sa Clique PoA: [ethereum/EIPs#225](https://github.com/ethereum/EIPs/issues/225).

Sa pagsuri sa EIP-225 (Clique PoA), ito ang kaugnay na bahagi na nagpapaliwanag kung ano ang gamit sa `miner` (aka `beneficiary`):

<blockquote>
Ginamit namin muli ang mga field ng ethash header tulad ng mga sumusunod:
<ul>
<li><b>benepisyaryo / miner:</b> Address na ipanukala ang pag-modify sa listahan ng mga awtorisadong tagapaglagda.</li>
<ul>
<li>Dapat normal na mapuno ng mga zero, mababago lamang habang bumoboto.</li>
<li>Ang mga arbitraryong halaga ay pinapayagan naman (kahit ang mga walang kabuluhan tulad ng pagboto sa mga hindi tagapaglagda) para maiwasan ang labis na complexity sa mga implementasyon sa paligid ng mga mechanics sa pagboto.</li>
<li> Dapat mapuno ng mga zeroes sa checkpoint (ibig sabihin, epoch transition) na mga block.</li>
</ul>

</ul>

</blockquote>

Sa gayon, ang `miner` na field ay ginagamit para sa pag-propose ng isang boto para sa isang tiyak na address, hindi para ipakita ang proposer ng block.

Ang impormasyon tungkol sa proposer ng block ay maaaring matagpuan sa pamamagitan ng pagbawi sa pubkey mula sa Seal field ng RLP encoded Istanbul extra data field sa mga block header.

## Aling mga bahagi at halaga ng Genesis ang ligtas na mababago? {#which-parts-and-values-of-genesis-can-safely-be-modified}

:::caution

Please na lumikha ng manu-manong kopya ng umiiral na genesis.json file bago subukang i-edit ito. Gayundin, kailangang tumigil ang buong chain bago i-edit ang genesis.json file. Kapag nabago ang genesis file, kailangan nitong ipamahagi ang mas bagong bersyon nito sa lahat ng non-validator at valdiator node.

:::

**Tanging ang seksyon ng bootnode ng genesis file** ay ligtas na mababago, kung saan maaari kang magdagdag o mag-alis ng mga bootnode mula sa listahan.
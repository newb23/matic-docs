---
id: definitions
title: Mga Pangkalahatang Kahulugan
description: Mga Pangkalahatang Kahulugan para sa mga terminong ginamit sa chainBridge
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---


## Relayer {#relayer}
Isang relayer na uri ng bridge ang Chainbridge. Ang tungkulin ng isang relayer ay bumoto para sa pagpapatupad ng kahilingan (kung ilang token ang gagastusin/ilalabas, halimbawa). Sinusubaybayan nito ang mga kaganapan mula sa bawat chain, at bumuboto para sa isang panukala sa Bridge contract ng destination chain kapag nakatanggap ito ng `Deposit`event mula sa isang chain. Tumatawag ng paraan sa Bridge contract ang isang relayer para maisagawa ang panukala pagkatapos maisumite ang kailangang bilang ng mga boto. Itinatalaga ng bridge ang pagpapatupad sa Handler contract.


## Mga uri ng mga kontrata {#types-of-contracts}
Sa ChainBridge, may tatlong uri ng kontrata sa bawat chain, na tinatawag na Bridge/Handler/Target.

| **Uri** | **Paglalarawan** |
|----------|-------------------------------------------------------------------------------------------------------------------------------|
| Bridge contract | Isang Bridge contract na namamahala sa mga kahilingan, boto, at pagpapatupad na kailangang i-deploy sa bawat chain. Tatawag ang mga user`deposit` sa Bridge para simulan ang paglipat, at itatalaga ni Bridge ang proseso sa Handler contract na naaayon sa Target contract. Kapag naging matagumpay ang Handler contract sa pagtawag sa Target contract, maglalabas ang Bridge contract ng `Deposit`na kaganapan para abisuhan ang mga relayer. |
| Handler contract | Nakikipag-ugnayan ang kontrata na ito sa Target contract para magsagawa ng deposito o panukala. Pinapatunayan nito ang kahilingan ng user, tinatawagan ang Target contract at tumutulong sa ilang setting para sa Target contract. May ilang partikular na Handler contract para tawagan ang bawat Target contract na may ibang interface. Nagiging bridge ang mga hindi direktang tawag ng Handler contract para i-enable ang paglipat ng anumang uri ng mga asset o data. Sa kasalukuyan, mayroong tatlong uri ng mga Handler contract na ipinapatupad ng ChainBridge: ERC20Handler, ERC721Handler, at GenericHandler. |
| Target contract | Isang kontrata na namamahala ng mga asset na ipapalit o ang mga mensaheng inililipat sa pagitan ng mga chain. Gagawin ang pakikipag-ugnayan sa kontratang ito mula sa bawat panig ng bridge. |

<div style={{textAlign: 'center'}}>

![Arkitektura ng ChainBridge](/img/edge/chainbridge/architecture.svg) *Arkitektura ng ChainBridge*

</div>

<div style={{textAlign: 'center'}}>

![Workflow ng paglilipat ng token ng ERC20](/img/edge/chainbridge/erc20-workflow.svg) *hal. Workflow ng paglilipat ng token ng ERC20*

</div>

## Mga uri ng mga account {#types-of-accounts}

Pakitiyak na may sapat na mga native token ang mga account para lumikha ng mga transaksyon bago magsimula. Maaari kang magtalaga ng mga premined na balanse sa mga account sa Polygon Edge kapag bumubuo ng genesis block.

| **Uri** | **Paglalarawan** |
|----------|-------------------------------------------------------------------------------------------------------------------------------|
| Admin | Bilang default, bibigyan ng tungkulin ng admin ang account na ito. |
| User | Ang account ng nagpadala/tatanggap na nagpapadala/tumatanggap ng mga asset. Ang account ng nagpapadala ang magbabayad ng mga gas fee kapag inaaprubahan ang mga paglilipat ng token at tumatawag ng deposito sa Bridge contract para simulan ang isang paglipat. |

:::info Ang tungkulin ng admin
Mayroong ilang pagkilos na maaari lang gawin ng account na may tungkulin ng admin. Bilang default, ang deployer ng Bridge contract ang may tungkulin ng admin. Makikita mo sa ibaba kung paano bigyan ng tungkulin ng admin ang ibang account o tanggalin ito.

### Magdagdag ng tungkulin ng admin {#add-admin-role}

Nagdaragdag ng isang admin

```bash
# Grant admin role
$ cb-sol-cli admin add-admin \
  --url [JSON_RPC_URL] \
  --privateKey [PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --admin "[NEW_ACCOUNT_ADDRESS]"
```
### Bawiin ang tungkulin ng admin {#revoke-admin-role}

Nag-aalis ng isang admin

```bash
# Revoke admin role
$ cb-sol-cli admin remove-admin \
  --url [JSON_RPC_URL] \
  --privateKey [PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --admin "[NEW_ACCOUNT_ADDRESS]"
```

## Ang mga operasyon na pinapayagan ng `admin`account ay makikita sa ibaba. {#account-are-as-below}

### Magtakda ng Resource {#set-resource}

Magrehistro ng resource ID na may address ng kontrata para sa isang handler.

```bash
# Register new resource
$ cb-sol-cli bridge register-resource \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --resourceId "[RESOURCE_ID]" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[TARGET_CONTRACT_ADDRESS]"
```

### Gawing nabu-burn/nami-mint ang kontrata {#make-contract-burnable-mintable}

Magtakda ng token contract bilang nami-mint/nabu-burn sa isang handler.

```bash
# Let contract burnable/mintable
$ cb-sol-cli bridge set-burn \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[TARGET_CONTRACT_ADDRESS]"
```

### Kanselahin ang panukala {#cancel-proposal}

Kanselahin ang panukala para sa pagpapatupad

```bash
# Cancel ongoing proposal
$ cb-sol-cli bridge cancel-proposal \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --resourceId "[RESOURCE_ID]" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --chainId "[CHAIN_ID_OF_SOURCE_CHAIN]" \
  --depositNonce "[NONCE]"
```

### I-pause/I-unpause {#pause-unpause}

I-pause pansamantala ang mga pagpapatupad ng deposito, paggawa ng panukala, pagboto, at pagdeposito.

```bash
# Pause
$ cb-sol-cli admin pause \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]"

# Unpause
$ cb-sol-cli admin unpause \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]"
```

### Baguhin ang Fee {#change-fee}

Baguhin ang fee na ibabayad sa Bridge Contract

```bash
# Change fee for execution
$ cb-sol-cli admin set-fee \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --fee [FEE_IN_WEI]
```

### Magdagdag/Mag-alis ng isang relayer {#add-remove-a-relayer}

Magdagdag ng isang account bilang bagong relayer o mag-alis ng isang account mula sa mga relayer

```bash
# Add relayer
$ cb-sol-cli admin add-relayer \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --relayer "[NEW_RELAYER_ADDRESS]"

# Remove relayer
$ cb-sol-cli admin remove-relayer \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --relayer "[RELAYER_ADDRESS]"
```

### Baguhin ang relayer threshold {#change-relayer-threshold}

Baguhin ang bilang ng mga kinakailangang boto para sa pagpapatupad ng panukala

```bash
# Remove relayer
$ cb-sol-cli admin set-threshold \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --threshold [THRESHOLD]
```
:::

## Chain ID {#chain-id}

Isang arbitrary value ang Chainbridge `chainId`na ginagamit sa bridge para makilala ang pagkakaiba ng mga blockchain network, at kailangan itong nasa saklaw ng uint8. Para hindi malito, magkaiba sila ng chain ID ng network. Kailangang maging natatangi ang value na ito, ngunit hindi nito kailangang maging pareho sa ID ng network.

Sa halimbawang ito, itinakda natin ang `99`sa`chainId`, dahil ang chain ID ng Mumbai testnet ay`80001`, na hindi maaaring katawanin ng isang uint8.

## Resource ID {#resource-id}

Isang natatanging 32-bytes value ang resource ID sa cross-chain environment, na nauugnay sa isang tiyak na asset (resource) na inililipat sa pagitan ng mga network.

Ang resource ID ay arbitrary, ngunit bilang kalakaran, kadalasan na naglalaman ng chain ID ang huling byte ng source chain (ang network kung saan nagmula ang asset na ito).

## JSON-RPC URL para sa Polygon PoS {#json-rpc-url-for-polygon-pos}

Para sa gabay na ito, gagamitin natin ang https://rpc-mumbai.matic.today, isang pampublikong JSON-RPC URL na inilaan ng Polygon, na maaaring mayroong mga limit sa trapiko o rate. Gagamitin lang ito para kumonekta sa Polygon Mumbai testnet. Pinapayuhan ka naming kunin ang JSON-RPC URL mo sa pamamagitan ng isang external service tulad ng Infura dahil magpapadala ng maraming katanungan/kahilingan sa JSON-RPC ang pag-deploy ng mga kontrata.

## Mga paraan sa pagproseso ng paglipat ng mga token {#ways-of-processing-the-transfer-of-tokens}
Kapag inililipat ang mga ERC20 token sa pagitan ng mga chain, maaari silang maproseso sa dalawang magkaibang mode:

### Lock/release na mode {#lock-release-mode}
<b>Source chain : </b> Maila-lock ang mga token na ipinapadala mo sa Handler Contract.<br/>
<b>Destination chain:</b> Maa-unlock at maililipat ang kaparehong halaga ng mga token na ipinadala mo sa source chain mula sa Handler contract patungo sa account ng tatanggap sa destination chain.

### Burn/mint mode {#burn-mint-mode}
<b>Source chain:</b> Mabu-burn ang mga token na ipinapadala mo...<br/> <b>Destination chain:</b> Mami-mint sa destination chain at ipapadala sa account ng tatanggap ang kaparehong halaga ng mga token na ipinadala mo at na-burn sa source chain.

Puwede kang gumamit ng iba't ibang mode sa bawat chain. Nangangahulugan ito na maaari mong i-lock ang isang token sa main chain habang nagmi-mint ng isang token sa subchain para ilipat. Halimbawa, maaaring maging makabuluhan na i-lock/pakawalan ang mga token kung kontrolado ang kabuuang supply o mint schedule. Maaaring ma-mint/ma-burn ang mga token kung ang kontrata sa subchain ay kailangang sumunod sa supply sa main chain.

Ang default mode ay lock/release mode. Kung gusto mong gawing nami-mint/nabu-burn ang mga Token, kailangan mong tawagin ang`adminSetBurnable`na method. Kung gusto mong mag-mint ng mga token sa pagpapatupad, kailangan mong bigyan ng `minter`na tungkulin ang ERC20 Handler contract.



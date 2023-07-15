---
id: bls
title: BLS
description: "Paliwanag at mga tagubilin tungkol sa BLS mode."
keywords:
  - docs
  - polygon
  - edge
  - bls
---

## Pangkalahatang-ideya {#overview}

Kilala rin ang BLS bilang Boneh–Lynn–Shacham (BLS)—is isang cryptographic signature scheme na nagpapahintulot sa isang user na i-verify na ang isang signer ay tunay. Ito ay isang signature scheme na maaaring aggregate ng maraming signatures. Sa Polygon Edge, ginagamit ang BLS bilang defaut para makapagbigay ng mas maigting na seguridad sa consensus mode ng IBFT. Magagawa ng BLS na ipagsama-sama ang mga signature sa iisang byte array at bawasan ang size ng block header. Maaaring pumili ang bawat chain kung gagamitin ang BLS o hindi. Ginagamit ang ECDSA key naka-enable man o hindi ang BLS mode.

## Video presentation {#video-presentation}

[![bls - video](https://img.youtube.com/vi/HbUmZpALlqo/0.jpg)](https://www.youtube.com/watch?v=HbUmZpALlqo)

## Paano mag-set up ng bagong chain gamit ang BLS {#how-to-setup-a-new-chain-using-bls}

Sumangguni sa mga seksyong [Lokal na Pag-set Up](/docs/edge/get-started/set-up-ibft-locally) / [Pag-set Up sa Cloud](/docs/edge/get-started/set-up-ibft-on-the-cloud) para sa detalyadong mga tagubilin sa pag-set up.

## Paano mag-migrate mula sa umiiral na ECDSA PoA chain patungo sa BLS PoA chain {#how-to-migrate-from-an-existing-ecdsa-poa-chain-to-bls-poa-chain}

Inilalarawan sa seksyong ito kung paano gamitin ang BLS mode sa umiiral na PoA chain.
kinakailangan ang mga sumusunod na hakbang para ma-enable ang BLS sa PoA chain.

1. Itigil ang lahat ng node
2. Buuin ang mga BLS key para sa mga validator
3. Magdagdag ng setting ng fork sa genesis.json
4. I-restart ang lahat ng node

### 1. Itigil ang lahat ng node {#1-stop-all-nodes}

Wakasan ang lahat ng proseso ng mga validator sa pamamagitan ng pagpindot sa Ctrl + c (Control + c). Mangyaring tandaan ang pinakabagong block height (ang pinakamataas na sequence number sa log ng naka-commit na block).

### 2. Buuin ang BLS key {#2-generate-the-bls-key}

Nakakabuo ng BLS key ang `secrets init` kasama ang `--bls`. Para mapanatili ang kasalukuyang ECDSA at Network key, at makapagdagdag ng bagong BLS key, kailangang naka-disable ang `--ecdsa` at `--network`.

```bash
polygon-edge secrets init --bls --ecdsa=false --network=false

[SECRETS INIT]
Public key (address) = 0x...
BLS Public key       = 0x...
Node ID              = 16...
```

### 3. Magdagdag ng setting ng fork {#3-add-fork-setting}

Ang command na `ibft switch` ay nagdadagdag sa `genesis.json` ng setting ng fork, na nag-e-enable sa BLS sa umiiral na chain.

Para sa mga PoA network, kailangang tukuyin sa command ang mga validator. Gaya ng paraan ng command na `genesis`, magagamit ang `--ibft-validators-prefix-path` flag o `--ibft-validator` flag para tukuyin ang validator.

Tukuyin ang height kung saan nagsisimula ang chain gamit ang BLS sa pamamagitan ng `--from` flag.

```bash
polygon-edge ibft switch --chain ./genesis.json --type PoA --ibft-validator-type bls --ibft-validators-prefix-path test-chain- --from 100
```

### 4. I-restart ang lahat ng node {#4-restart-all-nodes}

I-restart ang lahat ng node sa pamamagitan ng command na `server`. Pagkatapos magawa ang block sa `from` na tinukoy sa naunang hakbang, ine-enable ng chain ang BLS at nagpapakita ito ng mga log gaya ng nasa ibaba:

```bash
2022-09-02T11:45:24.535+0300 [INFO]  polygon.ibft: IBFT validation type switched: old=ecdsa new=bls
```

Ipinapakita rin ng mga log kung aling mode ng pag-verify ang ginamit para buuin ang bawat block pagkatapos magawa ang block.

```
2022-09-02T11:45:28.728+0300 [INFO]  polygon.ibft: block committed: number=101 hash=0x5f33aa8cea4e849807ca5e350cb79f603a0d69a39f792e782f48d3ea57ac46ca validation_type=bls validators=3 committed=3
```

## Paano mag-migrate mula sa umiiral na ECDSA PoS chain patungo sa BLS PoS chain {#how-to-migrate-from-an-existing-ecdsa-pos-chain-to-a-bls-pos-chain}

Inilalarawan sa seksyong ito kung paano gamitin ang BLS mode sa umiiral na PoS chain.
Kinakailangan ang mga sumusunod na hakbang para ma-enable ang BLS sa PoS chain.

1. Itigil ang lahat ng node
2. Buuin ang mga BLS key para sa mga validator
3. Magdagdag ng setting ng fork sa genesis.json
4. I-call ang kontrata sa pag-stake para i-register ang Pampublikong Key ng BLS
5. I-restart ang lahat ng node

### 1. Itigil ang lahat ng node {#1-stop-all-nodes-1}

Wakasan ang lahat ng proseso ng mga validator sa pamamagitan ng pagpindot sa Ctrl + c (Control + c). Mangyaring tandaan ang pinakabagong block height (ang pinakamataas na sequence number sa log ng naka-commit na block).

### 2. Buuin ang BLS key {#2-generate-the-bls-key-1}

Nabubuo ang BLS key gamit ang `secrets init` kasama ang `--bls` na flag. Para mapanatili ang kasalukuyang ECDSA at Network key, at makapagdagdag ng bagong BLS key, kailangang naka-disable ang `--ecdsa` at `--network`.

```bash
polygon-edge secrets init --bls --ecdsa=false --network=false

[SECRETS INIT]
Public key (address) = 0x...
BLS Public key       = 0x...
Node ID              = 16...
```

### 3. Magdagdag ng setting ng fork {#3-add-fork-setting-1}

Ang command na `ibft switch` ay nagdadagdag sa `genesis.json` ng setting ng fork, na nag-e-enable sa BLS mula sa gitna ng chain.

Tukuyin ang height kung saan nagsisimula ang chain gamit ang BLS mode sa pamamagitan ng `from` flag, at ang height kung saan ina-update ang kontrata sa pamamagitan ng `development` flag.

```bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --ibft-validator-type bls --deployment 50 --from 200
```

### 4. Irehistro ang Pampublikong Key ng BLS sa staking na kontrata {#4-register-bls-public-key-in-staking-contract}

Pagkatapos maidagdag ang fork at na-restart na ang mga validator, kailangang i-call ng bawat validator ang `registerBLSPublicKey` sa staking na kontrata para irehistro ang Pampublikong Key ng BLS. Kailangan itong gawin pagkatapos ng height na tinukoy sa `--deployment` bago ang height na tinukoy sa `--from`.

Ang script para irehistro ang Pampublikong Key ng BLS ay tinutukoy sa [repo ng Smart na Kontrata sa Pag-stake](https://github.com/0xPolygon/staking-contracts).

Itakda ang `BLS_PUBLIC_KEY` na irerehistro sa `.env` file. Sumangguni sa [pos-stake-unstake](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts) para sa higit pang detalye tungkol sa iba pang parameter.

```env
JSONRPC_URL=http://localhost:10002
STAKING_CONTRACT_ADDRESS=0x0000000000000000000000000000000000001001
PRIVATE_KEYS=0x...
BLS_PUBLIC_KEY=0x...
```

Inirerehistro ng sumusunod na command ang Pampublikong Key ng BLS na ibinigay sa `.env` sa kontrata.

```bash
npm run register-blskey
```

:::warning Kailangang manual na irehistro ng mga validator ang Pampublikong Key ng BLS

Sa BLS mode, ang mga validator ay mayroon dapat pampublikong key ng BLS at sarili nilang address. Binabalewala ng consensus layer ang mga validator na hindi nagrehistro ng pampublikong key ng BLS sa kontrata kapag fine-fetch ng consensus ang impormasyon ng validator mula sa kontrata.

:::

### 5. I-restart ang lahat ng node {#5-restart-all-nodes}

I-restart ang lahat ng node sa pamamagitan ng command na `server`. Ine-enable ng chain ang BLS pagkatapos magawa ang block sa `from` na tinutukoy sa naunang hakbang.

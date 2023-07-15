---
id: set-up-hashicorp-vault
title: I-set up ang Hashicorp Vault
description: "I-set up ang Hashicorp Vault para sa Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - hashicorp
  - vault
  - secrets
  - manager
---

## Pangkalahatang-ideya {#overview}

Sa kasalukuyan, ang Polygon Edge ay may gustong panatilihing 2 pangunahing runtime secret:
* Ang **pribadong key ng validator** na ginagamit ng node, kung validator ang node
* Ang **pribadong key para sa networking** na ginagamit ng libp2p, para sa pakikilahok at pakikipag-ugnayan sa iba pang peer

:::warning

Ang validator private key ay natatangi sa bawat validator node. Ang parehong key ay <b>hindi</b> dapat ibahagi sa lahat ng mga validator, dahil maaari nitong makompromiso ang seguridad ng iyong chain.

:::

Para sa karagdagang impormasyon, pakibasa ang [Gabay sa Pamamahala sa Mga Pribadong Key](/docs/edge/configuration/manage-private-keys)

Ang mga module ng Polygon Edge ay **hindi kailangang malaman kung paano magpanatili ng mga secret**. Sa pangkalahatan, ang isang module ay walang kaugnayan sa kung ang
isang secret ay naka-store sa isang malayong server o kung lokal itong naka-store sa disk ng node.

Ang lahat ng kailangang malaman ng module tungkol sa pagpapanatili ng secret ay ang **alamin kung paano gamitin ang secret** at **alamin kung aling mga secret ang kukunin
o ise-save**. Ang mga mas pinong detalye ng pagpapatupad ng mga operasyong ito ay itinakda sa `SecretsManager`, na siyempre ay isang abstraction.

Magagawa na ngayon ng operator ng node na nagsisimula sa Polygon Edge na tukuyin kung aling mga manager ng secret ang gusto nitong gamitin, at sa sandaling
ma-instantiate ang wastong manager ng mga secret, ipinoproseso ng mga module ang mga secret sa pamamagitan ng nabanggit na interface
nang hindi isinasaalang-alang kung ang mga secret ay naka-store sa isang disk o server.

Idinedetalye sa artikulong ito ang mga kinakailangang hakbang para mapatakbo ang Polygon Edge gamit ang [Hashicorp Vault](https://www.vaultproject.io/) server.

:::info mga nakaraang gabay

**Mariing inirerekomenda** na bago basahin ang artikulong ito, nabasa na dapat ang mga artikulo tungkol sa [**Lokal na Pag-Setup**](/docs/edge/get-started/set-up-ibft-locally)
at [**Pag-Setup sa Cloud**](/docs/edge/get-started/set-up-ibft-on-the-cloud).

:::


## Mga Paunang Kinakailangan {#prerequisites}

Ipinagpapalagay ng artikulong ito na ang isang halimbawang paggana ng Hashicorp Vault server **ay naka-set up na**.

Bukod pa rito, kinakailangan na ang Hashicorp Vault server na ginagamit para sa Polygon Edge ay dapat na may **enabled KV storage**.

Kinakailangang impormasyon bago magpatuloy:
* **Ang URL ng server** (ang API URL ng Hashicorp Vault server)
* **Token** (access token na ginagamit para sa access sa KV storage engine)

## Hakbang 1 - Buuin ang configuration ng manager ng mga secret {#step-1-generate-the-secrets-manager-configuration}

Para magawa ng Polygon Edge na maayos na makipag-ugnayan sa Vault server, kinakailangan nitong mag-parse ng
nabuo nang config file na naglalaman ng kinakailangang impormasyon para sa secret storage sa Vault.

Para mabuo ang configuration, patakbuhin ang sumusunod na command:

```bash
polygon-edge secrets generate --dir <PATH> --token <TOKEN> --server-url <SERVER_URL> --name <NODE_NAME>
```

Mga umiiral na parameter:
* `PATH` ay ang path kung saan dapat i-export ang configuration file. Default na `./secretsManagerConfig.json`
* `TOKEN` ay ang access token na dati nang binabanggit sa [seksyon ng mga paunang kinakailangan](/docs/edge/configuration/secret-managers/set-up-hashicorp-vault#prerequisites)
* `SERVER_URL` ay ang URL ng API para sa Vault server, na binabanggit din sa [seksyon ng mga paunang kinakailangan](/docs/edge/configuration/secret-managers/set-up-hashicorp-vault#prerequisites)
* `NODE_NAME` ay ang pangalan ng kasalukuyang node kung saan sine-set up ang Vault configuration. Maaari itong maging arbitrary na value. Default na `polygon-edge-node`

:::caution Mga pangalan ng node

Mag-ingat kapag tinutukoy ang mga pangalan ng node.

Ginagamit ng Polygon Edge ang tinukoy na pangalan ng node para subaybayan ang mga secret storage na binubuo at ginagamit nito sa Vault instance.
Ang pagtukoy sa umiiral na pangalan ng node ay maaaring magkaroon ng mga kahihinatnan na maging overwritten ang data sa Vault server.

Ini-store ang mga secret sa sumusunod na base path: `secrets/node_name`

:::

## Hakbang 2 - Simulan ang mga secret key gamit ang configuration {#step-2-initialize-secret-keys-using-the-configuration}

Ngayong mayroon nang configuration file, maaari nating simulan ang mga kinakailangang secret key sa pamamagitan ng pag-set up ng configuration
file sa hakbang 1, gamit ang `--config`:

```bash
polygon-edge secrets init --config <PATH>
```

Ang `PATH` param ay ang lokasyon ng naunang nabuong param ng manager ng mga secret mula sa hakbang 1.

## Hakbang 3 - Buuin ang genesis file {#step-3-generate-the-genesis-file}

Dapat buuin ang genesis file gaya ng nakasaad sa mga gabay sa [**Lokal na Pag-Setup**](/docs/edge/get-started/set-up-ibft-locally)
at [**Pag-set Up sa Cloud**](/docs/edge/get-started/set-up-ibft-on-the-cloud), na may kaunting pagbabago.

Dahil ginagamit ang Hashicorp Vault sa halip na ang local file system, dapat idagdag ang mga address ng validator sa pamamagitan ng `--ibft-validator` flag:
```bash
polygon-edge genesis --ibft-validator <VALIDATOR_ADDRESS> ...
```

## Hakbang 4: Simulan ang Polygon Edge client {#step-4-start-the-polygon-edge-client}

Ngayon naka-set up na ang mga key, at nabuo na ang genesis file, ang huling hakbang sa prosesong ito ay simulan ang
Polygon Edge sa pamamagitan ng command na `server`.

Ginagamit ang command na `server` sa katulad na paraan gaya ng nakasaad sa mga naunang nabanggit na gabay, na may kaunting idinagdag - ang `--secrets-config` flag:
```bash
polygon-edge server --secrets-config <PATH> ...
```

Ang `PATH` param ay ang lokasyon ng naunang nabuong param ng manager ng mga secret mula sa hakbang 1.
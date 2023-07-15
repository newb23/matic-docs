---
id: set-up-gcp-secrets-manager
title: Mag-set up ng GCP Secrets Manager
description: "Mag-set up ng GCP Secrets Manager para sa Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - gcp
  - secrets
  - manager
---

## Pangkalahatang-ideya {#overview}

Sa kasalukuyan, ang Polygon Edge ay may gustong panatilihing 2 pangunahing runtime secret:
* Ang **pribadong key ng validator** na ginagamit ng node, kung validator ang node
* Ang **pribadong key para sa networking** na ginagamit ng libp2p, para sa pakikilahok at pakikipag-ugnayan sa iba pang peer

Para sa karagdagang impormasyon, pakibasa ang [Gabay sa Pamamahala sa Mga Pribadong Key](/docs/edge/configuration/manage-private-keys)

Ang mga module ng Polygon Edge ay **hindi kailangang malaman kung paano magpanatili ng mga secret**. Sa pangkalahatan, ang isang module ay walang kaugnayan sa kung ang
isang secret ay naka-store sa isang malayong server o kung lokal itong naka-store sa disk ng node.

Ang lahat ng kailangang malaman ng module tungkol sa pagpapanatili ng secret ay ang **alamin kung paano gamitin ang secret** at **alamin kung aling mga secret ang kukunin
o ise-save**. Ang mga mas pinong detalye ng pagpapatupad ng mga operasyong ito ay itinakda sa `SecretsManager`, na siyempre ay isang abstraction.

Magagawa na ngayon ng operator ng node na nagsisimula sa Polygon Edge na tukuyin kung aling mga manager ng secret ang gusto nitong gamitin, at sa sandaling
ma-instantiate ang wastong manager ng mga secret, ipinoproseso ng mga module ang mga secret sa pamamagitan ng nabanggit na interface
nang hindi isinasaalang-alang kung ang mga secret ay naka-store sa isang disk o server.

Idinedetalye sa artikulong ito ang mga kinakailangang hakbang para mapatakbo ang Polygon Edge gamit ang [GCP Secret Manager](https://cloud.google.com/secret-manager).

:::info mga nakaraang gabay

**Mariing inirerekomenda** na bago basahin ang artikulong ito, nabasa na dapat ang mga artikulo tungkol sa [**Lokal na Pag-Setup**](/docs/edge/get-started/set-up-ibft-locally)
at [**Pag-Setup sa Cloud**](/docs/edge/get-started/set-up-ibft-on-the-cloud).

:::


## Mga Paunang Kinakailangan {#prerequisites}
### GCP Billing Account {#gcp-billing-account}
Para magamit ang GCP Secrets Manager, kailangan ng user ng naka-enable na [Billing Account](https://console.cloud.google.com/) sa GCP portal.
Ang mga bagong Google account sa GCP platform ay inilaan nang may ilang mga pondo para makapagsimula, bilang hari ng free trial.
Higit na impormasyon sa [mga dokumentong GCP](https://cloud.google.com/free)

### Secrets Manager API {#secrets-manager-api}
Kakailanganin ng user na i-enable ang GCP Secrets Manager API bago niya ito magamit. Magagawa ito sa pamamagitan ng [Secrets Manager API portal](https://console.cloud.google.com/apis/library/secretmanager.googleapis.com).
Higit na impormasyon: [Pag-configure ng Secret Manger](https://cloud.google.com/secret-manager/docs/configuring-secret-manager)

### GCP Credentials {#gcp-credentials}
Panghuli, kailangan ng user na bumuo ng mga bagong credential na gagamitin para sa authentication.
Magagawa ito sa pamamagitan ng pagsunod sa mga instruksyon na naka-post [dito](https://cloud.google.com/secret-manager/docs/reference/libraries).   
Ang nabuong json file na naglalaman ng mga credential, ay dapat ilipat sa bawat node na kailangang gumamit ng GCP Secrets Manager.

Kinakailangang impormasyon bago magpatuloy:
* **Project ID** (ang project id na tinukoy sa GCP platform)
* **Credentials File Location** (ang path patungo sa json file na naglalaman ng mga credential)

## Hakbang 1 - Buuin ang configuration ng manager ng mga secret {#step-1-generate-the-secrets-manager-configuration}

Para magawa ng Polygon Edge na maayos na makipag-ugnayan sa GCP SM, kinakailangan nitong mag-parse ng
nabuo nang config file na naglalaman ng kinakailangang impormasyon para sa secret storage sa GCP SM.

Para mabuo ang configuration, patakbuhin ang sumusunod na command:

```bash
polygon-edge secrets generate --type gcp-ssm --dir <PATH> --name <NODE_NAME> --extra project-id=<PROJECT_ID>,gcp-ssm-cred=<GCP_CREDS_FILE>
```

Mga umiiral na parameter:
* `PATH` ay ang path kung saan dapat i-export ang configuration file. Default na `./secretsManagerConfig.json`
* `NODE_NAME` ay ang pangalan ng kasalukuyang node kung saan naka-set up ang GCP SM configuration. Maaari itong maging arbitrary na value. Default na `polygon-edge-node`
* `PROJECT_ID` ay ang ID ng proyekto na tinukoy ng user sa GCP console account sa panahon ng pag-set up ng account at pag-activate ng Secrets Manager API.
* `GCP_CREDS_FILE` ay ang path patungo sa json file na naglalaman ng mga credentials na magpapahintulot sa read/write na access sa Secrets Manager.

:::caution Mga pangalan ng node

Mag-ingat kapag tinutukoy ang mga pangalan ng node.

Ginagamit ng Polygon Edge ang tinukoy na pangalan ng node para subaybayan ang mga secret na binubuo at ginagamit nito sa GCP SM.
Ang pagtukoy sa isang umiiral na pangalan ng node ay maaaring magkaroon ng mga kahihinatnan ng pagpalya ng pag-write ng secret sa GCP SM.

Ini-store ang mga secret sa sumusunod na base path: `projects/PROJECT_ID/NODE_NAME`

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

Dahil ginagamit ang GCP SM sa halip na ang local file system, dapat idagdag ang mga address ng validator sa pamamagitan ng `--ibft-validator` flag:
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
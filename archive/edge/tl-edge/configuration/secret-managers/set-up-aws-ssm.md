---
id: set-up-aws-ssm
title: I-set up ang AWS SSM (Systems Manager)
description: "I-set up ang AWS SSM (Systems Manager) para sa Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - aws
  - ssm
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

Idinedetalye sa artikulong ito ang mga kinakailangang hakbang para mapatakbo ang Polygon Edge sa
[AWS Systems Manager Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html).

:::info mga nakaraang gabay

**Mariing inirerekomenda** na bago basahin ang artikulong ito, nabasa na dapat ang mga artikulo tungkol sa [**Lokal na Pag-Setup**](/docs/edge/get-started/set-up-ibft-locally)
at [**Pag-Setup sa Cloud**](/docs/edge/get-started/set-up-ibft-on-the-cloud).

:::


## Mga paunang kinakailangan {#prerequisites}
### IAM Policy {#iam-policy}
Kinakailangan ng user na gumawa ng IAM Policy na pinapayagan ang mga read/write na operasyon para sa AWS Systems Manager Parameter Store.
Pagkatapos matagumpay na magawa ang IAM Policy, kinakailangan ng user na ilakip ito sa EC2 instance na tumatakbo sa server ng Polygon Edge.
Parang ganito dapat ang hitsura ng IAM Policy:
```json
{
  "Version": "2012-10-17",
  "Statement" : [
    {
      "Effect" : "Allow",
      "Action" : [
        "ssm:PutParameter",
        "ssm:DeleteParameter",
        "ssm:GetParameter"
      ],
      "Resource" : [
        "arn:aws:ssm:<aws_region>:<aws_account_id>:parameter<ssm-parameter-path>*"
      ]
    }
  ]
}
```
Mayroon kang mahahanap na higit pang impormasyon tungkol sa AWS SSM IAM Roles sa [mga dokumento ng AWS](https://docs.aws.amazon.com/systems-manager/latest/userguide/setup-instance-profile.html).

Kinakailangang impormasyon bago magpatuloy:
* **Region** (ang region na kinaroroonan ng Systems Manager at mga node)
* **Parameter Path** (arbitrary path kung saan ilalagay ang secret, halimbawa `/polygon-edge/nodes`)

## Hakbang 1 - Buuin ang configuration ng manager ng mga secret {#step-1-generate-the-secrets-manager-configuration}

Para magawa ng Polygon Edge na maayos na makipag-ugnayan sa AWS SSM, kinakailangan nitong mag-parse ng
nabuo nang config file na naglalaman ng kinakailangang impormasyon para sa secret storage sa AWS SSM.

Para mabuo ang configuration, patakbuhin ang sumusunod na command:

```bash
polygon-edge secrets generate --type aws-ssm --dir <PATH> --name <NODE_NAME> --extra region=<REGION>,ssm-parameter-path=<SSM_PARAM_PATH>
```

Mga umiiral na parameter:
* `PATH` ay ang path kung saan dapat i-export ang configuration file. Default na `./secretsManagerConfig.json`
* `NODE_NAME` ay ang pangalan ng kasalukuyang node na nilalayong node sa pag-set up ng AWS SSM. Maaari itong maging arbitrary na value. Default na `polygon-edge-node`
* `REGION` ay ang region na kinaroroonan ng AWS SSM. Kinakailangan nitong maging region na pareho sa region ng node na gumagamit ng AWS SSM.
* `SSM_PARAM_PATH` ay ang pangalan ng path kung saan i-store ang secret. Halimbawa, kung tinukoy ang `--name node1` at `ssm-parameter-path=/polygon-edge/nodes`
ii-store ang secret bilang `/polygon-edge/nodes/node1/<secret_name>`

:::caution Mga pangalan ng node

Mag-ingat kapag tinutukoy ang mga pangalan ng node.

Ginagamit ng Polygon Edge ang tinukoy na pangalan ng node para subaybayan ang mga secret na binubuo at ginagamit nito sa AWS SSM.
Ang pagtukoy ng pangalan ng umiiral na node ay maaaring magresulta sa pagkabigong maisulat ang secret sa AWS SSM.

Ini-store ang mga secret sa sumusunod na base path: `SSM_PARAM_PATH/NODE_NAME`

:::

## Hakbang 2 - Simulan ang mga secret key gamit ang configuration {#step-2-initialize-secret-keys-using-the-configuration}

Ngayong mayroon nang configuration file, maaari nating simulan ang mga kinakailangang secret key sa pamamagitan ng pag-set up ng configuration
file sa hakbang 1, gamit ang `--config`:

```bash
polygon-edge secrets init --config <PATH>
```

Ang `PATH` param ay ang lokasyon ng naunang nabuong param ng manager ng mga secret mula sa hakbang 1.

:::info IAM Policy

Papalya ang hakbang na ito kung ang IAM Policy na nagbibigay-daan sa mga operasyon sa pagbabasa/pagsusulat ay hindi naka-configure nang maayos at/o hindi naka-attach sa EC2 instance na nagpapatakbo sa command na ito.

:::

## Hakbang 3 - Buuin ang genesis file {#step-3-generate-the-genesis-file}

Dapat buuin ang genesis file gaya ng nakasaad sa mga gabay sa [**Lokal na Pag-Setup**](/docs/edge/get-started/set-up-ibft-locally)
at [**Pag-Setup sa Cloud**](/docs/edge/get-started/set-up-ibft-on-the-cloud), na may kaunting pagbabago.

Dahil ginagamit ang AWS SSM sa halip na ang local file system, dapat idagdag ang mga address ng validator sa pamamagitan ng `--ibft-validator` flag:
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
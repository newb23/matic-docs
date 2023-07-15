---
id: manage-private-keys
title: Pamahalaan ang mga pribadong key
description: "Paano pamahalaan ang mga pribadong key at kung anong mga uri ng mga key ang mayroon."
keywords:
  - docs
  - polygon
  - edge
  - private
  - key
  - keystore
---

## Pangkalahatang-ideya {#overview}

May dalawang uri ng pribadong key ang Polygon Edge na tuwiran nitong pinamamahalaan:

* **Pribadong key na ginagamit para sa consensus mechanism**
* **Pribadong key na ginagamit para sa networking ng libp2p**
* **(Optional) BLS Pribadong key na ginagamit para sa concensus mechanism para pagsama-samahin ang mga pirma ng mga validator**

Sa kasalukuyan, ang Polygon Edge ay hindi nag-aalok ng suporta para sa tuwirang pamamahala ng account.

Batay sa istraktura ng directory na binalangkas sa [Backup & Restore guide](/docs/edge/working-with-node/backup-restore),
ang Polygon Edge ay nag-iimbak ng mga binanggit na key file sa dalawang natatanging directory - **consensus** at **keystore**.

## Format ng key {#key-format}

Ang mga pribadong key ay inimbak sa simpleng **Base64 format**, para mabasa ng tao at portable.

```bash
# Example private key
0802122068a1bdb1c8af5333e58fe586bc0e9fc7aff882da82affb678aef5d9a2b9100c0
```

:::info Uri ng Key

Lahat ng mga pribadong key file na binuo at ginamit sa loob ng Polygon Edge ay umaasa sa ECDSA na may curve na [secp256k1](https://en.bitcoin.it/wiki/Secp256k1).

Dahil ang curve ay non-standard, hindi ito maaaring i-encode at iimbak sa anumang standardized na PEM format.
Ang pag-import ng mga key na hindi sumusunod sa uri ng key na ito ay hindi sinusuportahan.

:::
## Pribadong Key ng Consensus {#consensus-private-key}

Ang pribadong key file na binanggit bilang *pribadong key ng consensus* ay tinutukoy din bilang **pribadong key ng validator**.
Ang pribadong key na ito ay ginagamit kapag ang node ay kumikilos bilang isang validator sa network at kailangang mag-sign ng bagong data.

Ang pribadong key file ay matatagpuan sa `consensus/validator.key`, at sumusunod sa [format ng key](/docs/edge/configuration/manage-private-keys#key-format) na nabanggit.

:::warning

Ang pribadong key ng validator ay natatangi sa bawat validator node. Ang parehong key ay <b>hindi</b> dapat ibahagi sa lahat ng mga validator, dahil maaari nitong makompromiso ang seguridad ng iyong chain.

:::

## Pribadong Key sa Networking {#networking-private-key}

Ang pribadong key file na binanggit para sa networking ay ginagamit ng libp2p para bumuo ng kaukulang PeerID, at pinapahintulutan ang node na lumahok sa network.

Ito ay matatagpuan sa `keystore/libp2p.key`, at sumusunod sa [format ng key](/docs/edge/configuration/manage-private-keys#key-format) na nabanggit.

## BLS Secret Key {#bls-secret-key}

Ang BLS secret key file ay ginagamit para pagsama-samahin ang mga committed seal sa consensus layer. Ang sukat ng pinagsama-samang mga committed seal ng BLS ay mas mababa sa mga serialized committed na ECDSA signature.

Ang BLS feature ay optional at maaaring pumili kung gagamit ng BLS o hindi. Sumangguni sa [BLS](/docs/edge/consensus/bls) para sa higit pang detalye.

## Import / Export {#import-export}

Dahil ang mga key file ay nakaimbak sa simpleng Base64 sa disk, madali ma-back up o ma-import ang mga ito.

:::caution Pagbabago ng mga key file

Anumang uri ng pagbabagong ginawa sa mga key file sa naka-set up / tumatakbo nang network ay maaaring humantong sa malubhang pagkagambala sa network/consensus,
dahil ang consensus at mga peer discovery mechanism ay nag-iimbak ng data na hinango mula sa mga key na ito sa node-specific na storage, at umaasa sa data na ito para
pasimulan ang mga koneksyon at magsagawa ng consensus logic

:::
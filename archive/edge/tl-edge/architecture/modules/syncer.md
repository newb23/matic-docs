---
id: syncer
title: Syncer
description: Paliwanag para sa syncer module ng Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - synchronization
---

## Pangkalahatang-ideya {#overview}

Nilalaman ng module na ito ang logic para sa protokol sa pag-synchronize. Ginagamit ito para sa pag-sync ng bagong node sa tumatakbong network o para sa pag-validate/pagsingit ng mga bagong block para sa mga node na hindi lumalahok sa consensus (mga non-validator).

Ang Polygon Edge ay gumagamit ng **libp2p** bilang layer ng networking, at dagdag dito ay nagpapatakbo rin ito ng **gRPC**.

Mayroong mahahalagang 2 type ng sync sa Polygon Edge:
* Maramihang Pag-sync - pag-sync ng malaking hanay ng mga block nang sabay-sabay
* Watch Sync - pag-sync ng block nang paisa-isa

### Maramihang Pag-sync {#bulk-sync}

Ang mga hakbang para sa Maramihang Pag-sync ay madali lang para matugunan ang layunin ng Maramihang Pag-sync - mag-sync ng maraming block (na available) mula sa ibang peer para makahabol, sa lalong madaling panahon.

Ito ang daloy ng proseso ng Maramihang Pag-sync:

1. ** Tukuyin kung ang node ay kailangang magsagawa ng Maramihang Pag-sync ** - Sa hakbang na ito, tinitingnan ng node ang peer map para makita kung mayroong may mas malaking block number kaysa sa mayroon ang node sa lokal
2. ** Hanapin ang pinakamahusay na peer (gamit ang sync peer map) ** - Sa hakbang na ito, hinahanap ng node ang pinakamahusay na peer kung saan magsi-sync batay sa nabanggit na mga pamantayan sa halimbawa sa itaas.
3. ** Magbukas ng stream ng maramihang pag-sync ** - Sa hakbang na ito, nagbubukas ang node ng stream ng gRPC sa pinakamahusay na peer para maramihang mag-sync ng mga block mula sa karaniwang block number
4. ** Isinasara ng pinakamahusay na peer ang stream kapag tapos nang magpadala nang maramihan ** - Sa hakbang na ito, isasara ng pinakamahusay na peer, kung saan nagsi-sync ang node, ang stream sa sandaling maipadala na nito ang lahat ng available na block na mayroon ito
5. ** Kapag tapos nang maramihang mag-sync, tingnan kung validator ang node ** - Sa hakbang na ito, ang stream ay isinasara ng pinakamahusay na peer, at kailangang tingnan ng node kung validator ang mga ito pagkatapos na maramihang mag-sync.
  * Kung validator ang mga ito, aalis sa sync state ang mga ito at magsisimulang lumahok ang mga ito sa consensus
  * Kung hindi validator ang mga ito, magpapatuloy ang mga ito sa ** Watch Sync **

### Watch Sync {#watch-sync}

:::info

Ang hakbang para sa Watch na Pag-sync ay isinasagawa lang kung ang node ay hindi validator, ngunit isang regular na non-validator node sa network na nakikinig lang ng mga paparating na block.

:::

Ang gawi ng Watch Sync ay diretsahan lang, naka-sync na sa iba pang bahagi ng network ang node at kinakailangan lang nito na i-parse ang mga papasok na bagong block.

Ito ang daloy ng proseso ng Watch Sync:

1. ** Magdagdag ng bagong block kapag na-update ang status ng peer ** - Sa hakbang na ito, ang mga node ay nakikinig ng mga event ng bagong block, kapag mayroon itong bagong block, magpapatakbo ito ng gRPC function call, kukunin nito ang block at ia-update nito ang local state.
2. ** Tingnan kung ang node ay validator pagkatapos i-sync ang pinakabagong block **
   * Kung validator ito, aalis sa sync state
   * Kung hindi ito validator, magpatuloy na makinig ng mga event ng bagong block

## Ulat sa performance {#perfomance-report}

:::info

Sinukat ang performance sa isang local machine sa pamamagitan ng pag-sync ng ** milyong mga block **

:::

| Pangalan | Resulta |
|----------------------|----------------|
| Nagsi-sync ng 1M mga block | ~ 25 minuto |
| Naglilipat ng 1M mga block | ~ 1 minuto |
| Bilang ng mga GRPC call | 2 |
| Sakop ng pagsubok | ~ 93% |
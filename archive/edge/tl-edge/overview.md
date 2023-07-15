---
id: overview
title: Polygon Edge
sidebar_label: What is Edge
description: "Isang introduksyon sa Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - network
  - modular

---

Ang Polygon Edge ay isang modular at napapalawak na framework para sa pagbuo ng Ethereum-compatible na blockchain network, mga sidechain, at mga pangkalahatang solusyong pag-scale.

Ang pangunahing gamit nito ay para i-bootstrap ang isang bagong blockchain network habang naglalaan ng ganap na compatibility gamit ang mga Ethereum na smart na kontrata at transaksyon. Ginagamit nito ang IBFT (Istanbul Byzantine Fault Tolerant) na consensus mechanism, na sinusuportahan sa dalawang paraan [PoA (proof of authority)](/docs/edge/consensus/poa) at [PoS (proof of stake)](/docs/edge/consensus/pos-stake-unstake).

Sinusuportahan din ng Polygon Edge ang komunikasyon sa maraming mga blockchain network, na nagpapahintulot ng paglilipat sa parehong [ERC-20](https://ethereum.org/en/developers/docs/standards/tokens/erc-20) at [ERC-721](https://ethereum.org/en/developers/docs/standards/tokens/erc-721) na mga token, sa pamamagitan ng paggamit sa [centralised bridge solution](/docs/edge/additional-features/chainbridge/overview).

Ang mga industry standard na wallet ay maaaring gamitin para makipag-interaksyon sa Polygon Edge sa pamamagitan ng [JSON-RPC](/docs/edge/working-with-node/query-json-rpc) mga endpoint at maaaring makagawa ang mga node operator ng iba't ibang action sa mga node sa pamamagitan ng [gRPC](/docs/edge/working-with-node/query-operator-info) na protokol.

Para malaman ang higit pa tungkol sa Polygon, bisitahin ang [opisyal na website](https://polygon.technology).

**[GitHub repository](https://github.com/0xPolygon/polygon-edge)**

:::caution

Isa pa lang itong work in progress kaya ang mga pagbabago sa arkitektura ay maaaring mangyari sa hinaharap. Ang code ay hindi pa na-audit
kaya mangyaring makipag-ugnayan sa Polygon team kung gusto mong gamitin ito sa produksyon.

:::



Para makapagsimula ng pagpapatakbo ng isang `polygon-edge` network nang lokal, mangyaring basahin: [Pag-install](/docs/edge/get-started/installation) at [Lokal na Pag-Setup](/docs/edge/get-started/set-up-ibft-locally).

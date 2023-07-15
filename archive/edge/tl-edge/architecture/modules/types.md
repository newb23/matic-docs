---
id: types
title: Mga Type
description: Paliwanag para sa mga type na module ng Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - types
  - marshaling
---

## Pangkalahatang-ideya {#overview}

Ipinapatupad ng module na mga **Type** ang mga type ng core object, tulad ng:

* **Address**
* **Hash**
* **Header**
* maraming mga helper function

## Pag-encode / Pag-decode ng RLP {#rlp-encoding-decoding}

Hindi tulad ng mga client gaya ng GETH, ang Polygon Edge ay hindi gumagamit ng reflection para sa pag-encode.<br />
Pinili na hindi gumamit ng reflection dahil nagpapasimula ito ng mga bagong problema, tulad ng
pagkasira ng performance, at mas mahirap na scaling.

Ang module na mga **Type** ay nagbibigay ng madaling gamiting interface para sa marshaling at unmarshalling ng RLP, gamit ang FastRLP package.

Isinasagawa ang marshaling sa pamamagitan ng mga paraang *MarshalRLPWith* at *MarshalRLPTo*. Mayroong katulad na mga paraan para sa
unmarshalling.

Sa pamamagitan ng manual na pagtukoy sa mga paraang ito, hindi kinakailangan ng Polygon Edge na gumamit ng reflection. Sa *rlp_marshal.go*, makakahanap ka ng
mga paraan para sa marshaling:

* **Mga Body**
* **Mga Block**
* **Mga Header**
* **Mga Resibo**
* **Mga Log**
* **Mga Transaksyon**
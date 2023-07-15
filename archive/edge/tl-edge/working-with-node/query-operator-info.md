---
id: query-operator-info
title: Pag-query ng impormasyon ng operator
description: "Kung paano mag-query ng impormasyon ng operator."
keywords:
  - docs
  - polygon
  - edge
  - node
  - query
  - operator
---

## Mga Paunang Kinakailangan {#prerequisites}

Ipinagpapalagay ng gabay na ito na sinundan mo ang [Local na Pag-Setup](/docs/edge/get-started/set-up-ibft-locally) o [ang gabay kung paano i-set up ang isang IBFT cluster sa cloud](/docs/edge/get-started/set-up-ibft-on-the-cloud).

Kinakailangan ang isang gumaganang node para makapag-query ng anumang uri ng impormasyon ng operator.

Gamit ang Polygon Edge, kontrolado at alam ng mga node operator kung anong ginagawa ng kanilang node.<br />
Anumang oras, maaari nilang gamitin ang node information layer, na binuo sa itaas ng gRPC, at makakuha ng makabuluhang impormasyon nang hindi nangangailangan ng pagsusuri sa log.

:::note

Kung ang iyong node ay hindi tumatakbo sa `127.0.0.1:8545` kailangan mong magdagdag ng isang flag `--grpc-address <address:port>` sa mga command na nakalista sa dokumentong ito.

:::

## Peer information {#peer-information}

### Listahan ng mga peer {#peers-list}

Para makuha ang kumpletong listahan ng mga konektadong peer (kasama ang mismong tumatakbong node), patakbuhin ang sumusunod na command:
````bash
polygon-edge peers list
````

Ibabalik nito ang isang listahan ng mga libp2p address na kasalukuyang mga peer ng tumatakbong client.

### Peer status {#peer-status}

Para sa status ng isang partikular na peer, patakbuhin ang:
````bash
polygon-edge peers status --peer-id <address>
````
Gamit ang *address* parameter bilang ang libp2p address ng peer.

## impormasyon ng IBFT {#ibft-info}

Kadalasan, maaaring gustong malaman ng isang operator ang tungkol sa state ng gumaganang node sa IBFT consensus.

Sa kabutihang-palad, naglalaan ang Polygon Edge ng isang madaling paraan para mahanap ang impormasyong ito.

### Mga Snapshot {#snapshots}

Ang pagpapatakbo ng sumusunod na command ay nagbabalik ng pinakahuling snapshot.
````bash
polygon-edge ibft snapshot
````
Para i-query ang snapshot sa isang espisipikong taas (bilang ng block), maaaring patakbuhin ng operator ang:
````bash
polygon-edge ibft snapshot --num <block-number>
````

### Mga Candidate {#candidates}

Para makuha ang pinakabagong impormasyon sa mga candidate, maaaring patakbuhin ng operator ang:
````bash
polygon-edge ibft candidates
````
Kini-query ng command na ito ang kasalukuyang set ng mga iminungkahing candidate, pati na rin ang mga candidate na hindi pa naisasama

### Status {#status}

Ang sumusunod na command ay nagbabalik sa kasalukuyang validator key ng tumatakbong IBFT client:
````bash
polygon-edge ibft status
````

## Transaction pool {#transaction-pool}

Para malaman ang kasalukuyang bilang ng mga transaksyong nasa pool ng transaksyon, maaaring patakbuhin ng operator ang:
````bash
polygon-edge txpool status
````

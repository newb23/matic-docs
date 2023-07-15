---
id: poa
title: Proof of Authority (PoA)
description: "Paliwanag at mga tagubilin tungkol sa Proof of Authority."
keywords:
  - docs
  - polygon
  - edge
  - PoA
  - autorithy
---

## Pangkalahatang-ideya {#overview}

Ang PoA ng IBFT ay ang default na consensus mechanism sa Polygon Edge. Sa PoA, tungkulin ng mga validator na gawin ang mga block at idagdag ang mga ito sa blockchain sa isang serye.

Ang lahat ng validator ay bumubuo ng dynamic na validator-set kung saan maaaring idagdag o alisin sa set ang mga validator sa pamamagitan ng pag-employ ng mekanismo ng pagboto. Ibig sabihin, ang mga validator ay maaaring iboto na idagdag/alisin sa validator-set kung iboboto ng mayorya (51%) ng mga validator node na idagdag/alisin sa set ang isang partikular na validator. Sa ganitong paraan, matutukoy ang mga mapaminsalang validator at maaalis sa network ang mga ito, habang maidadagdag sa network ang mga pinagkakatiwalaang validator.

Nagsasalitan ang lahat ng validator sa pag-propose sa susunod na block (round-robin), at para ma-validate/maipasok sa blockchain ang block, dapat aprubahan ng supermajority (mahigit 2/3) ng mga validator ang naturang block.

Bukod sa mga validator, may mga non-validator na hindi lumalahok sa paggawa ng block ngunit lumalahok sa proseso ng pag-validate ng block.

## Pagdadagdag ng validator sa validator-set {#adding-a-validator-to-the-validator-set}

Inilalarawan sa gabay na ito kung paano magdagdag ng bagong validator node sa isang aktibong IBFT network na may 4 na validator node.
Kung kailangan mo ng tulong sa pag-set up ng network ay tumutukoy sa mga seksyon ng [Local Setup](/edge/get-started/set-up-ibft-locally.md) / [Cloud Setup](/edge/get-started/set-up-ibft-on-the-cloud.md).

### Hakbang 1: Gawin ang mga folder ng data para sa IBFT at bumuo ng mga validator key​ para sa bagong node {#step-1-initialize-data-folders-for-ibft-and-generate-validator-keys-for-the-new-node}

Para mapatakbo ang IBFT sa bagong node, kinakailangan mong gawin ang mga folder ng data at buuin ang mga key:

````bash
polygon-edge secrets init --data-dir test-chain-5
````

Ipi-print ng command na ito ang validator key (address) at ang node ID. Kakailanganin mo ang validator key (address) para sa susunod na hakbang.

### Hakbang 2: Mag-propose ng bagong candidate mula sa iba pang validator node {#step-2-propose-a-new-candidate-from-other-validator-nodes}

Para maging validator ang isang bagong node, hindi bababa sa 51% ng mga validator ang kailangang mag-propose sa kanya.

Halimbawa ng kung paano mag-propose ng bagong validator (`0x8B15464F8233F718c8605B16eBADA6fc09181fC2`) mula sa umiiral na validator node sa grpc address: 127.0.0.1:10000:

````bash
polygon-edge ibft propose --grpc-address 127.0.0.1:10000 --addr 0x8B15464F8233F718c8605B16eBADA6fc09181fC2 --bls 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --vote auth
````

Ang istruktura ng mga IBFT command ay tinatalakay sa seksyong mga [CLI Command](/docs/edge/get-started/cli-commands).

:::info Pampublikong key ng BLS

Ang pampublikong key ay kinakailangan lang kung ang network ay tumatakbo na may BLS, para sa network na hindi tumatakbo sa BLS mode, hindi kinakailangan ang `--bls`

:::

### Hakbang 3: Patakbuhin ang client node {#step-3-run-the-client-node}

Dahil sa halimbawang ito ay sinusubukan nating patakbuhin ang network kung saan ang lahat ng node ay nasa iisang machine, kinakailangan nating mag-ingat para maiwasan ang mga conflict ng port.

````bash
polygon-edge server --data-dir ./test-chain-5 --chain genesis.json --grpc-address :50000 --libp2p :50001 --jsonrpc :50002 --seal
````

Pagkatapos na i-fetch ang lahat ng block, mapapansin mo sa loob ng iyong console na may bagong node na lumalahok sa pag-validate

````bash
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=4004
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=5 votes=0
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft: proposer calculated: proposer=0x8B15464F8233F718c8605B16eBADA6fc09181fC2 block=4004
````

:::info Pag-promote ng non-validator sa isang validator

Sa karaniwan, ang isang non-validator ay maaaring maging validator sa pamamagitan ng proseso ng pagboto, ngunit para matagumpay itong maisama sa validator-set pagkatapos ng proseso ng pagboto, kailangang i-restart ang node sa pamamagitan ng `--seal` flag.

:::

## Pag-aalis ng validator sa validator-set {#removing-a-validator-from-the-validator-set}

Madali lang ang operasyong ito. Para mag-alis ng validator node sa validator-set, kinakailangang isagawa ang command na ito para sa karamihan ng mga validator node.

````bash
polygon-edge ibft propose --grpc-address 127.0.0.1:10000 --addr 0x8B15464F8233F718c8605B16eBADA6fc09181fC2 --bls 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --vote drop
````

:::info Pampublikong key ng BLS

Ang pampublikong key ay kinakailangan lang kung ang network ay tumatakbo na may BLS, para sa network na hindi tumatakbo sa BLS mode, hindi kinakailangan ang `--bls`

:::

Pagkatapos maisagawa ang mga command, mapapansing bumaba ang bilang ng mga validator (sa halimbawang ito ng log, mula 4 ay naging 3).

````bash
2021-12-15T19:20:51.014+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=2399 round=1
2021-12-15T19:20:51.014+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=4 votes=2
2021-12-15T19:20:51.015+0100 [INFO]  polygon.consensus.ibft.acceptState: we are the proposer: block=2399
2021-12-15T19:20:51.015+0100 [INFO]  polygon.consensus.ibft: picked out txns from pool: num=0 remaining=0
2021-12-15T19:20:51.015+0100 [INFO]  polygon.consensus.ibft: build block: number=2399 txns=0
2021-12-15T19:20:53.002+0100 [INFO]  polygon.consensus.ibft: state change: new=ValidateState
2021-12-15T19:20:53.009+0100 [INFO]  polygon.consensus.ibft: state change: new=CommitState
2021-12-15T19:20:53.009+0100 [INFO]  polygon.blockchain: write block: num=2399 parent=0x768b3bdf26cdc770525e0be549b1fddb3e389429e2d302cb52af1722f85f798c
2021-12-15T19:20:53.011+0100 [INFO]  polygon.blockchain: new block: number=2399 hash=0x6538286881d32dc7722dd9f64b71ec85693ee9576e8a2613987c4d0ab9d83590 txns=0 generation_time_in_sec=2
2021-12-15T19:20:53.011+0100 [INFO]  polygon.blockchain: new head: hash=0x6538286881d32dc7722dd9f64b71ec85693ee9576e8a2613987c4d0ab9d83590 number=2399
2021-12-15T19:20:53.011+0100 [INFO]  polygon.consensus.ibft: block committed: sequence=2399 hash=0x6538286881d32dc7722dd9f64b71ec85693ee9576e8a2613987c4d0ab9d83590 validators=4 rounds=1 committed=3
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft: state change: new=AcceptState
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=2400 round=1
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=3 votes=0
2021-12-15T19:20:53.012+0100 [INFO]  polygon.consensus.ibft: proposer calculated: proposer=0xea21efC826F4f3Cb5cFc0f986A4d69C095c2838b block=2400
````

---
id: overview
title: Panoramica
description: Panoramica su ChainBridge
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

## Cos'è ChainBridge? {#what-is-chainbridge}

ChainBridge è un bridge blockchain multidirezionale modulare che supporta catene compatibili con EVM e Substrate, costruito da ChainSafe. Consente agli utenti di trasferire tutti i tipi di asset o messaggi tra due catene diverse.

Per maggiori informazioni su ChainBridge, consulta prima i [documenti ufficiali](https://chainbridge.chainsafe.io/) forniti dai suoi sviluppatori.

Questa guida ha lo scopo di aiutare ad integrare Chainbridge in Polygon Edge. Passa attraverso la configurazione di un bridge tra un PoS di Polygon (Mumbai testnet) in esecuzione e una rete di Polygon Edge locale.

## Requisiti {#requirements}

In questa guida eseguirai dei nodi Polygon Edge e un relayer ChainBridge (puoi trovare ulteriori informazioni  [qui](/docs/edge/additional-features/chainbridge/definitions)), e lo strumento cb-sol-cli, che è uno strumento CLI utile ad implementare i contratti localmente, a registrare risorse e a modificare le impostazioni per il bridge (puoi consultare anche [questo articolo](https://chainbridge.chainsafe.io/cli-options/#cli-options)). Prima di avviare la configurazione, sono necessari i seguenti ambienti:

* Go: >= 1.17
* Node.js >= 16.13.0
* Git


Inoltre, dovrai clonare i seguenti repository con le versioni per eseguire alcune applicazioni.

* [Polygon Edge](https://github.com/0xPolygon/polygon-edge): sul `develop` ramo
* [ChainBridge](https://github.com/ChainSafe/ChainBridge): v1.1.5
* [Strumenti di implementazione di ChainBridge](https://github.com/ChainSafe/chainbridge-deploy): `f2aa093` sul `main` ramo


Devi configurare una rete Polygon Edge prima di procedere alla sezione successiva. Controlla le [impostazioni locali](/docs/edge/get-started/set-up-ibft-locally) o le [impostazioni del Cloud](/docs/edge/get-started/set-up-ibft-on-the-cloud) per ulteriori dettagli.
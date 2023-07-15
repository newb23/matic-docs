---
id: overview
title: Panoramica
description: "Introduzione ai test di Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - performance
  - tests
  - loadbot
---
:::caution
Si prega di notare che il nostro , `loadbot`utilizzato per eseguire questi test, è ora deprezzato.
:::

| Tipo | Valore | Link al test |
| ---- | ----- | ------------ |
| Transfer regolari | 1428 tps | [4 luglio 2022](test-history/test-2022-07-04.md#results-of-eoa-to-eoa-transfers) |
| Trasferimenti ERC-20 | 1111 tps | [4 luglio 2022](test-history/test-2022-07-04.md#results-of-erc20-token-transfers) |
| Minting di NFT | 714 tps | [4 luglio 2022](test-history/test-2022-07-04.md#results-of-erc721-token-minting) |

---

Il nostro obiettivo è di rendere un software client di blockchain altamente performante, ricco di funzionalità e facile da configurare e mantenere. Tutti i test sono stati effettuati utilizzando Loadbot di Polygon Edge. Ogni report sulle prestazioni che troverai in questa sezione è correttamente datato, l'ambiente chiaramente descritto e il metodo di test chiaramente spiegato.

L'obiettivo di questi test sulle prestazioni è mostrare una performance mondiale reale della rete blockchain Polygon Edge. Chiunque dovrebbe essere in grado di ottenere gli stessi risultati riportati qui, sullo stesso ambiente, utilizzando il nostro loadbot.

Tutti i test delle prestazioni sono stati condotti sulla piattaforma AWS su una catena costituita dai nodi di istanza EC2.
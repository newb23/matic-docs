---
id: migration-to-pos
title: Migrazione da PoA a PoS
description: "Come migrare dalla modalità PoA a PoS IBFT e viceversa."
keywords:
  - docs
  - polygon
  - edge
  - migrate
  - PoA
  - PoS
---

## Panoramica {#overview}

Questa sezione guida alla migrazione dalla modalità PoA a quella PoS IBFT, e viceversa, per un cluster in funzione, senza la necessità di resettare la blockchain.

## Come migrare a PoS {#how-to-migrate-to-pos}

È necessario arrestare tutti i nodi, aggiungere la configurazione di fork in genesis.json con il comando `ibft switch`e riavviare i nodi.

````bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --deployment 100 --from 200
````
:::caution Switching durante l'utilizzo di ECDSA
Quando si utilizza ECDSA, la `--ibft-validator-type`bandiera deve essere aggiunta allo switch, menzionando che the viene utilizzata. Se non incluso, Edge verrà automaticamente commutato a BLS.

````bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --ibft-validator-type ecdsa --deployment 100 --from 200
````
:::Per passare a PoS, dovrai specificare 2 altezza di blocco: `deployment`e . `from`è `deployment`l'altezza per distribuire il contratto di staking ed è l'altezza `from`dell'inizio di PoS. Il contratto di staking sarà implementato all'indirizzo `0x0000000000000000000000000000000000001001`al `deployment`, come nel caso del contratto pre-implementato.

Si prega di controllare [Proof of Stake](/docs/edge/consensus/pos-concepts) per maggiori dettagli sul contratto di Staking.

:::warning I validatori devono fare stake manualmente
Ogni validatore deve fare stake dopo che il contratto è stato implementato a `deployment`e prima di `from`per essere un validatore all'inizio del PoS. Ogni validatore aggiornerà il proprio set di validatori in base a quello impostato nel contratto di staking all'inizio del PoS.

Per saperne di più su Staking, visita il **[Set up e utilizza la Proof of Stake](/docs/edge/consensus/pos-stake-unstake)**.
:::

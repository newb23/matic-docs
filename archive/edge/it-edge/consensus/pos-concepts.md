---
id: pos-concepts
title: Proof-of-Stake
description: "Spiegazione e istruzioni riguardanti la Proof of Stake."
keywords:
  - docs
  - polygon
  - edge
  - PoS
  - stake
---

## Panoramica {#overview}

Questa sezione mira a fornire una migliore panoramica di alcuni concetti attualmente presenti nella Proof of Stake (PoS). Implementazione di Polygon Edge.

L'implementazione della Proof of Stake (PoS) di Polygon Edge vuole essere un'alternativa all'implementazione PoA IBFT esistente, per offrire agli operatori dei nodi la possibilità di scegliere facilmente tra le due quando avviano una catena.

## Caratteristiche della PoS {#pos-features}

La logica alla base dell'implementazione di Proof of Stake è situata all'interno dello lo **[Smart Contract](https://github.com/0xPolygon/staking-contracts/blob/main/contracts/Staking.sol)**.

Questo contratto viene implementato in anticipo ogni volta che viene inizializzata una catena Polygon Edge con meccanismo PoS ed è disponibile all'indirizzo
`0x0000000000000000000000000000000000001001` dal blocco `0`.

### Epoche {#epochs}

Le epoche sono un concetto introdotto con l'aggiunta della PoS al Polygon Edge.

Le epoche sono considerate un lasso di tempo speciale (in blocchi) in cui un certo insieme di validatori può produrre blocchi. Le loro lunghezze sono modificabili, il che significa che gli operatori dei nodi possono configurare la lunghezza di un'epoca durante la generazione del file genesi.


Alla fine di ogni epoca, viene creato un _blocco di epoca_ e dopo questo evento inizia una nuova epoca. Per saperne di più sui blocchi delle epoche, vedere la sezione [Blocchi dell'epoca](/docs/edge/consensus/pos-concepts#epoch-blocks).

I set di validatori vengono aggiornati alla fine di ogni epoca. I nodi interrogano il set di validatori dallo Staking Smart Contract durante la creazione del blocco epoca e salvano i dati ottenuti nella memoria locale. Questo ciclo di interrogazione e salvataggio viene ripetuto alla fine di ogni epoca.

In sostanza, garantisce che lo Staking Smart Contract abbia il pieno controllo sugli indirizzi dell'insieme di validatori, e
lascia ai nodi una sola responsabilità - interrogare il contratto una volta sola durante un'epoca per recuperare le informazioni più recenti sul set di validatori.
 Questo alleggerisce la responsabilità dei singoli nodi di occuparsi degli insiemi di validatori.

### Staking {#staking}

Gli indirizzi possono metter in staking fondi sullo Staking Smart Contract invocando il `stake`metodo e specificando un valore per
l'importo messo in staking nella transazione:

````js
const StakingContractFactory = await ethers.getContractFactory("Staking");
let stakingContract = await StakingContractFactory.attach(STAKING_CONTRACT_ADDRESS)
as
Staking;
stakingContract = stakingContract.connect(account);

const tx = await stakingContract.stake({value: STAKE_AMOUNT})
````

Mettendo in staking i fondi sullo Staking Smart Contract, gli indirizzi possono entrare nell'insieme dei validatori e quindi partecipare al
processo di produzione dei blocchi.

:::info Soglia per lo staking

Attualmente, la soglia minima per entrare nell'insieme dei validatori è mettere in staking `1 ETH`
:::

### Togliere dallo staking {#unstaking}

Gli indirizzi che hanno messo in staking dei fondi possono **ritirare tutti i loro fondi in una sola volta**.


Ritirare dallo staking può essere fatto con il metodo `unstake`nello Staking Smart Contract:

````js
const StakingContractFactory = await ethers.getContractFactory("Staking");
let stakingContract = await StakingContractFactory.attach(STAKING_CONTRACT_ADDRESS)
as
Staking;
stakingContract = stakingContract.connect(account);

const tx = await stakingContract.unstake()
````

Dopo aver ritirato i propri fondi, gli indirizzi vengono rimossi dall'insieme di validatori impostato sullo Staking Smart Contract e non saranno considerati validatori durante l'epoca successiva.

## Blocchi dell'epoca {#epoch-blocks}

I **blocchi dell'epoca** sono un concetto introdotto nell'implementazione della PoS di IBFT in Polygon Edge.

In sostanza, i blocchi dell'epoca sono blocchi speciali che **non contengono transazioni** e si verificano solo alla **fine di un epoca**.
 Ad esempio, se la **dimensione** dell'epoca è impostata per `50`blocchi, i blocchi di epoch sarebbero considerati blocchi `50`, `100``150`e così via.

Vengono utilizzati per eseguire una logica aggiuntiva che non dovrebbe verificarsi durante la normale produzione di blocchi.

Soprattutto, sono un'indicazione per il nodo che **ha bisogno di recuperare le informazioni più recenti sul set di validatori**  dallo Staking Smart Contract.

Dopo l'aggiornamento dell'insieme di validatori al blocco dell'epoca, l'insieme di validatori (modificato o invariato)
viene utilizzato per i `epochSize - 1`blocchi successivi, fino a quando non viene nuovamente aggiornato prelevando le informazioni più recenti dallo  Staking Smart Contract.

Le lunghezze dell'epoca (in blocchi) sono modificabili durante la generazione del file genesi, utilizzando uno speciale flag `--epoch-size`:

```bash
polygon-edge genesis --epoch-size 50 ...
```

La dimensione predefinita di un'epoca è costituita da `100000`blocchi in Polygon Edge.

## Pre-implementazione del contratto
 {#contract-pre-deployment}

Polygon Edge _pre-implementa_ lo [Staking Smart Contract](https://github.com/0xPolygon/staking-contracts/blob/main/contracts/Staking.sol) durante **la generazione di genesi** all'indirizzo `0x0000000000000000000000000000000000001001`.

Lo fa senza un EVM in funzione, modificando direttamente lo stato della blockchain dello Smart Contract, utilizzando i valori di configurazione passati al comando genesi.

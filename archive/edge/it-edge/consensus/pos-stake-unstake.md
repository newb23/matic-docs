---
id: pos-stake-unstake
title: Impostazione e utilizzo di Proof of Stake (PoS)
description: "Mettere in staking, ritirare dallo staking e altre istruzioni relative al staking."
keywords:
  - docs
  - polygon
  - edge
  - stake
  - unstake
  - validator
  - epoch
---

## Panoramica {#overview}

Questa guida spiega in dettaglio come configurare una rete Proof of Stake con Polygon Edge, come mettere in staking i fondi per i nodi per diventare validatori e come togliere fondi dallo staking.

È **fortemente incoraggiato** a leggere e passare attraverso le sezioni [Configurazione locale](/docs/edge/get-started/set-up-ibft-locally) / [Configurazione del cloud](/docs/edge/get-started/set-up-ibft-on-the-cloud), prima di continuare
con questa guida PoS. Queste sezioni illustrano i passi necessari per avviare un cluster Proof of Authority (PoA) con il sistema di gestione dei dati
Polygon Edge.

Attualmente, non vi è alcun limite al numero di validatori che possono puntare fondi sullo Staking Smart Contract.

## Staking Smart Contract {#staking-smart-contract}

Il repo dello Staking Smart Contract si trova [qui](https://github.com/0xPolygon/staking-contracts).


Contiene gli script di test necessari, i file ABI e soprattutto lo Staking Smart Contract stesso.

## Configurazione di un cluster di N nodi {#setting-up-an-n-node-cluster}

La configurazione di una rete con Polygon Edge è trattata nelle le sezioni [Configurazione locale](/docs/edge/get-started/set-up-ibft-locally) e [Configurazione del Cloud](/docs/edge/get-started/set-up-ibft-on-the-cloud).

L'**unica differenza** tra la creazione di un cluster PoS e PoA è nella parte di generazione del file genesi.

**Quando si genera il file genesi per un cluster PoS, è necessario un flag aggiuntivo`--pos`** :

```bash
polygon-edge genesis --pos ...
```

## Impostazione della lunghezza di un'epoca {#setting-the-length-of-an-epoch}

Le epoche sono trattate in dettaglio nella sezione [Blocchi dell'epoca](/docs/edge/consensus/pos-concepts#epoch-blocks).


Per impostare la dimensione di un'epoca per un cluster (in blocchi), quando si genera il file di genesi, un flag aggiuntivo
va specificato `--epoch-size`:

```bash
polygon-edge genesis --epoch-size 50
```

Questo valore specifica nel file di genesi che la dimensione dell'epoca deve essere di `50`blocchi.

Il valore predefinito per la dimensione di un'epoca (in blocchi) è `100000`.

:::info Diminuire la lunghezza dell'epoca
Come indicato nella sezione [Blocchi dell'epoca](/docs/edge/consensus/pos-concepts#epoch-blocks),
 i blocchi dell'epoca vengono utilizzati per aggiornare i set di validatori per i nodi.

La lunghezza predefinita dell'epoca in blocchi (`100000`) può richiedere molto tempo per gli aggiornamenti dei set di validatori. Considerando che i nuovi blocchi vengono aggiunti ~2 s, ci vorrebbero ~55.5 h per l'insieme di validatori per un eventuale cambio.

L'impostazione di un valore più basso per la lunghezza dell'epoca garantisce un aggiornamento più frequente del set di validatori.
:::

## Utilizzo degli script dello Staking Smart Contract {#using-the-staking-smart-contract-scripts}

### Prerequisiti {#prerequisites}

Il repo di Staking Smart Contract è un progetto Hardhat, che richiede NPM.

Per inizializzarlo correttamente, nella directory principale eseguire:

```bash
npm install
````

### Configurazione degli script di aiuto forniti {#setting-up-the-provided-helper-scripts}

Gli script per interagire con lo Smart Contract Staking distribuito si trovano sulla [repo Staking Smart Contract](https://github.com/0xPolygon/staking-contracts).

Creare un `.env`file con i seguenti parametri nella posizione del repo Smart Contracts:

```bash
JSONRPC_URL=http://localhost:10002
PRIVATE_KEYS=0x0454f3ec51e7d6971fc345998bb2ba483a8d9d30d46ad890434e6f88ecb97544
STAKING_CONTRACT_ADDRESS=0x0000000000000000000000000000000000001001
BLS_PUBLIC_KEY=0xa..
```

Dove sono i parametri:

* **JSONRPC_URL** - l'endpoint JSON-RPC per il nodo in esecuzione
* **PRIVATE_KEYS** - chiavi provate dell'indirizzo dello staker.
* **STAKING_CONTRACT_ADDRESS** - l'indirizzo dello staking smart contract (
default `0x0000000000000000000000000000000000001001`)
* **BLS_PUBLIC_KEY** - chiave pubblica BLS dello staker. Necessaria solo se la rete è in esecuzione con BLS

### Fondi staking {#staking-funds}

:::info Indirizzo staking
Lo Staking Smart Contract è pre-implementato all' indirizzo `0x0000000000000000000000000000000000001001`.

Qualsiasi tipo di interazione con il meccanismo di staking avviene attraverso lo Staking Smart Contract all'indirizzo specificato.

Per saperne di più sullo Staking Smart Contract, visitare lo **[Staking Smart Contract](/docs/edge/consensus/pos-concepts#contract-pre-deployment)** .

:::

Per entrare a far parte del set di validatori, un indirizzo deve metter in staking una certa quantità di fondi al di sopra di una soglia.

Attualmente, la soglia predefinita per entrare a far parte del set di validatori è `1 ETH`.

Lo staking può essere avviato chiamando il `stake`metodo dello Staking  Smart Contract e specificando un valore `>= 1 ETH`.

Dopo che il `.env`file menzionato nella
[sezione precedente](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts) è stato impostato e una
catena è stata avviata in modalità PoS, è possibile effettuare lo staking con il seguente comando nella repo Staking Smart Contract:

```bash
npm run stake
```

Lo script `stake`Hardhat fissa una quantità predefinita di `1 ETH`, che può essere cambiata modificando il file `scripts/stake.ts`.

Se i fondi che vengono in staking sono `>= 1 ETH`, il validatore impostato sullo Staking Smart Contract viene aggiornato e l'indirizzo farà parte dell'insieme dei validatori a partire dall'epoca successiva.

:::info Registrazione delle chiavi BLS

Se la rete funziona in modalità BLS, per diventare validatori i nodi devono registrare le loro chiavi pubbliche BLS dopo lo staking

Questo può essere fatto con il seguente comando:

```bash
npm run register-blskey
```
:::

### Rimuovere i fondi dallo staking {#unstaking-funds}

Gli indirizzi che hanno fondi in staking possono **ritirare tutti i loro fondi** in una sola volta.

Dopo che il `.env`file menzionato nella
[sezione precedente](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts) è stato configurato e una catena è stata avviata in modalità PoS, il ritiro dallo staking può essere effettuato con il seguente comando nel file
repo dello Staking Smart Contract:

```bash
npm run unstake
```

### Recuperare l'elenco degli stakers {#fetching-the-list-of-stakers}

Tutti gli indirizzi che hanno fondi in staking vengono salvati nello Staking Smart Contract.

Dopo che il `.env`file menzionato nella
[sezione precedente](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts) è stato configurato e una catena è stata avviata in modalità PoS, la ricerca dell'elenco dei validatori può essere effettuata con il
seguente comando nella repo dello Staking Smart Contract:

```bash
npm run info
```

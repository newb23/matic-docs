---
id: bls
title: BLS
description: "Spiegazione e istruzioni relative alla modalità BLS."
keywords:
  - docs
  - polygon
  - edge
  - bls
---

## Panoramica {#overview}

BLS è uno schema di firma crittografica che permette a un utente di verificare che un firmatario sia autentico. È uno schema di firma che può aggregare più firme. In Polygon Edge, BLS è utilizzato per impostazione predefinita per garantire una maggiore sicurezza nella modalità di consenso IBFT. BLS può aggregare le firme in un singolo array di byte e ridurre la dimensione dell'intestazione del blocco. Ogni catena può scegliere se utilizzare o meno BLS. La chiave ECDSA viene utilizzata indipendentemente dal fatto che la modalità BLS sia abilitata o meno.

## Presentazione video {#video-presentation}

[![bls - video](https://img.youtube.com/vi/HbUmZpALlqo/0.jpg)](https://www.youtube.com/watch?v=HbUmZpALlqo)

## Come configurare una catena con BLS {#how-to-setup-a-new-chain-using-bls}

Per istruzioni dettagliate sulla configurazione, consultare le sezioni [Configurazione locale](/docs/edge/get-started/set-up-ibft-locally) / [Configurazione cloud](/docs/edge/get-started/set-up-ibft-on-the-cloud).

## Come migrare da una catena PoA ECDSA esistente a una catena PoA BLS {#how-to-migrate-from-an-existing-ecdsa-poa-chain-to-bls-poa-chain}

Questa sezione descrive come utilizzare la modalità BLS in una catena PoA esistente. Per abilitare il BLS in una catena PoA sono necessari i seguenti passaggi.

1. Interrompere tutti i nodi
2. Generare le chiavi BLS per i validatori
3. Aggiungere un'impostazione di fork in genesis.json
4. Riavviare tutti i nodi

### 1. Arrestare di tutti i nodi {#1-stop-all-nodes}

Terminare tutti i processi dei validatori premendo Ctrl + c (Control + c). Ricordare l'ultima altezza del blocco (il numero di sequenza più alto nel registro dei blocchi impegnati).

### 2. Generare la chiave BLS {#2-generate-the-bls-key}

`secrets init`con il  `--bls`genera una chiave BLS. Per mantenere la chiave ECDSA e la chiave di rete esistente e aggiungere una nuova chiave BLS, `--ecdsa`e `--network`devono essere disabilitati.

```bash
polygon-edge secrets init --bls --ecdsa=false --network=false

[SECRETS INIT]
Public key (address) = 0x...
BLS Public key       = 0x...
Node ID              = 16...
```

### 3. Aggiungere l'impostazione di fork
 {#3-add-fork-setting}

`ibft switch`aggiunge un'impostazione di fork, che abilita il BLS nella catena esistente, in `genesis.json`.

Per le reti PoA, i validatori devono essere indicati nel comando. Come per il modo di `genesis`comando, è possibile utilizzare i flag  `--ibft-validators-prefix-path` o `--ibft-validator`per specificare il validatore.

Specificare l'altezza da cui parte la catena usando BLS con il flag `--from`.

```bash
polygon-edge ibft switch --chain ./genesis.json --type PoA --ibft-validator-type bls --ibft-validators-prefix-path test-chain- --from 100
```

### 4. Riavviare tutti i nodi {#4-restart-all-nodes}

Riavviare tutti i nodi con il comando `server`. Dopo la creazione del blocco al punto `from`specificato nel passaggio precedente, la catena abilita il BLS e mostra i log come di seguito:

```bash
2022-09-02T11:45:24.535+0300 [INFO]  polygon.ibft: IBFT validation type switched: old=ecdsa new=bls
```

Inoltre, i log mostrano quale modalità di verifica è stata utilizzata per generare ciascun blocco dopo la sua creazione.

```
2022-09-02T11:45:28.728+0300 [INFO]  polygon.ibft: block committed: number=101 hash=0x5f33aa8cea4e849807ca5e350cb79f603a0d69a39f792e782f48d3ea57ac46ca validation_type=bls validators=3 committed=3
```

## Come migrare da una catena ECDSA PoS esistente a una catena BLS PoS {#how-to-migrate-from-an-existing-ecdsa-pos-chain-to-a-bls-pos-chain}

Questa sezione descrive come utilizzare la modalità BLS in una catena PoS esistente.
Per abilitare il BLS nella catena PoS sono necessari i seguenti passaggi.

1. Interrompere tutti i nodi
2. Generare le chiavi BLS per i validatori
3. Aggiungere un'impostazione di fork in genesis.json
4. Chiamare il contratto di staking per registrare la chiave pubblica di BLS.

5. Riavviare tutti i nodi

### 1. Arrestare di tutti i nodi {#1-stop-all-nodes-1}

Terminare tutti i processi dei validatori premendo Ctrl + c (Control + c). Ricordare l'ultima altezza del blocco (il numero di sequenza più alto nel registro dei blocchi impegnati).

### 2. Generare la chiave BLS {#2-generate-the-bls-key-1}

`secrets init`con il flag `--bls`genera la chiave BLS. Per mantenere la chiave ECDSA e la chiave di rete esistente e aggiungere una nuova chiave BLS, `--ecdsa`e `--network`devono essere disabilitati.

```bash
polygon-edge secrets init --bls --ecdsa=false --network=false

[SECRETS INIT]
Public key (address) = 0x...
BLS Public key       = 0x...
Node ID              = 16...
```

### 3. Aggiungere l'impostazione di fork
 {#3-add-fork-setting-1}

Il comando `ibft switch`aggiunge un'impostazione di fork, che abilita il BLS dal centro della catena, in `genesis.json`.

Specificare l'altezza da cui parte la catena utilizzando la modalità BLS con il flag `from` e l'altezza a cui viene aggiornato il contratto con il flag `development`.

```bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --ibft-validator-type bls --deployment 50 --from 200
```

### 4. Registrare  la chiave pubblica BLS nel contratto di staking {#4-register-bls-public-key-in-staking-contract}

Dopo l'aggiunta del fork e il riavvio dei validatori, ogni validatore deve richiamare `registerBLSPublicKey` nel contratto di staking per registrare la chiave pubblica BLS. Questo deve essere fatto dopo l'altezza specificata in `--deployment` prima dell'altezza specificata in `--from`.

Lo script per registrare la chiave pubblica BLS è definito nel [repo Staking Smart Contract](https://github.com/0xPolygon/staking-contracts).

Impostazione `BLS_PUBLIC_KEY`da registrare nel file `.env`. Per maggiori dettagli sugli altri parametri, consultare [pos-stake-unstake](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts).

```env
JSONRPC_URL=http://localhost:10002
STAKING_CONTRACT_ADDRESS=0x0000000000000000000000000000000000001001
PRIVATE_KEYS=0x...
BLS_PUBLIC_KEY=0x...
```

Il comando seguente registra la chiave pubblica BLS inserita `.env` nel contratto.

```bash
npm run register-blskey
```

:::warning I validatori devono registrare manualmente la chiave pubblica BLS
In modalità BLS, i validatori devono avere il proprio indirizzo e la chiave pubblica BLS. Il livello di consenso ignora i validatori che non hanno registrato la chiave pubblica BLS nel contratto quando il consenso recupera le informazioni sui validatori dal contratto.
:::

### 5. Riavviare tutti i nodi {#5-restart-all-nodes}

Riavviare tutti i nodi con il comando `server`. La catena abilita il BLS dopo la creazione del blocco al punto `from`specificato nel passaggio precedente.

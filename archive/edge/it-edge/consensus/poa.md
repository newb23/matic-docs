---
id: poa
title: Proof of Authority (PoA)
description: "Spiegazione e istruzioni riguardanti la Proof of Autority."
keywords:
  - docs
  - polygon
  - edge
  - PoA
  - autorithy
---

## Panoramica {#overview}

L'IBFT PoA è il meccanismo di consenso predefinito nel Polygon Edge. Nella PoA, i validatori sono i responsabili della creazione dei blocchi e della loro aggiunta in serie alla blockchain.

Tutti i validatori costituiscono un insieme dinamico di validatori, dove questi ultimi possono essere aggiunti o rimossi dall'insieme utilizzando un meccanismo di voto. Ciò significa che i validatori possono essere votati per entrare/uscire dall'insieme dei validatori se la maggioranza (51%) dei nodi validatori vota per aggiungere/rimuovere un determinato validatore dall'insieme. In questo modo, i validatori malintenzionati possono essere riconosciuti e rimossi dalla rete, mentre nuovi validatori affidabili possono essere aggiunti.

Tutti i validatori propongono a turno il blocco successivo (round-robin) e, affinché il blocco venga convalidato/inserito nella blockchain, una supermaggioranza (più di 2/3) dei validatori deve approvarlo.

Oltre ai validatori, ci sono i non validatori che non partecipano alla creazione del blocco ma partecipano al processo di convalida del blocco.

## Aggiungere un validatore all'insieme di validatori {#adding-a-validator-to-the-validator-set}

Questa guida descrive come aggiungere un nuovo nodo validatore a una rete IBFT attiva con 4 nodi validatori. Se hai bisogno di aiuto a impostare la rete si riferimento alle sezioni [di Configurazione](/edge/get-started/set-up-ibft-locally.md) [locale/Configurazione](/edge/get-started/set-up-ibft-on-the-cloud.md) Cloud.

### Passo 1: inizializzare le cartelle dati per IBFT e generare le chiavi di validazione per il nuovo nodo
 {#step-1-initialize-data-folders-for-ibft-and-generate-validator-keys-for-the-new-node}

Per essere operativi con IBFT sul nuovo nodo, occorre innanzitutto inizializzare le cartelle di dati e generare le chiavi:

````bash
polygon-edge secrets init --data-dir test-chain-5
````

Questo comando stamperà la chiave del validatore (indirizzo) e l'ID del nodo. La chiave di convalida (indirizzo) è necessaria per il passaggio successivo.

### Passo 2: proporre un nuovo candidato da altri nodi validatori {#step-2-propose-a-new-candidate-from-other-validator-nodes}

Affinché un nuovo nodo diventi validatore, deve essere proposto da almeno il 51% dei validatori.

Esempio di come proporre un nuovo validatore (`0x8B15464F8233F718c8605B16eBADA6fc09181fC2`) dal nodo validatore esistente sull'indirizzo grpc: 127.0.0.1:1000:

````bash
polygon-edge ibft propose --grpc-address 127.0.0.1:10000 --addr 0x8B15464F8233F718c8605B16eBADA6fc09181fC2 --bls 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --vote auth
````

La struttura dei comandi IBFT è stata affrontata nella sezione [Comandi CLI](/docs/edge/get-started/cli-commands).

:::info Chiave pubblica BLS
La chiave pubblica BLS è necessaria solo se la rete funziona con BLS, per la rete che non funziona in modalità BLS  `--bls` non è necessaria.
:::

### Passo 3: eseguire il nodo client {#step-3-run-the-client-node}

Poiché in questo esempio stiamo cercando di eseguire una rete in cui tutti i nodi si trovano sulla stessa macchina, dobbiamo fare attenzione a evitare conflitti delle porte.

````bash
polygon-edge server --data-dir ./test-chain-5 --chain genesis.json --grpc-address :50000 --libp2p :50001 --jsonrpc :50002 --seal
````

Dopo aver recuperato tutti i blocchi, nella console si noterà che un nuovo nodo sta partecipando alla validazione

````bash
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft.acceptState: Accept state: sequence=4004
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft: current snapshot: validators=5 votes=0
2021-12-01T14:56:48.369+0100 [INFO]  polygon.consensus.ibft: proposer calculated: proposer=0x8B15464F8233F718c8605B16eBADA6fc09181fC2 block=4004
````

:::info Promuovere un non validatore a validatore
`--seal`Naturalmente, un non validatore può diventare un validatore attraverso il processo di voto, ma per essere incluso con successo nell'insieme dei validatori dopo il processo di voto, il nodo deve essere riavviato con il flag.
:::

## Rimuovere un validatore dall'insieme di validatori {#removing-a-validator-from-the-validator-set}

Questa operazione è abbastanza semplice. Per rimuovere un nodo validatore dall'insieme dei validatori, questo comando deve essere eseguito per la maggior parte dei nodi validatori.

````bash
polygon-edge ibft propose --grpc-address 127.0.0.1:10000 --addr 0x8B15464F8233F718c8605B16eBADA6fc09181fC2 --bls 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --vote drop
````

:::info Chiave pubblica BLS
La chiave pubblica BLS è necessaria solo se la rete funziona con BLS, per la rete che non funziona in modalità BLS  `--bls` non è necessaria.
:::

Dopo aver eseguito i comandi, si osserva che il numero di validatori è diminuito (in questo esempio di log da 4 a 3).

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

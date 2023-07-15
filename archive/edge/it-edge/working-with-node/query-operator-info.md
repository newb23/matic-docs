---
id: query-operator-info
title: Richiedere informazioni sull'operatore
description: "Come richiedere informazioni sull'operatore."
keywords:
  - docs
  - polygon
  - edge
  - node
  - query
  - operator
---

## Prerequisiti {#prerequisites}

Questa guida presuppone che tu abbia seguito l'[Installazione locale](/docs/edge/get-started/set-up-ibft-locally) o la guida [ su come configurare un cluster IBFT sul cloud2](/docs/edge/get-started/set-up-ibft-on-the-cloud).

È necessario un nodo funzionante per richiedere qualsiasi tipo di informazione sull'operatore.

Con polygon edge, gli operatori del nodo hanno il controllo e sono informati su cosa sta facendo il nodo che stanno operando.<br />
In qualsiasi momento, possono utilizzare il layer di informazioni sui nodi, basato su gRPC, e ottenere informazioni significative, senza necessità di setacciare i log.

:::note

Se il tuo nodo non è in esecuzione su `127.0.0.1:8545` aggiungi un flag `--grpc-address <address:port>` ai comandi elencati in questo documento.

:::

## Informazioni sui peer {#peer-information}

### Elenco dei peer {#peers-list}

Per ottenere un elenco completo dei peer connessi (compreso lo stesso nodo in esecuzione), esegui il seguente comando:
````bash
polygon-edge peers list
````

Questo restituirà un elenco di indirizzi libp2p che sono attualmente peer del client in esecuzione.

### Stato dei peer {#peer-status}

Per lo stato di un peer specifico, esegui:
````bash
polygon-edge peers status --peer-id <address>
````
Dove il parametro *indirizzo* è l'indirizzo libp2p del peer.

## Informazioni su IBFT {#ibft-info}

Molte volte, un operatore potrebbe voler conoscere lo stato del nodo operativo nel consensus IBFT.

Fortunatamente, Polygon Edge fornisce un modo facile per trovare queste informazioni.

### Istantanee {#snapshots}

L'esecuzione del seguente comando restituisce lo snapshot più recente.
````bash
polygon-edge ibft snapshot
````
Per interrogare lo snapshot a un'altezza specifica (numero di blocco), l'operatore può eseguire:
````bash
polygon-edge ibft snapshot --num <block-number>
````

### Candidati {#candidates}

Per ottenere le informazioni più recenti sui candidati, l'operatore può eseguire:
````bash
polygon-edge ibft candidates
````
Questo comando interroga l'attuale set di candidati proposti, nonché i candidati che non sono ancora stati inclusi

### Stato {#status}

Il seguente comando restituisce la chiave validatore corrente del client IBFT in esecuzione:
````bash
polygon-edge ibft status
````

## Pool di transazioni {#transaction-pool}

Per trovare il numero corrente di transazioni nel pool di transazioni, l'operatore può eseguire:
````bash
polygon-edge txpool status
````

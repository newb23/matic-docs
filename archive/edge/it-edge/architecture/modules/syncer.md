---
id: syncer
title: Syncer
description: Spiegazione del modulo syncer di Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - synchronization
---

## Panoramica {#overview}

Questo modulo contiene la logica del protocollo di sincronizzazione. Viene utilizzato per sincronizzare un nuovo nodo con la rete in esecuzione o per convalidare/inserire nuovi blocchi per i nodi che non partecipano al consenso (non validatori).

Polygon Edge utilizza **libp2p** come livello di rete e in aggiunta esegue **gRPC**.

Esistono essenzialmente 2 tipi di sincronizzazione in Polygon Edge:
* Bulk Sync - sincronizza una vasta gamma di blocchi alla volta
* Watch Sync - sincronizza su base per-blocco.

### Bulk Sync {#bulk-sync}

I passaggi per la sincronizzazione in massa sono piuttosto semplici per soddisfare l'obiettivo di Bulk Sync - sincronizzare il maggior numero possibile di blocchi (disponibili) dall'altro peer per rimettersi al passo il più rapidamente possibile.


Questo è il flusso del processo di Bulk Sync:

1. ** Determinare se il nodo ha bisogno di Bulk Sync ** - In questa fase, il nodo controlla la mappa dei peer per vedere se c'è qualcuno che ha un numero di blocco maggiore di quello che il nodo ha localmente.
2. ** Trovare il miglior peer (usando la mappa dei peer di sincronizzazione) ** - In questa fase il nodo trova il miglior peer con cui sincronizzarsi in base ai criteri menzionati nell'esempio precedente.
3. ** Aprire un flusso di sincronizzazione in massa ** - In questa fase il nodo apre un flusso gRPC verso il miglior peer per sincronizzare in massa i blocchi dal numero di blocco comune.
4. ** Il miglior peer chiude il flusso quando ha terminato l'invio di massa ** - In questa fase il miglior peer con cui il nodo si sta sincronizzando chiuderà il flusso non appena avrà inviato tutti i blocchi disponibili che possiede.
5. ** Al termine della sincronizzazione in massa, verificare se il nodo è un validatore ** - In questa fase, il flusso viene chiuso dal miglior peer e il nodo deve verificare se è un validatore dopo la sincronizzazione in massa.
  * Se lo è, esce dallo stato di sincronizzazione e inizia a partecipare al consenso.
  * In caso contrario, continuano a ** Watch Sync **

### Watch Sync {#watch-sync}

:::info
Il passaggio per Watch Syncing viene eseguito solo se il nodo non è un validatore, ma un normale nodo non validatore della rete che si limita ad ascoltare i blocchi in arrivo.
:::

Il comportamento di Watch Sync è piuttosto semplice: il nodo è già sincronizzato con il resto della rete e deve solo analizzare i nuovi blocchi in arrivo.

Questo è il flusso del processo di Watch Sync:

1. ** Aggiungere un nuovo blocco quando lo stato di un peer viene aggiornato ** - In questa fase i nodi ascoltano gli eventi di un nuovo blocco, quando hanno un nuovo blocco eseguono una chiamata di funzione gRPC, ottengono il blocco e aggiornano lo stato locale.
2. ** Verifica se il nodo è un validatore dopo la sincronizzazione dell'ultimo blocco **

   * Se lo è, esce dallo stato di sincronizzazione
   * In caso contrario, continua ad ascoltare gli eventi dei nuovi blocchi

## Rapporto sulla performance {#perfomance-report}

:::info

Le prestazioni sono state misurate su una macchina locale sincronizzando un milione di blocchi.
:::

| Nome | Risultato |
|----------------------|----------------|
| Sincronizzazione di 1 milione di blocchi | ~ 25 min |
| Trasferimento di 1 milione di blocchi | ~ 1 min |
| Numero di chiamate GRPC | 2 |
| Copertura test | ~ 93% |
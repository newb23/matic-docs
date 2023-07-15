---
id: backup-restore
title: Backup/ripristino dell'istanza del nodo
description: "Come eseguire il backup e ripristinare un'istanza del nodo Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - instance
  - restore
  - directory
  - node
---

## Panoramica {#overview}

Questa guida illustra in dettaglio come eseguire il backup e il ripristino di un'istanza del nodo Polygon Edge. Tratta le cartelle di base e quello che contengono, così come quali file sono fondamentali per l'esecuzione di un backup e di un ripristino di successo.

## Cartelle di base {#base-folders}

Polygon Edge sfrutta LevelDB come suo motore di archiviazione. Quando si avvia un nodo Polygon Edge, vengono create le seguenti sotto-cartelle nella directory di lavoro specificata:
* **blockchain** - Memorizza i dati blockchain
* **trie** - Memorizza i trie di Merkle (dati sullo stato mondiale)
* **keystore** - Memorizza le chiavi private del client. Questo include la chiave privata di libp2p e la chiave privata del sigillatore/validatore
* **consensus** - Memorizza tutte le informazioni sul consenso di cui il client potrebbe avere bisogno durante il lavoro. Per ora, memorizza la *chiave privata del validatore* del nodo

È fondamentale che queste cartelle vengano conservate affinché l'istanza Polygon Edge funzioni senza problemi.

## Crea il backup da un nodo in esecuzione e ripristina il nuovo nodo {#create-backup-from-a-running-node-and-restore-for-new-node}

Questa sezione ti guida attraverso la creazione di dati di archivio della blockchain in un nodo in esecuzione e il ripristino in un'altra istanza.

### Backup {#backup}

Il comando `backup` recupera i blocchi da un nodo in esecuzione tramite gRPC e genera un file di archivio. Se `--from` e `--to` non vengono forniti nel comando, questo comando recupererà i blocchi dalla genesi all'ultimo.

```bash
$ polygon-edge backup --grpc-address 127.0.0.1:9632 --out backup.dat [--from 0x0] [--to 0x100]
```

### Ripristina {#restore}

Un server importa i blocchi da un archivio all'inizio quando si parte con il flag `--restore`. Assicurati che ci sia una chiave per un nodo nuovo. Per saperne di più sull'importazione o la generazione di chiavi, visita la [sezione Secret Managers](/docs/edge/configuration/secret-managers/set-up-aws-ssm).

```bash
$ polygon-edge server --restore archive.dat
```

## Backup/ripristino di dati interi {#back-up-restore-whole-data}

Questa sezione ti guida attraverso il backup dei dati, inclusi i dati di stato e la chiave, e il ripristino nella nuova istanza.

### Passo 1: Ferma l'esecuzione del client {#step-1-stop-the-running-client}

Poiché Polygon Edge utilizza **LevelDB** per la memorizzazione dei dati, il nodo deve essere fermato per la durata del backup, poiché **LevelDB** non consente l'accesso simultaneo ai suoi file di database.

Inoltre, Polygon Edge esegue anche lo svuotamento dei dati alla chiusura.

Il primo passo prevede l'arresto del client in esecuzione (tramite un gestore di servizi o altro meccanismo che invia un segnale SIGINT al processo), quindi può attivare 2 eventi mentre si spegne adeguatamente:
* Esecuzione dello scaricamento di dati sul disco
* Rilascio del blocco dei file DB da parte di LevelDB

### Passo 2: Backup della directory {#step-2-backup-the-directory}

Ora che il client non è in esecuzione, la directory dei dati può essere supportata su un altro mezzo.
Tieni presente che i file con estensione `.key` contengono i dati della chiave privata che si possono utilizzare per impersonare il nodo corrente,
e non dovrebbero mai essere condivisi con terzi/sconosciuti.

:::info

Esegui il backup e il ripristino manuale del file `genesis` generato, di modo che il nodo ripristinato sia completamente operativo.
:::

## Ripristina {#restore-1}

### Passo 1: Ferma l'esecuzione del client {#step-1-stop-the-running-client-1}

Se è in esecuzione un'istanza di Polygon Edge, è necessario interromperla affinché il passaggio 2 abbia esito positivo.

### Passo 2: copia la directory dei dati di backup nella cartella desiderata {#step-2-copy-the-backed-up-data-directory-to-the-desired-folder}

Quando il client non è in esecuzione, la directory dei dati di cui è stato eseguito il backup in precedenza può essere copiata nella cartella desiderata. Inoltre, ripristina il file `genesis` copiato in precedenza.

### Passo 3: esegui il client Polygon Edge specificando la directory dei dati corretta {#step-3-run-the-polygon-edge-client-while-specifying-the-correct-data-directory}

Affinché Polygon Edge utilizzi la directory dei dati ripristinata, all'avvio, l'utente deve specificare il percorso della directory dei dati. Consulta la sezione [Comandi CLI](/docs/edge/get-started/cli-commands) sulle informazioni relative al flag `data-dir`.

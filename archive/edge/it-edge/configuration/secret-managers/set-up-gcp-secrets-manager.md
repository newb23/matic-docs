---
id: set-up-gcp-secrets-manager
title: Configurazione di GCP Secrets Manager
description: "Configurazione del Gestore di segreti GCP per Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - gcp
  - secrets
  - manager
---

## Panoramica {#overview}

Attualmente, Polygon Edge si occupa di mantenere due importanti segreti di runtime:
* La **chiave privata del validatore** utilizzata dal nodo, se il nodo è un validatore.
* La **chiave privata di rete** utilizzata da libp2p, per partecipare e comunicare con altri peer.


Per ulteriori informazioni, leggere la [Guida alla gestione delle chiavi private](/docs/edge/configuration/manage-private-keys).

I moduli di Polygon Edge **non devono sapere come mantenere i segreti**. In definitiva, a un modulo non dovrebbe interessare se un segreto è memorizzato su un server lontano o localmente sul disco del nodo.

Tutto ciò che un modulo deve sapere sulla gestione dei segreti è **sapere come usare il segreto**, **sapere quali segreti ottenere e quali salvare**. I dettagli più fini dell'implementazione di queste operazioni sono delegati a `SecretsManager`, che ovviamente è un'astrazione.

L'operatore del nodo che sta avviando Polygon Edge può ora specificare quale gestore di segreti desidera utilizzare e non appena il gestore dei segreti corretto è istanziato, i moduli si occupano dei segreti attraverso l'interfaccia menzionata - senza preoccuparsi se i segreti sono memorizzati su un disco o su un server.

Questo articolo illustra in dettaglio i passaggi necessari per rendere operativo Polygon Edge con [GCP Secret Manager](https://cloud.google.com/secret-manager).

:::info Guide precedenti
Prima di leggere questo articolo,** si consiglia di** leggere gli articoli sulla [**Configurazione locale**](/docs/edge/get-started/set-up-ibft-locally) e [**la Configurazione del Cloud**](/docs/edge/get-started/set-up-ibft-on-the-cloud).
:::


## Prerequisiti {#prerequisites}
### Account di fatturazione GCP Billing Account {#gcp-billing-account}
Per utilizzare GCP Secrets Manager, l'utente deve avere l'[account di fatturazione](https://console.cloud.google.com/) abilitato sul portale GCP.
I nuovi account Google sulla piattaforma GCP vengono forniti con dei fondi per iniziare, come una sorta di prova gratuita. Maggiori informazioni sui [documenti GCP](https://cloud.google.com/free)

### API di Secrets Manager {#secrets-manager-api}
L'utente dovrà abilitare le API di GCP Secrets Manager prima di poterlo utilizzare.  Si può procedere all'abilitazione tramite il [portale delle API di Secrets Manager](https://console.cloud.google.com/apis/library/secretmanager.googleapis.com). Maggiori informazioni: [Configurazione di Secret Manager](https://cloud.google.com/secret-manager/docs/configuring-secret-manager)

### Credenziali per GCP {#gcp-credentials}
Infine, l'utente deve generare delle nuove credenziali che verranno utilizzate per l'autenticazione. Lo si può fare seguendo le istruzioni riportate [qui](https://cloud.google.com/secret-manager/docs/reference/libraries).   
Il file json generato contenente le credenziali deve essere trasferito ad ogni nodo che deve utilizzare GCP Secrets Manager.

Informazioni necessarie prima di continuare:
* **ID di progetto** (l'id di progetto definito sulla piattaforma GCP)
* **Posizione del file con le credenziali** (il percorso del file json contenente le credenziali)

## Passo 1 - Generare la configurazione di Secrets manager {#step-1-generate-the-secrets-manager-configuration}

Affinché Polygon Edge sia in grado di comunicare senza problemi con GCP SM, deve analizzare un file di configurazione già generato, che contenga tutte le informazioni necessarie per la memorizzazione segreta su GCP SM.

Per generare la configurazione, eseguire il seguente comando:

```bash
polygon-edge secrets generate --type gcp-ssm --dir <PATH> --name <NODE_NAME> --extra project-id=<PROJECT_ID>,gcp-ssm-cred=<GCP_CREDS_FILE>
```

Parametri presenti:
* `PATH`è il percorso in cui esportare il file di configurazione. Predefinito `./secretsManagerConfig.json`
* `NODE_NAME` è il nome del nodo corrente per il quale si sta impostando la configurazione di GCP SM. Può essere un valore arbitrario. Predefinito `polygon-edge-node`
* `PROJECT_ID`è l'ID del progetto che l'utente ha definito nella console GCP durante la configurazione dell'account e l'attivazione delle API di Secrets Manager.
* `GCP_CREDS_FILE` è il percorso del file json contenente le credenziali che consentiranno l'accesso in lettura/scrittura a Secrets Manager.

:::caution Nomi del nodo
Fai attenzione quando specifichi i nomi dei nodi.

Polygon Edge utilizza il nome del nodo specificato per tenere traccia dei segreti che genera e utilizza su SSM GCP. Specificare un nome di nodo esistente può avere come conseguenza il non riuscire a scrivere il segreto a GCP SM.

I segreti sono memorizzati nel seguente percorso di base: `projects/PROJECT_ID/NODE_NAME`
:::

## Passo 2 - Inizializzare le chiavi segrete utilizzando la configurazione {#step-2-initialize-secret-keys-using-the-configuration}

Ora che il file di configurazione è presente, si possono inizializzare le chiavi segrete richieste con il
file di configurazione impostato nel Passo 1, utilizzando `--config`:

```bash
polygon-edge secrets init --config <PATH>
```

Il parametro `PATH` è la posizione del parametro del secrets manager generato in precedenza dal Passo 1.

## Passo 3 - Generare il file genesi {#step-3-generate-the-genesis-file}

Il file genesi deve essere generato in modo simile a quello delle guide  [**Configurazione locale**](/docs/edge/get-started/set-up-ibft-locally)
e [**Configurazione del Cloud**](/docs/edge/get-started/set-up-ibft-on-the-cloud), con modifiche minime.

Poiché viene utilizzato GCP SM invece del file system locale, gli indirizzi dei validatori devono essere aggiunti tramite il flag `--ibft-validator`:
```bash
polygon-edge genesis --ibft-validator <VALIDATOR_ADDRESS> ...
```

## Passo 4 - Avviare il client Polygon Edge {#step-4-start-the-polygon-edge-client}

Ora che le chiavi sono state impostate e il file genesi è stato generato, l'ultimo passo di questo processo è l'avvio di Polygon Edge con il comando `server`.

Il comando `server`viene utilizzato nello stesso modo delle guide precedenti, con una piccola aggiunta - il flag `--secrets-config`:

```bash
polygon-edge server --secrets-config <PATH> ...
```

Il parametro `PATH` è la posizione del parametro del secrets manager generato in precedenza dal Passo 1.
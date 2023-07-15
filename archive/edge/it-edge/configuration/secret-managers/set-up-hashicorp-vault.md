---
id: set-up-hashicorp-vault
title: Configura Hashicorp Vault
description: "Configura Hashicorp Vault per Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - hashicorp
  - vault
  - secrets
  - manager
---

## Panoramica {#overview}

Attualmente, Polygon Edge si occupa di mantenere due importanti segreti di runtime:
* La **chiave privata del validatore** utilizzata dal nodo, se il nodo è un validatore.
* La **chiave privata di rete** utilizzata da libp2p, per partecipare e comunicare con altri peer.


:::warning
La chiave privata del validatore è univoca per ogni nodo validatore. La stessa chiave <b>non</b> deve essere condivisa in tutti i validatori, in quanto ciò può compromettere la sicurezza della tua catena.

:::

Per ulteriori informazioni, leggere la [Guida alla gestione delle chiavi private](/docs/edge/configuration/manage-private-keys).

I moduli di Polygon Edge **non devono sapere come mantenere i segreti**. In definitiva, a un modulo non dovrebbe interessare se un segreto è memorizzato su un server lontano o localmente sul disco del nodo.

Tutto ciò che un modulo deve sapere sulla gestione dei segreti è **sapere come usare il segreto**, **sapere quali segreti ottenere e quali salvare**. I dettagli più fini dell'implementazione di queste operazioni sono delegati a `SecretsManager`, che ovviamente è un'astrazione.

L'operatore del nodo che sta avviando Polygon Edge può ora specificare quale gestore di segreti desidera utilizzare e non appena il gestore dei segreti corretto è istanziato, i moduli si occupano dei segreti attraverso l'interfaccia menzionata - senza preoccuparsi se i segreti sono memorizzati su un disco o su un server.

Questo articolo illustra in dettaglio i passaggi necessari per rendere operativo Polygon Edge con un server [Hashicorp Vault](https://www.vaultproject.io/).

:::info Guide precedenti
Prima di leggere questo articolo,** si consiglia di** leggere gli articoli sulla [**Configurazione locale**](/docs/edge/get-started/set-up-ibft-locally) e [**la Configurazione del Cloud**](/docs/edge/get-started/set-up-ibft-on-the-cloud).
:::


## Prerequisiti {#prerequisites}

Questo articolo presuppone che un'istanza funzionante del server Hashicorp Vault **sia già impostata**.

Inoltre, è necessario che il server Hashicorp Vault utilizzato per Polygon Edge abbia **abilitato lo storage KV**.

Informazioni necessarie prima di continuare:
* **L'URL del server** (URL dell'API del server Hashicorp Vault)
* **Token** (token di accesso usato per accedere allo storage engine KV)

## Passo 1 - Generare la configurazione di Secrets manager {#step-1-generate-the-secrets-manager-configuration}

Affinché Polygon Edge sia in grado di comunicare senza problemi con il server del Vault, deve analizzare un file di configurazione già generato, che contenga tutte le informazioni necessarie per la memorizzazione segreta sul Vault.

Per generare la configurazione, eseguire il seguente comando:

```bash
polygon-edge secrets generate --dir <PATH> --token <TOKEN> --server-url <SERVER_URL> --name <NODE_NAME>
```

Parametri presenti:
* `PATH`è il percorso in cui esportare il file di configurazione. Predefinito `./secretsManagerConfig.json`
* `TOKEN` è il token di accesso precedentemente menzionato nella [sezione dei prerequisiti](/docs/edge/configuration/secret-managers/set-up-hashicorp-vault#prerequisites)
* `SERVER_URL` è l'URL dell'API per il server Vault, menzionato anche nella [sezione dei prerequisiti](/docs/edge/configuration/secret-managers/set-up-hashicorp-vault#prerequisites)
* `NODE_NAME`è il nome del nodo corrente per cui viene impostata la configurazione del Vault. Può essere un valore arbitrario. Predefinito `polygon-edge-node`

:::caution Nomi del nodo

Fai attenzione quando specifichi i nomi dei nodi.

Polygon Edge utilizza il nome del nodo specificato per tenere traccia dei segreti che genera e utilizza sull'istanza del Vault.
La specifica di un nome nodo esistente può avere conseguenze sulla sovrascrittura dei dati sul server del Vault.

I segreti sono memorizzati nel seguente percorso di base: `secrets/node_name`
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

Poiché viene utilizzato Hashicorp Vault invece del file system locale, gli indirizzi dei validatori devono essere aggiunti tramite il flag `--ibft-validator`:
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
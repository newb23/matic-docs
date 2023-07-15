---
id: set-up-aws-ssm
title: Configurazione di AWS SSM (Systems Manager)
description: "Configurare AWS SSM (Systems Manager) per Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - aws
  - ssm
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

Questo articolo illustra in dettaglio i passaggi necessari per rendere operativo Polygon Edge con le guide precedenti di [AWS Systems Manager Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html)

:::info .
Prima di leggere questo articolo,** si consiglia di** leggere gli articoli sulla [**Configurazione locale**](/docs/edge/get-started/set-up-ibft-locally) e [**la Configurazione del Cloud**](/docs/edge/get-started/set-up-ibft-on-the-cloud).
:::


## Prerequisiti {#prerequisites}
### Policy IAM {#iam-policy}
L'utente deve creare un criterio IAM che consenta operazioni di lettura/scrittura per AWS Systems Manager Parameter Store. Dopo aver creato con successo il criterio IAM, l'utente deve collegarlo all'istanza EC2 che esegue il server Polygon Edge. La policy IAM dovrebbe avere un aspetto simile a questo:
```json
{
  "Version": "2012-10-17",
  "Statement" : [
    {
      "Effect" : "Allow",
      "Action" : [
        "ssm:PutParameter",
        "ssm:DeleteParameter",
        "ssm:GetParameter"
      ],
      "Resource" : [
        "arn:aws:ssm:<aws_region>:<aws_account_id>:parameter<ssm-parameter-path>*"
      ]
    }
  ]
}
```
Ulteriori informazioni sui ruoli IAM di AWS SSM sono disponibili nei [documenti di AWS](https://docs.aws.amazon.com/systems-manager/latest/userguide/setup-instance-profile.html).

Informazioni necessarie prima di continuare:
* **Regione** (regione in cui risiedono Systems Manager e ii nodi)
* **Percorso del parametro** (percorso arbitrario in cui verrà inserito il segreto, ad esempio `/polygon-edge/nodes`)

## Passo 1 - Generare la configurazione del gestore dei segreti {#step-1-generate-the-secrets-manager-configuration}

Affinché Polygon Edge sia in grado di comunicare senza problemi con l'SSM di AWS, deve analizzare un file di configurazione già generato, che contenga tutte le informazioni necessarie per la memorizzazione segreta su AWS SSM.

Per generare la configurazione, eseguire il seguente comando:

```bash
polygon-edge secrets generate --type aws-ssm --dir <PATH> --name <NODE_NAME> --extra region=<REGION>,ssm-parameter-path=<SSM_PARAM_PATH>
```

Parametri presenti:
* `PATH`è il percorso in cui esportare il file di configurazione. Predefinito `./secretsManagerConfig.json`
* `NODE_NAME`è il nome del nodo corrente per il quale si sta impostando la configurazione di AWS SSM. Può essere un valore arbitrario. Predefinito `polygon-edge-node`
* `REGION`è la regione in cui risiede l'AWS SSM. Questa deve essere la stessa regione del nodo che utilizza AWS SSM.
* `SSM_PARAM_PATH`è il nome del percorso in cui verrà memorizzato il segreto. Ad esempio se `--name node1` e `ssm-parameter-path=/polygon-edge/nodes`
sono specificati, il segreto verrà memorizzato come `/polygon-edge/nodes/node1/<secret_name>`

:::caution Nomi del nodo
Fai attenzione quando specifici i nomi del nodo.

Polygon Edge utilizza il nome del nodo specificato per tenere traccia dei segreti che genera e utilizza su SSM AWS. Specificare un nome di nodo esistente può avere come conseguenza la mancata scrittura del segreto in AWS SSM.

I segreti sono memorizzati nel seguente percorso di base: `SSM_PARAM_PATH/NODE_NAME`
:::

## Passo 2 - Inizializzare le chiavi segrete utilizzando la configurazione {#step-2-initialize-secret-keys-using-the-configuration}

Ora che il file di configurazione è presente, si possono inizializzare le chiavi segrete richieste con il
file di configurazione impostato nel Passo 1, utilizzando `--config`:

```bash
polygon-edge secrets init --config <PATH>
```

Il parametro `PATH` è la posizione del parametro del gestore dei segreti generato in precedenza dal Passo 1.


:::info Policy IAM

Questo passaggio fallirà se il criterio IAM che consente operazioni di lettura/scrittura non è configurato correttamente e/o non è collegato all'istanza EC2 che esegue il comando.
:::

## Passo 3 - Generare il file genesi {#step-3-generate-the-genesis-file}

Il file genesi deve essere generato in modo simile a quello delle guide  [**Configurazione locale**](/docs/edge/get-started/set-up-ibft-locally)
e [**Configurazione del Cloud**](/docs/edge/get-started/set-up-ibft-on-the-cloud), con modifiche minime.

Poiché viene utilizzato AWS SSM invece del file system locale, gli indirizzi dei validatori devono essere aggiunti tramite il flag `--ibft-validator`:
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
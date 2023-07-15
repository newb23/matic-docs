---
id: validator-hosting
title: Hosting validatore
description: "Requisiti di hosting per Polygon Edge"
keywords:
- docs
- polygon
- edge
- hosting
- cloud
- setup
- validator
---

Di seguito sono riportati i suggerimenti per ospitare correttamente un nodo validatore in una rete Polygon Edge. Fai attenzione a tutti gli articoli elencati di seguito per assicurarti che la configurazione del tuo validatore sia stata eseguita correttamente per essere sicura, stabile e performante.

## Conoscenze di base {#knowledge-base}

Prima di provare ad eseguire il nodo validatore, leggi attentamente questo documento.   
Documenti aggiuntivi che potrebbero essere utili sono:

- [Installazione](get-started/installation)
- [Configurazione del cloud](get-started/set-up-ibft-on-the-cloud)
- [Comandi CLI](get-started/cli-commands)
- [File di configurazione del server](configuration/sample-config)
- [Chiavi private](configuration/manage-private-keys)
- [Metriche Prometheus](configuration/prometheus-metrics)
- [Secret managers](/docs/category/secret-managers)
- [Backup/Ripristino](working-with-node/backup-restore)

## Requisiti di sistema minimi {#minimum-system-requirements}

| Tipo | Valore | Influenzato da |
|------|------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|
| CPU | 2 core | <ul><li>Numero di query JSON-RPC</li><li>Dimensione dello stato della blockchain</li><li>Limite gas del blocco</li><li>Tempo di blocco</li></ul> |
| RAM | 2 GB | <ul><li>Numero di query JSON-RPC</li><li>Dimensione dello stato della blockchain</li><li>Limite gas del blocco</li></ul> |
| Disco | <ul><li>Partizione di root da 10 GB</li><li>Partizione di root da 30 GB con LVM per l'estensione del disco</li></ul> | <ul><li>Dimensione dello stato della blockchain</li></ul> |


## Configurazione del servizio {#service-configuration}

Il binario `polygon-edge` deve essere eseguito automaticamente come servizio di sistema dopo aver stabilito la connettività di rete e avere funzionalità di
avvio/arresto/riavvio. Consigliamo di utilizzare un gestore di servizi come `systemd.`

Esempio di file di configurazione del sistema `systemd`:
```
[Unit]
Description=Polygon Edge Server
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=10
User=ubuntu
ExecStart=/usr/local/bin/polygon-edge server --config /home/ubuntu/polygon/config.yaml

[Install]
WantedBy=multi-user.target
```

### Binario {#binary}

Nei carichi di lavoro di produzione il binario `polygon-edge` deve essere implementato solo da binari di rilascio GitHub predefiniti, non compilandolo manualmente.
:::info

Compilando manualmente il `develop` ramo GitHub, potresti introdurre modifiche sostanziali al tuo ambiente.   
Per questo motivo si consiglia di implementare il binario Polygon Edge esclusivamente dalle versioni, in quanto conterrà informazioni sulle modifiche sostanziali e su come superarle.
:::

Consultare l'[Installazione](/docs/edge/get-started/installation) per una panoramica completa del metodo di installazione.

### Archivio dati {#data-storage}

La cartella `data/` contenente l'intero stato della blockchain deve essere montata su un disco/volume dedicato consentendo
backup automatici del disco, estensione del volume e montaggio facoltativo del disco/volume su un'altra istanza in caso di errore.


### File di log {#log-files}

I file di log devono essere ruotati su base giornaliera (con uno strumento come `logrotate`).
:::warning
Se configurati senza rotazione del log, i file di log potrebbero esaurire tutto lo spazio su disco disponibile, il che potrebbe interrompere il tempo di attività del validatore
:::

Esempio di configurazione `logrotate`:
```
/home/ubuntu/polygon/logs/node.log
{
        rotate 7
        daily
        missingok
        notifempty
        compress
        prerotate
                /usr/bin/systemctl stop polygon-edge.service
        endscript
        postrotate
                /usr/bin/systemctl start polygon-edge.service
        endscript
}
```


Consultare la sezione [Logging](#logging) di seguito per consigli sull'archiviazione dei log.

### Dipendenze aggiuntive {#additional-dependencies}

`polygon-edge` è compilato in modo statico, senza richiedere ulteriori dipendenze del sistema operativo host.

## Manutenzione {#maintenance}

Di seguito sono riportate le procedure consigliate per la gestione di un nodo validatore in esecuzione di una rete Polygon Edge.

### Backup {#backup}

Per i nodi Polygon Edge sono consigliati due tipi di procedure di backup.

Il suggerimento è di utilizzare entrambi, quando possibile, con il backup Polygon Edge che è un'opzione sempre disponibile.

* ***Backup del volume***:    
Backup incrementale giornaliero del volume `data/` del nodo Polygon Edge o della VM completa, se possibile.


* ***Backup di Polygon Edge***:    
  Si consiglia un lavoro CRON giornaliero che esegue backup regolari di Polygon Edge e sposta i file `.dat` in una posizione fuori sede o in un archivio di oggetti cloud sicuro.

Il backup Polygon Edge idealmente non dovrebbe sovrapporsi al backup del volume descritto sopra.

Consultare l'[istanza del nodo di backup/ripristino](working-with-node/backup-restore) per istruzioni su come eseguire i backup di Polygon Edge.

### Logging {#logging}

I log generati dai nodi Polygon Edge dovrebbero:
- essere inviati a un archivio dati esterno con funzionalità di indicizzazione e ricerca
- avere un periodo di conservazione del log di 30 giorni

Se è la prima volta che configuri un validatore Polygon Edge, ti consigliamo di avviare il nodo con l'opzione `--log-level=DEBUG` per essere in grado di eseguire rapidamente il debug di eventuali problemi che potresti incontrare.

:::info

Il `--log-level=DEBUG` renderà l'output del log del nodo il più dettagliato possibile.   
I log del debug aumenteranno drasticamente la dimensione del file di log da tenere in considerazione durante l'impostazione della soluzione di rotazione del log.
:::
### Le patch di sicurezza del sistema operativo {#os-security-patches}

Gli amministratori devono assicurarsi che il sistema operativo dell'istanza del validatore sia sempre aggiornato con le patch più recenti almeno una volta al mese.

## Metriche {#metrics}

### Metriche di sistema {#system-metrics}

Gli amministratori devono configurare una sorta di monitoraggio delle metriche di sistema, (ad es. Telegraf + InfluxDB + Grafana o un SaaS di terze parti).

Metriche che devono essere monitorate e per le quali è necessario configurare le notifiche di allarme:

| Nome della metrica | Soglia di allarme |
|-----------------------|-------------------------------|
| Utilizzo della CPU (%) | > 90% per più di 5 minuti |
| Utilizzo della RAM (%) | > 90% per più di 5 minuti |
| Utilizzo del disco di root | > 90% |
| Utilizzo del disco dati | > 90% |

### Metriche del validatore {#validator-metrics}

Gli amministratori devono configurare la raccolta di metriche dall'API Prometheus di Polygon Edge per poter monitorare le prestazioni della blockchain.

Consulta le [metriche di Prometheus](configuration/prometheus-metrics) per capire quali metriche vengono esposte e come configurare la raccolta di metriche di Prometheus.


È necessario prestare un'attenzione supplementare alle seguenti metriche:
- ***Tempo di produzione del blocco*** - se il tempo di produzione del blocco è superiore al normale, esiste un potenziale problema con la rete
- ***Numero di round di consensus*** - se c'è più di 1 round, c'è un potenziale problema con il validatore impostato nella rete
- ***Numero di peer*** - se il numero di peer diminuisce, c'è un problema di connettività nella rete

## Sicurezza {#security}

Di seguito sono riportate le procedure consigliate per la protezione di un nodo validatore in esecuzione di una rete Polygon Edge.

### Servizi API {#api-services}

- ***JSON-RPC*** -
Solo il servizio API che deve essere esposto al pubblico (tramite bilanciatore del carico o direttamente).   
Questa API dovrebbe essere eseguita su tutte le interfacce o su un indirizzo IP specifico (esempio: `--json-rpc 0.0.0.0:8545` o `--json-prc 192.168.1.1:8545`  ).
:::info
Poiché si tratta di un'API pubblica, si consiglia di disporre di un bilanciatore di carico/proxy inverso di fronte ad essa per fornire sicurezza e limitazione della velocità.
:::


- ***LibP2P*** -
Questa è l'API di networking utilizzata dai nodi per la comunicazione peer. Deve essere eseguita su tutte le interfacce o su un indirizzo ip specifico ( `--libp2p 0.0.0.0:1478` o `--libp2p 192.168.1.1:1478` ). Questa API non deve essere esposta pubblicamente, ma dovrebbe essere raggiungibile da tutti gli altri nodi.
:::info

Se eseguito su localhost ( `--libp2p 127.0.0.1:1478` ) altri nodi non saranno in grado di connettersi.

:::


- ***GRPC*** -
Questa API viene utilizzata solo per eseguire i comandi dell'operatore e annotare altro. In quanto tale dovrebbe funzionare esclusivamente su localhost ( `--grpc-address 127.0.0.1:9632` ).

### Segreti di Polygon Edge {#polygon-edge-secrets}

I segreti di Polygon Edge ( `ibft` e `libp2p` le chiavi) devono essere memorizzati su un file system locale.  
Invece, dovrebbe essere utilizzato un [Secret Manager](configuration/secret-managers/set-up-aws-ssm) supportato.   
La memorizzazione dei segreti nel file system locale deve essere utilizzata solo in ambienti non di produzione.

## Aggiornamento {#update}

Di seguito è riportata la procedura di aggiornamento desiderata per i nodi validatori, descritta come istruzioni step-by-step.

### Procedura di aggiornamento {#update-procedure}

- Scarica l'ultimo binario Polygon Edge dalle [versioni](https://github.com/0xPolygon/polygon-edge/releases)ufficiali di GitHub
- Arresta il servizio Polygon Edge (esempio: `sudo systemctl stop polygon-edge.service` )
- Sostituisci il `polygon-edge` binario esistente con il binario scaricato (esempio: `sudo mv polygon-edge /usr/local/bin/` )
- Verifica se è disponibile la versione `polygon-edge` corretta eseguendo `polygon-edge version` - dovrebbe corrispondere alla versione di rilascio
- Controlla la documentazione di rilascio se sono necessari dei passaggi per la compatibilità con le versioni precedenti prima di avviare il servizio `polygon-edge`
- Avvia il servizio `polygon-edge` (esempio: `sudo systemctl start polygon-edge.service` )
- Infine, controlla `polygon-edge` l'output  del log  e assicurati che tutto sia in esecuzione senza alcun  log `[ERROR]`

:::warning
Quando è presente una versione di interruzione, questa procedura di aggiornamento deve essere eseguita su tutti i nodi poiché il binario attualmente in esecuzione non è compatibile con la nuova versione.

Ciò significa che la catena deve essere interrotta per un breve periodo di tempo (fino alla sostituzione dei binari `polygon-edge` e al riavvio del servizio)
quindi pianifica di conseguenza.

È possibile utilizzare strumenti come **[Ansible](https://www.ansible.com/)**  o alcuni script personalizzati per eseguire l'aggiornamento in modo efficiente
e minimizzare i tempi di inattività della catena.
:::

## Procedura di avvio {#startup-procedure}

Di seguito è riportato il flusso desiderato della procedura di avvio per il validatore Polygon Edge

- Leggi i documenti elencati nella sezione [Conoscenze di base](#knowledge-base)
- Applica le più recenti patch del sistema operativo sul nodo validatore
- Scarica l'ultimo binario `polygon-edge` dalle [versioni](https://github.com/0xPolygon/polygon-edge/releases) ufficiali di GitHub e inseriscilo nell'istanza locale `PATH`
- Inizializza uno dei [secrets manager](/docs/category/secret-managers) supportati utilizzando il `polygon-edge secrets generate` comando CLI
- Genera e memorizza i segreti utilizzando il `polygon-edge secrets init` [comando CLI](/docs/edge/get-started/cli-commands#secrets-init-flags)
- Prendi nota dei valori `NodeID` e `Public key (address)`
- Genera `genesis.json` file  come descritto nella [configurazione cloud](get-started/set-up-ibft-on-the-cloud#step-3-generate-the-genesis-file-with-the-4-nodes-as-validators) utilizzando il`polygon-edge genesis` [comando CLI](/docs/edge/get-started/cli-commands#genesis-flags)
- Genera il file di configurazione di predefinito utilizzando il `polygon-edge server export` [comando CLI](/docs/edge/configuration/sample-config)
- Modifica il file `default-config.yaml` perché si adatti all'ambiente del nodo validatore locale (percorsi di file, ecc.)
- Crea un servizio Polygon Edge ( `systemd` o simile ) dove il binario `polygon-edge` eseguirà il server da un file `default-config.yaml`
- Avvia il server Polygon Edge avviando il servizio (esempio: `systemctl start polygon-edge` )
- Controlla `polygon-edge` l'output del log e assicurati che i blocchi vengano generati e che non ci siano log `[ERROR]`
- Controlla la funzionalità della catena chiamando un metodo JSON-RPC come [`eth_chainId`](/docs/edge/api/json-rpc-eth#eth_chainid)

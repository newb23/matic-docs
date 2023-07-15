---
id: set-up-ibft-locally
title: Configurazione locale
description: "Guida alla configurazione locale passo dopo passo."
keywords:
  - docs
  - polygon
  - edge
  - local
  - setup
  - genesis
---

:::caution Questa guida è solo a scopo di test

La seguente guida ti spiega come configurare una rete Polygon Edge sul tuo computer locale per scopi di test e sviluppo.

La procedura differisce notevolmente dal modo in cui si dovrebbe impostare la rete Polygon Edge per uno scenario di utilizzo reale. un provider di cloud **[Cloud Setup](/docs/edge/get-started/set-up-ibft-on-the-cloud)**

:::


## Requisiti {#requirements}

Per installare Polygon Edge, consultare la sezione [Installazione](/docs/edge/get-started/installation).

## Panoramica {#overview}

![Configurazione locale](/img/edge/ibft-setup/local.svg)

In questa guida, il nostro obiettivo è stabilire una rete `polygon-edge`blockchain funzionante con [il protocollo di consenso IBFT](https://github.com/ethereum/EIPs/issues/650).
La rete blockchain sarà composta da 4 nodi, di cui tutti e 4 sono nodi validatori, e come tali sono idonei sia a proporre blocchi, sia a validare blocchi provenienti da altri proponenti. Tutti e 4 i nodi funzioneranno sulla stessa macchina, poiché l'idea di questa guida è di fornire un cluster IBFT completamente funzionale nel minor tempo possibile.

Per raggiungere questo obiettivo, ti guideremo attraverso 4 semplici passi:

1. L'inizializzazione delle directory di dati genererà le chiavi del validatore per ciascuno dei 4 nodi e inizializzerà le directory di dati della blockchain vuote. Le chiavi dei validatori sono importanti, perché dobbiamo avviare il blocco genesi con l'insieme iniziale di validatori, utilizzando queste chiavi.
2. La preparazione della stringa di connessione per il bootnode sarà l'informazione vitale per ogni nodo che verrà eseguito per sapere a quale nodo connettersi al primo avvio.
3. La generazione del `genesis.json`file richiederà come input sia le chiavi dei validatori generate nel **passo 1**, utilizzate per impostare i validatori iniziali della rete nel blocco genesi, sia la stringa di connessione del bootnode dal **passo 2**.
4. L'esecuzione di tutti i nodi è l'obiettivo finale di questa guida e sarà l'ultimo passo che faremo, istruiremo i nodi su quale directory di dati utilizzare e dove trovare il `genesis.json`che avvia lo stato iniziale della rete.

Poiché tutti e quattro i nodi saranno in esecuzione su localhost, durante il processo di configurazione si prevede che tutte le directory di dati per ciascuno dei nodi si trovino nella stessa directory madre.

:::info Numero di validatori

Non esiste un numero minimo di nodi in un cluster, il che significa che sono possibili cluster con un solo nodo validatore. Tieni presente che con un cluster _a singolo_ nodo non c'è **tolleranza agli arresti** anomali né **garanzia di BFT**.

Il numero minimo di nodi consigliato per ottenere una garanzia BFT è 4, poiché in un cluster di 4 nodi, il guasto di 1 nodo può essere tollerato, con i rimanenti 3 nodi che funzionano normalmente.

:::

## Passo 1: inizializzare le cartelle dati per IBFT e generare le chiavi del validatore {#step-1-initialize-data-folders-for-ibft-and-generate-validator-keys}

Per essere operativi con IBFT, è necessario inizializzare le cartelle dati, una per ogni nodo:

````bash
polygon-edge secrets init --data-dir test-chain-1
````

````bash
polygon-edge secrets init --data-dir test-chain-2
````

````bash
polygon-edge secrets init --data-dir test-chain-3
````

````bash
polygon-edge secrets init --data-dir test-chain-4
````

Ciascuno di questi comandi stamperà la chiave del validatore, la chiave pubblica bls e l'[ID del nodo](https://docs.libp2p.io/concepts/peer-id/). Per il passaggio successivo avrai bisogno dell'ID nodo del primo nodo.

### Output {#outputting-secrets}
L'uscita dei segreti può essere recuperata di nuovo, se necessario.

```bash
polygon-edge secrets output --data-dir test-chain-4
```

## Passo 2: preparare la stringa di connessione multiaddr per il bootnode {#step-2-prepare-the-multiaddr-connection-string-for-the-bootnode}

Affinché un nodo stabilisca con successo la connettività, deve sapere a quale `bootnode`server connettersi per ottenere informazioni su tutti i nodi rimanenti sulla rete. Nel gergo del p2p, il server `bootnode`è talvolta noto anche come server `rendezvous`.

`bootnode`non è un'istanza speciale del nodo Polygon Edge. Ogni nodo di Polygon Edge può fungere da `bootnode`, ma
ogni nodo di Polygon-Edge deve avere un insieme di bootnodes specificati che saranno contattati per fornire informazioni su come connettersi a tutti i nodi rimanenti nella rete.

Per creare la stringa di connessione per specificare il bootnode, occorre conformarsi al [formato multiaddr](https://docs.libp2p.io/concepts/addressing/):
```
/ip4/<ip_address>/tcp/<port>/p2p/<node_id>
```

In questa guida, tratteremo il primo e il secondo nodo come nodi di avvio per tutti gli altri nodi. Ciò che accadrà in questo caso
 è che i nodi che si connettono a `node 1` o `node 2` riceveranno informazioni su come connettersi l'uno all'altro tramite il
bootnode contattato reciprocamente.

:::info È necessario specificare almeno un bootnode per avviare un nodo

È richiesto almeno **un** bootnode, in modo che gli altri nodi della rete possano scoprirsi a vicenda. Si raccomanda un numero maggiore di bootnodes, in quanto forniscono resilienza alla rete in caso di interruzioni. In questa guida elencheremo due nodi, ma questo può essere cambiato all'istante, senza alcun impatto sulla validità del `genesis.json`file.
:::

Poiché siamo in esecuzione su localhost, è lecito supporre che `<ip_address>`sia`127.0.0.1`.


Per la porta `<port>`utilizzeremo, `10001`poiché in seguito configureremo il server libp2p perché`node 1` ascolti questa porta.

Infine, abbiamo bisogno di `<node_id>`che possiamo ricavare dall'output del comando `polygon-edge secrets init --data-dir test-chain-1`eseguito in precedenza (che è stato usato per generare le chiavi e le directory dei dati per il `node1`).


Dopo l'assemblaggio, la stringa di connessione multiaddr al `node 1`che useremo come bootnode avrà un aspetto simile a questo (solo il `<node_id>`che si trova alla fine dovrebbe essere diverso):
```
/ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW
```
Allo stesso modo, si costruisce il multiddr per il secondo bootnode come mostrato di seguito
```
/ip4/127.0.0.1/tcp/20001/p2p/16Uiu2HAmS9Nq4QAaEiogE4ieJFUYsoH28magT7wSvJPpfUGBj3Hq
```

:::info Nomi di host DNS al posto degli ip

Polygon Edge supporta l'uso di nomi host DNS per la configurazione dei nodi. Si tratta di una funzione molto utile per le distribuzioni basate sul cloud, dato che l'ip del nodo può cambiare per vari motivi.

Il formato mult
iddr per la stringa di connessione quando si utilizzano nomi di host DNS è il seguente:
`/dns4/sample.hostname.com/tcp/<port>/p2p/nodeid`

:::


## Passo 3: generare il file genesi con i 4 nodi come validatori {#step-3-generate-the-genesis-file-with-the-4-nodes-as-validators}

````bash
polygon-edge genesis --consensus ibft --ibft-validators-prefix-path test-chain- --bootnode /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW --bootnode /ip4/127.0.0.1/tcp/20001/p2p/16Uiu2HAmS9Nq4QAaEiogE4ieJFUYsoH28magT7wSvJPpfUGBj3Hq
````

Cosa fa questo comando:

* `--ibft-validators-prefix-path`imposta il percorso della cartella del prefisso a quello specificato che IBFT in Polygon Edge può
utilizzare. Questa directory è utilizzata per ospitare la cartella `consensus/`in cui è conservata la chiave privata del validatore. La
chiave pubblica del validatore è necessaria per costruire il file genesi - l'elenco iniziale dei nodi di avvio.
 Questo flag ha senso solo quando si configura la rete su localhost, poiché in uno scenario reale non ci si può aspettare che tutte le directory dei dati dei nodi si trovino sullo stesso filesystem da cui si possono leggere facilmente le loro chiavi pubbliche.
* Il `--bootnode`imposta l'indirizzo del bootnode che consentirà ai nodi di trovarsi a vicenda.
 Utilizzeremo la stringa multiaddr del  `node 1`, come indicato nel **passo 2**.


Il risultato di questo comando è il file `genesis.json` che contiene il blocco genesi della nostra nuova blockchain, con il validatore predefinito e la configurazione del nodo da contattare per primo per stabilire la connettività.

:::info Passare a ECDSA

BLS è la modalità di convalida predefinita delle intestazioni di blocco. Se vuoi che la tua catena venga eseguita in modalità ECDSA, puoi utilizzare la bandiera `—ibft-validator-type`, con la discussione `ecdsa`:

```
genesis --ibft-validator-type ecdsa
```
:::
:::info Saldi account che preminano

Probabilmente vorrai impostare la tua rete blockchain con alcuni indirizzi che hanno saldi "preminati".

Per fare ciò, si passano tutti i flag `--premine`che si vogliono per ogni indirizzo che si vuole inizializzare con un certo saldo
 sulla blockchain.

Ad esempio, se vogliamo preminare 1000 ETH all'indirizzo `0x3956E90e632AEbBF34DEB49b71c28A83Bc029862`nel nostro blocco genesi, dobbiamo fornire il seguente argomento:

```
--premine=0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000
```

**Si noti che l'importo preminato è in WEI, non in ETH.**

:::

:::info Imposta il limite gas del blocco

Il limite di gas predefinito per ogni blocco è `5242880`. Questo valore è scritto nel file genesi, ma puoi
 aumentarlo / abbassarlo.

Per farlo, è possibile utilizzare il flag `--block-gas-limit`seguito dal valore desiderato come di seguito indicato :

```shell
--block-gas-limit 1000000000
```

:::

:::info Impostare il limite dei descrittori di file di sistema

Il limite predefinito del descrittore di file (numero massimo di file aperti) su alcuni sistemi operativi è piuttosto ridotto. Se si prevede che i nodi abbiano un throughput elevato, si potrebbe considerare di aumentare questo limite a livello di sistema operativo.

Per la distribuzione Ubuntu la procedura è la seguente (se non si utilizza la distribuzione Ubuntu/Debian, controllare i documenti ufficiali del proprio sistema operativo) :
- Controllare i limiti attuali del sistema operativo (file aperti)
```shell title="ulimit -a"
ubuntu@ubuntu:~$ ulimit -a
core file size          (blocks, -c) 0
data seg size           (kbytes, -d) unlimited
scheduling priority             (-e) 0
file size               (blocks, -f) unlimited
pending signals                 (-i) 15391
max locked memory       (kbytes, -l) 65536
max memory size         (kbytes, -m) unlimited
open files                      (-n) 1024
pipe size            (512 bytes, -p) 8
POSIX message queues     (bytes, -q) 819200
real-time priority              (-r) 0
stack size              (kbytes, -s) 8192
cpu time               (seconds, -t) unlimited
max user processes              (-u) 15391
virtual memory          (kbytes, -v) unlimited
file locks                      (-x) unlimited
```

- Aumentare il limite dei file aperti
	- Localmente - influenza solo la sessione corrente:
	```shell
	ulimit -u 65535
	```
	- Globalmente o per utente (aggiunge i limiti alla fine del file /etc/security/limits.conf):
	```shell
	sudo vi /etc/security/limits.conf  # we use vi, but you can use your favorite text editor
	```
	```shell title="/etc/security/limits.conf"
	# /etc/security/limits.conf
	#
	#Each line describes a limit for a user in the form:
	#
	#<domain>        <type>  <item>  <value>
	#
	#Where:
	#<domain> can be:
	#        - a user name
	#        - a group name, with @group syntax
	#        - the wildcard *, for default entry
	#        - the wildcard %, can be also used with %group syntax,
	#                 for maxlogin limit
	#        - NOTE: group and wildcard limits are not applied to root.
	#          To apply a limit to the root user, <domain> must be
	#          the literal username root.
	#
	#<type> can have the two values:
	#        - "soft" for enforcing the soft limits
	#        - "hard" for enforcing hard limits
	#
	#<item> can be one of the following:
	#        - core - limits the core file size (KB)
	#        - data - max data size (KB)
	#        - fsize - maximum filesize (KB)
	#        - memlock - max locked-in-memory address space (KB)
	#        - nofile - max number of open file descriptors
	#        - rss - max resident set size (KB)
	#        - stack - max stack size (KB)
	#        - cpu - max CPU time (MIN)
	#        - nproc - max number of processes
	#        - as - address space limit (KB)
	#        - maxlogins - max number of logins for this user

	#        - maxsyslogins - max number of logins on the system
	#        - priority - the priority to run user process with
	#        - locks - max number of file locks the user can hold
	#        - sigpending - max number of pending signals
	#        - msgqueue - max memory used by POSIX message queues (bytes)
	#        - nice - max nice priority allowed to raise to values: [-20, 19]
	#        - rtprio - max realtime priority
	#        - chroot - change root to directory (Debian-specific)
	#
	#<domain>      <type>  <item>         <value>
	#

	#*               soft    core            0
	#root            hard    core            100000
	#*               hard    rss             10000
	#@student        hard    nproc           20
	#@faculty        soft    nproc           20
	#@faculty        hard    nproc           50
	#ftp             hard    nproc           0
	#ftp             -       chroot          /ftp
	#@student        -       maxlogins       4

	*               soft    nofile          65535
	*               hard    nofile          65535

	# End of file
	```
In alternativa, è possibile modificare altri parametri, salvare il file e riavviare il sistema. Dopo il riavvio, controllare nuovamente il limite del descrittore di file. Deve essere impostato sul valore definito nel file limits.conf.

:::


## Passo 4: eseguire tutti i client {#step-4-run-all-the-clients}

Poiché si sta tentando di eseguire una rete Polygon Edge composta da 4 nodi tutti sulla stessa macchina, è necessario prestare attenzione a
evitare conflitti tra le porte. Per questo motivo utilizzeremo il seguente ragionamento per determinare le porte di ascolto di ciascun server di un nodo:

- `10000`per il server gRPC di `node 1`, `20000`per il server GRPC di `node 2`, ecc.
- `10001`per il server libp2p di `node 1`, `20001`per il server libp2p di `node 2`, ecc.
- `10002`per il server JSON-RPC di `node 1`, `20002`per il server JSON-RPC di `node 2`, ecc..

Per eseguire il **primo** client (notare la porta, `10001`poiché è stata usata come parte del multiaddr di libp2p nel **passo 2** insieme all'ID del nodo 1):

````bash
polygon-edge server --data-dir ./test-chain-1 --chain genesis.json --grpc-address :10000 --libp2p :10001 --jsonrpc :10002 --seal
````

Per eseguire il **secondo** client:

````bash
polygon-edge server --data-dir ./test-chain-2 --chain genesis.json --grpc-address :20000 --libp2p :20001 --jsonrpc :20002 --seal
````

Per eseguire il **terzo** client:


````bash
polygon-edge server --data-dir ./test-chain-3 --chain genesis.json --grpc-address :30000 --libp2p :30001 --jsonrpc :30002 --seal
````

Per eseguire il **quarto** client:

````bash
polygon-edge server --data-dir ./test-chain-4 --chain genesis.json --grpc-address :40000 --libp2p :40001 --jsonrpc :40002 --seal
````

Ripercorriamo brevemente ciò che è stato fatto finora:

* La directory per i dati del client è stata specificata come **./test-chain-\***
* I server GRPC sono stati avviati sulle porte **10000**, **20000**, **30000** e **40000**, rispettivamente per ogni nodo.
* I server libp2p sono stati avviati sulle porte **10001**, **20001**, **30001** e **40001**, rispettivamente per ogni nodo.
* I server JSON-RPC sono stati avviati sulle porte **10002**, **20002**, **30002** e **40002**, rispettivamente per ogni nodo.
* Il flag *sigillo* indica che il nodo avviato parteciperà alla sigillatura dei blocchi.
* Il flag *catena* specifica quale file di genesi deve essere usato per la configurazione della catena.

La struttura del file genesi è descritta nella sezione [Comandi CLI](/docs/edge/get-started/cli-commands).

Dopo aver eseguito i comandi precedenti, è stata configurata una rete Polygon Edge a 4 nodi, in grado di sigillare i blocchi e di riprendersi
dal guasto di un nodo.

:::info Avvia il client utilizzando il file di configurazione

Invece di specificare tutti i parametri di configurazione come argomenti della CLI, il Client può essere avviato anche utilizzando un file di configurazione, eseguendo il seguente comando:

````bash
polygon-edge server --config <config_file_path>
````
Esempio:

````bash
polygon-edge server --config ./test/config-node1.json
````
Attualmente, supportiamo `yaml`e `json`basiamo i file di configurazione, campioni i file di config possono essere trovati **[qui](/docs/edge/configuration/sample-config)**

:::

:::info Passaggi per eseguire un nodo non validatore

Un nodo non validatore sincronizzerà sempre gli ultimi blocchi ricevuti dal nodo validatore; è possibile avviare un nodo non validatore eseguendo il seguente comando.

````bash
polygon-edge server --data-dir <directory_path> --chain <genesis_filename> --grpc-address <portNo> --libp2p <portNo> --jsonrpc <portNo>
````
Ad esempio, è possibile aggiungere il **quinto** client Non-validatore eseguendo il seguente comando:

````bash
polygon-edge server --data-dir ./test-chain --chain genesis.json --grpc-address :50000 --libp2p :50001 --jsonrpc :50002
````
:::

:::info Specificare il limite di prezzo

Un nodo Polygon Edge può essere avviato con un **limite di prezzo** impostato per le transazioni in entrata.

L'unità per il limite di prezzo è `wei`.

L'impostazione di un limite di prezzo significa che qualsiasi transazione elaborata dal nodo corrente dovrà avere un prezzo del gas **superiore** al limite di prezzo impostato, altrimenti non sarà inclusa in un blocco.

Se la maggioranza dei nodi rispetta un certo limite di prezzo, viene applicata la regola che le transazioni nella rete non possono essere inferiori a una certa soglia di prezzo.

Il valore predefinito per il limite di prezzo è `0`, il che significa che per impostazione predefinita non viene applicato.

Esempio di utilizzo del flag `--price-limit`:
````bash
polygon-edge server --price-limit 100000 ...
````

Vale la pena notare che i limiti di prezzo **vengono applicati solo alle transazioni non locali**, il che significa
che il limite di prezzo non si applica alle transazioni aggiunte localmente sul nodo.
:::

:::info URL WebSocket
Per impostazione predefinita, quando si esegue Polygon Edge, viene generato un URL WebSocket basato sulla posizione della catena. Lo schema URL `wss://`viene utilizzato per i collegamenti HTTPS e `ws://`per HTTP.

URL Localhost WebSocket:
````bash
ws://localhost:10002/ws
````
Notare che il numero di porta dipende dalla porta JSON-RPC scelta per il nodo.

URL Edgenet WebSocket:
````bash
wss://rpc-edgenet.polygon.technology/ws
````
:::



## Passo 5: interagire con la rete di Polygon Edge {#step-5-interact-with-the-polygon-edge-network}

Ora che hai configurato almeno un client funzionante, puoi interagire con la blockchain usando l'account che hai preimpostato sopra e specificando l'URL JSON-PRC a uno qualsiasi dei 4 nodi:
- Nodo 1: `http://localhost:10002`
- Nodo 2: `http://localhost:20002`
- Nodo 3: `http://localhost:30002`
- Nodo 4: `http://localhost:40002`

Segui questa guida per impartire i comandi dell'operatore al cluster appena costruito: [Come ricercare le informazioni sull'operatore ](/docs/edge/working-with-node/query-operator-info) (le porte GRPC per il cluster che abbiamo costruito sono rispettivamente `10000`/`20000`/`30000`/`40000` per ogni nodo)

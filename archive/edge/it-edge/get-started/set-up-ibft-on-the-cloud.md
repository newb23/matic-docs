---
id: set-up-ibft-on-the-cloud
title: Configurazione del cloud
description: "Guida alla configurazione del cloud step-by-step."
keywords:
  - docs
  - polygon
  - edge
  - cloud
  - setup
  - genesis
---

:::info Questa guida è per le configurazioni mainnet o testnet

La guida seguente ti spiegherà come configurare una rete Polygon Edge su un provider cloud per una configurazione di produzione della tua testnet o mainnet.

Se desideri configurare una rete Polygon Edge localmente per testare rapidamente `polygon-edge` prima di effettuare una configurazione simile alla produzione, fare riferimento a
**[Configurazione locale](/docs/edge/get-started/set-up-ibft-locally)**
:::

## Requisiti {#requirements}

Per installare Polygon Edge, consultare la sezione [Installazione](/docs/edge/get-started/installation).

### Configurazione della connettività VM {#setting-up-the-vm-connectivity}

A seconda della scelta del provider cloud, puoi configurare la connettività e le regole tra le VM utilizzando un firewall, gruppi di sicurezza o elenchi di controllo degli accessi.

Poiché l'unica parte di `polygon-edge` che deve essere esposta ad altre VM è il server libp2p, è sufficiente consentire semplicemente
tutte le comunicazioni tra VM sulla porta libp2p predefinita `1478`.

## Panoramica {#overview}

![Configurazione del cloud](/img/edge/ibft-setup/cloud.svg)

In questa guida, il nostro obiettivo è stabilire una rete `polygon-edge`blockchain funzionante con [il protocollo di consenso IBFT](https://github.com/ethereum/EIPs/issues/650).
La rete blockchain sarà composta da 4 nodi, di cui tutti e 4 sono nodi validatori, e come tali sono idonei sia a proporre blocchi, sia a validare blocchi provenienti da altri proponenti. Ciascuno dei 4 nodi verrà eseguito sulla propria VM, poiché l'idea di questa guida è quella di fornire una rete Polygon Edge completamente funzionale mantenendo private le chiavi del validatore per garantire una configurazione di rete affidabile.

Per raggiungere questo obiettivo, ti guideremo attraverso 4 semplici passi:

0. Dai un'occhiata all'elenco dei **Requisiti** sopra
1. Genera le chiavi private per ciascuno dei validatori e inizializza la directory dei dati
2. Prepara la stringa di connessione per il bootnode da inserire nel `genesis.json` condiviso
3. Crea il `genesis.json` sulla tua macchina locale e invialo/trasferiscilo a ciascuno dei nodi
4. Avvia tutti i nodi

:::info Numero di validatori

Non esiste un numero minimo di nodi in un cluster, il che significa che sono possibili cluster con un solo nodo validatore. Tieni presente che con un cluster _a singolo_ nodo non c'è **tolleranza agli arresti** anomali né **garanzia di BFT**.

Il numero minimo di nodi consigliato per ottenere una garanzia BFT è 4, poiché in un cluster di 4 nodi, il guasto di 1 nodo può essere tollerato, con i rimanenti 3 nodi che funzionano normalmente.

:::

## Passo 1: Inizializzare le cartelle di dati e generare le chiavi del validatore {#step-1-initialize-data-folders-and-generate-validator-keys}

Per iniziare ad utilizzare Polygon Edge, è necessario inizializzare le cartelle di dati, su ciascun nodo:


````bash
node-1> polygon-edge secrets init --data-dir data-dir
````

````bash
node-2> polygon-edge secrets init --data-dir data-dir
````

````bash
node-3> polygon-edge secrets init --data-dir data-dir
````

````bash
node-4> polygon-edge secrets init --data-dir data-dir
````

Ciascuno di questi comandi stamperà la chiave del validatore, la chiave pubblica bls e l'[ID del nodo](https://docs.libp2p.io/concepts/peer-id/). Per il passaggio successivo avrai bisogno dell'ID nodo del primo nodo.

### Output {#outputting-secrets}
L'uscita dei segreti può essere recuperata di nuovo, se necessario.

```bash
polygon-edge secrets output --data-dir test-chain-4
```

:::warning Tieni per te la directory dei tuoi dati!

Le directory di dati generate sopra, oltre a inizializzare le directory per la gestione dello stato della blockchain, genereranno anche le chiavi private del tuo validatore. **Questa chiave deve essere mantenuta segreta, poiché se qualcuno te la rubasse sarebbe in grado di impersonarti come validatore nella rete!**

:::

## Passo 2: preparare la stringa di connessione multiaddr per il bootnode {#step-2-prepare-the-multiaddr-connection-string-for-the-bootnode}

Affinché un nodo stabilisca con successo la connettività, deve sapere a quale server `bootnode` connettersi per ottenere
informazioni su tutti i nodi rimanenti sulla rete. Nel gergo del p2p, il `bootnode`è talvolta noto anche come server `rendezvous`.

`bootnode` non è un'istanza speciale di un nodo Polygon Edge. Ogni nodo Polygon Edge può fungere da `bootnode` e
ogni nodo Polygon Edge deve avere un set di bootnodes specificato che verrà contattato per fornire informazioni su come connettersi con tutti i nodi rimanenti nella rete.

Per creare la stringa di connessione per specificare il bootnode, occorre conformarsi al [formato multiaddr](https://docs.libp2p.io/concepts/addressing/):
```
/ip4/<ip_address>/tcp/<port>/p2p/<node_id>
```

In questa guida, tratteremo il primo e il secondo nodo come nodi di avvio per tutti gli altri nodi. Ciò che accadrà in questo caso
 è che i nodi che si connettono a `node 1` o `node 2` riceveranno informazioni su come connettersi l'uno all'altro tramite il
bootnode contattato reciprocamente.

:::info È necessario specificare almeno un bootnode per avviare un nodo

È richiesto almeno **un** bootnode, in modo che gli altri nodi della rete possano scoprirsi a vicenda. Si raccomanda un numero maggiore di bootnodes, in quanto forniscono resilienza alla rete in caso di interruzioni. In questa guida elencheremo due nodi, ma questo può essere modificato all'istante, senza alcun impatto sulla validità del file `genesis.json`.
:::

Poiché la prima parte della stringa di connessione multiaddr è `<ip_address>`, qui dovrai inserire l'indirizzo IP come raggiungibile da altri nodi; a seconda della tua configurazione, potrebbe essere un indirizzo IP privato o pubblico, non `127.0.0.1`.

Per `<port>` utilizzeremo `1478`, poiché è la porta libp2p predefinita.

Infine, abbiamo bisogno di `<node_id>`che possiamo ricavare dall'output del comando `polygon-edge secrets init --data-dir data-dir`eseguito in precedenza (che è stato usato per generare le chiavi e le directory dei dati per il `node 1`)

Dopo l'assemblaggio, la stringa di connessione multiaddr al `node 1`che useremo come bootnode avrà un aspetto simile a questo (solo il `<node_id>`che si trova alla fine dovrebbe essere diverso):
```
/ip4/<public_or_private_ip>/tcp/1478/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW
```
Allo stesso modo, si costruisce il multiddr per il secondo bootnode come mostrato di seguito
```
/ip4/<public_or_private_ip>/tcp/1478/p2p/16Uiu2HAmS9Nq4QAaEiogE4ieJFUYsoH28magT7wSvJPpfUGBj3Hq
```
:::info Nomi di host DNS al posto degli ip

Polygon Edge supporta l'uso di nomi host DNS per la configurazione dei nodi. Si tratta di una funzione molto utile per le distribuzioni basate sul cloud, dato che l'ip del nodo può cambiare per vari motivi.

Il formato mult
iddr per la stringa di connessione quando si utilizzano nomi di host DNS è il seguente:
`/dns4/sample.hostname.com/tcp/<port>/p2p/nodeid`

:::

## Passo 3: generare il file genesi con i 4 nodi come validatori {#step-3-generate-the-genesis-file-with-the-4-nodes-as-validators}

Questo passaggio può essere eseguito sulla tua macchina locale, ma avrai bisogno delle chiavi pubbliche del validatore per ciascuno dei 4 validatori.

I validatori possono condividere in modo sicuro il `Public key (address)` come mostrato di seguito nell'output ai loro comandi `secrets init`, in modo
da poter generare in modo sicuro il genesis.json con quei validatori nel set di validatori iniziale, identificati dalle loro chiavi pubbliche:

```
[SECRETS INIT]
Public key (address) = 0xC12bB5d97A35c6919aC77C709d55F6aa60436900
BLS Public key       = 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf
Node ID              = 16Uiu2HAmVZnsqvTwuzC9Jd4iycpdnHdyVZJZTpVC8QuRSKmZdUrf
```

Dato che hai ricevuto tutte e 4 le chiavi pubbliche dei validatori, puoi eseguire il seguente comando per generare il `genesis.json`

````bash
polygon-edge genesis --consensus ibft --ibft-validator 0xC12bB5d97A35c6919aC77C709d55F6aa60436900:0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --ibft-validator <2nd validator IBFT public key>:<2nd validator BLS public key> --ibft-validator <3rd validator IBFT public key>:<3rd validator BLS public key> --ibft-validator <4th validator IBFT public key>:<4th validator BLS public key> --bootnode=<first_bootnode_multiaddr_connection_string_from_step_2> --bootnode <second_bootnode_multiaddr_connection_string_from_step_2> --bootnode <optionally_more_bootnodes>
````

Cosa fa questo comando:

* Il `--ibft-validator` imposta la chiave pubblica del validatore che dovrebbe essere inclusa nel set di validazione iniziale nel blocco di genesi. Ci possono essere molti validatori iniziali.
* Il `--bootnode`imposta l'indirizzo del bootnode che consentirà ai nodi di trovarsi a vicenda.
 Useremo la stringa multiaddr di `node 1`, come indicato nel **passo 2**, anche se aggiungi tutti i bootnodes che vuoi, come mostrato sopra.

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

Dopo aver specificato ciò che segue:
1. Chiavi pubbliche dei validatori da includere nel blocco di genesi come set di validatori
2. Stringhe di connessione multiaddr Bootnode
3. Conti e saldi pre-minati da includere nel blocco di genesi

e generare `genesis.json`, dovresti copiarlo su tutte le VM della rete. A seconda della tua configurazione, puoi copiarlo/incollarlo, inviarlo all'operatore del nodo o semplicemente procedere al SCP/FTP.

La struttura del file genesi è descritta nella sezione [Comandi CLI](/docs/edge/get-started/cli-commands).

## Passo 4: eseguire tutti i client {#step-4-run-all-the-clients}

:::note Networking sui provider di cloud

La maggior parte dei provider di cloud non espone gli indirizzi IP (specialmente quelli pubblici) come interfaccia di rete diretta sulla tua VM, ma piuttosto configura un proxy NAT invisibile.


Per consentire ai nodi di connettersi tra loro in questo caso dovresti ascoltare l'indirizzo IP `0.0.0.0` per associare tutte le interfacce, ma dovresti comunque specificare l'indirizzo IP o l'indirizzo DNS che altri nodi possono utilizzare per connettersi alla tua istanza. Ciò si ottiene utilizzando l'argomento `--nat` o `--dns` in cui è possibile specificare rispettivamente l'indirizzo IP o DNS esterno.

#### Esempio {#example}

L'indirizzo IP associato su cui desideri ascoltare è `192.0.2.1`, ma non è direttamente collegato a nessuna delle tue interfacce di rete.

Per consentire ai nodi di connettersi, devi passare i seguenti parametri:

`polygon-edge ... --libp2p 0.0.0.0:10001 --nat 192.0.2.1`

Oppure, se desideri specificare un indirizzo DNS `dns/example.io`, passa i seguenti parametri:

`polygon-edge ... --libp2p 0.0.0.0:10001 --dns dns/example.io`

Ciò renderebbe il tuo nodo in ascolto su tutte le interfacce, ma lo renderebbe anche consapevole che i client si stanno connettendo ad esso tramite l'indirizzo `--nat` o `--dns` specificato.

:::

Per eseguire il **primo** client:


````bash
node-1> polygon-edge server --data-dir ./data-dir --chain genesis.json  --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

Per eseguire il **secondo** client:

````bash
node-2> polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

Per eseguire il **terzo** client:


````bash
node-3> polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

Per eseguire il **quarto** client:

````bash
node-4> polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

Dopo aver eseguito i comandi precedenti, è stata configurata una rete Polygon Edge a 4 nodi, in grado di sigillare i blocchi e di riprendersi dal guasto di un nodo.

:::info Avvia il client utilizzando il file di configurazione

Invece di specificare tutti i parametri di configurazione come argomenti della CLI, il Client può essere avviato anche utilizzando un file di configurazione, eseguendo il seguente comando:

````bash
polygon-edge server --config <config_file_path>
````
Esempio:

````bash
polygon-edge server --config ./test/config-node1.json
````
Attualmente, supportiamo solo il file di configurazione `json`basato, il file di config può essere trovato **[qui](/docs/edge/configuration/sample-config)**

:::

:::info Passaggi per eseguire un nodo non validatore

Un nodo non validatore sincronizzerà sempre gli ultimi blocchi ricevuti dal nodo validatore; è possibile avviare un nodo non validatore eseguendo il seguente comando.

````bash
polygon-edge server --data-dir <directory_path> --chain <genesis_filename>  --libp2p <IPAddress:PortNo> --nat <public_or_private_ip>
````
Ad esempio, è possibile aggiungere il **quinto** client Non-validatore eseguendo il seguente comando:

````bash
polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat<public_or_private_ip>
````
:::

:::info Specificare il limite di prezzo

Un nodo Polygon Edge può essere avviato con un **limite di prezzo** impostato per le transazioni in entrata.

L'unità per il limite di prezzo è `wei`.

L'impostazione di un limite di prezzo significa che qualsiasi transazione elaborata dal nodo corrente dovrà avere un gas price **superiore** al limite di prezzo impostato, altrimenti non verrà inserito in un blocco.

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

---
id: set-up-ibft-locally
title: Lokale Einrichtung
description: "Schritt-für-Schritt lokaler Setup Guide."
keywords:
  - docs
  - polygon
  - edge
  - local
  - setup
  - genesis
---

:::caution Dieser Leitfaden dient nur zu Prüfungszwecken

Der folgende Leitfaden wird dich anweisen, wie du ein Polygon Edge Netzwerk auf deinem lokalen Rechner für das Testen und die Entwicklung einrichtest Zwecke.

Die Prozedur unterscheidet sich erheblich von der Art und Weise, wie du das Polygon Edge Netzwerk für ein echtes Anwendungsszenario einrichten möchtest. a Cloud Provider: **[Cloud Setup](/docs/edge/get-started/set-up-ibft-on-the-cloud)**

:::


## Voraussetzungen {#requirements}

Siehe [Installation](/docs/edge/get-started/installation) zur Installation von Polygon Edge.

## Übersicht {#overview}

![Lokale Einrichtung](/img/edge/ibft-setup/local.svg)

In diesem Leitfaden geht es darum, ein funktionierendes `polygon-edge` Blockchain-Netzwerk aufzubauen, das mit dem [IBFT-Konsensprotokoll](https://github.com/ethereum/EIPs/issues/650) arbeitet.
Das Blockchain-Netzwerk wird aus 4 Knoten bestehen, von denen alle 4 Prüfknoten sind. Als solche sind sie berechtigt, sowohl Blöcke vorzuschlagen als auch Blöcke zu validieren, die von anderen Vorschlagenden stammen.
Alle 4 Knoten werden auf dem gleichen Rechner laufen, da die Idee dieses nodes ist, dir in der minimalen Menge an Zeit einen voll funktionsfähigen IBFT Cluster zu geben.

Um das zu erreichen, führen wir dich durch 4 einfache Schritte:

1. Initialisierung von Datenverzeichnissen generiert beide validator keys für jeden der 4 Knoten und initialisiert leere blockchain Verzeichnissen. Die Validator-Schlüssel sind wichtig, da wir den genesis Block mit dem ersten Satz von Validatoren bootstrap müssen, die diese Schlüssel verwenden.
2. Die Vorbereitung der Verbindungszeichenfolge für den bootnode wird die lebenswichtige Information für jeden Knoten sein, mit dem wir ausführen werden, wie welchem Knoten wir dich verbinden sollen, wenn du das erste Mal beginnst.
3. Die Generierung der  `genesis.json`Datei erfordert als Eingabe beide die in **Schritt 1** **generierten** validator keys , die für die Einstellung der ursprünglichen validators des Netzwerks im genesis Block und die bootnode Connection String aus Schritt 2 verwendet werden.
4. Wenn wir alle Knoten ausführen möchten, ist das Endziel dieses Leitfadens und wird der letzte Schritt sein, den wir tun. Wir werden die anweisen, welches Datenverzeichnis zu verwenden ist und wo wir die finden die , `genesis.json`die den ursprünglichen Netzwerkzustand bootstraps

Da alle vier Knoten auf localhost laufen, wird während des setup erwartet, dass alle Datenverzeichnisse
für jeden der Knoten im selben übergeordneten Verzeichnis sind.

:::info Anzahl der Prüfer

Es gibt keine Mindestanzahl von Knoten in einem Cluster, d. h. Cluster mit nur einem Prüfknoten sind möglich.
Bedenke, dass es bei einem _Einzelknotencluster_ **keine Absturztoleranz** und **keine BFT-Garantie** gibt.

Die empfohlene Mindestanzahl von Knoten, um eine BFT-Garantie zu erreichen, ist 4, denn in einem Cluster mit 4 Knoten kann der Ausfall
eines Knotens toleriert werden, während die übrigen 3 normal funktionieren.

:::

## Schritt 1: Initialisiere Datenordner für IBFT und generiere validator {#step-1-initialize-data-folders-for-ibft-and-generate-validator-keys}

Um mit IBFT aufstehen und laufen zu können, musst du die Datenordner initialisieren. für jeden Knoten:

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

Jeder dieser Befehle gibt den Validator Key, den öffentlichen Key und die [Knoten-ID](https://docs.libp2p.io/concepts/peer-id/) aus. Für den nächsten Schritt benötigst du die Knoten-ID des ersten Knotens.

### Ausgabe von Secrets {#outputting-secrets}
Die Ausgabe der Secrets kann bei Bedarf wieder abgerufen werden.

```bash
polygon-edge secrets output --data-dir test-chain-4
```

## Schritt 2: Bereite den Multiaddr-Verbindungsstring für den Bootknode vor {#step-2-prepare-the-multiaddr-connection-string-for-the-bootnode}

Damit ein Knoten erfolgreich eine Verbindung herstellen kann, muss er wissen, mit welchem  `bootnode`Server er sich verbinden muss,
um Informationen über alle anderen Knoten im Netzwerk zu erhalten. Der `bootnode` wird im P2P-Jargon manchmal auch als `rendezvous` Server bezeichnet.

`bootnode`ist keine besondere Instanz des polygon edge Knoten. `bootnode`Jeder polygon-edge kann als ein , aber jeder polygon-edge muss einen Satz von Bootknoten angegeben haben, die kontaktiert werden können, um Informationen darüber zu liefern, man sich mit wie man sich mit allen übrigen Knoten im Netzwerk verbindet.

Um den Verbindungsstring für die Angabe des Bootnodes zu erstellen,
müssen wir das [multiaddr-Format](https://docs.libp2p.io/concepts/addressing/) einhalten:
```
/ip4/<ip_address>/tcp/<port>/p2p/<node_id>
```

In diesem Leitfaden werden wir den ersten und zweiten Knoten als Bootnode für alle anderen Knoten behandeln. In diesem Szenario
werden die Knoten, die sich mit dem `node 1` oder `node 2` verbinden, Informationen darüber erhalten, wie sie sich über den gegenseitig kontaktierten Bootnode miteinander
verbinden können.

:::info Du musst mindestens einen Bootnode angeben, um einen Knoten zu beginnen

Mindestens **ein** Bootnode ist erforderlich, damit sich andere Knoten im Netzwerk finden können. Es werden mehrere Bootnodes empfohlen, da
sie das Netzwerk im Falle von Ausfällen schützen.
In diesem Leitfaden werden wir zwei Knoten auflisten (kann spontan geändert werden), ohne dass dies Auswirkungen auf die Gültigkeit der `genesis.json` Datei hat.
:::

Da wir auf localhost laufen, ist es sicher, zu glauben, dass der  `<ip_address>``127.0.0.1`ist.

Für die  werden `<port>`wir  verwenden, `10001`da wir den libp2p Server für  konfigurieren, um diesen Port später `node 1`zu hören.

Und schließlich brauchen wir die `<node_id>`, die wir aus der Ausgabe des zuvor ausgeführten Befehls `polygon-edge secrets init --data-dir test-chain-1` (mit dem die Keys und Datenverzeichnisse für die `node1` erzeugt wurden) erhalten können

Nach dem Assembly sieht der Multiaddr-Verbindungsstring zu der `node 1`, die wir als Bootnode verwenden werden, etwa so aus (nur die `<node_id>` am Ende sollte anders sein):
```
/ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW
```
In ähnlicher Weise konstruieren wir Multiaddr für den zweiten Bootnode wie unten gezeigt
```
/ip4/127.0.0.1/tcp/20001/p2p/16Uiu2HAmS9Nq4QAaEiogE4ieJFUYsoH28magT7wSvJPpfUGBj3Hq
```

:::info DNS-Hostnamen anstelle von ips

Polygon Edge unterstützt die Verwendung von DNS-Hostnamen für die Konfiguration der Knoten. Dies ist eine sehr hilfreiche Funktion für cloudbasierte Einsätze, da sich die IP des Knotens aus verschiedenen Gründen ändern kann.

Das multiaddr-Format für den Verbindungsstring bei der Verwendung von DNS-Hostnamen lautet wie folgt:
`/dns4/sample.hostname.com/tcp/<port>/p2p/nodeid`

:::


## Schritt 3: Erstelle die Genesis-Datei mit den 4 Knoten als Prüfer {#step-3-generate-the-genesis-file-with-the-4-nodes-as-validators}

````bash
polygon-edge genesis --consensus ibft --ibft-validators-prefix-path test-chain- --bootnode /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW --bootnode /ip4/127.0.0.1/tcp/20001/p2p/16Uiu2HAmS9Nq4QAaEiogE4ieJFUYsoH28magT7wSvJPpfUGBj3Hq
````

Was dieser Befehl tut:

* Der  `--ibft-validators-prefix-path`setzt den prefix auf den angegebenen Pfad, den IBFT in Polygon Edge bestimmt, der verwendet werden kann. Dieses Verzeichnis wird verwendet, um den  `consensus/`Ordner zu unterhalten, in dem der private Schlüssel des Prüfers aufbewahrt wird. Der öffentliche Schlüssel des Prüfers wird benötigt, um die Genesis-Datei zu erstellen - die erste Liste der Bootstrap Knoten. Diese Flag macht nur Sinn, wenn das Netzwerk auf localhost eingerichtet ist, da wir in einem realen Szenario nicht alle erwarten können die Datenverzeichnisse der Knoten, um auf dem gleichen Dateisystem zu sein, von dem wir ihre öffentlichen Schlüssel leicht lesen können.
* Der `--bootnode` legt die Adresse des Bootnodes fest, über die sich die Knoten gegenseitig finden können. Wir werden den multiaddr des , wie in **Schritt 2** `node 1`erwähnt, verwenden.

Das Ergebnis dieses Befehls ist die  `genesis.json`Datei, die den Genesis-Block unserer neuen Blockchain enthält, mit dem vordefinierten validator und die Konfiguration, für die der Knoten zuerst kontaktiert werden soll, um die Konnektivität zu etablieren.

:::info Wechseln zu ECDSA

BLS ist der default von block Wenn du möchtest, dass deine Chain im ECDSA Modus läuft, kannst du die `—ibft-validator-type`Flagge verwenden, mit dem Argument `ecdsa`:

```
genesis --ibft-validator-type ecdsa
```
:::
:::info Premining der Kontosalden

Wahrscheinlich wirst du dein Blockchain-Netzwerk so einrichten wollen, dass einige Adressen bereits vorabgebaute (Pre-Mining) Salden haben.

Um dies zu erreichen, übergibst du so viele `--premine` Flags wie du willst pro Adresse, die mit einem bestimmten Saldo
auf der Blockchain initialisiert werden soll.

Wenn wir zum Beispiel 1000 ETH an die Adresse `0x3956E90e632AEbBF34DEB49b71c28A83Bc029862` in unserem Genesis-Block preminen möchten, müssen wir das folgende Argument angeben:

```
--premine=0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000
```

**Beachte, dass der vorausbezahlte Betrag in WEI und nicht in ETH angegeben ist.**

:::

:::info Stelle das Blockgaslimit ein

Der Standard-Gasgrenzwert für jeden Block ist `5242880`. Dieser Wert steht in der Genesis-Datei. Du kannst ihn aber auch
erhöhen oder verringern.

Dazu kannst du das Flag `--block-gas-limit` verwenden, gefolgt von dem gewünschten Wert, wie unten gezeigt:

```shell
--block-gas-limit 1000000000
```

:::

:::info Setze das Limit für Systemdateideskriptoren

Die Standardgrenze für Dateideskriptoren (maximale Anzahl der geöffneten Dateien) ist auf einigen Betriebssystemen ziemlich niedrig.
Wenn von den Knoten ein hoher Durchsatz erwartet wird, kannst du in Erwägung ziehen, diese Grenze auf Betriebssystemebene zu erhöhen.

Für die Ubuntu-Distribution ist die Vorgehensweise wie folgt (wenn du keine Ubuntu/Debian-Distribution verwendest, siehe die offiziellen Dokumenten für dein Betriebssystem):
- Überprüfe aktuelle Betriebssystemgrenzen (offene Dateien)
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

- Erhöhe das Limit für offene Dateien
	- Lokal - betrifft nur die aktuelle Sitzung:
	```shell
	ulimit -u 65535
	```
	- Global oder pro Benutzer (Grenzen am Ende der Datei /etc/security/limits.conf hinzufügen):
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
Optional kannst du weitere Parameter ändern, die Datei speichern und das System neu starten. Überprüfe nach dem Neustart erneut das Limit des Dateideskriptors.
Dieser sollte auf den Wert gesetzt werden, den du in der Datei limits.conf festgelegt hast.

:::


## Schritt 4: Führe alle Clients aus {#step-4-run-all-the-clients}

Da wir versuchen, ein Polygon Edge-Netzwerk zu betreiben, das aus 4 Knoten besteht, die alle auf demselben Rechner bestehen, müssen wir darauf achten, Konflikte zu vermeiden. Deshalb werden wir die folgende Argumentation verwenden, um die listening jedes Servers eines Knotens zu bestimmen:

- `10000`für den gRPC von `node 1`,  `20000`für den GRPC Server von `node 2`, etc.
- `10001``node 2`für den libp2p Server von `node 1`,  `20001`für den Server , etc.
- `10002`für den JSON-RPC-Server von `node 1`,  `20002`für den JSON-RPC-Server von `node 2`, etc.

Um den **ersten** Client auszuführen (beachte den Port , `10001`da er in **Schritt 2** neben der Knoten-ID des Knoten 1 als Teil des libp2p Multiaddr verwendet wurde):

````bash
polygon-edge server --data-dir ./test-chain-1 --chain genesis.json --grpc-address :10000 --libp2p :10001 --jsonrpc :10002 --seal
````

Um den **zweiten** Client auszuführen:

````bash
polygon-edge server --data-dir ./test-chain-2 --chain genesis.json --grpc-address :20000 --libp2p :20001 --jsonrpc :20002 --seal
````

Um den **dritten** Client auszuführen:

````bash
polygon-edge server --data-dir ./test-chain-3 --chain genesis.json --grpc-address :30000 --libp2p :30001 --jsonrpc :30002 --seal
````

Um den **vierten** Client auszuführen:

````bash
polygon-edge server --data-dir ./test-chain-4 --chain genesis.json --grpc-address :40000 --libp2p :40001 --jsonrpc :40002 --seal
````

Um kurz darüber zu gehen, was bisher getan wurde:

* Das Verzeichnis für die Clientdaten wurde als **./test-chain-\*** angegeben.
* Die GRPC wurden für jeden Knoten auf den Ports **10000**, **20000**, **30000** und **40000** gestartet
* Die libp2p Server wurden für jeden Knoten auf den Ports **10001**, **20001**, **30001** und **40001** gestartet
* Die **JSON-RPC**************-Server wurden für jeden Knoten auf den Ports 10002, 20002, 30002 und 40002 gestartet
* Der *seal* bedeutet, dass der Knoten, der gestartet wird, an der block sealing teilnimmt
* Der *chain* Flag gibt an, welche Genesis-Datei für die Kettenkonfiguration verwendet werden soll

Die Struktur der Genesis-Datei wird im Abschnitt [CLI-Befehle](/docs/edge/get-started/cli-commands) behandelt.

Nachdem du die vorherigen Befehle ausgeführt hast, hast du ein 4-Knoten-Polygon-Edge-Netzwerk eingerichtet, das in der Lage ist, Blöcke zu versiegeln und sich von
Knotenausfällen wieder zu erholen.

:::info Starte den Client mit der Konfigurationsdatei

Anstatt alle Konfigurationsparameter als CLI-Argumente anzugeben, kann der Client auch mit einer Konfigurationsdatei gestartet werden, indem du folgende Befehl ausführst:

````bash
polygon-edge server --config <config_file_path>
````
Beispiel:

````bash
polygon-edge server --config ./test/config-node1.json
````
Derzeit unterstützen `yaml`und `json`basierende Konfigurationsdateien, Beispiel-Konfigurationsdateien finden Sie **[hier](/docs/edge/configuration/sample-config)**

:::

:::info Schritte zur Ausführung eines Nicht-Prüfer-Knotens

Ein Nicht-Prüfer synchronisiert immer die neuesten Blöcke, die er vom Prüfknoten erhält. Du kannst einen Nicht-Prüfer-Knoten starten, indem du den folgenden Befehl ausführst.

````bash
polygon-edge server --data-dir <directory_path> --chain <genesis_filename> --grpc-address <portNo> --libp2p <portNo> --jsonrpc <portNo>
````
Du kannst zum Beispiel den **fünften** Nicht-Prüfer-Client hinzufügen, indem du den folgenden Befehl ausführst :

````bash
polygon-edge server --data-dir ./test-chain --chain genesis.json --grpc-address :50000 --libp2p :50001 --jsonrpc :50002
````
:::

:::info Lege das Preislimit fest

Ein Polygon Edge-Knoten kann mit einem festgelegten **Preislimit** für eingehende Transaktionen gestartet werden.

Die Einheit für das Preislimit ist `wei`.

Das Setzen eines Preislimits bedeutet, dass jede Transaktion, die vom aktuellen Knoten verarbeitet wird, einen Gaspreis haben muss, **der höher**
dann das gesetzte Preislimit, sonst wird es nicht in einem Block enthalten.

Wenn die Mehrheit der Knoten ein bestimmtes Preislimit einhält, wird die Regel durchgesetzt, dass die Transaktionen im Netzwerk
nicht unter einer bestimmten Preisgrenze liegen können.

Der Standardwert für das Preislimit ist `0`, d. h. es wird standardmäßig überhaupt nicht durchgesetzt.

Beispiel für die Verwendung des `--price-limit` Flags:
````bash
polygon-edge server --price-limit 100000 ...
````

Es ist erwähnenswert, dass Preislimits ** nur für nicht-lokale Transaktionen** durchgesetzt werden,
was bedeutet, dass das Preislimit nicht für Transaktionen gilt, die lokal auf dem Knoten hinzugefügt werden.

:::

:::info WebSocket URL

Wenn du den Polygon Edge ausführst, erzeugt er standardmäßig eine WebSocket-URL, die auf dem Standort der Chain basiert.
Das URL-Schema `wss://` wird für HTTPS-Links und `ws://` für HTTP verwendet.

Localhost WebSocket URL:
````bash
ws://localhost:10002/ws
````
Bitte beachte, dass die Portnummer von dem gewählten JSON-RPC-Port für den Knoten abhängt.

Edgenet WebSocket URL:
````bash
wss://rpc-edgenet.polygon.technology/ws
````
:::



## Schritt 5: Interagiere mit dem Polygon-Edge-Netzwerk {#step-5-interact-with-the-polygon-edge-network}

Nun, da du mindestens 1 laufende Client eingerichtet hast, kannst du mit dem Konto mit der Blockchain interagieren, das du oben vorbereitet hast und indem du die JSON-RPC-URL auf einen der 4 Knoten spezifizierst:
- Knoten 1:`http://localhost:10002`
- Node 2:`http://localhost:20002`
- Node 3:`http://localhost:30002`
- Knoten 4:`http://localhost:40002`

Folgen Sie diesem Leitfaden, um Operatorbefehle an den neu erstellten Cluster zu geben: [Wie man die Informationen des Operators abfragt](/docs/edge/working-with-node/query-operator-info) (die GRPC für den Cluster, den wir gebaut haben, sind `10000`/`20000`/`30000`/ `40000`für jeden Knoten)

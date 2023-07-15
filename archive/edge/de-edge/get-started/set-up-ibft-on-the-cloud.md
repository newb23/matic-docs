---
id: set-up-ibft-on-the-cloud
title: Cloud-Einrichtung
description: "Schritt-für-Schritt-Leitfaden zur Einrichtung der Cloud."
keywords:
  - docs
  - polygon
  - edge
  - cloud
  - setup
  - genesis
---

:::info Dieser Leitfaden ist für Mainnet- oder Testnet-Einrichtungen gedacht

In diesem Leitfaden erfährst du, wie du ein Polygon-Edge-Netzwerk bei einem Cloud-Anbieter für die Produktion deines Testnets oder Mainnets einrichtest.

Wenn du ein Polygon Edge-Netzwerk lokal einrichten möchtest, um `polygon-edge` vor einer produktionsähnlichen Einrichtung schnell zu testen, lies bitte
**[Lokale Einrichtung](/docs/edge/get-started/set-up-ibft-locally)**
:::

## Voraussetzungen {#requirements}

Siehe [Installation](/docs/edge/get-started/installation) zur Installation von Polygon Edge.

### Einrichten der VM-Verbindung {#setting-up-the-vm-connectivity}

Je nachdem, für welchen Cloud-Anbieter du dich entscheidest, kannst du die Verbindung und die Regeln zwischen den VMs mithilfe einer Firewall,
von Sicherheitsgruppen oder Zugriffskontrolllisten einrichten.

Da der einzige Teil von `polygon-edge`, der für andere VMs zugänglich sein muss, der libp2p-Server ist, reicht es aus,
die gesamte Kommunikation zwischen den VMs über den Standard-libp2p-Port `1478` zu erlauben.

## Übersicht {#overview}

![Cloud-Einrichtung](/img/edge/ibft-setup/cloud.svg)

In diesem Leitfaden geht es darum, ein funktionierendes `polygon-edge` Blockchain-Netzwerk aufzubauen, das mit dem [IBFT-Konsensprotokoll](https://github.com/ethereum/EIPs/issues/650) arbeitet.
Das Blockchain-Netzwerk wird aus 4 Knoten bestehen, von denen alle 4 Prüfknoten sind. Als solche sind sie berechtigt, sowohl Blöcke vorzuschlagen als auch Blöcke zu validieren, die von anderen Antragstellern stammen.
Jeder der 4 Knoten wird auf einer eigenen VM ausgeführt, denn die Idee dieses Leitfadens ist es, dir ein voll funktionsfähiges Polygon Edge-Netzwerk zu bieten und gleichzeitig die Validator Keys privat zu halten, um eine vertrauenswürdige Netzwerkeinrichtung zu gewährleisten.

Um das zu erreichen, führen wir dich durch 4 einfache Schritte:

0. Sieh dir die Liste der **Voraussetzungen** oben an
1. Erstelle die Private Keys für jeden der Prüfer und initialisiere das Datenverzeichnis
2. Bereite den Verbindungsstring für den Bootnode vor, der in die gemeinsame `genesis.json` eingefügt werden soll
3. Erstelle die `genesis.json` auf deinem lokalen Gerät und sende/übertrage sie an jeden der Knoten
4. Starte alle Knoten

:::info Anzahl der Prüfer

Es gibt keine Mindestanzahl von Knoten in einem Cluster, d. h. Cluster mit nur einem Prüfknoten sind möglich.
Bedenke, dass es bei einem _Einzelknotencluster_ **keine Absturztoleranz** und **keine BFT-Garantie** gibt.

Die empfohlene Mindestanzahl von Knoten, um eine BFT-Garantie zu erreichen, ist 4, denn in einem Cluster mit 4 Knoten kann der Ausfall
eines Knotens toleriert werden, während die übrigen 3 normal funktionieren.

:::

## Schritt 1: Initialisiere Datenordner und generiere Validator Keys {#step-1-initialize-data-folders-and-generate-validator-keys}

Um mit Polygon Edge loslegen zu können, musst du die Datenordner auf jedem Knoten initialisieren:


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

Jeder dieser Befehle gibt den Validator Key, den öffentlichen Key von BLS und die [Knoten-ID](https://docs.libp2p.io/concepts/peer-id/) aus. Für den nächsten Schritt benötigst du die Knoten-ID des ersten Knotens.

### Ausgabe von Secrets {#outputting-secrets}
Die Ausgabe der Secrets kann bei Bedarf wieder abgerufen werden.

```bash
polygon-edge secrets output --data-dir test-chain-4
```

:::warning Behalte dein Datenverzeichnis für dich!

Die oben erstellten Datenverzeichnisse initialisieren nicht nur die Verzeichnisse für den Blockchain-Status, sondern erzeugen auch die Private Keys deines Prüfers.
**Dieser Key sollte geheim gehalten werden, denn wenn er gestohlen wird, kann sich jemand als Prüfer im Netzwerk ausgeben!**

:::

## Schritt 2: Bereite den multiaddr-Verbindungsstring für den Bootnode vor {#step-2-prepare-the-multiaddr-connection-string-for-the-bootnode}

Damit ein Knoten erfolgreich eine Verbindung herstellen kann, muss er wissen, mit welchem `bootnode` Server er sich verbinden muss,
um Informationen über alle anderen Knoten im Netzwerk zu erhalten. Der `bootnode` wird im P2P-Jargon manchmal auch als `rendezvous` Server bezeichnet.

`bootnode` ist kein spezielles Beispiel für einen Polygon Edge-Knoten. Jeder Polygon Edge-Knoten kann als `bootnode` dienen und
jeder Polygon Edge-Knoten muss eine Reihe von Bootnodes festgelegt haben, die kontaktiert werden, um Informationen darüber zu erhalten,
wie man sich mit allen übrigen Knoten im Netzwerk verbindet.

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
In diesem Leitfaden werden wir zwei Knoten auflisten (kann spontan geändert werden, ohne dass dies Auswirkungen auf die Gültigkeit der `genesis.json` Datei hat).
:::

Da der erste Teil des multiaddr-Verbindungsstrings die `<ip_address>` ist, musst du hier die IP-Adresse eingeben, die für andere Knoten erreichbar ist. Je nach deiner Einrichtung kann dies eine private oder eine öffentliche IP-Adresse sein, nicht aber `127.0.0.1`.

Für `<port>` werden wir `1478` verwenden, da dies der Standard-libp2p-Port ist.

Und schließlich brauchen wir die `<node_id>`, die wir aus der Ausgabe des zuvor ausgeführten Befehls `polygon-edge secrets init --data-dir data-dir` (mit dem die Keys und Datenverzeichnisse für die `node 1` erzeugt wurden) erhalten können

Nach dem Assembly sieht der multiaddr-Verbindungsstring zu der `node 1`, die wir als Bootnode verwenden werden, etwa so aus (nur die `<node_id>` am Ende sollte anders sein):
```
/ip4/<public_or_private_ip>/tcp/1478/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW
```
In ähnlicher Weise konstruieren wir multiaddr für den zweiten Bootnode wie unten gezeigt
```
/ip4/<public_or_private_ip>/tcp/1478/p2p/16Uiu2HAmS9Nq4QAaEiogE4ieJFUYsoH28magT7wSvJPpfUGBj3Hq
```
:::info DNS-Hostnamen anstelle von ips

Polygon Edge unterstützt die Verwendung von DNS-Hostnamen für die Konfiguration der Knoten. Dies ist eine sehr hilfreiche Funktion für cloudbasierte Einsätze, da sich die IP des Knotens aus verschiedenen Gründen ändern kann.

Das multiaddr-Format für den Verbindungsstring bei der Verwendung von DNS-Hostnamen lautet wie folgt:
`/dns4/sample.hostname.com/tcp/<port>/p2p/nodeid`

:::

## Schritt 3: Erstelle die Genesis-Datei mit den 4 Knoten als Prüfer {#step-3-generate-the-genesis-file-with-the-4-nodes-as-validators}

Dieser Schritt kann auf deinem lokalen Gerät ausgeführt werden, aber du brauchst die öffentlichen Prüfer-Keys für jeden der 4 Prüfer.

Die Prüfer können die `Public key (address)`, die unten in der Ausgabe ihrer `secrets init`-Befehle angezeigt wird, sicher weitergeben, so dass
du die genesis.json sicher mit den Prüfern im anfänglichen Prüfer-Set erzeugen kannst, die durch ihre öffentlichen Schlüssel identifiziert werden:

```
[SECRETS INIT]
Public key (address) = 0xC12bB5d97A35c6919aC77C709d55F6aa60436900
BLS Public key       = 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf
Node ID              = 16Uiu2HAmVZnsqvTwuzC9Jd4iycpdnHdyVZJZTpVC8QuRSKmZdUrf
```

Wenn du alle 4 öffentlichen Schlüssel der Prüfer erhalten hast, kannst du den folgenden Befehl ausführen, um `genesis.json` zu erstellen

````bash
polygon-edge genesis --consensus ibft --ibft-validator 0xC12bB5d97A35c6919aC77C709d55F6aa60436900:0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --ibft-validator <2nd validator IBFT public key>:<2nd validator BLS public key> --ibft-validator <3rd validator IBFT public key>:<3rd validator BLS public key> --ibft-validator <4th validator IBFT public key>:<4th validator BLS public key> --bootnode=<first_bootnode_multiaddr_connection_string_from_step_2> --bootnode <second_bootnode_multiaddr_connection_string_from_step_2> --bootnode <optionally_more_bootnodes>
````

Was dieser Befehl tut:

* Der `--ibft-validator` legt den öffentlichen Key des Prüfers fest, der in das anfängliche Prüfer-Set im Genesis-Block aufgenommen werden soll. Es kann viele erste Prüfer geben.
* Der `--bootnode` legt die Adresse des Bootnodes fest, über den sich die Knoten gegenseitig finden können. Wir werden den Multiaddr-String des `node 1` verwenden, wie in **Schritt 2** erwähnt, obwohl du so viele Bootnodes hinzufügen kannst, wie du willst, wie oben angezeigt.

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

Nach der Angabe der:
1. Öffentlichen Keys der Prüfer, die als Prüfer-Set in den Genesis-Block aufgenommen werden sollen
2. Bootnode multiaddr-Verbindungsstrings
3. Wenn du Konten und Salden für den Genesis-Block vorabbaust (Pre-Mining)

und die `genesis.json` erstellst, solltest du sie auf alle VMs im Netzwerk übertragen. Je nach Einrichtung kannst du
sie kopieren/einfügen, an den Betreiber des Knotens senden oder einfach per SCP/FTP übertragen.

Die Struktur der Genesis-Datei wird im Abschnitt [CLI-Befehle](/docs/edge/get-started/cli-commands) behandelt.

## Schritt 4: Führe alle Clients aus {#step-4-run-all-the-clients}

:::note Vernetzung von Cloud-Anbietern

Die meisten Cloud-Anbieter stellen die IP-Adressen (vor allem die öffentlichen) nicht als direkte Netzwerkschnittstelle auf deiner VM zur Verfügung, sondern richten einen unsichtbaren NAT-Proxy ein.


Damit sich die Knoten untereinander verbinden können, müsstest du in diesem Fall auf der `0.0.0.0` IP-Adresse abhören, um an alle Schnittstellen zu binden. Du müsstest aber immer noch die IP-Adresse oder DNS-Adresse angeben, die andere Knoten verwenden können, um sich mit deiner Instanz zu verbinden. Dazu verwendest du entweder das Argument `--nat` oder `--dns`, in dem du deine externe IP- bzw. DNS-Adresse angeben kannst.

#### Beispiel {#example}

Die zugehörige IP-Adresse, die du abhören möchtest, ist `192.0.2.1`, aber sie ist nicht direkt an eine deiner Netzwerkschnittstellen gebunden.

Damit sich die Knoten verbinden können, musst du die folgenden Parameter übergeben:

`polygon-edge ... --libp2p 0.0.0.0:10001 --nat 192.0.2.1`

Oder, wenn du eine DNS-Adresse `dns/example.io` angeben möchtest, übergibst du folgende Parameter:

`polygon-edge ... --libp2p 0.0.0.0:10001 --dns dns/example.io`

Dadurch wird dein Knoten an allen Schnittstellen abgehört, aber er weiß auch, dass sich die Clients über die angegebene `--nat` oder `--dns` Adresse mit ihm verbinden.

:::

Um den **ersten** Client auszuführen:


````bash
node-1> polygon-edge server --data-dir ./data-dir --chain genesis.json  --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

Um den **zweiten** Client auszuführen:

````bash
node-2> polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

Um den **dritten** Client auszuführen:

````bash
node-3> polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

Um den **vierten** Client auszuführen:

````bash
node-4> polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

Nachdem du die vorherigen Befehle ausgeführt hast, hast du ein 4-Knoten-Polygon-Edge-Netzwerk eingerichtet, das in der Lage ist, Blöcke zu versiegeln und sich von
Knotenausfällen wieder zu erholen.

:::info Starte den Client mit der Konfigurationsdatei

Anstatt alle Konfigurationsparameter als CLI-Argumente anzugeben, kann der Client auch mit einer Konfigurationsdatei gestartet werden, indem du den folgenden Befehl ausführst:

````bash
polygon-edge server --config <config_file_path>
````
Beispiel:

````bash
polygon-edge server --config ./test/config-node1.json
````
Derzeit unterstützen wir nur die `json`basierte Konfigurationsdatei, die Beispiel-Konfigurationsdatei findet ihr **[hier](/docs/edge/configuration/sample-config)**

:::

:::info Schritte zur Ausführung eines Nicht-Prüfer-Knotens

Ein Nicht-Prüfer synchronisiert immer die neuesten Blöcke, die er vom Prüfknoten erhält. Du kannst einen Nicht-Prüfer-Knoten starten, indem du den folgenden Befehl ausführst.

````bash
polygon-edge server --data-dir <directory_path> --chain <genesis_filename>  --libp2p <IPAddress:PortNo> --nat <public_or_private_ip>
````
Du kannst zum Beispiel den **fünften** Nicht-Prüfer-Client hinzufügen, indem du den folgenden Befehl ausführst :

````bash
polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat<public_or_private_ip>
````
:::

:::info Lege das Preislimit fest

Ein Polygon Edge-Knoten kann mit einem festgelegten **Preislimit** für eingehende Transaktionen gestartet werden.

Die Einheit für das Preislimit ist `wei`.

Das Setzen eines Preislimits bedeutet, dass jede Transaktion, die vom aktuellen Knoten verarbeitet wird, einen Gaspreis haben muss, **der höher**
als das gesetzte Preislimit ist, sonst wird sie nicht in einen Block aufgenommen.

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

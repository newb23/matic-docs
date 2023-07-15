---
id: set-up-ibft-locally
title: Configuration Locale
description: "Guide de configuration locale étape par étape."
keywords:
  - docs
  - polygon
  - edge
  - local
  - setup
  - genesis
---

:::caution Ce guide est uniquement à des fins de test

Le guide ci-dessous vous explique comment configurer un réseau de Polygon Edge sur votre machine locale à des fins de test et de développement.
objectifs.

La procédure diffère considérablement de la façon dont vous pourriez souhaiter configurer le réseau de Polygon Edge pour un scénario d'utilisation réel sur
un fournisseur de nuage: **[Configuration](/docs/edge/get-started/set-up-ibft-on-the-cloud)** du Cloud

:::


## Exigences {#requirements}

Référez-vous à la rubrique [Installation](/docs/edge/get-started/installation) pour installer Polygon Edge.

## Aperçu {#overview}

![Configuration Locale](/img/edge/ibft-setup/local.svg)

Dans ce guide, notre objectif est d'établir un réseau de blockchain opérationnel `polygon-edge` fonctionnant avec le [Protocole de consensus IBFT](https://github.com/ethereum/EIPs/issues/650).
Le réseau blockchain sera composé de 4 nœuds qui sont tous les 4 des nœuds de validation, et en tant que tels sont éligibles à la fois pour la proposition et pour la validation des blocs provenant d'autres proposants.
Tous les 4 nœuds fonctionneront sur la même machine, car l'idée de ce guide est de vous donner un groupe IBFT entièrement fonctionnel dans le moins de temps possible.

Pour y parvenir, nous vous guiderons à travers 4 étapes faciles :

1. L'initialisation des répertoires de données générera les deux clés de validateur pour chacun des 4 nœuds, et initialisera les répertoires de données de blockchain vides. Les clés de validateur sont importantes car nous devons amorcer le bloc de genèse avec l'ensemble initial de validateurs à l'aide de ces clés.
2. La préparation de la chaîne de connexion pour le nœud de démarrage sera l'information vitale pour chaque nœud que nous exécuterons pour savoir à quel nœud se connecter au démarrage pour la première fois.
3. La génération du `genesis.json` fichier nécessitera comme entrée à la fois les clés de validateur générées à l'**étape 1** utilisées pour configurer les validateurs initiaux du réseau dans le bloc de genèse et la chaîne de connexion bootnode de l'**étape 2**.
4. Exécutez tous les nœuds est l'objectif final de ce guide et ce sera la dernière étape, nous allons indiquer aux nœuds quel répertoire de données utiliser et où trouver le `genesis.json` qui démarre l'état de réseau initial.

Comme les quatre nœuds seront exécutés sur localhost, au cours du processus d'installation, il est prévu que tous les répertoires de données
pour chacun des noeuds se trouvent dans le même répertoire parent.

:::info Nombre de validateurs

Il n'y a pas de minimum pour le nombre de nœuds dans un groupe, ce qui signifie que des groupes avec seulement un nœud validateur sont possibles. Sachez qu'avec un cluster à nœud _unique_, il n'y a **pas de tolérance aux pannes** ni d**e garantie BFT**.

Le nombre minimum de nœuds recommandé pour obtenir une garantie BFT est de 4 - puisque dans un groupe à 4 nœuds, la défaillance d'un nœud peut être tolérée, avec les 3 restants fonctionnant normalement.

:::

## Étape 1 : Initialisez les dossiers de données pour IBFT et générez des clés de validateur {#step-1-initialize-data-folders-for-ibft-and-generate-validator-keys}

Pour être opérationnel avec IBFT, vous devez initialiser les dossiers de données,
un pour chaque nœud :

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

Chacune de ces commandes imprimera la clé du validateur, la clé publique bls et [l'identifiant du nœud](https://docs.libp2p.io/concepts/peer-id/). Vous aurez besoin de l'identifiant de nœud du premier nœud pour l'étape suivante.

### Secrets de Sortie {#outputting-secrets}
La sortie des secrets peut être récupérée à nouveau, si nécessaire.

```bash
polygon-edge secrets output --data-dir test-chain-4
```

## Étape 2 : Préparez la chaîne de connexion multiaddr pour le nœud de démarrage {#step-2-prepare-the-multiaddr-connection-string-for-the-bootnode}

`bootnode`Pour qu'un nœud réussisse à établir la connectivité, il doit savoir à quel serveur se connecter pour obtenir
les informations sur tous les nœuds restants sur le réseau. Le `bootnode` est parfois aussi connu sous le nom de serveur `rendezvous` dans le jargon p2p.

`bootnode` n'est pas une instance spéciale du nœud polygon-edge. Chaque noeud polygon-edge peut servir de `bootnode`, mais
chaque noeud polygon-edge doit avoir un ensemble de noeuds récupérateurs spécifiés qui seront contactés pour fournir des informations sur la façon de se connecter avec
tous les nœuds restants dans le réseau.

Pour créer la chaîne de connexion permettant de spécifier le nœud de démarrage, nous devrons nous conformer
au [format multiaddr](https://docs.libp2p.io/concepts/addressing/):
```
/ip4/<ip_address>/tcp/<port>/p2p/<node_id>
```

Dans ce guide, nous traiterons les premiers et deuxièmes nœuds comme des nœuds de démarrage pour tous les autres nœuds. Ce qui se passera dans ce scénario
est que les nœuds qui se connectent au `node 1` ou o `node 2`btiendront des informations sur la façon de se connecter les uns aux autres via le
nœud récupérateur mutuellement contacté.

:::info Vous devez spécifier au moins un nœud de démarrage pour démarrer un nœud

Au moins **un** nœud de démarrage est requis, afin que les autres nœuds du réseau puissent se découvrir. Plus de nœud de démarrage sont recommandés, étant donné qu'ils
assurent la résilience du réseau en cas de panne. Dans ce guide, nous énumérerons deux nœuds, mais cela peut être modifié à la volée, sans impact sur la validité du fichier `genesis.json` .

:::

Étant donné que nous fonctionnons sur localhost, on peut absolument assumer que le `<ip_address>` est `127.0.0.1`.

Pour le `<port>`, nous utiliserons `10001` puisque nous allons configurer le serveur libp2p pour `node 1` pour écouter ultérieurement sur ce port.

Et enfin, nous avons besoin du `<node_id>` que nous pouvons obtenir à partir de la sortie de la commande précédemment exécutée `polygon-edge secrets init --data-dir test-chain-1` (qui a été utilisée pour générer des clés et des répertoires de données pour le `node1`)

Après l'assemblage, la chaîne de connexion multiaddr au `node 1` que nous utiliserons comme nœud de démarrage, ressemblera à ceci (seul le `<node_id>` qui est à la fin devrait être différent) :
```
/ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW
```
De même, nous construisons multiaddr pour le deuxième nœud de démarrage comme indiqué ci-dessous
```
/ip4/127.0.0.1/tcp/20001/p2p/16Uiu2HAmS9Nq4QAaEiogE4ieJFUYsoH28magT7wSvJPpfUGBj3Hq
```

:::info Noms d'hôte NS au lieu d'ips

Polygon Edge prend en charge l'utilisation des noms d'hôte DNS pour la configuration des nœuds. Il s'agit d'une fonctionnalité très utile pour les déploiements basés sur le cloud, car l'adresse IP du nœud peut changer pour diverses raisons.

Le format multiaddr pour la chaîne de connexion lors de l'utilisation des noms d'hôte DNS est le suivant :
`/dns4/sample.hostname.com/tcp/<port>/p2p/nodeid`

:::


## Étape 3 : Générez le fichier de genèse avec les 4 nœuds comme validateurs {#step-3-generate-the-genesis-file-with-the-4-nodes-as-validators}

````bash
polygon-edge genesis --consensus ibft --ibft-validators-prefix-path test-chain- --bootnode /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW --bootnode /ip4/127.0.0.1/tcp/20001/p2p/16Uiu2HAmS9Nq4QAaEiogE4ieJFUYsoH28magT7wSvJPpfUGBj3Hq
````

Ce que fait cette commande :

* Le `--ibft-validators-prefix-path` définit le chemin du dossier de préfixe sur celui spécifié que IBFT peut utiliser

dans Polygon Edge. Ce répertoire est utilisé pour héberger le dossier `consensus/`, dans lequel la clé privée du validateur est conservée. La
clé publique du validateur est nécessaire pour construire le fichier de genèse - la liste initiale des nœuds de démarrage.
Cet indicateur n'a de sens que lors de la configuration du réseau sur localhost, car dans un scénario réel, nous ne pouvons pas nous attendre à ce que
tous les répertoires de données des nœuds se trouvent sur le même système de fichiers à partir duquel nous pouvons facilement lire leurs clés publiques.
* Le `--bootnode` définit l'adresse du nœud de démarrage qui permettra aux nœuds de se trouver. Nous utiliserons la chaîne multiaddr du `node 1`, comme mentionné à l'**étape 2**.

Le résultat de cette commande est le fichier `genesis.json` qui contient le bloc genesis de notre nouvelle blockchain, avec le jeu de validateur prédéfini et la configuration pour savoir quel nœud contacter en premier afin d'établir la connectivité.

:::info Passer à ECDSA

BLS est le mode de validation par défaut des en-têtes de bloc. Si vous souhaitez que votre chaîne s'exécute en mode ECDSA, vous pouvez utiliser l'indicateur `—ibft-validator-type`, avec l'argument `ecdsa`:

```
genesis --ibft-validator-type ecdsa
```
:::
:::info Soldes du compte de pré-exploitation

Vous souhaiterez probablement configurer votre réseau de blockchain avec certaines adresses ayant des soldes « pré-exploités ».

Pour cela, passez autant `--premine` d'indicateurs que vous le souhaitez par adresse que vous souhaitez initialiser avec un certain solde sur la blockchain.

Par exemple, si nous souhaitons pré-exploiter 1000 ETH à l'adresse `0x3956E90e632AEbBF34DEB49b71c28A83Bc029862` dans notre bloc de genèse, nous aurions besoin de fournir l'argument suivant :

```
--premine=0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000
```

**Notez que le montant pré-exploité est en WEI, pas en ETH.**

:::

:::info Définir la limite de gaz du bloc

La limite de gaz par défaut pour chaque bloc est `5242880`. Cette valeur est écrite dans le fichier de genèse, mais vous voudrez peut-être
l'augmenter / le diminuer.

Pour cela, vous pouvez utiliser l'indicateur `--block-gas-limit` suivi de la valeur souhaitée comme indiqué ci-dessous :

```shell
--block-gas-limit 1000000000
```

:::

:::info Définir la limite du descripteur de fichier à système

La limite du descripteur de fichier par défaut ( nombre maximum de fichiers ouverts ) sur certains systèmes d'exploitation est assez petite. Si les nœuds doivent avoir un débit élevé, vous pouvez envisager d'augmenter cette limite au niveau du Système d'Exploitation.

Pour la distribution Ubuntu, la procédure est la suivante ( si vous n'utilisez pas la distribution Ubuntu/Debian, consultez la documentation officielle de votre système d'exploitation ) :
- Vérifiez les limites actuelles du système d'exploitation ( fichiers ouverts )
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

- Augmenter la limite de fichiers ouverts
	- Localement - n'affecte que la session en cours:
	```shell
	ulimit -u 65535
	```
	- Globalement ou par utilisateur ( ajoutez des limites à la fin du fichier /etc/security/limits.conf ) :
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
De manière facultative, modifiez les paramètres supplémentaires, enregistrez le fichier et redémarrez le système. Après le redémarrage, vérifiez à nouveau la limite du descripteur de fichier.
Il doit être défini sur la valeur que vous avez définie dans le fichier limits.conf.
:::


## Étape 4: Préparez tous les clients {#step-4-run-all-the-clients}

Parce que nous essayons d'exécuter un réseau de Polygon Edge composé de 4 nœuds se trouvant tous sur la même machine, nous devons éviter les conflits de port. C'est pourquoi nous utiliserons le raisonnement suivant pour déterminer les ports d'écoute de chaque serveur d'un nœud:

- `10000` pour le serveur gRPC de `node 1`, `20000` pour le serveur gRPC de `node 2`, etc.
- `10001` pour le serveur libp2p de `node 1`, `20001` pour le serveur libp2p de `node 2`, etc.
- `10002` pour le serveur JSON-RPC de `node 1`, `20002` pour le serveur JSON-RPC de `node 2`, etc.

Pour exécuter le **premier** client (notez le port `10001` puisqu'il a été utilisé dans le cadre du multiaddr libp2p dans **l'étape 2** avec l'ID de nœud du nœud 1):

````bash
polygon-edge server --data-dir ./test-chain-1 --chain genesis.json --grpc-address :10000 --libp2p :10001 --jsonrpc :10002 --seal
````

Pour exécuter le **deuxième** client:

````bash
polygon-edge server --data-dir ./test-chain-2 --chain genesis.json --grpc-address :20000 --libp2p :20001 --jsonrpc :20002 --seal
````

Pour préparer le **troisième** client:

````bash
polygon-edge server --data-dir ./test-chain-3 --chain genesis.json --grpc-address :30000 --libp2p :30001 --jsonrpc :30002 --seal
````

Pour exécuter le **quatrième** client:

````bash
polygon-edge server --data-dir ./test-chain-4 --chain genesis.json --grpc-address :40000 --libp2p :40001 --jsonrpc :40002 --seal
````

Pour revenir brièvement sur ce qui a été fait jusqu'à présent:

* Le répertoire des données client a été spécifié comme étant **./test-chain-\***
* Les serveurs GRPC ont été démarrés sur les ports **10000**, **20000**, **30000** et **40000**, pour chaque nœud, respectivement
* Les serveurs de libp2p ont été démarrés sur les ports **10001**, **20001**, **30001** et **40001**, pour chaque nœud, respectivement.
* Les serveurs JSON-RPC ont été démarrés sur les ports **10002**, **20002**, **30002** et **40002**, pour chaque nœud, respectivement
* L'indicateur de *scellage* signifie que le noeud qui est en cours de démarrage va participer au scellage de bloc
* L'indicateur de *chaîne* spécifie quel fichier de Genèses doit être utilisé pour la configuration de la chaîne

La structure du fichier de genèse est traitée dans la section des [Commandes CLI](/docs/edge/get-started/cli-commands) .

Après avoir exécuté les commandes précédentes, vous avez configuré un réseau de Polygon Edge à 4 nœuds, capable de sceller les blocs et de se remettre de la défaillance du nœud.

:::info Démarrez le client à l'aide du fichier de configuration

Au lieu de spécifier tous les paramètres de configuration en tant qu'arguments de CLI, le client peut également être démarré à l'aide d'un fichier de configuration en exécutant la commande suivante:

````bash
polygon-edge server --config <config_file_path>
````
Exemple :

````bash
polygon-edge server --config ./test/config-node1.json
````
Actuellement, nous prenons en charge `yaml`et les fichiers de configuration basés sur la `json`base, exemples de fichiers de configuration peuvent être trouvés **[ici](/docs/edge/configuration/sample-config)**

:::

:::info Étapes pour exécuter un nœud non validateur

Un non-validateur synchronisera toujours les derniers blocs reçus du nœud validateur, vous pouvez démarrer un nœud non-validateur en exécutant la commande suivante.

````bash
polygon-edge server --data-dir <directory_path> --chain <genesis_filename> --grpc-address <portNo> --libp2p <portNo> --jsonrpc <portNo>
````
Par exemple, vous pouvez ajouter un **cinquième** client Non validateur en exécutant la commande suivante :

````bash
polygon-edge server --data-dir ./test-chain --chain genesis.json --grpc-address :50000 --libp2p :50001 --jsonrpc :50002
````
:::

:::info Spécifiez la limite de prix

Un nœud de Polygon Edge peut être démarré avec une **limite de prix** définie pour les transactions entrantes.

L'unité de la limite de prix est. `wei`.

Fixer une limite de prix signifie que toute transaction traitée par le nœud actuel devra avoir un prix de gaz **plus élevé** que la limite de prix définie, sinon elle ne sera pas incluse dans un bloc.

Le fait que la majorité des nœuds respectent une certaine limite de prix, cela applique la règle selon laquelle les transactions dans le réseau ne peuvent être inférieures à un certain niveau de prix.

La valeur par défaut de la limite de prix est `0`, ce qui signifie qu'elle n'est pas appliquée du tout par défaut.

Exemple d'utilisation de `--price-limit` l'indicateur :
````bash
polygon-edge server --price-limit 100000 ...
````

Il convient de noter que les limites de prix **ne sont appliquées que sur les transactions non locales**, ce qui signifie
que la limite de prix ne s'applique pas aux transactions ajoutées localement sur le nœud.

:::

:::info URL de WebSocket

Par défaut, lorsque vous exécutez le Polygon Edge, il génère une URL de WebSocket basée sur l'emplacement de la chaîne.
Le schéma d'URL `wss://` est utilisé pour les liens HTTPS et `ws://` pour HTTP.

URL de WebSocket de l'hôte local :
````bash
ws://localhost:10002/ws
````
Veuillez noter que le numéro de port dépend du port JSON-RPC choisi pour le nœud.

URL de WebSocket Edgenet:
````bash
wss://rpc-edgenet.polygon.technology/ws
````
:::



## Étape 5 : Interagissez avec le réseau de polygon-edge {#step-5-interact-with-the-polygon-edge-network}

Maintenant que vous avez configuré au moins un client en cours d'exécution, vous pouvez aller de l'avant et interagir avec la blockchain en utilisant le compte que vous avez exploité ci-dessus et en spécifiant l'URL JSON-RPC à l'un des 4 nœuds :
- Noeud 1 : `http://localhost:10002`
- Noeud 2 : `http://localhost:20002`
- Noeud 3 : `http://localhost:30002`
- Noeud 4 : `http://localhost:40002`

Suivez ce guide pour envoyer des commandes d'opérateur au groupe nouvellement construit : [comment interroger les informations d'opérateur](/docs/edge/working-with-node/query-operator-info) (les ports GRPC pour le groupe que nous avons construit sont respectivement `10000`/`20000`/`30000`/`40000` pour chaque nœud)

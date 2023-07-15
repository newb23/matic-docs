---
id: set-up-ibft-on-the-cloud
title: Configuration Cloud
description: "Guide détaillé de configuration cloud."
keywords:
  - docs
  - polygon
  - edge
  - cloud
  - setup
  - genesis
---

:::info Ce guide concerne les configurations du mainnet ou du testnet

Le guide ci-dessous vous expliquera comment configurer un réseau de Polygon Edge sur un fournisseur de cloud pour une configuration de production de votre testnet ou mainnet.

Si vous souhaitez configurer un réseau de Polygon Edge localement pour tester rapidement le `polygon-edge` avant de procéder à une configuration de type production, veuillez vous référer à
**[Configuration locale](/docs/edge/get-started/set-up-ibft-locally)**
:::

## Exigences {#requirements}

Référez-vous à la rubrique [Installation](/docs/edge/get-started/installation) pour installer Polygon Edge.

### Configuration de la connectivité VM {#setting-up-the-vm-connectivity}

Selon votre choix du fournisseur de cloud, vous pouvez rétablir une connectivité et des règles entre les VM à l'aide d'un pare-feu,
de groupes de sécurité ou des listes de contrôle d'accès.

Comme la seule partie du `polygon-edge` qui doit être exposée à d'autres machines virtuelles est le serveur libp2p, permettre simplement
toutes les communications entre les VM sur le port libp2p par défaut `1478` est suffisant.

## Aperçu {#overview}

![Configuration Cloud](/img/edge/ibft-setup/cloud.svg)

Dans ce guide, notre objectif est d'établir un réseau de blockchain opérationnel `polygon-edge` fonctionnant avec le [ Protocole de consensus IBFT](https://github.com/ethereum/EIPs/issues/650).
Le réseau de blockchain sera composé de 4 nœuds qui sont tous les 4 des nœuds de validation, et en tant que tels sont éligibles à la fois pour la proposition et pour la validation des blocs provenant d'autres proposants.
Chacun des 4 nœuds fonctionnera sur sa propre machine virtuelle, car l'idée de ce guide est de vous procurer un réseau de Polygon Edge entièrement fonctionnel tout en gardant les clés de validation privées pour assurer une configuration de réseau indépendant.

Pour y parvenir, nous vous guiderons à travers 4 étapes faciles :

0. Jetez un oeil sur la liste des **exigences** ci-dessus
1. Générez les clés privées pour chacun des validateurs, et initialisez le répertoire de données
2. Préparez la chaîne de connexion pour que le nœud de démarrage soit placé dans le système partagé `genesis.json`
3. Créez le `genesis.json` sur votre machine locale et envoyez/transférez-le vers chacun des nœuds
4. Démarrez tous les nœuds

:::info Nombre de validateurs

Il n'y a pas de minimum pour le nombre de nœuds dans un groupe, ce qui signifie que des groupes avec seulement un nœud validateur sont possibles. Sachez qu'avec un cluster à nœud _unique_, il n'y a **pas de tolérance aux pannes** ni d**e garantie BFT**.

Le nombre minimum de nœuds recommandé pour obtenir une garantie BFT est de 4 - puisque dans un groupe à 4 nœuds, la défaillance d'un nœud peut être tolérée, avec les 3 restants fonctionnant normalement.

:::

## Étape 1 : Initialisez les dossiers de données et générez les clés de validation {#step-1-initialize-data-folders-and-generate-validator-keys}

Pour rendre Polygon Edge opérationnel, vous devez initialiser les dossiers de données, sur chaque nœud :


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

Chacune de ces commandes imprimera la clé du validateur, la clé publique bls et [l'identifiant du nœud](https://docs.libp2p.io/concepts/peer-id/). Vous aurez besoin de l'identifiant de nœud du premier nœud pour l'étape suivante.

### Secrets de Sortie {#outputting-secrets}
La sortie des secrets peut être récupérée à nouveau, si nécessaire.

```bash
polygon-edge secrets output --data-dir test-chain-4
```

:::warning Gardez votre répertoire de données pour vous !

Les répertoires de données générés ci-dessus, en plus d'initialiser les répertoires pour conserver l'état de la blockchain, généreront également les clés privées de votre validateur.
**Cette clé doit être gardée secrète, car en cas de vol, elle rendrait quelqu'un capable de se faire passer pour vous, en tant que validateur du réseau !**

:::

## Étape 2 : Préparez la chaîne de connexion multiaddr pour le nœud de démarrage {#step-2-prepare-the-multiaddr-connection-string-for-the-bootnode}

Pour qu'un nœud réussisse à établir la connectivité, il doit savoir à quel serveur `bootnode` se connecter pour obtenir
les informations sur tous les nœuds restants sur le réseau. Le `bootnode` est parfois aussi connu sous le nom de serveur `rendezvous`dans le jargon p2p.

`bootnode` n'est pas une instance spéciale d'un nœud de Polygon Edge. Chaque nœud de Polygon Edge peut servir de `bootnode` et
chaque nœud de Polygon Edge doit avoir un ensemble de nœuds de démarrage spécifiés qui seront contactés pour fournir des informations sur la façon de se connecter à tous les nœuds restants dans le réseau.

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
assurent la résilience du réseau en cas de panne. Dans ce guide, nous énumérerons deux nœuds, mais cela peut être modifié à la volée, sans impact sur la validité du fichier `genesis.json`.

:::

Comme la première partie de la chaîne de connexion multiaddr est le`<ip_address>`, ici, vous devrez entrer l'adresse IP accessible par d'autres nœuds, selon votre configuration, il peut s'agir d'une adresse IP privée ou publique, pas`127.0.0.1`.

Pour le,`<port>` nous utiliserons`1478`, puisqu'il s'agit du port libp2p par défaut.

Et enfin, nous avons besoin du `<node_id>` que nous pouvons obtenir à partir de la sortie de la commande précédemment `polygon-edge secrets init --data-dir data-dir` exécutée ( qui a été utilisée pour générer des clés et des répertoires de données pour le `node 1`)

Après l'assemblage, la chaîne de connexion multiaddr au `node 1` que nous utiliserons comme nœud de démarrage, ressemblera à ceci (seul le `<node_id>` qui est à la fin devrait être différent) :
```
/ip4/<public_or_private_ip>/tcp/1478/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW
```
De même, nous construisons multiaddr pour le deuxième nœud de démarrage comme indiqué ci-dessous
```
/ip4/<public_or_private_ip>/tcp/1478/p2p/16Uiu2HAmS9Nq4QAaEiogE4ieJFUYsoH28magT7wSvJPpfUGBj3Hq
```
:::info Noms d'hôte NS au lieu d'ips

Polygon Edge prend en charge l'utilisation des noms d'hôte DNS pour la configuration des nœuds. Il s'agit d'une fonctionnalité très utile pour les déploiements basés sur le cloud, car l'adresse IP du nœud peut changer pour diverses raisons.

Le format multiaddr pour la chaîne de connexion lors de l'utilisation des noms d'hôte DNS est le suivant :
`/dns4/sample.hostname.com/tcp/<port>/p2p/nodeid`

:::

## Étape 3 : Générez le fichier de genèse avec les 4 nœuds comme validateurs {#step-3-generate-the-genesis-file-with-the-4-nodes-as-validators}

Cette étape peut être exécutée sur votre machine locale, mais vous aurez besoin des clés de validation publiques pour chacun des 4 validateurs.

Les validateurs peuvent partager en toute sécurité le `Public key (address)` comme affiché ci-dessous dans la sortie de leurs `secrets init` commandes, de sorte que
vous puissiez générer en toute sécurité le fichier genesis.json avec ces validateurs dans l'ensemble initial de validateurs, identifiés par leurs clés publiques :

```
[SECRETS INIT]
Public key (address) = 0xC12bB5d97A35c6919aC77C709d55F6aa60436900
BLS Public key       = 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf
Node ID              = 16Uiu2HAmVZnsqvTwuzC9Jd4iycpdnHdyVZJZTpVC8QuRSKmZdUrf
```

Étant donné que vous avez reçu les 4 clés publiques des validateurs, vous pouvez exécuter la commande suivante pour générer le `genesis.json`

````bash
polygon-edge genesis --consensus ibft --ibft-validator 0xC12bB5d97A35c6919aC77C709d55F6aa60436900:0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --ibft-validator <2nd validator IBFT public key>:<2nd validator BLS public key> --ibft-validator <3rd validator IBFT public key>:<3rd validator BLS public key> --ibft-validator <4th validator IBFT public key>:<4th validator BLS public key> --bootnode=<first_bootnode_multiaddr_connection_string_from_step_2> --bootnode <second_bootnode_multiaddr_connection_string_from_step_2> --bootnode <optionally_more_bootnodes>
````

Que fait cette commande :

* Le `--ibft-validator` définit la clé publique du validateur qui doit être incluse dans le validateur initial défini dans le bloc de genèse. Il peut y avoir plusieurs validateurs initiaux.
* Le `--bootnode` définit l'adresse du nœud de démarrage qui permettra aux nœuds de se trouver. Nous utiliserons la chaîne multiaddr du `node 1`, comme mentionné à **l'étape 2**, bien que vous puissiez ajouter autant de nœuds de démarrage que vous le souhaitez, comme indiqué ci-dessus.

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

Après avoir précisé le :
1. Les clés publiques des validateurs à inclure dans le bloc de genèse en tant qu'ensemble de validateurs
2. Les chaînes de connexion multiaddr du nœud de démarrage
3. Les comptes et les soldes pré-exploités à inclure dans le bloc de genèse

et en générant le `genesis.json`, vous devez le copier sur toutes les Machines Virtuelles dans le réseau. Selon votre configuration, vous pouvez
le copier/coller, l'envoyer à l'opérateur du nœud, ou simplement le SCP/FTP.

La structure du fichier de genèse est traitée dans la section des [Commandes de CLI](/docs/edge/get-started/cli-commands).

## Étape 4 : Préparez tous les clients {#step-4-run-all-the-clients}

:::note Mise en réseau sur les fournisseurs de Cloud

La plupart des fournisseurs de cloud n'exposent pas les adresses IP (en particulier les adresses publiques) en tant qu'interface de réseau directe sur votre Machine Virtuelle, mais configurent plutôt un proxy NAT invisible.


Pour permettre aux nœuds de se connecter les uns aux autres dans ce cas, vous devez les faire écouter sur `0.0.0.0` l'adresse IP pour vous lier à toutes les interfaces, mais vous devez toujours spécifier l'adresse IP ou l'adresse DNS que les autres nœuds peuvent utiliser pour se connecter à votre instance. Ceci est réalisé soit en utilisant l'argument `--nat` ou o `--dns`ù vous pouvez spécifier votre adresse IP externe ou DNS respectivement.

#### Exemple {#example}

L'adresse IP associée sur laquelle vous souhaitez écouter est `192.0.2.1`, mais elle n'est pas directement liée à aucune de vos interfaces réseau.

Pour autoriser les nœuds à se connecter, vous devez passer les paramètres suivants :

`polygon-edge ... --libp2p 0.0.0.0:10001 --nat 192.0.2.1`

Ou, si vous souhaitez spécifier une adresse DNS `dns/example.io`, passez les paramètres suivants :

`polygon-edge ... --libp2p 0.0.0.0:10001 --dns dns/example.io`

Cela rendrait votre nœud capable d'etre écouté sur toutes les interfaces, mais lui ferait également savoir que les clients s'y connectent via l'adresse spécifiée `--nat` ou `--dns`.

:::

Pour exécuter le **premier** client :


````bash
node-1> polygon-edge server --data-dir ./data-dir --chain genesis.json  --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

Pour exécuter le **deuxième** client :

````bash
node-2> polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

Pour préparer le **troisième** client:

````bash
node-3> polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

Pour exécuter le **quatrième** client :

````bash
node-4> polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

Après avoir exécuté les commandes précédentes, vous avez configuré un réseau de Polygon Edge à 4 nœuds, capable de sceller les blocs et de se remettre de la défaillance du nœud.

:::info Démarrez le client à l'aide du fichier de configuration

Au lieu de spécifier tous les paramètres de configuration en tant qu'arguments de CLI, le Client peut également être démarré à l'aide d'un fichier de configuration en exécutant la commande suivante :

````bash
polygon-edge server --config <config_file_path>
````
Exemple :

````bash
polygon-edge server --config ./test/config-node1.json
````
Actuellement, nous prenons en charge uniquement le fichier de configuration basé sur la `json`base, exemple de fichier de configuration peut être trouvé **[ici](/docs/edge/configuration/sample-config)**

:::

:::info Étapes pour exécuter un nœud non validateur

Un non-validateur synchronisera toujours les derniers blocs reçus du nœud validateur, vous pouvez démarrer un nœud non-validateur en exécutant la commande suivante.

````bash
polygon-edge server --data-dir <directory_path> --chain <genesis_filename>  --libp2p <IPAddress:PortNo> --nat <public_or_private_ip>
````
Par exemple, vous pouvez ajouter un **cinquième** client Non validateur en exécutant la commande suivante :

````bash
polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat<public_or_private_ip>
````
:::

:::info Spécifiez la limite de prix

Un nœud de Polygon Edge peut être démarré avec une **limite de prix** définie pour les transactions entrantes.

L'unité de la limite de prix est. `wei`.

Fixer une limite de prix signifie que toute transaction traitée par le nœud actuel devra avoir un prix de gaz **plus élevé**
que la limite de prix fixée, sinon elle ne sera pas incluse dans un bloc.

Le fait que la majorité des nœuds respectent une certaine limite de prix applique la règle selon laquelle les transactions dans le réseau
ne peuvent être inférieures à un certain niveau de prix.

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

URL Edgenet de WebSocket :
````bash
wss://rpc-edgenet.polygon.technology/ws
````
:::

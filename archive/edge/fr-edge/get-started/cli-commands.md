---
id: cli-commands
title: Les Commandes CLI
description: "La liste des commandes CLI et des indicateurs de commande pour Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - cli
  - commands
  - flags
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


Cette section détaille les commandes actuelles, les indicateurs de commande dans Polygon Edge et leur utilisation.

:::tip Prise en charge de la sortie JSON

L'indicateur `--json` est pris en charge sur certaines commandes. Cet indicateur indique à la commande d'imprimer la sortie au format JSON

:::

## Les Commandes De Démarrage {#startup-commands}

| **Commande** | **Description** |
|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| serveur | La commande par défaut qui démarre le client de blockchain, en amorçant tous les modules ensemble |
| genèse | Génère un dossier *genesis.json*, qui est utilisé pour définir un état chaîne prédéfini avant de démarrer le client. La structure du fichier genesis est décrite ci-dessous |
| genèse predeploy | Prédéploiement un contrat intelligent pour les nouveaux réseaux |

### indicateurs du serveur {#server-flags}


| **Tous les indicateurs de serveur** |
|---------------------------------------|---------------------------------------------|
| [data-dir](/docs/edge/get-started/cli-commands#data-dir) | [jsonrpc](/docs/edge/get-started/cli-commands#jsonrpc) |
| [json-rpc-block-range-limit](/docs/edge/get-started/cli-commands#json-rpc-block-range-limit) | [json-rpc-batch-request-limit](/docs/edge/get-started/cli-commands#json-rpc-batch-request-limit) |
| [grpc](/docs/edge/get-started/cli-commands#grpc) | [libp2p](/docs/edge/get-started/cli-commands#libp2p) |
| [prometheus](/docs/edge/get-started/cli-commands#prometheus) | [block-gas-target](/docs/edge/get-started/cli-commands#block-gas-target) |
| [max-peers](/docs/edge/get-started/cli-commands#max-peers) | [max-inbound-peers](/docs/edge/get-started/cli-commands#max-inbound-peers) |
| [max-outbound-peers](/docs/edge/get-started/cli-commands#max-outbound-peers) | [max-enqueued](/docs/edge/get-started/cli-commands#max-enqueued) |
| [log-level](/docs/edge/get-started/cli-commands#log-level) | [log-to](/docs/edge/get-started/cli-commands#log-to) |
| [chaîne](/docs/edge/get-started/cli-commands#chain) | [rejoindre](/docs/edge/get-started/cli-commands#join) |
| [nat](/docs/edge/get-started/cli-commands#nat) | [dns](/docs/edge/get-started/cli-commands#dns) |
| [limite de prix](/docs/edge/get-started/cli-commands#price-limit) | [max-slots](/docs/edge/get-started/cli-commands#max-slots) |
| [config](/docs/edge/get-started/cli-commands#config) | [secrets-config](/docs/edge/get-started/cli-commands#secrets-config) |
| [dev](/docs/edge/get-started/cli-commands#dev) | [dev-interval](/docs/edge/get-started/cli-commands#dev-interval) |
| [no-discover](/docs/edge/get-started/cli-commands#no-discover) | [restaurer](/docs/edge/get-started/cli-commands#restore) |
| [block-time](/docs/edge/get-started/cli-commands#block-time) | [access-control-allow-origins](/docs/edge/get-started/cli-commands#access-control-allow-origins) |


#### <h4></h4><i>data-dir</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--data-dir DATA_DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    server --data-dir ./example-dir

</TabItem>
</Tabs>

Permet de spécifier le répertoire de données utilisé pour stocker les données du client de Polygon Edge. Par défau. .`./test-chain`

---


#### <h4></h4><i>jsonrpc</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--jsonrpc JSONRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    server --jsonrpc 127.0.0.1:10000

</TabItem>
</Tabs>

Définit l'adresse et le port du service JSON-RPC.`address:port`    Si seul le port est défini `:10001` il se liera à toutes les interfaces.`0.0.0.0:10001`    S'il est omis, le service sera lié à la valeur par défaut.`address:port`    Adresse par défaut :.`0.0.0.0:8545`

---

#### <h4></h4><i>json-rpc-block-range-limit</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--json-rpc-block-range-limit BLOCK_RANGE]

</TabItem>
  <TabItem value="example" label="Example">

    server --json-rpc-block-range-limit 1500

</TabItem>
</Tabs>

Définit la plage de blocs maximale à prendre en compte lors de l'exécution de requêtes json-rpc qui incluent des valeurs fromBlock/toBlock (p.ex. eth_getLogs). Par défaut :`1000`.

---

#### <h4></h4><i>json-rpc-batch-request-limit</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--json-rpc-batch-request-limit MAX_LENGTH]

</TabItem>
  <TabItem value="example" label="Example">

    server --json-rpc-batch-request-limit 50

</TabItem>
</Tabs>

Définit la longueur maximale à prendre en compte lors du traitement des requêtes de lot json-rpc. Défaut:.`20`

---

#### <h4></h4><i>grpc</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    server --grpc-address 127.0.0.1:10001

</TabItem>
</Tabs>

Définit l'adresse et le port du service gRPC.`address:port` Adresse par défaut :.`127.0.0.1:9632`

---

#### <h4></h4><i>libp2p</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--libp2p LIBP2P_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    server --libp2p 127.0.0.1:10002

</TabItem>
</Tabs>

Définit l'adresse et le port du service libp2p.`address:port` Adresse par défaut :.`127.0.0.1:1478`

---

#### <h4></h4><i>prometheus</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--prometheus PROMETHEUS_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    server --prometheus 127.0.0.1:10004

</TabItem>
</Tabs>

Définit l'adresse et le port du serveur prometheus.`address:port`    Si seul le port est défini `:5001` le service se liera à toutes les interfaces.`0.0.0.0:5001`    S'il est omis, le service ne sera pas démarré.

---

#### <h4></h4><i>block-gas-target</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--block-gas-target BLOCK_GAS_TARGET]

</TabItem>
  <TabItem value="example" label="Example">

    server --block-gas-target 10000000

</TabItem>
</Tabs>

Définit la limite de gaz de bloc cible pour la chaîne. Défaut (non appliqué) :.`0`

Une explication plus détaillée sur la cible de gaz de bloc se trouve dans la [section TxPool](/docs/edge/architecture/modules/txpool#block-gas-target).

---

#### <h4></h4><i>max-peers</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--max-peers PEER_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    server --max-peers 40

</TabItem>
</Tabs>

Définit le nombre maximal d'homologues du client. Défaut:.`40`

La limite d'homologues doit être spécifiée en utilisant `max-peers` ou `max-inbound/outbound-peers` l'indicateur.

---

#### <h4></h4><i>max-inbound-peers</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--max-inbound-peers PEER_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    server --max-inbound-peers 32

</TabItem>
</Tabs>

Définit le nombre maximum d'homologues entrants du client. Si `max-peers` est défini, la limite max-inbound-peer est calculée à l'aide des formules suivantes.

`max-inbound-peer = InboundRatio * max-peers`, où `InboundRatio` est.`0.8`

---

#### <h4></h4><i>max-outbound-peers</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--max-outbound-peers PEER_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    server --max-outbound-peers 8

</TabItem>
</Tabs>

Définit le nombre maximal d'homologues sortants du client. Si `max-peers` est défini, le nombre max de pairs sortants est calculé à l'aide des formules suivantes.

`max-outbound-peer = OutboundRatio * max-peers`, où `OutboundRatio` est.`0.2`

---

#### <h4></h4><i>max-enqueued</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--max-enqueued ENQUEUED_TRANSACTIONS]

</TabItem>
  <TabItem value="example" label="Example">

    server --max-enqueued 210

</TabItem>
</Tabs>

Définit le nombre maximum de transactions en attente par compte. Par défaut :`128`.

---

#### <h4></h4><i>log-level</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--log-level LOG_LEVEL]

</TabItem>
  <TabItem value="example" label="Example">

    server --log-level DEBUG

</TabItem>
</Tabs>

Définit le niveau de registre pour la sortie de la console. Défaut:.`INFO`

---

#### <h4></h4><i>log-to</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--log-to LOG_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    server --log-to node.log

</TabItem>
</Tabs>

Définit le nom du fichier de registre qui contiendra toutes les sorties du registre de la commande du serveur. Par défaut, tous les registres du serveur seront sortis sur la console (stdout), mais si l'indicateur est défini, il n'y aura pas de sortie vers la console lors de l'exécution de la commande du serveur.

---

#### <h4></h4><i>chaîne</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    server --chain /home/ubuntu/genesis.json

</TabItem>
</Tabs>

Spécifie le fichier de genèse utilisé pour démarrer la chaîne. Défaut:.`./genesis.json`

---

#### <h4></h4><i>rejoindre</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--join JOIN_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    server --join /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

Spécifie l'adresse de l'homologue qui doit être rejoint.

---

#### <h4></h4><i>nat</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--nat NAT_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    server --nat 192.0.2.1

</TabItem>
</Tabs>

Définit l'adresse IP externe sans le port, comme cela peut être vu par les pairs.

---

#### <h4></h4><i>dns</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--dns DNS_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    server --dns dns4/example.io

</TabItem>
</Tabs>

Définit l'adresse DNS de l'hôte. Ceci peut être utilisé pour annoncer un DNS externe. Prend en charge `dns`,`dns4`,`dns6`.

---

#### <h4></h4><i>limite de prix</i>


<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--price-limit PRICE_LIMIT]

</TabItem>
  <TabItem value="example" label="Example">

    server --price-limit 10000

</TabItem>
</Tabs>

Définit la limite de prix minimum du gaz à appliquer pour l'acceptation dans le pool. Défaut : `1`.

---

#### <h4></h4><i>max-slots</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--max-slots MAX_SLOTS]

</TabItem>
  <TabItem value="example" label="Example">

    server --max-slots 1024

</TabItem>
</Tabs>

Définit les créneaux maximaux dans le pool. Défaut:.`4096`

---

#### <h4></h4><i>config</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--config CLI_CONFIG_PATH]

</TabItem>
  <TabItem value="example" label="Example">

    server --config ./myConfig.json

</TabItem>
</Tabs>

Spécifie le chemin d'accès à la configuration de CLI. Prend en charge.`.json`

---

#### <h4></h4><i>secrets-config</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--secrets-config SECRETS_CONFIG]

</TabItem>
  <TabItem value="example" label="Example">

    server --secrets-config ./secretsManagerConfig.json

</TabItem>
</Tabs>

Définit le chemin d'accès au fichier de configuration. Utilisé pour Hashicorp Vault, AWS SSM et GCP Secrets Manager. S'il est omis, le gestionnaire FS secrets local est utilisé.

---

#### <h4></h4><i>dev</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--dev DEV_MODE]

</TabItem>
  <TabItem value="example" label="Example">

    server --dev

</TabItem>
</Tabs>

Définit le client en mode dev. Par défaut: `false`. Dans le mode dev, la découverte par les pairs est désactivée par défaut.

---

#### <h4></h4><i>dev-interval</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--dev-interval DEV_INTERVAL]

</TabItem>
  <TabItem value="example" label="Example">

    server --dev-interval 20

</TabItem>
</Tabs>

Définit l'intervalle de notification de dev du client en secondes. Défaut:.`0`

---

#### <h4></h4><i>no-discover</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--no-discover NO_DISCOVER]

</TabItem>
  <TabItem value="example" label="Example">

    server --no-discover

</TabItem>
</Tabs>

Empêche le client de découvrir d'autres homologues. Défaut:.`false`

---

#### <h4></h4><i>restaurer</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--restore RESTORE]

</TabItem>
  <TabItem value="example" label="Example">

    server --restore backup.dat

</TabItem>
</Tabs>

Restaurer les blocs à partir du fichier d'archive spécifié

---

#### <h4></h4><i>block-time</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--block-time BLOCK_TIME]

</TabItem>
  <TabItem value="example" label="Example">

    server --block-time 1000

</TabItem>
</Tabs>

Définit le temps de production du bloc en secondes. Défaut : `2`

---

#### <h4></h4><i>access-control-allow-origins</i>
<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    server [--access-control-allow-origins ACCESS_CONTROL_ALLOW_ORIGINS]

</TabItem>
  <TabItem value="example" label="Example">

    server --access-control-allow-origins "https://edge-docs.polygon.technology"

</TabItem>
</Tabs>

Définit les domaines autorisés pour pouvoir partager les réponses des requêtes JSON-RPC.    Ajoute plusieurs indicateurs `--access-control-allow-origins "https://example1.com" --access-control-allow-origins "https://example2.com"` pour autoriser plusieurs domaines.    Si c'est omis, l'en-tête Access-Control-Allow-Origins sera défini sur `*` et tous les domaines seront autorisés.

---

### indicateurs de genèse {#genesis-flags}
| **Tous les indicateurs de genèse** |
|---------------------------------------|---------------------------------------------|
| [dir](/docs/edge/get-started/cli-commands#dir) | [Nom](/docs/edge/get-started/cli-commands#name) |
| [pos](/docs/edge/get-started/cli-commands#pos) | [epoch-size](/docs/edge/get-started/cli-commands#epoch-size) |
| [premine](/docs/edge/get-started/cli-commands#premine) | [chainid](/docs/edge/get-started/cli-commands#chainid) |
| [ibft-validator-type](/docs/edge/get-started/cli-commands#ibft-validator-type) | [ibft-validators-prefix-path](/docs/edge/get-started/cli-commands#ibft-validators-prefix-path) |
| [ibft-validator](/docs/edge/get-started/cli-commands#ibft-validator) | [block-gas-limit](/docs/edge/get-started/cli-commands#block-gas-limit) |
| [consensus](/docs/edge/get-started/cli-commands#consensus) | [noeud de démarrage](/docs/edge/get-started/cli-commands#bootnode) |
| [max-validator-count](/docs/edge/get-started/cli-commands#max-validator-count) | [min-validator-count](/docs/edge/get-started/cli-commands#min-validator-count) |


#### <h4></h4><i>dir</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--dir DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --dir ./genesis.json

</TabItem>
</Tabs>

Définit le répertoire des données de genèse du Polygon Edge. Par défaut :.`./genesis.json`

---

#### <h4></h4><i>Nom</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--name NAME]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --name test-chain

</TabItem>
</Tabs>

Définit le nom pour la chaîne. Défaut:.`polygon-edge`

---

#### <h4></h4><i>pos</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--pos IS_POS]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --pos

</TabItem>
</Tabs>

Définit l'indicateur qui signifie que le client doit utiliser la Preuve d'Enjeu d'IBFT. Défaut de preuve d'autorité si l'indicateur n'est pas fourni ou.`false`

---

#### <h4></h4><i>epoch-size</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--epoch-size EPOCH_SIZE]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --epoch-size 50

</TabItem>
</Tabs>

Définit la taille d'époque pour la chaîne. Défaut.`100000`

---

#### <h4></h4><i>premine</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--premine ADDRESS:VALUE]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --premine 0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000

</TabItem>
</Tabs>

Définit les comptes et les soldes prédominants dans le format.`address:amount` Le montant peut être en décimal ou en hexadécimal.
Solde prédominé par défaut : `0xD3C21BCECCEDA1000000`(1 million de jetons de monnaie native).

---

#### <h4></h4><i>chainid</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--chain-id CHAIN_ID]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --chain-id 200

</TabItem>
</Tabs>

Définit l'Identifiant de la chaîne. Défaut:.`100`

---

#### <h4></h4><i>ibft-validator-type</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--ibft-validator-type IBFT_VALIDATOR_TYPE]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --ibft-validator-type ecdsa

</TabItem>
</Tabs>

Spécifie le mode de validation des en-têtes de bloc. Valeurs possibles :.`[ecdsa, bls]` Défaut:.`bls`

---

#### <h4></h4><i>ibft-validators-prefix-path</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--ibft-validators-prefix-path IBFT_VALIDATORS_PREFIX_PATH]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --ibft-validators-prefix-path test-chain-

</TabItem>
</Tabs>

Chemin de préfixe pour le répertoire du dossier du validateur. Doit être présent si l'indicateur `ibft-validator` est omis.

---

#### <h4></h4><i>ibft-validator</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--ibft-validator IBFT_VALIDATOR_LIST]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --ibft-validator 0xC12bB5d97A35c6919aC77C709d55F6aa60436900

</TabItem>
</Tabs>

Définit les adresses passées comme validateurs IBFT. Doit être présent si l'indicateur `ibft-validators-prefix-path` est omis.
1. Si le réseau fonctionne avec ECDSA, le format est.`--ibft-validator [ADDRESS]`
2. Si le réseau fonctionne avec BLS, le format est.`--ibft-validator [ADDRESS]:[BLS_PUBLIC_KEY]`

---

#### <h4></h4><i>block-gas-limit</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--block-gas-limit BLOCK_GAS_LIMIT]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --block-gas-limit 5000000

</TabItem>
</Tabs>

Désigne la quantité maximale de gaz utilisée par toutes les opérations d'un bloc. Défaut:.`5242880`

---

#### <h4></h4><i>consensus</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--consensus CONSENSUS_PROTOCOL]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --consensus ibft

</TabItem>
</Tabs>

Définit le protocole de consensus Défaut:.`pow`

---

#### <h4></h4><i>noeud de démarrage</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--bootnode BOOTNODE_URL]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --bootnode /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

URL Multiaddr pour le bootstrap de découverte de p2p. Cet indicateur peut être utilisé plusieurs fois.
Au lieu d'une adresse IP, l'adresse DNS du noeud de démarrage peut être fournie.

---

#### <h4></h4><i>max-validator-count</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--max-validator-count MAX_VALIDATOR_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --max-validator-count 42

</TabItem>
</Tabs>

Le nombre maximum de joueurs de stake pouvant rejoindre le validateur défini dans un consensus de PoS.
Ce nombre ne peut pas dépasser la valeur de MAX_SAFE_INTEGER (2^53 - 2).

---

#### <h4></h4><i>min-validator-count</i>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis [--min-validator-count MIN_VALIDATOR_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    genesis --min-validator-count 4

</TabItem>
</Tabs>

Le nombre minimum de joueurs de stake nécessaire pour rejoindre le validateur défini dans un consensus de PoS.
Ce nombre ne peut pas dépasser la valeur de max-validator-count.
Valeur par défaut : 1.

---

### genèse predeploy des indicateurs {#genesis-predeploy-flags}

<h4><i>artifacts-path</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis predeploy [--artifacts-path PATH_TO_ARTIFACTS]

</TabItem>
  <TabItem value="example" label="Example">

    genesis predeploy --artifacts-path ./ArtifactsData.json

</TabItem>
</Tabs>

Définit le chemin vers les artéfacts JSON du contrat qui contient le `abi`, `bytecode`et .`deployedBytecode`

---

<h4><i>chaîne</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis predeploy [--chain PATH_TO_GENESIS]

</TabItem>
  <TabItem value="example" label="Example">

    genesis predeploy --chain ./genesis.json

</TabItem>
</Tabs>

Définit le chemin d'accès au `genesis.json`fichier qui devrait être mis à jour. Défaut `./genesis.json`.

---

<h4><i>constructor-args</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis predeploy [--constructor-args CONSTRUCTOR_ARGUMENT]

</TabItem>
  <TabItem value="example" label="Example">

    genesis predeploy --constructor-args 123

</TabItem>
</Tabs>

Définit les arguments constructeurs de contrats intelligents, le cas échéant. Pour un guide détaillé sur la façon à laquelle ces arguments devraient ressembler, veuillez consulter [l'article prédéploiement](/docs/edge/additional-features/predeployment).

---

<h4><i>predeploy-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    genesis predeploy [--predeploy-address PREDEPLOY_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    genesis predeploy --predeploy-address 0x5555

</TabItem>
</Tabs>

Définit l'adresse à predeploy Défaut `0x0000000000000000000000000000000000001100`.

---


## Les Commandes De L'Opérateur {#operator-commands}

### Commandes des Pairs {#peer-commands}

| **Commande** | **Description** |
|------------------------|-------------------------------------------------------------------------------------|
| ajout de pairs | Ajoute un nouveau pair en utilisant son adresse libp2p |
| liste de pairs | Répertorie tous les pairs auxquels le client est connecté via libp2p |
| statut des pairs | Renvoie le statut d'un pair spécifique de la liste des pairs, en utilisant l'adresse libp2p |

<h3>les pairs ajoutent des indicateurs</h3>

<h4><i>addr</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers add --addr PEER_ADDRESS

</TabItem>
  <TabItem value="example" label="Example">

    peers add --addr /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

Adresse libp2p du pair au format multiaddr.

---

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers add [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    peers add --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Adresse de l'API gRPC. Défaut:.`127.0.0.1:9632`

<h3>indicateurs de la liste des pairs</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers list [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    peers list --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Adresse de l'API gRPC. Défaut:.`127.0.0.1:9632`

<h3>indicateurs d'état des pairs</h3>

<h4><i>peer-id</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers status --peer-id PEER_ID

</TabItem>
  <TabItem value="example" label="Example">

    peers status --peer-id 16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW

</TabItem>
</Tabs>

Identifiant de nœud Libp2p d'un pair spécifique dans le réseau p2p.

---

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    peers status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    peers status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Adresse de l'API gRPC. Défaut:.`127.0.0.1:9632`

### Commandes IBFT {#ibft-commands}

| **Commande** | **Description** |
|------------------------|-------------------------------------------------------------------------------------|
| instantané ibft | Renvoie l'instantané IBFT |
| candidats ibft | Cette requête interroge l'ensemble actuel de candidats proposés, ainsi que les candidats qui n'ont pas encore été inclus |
| proposition ibft | Propose un nouveau candidat à ajouter / supprimer de l'ensemble des validateurs |
| statut ibft | Renvoie l'état général du client IBFT |
|  Changement d'ibft | Ajoutez des configurations de fourche dans le fichier genesis.json pour changer de type IBFT |
| quorum ibft | Spécifie le numéro de bloc après lequel la méthode de la taille du quorum optimale sera utilisée pour parvenir à un consensus |


<h3>indicateurs d'instantané ibft</h3>

<h4><i>nombre</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft snapshot [--number BLOCK_NUMBER]

</TabItem>
  <TabItem value="example" label="Example">

    ibft snapshot --number 100

</TabItem>
</Tabs>

La hauteur de bloc (nombre) pour l'instantané.

---

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft snapshot [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    ibft snapshot --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Adresse de l'API gRPC. Défaut:.`127.0.0.1:9632`

<h3>indicateurs des candidats ibft</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft candidates [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    ibft candidates --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Adresse de l'API gRPC. Défaut:.`127.0.0.1:9632`

<h3>indicateurs de proposition ibft</h3>

<h4><i>vote</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft propose --vote VOTE

</TabItem>
  <TabItem value="example" label="Example">

    ibft propose --vote auth

</TabItem>
</Tabs>

Propose une modification de l'ensemble de validateurs. Valeurs possibles :.`[auth, drop]`

---

<h4><i>addr</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft propose --addr ETH_ADDRESS

</TabItem>
  <TabItem value="example" label="Example">

    ibft propose --addr 0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7

</TabItem>
</Tabs>

Adresse du compte pour lequel le vote doit avoir lieu.

---

<h4><i>bls</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft propose --bls BLS_PUBLIC_KEY

</TabItem>
  <TabItem value="example" label="Example">

    ibft propose --bls 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf

</TabItem>
</Tabs>

Clé Publique BLS du compte faisant l'objet d'un vote, nécessaire uniquement en mode BLS.

---

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft candidates [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    ibft candidates --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Adresse de l'API gRPC. Défaut:.`127.0.0.1:9632`

<h3>indicateurs du statut ibft</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    ibft status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Adresse de l'API gRPC. Défaut:.`127.0.0.1:9632`

<h3>indicateurs de changement ibft</h3>

<h4><i>chaîne</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --chain genesis.json

</TabItem>
</Tabs>

Spécifie le fichier de genèse à mettre à jour. Défaut:.`./genesis.json`

---

<h4><i>Type</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--type TYPE]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --type PoS

</TabItem>
</Tabs>

Spécifie le type IBFT à modifier. Valeurs possibles :.`[PoA, PoS]`

---

<h4><i>déploiement</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--deployment DEPLOYMENT]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --deployment 100

</TabItem>
</Tabs>

Spécifie la hauteur de déploiement du contrat. Uniquement disponible avec PoS.

---

<h4><i>à partir de</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--from FROM]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --from 200

</TabItem>
</Tabs>

---

<h4><i>ibft-validator-type</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

     ibft switch [--ibft-validator-type IBFT_VALIDATOR_TYPE]

</TabItem>
  <TabItem value="example" label="Example">

     ibft switch --ibft-validator-type ecdsa

</TabItem>
</Tabs>

Spécifie le mode de validation des en-têtes de bloc. Valeurs possibles :.`[ecdsa, bls]` Défaut:.`bls`

---

<h4><i>ibft-validators-prefix-path</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

     ibft switch [--ibft-validators-prefix-path IBFT_VALIDATORS_PREFIX_PATH]

</TabItem>
  <TabItem value="example" label="Example">

     ibft switch --ibft-validators-prefix-path test-chain-

</TabItem>
</Tabs>

Chemin de préfixe pour les répertoires des nouveaux validateurs. Doit être présent si l'indicateur `ibft-validator` est omis. Disponible uniquement lorsque le mode IBFT est PoA (`--pos`l'indicateur  est omis).

---

<h4><i>ibft-validator</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

     ibft switch [--ibft-validator IBFT_VALIDATOR_LIST]

</TabItem>
  <TabItem value="example" label="Example">

     ibft switch --ibft-validator 0xC12bB5d97A35c6919aC77C709d55F6aa60436900

</TabItem>
</Tabs>

Définit les adresses passées comme validateurs IBFT utilisés après la fourche. Doit être présent si l'indicateur `ibft-validators-prefix-path` est omis. Disponible uniquement en mode PoA.
1. Si le réseau fonctionne avec ECDSA, le format est.`--ibft-validator [ADDRESS]`
2. Si le réseau fonctionne avec BLS, le format est.`--ibft-validator [ADDRESS][BLS_PUBLIC_KEY]`

---

<h4><i>max-validator-count</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--max-validator-count MAX_VALIDATOR_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --max-validator-count 42

</TabItem>
</Tabs>

Le nombre maximum de joueurs de stake pouvant rejoindre le validateur défini dans un consensus de PoS.
Ce nombre ne peut pas dépasser la valeur de MAX_SAFE_INTEGER (2^53 - 2).

---

<h4><i>min-validator-count</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft switch [--min-validator-count MIN_VALIDATOR_COUNT]

</TabItem>
  <TabItem value="example" label="Example">

    ibft switch --min-validator-count 4

</TabItem>
</Tabs>

Le nombre minimum de joueurs de stake nécessaire pour rejoindre le validateur défini dans un consensus de PoS.
Ce nombre ne peut pas dépasser la valeur de max-validator-count.
Valeur par défaut : 1.

Spécifie la hauteur de départ de la fourche.

---

<h3>indicateurs de quorum ibft</h3>

<h4><i>à partir de</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft quorum [--from your_quorum_switch_block_num]

</TabItem>
  <TabItem value="example" label="Example">

    ibft quorum --from 350

</TabItem>
</Tabs>

La hauteur pour modifier le calcul du quorum sur QuorumOptimal, qui utilise la formule `(2/3 * N)`, `N` est le nombre de nœuds de validateur. Veuillez noter qu'il s'agit d'une compatibilité ancienne, c'est-à-dire uniquement pour les chaînes qui ont utilisé un calcul du Quorum jusqu'à une certaine hauteur de bloc.

---

<h4><i>chaîne</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    ibft quorum [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    ibft quorum --chain genesis.json

</TabItem>
</Tabs>

Spécifie le fichier de genèse à mettre à jour. Défaut:.`./genesis.json`

### Commandes du Pool de Transactions {#transaction-pool-commands}

| **Commande** | **Description** |
|------------------------|--------------------------------------------------------------------------------------|
| statut txpool | Renvoie le nombre de transactions dans le pool |
| abonnement txpool | S'abonne aux événements dans le pool de transactions |

<h3>indicateurs du statut txpool</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    txpool status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Adresse de l'API gRPC. Défaut:.`127.0.0.1:9632`

<h3>indicateurs d'abonnement txpool</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Adresse de l'API gRPC. Défaut:.`127.0.0.1:9632`

---

<h4><i>promu</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--promoted LISTEN_PROMOTED]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --promoted

</TabItem>
</Tabs>

S'abonne aux événements tx promus dans le TxPool.

---

<h4><i>supprimé</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--dropped LISTEN_DROPPED]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --dropped

</TabItem>
</Tabs>

S'abonne aux événements tx supprimés dans le TxPool.

---

<h4><i>rétrogradé</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--demoted LISTEN_DEMOTED]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --demoted

</TabItem>
</Tabs>

S'abonne aux événements tx rétrogradés dans le TxPool.

---

<h4><i>ajouté</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--added LISTEN_ADDED]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --added

</TabItem>
</Tabs>

S'abonne aux événements tx ajoutés au TxPool.

---

<h4><i>placé dans la file d'attente</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    txpool subscribe [--enqueued LISTEN_ENQUEUED]

</TabItem>
  <TabItem value="example" label="Example">

    txpool subscribe --enqueued

</TabItem>
</Tabs>

S'abonne aux événements tx en file d'attente dans les files d'attente du compte.

---

### Les commandes de Blockchain {#blockchain-commands}

| **Commande** | **Description** |
|------------------------|-------------------------------------------------------------------------------------|
| statut | Renvoie le statut du client. La réponse détaillée peut être trouvée ci-dessous |
| contrôler | S'abonne à un flux d'événements de blockchain. La réponse détaillée peut être trouvée ci-dessous |
| version | Renvoie la version actuelle du client |

<h3>indicateurs d'état</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    status [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    status --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Adresse de l'API gRPC. Défaut:.`127.0.0.1:9632`

<h3>surveiller les indicateurs</h3>

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    monitor [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    monitor --grpc-address 127.0.0.1:10003

</TabItem>
</Tabs>

Adresse de l'API gRPC. Défaut:.`127.0.0.1:9632`

---
<h3>commande de version</h3>


<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    version

</TabItem>
</Tabs>

Affiche la version de version, la branche git, le hachage de commit et le temps de construction.

## Les Commandes Secrets {#secrets-commands}

| **Commande** | **Description** |
|-------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| initialisation des secrets | Initialise les clés privées vers le gestionnaire des secrets correspondant |
| secrets générés | Génère un fichier de configuration de gestionnaire de secrets qui peut être analysé par Polygon Edge |
| sortie secrets | Imprimez l'adresse de clé publique BLS, l'adresse de clé publique validatrice et l'ID de nœud pour référence |

### indicateurs d'initialisation de secrets {#secrets-init-flags}

<h4><i>config</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets init [--config SECRETS_CONFIG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets init --config ./secretsManagerConfig.json

</TabItem>
</Tabs>

Définit le chemin d'accès au fichier de configuration. Utilisé pour Hashicorp Vault. S'il est omis, le gestionnaire FS secrets local est utilisé.

---

<h4><i>data-dir</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets init [--data-dir DATA_DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    secrets init --data-dir ./example-dir

</TabItem>
</Tabs>

Définit le répertoire des données de Polygon Edge si la FS locale est utilisée.

---

<h4><i>ecdsa</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets init [--ecdsa FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets init --ecdsa=false

</TabItem>
</Tabs>

Définit l'indicateur précisant s'il faut générer une clé ECDSA. Défaut: `true`.

---

<h4><i>réseau</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets init [--network FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets init --network=false

</TabItem>
</Tabs>

Définit l'indicateur précisant s'il faut générer une clé de Réseau Libp2p. Défaut: `true`.

---

<h4><i>bls</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets init [--bls FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets init --bls

</TabItem>
</Tabs>

Définit l'indicateur précisant s'il faut générer une clé de BLS. Défaut: `true`.

### indicateurs de secrets générés {#secrets-generate-flags}

<h4><i>dir</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--dir DATA_DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --dir ./example-dir

</TabItem>
</Tabs>

Définit le répertoire du fichier de configuration du gestionnaire de secrets par défaut : `./secretsManagerConfig.json`

---

<h4><i>Type</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--type TYPE]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --type hashicorp-vault

</TabItem>
</Tabs>

Spécifie le type du gestionnaire de secrets [`hashicorp-vault`]. Défaut : `hashicorp-vault`

---

<h4><i>jeton</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--token TOKEN]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --token s.zNrXa9zF9mgrdnClM7PZ19cu

</TabItem>
</Tabs>

Spécifie le jeton d'accès pour le service

---

<h4><i>url du serveur</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--server-url SERVER_URL]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --server-url http://127.0.0.1:8200

</TabItem>
</Tabs>

Spécifie l'URL du serveur pour le service

---

<h4><i>nom</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--name NODE_NAME]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --name node-1

</TabItem>
</Tabs>

Spécifie le nom du nœud pour la conservation des enregistrements en service. Défaut : `polygon-edge-node`

---

<h4><i>namespace</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets generate [--namespace NAMESPACE]

</TabItem>
  <TabItem value="example" label="Example">

    secrets generate --namespace my-namespace

</TabItem>
</Tabs>

Spécifie l'espace de noms utilisé pour le gestionnaire de secrets Hashicorp Vault. Défaut : `admin`

### secrets sorties flags {#secrets-output-flags}

<h4><i>bls</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--bls FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --bls

</TabItem>
</Tabs>

Définit l'indicateur indiquant s'il faut uniquement afficher la clé publique BLS. Défaut : `true`

---

<h4><i>config</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--config SECRETS_CONFIG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --config ./secretsManagerConfig.json

</TabItem>
</Tabs>

Définit le chemin d'accès au fichier de configuration. S'il est omis, le gestionnaire FS secrets local est utilisé.

---

<h4><i>data-dir</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--data-dir DATA_DIRECTORY]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --data-dir ./example-dir

</TabItem>
</Tabs>

Définit le répertoire des données de Polygon Edge si la FS locale est utilisée.

---

<h4><i>node-id</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--node-id FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --node-id

</TabItem>
</Tabs>

Définit l'indicateur indiquant s'il faut uniquement produire l'ID de nœud réseau. Défaut : `true`

---

<h4><i>Validateur</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    secrets output [--validator FLAG]

</TabItem>
  <TabItem value="example" label="Example">

    secrets output --validator

</TabItem>
</Tabs>

Définit l'indicateur indiquant s'il faut uniquement afficher l'adresse validateur. Défaut : `true`

---

## Réponses {#responses}

### Réponse D'État {#status-response}

L'objet de réponse est défini en utilisant les Protections de Protocole.
````go title="minimal/proto/system.proto"
message ServerStatus {
    int64 network = 1;

    string genesis = 2;

    Block current = 3;

    string p2pAddr = 4;

    message Block {
        int64 number = 1;
        string hash = 2;
    }
}
````

### Surveiller La Réponse {#monitor-response}
````go title="minimal/proto/system.proto"
message BlockchainEvent {
    // The "repeated" keyword indicates an array
    repeated Header added = 1;
    repeated Header removed = 2;

    message Header {
        int64 number = 1;
        string hash = 2;
    }
}
````

## Utilitaires {#utilities}

### les commandes de liste blanche {#whitelist-commands}

| **Commande** | **Description** |
|------------------------|-------------------------------------------------------------------------------------|
| afficher la liste blanche | Affiche les informations de la liste blanche |
| déploiement de la liste blanche | Met à jour la liste blanche de déploiement des contrats intelligents |

<h3>afficher la liste blanche</h3>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist show

</TabItem>
</Tabs>

Affiche les informations de la liste blanche.

---

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist show [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist show --chain genesis.json

</TabItem>
</Tabs>

Spécifie le fichier de genèse à mettre à jour. Défaut: `./genesis.json`.

---

<h3>déploiement de la liste blanche</h3>

<h4><i>chaîne</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist deployment [--chain GENESIS_FILE]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist deployment --chain genesis.json

</TabItem>
</Tabs>

Spécifie le fichier de genèse à mettre à jour. Défaut: `./genesis.json`.

---

<h4><i>ajouter</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist deployment [--add ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist deployment --add 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d

</TabItem>
</Tabs>

Ajoute une nouvelle adresse à la liste blanche de déploiement du contrat Seules les adresses de la liste blanche de déploiement de contrats peuvent déployer des contrats. Si vide, n'importe quelle adresse peut exécuter le déploiement du contrat

---

<h4><i>supprimer</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    whitelist deployment [--remove ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    whitelist deployment --remove 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d

</TabItem>
</Tabs>

Supprime une adresse de la liste blanche de déploiement du contrat. Seules les adresses de la liste blanche de déploiement de contrats peuvent déployer des contrats. Si vide, n'importe quelle adresse peut exécuter le déploiement du contrat

---

### les indicateurs de sauvegarde {#backup-flags}

<h4><i>grpc-address</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    backup [--grpc-address GRPC_ADDRESS]

</TabItem>
  <TabItem value="example" label="Example">

    backup --grpc-address 127.0.0.1:9632

</TabItem>
</Tabs>

Adresse de l'API gRPC. Défaut: `127.0.0.1:9632`.

---

<h4><i>sortie</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    backup [--out OUT]

</TabItem>
  <TabItem value="example" label="Example">

    backup --out backup.dat

</TabItem>
</Tabs>

La trajectoire du fichier d'archive à sauvegarder.

---

<h4><i>à partir de</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    from [--from FROM]

</TabItem>
  <TabItem value="example" label="Example">

    backup --from 0x0

</TabItem>
</Tabs>

La hauteur du début des blocs dans l'archive. Défaut : 0.

---

<h4><i>vers</i></h4>

<Tabs>
  <TabItem value="syntax" label="Syntax" default>

    to [--to TO]

</TabItem>
  <TabItem value="example" label="Example">

    backup --to 0x2710

</TabItem>
</Tabs>

La hauteur de la fin des blocs dans l'archive.

---

## Modèle de Genèse {#genesis-template}
Le fichier de genèse doit être utilisé pour définir l'état initial de la blockchain (par exemple si certains comptes doivent avoir un solde de départ).

Le fichier *./genesis.json* suivant est généré :
````json
{
    "name": "example",
    "genesis": {
        "nonce": "0x0000000000000000",
        "gasLimit": "0x0000000000001388",
        "difficulty": "0x0000000000000001",
        "mixHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "coinbase": "0x0000000000000000000000000000000000000000",
        "parentHash": "0x0000000000000000000000000000000000000000000000000000000000000000"
    },
    "params": {
        "forks": {},
        "chainID": 100,
        "engine": {
            "pow": {}
        }
    },
    "bootnodes": []
}
````

### Répertoire Des Données {#data-directory}

Lors de l'exécution de l'indicateur *data-dir*, un dossier **test-chain** est généré. La structure des dossiers se compose des sous-dossiers suivants :
* **blockchain** - Enregistre le LevelDB pour les objets de blockchain
* **trie** - Enregistre le LevelDB pour les essais de Merkle
* **keystore** - Enregistre les clés privées du client. Cela inclut la clé privée de libp2p et la clé privée de scellement/validateur
* **consensus** - Enregistre toutes les informations du consensus dont le client pourrait avoir besoin pendant son travail.

## Ressources {#resources}
* **[Protection du Protocole](https://developers.google.com/protocol-buffers)**

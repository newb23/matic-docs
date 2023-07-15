---
id: bls
title: BLS
description: "Explication et instructions concernant le mode BLS."
keywords:
  - docs
  - polygon
  - edge
  - bls
---

## Aperçu {#overview}

BLS également connu sous le nom de Boneh–Lynn–Shacham (BLS)—is un schéma de signature cryptographique qui permet à un utilisateur de vérifier qu'un signataire est authentique. Il s'agit d'un schéma de signature qui peut agréger plusieurs signatures. Dans Polygon Edge, BLS est utilisé par défaut afin de fournir une plus grande sécurité dans le mode de consensus IBFT. BLS peut regrouper les signatures dans un seul tableau d'octets et réduire la taille de l'en-tête du bloc. Chaque chaîne a le choix d'utiliser ou non BLS. La clé ECDSA est utilisée, que le mode BLS soit activé ou non.

## Présentation vidéo {#video-presentation}

[![bls - vidéo](https://img.youtube.com/vi/HbUmZpALlqo/0.jpg)](https://www.youtube.com/watch?v=HbUmZpALlqo)

## Comment configurer une nouvelle chaîne à l'aide de BLS {#how-to-setup-a-new-chain-using-bls}

Référez-vous aux sections [Configuration Locale](/docs/edge/get-started/set-up-ibft-locally) / [Configuration du Cloud](/docs/edge/get-started/set-up-ibft-on-the-cloud) pour obtenir des instructions de configuration détaillées.

## Comment migrer d'une chaîne de PoA ECDSA existante vers une chaîne de PoA BLS {#how-to-migrate-from-an-existing-ecdsa-poa-chain-to-bls-poa-chain}

Cette section décrit comment utiliser le mode BLS dans une chaîne de PoA existante.
 les étapes suivantes sont nécessaires afin d'activer BLS dans une chaîne de PoA.

1. Arrêtez tous les nœuds
2. Générez les clés BLS pour les validateurs
3. Ajoutez un paramètre de fourche dans genesis.json
4. Redémarrez tous les nœuds

### 1. Arrêtez tous les nœuds {#1-stop-all-nodes}

Terminez tous les processus des validateurs en utilisant les touches Ctrl + c (Control + c). Veuillez mémoriser la dernière taille de bloc (le numéro de séquence le plus élevé dans le registre des blocs confirmés).

### 2. Générez la clé BLS {#2-generate-the-bls-key}

`secrets init` avec le `--bls` génère une clé BLS. `--ecdsa` et `--network` doivent être désactivés afin de conserver la clé ECDSA et la clé réseau existantes et d'ajouter une nouvelle clé BLS.

```bash
polygon-edge secrets init --bls --ecdsa=false --network=false

[SECRETS INIT]
Public key (address) = 0x...
BLS Public key       = 0x...
Node ID              = 16...
```

### 3. Ajoutez un paramètre de fourche {#3-add-fork-setting}

`ibft switch`La commande  ajoute un paramètre de fourche, qui active BLS dans la chaîne existante, dans `genesis.json`.

Les validateurs doivent être indiqués dans la commande pour les réseaux de PoA. Tout comme pour la commande `genesis`, les indicateurs `--ibft-validators-prefix-path` ou `--ibft-validator` peuvent être utilisés pour spécifier le validateur.

Spécifiez la taille à partir de laquelle la chaîne démarre en utilisant BLS avec`--from` l'indicateur.

```bash
polygon-edge ibft switch --chain ./genesis.json --type PoA --ibft-validator-type bls --ibft-validators-prefix-path test-chain- --from 100
```

### 4. Redémarrez tous les nœuds {#4-restart-all-nodes}

Redémarrez tous les nœuds avec la `server`commande. Après la création du bloc au `from` spécifié à l'étape précédente est créé, la chaîne active BLS et affiche les journaux comme ci-dessous :

```bash
2022-09-02T11:45:24.535+0300 [INFO]  polygon.ibft: IBFT validation type switched: old=ecdsa new=bls
```

Les registres indiquent également quel mode de vérification est utilisé pour générer chaque bloc après sa création.

```
2022-09-02T11:45:28.728+0300 [INFO]  polygon.ibft: block committed: number=101 hash=0x5f33aa8cea4e849807ca5e350cb79f603a0d69a39f792e782f48d3ea57ac46ca validation_type=bls validators=3 committed=3
```

## Comment migrer d'une chaîne PdV ECDSA existante vers une chaîne PdV BLS {#how-to-migrate-from-an-existing-ecdsa-pos-chain-to-a-bls-pos-chain}

Cette section décrit comment utiliser le mode BLS dans une chaîne de PoS existante.
 Les étapes suivantes sont requises afin d'activer BLS dans la chaîne de PoS.

1. Arrêtez tous les nœuds
2. Générez les clés BLS pour les validateurs
3. Ajoutez un paramètre de fourche dans genesis.json
4. Appelez le contrat de staking pour enregistrer la Clé Publique de BLS
5. Redémarrez tous les nœuds

### 1. Arrêtez tous les nœuds {#1-stop-all-nodes-1}

Terminez tous les processus des validateurs en utilisant les touches Ctrl + c (Control + c). Veuillez mémoriser la dernière taille de bloc (le numéro de séquence le plus élevé dans le registre des blocs confirmés).

### 2. Générez la clé BLS {#2-generate-the-bls-key-1}

`secrets init` avec `--bls`l'indicateur  génère la clé BLS. `--ecdsa` et `--network` doivent être désactivés afin de conserver les clés ECDSA et réseau existantes et d'ajouter une nouvelle clé BLS.

```bash
polygon-edge secrets init --bls --ecdsa=false --network=false

[SECRETS INIT]
Public key (address) = 0x...
BLS Public key       = 0x...
Node ID              = 16...
```

### 3. Ajoutez un paramètre de fourche {#3-add-fork-setting-1}

`ibft switch`La commande ajoute un paramètre de fourche, qui active BLS à partir du milieu de la chaîne dans `genesis.json`.

Spécifiez la taille à partir de laquelle la chaîne démarre en utilisant le mode BLS avec `from` l'indicateur , et la taille à laquelle le contrat est mis à jour avec `development` l'indicateur.

```bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --ibft-validator-type bls --deployment 50 --from 200
```

### 4. Enregistrer la Clé Publique de BLS dans le contrat de staking {#4-register-bls-public-key-in-staking-contract}

Après l'ajout de la fourche et le redémarrage des validateurs, chaque validateur doit appeler `registerBLSPublicKey` dans le contrat de staking pour enregistrer la Clé Publique de BLS. Ceci doit être fait après la taille spécifiée en `--deployment` avant la taille spécifiée en `--from`.

Le scénario pour enregistrer la Clé Publique de BLS est défini dans le [référentiel du Contrat Intelligent de Staking](https://github.com/0xPolygon/staking-contracts).

Définissez `BLS_PUBLIC_KEY` pour être enregistré dans `.env`le dossier. Voir [staker-déstaker-pos](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts) pour plus de détails sur les autres paramètres.

```env
JSONRPC_URL=http://localhost:10002
STAKING_CONTRACT_ADDRESS=0x0000000000000000000000000000000000001001
PRIVATE_KEYS=0x...
BLS_PUBLIC_KEY=0x...
```

La commande suivante enregistre la Clé Publique de BLS donnée dans `.env` au contrat.

```bash
npm run register-blskey
```

:::warning Les validateurs doivent enregistrer manuellement la Clé Publique de BLS

En mode BLS, les validateurs doivent disposer de leur propre adresse et de la clé publique de BLS. La couche de consensus ignore les validateurs qui n'ont pas enregistré la clé publique BLS dans le contrat lorsque le consensus récupère les informations sur les validateurs dans le contrat.

:::

### 5. Redémarrez tous les nœuds {#5-restart-all-nodes}

Redémarrez tous les nœuds avec la `server`commande. La chaîne active le BLS après la création du bloc au `from` spécifié à l'étape précédente est créé.

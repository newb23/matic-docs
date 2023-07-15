---
id: definitions
title: Définitions Générales
description: Définitions Générales des termes utilisés dans chainBridge
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---


## Relais {#relayer}
Chainbridge est un pont de type relais. Le rôle d'un relais est de voter pour l'exécution d'une requête (combien de jetons il faut brûler/lancer, par exemple).
Cela surveille les événements de chaque chaîne et vote pour une proposition dans le contrat Bridge de la chaîne de destination lorsqu'il reçoit un `Deposit` événement d'une chaîne. Un relais appelle une méthode dans le contrat Bridge pour exécuter la proposition après que le nombre requis de votes a été soumis. Le pont délègue l'exécution au contrat Gestionnaire.


## Types de contrats {#types-of-contracts}
Dans ChainBridge, il existe trois types de contrats sur chaque chaîne, appelés Bridge/Handler/Target.

| **Type** | **Description** |
|----------|-------------------------------------------------------------------------------------------------------------------------------|
| Contrat Bridge | Un contrat Bridge qui gère les requêtes, les votes, les exécutions doit être déployé dans chaque chaîne. Les utilisateurs appelleront `deposit` dans Bridge pour démarrer un transfert, et Bridge délègue le processus au contrat Gestionnaire correspondant au contrat Cible. Une fois que le contrat Gestionnaire a réussi à appeler le contrat Cible, le contrat Bridge émet un `Deposit` événement pour notifier les relais. |
| Contrat Gestionnaire | Ce contrat interagit avec le contrat Target pour exécuter un dépôt ou une proposition. Cela valide la demande de l'utilisateur, appelle le contrat Cible et aide avec certains paramètres du contrat Cible. Il existe certains contrats Gestionnaires pour appeler chaque contrat Cible qui a une interface différente. Les appels indirects émis par le contrat Gestionnaire font le pont pour permettre le transfert de tout type d'actifs ou des données. Actuellement, il existe trois types de contrats Gestionnaires mis en œuvre par ChainBridge: ERC20Handler, ERC721Handler et GenericHandler. |
| Contrat Cible | Un contrat qui gère les actifs à échanger ou les messages qui sont transférés entre les chaînes. L'interaction avec ce contrat se fera de chaque côté du pont. |

<div style={{textAlign: 'center'}}>

![Architecture de ChainBridge](/img/edge/chainbridge/architecture.svg)
*Architecture de ChainBridge*

</div>

<div style={{textAlign: 'center'}}>

![Flux de travail du transfert de jeton ERC20](/img/edge/chainbridge/erc20-workflow.svg)
*ex. Flux de travail d'un transfert de jeton ERC20*

</div>

## Types de comptes {#types-of-accounts}

Veuillez vous assurer que les comptes disposent de suffisamment de jetons natifs pour créer des transactions avant de commencer. Dans Edge de Polygon, vous pouvez attribuer des soldes prédéfinis aux comptes lors de la production du bloc de genèse.

| **Type** | **Description** |
|----------|-------------------------------------------------------------------------------------------------------------------------------|
| Administrateur | Ce compte se verra attribuer le rôle d'administrateur par défaut. |
| Utilisateur | Le compte expéditeur/destinataire qui envoie/reçoit des actifs. Le compte de l'expéditeur paie les frais de gaz lors de l'approbation des transferts de jetons et de l'appel du dépôt dans le contrat Bridge pour commencer un transfert. |

:::info Le rôle d'administrateur

Certaines actions ne peuvent être effectuées que par le compte disposant du rôle administrateur. Par défaut, le déployeur du contrat Bridge dispose du rôle d'administrateur. Vous trouverez ci-dessous comment attribuer le rôle d'administrateur à un autre compte ou le supprimer.

### Ajouter un rôle d'administrateur {#add-admin-role}

Ajoute un administrateur

```bash
# Grant admin role
$ cb-sol-cli admin add-admin \
  --url [JSON_RPC_URL] \
  --privateKey [PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --admin "[NEW_ACCOUNT_ADDRESS]"
```
### Révoquer le rôle d'administrateur {#revoke-admin-role}

Supprime un administrateur

```bash
# Revoke admin role
$ cb-sol-cli admin remove-admin \
  --url [JSON_RPC_URL] \
  --privateKey [PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --admin "[NEW_ACCOUNT_ADDRESS]"
```

## Les opérations qui sont autorisées par le `admin` compte  sont les suivantes. {#account-are-as-below}

### Définir La Ressource {#set-resource}

Enregistrez un Identifiant de ressource avec une adresse de contrat pour un gestionnaire.

```bash
# Register new resource
$ cb-sol-cli bridge register-resource \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --resourceId "[RESOURCE_ID]" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[TARGET_CONTRACT_ADDRESS]"
```

### Rendre le contrat brûlant/monétisé {#make-contract-burnable-mintable}

Définissez un contrat de jeton comme monétisé/brûlant dans un gestionnaire.

```bash
# Let contract burnable/mintable
$ cb-sol-cli bridge set-burn \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[TARGET_CONTRACT_ADDRESS]"
```

### Annuler la proposition {#cancel-proposal}

Annuler la proposition d'exécution

```bash
# Cancel ongoing proposal
$ cb-sol-cli bridge cancel-proposal \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --resourceId "[RESOURCE_ID]" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --chainId "[CHAIN_ID_OF_SOURCE_CHAIN]" \
  --depositNonce "[NONCE]"
```

### Pause/Reprendre {#pause-unpause}

Arrêter temporairement les dépôts, la création de propositions, le vote et les exécutions de dépôt.

```bash
# Pause
$ cb-sol-cli admin pause \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]"

# Unpause
$ cb-sol-cli admin unpause \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]"
```

### Modifier Les Frais {#change-fee}

Modifier les frais qui seront payés au Contrat Bridge

```bash
# Change fee for execution
$ cb-sol-cli admin set-fee \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --fee [FEE_IN_WEI]
```

### Ajouter/Supprimer un relais {#add-remove-a-relayer}

Ajouter un compte en tant que nouveau relais ou supprimer un compte des relais

```bash
# Add relayer
$ cb-sol-cli admin add-relayer \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --relayer "[NEW_RELAYER_ADDRESS]"

# Remove relayer
$ cb-sol-cli admin remove-relayer \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --relayer "[RELAYER_ADDRESS]"
```

### Modifier le niveau du relais {#change-relayer-threshold}

Modifier le nombre de votes requis pour l'exécution d'une proposition

```bash
# Remove relayer
$ cb-sol-cli admin set-threshold \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --threshold [THRESHOLD]
```
:::

## Identifiant de la chaîne {#chain-id}

Le Chainbridge `chainId` est une valeur arbitraire utilisée dans le pont pour différencier entre les réseaux de la blockchain, et cela doit être dans la plage d'uint8. À ne pas confondre avec l'Identifiant de la chaîne du réseau, ce n'est pas la même chose. Cette valeur doit être unique, mais elle ne doit pas nécessairement être identique à l'Identifiant du réseau.

Dans cet exemple, nous avons défini `99` dans `chainId`, car l'Identifiant de la chaîne du testnet de Mumbai est `80001`, ce qui ne peut pas être représenté par un uint8.

## Identifiant de la Ressource {#resource-id}

Un Identifiant de la ressource est une valeur unique de 32 octets dans un environnement inter-chaînes, associée à un certain actif (ressource) qui est transféré entre les réseaux.

L'Identifiant de ressource est arbitraire, mais, par convention, le dernier octet contient généralement l'Identifiant de chaîne de la chaîne source (le réseau d'où provient cet actif).

## URL JSON-RPC pour PoS de Polygon {#json-rpc-url-for-polygon-pos}

Pour ce guide, nous utiliserons https://rpc-mumbai.matic.today, un URL JSON-RPC publique fourni par Polygon, qui peut avoir des limites de trafic ou de prix. Cela sera utilisé seulement pour se connecter au testnet de Polygon Mumbai. Nous vous conseillons d'obtenir votre URL JSON-RPC par un service externe comme Infura, car le déploiement de contrats enverra de nombreuses questions/requêtes au JSON-RPC.

## Des façons de traiter le transfert de jetons {#ways-of-processing-the-transfer-of-tokens}
Lors du transfert de jetons ERC20 entre les chaînes, ils peuvent être traités selon deux modes différents:

### Le mode verrouillage/déclenchement {#lock-release-mode}
<b>Chaîne source: </b>Les jetons que vous envoyez seront verrouillés dans le Contrat Gestionnaire  <br/>
<b>Chaîne de destination:</b> Le même nombre de jetons que vous avez envoyés dans la chaîne source serait déverrouillé et transféré du contrat Gestionnaire vers le compte destinataire dans la chaîne de destination.

### Mode brûler/frapper {#burn-mint-mode}
<b>Chaîne source:</b> Les jetons que vous envoyez seront brûlés.   <br/>
<b>Chaîne de destination:</b> La même quantité de jetons que vous avez envoyés et brûlés sur la chaîne source sera frappée sur la chaîne de destination et envoyée au compte destinataire.

Vous pouvez utiliser différents modes sur chaque chaîne. Cela signifie que vous pouvez verrouiller un jeton dans la chaîne principale tout en créant un jeton dans la sous-chaîne pour le transfert. Par exemple, cela peut être judicieux de verrouiller/déclencher les jetons si l'approvisionnement total ou le calendrier d'émission est contrôlé. Les jetons seraient frappés/brûlés si le contrat dans la sous-chaîne devait suivre l'approvisionnement dans la chaîne principale.

Le mode par défaut est le mode verrouillage/déclenchement. Si vous voulez rendre les Jetons monétisés/brûlés, vous devez appeler `adminSetBurnable` la méthode. Si vous souhaitez créer des jetons lors de l'exécution, vous devrez attribuer `minter` un rôle au contrat Gestionnaire de ERC20.



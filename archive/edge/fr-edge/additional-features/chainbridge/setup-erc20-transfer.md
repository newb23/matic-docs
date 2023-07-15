---
id: setup-erc20-transfer
title: Transfert de Jeton ERC20
description: Comment configurer le transfert de ERC-20 dans chainBridge
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

Jusqu'à présent, nous avons mis en place un pont pour échanger des actifs/données entre le PoS de Polygon et la chaîne Edge de Polygon. Cette section vous guidera pour mettre en place un pont ERC20 et envoyer des jetons entre différentes blockchains.

## Étape 1: Enregistrez l'Identifiant de la ressource {#step-1-register-resource-id}

D'abord, vous enregistrerez un identifiant de ressource qui associe des ressources dans un environnement de chaîne croisée. Un Identifiant de Ressource est une valeur de 32 octets qui doit être unique pour la ressource que nous transférons entre ces blockchains. Les Identifiants de Ressource sont arbitraires, mais ils peuvent avoir l'Identifiant de chaîne de la chaîne d'accueil dans le dernier octet, comme une convention (chaîne d'accueil faisant référence au réseau d'où proviennent ces ressources).

Pour enregistrer l'Identifiant de ressource, vous pouvez utiliser la `cb-sol-cli bridge register-resource` commande. Vous devrez donner la clé privée du `admin` compte.

```bash
# For Polygon PoS chain
$ cb-sol-cli bridge register-resource \
  --url https://rpc-mumbai.matic.today \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  # Set Resource ID for ERC20
  --resourceId "0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[ERC20_CONTRACT_ADDRESS]"

# For Polygon Edge chain
$ cb-sol-cli bridge register-resource \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  # Set Resource ID for ERC20
  --resourceId "0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[ERC20_CONTRACT_ADDRESS]"
```

## (Facultatif) Rendez les contrats monétisés/brûlés {#optional-make-contracts-mintable-burnable}


```bash
# Let ERC20 contract burn on source chain and mint on destination chain
$ cb-sol-cli bridge set-burn \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[ERC20_CONTRACT_ADDRESS]"

# Grant minter role to ERC20 Handler contract
$ cb-sol-cli erc20 add-minter \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --minter "[ERC20_HANDLER_CONTRACT_ADDRESS]"
```

## Étape 2: Transférez le Jeton ERC20 {#step-2-transfer-erc20-token}

Nous enverrons des Jetons ERC20 de la chaîne PoS de Polygon à la chaîne Edge de Polygon.

Tout d'abord, vous obtiendrez des jetons en les frappant. Un compte avec le `minter` rôle peut créer de nouveaux jetons. Le compte qui a déployé le contrat ERC20 possède le `minter` rôle par défaut. Pour spécifier d'autres comptes en tant que membres du `minter` rôle, vous devez exécuter la `cb-sol-cli erc20 add-minter` commande.

```bash
# Mint ERC20 tokens
$ cb-sol-cli erc20 mint \
  --url https://rpc-mumbai.matic.today \
  --privateKey [MINTER_ACCOUNT_PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --amount 1000
```

Pour vérifier le solde actuel, vous pouvez utiliser la `cb-sol-cli erc20 balance` commande.

```bash
# Check ERC20 token balance
$ cb-sol-cli erc20 balance \
  --url https://rpc-mumbai.matic.today \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --address "[ACCOUNT_ADDRESS]"

[erc20/balance] Account <ACCOUNT_ADDRESS> has a balance of 1000.0
```

Ensuite, vous devez approuver le transfert des jetons ERC20 depuis le compte par le Gestionnaire de ERC20

```bash
# Approve transfer from the account by ERC20 Handler
$ cb-sol-cli erc20 approve \
  --url https://rpc-mumbai.matic.today \
  --privateKey [USER_ACCOUNT_ADDRESS] \
  --gasPrice [GAS_PRICE] \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --recipient "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --amount 500
```

Pour transférer des jetons vers des chaînes Edge de Polygon, vous appellerez `deposit`.

```bash
# Start transfer from Polygon PoS to Polygon Edge chain
$ cb-sol-cli erc20 deposit \
  --url https://rpc-mumbai.matic.today \
  --privateKey [PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  --amount 10 \
  # ChainID of Polygon Edge chain
  --dest 100 \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --recipient "[RECIPIENT_ADDRESS_IN_POLYGON_EDGE_CHAIN]" \
  --resourceId "0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00"
```

Une fois que la transaction de dépôt a été réussie, le relais recevra l'événement et votera pour la proposition. Cela exécute une transaction pour envoyer des jetons au compte destinataire dans la chaîne Edge de Polygon après que le nombre de votes requis est soumis.

```bash
INFO[11-19|08:15:58] Handling fungible deposit event          chain=mumbai dest=100 nonce=1
INFO[11-19|08:15:59] Attempting to resolve message            chain=polygon-edge type=FungibleTransfer src=99 dst=100 nonce=1 rId=000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00
INFO[11-19|08:15:59] Creating erc20 proposal                  chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Watching for finalization event          chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Submitted proposal vote                  chain=polygon-edge tx=0x67a97849951cdf0480e24a95f59adc65ae75da23d00b4ab22e917a2ad2fa940d src=99 depositNonce=1 gasPrice=1
INFO[11-19|08:16:24] Submitted proposal execution             chain=polygon-edge tx=0x63615a775a55fcb00676a40e3c9025eeefec94d0c32ee14548891b71f8d1aad1 src=99 dst=100 nonce=1 gasPrice=5
```

Une fois que la transaction d'exécution a été réussie, vous obtiendrez des jetons dans la chaîne Edge de Polygon.

```bash
# Check the ERC20 balance in Polygon Edge chain
$ cb-sol-cli erc20 balance \
  --url https://localhost:10002 \
  --privateKey [PRIVATE_KEY] \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --address "[ACCOUNT_ADDRESS]"

[erc20/balance] Account <RECIPIENT_ACCOUNT_ADDRESS> has a balance of 10.0
```

---
id: setup-erc721-transfer
title: Transfert de NFT ERC721
description: Comment configurer le transfert de ERC721 dans chainBridge
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

Cette section vous guide dans la configuration d'un pont ERC721 et l'envoi de NFT entre les réseaux de blockchain.

## Étape 1: Enregistrez l'identifiant de la ressource {#step-1-register-resource-id}

Vous devrez d'abord enregistrer l'identifiant de la ressource pour le jeton ERC721 dans les contrats de Bridge sur les deux chaînes.

```bash
# For Polygon PoS chain
$ cb-sol-cli bridge register-resource \
  --url https://rpc-mumbai.matic.today \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  # Set ResourceID for ERC721 Token
  --resourceId "0x000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC721_HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[ERC721_CONTRACT_ADDRESS]"

# For Polygon Edge chain
$ cb-sol-cli bridge register-resource \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  # Set ResourceID for ERC721 Token
  --resourceId "0x000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC721_HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[ERC721_CONTRACT_ADDRESS]"
```

## (Facultatif): Rendez les contrats monétisés/brûlés {#optional-make-contracts-mintable-burnable}

Pour rendre les jetons monétisés/brûlés, vous devrez appeler les commandes suivantes:

```bash
# Let ERC721 contract burn on source chain or mint on destination chain
$ cb-sol-cli bridge set-burn \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC721_HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[ERC721_CONTRACT_ADDRESS]"

# Grant minter role to ERC721 Handler contract (Only if you want to mint)
$ cb-sol-cli erc721 add-minter \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --erc721Address "[ERC721_CONTRACT_ADDRESS]" \
  --minter "[ERC721_HANDLER_CONTRACT_ADDRESS]"
```

## Étape 2: Transfert de NFT {#step-2-transfer-nft}

Tout d'abord, vous frapperez un NFT si vous en avez besoin.

```bash
# Mint NFT 0x50
$ cb-sol-cli erc721 mint \
  --url https://rpc-mumbai.matic.today \
  --privateKey [MINTER_ROLE_ACCOUNT] \
  --gasPrice [GAS_PRICE] \
  --erc721Address "[ERC721_CONTRACT_ADDRESS]" \
  --id 0x50
```

Pour vérifier le propriétaire du NFT, vous pouvez utiliser `cb-sol-cli erc721 owner`

```bash
# Check the current owner of NFT
$ cb-sol-cli erc721 owner \
  --url https://rpc-mumbai.matic.today \
  --erc721Address "[ERC721_CONTRACT_ADDRESS]" \
  --id 0x50
```

Ensuite, vous approuverez un transfert de NFT par le Gestionnaire de ERC721

```bash
# Approve transfer of the NFT 0x50 by ERC721 Handler
$ cb-sol-cli erc721 approve \
  --url https://rpc-mumbai.matic.today \
  --privateKey [PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  --erc721Address "[ERC721_CONTRACT_ADDRESS]" \
  --recipient "[ERC721_HANDLER_CONTRACT_ADDRESS]" \
  --id 0x50
```

Enfin, vous commencerez le transfert

```bash
# Start transfer from Polygon PoS to Polygon Edge chain
$ cb-sol-cli erc721 deposit \
  --url https://rpc-mumbai.matic.today \
  --privateKey [PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --resourceId "0x000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501" \
  --id 0x50 \
  # ChainID of Polygon Edge chain
  --dest 100 \
  --recipient "[RECIPIENT_ADDRESS_IN_POLYGON_EDGE_CHAIN]"
```

Le relais obtiendra l'événement et votera pour la proposition. Il exécute une transaction pour envoyer des NFT au compte destinataire dans la chaîne Edge de Polygon, après que le nombre de votes requis a été soumis.

```bash
INFO[11-19|09:07:50] Handling nonfungible deposit event       chain=mumbai
INFO[11-19|09:07:50] Attempting to resolve message            chain=polygon-edge type=NonFungibleTransfer src=99 dst=100 nonce=2 rId=000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501
INFO[11-19|09:07:50] Creating erc721 proposal                 chain=polygon-edge src=99 nonce=2
INFO[11-19|09:07:50] Watching for finalization event          chain=polygon-edge src=99 nonce=2
INFO[11-19|09:07:50] Submitted proposal vote                  chain=polygon-edge tx=0x58a22d84a08269ad2e8d52d8dc038621f1a21109d11c7b6e0d32d5bf21ea8505 src=99 depositNonce=2 gasPrice=1
INFO[11-19|09:08:15] Submitted proposal execution             chain=polygon-edge tx=0x57419844881a07531e31667c609421662d94d21d0709e64fb728138309267e68 src=99 dst=100 nonce=2 gasPrice=3
```

Vous pouvez vérifier le propriétaire du NFT sur le réseau Edge de Polygon après que l'exécution est terminée.

```bash
# Check the owner of NFT 0x50 in Polygon Edge chain
$ cb-sol-cli erc721 owner \
  --url http://localhost:10002 \
  --erc721Address "[ERC721_CONTRACT_ADDRESS]" \
  --id 0x50
```

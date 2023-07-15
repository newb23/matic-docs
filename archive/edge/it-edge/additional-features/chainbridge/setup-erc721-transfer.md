---
id: setup-erc721-transfer
title: Trasferimento di NFT ERC721
description: Come configurare un trasferimento ERC721 in chainBridge
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

Questa sezione ti guida attraverso la configurazione di un bridge ERC721 e l'invio di NFT tra reti blockchain.

## Passaggio 1: Registra un ID di risorsa {#step-1-register-resource-id}

Dovrai prima registrare l'ID di risorsa per il token ERC721 nei contratti bridge su entrambe le chain.

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

## (Facoltativo): Rendi i contratti mintable/burnable (coniabili/bruciabili) {#optional-make-contracts-mintable-burnable}

Per rendere i token mintable/burnable, dovrai chiamare i seguenti comandi:

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

## Passaggio 2: Trasferisci gli NFT {#step-2-transfer-nft}

In primo luogo, creerai un NFT se ne hai bisogno.

```bash
# Mint NFT 0x50
$ cb-sol-cli erc721 mint \
  --url https://rpc-mumbai.matic.today \
  --privateKey [MINTER_ROLE_ACCOUNT] \
  --gasPrice [GAS_PRICE] \
  --erc721Address "[ERC721_CONTRACT_ADDRESS]" \
  --id 0x50
```

Per controllare il proprietario degli NFT, puoi utilizzare `cb-sol-cli erc721 owner`

```bash
# Check the current owner of NFT
$ cb-sol-cli erc721 owner \
  --url https://rpc-mumbai.matic.today \
  --erc721Address "[ERC721_CONTRACT_ADDRESS]" \
  --id 0x50
```

In seguito, approverai un trasferimento del NFT da parte dell'handler ERC721

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

Infine, avvierai il trasferimento

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

Il relayer riceverà l'evento e voterà la proposta. Esegue una transazione per inviare gli NFT all'account del destinatario nella catena Polygon Edge dopo che è stato inviato il numero di voti richiesto.

```bash
INFO[11-19|09:07:50] Handling nonfungible deposit event       chain=mumbai
INFO[11-19|09:07:50] Attempting to resolve message            chain=polygon-edge type=NonFungibleTransfer src=99 dst=100 nonce=2 rId=000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501
INFO[11-19|09:07:50] Creating erc721 proposal                 chain=polygon-edge src=99 nonce=2
INFO[11-19|09:07:50] Watching for finalization event          chain=polygon-edge src=99 nonce=2
INFO[11-19|09:07:50] Submitted proposal vote                  chain=polygon-edge tx=0x58a22d84a08269ad2e8d52d8dc038621f1a21109d11c7b6e0d32d5bf21ea8505 src=99 depositNonce=2 gasPrice=1
INFO[11-19|09:08:15] Submitted proposal execution             chain=polygon-edge tx=0x57419844881a07531e31667c609421662d94d21d0709e64fb728138309267e68 src=99 dst=100 nonce=2 gasPrice=3
```

Puoi verificare il proprietario dell'NFT sulla rete Polygon Edge al termine dell'esecuzione.

```bash
# Check the owner of NFT 0x50 in Polygon Edge chain
$ cb-sol-cli erc721 owner \
  --url http://localhost:10002 \
  --erc721Address "[ERC721_CONTRACT_ADDRESS]" \
  --id 0x50
```

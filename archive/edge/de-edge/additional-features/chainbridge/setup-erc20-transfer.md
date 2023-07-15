---
id: setup-erc20-transfer
title: ERC20 Token-Transfer
description: ERC-20-Transfer in ChainBridge einrichten
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

Bisher haben wir eine Bridge eingerichtet, um Assets/Daten zwischen der Polygon PoS und der Polygon Edge-Chain auszutauschen. In diesem Abschnitt erfahren Sie, wie eine ERC20 Bridge eingerichtet und Token zwischen verschiedenen Blockchains gesendet werden.

## Schritt 1: Ressourcen-ID registrieren {#step-1-register-resource-id}

Zunächst registrieren Sie eine Ressourcen-ID, die Ressourcen in einer Cross-Chain-Umgebung zuordnet. Eine Ressourcen-ID ist ein 32-Byte-Wert, der für die Ressource, die wir zwischen diesen Blockchains übertragen, einmalig sein muss. Die Ressourcen-IDs sind frei wählbar, können aber als Konvention die Chain-ID der Home-Chain im letzten Byte enthalten (die Home-Chain bezieht sich auf das Netzwerk, aus dem diese Ressourcen stammen).

Um die Ressourcen-ID zu registrieren, können Sie den Befehl `cb-sol-cli bridge register-resource`verwenden. Der Private Key des `admin`Kontos muss angegeben werden.

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

## (Optional) Contracts sind ausstellbar/ausscheidbar anzulegen {#optional-make-contracts-mintable-burnable}


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

## Schritt 2: ERC20-Token übertragen {#step-2-transfer-erc20-token}

Wir senden ERC20 Token von der Polygon PoS-Chain an die Polygon Edge-Chain.

Zunächst erhalten Sie Token, in dem Sie sie ausstellen. Ein Konto mit der `minter`Rolle kann neue Token ausgeben. Das Konto, das den ERC20-Contract bereitgestellt hat, hat standardmäßig die `minter`Rolle. Um andere Konten als Mitglieder der `minter`Rolle anzugeben, muss der Befehl a`cb-sol-cli erc20 add-minter`usgeführt werden.

```bash
# Mint ERC20 tokens
$ cb-sol-cli erc20 mint \
  --url https://rpc-mumbai.matic.today \
  --privateKey [MINTER_ACCOUNT_PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --amount 1000
```

Um den aktuellen Saldo zu überprüfen, kann der Befehl `cb-sol-cli erc20 balance`verwendet werden.

```bash
# Check ERC20 token balance
$ cb-sol-cli erc20 balance \
  --url https://rpc-mumbai.matic.today \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --address "[ACCOUNT_ADDRESS]"

[erc20/balance] Account <ACCOUNT_ADDRESS> has a balance of 1000.0
```

Als Nächstes muss der Transfer von ERC20-Token vom Konto durch den ERC20 Handler genehmigt werden

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

Um Token auf Polygon Edge-Chains zu übertragen, `deposit`aufrufen.

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

Nachdem erfolgreicher Einzahlung, erhält der Relayer das Event und stimmt für den Vorschlag. Er führt eine Transaktion aus, um Token an das Empfängerkonto in der Polygon Edge-Chain zu senden, nachdem die erforderliche Anzahl von Stimmen abgegeben wurde.

```bash
INFO[11-19|08:15:58] Handling fungible deposit event          chain=mumbai dest=100 nonce=1
INFO[11-19|08:15:59] Attempting to resolve message            chain=polygon-edge type=FungibleTransfer src=99 dst=100 nonce=1 rId=000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00
INFO[11-19|08:15:59] Creating erc20 proposal                  chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Watching for finalization event          chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Submitted proposal vote                  chain=polygon-edge tx=0x67a97849951cdf0480e24a95f59adc65ae75da23d00b4ab22e917a2ad2fa940d src=99 depositNonce=1 gasPrice=1
INFO[11-19|08:16:24] Submitted proposal execution             chain=polygon-edge tx=0x63615a775a55fcb00676a40e3c9025eeefec94d0c32ee14548891b71f8d1aad1 src=99 dst=100 nonce=1 gasPrice=5
```

Sobald die Transaktion erfolgreich durchgeführt wurde, erhalten Sie Token in der Polygon Edge-Chain.

```bash
# Check the ERC20 balance in Polygon Edge chain
$ cb-sol-cli erc20 balance \
  --url https://localhost:10002 \
  --privateKey [PRIVATE_KEY] \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --address "[ACCOUNT_ADDRESS]"

[erc20/balance] Account <RECIPIENT_ACCOUNT_ADDRESS> has a balance of 10.0
```

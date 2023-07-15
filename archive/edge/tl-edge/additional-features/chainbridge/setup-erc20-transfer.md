---
id: setup-erc20-transfer
title: Paglilipat ng ERC20 Token
description: Paano i-setup ang paglilipat ng ERC-20 sa chainBridge
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

Sa ngayon, nag set up kami ng bridge para magpalitan ng mga asset/data sa pagitan ng Polygon PoS at Polygon Edge chain. Ang seksyong ito ay gagabay sa iyo para i-set up ang ERC20 bridge at ipadala ang mga token sa pagitan ng iba't ibang blockchain.

## Hakbang 1: Iparehistro ang resource ID {#step-1-register-resource-id}

Una, ipaparehistro mo ang resource ID na nauugnay sa mga resource sa cross-chain environment. Isang 32-bytes na value ang Resource ID na dapat maging natatangi sa resource na inililipat natin sa pagitan ng mga blockchain na ito. Ang mga Resource ID ay arbitrary, ngunit maaaring mayroon silang chain ID ng home chain ng huling byte, bilang kalakaran (Tumutukoy ang home chain sa network kung saan nagmula ang mga resource na ito).

Para maiparehistro ang resource ID, puwede mong gamitin ang `cb-sol-cli bridge register-resource` na command. Kakailanganin mong ibigay ang pribadong key ng `admin` account.

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

## (Opsyonal) Gawing nami-mint/nabu-burn ang mga kontrata {#optional-make-contracts-mintable-burnable}


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

## Hakbang 2: Ilipat ang ERC20 Token {#step-2-transfer-erc20-token}

Magpapadala kami ng mga ERC20 Token mula sa Polygon PoS chain patungo sa Polygon Edge chain.

Una, makakakuha ka ng mga token sa pamamagitan ng pagmi-mint. Puwedeng mag-mint ng mga bagong token ang account na may `minter` na tungkulin. May `minter`na tungkulin bilang default ang account na nag-deploy ng ERC20 contract. Para tukuyin ang iba pang account bilang mga miyembro ng `minter` na tungkulin, kailangan mong patakbuhin ang `cb-sol-cli erc20 add-minter` na command.

```bash
# Mint ERC20 tokens
$ cb-sol-cli erc20 mint \
  --url https://rpc-mumbai.matic.today \
  --privateKey [MINTER_ACCOUNT_PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --amount 1000
```

Para tingnan ang kasalukuyang balanse, puwede mong gamitin ang `cb-sol-cli erc20 balance` na command.

```bash
# Check ERC20 token balance
$ cb-sol-cli erc20 balance \
  --url https://rpc-mumbai.matic.today \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --address "[ACCOUNT_ADDRESS]"

[erc20/balance] Account <ACCOUNT_ADDRESS> has a balance of 1000.0
```

Susunod, kailangan mong aprubahan ang paglilipat ng ERC20 token mula sa account sa pamamagitan ng ERC20 Handler

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

Para ilipat ang mga token patungo sa mga Polygon Edge chain, tatawag ka sa `deposit`.

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

Pagkatapos maging matagumpay ng transaksyon sa pagdeposito, kukunin ng relayer ang event at boboto para sa panukala. Ipatutupad nito ang isang transaksyon para ipadala ang mga token sa account ng tatanggap sa Polygon Edge chain pagkatapos isumite ang kinakailangang bilang ng mga boto.

```bash
INFO[11-19|08:15:58] Handling fungible deposit event          chain=mumbai dest=100 nonce=1
INFO[11-19|08:15:59] Attempting to resolve message            chain=polygon-edge type=FungibleTransfer src=99 dst=100 nonce=1 rId=000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00
INFO[11-19|08:15:59] Creating erc20 proposal                  chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Watching for finalization event          chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Submitted proposal vote                  chain=polygon-edge tx=0x67a97849951cdf0480e24a95f59adc65ae75da23d00b4ab22e917a2ad2fa940d src=99 depositNonce=1 gasPrice=1
INFO[11-19|08:16:24] Submitted proposal execution             chain=polygon-edge tx=0x63615a775a55fcb00676a40e3c9025eeefec94d0c32ee14548891b71f8d1aad1 src=99 dst=100 nonce=1 gasPrice=5
```

Kapag naging matagumpay ang pagsasagawa ng transaksyon, makukuha mo ang mga token sa Polygon Edge chain.

```bash
# Check the ERC20 balance in Polygon Edge chain
$ cb-sol-cli erc20 balance \
  --url https://localhost:10002 \
  --privateKey [PRIVATE_KEY] \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --address "[ACCOUNT_ADDRESS]"

[erc20/balance] Account <RECIPIENT_ACCOUNT_ADDRESS> has a balance of 10.0
```

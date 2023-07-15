---
id: setup-erc20-transfer
title: Transfer Token ERC20
description: Cara menyiapkan transfer ERC-20 di chainBridge
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

Sejauh ini, kita telah menyiapkan jembatan untuk bertukar aset/data antara Polygon PoS dan rantai Polygon Edge. Bagian ini akan memandu Anda menyiapkan jembatan ERC20 dan mengirim token antara berbagai blockchain.

## Langkah 1: Mendaftarkan ID sumber daya {#step-1-register-resource-id}

Pertama, Anda akan mendaftarkan ID sumber daya yang menghubungkan sumber daya pada lingkungan lintas rantai. ID Sumber Daya adalah nilai 32-byte yang harus unik untuk sumber yang kita transfer antara berbagai blockchain ini. ID Sumber Daya bersifat suka-suka, tetapi harus memiliki ID rantai dari rantai asal pada byte terakhirnya, sebagai aturan dasar (rantai asal merujuk ke jaringan tempat sumber daya ini berasal).

Untuk mendaftarkan ID sumber daya, Anda dapat menggunakan perintah `cb-sol-cli bridge register-resource`. Anda harus memberikan kunci privat akun `admin` tersebut.

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

## (Opsional) Buat kontrak yang dapat dibuat/dibakar (mintable/burnable) {#optional-make-contracts-mintable-burnable}


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

## Langkah 2: Mentransfer Token ERC20 {#step-2-transfer-erc20-token}

Kita akan mengirim Token ERC20 dari rantai Polygon PoS ke rantai Polygon Edge.

Pertama, Anda akan mendapat token dengan melakukan pencetakan/pembuatan. Akun dengan peran `minter` dapat mencetak token baru. Akun yang telah menyebar kontrak ERC20 memiliki peran `minter` secara default. Untuk menetapkan akun lain sebagai anggota dari peran `minter`, Anda perlu menjalankan perintah `cb-sol-cli erc20 add-minter`.

```bash
# Mint ERC20 tokens
$ cb-sol-cli erc20 mint \
  --url https://rpc-mumbai.matic.today \
  --privateKey [MINTER_ACCOUNT_PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --amount 1000
```

Untuk memeriksa saldo saat ini, Anda dapat menggunakan perintah `cb-sol-cli erc20 balance`.

```bash
# Check ERC20 token balance
$ cb-sol-cli erc20 balance \
  --url https://rpc-mumbai.matic.today \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --address "[ACCOUNT_ADDRESS]"

[erc20/balance] Account <ACCOUNT_ADDRESS> has a balance of 1000.0
```

Pertama, Anda perlu menyetujui transfer token ERC20 dari akun oleh ERC20 Handler

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

Untuk mentransfer token ke rantai Polygon Edge, Anda akan memanggil `deposit`.

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

Setelah transaksi setor berhasil, relayer akan mendapat kejadian itu dan memberi suara untuk proposal itu. Ini mengeksekusi transaksi mengirim token ke akun penerima di rantai Polygon Edge setelah jumlah suara yang dibutuhkan sudah dikirimkan.

```bash
INFO[11-19|08:15:58] Handling fungible deposit event          chain=mumbai dest=100 nonce=1
INFO[11-19|08:15:59] Attempting to resolve message            chain=polygon-edge type=FungibleTransfer src=99 dst=100 nonce=1 rId=000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00
INFO[11-19|08:15:59] Creating erc20 proposal                  chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Watching for finalization event          chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Submitted proposal vote                  chain=polygon-edge tx=0x67a97849951cdf0480e24a95f59adc65ae75da23d00b4ab22e917a2ad2fa940d src=99 depositNonce=1 gasPrice=1
INFO[11-19|08:16:24] Submitted proposal execution             chain=polygon-edge tx=0x63615a775a55fcb00676a40e3c9025eeefec94d0c32ee14548891b71f8d1aad1 src=99 dst=100 nonce=1 gasPrice=5
```

Setelah transaksi eksekusi berhasil, Anda akan mendapat token di rantai Polygon Edge.

```bash
# Check the ERC20 balance in Polygon Edge chain
$ cb-sol-cli erc20 balance \
  --url https://localhost:10002 \
  --privateKey [PRIVATE_KEY] \
  --erc20Address "[ERC20_CONTRACT_ADDRESS]" \
  --address "[ACCOUNT_ADDRESS]"

[erc20/balance] Account <RECIPIENT_ACCOUNT_ADDRESS> has a balance of 10.0
```

---
id: setup
title: Pengaturan
description: Cara mengatur rantai
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

## Penyebaran kontrak {#contracts-deployment}

Dalam bagian ini, Anda akan menyebarkan kontrak yang diperlukan untuk rantai Polygon PoS dan Polygon Edge dengan `cb-sol-cli`.

```bash
# Setup for cb-sol-cli command
$ git clone https://github.com/ChainSafe/chainbridge-deploy.git
$ cd chainbridge-deploy/cb-sol-cli
$ make install
```

Pertama, kita akan menyebarkan kontrak ke rantai Polygon PoS menggunakan perintah `cb-sol-cli deploy`.  Bendera `--all` membuat perintah penyebaran semua kontrak, termasuk Bridge, ERC20 Handler, ERC721 Handler, Generic Handler, ERC20, dan kontrak ERC721. Selain itu, ini akan mengatur alamat akun relayer default dan ambang

```bash
# Deploy all required contracts into Polygon PoS chain
$ cb-sol-cli deploy --all --chainId 99 \
  --url https://rpc-mumbai.matic.today \
  --gasPrice [GAS_PRICE] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```


Pelajari tentang chainID dan URL JSON-RPC [di sini](/docs/edge/additional-features/chainbridge/definitions)

:::caution

Harga gas default di `cb-sol-cli` adalah `20000000` (`0.02 Gwei`). Untuk menetapkan harga gas yang tepat dalam transaksi, atur nilai menggunakan argumen `--gasPrice`.

```bash
$ cb-sol-cli deploy --all --chainId 99 \
  --url https://rpc-mumbai.matic.today \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1 \
  # Set gas price to 5 Gwei
  --gasPrice 5000000000
```

:::

:::caution

Kontrak Bridge membutuhkan gas 0x3f97b8 (4167608) untuk penyebaran. Pastikan blok yang dihasilkan memiliki batas gas blok yang cukup untuk memuat transaksi pembuatan kontrak. Untuk mempelajari lebih lanjut tentang batas gas blok di Polygon Edge, kunjungi
[Local Setup](/docs/edge/get-started/set-up-ibft-locally)

:::

Setelah kontrak disebarkan, Anda akan mendapatkan hasil berikut:

```bash
Deploying contracts...
✓ Bridge contract deployed
✓ ERC20Handler contract deployed
✓ ERC721Handler contract deployed
✓ GenericHandler contract deployed
✓ ERC20 contract deployed
WARNING: Multiple definitions for safeTransferFrom
✓ ERC721 contract deployed

================================================================
Url:        https://rpc-mumbai.matic.today
Deployer:   <ADMIN_ACCOUNT_ADDRESS>
Gas Limit:   8000000
Gas Price:   20000000
Deploy Cost: 0.00029065308

Options
=======
Chain Id:    <CHAIN_ID>
Threshold:   <RELAYER_THRESHOLD>
Relayers:    <RELAYER_ACCOUNT_ADDRESS>
Bridge Fee:  0
Expiry:      100

Contract Addresses
================================================================
Bridge:             <BRIDGE_CONTRACT_ADDRESS>
----------------------------------------------------------------
Erc20 Handler:      <ERC20_HANDLER_CONTRACT_ADDRESS>
----------------------------------------------------------------
Erc721 Handler:     <ERC721_HANDLER_CONTRACT_ADDRESS>
----------------------------------------------------------------
Generic Handler:    <GENERIC_HANDLER_CONTRACT_ADDRESS>
----------------------------------------------------------------
Erc20:              <ERC20_CONTRACT_ADDRESS>
----------------------------------------------------------------
Erc721:             <ERC721_CONTRACT_ADDRESS>
----------------------------------------------------------------
Centrifuge Asset:   Not Deployed
----------------------------------------------------------------
WETC:               Not Deployed
================================================================
```

Sekarang kita dapat menyebarkan kontrak ke rantai Polygon Edge.

```bash
# Deploy all required contracts into Polygon Edge chain
$ cb-sol-cli deploy --all --chainId 100 \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```

Simpan output terminal dengan alamat kontrak cerdas yang disebarkan karena kita akan membutuhkannya di langkah berikutnya.

## Pengaturan relayer {#relayer-setup}

Dalam bagian ini, Anda memulai relayer untuk penukaran data di antara 2 rantai.

Pertama, kita perlu mengklona dan membangun repositori ChainBridge.

```bash
$ git clone https://github.com/ChainSafe/ChainBridge.git
$ cd chainBridge && make install
```

Selanjutnya, Anda perlu membuat `config.json` dan mengatur URL JSON-RPC, alamat relayer, dan alamat kontrak setiap rantai.

```json
{
  "chains": [
    {
      "name": "mumbai",
      "type": "ethereum",
      "id": "99",
      "endpoint": "https://rpc-mumbai.matic.today",
      "from": "<RELAYER_ACCOUNT_ADDRESS>",
      "opts": {
        "bridge": "<BRIDGE_CONTRACT_ADDRESS>",
        "erc20Handler": "<ERC20_HANDLER_CONTRACT_ADDRESS>",
        "erc721Handler": "<ERC721_HANDLER_CONTRACT_ADDRESS>",
        "genericHandler": "<GENERIC_HANDLER_CONTRACT_ADDRESS>",
        "minGasPrice": "1",
        "http": "true"
      }
    },
    {
      "name": "polygon-edge",
      "type": "ethereum",
      "id": "100",
      "endpoint": "http://localhost:10002",
      "from": "<RELAYER_ACCOUNT_ADDRESS>",
      "opts": {
        "bridge": "<BRIDGE_CONTRACT_ADDRESS>",
        "erc20Handler": "<ERC20_HANDLER_CONTRACT_ADDRESS>",
        "erc721Handler": "<ERC721_HANDLER_CONTRACT_ADDRESS>",
        "genericHandler": "<GENERIC_HANDLER_CONTRACT_ADDRESS>",
        "minGasPrice": "1",
        "http": "true"
      }
    }
  ]
}
```

Untuk memulai relayer, Anda harus mengimpor kunci privat yang sesuai dengan alamat akun relayer. Anda perlu memasukan kata sandi ketika mengimpor kunci privat. Setelah impor sukses, kunci akan disimpan pada `keys/<ADDRESS>.key`.

```bash
# Import private key and store to local with encryption
$ chainbridge accounts import --privateKey [RELAYER_ACCOUNT_PRIVATE_KEY]

INFO[11-19|07:09:01] Importing key...
Enter password to encrypt keystore file:
> [PASSWORD_TO_ENCRYPT_KEY]
INFO[11-19|07:09:05] private key imported                     address=<RELAYER_ACCOUNT_ADDRESS> file=.../keys/<RELAYER_ACCOUNT_ADDRESS>.key
```

Kemudian, Anda memulai relayer. Anda harus memasukan kata sandi serupa yang dipilih untuk menyimpan kunci di awal.

```bash
# Start relayer
$ chainbridge --config config.json --latest

INFO[11-19|07:15:19] Starting ChainBridge...
Enter password for key ./keys/<RELAYER_ACCOUNT_ADDRESS>.key:
> [PASSWORD_TO_DECRYPT_KEY]
INFO[11-19|07:15:25] Connecting to ethereum chain...          chain=mumbai url=<JSON_RPC_URL>
Enter password for key ./keys/<RELAYER_ACCOUNT_ADDRESS>.key:
> [PASSWORD_TO_DECRYPT_KEY]
INFO[11-19|07:15:31] Connecting to ethereum chain...          chain=polygon-edge url=<JSON_RPC_URL>
```

Setelah relayer dimulai, ini akan mulai melihat blok baru di setiap rantai

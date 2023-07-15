---
id: use-case-erc20-bridge
title: Kasus penggunaan - Jembatan ERC20
description: Contoh untuk jembatan kontrak ERC20
keywords:
  - docs
  - polygon
  - edge
  - Bridge
  - ERC20
---

Bagian ini bertujuan menyajikan aliran pengaturan Jembatan ERC20 untuk kasus penggunaan praktis.

Dalam panduan ini, Anda akan menggunakan testnet Mumbai Polygon PoS dan rantai lokal Polygon Edge. Pastikan Anda memiliki titik akhir JSON-RPC untuk Mumbai dan telah mengatur Polygon Edge di lingkungan lokal. Lihat [Pengaturan lokal](/docs/edge/get-started/set-up-ibft-locally) atau [Pengaturan Cloud](/docs/edge/get-started/set-up-ibft-on-the-cloud) untuk perincian lebih lanjut.

## Skenario {#scenario}

Skenario ini untuk mengatur Jembatan token ERC20 yang telah disebarkan di rantai publik (Polygon PoS) guna memungkinkan transfer berbiaya rendah di rantai privat (Polygon Edge) untuk pengguna dalam kasus biasa. Dalam kasus tersebut, total pasokan token telah ditentukan dalam rantai publik dan hanya jumlah token yang telah ditransfer dari rantai publik ke rantai privat harus ada di rantai privat. Untuk itu, Anda perlu menggunakan mode kunci/rilis di rantai publik dan mode bakar/cetak dalam rantai privat.

Ketika mengirim token dari rantai publik ke rantai privat, token akan dikunci di kontrak ERC20 Handler rantai publik dan jumlah token yang sama akan dicetak di rantai privat. Selain itu, dalam kasus transfer rantai privat ke rantai publik, token di rantai privat akan dibakar dan jumlah token yang sama akan dirilis dari ERC20 Handler di rantai publik.

## Kontrak {#contracts}

Menjelaskan dengan kontrak ERC20 sederhana alih-alih kontrak yang dikembangkan oleh ChainBridge. Untuk mode bakar/cetak, kontrak ERC20 harus memiliki metode `mint` dan `burnFrom` selain metode untuk ERC20 seperti ini:

```sol
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract SampleToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(MINTER_ROLE, _msgSender());
        _setupRole(BURNER_ROLE, _msgSender());
    }

    function mint(address recipient, uint256 amount)
        external
        onlyRole(MINTER_ROLE)
    {
        _mint(recipient, amount);
    }

    function burnFrom(address owner, uint256 amount)
        external
        onlyRole(BURNER_ROLE)
    {
        _burn(owner, amount);
    }
}
```

Semua kode dan skrip berada di Repo Github [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example).

## Langkah 1: Sebarkan kontak Bridge dan ERC20 Handler {#step1-deploy-bridge-and-erc20-handler-contracts}

Pertama, Anda dapat menyebarkan kontrak Bridge dan ERC20 Handler menggunakan  `cb-sol-cli` di kedua rantai.

```bash
# Deploy Bridge and ERC20 contracts in Polygon PoS chain
$ cb-sol-cli deploy --bridge --erc20Handler --chainId 99 \
  --url https://rpc-mumbai.matic.today \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```

```bash
# Deploy Bridge and ERC20 contracts in Polygon Edge chain
$ cb-sol-cli deploy --bridge --erc20Handler --chainId 100 \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```

Anda akan mendapatkan alamat kontrak Bridge dan ERC20Handler seperti ini:

```bash
Deploying contracts...
✓ Bridge contract deployed
✓ ERC20Handler contract deployed

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
Erc721 Handler:     Not Deployed
----------------------------------------------------------------
Generic Handler:    Not Deployed
----------------------------------------------------------------
Erc20:              Not Deployed
----------------------------------------------------------------
Erc721:             Not Deployed
----------------------------------------------------------------
Centrifuge Asset:   Not Deployed
----------------------------------------------------------------
WETC:               Not Deployed
================================================================
```

## Langkah 2: Sebarkan kontrak ERC20 {#step2-deploy-your-erc20-contract}

Anda dapat menyebarkan kontrak ERC20. Contoh ini memandu Anda dengan proyek hardhat [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example).

```bash
$ git clone https://github.com/Trapesys/chainbridge-example.git
$ cd chainbridge-example
$ npm i
```

Buat file `.env` dan atur nilai berikut.

```.env
PRIVATE_KEYS=0x...
MUMBAI_JSONRPC_URL=https://rpc-mumbai.matic.today
EDGE_JSONRPC_URL=http://localhost:10002
```

Berikutnya, Anda dapat menyebarkan kontrak ERC20 di kedua rantai.

```bash
$ npx hardhat deploy --contract erc20 --name <ERC20_TOKEN_NAME> --symbol <ERC20_TOKEN_SYMBOL> --network mumbai
```

```bash
$ npx hardhat deploy --contract erc20 --name <ERC20_TOKEN_NAME> --symbol <ERC20_TOKEN_SYMBOL> --network edge
```

Setelah penyebaran sukses, Anda akan mendapatkan alamat kontrak seperti ini:

```bash
ERC20 contract has been deployed
Address: <ERC20_CONTRACT_ADDRESS>
Name: <ERC20_TOKEN_NAME>
Symbol: <ERC20_TOKEN_SYMBOL>
```

## Langkah 3: Daftarkan ID sumber daya di Bridge {#step3-register-resource-id-in-bridge}

Anda dapat mendaftarkan ID sumber daya yang menghubungkan sumber daya di lingkungan lintas rantai. Anda perlu mengatur ID sumber daya yang sama di kedua rantai.

```bash
$ cb-sol-cli bridge register-resource \
  --url https://rpc-mumbai.matic.today \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  --resourceId "0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[ERC20_CONTRACT_ADDRESS]"
```

```bash
$ cb-sol-cli bridge register-resource \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --resourceId "0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[ERC20_CONTRACT_ADDRESS]"
```

## Langkah 4: Atur mode Cetak/Bakar di jembatan ERC20 dari Edge {#step4-set-mint-burn-mode-in-erc20-bridge-of-the-edge}

Jembatan diharapkan berfungsi sebagai mode bakar/cetak di Polygon Edge. Anda dapat mengatur mode bakar/cetak menggunakan `cb-sol-cli`.

```bash
$ cb-sol-cli bridge set-burn \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[ERC20_CONTRACT_ADDRESS]"
```

Anda juga perlu memberikan peran pencetak dan pembakar untuk kontrak ERC20 Handler.

```bash
$ npx hardhat grant --role mint --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --network edge
$ npx hardhat grant --role burn --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --network edge
```

## Langkah 5: Cetak Token {#step5-mint-token}

Anda dapat mencetak token ERC20 baru di rantai Mumbai.

```bash
$ npx hardhat mint --type erc20 --contract [ERC20_CONTRACT_ADDRESS] --address [ACCOUNT_ADDRESS] --amount 100000000000000000000 --network mumbai # 100 Token
```

Setelah transaksi sukses, akun akan memiliki token yang telah dicetak.

## Langkah 6: Mulai mentransfer ERC20 {#step6-start-erc20-transfer}

Sebelum memulai langkah ini, pastikan Anda telah memulai relayer. Lihat [Pengaturan](/docs/edge/additional-features/chainbridge/setup) untuk perincian lebih lanjut.

Selama transfer token dari Mumbai ke Edge, kontrak ERC20 Handler di Mumbai menarik token dari akun Anda. Anda akan memanggil persetujuan sebelum mentransfer.

```bash
$ npx hardhat approve --type erc20 --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --amount 10000000000000000000 --network mumbai # 10 Token
```

Terakhir, Anda dapat mulai mentransfer token dari Mumbai ke Edge menggunakan `cb-sol-cli`.

```bash
# Start transfer from Mumbai to Polygon Edge chain
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

Setelah transaksi penyetoran sukses, relayer akan mendapatkan peristiwa dan suara untuk proposal. Ini mengeksekusi transaksi pengiriman token ke akun penerima di rantai Polygon Edge setelah jumlah suara yang dibutuhkan sudah terkirim.

```bash
INFO[11-19|08:15:58] Handling fungible deposit event          chain=mumbai dest=100 nonce=1
INFO[11-19|08:15:59] Attempting to resolve message            chain=polygon-edge type=FungibleTransfer src=99 dst=100 nonce=1 rId=000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00
INFO[11-19|08:15:59] Creating erc20 proposal                  chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Watching for finalization event          chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Submitted proposal vote                  chain=polygon-edge tx=0x67a97849951cdf0480e24a95f59adc65ae75da23d00b4ab22e917a2ad2fa940d src=99 depositNonce=1 gasPrice=1
INFO[11-19|08:16:24] Submitted proposal execution             chain=polygon-edge tx=0x63615a775a55fcb00676a40e3c9025eeefec94d0c32ee14548891b71f8d1aad1 src=99 dst=100 nonce=1 gasPrice=5
```

Setelah transaksi eksekusi sukses, Anda akan mendapatkan token di rantai Polygon Edge.

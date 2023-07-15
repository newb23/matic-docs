---
id: use-case-erc721-bridge
title: Kasus penggunaan - Bridge ER721
description: Contoh kontrak jembatan ERC721
keywords:
  - docs
  - polygon
  - edge
  - Bridge
  - ERC721
---

Bagian ini bertujuan menyajikan alur pengaturan Bridge ERC721 untuk kasus penggunaan praktis.

Dalam panduan ini, Anda akan menggunakan testnet Mumbai Polygon PoS dan rantai lokal Polygon Edge. Pastikan Anda memiliki titik akhir JSON-RPC untuk Mumbai dan telah mengatur Polygon Edge di lingkungan lokal. Lihat [Pengaturan lokal](/docs/edge/get-started/set-up-ibft-locally) atau [Pengaturan Cloud](/docs/edge/get-started/set-up-ibft-on-the-cloud) untuk perincian lebih lanjut.

## Skenario {#scenario}

Skenario ini mengatur Bridge untuk NFT ERC721 yang telah disebarkan di rantai publik (Polygon PoS) untuk mengaktifkan transfer berbiaya rendah pada rantai privat (Polygon Edge) bagi pengguna pada kasus biasa. Dalam kasus semacam itu, metadata asli telah ditetapkan pada rantai publik dan hanya NFT yang telah ditransfer dari rantai Publik yang bisa ada di dalam rantai privat. Untuk itu, Anda perlu menggunakan mode kunci/rilis di rantai publik dan mode bakar/cetak di rantai privat.

Saat mengirim NFT dari rantai publik ke rantai privat, NFT akan dikunci di kontrak ERC721 Handler di rantai publik dan NFT yang sama akan dicetak di rantai privat. Dalam kasus transfer dari rantai privat ke rantai publik, NFT di rantai privat akan dibakar dan NFT yang sama akan dilepas dari kontrak ERC721 Handler di rantai publik.

## Kontrak {#contracts}

Menjelaskan dengan kontrak ERC721 yang sederhana alih-alih kontrak yang dikembangkan oleh ChainBridge. Untuk mode bakar/cetak, kontrak ERC721 harus memiliki metode `mint` dan `burn` selain metode yang ditetapkan dalam ERC721 seperti ini:

```sol
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract SampleNFT is ERC721, ERC721Burnable, ERC721URIStorage, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    string public baseURI;

    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI
    ) ERC721(name, symbol) {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(MINTER_ROLE, _msgSender());
        _setupRole(BURNER_ROLE, _msgSender());

        _setBaseURI(baseURI);
    }

    function mint(
        address recipient,
        uint256 tokenID,
        string memory data
    ) public onlyRole(MINTER_ROLE) {
        _mint(recipient, tokenID);
        _setTokenURI(tokenID, data);
    }

    function burn(uint256 tokenID)
        public
        override(ERC721Burnable)
        onlyRole(BURNER_ROLE)
    {
        _burn(tokenID);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _burn(uint256 tokenId)
        internal
        virtual
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function _setBaseURI(string memory baseURI_) internal {
        baseURI = baseURI_;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }
}
```

Semua kode dan skrip berada di Repo Github [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example).

## Langkah 1: Sebarkan kontrak Bridge dan ERC721 Handler {#step1-deploy-bridge-and-erc721-handler-contracts}

Pertama, Anda dapat menyebarkan kontrak Bridge dan ERC721 Handler menggunakan `cb-sol-cli` pada kedua rantai.

```bash
# Deploy Bridge and ERC721 contracts in Polygon PoS chain
$ cb-sol-cli deploy --bridge --erc721Handler --chainId 99 \
  --url https://rpc-mumbai.matic.today \
  --gasPrice [GAS_PRICE] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```

```bash
# Deploy Bridge and ERC721 contracts in Polygon Edge chain
$ cb-sol-cli deploy --bridge --erc721Handler --chainId 100 \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```

Anda akan mendapat alamat kontrak Bridge dan ERC721 Handler seperti ini:

```bash
Deploying contracts...
✓ Bridge contract deployed
✓ ERC721Handler contract deployed

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
Erc20 Handler:      Not Deployed
----------------------------------------------------------------
Erc721 Handler:     <ERC721_HANDLER_CONTRACT_ADDRESS>
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

## Langkah 2: Sebarkan kontrak ERC721 {#step2-deploy-your-erc721-contract}

Anda akan menyebarkan kontrak ERC721. Contoh ini memandu Anda tentang proyek hardhat [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example).

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

Kemudian, Anda akan menyebarkan kontrak ERC721 pada kedua rantai.

```bash
$ npx hardhat deploy --contract erc721 --name <ERC721_TOKEN_NAME> --symbol <ERC721_TOKEN_SYMBOL> --uri <BASE_URI> --network mumbai
```

```bash
$ npx hardhat deploy --contract erc721 --name <ERC721_TOKEN_NAME> --symbol <ERC721_TOKEN_SYMBOL> --uri <BASE_URI> --network edge
```

Setelah penyebaran berhasil, Anda akan mendapat alamat kontrak seperti ini:

```bash
ERC721 contract has been deployed
Address: <ERC721_CONTRACT_ADDRESS>
Name: <ERC721_TOKEN_NAME>
Symbol: <ERC721_TOKEN_SYMBOL>
Base URI: <ERC721_BASE_URI>
```

## Langkah 3: Daftarkan ID sumber daya di Bridge {#step3-register-resource-id-in-bridge}

Anda akan mendaftarkan ID sumber daya yang terkait sumber daya pada lingkungan lintas rantai.

```bash
$ cb-sol-cli bridge register-resource \
  --url https://rpc-mumbai.matic.today \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  # Set Resource ID for ERC721
  --resourceId "0x000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC721_HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[ERC721_CONTRACT_ADDRESS]"
```

```bash
$ cb-sol-cli bridge register-resource \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  # Set Resource ID for ERC721
  --resourceId "0x000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC721_HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[ERC721_CONTRACT_ADDRESS]"
```

## Langkah 4: Atur mode Cetak/Bakar pada jembatan ERC721 dari Edge {#step4-set-mint-burn-mode-in-erc721-bridge-of-the-edge}

Bridge diharapkan berfungsi sebagai mode bakar/cetak in Edge. Anda akan mengatur mode bakar/cetak.

```bash
$ cb-sol-cli bridge set-burn \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC721_HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[ERC721_CONTRACT_ADDRESS]"
```

Anda juga perlu memberi peran pencetak dan pembakar kepada kontrak ERC721 Handler.

```bash
$ npx hardhat grant --role mint --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --network edge
$ npx hardhat grant --role burn --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --network edge
```

## Langkah 5: Cetak NFT {#step5-mint-nft}

Anda akan mencetak ERC721 NFT baru di rantai Mumbai.

```bash
$ npx hardhat mint --type erc721 --contract [ERC721_CONTRACT_ADDRESS] --address [ACCOUNT_ADDRESS] --id 0x50 --data hello.json --network mumbai
```

Setelah transaksi berhasil, akun akan memiliki NFT yang telah dicetak.

## Langkah 6: Mulai mentransfer ERC721 {#step6-start-erc721-transfer}

Sebelum memulai langkah ini, pastikan Anda telah memulai relayer. Lihat [Pengaturan](/docs/edge/additional-features/chainbridge/setup) untuk perincian lebih lanjut.

Selamat transfer NFT dari Mumbai ke Edge, kontrak ERC721 Handler di Mumbai menarik NFT dari akun Anda. Anda dapat menyetujui sebelum mentransfer.

```bash
$ npx hardhat approve --type erc721 --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --id 0x50 --network mumbai
```

Terakhir, Anda akan memulai transfer NFT dari Mumbai ke Edge.

```bash
# Start transfer from Mumbai to Polygon Edge chain
$ cb-sol-cli erc721 deposit \
  --url https://rpc-mumbai.matic.today \
  --privateKey [PRIVATE_KEY] \
  --gasPrice [GAS_PRICE] \
  --id 0x50 \
  # ChainID for Polygon Edge chain
  --dest 100 \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --recipient "[RECIPIENT_ADDRESS_IN_POLYGON_EDGE_CHAIN]" \
  --resourceId "0x000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501"
```

Setelah transaksi setoran berhasil, relayer akan mendapat kejadian dan suara untuk proposal itu.  
Ini mengeksekusi transaksi untuk mengirim NFT ke akun penerima di rantai Polygon Edge setelah jumlah suara yang dibutuhkan sudah terkirim.

```bash
INFO[11-19|09:07:50] Handling nonfungible deposit event       chain=mumbai
INFO[11-19|09:07:50] Attempting to resolve message            chain=polygon-edge type=NonFungibleTransfer src=99 dst=100 nonce=2 rId=000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501
INFO[11-19|09:07:50] Creating erc721 proposal                 chain=polygon-edge src=99 nonce=2
INFO[11-19|09:07:50] Watching for finalization event          chain=polygon-edge src=99 nonce=2
INFO[11-19|09:07:50] Submitted proposal vote                  chain=polygon-edge tx=0x58a22d84a08269ad2e8d52d8dc038621f1a21109d11c7b6e0d32d5bf21ea8505 src=99 depositNonce=2 gasPrice=1
INFO[11-19|09:08:15] Submitted proposal execution             chain=polygon-edge tx=0x57419844881a07531e31667c609421662d94d21d0709e64fb728138309267e68 src=99 dst=100 nonce=2 gasPrice=3
```

Setelah transaksi eksekusi berhasil, Anda akan mendapat NFT di rantai Polygon Edge.

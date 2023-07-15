---
id: use-case-erc721-bridge
title: Gamitin ang case - ERC721 Bridge
description: Halimbawa para i-bridge ang ERC721 contract
keywords:
  - docs
  - polygon
  - edge
  - Bridge
  - ERC721
---

Layunin ng seksyong ito na magbigay sa iyo ng daloy ng pag-setup ng ERC721 Bridge para sa praktikal na paggamit ng case.

Sa gabay na ito, gagamitin mo ang Mumbai Polygon PoS testnet at Polygon Edge local chain. Tiyakin na mayroon kang JSON-RPC endpoint para sa Mumbai at nai-set up mo ang Polygon Edge sa isang lokal na environment. Sumangguni sa [Lokal na Pag-Setup](/docs/edge/get-started/set-up-ibft-locally) o [Pag-Setup sa Cloud](/docs/edge/get-started/set-up-ibft-on-the-cloud) para sa higit pang detalye.

## Scenario {#scenario}

Tumutukoy ang scenario na ito sa pag-setup ng Bridge para sa ERC721 NFT na na-deploy na sa pampublikong chain (Polygon PoS) para magbigay-daan sa mababang halaga ng paglipat sa pribadong chain (Polygon Edge) para sa mga user sa isang regular na case. Sa ganitong case, ang orihinal na metadata ay tinukoy sa pampublikong chain at ang mga NFT lang na inilipat mula sa Pampublikong chain ang maaaring umiral sa pribadong chain. Sa kadahilanang iyon, kailangan mong gamitin ang lock/release mode sa pampublikong chain at burn/mint mode sa pribadong chain.

Kapag nagpapadala ng mga NFT mula sa pampublikong chain patungo sa pribadong chain, ang NFT ay malo-lock sa ERC721 Handler contract sa pampublikong chain at ang parehong NFT ay mami-mint sa pribadong chain. Sa kabilang banda, sa kaso ng paglilipat mula sa pribadong chain patungo sa pampulikong chain, ang NFT sa pribadong chain ay i-burn at ang parehong NFT ay ire-release mula sa ERC721 Handler contract sa pampublikong chain.

## Mga Contract {#contracts}

Pagpapaliwanag sa pamamagitan ng isang simpleng ERC721 contract sa halip na kontrata na binuo ng ChainBridge. Para sa burn/mint mode, ang ERC721 contract ay dapat magtaglay ng `mint` at `burn` na mga pamamaraan bilang karagdagan sa mga pamamaraang tinukoy sa ERC721 tulad nito:

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

Ang lahat ng mga code at script ay nasa Github Repo [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example).

## Hakbang1: I-deploy ang Bridge at ang mga ERC721 Handler contract {#step1-deploy-bridge-and-erc721-handler-contracts}

Una, ide-deploy mo ang Bridge at ang mga ERC721Handler contract gamit ang `cb-sol-cli` sa magkaparehong chain.

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

Makakakuha ka ng Bridge at ng mga ERC721 Handler contract address tulad nito:

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

## Hakbang2: I-deploy ang iyong ERC721 contract {#step2-deploy-your-erc721-contract}

Ide-deploy mo ang iyong ERC721 contract. Ang halimbawang ito ay gumagabay sa iyo sa hardhat project [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example).

```bash
$ git clone https://github.com/Trapesys/chainbridge-example.git
$ cd chainbridge-example
$ npm i
```

Mangyaring gumawa ng `.env` file at i-set ang sumusunod na values.

```.env
PRIVATE_KEYS=0x...
MUMBAI_JSONRPC_URL=https://rpc-mumbai.matic.today
EDGE_JSONRPC_URL=http://localhost:10002
```

Susunod ay ide-deploy mo ang ERC721 contract sa magkaparehong chain.

```bash
$ npx hardhat deploy --contract erc721 --name <ERC721_TOKEN_NAME> --symbol <ERC721_TOKEN_SYMBOL> --uri <BASE_URI> --network mumbai
```

```bash
$ npx hardhat deploy --contract erc721 --name <ERC721_TOKEN_NAME> --symbol <ERC721_TOKEN_SYMBOL> --uri <BASE_URI> --network edge
```

Pagkatapos maging matagumpay ng pag-deploy, makakakuha ka ng mga contract address tulad nito:

```bash
ERC721 contract has been deployed
Address: <ERC721_CONTRACT_ADDRESS>
Name: <ERC721_TOKEN_NAME>
Symbol: <ERC721_TOKEN_SYMBOL>
Base URI: <ERC721_BASE_URI>
```

## Hakbang3: Irehistro ang resource ID sa Bridge {#step3-register-resource-id-in-bridge}

Irerehistro mo ang isang resource ID na nauugnay sa mga resources sa isang cross-chain environment.

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

## Hakbang4: I-set ang Mint/Burn mode sa ERC721 Bridge ng Edge {#step4-set-mint-burn-mode-in-erc721-bridge-of-the-edge}

Inaasahang gagana ang Bridge bilang burn/mint mode sa Edge. Ise-set mo ang burn/mint mode.

```bash
$ cb-sol-cli bridge set-burn \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC721_HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[ERC721_CONTRACT_ADDRESS]"
```

At kailangan mong magbigay ng tungkulin ng isang minter at burner sa ERC721 Handler contract.

```bash
$ npx hardhat grant --role mint --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --network edge
$ npx hardhat grant --role burn --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --network edge
```

## Hakbang5: Mag-mint ng NFT {#step5-mint-nft}

Magmi-mint ka ng bagong ERC721 NFT sa Mumbai chain.

```bash
$ npx hardhat mint --type erc721 --contract [ERC721_CONTRACT_ADDRESS] --address [ACCOUNT_ADDRESS] --id 0x50 --data hello.json --network mumbai
```

Pagkatapos maging matagumpay ang transaksyon, magkakaroon ang account ng minted NFT.

## Hakbang6: Simulan ang paglipat ng ERC721 {#step6-start-erc721-transfer}

Bago simulan ang hakbang na ito, mangyaring tiyakin na nasimulan mo ang relayer. Mangyaring tingnan ang [Pag-Setup](/docs/edge/additional-features/chainbridge/setup) para sa higit pang detalye.

Sa paglilipat ng NFT mula Mumbai patungong Edge, iwi-withdraw ng ERC721 Handler contract sa Mumbai ang NFT mula sa iyong account. Aaprubahan mo muna bago gawin ang paglilipat.

```bash
$ npx hardhat approve --type erc721 --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --id 0x50 --network mumbai
```

Huli, sisimulan mo ang paglipat ng NFT mula Mumbai patungong Edge.

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

Pagkatapos maging matagumpay ng depositong transaksyon, kukunin ng relayer ang event at boboto para sa proposal.  
Isinasagawa nito ang isang transaksyon para ipadala ang NFT sa account ng tatanggap sa Polygon Edge chain pagkatapos maisumite ang kinakailangang bilang ng mga boto.

```bash
INFO[11-19|09:07:50] Handling nonfungible deposit event       chain=mumbai
INFO[11-19|09:07:50] Attempting to resolve message            chain=polygon-edge type=NonFungibleTransfer src=99 dst=100 nonce=2 rId=000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501
INFO[11-19|09:07:50] Creating erc721 proposal                 chain=polygon-edge src=99 nonce=2
INFO[11-19|09:07:50] Watching for finalization event          chain=polygon-edge src=99 nonce=2
INFO[11-19|09:07:50] Submitted proposal vote                  chain=polygon-edge tx=0x58a22d84a08269ad2e8d52d8dc038621f1a21109d11c7b6e0d32d5bf21ea8505 src=99 depositNonce=2 gasPrice=1
INFO[11-19|09:08:15] Submitted proposal execution             chain=polygon-edge tx=0x57419844881a07531e31667c609421662d94d21d0709e64fb728138309267e68 src=99 dst=100 nonce=2 gasPrice=3
```

Kapag naging matagumpay na ang pagsasagawa ng transaksyon, makakakuha ka ng NFT sa Polygon Edge chain.

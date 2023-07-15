---
id: use-case-erc20-bridge
title: Gamitin ang case - ERC20 Bridge
description: Halimbawa para sa pag-bridge sa ERC20 contract
keywords:
  - docs
  - polygon
  - edge
  - Bridge
  - ERC20
---

Layunin ng seksyong ito na magbigay sa iyo ng daloy ng pag-setup ng ERC20 Bridge para sa praktikal na paggamit ng case.

Sa gabay na ito, gagamitin mo ang Mumbai Polygon PoS testnet at Polygon Edge local chain. Tiyakin na mayroon kang JSON-RPC endpoint para sa Mumbai at nai-set up mo ang Polygon Edge sa isang lokal na environment. Sumangguni sa [Lokal na Pag-Setup](/docs/edge/get-started/set-up-ibft-locally) o [Pag-Setup sa Cloud](/docs/edge/get-started/set-up-ibft-on-the-cloud) para sa higit pang detalye.

## Scenario {#scenario}

Tumutukoy ang scenario na ito sa pag-setup ng Bridge para sa ERC20 token na na-deploy na sa pampublikong chain (Polygon PoS) para magbigay-daan sa mababang halaga ng paglipat sa pribadong chain (Polygon Edge) para sa mga user sa isang regular na case. Sa ganitong case, tinukoy sa pampublikong chain ang kabuuang supply ng token at ang halaga lang ng token na nailipat mula sa pampublikong chain patungo sa pribadong chain ang dapat umiral sa pribadong chain. Sa kadahilanang iyon, kailangan mong gamitin ang lock/release mode sa pampublikong chain at ang burn/mint mode sa pribadong chain.

Kapag nagpapadala ng mga token mula sa pampublikong chain patungo sa pribadong chain, mala-lock sa ERC20 Handler contract ang token ng pampublikong chain at mami-mint sa pribadong chain ang parehong halaga ng token. Sa kabilang banda, sa kaso ng paglilipat mula sa pribadong chain patungo sa pampulikong chain, ibu-burn ang token sa pribadong chain at ang parehong halaga ng token ay ire-release mula sa ERC20 Handler contract sa pampublikong chain.

## Mga Kontrata {#contracts}

Pagpapaliwanag ng simpleng mga ERC20 contract sa halip na kontrata na ginawa ng ChainBridge. Para sa burn/mint mode, dapat may mga paraang `mint` at `burnFrom` ng ERC20 contract bukod pa sa mga paraan para sa ERC20 gaya nito:

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

Ang lahat ng mga code at script ay nasa Github Repo [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example).

## Hakbang1: I-deploy ang Bridge at mga ERC20 Handler contract {#step1-deploy-bridge-and-erc20-handler-contracts}

Una, ide-deploy mo ang Bridge at mga ERC20Handler contract gamit ang `cb-sol-cli` sa magkaparehong chain.

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

Makakakuha ka ng mga address ng Bridge at ERC20 Handler contract gaya nito:

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

## Hakbang2: I-deploy ang iyong ERC20 contract {#step2-deploy-your-erc20-contract}

Ide-deploy mo ang iyong ERC20 contract. Ang halimbawang ito ay gumagabay sa iyo sa hardhat project [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example).

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

Susunod, ide-deploy mo ang ERC20 contract sa magkaparehong chain.

```bash
$ npx hardhat deploy --contract erc20 --name <ERC20_TOKEN_NAME> --symbol <ERC20_TOKEN_SYMBOL> --network mumbai
```

```bash
$ npx hardhat deploy --contract erc20 --name <ERC20_TOKEN_NAME> --symbol <ERC20_TOKEN_SYMBOL> --network edge
```

Pagkatapos maging matagumpay ang pag-deploy, makakakuha ka ng address ng kontrata gaya nito:

```bash
ERC20 contract has been deployed
Address: <ERC20_CONTRACT_ADDRESS>
Name: <ERC20_TOKEN_NAME>
Symbol: <ERC20_TOKEN_SYMBOL>
```

## Hakbang3: Irehistro ang resource ID sa Bridge {#step3-register-resource-id-in-bridge}

Magrerehistro ka ng resource ID na mag-uugnay ng resource sa isang cross-chain environment. Kailangan mong itakda ang parehong resource ID sa magkaparehong chain.

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

## Hakbang4: Itakda ang Mint/Burn mode sa ERC20 bridge ng Edge {#step4-set-mint-burn-mode-in-erc20-bridge-of-the-edge}

Inaasahang tatakbo ang bridge tulad ng burn/mint mode sa Polygon Edge. Itatakda mo ang burn/mint mode gamit ang `cb-sol-cli`.

```bash
$ cb-sol-cli bridge set-burn \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[ERC20_CONTRACT_ADDRESS]"
```

At kinakailangan mong magbigay ng minter at burner na tungkulin sa ERC20 Handler contract.

```bash
$ npx hardhat grant --role mint --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --network edge
$ npx hardhat grant --role burn --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --network edge
```

## Hakbang5: Mag-mint ng Token {#step5-mint-token}

Magmi-mint ka ng mga bagong ERC20 token sa Mumbai chain.

```bash
$ npx hardhat mint --type erc20 --contract [ERC20_CONTRACT_ADDRESS] --address [ACCOUNT_ADDRESS] --amount 100000000000000000000 --network mumbai # 100 Token
```

Pagkatapos maging matagumpay ng transaksyon, magkakaroon ang account ng minted token.

## Hakbang6: Simulan ang paglipat ng ERC20 {#step6-start-erc20-transfer}

Bago simulan ang hakbang na ito, mangyaring tiyaking nakapagsimula ka na ng relayer. Mangyaring tingnan ang [Pag-Setup](/docs/edge/additional-features/chainbridge/setup) para sa higit pang detalye.

Sa paglilipat ng token mula Mumbai patungong Edge, wini-withdraw ng ERC20 Handler contract sa Mumbai ang mga token mula sa iyong account. Aaprubahan mo muna bago gawin ang paglipat.

```bash
$ npx hardhat approve --type erc20 --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --amount 10000000000000000000 --network mumbai # 10 Token
```

Panghuli, sisimulan mo ang paglipat ng token mula Mumbai patungong Edge gamit ang `cb-sol-cli`.

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

Pagkatapos maging matagumpay ng depositong transaksyon, kukunin ng relayer ang event at boboto para sa proposal. Isinasagawa nito ang isang transaksyon para ipadala ang mga token sa account ng tatanggap sa Polygon Edge chain pagkatapos maisumite ang kinakailangang bilang ng mga boto.

```bash
INFO[11-19|08:15:58] Handling fungible deposit event          chain=mumbai dest=100 nonce=1
INFO[11-19|08:15:59] Attempting to resolve message            chain=polygon-edge type=FungibleTransfer src=99 dst=100 nonce=1 rId=000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00
INFO[11-19|08:15:59] Creating erc20 proposal                  chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Watching for finalization event          chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Submitted proposal vote                  chain=polygon-edge tx=0x67a97849951cdf0480e24a95f59adc65ae75da23d00b4ab22e917a2ad2fa940d src=99 depositNonce=1 gasPrice=1
INFO[11-19|08:16:24] Submitted proposal execution             chain=polygon-edge tx=0x63615a775a55fcb00676a40e3c9025eeefec94d0c32ee14548891b71f8d1aad1 src=99 dst=100 nonce=1 gasPrice=5
```

Kapag naging matagumpay ang pagsasagawa ng transaksyon, makakakuha ka ng mga token sa Polygon Edge chain.

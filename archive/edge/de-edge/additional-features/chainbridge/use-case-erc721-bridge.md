---
id: use-case-erc721-bridge
title: Anwendungsfall – ERC721 Bridge
description: Beispiel für einen Bridge ERC721 Contract
keywords:
  - docs
  - polygon
  - edge
  - Bridge
  - ERC721
---

In diesem Abschnitt wird die Einrichtung der ERC721 Bridge für einen praktischen Anwendungsfall beschrieben.

In diesem Leitfaden werden Sie das Mumbai Polygon PoS Testnet und die lokale Polygon Edge Chain verwenden. Vergewissern, dass JSON-RPC Endpoint für Mumbai und Polygon Edge in der lokalen Umgebung eingerichtet ist. Weitere Details unter [Lokale Einrichtung](/docs/edge/get-started/set-up-ibft-locally) oder [Cloud-Einrichtung](/docs/edge/get-started/set-up-ibft-on-the-cloud).

## Szenario {#scenario}

In diesem Szenario geht es darum, eine Bridge für die ERC721 NFT einzurichten, die bereits in der öffentlichen Chain (Polygon PoS) eingesetzt wurde, um den Benutzern im Normalfall einen kostengünstigen Transfer in einer privaten Chain (Polygon Edge) zu ermöglichen. In einem solchen Fall wurden die ursprünglichen Metadaten in der öffentlichen Chain definiert und die einzigen NFTs, die von der öffentlichen Chain übertragen wurden, können in der privaten Chain existieren. Daher müssen Sie den Sperr-/Freigabemodus in der öffentlichen Chain und den Ausscheide/Ausgabemodus in der privaten Chain verwenden.

Wenn NFTs von der öffentlichen Chain an die private Chain gesendet werden, wird die NFT in der öffentlichen Chain im ERC721 Handler-Contract gesperrt und dieselbe NFT wird in der privaten Chain ausgestellt. Bei einer Übertragung von der privaten Chain auf die öffentliche Chain wird die NFT in der privaten Chain verbrannt und dieselbe NFT wird aus dem ERC721 Handler-Contract in der öffentlichen Chain freigegeben.

## Contracts {#contracts}

Erläuterung mit einem einfachen ERC721-Contract anstelle des von ChainBridge entwickelten Contracts. Für den Ausscheide/Ausgabemodus muss der ERC721-Contract zusätzlich zu den in ERC721 definierten Methoden `mint`und f`burn`olgende Methoden haben:

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

Alle Codes und Skripte befinden sich im Beispiel Github Repo [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example).

## Schritt 1: Bridge und ERC721 Handler-Contracts bereitstellen {#step1-deploy-bridge-and-erc721-handler-contracts}

Zunächst werden Sie Bridge und ERC721Handler-Contracts mit `cb-sol-cli`in den beiden Chains bereitstellen.

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

Sie erhalten Bridge- und ERC721Handler-Vertragsadressen wie diese:

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

## Schritt 2: ERC721-Contracts bereitstellen {#step2-deploy-your-erc721-contract}

Ihren ERC721-Contract bereitstellen. Dieses Beispiel führt Sie durch das Hardhat-Projekt[Trapesys/chainbridge-example.](https://github.com/Trapesys/chainbridge-example)

```bash
$ git clone https://github.com/Trapesys/chainbridge-example.git
$ cd chainbridge-example
$ npm i
```

Eine D`.env`atei erstellen und folgende Werte einstellen.

```.env
PRIVATE_KEYS=0x...
MUMBAI_JSONRPC_URL=https://rpc-mumbai.matic.today
EDGE_JSONRPC_URL=http://localhost:10002
```

Als Nächstes werden Sie den ER721-Contract in den beiden Chains bereitstellen.

```bash
$ npx hardhat deploy --contract erc721 --name <ERC721_TOKEN_NAME> --symbol <ERC721_TOKEN_SYMBOL> --uri <BASE_URI> --network mumbai
```

```bash
$ npx hardhat deploy --contract erc721 --name <ERC721_TOKEN_NAME> --symbol <ERC721_TOKEN_SYMBOL> --uri <BASE_URI> --network edge
```

Nach erfolgreicher Bereitstellung erhalten Sie eine Contractadresse wie diese:

```bash
ERC721 contract has been deployed
Address: <ERC721_CONTRACT_ADDRESS>
Name: <ERC721_TOKEN_NAME>
Symbol: <ERC721_TOKEN_SYMBOL>
Base URI: <ERC721_BASE_URI>
```

## Schritt 3: Ressourcen-ID in Bridge anmelden  {#step3-register-resource-id-in-bridge}

Sie melden eine Ressourcen-ID an, die Ressourcen in einer Cross-Chain-Umgebung zuordnet.

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

## Schritt4: Ausgabe/Ausscheidemodus in der ERC721-Bridge von Edge einstellen {#step4-set-mint-burn-mode-in-erc721-bridge-of-the-edge}

Bridge erwartet, dass sie in Edge als Ausscheide/Ausgabefunktion arbeitet. Ausscheide/Ausgabemodus einstellen.

```bash
$ cb-sol-cli bridge set-burn \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC721_HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[ERC721_CONTRACT_ADDRESS]"
```

Dem ERC721-Handler-Contract muss eine Ausgabe/Ausscheidefunktion eingeräumt werden.

```bash
$ npx hardhat grant --role mint --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --network edge
$ npx hardhat grant --role burn --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --network edge
```

## Schritt5: NFT ausgeben {#step5-mint-nft}

In der Mumbai Chain wird eine ERC721 NFT ausgegeben.

```bash
$ npx hardhat mint --type erc721 --contract [ERC721_CONTRACT_ADDRESS] --address [ACCOUNT_ADDRESS] --id 0x50 --data hello.json --network mumbai
```

Nach erfolgreichen Abwicklung gibt das Konto den NFT aus.

## Schritt6: ERC721-Transfer starten {#step6-start-erc721-transfer}

Vor diesem Schritt vergewissern, dass der Relayer gestartet wurde. [Setup](/docs/edge/additional-features/chainbridge/setup) für weitere Details prüfen.

Während des NFT-Transfers von Mumbai nach Edge zieht der ERC721-Handler-Contract in Mumbai NFT von deinem Konto ab. Vor der Übertragung freigeben.

```bash
$ npx hardhat approve --type erc721 --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --id 0x50 --network mumbai
```

Schließlich beginnst du den NFT-Transfer von Mumbai nach Edge.

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

Nach erfolgreicher Einzahlung erhält der Relayer das Event und stimmt für den Vorschlag.  
Er führt eine Transaktion aus, um NFT an das Empfängerkonto in der Polygon Edge Chain zu senden, nachdem die erforderliche Anzahl von Stimmen abgegeben wurde.

```bash
INFO[11-19|09:07:50] Handling nonfungible deposit event       chain=mumbai
INFO[11-19|09:07:50] Attempting to resolve message            chain=polygon-edge type=NonFungibleTransfer src=99 dst=100 nonce=2 rId=000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501
INFO[11-19|09:07:50] Creating erc721 proposal                 chain=polygon-edge src=99 nonce=2
INFO[11-19|09:07:50] Watching for finalization event          chain=polygon-edge src=99 nonce=2
INFO[11-19|09:07:50] Submitted proposal vote                  chain=polygon-edge tx=0x58a22d84a08269ad2e8d52d8dc038621f1a21109d11c7b6e0d32d5bf21ea8505 src=99 depositNonce=2 gasPrice=1
INFO[11-19|09:08:15] Submitted proposal execution             chain=polygon-edge tx=0x57419844881a07531e31667c609421662d94d21d0709e64fb728138309267e68 src=99 dst=100 nonce=2 gasPrice=3
```

Sobald die Transaktion erfolgreich ausgeführt wurde, erhalten Sie NFT in der Polygon Edge Chain.

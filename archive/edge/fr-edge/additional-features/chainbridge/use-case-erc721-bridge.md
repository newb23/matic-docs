---
id: use-case-erc721-bridge
title: Cas d'utilisation - Pont ERC721
description: Exemple pour combler le contrat ERC721
keywords:
  - docs
  - polygon
  - edge
  - Bridge
  - ERC721
---

Cette section vise à vous donner un flux de configuration du Pont ERC721 pour un cas d'utilisation pratique.

Dans ce guide, vous utiliserez le testnet de Mumbai Polygon PoS et la chaîne locale Polygon Edge. Veuillez vous assurer que vous disposez d'un point de terminaison JSON-RPC pour Mumbai et que vous avez configuré Edge de Polygon dans un environnement local. Veuillez vous référer à la [Configuration locale](/docs/edge/get-started/set-up-ibft-locally) ou [Configuration Cloud](/docs/edge/get-started/set-up-ibft-on-the-cloud) pour plus de détails.

## Scénario {#scenario}

Ce scénario consiste à configurer un Pont pour le NFT ERC721 qui a déjà été déployé dans la chaîne publique (Polygon PoS) afin de permettre un transfert à faible coût dans une chaîne privée (Edge de Polygon) pour les utilisateurs dans un cas régulier. Dans un tel cas, les métadonnées d'origine ont été définies dans la chaîne publique et les seuls NFT qui ont été transférés de la chaîne Publique peuvent exister dans la chaîne privée. Pour cette raison, vous devrez utiliser le mode verrouillage/déclenchement dans la chaîne publique et le mode de brûlure/mint dans la chaîne privée.

Lors de l'envoi des NFT de la chaîne publique vers la chaîne privée, le NFT sera verrouillé dans le contrat Gestionnaire de ERC721 dans la chaîne publique et le même NFT sera frappé dans la chaîne privée. En revanche, en cas de transfert de la chaîne privée vers la chaîne publique, le NFT dans la chaîne privée sera brûlé et le même NFT sera libéré du contrat Gestionnaire de ERC721 dans la chaîne publique.

## Contrats {#contracts}

Explication avec un simple contrat ERC721 au lieu du contrat développé par ChainBridge. Pour le mode brûlé/frappé, le contrat ERC721 doit avoir des méthodes `mint` et `burn` en plus des méthodes définies dans ERC721 comme ceci:

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

Tous les codes et les scénarios sont dans le Référentiel Github [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example).

## Étape 1: Déployez les contrats Bridge et Gestionnaire de ERC721 {#step1-deploy-bridge-and-erc721-handler-contracts}

Tout d'abord, vous allez déployer les contrats Bridge et Gestionnaire de ERC721 en utilisant `cb-sol-cli` dans les deux chaînes.

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

Vous obtiendrez des adresses de contrat Bridge et Gestionnaire de ERC721 comme celle-ci:

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

## Étape 2: Déployez votre contrat ERC721 {#step2-deploy-your-erc721-contract}

Vous déploierez votre contrat ERC721. Cet exemple vous guide avec le projet de casque [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example).

```bash
$ git clone https://github.com/Trapesys/chainbridge-example.git
$ cd chainbridge-example
$ npm i
```

Veuillez créer `.env` un fichier et définir les valeurs suivantes.

```.env
PRIVATE_KEYS=0x...
MUMBAI_JSONRPC_URL=https://rpc-mumbai.matic.today
EDGE_JSONRPC_URL=http://localhost:10002
```

Ensuite, vous déploierez le contrat ERC721 dans les deux chaînes.

```bash
$ npx hardhat deploy --contract erc721 --name <ERC721_TOKEN_NAME> --symbol <ERC721_TOKEN_SYMBOL> --uri <BASE_URI> --network mumbai
```

```bash
$ npx hardhat deploy --contract erc721 --name <ERC721_TOKEN_NAME> --symbol <ERC721_TOKEN_SYMBOL> --uri <BASE_URI> --network edge
```

Après le déploiement réussi, vous obtiendrez l'adresse de contrat comme celle-ci:

```bash
ERC721 contract has been deployed
Address: <ERC721_CONTRACT_ADDRESS>
Name: <ERC721_TOKEN_NAME>
Symbol: <ERC721_TOKEN_SYMBOL>
Base URI: <ERC721_BASE_URI>
```

## Étape 3: Enregistrez l'Identifiant de ressource dans Bridge {#step3-register-resource-id-in-bridge}

Vous enregistrerez un Identifiant de ressource qui associe des ressources dans un environnement inter-chaînes.

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

## Étape 4: Définir le mode Frappé/Brûlé dans le pont ERC721 de Edge {#step4-set-mint-burn-mode-in-erc721-bridge-of-the-edge}

Bridge s'attend à fonctionner en mode brûlé/frappé dans Edge. Vous définirez le mode brûlé/frappé.

```bash
$ cb-sol-cli bridge set-burn \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC721_HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[ERC721_CONTRACT_ADDRESS]"
```

Et vous devez accorder un rôle de monétisation et de brûlure au contrat Gestionnaire de ERC721.

```bash
$ npx hardhat grant --role mint --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --network edge
$ npx hardhat grant --role burn --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --network edge
```

## Étape 5: Frapper le NFT {#step5-mint-nft}

Vous frapperez le nouveau NFT ERC721 dans la chaîne de Mumbai.

```bash
$ npx hardhat mint --type erc721 --contract [ERC721_CONTRACT_ADDRESS] --address [ACCOUNT_ADDRESS] --id 0x50 --data hello.json --network mumbai
```

Une fois la transaction réussie, le compte aura le NFT frappé.

## Étape 6: Démarrer le transfert de ERC721 {#step6-start-erc721-transfer}

Avant de démarrer cette étape, veuillez vous assurer que vous avez enclenché le relais. Veuillez vérifier la [Configuration](/docs/edge/additional-features/chainbridge/setup) pour plus de détails.

Pendant le transfert de NFT de Mumbai vers Edge, le contrat Gestionnaire de ERC721 dans Mumbai retire le NFT de votre compte. Vous appellerez approuver avant le transfert.

```bash
$ npx hardhat approve --type erc721 --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --id 0x50 --network mumbai
```

Enfin, vous commencerez le transfert de NFT de Mumbai vers Edge.

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

Après la transaction de dépôt réussie, le relais recevra l'événement et votera pour la proposition.  
Cela exécute une transaction pour envoyer le NFT au compte destinataire dans la chaîne Edge de Polygon après que le nombre requis de votes a été soumis.

```bash
INFO[11-19|09:07:50] Handling nonfungible deposit event       chain=mumbai
INFO[11-19|09:07:50] Attempting to resolve message            chain=polygon-edge type=NonFungibleTransfer src=99 dst=100 nonce=2 rId=000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501
INFO[11-19|09:07:50] Creating erc721 proposal                 chain=polygon-edge src=99 nonce=2
INFO[11-19|09:07:50] Watching for finalization event          chain=polygon-edge src=99 nonce=2
INFO[11-19|09:07:50] Submitted proposal vote                  chain=polygon-edge tx=0x58a22d84a08269ad2e8d52d8dc038621f1a21109d11c7b6e0d32d5bf21ea8505 src=99 depositNonce=2 gasPrice=1
INFO[11-19|09:08:15] Submitted proposal execution             chain=polygon-edge tx=0x57419844881a07531e31667c609421662d94d21d0709e64fb728138309267e68 src=99 dst=100 nonce=2 gasPrice=3
```

Une fois la transaction d'exécution réussie, vous obtiendrez des NFT dans la chaîne Edge de Polygon.

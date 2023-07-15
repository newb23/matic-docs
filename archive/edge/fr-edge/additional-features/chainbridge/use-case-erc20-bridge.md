---
id: use-case-erc20-bridge
title: Cas d'utilisation - Pont ERC20
description: Exemple pour le contrat de pont ERC20
keywords:
  - docs
  - polygon
  - edge
  - Bridge
  - ERC20
---

Cette section vise à vous donner un flux de configuration du Pont ERC20 pour un cas d'utilisation pratique.

Dans ce guide, vous utiliserez le testnet Mumbai de Polygon PoS et la chaîne locale Edge de Polygon. Veuillez vous assurer que vous disposez d'un point de terminaison JSON-RPC pour Mumbai et que vous avez configuré Edge de Polygon dans un environnement local. Veuillez vous référer à la [Configuration locale](/docs/edge/get-started/set-up-ibft-locally) ou [Configuration Cloud](/docs/edge/get-started/set-up-ibft-on-the-cloud) pour plus de détails.

## Scénario {#scenario}

Ce scénario consiste à configurer un pont pour le jeton ERC20 qui a déjà été déployé dans la chaîne publique (Polygon PoS) afin de permettre un transfert à faible coût dans une chaîne privée (Polygon Edge) pour les utilisateurs dans un cas normal. Dans un tel cas, l'offre totale de jeton a été définie dans la chaîne publique et seul le montant du jeton qui a été transféré de la chaîne publique à la chaîne privée doit exister dans la chaîne privée. Pour cette raison, vous devrez utiliser le mode verrouillage/libération dans la chaîne publique et le mode brûlé/frappé dans la chaîne privée.

Lors de l'envoi des jetons de la chaîne publique vers la chaîne privée, le jeton sera verrouillé dans le contrat Gestionnaire ERC20 de la chaîne publique et la même quantité de jetons sera frappée dans la chaîne privée. En revanche, en cas de transfert de la chaîne privée vers la chaîne publique, le jeton dans la chaîne privée sera brûlé et la même quantité de jeton sera libérée du contrat Gestionnaire ERC20 dans la chaîne publique.

## Contrats {#contracts}

Expliquer avec un simple contrat ERC20 au lieu du contrat développé par ChainBridge. Pour le mode brûlé/frappé, le contrat ERC20 doit avoir `mint`et `burnFrom`des méthodes en plus des méthodes pour ERC20 comme celles-ci:

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

Tous les codes et scripts sont dans le Référentiel Github [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example).

## Étape1: Déployez les contrats Gestionnaire Bridge et ERC20 {#step1-deploy-bridge-and-erc20-handler-contracts}

Tout d'abord, vous allez déployer les contrats Bridge et ERC20Handler en utilisant `cb-sol-cli`dans les deux chaînes.

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

Vous obtiendrez des adresses de contrat Bridge et ERC20Handler comme celle-ci:

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

## Étape 2: Déployez votre contrat ERC20 {#step2-deploy-your-erc20-contract}

Vous déploierez votre contrat ERC20. Cet exemple vous guide avec le projet de casque [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example).

```bash
$ git clone https://github.com/Trapesys/chainbridge-example.git
$ cd chainbridge-example
$ npm i
```

Veuillez créer `.env`le fichier et définissez les valeurs suivantes.

```.env
PRIVATE_KEYS=0x...
MUMBAI_JSONRPC_URL=https://rpc-mumbai.matic.today
EDGE_JSONRPC_URL=http://localhost:10002
```

Ensuite, vous déploierez le contrat ERC20 dans les deux chaînes.

```bash
$ npx hardhat deploy --contract erc20 --name <ERC20_TOKEN_NAME> --symbol <ERC20_TOKEN_SYMBOL> --network mumbai
```

```bash
$ npx hardhat deploy --contract erc20 --name <ERC20_TOKEN_NAME> --symbol <ERC20_TOKEN_SYMBOL> --network edge
```

Une fois le déploiement réussi, vous obtiendrez une adresse de contrat comme celle-ci:

```bash
ERC20 contract has been deployed
Address: <ERC20_CONTRACT_ADDRESS>
Name: <ERC20_TOKEN_NAME>
Symbol: <ERC20_TOKEN_SYMBOL>
```

## Étape 3: Enregistrrz l'Identifiant de ressource dans le Pont {#step3-register-resource-id-in-bridge}

Vous enregistrerez un Identifiant de ressource qui associe une ressource dans un environnement inter-chaînes. Vous devez définir le même Identifiant de ressource dans les deux chaînes.

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

## Étape 4: Définissez le mode Frappé/Brûlé dans le pont ERC20 du Edge {#step4-set-mint-burn-mode-in-erc20-bridge-of-the-edge}

Le Pont s'attend à fonctionner en mode brûlé/frappé dans l'Edge de Polygon. Vous réglerez le mode brûlé/frappé à l'aide de `cb-sol-cli`.

```bash
$ cb-sol-cli bridge set-burn \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[ERC20_CONTRACT_ADDRESS]"
```

Et vous devez accorder un rôle de frappeur et de brûleur au contrat Gestionnaire ERC20.

```bash
$ npx hardhat grant --role mint --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --network edge
$ npx hardhat grant --role burn --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --network edge
```

## Étape 5: Frappez le Jeton {#step5-mint-token}

Vous frapperez de nouveaux jetons ERC20 dans la chaîne de Mumbai.

```bash
$ npx hardhat mint --type erc20 --contract [ERC20_CONTRACT_ADDRESS] --address [ACCOUNT_ADDRESS] --amount 100000000000000000000 --network mumbai # 100 Token
```

Une fois la transaction réussie, le compte aura le jeton frappé.

## Étape 6: Démarrez le transfert ERC20 {#step6-start-erc20-transfer}

Avant de commencer cette étape, veuillez vous assurer que vous avez démarré un relais. Veuillez vérifier [la configuration](/docs/edge/additional-features/chainbridge/setup) pour plus de détails.

Lors du transfert de jetons de Mumbai vers Edge, le contrat Gestionnaire ERC20 à Mumbai retire les jetons de votre compte. Vous appellerez approuvé avant le transfert.

```bash
$ npx hardhat approve --type erc20 --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --amount 10000000000000000000 --network mumbai # 10 Token
```

Enfin, vous commencerez le transfert de jetons de Mumbai vers Edge en utilisant `cb-sol-cli`.

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

Une fois la transaction de dépôt réussie, le relais recevra l'événement et votera pour la proposition. Il exécute une transaction pour envoyer des jetons au compte destinataire dans la chaîne Edge de Polygon une fois que le nombre de votes requis a été soumis.

```bash
INFO[11-19|08:15:58] Handling fungible deposit event          chain=mumbai dest=100 nonce=1
INFO[11-19|08:15:59] Attempting to resolve message            chain=polygon-edge type=FungibleTransfer src=99 dst=100 nonce=1 rId=000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00
INFO[11-19|08:15:59] Creating erc20 proposal                  chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Watching for finalization event          chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Submitted proposal vote                  chain=polygon-edge tx=0x67a97849951cdf0480e24a95f59adc65ae75da23d00b4ab22e917a2ad2fa940d src=99 depositNonce=1 gasPrice=1
INFO[11-19|08:16:24] Submitted proposal execution             chain=polygon-edge tx=0x63615a775a55fcb00676a40e3c9025eeefec94d0c32ee14548891b71f8d1aad1 src=99 dst=100 nonce=1 gasPrice=5
```

Une fois la transaction d'exécution réussie, vous obtiendrez des jetons dans la chaîne Edge de Polygon.

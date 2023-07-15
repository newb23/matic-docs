---
id: use-case-erc721-bridge
title: Caso práctico - puente ERC-721
description: Ejemplo de contrato puente ERC-721
keywords:
  - docs
  - polygon
  - edge
  - Bridge
  - ERC721
---

Esta sección tiene como objetivo explicarte el flujo de configuración de un puente ERC-721 para un caso de uso práctico.

En esta guía, utilizarás la red de pruebas con PoS Mumbai de Polygon y la cadena local de Polygon Edge. Debes tener la terminal RPC JSON para Mumbai y haber configurado Polygon Edge en el entorno local. Consulta la [configuración local](/docs/edge/get-started/set-up-ibft-locally) o [ la configuración de la nube](/docs/edge/get-started/set-up-ibft-on-the-cloud) para obtener más información.

## Escenario {#scenario}

Este escenario consiste en configurar un puente para el NFT ERC-721 que ya ha sido implementado en la cadena pública (PoS de Polygon) con el fin de permitir la transferencia de bajo costo en una cadena privada (Polygon Edge) para los usuarios en un caso regular. En este caso, los metadatos originales se han definido en la cadena pública y los únicos NFT que se han transferido desde la cadena pública pueden existir en la cadena privada. Por esa razón, deberás usar el modo de bloquear o liberar en la cadena pública, y el modo de quemado o acuñado en la cadena privada.

Al enviar un NFT de la cadena pública a la cadena privada, el NFT se bloqueará en el contrato ERC-721 del contrato manejador en la cadena pública y el mismo NFT se acuñará en la cadena privada. Por otro lado, en el caso de la transferencia de la cadena privada a la cadena pública, el NFT en la cadena privada se quemará y el mismo NFT se liberará del contrato manejador de ERC-721 en la cadena pública.

## Contratos {#contracts}

Explicación con un contrato ERC-721 simple en lugar del contrato desarrollado por ChainBridge Para la modalidad de quemado o acuñado, se requiere que el contrato ERC-721 tenga los métodos `burn` y `mint` además de los definidos en el ERC-721, como por ejemplo:

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

Todos los códigos y secuencias de comandos se encuentran en el repositorio de Github, [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example).

## Paso 1: despliega los contratos del puente y del manejador ERC-721 {#step1-deploy-bridge-and-erc721-handler-contracts}

En primer lugar, se despliegan los contratos puente y manejador ERC-721 `cb-sol-cli` en las dos cadenas.

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

Obtendrás las direcciones de los contratos puente y manejador ERC-721 así:

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

## Paso 2: despliega tu contrato ERC-721 {#step2-deploy-your-erc721-contract}

Implementa tu contrato ERC-721. Este ejemplo te explicará un proyecto de Hardhat, [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example).

```bash
$ git clone https://github.com/Trapesys/chainbridge-example.git
$ cd chainbridge-example
$ npm i
```

Crea un archivo `.env` y establece los siguientes valores.

```.env
PRIVATE_KEYS=0x...
MUMBAI_JSONRPC_URL=https://rpc-mumbai.matic.today
EDGE_JSONRPC_URL=http://localhost:10002
```

A continuación, despliega el contrato ERC-721 en las dos cadenas.

```bash
$ npx hardhat deploy --contract erc721 --name <ERC721_TOKEN_NAME> --symbol <ERC721_TOKEN_SYMBOL> --uri <BASE_URI> --network mumbai
```

```bash
$ npx hardhat deploy --contract erc721 --name <ERC721_TOKEN_NAME> --symbol <ERC721_TOKEN_SYMBOL> --uri <BASE_URI> --network edge
```

Una vez que el despliegue culmine, obtendrás una dirección de contrato como la siguiente:

```bash
ERC721 contract has been deployed
Address: <ERC721_CONTRACT_ADDRESS>
Name: <ERC721_TOKEN_NAME>
Symbol: <ERC721_TOKEN_SYMBOL>
Base URI: <ERC721_BASE_URI>
```

## Paso 3: registra la ID de recursos en el puente {#step3-register-resource-id-in-bridge}

Registra una ID de recurso que asocie los mismos en un entorno entre cadenas.

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

## Paso 4: establece el modo de acuñación o quemado en el puente ERC-721 de Edge {#step4-set-mint-burn-mode-in-erc721-bridge-of-the-edge}

Se espera que el puente funcione como el modo de quemado o acuñación en Edge. Configura el modo de quemado o acuñación.

```bash
$ cb-sol-cli bridge set-burn \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC721_HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[ERC721_CONTRACT_ADDRESS]"
```

Y debes asignar un rol de acuñador y quemador al contrato manejador ERC-721.

```bash
$ npx hardhat grant --role mint --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --network edge
$ npx hardhat grant --role burn --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --network edge
```

## Paso 5: acuña el NFT {#step5-mint-nft}

Acuña el nuevo NFT ERC-721 en la cadena de Mumbai.

```bash
$ npx hardhat mint --type erc721 --contract [ERC721_CONTRACT_ADDRESS] --address [ACCOUNT_ADDRESS] --id 0x50 --data hello.json --network mumbai
```

Cuando la transacción culmine, la cuenta tendrá el NFT acuñado.

## Paso 6: inicia la transferencia ERC-721 {#step6-start-erc721-transfer}

Antes de comenzar este paso, cerciórate de haber iniciado el repetidor. Consulta [Configuración](/docs/edge/additional-features/chainbridge/setup) para obtener más información.

Durante la transferencia de NFT de Mumbai a Edge, el contrato manejador ERC-721 en Mumbai retira el NFT de tu cuenta. Ejecuta una llamada de autorización antes de la transferencia.

```bash
$ npx hardhat approve --type erc721 --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --id 0x50 --network mumbai
```

Por último, comienza el traslado de NFT de Mumbai a Edge.

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

Cuando la transacción del depósito culmine correctamente, el repetidor recibirá el evento y votará por la propuesta.  
Ejecuta una transacción para enviar NFT a la cuenta del destinatario en la cadena de Polygon Edge después de que se presente el número requerido de votos.

```bash
INFO[11-19|09:07:50] Handling nonfungible deposit event       chain=mumbai
INFO[11-19|09:07:50] Attempting to resolve message            chain=polygon-edge type=NonFungibleTransfer src=99 dst=100 nonce=2 rId=000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501
INFO[11-19|09:07:50] Creating erc721 proposal                 chain=polygon-edge src=99 nonce=2
INFO[11-19|09:07:50] Watching for finalization event          chain=polygon-edge src=99 nonce=2
INFO[11-19|09:07:50] Submitted proposal vote                  chain=polygon-edge tx=0x58a22d84a08269ad2e8d52d8dc038621f1a21109d11c7b6e0d32d5bf21ea8505 src=99 depositNonce=2 gasPrice=1
INFO[11-19|09:08:15] Submitted proposal execution             chain=polygon-edge tx=0x57419844881a07531e31667c609421662d94d21d0709e64fb728138309267e68 src=99 dst=100 nonce=2 gasPrice=3
```

Cuando la transacción de ejecución culmine correctamente, obtendrás NFT en la cadena de Polygon Edge.

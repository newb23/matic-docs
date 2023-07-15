---
id: use-case-erc20-bridge
title: Caso de uso - puente de ERC-20
description: Ejemplo de cómo hacer un contrato de puente de ERC-20
keywords:
  - docs
  - polygon
  - edge
  - Bridge
  - ERC20
---

Esta sección tiene como objetivo explicarte el flujo de la configuración del puente de ERC-20 para un caso de uso práctico.

En esta guía, utilizarás la red de pruebas de PoS Mumbai de Polygon y la cadena local de Polygon Edge. Debes tener la terminal RPC JSON para Mumbai y haber configurado Polygon Edge en el entorno local. Consulta la [configuración local](/docs/edge/get-started/set-up-ibft-locally) o [ la configuración de la nube](/docs/edge/get-started/set-up-ibft-on-the-cloud) para obtener más información.

## Escenario {#scenario}

Este escenario es para configurar el puente para el token ERC-20 que ya se ha desplegado en la cadena pública (PoS de Polygon) para habilitar una transferencia de bajo costo en una cadena privada (Polygon Edge) para usuarios en un caso regular. En un caso así, el suministro total de tokens se ha definido en la cadena pública, y en la cadena privada solo debe existir la cantidad de tokens que se ha transferido de la cadena pública a la cadena privada. Por esa razón, deberás usar el modo de bloquear o liberar en la cadena pública, y el modo de quemado o acuñado en la cadena privada.

Al enviar tokens de la cadena pública a la privada, el token se bloqueará en el contrato manejador de ERC-20 de la cadena pública, y la misma cantidad de tokens se acuñará en la cadena privada. Por otro lado, en el caso de la transferencia de la cadena privada a la cadena pública, el token en la cadena privada se quemará, y la misma cantidad de tokens se liberará desde el contrato del manejador de ERC-20 en la cadena pública.

## Contratos {#contracts}

Explicación con contratos simples de ERC-20 en lugar del contrato desarrollado por ChainBridge Para el modo de quemado o acuñado, el contrato de ERC-20 debe tener los métodos `mint` y `burnFrom` , además de los métodos para ERC-20 así:

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

Todos los códigos y secuencias de comandos se encuentran en en el repositorio de Github, [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example).

## Paso 1: despliega los contratos del puente y del manejador de ERC-20 {#step1-deploy-bridge-and-erc20-handler-contracts}

En primer lugar, deberás desplegar los contratos del puente y del manejador de ERC-20 mediante el uso de `cb-sol-cli` en las dos cadenas.

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

Obtendrás direcciones del contrato del puente y del manejador de ERC-20 como esta:

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

## Paso 2: despliega tu contrato de ERC-20 {#step2-deploy-your-erc20-contract}

Desplegarás tu contrato de ERC-20. Este ejemplo te guiará con un proyecto de Hardhat, [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example).

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

A continuación, despliega el contrato de ERC-20 en ambas cadenas.

```bash
$ npx hardhat deploy --contract erc20 --name <ERC20_TOKEN_NAME> --symbol <ERC20_TOKEN_SYMBOL> --network mumbai
```

```bash
$ npx hardhat deploy --contract erc20 --name <ERC20_TOKEN_NAME> --symbol <ERC20_TOKEN_SYMBOL> --network edge
```

Una vez realizado el despliegue correctamente, obtendrás direcciones de contrato como esta:

```bash
ERC20 contract has been deployed
Address: <ERC20_CONTRACT_ADDRESS>
Name: <ERC20_TOKEN_NAME>
Symbol: <ERC20_TOKEN_SYMBOL>
```

## Paso 3: registra la ID de recursos en el puente {#step3-register-resource-id-in-bridge}

Registra una ID de recursos que asocie los recursos en un entorno entre cadenas. Tendrás que usar la misma ID de recursos en ambas cadenas.

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

## Paso 4: establece el modo de acuñado o quemado en el puente de ERC-20 de Edge {#step4-set-mint-burn-mode-in-erc20-bridge-of-the-edge}

Se espera que el puente funcione en modo de quemado o acuñado en Polygon Edge. Configura el modo de quemado y acuñado mediante el uso de `cb-sol-cli`.

```bash
$ cb-sol-cli bridge set-burn \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[ERC20_CONTRACT_ADDRESS]"
```

Deberás otorgarle un rol de acuñador y quemador al contrato manejador de ERC-20.

```bash
$ npx hardhat grant --role mint --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --network edge
$ npx hardhat grant --role burn --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --network edge
```

## Paso 5: acuña los tokens {#step5-mint-token}

Acuña los nuevos tokens de ERC-20 en la cadena de Mumbai.

```bash
$ npx hardhat mint --type erc20 --contract [ERC20_CONTRACT_ADDRESS] --address [ACCOUNT_ADDRESS] --amount 100000000000000000000 --network mumbai # 100 Token
```

Una vez que realizada correctamente la transacción, la cuenta tendrá los tokens acuñados.

## Paso 6: inicia la transferencia de ERC-20 {#step6-start-erc20-transfer}

Antes de iniciar este paso, asegúrate de haber iniciado un repetidor. Revisa [Configuración](/docs/edge/additional-features/chainbridge/setup) para obtener más información.

Durante la transferencia de tokens de Mumbai a Edge, el contrato manejador de ERC-20 en Mumbai retira tokens de tu cuenta. Ejecuta una llamada de autorización antes de la transferencia.

```bash
$ npx hardhat approve --type erc20 --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --amount 10000000000000000000 --network mumbai # 10 Token
```

Finalmente, inicia la transferencia de tokens de Mumbai a Edge con `cb-sol-cli`.

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

Una vez culminada correctamente la transacción del depósito, el repetidor recibirá el evento y votará por la propuesta. Este ejecuta una transacción para enviar los tokens a la cuenta del destinatario en la cadena de Polygon Edge después de haber enviado el número requerido de votos.

```bash
INFO[11-19|08:15:58] Handling fungible deposit event          chain=mumbai dest=100 nonce=1
INFO[11-19|08:15:59] Attempting to resolve message            chain=polygon-edge type=FungibleTransfer src=99 dst=100 nonce=1 rId=000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00
INFO[11-19|08:15:59] Creating erc20 proposal                  chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Watching for finalization event          chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Submitted proposal vote                  chain=polygon-edge tx=0x67a97849951cdf0480e24a95f59adc65ae75da23d00b4ab22e917a2ad2fa940d src=99 depositNonce=1 gasPrice=1
INFO[11-19|08:16:24] Submitted proposal execution             chain=polygon-edge tx=0x63615a775a55fcb00676a40e3c9025eeefec94d0c32ee14548891b71f8d1aad1 src=99 dst=100 nonce=1 gasPrice=5
```

Después de que la transacción de ejecución se haya realizado correctamente, obtendrás los tokens en la cadena de Polygon Edge.

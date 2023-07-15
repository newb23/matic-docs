---
id: setup
title: Configuración
description: Cómo configurar ChainBridge
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

## Despliegue de contratos {#contracts-deployment}

En esta sección, desplegarás los contratos requeridos a la cadena de Polygon Edge y PoS de Polygon con `cb-sol-cli`.

```bash
# Setup for cb-sol-cli command
$ git clone https://github.com/ChainSafe/chainbridge-deploy.git
$ cd chainbridge-deploy/cb-sol-cli
$ make install
```

En primer lugar, desplegaremos contratos a la cadena de PoS de Polygon mediante el comando `cb-sol-cli deploy`. El indicador `--all` hace que el comando despliegue todos los contratos, incluyendo el puente, el manejador de ERC-20, el manejador de ERC-721, el manejador genérico, el contrato ERC-721 y el contrato ERC-20. Además, establecerá la dirección por defecto de la cuenta del repetidor y el umbral.

```bash
# Deploy all required contracts into Polygon PoS chain
$ cb-sol-cli deploy --all --chainId 99 \
  --url https://rpc-mumbai.matic.today \
  --gasPrice [GAS_PRICE] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```


Aprende sobre la ID de la cadena y los URL de RPC JSON [aquí](/docs/edge/additional-features/chainbridge/definitions).

:::caution

El precio de gas por defecto en `cb-sol-cli` es `20000000` (`0.02 Gwei`). Para establecer el precio de gas apropiado en una transacción. establece el valor usando el argumento `--gasPrice`.

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

El despliegue del contrato del puente toma aproximadamente 0x3f97b8 (4167608) de gas para desplegarse. Asegúrate de que los bloques que se generen tengan suficiente límite de gas de los bloques para contener la transacción de la creación del contrato. Para obtener más información sobre el cambio del límite del gas de los bloques en Polygon Edge, visita
la [configuración local](/docs/edge/get-started/set-up-ibft-locally).

:::

Cuando los contratos se hayan desplegado, obtendrás el siguiente resultado:

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

Ahora podemos desplegar los contratos a la cadena de Polygon Edge.

```bash
# Deploy all required contracts into Polygon Edge chain
$ cb-sol-cli deploy --all --chainId 100 \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```

Guarda los resultados de la terminal con las direcciones del contrato inteligente desplegado, ya que las necesitaremos para el siguiente paso.

## Configuración del repetidor {#relayer-setup}

En esta sección, iniciarás un repetidor para intercambiar datos entre dos cadenas.

Primero, debemos clonar y construir el repositorio de ChainBridge.

```bash
$ git clone https://github.com/ChainSafe/ChainBridge.git
$ cd chainBridge && make install
```

A continuación, deberás crear `config.json` y establecer los URL de RPC JSON, la dirección del repetidor y la dirección de los contratos para cada cadena.

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

Para iniciar un repetidor, debes importar la clave privada correspondiente a la dirección de la cuenta del repetidor. Tendrás que ingresar la contraseña cuando importes la clave privada. Cuando la importación haya culminado, la clave se almacenará en `keys/<ADDRESS>.key`.

```bash
# Import private key and store to local with encryption
$ chainbridge accounts import --privateKey [RELAYER_ACCOUNT_PRIVATE_KEY]

INFO[11-19|07:09:01] Importing key...
Enter password to encrypt keystore file:
> [PASSWORD_TO_ENCRYPT_KEY]
INFO[11-19|07:09:05] private key imported                     address=<RELAYER_ACCOUNT_ADDRESS> file=.../keys/<RELAYER_ACCOUNT_ADDRESS>.key
```

Después, podrás iniciar el repetidor. Deberás ingresar la misma contraseña que elegiste para almacenar la clave al principio.

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

Cuando el repetidor haya iniciado, empezará a observar nuevos bloques en cada cadena.

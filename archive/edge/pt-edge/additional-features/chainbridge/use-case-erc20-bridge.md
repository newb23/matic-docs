---
id: use-case-erc20-bridge
title: Caso de utilização - Bridge ERC-20
description: Exemplo para contrato do Bridge ERC-20
keywords:
  - docs
  - polygon
  - edge
  - Bridge
  - ERC20
---

Esta secção visa fornecer um fluxo de configuração do Bridge ERC-721 para um caso de utilização prático.

Neste guia, irá usar a testnet Mumbai da Polygon PoS e a chain local Polygon Edge. Certifique-se de que tem o endpoint JSON-RPC para Mumbai e de que configurou o Polygon Edge no ambiente local. Consulte a [Configuração Local](/docs/edge/get-started/set-up-ibft-locally) ou [Configuração na Nuvem](/docs/edge/get-started/set-up-ibft-on-the-cloud) para mais detalhes.

## Cenário {#scenario}

Este cenário é configurar um Bridge para o token ERC-20 que foi implantado na chain pública (Polygon PoS) para possibilitar uma transferência de baixo custo em chain privada (Polygon Edge) para utilizadores em um caso regular. Neste caso, o fornecimento de total de token foi definido na chain pública e apenas o valor do token que foi transferido da chain pública para a chain privada deve existir na chain privada. Por este motivo, terá de usar o modo de bloqueio/desbloqueio na chain pública e o modo de queima/mineração na chain privada.

Ao enviar NFTs da chain pública para a chain privada, o NFT será bloqueado no contrato Handler ERC20 da chain pública e o mesmo valor de token será minerado na chain privada. Por outro lado, e no caso de transferência da chain privada para a pública, o token da chain privada será queimado e o mesmo valor de token será desbloqueado do contrato Handler ERC20 da chain pública.

## Contratos {#contracts}

Explicação com um contrato ERC20 simples, em vez do contrato desenvolvido pela ChainBridge. Para o modo queimar/minerar, o contrato ERC-20 deve ter os métodos `mint` e `burnFrom`, além de métodos ERC-20 como este:

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

Encontra todos os códigos e scripts no repositótio do Github [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example).

## Etapa 1: Implantar contratos de Bridge e Handler ERC20 {#step1-deploy-bridge-and-erc20-handler-contracts}

Em primeiro lugar, terá de implantar contratos de Bridge e ERC720Handler nas duas chains usando `cb-sol-cli`.

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

Irá obter endereços dos contratos de Bridge e ERC20Handler como:

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

## Etapa 2: implantar contrato ERC20 {#step2-deploy-your-erc20-contract}

Irá implantar seu contrato ERC20. Este exemplo orienta-o com base no projeto hardhat [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example).

```bash
$ git clone https://github.com/Trapesys/chainbridge-example.git
$ cd chainbridge-example
$ npm i
```

Crie o ficheiro `.env` e defina os seguintes valores.

```.env
PRIVATE_KEYS=0x...
MUMBAI_JSONRPC_URL=https://rpc-mumbai.matic.today
EDGE_JSONRPC_URL=http://localhost:10002
```

Em seguida, irá implantar o contrato ERC20 nas duas chains.

```bash
$ npx hardhat deploy --contract erc20 --name <ERC20_TOKEN_NAME> --symbol <ERC20_TOKEN_SYMBOL> --network mumbai
```

```bash
$ npx hardhat deploy --contract erc20 --name <ERC20_TOKEN_NAME> --symbol <ERC20_TOKEN_SYMBOL> --network edge
```

Depois de uma implantação bem-sucedida, obterá um endereço do contrato, como segue:

```bash
ERC20 contract has been deployed
Address: <ERC20_CONTRACT_ADDRESS>
Name: <ERC20_TOKEN_NAME>
Symbol: <ERC20_TOKEN_SYMBOL>
```

## Etapa 3: registar a identificação do recurso na Bridge {#step3-register-resource-id-in-bridge}

Irá registar uma identificação que associe o recurso num ambiente cross-chain. É necessário definir a mesma identificação de recurso nas duas chains.

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

## Etapa 4: definir o modo de queima/mineração na bridge ERC20 do Edge {#step4-set-mint-burn-mode-in-erc20-bridge-of-the-edge}

O bridge espera funcionar como modo para queimar/minerar no Polygon Edge. Irá definir o modo queimar/minerar usando `cb-sol-cli`.

```bash
$ cb-sol-cli bridge set-burn \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[ERC20_CONTRACT_ADDRESS]"
```

E é necessário conceder uma função de minerador e queimador ao contrato Handler ERC20.

```bash
$ npx hardhat grant --role mint --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --network edge
$ npx hardhat grant --role burn --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --network edge
```

## Etapa 5: minerar token {#step5-mint-token}

Os novos tokens ERC-20 serão minerados na chain Mumbai.

```bash
$ npx hardhat mint --type erc20 --contract [ERC20_CONTRACT_ADDRESS] --address [ACCOUNT_ADDRESS] --amount 100000000000000000000 --network mumbai # 100 Token
```

A conta terá o token minerado depois de concluída a transação.

## Etapa 6: iniciar transferência do ERC20 {#step6-start-erc20-transfer}

Antes de iniciar esta etapa, certifique-se de que foi iniciado um relayer. Consulte a [Configuração](/docs/edge/additional-features/chainbridge/setup) para mais detalhes.

Durante a transferência de token de Mumbai para Edge, o contrato do Handler ERC20 no Mumbai retira tokens da sua conta. Irá chamar a aprovação antes da transferência:

```bash
$ npx hardhat approve --type erc20 --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --amount 10000000000000000000 --network mumbai # 10 Token
```

Finalmente, você inicia a transferência de tokens do Mumbai para o Edge usando o `cb-sol-cli`.

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

Depois de concluir a transação de depósito, o relayer irá obter o evento e votar a proposta.
Ele executa uma transação para enviar tokens para a conta do destinatário na chain Polygon Edge depois de ter sido apresentado o número necessário de votos.

```bash
INFO[11-19|08:15:58] Handling fungible deposit event          chain=mumbai dest=100 nonce=1
INFO[11-19|08:15:59] Attempting to resolve message            chain=polygon-edge type=FungibleTransfer src=99 dst=100 nonce=1 rId=000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00
INFO[11-19|08:15:59] Creating erc20 proposal                  chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Watching for finalization event          chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Submitted proposal vote                  chain=polygon-edge tx=0x67a97849951cdf0480e24a95f59adc65ae75da23d00b4ab22e917a2ad2fa940d src=99 depositNonce=1 gasPrice=1
INFO[11-19|08:16:24] Submitted proposal execution             chain=polygon-edge tx=0x63615a775a55fcb00676a40e3c9025eeefec94d0c32ee14548891b71f8d1aad1 src=99 dst=100 nonce=1 gasPrice=5
```

Assim que a execução da transação for bem-sucedida, irá obter os tokens na chain Polygon Edge.

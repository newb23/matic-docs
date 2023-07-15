---
id: use-case-erc721-bridge
title: Caso de utilização - Bridge ERC-721
description: Exemplo para contrato Bridge ERC-721
keywords:
  - docs
  - polygon
  - edge
  - Bridge
  - ERC721
---

Esta secção visa fornecer um fluxo de configuração do Bridge ERC-721 para um caso de utilização prático.

Neste guia, irá usar a testnet Mumbai da Polygon PoS e a chain local Polygon Edge. Certifique-se de que tem o endpoint JSON-RPC para Mumbai e de que configurou o Polygon Edge no ambiente local. Consulte a [Configuração Local](/docs/edge/get-started/set-up-ibft-locally) ou [Configuração na Nuvem](/docs/edge/get-started/set-up-ibft-on-the-cloud) para mais detalhes.

## Cenário {#scenario}

Este cenário consiste em configurar uma Bridge para o NFT ERC-721 que já foi implantado na chain pública (Polygon PoS) para permitir a transferência de baixo custo numa chain privada (Polygon Edge), numa situação normal. Neste caso, os metadados originais foram definidos na chain pública e os únicos NFTs que foram transferidos da chain pública podem existir na chain privada. Por este motivo, terá de usar o modo de bloqueio/desbloqueio na chain pública e o modo de queima/mineração na chain privada.

Ao enviar NFTs da chain pública para a chain privada, o NFT será bloqueado no contrato Handler ERC-721 da chain pública e o mesmo NFT será minerado na chain privada. Por outro lado, e no caso de transferência da chain privada para a pública, o NFT da chain privada será queimado e o mesmo NFT será desbloqueado do contrato Handler ERC-721 da chain pública.

## Contratos {#contracts}

Explicação com um contrato ERC-721 simples, em vez do contrato desenvolvido pela ChainBridge. Para o modo de queima/mineração, o contrato ERC-721 deve ter os métodos `burn` e `mint`, além dos métodos definidos em ERC-721, nomeadamente:

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

Encontra todos os códigos e scripts no repositótio do Github [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example).

## Etapa 1: implantar contratos Bridge e Handler ERC-721 {#step1-deploy-bridge-and-erc721-handler-contracts}

Em primeiro lugar, terá de implantar contratos Bridge e ERC721Handler nas duas chains usando `cb-sol-cli`.

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

Irá obter endereços dos contratos Bridge e ERC721Handler como mostrado abaixo:

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

## Etapa 2: implantar o seu contrato ERC-721 {#step2-deploy-your-erc721-contract}

Irá implantar o seu contrato ERC-721. Este exemplo orienta-o com base no projeto hardhat [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example).

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

Em seguida, irá implantar o contrato ERC-721 nas duas chains.

```bash
$ npx hardhat deploy --contract erc721 --name <ERC721_TOKEN_NAME> --symbol <ERC721_TOKEN_SYMBOL> --uri <BASE_URI> --network mumbai
```

```bash
$ npx hardhat deploy --contract erc721 --name <ERC721_TOKEN_NAME> --symbol <ERC721_TOKEN_SYMBOL> --uri <BASE_URI> --network edge
```

Depois de uma implantação bem-sucedida, obterá o endereço do contrato, como segue:

```bash
ERC721 contract has been deployed
Address: <ERC721_CONTRACT_ADDRESS>
Name: <ERC721_TOKEN_NAME>
Symbol: <ERC721_TOKEN_SYMBOL>
Base URI: <ERC721_BASE_URI>
```

## Etapa 3: registar a ID do recurso na Bridge {#step3-register-resource-id-in-bridge}

Irá registar uma identificação que associe os recursos num ambiente cross-chain.

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

## Etapa 4: definir o modo de queima/mineração na bridge ERC-721 do Edge {#step4-set-mint-burn-mode-in-erc721-bridge-of-the-edge}

A Bridge espera trabalhar como modo de queima/mineração no Edge. Irá definir o modo de queima/mineração.

```bash
$ cb-sol-cli bridge set-burn \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC721_HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[ERC721_CONTRACT_ADDRESS]"
```

E é necessário conceder um papel de minerador e queimador ao contrato Handler ERC-721.

```bash
$ npx hardhat grant --role mint --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --network edge
$ npx hardhat grant --role burn --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --network edge
```

## Etapa 5: minerar o NFT {#step5-mint-nft}

Irá minerar o novo NFT ERC-721 na chain Mumbai.

```bash
$ npx hardhat mint --type erc721 --contract [ERC721_CONTRACT_ADDRESS] --address [ACCOUNT_ADDRESS] --id 0x50 --data hello.json --network mumbai
```

A conta terá o NFT minerado depois de concluída a transação.

## Etapa 6: iniciar a transferência do ERC-721 {#step6-start-erc721-transfer}

Antes de iniciar esta etapa, certifique-se de que começou o relayer. Consulte a [Configuração](/docs/edge/additional-features/chainbridge/setup) para mais detalhes.

Durante a transferência do NFT da Mumbai para o Edge, o contrato Handler ERC-721 em Mumbai retira o NFT da sua conta. Irá chamar a aprovação antes da transferência:

```bash
$ npx hardhat approve --type erc721 --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --id 0x50 --network mumbai
```

Por fim, deverá iniciar a transferência do NFT da Mumbai para o Edge.

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

Depois de concluir a transação de depósito, o relayer irá obter o evento e votar a proposta.  
Ele executa uma transação para enviar o NFT para a conta do destinatário na chain Polygon Edge depois de ter sido apresentado o número necessário de votos.

```bash
INFO[11-19|09:07:50] Handling nonfungible deposit event       chain=mumbai
INFO[11-19|09:07:50] Attempting to resolve message            chain=polygon-edge type=NonFungibleTransfer src=99 dst=100 nonce=2 rId=000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501
INFO[11-19|09:07:50] Creating erc721 proposal                 chain=polygon-edge src=99 nonce=2
INFO[11-19|09:07:50] Watching for finalization event          chain=polygon-edge src=99 nonce=2
INFO[11-19|09:07:50] Submitted proposal vote                  chain=polygon-edge tx=0x58a22d84a08269ad2e8d52d8dc038621f1a21109d11c7b6e0d32d5bf21ea8505 src=99 depositNonce=2 gasPrice=1
INFO[11-19|09:08:15] Submitted proposal execution             chain=polygon-edge tx=0x57419844881a07531e31667c609421662d94d21d0709e64fb728138309267e68 src=99 dst=100 nonce=2 gasPrice=3
```

Assim que a execução da transação for bem-sucedida, irá obter o NFT na chain Polygon Edge.

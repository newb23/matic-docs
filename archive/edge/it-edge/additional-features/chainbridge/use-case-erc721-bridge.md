---
id: use-case-erc721-bridge
title: Caso d'uso - Bridge ERC721
description: Esempio per il bridge del contratto ERC721
keywords:
  - docs
  - polygon
  - edge
  - Bridge
  - ERC721
---

Questa sezione mira a fornirti un flusso di installazione di bridge ERC271 per un caso d'uso pratico.

In questa guida utilizzerai la testnet Mumbai di Polygon PoS e la chain locale di Polygon Edge. Assicurati di avere l'endpoint JSON-RPC per Mumbai e di aver configurato Polygon Edge nell'ambiente locale. Fai riferimento a [Configurazione locale](/docs/edge/get-started/set-up-ibft-locally) o [Configurazione Cloud](/docs/edge/get-started/set-up-ibft-on-the-cloud) per maggiori dettagli.

## Scenario {#scenario}

Questo scenario consiste nell'impostare un bridge per l'NFT ERC721 che è già stato implementato nella catena pubblica (PoS di Polygon) per abilitare il trasferimento a basso costo in una catena privata (edge di Polygon) per utenti in un caso normale. In tal caso, i metadati originali sono stati definiti nella catena pubblica e gli unici NFT che sono stati trasferiti dalla catena pubblica possono esistere nella catena privata. Per questo motivo dovrai utilizzare la modalità blocco/rilascio nella catena pubblica e la modalità brucia/conia nella catena privata.

Quando si invia un NFT dalla catena pubblica alla catena privata, l'NFT verrà bloccato nel contratto handler ERC271 nella catena pubblica e lo stesso NFT verrà coniato nella catena privata. D'altra parte, in caso di trasferimento dalla catena privata alla catena pubblica, l'NFT nella catena privata verrà bruciato e lo stesso NFT verrà rilasciato dal contratto handler ERC721 nella catena pubblica.

## Contratti {#contracts}

Spiegazione con un contratto ERC721 semplice invece del contratto sviluppato da ChainBridge. Per la modalità burn/mint, il contratto ERC721 deve avere i metodi `mint` e `burn` in aggiunta ai metodi definiti in ERC721 come questo:

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

Tutti i codici e gli script sono in Github Repo [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example).

## Passaggio 1: Implementa il bridge e i contratti handler ERC721 {#step1-deploy-bridge-and-erc721-handler-contracts}

In primo luogo, dovrai implementare il bridge e i contratti Handler ERC721 utilizzando `cb-sol-cli` in entrambe le catene.

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

Otterrai gli indirizzi del bridge e del contratto handler ERC721 come questo:

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

## Passaggio 2: Implementa il tuo contratto ERC721 {#step2-deploy-your-erc721-contract}

Dovrai implementare  il tuo contratto ERC721. Questo esempio ti guida con il progetto hardhat [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example).

```bash
$ git clone https://github.com/Trapesys/chainbridge-example.git
$ cd chainbridge-example
$ npm i
```

Crea il file `.env` e imposta i seguenti valori.

```.env
PRIVATE_KEYS=0x...
MUMBAI_JSONRPC_URL=https://rpc-mumbai.matic.today
EDGE_JSONRPC_URL=http://localhost:10002
```

Poi dovrai implementare il contratto ERC721 in entrambe le catene.

```bash
$ npx hardhat deploy --contract erc721 --name <ERC721_TOKEN_NAME> --symbol <ERC721_TOKEN_SYMBOL> --uri <BASE_URI> --network mumbai
```

```bash
$ npx hardhat deploy --contract erc721 --name <ERC721_TOKEN_NAME> --symbol <ERC721_TOKEN_SYMBOL> --uri <BASE_URI> --network edge
```

Dopo che l'implementazione è riuscita, otterrai un indirizzo del contratto come questo:

```bash
ERC721 contract has been deployed
Address: <ERC721_CONTRACT_ADDRESS>
Name: <ERC721_TOKEN_NAME>
Symbol: <ERC721_TOKEN_SYMBOL>
Base URI: <ERC721_BASE_URI>
```

## Passaggio 3: Registra l'ID risorsa nel Bridge {#step3-register-resource-id-in-bridge}

Dovrai registrare un ID risorsa che associa le risorse in un ambiente cross-chain.

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

## Passaggio 4: Imposta la modalità Mint/Burn nel bridge ERC721 dell'edge {#step4-set-mint-burn-mode-in-erc721-bridge-of-the-edge}

Bridge prevede di funzionare come modalità burn/mint in Edge. Dovrai impostare la modalità burn/mint.

```bash
$ cb-sol-cli bridge set-burn \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC721_HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[ERC721_CONTRACT_ADDRESS]"
```

E devi concedere un ruolo minatore e bruciatore al contratto handler ERC721.

```bash
$ npx hardhat grant --role mint --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --network edge
$ npx hardhat grant --role burn --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --network edge
```

## Passaggio 5: Crea l'NFT {#step5-mint-nft}

Creerai il nuovo NFT ERC721 nella Mumbai chain.

```bash
$ npx hardhat mint --type erc721 --contract [ERC721_CONTRACT_ADDRESS] --address [ACCOUNT_ADDRESS] --id 0x50 --data hello.json --network mumbai
```

Una volta che la transazione è andata a buon fine, l'account avrà l'NFT coniato.

## Passaggio 6: Avvia il trasferimento ERC721 {#step6-start-erc721-transfer}

Prima di iniziare questo passaggio, assicurati di aver avviato il relayer. SI prega di controllare la [Configurazione](/docs/edge/additional-features/chainbridge/setup) per maggiori dettagli.

Durante il trasferimento dell'NFT da Mumbai a Edge, il contratto handler ERC721 in Mumbai preleva l'NFT dal tuo account. Chiamerai l'approvazione prima del trasferimento.

```bash
$ npx hardhat approve --type erc721 --contract [ERC721_CONTRACT_ADDRESS] --address [ERC721_HANDLER_CONTRACT_ADDRESS] --id 0x50 --network mumbai
```

Infine, avvierai il trasferimento di NFT da Mumbai a Edge.

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

Dopo che la transazione del deposito è andata a buon fine, il relayer riceverà l'evento e voterà la proposta.  
Esegue una transazione per inviare l'NFT all'account del destinatario nella Polygon Edge chain dopo che è stato inviato il numero di voti richiesto.

```bash
INFO[11-19|09:07:50] Handling nonfungible deposit event       chain=mumbai
INFO[11-19|09:07:50] Attempting to resolve message            chain=polygon-edge type=NonFungibleTransfer src=99 dst=100 nonce=2 rId=000000000000000000000000000000e389d61c11e5fe32ec1735b3cd38c69501
INFO[11-19|09:07:50] Creating erc721 proposal                 chain=polygon-edge src=99 nonce=2
INFO[11-19|09:07:50] Watching for finalization event          chain=polygon-edge src=99 nonce=2
INFO[11-19|09:07:50] Submitted proposal vote                  chain=polygon-edge tx=0x58a22d84a08269ad2e8d52d8dc038621f1a21109d11c7b6e0d32d5bf21ea8505 src=99 depositNonce=2 gasPrice=1
INFO[11-19|09:08:15] Submitted proposal execution             chain=polygon-edge tx=0x57419844881a07531e31667c609421662d94d21d0709e64fb728138309267e68 src=99 dst=100 nonce=2 gasPrice=3
```

Una volta che la transazione dell'esecuzione è andata a buon fine, riceverai l'NFT nella Polygon Edge chain.

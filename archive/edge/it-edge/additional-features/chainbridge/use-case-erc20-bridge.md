---
id: use-case-erc20-bridge
title: Caso d'uso -  ERC20 Bridge
description: Caso per contratto bridge ERC20
keywords:
  - docs
  - polygon
  - edge
  - Bridge
  - ERC20
---

Questa sezione ha lo scopo di fornire un flusso di configurazione di ERC20 Bridge per un esempio d'uso pratico.

In questa guida utilizzerai la testnet Mumbai di Polygon PoS e la chain locale di Polygon Edge. Assicurati di avere l'endpoint JSON-RPC per Mumbai e di aver configurato Polygon Edge nell'ambiente locale. Fai riferimento a [Configurazione locale](/docs/edge/get-started/set-up-ibft-locally) o [Configurazione Cloud](/docs/edge/get-started/set-up-ibft-on-the-cloud) per maggiori dettagli.

## Scenario {#scenario}

Questo scenario prevede la creazione di un bridge per il token ERC20 che è già stato implementato nella catena pubblica (Polygon PoS) al fine di consentire il trasferimento a basso costo in una catena privata (Polygon Edge) per gli utenti in un caso normale. In questo caso, la fornitura totale di token è stata definita nella catena pubblica e solo la quantità di token che è stata trasferita dalla catena pubblica alla catena privata deve esistere nella catena privata. Per questo motivo dovrai utilizzare la modalità blocco/rilascio nella catena pubblica e la modalità brucia/conia nella catena privata.

Quando si inviano token dalla catena pubblica alla catena privata, il token viene bloccato nel contratto ERC20 Handler della catena pubblica e la stessa quantità di token viene coniata nella catena privata. Invece, in caso di trasferimento dalla catena privata alla catena pubblica, il token della catena privata verrà bruciato e la stessa quantità di token verrà rilasciata dal contratto ERC20 Handler nella catena pubblica.

## Contratti {#contracts}

Spiegare con un semplice contratto ERC20 invece del contratto sviluppato da ChainBridge. Per la modalità brucia/conia, il contratto ERC20 deve avere metodi `mint`e `burnFrom`in aggiunta ai metodi per ERC20 come questo:

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

Tutti i codici e gli script sono in Github Repo [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example).

## Passo 1: implementazione dei contratti Bridge e ERC20 Handler {#step1-deploy-bridge-and-erc20-handler-contracts}

In primo luogo, si distribuiscono i contratti Bridge e ERC20Handler utilizzando `cb-sol-cli` in entrambe le catene.

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

Si otterranno indirizzi di contratto Bridge e ERC20Handler come questo:

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

## Passo 2: implementazione del contratto ERC20 {#step2-deploy-your-erc20-contract}

Implementerai il contratto ERC20. Questo esempio ti guida con il progetto hardhat [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example).

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

Poi dovrai implementare il contratto ERC20 in entrambe le catene.

```bash
$ npx hardhat deploy --contract erc20 --name <ERC20_TOKEN_NAME> --symbol <ERC20_TOKEN_SYMBOL> --network mumbai
```

```bash
$ npx hardhat deploy --contract erc20 --name <ERC20_TOKEN_NAME> --symbol <ERC20_TOKEN_SYMBOL> --network edge
```

Dopo che l'implementazione sarà riuscita, otterrai un indirizzo del contratto come questo:

```bash
ERC20 contract has been deployed
Address: <ERC20_CONTRACT_ADDRESS>
Name: <ERC20_TOKEN_NAME>
Symbol: <ERC20_TOKEN_SYMBOL>
```

## Passo 3: Registra l'ID risorsa nel Bridge {#step3-register-resource-id-in-bridge}

Dovrai registrare un ID risorsa che associa la risorsa in un ambiente cross-chain. È necessario impostare lo stesso ID risorsa in entrambe le catene.

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

## Passo 4: imposta la modalità Conia/Brucia nel bridge ERC20 dell'Edge {#step4-set-mint-burn-mode-in-erc20-bridge-of-the-edge}

Bridge prevede di lavorare come modalità di brucia/conia in Polygon Edge. La modalità brucia/conia va impostata usando `cb-sol-cli`.

```bash
$ cb-sol-cli bridge set-burn \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[ERC20_CONTRACT_ADDRESS]"
```

Inoltre, è necessario assegnare un ruolo di minatore e bruciatore al contratto ERC20 Handler.

```bash
$ npx hardhat grant --role mint --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --network edge
$ npx hardhat grant --role burn --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --network edge
```

## Passo 5: coniare token {#step5-mint-token}

I nuovi token ERC20 saranno coniati nella catena Mumbai.

```bash
$ npx hardhat mint --type erc20 --contract [ERC20_CONTRACT_ADDRESS] --address [ACCOUNT_ADDRESS] --amount 100000000000000000000 --network mumbai # 100 Token
```

Una volta che la transazione è andata a buon fine, l'account avrà il token coniato.

## Paaso 6: avvia il trasferimento di ERC20 {#step6-start-erc20-transfer}

Prima di iniziare questo passo assicurati di aver avviato un relayer. SI prega di controllare la [Configurazione](/docs/edge/additional-features/chainbridge/setup) per maggiori dettagli.

Durante il trasferimento dei token da Mumbai a Edge, il contratto ERC20 Handler di Mumbai preleva i token dal tuo account. Chiamerai l'approvazione prima del trasferimento.

```bash
$ npx hardhat approve --type erc20 --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --amount 10000000000000000000 --network mumbai # 10 Token
```

Infine, inizierai a trasferire token da Mumbai a Edge utilizzando `cb-sol-cli`.

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

Dopo che la transazione del deposito è andata a buon fine, il relayer riceverà l'evento e voterà la proposta. Esegue una transazione per inviare i token all'account del destinatario nella Polygn Edge chain dopo che è stato inviato il numero di voti richiesto.

```bash
INFO[11-19|08:15:58] Handling fungible deposit event          chain=mumbai dest=100 nonce=1
INFO[11-19|08:15:59] Attempting to resolve message            chain=polygon-edge type=FungibleTransfer src=99 dst=100 nonce=1 rId=000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00
INFO[11-19|08:15:59] Creating erc20 proposal                  chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Watching for finalization event          chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Submitted proposal vote                  chain=polygon-edge tx=0x67a97849951cdf0480e24a95f59adc65ae75da23d00b4ab22e917a2ad2fa940d src=99 depositNonce=1 gasPrice=1
INFO[11-19|08:16:24] Submitted proposal execution             chain=polygon-edge tx=0x63615a775a55fcb00676a40e3c9025eeefec94d0c32ee14548891b71f8d1aad1 src=99 dst=100 nonce=1 gasPrice=5
```

Una volta che la transazione dell'esecuzione sarà andata a buon fine, riceverai i token nella catena Polygon Edge.

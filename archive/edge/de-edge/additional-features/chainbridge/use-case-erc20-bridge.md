---
id: use-case-erc20-bridge
title: Anwendungsfall – ERC20 Bridge
description: Beispiel für die Überbrückung des ERC20-Vertrags
keywords:
  - docs
  - polygon
  - edge
  - Bridge
  - ERC20
---

Dieser Abschnitt soll Ihnen einen Überblick über die Einrichtung der ERC20 Bridge für einen praktischen Anwendungsfall geben.

In diesem Leitfaden werden Sie das Mumbai Polygon PoS Testnet und die lokale Polygon Edge Chain verwenden. Vergewissern, dass JSON-RPC Endpoint für Mumbai und Polygon Edge in der lokalen Umgebung eingerichtet ist. Weitere Details unter [Lokale Einrichtung](/docs/edge/get-started/set-up-ibft-locally) oder [Cloud-Einrichtung](/docs/edge/get-started/set-up-ibft-on-the-cloud).

## Szenario {#scenario}

In diesem Szenario soll eine Bridge für den ERC20-Token eingerichtet werden, der bereits in der öffentlichen Chain (Polygon PoS) eingesetzt wurde, um den Nutzern im Normalfall einen kostengünstigen Transfer in eine private Chain (Polygon Edge) zu ermöglichen. In einem solchen Fall wurde die Gesamtversorgung des Tokens in der öffentlichen Chain definiert und nur die Menge der Token, die von der öffentlichen Chain in die private übertragen wurde, muss in der privaten Chain existieren. Daher müssen Sie den Sperr-/Freigabemodus in der öffentlichen Chain und den Ausscheide/Ausgabemodus in der privaten Chain verwenden.

Wenn Token von der öffentlichen Chain in die private Chain gesendet werden, wird das Token im ERC20 Handler-Vertrag der öffentlichen Chain gesperrt und die gleiche Menge an Token wird in der privaten Chain ausgestellt, Andererseits wird das Token in der privaten Chain verbrannt und die gleiche Menge an Token wird vom ERC20-Handler-Vertrag in der öffentlichen Chain, im Falle der Übertragung von der privaten Chain in die öffentliche Chain, freigegeben.

## Contracts {#contracts}

Erklärungen mit einem einfachen ERC20-Vertrag anstelle des von ChainBridge entwickelten Vertrags. Für den Ausscheide/Ausgabemodus muss der ERC20-Vertrag zusätzlich zu den Methoden für ERC20 über`burnFrom` und`mint`Methoden verfügen:

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

Alle Codes und Skripte befinden sich im Beispiel Github Repo [Trapesys/chainbridge-example](https://github.com/Trapesys/chainbridge-example).

## Schritt1: Bereitstellen von Bridge und ERC20-Handler-Verträgen {#step1-deploy-bridge-and-erc20-handler-contracts}

Zunächst werden Sie Bridge und ERC20Handler-Verträge mit `cb-sol-cli`in den beiden Chains bereitstellen.

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

Sie erhalten Bridge und ERC20Handler-Vertragsadressen wie folgt:

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

## Schritt2: Bereitstellen Ihres ERC20-Vertrags {#step2-deploy-your-erc20-contract}

Bereitstellung Ihres ERC20-Vertrags. Dieses Beispiel führt Sie durch das Hardhat-Projekt[Trapesys/chainbridge-example.](https://github.com/Trapesys/chainbridge-example)

```bash
$ git clone https://github.com/Trapesys/chainbridge-example.git
$ cd chainbridge-example
$ npm i
```

Neue `.env`Datei erstellen und folgende Werte einstellen.

```.env
PRIVATE_KEYS=0x...
MUMBAI_JSONRPC_URL=https://rpc-mumbai.matic.today
EDGE_JSONRPC_URL=http://localhost:10002
```

Als Nächstes wird der ERC20-Vertrag in den beiden Chains bereitgestellt.

```bash
$ npx hardhat deploy --contract erc20 --name <ERC20_TOKEN_NAME> --symbol <ERC20_TOKEN_SYMBOL> --network mumbai
```

```bash
$ npx hardhat deploy --contract erc20 --name <ERC20_TOKEN_NAME> --symbol <ERC20_TOKEN_SYMBOL> --network edge
```

Nach erfolgreicher Bereitstellung erhalten Sie eine Vertragsadresse wie diese:

```bash
ERC20 contract has been deployed
Address: <ERC20_CONTRACT_ADDRESS>
Name: <ERC20_TOKEN_NAME>
Symbol: <ERC20_TOKEN_SYMBOL>
```

## Schritt3: Ressourcen-ID in Bridge registrieren {#step3-register-resource-id-in-bridge}

Eine Ressourcen-ID anmelden, die Ressourcen in einer Cross-Chain-Umgebung zuordnet. In beiden Chains muss dieselbe Ressourcen-ID eingestellt werden.

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

## Schritt4: Ausscheide/Ausgabemodus in der ERC20-Bridge von Edge einstellen {#step4-set-mint-burn-mode-in-erc20-bridge-of-the-edge}

Bridge erwartet, dass es in Polygon Edge im Ausscheide/Ausgabemodus arbeitet. Es wird also der Ausscheide/Ausgabemodus `cb-sol-cli`eingestellt.

```bash
$ cb-sol-cli bridge set-burn \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[ERC20_HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[ERC20_CONTRACT_ADDRESS]"
```

Der ERC20-Handler-Vertrag muss mit einer Ausgabe/Ausscheidefunktion ausgestattet werden.

```bash
$ npx hardhat grant --role mint --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --network edge
$ npx hardhat grant --role burn --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --network edge
```

## Schritt5: Tokenausgabe {#step5-mint-token}

In Mumbai werden neue ERC20-Token ausgegeben.

```bash
$ npx hardhat mint --type erc20 --contract [ERC20_CONTRACT_ADDRESS] --address [ACCOUNT_ADDRESS] --amount 100000000000000000000 --network mumbai # 100 Token
```

Nachdem die Transaktion erfolgreich ist, gibt das Konto den Token aus.

## Schritt6: ERC20-Transfer starten {#step6-start-erc20-transfer}

Vor diesem Schritt vergewissern, dass ein Relayer gestartet wurde. Überprüfen Sie [Setup](/docs/edge/additional-features/chainbridge/setup) für weitere Details.

Während der Token-Übertragung von Mumbai zu Edge, hebt der ERC20-Handler-Vertrag in Mumbai Token von Ihrem Konto ab. Vor der Übertragung freigeben.

```bash
$ npx hardhat approve --type erc20 --contract [ERC20_CONTRACT_ADDRESS] --address [ERC20_HANDLER_CONTRACT_ADDRESS] --amount 10000000000000000000 --network mumbai # 10 Token
```

`cb-sol-cli`Schließlich beginnen Sie den Token-Transfer von Mumbai nach Edge mit

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

Nach erfolgreicher Einzahlung erhält der Relayer das Event und stimmt für den Vorschlag. Er führt eine Transaktion aus, um Token an das Empfängerkonto in der Polygon Edge-Chain zu senden, nachdem die erforderliche Anzahl von Stimmen abgegeben wurde.

```bash
INFO[11-19|08:15:58] Handling fungible deposit event          chain=mumbai dest=100 nonce=1
INFO[11-19|08:15:59] Attempting to resolve message            chain=polygon-edge type=FungibleTransfer src=99 dst=100 nonce=1 rId=000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00
INFO[11-19|08:15:59] Creating erc20 proposal                  chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Watching for finalization event          chain=polygon-edge src=99 nonce=1
INFO[11-19|08:15:59] Submitted proposal vote                  chain=polygon-edge tx=0x67a97849951cdf0480e24a95f59adc65ae75da23d00b4ab22e917a2ad2fa940d src=99 depositNonce=1 gasPrice=1
INFO[11-19|08:16:24] Submitted proposal execution             chain=polygon-edge tx=0x63615a775a55fcb00676a40e3c9025eeefec94d0c32ee14548891b71f8d1aad1 src=99 dst=100 nonce=1 gasPrice=5
```

Sobald die Transaktion erfolgreich durchgeführt wurde, erhalten Sie Token in der Polygon Edge-Chain.

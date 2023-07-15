---
id: troubleshooting
title: Risoluzione dei problemi
description: "Sezione Risoluzione dei problemi per Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - troubleshooting

---

# Risoluzione dei problemi {#troubleshooting}

## `method=eth_call err="invalid signature"` errore {#error}

Quando si utilizza un wallet per effettuare una transazione con Polygon Edge, assicurarsi che nell'impostazione della rete locale del proprio wallet:

1. Il  `chainID`sia quello giusto. L'impostazione predefinita `chainID`per Edge è `100`, ma può essere personalizzata utilizzando il flag genesi`--chain-id` .


````bash
genesis [--chain-id CHAIN_ID]
````
2. Assicurarsi che, nel campo "RPC URL", si utilizzi la porta JSON RPC del nodo a cui ci si connette.


## Come ottenere un URL WebSocket {#how-to-get-a-websocket-url}

Per impostazione predefinita, quando si esegue Polygon Edge, viene esposto un endpoint WebSocket basato sulla posizione della catena. Lo schema URL `wss://`viene utilizzato per i collegamenti HTTPS e `ws://`per HTTP.

URL Localhost WebSocket:
````bash
ws://<JSON-RPC URL>:<PORT>/ws
````
Notare che il numero di porta dipende dalla porta JSON-RPC scelta per il nodo.

URL Edgenet WebSocket:
````bash
wss://rpc-edgenet.polygon.technology/ws
````

## `insufficient funds`errore durante il tentativo di implementazione di un contratto {#error-when-trying-to-deploy-a-contract}

Se si verifica questo errore, assicurarsi di avere fondi sufficienti sull'indirizzo desiderato e che l'indirizzo utilizzato sia quello corretto.<br/> Per impostare il saldo preminato, è possibile utilizzare il flag genesi `genesis [--premine ADDRESS:VALUE]`durante la generazione del file genesi. Esempio di utilizzo di questo flag:
````bash
genesis --premine 0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000
````
Questo premina 1000000000000000000000 WEI su 0x3956E90e632AEbBF34DEB49b71c28A83Bc029862.


## I token ERC20 non vengono rilasciati mentre si usa Chainbridge {#erc20-tokens-not-released-while-using-chainbridge}

Se si tenta di trasferire token ERC20 tra Polygon POS e una rete Edge locale, e i token ERC20 vengono depositati, anche la proposta viene eseguita al relayer, ma i token non vengono rilasciati nella rete Edge, assicurarsi che l'Handler ERC20 nella catena Polygon Edge abbia abbastanza token da <br/>rilasciare. Il contratto Handler nella catena di destinazione deve avere abbastanza token da rilasciare per la modalità lock-release. Se non sono presenti token ERC20 nell'Handler ERC20 della rete Edge locale, si prega di coniare nuovi token e trasferirli all'Handler ERC20.

## `Incorrect fee supplied` errore durante l'utilizzo di Chainbridge {#error-when-using-chainbridge}

È possibile che si verifichi questo errore quando si tenta di trasferire i token ERC20 tra la catena Mumbai Polygon POS e una configurazione Polygon Edge locale. Questo errore compare quando si imposta la commissione al momento della distribuzione utilizzando il `--fee`flag, ma non si imposta lo stesso valore nella transazione di deposito. È possibile utilizzare il comando seguente per modificare la commissione:
````bash
 $ cb-sol-cli admin set-fee --bridge <BRIDGE_ADDRESS> --fee 0 --url <JSON_RPC_URL> --privateKey <PRIVATE_KEY>
 ````
Qui puoi trovare altre informazioni su questa [bandiera](https://github.com/ChainSafe/chainbridge-deploy/blob/main/cb-sol-cli/docs/deploy.md).






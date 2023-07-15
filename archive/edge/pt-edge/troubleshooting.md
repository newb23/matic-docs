---
id: troubleshooting
title: Solução de problemas
description: "Seção de solução de problemas para o Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - troubleshooting

---

# Solução de problemas {#troubleshooting}

## Erro de `method=eth_call err="invalid signature"` {#error}

Quando estiver a usar uma carteira para fazer uma transação com o Polygon Edge, certifique-se de que a configuração da rede local da sua carteira:

1. O  `chainID`é o correto. O `chainID` padrão para borda é `100`, mas pode ser personalizado usando o sinalizador de génese `--chain-id`.

````bash
genesis [--chain-id CHAIN_ID]
````
2. Certifique-se de que, no campo “URL do RPC”, use a porta do RPC JSON do nó ao qual está conectando.


## Como obter um URL de WebSocket {#how-to-get-a-websocket-url}

Por predefinição, quando se executa o Polygon Edge, ele gera um endpoint de WebSocket baseado na localização da chain.
O esquema do URL `wss://` é usado para links HTTPS e o `ws://` para HTTP.

URL Localhost WebSocket:
````bash
ws://<JSON-RPC URL>:<PORT>/ws
````
Note que o número da porta depende da porta JSON-RPC escolhida para o nó.

URL de WebSocket Edgenet:
````bash
wss://rpc-edgenet.polygon.technology/ws
````

## `insufficient funds`Erro ao tentar implantar um contrato {#error-when-trying-to-deploy-a-contract}

Se receber este erro, certifique-se de que tem fundos suficientes no endereço desejado e que o endereço usado seja o correto<br/>.
Para definir o saldo pré-minerado, pode usar o sinalizador de génese `genesis [--premine ADDRESS:VALUE]` ao gerar o ficheiro de génese.
Exemplo de usar este sinalizador:
````bash
genesis --premine 0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000
````
Isso faz pré-mineração de 1000000000000000000000 WEI para 0x3956E90e632AebBF34DEB49b71c28A83Bc029862.


## Tokens ERC-20 não liberados enquanto estiver a usar o Chainbridge {#erc20-tokens-not-released-while-using-chainbridge}

Se tentar transferir os tokens ERC-20 entre o PoS do Polygon e uma rede de borda local, seus tokens ERC-20 forem depositados, e a proposta for executada no relayer, mas os tokens não forem liberados na sua rede de borda, certifique-se de que o handler ERC-20 na chain do Polygon Edge tenha tokens suficientes para liberação. <br/>
O contrato de handler na chain de destino deve ter tokens suficientes para liberação para o modo de bloqueio-liberação. Se não tiver tokens ERC-20 no Handler ERC-20 da sua rede de borda local, cunhe novos tokens e os transfira para o handler ERC-20.

## Erro `Incorrect fee supplied` ao usar o Chainbridge {#error-when-using-chainbridge}

Pode receber este erro ao tentar transferir tokens ERC-20 entre chain de PoS de Polygon de Mumbai e uma configuração do Polygon Edge local. Este erro aparece quando define a taxa na implantação usando o sinalizador `--fee`, mas não defina o mesmo valor na transação de depósito.
Pode usar o comando abaixo para alterar a taxa:
````bash
 $ cb-sol-cli admin set-fee --bridge <BRIDGE_ADDRESS> --fee 0 --url <JSON_RPC_URL> --privateKey <PRIVATE_KEY>
 ````
Pode encontrar mais informações sobre este sinalizador [aqui](https://github.com/ChainSafe/chainbridge-deploy/blob/main/cb-sol-cli/docs/deploy.md).






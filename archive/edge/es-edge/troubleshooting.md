---
id: troubleshooting
title: Solución de problemas
description: "Sección de solución de problemas para Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - troubleshooting

---

# Solución de problemas {#troubleshooting}

## error `method=eth_call err="invalid signature"` {#error}

Cuando utilices una billetera para hacer una transacción con Polygon Edge, cerciórate de lo siguiente en la configuración de red local de tu billetera:

1. `chainID` es el correcto. El `chainID` por defecto para Edge es `100`, pero se puede personalizar mediante el uso de la indicación de génesis `--chain-id`.

````bash
genesis [--chain-id CHAIN_ID]
````
2. Asegúrate de usar el puerto JSON RPC del nodo al que te estás conectando en el campo "RPC URL".


## Cómo obtener un URL de WebSocket {#how-to-get-a-websocket-url}

Por defecto, al ejecutar Polygon Edge, se expone una terminal de WebSocket con base en la ubicación de la cadena.
El esquema de URL `wss://` se utiliza para enlaces de HTTPS y `ws://` para HTTP.

URL de WebSocket del anfitrión local:
````bash
ws://<JSON-RPC URL>:<PORT>/ws
````
Fíjate que el número del puerto depende del puerto RPC JSON elegido para el nodo.

URL de Edgenet WebSocket:
````bash
wss://rpc-edgenet.polygon.technology/ws
````

## Error `insufficient funds` al intentar desplegar un contrato {#error-when-trying-to-deploy-a-contract}

Si te sale este error, asegúrate de tener suficientes fondos en la dirección deseada, y de que la dirección utilizada sea la correcta.<br/> Para establecer el saldo preminado, puedes usar la indicación de génesis `genesis [--premine ADDRESS:VALUE]` al generar el archivo de génesis. Ejemplo del uso de esta indicación:
````bash
genesis --premine 0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000
````
Esto premina 1000000000000000000000 WEI a 0x3956E90e632AEbBF34DEB49b71c28A83Bc029862.


## Los tokens ERC-20 no se liberan mientras se usa Chainbridge (puente entre cadenas) {#erc20-tokens-not-released-while-using-chainbridge}

Si intentas transferir tokens ERC-20 entre PoS de Polygon y una red local de Edge, y se depositan tus tokens ERC-20, también se ejecuta una propuesta en el repetidor, pero los tokens no se liberan en la red de Edge, asegúrate de que el manejador (handler) de ERC-20 en la cadena de Polygon Edge tenga suficientes tokens para liberar. <br/>
El contrato del manejador (handler) en la cadena de destino debe tener suficientes tokens para liberar el modo de liberación del bloqueo. Si no tienes ningún token ERC20 en el manejador de ERC20 de tu red local de Edge, acuña nuevos tokens y transfiérelos al manejador de ERC20.

## Error `Incorrect fee supplied` al usar Chainbridge (puente entre cadenas) {#error-when-using-chainbridge}

Es posible que se presente este error cuando intentes transferir tokens ERC20 entre la cadena PoS de Mumbai de Polygon y una configuración local de Polygon Edge. Este error aparece cuando se establece la tarifa del despliegue con la indicación `--fee`, pero no se establece el mismo valor en la transacción del depósito.
Puedes usar el siguiente comando para cambiar la tarifa:
````bash
 $ cb-sol-cli admin set-fee --bridge <BRIDGE_ADDRESS> --fee 0 --url <JSON_RPC_URL> --privateKey <PRIVATE_KEY>
 ````
Aquí puedes encontrar más información sobre esta [bandera](https://github.com/ChainSafe/chainbridge-deploy/blob/main/cb-sol-cli/docs/deploy.md).






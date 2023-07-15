---
id: tokens
title: Preguntas frecuentes sobre los tokens
description: "Preguntas frecuentes sobre los tokens de Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - FAQ
  - tokens
---

## ¿Polygon Edge es compatible con EIP-1559? {#does-polygon-edge-support-eip-1559}
Por el momento, Polygon Edge no es compatible con EIP-1559.

## ¿Cómo configurar el símbolo de la moneda (token)? {#how-to-set-the-currency-token-symbol}

El símbolo del token es solo un elemento de la interfaz de usuario, de modo que no se puede configurar ni escribir directamente en ningún lugar de la red.
Sin embargo, puedes cambiarlo cuando añades la red a una billetera, como Metamask, por ejemplo.

## ¿Qué sucede con las transacciones cuando una cadena se detiene? {#what-happens-to-transactions-when-a-chain-halts}

Todas las transacciones que no se han procesado se encuentran dentro de la cola (enqueued o promovido). Si la cadena se detiene (toda la producción de bloques se detiene), estas transacciones nunca entrarán en bloques.<br/> Este no es solo el caso cuando la cadena se detiene. Si los nodos se detienen o se reinician, todas las transacciones que no se han ejecutado y todavía están en TxPool, se eliminarán en silencio.<br/> Lo mismo sucederá con las transacciones cuando se introduzca un cambio de ruptura, ya que es necesario para que los nodos se reinicien.

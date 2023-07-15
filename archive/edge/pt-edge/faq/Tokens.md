---
id: tokens
title: Perguntas frequentes sobre tokens
description: "Perguntas frequentes sobre os tokens do Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - FAQ
  - tokens
---

## O Polygon Edge é compatível com o EIP-1559? {#does-polygon-edge-support-eip-1559}
No momento, o Polygon Edge não é compatível com o EIP-1559.

## Como definir o símbolo de moeda (token)? {#how-to-set-the-currency-token-symbol}

O símbolo de token é apenas para uso na interface, por isso não pode ser configurado ou codificado em outra parte da rede.
Mas é possível alterá-lo quando adicionar a rede a uma carteira como MetaMask, por exemplo.

## O que acontece com transações quando uma chain é interrompida? {#what-happens-to-transactions-when-a-chain-halts}

Todas as transações que não foram processadas estão dentro do TxPool (fila enfileirada ou promovida). Se a chain for interrompida (todas as paradas de produção de blocos), estas transações nunca serão inseridas em blocos.<br/> Este não é apenas o caso quando a chain é interrompida. Se os nós forem interrompidos ou reiniciados, todas as transações que não foram executadas e ainda estiverem no TxPool, serão removidas silenciosamente.<br/> A mesma coisa acontecerá com transações quando uma alteração de quebra for introduzida, pois é necessário que os nós sejam reiniciados.

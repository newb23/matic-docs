---
id: tokens
title: Domande frequenti sui token
description: "Domande frequenti sui token di Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - FAQ
  - tokens
---

## Polygon Edge supporta EIP-1559? {#does-polygon-edge-support-eip-1559}
Al momento, Polygon Edge non supporta EIP-1559.

## Come impostare il simbolo della valuta (token)? {#how-to-set-the-currency-token-symbol}

Il simbolo del token è solo un elemento dell'interfaccia utente, quindi non può essere configurato o codificato in modo fisso in nessuna parte della rete.
Puoi comunque cambiarlo quando aggiungi la rete al wallet, come Metamask, ad esempio.

## Cosa succede alle transazioni quando una catena si arresta? {#what-happens-to-transactions-when-a-chain-halts}

Tutte le transazioni che non sono state elaborate sono all'interno della TxPool (incise o promosse coda). Se la catena si arresta (tutte le blocco di produzione), queste transazioni non saranno mai in blocco.<br/> Questo non è solo il caso in cui la catena si arresta. Se i nodi vengono arrestati o riavviati, tutte le transazioni che non sono state eseguite e che sono ancora in TxPool, verranno silenziosamente rimosse.<br/> La stessa cosa accadrà alle transazioni quando viene introdotta una modifica di rottura, in quanto è necessario che i nodi vengano riavviati.

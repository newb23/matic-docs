---
id: gas
title: Domande frequenti sul gas
description: "Domande frequenti sul gas per Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - FAQ
  - validators

---

## Come applicare un prezzo del gas minimo? {#how-to-enforce-a-minimum-gas-price}
Puoi utilizzare il `--price-limit`flag  fornito sul comando del server. In questo modo il nodo accetterà solo le transazioni che hanno un prezzo del gas superiore o uguale al limite impostato. Per essere certi che sia applicato all'intera rete, è necessario assicurarsi che tutti i nodi abbiano lo stesso limite di prezzo.


## È possibile effettuare transazioni con commissioni del gas pari a 0? {#can-you-have-transactions-with-0-gas-fees}
Sì, è possibile. Il limite di prezzo predefinito che i nodi applicano è `0`, ovvero i nodi accetteranno transazioni con un prezzo del gas impostato su `0`.

## Come impostare l'offerta totale del token gas(nativo)? {#how-to-set-the-gas-native-token-total-supply}

È possibile impostare un saldo preminato sugli account (indirizzi) utilizzando il `--premine flag`. Si prega di notare che questa è una configurazione del file genesis e non può essere modificata in seguito.

Esempio su come utilizzare `--premine flag`:

`--premine=0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000`

Questo imposta un saldo preminato di 1000 ETH a 0x3956E90e632AEbBF34DEB49b71c28A83Bc029862 (l'importo dell'argomento è in wei).

L'importo preminato del token gas sarà l'offerta totale. Nessun'altra quantità della valuta nativa (token gas) può essere coniata in seguito.

## Edge supporta ERC-20 come token gas? {#does-edge-support-erc-20-as-a-gas-token}

Edge non supporta il token ERC-20 come token gas. Per il gas è supportata solo la valuta nativa di Edge.

## Come aumentare il limite di gas? {#how-to-increase-the-gas-limit}

Ci sono due opzioni per aumentare il limite di gas in Polygon Edge:
1. Wiping la catena e aumentando `block-gas-limit`al massimo valore uint64 nel file genesis
2. Usa la `--block-gas-target`bandiera con un alto valore per aumentare il limite di gas di tutti i nodi. Questo richiede il reboot nodo. Spiegazione dettagliata [qui](/docs/edge/architecture/modules/txpool/#block-gas-target).
---
id: permission-contract-deployment
title: Autorizzazione all'implementazione di smart contract
description: Come aggiungere l'implementazione di smart contract di autorizzazione.
keywords:
  - docs
  - polygon
  - edge
  - smart contract
  - permission
  - deployment
---

## Panoramica {#overview}

Questa guida affronta nel dettaglio il modo in cui gli indirizzi whitelist possono implementare gli smart contract. A volte gli operatori della rete desiderano impedire agli utenti l'implementazione di smart contract non inerenti allo scopo della rete. Gli operatori della rete possono:

1. Indirizzi Whitelist per l'implementazione di smart contract
2. Rimuovere gli indirizzi dalla whitelist per l'implementazione di smart contract

## Presentazione video {#video-presentation}

[![concessione del contratto - video](https://img.youtube.com/vi/yPOkINpf7hg/0.jpg)](https://www.youtube.com/watch?v=yPOkINpf7hg)

## Come usarla? {#how-to-use-it}


Puoi trovare tutti i comandi cli relativi alla lista di implementazione nella pagina dei [comandi CLI](/docs/edge/get-started/cli-commands#whitelist-commands) .

* `whitelist show`: Visualizza informazioni sulla whitelist
* `whitelist deployment --add`:  Aggiunge un nuovo indirizzo alla whitelist di implementazione del contratto
* `whitelist deployment --remove`:  Rimuove un nuovo indirizzo dalla whitelist di implementazione del contratto

#### Mostra tutti gli indirizzi nella whitelist di implementazione {#show-all-addresses-in-the-deployment-whitelist}

Ci sono 2 modi per trovare gli indirizzi dalla whitelist di implementazione.
1. Guardare `genesis.json` dove sono salvate le whitelist
2. Eseguire `whitelist show`, che stampa tutte le whitelist supportate da Polygon Edge

```bash

./polygon-edge whitelist show

[WHITELISTS]

Contract deployment whitelist : [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d],


```

#### Aggiungi un indirizzo alla whitelist di implementazione {#add-an-address-to-the-deployment-whitelist}

Per aggiungere un nuovo indirizzo alla whitelist di implementazione, esegui il comando CLI `whitelist deployment --add [ADDRESS]`. Non c'è limite al numero di indirizzi presenti nella whitelist. Solo gli indirizzi che esistono nella whitelist di implementazione del contratto possono implementare i contratti. Se la whitelist è vuota, qualsiasi indirizzo può eseguire l'implementazione

```bash

./polygon-edge whitelist deployment --add 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d --add 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF


[CONTRACT DEPLOYMENT WHITELIST]

Added addresses: [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],
Contract deployment whitelist : [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],



```

#### Rimuovere un indirizzo dalla whitelist di implementazione {#remove-an-address-from-the-deployment-whitelist}

Per rimuovere un indirizzo dalla whitelist di implementazione, esegui il comando CLI `whitelist deployment --remove [ADDRESS]`. Solo gli indirizzi che esistono nella whitelist di implementazione del contratto possono implementare i contratti. Se la whitelist è vuota, qualsiasi indirizzo può eseguire l'implementazione

```bash

./polygon-edge whitelist deployment --remove 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d --remove 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF


[CONTRACT DEPLOYMENT WHITELIST]

Removed addresses: [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],
Contract deployment whitelist : [],



```

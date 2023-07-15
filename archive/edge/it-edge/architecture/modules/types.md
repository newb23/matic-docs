---
id: types
title: Types
description: Spiegazione del modulo Types di Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - types
  - marshaling
---

## Panoramica {#overview}

Il modulo ****Types implementa tipi di oggetti fondamentali, come:

* **Indirizzo**
* **Hash**
* **Header**
* molte funzioni di aiuto

## Codifica/decodifica RLP {#rlp-encoding-decoding}

A differenza di client come GETH, Polygon Edge non utilizza la riflessione per la <br />codifica. La preferenza è stata quella di non utilizzare la riflessione, perché introduce nuovi problemi, come la degradazione delle prestazioni e una scalabilità più difficile.


Il modulo ****Types fornisce un'interfaccia facile da usare per il marshaling e l'unmarshalling di RLP,  utilizzando il pacchetto FastRLP.

Il marshaling è eseguito attraverso i metodi *MarshalRLPWith* e *MarshalRLPTo*. Gli stessi metodi esistono per l'unmarshalling.

Definendo manualmente questi metodi, non è necessario che Polygon Edge utilizzi la riflessione. In *rlp_marshal.go* puoi trovare metodi per il marshaling:

* **Corpi**
* **Blocchi**
* **Header**
* **Ricevute**
* **Registri**
* **Transazioni**
---
id: manage-private-keys
title: Gestisci le chiavi private
description: "Come gestire le chiavi private e quali tipi di chiavi ci sono."
keywords:
  - docs
  - polygon
  - edge
  - private
  - key
  - keystore
---

## Panoramica {#overview}

Polygon Edge ha due tipi di chiavi private che gestisce direttamente:

* **Chiave privata utilizzata per il meccanismo di consensus**
* **Chiave privata utilizzata per il networking da libp2p**
* **(Facoltativo) Chiave privata BLS utilizzata per il meccanismo di consensus per aggregare le firme dei validatori**

Attualmente, Polygon Edge non offre il supporto per la gestione diretta dell'account.

Basato sulla struttura delle directory delineata nella [guida Backup e ripristino](/docs/edge/working-with-node/backup-restore),
Polygon Edge memorizza i file chiave menzionati in due directory distinte - **consensus** e **keystore**.

## Formato della chiave {#key-format}

Le chiavi private sono memorizzate in un semplice **formato Base64**, in modo che possano essere leggibili dall'uomo e portabili.

```bash
# Example private key
0802122068a1bdb1c8af5333e58fe586bc0e9fc7aff882da82affb678aef5d9a2b9100c0
```

:::info Tipo di chiave

Tutti i file di chiavi private generati e utilizzati all'interno di Polygon Edge si basano su ECDSA con la curva [secp256k1](https://en.bitcoin.it/wiki/Secp256k1).

Poiché la curva non è standard, non può essere codificata e memorizzata in alcun formato PEM standardizzato. L'importazione di chiavi che non sono conformi a questo tipo di chiave non è supportata.
:::
## Chiave privata di consensus {#consensus-private-key}

Il file della chiave privata menzionato come *chiave privata di consensus* viene anche chiamato **chiave privata del validatore**. Questa chiave privata viene utilizzata quando il nodo agisce come validatore della rete e deve firmare nuovi dati.

Il file di chiave privata è situato in `consensus/validator.key`, e aderisce al [formato chiave](/docs/edge/configuration/manage-private-keys#key-format) menzionato.

:::warning
La chiave privata del validatore è univoca per ogni nodo validatore. La stessa chiave <b>non</b> deve essere condivisa in tutti i validatori, in quanto ciò può compromettere la sicurezza della tua catena.

:::

## Chiave privata di rete {#networking-private-key}

Il file della chiave privata menzionato per il networking viene utilizzato da libp2p per generare il PeerID corrispondente e consentire al nodo di partecipare alla rete.

Si trova in `keystore/libp2p.key`, e aderisce al [formato chiave](/docs/edge/configuration/manage-private-keys#key-format) menzionato.

## Chiave segreta BLS {#bls-secret-key}

Il file chiave segreta BLS viene utilizzato per aggregare i sigilli impegnati nel layer di consensus. La dimensione dei sigilli impegnati aggregati da BLS è inferiore alle firme ECDSA impegnate serializzate.

La funzionalità BLS è facoltativa e si può scegliere se utilizzare o meno BLS. Consultare [BLS](/docs/edge/consensus/bls) per ulteriori dettagli.

## Importazione / Esportazione {#import-export}

Poiché i file chiave vengono memorizzati in un semplice Base64 sul disco, può esserne facilmente eseguito il backup o l'importazione.

:::caution Modificare i file chiave
Qualsiasi modifica effettuata ai file chiave su una rete già impostata/in esecuzione può portare a gravi interruzioni di rete/consensus.
poiché i meccanismi di consensus e peer discovery archiviano i dati derivati da queste chiavi nella memoria specifica del nodo e fanno affidamento su questi dati
per avviare connessioni ed eseguire la logica del consensus

:::
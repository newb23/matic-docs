---
id: overview
title: Polygon Edge
sidebar_label: What is Edge
description: "Un'introduzione a Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - network
  - modular

---

Polygon Edge è un framework modulare ed estensibile per costruire reti blockchain, sidechain e soluzioni di scalabilità generali compatibili con Ethereum.

Il suo utilizzo primario è quello di avviare una nuova rete blockchain fornendo al contempo la piena compatibilità con contratti e transazioni intelligenti di Ethereum. Utilizza il meccanismo di consensus IBFT (Istanbul Byzantine Fault Tolerant), supportato in due versioni come [PoA (proof of authority)](/docs/edge/consensus/poa) e [PoS (proof of stake)](/docs/edge/consensus/pos-stake-unstake).

Polygon Edge supporta anche la comunicazione con reti blockchain multiple, consentendo trasferimenti di token [ERC-20](https://ethereum.org/en/developers/docs/standards/tokens/erc-20) e [ERC-721](https://ethereum.org/en/developers/docs/standards/tokens/erc-721) utilizzando la [soluzione bridge centralizzata](/docs/edge/additional-features/chainbridge/overview).

I portafogli standard di settore possono essere utilizzati per interagire con Polygon Edge attraverso di endpoint [JSON-RPC](/docs/edge/working-with-node/query-json-rpc) e gli operatori dei nodi possono eseguire varie azioni sui nodi tramite il protocollo [gRPC](/docs/edge/working-with-node/query-operator-info).

Per saperne di più su Polygon, visita il [sito ufficiale](https://polygon.technology).

**[Repository di GitHub](https://github.com/0xPolygon/polygon-edge)**

:::caution

Questo è un lavoro in corso, quindi in futuro potrebbero verificarsi modifiche architettoniche. Il codice non è stato ancora verificato, quindi ti preghiamo di contattare il team Polygon se vuoi usarlo in produzione.

:::



Per iniziare eseguendo una rete `polygon-edge` localmente, leggi: [Installazione](/docs/edge/get-started/installation) e [Impostazioni locali](/docs/edge/get-started/set-up-ibft-locally).

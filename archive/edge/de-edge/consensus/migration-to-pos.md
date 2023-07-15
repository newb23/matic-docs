---
id: migration-to-pos
title: Migration von PoA zu PoS
description: "Wie du aus PoA in den PoS IBFT Modus migrierst und umgekehrt."
keywords:
  - docs
  - polygon
  - edge
  - migrate
  - PoA
  - PoS
---

## Übersicht {#overview}

Dieser Abschnitt führt dich durch die Migration von PoA zu PoS IBFT Modi und umgekehrt für einen laufenden Cluster - ohne dass die Blockchain zurückgesetzt werden muss.

## Wie man auf PoS migriert {#how-to-migrate-to-pos}

Du musst alle Knoten beenden, fork in genesis.json durch `ibft switch`Befehl hinzufügen und die Knoten neu starten.

````bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --deployment 100 --from 200
````
:::caution Switching während der Verwendung von ECDSA
Wenn du ECDSA verwendest, muss die `--ibft-validator-type`Flagge dem Switch hinzugefügt werden, und zwar in der Erwähnung dass ECDSA verwendet wird. Wenn nicht enthalten ist, wird Edge automatisch zu BLS wechseln.

````bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --ibft-validator-type ecdsa --deployment 100 --from 200
````
:::Um auf PoS zu wechseln, musst du 2 Blockhöhen angeben: `deployment`und . `from`ist `deployment`die Höhe, um den staking bereitzustellen, und `from`die Höhe des Anfangs von PoS. `0x0000000000000000000000000000000000001001``deployment`Der staking wird an der Adresse  in der , wie im Fall eines vorbereiteten Vertrags bereitgestellt.

Bitte beziehe dich auf [Proof of Stake](/docs/edge/consensus/pos-concepts) für weitere Informationen über den Staking Vertrag.

:::warning Validatoren müssen manuell einsetzen
Jeder Prüfer muss nach dem Einsatz von Vertrag `deployment`bei und vor `from`, um zu Beginn von PoS ein Prüfer zu sein. Jeder Prüfer aktualisiert einen eigenen Prüfer, der von dem Satz im staking zu Beginn von PoS festgelegt wird.

Um mehr über Staking zu erfahren, besuche das **[Setup und verwende Proof of Stake](/docs/edge/consensus/pos-stake-unstake)**.
:::

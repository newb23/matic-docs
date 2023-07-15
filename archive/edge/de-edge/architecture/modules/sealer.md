---
id: sealer
title: Sealer
description: Erläuterung für das Sealermodul von Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - sealer
  - sealing
---

## Übersicht {#overview}

Der **Sealer** ist eine Einheit, die die Transaktionen sammelt und einen neuen Block erstellt.<br />
Dann wird dieser Block an das **Consensus** Modul gesendet, um ihn zu versiegeln.

Die endgültige Sealing-Logik befindet sich im **Consensus** Modul.

## Ausführen der Methode {#run-method}

````go title="sealer/sealer.go"
func (s *Sealer) run(ctx context.Context) {
	sub := s.blockchain.SubscribeEvents()
	eventCh := sub.GetEventCh()

	for {
		if s.config.DevMode {
			// In dev-mode we wait for new transactions to seal blocks
			select {
			case <-s.wakeCh:
			case <-ctx.Done():
				return
			}
		}

		// start sealing
		subCtx, cancel := context.WithCancel(ctx)
		done := s.sealAsync(subCtx)

		// wait for the sealing to be done
		select {
		case <-done:
			// the sealing process has finished
		case <-ctx.Done():
			// the sealing routine has been canceled
		case <-eventCh:
			// there is a new head, reset sealer
		}

		// cancel the sealing process context
		cancel()

		if ctx.Err() != nil {
			return
		}
	}
}
````

:::caution Laufende Arbeiten
Der **Sealer** und die **Consensus** Module werden in naher Zukunft zu einer einzigen Einheit zusammengeführt.

Das neue Modul enthält modulare Logik für verschiedene Arten von Konsensmechanismen, die unterschiedliche Sealingmaßnahmen erfordern:
* **PoS** (Proof of Stake)
* **PoA** (Proof of Authority)

Derzeit arbeiten die **Sealer** und die **Consensus** Module mit PoW (Proof of Work).
:::
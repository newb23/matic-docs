---
id: sealer
title: Sealer
description: Spiegazione del modulo Sealer di Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - sealer
  - sealing
---

## Panoramica {#overview}

Il **Sealer** è un'entità che raccoglie le transazioni e crea un blocco <br />nuovo. Poi, il blocco viene inviato al modulo **Consensus** perché venga sigillato.

La logica di sigillatura finale si trova all'interno del modulo **Consensus**.

## Metodo di esecuzione {#run-method}

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

:::caution Lavoro in corso
I moduli **Sealer** e **Consensus** saranno riuniti in un'unica entità nel prossimo futuro.

Il nuovo modulo incorporerà una logica modulare per diversi tipi di meccanismi di consenso, che richiedono diverse implementazioni di sigillatura:
* **PoS** (Proof of Stake)
* **PoA** (Proof of Authority)

Attualmente, i moduli **Sealer** e **Consensus** funzionano con PoW (Proof of Work).
:::
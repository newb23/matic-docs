---
id: sealer
title: Sealer
description: Paliwanag para sa sealer module ng Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - sealer
  - sealing
---

## Pangkalahatang-ideya {#overview}

Ang **Sealer** ay isang entidad na nag-iipon ng mga transaksyon, at lumilikha ito ng bagong block.<br />
Pagkatapos, ang block na iyon ay ipinapadala sa **Consensus** module para i-seal ito.

Ang huling logic ng pag-seal ay matatagpuan sa **Consensus** module.

## Paraang Run {#run-method}

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

:::caution Ginagawa pa

Malapit nang pagsamahin sa iisang entidad ang **Sealer** module at ang **Consensus** module.

Ang bagong module ay magsasama ng modular logic para sa iba't ibang uri ng mekanismo ng consensus, na nangangailangan ng iba't ibang implementasyon ng pag-seal:
* **PoS** (Proof of Stake)
* **PoA** (Proof of Authority)

Sa kasalukuyan, gumagana sa PoW (Proof of Work) ang **Sealer** module at ang **Consensus** module.

:::
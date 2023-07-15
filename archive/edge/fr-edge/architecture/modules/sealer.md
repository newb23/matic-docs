---
id: sealer
title: Scellant
description: Explication pour le module Scellant de Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - sealer
  - sealing
---

## Aperçu {#overview}

Le **Scellant** est une entité qui rassemble les transactions et crée un nouveau bloc.<br /> Ensuite, bloc est envoyé au module **de consensus** pour le sceller.

La logique de scellage finale est située dans le module **de consensus**.

## Exécutez la Méthode  {#run-method}

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

:::caution Travail en cours
Les **modules**et les **consensus** Scellants seront regroupés en une seule entité dans un futur proche.

Le nouveau module intégrera une logique modulaire pour différents types de mécanismes de consensus, qui nécessitent différentes implémentations de scellage :
* **PoS** (Preuve d'Enjeu)
* **PoA** (Preuve d'Autorité)

Actuellement, le **Scellant** et le **Consensus **fonctionnent avec PoW (Preuve de Travail).
:::
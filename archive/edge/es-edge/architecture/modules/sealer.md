---
id: sealer
title: Sealer
description: Explicación del módulo Sealer de Polygon Edge
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - sealer
  - sealing
---

## Descripción general {#overview}

**Sealer** es una entidad que reúne transacciones y crea un bloque nuevo.<br />
Luego, el bloque se envía al módulo **Consensus** para sellarlo.

La lógica final de sellado está ubicada dentro del módulo **Consensus**.

## Ejecutar método {#run-method}

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

:::caution En progreso

Los módulos **Sealer** y **Consensus** se combinarán en una sola entidad en un futuro cercano.

El nuevo módulo incorporará lógica modular para distintos tipos de mecanismos de consenso que requieren diferentes implementaciones de sellado:
* Prueba de participación (**PoS**)
* Prueba de autoridad (**PoA**)

Actualmente, los módulos **Sealer** y **Consensus** trabajan con la prueba de trabajo (PoW).
:::
---
id: sealer
title: Selar
description: Explicação do módulo Sealer do Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - sealer
  - sealing
---

## Visão geral {#overview}

O **Sealer** é uma entidade que reúne as transações e cria um novo bloco.<br />
Em seguida, esse bloco é enviado para o módulo **Consenso** para ser selado.

A lógica final do Sealer está localizada no módulo **Consenso**.

## Método de execução {#run-method}

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

:::caution Trabalho em andamento

Num futuro próximo, os módulos **Sealer** e **Consenso** serão combinados numa única entidade.

O novo módulo irá incorporar uma lógica modular para diferentes tipos de mecanismos de consenso que exigem diferentes implantações de selagem:
* **PoS** (Proof of Stake)
* **PoA** (Proof of Authority)

Atualmente, os módulos **Sealer** e **Consenso** trabalham com a PoW (Proof of Work).

:::
---
id: sealer
title: Sealer
description: Объяснение к модулю Sealer в Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - sealer
  - sealing
---

## Обзор {#overview}

Модуль **Sealer** — это сущность, которая собирает транзакции и создает новый блок.<br />
Затем этот блок отправляется в **Consensus** для запечатывания.

Заключительная логика запечатывания находится в модуле **Consensus**.

## Запустить метод {#run-method}

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

:::caution Выполняется работа

Модули **Sealer** и **Consensus** в будущем будут объединены в единую сущность.

Новый модуль будет содержать модульную логику для разных механизмов консенсуса, требующих разные варианты реализации запечатывания:
* **PoS** (доказательство стейка)
* **PoA** (доказательство полномочий)

В настоящее время модули **Sealer** и **Consensus** работают с PoW (доказательство работы).

:::
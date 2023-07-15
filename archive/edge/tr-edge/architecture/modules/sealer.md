---
id: sealer
title: Mühürleyici
description: Polygon Edge'in mühürleyici modülüne ilişkin açıklama.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - sealer
  - sealing
---

## Genel Bakış {#overview}

**Mühürleyici** (Sealer) işlemleri bir araya getiren ve yeni bir blok oluşturan bir varlıktır.<br />
Ardından, bu blok mühürlenmesi için **Konsensüs** modülüne gönderilir.

Son mühür mantığı **Konsensüs** modülünde bulunur.

## Çalıştırma Yöntemi {#run-method}

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

:::caution Devam eden çalışma

**Mühürleyici** ve **Konsensüs** modülleri yakın gelecekte tek bir varlık içinde birleştirilecektir.

Yeni modül, farklı mühürleme uygulamaları gerektiren farklı konsensüs mekanizmaları için modüler mantık içerecektir:
* **PoS** (Hisse Kanıtı)
* **PoA** (Yetki Kanıtı)

Şu anda, **Mühürleyici** ve **Konsensüs** modülleri PoW (İş Kanıtı) ile çalışmaktadır.

:::
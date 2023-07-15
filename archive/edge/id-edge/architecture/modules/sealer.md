---
id: sealer
title: Sealer
description: Penjelasan modul sealer di Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - sealer
  - sealing
---

## Ikhtisar {#overview}

**Sealer** adalah entitas yang mengumpulkan transaksi dan menciptakan blok baru.<br />
Kemudian, blok itu dikirim ke modul **Konsensus** untuk menyegelnya.

Logika penyegelan akhir terletak di dalam modul **Konsensus**.

## Jalankan Metode {#run-method}

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

:::caution Sedang dikerjakan

Modul **Sealer** dan **Consensus** akan digabungkan menjadi satu entitas dalam waktu dekat.

Modul baru akan menggabungkan logika modular untuk berbagai jenis mekanisme konsensus yang membutuhkan implementasi penyegelan berbeda:
* **PoS** (Proof of Stake)
* **PoA** (Proof of Authority)

Saat ini, modul **Sealer** dan **Consensus** berfungsi dengan PoW (Proof of Work).

:::
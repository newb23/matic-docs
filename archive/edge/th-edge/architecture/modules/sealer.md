---
id: sealer
title: Sealer
description: คำอธิบายเกี่ยวกับโมดูล sealer ของ Polygon Edge
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - sealer
  - sealing
---

## ภาพรวม {#overview}

**Sealer** เป็นเอนทิตีที่รวบรวมธุรกรรม และสร้างบล็อกใหม่<br />จากนั้น จะส่งบล็อกดังกล่าวไปยังโมดูล **Consensus** เพื่อทำการซีล

ลอจิกการซีลขั้นสุดท้ายอยู่ในโมดูล **Consensus**

## เรียกใช้งานเมธอด {#run-method}

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

:::caution งานที่ดำเนินการอยู่
โมดูล **Sealer** และ **Consensus** จะได้รับการรวมเข้าเป็นเอนทิตีเดียวในอนาคตอันใกล้นี้

โมดูลใหม่จะรวมลอจิกแบบโมดูลาร์ไว้สำหรับกลไกฉันทามติประเภทต่างๆ ซึ่งต้องมีการนำการซีลต่างๆ ไปใช้:
* **PoS** (Proof of Stake)
* **PoA** (Proof of Authority)

ปัจจุบัน โมดูล **Sealer** และ **Consensus** ใช้งานได้กับ PoW (Proof of Work)
:::
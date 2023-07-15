---
id: sealer
title: 봉인
description: Polygon 엣지의 봉인 모듈에 대한 설명.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - sealer
  - sealing
---

## 개요 {#overview}

**봉인**은 트랜잭션을 수집하고 새로운 블럭을 생성하는 항목입니다.<br />
그런 다음 해당 블록을 **합의** 모듈로 보내 봉인합니다.

최종 봉인 논리는 **합의** 모듈에서 확인할 수 있습니다.

## 실행 메서드 {#run-method}

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

:::caution 진행 중인 작업

**봉인** 및 **합의** 모듈은 조만간 단일 항목으로 결합될 것입니다.

새로운 모듈에서는 서로 다른 봉인 구현을 요구하는 다양한 종류의 합의 메커니즘의 모듈 논리가 통합될 것입니다.
* **PoS**(지분증명)
* **PoA**(권위증명)

현재 **봉인** 및 **합의** 모듈은 PoW(작업증명)를 통해 작동합니다.

:::
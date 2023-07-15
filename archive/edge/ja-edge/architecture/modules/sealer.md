---
id: sealer
title: シーラー
description: Polygon Edgeのシーラーモジュールの説明です。
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - sealer
  - sealing
---

## 概要 {#overview}

**シーラー**はトランザクションを収集し、新しいブロックを作成するエンティティです。<br />
その後、そのブロックは**コンセンサス**モジュールに送信され、封印されます。

最終的なシーリングロジックは**コンセンサス**モジュール内に配置されます。

## 実行メソッド {#run-method}

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

:::caution 進行中の作業

**シーラー**と**コンセンサス**モジュールは近い将来シングルエンティティに統合されます。

新しいモジュールは、異なる種類のコンセンサスメカニズムのモジュラーロジックを組み込みますが、これは異なるシーリング実装を必要とします：
* **PoS**（ステーク・オブ・ステーク）
* **PoA**（プルーフ・オブ・オーソリティ）

現在、**シーラー**と**コンセンサス**モジュールはPoW（プルーフ・オブ・ワーク）と連携しています。
:::
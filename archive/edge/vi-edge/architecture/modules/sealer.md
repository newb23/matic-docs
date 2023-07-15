---
id: sealer
title: Sealer
description: Giải thích cho mô-đun niêm phong của Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - sealer
  - sealing
---

## Tổng quan {#overview}

**Sealer** là một thực thể thu thập các giao dịch và tạo ra một khối mới.<br /> Rồi khối đó được gửi đến mô-đun **Consensus** để niêm phong.

Logic niêm phong cuối cùng nằm trong mô-đun **Consensus**.

## Phương pháp chạy {#run-method}

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

:::caution Đang thực hiện

Mô-đun **Sealer** và **Consensus** sẽ được kết hợp thành một thực thể duy nhất trong tương lai gần.

Mô-đun mới sẽ kết hợp logic mô-đun dành cho các loại cơ chế đồng thuận khác nhau, đòi hỏi các quy trình triển khai niêm phong khác nhau:
* **PoS** (Bằng chứng cổ phần)
* **PoA** (Bằng chứng quyền hạn)

Hiện tại, các mô-đun **Sealer** và **Consensus** hoạt động với PoW (Bằng chứng công việc).
:::
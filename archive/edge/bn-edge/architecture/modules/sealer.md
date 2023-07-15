---
id: sealer
title: সিলার
description: Polygon Edge-এর সিলার মডিউলটির ব্যাখ্যা।
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - sealer
  - sealing
---

## সংক্ষিপ্ত বিবরণ {#overview}

**Sealer** একটি এন্টিটি যা লেনদেনসমূহ সংগ্রহ করে এবং একটি নতুন ব্লক তৈরি করে।<br />
তারপর, সেই ব্লকটি সিল করা জন্য **কনসেনসাস** মডিউলে পাঠানো হয়।

চূড়ান্ত সিলিং লজিকটি **কনসেনসাস** মডিউলে অবস্থিত।

## প্রক্রিয়া রান করুন {#run-method}

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

:::caution কাজ চলছে

**সিলার** এবং **কনসেনসাস** মডিউলগুলো অদূর ভবিষ্যতে একত্রিত করে একটি একক এনটিটিতে পরিণত করা হতে পারে।

নতুন মডিউলটি বিভিন্ন ধরণের কনসেনসাস মেকানিজমের জন্য মডুলার লজিককে অন্তর্ভুক্ত করবে, যার জন্য বিভিন্ন ধরনের সিলিং ইমপ্লিমেন্টেশন প্রয়োজন:
* **PoS** (প্রুফ অফ স্টেক)
* **PoA** (প্রুফ অব অথোরিটি)

বর্তমানে, **সিলার** এবং **কনসেনসাস** মডিউলগুলো PoW (প্রুফ অফ ওয়ার্ক) দিয়েও কাজ করে।

:::
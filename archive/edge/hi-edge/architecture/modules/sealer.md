---
id: sealer
title: सीलर
description: पॉलीगॉन एज के सीलर मॉड्यूल के लिए स्पष्टीकरण.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - sealer
  - sealing
---

## ओवरव्यू {#overview}

**सीलर** एक इकाई है जो लेनदेन को इकट्ठा करती है और एक नया ब्लॉक बनाती है.<br /> फिर, उस ब्लॉक को सील करने के लिए **सहमति** मॉड्यूल में भेजा जाता है.

अंतिम सीलिंग तर्क आम **सहमति** मॉड्यूल के भीतर स्थित है.

## रन तरीका {#run-method}

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

:::caution कार्य प्रगति पर है

**सीलर**और आम**सहमति** मॉड्यूल निकट भविष्य में एक इकाई में संयुक्त हो जाएंगे.

नया मॉड्यूल विभिन्न प्रकार सहमति तंत्र के लिए मॉड्यूलर लॉजिक मॉडुलर लॉजिक शामिल करेगा, जिसमें विभिन्न सीलिंग इम्प्लीमेंट की ज़रूरत होती है:
* **पॉस** (भागीदारी का सबूत)
* **PoA** (प्रूफ अथॉरिटी)

वर्तमान में, **सीलर** और **सहमति**मॉड्यूल पीओडब्ल्यू (प्रूफ ऑफ वर्क) के साथ काम करते हैं.
:::
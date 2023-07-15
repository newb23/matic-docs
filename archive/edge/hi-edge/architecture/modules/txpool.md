---
id: txpool
title: TxPool
description: पॉलीगॉन एज के TxPool मॉड्यूल के लिए स्पष्टीकरण.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - TxPool
  - transaction
  - pool
---

## ओवरव्यू {#overview}

TxPool मॉड्यूल ट्रांज़ैक्शन पूल लागू करने का प्रतिनिधित्व करता है, जहाँ सिस्टम के विभिन्न भागों से ट्रांज़ैक्शन
जोड़े जाते हैं. यह मॉड्यूल नोड ऑपरेटर्स के लिए कई उपयोगी सुविधाओं को भी सार्वजनिक करता है, जो नीचे दी गई हैं.

## ऑपरेटर कमांड्स {#operator-commands}

````go title="txpool/proto/operator.proto
service TxnPoolOperator {
    // Status returns the current status of the pool
    rpc Status(google.protobuf.Empty) returns (TxnPoolStatusResp);

    // AddTxn adds a local transaction to the pool
    rpc AddTxn(AddTxnReq) returns (google.protobuf.Empty);

    // Subscribe subscribes for new events in the txpool
    rpc Subscribe(google.protobuf.Empty) returns (stream TxPoolEvent);
}

````

नोड ऑपरेटर इन GRPC एंडपॉइंट्स से क्वेरी कर सकते हैं, जो **[CLI कमांड्स](/docs/edge/get-started/cli-commands#transaction-pool-commands)** सेक्शन में दिए गए हैं.

## ट्रांज़ैक्शन प्रोसेस हो रहा {#processing-transactions}

````go title="txpool/txpool.go"
// AddTx adds a new transaction to the pool
func (t *TxPool) AddTx(tx *types.Transaction) error {
	if err := t.addImpl("addTxn", tx); err != nil {
		return err
	}

	// broadcast the transaction only if network is enabled
	// and we are not in dev mode
	if t.topic != nil && !t.dev {
		txn := &proto.Txn{
			Raw: &any.Any{
				Value: tx.MarshalRLP(),
			},
		}
		if err := t.topic.Publish(txn); err != nil {
			t.logger.Error("failed to topic txn", "err", err)
		}
	}

	if t.NotifyCh != nil {
		select {
		case t.NotifyCh <- struct{}{}:
		default:
		}
	}
	return nil
}

func (t *TxPool) addImpl(ctx string, txns ...*types.Transaction) error {
	if len(txns) == 0 {
		return nil
	}

	from := txns[0].From
	for _, txn := range txns {
		// Since this is a single point of inclusion for new transactions both
		// to the promoted queue and pending queue we use this point to calculate the hash
		txn.ComputeHash()

		err := t.validateTx(txn)
		if err != nil {
			return err
		}

		if txn.From == types.ZeroAddress {
			txn.From, err = t.signer.Sender(txn)
			if err != nil {
				return fmt.Errorf("invalid sender")
			}
			from = txn.From
		} else {
			// only if we are in dev mode we can accept
			// a transaction without validation
			if !t.dev {
				return fmt.Errorf("cannot accept non-encrypted txn")
			}
		}

		t.logger.Debug("add txn", "ctx", ctx, "hash", txn.Hash, "from", from)
	}

	txnsQueue, ok := t.queue[from]
	if !ok {
		stateRoot := t.store.Header().StateRoot

		// initialize the txn queue for the account
		txnsQueue = newTxQueue()
		txnsQueue.nextNonce = t.store.GetNonce(stateRoot, from)
		t.queue[from] = txnsQueue
	}
	for _, txn := range txns {
		txnsQueue.Add(txn)
	}

	for _, promoted := range txnsQueue.Promote() {
		t.sorted.Push(promoted)
	}
	return nil
}
````
***addImpl*** तरीका **TxPool** मॉड्यूल की सबसे मुख्य ज़रूरत है.
यह वह मुख्य स्थान है जहाँ सिस्टम में ट्रांज़ैक्शन जोड़े जाते हैं, GRPC सेवा, JSON RPC एंडपॉइंट्स से कॉल किया जाता है,
और क्लाइंट **gossip** प्रोटोकॉल के माध्यम से ट्रांज़ैक्शन प्राप्त करता है.

यह एक आर्ग्युमेंट **ctx**, के रूप में लेता है, जो सिर्फ़ उस संदर्भ को दर्शाता है जिससे ट्रांज़ैक्शन जोड़े जा रहे हैं (GRPC, JSON RPC...). <br />
अन्य पैरामीटर पूल में जोड़े जाने वाले ट्रांज़ैक्शन की सूची है.

यहाँ ध्यान देने लायक मुख्य बात यह है कि ट्रांज़ैक्शन के भीतर **फ़्रॉम** फील्ड के लिए चेक करें:
* अगर **फ़्रॉम** फील्ड **खाली** है, तो इसे एक अन-एनक्रिप्टेड/अन-साइन किया गया ट्रांज़ैक्शन माना जाता है. इन प्रकार के ट्रांज़ैक्शन सिर्फ़
डेवलपमेंट मोड में स्वीकार होते हैं
* अगर **फ्रॉम** फील्ड खाली नहीं है, तो इसका मतलब है कि यह एक **साइन किया हुआ ट्रांज़ैक्शन** है, इसलिए सिग्नेचर वेरीफ़िकेशन होता है

इन सभी वेलिडेशन्स के बाद, ट्रांज़ैक्शन्स को वैलिड माना जाता है.

## डेटा स्ट्रक्चर {#data-structures}

````go title="txpool/txpool.go"
// TxPool is a pool of transactions
type TxPool struct {
	logger hclog.Logger
	signer signer

	store      store
	idlePeriod time.Duration

	queue map[types.Address]*txQueue
	sorted *txPriceHeap

	// network stack
	network *network.Server
	topic   *network.Topic

	sealing  bool
	dev      bool
	NotifyCh chan struct{}

	proto.UnimplementedTxnPoolOperatorServer
}
````

Txpool ऑब्जेक्ट में फील्ड जो कन्फ़्युशन पैदा कर सकते हैं, वे **क्यू** और **सॉर्टेड** सूचियाँ हैं.
* **क्यू** - अकाउंट ट्रांज़ैक्शन की एक सॉर्टेड सूची का हीप इम्प्लीमेंटेशन (अस्थायी रूप से)
* **सॉर्टेड** - सभी मौजूदा प्रमोटेड ट्रांज़ैक्शन के लिए सॉर्टेड लिस्ट (सभी एक्जीक्यूटेबल ट्रांज़ैक्शन). गैस प्राइस के आधार पर सोर्टेड

## गैस लिमिट गड़बड़ी मैनेजमेंट {#gas-limit-error-management}

जब आप कोई ट्रांज़ैक्शन करते हैं, तो TxPool द्वारा ये तीन तरीकों से किया जा सकता है.

1. सभी पेंडिंग ट्रांज़ैक्शन एक ब्लॉक में हो सकते हैं
2. एक या अधिक पेंडिंग ट्रांज़ैक्शन एक ब्लॉक में फिट नहीं हो सकते
3. एक या अधिक पेंडिंग ट्रांज़ैक्शन एक ब्लॉक में कभी भी फिट नहीं हो पाएंगे

यहाँ, **_फिट_** शब्द का मतलब हर ट्रांज़ैक्शन की गैस सीमा से है, जो TxPool की शेष गैस की तुलना में कम होती है.

पहला सिनेरियों से कोई गड़बड़ी नहीं होती है.

### द्वितीय सिनेरियों {#second-scenario}

- TxPool शेष गैस को अंतिम ब्लॉक की गैस लिमिट पर सेट किया गया है, जो **5000** है
- पहला ट्रांज़ैक्शन होता है और TxPool की **3000** गैस की खपत होती है
  - TxPool की शेष गैस अब **2000** है
- दूसरा ट्रांज़ैक्शन, जो पहले के ही समान है - दोनों 3000 यूनिट गैस की खपत करते हैं, सबमिट किए जाते हैं
- चूंकि TxPool की शेष गैस ट्रांज़ैक्शन की तुलना में **कम** है, इसलिए इसे अभी मौजूदा ब्लॉक में प्रोसेस नहीं किया
जा सकता है
  - इसे दोबारा पेंडिंग ट्रांज़ैक्शन की क्यू में डाल दिया जाता है ताकि इसे अगले ब्लॉक में प्रोसेस किया जा सके
- पहले ब्लॉक को **ब्लॉक #1** कहा जाता है
- TxPool शेष गैस को पैरेंट ब्लॉक में सेट किया जाता है - **ब्लॉक #1** की गैस लिमिट
- ऐसा ट्रांज़ैक्शन जो TxPool पेंडिंग ट्रांज़ैक्शन क्यू में वापस रखा गया था, उसे अब प्रोसेस और ब्लॉक में लिखा गया है
  - TxPool शेष गैस अब **2000** है
- दूसरे ब्लॉक को लिखा गया है
- ...

![TxPool गड़बड़ी का सिनेरियों #1](/img/edge/txpool-error-1.png)

### तीसरा सिनेरियों {#third-scenario}
- TxPool शेष गैस को अंतिम ब्लॉक की गैस लिमिट पर सेट किया गया है, जो **5000** है
- पहला ट्रांज़ैक्शन होता है और TxPool की **3000** गैस की खपत होती है
    - TxPool की शेष गैस अब **2000** है
- दूसरे ट्रांज़ैक्शन को **6000** पर सेट गैस फ़ील्ड के साथ सबमिट किया जाता है
- चूंकि ब्लॉक गैस लिमिट ट्रांज़ैक्शन गैस की तुलना में **कम** है, इसलिए इस ट्रांज़ैक्शन को डिस्कार्ड किया जाता है
    - यह कभी भी एक ब्लॉक में फिट नहीं हो पाएगा
- पहला ब्लॉक पहले लिखा है
- ...


![TxPool गड़बड़ी का सिनेरियों #2](/img/edge/txpool-error-2.png)

> ये तभी होता है जब आपको ये नीचे दी गई गड़बड़ी मिलती है:
> ```shell
> 2021-11-04T15:41:07.665+0100 [ERROR] polygon.consensus.dev: failed to write transaction: transaction's gas limit exceeds block gas limit
> ```

## ब्लॉक गैस टारगेट {#block-gas-target}

कुछ ऐसी स्थितियाँ होती हैं जब नोड्स ब्लॉक गैस लिमिट को एक रनिंग चेन पर या नीचे एक निश्चित लक्ष्य पर रखना चाहते हैं.

नोड ऑपरेटर टार्गेट गैस लिमिट को किसी ख़ास नोड पर सेट कर सकते हैं, जो इस सीमा को नए बनाए गए ब्लॉक पर लागू करने की कोशिश करेगा.
यदि अधिकांश अन्य नोड्स में भी एक समान (या समान) लक्ष्य गैस लिमिट निर्धारित है, तो ब्लॉक गैस सीमा हमेशा उस ब्लॉक गैस लक्ष्य के आसपास मंडराती रहेगी,
धीरे-धीरे इसकी ओर बढ़ती जाएगी (अधिकतम `1/1024 * parent block gas limit`पर) क्योंकि नए ब्लॉक बनाए जाते हैं.

### उदाहरण के लिए सिनेरियों {#example-scenario}

* नोड ऑपरेटर `5000`होने के लिए सिंगल नोड के लिए ब्लॉक गैस लिमिट को सेट करता है
* अन्य नोड को `5000` के रूप में भी कॉन्फ़िगर किया जाता है, के अलावा सिंगल नोड को `7000` होने के लिए कॉन्फ़िगर किया जाता है
* जब `5000`के लिए निर्धारित गैस टार्गेट वाले नोड प्रस्तावित करने वाले बन जाते हैं, तो वे यह जाँच करेंगे कि गैस लिमिट पहले से ही टार्गेट पर है या नहीं
* अगर गैस लिमिट टार्गेट पर नहीं है (अधिक/कम है), तो प्रस्तावित करने वाला नोड ब्लॉक गैस टार्गेट को टार्गेट की दिशा में अधिकतम (1/1024 * पैरेंट गैस सीमा) पर सेट करेगा
   1. जैसे: `parentGasLimit = 4500` और `blockGasTarget = 5000`, प्रस्तावित करने वाला नए ब्लॉक के लिए गैस लिमिट की गणना `4504.39453125` के रूप में करेगा (`4500/1024 + 4500`)
   2. जैसे: `parentGasLimit = 5500` और `blockGasTarget = 5000`, प्रस्तावित करने वाला नए ब्लॉक के लिए गैस लिमिट की गणना `5494.62890625` के रूप में करेगा (`5500 - 5500/1024`)
* यह सुनिश्चित करता है कि चेन में ब्लॉक गैस की सीमा को टार्गेट पर रखा जाएगा, क्योंकि सिंगल प्रपोज़ करने वाला जिसके पास `7000`के लिए कॉन्फ़िगर किया गया टार्गेट है, वह सीमा को बहुत आगे नहीं बढ़ा सकता है, और
`5000`में सेट किए गए अधिकांश नोड्स हमेशा बनाए रखने का प्रयास करेंगे
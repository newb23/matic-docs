---
id: txpool
title: TxPool
description: Polygon Edge-এর TxPool মডিউলের ব্যাখ্যা।
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

## সংক্ষিপ্ত বিবরণ {#overview}

TxPool মডিউল লেনদেন পুল বাস্তবায়নের প্রতিনিধিত্ব করে, যেখানে সিস্টেমের বিভিন্ন অংশ থেকে লেনদেন
যোগ করা হয়। এই মডিউলটি নোড অপারেটরদের জন্য বিভিন্ন দরকারী ফিচার প্রকাশ করে, যা বর্ণনা করা হয়েছে।

## অপারেটর কমান্ড {#operator-commands}

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

নোড অপারেটররা এই GRPC এন্ডপয়েন্টগুলো কুয়েরি করতে পারবেন, ঠিক যেমনটা **[CLI কমান্ড](/docs/edge/get-started/cli-commands#transaction-pool-commands)** বিভাগে বর্ণনা করা হয়েছে।

## লেনদেন প্রসেস করা {#processing-transactions}

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
***addImpl*** পদ্ধতিটি **TxPool** মডিউলের জন্য খুবই গুরুত্বপূর্ণ একটি পদ্ধতি।
এটি সিস্টেমে লেনদেন যোগ করার কেন্দ্র হিসেবে কাজ করে এবং এটিকে GRPC সার্ভিস, JSON RPC এন্ডপয়েন্ট
ও **gossip** প্রোটোকলের মাধ্যমে যেখান থেকে ক্লায়েন্ট লেনদেন পায় সেখান থেকে কল করা যাবে।

এটি একটি **ctx** আর্গুমেন্ট গ্রহণ করে, যা কেবল লেনদেনটি কোন কনটেক্সট থেকে যোগ করা হচ্ছে তা নির্দেশ করে (GRPC, JSON RPC...)। <br />
অন্যান্য প্যারামিটার হচ্ছে পুলে যোগ করা হবে এমন লেনদেনের তালিকা।

এখানে যে বিষয়টির প্রতি নজর দিতে হবে তা হচ্ছে লেনদেনের ভিতরে থাকা **প্রাপক** ফিল্ডটি।
* যদি **প্রাপক** ফিল্ড **খালি** হয়, তাহলে সেটিকে একটি আনএনক্রিপ্টেড/আনঅ্যাসাইন্ড লেনদেন হিসাবে গণ্য করা হয়। এই ধরনের লেনদেন শুধুমাত্র
ডেভেলাপমেন্ট মোডে গ্রহণ করা হয়
* যদি **প্রাপক** ফিল্ড **খালি** না হয়, তার মানে হচ্ছে সেটি একটি স্বাক্ষরিত লেনদেন, তাই স্বাক্ষর যাচাই করা হয়েছিল

এই সমস্ত যাচাইয়ের পরে, লেনদেন বৈধ বলে গণ্য করা হয়।

## ডেটা স্ট্রাকচার {#data-structures}

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

TxPool অবজেক্টে **কিউ** এবং **সাজানো** তালিকা নিয়ে বিভ্রান্তি সৃষ্টি হতে পারে।
* **কিউ** - অ্যাকাউন্ট লেনদেনের একটি সাজানো তালিকার হিপ বাস্তবায়ন (nonce দ্বারা)
* **সাজানো** - সমস্ত বর্তমান প্রোমোটেড লেনদেনের সাজানো তালিকা (সমস্ত এক্সিকিউটযোগ্য লেনদেন)। গ্যাস মূল্য দ্বারা সাজানো

## গ্যসের সীমা সংক্রান্ত ত্রুটি ব্যবস্থাপনা {#gas-limit-error-management}

আপনি কোনো লেনদেন সাবমিট করলে TxPool সেটি তিনটি উপায়ে প্রসেস করে থাকে।

1. সমস্ত পেন্ডিং লেনদেন একটি ব্লকের মধ্যে ফিট হচ্ছে
2. একটি বা একাধিক পেন্ডিং লেনদেন একটি ব্লকে ফিট হচ্ছে না
3. একটি বা একাধিক পেন্ডিং লেনদেন কখনোই কোনো ব্লকে ফিট হবে না

এখানে, **_ফিট_** শব্দের মানে হচ্ছে যে লেনদেনের একটি গ্যাস সীমা আছে যা TxPool-এর অবশিষ্ট গ্যাসের তুলনায় কম।

প্রথম দৃশ্যকল্পে কোনো ত্রুটি দেখা দেয়নি।

### দ্বিতীয় দৃশ্যকল্প {#second-scenario}

- TxPool-এর অবশিষ্ট গ্যাস শেষ ব্লকের গ্যাস সীমায় সেট করা হয়েছে, ধরে নিচ্ছি তা **5000**
- প্রথম লেনদেন প্রক্রিয়া করা হয়েছে এবং TxPool-এর **3000** গ্যাস খরচ হয়েছে
  - TxPool-এর অবশিষ্ট গ্যাস এখন **2000**
- একটি দ্বিতীয় লেনদেন সাবমিট করা হয়েছে এবং এটিও প্রথমটির মত একই - উভয়েই 3000 ইউনিট গ্যাস খরচ করে
- যেহেতু TxPool-এর অবশিষ্ট গ্যাস লেনদেনের গ্যাসের তুলনায় **কম**, তাই এটিকে বর্তমান ব্লকের মধ্যে প্রক্রিয়া করা
যাবে না
  - এটি একটি পেন্ডিং লেনদেনের কিউয়ের মধ্যে রেখে দেওয়া হয়েছে যাতে পরবর্তী ব্লকে এটি প্রসেস করা যায়
- প্রথম ব্লক লেখা হয়েছে, এটিকে **ব্লক #1** নামে ডাকা যাক
- TxPool-এর অবশিষ্ট গ্যাস প্যারেন্ট ব্লক - **ব্লক #1**-এর গ্যাস সীমায় সেট করা হয়েছে
- TxPool-এর পেন্ডিং লেনদেনের কিউয়ের মধ্যে যে লেনদেনটি রাখা হয়েছিল সেটি এখন প্রসেস করা হয়েছে এবং ব্লকে লিখা হয়েছে
  - TxPool-এর অবশিষ্ট গ্যাস এখন **2000**
- দ্বিতীয় ব্লক লিখা হয়েছে
- ...

![TxPool-এর ত্রুটির দৃশ্যকল্প #1](/img/edge/txpool-error-1.png)

### তৃতীয় দৃশ্যকল্প {#third-scenario}
- TxPool-এর অবশিষ্ট গ্যাস শেষ ব্লকের গ্যাস সীমায় সেট করা হয়েছে, ধরে নিচ্ছি তা **5000**
- প্রথম লেনদেন প্রক্রিয়া করা হয়েছে এবং TxPool-এর **3000** গ্যাস খরচ হয়েছে
    - TxPool-এর অবশিষ্ট গ্যাস এখন **2000**
- একটি দ্বিতীয় লেনদেন সাবমিট করা হয়েছে এবং তার গ্যাস ক্ষেত্রে **6000** সেট করা হয়েছে।
- যেহেতু ব্লকের গ্যাস সীমা লেনদেনের গ্যাসের তুলনায় **কম**, তাই এই লেনদেনটি বাতিল করা হয়েছে
    - এটি কখনোই কোন ব্লকে ফিট করা যাবে না
- প্রথম ব্লক লিখা হয়েছে
- ...


![TxPool-এর ত্রুটি দৃশ্যকল্প #2](/img/edge/txpool-error-2.png)

> আপনি নিম্নলিখিত ত্রুটি পেলে এই বিষয়টি ঘটে:
> ```shell
> 2021-11-04T15:41:07.665+0100 [ERROR] polygon.consensus.dev: failed to write transaction: transaction's gas limit exceeds block gas limit
> ```

## ব্লক গ্যাস টার্গেট {#block-gas-target}

কিছু কিছু পরিস্থিতিতে নোড চলমান চেইনে ব্লকের গ্যাস সীমার নিচে বা একটি নির্দিষ্ট টার্গেটের মধ্যে রাখতে চাইতে পারেন।

নোড অপারেটর কোনো নির্দিষ্ট নোডে টার্গেট গ্যাসের সীমা সেট করে দিতে পারেন, যা নতুন তৈরি ব্লকে সেই সীমা প্রয়োগ করার চেষ্টা করবে।
অন্যান্য নোডের বড় একটি অংশেরও যদি একটি অনুরূপ (বা একই) টার্গেট গ্যাস সীমা সেট করা থাকে, তাহলে ব্লকের গ্যাস সীমা সবসময়
ব্লক গ্যাসের কাছাকাছি উঠা-নামা করবে এবং নতুন ব্লক তৈরি হলে ধীরে ধীরে সেটির দিকে এগিয়ে যাবে (সর্বোচ্চ `1/1024 * parent block gas limit`)।

### উদাহরণ দৃশ্যকল্প {#example-scenario}

* নোড অপারেটর একটি একক নোডের ব্লকের গ্যাস সীমা সেট করেছেন `5000`
* অন্যান্য নোডগুলোকেও `5000`-এ কনফিগার করা হয়, তবে একক নোডটিকে `7000`-এ কনফিগার করা হয়
* `5000`-এ সেট করা নোডগুলো যদি প্রস্তাবক হয়ে যায়, তাহলে তারা গ্যাসের সীমা ইতোমধ্যেই টার্গেটে আছে কিনা তা যাচাই করবে
* যদি গ্যাসের সীমা টার্গেটে না থাকে (বেশি/কম হয়), তাহলে প্রস্তাবক নোড টার্গেটের দিকে ব্লক গ্যাস টার্গেট সর্বোচ্চতে সেট করবে (1/1024 * প্যারেন্ট গ্যাসের সীমা)
   1. উদাহরণ: `parentGasLimit = 4500` এবং `blockGasTarget = 5000`, প্রস্তাবক নতুন ব্লকের জন্য `4504.39453125` (`4500/1024 + 4500`) পদ্ধতিতে গ্যাসের সীমা গণনা করবে
   2. উদাহরণ: `parentGasLimit = 5500` এবং `blockGasTarget = 5000`, প্রস্তাবক নতুন ব্লকের জন্য `5494.62890625` (`5500 - 5500/1024`) পদ্ধতিতে গ্যাসের সীমা গণনা করবে
* এটি চেইনে ব্লকের গ্যাস সীমা টার্গেটে থাকার বিষয়টিকে নিশ্চিত করে, কারণ একক প্রস্তাবক যিনি টার্গেট `7000`-এ কনফিগার করেছেন তিনি সীমাটি খুব বেশি বাড়াতে পারবেন না এবং নোডের সংখ্যাগরিষ্ঠরা
যারা টার্গেট `5000`-এ সেট করেছেন তারা চাইবেন যে টার্গেট এখানেই রাখতে
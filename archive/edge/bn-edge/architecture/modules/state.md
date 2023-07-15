---
id: state
title: স্টেট
description: Polygon Edge-এর স্টেট মডিউলের ব্যাখ্যা।
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - state
  - trie
---

স্টেট **কীভাবে** কাজ করে তা সত্যিকার অর্থে বুঝতে আপনাকে অবশ্যই Ethereum সম্পর্কে কিছু মৌলিক ধারণা থাকতে হবে।<br />

আমরা **[স্টেট ইন Ethereum নির্দেশিকাটি](https://ethereum.github.io/execution-specs/autoapi/ethereum/frontier/state/index.html)** পড়ার পরামর্শ দিয়ে থাকি।

## সংক্ষিপ্ত বিবরণ {#overview}

এখন যেহেতু আমরা নিজেদের মৌলিক Ethereum ধারণাগুলির সাথে পরিচিত করে নিয়েছি, তাই পরবর্তী ওভারভিউ আমাদের জন্য অনেকটা সহজ হয়ে যাবে বলে আশা করছি।

আমরা উল্লেখ করেছি যে **ওয়ার্ল্ড স্টেট ট্রি**-তে বিদ্যমান সকল Ethereum অ্যাকাউন্ট রয়েছে। <br />
এই অ্যাকাউন্টগুলো মার্কেল ট্রি-এর পাতা। প্রতিটি পাতায় **অ্যাকাউন্ট স্টেট** জড়িত তথ্য এনকোড করা আছে।

এটির সাহায্যে Polygon Edge একটি নির্দিষ্ট সময়ের জন্য একটি নির্দিষ্ট মার্কেল ট্রি পেতে পারে। <br />
উদাহরণস্বরূপ, আমরা ব্লক 10-এ স্টেটের হ্যাশ পেতে পারি।

মার্কেল ট্রিকে কোনো কোনো সময়ে ***স্ন্যাপশট*** বলা হয়।

আমরা **স্টেট ট্রি** অথবা **স্টোরেজ ট্রি** এর জন্য ***স্ন্যাপশট*** পেতে পারি - আসলে তারা একই জিনিস। <br />
একমাত্র পার্থক্য হচ্ছে পাতাগুলো কী নির্দেশ করে:

* স্টোরেজ ট্রি-এর ক্ষেত্রে পাতাগুলোতে একটি আর্বিট্রারি স্টেট থাকে, যা আমরা প্রক্রিয়া করতে পারি না বা সেখানে কী আছে জানতে পারি না
* স্টেট ট্রি-এর ক্ষেত্রে, পাতাগুলো অ্যাকাউন্টকে নির্দেশ করে

````go title="state/state.go
type State interface {
    // Gets a snapshot for a specific hash
	NewSnapshotAt(types.Hash) (Snapshot, error)

	// Gets the latest snapshot
	NewSnapshot() Snapshot

	// Gets the codeHash
	GetCode(hash types.Hash) ([]byte, bool)
}
````

**স্ন্যাপশট** ইন্টারফেসটি নিম্নোক্তভাবে সংজ্ঞায়িত করা যায়:

````go title="state/state.go
type Snapshot interface {
    // Gets a specific value for a leaf
	Get(k []byte) ([]byte, bool)

	// Commits new information
	Commit(objs []*Object) (Snapshot, []byte)
}
````

*অবজেক্ট স্ট্রাক্ট* দ্বারা কমিট করা তথ্য সংজ্ঞায়িত করা হয়েছে:

````go title="state/state.go
// Object is the serialization of the radix object
type Object struct {
	Address  types.Address
	CodeHash types.Hash
	Balance  *big.Int
	Root     types.Hash
	Nonce    uint64
	Deleted  bool

	DirtyCode bool
	Code      []byte

	Storage []*StorageObject
}
````

মার্কেল ট্রি-এর ইমপ্লিমেন্টেশন *state/immutable-trie* ফোল্ডারে রয়েছে। <br/>
*state/immutable-trie/state.go* **স্টেট** ইন্টারফেসকে ইমপ্লিমেন্ট করে।

*state/immutable-trie/trie.go* হচ্ছে মেইন মার্কেল ট্রি অবজেক্ট। এটি মার্কেল ট্রি-এর একটি অপ্টিমাইজড সংস্করনের প্রতিনিধিত্ব করে,
যা যতটা সম্ভব মেমরির পুনঃব্যবহার করে।

## এক্সিকিউটর {#executor}

একটি ব্লক কীভাবে বর্তমান স্টেটকে পরিবর্তন করবে সে বিষয়ে সিদ্ধান্ত নিতে Polygon Edge-এর প্রয়োজনীয় সকল তথ্য *state/executor.go*-তে অন্তর্ভুক্ত
রয়েছে। *ProcessBlock*-এর ইমপ্লিমেন্টেশন এখানে আছে।

*Apply* পদ্ধতিটি আসল স্টেট ট্রানজিশনটি করে। এক্সিকিউটর EVM-কে কল করে।

````go title="state/executor.go"
func (t *Transition) apply(msg *types.Transaction) ([]byte, uint64, bool, error) {
	// check if there is enough gas in the pool
	if err := t.subGasPool(msg.Gas); err != nil {
		return nil, 0, false, err
	}

	txn := t.state
	s := txn.Snapshot()

	gas, err := t.preCheck(msg)
	if err != nil {
		return nil, 0, false, err
	}
	if gas > msg.Gas {
		return nil, 0, false, errorVMOutOfGas
	}

	gasPrice := new(big.Int).SetBytes(msg.GetGasPrice())
	value := new(big.Int).SetBytes(msg.Value)

	// Set the specific transaction fields in the context
	t.ctx.GasPrice = types.BytesToHash(msg.GetGasPrice())
	t.ctx.Origin = msg.From

	var subErr error
	var gasLeft uint64
	var returnValue []byte

	if msg.IsContractCreation() {
		_, gasLeft, subErr = t.Create2(msg.From, msg.Input, value, gas)
	} else {
		txn.IncrNonce(msg.From)
		returnValue, gasLeft, subErr = t.Call2(msg.From, *msg.To, msg.Input, value, gas)
	}

	if subErr != nil {
		if subErr == runtime.ErrNotEnoughFunds {
			txn.RevertToSnapshot(s)
			return nil, 0, false, subErr
		}
	}

	gasUsed := msg.Gas - gasLeft
	refund := gasUsed / 2
	if refund > txn.GetRefund() {
		refund = txn.GetRefund()
	}

	gasLeft += refund
	gasUsed -= refund

	// refund the sender
	remaining := new(big.Int).Mul(new(big.Int).SetUint64(gasLeft), gasPrice)
	txn.AddBalance(msg.From, remaining)

	// pay the coinbase
	coinbaseFee := new(big.Int).Mul(new(big.Int).SetUint64(gasUsed), gasPrice)
	txn.AddBalance(t.ctx.Coinbase, coinbaseFee)

	// return gas to the pool
	t.addGasPool(gasLeft)

	return returnValue, gasUsed, subErr != nil, nil
}
````

## রানটাইম {#runtime}

একটি স্টেট ট্রানজিশন এক্সিকিউট করা হলে যে প্রধান মডিউল সে ট্রানজিশনটি এক্সিকিউট করে সেটি হচ্ছে EVM (এটি
স্টেট/রানটাইম/evm-এর মধ্যে অবস্থিত)।

**ডিসপ্যাচ টেবিলটি** **opcode** এবং নির্দেশনার মধ্যে ম্যাচ করার চেষ্টা করে।

````go title="state/runtime/evm/dispatch_table.go"
func init() {
	// unsigned arithmetic operations
	register(STOP, handler{opStop, 0, 0})
	register(ADD, handler{opAdd, 2, 3})
	register(SUB, handler{opSub, 2, 3})
	register(MUL, handler{opMul, 2, 5})
	register(DIV, handler{opDiv, 2, 5})
	register(SDIV, handler{opSDiv, 2, 5})
	register(MOD, handler{opMod, 2, 5})
	register(SMOD, handler{opSMod, 2, 5})
	register(EXP, handler{opExp, 2, 10})

	...

	// jumps
	register(JUMP, handler{opJump, 1, 8})
	register(JUMPI, handler{opJumpi, 2, 10})
	register(JUMPDEST, handler{opJumpDest, 0, 1})
}
````

*Run* লুপ হচ্ছে EVM-কে চালিত করার মূল লজিক।<br />

এটি EVM-এর প্রধান এন্ট্রি পয়েন্ট। এটি একটি লুপ করে এবং বর্তমান অপকোড চেক করে, নির্দেশনা নিয়ে আসে, এটি কার্যকর করা যায় কিনা
তা পরীক্ষা করে, গ্যাস খরচ করে এবং নির্দেশনাটি ব্যর্থ বা বন্ধ না হওয়া পর্যন্ত তা এক্সিকিউট করতে থাকে।

````go title="state/runtime/evm/state.go"

// Run executes the virtual machine
func (c *state) Run() ([]byte, error) {
	var vmerr error

	codeSize := len(c.code)

	for !c.stop {
		if c.ip >= codeSize {
			c.halt()
			break
		}

		op := OpCode(c.code[c.ip])

		inst := dispatchTable[op]

		if inst.inst == nil {
			c.exit(errOpCodeNotFound)
			break
		}

		// check if the depth of the stack is enough for the instruction
		if c.sp < inst.stack {
			c.exit(errStackUnderflow)
			break
		}

		// consume the gas of the instruction
		if !c.consumeGas(inst.gas) {
			c.exit(errOutOfGas)
			break
		}

		// execute the instruction
		inst.inst(c)

		// check if stack size exceeds the max size
		if c.sp > stackSize {
			c.exit(errStackOverflow)
			break
		}

		c.ip++
	}

	if err := c.err; err != nil {
		vmerr = err
	}

	return c.ret, vmerr
}
````

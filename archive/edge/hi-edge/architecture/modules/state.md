---
id: state
title: स्टेट
description: पॉलीगॉन एज के स्टेट मॉड्यूल का स्पष्टीकरण.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - state
  - trie
---

वास्तव में यह समझने के लिए **स्टेट** कैसे काम करता है, आपको कुछ बुनियादी एथेरेयम अवधारणाओं को समझना चाहिए.<br />

हम **[एथेरेयम गाइड में स्टेट](https://ethereum.github.io/execution-specs/autoapi/ethereum/frontier/state/index.html)** को पढ़ने की बहुत सिफारिश करते हैं.

## ओवरव्यू {#overview}

अब जबकि हम एथेरेयम अवधारणाओं से परिचित हो गए हैं, अगला ओवरव्यू आसान होना चाहिए.

हमने उल्लेख किया है कि **वर्ल्ड स्टेट ट्री** में ऐसे सभी एथेरेयम अकाउंट जो मौजूद हैं.<br /> ये एकाउंट, मर्कल ट्री के लीव्स हैं. प्रत्येक लीफ में कूटबद्ध **अकाउंट स्टेट** जानकारी होती है.

यह पॉलीगॉन एज को किसी विशिष्ट समय के लिए, एक विशिष्ट मर्कल ट्री प्राप्त करने में सक्षम बनाता है. <br />उदाहरण के लिए, हम ब्लॉक 10 में स्टेट का हैश प्राप्त कर सकते हैं.

मर्कल ट्री को किसी भी समय पर, ***स्नैपशॉट*** कहा जाता है.

हम **स्टेट ट्री** के लिए, या **स्टोरेज ट्री** के लिए ***स्नैपशॉट*** प्राप्त कर सकते हैं - ये मूल रूप से एक ही हैं<br />. केवल उसमें अंतर है जिसमें लीव्स प्रतिनिधित्व करते हैं:

* स्टोरेज ट्री के मामले में, पत्तियों में एक आर्बिट्रेरी स्टेट होता है, जिसे हम प्रोसेस नहीं कर सकते या नहीं जानते कि उसमें क्या है
* स्टेट ट्री के मामले में, लीव्स, एकाउंट का प्रतिनिधित्व करते हैं

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

**स्नैपशॉट** इंटरफ़ेस को इस प्रकार परिभाषित किया गया है:

````go title="state/state.go
type Snapshot interface {
    // Gets a specific value for a leaf
	Get(k []byte) ([]byte, bool)

	// Commits new information
	Commit(objs []*Object) (Snapshot, []byte)
}
````

जिस जानकारी को प्रतिबद्ध किया जा सकता है *उसे ऑब्जेक्ट स्ट्रक्ट* द्वारा परिभाषित किया जाता है:

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

मर्कल ट्री का इम्प्लीमेंटेशन, *स्टेट / इम्यूटेबल ट्री* फ़ोल्डर में है. <br/>*state/immutable-trie/state.go* **स्टेट** इंटरफ़ेस को लागू करता है.

*state/immutable-trie/trie.go*, मुख्य मर्कल ट्री ऑब्जेक्ट है. यह मर्कल ट्री के ऑप्टिमाइज्ड वर्जन का प्रतिनिधित्व करता है, जो फिर से ज़्यादा से ज़्यादा मेमोरी का इस्तेमाल करता है.

## एग्जीक्यूटर {#executor}

*state/executor.go* यह तय करने के लिए पॉलीगॉन एज के लिए आवश्यक सभी जानकारी होती है कि ब्लॉक मौजूदा
स्टेट को कैसे बदलता है. *प्रोसेस ब्लॉक* का इम्प्लीमेंटेशन यहाँ स्थित है.

*लागू करने* का तरीका वास्तविक स्टेट ट्रांजिशन करता है. एग्जीक्यूटर EVM को कॉल करता है.

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

## रनटाइम {#runtime}

जब स्टेट ट्रांजिशन एग्जीक्यूट होता है तब स्टेट ट्रांजिशन को एग्जीक्यूट करने वाला मुख्य मॉड्यूल EVM होता है (जो state/runtime/evm में स्थित होता है).

**डिस्पैच टेबल**, **opcode** और निर्देश के बीच मिलान करता है.

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

EVM को पॉवर देने वाला कोर लॉजिक, *रन* लूप होता है.<br />

यह EVM का मुख्य प्रवेश स्थान है. यह एक लूप करता है और वर्तमान opcode को जाँचता है, निर्देश लाता है, जाँचता है कि इसे एग्जिक्यूट किया जा सकता है या नहीं, गैस का सेवन करता है और निर्देश को एग्जिक्यूट करता है जब तक यह विफल या बंद नहीं होता है.

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

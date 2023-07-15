---
id: consensus
title: सहमति
description: पॉलीगॉन एज के सहमति मॉड्यूल के लिए स्पष्टीकरण.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - consensus
  - ibft
---

## ओवरव्यू {#overview}

**सहमति** का मॉड्यूल सहमति मैकेनिज्म के लिए एक इंटरफेस प्रदान करता है.

फ़िलहाल, निम्नलिखित सहमति इंजन उपलब्ध हैं:
* **IBFT PoA**
* **IBFT PoS**

पॉलीगॉन एज मॉड्युलैरिटी एवं प्लगबिलिटी की स्थिति को बनाए रखना चाहता है. <br />
यही कारण है कि कोर सहमति तर्क को अलग कर दिया गया है, ताकि प्रयोज्यता और आसानी से उपयोग में समझौता किए बिना नए सहमति मैकेनिज्म का निर्माण सबसे ऊपर किया जा सकें.

## सहमति इंटरफ़ेस {#consensus-interface}

````go title="consensus/consensus.go"
// Consensus is the interface for consensus
type Consensus interface {
	// VerifyHeader verifies the header is correct
	VerifyHeader(parent, header *types.Header) error

	// Start starts the consensus
	Start() error

	// Close closes the connection
	Close() error
}
````

***सहमति*** इंटरफ़ेस उल्लेखित अमूर्तता का मूल है. <br />
* **VerifyHeader** तरीका एक सहायक फ़ंक्शन का प्रतिनिधित्व करता है जिसे सहमति लेयर **ब्लॉकचेन** लेयर में उजागर करता है यह हेडर वेरिफिकेशन को संभालने के लिए है
* **स्टार्ट** तरीका केवल सहमति की प्रक्रिया और इससे जुड़ी हर चीज को शुरू करता है. इसमें शामिल है, सिंक्रनाइज़ेशन,
सीलिंग और सब कुछ जो किया जाना चाहिए
*  **बंद** तरीका सहमति कनेक्शन को बंद करता है

## सहमति कॉन्फ़िगरेशन {#consensus-configuration}

````go title="consensus/consensus.go"
// Config is the configuration for the consensus
type Config struct {
	// Logger to be used by the backend
	Logger *log.Logger

	// Params are the params of the chain and the consensus
	Params *chain.Params

	// Specific configuration parameters for the backend
	Config map[string]interface{}

	// Path for the consensus protocol to store information
	Path string
}
````

ऐसा समय हो सकता है जब आप डेटा को स्टोर करने के लिए सहमति प्रोटोकॉल के लिए कस्टम स्थान में जाना चाहते हैं या शायद कस्टम की-वैल्यू मैप, जिसके बारे में आप चाहते हैं कि वह सहमति मैकेनिज्म द्वारा उपयोग किया जाएं. यह ***कॉन्फ़िगरेशन*** के जरिए हासिल किया जा सकता है, जिसे पढ़ा जाता है जब कोई सहमति का मिसाल बनता है.

## IBFT {#ibft}

### एक्स्ट्राडेटा {#extradata}

ब्लॉकचेन हैडर ऑब्जेक्ट के पास, अन्य क्षेत्रों के साथ, एक दूसरा फ़ील्ड भी है, जिसे **एक्स्ट्रा डेटा** कहते है.

IBFT इस अतिरिक्त फील्ड का इस्तेमाल ब्लॉक के बारे में जानकारी को स्टोर करने के लिए करता है, जिसमें सवालों का जवाब दिया गया है, जैसे:
* "इस ब्लॉक को किसने साइन किया?"
* "इस ब्लॉक के लिए वैलिडेटर कौन हैं?"

IBFT के लिए ये अतिरिक्त फील्ड इस प्रकार निर्दिष्ट किए गए हैं:
````go title="consensus/ibft/extra.go"
type IstanbulExtra struct {
	Validators    []types.Address
	Seal          []byte
	CommittedSeal [][]byte
}
````

### साइनिंग डेटा  {#signing-data}

IBFT में जानकारी साइन करने के लिए, यह *signHash* तरीके का फायदा उठाता है:
````go title="consensus/ibft/sign.go"
func signHash(h *types.Header) ([]byte, error) {
	//hash := istambulHeaderHash(h)
	//return hash.Bytes(), nil

	h = h.Copy() // make a copy since we update the extra field

	arena := fastrlp.DefaultArenaPool.Get()
	defer fastrlp.DefaultArenaPool.Put(arena)

	// when hashign the block for signing we have to remove from
	// the extra field the seal and commitedseal items
	extra, err := getIbftExtra(h)
	if err != nil {
		return nil, err
	}
	putIbftExtraValidators(h, extra.Validators)

	vv := arena.NewArray()
	vv.Set(arena.NewBytes(h.ParentHash.Bytes()))
	vv.Set(arena.NewBytes(h.Sha3Uncles.Bytes()))
	vv.Set(arena.NewBytes(h.Miner.Bytes()))
	vv.Set(arena.NewBytes(h.StateRoot.Bytes()))
	vv.Set(arena.NewBytes(h.TxRoot.Bytes()))
	vv.Set(arena.NewBytes(h.ReceiptsRoot.Bytes()))
	vv.Set(arena.NewBytes(h.LogsBloom[:]))
	vv.Set(arena.NewUint(h.Difficulty))
	vv.Set(arena.NewUint(h.Number))
	vv.Set(arena.NewUint(h.GasLimit))
	vv.Set(arena.NewUint(h.GasUsed))
	vv.Set(arena.NewUint(h.Timestamp))
	vv.Set(arena.NewCopyBytes(h.ExtraData))

	buf := keccak.Keccak256Rlp(nil, vv)
	return buf, nil
}
````
एक और ध्यान देने योग्य तरीका *VerifyCommittedFields* मेथड है, जो यह सत्यापित करता है कि प्रतिबद्ध सील वैध वैलिडेटर्स से हैं:
````go title="consensus/ibft/sign.go
func verifyCommitedFields(snap *Snapshot, header *types.Header) error {
	extra, err := getIbftExtra(header)
	if err != nil {
		return err
	}
	if len(extra.CommittedSeal) == 0 {
		return fmt.Errorf("empty committed seals")
	}

	// get the message that needs to be signed
	signMsg, err := signHash(header)
	if err != nil {
		return err
	}
	signMsg = commitMsg(signMsg)

	visited := map[types.Address]struct{}{}
	for _, seal := range extra.CommittedSeal {
		addr, err := ecrecoverImpl(seal, signMsg)
		if err != nil {
			return err
		}

		if _, ok := visited[addr]; ok {
			return fmt.Errorf("repeated seal")
		} else {
			if !snap.Set.Includes(addr) {
				return fmt.Errorf("signed by non validator")
			}
			visited[addr] = struct{}{}
		}
	}

	validSeals := len(visited)
	if validSeals <= 2*snap.Set.MinFaultyNodes() {
		return fmt.Errorf("not enough seals to seal block")
	}
	return nil
}
````

### स्नैपशॉट्स {#snapshots}

स्नैपशॉट्स जैसे नाम से स्पष्ट होता है, किसी भी ब्लॉक ऊँचाई (संख्या) पर एक*स्नैपशॉट्स*, या सिस्टम का *स्टेट *उपलब्ध कराने के लिए हैं.

स्नैपशॉट्स में नोड्स का एक समूह होता है जो वैलिडेटर के साथ-साथ वोटिंग इनफार्मेशन (वैलिडेटर अन्य वैलिडेटर्स के लिए वोट कर सकते हैं). वैलिडेटर्स में फाइल किए गए **माइनर** हेडर में वोटिंग जानकारी शामिल होती है और **नान्स**के मान को बदलते हैं:
* नान्स **सभी 1s** है अगर नोड वैलिडेटर को हटाना चाहता है
* नान्स **सभी 0s** है अगर नोड वैलिडेटर पता जोड़ना चाहता है

स्नैपशॉट की गणना ***प्रोसेसहेडर्स*** तरीके से की जाती है:

````go title="consensus/ibft/snapshot.go"
func (i *Ibft) processHeaders(headers []*types.Header) error {
	if len(headers) == 0 {
		return nil
	}

	parentSnap, err := i.getSnapshot(headers[0].Number - 1)
	if err != nil {
		return err
	}
	snap := parentSnap.Copy()

	saveSnap := func(h *types.Header) error {
		if snap.Equal(parentSnap) {
			return nil
		}

		snap.Number = h.Number
		snap.Hash = h.Hash.String()

		i.store.add(snap)

		parentSnap = snap
		snap = parentSnap.Copy()
		return nil
	}

	for _, h := range headers {
		number := h.Number

		validator, err := ecrecoverFromHeader(h)
		if err != nil {
			return err
		}
		if !snap.Set.Includes(validator) {
			return fmt.Errorf("unauthroized validator")
		}

		if number%i.epochSize == 0 {
			// during a checkpoint block, we reset the voles
			// and there cannot be any proposals
			snap.Votes = nil
			if err := saveSnap(h); err != nil {
				return err
			}

			// remove in-memory snaphots from two epochs before this one
			epoch := int(number/i.epochSize) - 2
			if epoch > 0 {
				purgeBlock := uint64(epoch) * i.epochSize
				i.store.deleteLower(purgeBlock)
			}
			continue
		}

		// if we have a miner address, this might be a vote
		if h.Miner == types.ZeroAddress {
			continue
		}

		// the nonce selects the action
		var authorize bool
		if h.Nonce == nonceAuthVote {
			authorize = true
		} else if h.Nonce == nonceDropVote {
			authorize = false
		} else {
			return fmt.Errorf("incorrect vote nonce")
		}

		// validate the vote
		if authorize {
			// we can only authorize if they are not on the validators list
			if snap.Set.Includes(h.Miner) {
				continue
			}
		} else {
			// we can only remove if they are part of the validators list
			if !snap.Set.Includes(h.Miner) {
				continue
			}
		}

		count := snap.Count(func(v *Vote) bool {
			return v.Validator == validator && v.Address == h.Miner
		})
		if count > 1 {
			// there can only be one vote per validator per address
			return fmt.Errorf("more than one proposal per validator per address found")
		}
		if count == 0 {
			// cast the new vote since there is no one yet
			snap.Votes = append(snap.Votes, &Vote{
				Validator: validator,
				Address:   h.Miner,
				Authorize: authorize,
			})
		}

		// check the tally for the proposed validator
		tally := snap.Count(func(v *Vote) bool {
			return v.Address == h.Miner
		})

		if tally > snap.Set.Len()/2 {
			if authorize {
				// add the proposal to the validator list
				snap.Set.Add(h.Miner)
			} else {
				// remove the proposal from the validators list
				snap.Set.Del(h.Miner)

				// remove any votes casted by the removed validator
				snap.RemoveVotes(func(v *Vote) bool {
					return v.Validator == h.Miner
				})
			}

			// remove all the votes that promoted this validator
			snap.RemoveVotes(func(v *Vote) bool {
				return v.Address == h.Miner
			})
		}

		if err := saveSnap(h); err != nil {
			return nil
		}
	}

	// update the metadata
	i.store.updateLastBlock(headers[len(headers)-1].Number)
	return nil
}
````

यह तरीका आमतौर पर 1 हेडर के साथ कहा जाता है, लेकिन यह प्रवाह मल्टिपल/कई हेडर के साथ भी समान ही होता है. <br />
प्रत्येक पास पास-इन हेडर के लिए, IBFT को यह सत्यापित करने की जरूरत है कि हेडर का प्रपोज़र ही वैलिडेटर है. यह नवीनतम स्नैपशॉट को कैप्चर करके और वैलिडेटर सेट में नोड है या नहीं, इसकी जांच करके आसानी से किया जा सकता है.

इसके बाद, नान्स की जाँच की जाती है. वोट को शामिल और मिलान किया गया है - और यदि पर्याप्त वोट हैं तो वैलिडेटर सेट से एक नोड जोड़ा/हटा दिया जाता है, जिसके बाद नए स्नैपशॉट को सहेजा जाता है.

#### स्नैपशॉट स्टोर {#snapshot-store}

स्नैपशॉट सेवा एक निकाय का प्रबंधन और अद्यतन करता है जिसे **स्नैपशॉट स्टोर**कहते है, जो सभी उपलब्ध स्नैपशॉट की सूची को स्टोर करता है. इसका इस्तेमाल करके, सेवा जल्दी से पता लगाने में सक्षम है कि कौन सा स्नैपशॉट किस ब्लॉक ऊँचाई से जुड़ा है.
````go title="consensus/ibft/snapshot.go"
type snapshotStore struct {
	lastNumber uint64
	lock       sync.Mutex
	list       snapshotSortedList
}
````

### IBFT स्टार्टअप {#ibft-startup}

IBFT को शुरू करने के लिए, पॉलीगॉन एज को पहले शुरू करने के लिए IBFT ट्रांसपोर्ट को स्थापित करने की जरूरत है:
````go title="consensus/ibft/ibft.go"
func (i *Ibft) setupTransport() error {
	// use a gossip protocol
	topic, err := i.network.NewTopic(ibftProto, &proto.MessageReq{})
	if err != nil {
		return err
	}

	err = topic.Subscribe(func(obj interface{}) {
		msg := obj.(*proto.MessageReq)

		if !i.isSealing() {
			// if we are not sealing we do not care about the messages
			// but we need to subscribe to propagate the messages
			return
		}

		// decode sender
		if err := validateMsg(msg); err != nil {
			i.logger.Error("failed to validate msg", "err", err)
			return
		}

		if msg.From == i.validatorKeyAddr.String() {
			// we are the sender, skip this message since we already
			// relay our own messages internally.
			return
		}
		i.pushMessage(msg)
	})
	if err != nil {
		return err
	}

	i.transport = &gossipTransport{topic: topic}
	return nil
}
````

एक नए प्रोटो बफ्फ़ मैसेज के साथ, यह अनिवार्य रूप से IBFT प्रोटो के साथ एक नया विषय बनाता है.<br />
संदेशों का इस्तेमाल वैलिडेटर्स द्वारा किया जाना चाहिए. पॉलीगॉन एज तब विषय को स्वीकार करता है और तदनुसार मैसेज को संभालता है.

#### मैसेज रिक्वाइअर {#messagereq}

वैलिडेटर्स द्वारा आदान-प्रदान किया गया मैसेज:
````go title="consensus/ibft/proto/ibft.proto"
message MessageReq {
    // type is the type of the message
    Type type = 1;

    // from is the address of the sender
    string from = 2;

    // seal is the committed seal if message is commit
    string seal = 3;

    // signature is the crypto signature of the message
    string signature = 4;

    // view is the view assigned to the message
    View view = 5;

    // hash of the locked block
    string digest = 6;

    // proposal is the rlp encoded block in preprepare messages
    google.protobuf.Any proposal = 7;

    enum Type {
        Preprepare = 0;
        Prepare = 1;
        Commit = 2;
        RoundChange = 3;
    }
}

message View {
    uint64 round = 1;
    uint64 sequence = 2;
}
````

**मैसेज रिक्वाइअर** में **दृश्य **क्षेत्र चेन के अंदर नोड की स्थिति का प्रतिनिधित्व करता है. इसमें एक *राउंड*, और एक *अनुक्रम* एट्रीब्यूट है.
* **राउंड** ऊँचाई के लिए प्रपोज़र राउंड का प्रतिनिधित्व करता है
* **अनुक्रम** ब्लॉकचेन की ऊँचाई का प्रतिनिधित्व करता है

IBFT इम्प्लिमेन्टेशन में *msgQueue* फ़ील्ड का उद्देश्य मैसेज अनुरोध को स्टोर करना है. यह मैसेज को *दृश्य* द्वारा ऑर्डर करता है (पहले अनुक्रम से, फिर राउंड से). IBFT इम्प्लिमेन्टेशन सिस्टम में विभिन्न स्थितियों के लिए अलग अलग कतारें भी होती हैं.

### IBFT स्टेट्स {#ibft-states}

एक बार **स्टार्ट** तरीके की मदद से सहमति मैकेनिज्म को शुरू करने के बाद, यह एक अनंत लूप में चलता है जो स्टेट मशीन को सिमुलेट करता है:
````go title="consensus/ibft/ibft.go"
func (i *Ibft) start() {
	// consensus always starts in SyncState mode in case it needs
	// to sync with other nodes.
	i.setState(SyncState)

	header := i.blockchain.Header()
	i.logger.Debug("current sequence", "sequence", header.Number+1)

	for {
		select {
		case <-i.closeCh:
			return
		default:
		}

		i.runCycle()
	}
}

func (i *Ibft) runCycle() {
	if i.state.view != nil {
		i.logger.Debug(
		    "cycle",
		    "state",
		    i.getState(),
		    "sequence",
		    i.state.view.Sequence,
		    "round",
		    i.state.view.Round,
	    )
	}

	switch i.getState() {
	case AcceptState:
		i.runAcceptState()

	case ValidateState:
		i.runValidateState()

	case RoundChangeState:
		i.runRoundChangeState()

	case SyncState:
		i.runSyncState()
	}
}
````

#### सिंक्रोनाइज़ेशन स्टेट {#syncstate}

सभी नोड आरंभ में **सिंक्रोनाइज़ेशन** स्टेट में शुरू होता है.

ऐसा इसलिए होता है क्योंकि ब्लॉकचेन से ताजा डेटा को प्राप्त करने की जरूरत होती है. क्लाइंट को पता लगाने की जरूरत है कि अगर यह वैलिडेटर है तो, मौजूदा स्नैपशॉट का पता लगाएं. यह स्टेट किसी भी लंबित ब्लॉक का समाधान करता है.

सिंक्रोनाइज़ेशन के पूरा होने के बाद, क्लाइंट निर्धारित करता है कि यह वास्तव में एक वैलिडेटर है, तो इसे**AcceptState** में ट्रांसफ़र करने की जरूरत है.
अगर क्लाइंट एक वैलिडेटर **नहीं **है, यह सिंक्रोनाइजिंग जारी रखेगा और स**िंक्रोनाइज़ेशन स्टेट **में ही रहेगा

#### एक्सेप्ट स्टेट {#acceptstate}

यह **एक्सेप्ट** एक्सेप्ट स्टेट हमेशा स्नैपशॉट और वैलिडेटर सेट की जाँच करता है. अगर हालिया नोड वैलिडेटर्स सेट में नहीं है,
यह **सिंक्रोनाइज़ेशन** स्टेट में वापस चला जाता है.

दूसरी ओर, अगर नोड **एक** एक वैलिडेटर है, तो यह प्रपोज़र की गणना करता है. अगर यह पता चलता है कि हालिया नोड ही प्रपोज़र है, तो यह ब्लॉक बनाता है और preprepare भेजता है और फिर मैसेज तैयार करता है.

* Preprepare मैसेज - यह प्रपोज़र द्वारा वैलिडेटर्स को भेजा जाने वाला मैसेज है, ताकि उन्हें प्रस्ताव के बारे में सूचित किया जा सकें
* प्रिपेयर मैसेज - मैसेज जहां एक वैलिडेटर किसी प्रस्ताव पर सहमत होता है. सभी नोड सभी प्रिपेयर मैसेज प्राप्त करते हैं
* कमिट मैसेज - इसमें प्रस्ताव के लिए प्रतिबद्ध जानकारी शामिल होती है

अगर हालिया नोड एक वैलिडेटर **नहीं है**, तो यह *getNextMessage* तरीके का उपयोग पहले से कतार में दिखाए गए मैसेज को पढ़ने के लिए करता है. <br />यह preprepare मैसेज का इंतजार करता है. एक बार जब यह पुष्टि हो जाती है कि सब कुछ सही है, तो नोड **वैलिडेट** स्टेट में चला जाता है.

#### ValidateState {#validatestate}

यह **वैलिडेट** स्टेट बहुत ही सरल है - इस स्टेट में सभी नोड ही मैसेज पढ़ता है और उन्हें अपने स्थानीय स्नैपशॉट स्टेट में जोड़ देता है.

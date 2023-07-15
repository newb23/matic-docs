---
id: consensus
title: কনসেনসাস
description: Polygon Edge-এর কনসেনসাস মডিউলের ব্যাখ্যা।
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - consensus
  - ibft
---

## সংক্ষিপ্ত বিবরণ {#overview}

**কনসেনসাস** মডিউল কনসেনসাস মেকানিজমের জন্য একটি ইন্টারফেস প্রদান করে।

বর্তমানে, নিম্নলিখিত কনসেনসাস ইঞ্জিনগুলো পাওয়া যাচ্ছে:
* **IBFT PoA**
* **IBFT PoS**

Polygon Edge একটি মডুলারিটি এবং প্লাগ্যাবিলিটির স্টেট বজায় রাখতে চাচ্ছে। <br />
তাই মূল কনসেনসাস লজিকটি অ্যাবস্ট্র্যাক্ট করা হয়েছে, যাতে ব্যবহারযোগ্যতা এবং ব্যবহারের আরামদায়কতার সাথে কোনো আপোষ করা ছাড়াই
সেটির উপরে নতুন কনসেনসাস মেকানিজম তৈরি করা যায়।

## কনসেনসাস ইন্টারফেস {#consensus-interface}

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

***কনসেনসাস*** ইন্টারফেস হচ্ছে উল্লিখিত অ্যাবস্ট্রাকশনের মূল বিষয়। <br />
* **VerifyHeader** পদ্ধতি একটি সহায়ক ফাংশন উপস্থাপন করে যা কনসেনসাস লেয়ারটিকে **ব্লকচেইন** লেয়ারে প্রকাশ করে
এটি হেডার যাচাইকরণ পরিচালনা করে থাকে
* **স্টার্ট** পদ্ধতিটি শুধু কনসেনসাস প্রক্রিয়া এবং এর সাথে সংশ্লিষ্ট সবকিছু চালু করে। এই কাজগুলোর মধ্যে অন্তর্ভুক্ত রয়েছে সিঙ্ক্রোনাইজেশন,
সিলিং এবং অন্যান্য যা সম্পন্ন করতে হবে
* **ক্লোজ** পদ্ধতিটি কনসেনসাস সংযোগ বন্ধ করে

## কনসেনসাস কনফিগারেশন {#consensus-configuration}

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

আপনি ডেটা সংরক্ষণ করতে কনসেনসাস প্রোটোকল একটি কাস্টম লোকেশন পাঠাতে চাইতে পারেন বা
কনসেনসাস মেকানিজমে ব্যবহারের জন্য একটি কাস্টম কী-ভ্যালু ম্যাপ চাইতে পারেন। এটি ***Config*** স্ট্রাক্টের মাধ্যমে অর্জন করা যেতে পারে,
যা একটি নতুন কনসেনসাস ইনস্ট্যান্স তৈরি হওয়ার পর রিড হয়।

## IBFT {#ibft}

### ExtraData {#extradata}

অন্যান্য ফিল্ডের মধ্যে ব্লকচেইন হেডার অবজেক্টে **ExtraData** নামক একটি ফিল্ড আছে।

IBFT এই অতিরিক্ত ফিল্ড ব্যবহার করে নিম্নলিখিত প্রশ্নগুলোর উত্তর প্রদান করার মাধ্যমে ব্লক বিষয়ক অপারেশনাল তথ্য সংরক্ষণ করে:
* "কে এই ব্লকটি স্বাক্ষর করেছেন?"
* "কারা এই ব্লকের যাচাইকারী?"

IBFT-এর এই অতিরিক্ত ক্ষেত্রগুলো নিচে সংজ্ঞায়িত করা হয়েছে:
````go title="consensus/ibft/extra.go"
type IstanbulExtra struct {
	Validators    []types.Address
	Seal          []byte
	CommittedSeal [][]byte
}
````

### সাইনিং ডেটা {#signing-data}

IBFT-তে নোড সাইন করার জন্য, এটি *signHash* পদ্ধতি ব্যবহার করে:
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
আরেকটি উল্লেখযোগ্য পদ্ধতি হল *VerifyCommittedFields* পদ্ধতি, যা কমিট করা সিলগুলো বৈধ যাচাইকারীদের কাছ থেকে আসার বিষয়টি নিশ্চিত করে:
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

### স্ন্যাপশট {#snapshots}

স্ন্যাপশট, নামেই প্রতীয়মান, যেকোনো ব্লক উচ্চতায় (সংখ্যা) সিস্টেমের একটি *স্ন্যাপশট* বা *স্টেট* প্রদান করে থাকে।

স্ন্যাপশটের ভিতর একটি নোডের সেট থাকে যেগুলোতে যাচাইকারীদের পাশাপাশি ভোটের তথ্য থাকে (যাচাইকারীরা অন্যান্য যাচাইকারীদের ভোট দিতে পারেন)। যাচাইকারীরা **মাইনার** হেডার ফিল্ডে ভোটের তথ্য অন্তর্ভুক্ত করে এবং **নোন্স** ফিল্ডের মান পরিবর্তন করে:
* নোডটি কোনো যাচাইকারীকে অপসারণ করতে চাইলে নোন্স **সব 1s** হয়
* নোডটি কোনো যাচাইকারীকে যোগ করতে চাইলে নোন্স **সব 0s** হয়

স্ন্যাপশট ***processHeaders*** পদ্ধতি ব্যবহার করে গণনা করা হয়:

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

এই পদ্ধতিটি সাধারণত 1 হেডারের সাথে কল করা হয়, কিন্তু একাধিক হেডারের সাথেও তার ফ্লো একই হয়। <br />
প্রতিটি পাসড-ইন হেডারের জন্য, IBFT-কে যাচাই করতে হয় যে হেডারের প্রস্তাবকই যাচাইকারী। সাম্প্রতিকতম স্ন্যাপশট নিয়ে
এবং নোডটি যাচাইকারীর সেটের মধ্যে রয়েছে কিনা তা যাচাই করার মাধ্যমে এটি খুব সহজেই করা যেতে পারে।

পরবর্তীতে, নোন্স চেক করা হয়। ভোটটি অন্তর্ভুক্ত এবং ট্যালি করা হয়েছে - যদি পর্যাপ্ত ভোট থাকে, তাহলে যাচাইকারীর সেট থেকে
একটি নোড যোগ/বাদ দেওয়া হয় এবং তারপর নতুন স্ন্যাপশট সংরক্ষণ করা হয়।

#### স্ন্যাপশট স্টোর {#snapshot-store}

স্ন্যাপশট সার্ভিস **স্ন্যাপশট স্টোর** নামক একটি এন্টিটি পরিচালনা ও আপডেট করে থাকে, যা সমস্ত বিদ্যমান স্ন্যাপশটের তালিকা সংরক্ষণ করে।
এটি ব্যবহার করে, সার্ভিসটি দ্রুত খুঁজে বের করতে পারে যে কোন স্ন্যাপশট কোন ব্লক উচ্চতার সাথে সম্পর্কিত।
````go title="consensus/ibft/snapshot.go"
type snapshotStore struct {
	lastNumber uint64
	lock       sync.Mutex
	list       snapshotSortedList
}
````

### IBFT স্টার্টআপ {#ibft-startup}

IBFT শুরু করতে, Polygon Edge এর প্রথমে IBFT ট্রান্সপোর্ট সেট আপ করতে হবে:
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

এটি মূলত IBFT proto দিয়ে একটি নতুন টপিক তৈরি করে যাতে নতুন একটি প্রোটো বাফ মেসেজ অন্তর্ভুক্ত থাকে।<br />
মেসেজগুলো যাচাইকারীদের ব্যবহারের উদ্দেশ্যে তৈরি করা হয়েছে। Polygon Edge তারপর টপিকটিতে সাবস্ক্রাইব করে এবং সেই অনুযায়ী মেসেজ পরিচালনা করে।

#### MessageReq {#messagereq}

যাচাইকারীদের দ্বারা বিনিময়কৃত মেসেজ:
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

**MessageReq** এর মধ্যকার **ভিউ** ফিল্ডটি চেইনের ভিতরে বর্তমান নোডের অবস্থানকে নির্দেশ করে।
এটির একটি *রাউন্ড* এবং একটি *সিকুয়েন্স* অ্যাট্রিবিউট আছে।
* **রাউন্ড** দিয়ে উচ্চতার জন্য প্রস্তাবকের রাউন্ডকে নির্দেশ করা হয়
* **সিকুয়েন্স** দিয়ে ব্লকচেইনের উচ্চতাকে নির্দেশ করা হয়

IBFT ইমপ্লিমেন্টেশনে ফাইল করা *msgQueue* মেসেজ অনুরোধ সংরক্ষণ করার উদ্দেশ্যে আছে। এটি মেসেজ সাজায় *ভিউ* দিয়ে (প্রথমে সিকুয়েন্স দিয়ে, তারপর রাউন্ড দিয়ে)। এছাড়াও, IBFT ইমপ্লিমেন্টেশন সিস্টেমের বিভিন্ন স্টেটের জন্য বিভিন্ন কিউয়ের অধিকার সংরক্ষণ করে।

### IBFT স্টেট {#ibft-states}

স্টার্ট পদ্ধতি ব্যবহার করে কনসেনসাস মেকানিজম **শুরু** হবার পর এটি একটি ইনফিনিট লুপ রান করে, যা একটি স্টেট মেশিনকে সিমুলেট করে:
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

#### SyncState {#syncstate}

সমস্ত নোড প্রাথমিকভাবে **সিঙ্ক** স্টেটে শুরু হয়।

এর কারণ হল ব্লকচেইন থেকে ফ্রেশ ডেটা নিয়ে আসতে হয়। ক্লায়েন্টকে জানতে হয় যে এটি যাচাইকারী কিনা,
বর্তমান স্ন্যাপশট খুঁজুন। এই স্টেট যেকোন পেন্ডিং ব্লকের সমাধান করে।

সিঙ্ক শেষ হওয়ার পরে এবং ক্লায়েন্ট এটিকে একজন যাচাইকারী হিসেবে নির্ধারণ করলে, এটিকে **AcceptState**-এ ট্রান্সফার করতে হবে।
ক্লায়েন্টটি যাচাইকারী **না** হলে এটি সিঙ্ক করা চালিয়ে যাবে এবং **SyncState**-এ থাকবে

#### AcceptState {#acceptstate}

**Accept** স্টেট সবসময়ই স্ন্যাপশট এবং যাচাইকারীর সেট চেক করে। বর্তমান নোডটি ভ্যালিডেটর সেটে না থাকলে
এটি **Sync** স্টেটে ফিরে চলে যায়।

অন্যদিকে, নোডটি যাচাইকারী **হলে** এটি প্রস্তাবককে হিসাব করে। যদি জানা যায় যে বর্তমান নোডটিই
প্রস্তাবক, তাহলে এটি একটি ব্লক তৈরি করে এবং প্রথমে প্রস্তুতি-পূর্ব এবং পরবর্তীতে প্রস্তুতি মেসেজ পাঠায়।

* প্রস্তুতি-পূর্ব মেসেজ - প্রস্তাবক থেকে যাচাইকারীদের প্রস্তাব সম্পর্কে অবগত করার মেসেজ
* প্রস্তুতি মেসেজ - যে মেসেজে যাচাইকারীরা কোনো প্রস্তাবে সম্মতি পোষণ করেন। সকল নোড সমস্ত প্রস্তুতি মেসেজ পেয়ে থাকে।
* কমিট মেসেজ - যে মেসেজে প্রস্তাবের কমিটের তথ্য থাকে

বর্তমান নোডটি যাচাইকারী **না হলে** এটি পূর্বে দেখানো কিউ থেকে একটি মেসেজ পড়তে *getNextMessage* পদ্ধতি ব্যবহার করে। <br />
এটি প্রস্তুতি-পূর্ব মেসেজের জন্য অপেক্ষা করে। সবকিছু ঠিক-ঠাক আছে নিশ্চিত হবার পরে নোডটি **যাচাই** স্টেটে চলে যায়।

#### ValidateState {#validatestate}

**যাচাই** স্টেট যথেষ্ট সহজ - এখানে নোডগুলো শুধু মেসেজ পড়ে এবং তাদের লোকাল স্ন্যাপশট স্টেটে যোগ করে।

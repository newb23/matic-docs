---
id: consensus
title: 합의
description: Polygon 엣지의 합의 모듈에 대해 설명합니다.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - consensus
  - ibft
---

## 개요 {#overview}

**합의** 모듈은 합의 메커니즘을 위한 인터페이스를 제공합니다.

현재는 다음과 같은 합의 엔진이 제공됩니다.
* **IBFT PoA**
* **IBFT PoS**

Polygon 엣지는 모듈성 및 플러그형 상태를 유지하고자 합니다. <br />
사용성 및 사용 용이성을 저해하지 않고 새로운 합의 메커니즘이 최우선적으로 구축될 수 있도록
핵심 합의 논리를 추상화한 이유가 여기에 있습니다.

## 합의 인터페이스 {#consensus-interface}

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

***합의*** 인터페이스는 앞서 설명한 추상화의 핵심입니다. <br />
* **VerifyHeader** 메서드는 도우미 함수로, 합의 레이어는 이 함수를 **블록체인** 레이어에 노출합니다.
이 메서드는 헤더를 검증합니다.
* **Start** 메서드는 단순히 합의 프로세스 그리고 이와 관련된 모든 것을 시작합니다. 여기에는 동기화,
봉인, 수행해야 하는 모든 것이 포함됩니다.
* **Close** 메서드는 합의 연결을 닫습니다.

## 합의 구성 {#consensus-configuration}

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

데이터를 저장할 합의 프로토콜의 사용자 정의 위치 또는 합의 메커니즘에 사용하려는 사용자 정의 키-값 맵을 제출해야 할 때가 있습니다. 이 작업은 새로운 합의 인스턴스가 생성될 때 읽는 ***Config*** 구조체를
통해 수행할 수 있습니다.

## IBFT {#ibft}

### ExtraData {#extradata}

블록체인 헤더 객체는 여러 필드 중에서도 특히 **ExtraData**라는 필드를 갖고 있습니다.

IBFT는 이 추가 필드를 사용하여 블록과 관련된 연산 정보를 저장하고, 다음과 같은 질문에 답합니다.
* "누가 이 블록에 서명했습니까?"
* "이 블록의 검사기는 무엇입니까?"

IBFT를 위한 이러한 추가 필드는 다음과 같이 정의됩니다.
````go title="consensus/ibft/extra.go"
type IstanbulExtra struct {
	Validators    []types.Address
	Seal          []byte
	CommittedSeal [][]byte
}
````

### 데이터 서명 {#signing-data}

노드가 IBFT의 정보에 서명할 수 있도록 *signHash* 메서드를 활용합니다.
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
또 다른 주목할 만한 메서드는 *VerifyCommittedFields*로, 정당한 검사기의 커밋된 봉인인지 확인합니다.
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

### 스냅샷 {#snapshots}

스냅샷은 이름에서 알 수 있듯이 *스냅샷* 또는 특정 블록 높이(번호)의 시스템 *상태*를 제공합니다.

스냅샷에는 검사기인 노드 세트와 투표 정보가 포함되어 있습니다(검사기는 다른 검사기를 위해 투표할 수 있음).
검사기는 제출된 **채굴자** 헤더에 투표 정보를 포함시키고 **난스** 값을 변경합니다.
* 노드가 검사기를 삭제하려는 경우 난스 값은 **모두 1**입니다.
* 노드가 검사기를 추가하려는 경우 난스 값은 **모두 0**입니다.

스냅샷은 ***processHeaders*** 메서드를 사용하여 계산됩니다.

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

이 메서드는 일반적으로 1개의 헤더로 호출하지만, 여러 헤더로 호출해도 흐름은 동일합니다. <br />
제출된 각 헤더에 대해 IBFT는 헤더의 제안자가 검사기인지 확인해야 합니다. 이 작업은 최신 스냅샷을 구한 다음
노드가 검사기 세트에 속해 있는지를 확인함으로써 쉽게 완료할 수 있습니다.

다음으로, 난스를 확인합니다. 투표가 포함 및 집계됩니다. 투표가 충분하면 노드를 검사기 세트에 추가하거나 삭제합니다.
그다음으로는 새로운 스냅샵이 저장됩니다.

#### 스냅샷 스토어 {#snapshot-store}

스냅샷 서비스는 **snapshotStore**라는 항목을 관리하고 업데이트합니다. 이 항목은 사용 가능한 모든 스냅샷의 목록을 저장합니다.
이를 사용하여 서비스는 어떤 스냅샷이 어떤 블록 높이와 관련이 있는지 신속하게 알아낼 수 있습니다.
````go title="consensus/ibft/snapshot.go"
type snapshotStore struct {
	lastNumber uint64
	lock       sync.Mutex
	list       snapshotSortedList
}
````

### IBFT 시작 {#ibft-startup}

IBFT를 시작하기 위해 Polygon 엣지는 먼저 IBFT 전송을 설정해야 합니다.
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

이 작업은 결국 새로운 프로토 버프 메시지와 함께 IBFT 프로토로 새로운 주제를 생성합니다.<br />
이 메시지는 검사기가 사용합니다. 그런 다음 Polygon 엣지는 해당 주제를 구독하고 그에 따라 메시지를 처리합니다.

#### MessageReq {#messagereq}

검사기가 교환한 메시지:
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

**MessageReq**의 **View** 필드는 체인 내 현재 노드 위치를 나타내며,
*round* 및 *sequence* 속성이 있습니다.
* **round**는 높이 관련 제안자 라운드를 나타냅니다.
* **sequence**는 블록체인의 높이를 나타냅니다.

IBFT 구현에 제출되는 *msgQueue*의 목적은 메시지 요청을 저장하는 것입니다. 이 메서드는
*View*를 통해 메시지에 명령합니다(처음에는 sequence, 그다음에는 round를 통해). 또한, IBFT 구현에는 시스템 내 다양한 상태에 대한 서로 다른 대기열이 있습니다.

### IBFT 상태 {#ibft-states}

**Start** 메서드를 사용하여 합의 메커니즘이 시작되면 상태 머신을 시뮬레이션하는 무한 루프가 발생합니다.
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

처음에 모든 노드는 **Sync** 상태에서 시작합니다.

블록체인으로부터 새로운 데이터를 가져와야 하기 때문입니다. 클라이언트는 이것이 검사기인지 파악하고 현재 스냅샷을 찾아야 합니다. 이 상태는 대기 중인 블록을 해결합니다.

동기화가 끝나고 클라이언트가 이를 검사기라고 판단하면 **AcceptState** 상태로 전환되어야 합니다.
클라이언트가 검사기가 **아니면** 동기화가 계속되고 **SyncState** 상태를 유지합니다.

#### AcceptState {#acceptstate}

**Accept** 상태는 항상 스냅샷과 검사기 세트를 확인합니다. 현재 노드가 검사기 세트에 있지 않으면
**Sync** 상태로 돌아갑니다.

노드가 **검사기인 경우**에는 제안자를 계산합니다. 현재 노드가 제안자로 밝혀지면 블록을 구축하고 preprepare 메시지를 보낸 다음 prepare 메시지를 전송합니다.

* Preprepare 메시지 - 제안에 대해 알리기 위해 제안자가 검사기에게 보내는 메시지
* Prepare 메시지 - 검사기가 제안에 동의하는 메시지 모든 노드가 모든 prepare 메시지를 받습니다.
* Commit 메시지 - 제안 관련 커밋 정보를 담고 있는 메시지

현재 노드가 검사기가 **아니면** *getNextMessage* 메서드를 사용하여 이전에 표시된 대기열의 메시지를 읽습니다. <br />
그리고 preprepare 메시지를 기다립니다. 모든 것이 정확하다고 확인되면 노드는 **Validate** 상태로 이동합니다.

#### ValidateState {#validatestate}

**Validate** 상태는 다소 간단합니다. 이 상태에서는 모든 노드가 메시지를 읽고 로컬 스냅샷 상태에 해당 메시지를 추가합니다.

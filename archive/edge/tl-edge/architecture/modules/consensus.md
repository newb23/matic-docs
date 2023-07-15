---
id: consensus
title: Consensus
description: Paliwanag para sa consensus module ng Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - consensus
  - ibft
---

## Pangkalahatang-ideya {#overview}

Ang **Consensus** module ay nagbibigay ng interface para sa mga mekanismo ng consensus.

Sa kasalukuyan, available ang mga sumusunod na consensus engine:
* **IBFT PoA**
* **IBFT PoS**

Gusto ng Polygon Edge na mapanatili ang state ng modularity at pluggability nito. <br />
Ito ang dahilan kung bakit ang core na logic ng consensus ay nawala na bunsod ng abstraction nito, para makagawa ng mga bagong mekanismo ng consensus, nang hindi
nakokompromiso ang kakayahang magamit at kadalian ng paggamit.

## Interface ng Consensus {#consensus-interface}

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

Ang interface ng ***Consensus*** ay ang core ng nabanggit na abstraction. <br />
* Ang paraang **VerifyHeader** ay kumakatawan sa isang helper na function na ipinapakita ng layer ng consensus sa layer ng **blockchain**
Tungkulin nito na pangasiwaan ang pag-verify ng header
* Sinisimulan lang ng paraang **Start** ang proseso ng consensus, at ang lahat ng bagay na nauugnay rito. Kabilang dito ang pag-synchronize,
pag-seal, at lahat ng kailangang gawin
* Ang paraang **Close** ay nagsasara sa koneksyon ng consensus

## Configuration ng Consensus {#consensus-configuration}

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

Maaaring may mga pagkakataon kung kailan maaaring gusto mong mag-pass in ng custom na lokasyon para sa protokol ng consensus para mag-store ng data, o kaya
ng custom na key-value map na gusto mong gamitin ng mekanismo ng consensus. Maaari itong magawa sa pamamagitan ng ***Config*** struct,
na binabasa kapag may bagong nilikhang instance ng consensus.

## IBFT {#ibft}

### ExtraData {#extradata}

Ang blockchain header object, bukod sa iba pang field, ay may field na tinatawag na **ExtraData**.

Ginagamit ng IBFT ang karagdagang field na ito para mag-store ng impormasyon tungkol sa pagpapatakbo kaugnay sa block, sumagot ng mga tanong gaya ng:
* "Sino ang nag-sign sa block na ito?"
* "Sino ang mga validator para sa block na ito?"

Ang mga karagdagang field na ito para sa IBFT ay tinutukoy ayon sa sumusunod:
````go title="consensus/ibft/extra.go"
type IstanbulExtra struct {
	Validators    []types.Address
	Seal          []byte
	CommittedSeal [][]byte
}
````

### Pag-sign ng Data {#signing-data}

Para ma-sign ng node ang impormasyon sa IBFT, ginagamit nito ang paraang *signHash*:
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
Ang isa pang mahalagang paraan ay ang paraang *VerifyCommittedFields* na nagbe-verify na mula sa mga valid na validator ang mga na-commit na seal:
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

### Mga Snapshot {#snapshots}

Ang mga Snapshot, gaya ng ipinapahiwatig ng pangalan, ay nariyan para magbigay ng *snapshot*, o para ipaalam ang *state* ng system sa anumang block height (numero).

Ang mga Snapshot ay naglalaman ng set ng mga node na mga validator, pati na rin ng impormasyon sa pagboto (maaaring bomoto ang mga validator para sa iba pang validator).
Isinasama ng mga validator ang impormasyon sa pagboto sa **Miner** header na inihahain, at binabago ng mga ito ang value ng **nonce**:
* Ang nonce ay **1s lahat** kung gusto ng node na mag-alis ng validator
* Ang nonce ay **0s lahat** kung gusto ng node na magdagdag ng validator

Kinakalkula ang mga Snapshot gamit ang paraang ***processHeaders***:

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

Ang paraang ito ay karaniwang kinakailangan sa 1 header, ngunit pareho ang daloy kahit sa maramihang header. <br />
Para sa bawat na-pass in na header, kailangang i-verify ng IBFT na ang proposer ng header ay ang validator. Madali itong magagawa sa pamamagitan ng
pagkuha sa pinakabagong snapshot, at pagsuri kung ang node ay nasa validator set.

Susunod, sinusuri ang nonce. Ang boto ay isinasama, at binibilang - at kung may sapat na bilang ng mga boto, idadagdag/aalisin ang node sa
validator set, at pagkatapos nito, sine-save ang bagong snapshot.

#### Snapshot Store {#snapshot-store}

Pinapamahalaan at ina-update ng serbisyo ng snapshot ang entity na tinatawag na **snapshotStore**, na nagi-store ng listahan ng lahat na available na snapshot.
Gamit ito, mabilis na natutukoy ng serbisyo kung aling snapshot ang nauugnay sa kaukulang block height.
````go title="consensus/ibft/snapshot.go"
type snapshotStore struct {
	lastNumber uint64
	lock       sync.Mutex
	list       snapshotSortedList
}
````

### Pag-start Up ng IBFT {#ibft-startup}

Para i-start up ang IBFT, kailangan muna ng Polygon Edge na i-set up ang pag-transport ng IBFT:
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

Pangunahing gumagawa ito ng bagong paksa gamit ang IBFT proto, na may bagong mensahe ng proto buff.<br />
Ang mga mensaheng ito ay nilalayon para gamitin ng mga validator. Pagkatapos, magsu-subscribe ang Polygon Edge sa paksa at pinapangasiwaan nito ang mga mensahe nang naaayon.

#### MessageReq {#messagereq}

Ang mensaheng ipinapadala ng mga validator sa bawat isa:
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

Ang field na **View** sa **MessageReq** ay kumakatawan sa kasalukuyang posisyon ng node sa loob ng chain.
Ito ay may *round* at *sequence* na katangian.
* Ang **round** ay kumakatawan sa round ng proposer para sa height
* Ang **sequence** ay kumakatawan sa height ng blockchain

Ang *msgQueue* na inihahain sa implementasyon ng IBFT ay may layunin na mag-store ng mga kahilingang mensahe. Inaayos nito ang mga mensahe ayon sa
*View* (una ayon sa sequence, pagkatapos ay ayon sa round). Ang implementasyon ng IBFT ay mayroon ding iba't ibang queue para sa iba't ibang state sa system.

### Mga State ng IBFT {#ibft-states}

Pagkatapos na simulan ang mekanismo ng consensus gamit ang paraang **Start**, tumatakbo ito sa walang hanggang loop na nagsi-simulate ng isang state machine:
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

Ang lahat ng node ay inisyal na nagsisimula sa state na **Sync**.

Ito ay dahil ang fresh data ay kailangang i-fetch mula sa blockchain. Kinakailangan ng client na alamin kung ito ang validator,
hanapin ang kasalukuyang snapshot. Nilulutas ng state na ito ang anumang nakabinbing mga block.

Pagkatapos ng sync, at matutukoy ng client na ito nga ay isang validator, kailangan nitong lumipat sa **AcceptState**.
Kung **hindi** validator ang client, ito ay patuloy na magsi-sync, at mananatili sa **SyncState**

#### AcceptState {#acceptstate}

Palaging sinusuri ng state na **Accept** ang snapshot at ang validator set. Kung ang kasalukuyang node ay wala sa validators set,
bumabalik ito sa state na **Sync**.

Sa kabilang banda, kung ang node **ay** ay validator, kinakalkula nito ang proposer. Kung lalabas na ang kasalukuyang node ay ang
proposer, gumagawa ito ng block, at nagpapadala ito ng mga mensahe sa paunang paghahanda at pagkatapos ay mga mensahe sa paghahanda.

* Mga mensahe sa preprepare o paunang paghahanda - mga mensaheng ipinapadala ng mga proposer sa mga validator, para ipaalam sa kanila ang tungkol sa proposal
* Mga mensahe sa paghahanda - mga mensahe kung saan ang mga validator ay sumasang-ayon sa isang proposal. Natatanggap ng lahat ng node ang lahat ng mensahe sa paghahanda
* Mga mensahe sa commit - mga mensaheng naglalaman ng impormasyon tungkol sa commit para sa proposal

Kung **hindi** validator ang kasalukuyang node, ginagamit nito ang paraang *getNextMessage* para magbasa ng mensahe mula sa naunang ipinakitang queue. <br />
Hinihintay nito ang mga mensahe sa paunang paghahanda. Kapag nakumpirma na nitong tama ang lahat, lilipat ang node sa state na **Validate**.

#### ValidateState {#validatestate}

Ang state na **Validate** ay simple lamang - ang ginagawa ng lahat ng node sa state na ito ay magbasa ng mga mensahe at idagdag ang mga ito sa state ng kanilang lokal na snapshot.

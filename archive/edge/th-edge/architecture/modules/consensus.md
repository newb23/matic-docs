---
id: consensus
title: ฉันทามติ
description: คำอธิบายสำหรับโมดูลฉันทามติของ Polygon Edge
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - consensus
  - ibft
---

## ภาพรวม {#overview}

โมดูล**ฉันทามติ**ให้อินเทอร์เฟซสำหรับกลไกฉันทามติ

ปัจจุบันมีเอนจิ้นฉันทามติดังต่อไปนี้:
* **IBFT PoA**
* **IBFT PoS**

Polygon Edge ต้องการรักษาสถานะของ Modularity และ Pluggability<br />นี่คือเหตุผลที่มีการแยกลอจิกฉันทามติหลักออกไป ดังนั้นจึงสามารถสร้างกลไกฉันทามติใหม่ได้ โดยไม่กระทบความสามารถในการใช้และความง่ายในการใช้งาน

## อินเทอร์เฟซฉันทามติ {#consensus-interface}

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

อินเทอร์เฟซ***ฉันทามติ*** เป็นแกนหลักของ Abstraction ที่กล่าวถึง<br />
* เมธอด **VerifyHeader** แสดงถึงฟังก์ชันตัวช่วยที่เลเยอร์ฉันทามติแสดงให้เลเยอร์ **บล็อกเชน**เห็นมีไว้เพื่อจัดการการตรวจสอบส่วนหัว
* เมธอด **Start** เพียงแค่เริ่มต้นกระบวนการฉันทามติและทุกอย่างที่เกี่ยวข้อง ซึ่งรวมถึงการซิงค์การซีล และทุกอย่างที่ต้องทำ
* เมธอด **Close** จะปิดการเชื่อมต่อฉันทามติ

## การกำหนดค่าฉันทามติ {#consensus-configuration}

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

อาจมีบางครั้งที่คุณอาจต้องการส่งผ่านตำแหน่งที่กำหนดเองสำหรับโปรโตคอลฉันทามติเพื่อจัดเก็บข้อมูล หรือบางทีก็จัดเก็บการแมปคีย์-ค่าที่กำหนดเองที่คุณต้องการให้กลไกฉันทามติใช้ซึ่งสามารถทำได้ผ่านโครงสร้าง ***Config***ซึ่งจะมีการอ่านเมื่อสร้างอินสแตนซ์ฉันทามติใหม่ขึ้น

## IBFT {#ibft}

### ExtraData {#extradata}

อ็อบเจ็กต์ส่วนหัวของบล็อกเชน ซึ่งเป็นหนึ่งในฟิลด์ต่างๆ ที่เรียกว่า **ExtraData**

IBFT ใช้ฟิลด์พิเศษนี้เพื่อจัดเก็บข้อมูลการดำเนินงานเกี่ยวกับบล็อก โดยตอบคำถามเช่น:
* "ใครลงนามบล็อกนี้"
* "ใครคือตัวตรวจสอบความถูกต้องของบล็อกนี้"

มีการกำหนดฟิลด์พิเศษเหล่านี้สำหรับ IBFT ไว้ดังนี้:
````go title="consensus/ibft/extra.go"
type IstanbulExtra struct {
	Validators    []types.Address
	Seal          []byte
	CommittedSeal [][]byte
}
````

### การลงนามในข้อมูล {#signing-data}

เพื่อให้โหนดลงนามข้อมูลใน IBFT โหนดจะใช้ประโยชน์จากเมธอด *signHash*:
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
อีกเมธอดที่สำคัญคือเมธอด *VerifyCommittedFields* ซึ่งตรวจสอบว่าซีลที่คอมมิตมาจากตัวตรวจสอบความถูกต้องที่ถูกต้อง:
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

### สแนปชอต {#snapshots}

ตามที่ชื่อบอกโดยนัย สแนปชอตมีไว้เพื่อแสดง*ภาพ*หรือ*สถานะ*ของระบบที่ทุกระดับความสูงของบล็อก (ตัวเลข)

สแนปชอตประกอบด้วยชุดโหนดที่เป็นตัวตรวจสอบความถูกต้อง เช่นเดียวกับข้อมูลการโหวต (ตัวตรวจสอบความถูกต้องสามารถโหวตให้กับตัวตรวจสอบความถูกต้องอื่นๆ)ตัวตรวจสอบความถูกต้องรวมข้อมูลการโหวตในฟิลด์หัวข้อ **Miner** และเปลี่ยนค่าของ **Nonce**:
* Nonce จะเป็น **1 ทั้งหมด** หากโหนดต้องการลบตัวตรวจสอบความถูกต้อง
* Nonce จะเป็น **0 ทั้งหมด** หากโหนดต้องการเพิ่มตัวตรวจสอบความถูกต้อง

คำนวณสแนปชอตโดยใช้เมธอด ***processHeaders***:

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

โดยปกติ จะมีการเรียกเมธอดนี้พร้อมกับ 1 ส่วนหัว แต่ขั้นตอนการประมวลผลจะเหมือนกัน แม้ว่าจะมีหลายส่วนหัว <br />
สำหรับแต่ละส่วนหัวที่ส่งผ่าน IBFT จำเป็นต้องตรวจสอบว่าผู้เสนอส่วนหัวเป็นตัวตรวจสอบความถูกต้องหรือไม่ซึ่งสามารถทำได้ง่ายๆ โดยการนำสแนปชอตล่าสุดมาตรวจสอบว่าโหนดอยู่ในชุดตัวตรวจสอบความถูกต้องหรือไม่

จากนั้น จะทำการตรวจสอบ Nonceการโหวตจะได้รับการรวมและนับ - และหากมีการโหวตเพียงพอ จะมีการเพิ่ม/ลบโหนดจากชุดตัวตรวจสอบความถูกต้อง จากนั้นจึงบันทึกสแนปชอตใหม่

#### Snapshot Store {#snapshot-store}

บริการสแนปชอตจะจัดการและอัปเดตเอนทิตีที่เรียกว่า **snapshotStore** ซึ่งจัดเก็บรายการสแนปชอตที่มีอยู่ทั้งหมดบริการใช้รายการนี้เพื่อให้ทราบได้อย่างรวดเร็วว่าเกี่ยวข้องกับสแนปชอตใดที่ความสูงของบล็อกในระดับใด
````go title="consensus/ibft/snapshot.go"
type snapshotStore struct {
	lastNumber uint64
	lock       sync.Mutex
	list       snapshotSortedList
}
````

### การเริ่มต้น IBFT {#ibft-startup}

Polygon Edge จำเป็นต้องตั้งค่าการขนส่ง IBFT ก่อนถึงจะเริ่มต้น IBFT ได้:
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

โดยหลักแล้ว จะมีการสร้างหัวข้อใหม่ด้วย IBFT Proto พร้อมข้อความ Proto Buff ใหม่<br />ควรใช้ข้อความดังกล่าวโดยตัวตรวจสอบความถูกต้องจากนั้น Polygon Edge จะสมัครติดตามหัวข้อและจัดการข้อความตามนั้น

#### MessageReq {#messagereq}

ข้อความที่แลกเปลี่ยนโดยตัวตรวจสอบความถูกต้อง:
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

ฟิลด์ **View** ใน **MessageReq** จะแสดงตำแหน่งโหนดปัจจุบันภายในเชนซึ่งมีแอตทริบิวต์ *round* และ *sequence*
* **round** แสดงถึงรอบของผู้เสนอสำหรับความสูงดังกล่าว
* **sequence** แสดงถึงความสูงของบล็อกเชน

*msgQueue* ที่ยื่นในการนำ IBFT ไปใช้มีวัตถุประสงค์เพื่อจัดเก็บคำขอข้อความโดยออกคำสั่งข้อความตาม*View* (เริ่มจากตามลำดับ จากนั้นก็ตามรอบ)การนำ IBFT ไปใช้ยังมีคิวที่แตกต่างกันสำหรับสถานะที่แตกต่างกันในระบบ

### สถานะ IBFT {#ibft-states}

หลังจากเริ่มกลไกฉันทามติโดยใช้เมธอด **Start** กลไกจะเรียกใช้ลูปไม่จำกัด ซึ่งจำลอง State Machine:
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

เบื้องต้นโหนดทั้งหมดจะเริ่มต้นในสถานะ **Sync**

เนื่องจากจำเป็นต้องดึงข้อมูลใหม่จากบล็อกเชนไคลเอ็นต์ต้องค้นหาว่าเป็นตัวตรวจสอบความถูกต้องหรือไม่ค้นหาสแนปชอตปัจจุบันสถานะนี้จะแก้ไขบล็อกที่รอดำเนินการ

หลังการซิงค์เสร็จสิ้น และไคลเอ็นต์พิจารณาแล้วว่าเป็นตัวตรวจสอบความถูกต้อง ก็จำเป็นต้องถ่ายโอนไปยัง **AcceptState**แต่ถ้าไคลเอ็นต์ **ไม่ใช่** ตัวตรวจสอบความถูกต้อง ไคลเอ็นต์จะทำการซิงค์ต่อไป และอยู่ใน **SyncState**

#### AcceptState {#acceptstate}

สถานะ **Accept** จะตรวจสอบสแนปชอตและชุดตัวตรวจสอบความถูกต้องเสมอ หากโหนดปัจจุบันไม่อยู่ในชุดตัวตรวจสอบความถูกต้องก็จะย้ายกลับไปที่สถานะ **Sync**

ในทางกลับกัน ถ้าโหนด **เป็น**  ตัวตรวจสอบความถูกต้อง โหนดก็จะคำนวณผู้เสนอหากปรากฎว่าโหนดปัจจุบันคือผู้เสนอสร้าง โหนดจะสร้างบล็อกและส่งข้อความ preprepare จากนั้นก็เป็นข้อความ prepare

* ข้อความ Preprepare - ข้อความที่ผู้เสนอส่งถึงตัวตรวจสอบความถูกต้องเพื่อแจ้งให้ทราบเกี่ยวกับข้อเสนอ
* ข้อความ Prepare - ข้อความที่ตัวตรวจสอบความถูกต้องเห็นด้วยกับข้อเสนอโหนดทั้งหมดได้รับข้อความ prepare ทั้งหมด
* ข้อความ Commit - ข้อความที่มีข้อมูล Commit สำหรับข้อเสนอ

ถ้าโหนดปัจจุบัน **ไม่ใช่** ตัวตรวจสอบความถูกต้อง โหนดดังกล่าวจะใช้เมธอด  *getNextMessage* เพื่ออ่านข้อความจากคิวที่แสดงไว้ก่อนหน้านี้ <br />โหนดจะรอข้อความ preprepareเมื่อยืนยันแล้วว่าทุกอย่างถูกต้อง โหนดจะย้ายไปยังสถานะ **Validate**

#### ValidateState {#validatestate}

สถานะ **Validate** ค่อนข้างเรียบง่าย - สิ่งที่โหนดทั้งหมดทำในสถานะนี้คือการอ่านข้อความและเพิ่มลงในสถานะสแนปชอตภายในของตน

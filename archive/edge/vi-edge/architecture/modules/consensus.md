---
id: consensus
title: Đồng thuận
description: Giải thích về mô-đun đồng thuận của Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - consensus
  - ibft
---

## Tổng quan {#overview}

Mô-đun **Consensus** (Đồng thuận) cung cấp giao diện cho các cơ chế đồng thuận.

Hiện tại, có sẵn các công cụ đồng thuận sau:
* **IBFT PoA**
* **IBFT PoS**

Polygon Edge muốn duy trì trạng thái mô-đun và khả năng cắm thêm. <br />Đây là lý do logic đồng thuận cốt lõi đã bị trừu tượng hóa, nên các cơ chế đồng thuận mới có thể được xây dựng trên cơ sở đó mà không ảnh hưởng đến khả năng sử dụng và dễ sử dụng.

## Giao diện Consensus {#consensus-interface}

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

Giao diện ***Consensus*** là cốt lõi của sự trừu tượng được đề cập. <br />
* Phương thức **VerifyHeader** đại diện cho chức năng của trình trợ giúp mà lớp đồng thuận hiển thị cho lớp **blockchain** Nó ở đó để xử lý xác minh tiêu đề
* Phương thức **Start** chỉ đơn giản là bắt đầu quá trình đồng thuận và mọi thứ liên quan đến nó. Điều này gồm quá trình đồng bộ, niêm phong và thực hiện mọi thứ cần thiết
* Phương thức **Close** đóng kết nối đồng thuận

## Cấu hình đồng thuận {#consensus-configuration}

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

Đôi khi bạn có thể muốn chuyển đến một vị trí tùy chỉnh để giao thức đồng thuận lưu trữ dữ liệu hoặc có thể một bản đồ khóa-giá trị tùy chỉnh mà bạn muốn cơ chế đồng thuận sử dụng. Có thể đạt được điều này thông qua cấu trúc ***Config***, được đọc khi một phiên bản đồng thuận mới được tạo.

## IBFT {#ibft}

### ExtraData {#extradata}

Đối tượng tiêu đề blockchain, trong số các trường khác, có một trường được gọi là **ExtraData**.

IBFT sử dụng trường bổ sung này để lưu trữ thông tin vận hành liên quan đến khối, trả lời các câu hỏi như:
* "Ai ký khối này?"
* "Ai là người xác thực cho khối này?"

Các trường bổ sung cho IBFT này được định nghĩa như sau:
````go title="consensus/ibft/extra.go"
type IstanbulExtra struct {
	Validators    []types.Address
	Seal          []byte
	CommittedSeal [][]byte
}
````

### Dữ liệu ký {#signing-data}

Để nút ký thông tin trong IBFT, nó sử dụng phương thức *signHash*:
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
Một phương thức đáng chú ý khác là phương thức *VerifyComiledFields*, xác minh rằng các con dấu đã cam kết là từ các trình xác thực hợp lệ:
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

### Snapshot {#snapshots}

*Snapshot*, như tên gọi của nó, có ở đó để cung cấp ảnh chụp nhanh hoặc *trạng thái* của hệ thống ở bất kỳ chiều cao khối (số) nào.

Ảnh chụp nhanh chứa một tập hợp các nút là người xác thực, cũng như thông tin biểu quyết (người xác thực này có thể bỏ phiếu cho người xác thực khác). Trình xác thực gồm thông tin biểu quyết trong tiêu đề **Miner** và thay đổi giá trị của **nonce**:
* Nonce sẽ **toàn số 1** nếu nút muốn xóa trình xác thực
* Nonce sẽ **toàn số 0** nếu nút muốn thêm trình xác thực

Ảnh chụp nhanh được đếm bằng phương thức ***processHeaders***:

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

Phương thức này thường được gọi với 1 tiêu đề, nhưng luồng vẫn giống nhau ngay cả với nhiều tiêu đề. <br />Với mỗi tiêu đề được chuyển vào, IBFT cần xác minh rằng người đề xuất tiêu đề là người xác thực. Có thể dễ dàng thực hiện điều này bằng cách lấy ảnh chụp nhanh mới nhất và kiểm tra xem nút có nằm trong tập hợp trình xác thực hay không.

Tiếp theo, nonce được kiểm tra. Phiếu bầu được đưa vào và đánh dấu - nếu có đủ phiếu bầu, một nút sẽ được thêm/xóa khỏi tập hợp trình xác thực, sau đó ảnh chụp nhanh mới sẽ được lưu.

#### Snapshot Store {#snapshot-store}

Dịch vụ snapshot quản lý và cập nhật một thực thể được gọi là **snapshotStore**, nơi lưu trữ danh sách của tất cả snapshot có sẵn. Sử dụng nó, dịch vụ có thể nhanh chóng tìm ra ảnh chụp nhanh nào được liên kết với chiều cao khối (số lượng) nào.
````go title="consensus/ibft/snapshot.go"
type snapshotStore struct {
	lastNumber uint64
	lock       sync.Mutex
	list       snapshotSortedList
}
````

### Khởi động IBFT {#ibft-startup}

Để khởi động IBFT, trước tiên Polygon Edge cần thiết lập truyền tải IBFT:
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

Về cơ bản, nó tạo ra một chủ đề mới bằng giao thức IBFT, với thông báo bộ đệm giao thức mới.<br /> Các thông báo được các trình xác thực sử dụng. Sau đó, Polygon Edge đăng ký chủ đề và xử lý các thông báo tương ứng.

#### MessageReq {#messagereq}

Thông báo được trao đổi bằng các trình xác thực:
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

Trường **View** trong **MessageReq** đại diện cho vị trí nút hiện tại bên trong chuỗi. Nó có thuộc tính *round* và *sequence*.
* **round** đại diện cho số vòng đồng thuận mà người đề xuất cho chiều cao (số lượng khối)
* **sequence** đại diện cho chiều cao (số lượng khối) của blockchain

*MsgQueue* được gửi trong quá trình triển khai IBFT nhằm mục đích lưu trữ các yêu cầu thông báo. Nó sắp xếp các thông báo theo  *View* (trước tiên là theo trình tự, sau đó theo vòng). Quá trình triển khai IBFT cũng sở hữu các hàng đợi khác nhau cho các trạng thái khác nhau trong hệ thống.

### Trạng thái IBFT {#ibft-states}

Sau khi cơ chế đồng thuận được khởi động bằng phương thức **Start**, nó chạy một vòng lặp vô hạn mô phỏng một máy trạng thái:
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

Tất cả các nút bắt đầu từ trạng thái **Sync**.

Điều này là vì dữ liệu mới cần được tìm nạp từ blockchain. Máy khách cần tìm hiểu xem đó có phải là trình xác thực hay không, tìm ảnh chụp nhanh hiện tại. Trạng thái này giải quyết mọi khối đang chờ xử lý.

Sau khi quá trình đồng bộ kết thúc và máy khách xác định nó thực sự là một trình xác thực, nó cần phải chuyển sang **AcceptState**. Nếu máy khách **không** phải là trình xác thực, máy khách sẽ tiếp tục đồng bộ và ở trạng thái **SyncState**

#### AcceptState {#acceptstate}

Trạng thái **Accept** luôn kiểm tra ảnh chụp nhanh và tập hợp trình xác thực. Nếu nút hiện tại không nằm trong tập hợp trình xác thực, nó chuyển về trạng thái **Sync**.

Mặt khác, nếu nút **là** một trình xác thực, nó sẽ tính toán người đề xuất. Nếu nó chỉ ra rằng nút hiện tại là người đề xuất, nó sẽ dựng một khối, và gửi bản chuẩn bị trước và sau đó chuẩn bị thông báo.

* Preprepare messages - tin nhắn do người đề xuất gửi đến người xác thực nhằm thông báo cho họ về đề xuất
* Prepare messages - thông báo trong đó người xác thực đồng ý về một đề xuất. Tất cả các nút đều nhận được tất cả thông báo chuẩn bị
* Commit messages - tin nhắn chứa thông tin cam kết dành cho đề xuất

Nếu nút hiện tại **không phải là** trình xác thực, nó sẽ sử dụng phương thức *getNextMessage* để đọc thông báo từ hàng đợi được hiển thị trước đó. <br />Nó sẽ chờ preprepare messages. Khi đã xác nhận mọi thứ đều đúng, nút sẽ chuyển sang trạng thái **Validate**.

#### ValidateState {#validatestate}

Trạng thái **Validate** khá đơn giản - tất cả việc mà các nút làm ở trạng thái này là đọc thông báo và thêm chúng vào trạng thái ảnh chụp nhanh cục bộ của mình.

---
id: consensus
title: コンセンサス
description: Polygon Edgeのコンセンサスモジュールに関する説明。
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - consensus
  - ibft
---

## 概要 {#overview}

**コンセンサス**モジュールはコンセンサスメカニズムのためのインターフェースを提供します。

現在、以下のコンセンサスエンジンが利用できます：
* **IBFT PoA**
* **IBFT PoS**

Polygon Edgeはモジュール性とプラグビリティの状態を維持したいと考えています。 <br />
これがコンセンサスロジックが抽象化された理由であり、利便性や使いやすさを犠牲にせずに新しいコンセンサスメカニズムを構築できるようになりました。

## コンセンサスインターフェース {#consensus-interface}

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

 ***コンセンサス***インターフェースは前述の抽象化の中心です。<br />
* **VerifyHeader**メソッドはコンセンサスレイヤーが**ブロックチェーン**レイヤーに露出するヘルパー機能を表します。そこでヘッダー検証を処理します。
* **スタート**メソッドは単純にコンセンサスプロセスとそれに伴うすべてのものをスタートさせます。これには同期化、シーリング、必要なすべてのものを含みます。
* **クローズ**メソッドはコンセンサス接続を閉じます

## コンセンサス設定 {#consensus-configuration}

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

コンセンサスプロトコルがデータを格納するためのカスタムの場所や、またはコンセンサスメカニズムにおいて使用するカスタムのキーバリューマップを渡したい時もあります。これは ***設定***ストラクチャを通じて、このストラクチャが新しいコンセンサスインスタンスが作成される時読み取られることで達成することができます。

## IBFT {#ibft}

### ExtraData {#extradata}

ブロックチェーンヘッダオブジェクトは、他のフィールドとともに**ExtraData**と呼ばれるフィールドを持っています。

IBFTはこの追加のフィールドを使用してブロックに関する操作情報を保存し、次のような質問に答えます：
* 「誰がこのブロックに署名したのか？」
* 「このブロックのバリデータは誰か？」

これらのIBFT用の追加フィールドは次のように定義されます：
````go title="consensus/ibft/extra.go"
type IstanbulExtra struct {
	Validators    []types.Address
	Seal          []byte
	CommittedSeal [][]byte
}
````

### 署名データ {#signing-data}

ノードがIBFTで情報に署名するためには、*signHash*メソッドを活用します：
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
もう1つの注目されるメソッドは*VerifyCommittedFields*メソッドで、これはコミットされたシールが有効なバリデータからのものであることを検証します：
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

### スナップショット {#snapshots}

スナップショットは名前が示すように、あらゆるブロックの高さ（数字）での*スナップショット*、またはシステムの*状態*を提供するためにそこにあります。

スナップショットにはバリデータであるノードのセットや投票情報（バリデータは他のバリデータに投票できる）が含まれています。バリデータには**Miner**ヘッダにファイルされた投票情報が含まれ、**ノンス**の値を変更します：
* ノードがバリデータを削除したい場合は、ノンスはすべて**1**です
* ノードがバリデータを追加したい場合は、ノンスはすべて**0**です

スナップショットは***processHeaders***メソッドを使用して計算されます：

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

このメソッドは通常は1ヘッダで呼び出されますが、複数のヘッダでもフローは同じです。 <br />
各渡されたヘッダについて、IBFTはヘッダの提案者がバリデータであることを検証する必要があります。これは簡単にできるもので
最新のスナップショットを取得し、ノードがバリデータセットにいるかチェックします。

次にノンスがチェックされます。投票は含まれ、集計されます - そして十分な票がある場合はノードがバリデータセットから追加／削除され、その後新しいスナップショットが保存されます。

#### スナップショットストア {#snapshot-store}

スナップショットサービスは**snapshotStore**というエンティティを管理、更新します。これは使用可能なすべてのスナップショットのリストを格納します。それを使用すると、サービスはどのスナップショットがどのブロックの高さと関連付けられているかをすみやかに把握できます。
````go title="consensus/ibft/snapshot.go"
type snapshotStore struct {
	lastNumber uint64
	lock       sync.Mutex
	list       snapshotSortedList
}
````

### IBFTスタートアップ {#ibft-startup}

IBFTをスタートアップするためには、Polygon Edgeは最初にIBFTトランスポートを設定する必要があります。
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

これは実質的に新しいトピックをIBFTプロトと新しいプロトバフメッセージで作成します。<br />
メッセージはバリデータに使用されることを意図しています。Polygon Edgeはその後トピックにサブスクライブし、それに応じてメッセージを処理します。

#### MessageReq {#messagereq}

バリデータによって交換されるメッセージ：
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

**MessageReq**の**View**フィールドは、チェーン内の現在のノードの位置を表します。
これは*ラウンド*と*シーケンス*の属性を持っています。
* **ラウンド**は高さのプロポーザラウンドを表します
* **シーケンス**はブロックチェーンの高さを表します

IBFT実装にファイルされた*msgQueue*にはメッセージ要求を格納する目的があります。メッセージへの命令は
*View*（最初にシーケンス、次にラウンド）により行われます。IBFT実装はシステム内の異なるステートに異なるキューを保有しています。

### IBFTステート {#ibft-states}

コンセンサスメカニズムが**Start**メソッドを使用して開始した後は、ステートマシンをシミュレートする無限ループへと実行します：
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

すべてのノードは**Sync**状態でスタートします。

これはブロックチェーンから新しいデータを取得する必要があるためです。クライアントはそれがバリデータであるかどうかを調べ、現在のスナップショットを見つけるる必要があります。このステートはあらゆる保留中のブロックを解決します。

同期が終了し、クライアントが実際にバリデータであると判断した後、これを**AcceptState**に転送する必要があります。クライアントがバリデータで**ない**場合、同期を続けて、**SyncState**に留まります。

#### AcceptState {#acceptstate}

**Accept**ステートは常にスナップショットとバリデータセットをチェックします。現在のノードがバリデータセットにない場合は、**Sync**ステートに戻ります。

一方、ノードがバリデータで**ある**場合は、プロポーザーを計算します。現在のノードがプロポーザーであると判明した場合は、ブロックを構築し、プリプリペアメッセージを送信し、その後プリペアメッセージを送信します。

* プリプリペアメッセージ - プロポーザーがバリデータに送信し、提案について知らせるメッセージ
* プリペアメッセージ - バリデータが提案に同意するメッセージすべてのノードがすべてのプリペアメッセージを受信します。
* コミットメッセージ - 提案のコミット情報を含むメッセージ

現在のノードがバリデータで**ない**場合、*getNextMessage*メソッドを使用して以前に表示されたキューからメッセージを読み取ります。<br />
プリプリペアメッセージを待っています。すべてが正しいことを確認すると、ノードは**Validate**ステートに移動します。

#### ValidateState {#validatestate}

**Validate**ステートはかなりシンプルです - このステートでノードがすべきことはメッセージを読み、これをローカルなスナップショットステートに追加することです。

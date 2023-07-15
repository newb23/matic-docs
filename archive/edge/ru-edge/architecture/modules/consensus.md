---
id: consensus
title: Консенсус
description: Объяснение к модулю консенсуса в Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - consensus
  - ibft
---

## Обзор {#overview}

Модуль **Консенсус** предоставляет интерфейс для механизмов консенсуса.

В настоящее время доступны следующие механизмы консенсуса:
* **IBFT PoA**
* **IBFT PoS**

Polygon Edge хочет поддерживать состояние модульности и подключаемости. <br />
Базовая логика консенсуса абстрагирована, что позволяет строить поверх нее новые механизмы консенсуса без
снижения полезности и удобства использования.

## Интерфейс консенсуса {#consensus-interface}

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

Интерфейс ***Консенсуса*** лежит в основе вышеописанного абстрагирования. <br />
* Метод **VerifyHeader** представляет функцию помощника, которую уровень консенсуса открывает для уровня **блокчейна**
Он отвечает за проверку заголовков
* Метод **Start** просто запускает процесс консенсуса и все, что с ним связано, в том числе синхронизацию,
запечатывание и другие необходимые задачи
* Метод **Close** закрывает соединение консенсуса

## Конфигурация консенсуса {#consensus-configuration}

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

Иногда бывает необходимо передать пользовательское местоположение для хранения данных протоколом консенсуса или пользовательскую карту ключ-значение для использования в механизме консенсуса. Для этого служит структура ***Config***,
которая считывается при создании нового экземпляра консенсуса.

## IBFT {#ibft}

### ExtraData {#extradata}

Объект заголовка блокчейна имеет много полей, в том числе и поле **ExtraData**.

IBFT использует это дополнительное поле для хранения операционной информации о блоке, позволяющей ответить на такие вопросы, как:
* «Кто подписал этот блок?»
* «Кто отвечает за валидацию этого блока?»

Эти дополнительные поля для IBFT определяются следующим образом:
````go title="consensus/ibft/extra.go"
type IstanbulExtra struct {
	Validators    []types.Address
	Seal          []byte
	CommittedSeal [][]byte
}
````

### Подписание данных {#signing-data}

Чтобы нод мог подписать информацию в IBFT, он использует метод *signHash*:
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
Также стоит отметить метод *VerifyCommittedFields*, подтверждающий, что поставленные печати поступили от корректных валидаторов:
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

### Снимки {#snapshots}

Snapshots создают  *снимки* или отпечатки *состояния* системы при любой высоте блока (число).

Снимки содержат набор нодов, которые являются валидаторами, а также информацию о голосовании (валидаторы могут голосовать за других валидаторов).
Валидаторы включают информацию о голосовании в поле заголовка **Miner** и меняют значение **nonce**:
* Nonce состоит из **всех единиц**, если нод хочет удалить валидатор
* Nonce состоит из **всех нулей**, если нод хочет добавить валидатор

Расчет Snapshots производится с использованием метода ***processHeaders***:

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

Этот метод обычно вызывается с 1 заголовком, но при этом используется тот же процесс, что и при наличии нескольких заголовков. <br />
Для каждого переданного заголовка IBFT необходимо подтвердить, что автор предложения заголовка является валидатором. Для этого можно легко
использовать самый актуальный снимок и проверить, включен ли нод в набор валидаторов.

После этого выполняется проверка nonce. Голос включается и учитывается, а при наличии достаточного количества голосов нод добавляется/удаляется из набора валидаторов, после чего сохраняется новый снимок.

#### Хранилище снимков {#snapshot-store}

Сервис снимков управляет хранилищем **snapshotStore**, которое хранит список всех доступных снимков, и обновляет его.
Используя его, сервис может быстро определить, какой снимок связан с какой высотой блока.
````go title="consensus/ibft/snapshot.go"
type snapshotStore struct {
	lastNumber uint64
	lock       sync.Mutex
	list       snapshotSortedList
}
````

### Запуск IBFT {#ibft-startup}

Для запуска IBFT Polygon Edge требуется предварительно настроить транспорт IBFT:
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

При этом создается новая тема с прототипом IBFT с новым сообщением поддержки прототипа.<br />
Сообщения предназначены для использвоания валидаторами. Затем Polygon Edge подписывается на тему и обрабатывает сообщения соответствующим образом.

#### MessageReq {#messagereq}

Валидаторы обмениваются сообщениями:
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

Поле **View** в **MessageReq** показывает текущую позицию нода внутри цепочки.
У него имеются атрибуты *round* и *sequence*.
* **round** представляет раунд автора предложения для высоты
* **sequence** представляет высоту блокчейна

Очередь *msgQueue* в реализации IBFT предназначена для хранения запросов сообщений. Она упорядочивает сообщения по параметру *View* (вначале используя критерий sequence, а затем критерий round). Реализация IBFT имеет разные очереди для разных состояний системы.

### Состояния IBFT {#ibft-states}

После запуска механизма консенсуса с помощью метода **Start** он входит в бесконечный цикл, моделирующий машину состояния:
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

Все ноды первоначально запускаются в состоянии **Sync**.

Это связано с необходимостью доставки из блокчейна свежих данных. Клиенту нужно определить, является ли он валидатором,
найти актуальный снимок. Это состояние обрабатывает все блоки в состоянии ожидания.

После завершения синхронизации, когда клиент определяет, что является валидатором, ему необходимо перейти в состояние **AcceptState**.
Если клиент **не** является валидатором, он продолжит синхронизацию и останется в состоянии **SyncState**

#### AcceptState {#acceptstate}

Состояние **Accept** проверяет снимки и набор валидаторов. Если текущий нод не входит в набор валидаторов,
он возвращается в состояние **Sync**.

Если же нод  **является** валидатором, он рассчитывает автора предложения. Если оказывается, что текущий нод является автором предложения, он строит блок и отправляет сообщения предварительной подготовки и подготовки.

* Сообщения предварительной подготовки отправляются авторами предложений валидаторам, чтобы сообщить им о предложении
* Сообщения подготовки — это сообщения, в которых валидаторы соглашаются с предложением. Все ноды получают все сообщения подготовки
* Сообщения записи (Commit) содержат информацию о реализации предложения

Если текущий нод **не является** валидатором, он использует метод *getNextMessage* для чтения сообщения из ранее показанной очереди. <br />
Он ожидает сообщения предварительной подготовки. Когда нод подтвердит, что все правильно, он переходит в состояние **Validate**.

#### ValidateState {#validatestate}

Состояние **Validate** довольно простое: в этом состоянии ноды просто читают сообщения и добавляют их в состояние локального снимка.

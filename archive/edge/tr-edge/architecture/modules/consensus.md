---
id: consensus
title: Konsensüs
description: Polygon Edge'in konsensüs modülünün açıklaması.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - consensus
  - ibft
---

## Genel Bakış {#overview}

**Konsensüs** modülü, konsensüs mekanizmaları için bir arabirim sağlar.

Şu anda aşağıdaki konsensüs motorları mevcuttur:
* **IBFT PoA**
* **IBFT PoS**

Polygon Edge modülerlik ve eklenebilirlik durumunu korumak ister. <br />
Bu nedenle çekirdek konsensüs mantığı sistem dışına soyutlanmıştır, böylece yeni konsensüs mekanizmaları temel alınabilir,
bunu yaparken kullanılabilirlik ve kullanım kolaylığından ödün vermeye gerek kalmaz.

## Konsensüs Arabirimi {#consensus-interface}

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

***Konsensüs*** arabirimi, bahsedilen soyutlamanın temelinde yer alır. <br />
* **VerifyHeader** yöntemi, konsensüs katmanının **blok zinciri** katmanı için açığa çıkardığı bir yardımcı işlevi temsil eder
Başlık doğrulaması için işlev gösterir
* **Start** yöntemi konsensüs işlemini ve onunla ilişkili her şeyi başlatır. Bunun içerisinde senkronizasyon,
mühürleme ve yapılması gereken her şey yer alır
* **Close** yöntemi konsensüs bağlantısını kapatır

## Konsensüs Yapılandırması {#consensus-configuration}

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

Konsensüs protokolünde veri depolaması için özel bir konum veya
konsensüs mekanizmasının kullanmasını istediğiniz özel bir anahtar değeri eşlemesi geçmek isteyebileceğiniz durumlar olabilir. Bu ***Config*** yapısı ile yapılabilir,
bu yapı yeni bir konsensüs örneği oluşturulduğunda okunur.

## IBFT {#ibft}

### ExtraData {#extradata}

Blok zinciri başlık nesnesi diğer alanların yanında **ExtraData** adında bir alana sahiptir.

IBFT blok hakkında operasyonel bilgi depolamak için bu ekstra alanı kullanır ve aşağıdaki gibi soruları yanıtlar:
* "Bu bloğu kim imzaladı?"
* "Bu bloğun doğrulayıcıları kimler?"

IBFT için bu ekstra alanlar aşağıdaki gibi tanımlanır:
````go title="consensus/ibft/extra.go"
type IstanbulExtra struct {
	Validators    []types.Address
	Seal          []byte
	CommittedSeal [][]byte
}
````

### Veriyi İmzalama {#signing-data}

Düğüm IBFT içinde bilgiyi imzalamak için *signHash* yöntemini kullanır:
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
Bir diğer kayda değer yöntem olan *VerifyCommittedFields*, geçerli doğrulayıcılardan alınan taahhütlü mühürleri doğrular:
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

### Anlık görüntüler {#snapshots}

Anlık görüntüler, adından da anlaşılacağı gibi, herhangi bir blok yüksekliği (sayısı) için *sistemin anlık görüntüsünü* veya *durumunu* sağlamak için vardır.

Anlık görüntüler, doğrulayıcılardan oluşan bir düğüm kümesinin yanında oylama bilgisini içerir (doğrulayıcılar diğer doğrulayıcılar için oy kullanabilir).
Doğrulayıcılar, **Miner** başlığı alanına oylama bilgisini ekler ve tek seferlik anahtar (**nonce**) değerini değiştirir:
* Düğüm bir doğrulayıcı kaldırmak istiyorsa nonce değeri **tamamen 1'lerden** oluşur
* Düğüm bir doğrulayıcı eklemek istiyorsa nonce değeri **tamamen 0'lardan** oluşur

Anlık görüntüler ***processHeaders*** yöntemi kullanılarak hesaplanır:

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

Bu yöntem genellikle 1 başlık ile çağrılır; ancak akış birden fazla başlık için de aynıdır.<br />
Her geçirilmiş başlık için IBFT'nin başlığın teklif sahibinin doğrulayıcı olduğunu doğrulaması gerekir. Bu doğrulamayı kolayca yapmak için
en son anlık görüntü alınır ve düğümün doğrulayıcı kümesinde olup olmadığı kontrol edilir.

Ardından, nonce kontrol edilir. Oy dâhil edilmiş ve sayımı yapılmıştır ve yeterli oy varsa düğüm
doğrulayıcı kümesine eklenir veya kümeden kaldırılır, ardından yeni anlık görüntü kaydedilir.

#### Anlık Görüntü Deposu {#snapshot-store}

Anlık görüntü hizmeti, tüm mevcut anlık görüntülerin listesini depolayan **snapshotStore** adında bir varlığı yönetir ve günceller.
Bunu kullanarak, hizmet hangi anlık görüntünün hangi blok yüksekliği ile ilişkili olduğunu hızlı bir şekilde anlayabilecektir.
````go title="consensus/ibft/snapshot.go"
type snapshotStore struct {
	lastNumber uint64
	lock       sync.Mutex
	list       snapshotSortedList
}
````

### IBFT Başlangıcı {#ibft-startup}

IBFT'yi başlatmak için Polygon Edge'in öncelikle IBFT aktarımını ayarlaması gerekir:
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

Esasında yeni bir proto buff mesajı içeren, IBFT proto'lu yeni bir konu oluşturur.<br />
Mesajların doğrulayıcılar tarafından kullanılması amaçlanır. Polygon Edge ardından konuya abone olur ve mesajları uygun şekilde işler.

#### MessageReq {#messagereq}

Doğrulayıcılar arasında alınıp verilen mesaj:
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

**MessageReq** içindeki **View** alanı, zincir içindeki güncel düğüm konumunu temsil eder.
Bir *round* ve bir *sequence* özelliğine sahiptir.
* **round**, yükseklik için teklif sahibinin round'unu temsil eder
* **sequence**, blok zinciri yüksekliğini temsil eder

IBFT uygulamasının içinde dosyalanan *msgQueue*, mesaj isteklerini depolamak amacına sahiptir. Mesajları
*View* alanına göre (önce sequence'a göre, ardından round'a göre) sıralar. IBFT uygulaması sistem içindeki farklı durumlar için farklı kuyrukları da içerir.

### IBFT Durumları {#ibft-states}

Konsensüs mekanizması **Start** yöntemi kullanarak başlatıldıktan sonra, bir durum makinesini simüle eden sonsuz bir döngü içine girer:
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

Tüm düğümler başlangıçta **Sync** durumu ile çalışır.

Bunun nedeni, blok zinciri üzerinden taze verinin alınması gerekliliğidir. İstemcinin doğrulayıcı olup olmadığını öğrenmesi,
güncel anlık görüntüyü bulması gerekir. Bu durum bekleyen tüm blokları çözer.

Eşitleme bittikten ve istemci gerçekten bir doğrulayıcı olduğunu belirledikten sonra, **AcceptState** durumuna geçmesi gerekir.
İstemci bir doğrulayıcı **değilse**, eşitlemeye devam edecek ve **SyncState** durumunda kalacaktır

#### AcceptState {#acceptstate}

**Accept** durumu her seferinde anlık görüntüyü ve doğrulayıcı kümesini kontrol eder. Güncel düğüm doğrulayıcılar kümesinde değilse,
**Sync** durumuna geri döner.

Öte yandan, düğüm bir doğrulayıcı **ise**, teklif sahibini hesaplar. Mevcut düğümün teklif sahibi olduğu ortaya çıkarsa,
bir blok oluşturur ve ön hazırlık ve ardından hazırlık mesajlarını gönderir.

* Ön hazırlık mesajları: teklif sahipleri tarafından doğrulayıcılara, teklif hakkında bilgi vermek için gönderilen mesajlar
* Hazırlık mesajları: doğrulayıcıların bir teklif üzerinde hemfikir olduğu mesajlar. Tüm düğümler tüm hazırlık mesajlarını alır
* Taahhüt mesajları: teklif için taahhüt bilgisini içeren mesajlar

Mevcut düğüm bir doğrulayıcı **değilse**, önceden gösterilen kuyruktan bir mesaj okumak için *getNextMessage* yöntemini kullanır. <br />
Ön hazırlık mesajlarını bekler. Her şeyin muntazam olduğu doğrulandıktan sonra, düğüm **Validate** durumuna geçer.

#### ValidateState {#validatestate}

**Validate** durumu oldukça basittir; bu durumdaki tüm düğümler mesajları okur ve kendi yerel anlık görüntü durumuna ekler.

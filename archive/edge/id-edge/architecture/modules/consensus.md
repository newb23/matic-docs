---
id: consensus
title: Konsensus
description: Penjelasan modul konsensus Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - consensus
  - ibft
---

## Ikhtisar {#overview}

Modul **Konsensus** menyajikan antarmuka untuk mekanisme konsensus.

Saat ini, tersedia mesin konsensus berikut:
* **IBFT PoA**
* **IBFT PoS**

Polygon Edge ingin mempertahankan kondisi modularitas dan kemampuan plugin. <br />
Inilah alasan logika konsensus inti dipisahkan agar mekanisme konsensus baru dapat dibangun di atasnya, tanpa
mengorbankan kegunaan dan kemudahan penggunaan.

## Konsensus Antarmuka {#consensus-interface}

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

Antarmuka ***Konsensus*** adalah inti dari pemisahan yang disebutkan. <br />
* Metode **VerifyHeader** mewakili fungsi bantuan yang diekspos lapisan konsensus ke lapisan **blockchain**
Metode ini menangani verifikasi header
* Metode **Mulai** hanya memulai proses konsensus dan semua yang terkait dengannya. Yang termasuk sinkronisasi,
penyegelan, dan semua yang perlu dilakukan
* Metode **Tutup** menutup koneksi konsensus

## Konfigurasi Konsensus {#consensus-configuration}

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

Ada kalanya Anda mungkin ingin memberikan lokasi khusus kepada protokol konsensus untuk menyimpan data atau mungkin
Anda ingin mekanisme konsensus menggunakan peta nilai kunci khusus. Hal ini dapat dicapai melalui struktur ***Config***,
yang akan dibaca ketika instans konsensus baru dibuat.

## IBFT {#ibft}

### ExtraData {#extradata}

Objek header blockchain memiliki salah satu bidang yang disebut **ExtraData**.

IBFT menggunakan bidang tambahan ini untuk menyimpan informasi operasional mengenai blok dan menjawab pertanyaan seperti:
* "Siapa yang menandatangani blok ini?"
* "Siapa validator untuk blok ini?"

Bidang tambahan ini untuk IBFT didefinisikan sebagai berikut:
````go title="consensus/ibft/extra.go"
type IstanbulExtra struct {
	Validators    []types.Address
	Seal          []byte
	CommittedSeal [][]byte
}
````

### Menandatangani data {#signing-data}

Agar node menandatangani informasi di IBFT, node menggunakan metode *signHash*:
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
Metode terkenal lainnya adalah metode *VerifyCommittedFields* yang memverifikasi bahwa segel yang dijalankan berasal dari validator valid:
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

Snapshot, seperti namanya, untuk menyediakan *gambaran* atau *kondisi* sistem pada setiap tinggi blok (jumlah).

Snapshot berisi satu set node yang menjadi validator, serta informasi pemungutan suara (validator dapat memilih validator lain).
Validator termasuk informasi pemungutan suara di header **Miner** yang diajukan dan mengubah nilai **nonce**:
* Nonce adalah **semua angka 1** jika node ingin menghapus validator
* Nonce adalah **semua angka 0** jika node ingin menambah validator

Snapshot dihitung menggunakan metode ***processHeaders***:

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

Metode ini biasanya dipanggil dengan 1 header, tetapi alirannya sama bahkan dengan beberapa header. <br />
Untuk setiap header yang lulus, IBFT perlu memverifikasi bahwa pengusul header adalah validator. Ini dapat dilakukan dengan mudah yakni
meraih snapshot terbaru dan memeriksa apakah node berada di set validator.

Selanjutnya, nonce diperiksa. Suara dimasukkan dan dihitung - jika ada cukup suara, node ditambahkan/dihapus dari
set validator, kemudian snapshot baru disimpan.

#### Snapshot Store {#snapshot-store}

Layanan snapshot mengelola dan memperbarui entitas yang disebut **snapshotStore** yang menyimpan daftar dari semua snapshot yang tersedia.
Dengan itu, layanan dapat dengan cepat mengetahui snapshot mana yang dikaitkan dengan tinggi blok.
````go title="consensus/ibft/snapshot.go"
type snapshotStore struct {
	lastNumber uint64
	lock       sync.Mutex
	list       snapshotSortedList
}
````

### Memulai IBFT {#ibft-startup}

Untuk memulai IBFT, Polygon Edge harus mengatur transportasi IBFT terlebih dahulu:
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

Pada dasarnya, ini membuat topik baru dengan IBFT proto, dengan pesan proto buff baru.<br />
Pesan akan digunakan oleh validator. Kemudian Polygon Edge berlangganan topik dan menangani pesan yang sesuai.

#### MessageReq {#messagereq}

Pesan ditukar oleh validator:
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

Bidang **View** di **MessageReq** mewakili posisi node saat ini di dalam rantai.
Ini memiliki atribut *round*, and *sequence*.
* **round** mewakili rangkaian pengusul untuk tinggi
* **sequence** mewakili tinggi blockchain

Bidang *msgQueue* yang diajukan dalam implementasi IBFT memiliki tujuan menyimpan permintaan pesan. Itu memerintahkan pesan berdasarkan
*View* (pertama berdasarkan sequence, kemudian berdasarkan round). Implementasi IBFT juga memiliki antrean yang berbeda untuk kondisi yang berbeda dalam sistem.

### Kondisi IBFT {#ibft-states}

Setelah mekanisme konsensus dimulai menggunakan metode **Start**, itu berjalan ke putaran tak terbatas yang menyimulasikan mesin kondisi:
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

Semua node awalnya dimulai pada kondisi **Sync**.

Hal ini karena data baru perlu diambil dari blockchain. Klien perlu mencari tahu apakah itu validator,
menemukan snapshot saat ini. Kondisi ini menyelesaikan blok yang tertunda.

Setelah sinkronisasi selesai, dan klien menentukan bahwa itu memang validator, kemudian ditransfer ke **AcceptState**.
Jika klien **bukan** validator, sinkronisasi akan berlanjut dan tetap pada **SyncState**

#### AcceptState {#acceptstate}

Kondisi **Accept** selalu memeriksa snapshot dan set validator. Jika node saat ini tidak ada dalam set validator,
node bergerak kembali ke kondisi **Sync**.

Selain itu, jika node **adalah** validator, node akan menghitung pengusul. Jika ternyata node saat ini adalah
pengusul, blok akan dibangun dan mengirimkan pesan preprepare, lalu pesan prepare.

* Pesan preprepare - pesan yang dikirim oleh pengusul kepada validator, untuk memberi tahu tentang proposal
* Pesan prepare - pesan ketika validator menyetujui proposal. Semua node menerima semua pesan prepare
* Pesan commit - pesan berisi informasi commit untuk proposal

Jika node saat ini **bukan** validator, digunakan metode *getNextMessage* untuk membaca pesan dari antrean yang ditunjukkan sebelumnya. <br />
Tunggu pesan preprepare. Setelah dikonfirmasi semuanya benar, node pindah ke kondisi **Validate**.

#### ValidateState {#validatestate}

Kondisi **Validate** lebih sederhana - yang dilakukan node dalam kondisi ini adalah membaca pesan dan menambahkannya ke kondisi snapshot lokal.

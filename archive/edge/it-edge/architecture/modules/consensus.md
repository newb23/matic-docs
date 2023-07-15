---
id: consensus
title: Consenso
description: Spiegazione del modulo di consenso di Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - consensus
  - ibft
---

## Panoramica {#overview}

Il modulo **Consenso** fornisce un'interfaccia per i meccanismi di consenso.

Attualmente sono disponibili i seguenti motori di consenso:
* **IBFT PoA**
* **IBFT PoS**

Polygon Edge vuole mantenere uno stato di modularità e collegabilità. <br />Questo è il motivo per cui la logica di base del consenso è stata resa astratta, in modo che nuovi meccanismi di consenso possano essere costruiti su di essa, senza compromettere la semplicità d'uso e le possibilità di utilizzo..

## Interfaccia Consenso {#consensus-interface}

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

L'interfaccia di ***Consenso*** è il nucleo dell'astrazione citata.<br />
* Il metodo **VerifyHeader** rappresenta una funzione di supporto che il layer di consenso espone al layer della **blockchain** Serve a gestire la verifica delle intestazioni
* Il metodo **Start** avvia semplicemente il processo di consenso e tutto ciò che vi è associato. Questo include la sincronizzazione, la sigillatura e tutto quello che deve essere fatto
* Il metodo **Chiudi** chiude la connessione di consenso

## Configurazione Consenso {#consensus-configuration}

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

Può capitare che si voglia passare una posizione personalizzata per il protocollo di consenso per memorizzare i dati, o forse una mappa chiave-valore personalizzata da utilizzare per il meccanismo di consenso. Questo può essere ottenuto tramite la struttura ***Config***, che viene letta quando viene creata una nuova istanza di consenso.

## IBFT {#ibft}

### ExtraData {#extradata}

L'oggetto intestazione della blockchain, tra gli altri campi, ne ha uno chiamato **ExtraData**.

L'IBFT utilizza questo campo aggiuntivo per memorizzare informazioni operative relative al blocco, rispondendo a domande come:
* "Chi ha firmato questo blocco?"
* "Chi sono i validatori di questo blocco?"

Questi campi aggiuntivi per l'IBFT sono definiti come segue:
````go title="consensus/ibft/extra.go"
type IstanbulExtra struct {
	Validators    []types.Address
	Seal          []byte
	CommittedSeal [][]byte
}
````

### Dati sulla firma {#signing-data}

Per firmare le informazioni in IBFT, il nodo utilizza il metodo *signHash*:
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
Un altro metodo degno di nota è il metodo *VerifyCommittedFields*, che verifica che i sigilli impegnati provengano da validatori:
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

### Istantanee {#snapshots}

Le istantanee, come dice il nome, servono a fornire un'*istantanea*, ovvero lo *stato* di un sistema a qualsiasi altezza del blocco (numero).

Le istantanee contengono un insieme di nodi che sono validatori, nonché informazioni di voto (i validatori possono votare per altri validatori). I validatori includono le informazioni di voto nell'intestazione del **Minatore** e modificano il valore del **nonce**:
* Il nonce è **tutto 1s** se il nodo vuole rimuovere un validatore
* Il nonce è **tutto 0s**, se il nodo vuole aggiungere un validatore

Le istantanee vengono calcolate con il metodo ***processHeaders***:

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

Questo metodo viene solitamente chiamato con 1 intestazione, ma il flusso è lo stesso anche con intestazioni multiple.<br /> Per ogni intestazione passata, IBFT deve verificare che il proponente dell'intestazione sia il validatore. Questo può essere fatto facilmente prendendo l'ultima istantanea e controllando se il nodo è nel set di validatori.﻿

Successivamente, il nonce viene controllato. Il voto viene incluso e conteggiato e, se ci sono abbastanza voti, un nodo viene aggiunto/rimosso dall'insieme di validatori, dopo di che viene salvata la nuova istantanea.

#### Archivio delle istantanee {#snapshot-store}

Il servizio delle istantanee gestisce e aggiorna un'entità chiamata **snapshotStore**, che memorizza l'elenco di tutte le istantanee disponibili. Grazie ad esso, il servizio è in grado di capire rapidamente quale istantanea è associata a quale altezza del blocco.
````go title="consensus/ibft/snapshot.go"
type snapshotStore struct {
	lastNumber uint64
	lock       sync.Mutex
	list       snapshotSortedList
}
````

### Avviamento di IBFT {#ibft-startup}

Per avviare IBFT, Polygon Edge deve innanzitutto impostare il trasporto IBFT:
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

Crea essenzialmente un nuovo argomento con il proto IBFT, con un nuovo messaggio proto buff. <br />I messaggi sono destinati a essere utilizzati dai validatori. Polygon Edge si iscrive quindi all'argomento e gestisce i messaggi di conseguenza.

#### MessageReq {#messagereq}

Il messaggio scambiato dai validatori:
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

Il campo **View** del **MessageReq** rappresenta la posizione corrente del nodo all'interno della catena. Ha un attributo *round* e uno *sequence*.
* **round** rappresenta il tempo necessario proposto per l'altezza
* **sequence** rappresenta altezza della blockchain

Il file *msgQueue* dell'implementazione IBFT ha lo scopo di memorizzare le richieste di messaggi. Ordina i messaggi per *View* (prima per sequenza, poi per round). L'implementazione IBFT possiede anche code diverse per i diversi stati del sistema.

### Stati IBFT {#ibft-states}

Dopo che il meccanismo di consenso è stato avviato con il metodo **Start**, entra in un ciclo infinito che simula una macchina a stati:
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

Tutti i nodi iniziano nello stato **Sync**.

Questo perché i dati recenti devono essere recuperati dalla blockchain. Il client deve scoprire se è il validatore, ha trovato l'istantanea attuale. Questo stato risolve eventuali blocchi in sospeso.

Dopo che la sincronizzazione è terminata e il client ha stabilito che si tratta effettivamente di un validatore, deve passare ad **AcceptState**. Se il client **non** è un validatore, continuerà la sincronizzazione e rimarrà in **SyncState**

#### AcceptState {#acceptstate}

Lo stato **Accept** controlla sempre l'istantanea e l'insieme dei validatori. Se il nodo attuale non è nell'insieme dei validatori,
torna allo stato **Sync**.

Se invece il nodo **è** un validatore, calcola il proponente. Se si scopre che il nodo corrente è il proponente, costruisce blocco e invia i messaggi preprepare e poi prepare.

* Messaggi preprepare - messaggi inviati dai proponenti ai validatori, per avvisarli della proposta
* Messaggi prepare - messaggi in cui i validatori concordano su una proposta. Tutti i nodi ricevono tutti i messaggi prepare
* Messaggi di Commit - messaggi contenenti informazioni di commit per la proposta

Se il nodo corrente **non è** un validatore, utilizza il metodo *getNextMessage* per leggere un messaggio dalla coda precedentemente mostrata. <br />Attende i messaggi preprepare Una volta confermato che tutto è corretto, il nodo passa allo stato **Validate**.

#### ValidateState {#validatestate}

Lo stato **Validate** è piuttosto semplice: tutto ciò che i nodi fanno in questo stato è leggere i messaggi e aggiungerli allo stato della loro istantanea locale.

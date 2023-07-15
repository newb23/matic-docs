---
id: consensus
title: Konsens
description: Erläuterung für das Konsensmodul von Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - consensus
  - ibft
---

## Übersicht {#overview}

Das **Konsens** Modul bietet eine Schnittstelle für Konsensmechanismen.

Derzeit stehen folgende Konsensmaschinen zur Verfügung:
* **IBFT PoA**
* **IBFT PoS**

Polygon Edge möchte einen Zustand der Modularität und der Steckbarkeit beibehalten.<br /> Deshalb wurde die Kernkonsenslogik wegabstrahiert, sodass neue Konsensmechanismen darauf aufgebaut werden können, ohne Kompromittierung von Usability und Benutzerfreundlichkeit.

## Konsens-Schnittstelle {#consensus-interface}

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

Die ***Konsens*** Schnittstelle ist der Kern der erwähnten Abstraktion.<br />
* Die **VerifyHeader** Methode stellt eine Helper-Funktion dar, die die Konsensebene der **Blockchain** Ebene aussetzt Es besteht, um Header-Verifizierung zu verarbeiten
* Die **Start**-Methode startet einfach den Konsensprozess und alles, was damit verbunden ist. Dazu gehört die Synchronisierung, Versieglung, alles, was getan werden muss
* Die **Close** Methode schließt die Konsensverbindung

## Konsens-Konfiguration {#consensus-configuration}

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

Es kann vorkommen, dass Sie einen benutzerdefinierten Speicherort für das Konsensprotokoll angeben möchten, um Daten zu speichern, oder vielleicht eine benutzerdefinierte Key-Value Karte, bei der Sie möchten, dass der Konsensmechanismus verwendet wird. Dies kann durch die ***Config*** struct erreicht werden, die gelesen wird, wenn eine neue Konsens-Instance erstellt wird.

## IBFT {#ibft}

### ExtraData {#extradata}

Das Blockchain-Header-Objekt hat unter anderem ein Feld mit dem Namen **ExtraData**.

IBFT verwendet dieses zusätzliche Feld, um operative Informationen über den Block zu speichern, und beantwortet Fragen wie:
* "Wer hat diesen Block unterzeichnet?"
* "Wer sind die Validatoren für diesen Block?"

Diese zusätzlichen Felder für IBFT sind wie folgt definiert:
````go title="consensus/ibft/extra.go"
type IstanbulExtra struct {
	Validators    []types.Address
	Seal          []byte
	CommittedSeal [][]byte
}
````

### Signieren von Daten {#signing-data}

Damit der Knoten Informationen in IBFT unterzeichnet, nutzt er die *signHash* Methode:
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
Eine weitere bemerkenswerte Methode ist die *VerifyCommittedFields* Methode, die überprüft, dass die eingesetzten Siegel von gültigen Validatoren stammen:
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

### Snapshots {#snapshots}

Snapshots, wie der Name schon sagt, gibt es, um einen *Snapshot* oder den *Zustand* eines Systems in jeder Blockhöhe (Nummer) bereitzustellen.

Snapshots enthalten eine Reihe von Knoten, die Validatoren sind, sowie Abstimminformationen (Validatoren können für andere Validatoren stimmen). Validators enthalten Abstimminformationen im **Miner** Header und ändern den Wert der **nonce**:
* Nonce ist **alle 1s**, wenn der Knoten einen Validator entfernen möchte
* Nonce ist **alle 0s**, wenn der Knoten einen Validator hinzufügen möchte

Snapshots werden mit der ***processHeaders** *Methode berechnet:

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

Diese Methode wird normalerweise mit 1 Header aufgerufen, aber der Flow ist auch mit mehreren Headern gleich.<br /> Für jeden passed-in Header muss IBFT überprüfen, ob der proposer des Headers der Validator ist. Dies kann leicht gemacht werden durch Erfassung des neuesten Snapshots, und prüfen, ob Knoten im Validator eingerichtet ist,

Als Nächstes wird die Nonce geprüft. Das Votum wird aufgenommen und ausgewertet – und wenn es genügend Stimmen gibt, wird ein Knoten aus dem Validierungssatz hinzugefügt/entfernt, woraufhin der neue Schnappschuss gespeichert wird.

#### Snapshot-Store {#snapshot-store}

Der Snapshot Service verwaltet und aktualisiert ein Objekt namens **snapshotStore**, die die Liste aller verfügbaren Snapshots speichert. Mit ihm kann der Dienst schnell herausfinden, welcher Snapshot mit welcher Blockhöhe verknüpft ist.
````go title="consensus/ibft/snapshot.go"
type snapshotStore struct {
	lastNumber uint64
	lock       sync.Mutex
	list       snapshotSortedList
}
````

### IBFT-Startup {#ibft-startup}

Um IBFT zu starten, muss der Polygon Edge zuerst den IBFT Transport einrichten:
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

Es erstellt im Wesentlichen ein neues Thema mit IBFT Proto, mit einer neuen Proto buff Nachricht. <br />Die Nachrichten sollen von Validatoren verwendet werden. Polygon Edge meldet sich dann für das Thema und behandelt Nachrichten entsprechend.

#### MessageReq {#messagereq}

Die Nachricht wurde von Validatoren ausgetauscht:
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

Das Feld **Ansicht** im **MessageReq** repräsentiert die aktuelle Knotenposition innerhalb der Chain. Es hat ein *round* und ein *sequence* Attribut.
* **round** steht für die Proposerrunde für die Höhe
* **sequence** repräsentiert die Höhe der Blockchain

Die *msgQueue* in der IBFT Implementierung hat den Zweck, message-Anforderungen zu speichern. Es ordnet Nachrichten durch die *Ansicht* (zuerst nach der sequence, dann nach der round). Die IBFT Implementierung besitzt auch verschiedene Warteschlangen für verschiedene Systemzustände.

### IBFT-States {#ibft-states}

Nachdem der Konsensmechanismus mit der **Start**-Methode gestartet wird, läuft er in eine unendliche Schleife, die eine State Machine simuliert:
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

Alle Knoten beginnen zunächst im **Sync** State.

Dies liegt daran, dass frische Daten aus der Blockchain abgerufen werden müssen. Der Client muss herausfinden, ob es der Validator ist, den aktuellen snapshot finden. Dieser State löst alle ausstehenden Blöcke auf.

Nachdem der Sync beendet wurde und der Client bestimmt, dass er ein Validator ist, muss er an **AcceptState** übertragen. Wenn der Client **kein** Validator ist, wird er weiterhin synchronisiert und bleibt in **SyncState**

#### AcceptState {#acceptstate}

Der **Accept** State überprüfe immer den snapshot und den Validatorsatz. Wenn der aktuelle Knoten nicht im Validatorsatz ist, bewegt es sich zurück in den **Sync** State.

Andererseits, wenn der Knoten ein Validator **ist**, berechnet er den Proposer. Wenn es sich herausstellt, dass der aktuelle Knoten der proposer ist, baut es einen Block und sendet preprepare und bereitet dann Nachrichten vor.

* Preprepare von Nachrichten – Nachrichten, die von Proposers an Validatoren gesendet werden, um sie über das proposal zu informieren
* Prepare von Nachrichten – Nachrichten, in denen Validatoren auf einen proposal übereinstimmen. Alle Knoten empfangen alle prepare Nachrichten
* Commit Nachrichten – Nachrichten, die Commit Informationen für das proposal enthalten

Wenn der aktuelle Knoten **kein** Validator ist, verwendet er die *getNextMessage* Methode, um eine Nachricht aus der zuvor gezeigten Warteschlange zu <br />lesen. Er wartet auf die preprepare Nachrichten. Sobald es bestätigt wird, dass alles korrekt ist, verschiebt sich der Knoten in den **Validate** State.

#### ValidateState {#validatestate}

Der **Validate** State ist eher einfach - alle Knoten in diesem State lesen Nachrichten und fügen sie zu ihrem lokalen Snapshot State hinzu.

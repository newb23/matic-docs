---
id: consensus
title: Consensus
description: Explication du module de consensus de Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - consensus
  - ibft
---

## Aperçu {#overview}

Le module **Consensus** fournit une interface pour les mécanismes de consensus.

Actuellement, les moteurs de consensus suivants sont disponibles:
* **IBFT PoA**
* **IBFT PoS**

Le Polygon Edge veut maintenir un état de modularité et de connectivité. <br />
C'est la raison pour laquelle la logique de consensus de base a été rendue abstraite, de sorte que de nouveaux mécanismes de consensus peuvent être construits par-dessus, sans
compromettre l'utilité et la facilité d'utilisation.


## Interface du Consensus {#consensus-interface}

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

L'interface du ***Consensus*** est le noyau de l'abstraction mentionnée. <br />
* La méthode **VerifyHeader** représente une fonction d'aide que la couche du consensus expose à la couche de **blockchain**
Cela est présent pour gérer la vérification de l'en-tête
* La méthode de **Démarrage** lance simplement le processus de consensus, et tout ce qui y est associé. Cela inclut la synchronisation,
la fermeture, et tout ce qui doit être fait
* La méthode de **Fermeture** ferme la connexion du consensus

## Configuration du Consensus {#consensus-configuration}

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

Il peut arriver que vous souhaitiez transmettre un emplacement personnalisé pour que le protocole de consensus stocke les données, ou peut-être
 une carte clé de valeur personnalisée que vous voulez que le mécanisme de consensus utilise. Cela peut être réalisé par la structure de la ***Configuration***,
qui est lu lorsqu'un nouveau consensus est créé.

## IBFT {#ibft}

### ExtraData {#extradata}

L'objet d'en-tête de la blockchain comporte, entre autres, un champ appelé **ExtraData**.

L'IBFT utilise ce champ supplémentaire pour stocker des informations opérationnelles concernant le bloc, répondant ainsi à des questions comme celles-ci:
* "Qui a signé ce bloc?"
* "Qui sont les validateurs pour ce bloc?"

Ces champs supplémentaires pour IBFT sont définis comme suit:
````go title="consensus/ibft/extra.go"
type IstanbulExtra struct {
	Validators    []types.Address
	Seal          []byte
	CommittedSeal [][]byte
}
````

### Des Données De Signature {#signing-data}

Pour que le nœud puisse signer les informations dans IBFT, il utilise la méthode *signHash*:
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
Une autre méthode notable est la méthode *VerifyCommittedField*, qui vérifie que les sceaux validés proviennent des bons validateurs:
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

### Photographie {#snapshots}

Les photographies, comme leur nom l'indique, sont là pour fournir une *prise de photo*, ou *l'état* d'un système à n'importe quelle hauteur de bloc (nombre).

Les photographies contiennent un ensemble de nœuds qui sont des validateurs, ainsi que des informations sur les votes (les validateurs peuvent voter pour d'autres validateurs).
 Les validateurs incluent les informations de vote dans l'en-tête **Miner**  et modifient la valeur du **nonce**:
* Le nonce est **tous les 1** si le noeud veut supprimer un validateur
* Nonce est **tous les 0** si le nœud veut ajouter un validateur

Les photographies sont calculés à l'aide de la méthode ***processHeaders***:

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

Cette méthode est généralement appelée avec 1 en-tête, mais le flux est le même avec plusieurs en-têtes<br />.
Pour chaque en-tête transmis, IBFT doit vérifier que le proposant de l'en-tête est le validateur. Cela peut être fait facilement en saisissant la dernière photographie, et en vérifiant si le nœud se trouve dans l'ensemble de validateur.

Ensuite, le nonce est vérifié. Le vote est inclus et compté - et s'il y a suffisamment de votes, un nœud est ajouté/supprimé de l'ensemble de validateur, après quoi la nouvelle photographie est enregistrée.

#### Une Réserve De Photographie {#snapshot-store}

Le service de photographie gère et met à jour une entité appelée **snapshotStore**, qui réserve la liste de toutes les photographies disponibles.
En l'utilisant, le service est capable de déterminer rapidement quelle photographie est associée à une hauteur de bloc déterminé.
````go title="consensus/ibft/snapshot.go"
type snapshotStore struct {
	lastNumber uint64
	lock       sync.Mutex
	list       snapshotSortedList
}
````

### Initialisation d'IBFT {#ibft-startup}

Pour démarrer IBFT, le Polygon Edge doit d'abord configurer le transport IBFT:
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

Cela crée essentiellement un nouveau sujet avec le proto IBFT, avec un nouveau message de protection de proto.<br />
Les messages sont destinés à être utilisés par les validateurs. Le Polygon Edge s'abonne ensuite au sujet et gère les messages en conséquence.

#### MessageReq {#messagereq}

Le message échangé par les validateurs:
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

Le champ **View** dans **MessageReq** représente la position actuelle du nœud à l'intérieur de la chaîne.
Il a un attribut en *série* et un attribut de *séquence*.
* **série** représente le proposant de série pour la hauteur
* La **séquence** représente la hauteur de la blockchain

Le fichier *msgQueue* déposé dans l'implémentation IBFT a pour but de stocker les demandes de message. Cela ordonne les messages par la *Vue* (d'abord par séquence, puis par série). L'implémentation IBFT possède également différentes files d'attente pour différents états dans le système.

### Les États d'IBFT {#ibft-states}

Une fois que le mécanisme de consensus est lancé à l'aide de la méthode **Start**, il s'exécute dans une boucle infinie qui simule une machine d'état:
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

Tous les nœuds démarrent initialement dans l'état **Sync**.

En effet, de nouvelles données doivent être extraites de la blockchain. Le client doit savoir s'il s'agit du validateur, de trouver la photographie actuelle. Cet état résout tous les blocs en attente.

Après que la synchronisation est terminée et que le client détermine qu'il s'agit bien d'un validateur, il doit être transféré vers **AcceptState**.
Si le client n'est **pas** un validateur, il continuera la synchronisation et restera dans **SyncState**

#### AcceptState {#acceptstate}

L'état d'**Accept** vérifie toujours la photographie et l'ensemble de validateur. Si le nœud actuel n'est pas dans l'ensemble des validateurs,
il revient à l'état de **Synchronisation**.

En revanche, si le nœud **est** un validateur, il calcule le proposant. Il paraît que le nœud actuel est le proposant, il construit un bloc et envoie des préparations puis des messages de préparation.

* Préparer les messages - les messages envoyés par les proposants aux validateurs, pour les informer sur la proposition
* Préparer les messages - les messages où les validateurs s'accordent sur une proposition. Tous les nœuds reçoivent tous les messages de préparation
* Les messages d'Engagement - les messages contenant des informations de validation pour la proposition

Si le nœud actuel **n'est pas** un validateur, il utilise la méthode *getNextMessage* pour lire un message de la file d'attente affichée précédemment.<br />
Il attend les messages de préparation. Une fois que c'est confirmé que tout est correct, le nœud passe à l'état **Valider**.

#### ValidateState {#validatestate}

L'état **Valider** est plutôt simple - tous les nœuds dans cet état sont de lire les messages et de les ajouter à leur état de photographie locale.

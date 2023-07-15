---
id: consensus
title: Consenso
description: Explicación del módulo de consenso de Polygon Edge
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - consensus
  - ibft
---

## Descripción general {#overview}

El módulo de **consenso** ofrece una interfaz para los mecanismos del consenso.

Actualmente, están disponibles los siguientes motores de consenso:
* **Prueba de autoridad (PoA) tolerante a fallas bizantinas de Estambul (IBFT)**
* **Prueba de participación (PoS) tolerante a fallas bizantinas de Estambul (IBFT)**

Polygon Edge quiere mantener un estado de modularidad y capacidad de conexión.<br />
Por eso se ha abstraído la lógica central del consenso, para que nuevos mecanismos de consenso se puedan construir a partir de ella, sin
comprometer la usabilidad ni la facilidad de uso.

## Interfaz del consenso {#consensus-interface}

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

La interfaz del ***consenso*** es un aspecto central de la abstracción mencionada. <br />
* El método **VerifyHeader** (Verificar encabezado) representa una función de ayuda en la que la capa de consenso se expone a la capa de la **cadena de bloques**.
Su función es manejar la verificación de encabezados.
* El método **Start** (Iniciar) simplemente inicia el proceso de consenso y todo aquello con lo que está asociado. Eso incluye la sincronización,
el sellado y todo lo que haya que hacer.
* El método **Close** (Cerrar) cierra la conexión del consenso.

## Configuración del consenso {#consensus-configuration}

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

Puede que haya momentos en los que quieras pasar una ubicación personalizada para el protocolo de consenso, para almacenar datos, o tal vez
un mapa con valor personalizado de claves que quieras que el mecanismo de consenso utilice. Eso se puede lograr mediate la estructura de ***configuración***,
que se lee cuando se crea una nueva instancia de consenso.

## IBFT {#ibft}

### ExtraData {#extradata}

El objeto del encabezado de la cadena de bloques, entre otros campos, tiene un campo llamado **ExtraData** (Datos adicionales).

IBFT utiliza ese campo adicional para almacenar información operativa con respecto al bloque y responde preguntas como:
* "¿Quién firmó este bloque?"
* "¿Quiénes son los validadores de este bloque?"

Esos campos adicionales para IBFT se definen de la siguiente manera:
````go title="consensus/ibft/extra.go"
type IstanbulExtra struct {
	Validators    []types.Address
	Seal          []byte
	CommittedSeal [][]byte
}
````

### Datos de la firma {#signing-data}

Para que el nodo firme información en IBFT, usa el método *signHash*:
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
Otro método notable es *VerifyCommittedFields* (Verificar campos comprometidos), que verifica que los sellos comprometidos sean de validadores válidos:
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

### Instantáneas {#snapshots}

Las fotos instantáneas, como el nombre lo indica, sirven para mostrar una *foto instantánea* o el *estado* de un sistema a cualquier altura de bloque (número).

Las instantáneas contienen un conjunto de nodos que son validadores, así como información de votación (los validadores pueden votar por otros validadores).
Los validadores incluyen información de votación en el campo del encabezado **Miner** (Minero) archivado y cambian el valor de **nonce**:
* Nonce es **todo de 1 s** si el nodo quiere eliminar un validador.
* Nonce es **todo de 0 s** si el nodo quiere añadir un validador.

Las instantáneas se calculan con el método ***processHeaders*** (Procesar encabezados):

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

Este método se suele llamar con un encabezado, pero el flujo es el mismo, incluso con múltiples encabezados. <br />
Para cada encabezado pasado, IBFT debe verificar que el proponente del encabezado sea el validador. Eso se puede hacer fácilmente
tomar la foto instantánea más reciente y revisar si el nodo está en el conjunto de validadores.

Después, se debe verificar el nonce. Se incluye y se cuenta el voto y, si hay suficientes votos, se agrega o se elimina un nodo del
conjunto de validadores y después se guarda la nueva foto instantánea.

#### Depósito de fotos instantáneas {#snapshot-store}

El servicio de fotos instantáneas gestiona y actualiza una entidad llamada **snapshotStore** (Depósito de fotos instantáneas), que almacena la lista de todas las instantáneas disponibles.
Con él, el servicio puede averiguar rápidamente cuál de las instantáneas está asociada con cuál altura de bloque.
````go title="consensus/ibft/snapshot.go"
type snapshotStore struct {
	lastNumber uint64
	lock       sync.Mutex
	list       snapshotSortedList
}
````

### Inicio de IBFT {#ibft-startup}

Para iniciar la IBFT, Polygon Edge primero debe configurar el transporte de la IBFT:
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

Esencialmente, crea un nuevo tema con el protocolo de IBFT, con un nuevo mensaje de búfer de protocolo.<br />
Se supone que los validadores deben utilizar los mensajes. Polygon Edge después se suscribe al tema y gestiona los mensajes en consecuencia.

#### MessageReq {#messagereq}

El mensaje intercambiado por los validadores:
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

El campo **View** en **MessageReq** representa la posición actual del nodo dentro de la cadena.
Tiene una *round* (ronda) y un atributo de *sequence* (secuencia).
* **round** (ronda) representa la ronda de proponentes para la altura.
* **sequence** (secuencia) representa la altura de la cadena de bloques.

El campo *msgQueue* archivado en la implementación de la IBFT tiene el objetivo de almacenar las solicitudes de mensajes. Este ordena los mensajes por
*vistas* (primero, por secuencia y luego, por ronda). La implementación de la IBFT también posee diferentes colas para diferentes estados en el sistema.

### Estados de IBFT {#ibft-states}

Después de iniciar el mecanismo de consenso con el método **Start** (Iniciar), este ejecuta un ciclo infinito que simula una máquina de estado:
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

#### SyncState (Estado de sincronización) {#syncstate}

Todos los nodos inician en el estado de **Sync** (sincronización).

Eso se debe a que los datos nuevos se deben obtener de la cadena de bloques. El cliente debe averiguar si es el validador
y encuentra la foto instantánea actual. Este estado resuelve cualquier bloque pendiente.

Tras terminar la sincronización y la verificación por parte del cliente de si es un validador, debe transferir a **AcceptState**.
Si el cliente **no** es validador, seguirá sincronizando y se quedará en **SyncState** (estado de sincronización).

#### AcceptState (Aceptar estado) {#acceptstate}

El estado **Accept** (Aceptar) siempre revisa la foto instantánea y el conjunto de validadores. Si el nodo actual no está en el conjunto de validadores,
retorna al estado de **Sync** (sincronización).

Por otro lado, si el nodo **sí** es validador, calcula al proponente. Si resulta que el nodo actual es el
proponente, construye un bloque, envía una preparación preliminar y luego prepara los mensajes.

* Mensajes de preparación preliminar: son mensajes enviados por los proponentes a los validadores para darles a conocer la propuesta.
* Mensajes de preparación: son mensajes en los que los validadores están de acuerdo con una propuesta. Todos los nodos reciben todos los mensajes de preparación.
* Mensajes de compromiso: son mensajes que contienen información de compromiso de la propuesta.

Si el nodo actual **no** es validador, utiliza el método *getNextMessage* (Obtener siguiente mensaje) para leer un mensaje de una cola mostrada previamente. <br />
Este espera a los mensajes de preparación preliminar. Cuando se confirma que todo es correcto, el nodo pasa al estado de **Validate** (Validar).

#### ValidateState (Validar estado) {#validatestate}

El estado **Validate** (Validar) es muy simple: lo que todos los nodos hacen en este estado es leer mensajes y agregarlos a su estado de foto instantánea local.

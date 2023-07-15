---
id: consensus
title: Consenso
description: Explicação para o módulo Consenso do Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - consensus
  - ibft
---

## Visão geral {#overview}

O módulo **Consenso** fornece uma interface para os mecanismos de consenso.

Atualmente, os mecanismos de consenso a seguir estão disponíveis:
* **PoA do IBFT**
* **PoS do IBFT**

O Polygon Edge quer manter um estado de modularidade e plugabilidade. <br />
É por isso que a lógica do consenso principal foi eliminada, para que os novos mecanismos de consenso possam ser construídos sobre ela,
sem comprometer a usabilidade e a facilidade de uso.

## Interface de consenso {#consensus-interface}

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

A interface de ***Consenso*** é o núcleo da abstração mencionada. <br />
* O método **VerifyHeader** representa uma função auxiliar, que a camada de consenso expõe à camada **blockchain**
Seu objetivo é realizar a verificação do cabeçalho
* O método **Iniciar** simplesmente inicia o processo de consenso e tudo que está associado a ele. Isso inclui a sincronização,
selagem, tudo o que precisa ser feito
* O método **Fechar** fecha a conexão de consenso

## Configuração do consenso {#consensus-configuration}

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

Em alguns momentos, você pode querer passar um local personalizado para o protocolo de consenso armazenar dados, ou talvez,
um mapa de valores chaves personalizados que você deseja que o mecanismo de consenso use. Isso pode ser realizado através da estrutura ***Config***
que é lida quando uma nova instância do consenso é criada.

## IBFT {#ibft}

### ExtraData {#extradata}

O objeto do cabeçalho do blockchain, entre outros campos, tem um campo chamado **ExtraData**.

O IBFT usa este campo adicional para armazenar informações operacionais sobre o bloco, respondendo perguntas como:
* "Quem assinou este bloco?"
* "Quem são os validadores deste bloco?"

Estes campos adicionais do IBFT são definidos da seguinte forma:
````go title="consensus/ibft/extra.go"
type IstanbulExtra struct {
	Validators    []types.Address
	Seal          []byte
	CommittedSeal [][]byte
}
````

### Dados da assinatura {#signing-data}

Para o nó assinar informações no IBFT, ele usa o método *signHash*:
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
Outro método notável é o *VerifyCommittedFields*, que verifica se as selagens comprometidas são de validadores válidos:
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

Os Snapshots, como o próprio nome indica, estão lá para fornecer um *snapshot*, ou o *estado* de sistema em qualquer altura do bloco (número).

Os Snapshots contêm um conjunto de nós que são validadores, bem como informações de votação (os validadores podem votar em outros validadores).
Os validadores incluem informações de votação no cabeçalho **do minerador** arquivado e alteram o valor do **nonce**:
* O nonce é **composto apenas de números 1** se o nó quiser remover um validador
* O nonce é **inteiramente de números 0** se o nó quiser adicionar um validador

Os Snapshots são calculados usando o método ***processHeaders***:

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

Em geral, este método é chamado com 1 cabeçalho, mas o fluxo é igual, até mesmo com múltiplos cabeçalhos. <br />
Para cada cabeçalho aprovado, o IBFT precisa verificar se o proponente do cabeçalho é o validador. Isso pode ser feito facilmente
utilizando o snapshot mais recente e verificando se o nó está no conjunto de validadores.

Em seguida, o nonce é verificado. O voto é incluído e calculado e, se houver votos suficientes, o nó é adicionado/removido do
conjunto de validadores e, em seguida, o novo snapshot é salvo.

#### Armazenamento de Snapshots {#snapshot-store}

O serviço de snapshots gerencia e atualiza uma entidade chamada **snapshotStore**, que armazena a lista de todos os snapshots disponíveis.
Usando isso, o serviço é capaz de descobrir rapidamente com o que o snapshot está associado a que altura do bloco.
````go title="consensus/ibft/snapshot.go"
type snapshotStore struct {
	lastNumber uint64
	lock       sync.Mutex
	list       snapshotSortedList
}
````

### Inicialização do IBFT {#ibft-startup}

Para iniciar o IBFT, o Polygon Edge precisa primeiramente configurar o transporte do IBFT:
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

Essencialmente, cria um novo tópico com o protocolo IBFT, com uma mensagem do novo protocolo Buff.<br />
As mensagens destinam-se a ser usadas por validadores. O Polygon Edge assina o tópico e controla as mensagens em conformidade com ele.

#### MessageReq {#messagereq}

A mensagem trocada por validadores:
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

O campo **Exibir** no **MessageReq** representa a posição atual do nó dentro da chain.
Ele tem uma *rodada* e um atributo de *sequência*.
* A **rodada** representa a rodada do proponente para a altura
* A **sequência** representa a altura do blockchain

O *msgQueue* arquivado na implantação do IBFT tem o objetivo de armazenar solicitações de mensagem. Ele ordena as mensagens pela
*Visualização* (em primeiro lugar por sequência, em seguida, por rodada). A implementação do IBFT também possui filas diferentes para estados diferentes no sistema.

### Estados do IBFT {#ibft-states}

Depois que o mecanismo de consenso é iniciado usando o método **Iniciar**, ele é executado em um loop infinito que simula uma máquina de estado:
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

Inicialmente, todos os nós começam no estado **Sincr**.

Isso ocorre porque novos dados precisam ser obtidos do blockchain. O cliente precisa descobrir se é o validador,
encontrar o snapshot atual. Este estado resolve qualquer bloco pendente.

Depois que a sincronização terminar e o cliente determinar que ele realmente é um validador, ele precisa transferir para **AcceptState**.
Se o cliente **não** for um validador, ele continuará sincronizando e permanecerá no **SyncState**

#### AcceptState {#acceptstate}

O estado **Aceitar** sempre verifica o snapshot e o conjunto de validadores. Se o nó atual não estiver no conjunto de validadores,
ele retorna ao estado **Sync**.

Por outro lado, se o nó **for** um validador, ele calcula o proponente. Se for descoberto que o nó atual é o
proponente, ele constrói um bloco e envia um pré-preparo. Em seguida, prepara mensagens.

* Mensagens pré-preparadas: as mensagens enviadas por proponentes a validadores, para permitir que eles conheçam a proposta
* Mensagens preparadas: as mensagens em que os validadores concordam com uma proposta. Todos os nós recebem todas as mensagens preparadas
* Mensagens de compromisso - mensagens que contêm informações de compromisso para a proposta

Se o nó atual **não for** um validador, ele usa o método *getNextMessage* para ler mensagem da fila exibida anteriormente. <br />
Ele aguarda as mensagens pré-preparadas. Assim que for confirmado que tudo está correto, o nó se move para o estado **Validar**.

#### ValidateState {#validatestate}

O estado **Validar** é bastante simples - a única coisa que os nós fazem neste estado é ler as mensagens e adicioná-las ao estado local do snapshot.

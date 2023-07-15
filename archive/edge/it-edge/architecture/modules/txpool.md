---
id: txpool
title: TxPool
description: Spiegazione per il modulo TxPool di Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - TxPool
  - transaction
  - pool
---

## Panoramica {#overview}

Il modulo TxPool rappresenta l'implementazione del pool della transazione, dove vengono aggiunte transazioni da diverse parti del sistema. Il modulo espone anche diverse funzionalità utili per gli operatori del nodo, che vengono trattate di seguito.

## Comandi dell'operatore {#operator-commands}

````go title="txpool/proto/operator.proto
service TxnPoolOperator {
    // Status returns the current status of the pool
    rpc Status(google.protobuf.Empty) returns (TxnPoolStatusResp);

    // AddTxn adds a local transaction to the pool
    rpc AddTxn(AddTxnReq) returns (google.protobuf.Empty);

    // Subscribe subscribes for new events in the txpool
    rpc Subscribe(google.protobuf.Empty) returns (stream TxPoolEvent);
}

````

Gli operatori del nodo possono richiedere questi endpoint del GRPC, come descritto nella sezione **[Comandi CLI](/docs/edge/get-started/cli-commands#transaction-pool-commands)**.

## Elaborazione delle transazioni {#processing-transactions}

````go title="txpool/txpool.go"
// AddTx adds a new transaction to the pool
func (t *TxPool) AddTx(tx *types.Transaction) error {
	if err := t.addImpl("addTxn", tx); err != nil {
		return err
	}

	// broadcast the transaction only if network is enabled
	// and we are not in dev mode
	if t.topic != nil && !t.dev {
		txn := &proto.Txn{
			Raw: &any.Any{
				Value: tx.MarshalRLP(),
			},
		}
		if err := t.topic.Publish(txn); err != nil {
			t.logger.Error("failed to topic txn", "err", err)
		}
	}

	if t.NotifyCh != nil {
		select {
		case t.NotifyCh <- struct{}{}:
		default:
		}
	}
	return nil
}

func (t *TxPool) addImpl(ctx string, txns ...*types.Transaction) error {
	if len(txns) == 0 {
		return nil
	}

	from := txns[0].From
	for _, txn := range txns {
		// Since this is a single point of inclusion for new transactions both
		// to the promoted queue and pending queue we use this point to calculate the hash
		txn.ComputeHash()

		err := t.validateTx(txn)
		if err != nil {
			return err
		}

		if txn.From == types.ZeroAddress {
			txn.From, err = t.signer.Sender(txn)
			if err != nil {
				return fmt.Errorf("invalid sender")
			}
			from = txn.From
		} else {
			// only if we are in dev mode we can accept
			// a transaction without validation
			if !t.dev {
				return fmt.Errorf("cannot accept non-encrypted txn")
			}
		}

		t.logger.Debug("add txn", "ctx", ctx, "hash", txn.Hash, "from", from)
	}

	txnsQueue, ok := t.queue[from]
	if !ok {
		stateRoot := t.store.Header().StateRoot

		// initialize the txn queue for the account
		txnsQueue = newTxQueue()
		txnsQueue.nextNonce = t.store.GetNonce(stateRoot, from)
		t.queue[from] = txnsQueue
	}
	for _, txn := range txns {
		txnsQueue.Add(txn)
	}

	for _, promoted := range txnsQueue.Promote() {
		t.sorted.Push(promoted)
	}
	return nil
}
````
Il metodo ***addImpl*** è il pane quotidiano del modulo **TxPool**.
È il luogo centrale dove vengono aggiunte le transazioni nel sistema, chiamate dal servizio GRPC, dagli endpoint JSON RPC,
e ogni volta che il client riceve una transazione attraverso il protocollo di **gossip**.

Prende come argomento **ctx**, che denota semplicemente il contesto da cui vengono aggiunte le transazioni (GRPC, JSON RPC...). <br />
L'altro parametro è la lista delle transazioni da aggiungere al pool.

La cosa principale da notare qui è il controllo del campo **Da** all'interno della transazione:
* Se il campo **Da** è **vuoto**, viene considerata come una transazione non crittografata/non firmata. Questi tipi di transazioni sono accettate solo in modalità sviluppo
* Se il campo **Da** **non è vuoto**, significa che si tratta di una transazione firmata, perciò viene eseguita la verifica della firma

Dopo tutte queste convalide, le transazioni vengono considerate valide.

## Strutture dei dati {#data-structures}

````go title="txpool/txpool.go"
// TxPool is a pool of transactions
type TxPool struct {
	logger hclog.Logger
	signer signer

	store      store
	idlePeriod time.Duration

	queue map[types.Address]*txQueue
	sorted *txPriceHeap

	// network stack
	network *network.Server
	topic   *network.Topic

	sealing  bool
	dev      bool
	NotifyCh chan struct{}

	proto.UnimplementedTxnPoolOperatorServer
}
````

I campi nell'oggetto TxPool che possono creare confusione sono la **coda** e le liste **ordinate**.
* **coda** - Implementazione heap di una lista ordinata di transazioni dell'account (per nonce)
* **ordinata**- Lista ordinata per tutte le transazioni promosse in corso (tutte le transazioni eseguibili). Ordinata per prezzo del gas

## Gestione degli errori di limite del gas {#gas-limit-error-management}

Ogni volta che invii una transazione, ci sono tre modi per elaborarla dal TxPool.

1. Tutte le transazioni in sospeso possono rientrare in un blocco
2. Una o più transazioni in sospeso non può rientrare in un blocco
3. Una o più transazioni in sospeso non rientrerà mai in un blocco

Qui, la parola **_rientrare_** significa che transazione ha un limite di gas inferiore a quello gas rimanente nel TxPool.

Il primo scenario non produce alcun errore.

### Secondo scenario {#second-scenario}

- Il gas rimanente del TxPool viene impostato al limite del gas dell'ultimo blocco, diciamo **5000**
- Una prima transazione viene elaborata e consuma **3000** unità di gas del TxPool
  - Il gas rimanente del TxPool è ora **2000**
- Viene inviata una seconda transazione, che è uguale alla prima poiché consumano entrambe 3000 unità di gas
- Poiché il gas rimanente del TxPool è **inferiore** al gas della transazione, non può essere elaborato nel blocco
corrente
  - Viene rimesso in una coda delle transazioni in sospeso in modo che possa essere elaborato nel blocco successivo
- Viene scritto il primo blocco, chiamiamolo **blocco #1**
- Il gas rimanente del TxPool viene impostato sul blocco genitore - limite di gas del **blocco #1**
- La transazione che è stata reinserita nella coda delle transazioni in sospeso di TxPool viene ora elaborata e scritta nel blocco
  - Il gas rimanente del TxPool è ora **2000**
- Viene scritto il secondo blocco
- ...

![Scenario di errore di TxPool #1](/img/edge/txpool-error-1.png)

### Terzo scenario {#third-scenario}
- Il gas rimanente del TxPool viene impostato al limite del gas dell'ultimo blocco, diciamo **5000**
- Una prima transazione viene elaborata e consuma **3000** unità di gas del TxPool
    - Il gas rimanente del TxPool è ora **2000**
- Viene presentata una seconda transazione, con un campo gas impostato a **6000**
- Poiché il limite di gas del blocco è **inferiore** al gas della transazione, tale transazione viene scartata
    - Non sarà mai in grado di rientrare in un blocco
- Viene scritto il primo blocco
- ...


![Scenario errore TxPool #2](/img/edge/txpool-error-2.png)

> Questo avviene ogni volta che si ottiene il seguente errore:
> ```shell
> 2021-11-04T15:41:07.665+0100 [ERROR] polygon.consensus.dev: failed to write transaction: transaction's gas limit exceeds block gas limit
> ```

## Target per il gas del blocco {#block-gas-target}

Ci sono situazioni in cui i nodi vogliono mantenere il limite di gas del blocco al di sotto o in corrispondenza di un determinato target su una catena di esecuzione.

L'operatore del nodo può impostare il limite di gas target su un nodo specifico, che cercherà di applicare questo limite ai blocchi di nuova creazione. Se anche la maggior parte degli altri nodi ha impostato un limite di gas target simile (o uguale), allora il limite di gas del blocco si sposterà sempre
intorno a quel target di gas del blocco, procedendo lentamente verso di esso (al massimo `1/1024 * parent block gas limit`) man mano che vengono creati i nuovi blocchi.

### Scenario di esempio {#example-scenario}

* L'operatore del nodo imposta il limite di gas del blocco per un singolo nodo su `5000`
* Anche altri nodi sono configurati su `5000`, tranne un singolo nodo che è configurato su `7000`
* Quando i nodi che hanno il target del gas impostato su `5000` diventano dei proponenti, verificheranno se il limite del gas ha già raggiunto il target
* Se il limite del gas non è al target (è maggiore/inferiore), il nodo proponente imposterà il target del gas del blocco al massimo (1/1024 * limite del gas madre) nella direzione del target
   1. Es.: `parentGasLimit = 4500` e `blockGasTarget = 5000`, il proponente calcolerà il limite del gas per il nuovo blocco a `4504.39453125` (`4500/1024 + 4500`)
   2. Es.: `parentGasLimit = 5500` e `blockGasTarget = 5000`, il proponente calcolerà il limite del gas per il nuovo blocco a `5494.62890625` (`5500 - 5500/1024`)
* Ciò garantisce che il limite del gas del blocco nella catena verrà mantenuto al target, perché il singolo proponente che ha il target configurato a `7000`non può avanzare di molto il limite e la maggioranza
dei nodi che l'ha impostato a `5000` cercherà sempre di tenerlo lì
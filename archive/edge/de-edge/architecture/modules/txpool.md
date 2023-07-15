---
id: txpool
title: TxPool
description: Erläuterung für das TxPool-Modul von Polygon Edge.
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

## Übersicht {#overview}

Das TxPool-Modul stellt die Implementierung des Transaktionspools dar, in dem Transaktionen aus verschiedenen Teilen
des Systems hinzugefügt werden. Das Modul bietet auch einige nützliche Funktionen für Knotenbetreiber, die im Folgenden beschrieben werden.

## Bedienerbefehle {#operator-commands}

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

Die Knotenbetreiber können diese GRPC-Endpunkte abfragen, wie im Abschnitt **[CLI-Befehle](/docs/edge/get-started/cli-commands#transaction-pool-commands)** beschrieben.

## Verarbeitung von Transaktionen {#processing-transactions}

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
Die ***addImpl*** Methode ist das A und O des **TxPool**-Moduls. Es ist der zentrale Ort, an dem Transaktionen im System hinzugefügt werden. Er wird vom GRPC-Service, von JSON-RPC-Endpunkten,
und immer dann aufgerufen, wenn der Client eine Transaktion über das **Gossip**-Protokoll erhält.

Als Argument wird **ctx** verwendet, das den Kontext angibt, aus dem die Transaktionen hinzugefügt werden (GRPC, JSON RPC...). <br />
Der andere Parameter sind die Liste der Transaktionen, die dem Pool hinzugefügt werden sollen.

Der hier zu beachtende Key ist die Prüfung des **Von** Feldes innerhalb der Transaktion:
* Wenn das **Von** Feld **leer** ist, wird es als unverschlüsselte/unsignierte Transaktion betrachtet. Diese Arten von Transaktionen werden nur
im Entwicklungsmodus akzeptiert
* Wenn das **Von** Feld **nicht leer** ist, bedeutet das, dass es sich um eine signierte Transaktion handelt, also findet eine Signaturprüfung statt

Nach all diesen Prüfungen gelten die Transaktionen als gültig.

## Datenstrukturen {#data-structures}

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

Die Felder im TxPool-Objekt, die für Verwirrung sorgen können, sind **Warteschlange** und **sortierte** Listen.
* **Warteschlange** – Heap-Implementierung einer sortierten Liste von Kontobewegungen (nach Nonce)
* **sortiert** – Sortierte Liste für alle aktuell beförderten Vorgänge (alle ausführbaren Vorgänge). Sortiert nach Gaspreis

## Gaslimit-Fehlermanagement {#gas-limit-error-management}

Wenn Sie eine Transaktion einreichen, gibt es drei Möglichkeiten, wie sie vom TxPool verarbeitet werden kann.

1. Alle anstehenden Transaktionen können in einen Block passen
2. Eine oder mehrere anstehende Transaktionen können nicht in einen Block passen
3. Eine oder mehrere anstehende Transaktionen werden niemals in einen Block passen

Hier bedeutet das Wort **_passen_**, dass die Transaktion ein Gaslimit hat, das niedriger ist als das verbleibende Gas im TxPool.

Das erste Szenario verursacht keinen Fehler.

### Zweites Szenario {#second-scenario}

- Das verbleibende Gas im TxPool wird auf das Gaslimit des letzten Blocks gesetzt, z.B. **5000**
- Eine erste Transaktion verarbeitet und verbraucht **3000** Gas aus dem TxPool
  - Das restliche Gas des TxPool beträgt jetzt **2000**
- Eine zweite Transaktion, die dieselbe ist wie die erste – beide verbrauchen 3000 Einheiten Gas – wird eingereicht
- Da das verbleibende Gas des TxPools **niedriger** ist als das Transaktionsgas, kann es im aktuellen
Block nicht verarbeitet werden
  - Es wird in eine Warteschlange für ausstehende Transaktionen zurückgestellt, damit es im nächsten Block bearbeitet werden kann
- Der erste Block ist fertig – nennen wir ihn **Block #1**
- Das verbleibende TxPool-Gas wird auf das Gaslimit des übergeordneten Blocks gesetzt – **Block #1**
- Die Transaktion, die in die TxPool-Warteschlange für ausstehende Transaktionen zurückgestellt wurde, wird nun verarbeitet und in den Block geschrieben
  - Das verbleibende TxPool Gas beträgt jetzt **2000**
- Der zweite Block ist geschrieben
- ...

![TxPool Fehler-Szenario #1](/img/edge/txpool-error-1.png)

### Drittes Szenario {#third-scenario}
- Das verbleibende Gas im TxPool wird auf das Gaslimit des letzten Blocks gesetzt, z.B. **5000**
- Eine erste Transaktion verarbeitet und verbraucht **3000** Gas aus dem TxPool
    - Das restliche Gas des TxPool beträgt jetzt **2000**
- Eine zweite Transaktion mit einem Gasfeld auf **6000** wird eingereicht
- Da das Blockgaslimit **niedriger** ist als das Transaktionsgas, wird diese Transaktion verworfen
    - Es wird niemals in einen Block passen
- Der erste Block ist geschrieben
- ...


![TxPool Fehler-Szenario #2](/img/edge/txpool-error-2.png)

> Folgendes kann passieren, wenn der nachfolgenden Fehler auftritt:
> ```shell
> 2021-11-04T15:41:07.665+0100 [ERROR] polygon.consensus.dev: failed to write transaction: transaction's gas limit exceeds block gas limit
> ```

## Blockgas-Ziel {#block-gas-target}

Es gibt Situationen, in denen die Knoten das Blockgaslimit in einer laufenden Chain unter oder bei einem bestimmten Zielwert halten wollen.

Der Knotenbetreiber kann das Zielgaslimit für einen bestimmten Knoten festlegen, der dann versucht, dieses Limit auf neu erstellte Blöcke anzuwenden.
Wenn die Mehrheit der anderen Knoten ein ähnliches (oder gleiches) Zielgaslimit festgelegt hat, wird sich das Blockgaslimit immer um dieses Blockgas-Ziel
herum bewegen und sich langsam darauf zubewegen (bei maximal)`1/1024 * parent block gas limit`, wenn neue Blöcke erstellt werden.

### Beispiel-Szenario {#example-scenario}

* Der Knotenbetreiber legt das Blockgaslimit für einen einzelnen Knoten auf den Wert `5000`fest
* Andere Knoten sind ebenfalls als `5000`konfiguriert, mit Ausnahme eines einzelnen Knotens, der als k`7000`onfiguriert ist.
* Wenn die Knoten, die ihr Gasziel auf `5000`gesetzt haben, Antragsteller werden, prüfen sie, ob das Gaslimit bereits das Ziel erreicht hat
* Wenn das Gaslimit nicht auf dem Zielwert liegt (es ist größer/kleiner), setzt der Antragsknoten das Blockgas-Ziel auf höchstens (1/1024 * übergeordnetes Gaslimit) in Richtung des Ziels
   1. z. B.:`parentGasLimit = 4500` und `blockGasTarget = 5000` berechnet der Antragsteller das Gaslimit für den neuen Block wie folgt (`4504.39453125`)`4500/1024 + 4500`
   2. z. B.:`parentGasLimit = 5500` und `blockGasTarget = 5000` berechnet der Antragsteller das Gaslimit für den neuen Block wie folgt (`5494.62890625`)`5500 - 5500/1024`
* Dies stellt sicher, dass das Blockgaslimit in der Chain auf dem Zielwert gehalten wird, da der einzelne Antragsteller, der den Zielwert auf `7000`konfiguriert hat, den Grenzwert nicht wesentlich erhöhen kann, und die Mehrheit
der Knoten, die den Wert auf `5000`eingestellt haben, immer versuchen wird, ihn auf diesem Wert zu halten
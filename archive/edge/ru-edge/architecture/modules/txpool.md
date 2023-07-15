---
id: txpool
title: TxPool
description: Объяснение к модулю TxPool в Polygon Edge.
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

## Обзор {#overview}

Модуль TxPool представляет собой реализацию пула транзакций, в который транзакции добавляются из различных частей системы. Модуль также предоставляет несколько полезных функций для операторов нодов, которые описаны ниже.

## Команды оператора {#operator-commands}

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

Операторы нодов могут запрашивать эти конечные точки GRPC, как описано в разделе **[Команды CLI](/docs/edge/get-started/cli-commands#transaction-pool-commands)**.

## Обработка транзакций {#processing-transactions}

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
Метод ***addImpl*** — это то, с чем работает модуль **TxPool**. Это то место, где в систему добавляются транзакции, которые вызываются из сервиса GRPC, конечных точек JSON RPC, каждый раз, когда клиент получает транзакцию через протокол **gossip**.

Он принимает в качестве аргумента **ctx**, который просто обозначает контекст, из которого добавляются транзакции (GRPC, JSON RPC...)<br />. Другим параметром является список транзакций, которые должны быть добавлены в пул.

Главное, на что следует обратить внимание, — это проверка поля **От** в транзакции:
* Если поле **От** **пустое**, транзакция считается незашифрованной/неподписанной. Эти виды транзакций можно принимать лишь в рамках режима разработки
* Если поле **От** **не пусто**, это означает, что это подписанная транзакция, и поэтому осуществляется верификация подписи

После проведения всех проверок транзакции считаются действительными.

## Структуры данных {#data-structures}

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

Поля в объекте TxPool, которые могут вызвать путаницу, — это **очередь** и **отсортированные** списки.
* **очередь** — это массовая реализация отсортированного списка транзакций аккаунта (по случайному одноразовому числу)
* **отсортированный** — отсортированный список для всех текущих продвигаемых транзакций (всех исполняемых транзакций). Отсортированный по цене на газ

## Управление ошибками предельного уровня газа {#gas-limit-error-management}

Когда вы отправляете транзакцию, существует три способа ее обработки в TxPool.

1. Все отложенные транзакции могут вписываться в блок
2. Одна или несколько отложенных транзакций не могут вписываться в блок
3. Одна или несколько отложенных транзакций никогда не вписываются в блок

Здесь слово **_вписываться_** означает, что транзакция имеет лимит газа, который ниже, чем уровень газа, который остается в TxPool.

Первый сценарий не приводит к возникновению ошибки.

### Второй сценарий {#second-scenario}

- Уровень оставшегося газа в TxPool устанавливается в качестве предельного уровня газа в последнем блоке, допустим **5000**
- Первая транзакция обрабатывается и потребляет **3000** газа из TxPool
  - Оставшийся уровень газа в TxPool составляет сейчас **2000**
- Затем подается вторая транзакция, которая является такой же, как и первая: они обе потребляют 3000 газа
- Поскольку уровень оставшегося газа в TxPool сейчас **ниже**, чем газ в транзакциях, ее невозможно обработать в текущем блоке
  - Она возвращается в очередь транзакций для того, чтобы ее можно было обработать в следующем блоке
- Первый блок написан, назовем его **блок №1**
- Уровень оставшегося газа в TxPool устанавливается в качестве предельного уровня газа родительского блока, а именно **блока №1**
- Транзакция, которая была возвращена в очередь отложенных транзакций в TxPool, теперь обрабатывается и записывается в блок
  - Оставшийся уровень газа в TxPool составляет сейчас **2000**
- Второй блок написан
- ...

![Сценарий ошибки TxPool №1](/img/edge/txpool-error-1.png)

### Третий сценарий {#third-scenario}
- Уровень оставшегося газа в TxPool устанавливается в качестве предельного уровня газа в последнем блоке, допустим **5000**
- Первая транзакция обрабатывается и потребляет **3000** газа из TxPool
    - Оставшийся уровень газа в TxPool составляет сейчас **2000**
- Подается вторая транзакция с уровнем газа в размере **6000**
- Поскольку лимит газа **ниже**, чем газ в транзакции, эта транзакция отбрасывается
    - Она никогда не сможет вписаться в блок
- Первый блок написан
- ...


![Сценарий ошибки TxPool №2](/img/edge/txpool-error-2.png)

> Этот сценарий происходит, когда вы получаете следующую ошибку:
> ```shell
> 2021-11-04T15:41:07.665+0100 [ERROR] polygon.consensus.dev: failed to write transaction: transaction's gas limit exceeds block gas limit
> ```

## Целевой показатель газа для блоков {#block-gas-target}

Существуют ситуации, когда ноды хотят держать лимит газа ниже или на определенном целевом показателе в работающей цепочке.

Оператор нода может установить целевой показатель предельного уровня газа на определенный нод, который попытается применить этот предельный уровень к вновь созданным блокам. Если большинство других нодов также имеют аналогичный (или такой же) целевой показатель предельного уровня газа, то лимит газа для блоков будет всегда находиться около этого целевого показателя газа для блоков, медленно продвигаясь к нему (по максимуму `1/1024 * parent block gas limit`) по мере создания новых блоков.

### Пример сценария {#example-scenario}

* Оператор нода устанавливает лимит газа для одиночного нода на уровне `5000`
* Другие ноды также настроены на уровне `5000`, кроме одиночного нода, который настроен на уровне `7000`
* Когда ноды, для которых настроен целевой показатель уровня газа в размере `5000`, станут авторами предложения, они будут проверять, не достигнут ли уже целевой показатель предельного уровня газа
* Если лимит газа не достиг целевого показателя (он выше или ниже), предлагающий нод установит целевой показатель газа для блоков на наивысший уровень (1/1024 *родительский лимит газа) в направлении целевого показателя
   1. Например: `parentGasLimit = 4500`и `blockGasTarget = 5000`, автор предложения рассчитает лимит газа для нового блока на уровне `4504.39453125` (`4500/1024 + 4500`)
   2. Например: `parentGasLimit = 5500`и `blockGasTarget = 5000`, автор предложения рассчитает лимит газа для нового блока на уровне `5494.62890625` (`5500 - 5500/1024`)
* Это обеспечивает сохранение лимита газа для блоков в цепочке на целевом уровне, поскольку единичный автор предложения, у которого целевой показатель установлен на `7000`, не может сильно продвинуть предельный уровень, а большинство нодов, у которых он установлен на уровне `5000`, всегда будут пытаться сохранить его на том значении
---
id: txpool
title: TxPool
description: Explicación del módulo TxPool (Grupo de transacciones) de Polygon Edge
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

## Descripción general {#overview}

El módulo TxPool (Grupo de transacciones) representa la implementación del grupo de transacciones, donde se agregan transacciones desde diferentes partes del
sistema. El módulo también expone varias funciones útiles para los operadores de nodos, que se describen a continuación.

## Comandos del operador {#operator-commands}

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

Los operadores de los nodos pueden consultar estos terminales de GRPC, tal y como se describe en la sección **[Comandos CLI](/docs/edge/get-started/cli-commands#transaction-pool-commands)**.

## Procesamiento de transacciones {#processing-transactions}

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
El método ***addImpl*** es el elemento principal del módulo **TxPool**.
Es el lugar central donde las transacciones se añaden en el sistema y se llaman desde el servicio GRPC, terminales de RPC JSON
y cuando el cliente recibe una transacción a través del protocolo **gossip**.

Se admite como un argumento **ctx**, que acaba de denominar el contexto desde el que se están agregando las transacciones (GRPC, JSON RPC...)<br />.
El otro parámetro es la lista de transacciones que se le agregarán al grupo.

La clave aquí es revisar el campo **From** dentro de la transacción:
* Si el campo **From** está **vacío**, se considera una transacción no cifrada o no firmada. Ese tipo de transacciones son
aceptadas solo en modo de desarrollo
* Si el campo **From** no **está vacío**, se trata de una transacción firmada, por lo que se hace la verificación de la firma.

Después de todas esas validaciones, las transacciones se consideran válidas.

## Estructuras de datos {#data-structures}

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

Los campos del objeto TxPool (Grupo de transacciones) que pueden causar confusión son **queues** (colas) y las listas **sorted** (ordenadas).
* **queue**: implementación en pila de una lista ordenada de transacciones de cuentas (por nonce)
* **sorted**: lista ordenada para todas las transacciones promovidas actuales (todas las transacciones ejecutables). Clasificada por el precio de gas

## Gestión de errores del límite de gas {#gas-limit-error-management}

Cada vez que envías una transacción, hay tres maneras en que puede ser procesada por el TxPool.

1. Todas las transacciones pendientes pueden caber en un bloque
2. Una o más transacciones pendientes pueden no caber en un bloque
3. Una o más transacciones pendientes nunca caben en un bloque

Aquí, la palabra **_fit_** (caber) significa que la transacción tiene un límite de gas que es más bajo que el gas restante en el grupo de transacciones.

El primer escenario no produce ningún error.

### Segundo escenario {#second-scenario}

- El gas restante del grupo de transacciones está establecido en el límite de gas del último bloque, por ejemplo **5000**
- La primera transacción se procesa y consume **3000** de gas del grupo de transacciones
  - El gas restante del grupo de transacciones ahora es **2000**
- Se envía la segunda transacción, que es igual a la primera, ya que ambas consumen 3000 unidades de gas
- Dado que el gas restante del grupo de transacciones es **más bajo** que el gas de la transacción, no se puede procesar en el actual
bloque
  - Se vuelve a poner en una cola de transacciones pendientes para que pueda ser procesado en el bloque siguiente
- El primer bloque se escribe, llamémoslo **bloque n.º 1**
- El gas restante del grupo de transacciones se ajusta al límite de gas del bloque primario, **el bloque n.° 1**
- La transacción que se volvió a poner en la cola de transacciones pendientes del grupo de transacciones se procesa y se escribe en el bloque
  - El gas restante del grupo de transacciones ahora es **2000**
- Se escribe el segundo bloque
- ...

![Escenario de error del grupo de transacciones n.º 1](/img/edge/txpool-error-1.png)

### Tercer escenario {#third-scenario}
- El gas restante del grupo de transacciones está establecido en el límite de gas del último bloque, por ejemplo **5000**
- La primera transacción se procesa y consume **3000** de gas del grupo de transacciones
    - El gas restante del grupo de transacciones ahora es **2000**
- Se envía la segunda transacción, con un campo de gas establecido en **6000**
- Como el límite de gas del bloque es **más bajo** que el gas de la transacción, esta se descarta.
    - Nunca podra caber en un bloque
- Se escribe el primer bloque
- ...


![Escenario de error del grupo de transacciones n.º 2](/img/edge/txpool-error-2.png)

> Eso ocurre cada vez que se obtiene el siguiente error:
> ```shell
> 2021-11-04T15:41:07.665+0100 [ERROR] polygon.consensus.dev: failed to write transaction: transaction's gas limit exceeds block gas limit
> ```

## Meta de gas del bloque {#block-gas-target}

Hay situaciones en las que los nodos quieren mantener el límite de gas de los bloques por debajo o en una determinada meta en una cadena en funcionamiento.

El operador del nodo puede establecer el límite de gas meta en un nodo específico, que intentará aplicarle ese límite a los bloques recién creados.
Si la mayoría de los demás nodos también cuentan con un límite de gas meta similar (o igual), el límite de gas del bloque siempre
rondará ese límite de gas meta del bloque, avanzando lentamente hacia él (a un máximo de `1/1024 * parent block gas limit`) a medida que se crean nuevos bloques.

### Escenario de ejemplo {#example-scenario}

* El operador del nodo establece el límite de gas del bloque para un solo nodo para ser `5000`
* Otros nodos están configurados para ser `5000`también, aparte de un único nodo que está configurado para ser `7000`
* Cuando los nodos que tienen su meta de gas establecida para `5000`se convierten en proponentes, revisarán si el límite de gas ya está en la meta
* Si el límite de gas no ha llegado a la meta (es mayor / menor), el nodo proponente establecerá la meta de gas del bloque a lo sumo (1/1024 * límite de gas principal) en la dirección de la meta
   1. Ej: `parentGasLimit = 4500`y `blockGasTarget = 5000`, el proponente calculará el límite de gas para el nuevo bloque como `4504.39453125`(`4500/1024 + 4500`)
   2. Ej: `parentGasLimit = 5500`y `blockGasTarget = 5000`, el proponente calculará el límite de gas para el nuevo bloque como `5494.62890625`(`5500 - 5500/1024`)
* Eso garantiza que el límite de gas en el bloque en la cadena se mantendrá en la meta, porque el único proponente que tiene la meta configurada en `7000`no puede incrementar mucho el límite y la mayoría de los nodos que lo han establecido en `5000`siempre intentarán mantenerlo allí
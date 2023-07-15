---
id: txpool
title: TxPool
description: Explicação para o módulo TxPool do Polygon Edge.
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

## Visão geral {#overview}

O módulo TxPool representa a implementação da pool de transações, onde são adicionadas transações de diferentes partes do
sistema. O módulo também expõe várias funcionalidades úteis para operadores de nós, que são abordadas abaixo.

## Comandos do operador {#operator-commands}

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

Os operadores de nós podem consultar estes endpoints GRPC, como descrito na secção **[Comandos CLI](/docs/edge/get-started/cli-commands#transaction-pool-commands)**.

## Processamento de transações {#processing-transactions}

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
O método ***addImpl*** é um componente vital do módulo **TxPool**.
É o ponto central para adição de transações ao sistema, sendo chamado a partir do serviço GRPC, os endpoints JSON RPC,
e sempre que o cliente receber uma transação através do protocolo **gossip**.

É inserido como argumento **ctx**, que apenas denota o contexto a partir do qual as transações são adicionadas (GRPC, JSON RPC...). <br />
O outro parâmetro é a lista de transações a adicionar à pool.

O essencial a verificar aqui é o campo **From** no seio da transação:
* Se o campo **From** estiver **vazio**, é considerado como uma transação não criptografada/não assinada. Estes tipos de transações só são
aceites no modo de desenvolvimento
* Se o campo **From** **não estiver vazio**, isso significa que é uma transação assinada, pelo que ocorrerá uma verificação da assinatura

As transações são consideradas válidas depois de todas estas validações.

## Estruturas de dados {#data-structures}

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

Os campos do objeto TxPool que podem causar confusão são as listas **queue** e **sorted**.
* **queue** - implementação heap de uma lista ordenada de transações de contas (por nonce)
* **sorted** - lista ordenada para todas as transações promovidas atuais (todas as transações executáveis). Ordenada pelo preço do gás

## Gestão do erro de limite de gás {#gas-limit-error-management}

Sempre que enviar uma transação, há três maneiras pelas quais ela pode ser processada pela TxPool.

1. Todas as transações pendentes podem caber num bloco
2. Uma ou mais transações pendentes não cabem num bloco
3. Uma ou mais transações pendentes nunca caberão num bloco

Aqui, a palavra **_caber_** significa que a transação tem um limite de gás que é inferior ao gás restante do TxPool.

O primeiro cenário não produz qualquer erro.

### Segundo cenário {#second-scenario}

- O gás restante da TxPool é definido de acordo com o limite de gás do último bloco, digamos **5000**
- Uma primeira transação é processada e consome **3000** gás da TxPool
  - O gás restante da TxPool é agora **2000**
- Uma segunda transação, que é a mesma que a primeira - ambas consomem 3000 unidades de gás, é enviada
- Uma vez que o gás restante da TxPool é **inferior** ao gás da transação, não pode ser processada no atual
bloco
  - É colocada numa fila de transações pendentes para que possa ser processada no bloco seguinte
- O primeiro bloco é escrito, chamemos-lhe **bloco #1**
- O gás restante da TxPool é definido de acordo com o limite de gás do bloco-pai - **bloco #1**
- A transação que foi colocada na fila de transações pendentes da TxPool é agora processada e escrita no bloco
  - O gás restante da TxPool é agora **2000**
- O segundo bloco é escrito
- ...

![Cenário de erro #1 da TxPool](/img/edge/txpool-error-1.png)

### Terceiro cenário {#third-scenario}
- O gás restante da TxPool é definido de acordo com o limite de gás do último bloco, digamos **5000**
- Uma primeira transação é processada e consome **3000** gás da TxPool
    - O gás restante da TxPool é agora **2000**
- É enviada uma segunda transação com um limite de gás definido para **6000**
- Uma vez que o limite de gás do bloco é **inferior** ao gás da transação, esta transação é descartada
    - Nunca poderá caber num bloco
- O primeiro bloco é escrito
- ...


![Cenário de erro #2 da TxPool](/img/edge/txpool-error-2.png)

> Isto acontece sempre que obtiver o seguinte erro:
> ```shell
> 2021-11-04T15:41:07.665+0100 [ERROR] polygon.consensus.dev: failed to write transaction: transaction's gas limit exceeds block gas limit
> ```

## Valor-alvo de gás do bloco {#block-gas-target}

Há situações em que os nós pretendem manter o limite de gás do bloco abaixo ou num determinado valor na chain em curso.

O operador de nós pode definir o valor-alvo do limite de gás num nó específico, o qual tentará aplicar este limite aos blocos recém-criados.
Se a maioria dos outros nós tiver definido um valor-alvo do limite de gás semelhante (ou igual), então o limite de gás do bloco rondará sempre
o valor-alvo desse bloco, progredindo lentamente no seu sentido (no máximo, `1/1024 * parent block gas limit`) à medida que são criados novos blocos.

### Cenário de exemplo {#example-scenario}

* O operador de nós define o limite de gás do bloco num só nó como `5000`
* Outros nós são igualmente configurados para `5000`, exceto um único nó, que é configurado para `7000`
* Quando os nós com o valor-alvo do gás definido para `5000` se tornarem proponentes, eles verificarão se o limite de gás já se encontra no valor-alvo
* Se o limite de gás não estiver no valor-alvo (é superior/inferior a este), o nó proponente irá definir o valor-alvo de gás do bloco no máximo (1/1024 * limite de gás do bloco pai) no sentido do alvo
   1. Ex: `parentGasLimit = 4500` e `blockGasTarget = 5000`, o proponente irá calcular o limite de gás para o novo bloco como `4504.39453125` (`4500/1024 + 4500`)
   2. Ex: `parentGasLimit = 5500` e `blockGasTarget = 5000`, o proponente irá calcular o limite de gás para o novo bloco como `5494.62890625` (`5500 - 5500/1024`)
* Isto garante que o limite de gás do bloco na chain se mantém no valor-alvo, porque o proponente individual que tem o alvo configurado para `7000` não pode avançar muito o limite e a maioria
dos nós que o tiverem definido como `5000` tentarão sempre mantê-lo nesse valor
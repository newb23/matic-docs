---
id: txpool
title: TxPool
description: Polygon 엣지의 TxPool 모듈에 대한 설명.
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

## 개요 {#overview}

TxPool 모듈은 트랜잭션이 시스템의 다른 부분에서 추가되는 경우 트랜잭션 풀 구현을 나타냅니다. 또한 이 모듈은 노드 연산자에 몇 가지 유용한 기능을 제공합니다. 이에 대해서는 아래에서 다룹니다.

## 연산자 명령어 {#operator-commands}

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

노드 연산자는 **[CLI 명령어](/docs/edge/get-started/cli-commands#transaction-pool-commands)** 섹션에서 설명하는 대로 이러한 GRPC 엔드포인트를 쿼리할 수 있습니다.

## 트랜잭션 처리 {#processing-transactions}

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
***addImpl*** 메서드는 **TxPool** 모듈에서 가장 중요한 부분입니다.
시스템에서 트랜잭션이 추가되는 중심 위치이며, 클라이언트가 **Gossip** 프로토콜을 통해 트랜잭션을 수신할 때마다 GRPC 서비스, JSON RPC 엔드포인트에서 호출됩니다.

**ctx** 인수를 사용하며, 이는 트랜잭션이 추가되는 컨텍스트(GRPC, JSON RPC...)를 나타냅니다.<br /> 다른 매개변수는 풀에 추가될 트랜잭션의 목록입니다.

여기에서 중요한 점은 트랜잭션 내의 **From** 필드에 대한 확인입니다.
* **From** 필드가 **비어 있다면**, 암호화/서명되지 않은 트랜잭션으로 간주됩니다. 이러한 종류의 트랜잭션은 개발 모드에서만 허용됩니다.
* **From** 필드가 **비어 있지 않다면**, 서명된 트랜잭션이라는 의미이며, 서명 검증이 이루어집니다.

모든 검증이 완료되면 트랜잭션은 유효한 것으로 간주됩니다.

## 데이터 구조 {#data-structures}

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

혼동을 일으킬 수 있는 TxPool 객체 필드는 **queue** 및 **sorted** 목록입니다.
* **queue** - 계정 트랜잭션이 정렬된 목록의 힙 구현(난스 기준)
* **sorted** - 현재 승격된 모든 트랜잭션(모든 실행 가능한 트랜잭션)이 정렬된 목록. 가스 가격 기준 정렬

## 가스 한도 오류 관리 {#gas-limit-error-management}

트랜잭션을 제출할 때마다 TxPool에서 세 가지 방식으로 이를 처리합니다.

1. 대기 중인 모든 트랜잭션이 하나의 블록 안에 들어갈 수 있습니다
2. 대기 중인 하나 이상의 트랜잭션이 하나의 블록 안에 들어갈 수 없습니다
3. 대기 중인 하나 이상의 트랜잭션이 하나의 블록 안에 절대로 들어갈 수 없을 것입니다

여기에서 '**_들어가다_**'란 트랜잭션의 가스 한도가 TxPool에 남아 있는 가스보다 낮다는 것을 의미합니다.

첫 번째 시나리오는 오류를 발생시키지 않습니다.

### 두 번째 시나리오 {#second-scenario}

- TxPool에 남아 있는 가스는 마지막 블록의 가스 한도가 됩니다(예: **5000**)
- 첫 번째 트랜잭션이 처리되면서 TxPool의 **3000** 가스를 소비합니다
  - TxPool에 남아 있는 가스는 이제 **2000**입니다
- 첫 번째 트랜잭션과 동일한 두 번째 트랜잭션이 제출됩니다(둘 모두 3000 단위의 가스를 소비합니다)
- TxPool에 남아 있는 가스는 해당 트랜잭션 가스보다 **낮기** 때문에 현재 블록에서 처리될 수 없습니다
  - 다음 블록에서 처리될 수 있도록 대기 트랜잭션 대기열로 들어갑니다
- 첫 번째 블록이 작성되었스며, 이를 **블록 #1**이라고 부르겠습니다
- TxPool에 남아 있는 가스는 상위 블록으로 설정됩니다 - **블록 #1**의 가스 한도
- TxPool 대기 트랜잭션 대기열로 들어간 트랜잭션이 이제 처리되어 블록에 작성됩니다
  - 이제 TxPool에 남아 있는 가스는 **2000**입니다
- 두 번째 블록이 작성되었습니다
- ...

![TxPool 오류 시나리오 #1](/img/edge/txpool-error-1.png)

### 세 번째 시나리오 {#third-scenario}
- TxPool에 남아 있는 가스는 마지막 블록의 가스 한도가 됩니다(예: **5000**)
- 첫 번째 트랜잭션이 처리되면서 TxPool의 **3000** 가스를 소비합니다
    - TxPool에 남아 있는 가스는 이제 **2000**입니다
- 가스 필드가 **6000**으로 설정된 두 번째 트랜잭션이 제출되었습니다
- 해당 블록의 가스 한도가 트랜잭션 가스보다 **낮기** 때문에 이 트랜잭션은 삭제됩니다
    - 이 트랜잭션은 절대로 하나의 블록에 들어갈 수 없습니다
- 첫 번째 블록이 작성되었습니다
- ...


![TxPool 오류 시나리오 #2](/img/edge/txpool-error-2.png)

> 이 시나리오는 다음 오류가 발생할 때 발생합니다.
> ```shell
> 2021-11-04T15:41:07.665+0100 [ERROR] polygon.consensus.dev: failed to write transaction: transaction's gas limit exceeds block gas limit
> ```

## 블록 가스 목표 {#block-gas-target}

노드가 블록 가스 한도를 실행 중인 체인상에서 일정 목표 이하로 유지하려는 상황이 존재합니다.

노드 연산자는 특정 노드에 목표 가스 한도를 설정할 수 있으며, 해당 노드는 새로 생성되는 블록에 이 한도를 적용하려고 할 것입니다.
나머지 노드의 대부분에도 비슷한(또는 동일한) 목표 가스 한도가 설정되어 있는 경우, 블록 가스 한도는 항상 블록 가스 목표 주변에 머물면서 새 블록이 생성됨에 따라 천천히 목표를 향해 진행합니다(최대값: `1/1024 * parent block gas limit`).

### 예시 시나리오 {#example-scenario}

* 노드 연산자가 단일 노드의 블록 가스 한도를 `5000`으로 설정합니다
* `7000`으로 구성된 단일 노드와 별도로, 다른 노드들도 `5000`으로 구성됩니다
* 가스 목표가 `5000`으로 설정된 노드가 제안자가 되는 경우, 이 노드는 가스 한도가 이미 목표 수준인지 확인합니다
* 가스 한도가 목표 수준이 아닌 경우(즉, 더 높거나 낮은 경우), 제안자 노드는 블록 가스 목표를 같은 방향으로 최대(1/1024 * 상위 가스 한도)로 설정합니다
   1. 예: `parentGasLimit = 4500` 및 `blockGasTarget = 5000`, 제안자는 새 블록의 가스 한도를 `4504.39453125`(`4500/1024 + 4500`)로 계산합니다
   2. 예: `parentGasLimit = 5500` 및 `blockGasTarget = 5000`, 제안자는 새 블록의 가스 한도를 `5494.62890625`(`5500 - 5500/1024`)로 계산합니다
* 이를 통해 체인의 블록 가스 한도는 목표 수준을 유지합니다. 목표가 `7000`으로 설정된 단일 제안자는 한도를 크게 초과할 수 없고, 목표가 `5000`으로 설정된 대다수의 노드는 항상 그 수준을 유지하려 하기 때문입니다
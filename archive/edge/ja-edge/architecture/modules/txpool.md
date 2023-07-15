---
id: txpool
title: TxPool
description: Polygon EdgeのTxPoolモジュールについて説明します。
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

## 概要 {#overview}

TxPoolモジュールは、システムのさまざまな部分からトランザクションが追加されるトランザクションプールの実装を表します。また、このモジュールでは、下記に説明するノードオペレータに役立つ機能もいくつか提供しています。

## オペレータコマンド {#operator-commands}

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

ノードオペレータは、**[CLIコマンド](/docs/edge/get-started/cli-commands#transaction-pool-commands)**セクションで説明されているように、これらのGRPCエンドポイントをクエリできます。

## トランザクションの処理 {#processing-transactions}

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
***addImpl***メソッドは、**TxPool**モジュールの基本となるものです。システムにトランザクションが追加される中心的な場所であり、GRPCサービス、JSON RPCエンドポイントからクライアントが**ゴシップ**プロトコルを介してトランザクションを受信するたびに呼び出されます。

これは、トランザクションが追加されるコンテキスト（GRPC、JSON RPCなど）を示す引数**ctx**として取り込まれます。<br />もう1つのパラメータは、プールに追加されるトランザクションのリストです。

ここで注意すべき重要な点は、トランザクション内の**From**フィールドのチェックです。
* **From**フィールドが**空**の場合、暗号化されていない／署名されていないトランザクションと見なされます。これらの種類のトランザクションは開発モードでのみ許可されます
* **From**フィールドが**空でない**場合は、署名付きトランザクションであるため、署名検証が行われます

これらすべての検証の後、トランザクションは有効であると見なされます。

## データ構造 {#data-structures}

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

混乱を引き起こす可能性のあるTxPoolオブジェクトのフィールドは、**キュー**リストと**ソート済み**リストです。
* **キュー** - アカウントトランザクションのソート済みリストのヒープ実装（ナンス単位）
* **ソート済み** - 現在プロモートされているすべてのトランザクション（すべての実行可能トランザクション）のソート済みリスト。ガス価格でソート

## ガス制限エラー管理 {#gas-limit-error-management}

トランザクションを送信するたびに、TxPoolでトランザクションを処理する方法が3つあります。

1. 保留中のすべてのトランザクションがブロックに適合できます
2. 1つ以上の保留中のトランザクションがブロックに適合できません
3. 1つ以上の保留中のトランザクションがブロックに適合することはありません

ここで、**_適合_**という言葉は、トランザクションがTxPoolに残っているガスよりも低いガス制限を持っていることを意味します。

最初のシナリオでは、エラーは発生しません。

### 第2シナリオ {#second-scenario}

- TxPoolの残りのガスは、最後のブロックのガス制限に設定されています。たとえば、**5000**としましょう
- 最初のトランザクションが処理され、TxPoolの**3000**ガスが消費されます
  - TxPoolの残りのガスは**2000**になりました
- 2回目のトランザクションは、最初のトランザクションと同じで、両方とも3000ユニットのガスを消費します
- TxPoolの残りのガスはトランザクションガスより**低い**ため、現在のブロックでは処理できません
  - 次のブロックで処理できるように、保留中のトランザクションキューに戻されます
- 最初のブロックが書き込まれます、**ブロック#1**と呼びましょう
- TxPoolの残りのガスが**ブロック#1**のガス制限である親ブロックに設定されます
- TxPool保留トランザクションキューに戻されたトランザクションが処理され、ブロックに書き込まれます
  - TxPoolの残りのガスは**2000**になりました
- 2つ目のブロックが書きこまれています
- ...

![TxPoolエラーシナリオ#1](/img/edge/txpool-error-1.png)

### 第3シナリオ {#third-scenario}
- TxPoolの残りのガスは、最後のブロックのガス制限に設定されています。たとえば、**5000**としましょう
- 最初のトランザクションが処理され、TxPoolの**3000**ガスが消費されます
    - TxPoolの残りのガスは**2000**になりました
- ガスフィールドを**6000**に設定した2回目の取引が提出されます
- ブロックのガス制限がトランザクションガスより**低い**ため、このトランザクションは廃棄されます
    - ブロックに適合することはできません
- 最初のブロックが書きこまれています
- ...


![TxPoolエラーシナリオ#2](/img/edge/txpool-error-2.png)

> これは、次のエラーが発生するたびに発生します：
> ```shell
> 2021-11-04T15:41:07.665+0100 [ERROR] polygon.consensus.dev: failed to write transaction: transaction's gas limit exceeds block gas limit
> ```

## ブロックガス目標 {#block-gas-target}

ノードがブロックのガス制限を実行中のチェーン上の特定の目標に対してそれ以下に保ちたい場合があります。

ノードオペレータは、新たに作成されたブロックにこの制限を適用しようとする特定のノードの目標ガス制限を設定できます。他のノードの大部分にも同様の（または同じ）目標ガス制限が設定されている場合、ブロックガス制限は常にブロックガス目標あたりにあり、新しいブロックが作成されると、ゆっくりと（最大`1/1024 * parent block gas limit`）進みます。

### 例となるシナリオ {#example-scenario}

* ノード演算子は、シングルのノードのブロックガス制限を`5000`に設定します
* 他のノードも、`7000`として設定されたシングルのノードとは別に、`5000`として設定されます
* ガス目標を`5000`に設定したノードはプロポーザーになると、ガスの制限がすでに目標に達しているかどうかをチェックします。
* ガス制限が目標値に達していない場合（高い／低い）、プロポーザーノードは、ブロックガス目標値を目標値の方向に最大（1/1024*親ガス制限）に設定します
   1. 例： `parentGasLimit = 4500`と`blockGasTarget = 5000`のプロポーザーは、新しいブロックのガス制限を`4504.39453125`（`4500/1024 + 4500`）として計算します
   2. 例： `parentGasLimit = 5500`と`blockGasTarget = 5000`のプロポーザーは、新しいブロックのガス制限を`5494.62890625`（`5500 - 5500/1024`）として計算します
* これにより、目標が`7000`に設定されているシングルのプロポーザーは制限をあまり進めることができず、`5000`に設定されているノードの大部分は常に制限を維持しようとするため、チェーン内のブロックガスの制限が目標に維持されます。
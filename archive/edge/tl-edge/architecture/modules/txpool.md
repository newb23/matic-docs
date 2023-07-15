---
id: txpool
title: TxPool
description: Paliwanag para sa TxPool module ng Polygon Edge.
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

## Pangkalahatang-ideya {#overview}

Ang TxPool module ay kumakatawan sa implementasyon ng transaction pool, kung saan idinadagdag ang mga transaksyon mula sa iba't ibang bahagi ng
system. Inihahayag din ng module na ito ang ilang kapaki-pakinabang na mga feature para sa mga node operator, na sinaklaw sa ibaba.

## Mga Command ng Operator {#operator-commands}

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

Maaring mag-query ang mga node operator sa mga GRPC endpoint na ito, tulad ng inilarawan sa **[CLI Command](/docs/edge/get-started/cli-commands#transaction-pool-commands)** na seksyon.

## Pagproseso ng mga Transaksyon {#processing-transactions}

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
Ang pamamaraang ***addImpl*** ay ang pinakapangunahin sa **TxPool** module.
Ito ang sentrong lugar kung saan idinadagdag ang mga transaksyon sa system, bilang kino-call mula sa GRPC service, mga JSON RPC endpoint,
at sa tuwing nakakatanggap ang client ng isang transaksyon sa pamamagitan ng **gossip** na protokol.

Pumapasok ito bilang isang argument **ctx**, na nangangahulugan lamang ng konteksto kung saan idinadagdag ang mga transaksyon (GRPC, JSON RPC...). <br />
Ang iba pang parameter ay ang listahan ng mga transaksyon na idadagdag sa pool.

Ang mahalagang bagay na dapat tandaan dito ay ang pag-check sa field na **From** sa loob ng transaksyon:
* Kung ang **From** na field ay **walang laman**, itinuturing itong hindi naka-encrypt/hindi na-sign na transaksyon. Ang mga ganitong uri ng transaksyon ay
tinatanggap lamang sa development mode
* Kung ang **From** na field ay **may laman**, nangangahulugan ito na ito ay isang na-sign na transaksyon, kaya magkakaroon ng signature verification

Pagkatapos ng lahat ng mga validation na ito, ituturing na valid ang mga transaksyon.

## Mga data structure {#data-structures}

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

Ang mga field sa TxPool object na maaaring maging sanhi ng pagkalito ay ang **queue** at **sorted** na mga listahan.
* **queue** - Maramihang pagpapatupad ng isang nakaayos na listahan ng mga account transaction (sa pamamagitan ng nonce)
* **sorted** - Nakaayos na listahan para sa lahat mga kasalukuyang promoted transaction (lahat ng mga transaksyong maaaring isagawa). Inayos ayon sa gas price

## Pamamahala ng error ng gas limit {#gas-limit-error-management}

Kapag nagsumite ka ng isang transaksyon, may tatlong paraan ng pagpoproseso nito sa pamamagitan ng TxPool.

1. Lahat ng mga nakabinbing transaksyon ay maaaring magkasya sa isang block
2. Ang isa o higit pang mga nakabinbing transaksyon ay hindi maaaring magkasya sa isang block
3. Ang isa o higit pang mga nakabinbing transaksyon ay hindi kailanman magkakasya sa isang block

Dito, ang salitang **_magkasya_** ay nangangahulugan na ang transaksyon ay may gas limit na mas mababa kaysa sa natitirang gas sa TxPool.

Ang unang scenario ay hindi makakagawa ng anumang error.

### Ikalawang scenario {#second-scenario}

- Ang natitirang gas ng TxPool ay itinakda sa gas limit ng huling block, sabihin nating **5000**
- Ang unang transaksyon ay pinoproseso at nagkukunsumo ng **3000** gas ng TxPool
  - Ang natitirang gas ng TxPool ay **2000** na ngayon.
- Ang ikalawang transaksyon, na katulad ng nauna - magkapareho silang kumukunsumo ng 3000 unit ng gas, ay isinumite
- Dahil **mas mababa** ang natitirang gas ng TxPool kaysa sa gas ng transaksyon, hindi ito maaaring iproseso sa kasalukuyang
block
  - Ibabalik ito sa isang nakabinbing transaction queue para maproseso ito sa susunod na block
- Isusulat ang unang block, tatawagin natin itong **block #1**
- Ang natitirang gas ng TxPool ay nakatakda sa parent block - gas limit ng **block #1**
- Ang transaksyon na ibinalik sa nakabinbing transaction queue ng TxPool ay pinoproseso na ngayon at isinusulat sa block
  - Ang natitirang gas ng TxPool ay **2000** na ngayon
- Ang ikalawang block ay isinusulat
- ...

![TxPool Error scenario #1](/img/edge/txpool-error-1.png)

### Ikatlong scenario {#third-scenario}
- Ang natitirang gas ng TxPool ay itinakda sa gas limit ng huling block, sabihin nating **5000**
- Ang unang transaksyon ay pinoproseso at nagkukunsumo ng **3000** gas ng TxPool
    - Ang natitirang gas ng TxPool ay **2000** na ngayon
- Ang ikalawang transaksyon na may gas field na itinakdsa **6000** ay isinumite
- Dahil **mas mababa** ang gas limit kaysa sa gas ng transaksyon, ang transaksyon na ito ay inalis
    - Hindi ito kailanman magkakasya sa isang block
- Ang unang block ay isinusulat
- ...


![TxPool Error scenario #2](/img/edge/txpool-error-2.png)

> Nangyayari ito sa tuwing makakakuha ka ng sumusunod na error:
> ```shell
> 2021-11-04T15:41:07.665+0100 [ERROR] polygon.consensus.dev: failed to write transaction: transaction's gas limit exceeds block gas limit
> ```

## Block Gas Target {#block-gas-target}

Mayroong mga sitwasyon kung kailan gustong panatilihin ng mga node ang gas limit na mas mababa o nasa isang tiyak na target sa isang tumatakbong chain.

Maaring magtakda ng target gas limit ang node operator sa isang espisipikong node, na sisikaping gamitin ang limitasyong ito sa mga bagong likhang block.
Kung karamihan sa ibang mga node ay mayroon ding katulad (o kaparehong) itinakdang target gas limit, ang block gas limit ay palaging mag-aabang
sa paligid ng block gas target na iyon, na dahan-dahang umuusad patungo rito (sa max na `1/1024 * parent block gas limit`) habang nililikha ang mga bagong block.

### Halimbawang scenario {#example-scenario}

* Itatakda ng node operator ang block gas limit para sa isang single node para maging `5000`
* Ang ibang mga node ay isasaayos para maging `5000` din, bukod sa isang single node na isinaayos para maging `7000`
* Kung ang mga node na may itinakdang gas target na `5000` ay naging mga proposer, titingnan nila kung ang gas limit ay nasa target na
* Kung ang gas limit ay wala sa target (mas malaki ito / mas mababa), itatakda ng proposer node ang block gas target sa pinakamataas (1/1024 * parent gas limit) sa direksyon ng target
   1. Hal: `parentGasLimit = 4500` at `blockGasTarget = 5000`, kukwentahin ng proposer ang gas limit para sa bagong block bilang `4504.39453125` (`4500/1024 + 4500`)
   2. Hal: `parentGasLimit = 5500` at `blockGasTarget = 5000`, kukwentahin ng proposer ang gas limit para sa bagong block bilang `5494.62890625` (`5500 - 5500/1024`)
* Tinitiyak nito na ang block gas limit sa chain ay iingatan sa target, dahil ang single proposer na nagsaayos ng taget sa `7000` ay hindi maaaring mag-advance ng limitasyon, at ang karamihan
ng mga node na itinakda nito sa `5000` ay palaging magtatangka na panatilihin ito roon
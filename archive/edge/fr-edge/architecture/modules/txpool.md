---
id: txpool
title: TxPool
description: Explication du module TxPool de Polygon Edge.
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

## Aperçu {#overview}

Le module TxPool représente l'implémentation du pool de transactions, où les transactions sont ajoutées à partir de différentes parties du système. Le module expose également plusieurs fonctionnalités utiles pour les opérateurs de nœuds, qui sont décrites ci-dessous.

## Les Commandes De L'Opérateur {#operator-commands}

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

Les opérateurs de nœud peuvent interroger ces points de terminaison GRPC, comme décrit dans la section des **[Commandes CLI](/docs/edge/get-started/cli-commands#transaction-pool-commands)**.

## Traitement des Transactions {#processing-transactions}

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
La méthode ***addImpl*** est la compatibilité du module de **TxPool**. C'est l'endroit central où les transactions sont ajoutées dans le système, étant appelées depuis le service GRPC, les points de terminaison JSON RPC, et chaque fois que le client reçoit une transaction via le protocole **gossip**.

Cela prend comme argument le **ctx**, ce qui indique simplement le contexte à partir duquel les transactions sont ajoutées (GRPC, JSON RPC...). <br />L'autre paramètre est la liste des transactions à ajouter au pool.

L'élément clé à noter ici est la vérification du champ **De** dans la transaction:
* Si le champ **De** est **vide**, il est considéré comme une transaction non chiffrée/non signée. Ces types de transactions ne sont qu' acceptées en mode de développement
* Si le champ **De** n'est **pas vide**, cela signifie qu'il s'agit d'une transaction signée, donc la vérification de la signature a lieu

Après toutes ces validations, les transactions sont considérées comme valides.

## Les Structures Des Données {#data-structures}

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

Les champs de l'objet TxPool qui peuvent prêter à confusion sont la **file d'attente** et les listes **triées**.
* **file d'attente** - La grande implémentation d'une liste triée des transactions de compte (par nonce)
* **trié** - La liste triée de toutes les transactions promues en cours (toutes les transactions exécutables). Trié par le prix de gaz

## Gestion des erreurs de la limite de gaz {#gas-limit-error-management}

Chaque fois que vous soumettez une transaction, elle peut être traitée par le TxPool de trois manières.

1. Toutes les transactions en attente peuvent contenir dans un bloc
2. Une ou plusieurs transactions en attente ne peuvent pas contenir dans un bloc
3. Une ou plusieurs transactions en attente ne contiendront jamais dans un bloc

Ici, le mot **_fit_** signifie que la transaction a une limite de gaz inférieure au gaz restant dans le TxPool.

Le premier scénario ne produit aucune erreur.

### Deuxième scénario {#second-scenario}

- Le gaz restant du TxPool est réglé sur la limite de gaz du dernier bloc, disons **5000**
- Une première transaction est traitée et consomme **3000** gaz du TxPool
  - Le gaz restant du TxPool est maintenant de **2000**
- Une deuxième transaction, identique à la première et consommant toutes les deux 3000 unités de gaz, est soumise
- Le gaz restant du TxPool étant **inférieur** au gaz de transaction, elle ne peut pas être traitée dans le bloc actuel
  - Cela est remise dans une file d'attente de transactions en attente afin qu'elle puisse être traitée dans le bloc suivant
- Le premier bloc est écrit, appelons-le **bloc n°1**
- Le gaz restant du TxPool est défini sur le bloc parent - la limite de gaz du **bloc n°1**
- La transaction qui a été remise dans la file d'attente des transactions en attente du TxPool est maintenant traitée et écrite dans le bloc
  - Le gaz restant du TxPool est maintenant de **2000**
- Le deuxième bloc est écrit
- ...

![Le Scénario d'erreur n°1 du TxPool](/img/edge/txpool-error-1.png)

### Troisième scénario {#third-scenario}
- Le gaz restant du TxPool est réglé sur la limite de gaz du dernier bloc, disons **5000**
- Une première transaction est traitée et consomme **3000** gaz du TxPool
    - Le gaz restant du TxPool est maintenant de **2000**
- Une deuxième transaction, avec un champ de gaz défini sur **6000** est soumise
- Étant donné que la limite de gaz du bloc est **inférieure** au gaz de transaction, cette transaction est rejetée
    - Elle ne pourra jamais contenir dans un bloc
- Le premier bloc est écrit
- ...


![Le Scénario d'erreur n°2 du TxPool](/img/edge/txpool-error-2.png)

> Cela se produit chaque fois que vous obtenez l'erreur suivante:
> ```shell
> 2021-11-04T15:41:07.665+0100 [ERROR] polygon.consensus.dev: failed to write transaction: transaction's gas limit exceeds block gas limit
> ```

## Cible de Gaz du Bloc {#block-gas-target}

Il y a des situations où les nœuds veulent maintenir la limite de gaz de bloc en dessous ou à une certaine cible sur une chaîne en cours d'exécution.

L'opérateur du nœud peut définir la limite de gaz cible sur un nœud spécifique, qui tentera d'appliquer cette limite aux blocs nouvellement créés. Si la majorité des autres nœuds ont également une limite de gaz cible similaire (ou identique), alors la limite de gaz du bloc passera toujours autour de cette cible de gaz du bloc, progressant lentement vers elle (au max `1/1024 * parent block gas limit`) à mesure que de nouveaux blocs sont créés.

### Exemple de scénario {#example-scenario}

* L'opérateur de nœud définit la limite de gaz du bloc pour qu'un seul nœud soit `5000`
* D'autres nœuds sont également configurés pour être `5000`, à l'exception d'un seul nœud qui est configuré pour être `7000`
* Lorsque les nœuds qui ont leur cible de gaz définie sur `5000` deviennent des proposants, ils vérifieront si la limite de gaz est déjà à la cible
* Si la limite de gaz n'est pas à la cible (elle est supérieure/inférieure), le nœud proposant définira la cible de gaz du bloc au maximum (1/1024 * limite de gaz parent) dans la direction de la cible
   1. Ex: `parentGasLimit = 4500` et `blockGasTarget = 5000`, le proposant calculera la limite de gaz pour le nouveau bloc comme `4504.39453125` (`4500/1024 + 4500`)
   2. Ex: `parentGasLimit = 5500` et `blockGasTarget = 5000`, le proposant calculera la limite de gaz pour le nouveau bloc comme `5494.62890625` (`5500 - 5500/1024`)
* Cela garantit que la limite de gaz du bloc dans la chaîne sera maintenue à la cible, car le seul proposant dont la cible est configurée sur `7000` ne peut pas avancer la limite énormément, et la majorité
des nœuds dont la cible est définie sur `5000` essaieront toujours de la conserver
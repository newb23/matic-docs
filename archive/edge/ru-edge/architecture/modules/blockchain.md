---
id: blockchain
title: Блокчейн
description: Разъяснение по модулям блокчейна и состояния Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - blockchain
  - state
---

## Обзор {#overview}

Одними из основных модулей Polygon Edge являются модули блокчейна и состояния — **Blockchain** и **State**. <br />

**Blockchain** — это мощный модуль, занимающийся реорганизацией блоков. Он отвечает за всю логику, выполняемую при добавлении нового блока в блокчейн.

**State** — модуль, отражающий *изменения состояния* объекта. Он обеспечивает изменения состояния при добавлении нового блока. <br /> Помимо прочего, модуль **State** отвечает за следующее:
* Выполнение транзакций
* Выполнение EVM
* Изменение попыток Merkle
* Также он выполняет многие другие задачи, которые описаны в соответствующем разделе **State** 🙂

Важно помнить, что эти 2 части тесно связаны и взаимодействуют друг с другом для обеспечения работы клиента. <br /> Например, когда уровень **Blockchain** получает новый блок (без реорганизации), он вызывает **State** для изменения состояния.

**Blockchain** также отвечает за некоторые задачи, относящиеся к консенсусу (например, *проверяет правильность ethHash*, *правильность PoW*). <br /> Его можно кратко описать **как основное логическое ядро, посредством которого добавляются все блоки**.

## *WriteBlocks*

Один из наиболее важных элементов, связанных с уровнем **Blockchain**, — это метод *WriteBlocks*:

````go title="blockchain/blockchain.go"
// WriteBlocks writes a batch of blocks
func (b *Blockchain) WriteBlocks(blocks []*types.Block) error {
	if len(blocks) == 0 {
		return fmt.Errorf("no headers found to insert")
	}

	parent, ok := b.readHeader(blocks[0].ParentHash())
	if !ok {
		return fmt.Errorf("parent of %s (%d) not found: %s", blocks[0].Hash().String(), blocks[0].Number(), blocks[0].ParentHash())
	}

	// validate chain
	for i := 0; i < len(blocks); i++ {
		block := blocks[i]

		if block.Number()-1 != parent.Number {
			return fmt.Errorf("number sequence not correct at %d, %d and %d", i, block.Number(), parent.Number)
		}
		if block.ParentHash() != parent.Hash {
			return fmt.Errorf("parent hash not correct")
		}
		if err := b.consensus.VerifyHeader(parent, block.Header, false, true); err != nil {
			return fmt.Errorf("failed to verify the header: %v", err)
		}

		// verify body data
		if hash := buildroot.CalculateUncleRoot(block.Uncles); hash != block.Header.Sha3Uncles {
			return fmt.Errorf("uncle root hash mismatch: have %s, want %s", hash, block.Header.Sha3Uncles)
		}
		
		if hash := buildroot.CalculateTransactionsRoot(block.Transactions); hash != block.Header.TxRoot {
			return fmt.Errorf("transaction root hash mismatch: have %s, want %s", hash, block.Header.TxRoot)
		}
		parent = block.Header
	}

	// Write chain
	for indx, block := range blocks {
		header := block.Header

		body := block.Body()
		if err := b.db.WriteBody(header.Hash, block.Body()); err != nil {
			return err
		}
		b.bodiesCache.Add(header.Hash, body)

		// Verify uncles. It requires to have the bodies on memory
		if err := b.VerifyUncles(block); err != nil {
			return err
		}
		// Process and validate the block
		if err := b.processBlock(blocks[indx]); err != nil {
			return err
		}

		// Write the header to the chain
		evnt := &Event{}
		if err := b.writeHeaderImpl(evnt, header); err != nil {
			return err
		}
		b.dispatchEvent(evnt)

		// Update the average gas price
		b.UpdateGasPriceAvg(new(big.Int).SetUint64(header.GasUsed))
	}

	return nil
}
````
Метод *WriteBlocks* представляет собой точку входа для записи блоков в блокчейн. Как параметр он принимает диапазон блоков.<br />
Вначале производится валидация блоков. После этого производится их запись в цепочку.

Фактическое *изменение состояния* выполняется посредством вызова метода *processBlock* в составе *WriteBlocks*.

Стоит отметить, что этот метод используют и другие модули (например, **Sealer**), поскольку он является точкой входа для записи блоков в блокчейн.

## Подписка на блокчейн {#blockchain-subscriptions}

Обычно необходимо иметь способ отслеживания изменений, связанных с блокчейном. <br />
Именно здесь вступает в дело модуль подписок **Subscriptions**.

Подписки — это способ подключиться к потокам событий блокчейна и сразу же получить значимые данные.

````go title="blockchain/subscription.go"
type Subscription interface {
    // Returns a Blockchain Event channel
	GetEventCh() chan *Event
	
	// Returns the latest event (blocking)
	GetEvent() *Event
	
	// Closes the subscription
	Close()
}
````

События блокчейна **Blockchain Events** содержат информацию о любых изменениях, вносимых в цепочку. В их число входят реорганизация и добавление новых блоков:

````go title="blockchain/subscription.go"
type Event struct {
	// Old chain removed if there was a reorg
	OldChain []*types.Header

	// New part of the chain (or a fork)
	NewChain []*types.Header

	// Difficulty is the new difficulty created with this event
	Difficulty *big.Int

	// Type is the type of event
	Type EventType

	// Source is the source that generated the blocks for the event
	// right now it can be either the Sealer or the Syncer. TODO
	Source string
}
````

:::tip Повторение пройденного

Помните, как мы рассказывали о команде ***monitor*** в составе [команд CLI](/docs/edge/get-started/cli-commands)?

События блокчейна (Blockchain Events) — это изначальные события, которые происходят в Polygon Edge, а затем отражаются в формате сообщений Protocol Buffers для удобства передачи.

:::
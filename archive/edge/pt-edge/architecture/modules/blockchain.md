---
id: blockchain
title: Blockchain
description: Explicação para módulos de blockchain e estado da Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - blockchain
  - state
---

## Visão geral {#overview}

Um dos principal módulos do Polygon Edge são **blockchain** e **Estado**. <br />

**Blockchain** é a potência que lida com reorganizações de blocos. Isso significa que ele controla toda a lógica seguida quando um bloco for incluído na blockchain.

**Estado** representa o objeto de *transição de estado*. Ele gerencia as mudanças de estado quando um novo bloco é incluído. <br /> Entre outras coisas, o **Estado** controla:
* Transações em execução
* Execução do EVM
* Alteração de tentativas do Merkle
* Muito mais, o que é coberto na seção **Estado** correspondente 🙂

A principal conclusão é que essas duas partes estão muito conectadas e trabalham em conjunto para que o cliente continue a operar. <br /> Por exemplo, quando a camada **Blockchain** recebe um novo bloco (e não ocorre nenhuma reorganização), ele chama o **Estado** para realizar uma transição de estado.

O **Blockchain** também tem de lidar com algumas partes relacionadas ao consenso (ex. *este ethHash está correto?*, *este PoW está correto?*). <br /> Numa frase, é **o principal núcleo de lógica através do qual todos os blocos são incluídos**.

## *WriteBlocks*

Uma das partes mais importantes relacionadas à camada **blockchain** é o método *WriteBlocks*:

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
O método *WriteBlocks* é o ponto de entrada para escrever blocos na blockchain. Como parâmetro, ele aceita uma variedade de blocos.<br />
Em primeiro lugar, os blocos são validados. Depois, eles são gravados na chain.

A *transição de estado* real é realizada chamando o método *processBlock* no *WriteBlocks*.

Vale ressaltar que, como é o ponto de entrada para gravar blocos na blockchain, outros módulos (como o **Sealer**) utilizam este método.

## Assinaturas do blockchain {#blockchain-subscriptions}

Tem de haver uma maneira de monitorar as alterações relacionadas ao blockchain. <br />
É aqui que as **Assinaturas** entram.

As assinaturas são uma maneira de aproveitar os fluxos de eventos blockchain e receber um volume de dados consideráveis instantaneamente.

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

Os **Eventos de Blockchain** contêm informações sobre as alterações realizadas na chain real. Isso inclui reorganizações, bem como novos blocos:

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

:::tip Atualizador
Lembra-se quando mencionamos o comando do ***monitor*** no [Comando CLI](/docs/edge/get-started/cli-commands)?

Os eventos blockchain são eventos originais que ocorrem no Polygon Edge e são mapeados posteriormente para uma mensagem de buffers de protocolo para fácil transferência.

:::
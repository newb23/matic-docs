---
id: blockchain
title: Blockchain
description: Paliwanag para sa mga module ng blockchain at state ng Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - blockchain
  - state
---

## Pangkalahatang-ideya {#overview}

Ang isa sa mga pangunahing module ng Polygon Edge ay ang **Blockchain** at **State**. <br />

Ang **Blockchain** ay ang powerhouse na nangangasiwa sa mga pagbabago ng organisasyon ng block. Ibig sabihin, ito ang nangangasiwa sa lahat ng logic na nangyayari kapag may bagong block na isinasama sa blockchain.

Ang **State** ay kumakatawan sa object ng *state transition*. Pinapangasiwaan nito kung paano nagbabago ang state kapag nadagdag ang isang bagong block. <br /> Kabilang din sa mga pinapangasiwaan ng **State** ang:
* Pagsasagawa ng mga transaksyon
* Pagsasagawa sa EVM
* Pagbabago sa Merkle tries
* Marami pa, na tinatalakay sa kaugnay na seksyong **State** 🙂

Ang key takeaway ay lubos na magkaugnay ang 2 bahaging ito, at nagtutulungan ang mga ito para gumana ang client. <br /> Halimbawa, kapag nakatanggap ang **Blockchain** layer ng bagong block (at walang naganap na pagbabago ng organisasyon), tinatawag nito ang **State** para magsagawa ng state transition.

Nangangasiwa din ang **Blockchain** ng ilang bahaging nauugnay sa consensus (hal. *tama ba ang ethHash na ito?*, *tama ba ang PoW na ito?*). <br /> Sa madaling salita, **ito ang pangunahing core ng logic na ginagamit para maisama ang lahat ng block**.

## *WriteBlocks*

Ang isa sa pinakamahahalagang bahaging nauugnay sa **Blockchain** layer ay ang paraang *WriteBlocks*:

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
Ang paraang *WriteBlocks* ay ang entry point para magsulat ng mga block sa blockchain. Bilang isang parameter, nagpoproseso ito ng iba't ibang block.<br />
Una, bina-validate ang mga block. Pagkatapos nito, isinusulat ang mga ito sa chain.

Isinasagawa ang aktwal na *state transition* sa pamamagitan ng pag-call sa paraang *processBlock* sa *WriteBlocks*.

Mahalaga ring banggitin na dahil ito ay ang entry point para sa pagsusulat ng mga block sa blockchain, ginagamit ng iba pang module (gaya ng **Sealer**) ang paraang ito.

## Mga Subscription sa Blockchain {#blockchain-subscriptions}

Kailangang magkaroon ng paraan para masubaybayan ang mga pagbabagong may kaugnayan sa blockchain. <br />
Dito papasok ang mga **Subscription**.

Ang mga Subscription ay isang paraan para mapakinabangan ang mga stream ng blockchain event at makatanggap kaagad ng makabuluhang data.

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

Ang mga **Blockchain Event** ay naglalaman ng impormasyon tungkol sa anumang pagbabagong ginagawa sa aktwal na chain. Kasama rito ang mga pagbabago sa organisasyon, pati na rin ang mga bagong block:

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

:::tip Refresher

Naaalala mo ba noong binanggit namin ang command na ***monitor*** sa mga [CLI Command](/docs/edge/get-started/cli-commands)?

Ang mga Blockchain Event ay ang mga orihinal na event na nangyayari sa Polygon Edge, at pagkatapos ay iminamapa ang mga ito sa isang format ng mensahe ng mga Buffer ng Protokol para sa madaling paglilipat.

:::
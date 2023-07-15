---
id: storage
title: Storage
description: Paliwanag para sa storage module ng Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - storage
  - LevelDB
---

## Pangkalahatang-ideya {#overview}

Kasalukuyang gumagamit ang Polygon Edge ng **LevelDB** para sa data storage, at ng **in-memory** data store.

Sa buong Polygon Edge, kapag kinakailangan ng mga module na makipag-interaksyon sa pangunahing data store,
hindi kailangang malaman ng mga ito kung aling DB engine o serbisyo ang kinakausap nila.

Ang layer ng DB ay abstraction sa pagitan ng module na tinatawag na **Storage**, na nag-e-export ng mga interface na kinu-query ng mga module.

Ipinapatupad ng bawat layer ng DB, sa ngayon ay ng **LevelDB** lang, ang mga paraan na ito nang magkakahiwalay, na tumitiyak na akma ang mga ito sa implementasyon ng mga ito.

````go title="blockchain/storage/storage.go"
// Storage is a generic blockchain storage
type Storage interface {
	ReadCanonicalHash(n uint64) (types.Hash, bool)
	WriteCanonicalHash(n uint64, hash types.Hash) error

	ReadHeadHash() (types.Hash, bool)
	ReadHeadNumber() (uint64, bool)
	WriteHeadHash(h types.Hash) error
	WriteHeadNumber(uint64) error

	WriteForks(forks []types.Hash) error
	ReadForks() ([]types.Hash, error)

	WriteDiff(hash types.Hash, diff *big.Int) error
	ReadDiff(hash types.Hash) (*big.Int, bool)

	WriteHeader(h *types.Header) error
	ReadHeader(hash types.Hash) (*types.Header, error)

	WriteCanonicalHeader(h *types.Header, diff *big.Int) error

	WriteBody(hash types.Hash, body *types.Body) error
	ReadBody(hash types.Hash) (*types.Body, error)

	WriteSnapshot(hash types.Hash, blob []byte) error
	ReadSnapshot(hash types.Hash) ([]byte, bool)

	WriteReceipts(hash types.Hash, receipts []*types.Receipt) error
	ReadReceipts(hash types.Hash) ([]*types.Receipt, error)

	WriteTxLookup(hash types.Hash, blockHash types.Hash) error
	ReadTxLookup(hash types.Hash) (types.Hash, bool)

	Close() error
}
````

## LevelDB {#leveldb}

### Mga Prefix {#prefixes}

Para maging deterministiko ang pag-query sa LevelDB storage, at maiwasan ang salungatan ng storage ng key, gumagamit ang Polygon Edge ng
mga prefix at sub-prefix kapag nagi-store ng data

````go title="blockchain/storage/keyvalue.go"
// Prefixes for the key-value store
var (
	// DIFFICULTY is the difficulty prefix
	DIFFICULTY = []byte("d")

	// HEADER is the header prefix
	HEADER = []byte("h")

	// HEAD is the chain head prefix
	HEAD = []byte("o")

	// FORK is the entry to store forks
	FORK = []byte("f")

	// CANONICAL is the prefix for the canonical chain numbers
	CANONICAL = []byte("c")

	// BODY is the prefix for bodies
	BODY = []byte("b")

	// RECEIPTS is the prefix for receipts
	RECEIPTS = []byte("r")

	// SNAPSHOTS is the prefix for snapshots
	SNAPSHOTS = []byte("s")

	// TX_LOOKUP_PREFIX is the prefix for transaction lookups
	TX_LOOKUP_PREFIX = []byte("l")
)

// Sub-prefixes
var (
	HASH   = []byte("hash")
	NUMBER = []byte("number")
	EMPTY  = []byte("empty")
)
````

## Mga Plano sa Hinaharap {#future-plans}

Kabilang sa mga plano para sa nalalapit na hinaharap ang pagdadagdag ng ilan sa mga pinaka-popular na solusyon sa DB, tulad ng:
* PostgreSQL
* MySQL


## 📜 Mga Resource {#resources}
* **[LevelDB](https://github.com/google/leveldb)**
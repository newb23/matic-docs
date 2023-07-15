---
id: storage
title: Archiviazione
description: Spiegazione del modulo di archiviazione di Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - storage
  - LevelDB
---

## Panoramica {#overview}

Polygon Edge utilizza attualmente **LevelDB** per l'archiviazione dei dati, oltre a un archivio dati **in-memory**.

In Polygon Edge, quando i moduli devono interagire con l'archivio dati sottostante, non hanno bisogno di sapere con quale motore DB o servizio stanno comunicando.

Il livello DB è astratto da un modulo chiamato **Storage**, il quale esporta interfacce che vengono ricercate dai moduli.

Ogni livello del DB, per ora solo **LevelDB**, implementa questi metodi separatamente, assicurandosi che si adattino alla propria implementazione.

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

### Prefissi {#prefixes}

Per rendere deterministica la ricerca dell'archivio LevelDB e per evitare conflitti tra gli archivi di chiavi, Polygon Edge fa leva su prefissi e sottoprefissi durante l'archiviazione dei dati.

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

## Piani futuri {#future-plans}

I piani per il prossimo futuro prevedono l'aggiunta di alcune delle soluzioni DB più popolari, come:
* PostgreSQL
* MySQL


## 📜 Risorse {#resources}
* **[LevelDB](https://github.com/google/leveldb)**
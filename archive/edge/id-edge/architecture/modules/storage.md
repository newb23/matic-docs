---
id: storage
title: Penyimpanan
description: Penjelasan modul penyimpanan Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - storage
  - LevelDB
---

## Ikhtisar {#overview}

Polygon Edge menggunakan **LevelDB** untuk penyimpanan data, serta penyimpanan data **dalam memori**.

Di seluruh Polygon Edge, ketika modul perlu berinteraksi dengan penyimpanan data yang ada, modul tidak perlu tahu mesin atau layanan DB mana yang diajak bicara.

Lapisan DB dipisahkan di antara modul yang disebut **Penyimpanan** yang mengekspor antarmuka kueri modul itu.

Setiap lapisan DB, saat ini hanya **LevelDB**, menerapkan metode ini secara terpisah dan memastikan kecocokannya dengan penerapan.

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

### Prefiks {#prefixes}

Untuk membuat kueri penyimpanan LevelDB menjadi deterministik dan untuk menghindari bentrokan penyimpanan kunci, Polygon Edge memanfaatkan
prefiks dan subprefiks ketika menyimpan data

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

## Rencana Mendatang {#future-plans}

Rencana dalam waktu dekat termasuk menambahkan beberapa solusi DB paling populer, seperti:
* PostgreSQL
* MySQL


## 📜 Sumber daya {#resources}
* **[LevelDB](https://github.com/google/leveldb)**
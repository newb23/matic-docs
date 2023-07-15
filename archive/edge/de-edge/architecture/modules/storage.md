---
id: storage
title: Speicher
description: Erläuterung für das Speichermodul von Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - storage
  - LevelDB
---

## Übersicht {#overview}

Der Polygon Edge verwendet derzeit **LevelDB** für die Datenspeicherung sowie einen **in-memory** Datenspeicher.

Im gesamten Polygon Edge, wenn Module mit dem zugrundeliegenden Datenspeicher interagieren müssen, müssen sie nicht wissen, mit welcher DB-Engine oder -Dienstleistung, sie kommunizieren.

Die DB-Ebene wird zwischen einem Modul namens **Speicher** abstrahiert, das Schnittstellen exportiert, die Module abfragen.

Jede **DB-Ebene**implementiert diese Methoden separat und stellt sicher, dass sie in ihre Implementierung passen.

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

### Prefixes {#prefixes}

Um den LevelDB-Speicher abzufragen und um das Zusammenstecken von Schlüsselspeichern zu vermeiden, nutzt Polygon Edge Prefixes und Sub-prefixes beim Speichern von Daten

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

## Zukünftige Pläne {#future-plans}

Die Pläne für die nahe Zukunft umfassen das Hinzufügen einiger der beliebtesten DB-Lösungen, wie z.B.:
* PostgreSQL
* MySQL


## 📜 Ressourcen {#resources}
* **[LevelDB](https://github.com/google/leveldb)**
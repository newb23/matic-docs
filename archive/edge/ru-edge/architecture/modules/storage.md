---
id: storage
title: Хранение
description: Объяснение к модулю хранения Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - storage
  - LevelDB
---

## Обзор {#overview}

Для хранения данных Polygon Edge использует **LevelDB**, а также систему хранения данных **в оперативной памяти**.

Когда модулям Polygon Edge требуется взаимодействовать с внутренним хранилищем данных, им не нужно знать, с какой СУБД или каким сервисом они взаимодействуют.

Уровень БД полностью абстрагирован через модуль хранения **Storage**, который экспортирует запрашиваемые модулями интерфейсы.

Этим методы реализованы отдельно для каждого уровня БД (сейчас только **LevelDB**), что обеспечивает их полную совместимость с реализацией.

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

### Префиксы {#prefixes}

Для поддержки детерминистских запросов хранения LevelDB и предотвращения конфликтов ключевых систем хранения Polygon Edge использует
префиксы и субпрефиксы при сохранении данных

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

## Планы на будущее {#future-plans}

В ближайшем будущем планируется добавить поддержку некоторых из самых популярных решений БД, в том числе:
* PostgreSQL
* MySQL


## 📜 Ресурсы {#resources}
* **[LevelDB](https://github.com/google/leveldb)**
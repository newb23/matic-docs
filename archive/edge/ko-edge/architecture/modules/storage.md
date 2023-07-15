---
id: storage
title: 스토리지
description: Polygon 엣지의 스토리지 모듈에 관한 설명.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - storage
  - LevelDB
---

## 개요 {#overview}

현재 Polygon 엣지는 데이터 저장에 **LevelDB**와 **인메모리** 데이터 스토어를 활용합니다.

Polygon 엣지 전반에서 모듈이 기본 데이터 스토어와 상호 작용할 때
모듈은 어떤 DB 엔진 및 서비스와 통신 중인지 알 필요가 없습니다.

DB 레이어는 모듈이 쿼리하는 인터페이스를 내보내는 **스토리지**라는 모듈 사이에서 추상화됩니다.

각 DB 레이어(현재는 **LevelDB**만 있음)는 이러한 메서드를 개별적으로 구현하며 메서드가 구현에 적합한지 확인합니다.

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

### 프리픽스 {#prefixes}

LevelDB 스토리지 쿼리를 확정하고 키 스토리지 충돌을 피하기 위해 Polygon 엣지는
데이터를 저장할 때 프리픽스 및 서브-프리픽스를 활용합니다.

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

## 향후 계획 {#future-plans}

조만간 가장 많이 사용되는 DB 솔루션을 추가할 계획입니다(아래 참조).
* PostgreSQL
* MySQL


## 📜 리소스 {#resources}
* **[LevelDB](https://github.com/google/leveldb)**
---
id: storage
title: ストレージ
description: Polygon Edgeのストレージモジュールについて説明します。
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - storage
  - LevelDB
---

## 概要 {#overview}

Polygon Edgeは現在データストレージ用に**LevelDB**および**インメモリ**データストアを利用しています。

Polygon Edge全体を通して、モジュールが内在するデータストアとやり取りする必要がある場合、やり取りしているDBエンジンまたはサービスについて知る必要はありません。

DBレイヤーは**ストレ**ージと呼ばれるモジュールの間で抽象化され、これはモジュールがクエリするインターフェースをエクスポートします。

各DBレイヤーは、現在は**LevelDB**のみで、これらのメソッドを個別に実行し、その実行に確実に適合するようにします。

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

### プレフィックス {#prefixes}

LevelDBストレージのクエリを確定的にするため、また鍵ストレージのクラッシュを回避するため、Polygon Edgeはデータ保存時にプレフィックスとサブプレフィックスを活用します。

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

## 今後の計画 {#future-plans}

近い将来の計画に、以下のような最も人気のあるDBソリューションの一部を追加することも含まれます：
* PostgreSQL
* MySQL


## 📜リソース {#resources}
* **[LevelDB](https://github.com/google/leveldb)**
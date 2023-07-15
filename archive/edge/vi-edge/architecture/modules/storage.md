---
id: storage
title: Lưu trữ
description: Giải thích dành cho mô-đun lưu trữ của Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - storage
  - LevelDB
---

## Tổng quan {#overview}

Polygon Edge hiện đang sử dụng **LevelDB** để lưu trữ dữ liệu, cũng như lưu trữ dữ liệu **trong bộ nhớ**.

Trong suốt Polygon Edge, khi các mô-đun cần tương tác với kho dữ liệu cơ sở, chúng không cần biết động cơ hoặc dịch vụ DB nào mà chúng đang đề cập.

Lớp DB được trừu tượng hóa giữa một mô-đun được gọi là **Lưu trữ**, xuất các giao diện mà mô-đun truy vấn.

Mỗi lớp DB, hiện chỉ có **LevelDB**, thực hiện các phương thức này một cách riêng biệt, đảm bảo rằng chúng phù hợp với quá trình triển khai.

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

### Tiền tố {#prefixes}

Để thực hiện truy vấn bộ lưu trữ LevelDB có tính xác định và để tránh xung đột bộ nhớ khóa, Polygon Edge tận dụng tiền tố và tiền tố con khi lưu trữ dữ liệu

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

## Kế hoạch tương lai {#future-plans}

Kế hoạch cho tương lai gần bao gồm việc bổ sung một số giải pháp DB phổ biến nhất, chẳng hạn như:
* PostgreSQL
* MySQL


## 📜 Tài nguyên {#resources}
* **[LevelDB](https://github.com/google/leveldb)**
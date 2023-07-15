---
id: storage
title: স্টোরেজ
description: Polygon Edge-এর স্টোরেজ মডিউলের ব্যাখ্যা।
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - storage
  - LevelDB
---

## সংক্ষিপ্ত বিবরণ {#overview}

Polygon Edge বর্তমানে ডেটা স্টোরেজের জন্য **LevelDB** এবং **in-memory** ডেটা স্টোর ব্যবহার করে।

Polygon Edge এর মধ্য দিয়ে, যখন মডিউলগুলোর যখন অন্তর্নিহিত ডেটা স্টোরের সাথে ইন্টারঅ্যাক্ট করার প্রয়োজন হয়, তাদের জানতে হয়না যে তারা কোন DB ইঞ্জিন বা সার্ভিসের সাথে ইন্টারঅ্যাক্ট করছে।

DB লেয়ারটি **স্টোরেজ** নামক একটি মডিউলের মধ্যে অ্যাবস্ট্র্যাক্ট হয়ে থাকে, যা মডিউলের কোয়েরি করা ইন্টারফেসগুলো এক্সপোর্ট করে।

প্রতিটি DB লেয়ার, আপাতত শুধুমাত্র **LevelDB**, এই পদ্ধতিগুলো আলাদাভাবে ইমপ্লিমেন্ট করে, এটা নিশ্চিত করতে যে তারা তাদের ইমপ্লিমেন্টেশনের সাথে ফিট হচ্ছে।

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

LevelDB স্টোরেজের কুয়েরিংকে ডিটার্মিনিস্টিক করতে এবং কী স্টোরেজ ক্ল্যাশিং এড়াতে, Polygon Edge
ডেটা সংরক্ষণের সময়ে Prefix এবং sub-prefix ব্যবহার করে

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

## ভবিষ্যৎ পরিকল্পনা {#future-plans}

নিকটবর্তী ভবিষ্যতে কিছু জনপ্রিয় DB সলিউশন যোগ করার পরিকল্পনা আছে, যেমন:
* PostgreSQL
* MySQL


## 📜 রিসোর্স {#resources}
* **[LevelDB](https://github.com/google/leveldb)**